import EmployeeList from './employeeList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function EmployeePage() {
  const employeeList = await serverSideFetch('/employee/')
  if ('error' in employeeList) return ( <ErrorPage errMsg={JSON.stringify(employeeList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <EmployeeList employeeList={employeeList} />
      </div>
    </div>
  )
}
