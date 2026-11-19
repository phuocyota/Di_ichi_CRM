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
  // Tạo lịch thực tế: gửi kèm giáo viên chính và scheduleMode=actual.
  await createResource('class',classPayload({...values,teacherId:'teacher-1',scheduleMode:'actual'}))
  const actualBody=JSON.parse(request.data)
  assert.equal(actualBody.scheduleMode,'actual')
  assert.equal(actualBody.teacherId,'teacher-1')
  await createResource('class',classPayload({...values,teacherId:'teacher-1',scheduleMode:'planned'}))
  assert.equal(JSON.parse(request.data).scheduleMode,'planned')
  assert.equal(JSON.parse(request.data).teacherId,'teacher-1')
  // Sửa lớp không gửi giáo viên hay chế độ lịch.
  const editBody=classPayload({...values,teacherId:'teacher-1'})
  assert.equal(editBody.teacherId,undefined)
  assert.equal(editBody.scheduleMode,undefined)
  const createHtml=renderToString(createElement(CourseModal,{modal:{entity:'class',mode:'create',courseId:'course-1'},courses:[],teachers:[{id:'teacher-1',name:'GV A'}],courseMap:{},teacherMap:{},courseStatuses:[],classStatuses:[],onSubmit:()=>{},onClose:()=>{}}))
  assert.ok(createHtml.includes('Tạo lịch dự kiến'))
  assert.ok(createHtml.includes('Tạo lịch thực tế'))
  assert.ok(createHtml.indexOf('value="planned"')<createHtml.indexOf('value="actual"'),'Enter phải mặc định tạo lịch dự kiến')
  assert.ok(!/<select id="class-teacher"[^>]*disabled/.test(createHtml),'Chọn được giáo viên khi tạo lớp')
  console.log('PASS: class creation sends full-course planning with or without a main teacher; "Tạo lịch thực tế" sends scheduleMode=actual; teacher is selectable on create; saved planned lessons render after reload. Isolated API adapter, no live writes.')
} finally {await server.close()}
