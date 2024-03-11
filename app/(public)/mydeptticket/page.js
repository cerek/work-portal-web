import MyDeptTicketList from './myDeptTicketList'
import MyDeptTicketSummary from './myDeptTicketSummary'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'
import { getEmployeeInfo } from '@/lib/utils/page'


export default async function MyDepatTicketPage() {
  const deptTicketList = await serverSideFetch('/mydeptticket/')
  if ('error' in deptTicketList) return <ErrorPage errMsg={JSON.stringify(ticketList.error)} />
  
  const deptTicketListSummaryRes = await serverSideFetch('/mydeptticket/?page_size=1000')
  const today = new Date()
  const twoWeeksAgo = new Date(today.getTime() - (14 * 24 * 60 * 60 * 1000))
  const deptTicketListSummaryList = deptTicketListSummaryRes.results.filter(item => {
    const createdTime = new Date(item.created_time);
    return createdTime > twoWeeksAgo;
  });

  const currentEmp = await getEmployeeInfo()
  const currentEmpId = currentEmp.employee

  return (
    <div className="grid">
      <NewBreadCrumb />
      <MyDeptTicketSummary deptTicketListSummaryList={deptTicketListSummaryList} currentEmpId={currentEmpId} />
      <div className="col-12">
        <MyDeptTicketList deptTicketList={deptTicketList} currentEmpId={currentEmpId}/>
      </div>
    </div>
  )
}
