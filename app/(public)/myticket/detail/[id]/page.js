import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import MyTicketDetail from './myTicketDetail'
import ErrorPage from '@/components/errorBlock/page'

export default async function MyTicketDetailPage({ params }) {
  const ticketDetail = await serverSideFetch('/myticket/' + params.id + '/')
  if ('error' in ticketDetail) return ( <ErrorPage errMsg={JSON.stringify(ticketDetail.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <MyTicketDetail ticketDetail={ticketDetail} />
    </div>
  )
}
