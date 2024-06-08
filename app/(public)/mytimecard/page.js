import serverSideFetch from '@/lib/serverFetchData/page'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'
import MyTimecardDetail from './myTimecardDetail'

export default async function MyTimecardPage() {
  const today = new Date()
  const priorDate = new Date(today.setDate(today.getDate() - 60))
  const formattedPriorDate = priorDate.toISOString().split('T')[0]
  const futureDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 120
  )
  const formattedFutureDate = futureDate.toISOString().split('T')[0]
  
  const myScheduleListRes = await serverSideFetch('/myschedule/?schedule_date__gte=' + formattedPriorDate + '&schedule_date__lte=' + formattedFutureDate + '&page_size=200')
  if ('error' in myScheduleListRes)
    return <ErrorPage errMsg={JSON.stringify(myScheduleListRes.error)} />

  const myTimecardCalListRes = await serverSideFetch('/mytimecard-calendar/?page_size=200')
  if ('error' in myTimecardCalListRes)
    return <ErrorPage errMsg={JSON.stringify(myTimecardCalListRes.error)} />

  const myTimecardList = await serverSideFetch('/mytimecard/')
  if ('error' in myTimecardList)
    return <ErrorPage errMsg={JSON.stringify(myTimecardList.error)} />
  // Need to filter the date range of my timeoff
  // const myTimeOffListRes = await serverSideFetch('/mytimeoff/?timeoff_date__gte=' + formattedPriorDate + '&timeoff_date__lte=' + formattedFutureDate + '&page_size=200')
  // if ('error' in myTimeOffListRes)
  //   return <ErrorPage errMsg={JSON.stringify(myTimeOffListRes.error)} />

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

  const myTimecardCalList = myTimecardCalListRes.results.map(function (element) {
    return {
      title: 'Punching',
      start: element.clocking_record_first_time,
      end: element.clocking_record_last_time,
      backgroundColor: '#ffcc00',
      eventBorderColor: 'black',
      textColor: 'black',
    }
  })

  // const myTimeOffList = myTimeOffListRes.results.map(function (element) {
  //   return {
  //     title: element.timeoff_type,
  //     start: element.timeoff_start_datetime_hm,
  //     end: element.timeoff_end_datetime_hm,
  //     backgroundColor: '#ffcc00',
  //     eventBorderColor: 'black',
  //     textColor: 'black',
  //   }
  // })
  // combine schedule list and timeoff list
  const calData = myScheduleList.concat(myTimecardCalList)
  const myTimecardChangeList = {"resulte": [], "count": 0}

  return (
    <div className="grid">
      <NewBreadCrumb />
      <MyTimecardDetail
        calData={calData}
        myTimecardList={myTimecardList}
        myTimecardChangeList={myTimecardChangeList}
      />
    </div>
  )
}
