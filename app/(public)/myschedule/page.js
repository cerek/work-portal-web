import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'
import MyScheduleDetail from './myScheduleDetail'

export default async function MySchedulePage({ params }) {
  const today = new Date()
  const priorDate = new Date(today.setDate(today.getDate() - 60))
  const formattedPriorDate = priorDate.toISOString().split('T')[0]
  const futureDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 120
  )
  const formattedFutureDate = futureDate.toISOString().split('T')[0]
  
  const myScheduleListRes = await serverSideFetch('/myschedule/?schedule_date__gte=' + formattedPriorDate + '&schedule_date__lte=' + formattedFutureDate)
  if ('error' in myScheduleListRes)
    return <ErrorPage errMsg={JSON.stringify(myScheduleListRes.error)} />
  // Need to filter the date range of my timeoff
  const myTimeOffList = await serverSideFetch('/mytimeoff/')
  if ('error' in myTimeOffList)
    return <ErrorPage errMsg={JSON.stringify(myTimeOffList.error)} />
  const myScheduleChangeList = await serverSideFetch('/myschedulechange/')
  if ('error' in myScheduleChangeList)
    return <ErrorPage errMsg={JSON.stringify(myScheduleChangeList.error)} />

  const myScheduleList = myScheduleListRes.results.map(function (element) {
    return {
      title: 'Normal Work',
      start: element.schedule_work_start_datetime_hm,
      end: element.schedule_work_end_datetime_hm,
    }
  })

  const workShiftList = await fetchSelectBoxData('/selectbox/workshift/?page_size=500')
  // combine schedule list and timeoff list
  // pass to whole list to the calendar componment



  return (
    <div className="grid">
      <NewBreadCrumb />
      <MyScheduleDetail
        myScheduleList={myScheduleList}
        myTimeOffList={myTimeOffList}
        myScheduleChangeList={myScheduleChangeList}
        workShiftList={workShiftList}
      />
    </div>
  )
}
