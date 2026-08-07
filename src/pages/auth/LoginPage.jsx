import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import BrandLogo from '../../components/common/BrandLogo.jsx'
import { signIn } from '../../services/authService.js'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      await signIn(values)
      toast.success('Đăng nhập thành công')
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="w-full max-w-md rounded-md border border-red-100 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.2)] backdrop-blur-md">
      <div className="mb-8">
        <BrandLogo compact />
        <h1 className="mt-5 text-3xl font-black text-slate-950">Đăng nhập</h1>
        <p className="mt-2 text-sm font-semibold text-slate-600">Truy cập không gian quản trị Di-Ichi.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Email</span>
          <span className="mt-2 flex h-12 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-blue-100">
            <Mail size={18} className="text-brand-600" aria-hidden="true" />
            <input
              className="w-full font-medium text-slate-900 outline-none"
              type="email"
              autoComplete="email"
              {...register('email', { required: 'Vui lòng nhập email' })}
            />
          </span>
          {errors.email ? <span className="mt-1 block text-sm text-red-600">{errors.email.message}</span> : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-800">Mật khẩu</span>
          <span className="mt-2 flex h-12 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-blue-100">
            <LockKeyhole size={18} className="text-brand-600" aria-hidden="true" />
            <input
              className="w-full font-medium text-slate-900 outline-none"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
            />
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-brand-700"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </span>
          {errors.password ? (
            <span className="mt-1 block text-sm text-red-600">{errors.password.message}</span>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-md bg-[linear-gradient(135deg,#1d4ed8_0%,#2563eb_52%,#ef4444_100%)] text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
