import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import MyDeptTicketDetail from './myDeptTicketDetail'
import ErrorPage from '@/components/errorBlock/page'
import { getEmployeeInfo } from '@/lib/utils/page'


export default async function MyDeptTicketDetailPage({ params }) {
  const deptTicketDetail = await serverSideFetch('/mydeptticket/' + params.id + '/')
  if ('error' in deptTicketDetail) return ( <ErrorPage errMsg={JSON.stringify(deptTicketDetail.error)} /> )

  const currentEmp = await getEmployeeInfo()
  const currentEmpId = currentEmp.employee

  return (
    <div className="grid">
      <NewBreadCrumb />
      <MyDeptTicketDetail deptTicketDetail={deptTicketDetail} currentEmpId={currentEmpId}/>
    </div>
  )
}
