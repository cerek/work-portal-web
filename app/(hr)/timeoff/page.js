import TimeoffShow from './timeoffShow'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function TimeoffPage() {
  const departmentList = await fetchSelectBoxData('/selectbox/department/?page_size=500')
  if ('error' in departmentList) return ( <ErrorPage errMsg={JSON.stringify(departmentList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <TimeoffShow departmentList={departmentList} />
    </div>
  )
}
