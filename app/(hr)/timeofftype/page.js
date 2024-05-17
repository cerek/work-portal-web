import TimeoffTypeList from './timeoffTypeList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function TimeoffTypePage() {
  const timeoffTypeList = await serverSideFetch('/timeofftype/')
  if ('error' in timeoffTypeList) return ( <ErrorPage errMsg={JSON.stringify(timeoffTypeList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TimeoffTypeList timeoffTypeList={timeoffTypeList} />
      </div>
    </div>
  )
}
