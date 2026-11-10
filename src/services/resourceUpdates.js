// Gom sự kiện và tải bù sau khi kết nối lại, dùng chung cho mọi màn CRM.
export function startUpdates({ client, target, document, timers = globalThis, eventName }) {
  let active = true, watching = false, live = false;
  let flushTimer, watchTimer, generation = 0;
  const pending = new Set();
  const schedule = resource => {
    if (!active) return;
    pending.add(resource);
    if (flushTimer !== undefined) return;
    flushTimer = timers.setTimeout(() => {
      flushTimer = undefined;
      if (!active) return;
      const resources = [...pending];
      pending.clear();
      target.dispatchEvent(new CustomEvent(eventName, {
        detail: { resources, resync: resources.includes('*') },
      }));
    }, 200);
  };
  const watch = () => {
    if (!active || !client.connected) return;
    timers.clearTimeout(watchTimer);
    const attempt = ++generation;
    client.timeout(5000).emit('updates:watch', {}, (error, response) => {
      if (!active || !client.connected || attempt !== generation) return;
      const result = response?.data ?? response;
      watching = !error && result?.ok === true;
      live = watching && result.ready === true;
      if (watching) schedule('*');
      else watchTimer = timers.setTimeout(watch, 3000);
    });
  };
  const reset = () => {
    generation++;
    watching = false;
    live = false;
    timers.clearTimeout(watchTimer);
  };
  client.on('connect', () => { reset(); watch(); });
  client.on('resources:changed', event => {
    if (watching && /^[a-z][a-z-]{0,63}$/.test(event?.resource || '')) schedule(event.resource);
  });
  client.on('updates:status', event => {
    live = watching && event?.ready === true;
    if (live) schedule('*');
  });
  client.on('disconnect', reset);
  client.on('connect_error', reset);
  const onFocus = () => {
    if (document.hidden) return;
    schedule('*');
    if (!client.connected) client.connect();
    else if (!watching) watch();
  };
  const fallback = timers.setInterval(() => {
    if (!document.hidden && !live) onFocus();
  }, 30000);
  target.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onFocus);
  if (client.connected) watch();
  return () => {
    active = false;
    reset();
    timers.clearTimeout(flushTimer);
    timers.clearInterval(fallback);
    target.removeEventListener('focus', onFocus);
    document.removeEventListener('visibilitychange', onFocus);
    client.disconnect();
  };
}

// API tổng hợp có thể thay đổi nhiều loại dữ liệu trong cùng giao dịch.
const dependencies = {
  workspace: ['schedule', 'attendance-record', 'notification'],
  portal: ['schedule', 'attendance-record', 'homework', 'homework-submission', 'score'],
  'system-settings': ['staff', 'user-account', 'role', 'user-role', 'role-permission', 'branch'],
};
export function affectsResources(change, allowed) {
  if (!change) return false;
  if (change.resync || !allowed.length) return true;
  return change.resources?.some(resource =>
    allowed.includes(resource) || dependencies[resource]?.some(item => allowed.includes(item)),
  ) === true;
}
