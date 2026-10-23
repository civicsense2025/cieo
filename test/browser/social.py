"""Real-browser interaction gate for the social, audio and engagement primitives; local source only, no installs or external requests.
Run: CIEO_ESBUILD=/existing/node_modules/esbuild python3 test/browser/social.py
Runs every check twice, with reduced motion on and off; exits 1 when any check fails in either mode.
"""
import base64, functools, http.server, json, os, pathlib, re, shutil, subprocess, sys, tempfile, threading, time
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parents[2]
ONLY = set(filter(None, os.environ.get('CIEO_SOCIAL_ONLY', '').split(',')))
esbuild = os.environ.get('CIEO_ESBUILD', str(root.parent / 'principle/web/node_modules/esbuild'))


def build(out: pathlib.Path):
    subprocess.run(['node', '-e', '''require(process.argv[1]).buildSync({entryPoints:[process.argv[2]],bundle:true,outfile:process.argv[3],jsx:'automatic',nodePaths:[process.argv[4]]})''', esbuild, str(root / 'test/browser/social.tsx'), str(out / 'fixture.js'), str(root / 'node_modules')], check=True)
    # design/primitives.css @imports its partials by relative path, so the tree is copied whole and the browser resolves them.
    shutil.copytree(root / 'design', out / 'design')
    shutil.copytree(root / 'tokens', out / 'tokens')
    (out / 'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="tokens/tokens.css"><link rel="stylesheet" href="design/themes.css"><link rel="stylesheet" href="design/primitives.css"><body><div id="root" style="padding:12px;max-width:640px"></div><script src="fixture.js"></script></body></html>')


def install_audio_fakes(page, scenario='normal', hold_stop=False):
    page.evaluate('''({ scenario, holdStop }) => {
      const state = { scenario, holdStop, contexts: [], sources: [], recorders: [], tracks: [], streams: [], requests: 0, resolvePermissions: [], pendingStops: 0, order: [], reads: 0, errorHandlers: [] };
      class Track {
        constructor() { this.readyState = 'live'; this.stopCalls = 0; this.listeners = new Map(); }
        addEventListener(type, fn) { const set = this.listeners.get(type) || new Set(); set.add(fn); this.listeners.set(type, set); }
        removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
        stop() { this.stopCalls++; this.readyState = 'ended'; }
        end() { if (this.readyState === 'ended') return; this.readyState = 'ended'; for (const fn of this.listeners.get('ended') || []) fn(new Event('ended')); }
      }
      const makeStream = () => {
        const track = new Track();
        const stream = { getTracks: () => [track], getAudioTracks: () => [track], get active() { return track.readyState === 'live'; } };
        state.tracks.push(track); state.streams.push(stream);
        return stream;
      };
      state.stream = makeStream();
      class FakeAudioContext {
        constructor() { this.closeCalls = 0; this.state = 'running'; state.contexts.push(this); }
        createAnalyser() {
          if (scenario === 'meter-analyser-throws') throw new Error('analyser setup failed');
          return { fftSize: 1024, getFloatTimeDomainData(buffer) { state.reads++; buffer.fill(0.05); } };
        }
        createMediaStreamSource() {
          if (scenario === 'meter-source-throws') throw new Error('source setup failed');
          const source = { disconnectCalls: 0, connect() {}, disconnect() { this.disconnectCalls++; } };
          state.sources.push(source);
          return source;
        }
        resume() { if (scenario === 'meter-resume-throws') throw new Error('resume failed'); return Promise.resolve(); }
        close() { this.closeCalls++; this.state = 'closed'; return Promise.resolve(); }
      }
      class FakeMediaRecorder {
        static isTypeSupported() { return true; }
        constructor(_stream, options = {}) { this.id = state.recorders.length + 1; this.state = 'inactive'; this.mimeType = options.mimeType || 'audio/webm'; this.ondataavailable = null; this.onstop = null; this.onerror = null; this.stopCalls = 0; this.pendingStop = false; state.recorders.push(this); state.recorder = this; }
        start() { if (scenario === 'recorder-start-throws') throw new Error('start failed'); this.state = 'recording'; }
        pause() { this.state = 'paused'; }
        resume() { this.state = 'recording'; }
        queueFinalEvents() { if (!this.pendingStop) { this.pendingStop = true; state.pendingStops++; } }
        stop() {
          if (this.state === 'inactive') throw new DOMException('already inactive', 'InvalidStateError');
          this.stopCalls++; this.state = 'inactive'; this.queueFinalEvents();
          if (!holdStop) setTimeout(() => this.finish(), 0);
        }
        emitError() {
          this.state = 'inactive'; this.queueFinalEvents();
          state.errorHandlers.push(typeof this.onerror === 'function');
          this.onerror?.({ error: new DOMException('recording failed', 'UnknownError') });
          if (!holdStop) setTimeout(() => this.finish(), 0);
        }
        finish() {
          if (this.pendingStop) { this.pendingStop = false; state.pendingStops--; }
          const payload = scenario === 'out-of-order' || scenario === 'permission-sequence' ? `take-${this.id}` : 'clip-data';
          state.order.push(`data:${this.id}`); this.ondataavailable?.({ data: new Blob([payload], { type: this.mimeType }) });
          state.order.push(`stop:${this.id}`); this.onstop?.(new Event('stop'));
        }
      }
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: () => {
        const request = state.requests++;
        const sequence = scenario === 'out-of-order' || scenario === 'permission-sequence';
        const stream = sequence && request > 0 ? makeStream() : state.stream;
        if (scenario === 'permission-sequence') return new Promise(resolve => { state.resolvePermissions[request] = () => resolve(stream); });
        return Promise.resolve(stream);
      } });
      Object.defineProperty(window, 'MediaRecorder', { configurable: true, writable: true, value: FakeMediaRecorder });
      Object.defineProperty(window, 'AudioContext', { configurable: true, writable: true, value: FakeAudioContext });
      window.__audioFake = state;
    }''', {'scenario': scenario, 'holdStop': hold_stop})


# Chromium has Web Share on some platforms; the copy fallback is only reachable without it.
INIT = "Object.defineProperty(Navigator.prototype, 'share', { value: undefined, configurable: true });"


def run_mode(browser, port, mode):
    checks, notes, errors = {}, {}, []
    context = browser.new_context(viewport={'width': 900, 'height': 900}, reduced_motion=mode)
    origin = f'http://127.0.0.1:{port}'
    try:
        context.grant_permissions(['clipboard-read', 'clipboard-write', 'microphone'], origin=origin)
    except Exception:
        context.grant_permissions(['clipboard-read', 'clipboard-write'], origin=origin)
    context.add_cookies([{'name': 'cieo_test_session', 'value': 'synthetic-only', 'url': origin}])
    context.add_init_script(INIT)
    page = context.new_page()
    page.set_default_timeout(3000)
    same_origin_preview_assets = []
    def route_request(route):
        url = route.request.url
        if url.startswith(origin + '/logout'):
            same_origin_preview_assets.append({'url': url, 'cookie': route.request.headers.get('cookie', '')})
            route.abort()
        elif url.startswith((origin + '/', 'blob:', 'data:')):
            route.continue_()
        else:
            route.abort()
    page.route('**/*', route_request)
    preview_png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/r7sAAAAASUVORK5CYII=')
    page.route('https://example.com/preview-*.png', lambda route: route.fulfill(status=200, content_type='image/png', body=preview_png))
    page.on('pageerror', lambda e: errors.append('pageerror: ' + str(e)))
    page.on('console', lambda m: errors.append('console.error: ' + m.text) if m.type == 'error' else None)
    page.goto(origin + '/')
    page.wait_for_function('window.ready === true')

    def until(fn, timeout=3.0):
        end = time.time() + timeout
        while time.time() < end:
            try:
                if fn():
                    return True
            except Exception:
                pass
            page.wait_for_timeout(40)
        return False

    def check(name, fn):
        if ONLY and name not in ONLY:
            return
        try:
            checks[name] = bool(fn())
        except Exception as e:  # a timeout or missing element is a failed check, not a crashed gate
            checks[name] = False
            notes[name] = f'{type(e).__name__}: {str(e).splitlines()[0][:160]}'

    ev = lambda id: page.evaluate('(id) => window.ev[id] || []', id)
    active_label = lambda: page.evaluate('() => document.activeElement && (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent)')
    S = lambda id: page.locator('#' + id)

    # CountButton
    def count_button():
        b = S('count-button').get_by_role('button')
        ok = b.get_attribute('aria-label') == 'Like, 164 likes' and b.get_attribute('aria-pressed') == 'false'
        b.click()
        ok = ok and until(lambda: b.get_attribute('aria-label') == 'Like, 165 likes') and b.get_attribute('aria-pressed') == 'true' and S('count-button-host').inner_text() == '165'
        b.click()
        return ok and until(lambda: b.get_attribute('aria-label') == 'Like, 164 likes') and b.get_attribute('aria-pressed') == 'false' and S('count-button-host').inner_text() == '164'
    check('count-button', count_button)

    # ActionBar
    def action_bar():
        bar = S('action-bar')
        buttons = bar.get_by_role('button')
        stops = lambda: bar.locator('button[tabindex="0"]').count()
        ok = buttons.count() == 4 and stops() == 1
        buttons.nth(0).focus()
        page.keyboard.press('ArrowRight')
        ok = ok and until(lambda: (active_label() or '').startswith('Repost')) and stops() == 1
        page.keyboard.press('End')
        ok = ok and until(lambda: active_label() == 'Save') and stops() == 1
        page.keyboard.press('ArrowRight')  # wraps
        ok = ok and until(lambda: (active_label() or '').startswith('Reply'))
        page.keyboard.press('End'); page.keyboard.press('Home')
        return ok and until(lambda: (active_label() or '').startswith('Reply')) and bar.locator('button[tabindex="0"]').evaluate('(el) => el === document.activeElement')
    check('action-bar', action_bar)

    # FollowButton
    def follow():
        b = S('follow').get_by_role('button')
        ok = b.get_attribute('aria-label') == 'Follow Ava' and b.get_attribute('aria-pressed') is None
        b.click()
        ok = ok and until(lambda: b.get_attribute('aria-label') == 'Following Ava')
        page.mouse.move(0, 0)
        page.keyboard.press('Tab'); page.keyboard.press('Shift+Tab')  # leave the button; blur clears the post-press settle
        page.mouse.move(0, 0)
        b.hover()
        ok = ok and until(lambda: b.get_attribute('aria-label') == 'Unfollow Ava') and b.get_attribute('aria-pressed') is None and 'Unfollow' in b.inner_text()
        b.click()
        return ok and until(lambda: b.get_attribute('aria-label') == 'Follow Ava')
    check('follow-button', follow)

    # ReactionSummary
    def reaction_summary():
        box = S('reaction-summary')
        like = box.get_by_role('button', name=re.compile('^Like,'))
        ok = like.get_attribute('aria-label') == 'Like, 2 people' and like.get_attribute('aria-pressed') == 'false'
        like.click()
        ok = ok and until(lambda: like.get_attribute('aria-label') == 'Like, 3 people including you') and like.get_attribute('aria-pressed') == 'true'
        like.click()
        ok = ok and until(lambda: like.get_attribute('aria-label') == 'Like, 2 people') and like.get_attribute('aria-pressed') == 'false'
        add = box.get_by_role('button', name='Add a reaction')
        add.click()
        picker = box.get_by_role('toolbar', name='Add a reaction')
        ok = ok and until(lambda: picker.is_visible())
        picker.get_by_role('button', name='Wow').click()
        ok = ok and until(lambda: box.get_by_role('button', name='Wow, just you').count() == 1) and ev('reaction-summary') == ['add:wow']
        ok = ok and until(lambda: page.evaluate('() => document.activeElement && document.activeElement.classList.contains("cieo-reaction-summary-add")'))
        return ok and until(lambda: picker.count() == 0)
    check('reaction-summary', reaction_summary)

    # ReactionPicker
    def reaction_picker():
        bar = S('reaction-picker').get_by_role('toolbar')
        bar.get_by_role('button', name='Like').focus()
        page.keyboard.press('ArrowRight')
        ok = until(lambda: active_label() == 'Love') and bar.locator('button[tabindex="0"]').count() == 1
        page.keyboard.press('ArrowRight'); page.keyboard.press('ArrowLeft')
        ok = ok and until(lambda: active_label() == 'Love')
        page.keyboard.press('Enter')
        return ok and until(lambda: ev('reaction-picker') == ['love'])
    check('reaction-picker', reaction_picker)

    # Poll
    def poll():
        box = S('poll')
        ok = box.get_by_role('radiogroup').count() == 1 and box.get_by_role('list').count() == 0
        box.get_by_role('radio', name=re.compile('Option C')).click()
        ok = ok and until(lambda: box.get_by_role('list').count() == 1) and box.get_by_role('radiogroup').count() == 0 and ev('poll') == ['c']
        rows = box.locator('.cieo-poll-row')
        spoken = [re.match(r'^(\d+)%', t.strip()).group(1) for t in rows.locator('.cieo-sr-only').all_text_contents() if re.match(r'^\d+%', t.strip())]
        ok = ok and len(spoken) == 3 and sum(map(int, spoken)) == 100
        chosen = box.locator('[data-chosen]')
        ok = ok and chosen.count() == 1 and 'Option C' in chosen.inner_text() and 'Your vote' in chosen.inner_text()
        # The drawn percentages settle to the same numbers the screen reader hears.
        shown = lambda: [re.sub(r'\D', '', t) for t in box.locator('.cieo-poll-percent').all_inner_texts()]
        ok = ok and until(lambda: shown() == spoken, 4.0)
        notes['poll-percents'] = f'{spoken} shown={shown()}'
        return ok
    check('poll', poll)

    # ThumbsFeedback
    def thumbs():
        box = S('thumbs')
        live = box.locator('.cieo-thumbs-entering')
        live.get_by_role('button', name='No, not helpful').click()
        ok = until(lambda: live.locator('.cieo-thumbs-reason').count() == 2)
        live.locator('.cieo-thumbs-reason', has_text='Inaccurate').click()
        live.locator('.cieo-thumbs-reason', has_text='Unclear').click()
        live.locator('textarea').fill('  needs work  ')
        live.get_by_role('button', name='Submit').click()
        ok = ok and until(lambda: 'Thanks for the feedback.' in live.inner_text())
        got = ev('thumbs')
        return ok and got == [{'rate': 'down'}, {'submit': {'value': 'down', 'reasons': ['Inaccurate', 'Unclear'], 'comment': 'needs work'}}]
    check('thumbs-feedback', thumbs)

    # Rating
    def rating():
        box = S('rating')
        group = box.get_by_role('radiogroup', name='Rate this reply')
        two = group.get_by_role('radio', name='2 stars')
        two.focus()
        page.keyboard.press('ArrowRight')
        ok = until(lambda: S('rating-host').inner_text() == '3') and until(lambda: group.get_by_role('radio', name='3 stars').get_attribute('aria-checked') == 'true') and ev('rating') == [3]
        ok = ok and group.get_by_role('radio', name='3 stars').evaluate('(el) => el === document.activeElement')
        ro = S('rating-ro').get_by_role('img', name='4 out of 5')
        return ok and ro.count() == 1 and S('rating-ro').get_by_role('radio').count() == 0
    check('rating', rating)

    # ShareButton
    def share():
        b = S('share').get_by_role('button')
        b.click()
        ok = until(lambda: b.get_attribute('data-copied') is not None) and 'Link copied' in b.inner_text()
        ok = ok and page.evaluate('() => navigator.clipboard.readText()') == 'https://example.com/post/1' and ev('share') == ['copy']
        return ok and 'Link copied' in S('share').locator('[role=status]').inner_text()
    check('share-button', share)

    # NewItemsPill
    def pill():
        box = S('pill')
        ok = box.get_by_role('button').count() == 0
        page.evaluate('() => window.hooks.setPill(3)')
        btn = box.get_by_role('button', name='3 new replies')
        ok = ok and until(lambda: btn.is_visible())
        btn.click()
        ok = ok and ev('pill') == ['show']
        page.evaluate('() => window.hooks.setPill(0)')
        return ok and until(lambda: box.get_by_role('button').count() == 0)
    check('new-items-pill', pill)

    # AudioWaveform
    def waveform():
        s = S('waveform').get_by_role('slider')
        s.focus()
        ok = s.get_attribute('aria-valuenow') == '20'
        page.keyboard.press('ArrowRight')
        ok = ok and until(lambda: ev('waveform') == [25]) and until(lambda: s.get_attribute('aria-valuenow') == '25')
        page.keyboard.press('End')
        ok = ok and until(lambda: ev('waveform')[-1] == 60)
        page.keyboard.press('Home')
        return ok and until(lambda: ev('waveform')[-1] == 0)
    check('audio-waveform', waveform)

    # AudioPlayer
    def players():
        box = S('players')
        a, b = box.get_by_role('button', name=re.compile('^(Play|Pause) Clip A$')), box.get_by_role('button', name=re.compile('^(Play|Pause) Clip B$'))
        a.click()
        ok = until(lambda: a.get_attribute('aria-label') == 'Pause Clip A')
        b.click()
        ok = ok and until(lambda: b.get_attribute('aria-label') == 'Pause Clip B') and until(lambda: a.get_attribute('aria-label') == 'Play Clip A')
        seek = box.get_by_role('slider', name='Seek in Clip B')
        ok = ok and until(lambda: int(seek.get_attribute('aria-valuenow')) >= 1, 5.0)
        b.click()
        return ok and until(lambda: b.get_attribute('aria-label') == 'Play Clip B')
    check('audio-player', players)

    # AudioTranscript
    def transcript():
        box = S('transcript')
        lb = box.get_by_role('listbox')
        ok = box.locator('[tabindex="0"]').count() == 1 and box.locator('[tabindex]').count() == 1
        lb.focus()
        first = lb.get_attribute('aria-activedescendant')
        page.keyboard.press('ArrowRight')
        ok = ok and until(lambda: lb.get_attribute('aria-activedescendant') not in (None, first))
        moved = lb.get_attribute('aria-activedescendant')
        ok = ok and box.locator('#' + moved).inner_text() == 'there'
        page.keyboard.press('Enter')
        ok = ok and ev('transcript') == [1.5]
        page.evaluate('() => window.hooks.setTranscriptTime(4.6)')  # words start at 0, 1.5, 3, 4.5, 6, 7.5
        return ok and until(lambda: box.locator('[data-active]').inner_text() == 'is')
    check('audio-transcript', transcript)

    # VoiceRecorder
    def recorder():
        stages = {}
        box = S('recorder')
        mic = box.get_by_role('button', name='Record a voice reply')
        mic.click()
        stages['started'] = until(lambda: box.locator('[data-phase=recording]').count() == 1, 5.0)
        live = box.locator('.cieo-voice-recorder-live')
        bars = box.locator('.cieo-voice-recorder-waveform-bar')
        bar_count = bars.count()
        stages['bounded-bars'] = bar_count == 24
        page.wait_for_timeout(30)
        entrance = bars.evaluate_all('''els => els.flatMap(el => el.getAnimations()).map(a => ({ name: a.animationName, start: a.startTime, end: a.effect?.getComputedTiming().endTime }))''')
        stages['bounded-entrance'] = len(entrance) == 0 if mode == 'reduce' else 0 < len(entrance) <= bar_count and all((item.get('end') or 0) <= 300 for item in entrance)
        page.evaluate('() => { window.__recorderMotionBar = document.querySelector("#recorder .cieo-voice-recorder-waveform-bar"); }')
        first_start = entrance[0]['start'] if entrance else None
        box.get_by_role('button', name='Pause recording').click()
        stages['pause-during-entrance'] = until(lambda: box.locator('[data-phase=paused]').count() == 1)
        box.get_by_role('button', name='Resume recording').click()
        stages['resume-during-entrance'] = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        same_bar = page.evaluate('() => window.__recorderMotionBar === document.querySelector("#recorder .cieo-voice-recorder-waveform-bar")')
        resumed = bars.evaluate_all('els => els.flatMap(el => el.getAnimations()).map(a => a.startTime)')
        stages['entrance-not-restarted'] = same_bar and (len(resumed) == 0 if mode == 'reduce' else not resumed or first_start in resumed)
        page.wait_for_timeout(280)
        box.get_by_role('button', name='Pause recording').click()
        stages['paused'] = until(lambda: box.locator('[data-phase=paused]').count() == 1)
        page.wait_for_timeout(260)
        visible_bars = lambda: bars.evaluate_all('''els => els.map(el => {
          const style = getComputedStyle(el);
          return { scale: new DOMMatrixReadOnly(style.transform).d, opacity: Number.parseFloat(style.opacity) };
        })''')
        paused_before = visible_bars()
        page.wait_for_timeout(120)
        paused_after = visible_bars()
        stages['pause-retains-bars'] = len(paused_before) == 24 and len(paused_after) == 24 and all(
            0.09 <= before['scale'] <= 1.01 and 0.44 <= before['opacity'] <= 1 and
            abs(before['scale'] - after['scale']) < 0.002 and abs(before['opacity'] - after['opacity']) < 0.002
            for before, after in zip(paused_before, paused_after)
        )
        box.get_by_role('button', name='Resume recording').click()
        stages['resumed'] = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        page.wait_for_timeout(720)
        box.get_by_role('button', name='Stop recording').click()
        if mode == 'reduce':
            stages['stop-exit-start'] = True
            stages['stop-exit-finish'] = until(lambda: live.count() == 0)
        else:
            stages['stop-exit-start'] = until(lambda: live.count() == 1 and live.get_attribute('data-presence') == 'exit' and live.get_attribute('aria-hidden') == 'true')
            stages['stop-exit-finish'] = until(lambda: live.count() == 0)
        stages['delivered'] = until(lambda: len(ev('recorder')) == 1, 5.0)
        clip = ev('recorder')[0] if ev('recorder') else {}
        stages['clip'] = isinstance(clip, dict) and clip.get('size', 0) > 0 and 1.0 <= clip.get('duration', 0) <= 2.5 and clip.get('peaks') == 64
        notes['recorder-clip'] = json.dumps(clip)
        ended = lambda: page.evaluate('() => window.__streams.length > 0 && window.__streams.every(s => s.getTracks().every(t => t.readyState === "ended"))')
        stages['released-after-stop'] = until(ended, 3.0)
        mic.click()
        stages['second-start'] = until(lambda: box.locator('[data-phase=recording]').count() == 1, 5.0)
        page.wait_for_timeout(500)
        page.keyboard.press('Escape')
        stages['cancelled'] = until(lambda: ev('recorder')[-1:] == ['cancel'])
        stages['cancel-idle'] = until(lambda: box.locator('[data-phase=idle]').count() == 1)
        if mode == 'reduce':
            stages['cancel-exit-start'] = True
            stages['cancel-exit-finish'] = until(lambda: live.count() == 0)
        else:
            stages['cancel-exit-start'] = until(lambda: live.count() == 1 and live.get_attribute('data-presence') == 'exit')
            stages['cancel-exit-finish'] = until(lambda: live.count() == 0)
        page.wait_for_timeout(500)
        streams = page.evaluate('() => window.__streams.length')
        stages['callbacks'] = len(ev('recorder')) == 2
        stages['streams'] = streams == 2
        stages['released-after-cancel'] = until(ended, 3.0)
        result = all(stages.values())
        if not result:
            notes['voice-recorder-motion-stages'] = json.dumps({'stages': stages, 'barCount': bar_count, 'entrance': entrance, 'resumed': resumed})
        return result
    check('voice-recorder', recorder)

    # Keep the StrictMode lifecycle check on Chromium's fake media device. The
    # scenario helpers below intentionally replace getUserMedia with their own
    # ledgers, which cannot satisfy this check's window.__streams assertion.
    def strict_recorder():
        before = page.evaluate('() => window.__streams.length')
        page.evaluate('() => window.hooks.mountStrictRecorder()')
        box = S('strict-recorder')
        ok = until(lambda: box.locator('[data-phase=recording]').count() == 1, 5.0)
        page.wait_for_timeout(500)
        box.get_by_role('button', name='Stop recording').click()
        ok = ok and until(lambda: len(ev('strict-recorder')) == 1, 5.0)
        ended = lambda: page.evaluate('(n) => window.__streams.length > n && window.__streams.every(s => s.getTracks().every(t => t.readyState === "ended"))', before)
        ok = ok and until(ended, 3.0)
        page.evaluate('() => window.hooks.unmountRoot("strict-recorder")')
        return ok
    check('voice-recorder-strict-mode', strict_recorder)

    def recorder_motion_off():
        box = S('recorder')
        scope = box
        scope.evaluate("el => el.setAttribute('data-motion', 'off')")
        mic = box.get_by_role('button', name='Record a voice reply')
        mic.click()
        started = until(lambda: box.locator('[data-phase=recording]').count() == 1, 5.0)
        bars = box.locator('.cieo-voice-recorder-waveform-bar')
        ancestor_final = started and bars.count() == 24 and bars.evaluate_all("els => els.every(el => el.getAnimations().length === 0 && getComputedStyle(el).transitionDuration === '0s' && Number.parseFloat(getComputedStyle(el).opacity) >= 0.45)")
        box.get_by_role('button', name='Cancel recording').click()
        ancestor_exit = until(lambda: box.locator('.cieo-voice-recorder-live').count() == 0)
        scope.evaluate("el => el.removeAttribute('data-motion')")

        root = box.locator('.cieo-voice-recorder')
        root.evaluate("el => el.setAttribute('data-motion', 'off')")
        mic.click()
        started_root = until(lambda: box.locator('[data-phase=recording]').count() == 1, 5.0)
        bars = box.locator('.cieo-voice-recorder-waveform-bar')
        root_final = started_root and bars.count() == 24 and bars.evaluate_all("els => els.every(el => el.getAnimations().length === 0 && getComputedStyle(el).transitionDuration === '0s' && Number.parseFloat(getComputedStyle(el).opacity) >= 0.45)")
        box.get_by_role('button', name='Cancel recording').click()
        root_exit = until(lambda: box.locator('.cieo-voice-recorder-live').count() == 0)
        root.evaluate("el => el.removeAttribute('data-motion')")
        return ancestor_final and ancestor_exit and root_final and root_exit
    check('voice-recorder-motion-off', recorder_motion_off)

    def recorder_motion_reduced():
        if mode == 'reduce':
            return True
        for scope_name in ['ancestor', 'root']:
            install_audio_fakes(page, 'out-of-order')
            page.evaluate('() => window.hooks.resetMultiTakeRecorder()')
            box = S('recorder-multitake')
            scope = box if scope_name == 'ancestor' else box.locator('.cieo-voice-recorder')
            scope.evaluate("el => el.setAttribute('data-motion', 'reduced')")
            try:
                box.get_by_role('button', name='Record a voice reply').click()
                started = until(lambda: box.locator('[data-phase=recording]').count() == 1)
                bars = box.locator('.cieo-voice-recorder-waveform-bar')
                motion_stopped = started and bars.count() == 24 and bars.evaluate_all('''els => {
                  const dot = document.querySelector('#recorder-multitake .cieo-voice-recorder-dot');
                  const live = document.querySelector('#recorder-multitake .cieo-voice-recorder-live');
                  const reduced = el => getComputedStyle(el).animationName === 'none' && getComputedStyle(el).transitionDuration === '0s' && el.getAnimations().length === 0;
                  const liveStyle = getComputedStyle(live);
                  return els.every(reduced) && reduced(dot) && liveStyle.transform === 'none' && liveStyle.opacity === '1';
                }''')
                live = box.locator('.cieo-voice-recorder-live')
                cancel = box.get_by_role('button', name='Cancel recording')
                cancel.focus()
                page.keyboard.press('Enter')
                exited_immediately = live.count() == 0
                mic = box.get_by_role('button', name='Record a voice reply')
                mic_focused = mic.evaluate('(el) => el === document.activeElement')
                mic_transition_stopped = mic.evaluate("el => getComputedStyle(el).transitionDuration === '0s'")
                if not (motion_stopped and exited_immediately and mic_focused and mic_transition_stopped):
                    return False
            finally:
                scope.evaluate("el => el.removeAttribute('data-motion')")
        return True
    check('voice-recorder-motion-reduced', recorder_motion_reduced)

    def recorder_motion_full_override():
        if mode != 'reduce':
            return True
        install_audio_fakes(page, 'normal')
        box = S('recorder')
        recorder = box.locator('.cieo-voice-recorder')
        page.evaluate("() => { document.documentElement.setAttribute('data-motion', 'full'); window.ev['recorder'] = []; }")
        stages = {}
        try:
            box.get_by_role('button', name='Record a voice reply').click()
            started = until(lambda: box.locator('[data-phase=recording]').count() == 1, 5.0)
            stages['system-reduced-full-override'] = started and page.evaluate('''() => {
              const root = document.querySelector('#recorder .cieo-voice-recorder');
              const live = root.querySelector('.cieo-voice-recorder-live');
              const dot = root.querySelector('.cieo-voice-recorder-dot');
              const bar = root.querySelector('.cieo-voice-recorder-waveform-bar');
              return matchMedia('(prefers-reduced-motion: reduce)').matches &&
                document.documentElement.dataset.motion === 'full' &&
                getComputedStyle(dot).animationName === 'cieo-voice-recorder-pulse' &&
                getComputedStyle(bar).animationName === 'cieo-voice-recorder-waveform-in' &&
                getComputedStyle(bar).transitionDuration !== '0s' &&
                (getComputedStyle(live).transform !== 'none' || Number.parseFloat(getComputedStyle(live).opacity) < 0.99);
            }''')

            page.wait_for_timeout(260)

            def capture_intermediate():
                return page.evaluate('''() => {
                  const bars = [...document.querySelectorAll('#recorder .cieo-voice-recorder-waveform-bar')];
                  const bar = bars.find(el => {
                    const target = Number.parseFloat(el.style.transform.match(/scaleY\\(([^)]+)\\)/)?.[1] || '0');
                    const shown = new DOMMatrixReadOnly(getComputedStyle(el).transform).d;
                    return getComputedStyle(el).transitionProperty.includes('transform') &&
                      el.getAnimations().some(a => a.transitionProperty === 'transform') && Math.abs(target - shown) > 0.02;
                  });
                  if (!bar) return false;
                  const target = Number.parseFloat(bar.style.transform.match(/scaleY\\(([^)]+)\\)/)?.[1] || '0');
                  window.__recorderFullMotionBar = bar;
                  window.__recorderFullMotionFirst = { target, shown: new DOMMatrixReadOnly(getComputedStyle(bar).transform).d };
                  return true;
                }''')

            stages['waveform-retargets-under-full-override'] = until(capture_intermediate, 2.0)
            page.wait_for_timeout(30)
            follow = page.evaluate('''() => {
              const bar = window.__recorderFullMotionBar;
              const first = window.__recorderFullMotionFirst;
              if (!bar || !first) return null;
              const target = Number.parseFloat(bar.style.transform.match(/scaleY\\(([^)]+)\\)/)?.[1] || '0');
              const shown = new DOMMatrixReadOnly(getComputedStyle(bar).transform).d;
              return { sameTarget: target === first.target, moved: shown !== first.shown, closer: Math.abs(target - shown) < Math.abs(first.target - first.shown) };
            }''')
            stages['waveform-interpolates-under-full-override'] = follow == {'sameTarget': True, 'moved': True, 'closer': True}

            def motion_disabled():
                return recorder.evaluate('''root => {
                  const live = root.querySelector('.cieo-voice-recorder-live');
                  const dot = root.querySelector('.cieo-voice-recorder-dot');
                  const bar = root.querySelector('.cieo-voice-recorder-waveform-bar');
                  return getComputedStyle(dot).animationName === 'none' &&
                    getComputedStyle(bar).animationName === 'none' && getComputedStyle(bar).transitionDuration === '0s' &&
                    getComputedStyle(live).transform === 'none' && getComputedStyle(live).opacity === '1';
                }''')

            def motion_enabled():
                return recorder.evaluate('''root => {
                  const dot = root.querySelector('.cieo-voice-recorder-dot');
                  const bar = root.querySelector('.cieo-voice-recorder-waveform-bar');
                  return getComputedStyle(dot).animationName === 'cieo-voice-recorder-pulse' &&
                    getComputedStyle(bar).animationName === 'cieo-voice-recorder-waveform-in' &&
                    getComputedStyle(bar).transitionDuration !== '0s';
                }''')

            overrides = [
                ('ancestor-off-wins', box, 'data-motion', 'off'),
                ('ancestor-reduced-wins', box, 'data-motion', 'reduced'),
                ('root-off-wins', recorder, 'data-motion', 'off'),
                ('root-reduced-wins', recorder, 'data-motion', 'reduced'),
                ('root-data-reduced-motion-wins', recorder, 'data-reduced-motion', 'true'),
            ]
            for name, scope, attribute, value in overrides:
                scope.evaluate('(el, attr) => el.setAttribute(attr[0], attr[1])', [attribute, value])
                page.wait_for_timeout(30)
                stages[name] = motion_disabled()
                if name != 'root-data-reduced-motion-wins':
                    scope.evaluate('(el, attr) => el.removeAttribute(attr)', attribute)
                    page.wait_for_timeout(30)
                    stages[name + '-restores-full'] = motion_enabled()

            box.get_by_role('button', name='Cancel recording').click()
            live = box.locator('.cieo-voice-recorder-live')
            stages['local-data-reduced-motion-exits-immediately'] = until(lambda: live.count() == 0, 0.5)
            stages['cancelled'] = until(lambda: ev('recorder')[-1:] == ['cancel'])
            recorder.evaluate("el => el.removeAttribute('data-reduced-motion')")
            page.wait_for_timeout(30)
            stages['mic-transition-under-full-override'] = recorder.locator('.cieo-voice-recorder-mic').evaluate("el => getComputedStyle(el).transitionDuration !== '0s'")

            install_audio_fakes(page, 'normal')
            mic = box.get_by_role('button', name='Record a voice reply')
            mic.click()
            stages['dynamic-reduced-started'] = until(lambda: box.locator('[data-phase=recording]').count() == 1)
            live = box.locator('.cieo-voice-recorder-live')
            box.get_by_role('button', name='Cancel recording').click()
            stages['dynamic-reduced-exit-started'] = until(
                lambda: live.count() == 1 and live.get_attribute('data-presence') == 'exit',
                0.1,
            )
            recorder.evaluate("el => el.setAttribute('data-reduced-motion', 'true')")
            stages['dynamic-reduced-settles-exit'] = until(lambda: live.count() == 0, 0.1)
            recorder.evaluate("el => el.removeAttribute('data-reduced-motion')")
        finally:
            cancel = box.get_by_role('button', name='Cancel recording')
            if cancel.count():
                cancel.click(timeout=500)
            page.evaluate("() => document.documentElement.removeAttribute('data-motion')")
            box.evaluate("el => el.removeAttribute('data-motion')")
            recorder.evaluate("el => { el.removeAttribute('data-motion'); el.removeAttribute('data-reduced-motion'); }")

        result = all(stages.values())
        if not result:
            notes['voice-recorder-motion-full-override'] = json.dumps(stages)
        return result
    check('voice-recorder-motion-full-override', recorder_motion_full_override)

    def recorder_panel_control_focus_return():
        install_audio_fakes(page, 'out-of-order')
        page.evaluate("() => { window.ev['recorder-multitake'] = []; window.hooks.resetMultiTakeRecorder(); }")
        box = S('recorder-multitake')
        mic = box.get_by_role('button', name='Record a voice reply')
        mic.click()
        started_for_stop = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        stop = box.get_by_role('button', name='Stop recording')
        stop.focus()
        page.keyboard.press('Enter')
        stop_result = page.evaluate('''() => ({
          phase: document.querySelector('#recorder-multitake [data-phase]')?.getAttribute('data-phase'),
          focused: document.activeElement === document.querySelector('#recorder-multitake .cieo-voice-recorder-mic')
        })''')
        delivered = until(lambda: len(ev('recorder-multitake')) == 1)

        mic.click()
        started_for_cancel = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        cancel = box.get_by_role('button', name='Cancel recording')
        cancel.focus()
        page.keyboard.press('Enter')
        cancel_result = page.evaluate('''() => ({
          phase: document.querySelector('#recorder-multitake [data-phase]')?.getAttribute('data-phase'),
          focused: document.activeElement === document.querySelector('#recorder-multitake .cieo-voice-recorder-mic'),
          callbacks: window.ev['recorder-multitake']
        })''')

        mic.click()
        started_for_escape = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        escape_origin = box.get_by_role('button', name='Cancel recording')
        escape_origin.focus()
        page.keyboard.press('Escape')
        escape_result = page.evaluate('''() => ({
          phase: document.querySelector('#recorder-multitake [data-phase]')?.getAttribute('data-phase'),
          focused: document.activeElement === document.querySelector('#recorder-multitake .cieo-voice-recorder-mic'),
          callbacks: window.ev['recorder-multitake']
        })''')

        mic.click()
        started_for_escape_outside = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        page.locator('body').evaluate("el => { el.setAttribute('tabindex', '-1'); el.focus(); }")
        body_focused_before_escape = page.evaluate('() => document.activeElement === document.body')
        page.keyboard.press('Escape')
        outside_escape_result = page.evaluate('''() => ({
          phase: document.querySelector('#recorder-multitake [data-phase]')?.getAttribute('data-phase'),
          focused: document.activeElement === document.body,
          callbacks: window.ev['recorder-multitake']
        })''')

        mic.click()
        started_for_failure = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        body_focused = page.evaluate('() => document.activeElement === document.body')
        page.evaluate('() => window.__audioFake.tracks[4].end()')
        failed = until(lambda: box.locator('[data-phase=error]').count() == 1)
        focus_not_stolen = page.evaluate('() => document.activeElement === document.body')
        page.locator('body').evaluate("el => el.removeAttribute('tabindex')")
        stages = {
            'started-for-stop': started_for_stop,
            'stop-result': stop_result,
            'delivered': delivered,
            'started-for-cancel': started_for_cancel,
            'cancel-result': cancel_result,
            'started-for-escape': started_for_escape,
            'escape-result': escape_result,
            'started-for-escape-outside': started_for_escape_outside,
            'body-focused-before-escape': body_focused_before_escape,
            'outside-escape-result': outside_escape_result,
            'started-for-failure': started_for_failure,
            'body-focused-before-failure': body_focused,
            'failed': failed,
            'focus-not-stolen': focus_not_stolen,
        }
        result = (
            started_for_stop and stop_result == {'phase': 'done', 'focused': True} and delivered and
            started_for_cancel and cancel_result == {'phase': 'idle', 'focused': True, 'callbacks': [
                {'data': 'take-1', 'size': 6}, 'cancel'
            ]} and started_for_escape and escape_result == {'phase': 'idle', 'focused': True, 'callbacks': [
                {'data': 'take-1', 'size': 6}, 'cancel', 'cancel'
            ]} and started_for_escape_outside and body_focused_before_escape and outside_escape_result == {
                'phase': 'idle', 'focused': True, 'callbacks': [
                    {'data': 'take-1', 'size': 6}, 'cancel', 'cancel', 'cancel'
                ]
            } and started_for_failure and body_focused and failed and focus_not_stolen
        )
        if not result:
            notes['voice-recorder-panel-control-focus-return'] = json.dumps(stages)
        return result
    check('voice-recorder-panel-control-focus-return', recorder_panel_control_focus_return)

    def strict_player():
        page.evaluate('() => window.hooks.mountStrictPlayerLifecycle()')
        box = S('strict-player')
        audio = box.locator('audio')
        source_ready = until(lambda: audio.count() == 1 and audio.get_attribute('src') is not None and audio.evaluate('(el) => el.readyState >= 1'), 5.0)
        source_snapshot = audio.evaluate('(el) => ({ attribute: el.getAttribute("src"), currentSrc: el.currentSrc, readyState: el.readyState, paused: el.paused })') if audio.count() == 1 else None
        if source_ready:
            box.get_by_role('button', name='Play Strict lifecycle clip').click()
        playing = source_ready and until(lambda: box.locator('[data-state=playing]').count() == 1, 3.0)
        page.evaluate('() => { window.__strictPlayerAudio = document.querySelector("#strict-player audio"); window.hooks.unmountRoot("strict-player"); }')
        released = page.evaluate('''() => window.__strictPlayerAudio !== null && window.__strictPlayerAudio.paused && !window.__strictPlayerAudio.hasAttribute('src') && window.__strictPlayerAudio.readyState === 0''')
        result = source_ready and playing and released
        if not result:
            notes['audio-player-strict-mode-source-preserved'] = json.dumps({'sourceReady': source_ready, 'source': source_snapshot, 'playing': playing, 'released': released})
        return result
    check('audio-player-strict-mode-source-preserved', strict_player)

    # AudioLevelMeter with a stream that has no audio track: static meter, context closed, no throw
    def empty_meter():
        before = page.evaluate('() => window.__ctxs.length')
        page.evaluate('() => window.hooks.mountEmptyMeter()')
        meter = S('empty-meter').get_by_role('img', name='Empty stream meter')
        ok = until(lambda: meter.count() == 1)
        closed = lambda: page.evaluate('(n) => window.__ctxs.slice(n).every(c => c.state === "closed")', before)
        ok = ok and until(closed, 3.0)
        page.evaluate('() => window.hooks.unmountRoot("empty-meter")')
        return ok
    check('audio-level-meter-empty-stream', empty_meter)

    # AudioPlayer: two players in separate React roots still pause each other
    def root_players():
        page.evaluate('() => window.hooks.mountRootPlayers()')
        a = S('root-player-a').get_by_role('button', name=re.compile('^(Play|Pause) Root clip A$'))
        b = S('root-player-b').get_by_role('button', name=re.compile('^(Play|Pause) Root clip B$'))
        a.click()
        ok = until(lambda: a.get_attribute('aria-label') == 'Pause Root clip A')
        b.click()
        ok = ok and until(lambda: b.get_attribute('aria-label') == 'Pause Root clip B') and until(lambda: a.get_attribute('aria-label') == 'Play Root clip A')
        b.click()
        ok = ok and until(lambda: b.get_attribute('aria-label') == 'Play Root clip B')
        page.evaluate('() => { window.hooks.unmountRoot("root-player-a"); window.hooks.unmountRoot("root-player-b") }')
        return ok
    check('audio-player-separate-roots', root_players)

    # CommentThread + Comment
    def thread():
        box = S('thread')
        depth1 = lambda: box.locator('article[data-depth="1"]').count()
        more = box.get_by_role('button', name='View 3 more replies')
        ok = depth1() == 2 and more.count() == 1
        # The rail under a parent's avatar, and the elbow each reply draws from it, must have real size.
        height = lambda loc: loc.evaluate('(el) => el.getBoundingClientRect().height')
        line = box.locator('article[data-depth="0"] > .cieo-comment-rail > .cieo-comment-line')
        ok = ok and line.count() == 1 and height(line) > 0
        nested = box.locator('article[data-depth="1"]', has_text='Reply 1').locator('> .cieo-comment-rail > .cieo-comment-line')
        ok = ok and nested.count() == 1 and height(nested) > 0
        elbow = box.locator('article[data-depth="1"] > .cieo-comment-elbow')
        ok = ok and elbow.count() == 2 and height(elbow.first) > 0
        more.click()
        return ok and until(lambda: depth1() == 5) and box.get_by_role('button', name=re.compile('more repl')).count() == 0
    check('comment-thread', thread)

    # CommentComposer
    def composer():
        box = S('composer')
        ta, post = box.locator('textarea'), box.get_by_role('button', name='Post')
        ok = post.is_disabled()
        ta.fill('  hello  ')
        ok = ok and until(lambda: not post.is_disabled())
        ta.press('Control+Enter')
        ok = ok and until(lambda: ev('composer') == [{'submit': 'hello'}]) and until(lambda: ta.input_value() == '')
        ta.fill('mac style')
        ta.press('Meta+Enter')
        ok = ok and until(lambda: ev('composer')[-1] == {'submit': 'mac style'})
        n = len(ev('composer'))
        ta.fill('x' * 21)
        ok = ok and until(lambda: post.is_disabled())
        ta.press('Control+Enter')
        page.wait_for_timeout(100)
        ok = ok and len(ev('composer')) == n
        ta.fill('')
        # recorder slot replaces the text row and takes focus; removing it hands focus back to the text box
        box.locator('#composer-toggle-recorder').click()
        ok = ok and until(lambda: page.evaluate('() => document.activeElement && document.activeElement.id') == 'composer-recorder-inner', 3.0)
        ok = ok and until(lambda: box.locator('textarea:visible').count() == 0 or box.locator('[data-pane=text][data-phase=leave]').count() == 1)
        page.locator('#composer-recorder-inner').click()
        page.evaluate('() => document.getElementById("composer-toggle-recorder").click()')
        ok = ok and until(lambda: page.evaluate('() => document.activeElement && document.activeElement.tagName') == 'TEXTAREA', 3.0)
        ok = ok and until(lambda: box.locator('[data-pane=recorder]').count() == 0)
        # reply preview cancel
        box.get_by_role('button', name='Cancel reply to Ben').click()
        return ok and until(lambda: ev('composer')[-1] == 'cancel-reply') and until(lambda: box.get_by_role('button', name='Cancel reply to Ben').count() == 0)
    check('comment-composer', composer)

    # RichText
    def rich():
        box = S('rich')
        links = box.locator('a')
        hrefs = links.evaluate_all('(els) => els.map((a) => a.href)')
        ok = all(re.match(r'^https?://', h) for h in hrefs) and len(hrefs) == 2 and 'https://example.com/a' in hrefs
        text = box.inner_text()
        ok = ok and 'javascript:alert(1)' in text and 'ftp://files.example.com/x' in text and 'data:text/html,hi' in text
        return ok and box.locator('a[href^="javascript"], a[href^="ftp"], a[href^="data"]').count() == 0 and len(hrefs) == 2
    check('rich-text', rich)

    # ConversationList
    def conversations():
        box = S('conversations')
        row = lambda id: box.locator(f'[data-conversation-id="{id}"]')
        cur = lambda: page.evaluate('() => document.activeElement && document.activeElement.getAttribute("data-conversation-id")')
        ok = box.locator('[data-conversation-row][tabindex="0"]').count() == 1
        row('c1').focus()
        page.keyboard.press('ArrowDown'); ok = ok and until(lambda: cur() == 'c2')
        page.keyboard.press('ArrowUp'); ok = ok and until(lambda: cur() == 'c1')
        page.keyboard.press('ArrowUp'); ok = ok and cur() == 'c1'
        page.keyboard.press('End'); ok = ok and until(lambda: cur() == 'c4')
        page.keyboard.press('Home'); ok = ok and until(lambda: cur() == 'c1')
        page.keyboard.press('ArrowDown'); page.keyboard.press('ArrowDown')
        ok = ok and until(lambda: cur() == 'c3')
        page.evaluate('() => window.hooks.moveToTop("c3")')
        ok = ok and until(lambda: box.locator('[data-conversation-row]').first.get_attribute('data-conversation-id') == 'c3')
        ok = ok and until(lambda: cur() == 'c3') and row('c3').get_attribute('tabindex') == '0'
        page.keyboard.press('ArrowDown')
        return ok and until(lambda: cur() == 'c1')
    check('conversation-list', conversations)

    # TypingIndicator
    def typing():
        st = S('typing').locator('[role=status]')
        ok = (st.text_content() or '').strip() == ''
        page.evaluate('() => window.hooks.setTyping(["Ava"])')
        ok = ok and until(lambda: (st.text_content() or '').strip() == 'Ava is typing')
        page.evaluate('() => window.hooks.setTyping(["Ava","Ben"])')
        return ok and until(lambda: (st.text_content() or '').strip() == 'Ava and Ben are typing')
    check('typing-indicator', typing)

    # AnnotationLayer + FeedbackPopover
    def annotation():
        box = S('annotation')
        layer = box.get_by_role('group', name='Landing page')
        toggle = S('annotation-toggle')
        overlay = box.get_by_role('button', name='Place a comment on Landing page')
        pop_focus = lambda: page.evaluate('() => document.activeElement && document.activeElement.tagName === "TEXTAREA" && !!document.activeElement.closest(".cieo-feedback-popover")')
        on_overlay = lambda: page.evaluate('() => document.activeElement && (document.activeElement.getAttribute("aria-label") || "").startsWith("Place a comment")')
        ok = overlay.count() == 0
        toggle.click()
        ok = ok and until(lambda: overlay.count() == 1)
        layer.scroll_into_view_if_needed()
        r = layer.bounding_box()
        page.mouse.click(r['x'] + 0.25 * r['width'], r['y'] + 0.6 * r['height'])
        ok = ok and until(lambda: len(ev('annotation')) >= 1) and 'underlying-click' not in ev('annotation')
        p = ev('annotation')[0]['place']
        ok = ok and abs(p['x'] - 0.25) <= 0.02 and abs(p['y'] - 0.6) <= 0.02
        ok = ok and until(pop_focus, 3.0)
        page.keyboard.press('Escape')
        ok = ok and until(lambda: box.locator('[role=dialog]').count() == 0) and until(on_overlay, 3.0) and layer.get_attribute('data-active') == 'true'
        page.keyboard.press('Escape')
        ok = ok and until(lambda: layer.get_attribute('data-active') is None)
        # keyboard placement
        toggle.click()
        ok = ok and until(lambda: overlay.count() == 1)
        overlay.focus()
        page.keyboard.press('ArrowRight'); page.keyboard.press('ArrowDown'); page.keyboard.press('ArrowDown')
        page.keyboard.press('Enter')
        ok = ok and until(lambda: any(isinstance(e, dict) and 'place' in e for e in ev('annotation')[1:]))
        k = [e for e in ev('annotation')[1:] if isinstance(e, dict) and 'place' in e][0]['place']
        ok = ok and abs(k['x'] - 0.52) <= 0.001 and abs(k['y'] - 0.54) <= 0.001
        ok = ok and until(pop_focus, 3.0)
        page.keyboard.press('Escape')
        return ok and until(lambda: box.locator('[role=dialog]').count() == 0) and until(on_overlay, 3.0)
    check('annotation-layer', annotation)

    # LinkPreview
    def links():
        safe, unsafe = S('link-safe'), S('link-unsafe')
        ok = safe.locator('a').count() == 1 and safe.locator('a').get_attribute('href') == 'https://example.com/article'
        return ok and unsafe.locator('a').count() == 0 and 'Unsafe card' in unsafe.inner_text()
    check('link-preview', links)

    def link_preview_asset_boundary():
        box = S('preview-asset-boundary')
        box.scroll_into_view_if_needed()
        page.wait_for_timeout(200)
        result = box.locator('img').count() == 0 and box.locator('a').get_attribute('href') == 'https://example.com/article' and same_origin_preview_assets == []
        if not result:
            notes['link-preview-rejects-relative-assets'] = json.dumps({'images': box.locator('img').count(), 'requests': same_origin_preview_assets})
        return result
    check('link-preview-rejects-relative-assets', link_preview_asset_boundary)

    def rating_space():
        box = S('rating')
        group = box.get_by_role('radiogroup', name='Rate this reply')
        fourth = group.get_by_role('radio', name='4 stars')
        fourth.focus()
        page.evaluate('() => window.scrollTo(0, 0)')
        before = page.evaluate('() => window.scrollY')
        page.keyboard.press('Space')
        selected = until(lambda: S('rating-host').inner_text() == '4' and ev('rating')[-1:] == [4])
        focused = fourth.evaluate('(el) => el === document.activeElement')
        return selected and focused and page.evaluate('() => window.scrollY') == before
    check('rating-space-selection', rating_space)

    def preview_image_reset():
        box = S('preview-image')
        image = box.locator('img')
        present = until(lambda: image.count() == 1)
        image.dispatch_event('error')
        failed = until(lambda: image.count() == 0)
        page.evaluate("() => window.hooks.setPreviewImageSource('https://example.com/preview-good.png')")
        restored = until(lambda: box.locator('img').count() == 1 and box.locator('img').get_attribute('src') == 'https://example.com/preview-good.png', 4.0)
        return present and failed and restored
    check('link-preview-image-source-reset', preview_image_reset)

    def audio_player_rates():
        box = S('player-lifecycle')
        audio = box.locator('audio')
        page.evaluate("() => window.hooks.setPlayerRates([NaN, Infinity, 0, -1, 1.5, 2])")
        filtered = until(lambda: box.get_by_role('button', name='Playback speed, 1.5 times').count() == 1 and abs(audio.evaluate('(el) => el.playbackRate') - 1.5) < 0.01)
        page.evaluate('() => window.hooks.setPlayerRates([2])')
        one_rate = until(lambda: box.get_by_role('button', name='Playback speed, 2 times').count() == 1 and abs(audio.evaluate('(el) => el.playbackRate') - 2) < 0.01)
        page.evaluate('() => window.hooks.setPlayerRates([NaN, Infinity, 0, -1])')
        fallback = until(lambda: box.get_by_role('button', name='Playback speed, 1 time').count() == 1 and abs(audio.evaluate('(el) => el.playbackRate') - 1) < 0.01)
        return filtered and one_rate and fallback
    check('audio-player-dynamic-rates', audio_player_rates)

    def audio_player_empty_rates():
        box = S('player-lifecycle')
        audio = box.locator('audio')
        page.evaluate('() => window.hooks.setPlayerRates([])')
        disabled = until(lambda: box.get_by_role('button', name='Playback speed, 1 time').count() == 1 and box.get_by_role('button', name='Playback speed, 1 time').is_disabled())
        rate = audio.evaluate('(el) => el.playbackRate')
        return disabled and abs(rate - 1) < 0.01
    check('audio-player-empty-rates-disabled', audio_player_empty_rates)

    def playback_rate_empty_list():
        box = S('empty-rates-button')
        button = box.get_by_role('button', name='Playback speed, 1 time')
        disabled = button.is_disabled()
        handler_wired = button.evaluate('''el => {
          const key = Object.keys(el).find(name => name.startsWith('__reactProps$'));
          return typeof (key && el[key].onClick) === 'function';
        }''')
        button.evaluate('(el) => el.click()')
        return disabled and not handler_wired and ev('empty-rate-button') == []
    check('playback-rate-button-empty-list-no-handler', playback_rate_empty_list)

    def audio_player_rejected_rate():
        box = S('player-lifecycle')
        audio = box.locator('audio')
        page.evaluate('() => window.hooks.setPlayerRates([1, 1.5, 2])')
        normal = until(lambda: box.get_by_role('button', name='Playback speed, 1 time').count() == 1 and abs(audio.evaluate('(el) => el.playbackRate') - 1) < 0.01)
        box.get_by_role('button', name='Playback speed, 1 time').click()
        applied = until(lambda: box.get_by_role('button', name='Playback speed, 1.5 times').count() == 1 and abs(audio.evaluate('(el) => el.playbackRate') - 1.5) < 0.01)
        audio.evaluate('''el => {
          let owner = el;
          let descriptor;
          while (owner && !descriptor) {
            descriptor = Object.getOwnPropertyDescriptor(owner, 'playbackRate');
            owner = Object.getPrototypeOf(owner);
          }
          Object.defineProperty(el, 'playbackRate', {
            configurable: true,
            get() { return descriptor.get.call(this); },
            set(value) { if (value === 2) throw new TypeError('rate rejected'); descriptor.set.call(this, value); },
          });
        }''')
        box.get_by_role('button', name='Playback speed, 1.5 times').click()
        retained = until(lambda: box.get_by_role('button', name='Playback speed, 1.5 times').count() == 1 and abs(audio.evaluate('(el) => el.playbackRate') - 1.5) < 0.01)
        return normal and applied and retained
    check('audio-player-rejected-rate-retains-applied', audio_player_rejected_rate)

    def audio_player_source_reset():
        box = S('player-lifecycle')
        audio = box.locator('audio')
        page.evaluate("() => { window.ev['player-lifecycle'] = []; window.hooks.setPlayerRates([1.5]); }")
        rate_ready = until(lambda: box.get_by_role('button', name='Playback speed, 1.5 times').count() == 1 and audio.evaluate('(el) => el.readyState >= 1'))
        play = box.get_by_role('button', name='Play Lifecycle clip')
        play.click()
        playing = until(lambda: box.locator('[data-state=playing]').count() == 1)
        old_src = audio.get_attribute('src')
        page.evaluate('() => { window.__oldPlayerAudio = document.querySelector("#player-lifecycle audio"); window.ev["player-lifecycle"] = []; window.hooks.setPlayerSource("loading"); }')
        reset = until(lambda: box.locator('[data-state=loading]').count() == 1 and audio.get_attribute('src') != old_src and audio.evaluate('(el) => el.readyState === 0'), 5.0)
        new_rate = abs(audio.evaluate('(el) => el.playbackRate') - 1.5) < 0.01
        page.evaluate('''() => {
          const old = window.__oldPlayerAudio;
          for (const type of ['play', 'pause', 'loadedmetadata', 'timeupdate', 'ended', 'error']) old.dispatchEvent(new Event(type));
        }''')
        page.wait_for_timeout(80)
        stale_ignored = ev('player-lifecycle') == [] and box.locator('[data-state=loading]').count() == 1
        old_released = until(lambda: page.evaluate('''() => window.__oldPlayerAudio.paused && !window.__oldPlayerAudio.hasAttribute('src') && window.__oldPlayerAudio.readyState === 0'''))
        return rate_ready and playing and reset and new_rate and stale_ignored and old_released
    check('audio-player-source-reset', audio_player_source_reset)

    def audio_player_stale_events_a_b_a():
        box = S('player-lifecycle')
        page.evaluate("() => { window.ev['player-lifecycle'] = []; window.hooks.setPlayerSource('A'); }")
        audio = box.locator('audio')
        player = box.locator('.cieo-audio-player')
        initial_a = until(lambda: audio.count() == 1 and audio.get_attribute('src') is not None and audio.evaluate('(el) => el.readyState >= 1'), 5.0)
        if not initial_a:
            return False
        old_src = audio.get_attribute('src')
        page.evaluate('''() => {
          const old = document.querySelector('#player-lifecycle audio');
          const propsKey = Object.keys(old).find(key => key.startsWith('__reactProps$'));
          const props = propsKey ? old[propsKey] : null;
          window.__stalePlayerAudioA = old;
          window.__stalePlayerHandlersA = { onPlay: props?.onPlay, onPause: props?.onPause, onEnded: props?.onEnded };
          window.hooks.setPlayerSource('B');
        }''')
        switched_b = until(lambda: box.locator('audio').get_attribute('src') not in (None, old_src), 5.0)
        page.evaluate("() => window.hooks.setPlayerSource('A')")
        returned_a = until(lambda: box.locator('audio').get_attribute('src') == old_src and box.locator('audio').evaluate('(el) => el.readyState >= 1'), 5.0)
        current_is_new = page.evaluate('() => window.__stalePlayerAudioA !== document.querySelector("#player-lifecycle audio")')
        if returned_a:
            page.evaluate('''() => {
              const old = window.__stalePlayerAudioA;
              const handlers = window.__stalePlayerHandlersA;
              const event = { currentTarget: old, target: old };
              handlers.onPlay?.(event);
              handlers.onPause?.(event);
              handlers.onEnded?.(event);
            }''')
        page.wait_for_timeout(80)
        events = ev('player-lifecycle')
        state = player.get_attribute('data-state')
        handlers_captured = page.evaluate('() => Boolean(window.__stalePlayerHandlersA?.onPlay && window.__stalePlayerHandlersA?.onPause && window.__stalePlayerHandlersA?.onEnded)')
        result = initial_a and switched_b and returned_a and current_is_new and handlers_captured and events == [] and state == 'ready'
        if not result:
            notes['audio-player-stale-events-a-b-a'] = json.dumps({'initialA': initial_a, 'switchedB': switched_b, 'returnedA': returned_a, 'currentIsNew': current_is_new, 'handlersCaptured': handlers_captured, 'events': events, 'state': state})
        return result
    check('audio-player-stale-events-a-b-a', audio_player_stale_events_a_b_a)

    def meter_setup_failure():
        results = []
        for scenario in ['meter-source-throws', 'meter-analyser-throws']:
            install_audio_fakes(page, scenario)
            page.evaluate('() => { window.hooks.resetMeterLifecycle(); window.hooks.setMeterLifecycleStream(window.__audioFake.stream); }')
            closed = until(lambda: page.evaluate('() => window.__audioFake.contexts.length === 1 && window.__audioFake.contexts[0].closeCalls === 1'))
            track_owned = page.evaluate('() => window.__audioFake.tracks[0].stopCalls === 0')
            results.append(closed and track_owned)
            page.evaluate('() => window.hooks.resetMeterLifecycle()')
        return all(results)
    check('audio-meter-setup-failure', meter_setup_failure)

    def meter_resume_failure():
        install_audio_fakes(page, 'meter-resume-throws')
        page.evaluate('() => { window.hooks.resetMeterLifecycle(); window.hooks.setMeterLifecycleStream(window.__audioFake.stream); }')
        closed = until(lambda: page.evaluate('() => window.__audioFake.contexts[0]?.closeCalls === 1'))
        resources = page.evaluate('() => ({ sourceDisconnects: window.__audioFake.sources[0]?.disconnectCalls ?? 0, trackStops: window.__audioFake.tracks[0].stopCalls })')
        page.evaluate('() => window.hooks.resetMeterLifecycle()')
        result = closed and resources == {'sourceDisconnects': 1, 'trackStops': 0}
        if not result:
            notes['audio-meter-resume-failure'] = json.dumps({'closed': closed, 'resources': resources})
        return result
    check('audio-meter-resume-failure', meter_resume_failure)

    def meter_track_end():
        install_audio_fakes(page, 'meter-track-end')
        page.evaluate('() => { window.hooks.resetMeterLifecycle(); window.hooks.setMeterLifecycleStream(window.__audioFake.stream); }')
        sampled = until(lambda: page.evaluate('() => window.__audioFake.reads > 0'))
        # stop() changes readyState but intentionally does not dispatch `ended` per MDN.
        page.evaluate('() => window.__audioFake.tracks[0].stop()')
        host_stop_calls = page.evaluate('() => window.__audioFake.tracks[0].stopCalls')
        closed = until(lambda: page.evaluate('() => window.__audioFake.contexts[0].closeCalls === 1'))
        reads = page.evaluate('() => window.__audioFake.reads')
        page.wait_for_timeout(100)
        state = page.evaluate('(before) => ({ readsUnchanged: window.__audioFake.reads === before, trackStopCalls: window.__audioFake.tracks[0].stopCalls, sourceDisconnects: window.__audioFake.sources[0]?.disconnectCalls ?? 0 })', reads)
        page.evaluate('() => window.hooks.resetMeterLifecycle()')
        result = sampled and closed and state == {'readsUnchanged': True, 'trackStopCalls': host_stop_calls, 'sourceDisconnects': 1}
        if not result:
            notes['audio-meter-stops-after-track-end'] = json.dumps({'sampled': sampled, 'closed': closed, 'state': state})
        return result
    check('audio-meter-stops-after-track-end', meter_track_end)

    def recorder_error_failclose():
        install_audio_fakes(page, 'recorder-error')
        page.evaluate("() => { window.ev['recorder-multitake'] = []; window.hooks.resetMultiTakeRecorder(); }")
        box = S('recorder-multitake')
        box.get_by_role('button', name='Record a voice reply').click()
        started = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        page.evaluate('() => window.__audioFake.recorder.emitError()')
        failed = until(lambda: box.locator('[data-phase=error]').count() == 1)
        released = until(lambda: page.evaluate('() => window.__audioFake.tracks[0].stopCalls === 1 && window.__audioFake.contexts[0].closeCalls === 1'))
        page.wait_for_timeout(80)
        return started and failed and released and ev('recorder-multitake') == []
    check('voice-recorder-error-fail-close', recorder_error_failclose)

    def recorder_start_failure():
        install_audio_fakes(page, 'recorder-start-throws')
        page.evaluate('() => window.hooks.resetMultiTakeRecorder()')
        box = S('recorder-multitake')
        box.get_by_role('button', name='Record a voice reply').click()
        failed = until(lambda: box.locator('[data-phase=error]').count() == 1)
        released = until(lambda: page.evaluate('() => window.__audioFake.tracks[0].stopCalls === 1 && window.__audioFake.contexts[0].closeCalls === 1'))
        return failed and released and ev('recorder-multitake') == []
    check('voice-recorder-partial-setup-fail-close', recorder_start_failure)

    def recorder_out_of_order_stops():
        page.evaluate("() => { window.ev['recorder-multitake'] = []; window.hooks.resetMultiTakeRecorder(); }")
        install_audio_fakes(page, 'out-of-order', hold_stop=True)
        box = S('recorder-multitake')
        box.get_by_role('button', name='Record a voice reply').click()
        first_started = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        box.get_by_role('button', name='Stop recording').click()
        first_pending = until(lambda: page.evaluate('() => window.__audioFake.recorders.length === 1 && window.__audioFake.recorders[0].pendingStop'))
        box.get_by_role('button', name='Record a voice reply').click()
        second_started = until(lambda: box.locator('[data-phase=recording]').count() == 1 and page.evaluate('() => window.__audioFake.recorders.length === 2'))
        box.get_by_role('button', name='Stop recording').click()
        second_pending = until(lambda: page.evaluate('() => window.__audioFake.pendingStops === 2'))
        resources = page.evaluate('() => ({ tracks: window.__audioFake.tracks.map(t => t.stopCalls), contexts: window.__audioFake.contexts.map(c => c.closeCalls) })')
        page.evaluate('() => window.__audioFake.recorders[1].finish()')
        second_delivered = until(lambda: len(ev('recorder-multitake')) == 1)
        page.evaluate('() => window.__audioFake.recorders[0].finish()')
        first_delivered = until(lambda: len(ev('recorder-multitake')) == 2)
        order = page.evaluate('() => window.__audioFake.order.slice()')
        page.evaluate('() => window.__audioFake.recorders.forEach(r => r.finish())')
        page.wait_for_timeout(60)
        callbacks = ev('recorder-multitake')
        result = first_started and first_pending and second_started and second_pending and resources == {'tracks': [1, 1], 'contexts': [1, 1]} and second_delivered and first_delivered and order == ['data:2', 'stop:2', 'data:1', 'stop:1'] and callbacks == [{'data': 'take-2', 'size': 6}, {'data': 'take-1', 'size': 6}]
        if not result:
            notes['voice-recorder-out-of-order'] = json.dumps({'phases': [first_started, first_pending, second_started, second_pending], 'resources': resources, 'order': order, 'callbacks': callbacks})
        return result
    check('voice-recorder-out-of-order-stops', recorder_out_of_order_stops)

    def recorder_cancel_preserves_pending():
        page.evaluate("() => { window.ev['recorder-multitake'] = []; window.hooks.resetMultiTakeRecorder(); }")
        install_audio_fakes(page, 'out-of-order', hold_stop=True)
        box = S('recorder-multitake')
        box.get_by_role('button', name='Record a voice reply').click()
        first_started = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        box.get_by_role('button', name='Stop recording').click()
        first_pending = until(lambda: page.evaluate('() => window.__audioFake.recorders[0]?.pendingStop'))
        box.get_by_role('button', name='Record a voice reply').click()
        second_started = until(lambda: box.locator('[data-phase=recording]').count() == 1 and page.evaluate('() => window.__audioFake.recorders.length === 2'))
        box.get_by_role('button', name='Cancel recording').click()
        cancelled = until(lambda: box.locator('[data-phase=idle]').count() == 1)
        page.evaluate('() => window.__audioFake.recorders[1].finish(); window.__audioFake.recorders[0].finish()')
        delivered = until(lambda: len(ev('recorder-multitake')) == 2)
        callbacks = ev('recorder-multitake')
        result = first_started and first_pending and second_started and cancelled and delivered and callbacks == ['cancel', {'data': 'take-1', 'size': 6}]
        if not result:
            notes['voice-recorder-cancel-pending'] = json.dumps({'stages': [first_started, first_pending, second_started, cancelled, delivered], 'callbacks': callbacks})
        return result
    check('voice-recorder-cancel-preserves-older-pending', recorder_cancel_preserves_pending)

    def recorder_late_old_error():
        page.evaluate("() => { window.ev['recorder-multitake'] = []; window.hooks.resetMultiTakeRecorder(); }")
        install_audio_fakes(page, 'permission-sequence', hold_stop=True)
        box = S('recorder-multitake')
        box.get_by_role('button', name='Record a voice reply').click()
        first_requested = until(lambda: page.evaluate('() => window.__audioFake.requests === 1'))
        page.evaluate('() => window.__audioFake.resolvePermissions[0]()')
        first_started = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        box.get_by_role('button', name='Stop recording').click()
        first_pending = until(lambda: page.evaluate('() => window.__audioFake.recorders[0]?.pendingStop'))
        first_pending_handlers = page.evaluate('() => ({ error: typeof window.__audioFake.recorders[0].onerror, stop: typeof window.__audioFake.recorders[0].onstop, order: window.__audioFake.order.slice() })')
        box.get_by_role('button', name='Record a voice reply').click()
        second_requested = until(lambda: box.locator('[data-phase=requesting]').count() == 1 and page.evaluate('() => window.__audioFake.requests === 2'))
        second_requested_handlers = page.evaluate('() => ({ error: typeof window.__audioFake.recorders[0].onerror, stop: typeof window.__audioFake.recorders[0].onstop, order: window.__audioFake.order.slice() })')
        page.evaluate('() => window.__audioFake.recorders[0].emitError()')
        after_old_error = page.evaluate('() => ({ phase: document.querySelector("#recorder-multitake [data-phase]")?.getAttribute("data-phase"), trackStops: window.__audioFake.tracks[0].stopCalls, contextCloses: window.__audioFake.contexts[0].closeCalls, errorHandler: window.__audioFake.errorHandlers[0], handlers: { error: typeof window.__audioFake.recorders[0].onerror, stop: typeof window.__audioFake.recorders[0].onstop, data: typeof window.__audioFake.recorders[0].ondataavailable }, callbacks: window.ev["recorder-multitake"] })')
        page.evaluate('() => window.__audioFake.recorders[0].finish()')
        page.evaluate('() => window.__audioFake.resolvePermissions[1]()')
        second_started = until(lambda: box.locator('[data-phase=recording]').count() == 1 and page.evaluate('() => window.__audioFake.recorders.length === 2'))
        box.get_by_role('button', name='Stop recording').click()
        second_pending = until(lambda: page.evaluate('() => window.__audioFake.recorders[1].pendingStop'))
        page.evaluate('() => window.__audioFake.recorders[1].finish()')
        delivered = until(lambda: len(ev('recorder-multitake')) == 1)
        page.wait_for_timeout(80)
        callbacks = ev('recorder-multitake')
        result = first_requested and first_started and first_pending and second_requested and after_old_error['phase'] == 'requesting' and after_old_error['trackStops'] == 1 and after_old_error['contextCloses'] == 1 and after_old_error['errorHandler'] and after_old_error['handlers'] == {'error': 'object', 'stop': 'object', 'data': 'object'} and second_started and second_pending and delivered and callbacks == [{'data': 'take-2', 'size': 6}]
        if not result:
            notes['voice-recorder-late-old-error'] = json.dumps({'stages': [first_requested, first_started, first_pending, second_requested, second_started, second_pending, delivered], 'pendingHandlers': [first_pending_handlers, second_requested_handlers], 'afterOldError': after_old_error, 'order': page.evaluate('() => window.__audioFake.order.slice()'), 'callbacks': callbacks})
        return result
    check('voice-recorder-late-old-error-isolated', recorder_late_old_error)

    def recorder_strictmode_autostart():
        page.evaluate("() => { window.ev['recorder-strict-lifecycle'] = []; }")
        install_audio_fakes(page, 'permission-sequence')
        page.evaluate('() => window.hooks.mountStrictRecorderLifecycle()')
        requested_twice = until(lambda: page.evaluate('() => window.__audioFake.requests === 2'))
        if not requested_twice:
            return False
        page.evaluate('() => window.__audioFake.resolvePermissions[0]()')
        stale_released = until(lambda: page.evaluate('() => window.__audioFake.tracks[0].stopCalls === 1'))
        page.evaluate('() => window.__audioFake.resolvePermissions[1]()')
        box = S('recorder-strict-lifecycle')
        started = until(lambda: box.locator('[data-phase=recording]').count() == 1 and page.evaluate('() => window.__audioFake.recorders.length === 1'))
        box.get_by_role('button', name='Stop recording').click()
        completed = until(lambda: len(ev('recorder-strict-lifecycle')) == 1)
        return requested_twice and stale_released and started and completed
    check('voice-recorder-strictmode-autostart-replay', recorder_strictmode_autostart)

    def recorder_unmount_pending():
        page.evaluate("() => { window.ev['recorder-multitake'] = []; window.hooks.resetMultiTakeRecorder(); }")
        install_audio_fakes(page, 'out-of-order', hold_stop=True)
        box = S('recorder-multitake')
        box.get_by_role('button', name='Record a voice reply').click()
        started = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        box.get_by_role('button', name='Stop recording').click()
        pending = until(lambda: page.evaluate('() => window.__audioFake.recorders[0]?.pendingStop'))
        page.evaluate('() => window.hooks.unmountMultiTakeRecorder()')
        unmounted = until(lambda: box.locator('[data-phase]').count() == 0)
        page.evaluate('() => window.__audioFake.recorders[0].finish()')
        page.wait_for_timeout(80)
        state = page.evaluate('() => ({ callbacks: window.ev["recorder-multitake"], tracks: window.__audioFake.tracks.map(t => t.stopCalls), contexts: window.__audioFake.contexts.map(c => c.closeCalls) })')
        result = started and pending and unmounted and state == {'callbacks': [], 'tracks': [1], 'contexts': [1]}
        if not result:
            notes['voice-recorder-unmount-pending'] = json.dumps({'started': started, 'pending': pending, 'unmounted': unmounted, 'state': state})
        return result
    check('voice-recorder-unmount-cancels-pending-work', recorder_unmount_pending)

    def recorder_waveform_smoothing():
        page.evaluate("() => { window.ev['recorder-multitake'] = []; window.hooks.resetMultiTakeRecorder(); }")
        install_audio_fakes(page, 'normal')
        box = S('recorder-multitake')
        box.get_by_role('button', name='Record a voice reply').click()
        started = until(lambda: box.locator('[data-phase=recording]').count() == 1)
        bars = box.locator('.cieo-voice-recorder-waveform-bar')
        bounded = bars.count() == 24
        page.wait_for_timeout(280)
        if mode == 'reduce':
            final = bars.evaluate_all('''els => els.every(el => {
              const target = Number.parseFloat(el.style.transform.match(/scaleY\\(([^)]+)\\)/)?.[1] || '0');
              const shown = new DOMMatrixReadOnly(getComputedStyle(el).transform).d;
              return getComputedStyle(el).transitionDuration === '0s' && Math.abs(target - shown) < 0.01;
            })''')
            box.get_by_role('button', name='Cancel recording').click()
            return started and bounded and final and until(lambda: box.locator('[data-phase=idle]').count() == 1)

        def capture_intermediate():
            return page.evaluate('''() => {
              const bars = [...document.querySelectorAll('#recorder-multitake .cieo-voice-recorder-waveform-bar')];
              const bar = bars.find(el => {
                const target = Number.parseFloat(el.style.transform.match(/scaleY\\(([^)]+)\\)/)?.[1] || '0');
                const shown = new DOMMatrixReadOnly(getComputedStyle(el).transform).d;
                return getComputedStyle(el).transitionProperty.includes('transform') && Math.abs(target - shown) > 0.02;
              });
              if (!bar) return false;
              const target = Number.parseFloat(bar.style.transform.match(/scaleY\\(([^)]+)\\)/)?.[1] || '0');
              window.__recorderSmoothBar = bar;
              window.__recorderSmoothFirst = { target, shown: new DOMMatrixReadOnly(getComputedStyle(bar).transform).d };
              return true;
            }''')

        intermediate = until(capture_intermediate, 2.0)
        page.wait_for_timeout(30)
        follow = page.evaluate('''() => {
          const bar = window.__recorderSmoothBar;
          const first = window.__recorderSmoothFirst;
          if (!bar || !first) return null;
          const target = Number.parseFloat(bar.style.transform.match(/scaleY\\(([^)]+)\\)/)?.[1] || '0');
          const shown = new DOMMatrixReadOnly(getComputedStyle(bar).transform).d;
          return { sameTarget: target === first.target, moved: shown !== first.shown, closer: Math.abs(target - shown) < Math.abs(first.target - first.shown) };
        }''')
        box.get_by_role('button', name='Cancel recording').click()
        cancelled = until(lambda: box.locator('[data-phase=idle]').count() == 1)
        result = started and bounded and intermediate and follow == {'sameTarget': True, 'moved': True, 'closer': True} and cancelled
        if not result:
            notes['voice-recorder-waveform-smoothing'] = json.dumps({'started': started, 'bounded': bounded, 'intermediate': intermediate, 'follow': follow, 'cancelled': cancelled})
        return result
    check('voice-recorder-waveform-smoothing', recorder_waveform_smoothing)

    checks['no-page-errors'] = not errors
    context.close()
    return checks, notes, errors


def main():
    with tempfile.TemporaryDirectory(prefix='cieo-social-') as tmp:
        out = pathlib.Path(tmp)
        build(out)
        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *args):
                pass
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=tmp))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        failures, report = [], {}
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'])
                for mode in ['reduce', 'no-preference']:
                    checks, notes, errors = run_mode(browser, server.server_port, mode)
                    report[mode] = {'checks': checks, 'notes': notes, 'errors': errors}
                    failures += [f'{mode}:{name}' + (f' ({notes[name]})' if name in notes else '') for name, ok in checks.items() if not ok]
                    failures += [f'{mode}:{e}' for e in errors]
                report['browser'] = browser.version
                browser.close()
        finally:
            server.shutdown(); server.server_close()
        print(json.dumps(report, indent=2))
        if failures:
            print('\nFAILED:\n  ' + '\n  '.join(failures), file=sys.stderr)
            sys.exit(1)
        print('\nAll social checks passed in both motion modes.')


if __name__ == '__main__':
    main()
