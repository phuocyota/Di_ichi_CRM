# Dashboard CRM và Sale phụ trách

## Quy tắc

- `student.createdBy` chỉ lưu người tạo, không dùng để suy ra Sale phụ trách.
- `student.assignedSaleUserId` là User ID của Sale phụ trách. Có thể null.
- Admin tạo hồ sơ mà không chọn Sale: chưa có Sale. Có thể gán/chuyển/bỏ gán sau.
- Sale tạo hồ sơ: tự gán cho chính Sale đó. Sale không được tự chuyển/bỏ gán.
- Khi chọn Sale, tài khoản phải ACTIVE, nhân sự KINH_DOANH đang hoạt động, chưa xóa và cùng cơ sở với hồ sơ.
- Tạo/cập nhật học viên qua API chung và tạo/cập nhật ứng viên đều dùng cùng kiểm tra Sale. Không thay đổi người tạo khi chuyển Sale.

## API gán Sale

`PATCH /student/:id/sale` — ADMIN, quyền `student.update`.

```json
{ "saleUserId": "<uuid tài khoản Sale>" }
```

Gửi `{ "saleUserId": null }` để bỏ gán. Thiếu trường, sai UUID hoặc Sale không hợp lệ sẽ bị từ chối. Response là hồ sơ học viên có `assignedSaleUserId`.

`GET /student/sale-options?branchId=<uuid>` — ADMIN, quyền `student.read`. Trả mảng `{ userId, staffId, name, branchId }` để chọn Sale cùng cơ sở.

`POST /student`, `PATCH /student/:id`, `POST /potential-candidates`, `PATCH /potential-candidates/:id` nhận thêm `assignedSaleUserId` (UUID hoặc null). Chỉ admin được thay đổi Sale của hồ sơ hiện có.

## Dashboard

`GET /dashboard/crm?page=1&size=20&saleUserId=<uuid>&branchId=<uuid>` — quyền `student.read`, size tối đa 100.

- ADMIN xem tất cả, gồm hồ sơ chưa có Sale; hoặc lọc theo Sale.
- Sale chỉ xem hồ sơ được gán bằng `assignedSaleUserId = JWT.userId`. Chọn Sale khác trả 403.
- Danh sách/summary/dropdown ứng viên và số liệu Lead trong `/dashboard/overview` cũng theo Sale được gán, thay cho người tạo.
- Chỉ tính hồ sơ `status = trial`, chưa xóa. Biểu đồ là ngày tạo của tập ứng viên hiện tại, chưa phải toàn bộ lịch sử Lead đã chuyển đổi.
- `summary`: totalLeads, leadsWithoutSale, newLeadsToday, newLeadsThisWeek.
- `leadChartPeriods`: 7 ngày, 4 tuần bắt đầu thứ Hai, 6 tháng; múi giờ Asia/Bangkok.
- `leadStatusData`: số lượng/phần trăm theo candidateStatus trong JSON note; không có trạng thái thì hiện Chưa cập nhật trạng thái.
- `leads`: danh sách phân trang; `sale` có userId/staffId/name hoặc null.
- `sales`: các Sale có Lead trong phạm vi đang xem; không coi admin tạo hồ sơ là Sale.
- `scope.ownership = assignedSaleUserId`.

## Giao diện

Form tạo/sửa học viên cho admin chọn Sale theo cơ sở, có lựa chọn Chưa có Sale. Đổi cơ sở sẽ bỏ lựa chọn Sale cũ; tải lỗi có nút thử lại. Sửa thông tin khác giữ nguyên Sale nếu không đổi lựa chọn.

Dashboard gọi API CRM, hiện Chưa có Sale cho hồ sơ chưa được gán. Các tab Khách hàng và Lịch chăm sóc vẫn chưa được tổng hợp trong API này.

## Migration và triển khai

File BE: `src/database/migrations/1793145600000-AddStudentAssignedSale.ts`.

1. Chạy migration trước khi khởi động bản BE mới (repo đang bật synchronize khi khởi động ứng dụng).
2. Migration thêm cột/FK/index và backfill hồ sơ cũ từ người tạo chỉ khi người tạo là nhân sự KINH_DOANH, cùng cơ sở, chưa xóa. Không backfill admin thành Sale. Không ghi đè Sale đã có.
3. Triển khai BE rồi FE; xác minh gán Sale, đọc lại hồ sơ và phạm vi thấy Lead của tài khoản Sale được chọn.

Chưa chạy migration, sửa DB hay triển khai production trong phiên này. Schema tự đồng bộ chỉ thêm cột, không thay thế bước backfill của migration.
