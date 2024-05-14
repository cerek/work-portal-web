import ScheduleChangeList from './scheduleChangeList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function ScheduleChangePage() {
  const scheduleChangeList = await serverSideFetch('/schedulechange/')
  if ('error' in scheduleChangeList) return ( <ErrorPage errMsg={JSON.stringify(scheduleChangeList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <ScheduleChangeList scheduleChangeList={scheduleChangeList} />
      </div>
    </div>
  )
}
