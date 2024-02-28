import TicketList from './ticketList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function TicketPage() {
  const ticketList = await serverSideFetch('/ticket/')
  if ('error' in ticketList) return ( <ErrorPage errMsg={JSON.stringify(ticketList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TicketList ticketList={ticketList} />
      </div>
    </div>
  )
}
