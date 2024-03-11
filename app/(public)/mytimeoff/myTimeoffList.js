'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { Toolbar } from 'primereact/toolbar'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { Calendar } from 'primereact/calendar'
import { Paginator } from 'primereact/paginator'
import { classNames } from 'primereact/utils'
import {
  searchList,
  pageControl,
  getObjectDiff,
  dirtyValues,
  getFormErrorMessage,
} from '@/lib/utils/page'

export default function MyTimeoffList({ timeoffList, timeoffTypeList }) {
  const initDefaultValues = {
    timeoff_status: 1,
    timeoff_start_datetime: '',
    timeoff_end_datetime: '',
    timeoff_reason: '',
    timeoff_type: null,
  }
  const apiModule = 'mytimeoff'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [listData, setListData] = useState(timeoffList)
  const [selectInstances, setSelectInstances] = useState(null)
  const [firstPage, setFirstPage] = useState(0)
  const [pageRows, setPageRows] = useState(10)
  const {
    handleSubmit,
    formState: { dirtyFields, errors },
    reset,
    control,
  } = useForm({
    defaultValues: initDefaultValues,
  })

  // Table Header and Toolbar
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="New"
          icon="pi pi-plus"
          severity="success"
          onClick={() => setNewInstanceDialog(true)}
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
      <h4 className="m-0">My TimeOff</h4>
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
  const typeBodyTemplate = (rowData) => {
    return <span>{rowData.timeoff_type_hm}</span>
  }

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag severity={getSeverity(rowData.timeoff_status_hm)}>
        {rowData.timeoff_status_hm}
      </Tag>
    )
  }

  const approverBodyTemplate = (rowData) => {
    return <span>{rowData.timeoff_approval_employee_hm}</span>
  }

  const startBodyTemplate = (rowData) => {
    return (
      <span className="font-bold">
        {new Date(rowData.timeoff_start_datetime).toLocaleString()}
      </span>
    )
  }

  const endBodyTemplate = (rowData) => {
    return (
      <span className="font-bold">
        {new Date(rowData.timeoff_end_datetime).toLocaleString()}
      </span>
    )
  }

  const getSeverity = (insStatus) => {
    switch (insStatus) {
      case 'Apply':
        return 'info'
      case 'HR Approval':
        return 'success'
      case 'Manager Approval':
        return 'primary'
      case 'Cancel':
        return 'danger'
      default:
        return null
    }
  }

  // RowEditor Relative
  const onRowEditComplete = async (e) => {
    let { newData, data } = e
    // [INFO] -- When the bug was fixed by primereact, I will use the data and newData rathen than send a new GET request to back-end server
    // [Bug Issue] https://github.com/primefaces/primereact/issues/2424
    // Since the DataTable with rowEdit feature have a bug in data(originalData), so need to retireve the original data
    // from back-end for getting the dirtyData between the newData.
    const originalDataRes = await fetch('/api/' + apiModule + '/' + data.id, {
      method: 'GET',
    })
    if (!originalDataRes.ok) {
      const resData = await originalDataRes.json()
      toast.current.show({
        severity: 'error',
        summary: 'Failed',
        detail: JSON.stringify(resData),
        life: 30000,
      })
    } else {
      const originalData = await originalDataRes.json()
      const dirtyData = getObjectDiff(originalData, newData)
      const res = await fetch('/api/' + apiModule + '/' + data.id, {
        method: 'PATCH',
        body: JSON.stringify(dirtyData),
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
        const resData = await res.json()
        toast.current.show({
          severity: 'success',
          summary: 'Successful',
          detail:
            JSON.stringify(resData.timeoff_apply_employee_hm) +
            "'s timeoff update Successfully!!",
          life: 3000,
        })
        const listRefreshData = await fetch('/api/' + apiModule)
        const newListData = await listRefreshData.json()
        setListData(newListData)
        router.refresh()
      }
    }
  }

  const textEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value}
        disabled={options.rowData.timeoff_status !== 1 ? true : false }
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    )
  }

  const typeEditor = (options) => {
    return (
      <Dropdown
        id="timeoff_type"
        value={options.value}
        disabled={options.rowData.timeoff_status !== 1 ? true : false }
        onChange={(e) => options.editorCallback(e.value)}
        placeholder="Select a type"
        options={timeoffTypeList}
      />
    )
  }

  const allowEdit = (rowData) => {
    const offsetInMinutes = -8 * 60
    // const endTimeUTC = new Date(rowData.timeoff_end_datetime).getTime()
    const endTime = new Date(rowData.timeoff_end_datetime).getTime() + offsetInMinutes * 60 * 1000
    const nowTime = new Date().getTime()
    const limitTime = Math.ceil((endTime - nowTime) / (1000 * 60 * 60 * 24))
    if (limitTime > 1 && [1,2,3].includes(rowData.timeoff_status) ) {
        return true
    } else {
        return false
    }
  }

  const statusEditor = (options) => {
    return (
      <Dropdown
        id="timeoff_status"
        value={options.value}
        onChange={(e) => options.editorCallback(e.value)}
        disabled={options.rowData.timeoff_status !== 1 ? true : false }
        placeholder="Select a Status"
        options={[{ value: 1, label: 'Apply' }, { value: 4, label: 'Cancel' }]}
      />
    )
  }

  const startDatetimeEditor = (options) => {
    return (
      <Calendar
        id="timeoff_start_datetime"
        value={options.value}
        onChange={(e) => options.editorCallback(e.value)}
        dateFormat="dd/mm/yy"
        disabled={options.rowData.timeoff_status !== 1 ? true : false }
        showTime
        showButtonBar
        hourFormat="24"
      />
    )
  }

  const endDatetimeEditor = (options) => {
    return (
      <Calendar
        id="timeoff_end_datetime"
        value={options.value}
        onChange={(e) => options.editorCallback(e.value)}
        dateFormat="dd/mm/yy"
        disabled={options.rowData.timeoff_status !== 1 ? true : false }
        showTime
        showButtonBar
        hourFormat="24"
      />
    )
  }

  // Main operation function
  async function onSubmit(data) {
    const dirtyData = dirtyValues(dirtyFields, data)
    const res = await fetch('/api/' + apiModule, {
      method: 'POST',
      body: JSON.stringify(dirtyData),
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
      const resData = await res.json()
      const listRefreshData = await fetch('/api/' + apiModule)
      const newListData = await listRefreshData.json()
      setListData(newListData)
      router.refresh()
      setNewInstanceDialog(false)
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(resData.timeoff_apply_employee_hm) +
          "'s timeoff create Successfully!!",
        life: 3000,
      })
    }
  }

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
        <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>
        <DataTable
          dataKey="id"
          editMode="row"
          onRowEditComplete={onRowEditComplete}
          ref={dt}
          value={listData.results}
          selection={selectInstances}
          onSelectionChange={(e) => setSelectInstances(e.value)}
          header={header}>
          <Column
            selectionMode="multiple"
            exportable={false}
            style={{ maxWidth: '1rem' }}></Column>
          <Column field="id" header="ID" style={{ maxWidth: '3rem' }}></Column>
          <Column
            field="timeoff_apply_employee_hm"
            header="Applicant"
            style={{ maxWidth: '4rem' }}></Column>
          <Column
            header="TimeOff Reason"
            editor={(options) => textEditor(options)}
            sortable
            field="timeoff_reason"
            style={{ minWidth: '8rem' }}></Column>
          <Column
            header="Type"
            editor={(options) => typeEditor(options)}
            field="timeoff_type"
            sortable
            body={typeBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Status"
            field="timeoff_status"
            body={statusBodyTemplate}
            editor={(options) => statusEditor(options)}
            sortable
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Start Datetime"
            field="timeoff_start_datetime"
            body={startBodyTemplate}
            editor={(options) => startDatetimeEditor(options)}
            style={{ minWidth: '5rem' }}></Column>
          <Column
            header="End Datetime"
            field="timeoff_end_datetime"
            body={endBodyTemplate}
            editor={(options) => endDatetimeEditor(options)}
            style={{ minWidth: '5rem' }}></Column>
          <Column
            header="Timeoff Hours"
            field="timeoff_hours"
            style={{ minWidth: '5rem' }}></Column>
          <Column
            header="Approver"
            field="timeoff_approval_employee"
            body={approverBodyTemplate}
            style={{ maxWidth: '6rem' }}></Column>
          <Column
            header="CreateTime"
            sortable
            field="created_time"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            rowEditor={allowEdit}
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
            'Showing {first} to {last} of {totalRecords} timeoffs'
          }></Paginator>
      </div>

      {/* new instance dialog */}
      <Dialog
        visible={newInstanceDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="New Timeoff"
        modal
        className="p-fluid"
        onHide={() => setNewInstanceDialog(false)}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-column gap-2">
          <div className="field">
            <Controller
              name="timeoff_reason"
              control={control}
              rules={{ required: 'Timeoff reason is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_reason,
                    })}>
                    <b>Reason</b>
                  </label>
                  <InputTextarea
                    id={field.name}
                    {...field}
                    rows={4}
                    cols={30}
                    className={classNames({ 'p-invalid': fieldState.error })}
                  />
                  {getFormErrorMessage(field.name, errors)}
                </>
              )}
            />
          </div>

          <div className="field">
            <Controller
              name="timeoff_type"
              control={control}
              rules={{ required: 'Timeoff type is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_type,
                    })}>
                    <b>Timeoff Type</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a timeoff type..."
                    options={timeoffTypeList}
                    optionValue="value"
                    focusInputRef={field.ref}
                    onChange={(e) => field.onChange(e.value)}
                    className={classNames({ 'p-invalid': fieldState.error })}
                  />
                  {getFormErrorMessage(field.name, errors)}
                </>
              )}
            />
          </div>

          <div className="field">
            <Controller
              name="timeoff_start_datetime"
              control={control}
              rules={{ required: 'Timeoff start is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_start_datetime,
                    })}>
                    <b>Timeoff Start</b>
                  </label>
                  <Calendar
                    inputId={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    dateFormat="dd/mm/yy"
                    showTime
                    showButtonBar
                    hourFormat="24"
                    className={classNames({ 'p-invalid': fieldState.error })}
                  />
                  {getFormErrorMessage(field.name, errors)}
                </>
              )}
            />
          </div>

          <div className="field">
            <Controller
              name="timeoff_end_datetime"
              control={control}
              rules={{ required: 'Timeoff end is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_end_datetime,
                    })}>
                    <b>Timeoff End</b>
                  </label>
                  <Calendar
                    inputId={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    dateFormat="dd/mm/yy"
                    showTime
                    showButtonBar
                    hourFormat="24"
                    className={classNames({ 'p-invalid': fieldState.error })}
                  />
                  {getFormErrorMessage(field.name, errors)}
                </>
              )}
            />
          </div>

          <div className="flex flex-wrap justify-content-center gap-2 mb-2">
            <Button raised rounded label="Create" type="submit"></Button>
            <Button
              raised
              rounded
              label="Reset"
              severity="danger"
              onClick={() => {
                reset()
              }}
              type="button"></Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
