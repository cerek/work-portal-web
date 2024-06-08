import ClockingRecordList from './clockingRecordList'
import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function ClockingRecordPage() {
  const clockingRecordList = await serverSideFetch('/clockingrecord/')
  if ('error' in clockingRecordList) return ( <ErrorPage errMsg={JSON.stringify(clockingRecordList.error)} /> )

  const clockingMachineList = await fetchSelectBoxData('/selectbox/clockingmachine/?page_size=500')
  const employeeList = await fetchSelectBoxData('/selectbox/employee/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <ClockingRecordList clockingRecordList={clockingRecordList} employeeList={employeeList} clockingMachineList={clockingMachineList} />
      </div>
    </div>
  )
}
