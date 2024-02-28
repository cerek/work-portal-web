import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import EmployeeDetail from './employeeDetail'
import ErrorPage from '@/components/errorBlock/page'

export default async function EmployeeDetailPage({ params }) {
  const employeeDetail = await serverSideFetch('/employee/' + params.id + '/')
  if ('error' in employeeDetail) return ( <ErrorPage errMsg={JSON.stringify(employeeDetail.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <EmployeeDetail employeeDetail={employeeDetail} />
    </div>
  )
}
