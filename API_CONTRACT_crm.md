# Di-Ichi CRM — API Contract cho Frontend

> Phiên bản: `1.0-draft`  
> Base URL đề xuất: `/api/v1`  
> Nguồn đối chiếu: toàn bộ màn hình, form và mock data trong `src/`  
> Trạng thái: contract để FE/BE thống nhất trước khi triển khai backend

## 1. Phạm vi và nguyên tắc

Source hiện tại là React frontend dùng mock data, chưa có backend và chưa gọi API thật. Contract này chuyển các nhu cầu đang xuất hiện trên UI thành REST API thống nhất cho các module:

- Xác thực và tài khoản hiện tại
- Dashboard tổng quan
- Học viên
- Nhân sự
- Lớp học
- Lịch học, điểm danh và homework
- Tài chính, phiếu thu, công nợ và ưu đãi
- Dữ liệu danh mục dùng cho select/filter
- Export, import, in và gửi thông báo

`/reports`, `/settings`, ô tìm kiếm toàn cục và danh sách thông báo trên top bar mới chỉ là placeholder/dead UI, vì vậy chưa đủ yêu cầu nghiệp vụ để chốt API chi tiết. Contract chỉ dành endpoint tối thiểu cho global search và notifications để FE không bị khóa kiến trúc.

### 1.1 Quy ước bắt buộc

- Content type JSON: `application/json; charset=utf-8`.
- Upload/import: `multipart/form-data`.
- Download/export: response file trực tiếp, có `Content-Disposition: attachment`.
- Auth: `Authorization: Bearer <accessToken>` cho mọi endpoint trừ login/refresh.
- ID trong request phải dùng ID ổn định (`studentId`, `classId`, `teacherId`...), không gửi tên hiển thị để định danh.
- Ngày: `YYYY-MM-DD`.
- Ngày giờ: ISO 8601 có timezone, ví dụ `2026-08-03T18:00:00+07:00`.
- Tiền: integer VND, không trả chuỗi `6.500.000đ`, `38.5M`, `2,06 tỷ`.
- Tỷ lệ: number, ví dụ `94.5`, không trả chuỗi `94%`.
- Điểm: number khi có thể; trạng thái chưa có điểm dùng `null`.
- Enum/API field dùng tiếng Anh ổn định; label tiếng Việt lấy từ metadata hoặc FE map.
- `null` dùng cho giá trị chưa có; không dùng `"-"`, `"Chưa chấm"`, `"0đ"` thay cho dữ liệu.
- DELETE/transition nghiệp vụ phải kiểm tra ràng buộc và trả `409` nếu không thể thực hiện.

## 2. Response chuẩn

### 2.1 Thành công — một object

```json
{
  "data": {
    "id": "HV001248"
  },
  "meta": {
    "requestId": "req_01J..."
  }
}
```

### 2.2 Thành công — danh sách phân trang

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1248,
    "totalPages": 63,
    "requestId": "req_01J..."
  }
}
```

Query phân trang/sort chung:

| Param | Type | Mặc định | Ghi chú |
|---|---:|---:|---|
| `page` | integer | `1` | Min 1 |
| `pageSize` | integer | `20` | Min 1, max 100 |
| `sort` | string | tùy endpoint | Ví dụ `-enrollmentDate,name`; dấu `-` là giảm dần |
| `q` | string | rỗng | Tìm không phân biệt hoa thường/trim khoảng trắng |

### 2.3 Lỗi

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "fields": {
      "phone": ["Số điện thoại không hợp lệ"]
    },
    "requestId": "req_01J..."
  }
}
```

| HTTP | `error.code` điển hình | Ý nghĩa |
|---:|---|---|
| 400 | `BAD_REQUEST` | Request sai cú pháp/ngữ nghĩa |
| 401 | `UNAUTHENTICATED`, `TOKEN_EXPIRED` | Chưa đăng nhập/token hết hạn |
| 403 | `FORBIDDEN` | Không có quyền |
| 404 | `RESOURCE_NOT_FOUND` | Không tìm thấy resource |
| 409 | `DUPLICATE_CODE`, `SCHEDULE_CONFLICT`, `RESOURCE_IN_USE`, `INVALID_STATE_TRANSITION` | Xung đột nghiệp vụ |
| 422 | `VALIDATION_ERROR` | Sai validation field |
| 429 | `RATE_LIMITED` | Quá giới hạn request |
| 500 | `INTERNAL_ERROR` | Lỗi máy chủ |

## 3. Auth

### 3.1 Endpoint

| Method | Path | Mục đích |
|---|---|---|
| POST | `/auth/login` | Đăng nhập bằng email/mật khẩu |
| POST | `/auth/refresh` | Đổi refresh token lấy access token mới |
| POST | `/auth/logout` | Thu hồi phiên hiện tại |
| GET | `/auth/me` | Lấy user đang đăng nhập |

### `POST /auth/login`

Request:

```json
{
  "email": "admin@englishcenter.local",
  "password": "admin123"
}
```

Response `200`:

```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600,
    "user": {
      "id": "admin-001",
      "name": "Quản trị viên",
      "email": "admin@englishcenter.local",
      "role": "super_admin",
      "position": "Quản lý trung tâm",
      "permissions": ["*"]
    }
  }
}
```

Sai email/mật khẩu trả `401 INVALID_CREDENTIALS`; không tiết lộ email có tồn tại hay không.

## 4. Metadata/danh mục

FE hiện có nhiều select hard-code. Backend nên cung cấp metadata dùng chung để ID/value không lệch giữa các module.

| Method | Path | Trả về |
|---|---|---|
| GET | `/metadata` | Enum, branch, course, class, teacher, room và các filter option |
| GET | `/branches` | Danh sách cơ sở |
| GET | `/courses` | Danh sách khóa học |
| GET | `/rooms?branchId=` | Phòng học, sức chứa, thiết bị |
| GET | `/teachers?branchId=&status=active&q=` | Danh sách giáo viên tối giản |

Response rút gọn của `/metadata`:

```json
{
  "data": {
    "studentStatuses": [
      { "value": "active", "label": "Đang học" },
      { "value": "reserved", "label": "Bảo lưu" },
      { "value": "stopped", "label": "Nghỉ học" },
      { "value": "completed", "label": "Hoàn thành khóa" },
      { "value": "trial", "label": "Học thử" }
    ],
    "staffStatuses": ["active", "probation", "paused", "inactive"],
    "classStatuses": ["active", "upcoming", "finished", "paused"],
    "scheduleStatuses": ["active", "upcoming", "checked", "conflict", "cancelled", "makeup"],
    "paymentStatuses": ["paid", "partial", "debt", "overdue", "cancelled"],
    "paymentMethods": ["qr", "cash", "transfer", "card"],
    "attendanceStatuses": ["present", "absent", "excused", "late", "pending"]
  }
}
```

## 5. Dashboard tổng quan

| Method | Path | Query |
|---|---|---|
| GET | `/dashboard/overview` | `branchId`, `from`, `to`, `revenuePeriod=day|week|month|year` |

Response phải đủ dữ liệu cho toàn bộ `DashboardPage` trong một request:

```json
{
  "data": {
    "summary": {
      "activeStudents": 1248,
      "newStudents": 186,
      "activeClasses": 86,
      "teachers": 54,
      "monthlyRevenue": 2060000000,
      "tuitionDebt": 318000000,
      "attendanceRate": 94,
      "unmarkedHomework": 128,
      "todayClasses": 18,
      "conversionRate": 34
    },
    "revenueSeries": [{ "label": "T2", "revenue": 168000000 }],
    "admissionFunnel": [
      { "stage": "lead", "label": "Lead", "value": 620 },
      { "stage": "trial", "label": "Đăng ký học thử", "value": 360 },
      { "stage": "enrolled", "label": "Chuyển đổi thành học viên", "value": 186 }
    ],
    "studentDistribution": {
      "levels": [{ "name": "Starter", "value": 28 }],
      "ages": [{ "name": "6-10 tuổi", "value": 32 }],
      "branches": [{ "id": "BR001", "name": "Cơ sở 1", "value": 42 }]
    },
    "classStatus": [{ "status": "upcoming", "value": 12 }],
    "todayWidgets": [{ "type": "student_birthday", "value": 7, "note": "Gửi lời chúc và ưu đãi chăm sóc" }]
  }
}
```

## 6. Học viên

### 6.1 Endpoint

| Method | Path | Mục đích |
|---|---|---|
| GET | `/students/summary` | KPI + chart dashboard học viên |
| GET | `/students` | Danh sách/filter/sort/phân trang |
| POST | `/students` | Tạo học viên |
| GET | `/students/{studentId}` | Hồ sơ và thông tin tổng quát |
| PATCH | `/students/{studentId}` | Cập nhật một phần hồ sơ |
| DELETE | `/students/{studentId}` | Xóa mềm hồ sơ |
| POST | `/students/import` | Import Excel/CSV |
| GET | `/students/export?format=xlsx|pdf|csv` | Export theo filter hiện tại |
| GET | `/students/{studentId}/card` | File thẻ học viên |
| GET | `/students/{studentId}/profile-print` | File hồ sơ để in |
| POST | `/students/{studentId}/transfer-class` | Chuyển lớp |
| POST | `/students/{studentId}/reserve` | Bảo lưu |
| POST | `/students/{studentId}/unreserve` | Hủy bảo lưu |
| POST | `/students/{studentId}/stop` | Nghỉ học |
| POST | `/students/{studentId}/extend-course` | Gia hạn khóa |
| PATCH | `/students/{studentId}/status` | Chuyển trạng thái khác |
| POST | `/students/{studentId}/messages` | Gửi notification/email/SMS |
| GET | `/students/{studentId}/attendance` | Lịch sử điểm danh |
| GET | `/students/{studentId}/scores` | Điểm số |
| GET | `/students/{studentId}/homework` | Homework |
| GET | `/students/{studentId}/tuition` | Học phí |
| GET | `/students/{studentId}/history` | Audit history |
| GET | `/students/{studentId}/certificates` | Chứng chỉ |

Query `/students`:

`q`, `courseId`, `classId`, `teacherId`, `branchId`, `status`, `enrollmentFrom`, `enrollmentTo`, `page`, `pageSize`, `sort`.

`q` tìm theo tối thiểu: mã, họ tên, số điện thoại, email, phụ huynh, SĐT phụ huynh.

### 6.2 Student schema

```json
{
  "id": "HV001248",
  "code": "HV001248",
  "name": "Nguyễn Minh Anh",
  "avatarUrl": null,
  "avatarText": "MA",
  "gender": "female",
  "birthDate": "2012-05-14",
  "phone": "0901248111",
  "email": "minhanh@example.com",
  "parent": {
    "name": "Nguyễn Thị Lan",
    "phone": "0901555248"
  },
  "course": { "id": "COURSE001", "name": "IELTS Foundation" },
  "class": { "id": "CLS001", "code": "CLS001", "name": "IELTS Foundation A12" },
  "teacher": { "id": "STF001", "name": "Nguyễn Hoàng Long" },
  "branch": { "id": "BR001", "name": "Cơ sở 1" },
  "status": "active",
  "enrollmentDate": "2026-07-27",
  "attendanceRate": 96,
  "averageScore": 8.1,
  "unmarkedHomeworkCount": 2,
  "tuitionStatus": "paid",
  "certificateStatus": "not_issued",
  "createdAt": "2026-07-27T09:00:00+07:00",
  "updatedAt": "2026-08-03T10:30:00+07:00"
}
```

### `POST /students`

```json
{
  "code": null,
  "name": "Nguyễn Minh Anh",
  "gender": "female",
  "birthDate": "2012-05-14",
  "phone": "0901248111",
  "email": "minhanh@example.com",
  "parent": { "name": "Nguyễn Thị Lan", "phone": "0901555248" },
  "courseId": "COURSE001",
  "classId": "CLS001",
  "teacherId": "STF001",
  "branchId": "BR001",
  "status": "active",
  "enrollmentDate": "2026-07-27",
  "note": null
}
```

Required theo UI: `name`, `phone`, `courseId`, `classId`, `status`, `enrollmentDate`. `code=null` để server tự sinh. Khi `classId` đã xác định thì BE phải suy ra/validate `courseId`, `teacherId`, `branchId` thay vì cho phép dữ liệu lệch.

### Nghiệp vụ trạng thái

```json
// POST /students/{id}/transfer-class
{ "targetClassId": "CLS002", "reason": "Chuyển lịch học phù hợp hơn" }

// POST /students/{id}/reserve
{ "fromDate": "2026-08-10", "toDate": "2026-09-10", "reason": "Lý do bảo lưu" }

// POST /students/{id}/extend-course
{ "courseId": "COURSE001", "classId": "CLS006", "newEndDate": "2026-12-15", "reason": null }

// PATCH /students/{id}/status
{ "status": "completed", "reason": "Đủ điều kiện hoàn thành" }
```

### Dữ liệu các tab hồ sơ

- Attendance item: `id`, `title`, `date`, `lesson`, `class{id,name}`, `teacher{id,name}`, `status`, `checkIn`, `note`.
- Score item: `id`, `title`, `date`, `subject`, `score`, `maxScore`, `rank`, `teacher{id,name}`, `note`.
- Homework item: `id`, `title`, `deadline`, `status=submitted|missing|late`, `submittedAt`, `score`, `maxScore`, `note`.
- Tuition item: `id`, `title`, `dueDate`, `amount`, `paidAmount`, `status`, `method`, `note`.
- History item: `id`, `action`, `createdAt`, `actor{id,name,type}`, `category`, `note`.
- Certificate item: `id`, `title`, `issuedAt`, `expectedAt`, `status`, `issuer`, `score`, `note`, `fileUrl`.

### Import response

`POST /students/import` nhận field file `file`. Response `200`:

```json
{
  "data": {
    "jobId": "IMP001",
    "totalRows": 100,
    "successRows": 96,
    "failedRows": 4,
    "errors": [
      { "row": 7, "field": "phone", "message": "Số điện thoại không hợp lệ" }
    ],
    "errorFileUrl": "/api/v1/import-jobs/IMP001/errors"
  }
}
```

## 7. Nhân sự

### 7.1 Endpoint

| Method | Path | Mục đích |
|---|---|---|
| GET | `/staff/summary` | KPI và chart nhân sự |
| GET | `/staff` | Danh sách nhân sự |
| POST | `/staff` | Tạo nhân sự |
| GET | `/staff/{staffId}` | Hồ sơ chi tiết |
| PATCH | `/staff/{staffId}` | Cập nhật hồ sơ |
| DELETE | `/staff/{staffId}` | Xóa mềm |
| POST | `/staff/import` | Import Excel/CSV |
| GET | `/staff/export?format=xlsx|pdf` | Export theo filter |
| GET | `/staff/{staffId}/profile-print` | File hồ sơ in |
| POST | `/staff/{staffId}/assign-classes` | Phân công lớp |
| POST | `/staff/{staffId}/transfer-department` | Chuyển bộ phận |
| PATCH | `/staff/{staffId}/specialty` | Cập nhật chuyên môn |
| GET/POST | `/staff/{staffId}/certificates` | Danh sách/thêm chứng chỉ |
| GET | `/staff/{staffId}/classes` | Lớp phụ trách |
| GET | `/staff/{staffId}/schedules` | Lịch giảng dạy |
| GET | `/staff/{staffId}/attendance` | Chấm công |
| GET | `/staff/{staffId}/kpis` | KPI giáo viên |
| GET | `/staff/{staffId}/account` | Tài khoản của nhân sự |
| POST | `/staff/{staffId}/account/reset-password` | Reset mật khẩu |
| POST | `/staff/{staffId}/account/lock` | Khóa tài khoản |
| POST | `/staff/{staffId}/account/unlock` | Mở khóa tài khoản |
| POST | `/staff/{staffId}/messages` | Email/notification |

Query `/staff`:

`q`, `group=all|teacher|staff|account`, `type`, `positionId`, `departmentId`, `specialtyId`, `status`, `startDateFrom`, `startDateTo`, pagination/sort chung.

### 7.2 Staff schema

```json
{
  "id": "STF001",
  "code": "NS001",
  "name": "Nguyễn Hoàng Long",
  "avatarUrl": null,
  "avatarText": "NL",
  "type": "teacher",
  "position": { "id": "POS001", "name": "Giáo viên IELTS Senior" },
  "specialty": { "id": "SPEC001", "name": "IELTS" },
  "department": { "id": "DEP001", "name": "Đào tạo" },
  "phone": "0901222334",
  "email": "long.nguyen@diichi.edu.vn",
  "status": "active",
  "startDate": "2024-03-12",
  "birthDate": "1991-05-22",
  "gender": "male",
  "citizenId": "079091000123",
  "address": "Quận 7, TP. Hồ Chí Minh",
  "major": "Ngôn ngữ Anh",
  "degree": "Thạc sĩ TESOL",
  "experienceYears": 9,
  "languages": ["Tiếng Anh C2", "Tiếng Nhật N4"],
  "skills": ["IELTS Writing", "Academic Coaching", "Curriculum Design"]
}
```

Tạo/cập nhật dùng các field tương ứng, nhưng gửi `positionId`, `specialtyId`, `departmentId`. Required theo UI: `name`, `type`, `positionId`, `departmentId`.

Payload nghiệp vụ:

```json
// POST /staff/{id}/assign-classes
{ "classIds": ["CLS001"], "note": null }

// POST /staff/{id}/transfer-department
{ "departmentId": "DEP002", "reason": "Điều chuyển nội bộ" }

// POST /staff/{id}/certificates
{
  "title": "IELTS 8.5 Academic",
  "issuer": "British Council",
  "issuedAt": "2024-01-20",
  "expiresAt": "2026-01-20",
  "noExpiration": false,
  "fileId": null,
  "note": null
}

// POST /staff/{id}/messages
{ "channel": "email", "title": "Tiêu đề", "content": "Nội dung" }
```

KPI response gồm: `teachingHours`, `classes`, `students`, `homeworkMarked`, `testsMarked`, `averageScore`, `attendanceRate`, `studentRating`, `managerRating`.

## 8. Lớp học

### 8.1 Endpoint

| Method | Path | Mục đích |
|---|---|---|
| GET | `/classes/summary` | KPI và chart lớp |
| GET | `/classes` | Danh sách/filter |
| POST | `/classes` | Tạo lớp |
| GET | `/classes/{classId}` | Chi tiết lớp |
| PATCH | `/classes/{classId}` | Cập nhật lớp |
| DELETE | `/classes/{classId}` | Xóa mềm |
| POST | `/classes/{classId}/merge` | Ghép sang lớp đích |
| POST | `/classes/{classId}/students/transfer` | Chuyển nhiều học viên |
| PATCH | `/classes/{classId}/teacher` | Phân công/đổi giáo viên |
| PATCH | `/classes/{classId}/room` | Đổi phòng |
| POST | `/classes/{classId}/students` | Thêm học viên vào lớp |
| POST | `/classes/{classId}/start` | Khai giảng |
| POST | `/classes/{classId}/finish` | Kết thúc lớp |
| GET | `/classes/export?format=xlsx|pdf` | Export theo filter |
| GET | `/classes/{classId}/student-list-print` | File danh sách lớp |
| GET | `/classes/{classId}/students` | Danh sách học viên |
| GET | `/classes/{classId}/schedules` | Lịch học |
| GET/PUT | `/classes/{classId}/attendance/{sessionId}` | Xem/chốt điểm danh |
| GET | `/classes/{classId}/homework` | Homework của lớp |
| GET | `/classes/{classId}/scores` | Bảng điểm |
| GET/POST | `/classes/{classId}/notifications` | Lịch sử/gửi thông báo |
| GET | `/classes/{classId}/documents` | Tài liệu nhóm theo buổi |
| POST | `/classes/{classId}/documents` | Upload/link tài liệu |

Query `/classes`: `q`, `courseId`, `teacherId`, `roomId`, `branchId`, `status`, `startFrom`, `startTo`, pagination/sort.

### 8.2 Class schema và payload

```json
{
  "id": "CLS001",
  "code": "CLS001",
  "name": "IELTS Foundation A12",
  "course": { "id": "COURSE001", "name": "IELTS Foundation" },
  "teacher": { "id": "STF001", "name": "Nguyễn Hoàng Long" },
  "room": { "id": "R201", "name": "P.201" },
  "branch": { "id": "BR001", "name": "Cơ sở 1" },
  "currentSize": 18,
  "maxSize": 22,
  "schedule": {
    "daysOfWeek": [1, 3],
    "startTime": "18:00",
    "endTime": "20:00"
  },
  "startDate": "2026-08-01",
  "endDate": "2026-10-30",
  "status": "active"
}
```

`daysOfWeek`: ISO weekday `1=Thứ 2 ... 7=Chủ nhật`.

```json
// POST /classes
{
  "code": null,
  "name": "IELTS Foundation A12",
  "courseId": "COURSE001",
  "teacherId": "STF001",
  "roomId": "R201",
  "branchId": "BR001",
  "maxSize": 22,
  "schedule": { "daysOfWeek": [1, 3], "startTime": "18:00", "endTime": "20:00" },
  "startDate": "2026-08-01",
  "endDate": "2026-10-30",
  "note": null
}
```

Required theo UI: `name`, `courseId`, `teacherId`, `roomId`, `maxSize`, ít nhất một `daysOfWeek`, `startTime`, `endTime`, `startDate`. `currentSize` là field server tính, không nhận khi tạo/sửa.

```json
// POST /classes/{id}/merge
{ "targetClassId": "CLS002", "reason": "Sĩ số thấp" }

// POST /classes/{id}/students/transfer
{ "studentIds": ["HV001248"], "targetClassId": "CLS002", "reason": null }

// PATCH /classes/{id}/teacher
{ "teacherId": "STF004", "reason": "Điều phối giáo viên" }

// POST /classes/{id}/students
{ "studentIds": ["HV001247", "HV001248"], "note": null }
```

Điểm danh một buổi:

```json
// PUT /classes/{classId}/attendance/{sessionId}
{
  "students": [
    { "studentId": "HV001248", "status": "present", "checkIn": "18:02", "note": "Đúng giờ" },
    { "studentId": "HV001247", "status": "excused", "checkIn": null, "note": "Phụ huynh xin nghỉ" }
  ]
}
```

Document item: `id`, `title`, `type=docx|pdf|pptx|xlsx|other`, `fileName`, `mimeType`, `size`, `updatedAt`, `owner{id,name}`, `downloadUrl`.

## 9. Lịch học

### 9.1 Endpoint

| Method | Path | Mục đích |
|---|---|---|
| GET | `/schedules/summary` | Lớp hôm nay/đã điểm danh/sắp diễn ra/xung đột |
| GET | `/schedules` | Calendar/list theo khoảng ngày và filter |
| POST | `/schedules` | Tạo một buổi học |
| POST | `/schedules/recurring` | Tạo lịch lặp tuần |
| GET | `/schedules/{scheduleId}` | Chi tiết event |
| PATCH | `/schedules/{scheduleId}` | Sửa event |
| DELETE | `/schedules/{scheduleId}` | Xóa event |
| POST | `/schedules/{scheduleId}/duplicate` | Sao chép event |
| POST | `/schedules/{scheduleId}/cancel` | Hủy buổi học |
| POST | `/schedules/{scheduleId}/makeup` | Tạo buổi học bù |
| PATCH | `/schedules/{scheduleId}/time` | Drag/drop hoặc đổi giờ |
| PATCH | `/schedules/{scheduleId}/room` | Đổi phòng |
| PATCH | `/schedules/{scheduleId}/teacher` | Đổi giáo viên |
| POST | `/schedules/{scheduleId}/attendance/open` | Mở phiên điểm danh |
| PUT | `/schedules/{scheduleId}/attendance` | Lưu/chốt điểm danh |
| POST | `/schedules/{scheduleId}/homework` | Giao homework |
| POST | `/schedules/{scheduleId}/notifications` | Gửi thông báo lớp |
| GET | `/schedules/export?format=xlsx|pdf|csv` | Export lịch |
| GET | `/teacher-leaves` | Danh sách giáo viên nghỉ trong khoảng ngày |

Query `/schedules` bắt buộc có `from`, `to`; tùy chọn `branchId`, `courseId`, `classId`, `teacherId`, `roomId`, `status`. Không dùng label `Hôm nay/7 ngày tới/Tháng này` ở API; FE đổi thành `from/to`.

### 9.2 Schedule schema

```json
{
  "id": "SCH001",
  "class": { "id": "CLS001", "code": "CLS001", "name": "IELTS Foundation A12" },
  "course": { "id": "COURSE001", "name": "IELTS Foundation" },
  "teacher": { "id": "STF001", "name": "Nguyễn Hoàng Long" },
  "room": { "id": "R201", "name": "P.201" },
  "branch": { "id": "BR001", "name": "Cơ sở 1" },
  "startAt": "2026-07-28T18:00:00+07:00",
  "endAt": "2026-07-28T20:00:00+07:00",
  "status": "active",
  "attendanceSummary": { "present": 16, "pending": 2, "excused": 1, "absent": 1, "late": 0 },
  "students": [{ "id": "HV001248", "name": "Nguyễn Minh Anh", "avatarText": "MA", "attendanceStatus": "present" }],
  "homework": [{ "id": "HW001", "title": "Listening Unit 3", "deadline": "2026-08-02", "status": "assigned" }],
  "lessonNote": "Luyện nghe dạng multiple choice.",
  "teacherNote": "Nhắc học viên nộp recording.",
  "conflicts": []
}
```

Danh sách calendar có thể bỏ `students`, `homework`, notes để nhẹ response; `GET /schedules/{id}` phải trả đầy đủ.

```json
// POST /schedules
{
  "classId": "CLS001",
  "teacherId": "STF001",
  "roomId": "R201",
  "startAt": "2026-08-03T18:00:00+07:00",
  "endAt": "2026-08-03T20:00:00+07:00",
  "status": "upcoming",
  "lessonNote": "Reading skimming and scanning",
  "notifyParticipants": false
}

// POST /schedules/recurring
{
  "classId": "CLS001",
  "teacherId": "STF001",
  "roomId": "R201",
  "firstStartAt": "2026-08-03T18:00:00+07:00",
  "firstEndAt": "2026-08-03T20:00:00+07:00",
  "repeat": { "frequency": "weekly", "interval": 1, "count": 4 },
  "status": "upcoming",
  "lessonNote": null
}

// PATCH /schedules/{id}/time
{ "startAt": "2026-08-04T18:30:00+07:00", "endAt": "2026-08-04T20:30:00+07:00", "reason": null }

// POST /schedules/{id}/duplicate
{ "startAt": "2026-08-04T18:00:00+07:00", "endAt": "2026-08-04T20:00:00+07:00" }

// POST /schedules/{id}/homework
{ "title": "Speaking Recording", "deadline": "2026-08-05", "status": "assigned", "note": null }

// POST /schedules/{id}/notifications
{ "audience": "students_and_parents", "channels": ["in_app"], "title": "Thông báo lịch học", "content": "..." }
```

Nếu giáo viên/phòng bị trùng, trả `409 SCHEDULE_CONFLICT` kèm:

```json
{
  "error": {
    "code": "SCHEDULE_CONFLICT",
    "message": "Giáo viên hoặc phòng học bị trùng lịch",
    "details": {
      "conflicts": [{ "scheduleId": "SCH002", "resource": "teacher", "startAt": "...", "endAt": "..." }]
    },
    "requestId": "req_01J..."
  }
}
```

## 10. Tài chính

### 10.1 Endpoint

| Method | Path | Mục đích |
|---|---|---|
| GET | `/finance/summary` | KPI tài chính |
| GET | `/finance/reports` | Biểu đồ/báo cáo |
| GET | `/finance/transactions` | Danh sách giao dịch học phí |
| POST | `/finance/transactions` | Tạo khoản phải thu |
| GET | `/finance/transactions/{transactionId}` | Chi tiết khoản thu |
| POST | `/finance/transactions/{transactionId}/payments` | Thu học phí/thu công nợ |
| POST | `/finance/transactions/{transactionId}/qr` | Tạo QR thanh toán |
| POST | `/finance/transactions/{transactionId}/debts` | Ghi nhận công nợ |
| PATCH | `/finance/transactions/{transactionId}/due-date` | Gia hạn thanh toán |
| POST | `/finance/transactions/{transactionId}/voucher` | Áp voucher |
| POST | `/finance/transactions/{transactionId}/promotion` | Áp khuyến mãi |
| POST | `/finance/transactions/{transactionId}/scholarship` | Áp học bổng |
| POST | `/finance/transactions/{transactionId}/discount` | Giảm học phí |
| POST | `/finance/transactions/{transactionId}/refunds` | Hoàn học phí |
| GET | `/finance/transactions/{transactionId}/receipts` | Lịch sử phiếu thu |
| POST | `/finance/receipts` | Tạo phiếu thu từ payment |
| PATCH | `/finance/receipts/{receiptId}` | Sửa thông tin phiếu thu cho phép sửa |
| POST | `/finance/receipts/{receiptId}/cancel` | Hủy phiếu thu, không DELETE |
| GET | `/finance/receipts/{receiptId}/print` | PDF phiếu thu |
| POST | `/finance/receipts/{receiptId}/email` | Gửi biên lai email |
| POST | `/finance/transactions/{transactionId}/notifications` | Nhắc thanh toán |
| GET | `/finance/debts` | Danh sách công nợ |
| GET | `/finance/promotions` | Danh sách khuyến mãi |
| GET | `/finance/vouchers` | Danh sách voucher |
| GET | `/finance/scholarships` | Danh sách học bổng |
| GET | `/finance/export?format=xlsx|pdf` | Export theo filter |
| GET | `/finance/reports/print` | PDF báo cáo |

Query `/finance/transactions`:

`q`, `studentId`, `courseId`, `classId`, `branchId`, `paymentMethod`, `status`, `paidFrom`, `paidTo`, `dueFrom`, `dueTo`, `minPayable`, `maxPayable`, `hasDebt`, pagination/sort.

### 10.2 Transaction schema

```json
{
  "id": "TRX001",
  "code": "GD0001",
  "student": { "id": "HV001248", "code": "HV001248", "name": "Nguyễn Minh Anh" },
  "course": { "id": "COURSE001", "name": "IELTS Foundation" },
  "class": { "id": "CLS001", "name": "IELTS Foundation A12" },
  "branch": { "id": "BR001", "name": "Cơ sở 1" },
  "tuitionFee": 12000000,
  "promotionAmount": 1000000,
  "voucherAmount": 500000,
  "discountAmount": 0,
  "scholarshipAmount": 0,
  "payableAmount": 10500000,
  "paidAmount": 10500000,
  "debtAmount": 0,
  "lastPaymentMethod": "transfer",
  "status": "paid",
  "lastPaidAt": "2026-07-28",
  "dueDate": "2026-07-30",
  "collector": { "id": "STF007", "name": "Võ Thanh Tùng" },
  "note": "Thanh toán đủ học phí đợt 1."
}
```

Server là nguồn tính duy nhất cho:

`payableAmount = tuitionFee - promotionAmount - voucherAmount - discountAmount - scholarshipAmount`

`debtAmount = max(payableAmount - paidAmount + refundedAmount, 0)`

FE không tự tính và không gửi các field tổng hợp này khi ghi nhận thanh toán.

```json
// POST /finance/transactions/{id}/payments
{
  "amount": 6000000,
  "method": "qr",
  "paidAt": "2026-07-27",
  "externalReference": null,
  "note": "Thu trước một phần",
  "createReceipt": true
}
```

Response trả transaction đã tính lại và payment/receipt mới:

```json
{
  "data": {
    "transaction": { "id": "TRX002", "paidAmount": 6000000, "debtAmount": 5000000, "status": "partial" },
    "payment": { "id": "PAY002", "amount": 6000000, "method": "qr", "paidAt": "2026-07-27" },
    "receipt": { "id": "REC002", "code": "PT0002", "printUrl": "/api/v1/finance/receipts/REC002/print" }
  }
}
```

```json
// POST /finance/transactions/{id}/debts
{ "amount": 5000000, "dueDate": "2026-08-05", "note": null }

// PATCH /finance/transactions/{id}/due-date
{ "dueDate": "2026-08-15", "reason": "Phụ huynh đề nghị gia hạn" }

// POST /finance/transactions/{id}/voucher
{ "voucherId": "VOU001" }

// POST /finance/transactions/{id}/discount
{ "amount": 500000, "reason": "Chính sách hỗ trợ" }

// POST /finance/transactions/{id}/refunds
{ "amount": 1000000, "method": "transfer", "reason": "Hoàn phần học phí thừa" }

// POST /finance/receipts/{receiptId}/cancel
{ "reason": "Phiếu thu lập sai" }
```

QR response:

```json
{
  "data": {
    "qrPaymentId": "QRP001",
    "qrContent": "000201...",
    "qrImageUrl": "/api/v1/finance/qr-payments/QRP001/image",
    "amount": 5000000,
    "expiresAt": "2026-08-03T10:15:00+07:00",
    "status": "pending"
  }
}
```

### 10.3 Report response

`GET /finance/reports?from=&to=&branchId=&groupBy=day|month` trả:

- `dailyRevenue[]`: `date`, `revenue`
- `monthlyRevenue[]`: `month`, `revenue`
- `byCourse[]`: `course{id,name}`, `revenue`
- `byBranch[]`: `branch{id,name}`, `revenue`
- `paymentRatio[]`: `method`, `value`
- `debtStatus[]`: `status`, `amount`
- `topCourses[]`, `topBranches[]`

## 11. Messaging, export, file và tác vụ dài

Payload message thống nhất:

```json
{
  "channels": ["in_app", "email", "sms"],
  "audience": "selected",
  "recipientIds": ["HV001248"],
  "title": "Thông báo học phí",
  "content": "Nội dung..."
}
```

Enum channel: `in_app`, `email`, `sms`. API gửi message trả `202` nếu xử lý qua queue:

```json
{ "data": { "jobId": "MSG001", "status": "queued", "recipientCount": 1 } }
```

Export nhỏ có thể trả file `200`. Export/import lớn trả `202` với `jobId`, sau đó FE poll:

| Method | Path |
|---|---|
| GET | `/jobs/{jobId}` |
| GET | `/jobs/{jobId}/download` |

Job status: `queued`, `processing`, `completed`, `failed`.

## 12. Global search và notifications tối thiểu

Hai UI này đang hiện nhưng chưa có behavior hoàn chỉnh:

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/search?q=&types=student,class,transaction&limit=10` | Top bar tìm học viên/lớp/hóa đơn |
| GET | `/notifications?page=&pageSize=&unreadOnly=` | Danh sách thông báo user hiện tại |
| PATCH | `/notifications/{notificationId}/read` | Đánh dấu đã đọc |
| POST | `/notifications/read-all` | Đánh dấu tất cả đã đọc |

Search item tối thiểu: `type`, `id`, `code`, `title`, `subtitle`, `targetPath`.

## 13. Validation và ràng buộc nghiệp vụ tối thiểu

- `startAt < endAt`, `startDate <= endDate`.
- Sĩ số tối đa là số nguyên dương; không thêm/chuyển học viên nếu vượt sĩ số.
- Không cho trùng `code`, email (nếu nghiệp vụ yêu cầu unique), CCCD.
- Không xóa lớp đang có học viên/lịch nếu chưa xử lý liên kết.
- Không xóa nhân sự đang được phân công vào lịch tương lai.
- Không chuyển trạng thái học viên/lớp/lịch trái state machine.
- Không cho payment/refund/discount số âm hoặc bằng 0.
- Tổng payment không vượt số phải thu, trừ khi BE hỗ trợ số dư và contract được mở rộng.
- Hủy phiếu thu phải tạo bút toán đảo/audit, không xóa record.
- Áp voucher/khuyến mãi/học bổng phải kiểm tra hiệu lực, điều kiện và chống áp trùng.
- Mọi thay đổi tài chính, trạng thái, phân công, điểm danh phải ghi audit actor/time/before/after.
- Schedule create/update/change room/change teacher phải kiểm tra xung đột giáo viên, phòng và thời gian nghỉ.

## 14. Phân quyền đề xuất

Source mới có `super_admin`; các account mock gợi ý thêm role. FE không được tự quyết quyền chỉ dựa trên role name, mà dùng `permissions` từ `/auth/me`.

Permission code đề xuất:

- `dashboard.read`
- `students.read|create|update|delete|import|export|transition|message`
- `staff.read|create|update|delete|import|export|account.manage|message`
- `classes.read|create|update|delete|manage_students|attendance|documents|message`
- `schedules.read|create|update|delete|attendance|message|export`
- `finance.read|collect|discount|refund|receipt.cancel|export|message`
- `reports.read|export`
- `settings.manage`

## 15. Ghi chú tích hợp FE

1. Thay localStorage mock bằng auth client; access token nên giữ trong memory, refresh token ưu tiên secure HttpOnly cookie nếu kiến trúc cho phép.
2. Tạo một Axios client duy nhất với base URL, bearer/interceptor refresh và parser lỗi chuẩn.
3. FE phải render label từ metadata/map; request luôn dùng enum/ID.
4. Debounce `q` khoảng 300–500 ms; filter/sort/pagination thực hiện server-side.
5. Sau mutation, dùng object trong response để cập nhật cache; không tự dựng lại object như mock hiện tại.
6. Các response list chỉ trả field cần cho table; detail endpoint trả nested tab data hoặc các endpoint tab riêng như contract trên.
7. Không hard-code ngày `2026-07-28`; “hôm nay” lấy timezone trung tâm (`Asia/Bangkok`/timezone cấu hình backend).
8. Download URL phải được auth hoặc signed URL có hạn; không để tài liệu nghiệp vụ dưới `public/` như mock hiện tại.

## 16. Những điểm source chưa đủ để chốt

Các mục sau cần PO/BE xác nhận nhưng không chặn FE bắt đầu tích hợp phần còn lại:

- Access token/refresh token strategy và thời hạn phiên.
- Ma trận role/permission chính thức.
- Xóa mềm hay lưu trữ cho học viên/nhân sự/lớp (contract đang chọn xóa mềm).
- State machine đầy đủ cho học viên, lớp, lịch, payment/receipt.
- Công thức ưu tiên khi áp đồng thời promotion, voucher, discount và scholarship.
- Quy tắc hoàn học phí, kế toán bút toán đảo và tích hợp cổng thanh toán QR.
- Import template chính thức và xử lý row trùng.
- Kênh gửi thực tế (email/SMS/in-app), retry và theo dõi delivery.
- Phạm vi dữ liệu báo cáo/cài đặt vì hai màn hình chưa được triển khai.

---

Contract này ưu tiên cấu trúc API ổn định và dữ liệu machine-readable. Các label, màu badge, icon, chuỗi mô tả và format tiền/ngày thuộc trách nhiệm trình bày của FE, không nên được backend trả lẫn vào entity.
