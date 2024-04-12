import TaskList from './taskList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function TaskPage() {
  const taskList = await serverSideFetch('/task/')
  if ('error' in taskList) return ( <ErrorPage errMsg={JSON.stringify(taskList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TaskList taskList={taskList} />
      </div>
    </div>
  )
}
