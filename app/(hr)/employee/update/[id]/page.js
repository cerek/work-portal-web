import EmployeeForm from '../../employeeForm'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function EmployeeUpdatePage({ params }) {
  const locationListRes = await serverSideFetch('/location/')
  const locationList = locationListRes.results.map(function (element) {
    return { value: element.id, label: element.location_name }
  })
  const departmentListRes = await serverSideFetch('/department/')
  const departmentList = departmentListRes.results.map(function (element) {
    return { value: element.id, label: element.department.name }
  })
  
  const employeeInsRes = await serverSideFetch('/employee/' + params.id + '/')
  const employeeIns = {
    ...employeeInsRes,
    employee_work_location: employeeInsRes.employee_work_location.id,
    employee_join_day: new Date(employeeInsRes.employee_join_day),
    employee_department: employeeInsRes.employee_department.id,
    employee: {
      ...employeeInsRes.employee,
      is_active: JSON.stringify(employeeInsRes.employee.is_active)
    },
  }

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <EmployeeForm
          formType="update"
          locationList={locationList}
          departmentList={departmentList}
          employeeIns={employeeIns}
          employeeId={params.id}
        />
      </div>
    </div>
  )
}
