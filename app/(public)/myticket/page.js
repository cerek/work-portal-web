import MyTicketList from './myTicketList'
import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function MyTicketPage() {
  const ticketList = await serverSideFetch('/myticket/')
  if ('error' in ticketList) return <ErrorPage errMsg={JSON.stringify(ticketList.error)} />
  const ticketTypeList = await fetchSelectBoxData('/selectbox/tickettype/?page_size=500')
  const departmentList = await fetchSelectBoxData('/selectbox/department/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <MyTicketList
          ticketList={ticketList}
          ticketTypeList={ticketTypeList}
          ticketAssignDepartment={departmentList}
        />
      </div>
    </div>
  )
}
