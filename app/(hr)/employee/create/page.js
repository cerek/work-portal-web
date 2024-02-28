import EmployeeForm from '../employeeForm'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function EmployeeCreatePage() {
  // Need the check permission implementation with back-end for prevent show the page
  const locationList = await fetchSelectBoxData('/selectbox/location/?page_size=500')
  const departmentList = await fetchSelectBoxData('/selectbox/department/?page_size=500')

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
