import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import DepartmentPermissionDetailPage from './departmentPermission'

export default async function DepartmentPermissionPage() {
  const departmentListRes = await serverSideFetch('/department/?page_size=5000')
  const departmentList = departmentListRes.results.map(function (element) {
    return { value: element.id, label: element.department.name }
  })

  const allPermissionList = await serverSideFetch('/permission/?page_size=5000')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <DepartmentPermissionDetailPage allPermissionList={allPermissionList.results} departmentList={departmentList} />
      </div>
    </div>
  )
}
