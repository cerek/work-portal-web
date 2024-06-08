import TimecardForEmployeeList from './timecardForemployeeList'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function TimecardEmployeePage({ params }) {
  const today = new Date()
  const priorDate = new Date(today.setDate(today.getDate() - 60))
  const formattedPriorDate = priorDate.toISOString().split('T')[0]
  const futureDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 120
  )
  const formattedFutureDate = futureDate.toISOString().split('T')[0]

  const timecardForEmployeeList = await serverSideFetch(
    '/clockingrecord/' +
      '?clocking_record_employee=' +
      params.id +
      '&clocking_record_datetime__date__gte=' +
      formattedPriorDate +
      '&clocking_record_datetime__date__lte=' +
      formattedFutureDate
  )
  if ('error' in timecardForEmployeeList)
    return <ErrorPage errMsg={JSON.stringify(timecardForEmployeeList.error)} />

  const clockingMachineList = await fetchSelectBoxData('/selectbox/clockingmachine/?page_size=500')
  const employeeList = await fetchSelectBoxData('/selectbox/employee/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TimecardForEmployeeList
          timecardForEmployeeList={timecardForEmployeeList}
          empId={params.id}
          priorDate={formattedPriorDate}
          futureDate={formattedFutureDate}
          clockingMachineList={clockingMachineList}
          employeeList={employeeList}
        />
      </div>
    </div>
  )
}
