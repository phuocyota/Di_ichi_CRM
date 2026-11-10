import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import apiClient, { getAccessToken } from "./apiClient.js";
import { startUpdates, affectsResources } from "./resourceUpdates.js";

export const RESOURCE_EVENT = "diichi:resources-changed";
export function createRealtimeSocket(namespace) {
  const origin = new URL(apiClient.defaults.baseURL, window.location.origin)
    .origin;
  return io(`${origin}/${namespace}`, {
    transports: ["websocket"],
    auth: (callback) => callback({ token: getAccessToken() }),
  });
}
export function startResourceUpdates() {
  return startUpdates({
    client: createRealtimeSocket("updates"), target: window, document, eventName: RESOURCE_EVENT,
  });
}
export function useUpdatesConnection() {
  useEffect(() => startResourceUpdates(), []);
}
export function useResourceUpdates(callback, resources = [], enabled = true) {
  const current = useRef(callback), allowed = useRef(resources), canRun = useRef(enabled);
  const pending = useRef(false), running = useRef(false), mounted = useRef(false);
  const pendingChange = useRef(null);
  const drain = useRef(null);
  useEffect(() => {
    current.current = callback;
    allowed.current = resources;
    canRun.current = enabled;
  });
  useEffect(() => {
    mounted.current = true;
    const run = async () => {
      if (!mounted.current || !canRun.current || running.current || !pending.current) return;
      running.current = true;
      pending.current = false;
      const change = pendingChange.current;
      pendingChange.current = null;
      try { await current.current(change); } catch { /* Màn đang mở tự hiển thị lỗi API. */ }
      finally {
        running.current = false;
        if (mounted.current && canRun.current && pending.current) void run();
      }
    };
    drain.current = run;
    const changed = event => {
      if (!affectsResources(event.detail, allowed.current)) return;
      pendingChange.current = { resync: Boolean(pendingChange.current?.resync || event.detail.resync), resources: [...new Set([...(pendingChange.current?.resources || []), ...(event.detail.resources || [])])] };
      pending.current = true;
      void run();
    };
    window.addEventListener(RESOURCE_EVENT, changed);
    return () => {
      mounted.current = false;
      pending.current = false;
      pendingChange.current = null;
      window.removeEventListener(RESOURCE_EVENT, changed);
    };
  }, []);
  useEffect(() => { if (enabled) void drain.current?.(); }, [enabled]);
}
