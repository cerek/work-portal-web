import FingerRecordList from './fingerRecordList'
import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function FingerRecordPage() {
  const fingerRecordList = await serverSideFetch('/fingerrecord/')
  if ('error' in fingerRecordList) return ( <ErrorPage errMsg={JSON.stringify(fingerRecordList.error)} /> )

  const clockingMachineList = await fetchSelectBoxData('/selectbox/clockingmachine/?page_size=500')
  const employeeList = await fetchSelectBoxData('/selectbox/employee/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <FingerRecordList fingerRecordList={fingerRecordList} clockingMachineList={clockingMachineList} employeeList={employeeList} />
      </div>
    </div>
  )
}
