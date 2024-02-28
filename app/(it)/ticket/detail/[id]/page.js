import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import TicketDetail from './ticketDetail'
import ErrorPage from '@/components/errorBlock/page'

export default async function TicketDetailPage({ params }) {
  const ticketDetail = await serverSideFetch('/ticket/' + params.id + '/')
  if ('error' in ticketDetail) return ( <ErrorPage errMsg={JSON.stringify(ticketDetail.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <TicketDetail ticketDetail={ticketDetail} />
    </div>
  )
}
