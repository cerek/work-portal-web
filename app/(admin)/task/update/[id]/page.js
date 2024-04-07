import TaskForm from '../../taskForm'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'

export default async function EmployeeUpdatePage({ params }) {
  const taskInsRes = await serverSideFetch('/task/' + params.id + '/')
  if ('error' in taskInsRes) return ( <ErrorPage errMsg={JSON.stringify(taskInsRes.error)} /> )

  const taskIns = {...taskInsRes, enabled: Boolean(taskInsRes.enabled).toString()}

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TaskForm
          formType="update"
          taskIns={taskIns}
          taskId={params.id}
        />
      </div>
    </div>
  )
}
