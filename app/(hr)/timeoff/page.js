import TimeoffList from './timeoffList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function LocationPage() {
  const timeoffList = await serverSideFetch('/timeoff/')

  const timeoffTypeListRes = await serverSideFetch('/timeofftype/?page_size=500')
  const timeoffTypeList = timeoffTypeListRes.results.map(function (element) {
    return { value: element.id, label: element.timeoff_type_name }
  })

  const employeeListRes = await serverSideFetch('/employee/?page_size=500')
  const employeeList = employeeListRes.results.map(function (element) {
    return { value: element.id, label: element.employee.username }
  })

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TimeoffList timeoffList={timeoffList} timeoffTypeList={timeoffTypeList} applicantList={employeeList} approverList={employeeList} />
      </div>
    </div>
  )
}
