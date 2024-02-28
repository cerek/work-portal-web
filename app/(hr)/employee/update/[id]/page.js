import EmployeeForm from '../../employeeForm'
import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function EmployeeUpdatePage({ params }) {
  const employeeInsRes = await serverSideFetch('/employee/' + params.id + '/')
  if ('error' in employeeInsRes) return ( <ErrorPage errMsg={JSON.stringify(employeeInsRes.error)} /> )

  const locationList = await fetchSelectBoxData('/selectbox/location/?page_size=500')
  const departmentList = await fetchSelectBoxData('/selectbox/department/?page_size=500')

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
