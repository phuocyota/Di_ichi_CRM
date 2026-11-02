import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarCheck, LoaderCircle, X } from "lucide-react";
import apiClient from "../../services/apiClient.js";

const formatStart = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Bangkok",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
const formatTime = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
export default function ClassPlanConversionModal({
  item,
  teachers,
  rooms,
  onClose,
  onConverted,
}) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    dialogRef.current?.focus();
    return () => previous?.focus?.();
  }, []);
  const [preview, setPreview] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  const [teacherId, setTeacherId] = useState(item.teacherIds?.[0] || ""),
    [roomId, setRoomId] = useState("");
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setPreview(null);
    setError("");
    apiClient
      .get(`/class/${item.id}/planned-schedules/preview`, { signal: c.signal })
      .then((result) => {
        if (c.signal.aborted) return;
        if (!Array.isArray(result.sessions) || !result.planKey)
          throw new Error("Bản xem trước không hợp lệ");
        setPreview(result);
      })
      .catch((error) => {
        if (!c.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [item.id, retry]);
  const submit = async (event) => {
    event.preventDefault();
    if (busy || !preview || !teacherId || !preview.pending) return;
    setBusy(true);
    setError("");
    try {
      const result = await apiClient.post(
        `/class/${item.id}/planned-schedules/convert`,
        { teacherId, roomId: roomId || null, planKey: preview.planKey },
        { timeout: 120000 },
      );
      if (
        !Number.isInteger(result?.created) ||
        !Number.isInteger(result?.alreadyExisting)
      )
        throw new Error(
          "Máy chủ chưa xác nhận kết quả chuyển lịch. Tải lại bản xem trước để kiểm tra.",
        );
      await onConverted(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <form
        ref={dialogRef}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) {
            event.preventDefault();
            onClose();
          }
          if (event.key === "Tab") {
            const controls = [
                ...event.currentTarget.querySelectorAll(
                  "button:not(:disabled),select:not(:disabled)",
                ),
              ],
              first = controls[0],
              last = controls.at(-1);
            if (
              event.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === event.currentTarget)
            ) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Chuyển sang lịch học thực tế"
        onSubmit={submit}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <span className="mb-2 inline-flex rounded-xl bg-emerald-50 p-2 text-emerald-700">
              <CalendarCheck size={21} />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">
              Chuyển sang lịch học thực tế
            </h2>
            <p className="mt-1 text-sm text-slate-500">{item.name}</p>
          </div>
          <button
            type="button"
            className="ui-button ui-icon-button"
            aria-label="Đóng chuyển lịch"
            disabled={busy}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>
        <div className="space-y-4 overflow-auto p-5">
          {loading ? (
            <p role="status" className="text-sm text-slate-500">
              Đang kiểm tra lịch dự kiến và các buổi đã có…
            </p>
          ) : null}
          {error ? (
            <div
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
              <button
                type="button"
                disabled={busy}
                onClick={() => setRetry((v) => v + 1)}
                className="ml-2 underline"
              >
                Tải lại bản xem trước
              </button>
            </div>
          ) : null}
          {preview ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Dự kiến", preview.total],
                  ["Đã có lịch", preview.existing],
                  ["Sẽ tạo mới", preview.pending],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-xs text-slate-500">{label}</p>
                    <strong className="mt-1 block text-xl text-slate-800">
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
              {preview.pending > 0 ? (
                <>
                  <p className="text-sm text-slate-500">
                    Chọn giáo viên cho các buổi chưa có lịch thực tế. Các buổi
                    đã có sẽ được giữ nguyên.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Giáo viên *
                      <select
                        required
                        value={teacherId}
                        disabled={busy}
                        onChange={(e) => setTeacherId(e.target.value)}
                        className="mt-2 w-full"
                      >
                        <option value="">Chọn giáo viên</option>
                        {teachers
                          .filter(
                            (t) =>
                              t.branchId === preview.branchId &&
                              !t.deletedAt &&
                              t.status?.toLowerCase() === "active",
                          )
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label className="text-sm font-semibold text-slate-700">
                      Phòng học (không bắt buộc)
                      <select
                        value={roomId}
                        disabled={busy}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="mt-2 w-full"
                      >
                        <option value="">Chưa chọn phòng</option>
                        {rooms
                          .filter(
                            (r) =>
                              r.branchId === preview.branchId &&
                              r.status?.toLowerCase() === "active",
                          )
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>
                </>
              ) : (
                <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                  Tất cả các buổi đã có lịch thực tế. Không cần tạo thêm.
                </p>
              )}
              <section>
                <h3 className="text-sm font-semibold text-slate-700">
                  Các buổi trong kế hoạch
                </h3>
                <ol className="mt-2 max-h-64 space-y-2 overflow-auto">
                  {preview.sessions.map((session, index) => (
                    <li
                      key={session.startAt}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <span>
                        {index + 1}. {formatStart(session.startAt)}–
                        {formatTime(session.endAt)}
                      </span>
                      <span
                        className={`rounded-md px-2 py-1 text-xs ${session.existingScheduleId ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        {session.existingScheduleId
                          ? session.existingStatus === "cancelled"
                            ? "Đã có (đã hủy)"
                            : "Đã có lịch"
                          : "Sẽ tạo"}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
              <p className="text-xs text-slate-500">
                Hệ thống kiểm tra trùng lớp, giáo viên và phòng trước khi lưu.
                Nếu có xung đột, toàn bộ lần chuyển sẽ không được lưu.
              </p>
            </>
          ) : null}
        </div>
        <footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            className="ui-button"
            disabled={busy}
            onClick={onClose}
          >
            {preview?.pending === 0 ? "Đóng" : "Hủy"}
          </button>
          <button
            type="submit"
            className="ui-button ui-button-primary"
            disabled={loading || busy || !teacherId || !preview?.pending}
          >
            {busy ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}{" "}
            {busy ? "Đang chuyển lịch…" : "Xác nhận chuyển lịch"}
          </button>
        </footer>
      </form>
    </div>
  );
}
