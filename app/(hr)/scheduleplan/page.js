import SchedulePlanList from './schedulePlanList'
import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function SchedulePlanPage() {
  const schedulePlanList = await serverSideFetch('/scheduleplan/')
  if ('error' in schedulePlanList) return ( <ErrorPage errMsg={JSON.stringify(schedulePlanList.error)} /> )

  const workShiftList = await fetchSelectBoxData('/selectbox/workshift/?page_size=500')
  const employeeList = await fetchSelectBoxData('/selectbox/employee/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <SchedulePlanList schedulePlanList={schedulePlanList} workShiftList={workShiftList} employeeList={employeeList} />
      </div>
    </div>
  )
}
