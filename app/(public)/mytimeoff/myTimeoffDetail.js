'use client'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import MyCalender from '@/components/calender/page'
import { Toast } from 'primereact/toast'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { InputTextarea } from 'primereact/inputtextarea'
import { Toolbar } from 'primereact/toolbar'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Paginator } from 'primereact/paginator'
import { Dialog } from 'primereact/dialog'
import { Sidebar } from 'primereact/sidebar'
import { classNames } from 'primereact/utils'
import {
  searchList,
  pageControl,
  dirtyValues,
  getFormErrorMessage,
} from '@/lib/utils/page'

export default function MyTimeoffDetail({
  calData,
  myTimeoffApplicationList,
  timeoffTypeList,
}) {
  const initDefaultValues = {
    timeoff_application_start_datetime: '',
    timeoff_application_end_datetime: '',
    timeoff_application_apply_reason: '',
    timeoff_application_type: null,
  }
  const apiModule = 'mytimeoffapplication'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [detailSidebar, setDetailSidebar] = useState(false)
  const [submitMethod, setSubmitMethod] = useState('POST')
  const [globalFilter, setGlobalFilter] = useState('')
  const [detailInstance, setDetailInstance] = useState({})
  const [listData, setListData] = useState(myTimeoffApplicationList)
  const [cancelInstance, setCancelInstance] = useState(null)
  const [displayConfirmation, setDisplayConfirmation] = useState(false)
  const [firstPage, setFirstPage] = useState(0)
  const [pageRows, setPageRows] = useState(10)
  const {
    handleSubmit,
    formState: { dirtyFields, errors },
    reset,
    setValue,
    control,
  } = useForm({
    defaultValues: initDefaultValues,
  })

  // Table Header and Toolbar
  const startToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="New"
          icon="pi pi-plus"
          severity="success"
          onClick={() => {
            setNewInstanceDialog(true)
            setSubmitMethod('POST')
            reset()
          }}
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
      <h4 className="m-0">My TimeOff Apply</h4>
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

  // Main operation function
  const getInstanceDate = async (id) => {
    const res = await fetch('/api/' + apiModule + '/' + id)
    const resData = await res.json()
    if (!res.ok) {
      toast.current.show({
        severity: 'error',
        summary: 'Failed',
        detail: JSON.stringify(resData),
        life: 30000,
      })
    } else {
      return resData
    }
  }

  const timeoffDetailCheck = async (id) => {
    const resData = await getInstanceDate(id)
    setDetailInstance(resData)
    setDetailSidebar(true)
  }

  const timeoffApplicationEdit = async (id) => {
    const resData = await getInstanceDate(id)
    setValue('id', resData.id, { shouldDirty: true })
    setValue('timeoff_application_type', resData.timeoff_application_type)
    setValue(
      'timeoff_application_apply_reason',
      resData.timeoff_application_apply_reason
    )
    setValue(
      'timeoff_application_start_datetime',
      new Date(resData.timeoff_application_start_datetime)
    )
    setValue(
      'timeoff_application_end_datetime',
      new Date(resData.timeoff_application_end_datetime)
    )
    setSubmitMethod('PATCH')
    setNewInstanceDialog(true)
  }

  const timeoffApplicationCancel = async (r) => {
    setCancelInstance(r)
    setDisplayConfirmation(true)
  }

  const onPage = async (event) => {
    setPageRows(event.rows)
    setFirstPage(event.first)
    const newPage = event.page + 1
    const newPageRes = await pageControl(apiModule, newPage, event.rows)
    setListData(newPageRes)
  }

  // Main operation function
  async function onSubmit(data) {
    let endPointUrl = ''
    const dirtyData = dirtyValues(dirtyFields, data)
    console.log(dirtyData)
    if ('timeoff_application_start_datetime' in dirtyData) {
      dirtyData.timeoff_application_start_datetime =
        dirtyData.timeoff_application_start_datetime.toISOString()
    }
    if ('timeoff_application_end_datetime' in dirtyData) {
      dirtyData.timeoff_application_end_datetime =
        dirtyData.timeoff_application_end_datetime.toISOString()
    }
    if (submitMethod === 'POST') {
      endPointUrl = '/api/' + apiModule
    } else if (submitMethod === 'PATCH') {
      endPointUrl = '/api/' + apiModule + '/' + dirtyData.id
    }
    const res = await fetch(endPointUrl, {
      method: submitMethod,
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
      setNewInstanceDialog(false)
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(resData.timeoff_application_apply_reason) +
          'Create Successfully!!',
        life: 3000,
      })
    }
  }

  const handleCancelTimeoffApplication = async () => {
    const cancelBody = { timeoff_application_status: 4 }
    const res = await fetch('/api/' + apiModule + '/' + cancelInstance.id, {
      method: 'PATCH',
      body: JSON.stringify(cancelBody),
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
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          cancelInstance.timeoff_application_apply_reason +
          ' was cancel successfully!!',
        life: 10000,
      })
    }
    setCancelInstance(null)
    setDisplayConfirmation(false)
  }

  // Table Template
  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.timeoff_application_status_hm}
        severity={getSeverity(rowData.timeoff_application_status_hm)}></Tag>
    )
  }

  const confirmationDialogFooter = (
    <>
      <Button
        type="button"
        label="No"
        icon="pi pi-times"
        onClick={() => setDisplayConfirmation(false)}
      />
      <Button
        type="button"
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={handleCancelTimeoffApplication}
        autoFocus
      />
    </>
  )

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-eye"
          severity="primary"
          rounded
          className="mr-2"
          onClick={() => timeoffDetailCheck(rowData.id)}
        />
        {rowData.timeoff_application_status_hm === 'Apply' && (
          <>
            <Button
              icon="pi pi-pencil"
              severity="warning"
              rounded
              className="mr-2"
              onClick={() => timeoffApplicationEdit(rowData.id)}
            />
            <Button
              icon="pi pi-times"
              severity="danger"
              rounded
              className="mr-2"
              onClick={() => timeoffApplicationCancel(rowData)}
            />
          </>
        )}
      </React.Fragment>
    )
  }

  const getSeverity = (intStatus) => {
    switch (intStatus) {
      case 'Manager Approval':
      case 'HR Approval':
        return 'success'
      case 'Reject':
      case 'Cancel':
        return 'danger'
      case 'Apply':
        return 'warning'
      default:
        return null
    }
  }

  return (
    <>
      <div className="col-12 md:col-5">
        <div className="card">
          <MyCalender calEvent={calData} />
        </div>
      </div>

      <div className="col-12 md:col-7">
        <Toast ref={toast} />
        <div className="card">
          <Toolbar className="mb-4" start={startToolbarTemplate}></Toolbar>
          <DataTable
            dataKey="id"
            ref={dt}
            value={listData.results}
            header={header}>
            <Column
              header="Applicant"
              field="timeoff_application_applicant_hm"
              style={{ minWidth: '4rem' }}></Column>
            <Column
              header="Approver"
              field="timeoff_application_approver_hm"
              style={{ minWidth: '6rem' }}></Column>
            <Column
              header="Apply Reason"
              field="timeoff_application_apply_reason"
              style={{ minWidth: '4rem' }}></Column>
            <Column
              header="Reject Reason"
              field="timeoff_application_reject_reason"
              style={{ minWidth: '4rem' }}></Column>
            <Column
              header="Status"
              body={statusBodyTemplate}
              style={{ minWidth: '4rem' }}></Column>
            <Column
              header="Type"
              field="timeoff_application_type_hm"
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
              'Showing {first} to {last} of {totalRecords} timeoff applications'
            }></Paginator>
        </div>
      </div>

      {/* new instance dialog */}
      <Dialog
        visible={newInstanceDialog}
        style={{ width: '50rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header={
          submitMethod === 'POST'
            ? 'New TimeOff Application'
            : 'Update TimeOff Application'
        }
        modal
        className="p-fluid"
        onHide={() => setNewInstanceDialog(false)}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-column gap-2">
          <div className="p-fluid formgrid grid">
            <div className="field col-12" hidden>
              <Controller
                name="id"
                control={control}
                render={({ field, fieldState }) => (
                  <InputText
                    id={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>

            <div className="field col-12">
              <Controller
                name="timeoff_application_apply_reason"
                control={control}
                rules={{ required: 'Timeoff Reason is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.timeoff_application_apply_reason,
                      })}>
                      <b>TimeOff Apply Reason</b>
                    </label>
                    <InputTextarea
                      id={field.name}
                      {...field}
                      rows={4}
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div className="field col-12">
              <Controller
                name="timeoff_application_type"
                control={control}
                rules={{ required: 'Timeoff type is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.timeoff_application_type,
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

            <div className="field col-12">
              <Controller
                name="timeoff_application_start_datetime"
                control={control}
                rules={{ required: 'Timeoff start is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.timeoff_application_start_datetime,
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

            <div className="field col-12">
              <Controller
                name="timeoff_application_end_datetime"
                control={control}
                rules={{ required: 'Timeoff end is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.timeoff_application_end_datetime,
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
          </div>

          <div className="flex flex-wrap justify-content-center gap-2 mb-2">
            <Button
              raised
              rounded
              label={submitMethod === 'POST' ? 'Create' : 'Update'}
              type="submit"></Button>
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

      {/* Detail sidebar */}
      <Sidebar
        visible={detailSidebar}
        position="right"
        className="w-full md:w-10rem lg:w-30rem"
        onHide={() => setDetailSidebar(false)}>
        <h3>TimeOff Application Details</h3>
        <h2>{detailInstance.timeoff_application_applicant_hm}</h2>
        <p>
          TimeOff Application Type: {detailInstance.timeoff_application_type_hm}
        </p>
        <p>
          TimeOff Application Status:{' '}
          <Tag
            value={detailInstance.timeoff_application_status_hm}
            severity={getSeverity(
              detailInstance.timeoff_application_status_hm
            )}></Tag>{' '}
        </p>
        {detailInstance.timeoff_application_status_hm === 'HR Approval' ||
          (detailInstance.timeoff_application_status_hm === 'Manager Approval' && (
            <p>
              TimeOff Application Approver:{' '}
              {detailInstance.timeoff_application_approver_hm}
            </p>
          ))}
        <p>TimeOff Start Date: {detailInstance.timeoff_application_start_datetime}</p>
        <p>TimeOff End Date: {detailInstance.timeoff_application_end_datetime}</p>
        <p>
          TimeOff Apply Reason: {detailInstance.timeoff_application_apply_reason}
        </p>
        {detailInstance.timeoff_application_status_hm === 'Reject' && (
          <p>
            TimeOff Reject Reason:{' '}
            {detailInstance.timeoff_application_reject_reason}
          </p>
        )}
      </Sidebar>

      {/* Cancel confirmation dialog */}
      <Dialog
        header="Confirmation"
        visible={displayConfirmation}
        onHide={() => setDisplayConfirmation(false)}
        style={{ width: '350px' }}
        modal
        footer={confirmationDialogFooter}>
        <div className="flex align-items-center justify-content-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: '2rem' }}
          />
          <span>
            Are you sure you want to Cancel this TimeOff Request?
          </span>
        </div>
        <p></p>
        <p>{cancelInstance?.timeoff_application_apply_reason}</p>
      </Dialog>
    </>
  )
}
