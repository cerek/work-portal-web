'use client'

import Link from 'next/link'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { Dialog } from 'primereact/dialog'
import { Paginator } from 'primereact/paginator'
import MyDeptTicketSolutionForm from './myDeptTicketSolutionForm'
import { searchList, pageControl, dirtyValues } from '@/lib/utils/page'

export default function MyDeptTicketList({ deptTicketList, currentEmpId }) {
  const apiModule = 'mydeptticket'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState('')
  const [listData, setListData] = useState(deptTicketList)
  const [selectInstances, setSelectInstances] = useState(null)
  const [solveDialog, setSolveDialog] = useState(false)
  const [solveTicketIns, setSolveTicketIns] = useState()
  const [firstPage, setFirstPage] = useState(0)
  const [pageRows, setPageRows] = useState(10)

  // Table Header and Toolbar
  async function searchEvent() {
    const searchRes = await searchList(apiModule, globalFilter)
    setListData(searchRes)
  }

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">ToDo Tickets</h4>
      <span className="p-input-icon-left">
        <div className="p-inputgroup flex-1">
          <InputText
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            onKeyUp={(e) => {
              if (e.key == 'Enter') searchEvent()
            }}
          />
          <Button label="Search" onClick={searchEvent} />
        </div>
      </span>
    </div>
  )

  const handlePickTicket = async (rowData) => {
    const pickBody = { ticket_status: 1 }
    const res = await fetch('/api/' + apiModule + '/' + rowData.id, {
      method: 'PATCH',
      body: JSON.stringify(pickBody),
    })
    if (!res.ok) {
      const resData = await res.json()
      toast.current.show({
        severity: 'error',
        summary: 'Failed',
        detail: JSON.stringify(resData),
        life: 30000,
      })
    } else {
      const listRefreshData = await fetch('/api/' + apiModule)
      const newListData = await listRefreshData.json()
      setListData(newListData)
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail: rowData.ticket_title + ' was pick successfully!!',
        life: 10000,
      })
    }
  }

  const handleSolveTicket = (ticketIns) => {
    setSolveTicketIns(ticketIns)
    setSolveDialog(true)
  }

  // Table Template
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Link href={'/mydeptticket/detail/' + rowData.id}>
          <Button
            icon="pi pi-eye"
            label="View"
            className="mr-2"
            severity="info"
          />
        </Link>
        {rowData.ticket_assigner === currentEmpId && (
          <Button
            icon="pi pi-pencil"
            label="Solve"
            className="mr-2"
            severity="warning"
            onClick={() => handleSolveTicket(rowData)}
          />
        )}
        {['New'].includes(rowData.ticket_status_hm) && (
          <Button
            icon="pi pi-wrench"
            label="Pick"
            severity="success"
            onClick={() => handlePickTicket(rowData)}
          />
        )}
      </React.Fragment>
    )
  }

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag severity={getSeverity(rowData.ticket_status_hm)}>
        {rowData.ticket_status_hm}
      </Tag>
    )
  }

  const creatorBodyTemplate = (rowData) => {
    return (
      <>
        <strong style={{ 'fontSize?': '150%' }}>
          {rowData.ticket_creator_hm}
        </strong>
        <br />
        <Tag
          icon="pi pi-users"
          severity="info"
          value={rowData.ticket_creator_department_hm}></Tag>
      </>
    )
  }

  const assignerBodyTemplate = (rowData) => {
    return (
      <>
        <strong style={{ 'fontSize?': '150%' }}>
          {rowData.ticket_assigner_hm}
        </strong>
        <br />
        <Tag
          icon="pi pi-users"
          severity="success"
          value={rowData.ticket_assign_department_hm}></Tag>
      </>
    )
  }

  const shortBodyTemplate = (rowData, flag) => {
    let res = ''
    if (flag == 'desc') {
      res = rowData.ticket_description
    } else if (flag == 'solu') {
      res = rowData.ticket_solution || ''
    }

    if (res.length > 50) {
      return res.slice(0, 50) + '...'
    } else {
      return res
    }
  }

  const getSeverity = (insStatus) => {
    switch (insStatus) {
      case 'New':
        return 'info'
      case 'Finished':
        return 'success'
      case 'Closed':
        return 'danger'
      case 'In progress':
        return 'primary'
      case 'On hold':
        return 'danger'
      case 'Rejected':
        return 'danger'
      default:
        return null
    }
  }

  // Main operation function
  const onPage = async (event) => {
    setPageRows(event.rows)
    setFirstPage(event.first)
    const newPage = event.page + 1
    const newPageRes = await pageControl(apiModule, newPage, event.rows)
    setListData(newPageRes)
  }

  return (
    <>
      {/* show dataTabale */}
      <Toast ref={toast} />
      <div className="card mt-2">
        <DataTable
          dataKey="id"
          ref={dt}
          value={listData.results}
          selection={selectInstances}
          onSelectionChange={(e) => setSelectInstances(e.value)}
          header={header}>
          <Column
            selectionMode="multiple"
            exportable={false}
            style={{ maxWidth: '1rem' }}></Column>
          <Column
            field="id"
            header="ID"
            sortable
            style={{ maxWidth: '3rem' }}></Column>
          <Column
            field="ticket_creator_hm"
            header="Creator"
            body={creatorBodyTemplate}
            style={{ mixWidth: '6rem' }}></Column>
          <Column
            field="ticket_assigner_hm"
            header="Assigner"
            body={assignerBodyTemplate}
            style={{ mixWidth: '6rem' }}></Column>
          <Column
            field="ticket_title"
            header="Title"
            style={{ minWidth: '8rem' }}></Column>
          <Column
            header="Description"
            body={(e) => shortBodyTemplate(e, 'desc')}
            style={{ minWidth: '8rem' }}></Column>
          <Column
            header="Type"
            field="ticket_type_hm"
            style={{ minWidth: '5rem' }}></Column>
          <Column
            header="Status"
            body={statusBodyTemplate}
            field="ticket_status_hm"
            style={{ minWidth: '5rem' }}></Column>
          <Column
            header="CreateTime"
            sortable
            field="created_time"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: '3rem' }}></Column>
        </DataTable>
        <Paginator
          first={firstPage}
          last={listData.count}
          totalRecords={listData.count}
          rows={pageRows}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={onPage}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate={
            'Showing {first} to {last} of {totalRecords} tickets'
          }></Paginator>
      </div>

      {/* Solve Dialog */}
      <Dialog
        visible={solveDialog}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Confirm"
        modal
        onHide={() => setSolveDialog(false)}>
        <div className="confirmation-content">
          <MyDeptTicketSolutionForm ticketIns={solveTicketIns} currentEmpId={currentEmpId}/>
        </div>
      </Dialog>
    </>
  )
}
