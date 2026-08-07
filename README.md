# Di-Ichi | Cổng Quản Trị Trung Tâm

Dự án frontend cho hệ thống quản trị trung tâm Anh ngữ theo hướng doanh nghiệp.

## Công Nghệ

- React 19
- Vite
- JavaScript JSX
- Tailwind CSS
- React Router DOM
- Axios
- React Hook Form
- Lucide React
- Sonner
- Day.js
- Framer Motion
- TanStack React Table
- Recharts
- FullCalendar
- React QR Code
- html5-qrcode
- xlsx
- jsPDF
- jsPDF AutoTable

## Kết Nối API

Sao chép `.env.example` thành `.env.local`, sau đó cấu hình `VITE_API_BASE_URL`
và `VITE_API_PROXY_TARGET`. Mặc định frontend gọi `/api` và Vite chuyển tiếp
request đến `http://localhost:3004` trong môi trường phát triển.

Đăng nhập và các màn học viên, phụ huynh, nhân sự, lớp học, lịch học, tài chính
gọi API theo Swagger của backend. Dashboard tổng hợp vẫn dùng dữ liệu cục bộ do
backend chưa có endpoint tương ứng. Dữ liệu trong `src/datas` được giữ để render
trạng thái ban đầu và những phần API chưa định nghĩa.

## Quy Ước Tổ Chức Component

Mỗi page đặt trong `src/pages`. Nếu page có nhiều thành phần nhỏ, tạo thư mục theo tên page trong `src/components` và đặt các component con tại đó.

Ví dụ:

- Page: `src/pages/dashboard/DashboardPage.jsx`
- Component con: `src/components/dashboard/DashboardStats.jsx`
- Component con: `src/components/dashboard/EnrollmentTrend.jsx`
- Component con: `src/components/dashboard/TodayTasks.jsx`

## Lệnh Chạy

```bash
npm run dev
npm run build
npm run lint
```
