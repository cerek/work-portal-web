'use client'

import React, { useState, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Paginator } from 'primereact/paginator'
import { Tag } from 'primereact/tag'
import { searchList, pageControl } from '@/lib/utils/page'

export default function TaskResultList({ taskResultList }) {
  const apiModule = 'task/result'
  const dt = useRef(null)
  const toast = useRef(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [listData, setListData] = useState(taskResultList)
  const [firstPage, setFirstPage] = useState(0)
  const [pageRows, setPageRows] = useState(10)

  // Table Header and Toolbar
  async function searchEvent() {
    const searchRes = await searchList(apiModule, globalFilter)
    setListData(searchRes)
  }

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Task Result</h4>
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

  // Table Template
  const statusBodyTemplate = (rowData) => {
    return (
      <Tag severity={getSeverity(rowData.status)}>
        {rowData.status}
      </Tag>
    )
  }

  const getSeverity = (insPeriodic) => {
    switch (insPeriodic) {
      case 'SUCCESS':
        return 'success'
      case 'FAILURE':
        return 'danger'
      case 'REVOKED':
        return 'danger'
      default:
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
        <DataTable
          dataKey="id"
          ref={dt}
          value={listData.results}
          header={header}>
          <Column
            field="id"
            header="ID"
            sortable
            style={{ maxWidth: '4rem' }}></Column>
          <Column
            header="Task Id"
            sortable
            field="task_id"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Periodic Task Name"
            className="font-bold text-xl"
            field="periodic_task_name"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Task Path"
            className="font-bold text-xl"
            sortable
            field="task_name"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Task Status"
            body={statusBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Task Result"
            field="result"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Traceback"
            field="traceback"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Created Time"
            field="date_created"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Done Time"
            field="date_done"
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
            'Showing {first} to {last} of {totalRecords} results'
          }></Paginator>
      </div>
    </>
  )
}
