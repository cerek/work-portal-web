import DepartmentList from './departmentList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function DepartmentPage() {
  const departmentList = await serverSideFetch('/department/')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <DepartmentList departmentList={departmentList} />
      </div>
    </div>
  )
}
