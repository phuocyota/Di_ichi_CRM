# API cho màn Học viên

Phạm vi: source BE `di-ichi-crm-services`, màn FE `/students`. Đây là đối chiếu source và phần API mới, chưa phải xác nhận bản production đã được triển khai.

## API đã có

| Chức năng | Endpoint | Lọc chính / lưu ý |
|---|---|---|
| Tổng quan học viên | `GET /student/summary` | Trả statistics/charts; không có completedStudents vì enum học viên không có completed |
| Danh sách, tìm kiếm, phân trang | `GET /student` | `page`, `size`, `search`, `branchId`, `status` và các trường DTO hỗ trợ |
| Thêm/sửa/xóa/chi tiết | `POST /student`, `PATCH/DELETE/GET /student/:id` | Sale được gán qua assignedSaleUserId riêng với người tạo |
| Chọn/gán Sale | `GET /student/sale-options`, `PATCH /student/:id/sale` | Đã bổ sung ở lượt trước; ADMIN |
| Phụ huynh | `/student-guardian` CRUD | `studentId` |
| Ghi danh lớp | `/enrollment` CRUD | `studentId`, `classId`, `isCurrent` |
| Giáo viên của lớp | `GET /class-staff` | `classId`; tên giáo viên từ staff |
| Điểm danh | `/attendance-record` CRUD | `studentId`, `scheduleId`; bản ghi hiện chỉ có checkedInAt, không tự suy ra vắng/muộn |
| Điểm số | `/score` CRUD | `studentId`, `classId` |
| Bài tập của lớp | `/homework` CRUD | `classId` |
| Tình trạng bài tập học viên | `/homework-submission` CRUD | `studentId`, `homeworkId`; có submitted/missing/late |
| Khoản phải thu | `/finance-transaction` CRUD | `studentId`; có payableAmount, paidAmount, debtAmount |
| Thanh toán, lịch trả nợ | `/payment`, `/debt-schedule` CRUD | `transactionId` |
| Lịch sử trạng thái | `/student-status-history` CRUD | `studentId` |
| Nhật ký hoạt động | `/audit-log` CRUD | `entityType=student`, `entityId=<id>` |
| Chứng chỉ | `/student-certificate` CRUD | `studentId` |
| Import Excel | `POST /student/import` | multipart/form-data, field file, .xlsx, tối đa 10 MB; FE hiện chưa nối |
| Export Excel/PDF | Dùng danh sách phân trang hiện có | FE đã có xlsx/jspdf; tạo file phía FE, không cần thêm API xuất trùng dữ liệu |

Các API CRUD riêng vẫn giữ nguyên quyền của từng module.

## API bổ sung

Các endpoint dưới đây yêu cầu ADMIN. Hồ sơ dùng `student.read`; thao tác dùng `student.update`. Dịch vụ cũng kiểm tra vai trò để không vô tình bỏ qua khi gọi nội bộ.

### Hồ sơ theo tab

`GET /student/:id/profile?section=overview&page=1&size=20`

section gồm:

- `overview`: student, sale (null nếu chưa được gán), guardians, enrollments kèm class/course, classStaff của các lớp trên trang ghi danh hiện tại.
- `attendance`: bản ghi điểm danh kèm buổi học/lớp/giáo viên.
- `scores`: điểm kèm lớp/giáo viên.
- `homework`: submissions kèm bài tập/lớp. Đây là các bản ghi tình trạng bài tập đang lưu, không tự tạo trạng thái cho bài tập chưa có submission. Để tải bài tập của lớp, dùng GET /homework?classId=... đã có.
- `tuition`: transactions, payments, debtSchedules của đúng học viên.
- `history`: statusHistory và activities (audit log).
- `certificates`: chứng chỉ kèm khóa học và file.

Mỗi tập phân trang có `{ items, total, page, size }`; size tối đa 100. Nhiều tập trong cùng section sử dụng cùng page/size, có total độc lập. classStaff là thông tin bổ sung cho các lớp trong trang ghi danh, không phải tập phân trang riêng.

Thiếu bản ghi trả mảng rỗng; học viên không tồn tại hoặc đã xóa trả 404. Không trả tài khoản Sale đầy đủ hay mật khẩu.

### Chuyển lớp

`POST /student/:id/transfer-class`

```json
{
  "enrollmentId": "<ghi danh nguồn>",
  "targetClassId": "<lớp đích>",
  "effectiveDate": "2026-10-28",
  "reason": "Điều chỉnh lịch học"
}
```

- Chỉ học viên active, ghi danh nguồn active/isCurrent và thuộc đúng học viên.
- Lớp đích khác lớp cũ, cùng khóa học và xác định được cùng cơ sở qua phòng/nhân sự/lịch học; lớp chưa xác định cơ sở hoặc có nhiều cơ sở khác nhau bị từ chối.
- Lớp active/upcoming, chưa qua ngày kết thúc, còn sĩ số và học viên chưa có ghi danh hiện tại tại đó.
- Khóa bản ghi học viên/ghi danh/lớp đích trong transaction. Kết thúc ghi danh cũ với status transferred và tạo ghi danh mới. Giữ lại lịch sử nguồn và hạn riêng nếu đã được gia hạn.
- Không tự chuyển học phí/chứng từ cũ sang lớp mới.

### Bảo lưu / nghỉ học

`POST /student/:id/reserve` hoặc `POST /student/:id/stop`

```json
{ "effectiveDate": "2026-10-28", "reason": "Lý do thực hiện" }
```

- Bảo lưu: active -> reserved; các ghi danh hiện tại chuyển reserved, vẫn isCurrent (giữ chỗ).
- Nghỉ học: active/reserved -> stopped; các ghi danh hiện tại kết thúc, isCurrent=false và endedAt=effectiveDate.
- Cập nhật học viên, ghi danh, lịch sử trạng thái và audit log cùng transaction.
- Ngày không ở tương lai, không trước ngày ghi danh hoặc lần đổi trạng thái gần nhất. API áp dụng ngay, không lập lịch thay đổi tự động.
- Chưa có luồng tự động học lại sau bảo lưu; không tự hoàn phí hoặc tính lại học phí.

### Gia hạn ghi danh

`POST /student/:id/extend-enrollment`

```json
{
  "enrollmentId": "<ghi danh hiện tại>",
  "expiresAt": "2027-03-31",
  "reason": "Gia hạn thời gian học"
}
```

Học viên active/reserved, ghi danh hiện tại thuộc đúng học viên. Hạn mới phải sau hạn hiện tại (mặc định dùng ngày kết thúc lớp nếu chưa có hạn riêng) và sau hôm nay.

Lưu enrollment.expiresAt và audit cùng transaction; không đổi class.endDate, không thêm buổi học hoặc tự phát sinh học phí. endedAt vẫn chỉ là ngày kết thúc thực tế của lượt ghi danh.

## Sửa hợp đồng phân trang

PaginationRequestDto dùng Type(() => Number), IsInt và size tối đa 100. Query page/size từ URL được chuyển đúng sang số; FE không cần bỏ phân trang như workaround trước đây. Cần giữ metadata page/size/total khi đọc response, không chỉ lấy mảng data.

## Triển khai

Migration mới: `src/database/migrations/1793232000000-AddEnrollmentExpiry.ts`, thêm cột enrollment.expires_at. Chạy các migration còn thiếu trước khi khởi động BE mới; migration Sale ở lượt trước vẫn cần thực hiện nếu chưa chạy.

Chưa chạy migration, không sửa DB thật và chưa deploy trong phiên này.

## FE đã nối và phần còn lại

Đã xóa dữ liệu mẫu ở màn Học viên, tải đủ các trang API cho danh sách/bộ lọc và tải hồ sơ theo studentId/section. Có trạng thái tải, trống, báo lỗi và thử lại; không dùng dữ liệu mẫu khi API lỗi. Thẻ completedStudents được thay bằng trialStudents (Học thử), điểm danh chỉ hiển thị dữ liệu thực tế đã lưu.

Phần còn lại:

1. Triển khai BE có các endpoint mới và migration trước khi triển khai FE mới.
2. Nối Import vào endpoint đã có, hiển thị kết quả tạo/bỏ qua/lỗi.
3. Nối các modal nghiệp vụ vào endpoint mới; thêm enrollmentId và ngày có hiệu lực/hạn gia hạn đúng DTO.
4. Nối export bằng xlsx/jspdf từ tập dữ liệu API cần xuất.
