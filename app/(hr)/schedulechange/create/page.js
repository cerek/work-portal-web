import ScheduleChangeForm from '../scheduleChangeForm'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function ScheduleChangeCreatePage() {
  // Need the check permission implementation with back-end for prevent show the page
  const workShiftList = await fetchSelectBoxData('/selectbox/workshift/?page_size=500')
  const employeeList = await fetchSelectBoxData('/selectbox/employee/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <ScheduleChangeForm
          formType="create"
          workShiftList={workShiftList}
          applicantList={employeeList}
          approverList={employeeList}
          scheduleChangeIns=""
          scheduleChangeId=""
        />
      </div>
    </div>
  )
}
