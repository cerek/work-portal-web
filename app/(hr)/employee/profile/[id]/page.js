import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'
import EmployeeProfile from './employeeProfile'

export default async function EmployeeProfilePage({ params }) {
  const employeeDetail = await serverSideFetch(
    '/employee/profile/' + params.id + '/'
  )

  return (
    <div className="grid">
      <NewBreadCrumb />
      {'error' in employeeDetail ? <ErrorPage errMsg={JSON.stringify(employeeDetail.error)} /> : <EmployeeProfile employeeDetail={employeeDetail} />}
    </div>
  )
}
