import MyTimeoffList from './myTimeoffList'
import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function MyTimeoffPage() {
  const timeoffList = await serverSideFetch('/mytimeoff/')
  if ('error' in timeoffList) return ( <ErrorPage errMsg={JSON.stringify(timeoffList.error)} /> )

  const timeoffTypeList = await fetchSelectBoxData('/selectbox/timeofftype/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <MyTimeoffList timeoffList={timeoffList} timeoffTypeList={timeoffTypeList} />
      </div>
    </div>
  )
}
