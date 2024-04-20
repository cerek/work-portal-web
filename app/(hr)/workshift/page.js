import WorkShiftList from './workshiftList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function WorkShiftPage() {
  const workshiftList = await serverSideFetch('/workshift/')
  if ('error' in workshiftList) return ( <ErrorPage errMsg={JSON.stringify(workshiftList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <WorkShiftList workshiftList={workshiftList} />
      </div>
    </div>
  )
}
