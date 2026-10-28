# Dashboard CRM theo Sale

## API

`GET /dashboard/crm?page=1&size=20&saleUserId=<user-id>&branchId=<branch-id>`

- Quyền: `student.read`.
- `saleUserId`, `branchId` không bắt buộc. `size` tối đa 100.
- Sale (tài khoản không phải ADMIN) luôn được giới hạn bằng `student.created_by = JWT.userId`; chọn Sale khác trả 403.
- ADMIN xem tổng hoặc chọn Sale. Sale được nhận diện bằng **user ID**, không phải staff ID.
- Quan hệ hiện có: `student.created_by -> user.id -> user.staff_id -> staff.id`.
- Source hiện chưa có trường chuyển giao Sale riêng. Quy tắc này bám theo module `potential-candidates`, không suy ra từ lịch hẹn hoặc `updatedBy`.
- Chỉ tính hồ sơ `student.status = trial`, chưa xóa và có liên kết tài khoản/nhân sự hợp lệ. Hồ sơ mất liên kết cần xử lý dữ liệu riêng, không tự gán Sale.

## Response

- `summary.totalLeads`: tổng ứng viên tiềm năng hiện thuộc phạm vi được xem.
- `summary.newLeadsToday`, `newLeadsThisWeek`: ứng viên trong tập trên, tính theo ngày tạo; tuần bắt đầu thứ Hai.
- `leadChartPeriods`: 7 ngày, 4 tuần, 6 tháng đến hiện tại, bổ sung các mốc không có phát sinh bằng 0.
- `leadStatusData`: số lượng và phần trăm từ `candidateStatus` trong JSON note. Note trống/hỏng hoặc thiếu trạng thái được báo `Chưa cập nhật trạng thái`, không tự tạo trạng thái nghiệp vụ.
- `sales`: các Sale có ứng viên trong phạm vi đang chọn, kèm tổng ứng viên.
- `leads`: danh sách phân trang, mới nhất trước; mỗi ứng viên có `sale.userId`, `sale.staffId`, `sale.name`.
- `scope.ownership = createdBy` mô tả quy tắc sở hữu đang dùng.
- Toàn bộ thống kê dùng múi giờ `Asia/Bangkok`, không phụ thuộc múi giờ trình duyệt. Các số tổng không bị ảnh hưởng bởi phân trang.

Các biểu đồ đếm ngày tạo của **ứng viên hiện còn trong tập Lead**; đây chưa phải báo cáo lịch sử toàn bộ Lead đã chuyển thành học viên.

## Frontend

Dashboard gọi API CRM mới thay cho `/dashboard/admin`. Có bộ lọc Sale, danh sách ứng viên chỉ đọc và phân trang. Bỏ chỉ số “Lead chưa phân Sale”, không dùng lại dữ liệu mẫu.

Các tab Khách hàng và Lịch chăm sóc vẫn báo chưa có dữ liệu; API CRM mới này chưa tổng hợp hai nghiệp vụ đó. Không đổi số học viên thành số khách hàng, không đổi lịch hẹn thành lịch chăm sóc.

## Kiểm tra

- FE: `npm run build`, `npm run lint`.
- BE: `tsc --project tsconfig.build.json --noEmit --incremental false`.
- BE: Jest `crm-dashboard.service.spec` và `dashboard.service.spec`.
- Chưa chạy migration, sửa dữ liệu DB hoặc triển khai production; chưa kiểm tra API với DB/phiên đăng nhập thực tế.
