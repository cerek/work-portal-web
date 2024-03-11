export default function MyDeptTicketSummary({
  deptTicketListSummaryList,
  currentEmpId,
}) {
  const deptTicketFinishedByMe = deptTicketListSummaryList.filter((item) => {
    return (
      item.ticket_status_hm == 'Finished' &&
      item.ticket_assigner == currentEmpId
    )
  })
  const deptTicketAssigndToMe = deptTicketListSummaryList.filter((item) => {
    return item.ticket_assigner == currentEmpId
  })

  return (
    <>
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                My Department Total Tickets(Two past weeks)
              </span>
              <div className="text-900 font-medium text-xl">
                Total: {deptTicketListSummaryList.length} Tickets
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-orange-100 border-round"
              style={{ width: '2.5rem', height: '2.5rem' }}>
              <i className="pi pi-map-marker text-orange-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                Assign To Me
              </span>
              <div className="text-900 font-medium text-xl">
                Total: {deptTicketAssigndToMe.length} Tickets
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-blue-100 border-round"
              style={{ width: '2.5rem', height: '2.5rem' }}>
              <i className="pi pi-shopping-cart text-blue-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                Finished by Me
              </span>
              <div className="text-900 font-medium text-xl">
                Total: {deptTicketFinishedByMe.length} Tickets
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-cyan-100 border-round"
              style={{ width: '2.5rem', height: '2.5rem' }}>
              <i className="pi pi-inbox text-cyan-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                Weekly Ticket CostTime
              </span>
              <div className="text-900 font-medium text-xl">- Hours </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-purple-100 border-round"
              style={{ width: '2.5rem', height: '2.5rem' }}>
              <i className="pi pi-comment text-purple-500 text-xl" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
