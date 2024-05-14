'use client'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import MyCalender from '@/components/calender/page'
import { Toast } from 'primereact/toast'
import { Tag } from 'primereact/tag'
import { Badge } from 'primereact/badge'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { MultiSelect } from 'primereact/multiselect'
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

export default function MyScheduleDetail({
  myScheduleList,
  myTimeOffList,
  myScheduleChangeList,
  workShiftList,
}) {
  const initDefaultValues = {
    schedule_change_apply_reason: '',
    schedule_change_reject_reason: '',
    schedule_change_type: null,
    schedule_change_status: null,
    schedule_change_start_date: '',
    schedule_change_end_date: '',
    schedule_change_off_date: '',
    schedule_change_work_date: '',
    schedule_change_work_day: '',
    schedule_change_applicant: null,
    schedule_change_approver: null,
    schedule_change_work_shift: null,
  }
  const apiModule = 'myschedulechange'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [selectedTypeValue, setSelectedTypeValue] = useState('')
  const [detailSidebar, setDetailSidebar] = useState(false)
  const [submitMethod, setSubmitMethod] = useState('POST')
  const [globalFilter, setGlobalFilter] = useState('')
  const [detailInstance, setDetailInstance] = useState({})
  const [listData, setListData] = useState(myScheduleChangeList)
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
            reset()}
          }
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
      <h4 className="m-0">My Schedule Change Apply</h4>
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

  const scheduleDetailCheck = async (id) => {
    const resData = await getInstanceDate(id)
    setDetailInstance(resData)
    setDetailSidebar(true)
  }

  const scheduleChangeEdit = async (id) => {
    const resData = await getInstanceDate(id)
    setSelectedTypeValue(resData.schedule_change_type)
    setValue('id', resData.id, { shouldDirty: true })
    setValue('schedule_change_type', resData.schedule_change_type)
    setValue('schedule_change_apply_reason', resData.schedule_change_apply_reason)
    setValue('schedule_change_work_shift', resData.schedule_change_work_shift)
    if (resData.schedule_change_type === 0) {
      const workDateStrArr = resData.schedule_change_work_date && resData.schedule_change_work_date.split(',') || []
      const offDateStrArr = resData.schedule_change_off_date && resData.schedule_change_off_date.split(',') || []
      const workDateArr = workDateStrArr.map((item) => new Date(item + ' 00:00:00'))
      const offDateArr = offDateStrArr.map((item) => new Date(item + ' 00:00:00'))
      setValue('schedule_change_work_date', workDateArr)
      setValue('schedule_change_off_date', offDateArr)
    }
    if (resData.schedule_change_type === 1) {
      setValue('schedule_change_start_date', new Date(resData.schedule_change_start_date + ' 00:00:00'))
      setValue('schedule_change_end_date', new Date(resData.schedule_change_end_date + ' 00:00:00'))
      const workDayStrArr = resData.schedule_change_work_day && resData.schedule_change_work_day.split(',') || []
      const workDayArr = workDayStrArr.map((item) => parseInt(item))
      setValue('schedule_change_work_day', workDayArr)
    }
    setSubmitMethod('PATCH')
    setNewInstanceDialog(true)
  }

  const scheduleChangeCancel = async (r) => {
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
    if ('schedule_change_work_day' in dirtyData) {
      dirtyData.schedule_change_work_day =
        dirtyData.schedule_change_work_day.toString()
    }
    if ('schedule_change_end_date' in dirtyData) {
      dirtyData.schedule_change_end_date = dirtyData.schedule_change_end_date
        .toISOString()
        .split('T')[0]
    }
    if ('schedule_change_start_date' in dirtyData) {
      dirtyData.schedule_change_start_date =
        dirtyData.schedule_change_start_date.toISOString().split('T')[0]
    }
    if ('schedule_change_work_date' in dirtyData) {
      const workDateStringArr = dirtyData.schedule_change_work_date.map(
        (item) => item.toISOString().split('T')[0]
      )
      dirtyData.schedule_change_work_date = workDateStringArr.toString()
    }
    if ('schedule_change_off_date' in dirtyData) {
      const offDateStringArr = dirtyData.schedule_change_off_date.map(
        (item) => item.toISOString().split('T')[0]
      )
      dirtyData.schedule_change_off_date = offDateStringArr.toString()
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
          JSON.stringify(resData.schedule_change_apply_reason) +
          'Create Successfully!!',
        life: 3000,
      })
    }
  }

  const scheduleTypeContext = (f, event) => {
    f.onChange(event.value)
    setSelectedTypeValue(event.value)
  }

  const handleCancelScheduleChange = async () => {
    const cancelBody = { schedule_change_status: 3 }
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
          cancelInstance.schedule_change_apply_reason +
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
        value={rowData.schedule_change_status_hm}
        severity={getSeverity(rowData.schedule_change_status_hm)}></Tag>
    )
  }

  const typeBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.schedule_change_type_hm}
        severity={getSeverity(rowData.schedule_change_type_hm)}></Tag>
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
        onClick={handleCancelScheduleChange}
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
          onClick={() => scheduleDetailCheck(rowData.id)}
        />
        {rowData.schedule_change_status_hm === 'New' && (
          <>
            <Button
              icon="pi pi-pencil"
              severity="warning"
              rounded
              className="mr-2"
              onClick={() => scheduleChangeEdit(rowData.id)}
            />
            <Button
              icon="pi pi-times"
              severity="danger"
              rounded
              className="mr-2"
              onClick={() => scheduleChangeCancel(rowData)}
            />
          </>
        )}
      </React.Fragment>
    )
  }

  const getSeverity = (intStatus) => {
    switch (intStatus) {
      case 'Approval':
        return 'success'
      case 'Reject':
      case 'Cancel':
      case 'Long Term':
        return 'danger'
      case 'New':
      case 'Short Term':
        return 'warning'
      default:
        return null
    }
  }

  return (
    <>
      <div className="col-12 md:col-5">
        <div className="card">
          <MyCalender calEvent={myScheduleList} />
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
              field="schedule_change_applicant_hm"
              style={{ minWidth: '4rem' }}></Column>
            <Column
              header="Approver"
              field="schedule_change_approver_hm"
              style={{ minWidth: '6rem' }}></Column>
            <Column
              header="Apply Reason"
              field="schedule_change_apply_reason"
              style={{ minWidth: '4rem' }}></Column>
            <Column
              header="Status"
              body={statusBodyTemplate}
              style={{ minWidth: '4rem' }}></Column>
            <Column
              header="Type"
              body={typeBodyTemplate}
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
              'Showing {first} to {last} of {totalRecords} schedule changes'
            }></Paginator>
        </div>
      </div>

      {/* new instance dialog */}
      <Dialog
        visible={newInstanceDialog}
        style={{ width: '50rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="New Schedule Change"
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
                name="schedule_change_type"
                control={control}
                rules={{ required: 'Schedule Change Type is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.schedule_change_type,
                      })}>
                      <b>Schedule Change Type</b>
                    </label>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      showClear
                      filter
                      optionLabel="label"
                      placeholder="Select a Schedule Change Type..."
                      options={[
                        { value: 0, label: 'Short Term' },
                        { value: 1, label: 'Long Term' },
                      ]}
                      optionValue="value"
                      focusInputRef={field.ref}
                      onChange={(e) => scheduleTypeContext(field, e)}
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            {selectedTypeValue === 0 && (
              <>
                <div className="field col-12">
                  <Controller
                    name="schedule_change_off_date"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <label htmlFor={field.name}>
                          <b>Select the Off Day</b>
                        </label>
                        <Calendar
                          inputId={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          dateFormat="yy-mm-dd"
                          showButtonBar
                          selectionMode="multiple"
                          maxDateCount={3}
                        />
                      </>
                    )}
                  />
                </div>
                <div className="field col-12">
                  <Controller
                    name="schedule_change_work_date"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <label htmlFor={field.name}>
                          <b>Select the Work Day</b>
                        </label>
                        <Calendar
                          inputId={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          dateFormat="yy-mm-dd"
                          showButtonBar
                          selectionMode="multiple"
                          maxDateCount={3}
                        />
                      </>
                    )}
                  />
                </div>
                <div className="field col-12">
                  <Controller
                    name="schedule_change_work_shift"
                    control={control}
                    rules={{ required: 'Select the work shift is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.schedule_change_work_shift,
                          })}>
                          <b>Select Work Shift</b>
                        </label>
                        <Dropdown
                          id={field.name}
                          value={field.value}
                          showClear
                          filter
                          optionLabel="label"
                          placeholder="Select a Work Shift..."
                          options={workShiftList}
                          optionValue="value"
                          focusInputRef={field.ref}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
              </>
            )}

            {selectedTypeValue === 1 && (
              <>
                <div className="field col-12">
                  <Controller
                    name="schedule_change_start_date"
                    control={control}
                    rules={{
                      required:
                        'Select the start date of the changes is required.',
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.schedule_change_start_date,
                          })}>
                          <b>Select the Start Date</b>
                        </label>
                        <Calendar
                          inputId={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          dateFormat="yy-mm-dd"
                          showButtonBar
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
                <div className="field col-12">
                  <Controller
                    name="schedule_change_end_date"
                    control={control}
                    rules={{
                      required:
                        'Select the end date of the changes is required.',
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.schedule_change_end_date,
                          })}>
                          <b>Select the End Date</b>
                        </label>
                        <Calendar
                          inputId={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          dateFormat="yy-mm-dd"
                          showButtonBar
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
                <div className="field col-12">
                  <Controller
                    name="schedule_change_work_day"
                    control={control}
                    rules={{ required: 'Select the work day is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.schedule_change_work_day,
                          })}>
                          <b>Select Work Day</b>
                        </label>
                        <MultiSelect
                          id={field.name}
                          value={field.value}
                          showClear
                          filter
                          optionLabel="label"
                          placeholder="Select a work day..."
                          options={[
                            { value: 1, label: 'Monday' },
                            { value: 2, label: 'Tuesday' },
                            { value: 3, label: 'Wednesday' },
                            { value: 4, label: 'Thursday' },
                            { value: 5, label: 'Friday' },
                            { value: 6, label: 'Saturday' },
                            { value: 7, label: 'Sunday' },
                          ]}
                          optionValue="value"
                          focusInputRef={field.ref}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
                <div className="field col-12">
                  <Controller
                    name="schedule_change_work_shift"
                    control={control}
                    rules={{ required: 'Select the work shift is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.schedule_change_work_shift,
                          })}>
                          <b>Select Work Shift</b>
                        </label>
                        <Dropdown
                          id={field.name}
                          value={field.value}
                          showClear
                          filter
                          optionLabel="label"
                          placeholder="Select a Work Shift..."
                          options={workShiftList}
                          optionValue="value"
                          focusInputRef={field.ref}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
              </>
            )}

            <div className="field col-12">
              <Controller
                name="schedule_change_apply_reason"
                control={control}
                rules={{ required: 'Schedule Change Reason is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.schedule_change_apply_reason,
                      })}>
                      <b>Schedule Change Apply Reason</b>
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
          </div>

          <div className="flex flex-wrap justify-content-center gap-2 mb-2">
            <Button raised rounded label={submitMethod === 'POST' ? 'Create' : 'Update'} type="submit"></Button>
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
        <h3>Schedule Change Details</h3>
        <h2>{detailInstance?.schedule_change_applicant_hm}</h2>
        <p>
          Schedule Change Type:{' '}
          <Tag
            value={detailInstance?.schedule_change_type_hm}
            severity={getSeverity(
              detailInstance?.schedule_change_type_hm
            )}></Tag>{' '}
        </p>
        <p>
          Schedule Change Status:{' '}
          <Tag
            value={detailInstance.schedule_change_status_hm}
            severity={getSeverity(
              detailInstance.schedule_change_status_hm
            )}></Tag>{' '}
        </p>
        {detailInstance.schedule_change_status_hm === 'Approval' && (
          <p>
            Schedule Change Approver:{' '}
            {detailInstance.schedule_change_approver_hm}
          </p>
        )}
        {detailInstance.schedule_change_type_hm === 'Long Term' && (
          <>
            <p>
              Schedule Start Date: {detailInstance.schedule_change_start_date}
            </p>
            <p>Schedule End Date: {detailInstance.schedule_change_end_date}</p>
            <p>
              Schedule Work Day:{' '}
              {detailInstance.schedule_change_work_day
                .split(',')
                .map((item) => (
                  <Badge
                    key={item}
                    value={item}
                    className="mr-1"
                    severity="secondary"></Badge>
                ))}
            </p>
          </>
        )}
        {detailInstance.schedule_change_type_hm === 'Short Term' && (
          <>
            <p>
              Schedule Change Off Date:{' '}
              {detailInstance?.schedule_change_off_date}
            </p>
            <p>
              Schedule Change Work Date:{' '}
              {detailInstance?.schedule_change_work_date}
            </p>
          </>
        )}
        <p>
          Schedule Change Work Shift:{' '}
          {detailInstance.schedule_change_work_shift_hm}
        </p>
        <p>
          Schedule Change Reason: {detailInstance.schedule_change_apply_reason}
        </p>
        {detailInstance.schedule_change_status_hm === 'Reject' && (
          <p>
            Schedule Reject Reason:{' '}
            {detailInstance.schedule_change_reject_reason}
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
            Are you sure you want to Cancel this Schedule Change Request?
          </span>
        </div>
        <p></p>
        <p>{cancelInstance?.schedule_change_apply_reason}</p>
      </Dialog>
    </>
  )
}
