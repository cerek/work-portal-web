import NewBreadCrumb from '@/components/breadCrumb/page'
import MyTicketForm from '../myTicketForm'

export default async function MyTicketCreatePage() {
  // Need the check permission implementation with back-end for prevent show the page
  const ticketTypeList = await fetchSelectBoxData('/selectbox/tickettype/?page_size=500')
  const departmentList = await fetchSelectBoxData('/selectbox/department/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <MyTicketForm
          formType="create"
          ticketIns=""
          ticketId=""
          ticketTypeList={ticketTypeList}
          ticketAssignDepartment={departmentList}
        />
      </div>
    </div>
  )
}
