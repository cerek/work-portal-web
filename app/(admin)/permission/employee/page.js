import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import EmployeePermissionDetailPage from './employeePermission'

export default async function EmployeePermissionPage() {
  const employeeListRes = await serverSideFetch('/employee/?page_size=5000')
  const employeeList = employeeListRes.results.map(function (element) {
    return { value: element.id, label: element.employee.username }
  })

  const allPermissionList = await serverSideFetch('/permission/?page_size=5000')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <EmployeePermissionDetailPage allPermissionList={allPermissionList.results} employeeList={employeeList} />
      </div>
    </div>
  )
}
