import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'
import EmployeeProfile from './employeeProfile'

export default async function EmployeeProfilePage({ params }) {
  const employeeDetail = await serverSideFetch(
    '/employee/profile/' + params.id + '/'
  )
  if ('error' in employeeDetail) return ( <ErrorPage errMsg={JSON.stringify(employeeDetail.error)} /> )


  return (
    <div className="grid">
      <NewBreadCrumb />
      <EmployeeProfile employeeDetail={employeeDetail} />
    </div>
  )
}
