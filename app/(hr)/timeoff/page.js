import TimeoffList from './timeoffList'
import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function LocationPage() {
  const timeoffList = await serverSideFetch('/timeoff/')
  if ('error' in timeoffList) return ( <ErrorPage errMsg={JSON.stringify(timeoffList.error)} /> )

  const timeoffTypeList = await fetchSelectBoxData('/selectbox/timeofftype/?page_size=500')
  const employeeList = await fetchSelectBoxData('/selectbox/employee/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TimeoffList timeoffList={timeoffList} timeoffTypeList={timeoffTypeList} applicantList={employeeList} approverList={employeeList} />
      </div>
    </div>
  )
}
