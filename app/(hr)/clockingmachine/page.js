import ClockingMachineList from './clockingMachineList'
import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function ClockingMachinePage() {
  const clockingMachineList = await serverSideFetch('/clockingmachine/')
  if ('error' in clockingMachineList) return ( <ErrorPage errMsg={JSON.stringify(clockingMachineList.error)} /> )

  const locationList = await fetchSelectBoxData('/selectbox/location/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <ClockingMachineList clockingMachineList={clockingMachineList} locationList={locationList} />
      </div>
    </div>
  )
}
