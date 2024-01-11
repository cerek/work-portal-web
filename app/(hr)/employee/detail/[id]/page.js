import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import EmployeeDetail from './employeeDetail'

export default async function EmployeeDetailPage({ params }) {
  const employeeDetail = await serverSideFetch(
    '/employee/' + params.id + '/'
  )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <EmployeeDetail employeeDetail={employeeDetail} />
    </div>
  )
}
