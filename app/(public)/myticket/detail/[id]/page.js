import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import MyTicketDetail from './myTicketDetail'

export default async function MyTicketDetailPage({ params }) {
  const ticketDetail = await serverSideFetch('/myticket/' + params.id + '/')

  return (
    <div className="grid">
      <NewBreadCrumb />
      {'error' in ticketDetail ? (
        <ErrorPage errMsg={JSON.stringify(ticketDetail.error)} />
      ) : (
        <MyTicketDetail ticketDetail={ticketDetail} />
      )}
    </div>
  )
}
