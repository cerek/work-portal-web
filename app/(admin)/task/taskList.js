'use client'

import Link from 'next/link'
import React, { useState, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Paginator } from 'primereact/paginator'
import { Tag } from 'primereact/tag'
import { Sidebar } from 'primereact/sidebar'
import { searchList, pageControl } from '@/lib/utils/page'

export default function TaskList({ taskList }) {
  const apiModule = 'task'
  const dt = useRef(null)
  const toast = useRef(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [listData, setListData] = useState(taskList)
  const [selectInstances, setSelectInstances] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailShow, setDetailShow] = useState({})
  const [firstPage, setFirstPage] = useState(0)
  const [pageRows, setPageRows] = useState(10)

  // Table Header and Toolbar
  const startToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href={'/task/create'}>
          <Button label="New" icon="pi pi-plus" severity="success" />
        </Link>
        <Button
          label="Disable"
          icon="pi pi-times"
          severity="danger"
          onClick={() => setMutipleDeleteDialog(true)}
          disabled={!selectInstances || !selectInstances.length}
        />
      </div>
    )
  }

  async function searchEvent() {
    const searchRes = await searchList(apiModule, globalFilter)
    setListData(searchRes)
  }

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Tasks</h4>
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

  const showTaskDetail = async (rowData) => {
    const taskId = rowData.id
    const res = await fetch('/api/' + apiModule + '/' + taskId)
      if (!res.ok) {
        const resData = await res.json()
        toast.current.show({
          severity: 'error',
          summary: 'Failed',
          detail: JSON.stringify(resData),
          life: 30000,
        })
      } else {
        const resData = await res.json()
        setDetailShow(resData)
        setDetailVisible(true)
      }
  }

  // Table Template
  const typeBodyTemplate = (rowData) => {
    return (
      <Tag severity={getSeverity(rowData.task_type_hm)}>
        {rowData.task_type_hm}
      </Tag>
    )
  }

  const periodicBodyTemplate = (rowData) => {
    if (rowData.interval !== null) {
      return rowData.interval_hm
    }
    if (rowData.crontab !== null) {
      return rowData.crontab_hm
    }
    if (rowData.clocked !== null) {
      return rowData.clocked_hm
    }
  }

  const enabledBodyTemplate = (rowData) => {
    if (rowData.enabled == false) {
      return <Tag severity="danger" icon="pi pi-times" value="Disabled"></Tag>
    } else if (rowData.enabled == true) {
      return <Tag severity="success" icon="pi pi-check" value="Actived"></Tag>
    }
  }

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-eye"
          rounded
          severity="info"
          className="mr-2"
          onClick={() => showTaskDetail(rowData)}
        />
        <Link href={'/task/update/' + rowData.id}>
          <Button
            icon="pi pi-pencil"
            rounded
            className="mr-2"
            severity="warning"
          />
        </Link>
        <Link href={'/task/result/' + rowData.name}>
          <Button
            icon="pi pi-comments"
            rounded
            className="mr-2"
            severity="warning"
          />
        </Link>
      </React.Fragment>
    )
  }

  const getSeverity = (insPeriodic) => {
    switch (insPeriodic) {
      case 'OneTime Job':
        return 'info'
      case 'Cron Job':
        return 'success'
      case 'Interval Job':
        return 'warning'
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
      <div className="card">
        <Toolbar
          className="mb-4"
          start={startToolbarTemplate}></Toolbar>
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
            style={{ maxWidth: '2rem' }}></Column>
          <Column
            field="id"
            header="ID"
            sortable
            style={{ maxWidth: '4rem' }}></Column>
          <Column
            header="Creator"
            sortable
            field="task_creator_hm"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Task Name"
            className="font-bold text-xl"
            sortable
            field="name"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Task Path"
            className="font-bold text-xl"
            field="task"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Task Type"
            body={typeBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Task Periodic"
            body={periodicBodyTemplate}
            style={{ maxWidth: '9rem' }}></Column>
          <Column
            header="One Off"
            className="font-bold text-xl"
            field="one_off"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Enabled"
            body={enabledBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Created Time"
            field="created_time"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            body={actionBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
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
            'Showing {first} to {last} of {totalRecords} tasks'
          }></Paginator>
      </div>

      {/* The details of task */}
      <Sidebar visible={detailVisible} position="right" onHide={() => setDetailVisible(false)} className="w-full md:w-30rem lg:w-40rem">
        <h2>More Details about:</h2>
        <h2>{detailShow?.name}</h2>
        <p>Task Start at: {detailShow?.start_time} </p>
        <p>Task End at: {detailShow?.expires} </p>
        <p>Task Last Run at: {detailShow?.last_run_at} </p>
        <p>Task Total Run Count at: {detailShow?.total_run_count} </p>
        <p>Task Args: {detailShow?.args} </p>
        <p>Task Kwargs: {detailShow?.kwargs} </p>
        <p>Task Description: {detailShow?.description} </p>
        <p>Task Queue: {detailShow?.queue} </p>
        <p>Task Priority: {detailShow?.priority} </p>
      </Sidebar>
    </>
  )
}
