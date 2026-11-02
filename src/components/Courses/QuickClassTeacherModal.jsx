import React, { useEffect, useRef, useState } from "react";
import { LoaderCircle, UserRoundPlus, X } from "lucide-react";
import apiClient from "../../services/apiClient.js";

export default function QuickClassTeacherModal({ item, onClose, onCreated }) {
  const opener = useRef(document.activeElement);
  useEffect(() => {
    const previous = opener.current;
    return () => previous?.focus?.();
  }, []);
  const [values, setValues] = useState({
    name: "",
    code: "",
    phone: "",
    email: "",
    assignToClass: true,
  });
  const [requestId] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  const update = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await apiClient.post(
        `/class/${item.id}/teachers/quick-create`,
        {
          requestId,
          name: values.name.trim(),
          ...(values.code.trim() ? { code: values.code.trim() } : {}),
          ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
          ...(values.email.trim() ? { email: values.email.trim() } : {}),
          assignToClass: values.assignToClass,
        },
      );
      if (!result?.teacher?.id)
        throw new Error(
          "Máy chủ chưa xác nhận giáo viên vừa tạo. Vui lòng thử lại để kiểm tra.",
        );
      await onCreated(result);
    } catch (error) {
      setError(error.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const field =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50";
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <form
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) {
            event.preventDefault();
            onClose();
          }
          if (event.key === "Tab") {
            const controls = [
                ...event.currentTarget.querySelectorAll(
                  "button:not(:disabled),input:not(:disabled)",
                ),
              ],
              first = controls[0],
              last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) {
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
        aria-label="Tạo giáo viên tại lớp"
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <span className="mb-2 inline-flex rounded-xl bg-blue-50 p-2 text-blue-700">
              <UserRoundPlus size={21} />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">
              Tạo giáo viên
            </h2>
            <p className="mt-1 text-sm text-slate-500">Cho lớp {item.name}</p>
          </div>
          <button
            type="button"
            className="ui-button ui-icon-button"
            aria-label="Đóng tạo giáo viên"
            disabled={busy}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>
        <fieldset disabled={busy} className="space-y-4 p-5">
          <p className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-blue-800">
            Giáo viên được tạo tại cùng cơ sở với lớp này.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Họ tên *
              <input
                autoFocus
                required
                maxLength={200}
                className={field}
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Mã giáo viên
              <input
                maxLength={50}
                placeholder="Tự tạo nếu để trống"
                className={field}
                value={values.code}
                onChange={(e) => update("code", e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Số điện thoại
              <input
                type="tel"
                maxLength={30}
                className={field}
                value={values.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Email liên hệ
              <input
                type="email"
                maxLength={254}
                className={field}
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </label>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-red-600"
              checked={values.assignToClass}
              onChange={(e) => update("assignToClass", e.target.checked)}
            />
            <span>
              <strong className="block text-sm text-slate-700">
                Phân công vào lớp này sau khi tạo
              </strong>
              <span className="mt-1 block text-xs text-slate-500">
                Chưa chuyển lịch dự kiến thành lịch dạy thực tế.
              </span>
            </span>
          </label>
          <p className="text-xs text-slate-500">
            Tạo hồ sơ giáo viên để phân công. Tài khoản đăng nhập được thiết lập
            riêng.
          </p>
        </fieldset>
        {error ? (
          <p
            role="alert"
            className="mx-5 mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
        <footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            className="ui-button"
            disabled={busy}
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="ui-button ui-button-primary"
            disabled={busy}
          >
            {busy ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <UserRoundPlus size={16} />
            )}{" "}
            {busy ? "Đang tạo…" : "Tạo giáo viên"}
          </button>
        </footer>
      </form>
    </div>
  );
}
