import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import AuthLayout from '../layouts/AuthLayout.jsx'
import MainLayout from '../layouts/MainLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage.jsx'))
const ClassPage = lazy(() => import('../pages/Classes/ClassPage.jsx'))
const FinancePage = lazy(() => import('../pages/Finance/FinancePage.jsx'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'))
const PlaceholderPage = lazy(() => import('../pages/PlaceholderPage.jsx'))
const SchedulePage = lazy(() => import('../pages/Schedule/SchedulePage.jsx'))
const StaffPage = lazy(() => import('../pages/Staff/StaffPage.jsx'))
const StudentPage = lazy(() => import('../pages/Students/StudentPage.jsx'))

function RouteFallback() {
  return (
    <div className="flex min-h-64 items-center justify-center text-sm font-medium text-ink-500">
      Đang tải không gian làm việc...
    </div>
  )
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/students" element={<StudentPage />} />
              <Route path="/classes" element={<ClassPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/reports" element={<PlaceholderPage title="Báo cáo" />} />
              <Route path="/settings" element={<PlaceholderPage title="Cài đặt" />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
