import MyTicketList from './myTicketList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function MyTicketPage() {
  const ticketList = await serverSideFetch('/myticket/')

  const ticketTypeListRes = await serverSideFetch('/tickettype/?page_size=500')
  const ticketTypeList = ticketTypeListRes.results.map(function (element) {
    return { value: element.id, label: element.ticket_type_name }
  })

  const departmentListRes = await serverSideFetch('/department/?page_size=500')
  const departmentList = departmentListRes.results.map(function (element) {
    return { value: element.id, label: element.department.name }
  })

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <MyTicketList ticketList={ticketList} ticketTypeList={ticketTypeList} ticketAssignDepartment={departmentList} />
      </div>
    </div>
  )
}
