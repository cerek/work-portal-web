import ScheduleChangeForm from '../../scheduleChangeForm'
import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function ScheduleUpdatePage({ params }) {
  const scheduleChangeIns = await serverSideFetch('/schedulechange/' + params.id + '/')
  if ('error' in scheduleChangeIns) return ( <ErrorPage errMsg={JSON.stringify(scheduleChangeIns.error)} /> )

  const workShiftList = await fetchSelectBoxData('/selectbox/workshift/?page_size=500')
  const employeeList = await fetchSelectBoxData('/selectbox/employee/?page_size=500')

  if (scheduleChangeIns.schedule_change_type === 0) {
    const workDateStrArr = scheduleChangeIns.schedule_change_work_date && scheduleChangeIns.schedule_change_work_date.split(',') || []
    const offDateStrArr = scheduleChangeIns.schedule_change_off_date && scheduleChangeIns.schedule_change_off_date.split(',') || []
    const workDateArr = workDateStrArr.map((item) => new Date(item + ' 00:00:00'))
    const offDateArr = offDateStrArr.map((item) => new Date(item + ' 00:00:00'))
    scheduleChangeIns.schedule_change_work_date = workDateArr
    scheduleChangeIns.schedule_change_off_date = offDateArr
  }

  if (scheduleChangeIns.schedule_change_type === 1) {
    scheduleChangeIns.schedule_change_start_date = new Date(scheduleChangeIns.schedule_change_start_date + ' 00:00:00')
    scheduleChangeIns.schedule_change_end_date = new Date(scheduleChangeIns.schedule_change_end_date + ' 00:00:00')
    const workDayStrArr = scheduleChangeIns.schedule_change_work_day && scheduleChangeIns.schedule_change_work_day.split(',') || []
    const workDayArr = workDayStrArr.map((item) => parseInt(item))
    scheduleChangeIns.schedule_change_work_day = workDayArr
  }

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <ScheduleChangeForm
          formType="update"
          workShiftList={workShiftList}
          applicantList={employeeList}
          approverList={employeeList}
          scheduleChangeIns={scheduleChangeIns}
          scheduleChangeId={params.id}
        />
      </div>
    </div>
  )
}
