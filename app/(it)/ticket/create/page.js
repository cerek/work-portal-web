import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import TicketForm from '../ticketForm'

export default async function TicketCreatePage() {
  // Need the check permission implementation with back-end for prevent show the page
  const ticketTypeList = await fetchSelectBoxData('/selectbox/tickettype/?page_size=500')
  const employeeList = await fetchSelectBoxData('/selectbox/employee/?page_size=500')
  const departmentList = await fetchSelectBoxData('/selectbox/department/?page_size=500')

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
