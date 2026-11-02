import assert from 'node:assert/strict'
import {createServer} from 'vite'
import {createElement} from 'react'
import {renderToString} from 'react-dom/server'
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'})
try {
  globalThis.localStorage={getItem:()=>null}
  const {classPayload}=await server.ssrLoadModule('/src/services/courseApi.js')
  const {default:api}=await server.ssrLoadModule('/src/services/apiClient.js')
  const {createResource}=await server.ssrLoadModule('/src/services/crmApi.js')
  const {default:CourseModal}=await server.ssrLoadModule('/src/components/Courses/CourseModal.jsx')
  const {parseSchedulePattern,generatePatternUntil}=await server.ssrLoadModule('/src/services/schedulePattern.js')
  const values={code:' CLASS-PLAN ',name:' Lớp dự kiến ',courseId:'course-1',maxStudents:20,startDate:'2026-11-02',endDate:'2026-11-11',status:'upcoming',repeatUntilEnd:true,weeklySchedule:parseSchedulePattern('T2-T4 14:00-16:00')}
  let request
  api.defaults.adapter=async config=>{request=config;return {status:201,statusText:'Created',headers:{},config,data:{success:true,data:{id:'class-1',...JSON.parse(config.data)}}}}
  await createResource('class',classPayload(values))
  assert.equal(request.url,'/class')
  const body=JSON.parse(request.data)
  assert.equal(body.repeatUntilEnd,true)
  assert.deepEqual(body.weeklySchedule.map(s=>s.weekday),[1,3])
  assert.equal(body.teacherId,undefined)
  const plannedSchedule={repeatUntilEnd:true,startDate:values.startDate,endDate:values.endDate,weeklySchedule:values.weeklySchedule,sessions:generatePatternUntil('T2-T4 14:00-16:00',values.startDate,values.endDate)}
  const html=renderToString(createElement(CourseModal,{modal:{entity:'class',mode:'view',item:{...values,id:'class-1',plannedSchedule}},courses:[],teachers:[],courseMap:{},teacherMap:{},courseStatuses:[],classStatuses:[],onSubmit:()=>{},onClose:()=>{},onConvert:()=>{}}))
  assert.ok(html.includes('Lịch dự kiến đã lưu'))
  assert.ok(html.includes('Chuyển sang lịch học thực tế'))
  assert.ok(html.includes('4')&&html.includes('buổi'))
  assert.equal((html.match(/<li /g)||[]).length,4)
  console.log('PASS: class creation sends full-course planning without a teacher; saved planned lessons render after reload. Isolated API adapter, no live writes.')
} finally {await server.close()}
