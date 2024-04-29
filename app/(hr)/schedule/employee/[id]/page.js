import ScheduleForEmployeeList from './scheduleForemployeeList.js'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function ScheduleEmployeePage({ params }) {
  const today = new Date()
  const priorDate = new Date(today.setDate(today.getDate() - 60))
  const formattedPriorDate = priorDate.toISOString().split('T')[0]
  const futureDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 120
  )
  const formattedFutureDate = futureDate.toISOString().split('T')[0]

  const scheduleForEmployeeList = await serverSideFetch(
    '/schedule-employee/' +
      params.id +
      '/?schedule_date__gte=' +
      formattedPriorDate +
      '&schedule_date_lte=' +
      formattedFutureDate
  )
  if ('error' in scheduleForEmployeeList)
    return <ErrorPage errMsg={JSON.stringify(scheduleForEmployeeList.error)} />

  const workShiftList = await fetchSelectBoxData(
    '/selectbox/workshift/?page_size=500'
  )
  if ('error' in workShiftList)
    return <ErrorPage errMsg={JSON.stringify(workShiftList.error)} />

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <ScheduleForEmployeeList
          scheduleForEmployeeList={scheduleForEmployeeList}
          empId={params.id}
          priorDate={formattedPriorDate}
          futureDate={formattedFutureDate}
          workShiftList={workShiftList}
        />
      </div>
    </div>
  )
}
