import LocationList from './locationList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function LocationPage() {
  const locationList = await serverSideFetch('/location/')
  if ('error' in locationList) return ( <ErrorPage errMsg={JSON.stringify(locationList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <LocationList locationList={locationList} />
      </div>
    </div>
  )
}
