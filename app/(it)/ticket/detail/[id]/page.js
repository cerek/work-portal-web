import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import TicketDetail from './ticketDetail'

export default async function TicketDetailPage({ params }) {
  const ticketDetail = await serverSideFetch('/ticket/' + params.id + '/')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <TicketDetail ticketDetail={ticketDetail} />
    </div>
  )
}
