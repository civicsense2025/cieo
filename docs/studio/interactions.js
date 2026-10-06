/** A finite critically damped step, with the same base frequency as Cieo's motion tokens. */
export function wireSpecimen(isReduced, announce) {
  let frame = 0, generation = 0;
  const art = document.querySelector('.motion-art');
  const stop = () => { generation += 1; cancelAnimationFrame(frame); frame = 0; art.style.setProperty('--travel', '0px'); };
  const replay = () => {
    stop();
    if (isReduced() || document.hidden) { announce('Motion stays still under the current preference.'); return; }
    const start = performance.now(), own = generation;
    const step = (time) => {
      if (own !== generation) return;
      if (isReduced() || document.hidden) { stop(); return; }
      const seconds = Math.max(0, (time - start) / 1000);
      const offset = 32 * Math.exp(-22 * seconds) * (1 + 22 * seconds);
      art.style.setProperty('--travel', `${offset.toFixed(3)}px`);
      if (offset > .01) frame = requestAnimationFrame(step);
      else { frame = 0; art.style.setProperty('--travel', '0px'); }
    };
    frame = requestAnimationFrame(step);
  };
  const tasks = [...document.querySelectorAll('.task input')];
  const count = () => {
    const done = tasks.filter((item) => item.checked).length;
    document.getElementById('task-count').textContent = `${done} of ${tasks.length}`;
    document.getElementById('completion').value = done;
    document.getElementById('completion').textContent = `${done} of ${tasks.length} complete`;
    const tag = document.querySelector('.task-tag');
    tag.textContent = tasks[0].checked ? 'Done' : 'To do';
  };
  tasks.forEach((item) => item.addEventListener('change', count));
  document.getElementById('replay').addEventListener('click', replay);
  document.getElementById('launch').addEventListener('click', () => { document.getElementById('project-name').focus(); announce('Give the new project a name.'); });
  document.getElementById('project-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('project-name');
    const value = name.value.trim();
    if (!value) { name.setCustomValidity('Enter a project name.'); name.reportValidity(); return; }
    announce(`“${value}” is ready in this local demonstration. No project was sent to a server.`);
    tasks[0].checked = true; count(); replay();
  });
  document.getElementById('project-name').addEventListener('input', (event) => event.target.setCustomValidity(''));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  return { replay, stop };
}
