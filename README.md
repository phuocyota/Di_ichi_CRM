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

## Quy Ước Dữ Liệu Mẫu

Dự án hiện chưa sử dụng API. Toàn bộ dữ liệu mẫu đặt trong `src/datas`.

Các file dữ liệu hiện có:

- `src/datas/adminUsers.js`
- `src/datas/dashboard.js`
- `src/datas/navigation.js`

`src/services` chỉ chứa hàm xử lý nội bộ đọc dữ liệu từ `src/datas`, chưa tạo Axios client và chưa gọi endpoint bên ngoài.

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
