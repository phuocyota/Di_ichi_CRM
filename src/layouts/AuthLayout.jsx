import { Outlet } from 'react-router-dom'
import BrandLogo from '../components/common/BrandLogo.jsx'
import loginBackground from '../assets/images/backgroud_login.png'

function AuthLayout() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[1fr_440px]">
        <section className="relative hidden flex-col justify-center px-10 py-12 lg:flex">
          <div className="max-w-xl">
            <div className="mb-16 rounded-md border border-red-100 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
              <BrandLogo />
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.24em] text-brand-700 drop-shadow-sm">
                Cổng quản trị trung tâm Anh ngữ
              </p>
            </div>
            <div className="rounded-md border border-red-100 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
              <h1 className="text-5xl font-black leading-tight text-slate-950 drop-shadow-[0_3px_0_rgba(255,255,255,0.85)]">
                Quản lý tuyển sinh, lớp học, tài chính và dịch vụ học viên trên hệ thống.
              </h1>
              <p className="mt-4 text-base font-semibold leading-7 text-slate-700">
                Theo dõi vận hành Di-Ichi rõ ràng, nhanh chóng và nhất quán trên mọi thiết bị.
              </p>
            </div>
          </div>
          <p className="absolute bottom-12 rounded-full border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-enterprise">
            Không gian quản trị v1.0
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10">
          <Outlet />
        </section>
      </div>
    </main>
  )
}

export default AuthLayout
