import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import EmployeeProfile from './employeeProfile'

export default async function EmployeeProfilePage({ params }) {
  const employeeDetail = await serverSideFetch(
    '/employee/profile/' + params.id + '/'
  )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <EmployeeProfile employeeDetail={employeeDetail} />
    </div>
  )
}
