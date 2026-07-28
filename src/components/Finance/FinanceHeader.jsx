import { FileDown, FileSpreadsheet, Printer, QrCode, ReceiptText, Search } from 'lucide-react'

function FinanceHeader({ activeTab, onTabChange, tabs, keyword, onKeywordChange, onOpenModal }) {
  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <nav className="text-sm font-semibold text-slate-500">
            Admin Portal / <span className="text-blue-700">Quản lý Tài chính</span>
          </nav>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Quản lý Tài chính</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Quản lý học phí, phiếu thu, thanh toán QR, công nợ, khuyến mãi và báo cáo tài chính.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[560px]">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3">
              <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
              <input
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Tìm mã giao dịch, học viên, lớp học"
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
              onClick={() => onOpenModal('collectTuition')}
            >
              <ReceiptText size={18} aria-hidden="true" />
              Thu học phí
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-blue-700" onClick={() => onOpenModal('qrPayment')}>
              <QrCode size={17} aria-hidden="true" />
              QR
            </button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-emerald-700" onClick={() => onOpenModal('exportExcel')}>
              <FileSpreadsheet size={17} aria-hidden="true" />
              Excel
            </button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-red-700" onClick={() => onOpenModal('exportPdf')}>
              <FileDown size={17} aria-hidden="true" />
              PDF
            </button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-blue-700" onClick={() => onOpenModal('printReport')}>
              <Printer size={17} aria-hidden="true" />
              In báo cáo
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={[
              'shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition',
              activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </section>
  )
}

export default FinanceHeader
