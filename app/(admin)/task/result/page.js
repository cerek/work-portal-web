import TaskResultList from './taskResultList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function TaskResultPage() {
  const taskResultList = await serverSideFetch('/task-result/')
  if ('error' in taskResultList) return ( <ErrorPage errMsg={JSON.stringify(taskResultList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TaskResultList taskResultList={taskResultList} />
      </div>
    </div>
  )
}
