import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import MyTicketForm from '../../myTicketForm'
import ErrorPage from '@/components/errorBlock/page'

export default async function MyTicketUpdatePage({ params }) {
  const ticketInsRes = await serverSideFetch('/myticket/' + params.id + '/')
  if ('error' in ticketInsRes) return <ErrorPage errMsg={JSON.stringify(ticketInsRes.error)} />
  const ticketIns = { ...ticketInsRes }

  const ticketTypeList = await fetchSelectBoxData('/selectbox/tickettype/?page_size=500')
  const departmentList = await fetchSelectBoxData('/selectbox/department/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <MyTicketForm
          formType="update"
          ticketIns={ticketIns}
          ticketId={params.id}
          ticketTypeList={ticketTypeList}
          ticketAssignDepartment={departmentList}
        />
      </div>
    </div>
  )
}
