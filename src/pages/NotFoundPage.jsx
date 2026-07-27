import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-5">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink-900">Không tìm thấy trang</h1>
        <p className="mt-3 text-sm leading-6 text-ink-500">
          Trang bạn đang tìm không tồn tại hoặc chưa được kích hoạt.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex h-11 items-center rounded bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Quay về tổng quan
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
