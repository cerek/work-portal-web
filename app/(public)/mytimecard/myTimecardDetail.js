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
import { MultiSelect } from 'primereact/multiselect'
import { Dropdown } from 'primereact/dropdown'
import { InputTextarea } from 'primereact/inputtextarea'
import { Toolbar } from 'primereact/toolbar'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { TabView, TabPanel } from 'primereact/tabview'
import { Paginator } from 'primereact/paginator'
import { Dialog } from 'primereact/dialog'
import { classNames } from 'primereact/utils'
import {
  searchList,
  pageControl,
  dirtyValues,
  getFormErrorMessage,
} from '@/lib/utils/page'

export default function MyTimecardDetail({ calData, myTimecardList, myTimecardChangeList }) {
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
  const apiModule = 'mytimecard'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [selectedTypeValue, setSelectedTypeValue] = useState('')
  const [detailSidebar, setDetailSidebar] = useState(false)
  const [submitMethod, setSubmitMethod] = useState('POST')
  const [globalFilter, setGlobalFilter] = useState('')
  const [detailInstance, setDetailInstance] = useState({})
  const [listData, setListData] = useState(myTimecardList)
  const [tcListData, setTcListData] = useState(myTimecardChangeList)
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
          label="New Timecard Apply"
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
      <h4 className="m-0">My TimeCard Details</h4>
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
        value={rowData.clocking_record_is_edit_hm}
        severity={getSeverity(rowData.clocking_record_is_edit_hm)}></Tag>
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

  const getSeverity = (intStatus) => {
    switch (intStatus) {
      case 'No':
        return 'success'
      case 'Yes':
        return 'danger'
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
          <TabView>
            {/* Timecard Details */}
            <TabPanel header="TimeCard Details" leftIcon="pi pi-stopwatch mr-2">
              <DataTable
                dataKey="id"
                ref={dt}
                value={listData.results}
                header={header}>
                <Column
                  header="Employee"
                  field="clocking_record_employee_name_hm"
                  style={{ minWidth: '4rem' }}></Column>
                <Column
                  header="Department"
                  field="clocking_record_employee_dept_hm"
                  style={{ minWidth: '6rem' }}></Column>
                <Column
                  header="Clocking Datetime"
                  field="clocking_record_datetime"
                  style={{ minWidth: '4rem' }}></Column>
                <Column
                  header="Clocking Machine"
                  field="clocking_record_machine_name_hm"
                  style={{ minWidth: '4rem' }}></Column>
                <Column
                  header="Clocking Location"
                  field="clocking_record_machine_location_hm"
                  style={{ minWidth: '4rem' }}></Column>
                <Column
                  header="Is Edited"
                  body={statusBodyTemplate}
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
                  'Showing {first} to {last} of {totalRecords} timecard details'
                }></Paginator>
            </TabPanel>
            {/* Timecard Change Apply */}
            <TabPanel header="TimeCard Change Apply" leftIcon="pi pi-sync mr-2">
              <Toolbar className="mb-4" start={startToolbarTemplate}></Toolbar>
              <DataTable
                dataKey="id"
                ref={dt}
                value={tcListData.results}
                header={header}>
                <Column
                  header="Employee"
                  field="clocking_record_employee_name_hm"
                  style={{ minWidth: '4rem' }}></Column>
                <Column
                  header="Department"
                  field="clocking_record_employee_dept_hm"
                  style={{ minWidth: '6rem' }}></Column>
                <Column
                  header="Clocking Datetime"
                  field="clocking_record_datetime"
                  style={{ minWidth: '4rem' }}></Column>
                <Column
                  header="Clocking Machine"
                  field="clocking_record_machine_name_hm"
                  style={{ minWidth: '4rem' }}></Column>
                <Column
                  header="Clocking Location"
                  field="clocking_record_machine_location_hm"
                  style={{ minWidth: '4rem' }}></Column>
                <Column
                  header="Is Edited"
                  body={statusBodyTemplate}
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
                  'Showing {first} to {last} of {totalRecords} timecard details'
                }></Paginator>
            </TabPanel>
          </TabView>
        </div>
      </div>

      {/* new instance dialog */}
      <Dialog
        visible={newInstanceDialog}
        style={{ width: '50rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header={
          submitMethod === 'POST'
            ? 'New Schedule Change'
            : 'Update Schedule Change'
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
