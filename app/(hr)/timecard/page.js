import TimecardShow from './timecardShow'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function TimecardPage() {
  const departmentList = await fetchSelectBoxData('/selectbox/department/?page_size=500')
  if ('error' in departmentList) return ( <ErrorPage errMsg={JSON.stringify(departmentList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <TimecardShow departmentList={departmentList} />
    </div>
  )
}
