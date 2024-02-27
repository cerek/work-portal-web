import MyTimeoffList from './myTimeoffList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function MyTimeoffPage() {
  const timeoffList = await serverSideFetch('/mytimeoff/')

  const timeoffTypeListRes = await serverSideFetch('/timeofftype/?page_size=500')
  const timeoffTypeList = timeoffTypeListRes.results.map(function (element) {
    return { value: element.id, label: element.timeoff_type_name }
  })

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <MyTimeoffList timeoffList={timeoffList} timeoffTypeList={timeoffTypeList} />
      </div>
    </div>
  )
}
