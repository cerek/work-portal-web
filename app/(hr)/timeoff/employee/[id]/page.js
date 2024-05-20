import TimeoffForEmployeeList from './timeoffForemployeeList'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function TimeoffEmployeePage({ params }) {
  const today = new Date()
  const priorDate = new Date(today.setDate(today.getDate() - 60))
  const formattedPriorDate = priorDate.toISOString().split('T')[0]
  const futureDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 120
  )
  const formattedFutureDate = futureDate.toISOString().split('T')[0]

  const timeoffForEmployeeList = await serverSideFetch(
    '/timeoff-employee/' +
      params.id +
      '/?timeoff_date__gte=' +
      formattedPriorDate +
      '&timeoff_date_lte=' +
      formattedFutureDate
  )
  if ('error' in timeoffForEmployeeList)
    return <ErrorPage errMsg={JSON.stringify(timeoffForEmployeeList.error)} />

  const timeoffTypeList = await fetchSelectBoxData(
    '/selectbox/timeofftype/?page_size=500'
  )
  if ('error' in timeoffTypeList)
    return <ErrorPage errMsg={JSON.stringify(timeoffTypeList.error)} />
  timeoffTypeList.map((item) => item.value = item.label)

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TimeoffForEmployeeList
          timeoffForEmployeeList={timeoffForEmployeeList}
          empId={params.id}
          priorDate={formattedPriorDate}
          futureDate={formattedFutureDate}
          timeoffTypeList={timeoffTypeList}
        />
      </div>
    </div>
  )
}
