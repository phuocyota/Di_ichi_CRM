# Di-Ichi CRM — chuẩn giao diện Admin Portal

## Audit và phạm vi

Áp dụng trực tiếp lên 7 module hiện hành: Tổng quan CRM, Học viên, Phụ huynh, Khóa học/lớp học, Lịch học, Giáo viên, Cài đặt hệ thống. Không tạo trang demo và không triển khai production.

Các điểm không nhất quán được xử lý: header riêng lẻ, màu nền KPI quá nhiều, chữ đậm quá mức, bảng đầu xanh đậm/trắng xen kẽ, tìm kiếm bị lặp trong header và danh sách, chiều rộng cố định làm bó nội dung, số liệu thiếu trạng thái trống, các thao tác tài khoản chưa có bước xác nhận thống nhất.

Giữ lại tên component và callbacks nghiệp vụ hiện tại. Không thay API contract, database, xác thực, Enrollment, thu học phí, RBAC hoặc thuật toán lịch lặp/điểm danh/kéo thả.

## Tokens

Nguồn: `src/styles/design-system.css`, `src/styles/theme.css`.

| Thành phần | Quy ước |
| --- | --- |
| Nhận diện | Logo Di-Ichi hiện tại; đỏ #e60023 cho hành động chính, trạng thái tab và focus |
| Màu chức năng | Success xanh lá; warning vàng nâu; danger đỏ; info xanh dương; neutral xám |
| Nền | Canvas #f4f7fb, card trắng, border #e4e7ec; bóng mỏng |
| Khoảng cách bố cục | 4 / 8 / 12 / 16 / 24 / 32px |
| Page title | 24px / 32px, semibold; mobile 22px / 28px |
| Section title | 18px / 24px, semibold |
| Card title | 15px / 24px, semibold |
| Nội dung / bảng | 13px / 20px |
| Nhãn / thông tin phụ | 12px / 20px; caption phụ 11px khi cần |
| Số liệu KPI | 28px / 36px, tabular-nums; card pastel theo semantic tone, cùng chiều cao tối thiểu |
| Controls | Cao 40px, nút icon 36px, border radius 8px |
| Card / dialog | Radius 12px / 16px |

Không sửa giá trị enum trong DB để Việt hóa nhãn. `presentation.js` giữ ánh xạ theo ngữ cảnh student/staff/course/class/account/schedule/general. Trạng thái lạ giữ nguyên nội dung và dùng tone neutral, không suy diễn trạng thái mới.

## Component chung

| Component | Cách dùng |
| --- | --- |
| PageHeader (mở rộng component sẵn có) | Breadcrumb, tiêu đề, mô tả, actions, tabs; giữ header module gọn |
| StatCard (mở rộng component sẵn có) | KPI nền pastel, icon nhẹ, số 0 giữ nguyên, có loading và điều hướng tùy chọn |
| WorkspaceView (mở rộng) | Tiếp tục làm lớp tái sử dụng cho bảng, trạng thái, biểu đồ và dashboard hiện hành |
| ui.jsx | Breadcrumb, PageTabs, SearchInput, FilterBar, StatusBadge, EmptyState, LoadingSkeleton, Pagination, ConfirmDialog, ChartCard, DateRangePicker, ActionDropdown |
| presentation.js | Ánh xạ nhãn/màu trạng thái và cấu hình biểu đồ, tách khỏi React để giữ fast refresh |
| StudentTable / StaffTable | Giữ TanStack Table cho chọn dòng, lọc và sắp xếp; không ép sang bảng khác làm mất chức năng |

ActionDropdown phát triển từ menu Nghiệp vụ hiện tại, dùng portal để tránh bị cắt bởi khung bảng, hỗ trợ phím mũi tên, Escape, click ngoài và trả focus. ConfirmDialog có focus trap, trả focus về nút mở, chặn thao tác lặp trong khi xử lý và giữ lỗi trong dialog.

## Thay đổi từng module

- **Shared shell:** Sidebar vẫn giữ điều hướng và đăng xuất, thêm thu gọn desktop; mobile/tablet có drawer, Escape và focus trap. Global Header giữ tài khoản/thông báo; ô tìm học viên nhanh thực hiện điều hướng đến danh sách và điền từ khóa.
- **Học viên:** cùng PageHeader, tabs, KPI và ChartCard; gộp avatar/tên/mã, lớp/khóa học. Giữ các cột còn lại trong Tùy chỉnh cột, lưu lựa chọn trong localStorage. Chọn dòng và xuất Excel/PDF theo luồng hiện tại, không thêm xóa/chuyển lớp hàng loạt. Menu vẫn dùng đúng điều kiện nghiệp vụ, nút tạo tài khoản vẫn chỉ xuất hiện đúng trường hợp.
- **Phụ huynh:** PageHeader và tabs thống nhất, KPI chung, nhãn trạng thái tiếng Việt theo ngữ cảnh, bộ tìm kiếm một chỗ, timeline chăm sóc và EmptyState rõ ràng.
- **Khóa học/lớp học:** giữ 3 nghiệp vụ khóa/lớp/kết quả; bảng chung có sorting/pagination/empty state; nhóm thông tin liên quan; học phí hiển thị tiền Việt Nam, không đổi null thành khoản phí 0đ; giữ đủ các thao tác qua menu.
- **Giáo viên:** header, KPI, biểu đồ và mật độ danh sách đồng bộ; gộp danh tính giáo viên, phân trang chung, trạng thái nhất quán. Bộ lọc ngày vào làm thực sự lọc trên ngày vào làm. Hồ sơ/chuyên môn/phân công/lịch/KPI tiếp tục dùng callbacks hiện có.
- **Tổng quan CRM:** header, KPI và biểu đồ theo bộ chung, màu hạn chế; xử lý được biểu đồ rỗng; Việt hóa nhãn Lead. Không tự thêm tỷ lệ chuyển đổi/chưa chăm sóc/gọi lại khi API chưa cung cấp chỉ số chính thức.
- **Lịch học:** giữ ngày/tuần/tháng, Calendar/bảng, tạo lịch/điểm danh/nhắc lịch. Có chọn ngày và thu gọn bộ lọc để Calendar mở rộng. Calendar giữ mounted khi chuyển bảng để không mất ngày đang xem; updateSize khi mở/đóng bộ lọc. Bảng lịch dùng sorting/pagination/menu chung. Không sửa thời điểm sự kiện hay các handler drop/resize hiện hành; không ép chiều cao event làm sai cảm nhận thời lượng.
- **Cài đặt:** bảng/header/toolbar nhất quán; tooltip và menu nhân viên; xác nhận khi lưu quyền, gán vai trò, sửa quyền tài khoản, đổi mật khẩu và xóa vai trò. Khóa tài khoản tiếp tục dùng form xác nhận hiện có. Các vai trò bảo vệ và quyền backend được giữ nguyên.

## Responsive và khả năng sử dụng

- Desktop: giữ Sidebar, mở rộng vùng nội dung khi thu gọn; bố cục tối đa 1920px.
- Tablet: grid thích nghi, actions xuống dòng, Sidebar dạng drawer trước breakpoint desktop hoặc có thể thu gọn khi ở desktop.
- Mobile: padding 16px, tabs cuộn trong thanh riêng, actions bọc dòng, bảng chỉ cuộn bên trong container. Cột định danh và thao tác không được ẩn qua điều khiển chọn cột.
- Có focus visible, skip link, nhãn icon, aria-sort, aria-pressed/expanded, trạng thái loading và hỗ trợ reduced motion.

## Kiểm tra và giới hạn

Đã chạy `npm run lint`, `npm run build` và 5 script kiểm tra cô lập:

1. `node scripts/verify-design-system.mjs`: layout/tabs, cột học viên, lưu lựa chọn cột, chọn/xuất hàng loạt, sorting/pagination, menu nghiệp vụ, quyền được bảo vệ, xác nhận mật khẩu/phân quyền, drawer/sidebar, tìm kiếm global, thu gọn bộ lọc lịch, chọn ngày, đổi tháng, giữ Calendar khi chuyển bảng. Kiểm tra không có browser error chưa xử lý trong DOM.
2. `node scripts/verify-api-workspaces.mjs`: các luồng lưu/tải lại API hiện có, gồm tạo lịch bằng UUID và xử lý lỗi API.
3. `node scripts/verify-student-workflows.mjs`: nghiệp vụ học viên, import, partial save và in.
4. `node scripts/verify-student-accounts.mjs`: tạo tài khoản, hiển thị nút đúng điều kiện và email bắt buộc.
5. `node scripts/verify-system-settings.mjs`: hợp đồng API cài đặt và render trạng thái/quyền.

Đã thử `tsc --allowJs --checkJs --noEmit --jsx react-jsx --module esnext --moduleResolution bundler --target es2022 --skipLibCheck src/main.jsx`. Kiểm tra toàn dự án hiện chưa đạt, còn 100 lỗi suy luận kiểu trong source JavaScript, tập trung ở CoursePage/CourseModal và các API service trả response đã unwrap. Không báo typecheck toàn dự án đã pass và không đưa vào task này một đợt chuyển đổi toàn bộ code sang TypeScript. Các shared component mới và bảng học viên đã được xử lý các lỗi kiểu trực tiếp phát hiện trong phần thay đổi.

Chưa xác nhận ảnh chụp/layout pixel trên trình duyệt thật ở các kích thước màn hình: công cụ browser không có phiên khả dụng (inventory rỗng và tạo tab trả Browser is not available). DOM tests kiểm chứng hành vi, không thay thế đo scrollWidth/screenshot trên browser thật.

Không tự thêm KPI thiếu contract, dữ liệu demo, button gửi email/SMS giả hay endpoint mới. Không deploy production và không ghi database thật để kiểm thử UI.

## Bổ sung màu pastel (30/10/2026)

Tokens nằm trong design-system.css: Primary #E60023, Secondary #2563EB, Success accent #10B981, Warning accent #F59E0B, Purple accent #8B5CF6. Chữ nhỏ dùng sắc độ tối hơn để giữ contrast trên nền pastel. Palette biểu đồ tham chiếu CSS variables, không lặp hex trong component.

Sidebar sáng với icon theo module và active đỏ pastel; header giữ nguyên kích thước, nền hồng rất nhẹ và đường nhấn theo module. KPI sử dụng pastel và số theo tone. Bộ lọc, selected rows, table header, tabs và menu có nền nhẹ. FilterBar hiển thị chips từ các select đang được chọn, không tạo state nghiệp vụ mới. Mã học viên/giáo viên mở hồ sơ qua callback sẵn có.

Học thử dùng tím, đang học xanh lá, bảo lưu cam, nghỉ học đỏ nhất quán giữa KPI/badge/chart. Enum và công thức số liệu giữ nguyên. Trạng thái chưa nhận diện tiếp tục có nhãn gốc; biểu đồ phân loại dùng palette chung. Không thay API/database và không tạo trang demo.

### File chỉnh sửa trong đợt bổ sung màu

- Tokens: src/styles/theme.css, src/styles/design-system.css.
- Shell: src/layouts/MainLayout.jsx.
- Shared: src/components/common/StatCard.jsx, presentation.js, ui.jsx, WorkspaceView.jsx.
- Học viên: src/components/Students/StudentDashboard.jsx, StudentTable.jsx; src/pages/Students/StudentPage.jsx; src/datas/students.js.
- Giáo viên: src/components/Staff/StaffTable.jsx; src/pages/Staff/StaffPage.jsx.
- CRM: src/components/dashboard/LeadTrendChart.jsx; src/pages/dashboard/DashboardPage.jsx.
- Lịch: src/components/Schedule/ScheduleSidebar.jsx; src/config/schedules.js.
- Kiểm tra: scripts/verify-design-system.mjs.
- Tài liệu: DESIGN_SYSTEM.md.

### Kết quả kiểm tra đợt bổ sung màu

- npm run lint: PASS.
- npm run build: PASS.
- node scripts/verify-design-system.mjs: PASS; gồm controlled filter chips, clear callback, bộ lọc trống, KPI bằng 0, tone tím, bảng/chọn/xuất/menu, tabs, drawer, calendar và tìm kiếm.
- Contrast chữ trên pastel: Primary text 5.68, success 5.21, warning 6.84, danger 5.72, info 4.75, purple 6.48, cyan 5.15, pink 5.53. Nút Primary chữ trắng cũng đạt tối thiểu 4.5:1. Đỏ #E60023 vẫn giữ cho nút; chữ nhỏ trên pastel dùng token --ui-primary-text tối hơn.
- Typecheck JavaScript toàn dự án: 100 lỗi nền, chưa PASS; không còn lỗi mới tại shared components, StudentDashboard, MainLayout, ScheduleSidebar và config/schedules.
- Không đo responsive/pixel trên browser thật được: inventory browser rỗng, tạo tab Chrome trả Browser is not available. Kiểm tra DOM không thay thế kiểm tra trực quan.
