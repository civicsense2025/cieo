"""Real-browser interaction gate for the social, audio and engagement primitives; local source only, no installs or external requests.
Run: CIEO_ESBUILD=/existing/node_modules/esbuild python3 test/browser/social.py
Runs every check twice, with reduced motion on and off; exits 1 when any check fails in either mode.
"""
import functools, http.server, json, os, pathlib, re, shutil, subprocess, sys, tempfile, threading, time
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
    context.add_init_script(INIT)
    page = context.new_page()
    page.set_default_timeout(3000)
    page.route('**/*', lambda route: route.continue_() if route.request.url.startswith((origin + '/', 'blob:', 'data:')) else route.abort())
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
        box = S('recorder')
        mic = box.get_by_role('button', name='Record a voice reply')
        mic.click()
        ok = until(lambda: box.locator('[data-phase=recording]').count() == 1, 5.0)
        page.wait_for_timeout(1200)
        box.get_by_role('button', name='Stop recording').click()
        ok = ok and until(lambda: len(ev('recorder')) == 1, 5.0)
        clip = ev('recorder')[0] if ev('recorder') else {}
        ok = ok and isinstance(clip, dict) and clip.get('size', 0) > 0 and 1.0 <= clip.get('duration', 0) <= 2.5 and clip.get('peaks') == 64
        notes['recorder-clip'] = json.dumps(clip)
        ended = lambda: page.evaluate('() => window.__streams.length > 0 && window.__streams.every(s => s.getTracks().every(t => t.readyState === "ended"))')
        ok = ok and until(ended, 3.0)
        mic.click()
        ok = ok and until(lambda: box.locator('[data-phase=recording]').count() == 1, 5.0)
        page.wait_for_timeout(500)
        page.keyboard.press('Escape')
        ok = ok and until(lambda: ev('recorder')[-1:] == ['cancel']) and until(lambda: box.locator('[data-phase=idle]').count() == 1)
        page.wait_for_timeout(500)
        streams = page.evaluate('() => window.__streams.length')
        return ok and len(ev('recorder')) == 2 and streams == 2 and until(ended, 3.0)
    check('voice-recorder', recorder)

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
