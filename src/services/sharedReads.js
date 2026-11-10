// Gộp GET đồng thời và các lần tải bù sát nhau; mỗi người gọi vẫn hủy riêng được.
export function createSharedReads({ ttl = 750, now = () => Date.now() } = {}) {
  const entries = new Map()
  function remove(key, entry) {
    if (entry.timer) clearTimeout(entry.timer)
    entry.controller?.abort()
    if (entries.get(key) === entry) entries.delete(key)
  }
  function consume(key, entry, signal) {
    if (entry.timer) { clearTimeout(entry.timer); entry.timer = null }
    const consumer = {}
    entry.consumers.add(consumer)
    return new Promise((resolve, reject) => {
      const release = () => {
        signal?.removeEventListener('abort', abort)
        entry.consumers.delete(consumer)
        if (entry.pending && !entry.consumers.size && !entry.timer) entry.timer = setTimeout(() => {
          if (entry.pending && !entry.consumers.size) remove(key, entry)
        }, 0)
      }
      const abort = () => { release(); reject(new DOMException('Request aborted', 'AbortError')) }
      if (signal?.aborted) { abort(); return }
      signal?.addEventListener('abort', abort, { once: true })
      entry.promise.then(value => { release(); resolve(value) }, error => { release(); reject(error) })
    })
  }
  return {
    read(key, loader, { signal, force = false } = {}) {
      if (signal?.aborted) return Promise.reject(new DOMException('Request aborted', 'AbortError'))
      for (const [oldKey, oldEntry] of entries) if (!oldEntry.pending && now() - oldEntry.loadedAt >= ttl) remove(oldKey, oldEntry)
      let entry = entries.get(key)
      if (entry && (force || entry.controller?.signal.aborted)) { remove(key, entry); entry = null }
      if (entry?.pending) return consume(key, entry, signal)
      if (entry && now() - entry.loadedAt < ttl) return Promise.resolve(entry.value)
      const controller = new AbortController()
      entry = { controller, consumers: new Set(), pending: true, timer: null }
      entry.promise = Promise.resolve().then(() => loader(controller.signal)).then(value => {
        entry.pending = false; entry.value = value; entry.loadedAt = now()
        return value
      }, error => {
        entry.pending = false
        if (entries.get(key) === entry) entries.delete(key)
        throw error
      })
      entries.set(key, entry)
      return consume(key, entry, signal)
    },
    clear(prefix = '') { for (const [key, entry] of entries) if (key.startsWith(prefix)) remove(key, entry) },
  }
}
