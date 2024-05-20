import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'
import MyTimeoffDetail from './myTimeoffDetail'

export default async function MyTimeoffPage() {
  const today = new Date()
  const priorDate = new Date(today.setDate(today.getDate() - 60))
  const formattedPriorDate = priorDate.toISOString().split('T')[0]
  const futureDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 120
  )
  const formattedFutureDate = futureDate.toISOString().split('T')[0]

  const myTimeoffApplicationList = await serverSideFetch('/mytimeoffapplication/')
  if ('error' in myTimeoffApplicationList)
    return <ErrorPage errMsg={JSON.stringify(myTimeoffApplicationList.error)} />

  // Pull My Timeoff data list
  const myTimeOffListRes = await serverSideFetch('/mytimeoff/?timeoff_date__gte=' + formattedPriorDate + '&timeoff_date__lte=' + formattedFutureDate + '&page_size=200')
  if ('error' in myTimeOffListRes)
    return <ErrorPage errMsg={JSON.stringify(myTimeOffListRes.error)} />

  const myTimeOffList = myTimeOffListRes.results.map(function (element) {
    return {
      title: element.timeoff_type,
      start: element.timeoff_start_datetime_hm,
      end: element.timeoff_end_datetime_hm,
      backgroundColor: '#ffcc00',
      eventBorderColor: 'black',
      textColor: 'black',
    }
  })
  // combine schedule list and timeoff list
  const calData = myTimeOffList

  const timeoffTypeList = await fetchSelectBoxData('/selectbox/timeofftype/?page_size=500')


  return (
    <div className="grid">
      <NewBreadCrumb />
      <MyTimeoffDetail
        calData={calData}
        myTimeoffApplicationList={myTimeoffApplicationList}
        timeoffTypeList={timeoffTypeList}
      />
    </div>
  )
}
