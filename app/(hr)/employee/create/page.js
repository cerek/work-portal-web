import EmployeeForm from '../employeeForm'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function EmployeeCreatePage() {
  const locationListRes = await serverSideFetch('/location/')
  const locationList = locationListRes.results.map(function (element) {
    return { value: element.id, label: element.location_name }
  })
  const departmentListRes = await serverSideFetch('/department/')
  const departmentList = departmentListRes.results.map(function (element) {
    return { value: element.id, label: element.department.name }
  })

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <EmployeeForm
          formType="create"
          locationList={locationList}
          departmentList={departmentList}
          employeeIns=""
          employeeId=""
        />
      </div>
    </div>
  )
}
