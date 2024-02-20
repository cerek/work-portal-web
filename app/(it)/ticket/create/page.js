import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import TicketForm from '../ticketForm'

export default async function TicketCreatePage() {
  const ticketTypeListRes = await serverSideFetch('/tickettype/?page_size=500')
  const ticketTypeList = ticketTypeListRes.results.map(function (element) {
    return { value: element.id, label: element.ticket_type_name }
  })

  const employeeListRes = await serverSideFetch('/employee/?page_size=500')
  const employeeList = employeeListRes.results.map(function (element) {
    return { value: element.id, label: element.employee.username }
  })

  const departmentListRes = await serverSideFetch('/department/?page_size=500')
  const departmentList = departmentListRes.results.map(function (element) {
    return { value: element.id, label: element.department.name }
  })

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TicketForm
          formType="create"
          ticketIns=""
          ticketId=""
          ticketTypeList={ticketTypeList}
          ticketCreatorList={employeeList}
          ticketAssignerList={employeeList}
          ticketAssignDepartment={departmentList}
        />
      </div>
    </div>
  )
}
