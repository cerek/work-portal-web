import LocationList from './locationList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function LocationPage() {
  const locationList = await serverSideFetch('/location/')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <LocationList locationList={locationList} />
      </div>
    </div>
  )
}
