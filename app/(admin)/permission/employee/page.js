import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import EmployeePermissionDetailPage from './employeePermission'
import ErrorPage from '@/components/errorBlock/page'

export default async function EmployeePermissionPage() {
  const employeeListRes = await serverSideFetch('/employee/?page_size=5000')
  if ('error' in employeeListRes) return ( <ErrorPage errMsg={JSON.stringify(employeeListRes.error)} /> )

  const employeeList = employeeListRes.results.map(function (element) {
    return { value: element.id, label: element.employee.username }
  })

  const allPermissionList = await serverSideFetch('/permission/?page_size=5000')
  if ('error' in allPermissionList) return ( <ErrorPage errMsg={JSON.stringify(allPermissionList.error)} /> )


  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <EmployeePermissionDetailPage allPermissionList={allPermissionList.results} employeeList={employeeList} />
      </div>
    </div>
  )
}
