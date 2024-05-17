import TimeoffApplicationList from './timeoffApplicationList'
import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function LocationPage() {
  const timeoffApplicationList = await serverSideFetch('/timeoffapplication/')
  if ('error' in timeoffApplicationList) return ( <ErrorPage errMsg={JSON.stringify(timeoffApplicationList.error)} /> )

  const timeoffTypeList = await fetchSelectBoxData('/selectbox/timeofftype/?page_size=500')
  const employeeList = await fetchSelectBoxData('/selectbox/employee/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TimeoffApplicationList timeoffApplicationList={timeoffApplicationList} timeoffTypeList={timeoffTypeList} applicantList={employeeList} approverList={employeeList} />
      </div>
    </div>
  )
}
