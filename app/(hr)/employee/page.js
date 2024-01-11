import EmployeeList from './employeeList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function EmployeePage() {
  const employeeList = await serverSideFetch('/employee/')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <EmployeeList employeeList={employeeList} />
      </div>
    </div>
  )
}
