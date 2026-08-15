import { useState } from 'react'
import { toast } from 'sonner'
import CampaignPanel from '../../components/MarketingSales/CampaignPanel.jsx'
import LeadSourcePanel from '../../components/MarketingSales/LeadSourcePanel.jsx'
import MarketingSalesHeader from '../../components/MarketingSales/MarketingSalesHeader.jsx'
import SalePerformancePanel from '../../components/MarketingSales/SalePerformancePanel.jsx'
import {
  campaignRows,
  leadSourceRows,
  marketingSalesTabs,
  salePerformanceRows,
} from '../../datas/marketingSales.js'

function MarketingSalesPage() {
  const [activeTab, setActiveTab] = useState('sources')
  const [keyword, setKeyword] = useState('')

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setKeyword('')
  }

  const handleRefresh = () => {
    setKeyword('')
    toast.success('Đã làm mới dữ liệu Marketing & Sale')
  }

  return (
    <div className="space-y-5">
      <MarketingSalesHeader
        activeTab={activeTab}
        tabs={marketingSalesTabs}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onTabChange={handleTabChange}
      />

      {activeTab === 'sources' ? (
        <LeadSourcePanel rows={leadSourceRows} keyword={keyword} onRefresh={handleRefresh} />
      ) : activeTab === 'campaigns' ? (
        <CampaignPanel rows={campaignRows} keyword={keyword} onRefresh={handleRefresh} />
      ) : (
        <SalePerformancePanel rows={salePerformanceRows} keyword={keyword} onRefresh={handleRefresh} />
      )}
    </div>
  )
}

export default MarketingSalesPage
