'use client'

import React, { useState, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Paginator } from 'primereact/paginator'
import { Tag } from 'primereact/tag'
import { InputTextarea } from 'primereact/inputtextarea'
import { OverlayPanel } from 'primereact/overlaypanel'
import { searchList, pageControl } from '@/lib/utils/page'

export default function SystemLogsList({ systemLogsList }) {
  const apiModule = 'systemlogs'
  const dt = useRef(null)
  const toast = useRef(null)
  const opRequest = useRef(null)
  const opResponse = useRef(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [requestBody, setRequestBody] = useState('')
  const [responseBody, setResponseBody] = useState('')
  const [listData, setListData] = useState(systemLogsList)
  const [firstPage, setFirstPage] = useState(0)
  const [pageRows, setPageRows] = useState(10)


  async function searchEvent() {
    const searchRes = await searchList(apiModule, globalFilter)
    setListData(searchRes)
  }

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">System Logs</h4>
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
  const methodBodyTemplate = (rowData) => {
    return (
      <Tag severity={getSeverity(rowData.systemlog_request_method_hm)}>
        {rowData.systemlog_request_method_hm}
      </Tag>
    )
  }

  const codeBodyTemplate = (rowData) => {
    var severityLevel = ''
    const responseCode = rowData.systemlog_response_code.toString()
    if (responseCode.startsWith('20')) {
      severityLevel = 'success'
    } else if (responseCode.startsWith('30')) {
      severityLevel = 'info'
    } else if (responseCode.startsWith('40') || responseCode.startsWith('50')) {
      severityLevel = 'danger'
    }
    return <Tag severity={severityLevel}>{rowData.systemlog_response_code}</Tag>
  }

  const getRequestResponseBody = async (getType, id, e) => {
    const logDataRes = await fetch('/api/' + apiModule + '/' + id)
    const logData = await logDataRes.json()
    if (!logDataRes.ok) {
      toast.current.show({
        severity: 'error',
        summary: 'Failed',
        detail: JSON.stringify(logData),
        life: 30000,
      })
    } else {
      if (getType === 'request') {
        var formatBody = logData.systemlog_request_body.replaceAll("'", '"')
        var parseJSON = JSON.parse(formatBody)
        var prettyJSON = JSON.stringify(parseJSON, undefined, 2)
        setRequestBody(prettyJSON)
        opRequest.current.toggle(e)
      } else if (getType === 'response') {
        var formatBody = logData.systemlog_response_context.replaceAll("'", '"')
        var parseJSON = JSON.parse(formatBody)
        var prettyJSON = JSON.stringify(parseJSON, undefined, 2)
        setResponseBody(prettyJSON)
        opResponse.current.toggle(e)
      }
    }
  }

  const requestBodyTemplate = (rowData) => {
    if (rowData.systemlog_request_body !== '-') {
      return (
        <>
          <Button
            type="button"
            icon="pi pi-info-circle"
            label="Detail"
            severity='warning'
            onClick={(e) => getRequestResponseBody('request', rowData.id, e)}
          />
          <OverlayPanel showCloseIcon ref={opRequest}>
            <InputTextarea
              disabled
              autoResize
              value={requestBody}
              style={{ width: '966px' }}
            />
          </OverlayPanel>
        </>
      )
    } else {
      return rowData.systemlog_request_body
    }
  }

  const responseBodyTemplate = (rowData) => {
    if (rowData.systemlog_response_context !== '-') {
      return (
        <>
          <Button
            type="button"
            icon="pi pi-info-circle"
            label="Detail"
            severity='warning'
            onClick={(e) => getRequestResponseBody('response', rowData.id, e)}
          />
          <OverlayPanel showCloseIcon ref={opResponse}>
            <InputTextarea
              disabled
              autoResize
              value={responseBody}
              style={{ width: '966px' }}
            />
          </OverlayPanel>
        </>
      )
    } else {
      return rowData.systemlog_response_context
    }
  }

  const getSeverity = (insStatus) => {
    switch (insStatus) {
      case 'GET':
        return 'info'
      case 'POST':
        return 'success'
      case 'PATCH':
        return 'success'
      case 'PUT':
        return 'primary'
      case 'DELETE':
        return 'danger'
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
            header="Operator"
            className="font-bold text-xl"
            sortable
            field="systemlog_operator"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Deptment"
            className="font-bold text-xl"
            sortable
            field="systemlog_operator_dept"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Request Path"
            className="font-bold text-xl"
            field="systemlog_operate_module"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="HTTP Method"
            field="systemlog_request_method_hm"
            body={methodBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Request Body"
            body={requestBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Client IP"
            className="font-bold text-xl"
            field="systemlog_request_ip"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Request Agent"
            field="systemlog_request_agent"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Response Code"
            field="systemlog_response_code"
            body={codeBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Response Data"
            body={responseBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Response Duration(s)"
            field="systemlog_response_duration"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Request Time"
            field="systemlog_request_time"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            rowEditor
            headerStyle={{ width: '10%', minWidth: '8rem' }}
            bodyStyle={{ textAlign: 'center' }}></Column>
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
            'Showing {first} to {last} of {totalRecords} systemlogs'
          }></Paginator>
      </div>
    </>
  )
}
