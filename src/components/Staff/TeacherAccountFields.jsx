import React from 'react'

export default function TeacherAccountFields({
  register,
  errors = {},
  creating = true,
  autoFocus = false,
  inputClass,
}) {
  const fields = [
    { name: 'name', label: 'Họ tên', maxLength: 200, placeholder: 'Nhập họ tên', required: true },
    { name: 'code', label: 'Mã giáo viên', maxLength: 50, placeholder: 'Tự động nếu để trống' },
    { name: 'phone', label: 'Số điện thoại', type: 'tel', maxLength: 30 },
    { name: 'email', label: 'Email đăng nhập', type: 'email', maxLength: 254, placeholder: 'name@diichi.edu.vn', required: creating },
  ]

  return fields.map((field) => (
    <label key={field.name} className="block text-sm font-semibold text-slate-700">
      {field.label}{field.required ? ' *' : ''}
      <input
        type={field.type || 'text'}
        required={field.required}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        autoFocus={autoFocus && field.name === 'name'}
        className={inputClass}
        aria-invalid={Boolean(errors[field.name])}
        {...register(field.name, {
          required: field.required ? `Vui lòng nhập ${field.label.toLowerCase()}` : false,
          setValueAs: (value) => field.name === 'email'
            ? String(value ?? '').trim().toLowerCase()
            : String(value ?? '').trim(),
          ...(field.name === 'email' ? {
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không đúng định dạng' },
          } : {}),
        })}
      />
      {errors[field.name] ? <p className="mt-1 text-xs font-semibold text-red-600">{errors[field.name].message}</p> : null}
      {creating && field.name === 'email' ? <p className="mt-1 text-xs font-normal text-slate-500">Tự động tạo tài khoản giáo viên. Mật khẩu ban đầu: 123456.</p> : null}
    </label>
  ))
}
