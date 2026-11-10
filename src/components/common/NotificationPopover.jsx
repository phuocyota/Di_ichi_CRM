import { useResourceUpdates } from '../../services/realtime.js'
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, RefreshCcw, UserRoundX } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getNotifications,
  getScheduleAlerts,
  readNotifications,
} from "../../services/workspaceApi.js";
import { USER_KEY } from "../../services/apiClient.js";
import useWorkScheduleAlerts from '../WorkSchedule/useWorkScheduleAlerts.js'

export default function NotificationPopover() {
  const ref = useRef(null);
  const loadVersion = useRef(0);
  const invalidateLoads = useCallback(() => {
    loadVersion.current++;
  }, []);
  const [isAdmin] = useState(() => {
    try {
      return ["ADMIN", "SUPER_ADMIN"].includes(
        JSON.parse(localStorage.getItem(USER_KEY))?.role,
      );
    } catch {
      return false;
    }
  });
  const [alerts, setAlerts] = useState([]);
  const workScheduleAlerts = useWorkScheduleAlerts(isAdmin);
  const [open, setOpen] = useState(false),
    [rows, setRows] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState("all");
  const load = useCallback(async ({ force = false, notificationsOnly = false } = {}) => {
    const version = ++loadVersion.current;
    setLoading(true);
    setError("");
    try {
      const results = await Promise.allSettled([
        getNotifications({ force }),
        ...(isAdmin && !notificationsOnly ? [getScheduleAlerts({ force })] : []),
      ]);
      if (version !== loadVersion.current) return;
      const messages = [];
      for (const [index, result] of results.entries()) {
        if (result.status === "rejected") {
          messages.push(result.reason?.message || "Không tải được thông báo");
          continue;
        }
        if (!Array.isArray(result.value)) {
          messages.push("Dữ liệu thông báo không hợp lệ");
          continue;
        }
        if (index === 0) setRows(result.value);
        else setAlerts(result.value);
      }
      if (messages.length) setError(messages.join("; "));
    } catch (cause) {
      setError(cause.message);
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }, [isAdmin]);
  useResourceUpdates(change => load({ force: !change?.resync || change.resources?.some(resource => resource !== '*') }), ['notification','workspace','class','class-staff','schedule','portal','staff','branch','system-settings'], !busy)
  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState !== "hidden") load();
    }, 60000);
    const focus = () => load();
    window.addEventListener("crm:notifications-refresh", focus);
    return () => {
      invalidateLoads();
      clearInterval(timer);
      window.removeEventListener("crm:notifications-refresh", focus);
    };
  }, [load, invalidateLoads]);
  useEffect(() => {
    if (!open) return;
    load();
    const outside = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, load]);
  async function mark(id) {
    setBusy(true);
    setError("");
    try {
      await readNotifications(id);
      await load({ force: true, notificationsOnly: true });
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }
  const unread = rows.filter((r) => !r.readAt).length;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Thông báo"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className="ui-button ui-icon-button relative"
      >
        <Bell size={19} />
        {unread + alerts.length + workScheduleAlerts.length > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full border-2 border-white bg-red-600 px-1.5 text-[10px] font-bold text-white">
            {unread + alerts.length + workScheduleAlerts.length}
          </span>
        )}
      </button>
      {open && (
        <section
          role="dialog"
          aria-label="Danh sách thông báo"
          className="absolute right-0 top-14 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          <header className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">Thông báo</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {unread} chưa đọc
                  {alerts.length ? ` · ${alerts.length} cần phân công` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Tải lại thông báo"
                  disabled={loading}
                  onClick={load}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
                >
                  <RefreshCcw size={16} />
                </button>
                <button
                  disabled={busy || !unread}
                  onClick={() => mark()}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 p-2 text-xs font-bold text-blue-700 disabled:opacity-40"
                >
                  <CheckCheck size={16} />
                  Đọc tất cả
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["all", "Tất cả"],
                ["unread", "Chưa đọc"],
                ...(isAdmin
                  ? [["teachers", `Cần phân công (${alerts.length})`]]
                  : []),
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter === v ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </header>
          <div className="max-h-[min(30rem,65vh)] overflow-y-auto p-2">
            {filter !== 'teachers' && workScheduleAlerts.length > 0 && <Link to="/work-schedule" onClick={() => setOpen(false)} className="mb-2 block rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <strong>Lịch làm việc: {workScheduleAlerts.length} cảnh báo chấm công</strong>
              <p className="mt-1">{workScheduleAlerts.filter(item => item.type === 'Đi trễ').length} đi trễ · {workScheduleAlerts.filter(item => item.type === 'Về sớm').length} về sớm · {workScheduleAlerts.filter(item => item.type === 'Quên chấm công').length} quên công</p>
              <p className="mt-1 text-amber-700">Dữ liệu tuần này · Xem lịch làm việc</p>
            </Link>}
            {filter !== "unread" &&
              alerts.map((alert) => (
                <article
                  key={alert.id}
                  className="mb-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3"
                >
                  <div className="flex items-start gap-2">
                    <UserRoundX
                      size={17}
                      className="mt-0.5 shrink-0 text-amber-700"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-amber-900">
                        {alert.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {alert.content}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {alert.branchName}
                        {alert.plannedSessions > 0
                          ? ` · ${alert.plannedSessions} buổi dự kiến`
                          : ""}
                      </p>
                      <Link
                        className="mt-2 inline-flex text-xs font-semibold text-amber-800 underline"
                        to={alert.targetPath}
                        onClick={() => setOpen(false)}
                      >
                        Mở lớp để phân công
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            {error && (
              <p role="alert" className="p-3 text-sm text-red-600">
                {error}
              </p>
            )}
            {loading && (
              <p role="status" className="p-3 text-sm text-slate-500">
                Đang tải thông báo…
              </p>
            )}
            {rows
              .filter(
                (r) =>
                  filter !== "teachers" && (filter !== "unread" || !r.readAt),
              )
              .map((r) => (
                <article
                  key={r.id}
                  className={`mb-1 rounded-xl p-3 ${r.readAt ? "bg-white" : "bg-blue-50"}`}
                >
                  <h3 className="text-sm font-bold text-slate-800">
                    {r.title}
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                    {r.content}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </p>
                  <div className="mt-2 flex gap-3">
                    {!r.readAt && (
                      <button
                        className="text-xs font-semibold text-blue-600"
                        disabled={busy}
                        onClick={() => mark(r.id)}
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                    {r.targetPath?.startsWith("/") &&
                      !r.targetPath.startsWith("//") && (
                        <Link
                          className="text-xs font-semibold text-blue-600"
                          to={r.targetPath}
                          onClick={() => {
                            setOpen(false);
                            if (!r.readAt) mark(r.id);
                          }}
                        >
                          Xem chi tiết
                        </Link>
                      )}
                  </div>
                </article>
              ))}
            {!loading &&
              !error &&
              !workScheduleAlerts.length &&
              !(filter !== "unread" && alerts.length) &&
              !rows.some(
                (r) =>
                  filter !== "teachers" && (filter !== "unread" || !r.readAt),
              ) && (
                <p className="p-8 text-center text-sm text-slate-400">
                  Chưa có thông báo.
                </p>
              )}
          </div>
        </section>
      )}
    </div>
  );
}
