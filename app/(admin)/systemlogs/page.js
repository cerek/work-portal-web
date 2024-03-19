import SystemLogsList from './systemlogsList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'
import ErrorPage from '@/components/errorBlock/page'


export default async function SystemLogsPage() {
  const systemLogsList = await serverSideFetch('/systemlogs/')
  if ('error' in systemLogsList) return ( <ErrorPage errMsg={JSON.stringify(systemLogsList.error)} /> )

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <SystemLogsList systemLogsList={systemLogsList} />
      </div>
    </div>
  )
}
