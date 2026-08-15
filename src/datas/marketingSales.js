import { courseClasses, courses, students } from './courses.js'
import { payments, tuitionFees } from './finances.js'
import { staffs } from './staffs.js'

const courseMap = Object.fromEntries(courses.map((item) => [item.id, item]))
const classMap = Object.fromEntries(courseClasses.map((item) => [item.id, item]))
const studentMap = Object.fromEntries(students.map((item) => [item.id, item]))
const staffMap = Object.fromEntries(staffs.map((item) => [item.id, item]))
const tuitionMap = Object.fromEntries(tuitionFees.map((item) => [item.id, item]))

export const marketingSalesTabs = [
  { key: 'sources', label: 'Nguồn Lead' },
  { key: 'campaigns', label: 'Campaign' },
  { key: 'sales', label: 'Hiệu suất Sale' },
]

export const leadStatusOptions = [
  { value: 'new', label: 'Lead mới' },
  { value: 'consulting', label: 'Đang tư vấn' },
  { value: 'trial', label: 'Học thử' },
  { value: 'enrolled', label: 'Đăng ký' },
  { value: 'paid', label: 'Đã đóng phí' },
]

export const leadSources = [
  { id: 'source-facebook', name: 'Facebook Ads', channel: 'Paid Social', ownerId: 'STF008', cost: 46000000 },
  { id: 'source-google', name: 'Google Search', channel: 'Search Ads', ownerId: 'STF008', cost: 38000000 },
  { id: 'source-referral', name: 'Referral', channel: 'Giới thiệu', ownerId: 'STF006', cost: 8000000 },
  { id: 'source-event', name: 'School Event', channel: 'Event', ownerId: 'STF005', cost: 18000000 },
  { id: 'source-walkin', name: 'Walk-in', channel: 'Offline', ownerId: 'STF006', cost: 5000000 },
]

export const marketingCampaigns = [
  { id: 'campaign-ielts-aug', code: 'MKT-IELTS-0826', name: 'IELTS Back To School', sourceIds: ['source-facebook', 'source-google'], courseId: 'course-ielts-foundation', ownerId: 'STF008', budget: 62000000, startDate: '2026-08-01', endDate: '2026-08-31', status: 'Đang chạy' },
  { id: 'campaign-toeic-aug', code: 'MKT-TOEIC-0826', name: 'TOEIC 500+ Sprint', sourceIds: ['source-google', 'source-walkin'], courseId: 'course-toeic-500', ownerId: 'STF006', budget: 34000000, startDate: '2026-08-05', endDate: '2026-08-28', status: 'Đang chạy' },
  { id: 'campaign-kids-summer', code: 'MKT-KIDS-0726', name: 'Kids Summer Trial', sourceIds: ['source-facebook', 'source-event', 'source-referral'], courseId: 'course-starter-kids', ownerId: 'STF005', budget: 28000000, startDate: '2026-07-10', endDate: '2026-08-20', status: 'Sắp kết thúc' },
  { id: 'campaign-communication', code: 'MKT-COM-0826', name: 'Giao tiếp cho người đi làm', sourceIds: ['source-google', 'source-referral'], courseId: 'course-communication-basic', ownerId: 'STF008', budget: 22000000, startDate: '2026-08-08', endDate: '2026-09-08', status: 'Đang chạy' },
]

export const marketingLeads = [
  { id: 'lead-001', code: 'LD0001', sourceId: 'source-facebook', campaignId: 'campaign-ielts-aug', saleId: 'STF006', studentId: 'student-001', courseId: 'course-ielts-foundation', classId: 'class-ielts-fd-01', status: 'paid', createdAt: '2026-08-01', expectedRevenue: 12000000, tuitionId: 'tuition-001' },
  { id: 'lead-002', code: 'LD0002', sourceId: 'source-google', campaignId: 'campaign-ielts-aug', saleId: 'STF006', studentId: 'student-002', courseId: 'course-ielts-foundation', classId: 'class-ielts-fd-01', status: 'paid', createdAt: '2026-08-02', expectedRevenue: 12000000, tuitionId: 'tuition-002' },
  { id: 'lead-003', code: 'LD0003', sourceId: 'source-google', campaignId: 'campaign-toeic-aug', saleId: 'STF006', studentId: 'student-003', courseId: 'course-toeic-500', classId: 'class-toeic-500-01', status: 'enrolled', createdAt: '2026-08-04', expectedRevenue: 8000000, tuitionId: 'tuition-003' },
  { id: 'lead-004', code: 'LD0004', sourceId: 'source-event', campaignId: 'campaign-kids-summer', saleId: 'STF005', studentId: 'student-004', courseId: 'course-starter-kids', classId: 'class-kids-starter-01', status: 'paid', createdAt: '2026-08-05', expectedRevenue: 10000000, tuitionId: 'tuition-004' },
  { id: 'lead-005', code: 'LD0005', sourceId: 'source-referral', campaignId: 'campaign-kids-summer', saleId: 'STF005', studentId: 'student-005', courseId: 'course-toeic-500', classId: 'class-toeic-500-01', status: 'trial', createdAt: '2026-08-07', expectedRevenue: 8000000, tuitionId: 'tuition-005' },
  { id: 'lead-006', code: 'LD0006', sourceId: 'source-facebook', campaignId: 'campaign-kids-summer', saleId: 'STF008', studentId: '', courseId: 'course-starter-kids', classId: 'class-kids-starter-01', status: 'consulting', createdAt: '2026-08-09', expectedRevenue: 10000000, tuitionId: '' },
  { id: 'lead-007', code: 'LD0007', sourceId: 'source-walkin', campaignId: 'campaign-toeic-aug', saleId: 'STF006', studentId: '', courseId: 'course-toeic-500', classId: 'class-toeic-500-01', status: 'new', createdAt: '2026-08-10', expectedRevenue: 8000000, tuitionId: '' },
  { id: 'lead-008', code: 'LD0008', sourceId: 'source-referral', campaignId: 'campaign-communication', saleId: 'STF005', studentId: '', courseId: 'course-communication-basic', classId: '', status: 'consulting', createdAt: '2026-08-11', expectedRevenue: 7500000, tuitionId: '' },
]

function getPaidRevenue(tuitionId) {
  return payments
    .filter((item) => item.tuitionId === tuitionId && item.status !== 'cancelled')
    .reduce((sum, item) => sum + item.amount, 0)
}

function enrichLead(lead) {
  const source = leadSources.find((item) => item.id === lead.sourceId)
  const campaign = marketingCampaigns.find((item) => item.id === lead.campaignId)
  const course = courseMap[lead.courseId]
  const classItem = classMap[lead.classId]
  const sale = staffMap[lead.saleId]
  const student = studentMap[lead.studentId]
  const tuition = tuitionMap[lead.tuitionId]
  const paidRevenue = getPaidRevenue(lead.tuitionId)

  return {
    ...lead,
    sourceName: source?.name || lead.sourceId,
    channel: source?.channel || '',
    campaignCode: campaign?.code || '',
    campaignName: campaign?.name || lead.campaignId,
    courseName: course?.name || lead.courseId,
    className: classItem?.name || '',
    saleName: sale?.name || lead.saleId,
    saleCode: sale?.code || lead.saleId,
    studentCode: student?.code || '',
    studentName: student?.name || '',
    tuitionCode: tuition?.code || '',
    paidRevenue,
  }
}

export const marketingLeadRows = marketingLeads.map(enrichLead)

function aggregateLeads(rows, key) {
  const grouped = new Map()
  rows.forEach((row) => {
    const id = row[key]
    if (!grouped.has(id)) grouped.set(id, [])
    grouped.get(id).push(row)
  })
  return grouped
}

function calculateRates(rows) {
  const leads = rows.length
  const trials = rows.filter((row) => ['trial', 'enrolled', 'paid'].includes(row.status)).length
  const enrollments = rows.filter((row) => ['enrolled', 'paid'].includes(row.status)).length
  const paid = rows.filter((row) => row.status === 'paid').length
  const expectedRevenue = rows.reduce((sum, row) => sum + Number(row.expectedRevenue || 0), 0)
  const paidRevenue = rows.reduce((sum, row) => sum + Number(row.paidRevenue || 0), 0)

  return {
    leads,
    trials,
    enrollments,
    paid,
    expectedRevenue,
    paidRevenue,
    conversionRate: leads ? Number(((enrollments / leads) * 100).toFixed(1)) : 0,
    paymentRate: enrollments ? Number(((paid / enrollments) * 100).toFixed(1)) : 0,
  }
}

export const leadSourceRows = [...aggregateLeads(marketingLeadRows, 'sourceId').entries()].map(([sourceId, rows]) => {
  const source = leadSources.find((item) => item.id === sourceId)
  const metrics = calculateRates(rows)
  return {
    id: sourceId,
    sourceId,
    sourceName: source?.name || sourceId,
    channel: source?.channel || '',
    ownerId: source?.ownerId || '',
    ownerName: staffMap[source?.ownerId]?.name || '',
    cost: source?.cost || 0,
    costPerLead: metrics.leads ? Math.round((source?.cost || 0) / metrics.leads) : 0,
    roi: source?.cost ? Number((((metrics.paidRevenue - source.cost) / source.cost) * 100).toFixed(1)) : 0,
    ...metrics,
  }
})

export const campaignRows = marketingCampaigns.map((campaign) => {
  const rows = marketingLeadRows.filter((lead) => lead.campaignId === campaign.id)
  const metrics = calculateRates(rows)
  return {
    id: campaign.id,
    campaignId: campaign.id,
    campaignCode: campaign.code,
    campaignName: campaign.name,
    sourceNames: campaign.sourceIds.map((sourceId) => leadSources.find((item) => item.id === sourceId)?.name || sourceId).join(', '),
    courseId: campaign.courseId,
    courseName: courseMap[campaign.courseId]?.name || campaign.courseId,
    ownerId: campaign.ownerId,
    ownerName: staffMap[campaign.ownerId]?.name || '',
    budget: campaign.budget,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    status: campaign.status,
    roi: campaign.budget ? Number((((metrics.paidRevenue - campaign.budget) / campaign.budget) * 100).toFixed(1)) : 0,
    ...metrics,
  }
})

export const salePerformanceRows = [...aggregateLeads(marketingLeadRows, 'saleId').entries()].map(([saleId, rows]) => {
  const sale = staffMap[saleId]
  const metrics = calculateRates(rows)
  return {
    id: saleId,
    saleId,
    saleCode: sale?.code || saleId,
    saleName: sale?.name || saleId,
    department: sale?.department || '',
    position: sale?.position || '',
    activeCampaigns: new Set(rows.map((row) => row.campaignId)).size,
    bestSource: rows.reduce((best, row) => {
      const sourceLeads = rows.filter((item) => item.sourceId === row.sourceId).length
      return sourceLeads > best.count ? { name: row.sourceName, count: sourceLeads } : best
    }, { name: '-', count: 0 }).name,
    avgDealValue: metrics.paid ? Math.round(metrics.paidRevenue / metrics.paid) : 0,
    ...metrics,
  }
})
