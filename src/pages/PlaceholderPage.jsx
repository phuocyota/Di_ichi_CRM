import PageHeader from '../components/common/PageHeader.jsx'

function PlaceholderPage({ title }) {
  return (
    <>
      <PageHeader
        title={title}
        description="Phân hệ đã sẵn sàng. Có thể bổ sung màn hình nghiệp vụ, bảng dữ liệu, biểu mẫu, lịch, quét mã và xuất báo cáo tại đây."
      />

      <section className="rounded border border-dashed border-slate-300 bg-white p-8 text-sm text-ink-500">
        Khu vực làm việc cho module {title}
      </section>
    </>
  )
}

export default PlaceholderPage
