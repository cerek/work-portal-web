'use client'

import React, { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { Toolbar } from 'primereact/toolbar'
import { Dialog } from 'primereact/dialog'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Paginator } from 'primereact/paginator'
import { classNames } from 'primereact/utils'
import {
  searchList,
  delInsConfirm,
  dirtyValues,
  getFormErrorMessage,
} from '@/lib/utils/page'

export default function TimeoffForEmployeeList({
  timeoffForEmployeeList,
  empId,
  priorDate,
  futureDate,
  timeoffTypeList,
}) {
  const initDefaultValues = {
    timeoff_date: "",
    timeoff_start_time: "",
    timeoff_end_time: "",
    timeoff_type: null,
  }
  const apiModule = 'timeoff'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [dataInstance, setDataInstance] = useState({})
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [mutipleDeleteDialog, setMutipleDeleteDialog] = useState(false)
  const [listData, setListData] = useState(timeoffForEmployeeList)
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
  const exportCSV = () => {
    dt.current.exportCSV()
  }

  const startToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="New"
          icon="pi pi-plus"
          severity="success"
          onClick={() => setNewInstanceDialog(true)}
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          onClick={() => setMutipleDeleteDialog(true)}
          disabled={!selectInstances || !selectInstances.length}
        />
      </div>
    )
  }

  const endToolbarTemplate = () => {
    return (
      <Button
        label="Export"
        icon="pi pi-upload"
        className="p-button-help"
        onClick={exportCSV}
      />
    )
  }

  async function searchEvent() {
    const searchURI = 'timeoff-employee/' + empId + '/'
    const searchRes = await searchList(searchURI, globalFilter)
    setListData(searchRes)
  }

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Details of Employee TimeOff</h4>
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
  const nameBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-4">
        <span>
          <strong style={{ 'fontSize?': '150%' }}>
            {rowData.timeoff_employee_hm}
          </strong>
        </span>
      </div>
    )
  }

  const timeBodyTemplate = (rowData) => {
    return (
      <span>
        {rowData.timeoff_start_datetime_hm} - {rowData.timeoff_end_datetime_hm}
      </span>
    )
  }

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => confirmDelete(rowData)}
        />
      </React.Fragment>
    )
  }

  // Table delete Dialog Relative
  const confirmDelete = (ins) => {
    setDataInstance(ins)
    setDeleteDialog(true)
  }

  const deleteInstance = async () => {
    const deletedInsData = await delInsConfirm(apiModule, dataInstance.id)
    if ('error' in deletedInsData) {
      toast.current.show({
        severity: 'error',
        summary: 'Failed',
        detail: JSON.stringify(deletedInsData),
        life: 30000,
      })
    } else {
      const listRefreshData = await fetch(
        '/api/timeoff-employee/' +
          empId +
          '/?timeoff_date__gte=' +
          priorDate +
          '&timeoff_date_lte=' +
          futureDate
      )
      const newListData = await listRefreshData.json()
      setListData(newListData)
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          deletedInsData.timeoff_employee_hm +
          "'s " +
          deletedInsData.timeoff_start_datetime_hm + '-' + deleteInstance.timeoff_end_datetime_hm +
          ' deleted!',
        life: 3000,
      })
    }
    setSelectInstances(null)
    setDeleteDialog(false)
  }

  const mutipleDeleteInstance = async () => {
    const successArr = []
    const failArr = []
    for (const s of selectInstances) {
      const deletedInsData = await delInsConfirm(apiModule, s.id)
      if ('error' in deletedInsData) {
        failArr.push(s)
      } else {
        successArr.push(s)
      }
    }

    successArr.length &&
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(
            successArr.map(
              (item) => item.timeoff_date + ' - ' + '(' + item.id + ')'
            )
          ) + ' deleted!',
        life: 30000,
      })

    failArr.length &&
      toast.current.show({
        severity: 'error',
        summary: 'Failed',
        detail:
          JSON.stringify(
            failArr.map(
              (item) => item.timeoff_date + ' - ' + '(' + item.id + ')'
            )
          ) + ' not deleted!',
        life: 30000,
      })

    const listRefreshData = await fetch(
      '/api/timeoff-employee/' +
        empId +
        '/?timeoff_date__gte=' +
        priorDate +
        '&timeoff_date_lte=' +
        futureDate
    )
    const newListData = await listRefreshData.json()
    setListData(newListData)
    setMutipleDeleteDialog(false)
    setSelectInstances(null)
    router.refresh()
  }

  const deleteDialogFoot = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={() => setDeleteDialog(false)}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteInstance}
      />
    </React.Fragment>
  )

  const mutipleDeleteDialogFoot = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={() => setMutipleDeleteDialog(false)}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={mutipleDeleteInstance}
      />
    </React.Fragment>
  )

  // Main operation function
  async function onSubmit(data) {
    const dirtyData = dirtyValues(dirtyFields, data)
    const formatDirtyData = {...dirtyData, timeoff_date: dirtyData.timeoff_date.toISOString().split('T')[0], timeoff_start_time: dirtyData.timeoff_start_time.toLocaleTimeString('en-GB', { hour: "2-digit", minute: "2-digit" }), timeoff_end_time: dirtyData.timeoff_end_time.toLocaleTimeString('en-GB', { hour: "2-digit", minute: "2-digit" })}
    formatDirtyData.timeoff_employee = empId
    const res = await fetch('/api/' + apiModule, {
      method: 'POST',
      body: JSON.stringify(formatDirtyData),
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
      const listRefreshData = await fetch(
        '/api/timeoff-employee/' +
          empId +
          '/?timeoff_date__gte=' +
          priorDate +
          '&timeoff_date_lte=' +
          futureDate
      )
      const newListData = await listRefreshData.json()
      setListData(newListData)
      setNewInstanceDialog(false)
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(resData.timeoff_employee_hm) +
          'new timeoff create Successfully!!',
        life: 3000,
      })
    }
  }

  const onPage = async (event) => {
    setPageRows(event.rows)
    setFirstPage(event.first)
    const newPage = event.page + 1
    const newPageRes = await fetch(
      '/api/timeoff-employee/' +
        empId +
        '/?timeoff_date__gte=' +
        priorDate +
        '&timeoff_date_lte=' +
        futureDate +
        '&page=' + newPage +
        '&page_size=' + event.rows
    )
    const newPageResult = await newPageRes.json()
    setListData(newPageResult)
  }

  return (
    <>
      {/* show dataTabale */}
      <Toast ref={toast} />
      <div className="card">
        <Toolbar
          className="mb-4"
          start={startToolbarTemplate}
          end={endToolbarTemplate}></Toolbar>
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
            header="Applicant"
            body={nameBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="TimeOff Day"
            field="timeoff_date"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="TimeOff Time"
            body={timeBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="TimeOff Type"
            field='timeoff_type'
            style={{ minWidth: '4rem' }}></Column>
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
            'Showing {first} to {last} of {totalRecords} timeoff'
          }></Paginator>
      </div>

      {/* new instance dialog */}
      <Dialog
        visible={newInstanceDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="New TimeOff"
        modal
        className="p-fluid"
        onHide={() => setNewInstanceDialog(false)}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-column gap-2">
          <div className="field">
            <Controller
              name="timeoff_type"
              control={control}
              rules={{ required: 'Timeoff Type is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_type,
                    })}>
                    <b>TimeOff Type</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a work shift..."
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
              name="timeoff_date"
              control={control}
              rules={{ required: 'TimeOff Date is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_date,
                    })}>
                    <b>TimeOff Date</b>
                  </label>
                  <Calendar
                    inputId={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    dateFormat="yy-mm-dd"
                    showButtonBar
                    className={classNames({ 'p-invalid': fieldState.error })}
                  />
                  {getFormErrorMessage(field.name, errors)}
                </>
              )}
            />
          </div>

          <div className="field">
            <Controller
              name="timeoff_start_time"
              control={control}
              rules={{ required: 'TimeOff Start Time is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_start_time,
                    })}>
                    <b>TimeOff Date</b>
                  </label>
                  <Calendar
                    inputId={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    timeOnly
                    showButtonBar
                    className={classNames({ 'p-invalid': fieldState.error })}
                  />
                  {getFormErrorMessage(field.name, errors)}
                </>
              )}
            />
          </div>

          <div className="field">
            <Controller
              name="timeoff_end_time"
              control={control}
              rules={{ required: 'TimeOff End Time is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_end_time,
                    })}>
                    <b>TimeOff Date</b>
                  </label>
                  <Calendar
                    inputId={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    timeOnly
                    showButtonBar
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

      {/* delete dialog */}
      <Dialog
        visible={deleteDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Confirm"
        modal
        footer={deleteDialogFoot}
        onHide={() => setDeleteDialog(false)}>
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: '2rem' }}
          />
          {dataInstance && (
            <span>
              Are you sure you want to delete{' '}
              <b>
                {dataInstance.timeoff_employee_hm}'s{' '}
                {dataInstance.timeoff_date}
              </b>{' '}
              timeoff?
              <br />
              <h4>TimeOff Details</h4>
              Employee Name:{' '}
              <strong style={{ 'fontSize?': '150%' }}>
                {dataInstance.timeoff_employee_hm}
              </strong>
              <br />
              TimeOff DateTime:{' '}
              <strong style={{ 'fontSize?': '150%' }}>
                {dataInstance.timeoff_date}{' '}<br />
                {dataInstance.timeoff_start_datetime_hm} - {dataInstance.timeoff_end_datetime_hm}
              </strong>
            </span>
          )}
        </div>
      </Dialog>

      {/* mutiple delete dialog */}
      <Dialog
        visible={mutipleDeleteDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Confirm"
        modal
        footer={mutipleDeleteDialogFoot}
        onHide={() => setMutipleDeleteDialog(false)}>
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: '2rem' }}
          />
          {selectInstances && (
            <span>
              Are you sure you want to delete the selected items?
              <h4>Items List Details - Name(ID)</h4>
              {selectInstances.map((item) => (
                <li key={item.id}>
                  <strong style={{ 'fontSize?': '150%' }}>
                    {item.timeoff_date} ({item.timeoff_start_datetime_hm} - {item.timeoff_end_datetime_hm})
                  </strong>
                  <br />
                </li>
              ))}
            </span>
          )}
        </div>
      </Dialog>
    </>
  )
}
