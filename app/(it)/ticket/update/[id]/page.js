import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import TicketForm from '../../ticketForm'
import ErrorPage from '@/components/errorBlock/page'

export default async function TicketUpdatePage({ params }) {
  const ticketInsRes = await serverSideFetch('/ticket/' + params.id + '/')
  if ('error' in ticketInsRes) return ( <ErrorPage errMsg={JSON.stringify(ticketInsRes.error)} /> )

  const ticketIns = {...ticketInsRes}

  const ticketTypeList = await fetchSelectBoxData('/selectbox/tickettype/?page_size=500')
  const departmentList = await fetchSelectBoxData('/selectbox/department/?page_size=500')
  const employeeList = await fetchSelectBoxData('/selectbox/employee/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TicketForm
          formType="update"
          ticketIns={ticketIns}
          ticketId={params.id}
          ticketTypeList={ticketTypeList}
          ticketCreatorList={employeeList}
          ticketAssignerList={employeeList}
          ticketAssignDepartment={departmentList}
        />
      </div>
    </div>
  )
}
