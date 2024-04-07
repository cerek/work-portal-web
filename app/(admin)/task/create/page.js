import TaskForm from '../taskForm'
import fetchSelectBoxData from '@/lib/fetchSelectBoxData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function TaskCreatePage() {
  // Need the check permission implementation with back-end for prevent show the page
  const clockedList = await fetchSelectBoxData('/selectbox/clocked/?page_size=500')
  const crontabList = await fetchSelectBoxData('/selectbox/crontab/?page_size=500')
  const intervalList = await fetchSelectBoxData('/selectbox/interval/?page_size=500')

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <TaskForm
          formType="create"
          taskIns=""
          taskId=""
          clockedList={clockedList}
          crontabList={crontabList}
          intervalList={intervalList}
        />
      </div>
    </div>
  )
}
