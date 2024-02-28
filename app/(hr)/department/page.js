import DepartmentList from './departmentList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function DepartmentPage() {
  const departmentList = await serverSideFetch('/department/')
  if ('error' in departmentList) return ( <ErrorPage errMsg={JSON.stringify(departmentList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <DepartmentList departmentList={departmentList} />
      </div>
    </div>
  )
}
