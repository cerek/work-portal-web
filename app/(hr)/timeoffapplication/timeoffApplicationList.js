'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { SplitButton } from 'primereact/splitbutton'
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
  delInsConfirm,
  dirtyValues,
  getFormErrorMessage,
} from '@/lib/utils/page'

export default function TimeoffApplicationList({
  timeoffApplicationList,
  timeoffTypeList,
  applicantList,
  approverList,
}) {
  const initDefaultValues = {
    timeoff_application_status: null,
    timeoff_application_start_datetime: '',
    timeoff_application_end_datetime: '',
    timeoff_application_apply_reason: '',
    timeoff_application_reject_reason: '',
    timeoff_application_applicant: null,
    timeoff_application_approver: null,
    timeoff_application_type: null,
  }
  const apiModule = 'timeoffapplication'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [dataInstance, setDataInstance] = useState({})
  const [submitMethod, setSubmitMethod] = useState('POST')
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [mutipleDeleteDialog, setMutipleDeleteDialog] = useState(false)
  const [listData, setListData] = useState(timeoffApplicationList)
  const [selectInstances, setSelectInstances] = useState(null)
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
          onClick={() => {
            setNewInstanceDialog(true)
            setSubmitMethod('POST')
            reset()
          }}
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
    const searchRes = await searchList(apiModule, globalFilter)
    setListData(searchRes)
  }

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">TimeOff Application</h4>
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
  const timeoffApplicationEdit = async (id) => {
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
      setValue('id', resData.id, { shouldDirty: true })
      setValue(
        'timeoff_application_applicant',
        resData.timeoff_application_applicant
      )
      setValue(
        'timeoff_application_approver',
        resData.timeoff_application_approver
      )
      setValue('timeoff_application_type', resData.timeoff_application_type)
      setValue(
        'timeoff_application_apply_reason',
        resData.timeoff_application_apply_reason
      )
      setValue(
        'timeoff_application_reject_reason',
        resData.timeoff_application_reject_reason
      )
      setValue(
        'timeoff_application_start_datetime',
        new Date(resData.timeoff_application_start_datetime)
      )
      setValue(
        'timeoff_application_end_datetime',
        new Date(resData.timeoff_application_end_datetime)
      )
      setValue('timeoff_application_status', resData.timeoff_application_status)
      setSubmitMethod('PATCH')
      setNewInstanceDialog(true)
    }
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
      const listRefreshData = await fetch('/api/' + apiModule)
      const newListData = await listRefreshData.json()
      setListData(newListData)
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          deletedInsData.timeoff_application_applicant_hm +
          "'s" +
          deletedInsData.timeoff_application_apply_reason +
          'timeoff deleted!',
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
              (item) =>
                item.timeoff_application_applicant_hm +
                ' - ' +
                '(' +
                item.id +
                ')'
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
              (item) =>
                item.timeoff_application_applicant_hm +
                ' - ' +
                '(' +
                item.id +
                ')'
            )
          ) + ' not deleted!',
        life: 30000,
      })

    const listRefreshData = await fetch('/api/' + apiModule)
    const newListData = await listRefreshData.json()
    setListData(newListData)
    setMutipleDeleteDialog(false)
    setSelectInstances(null)
    router.refresh()
  }

  async function onSubmit(data) {
    let endPointUrl = ''
    const dirtyData = dirtyValues(dirtyFields, data)
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
      router.refresh()
      setNewInstanceDialog(false)
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(resData.timeoff_application_applicant_hm) +
            "'s timeoff" +
            submitMethod ===
          'POST'
            ? 'Create'
            : 'Update' + 'Successfully!!',
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

  async function handleSchduleChangeDecide(operationStatus, id) {
    const dirtyData = { timeoff_application_status: operationStatus }
    const res = await fetch('/api/timeoffapplication/decide/' + id, {
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
      const listRefreshData = await fetch('/api/' + apiModule)
      const newListData = await listRefreshData.json()
      setListData(newListData)
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(resData.schedule_change_applicant_hm) + operationStatus === 1 ? 'Approval' : 'Reject' + ' Successfully!!',
        life: 3000,
      })
    }
  }

  // Table delete Dialog Relative
  const confirmDelete = (instance) => {
    setDataInstance(instance)
    setDeleteDialog(true)
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

  // Table Template
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        {rowData.timeoff_application_status_hm === 'Apply' && (
          <SplitButton label="Decide" icon="pi pi-question-circle" model={[{label: 'Approval', icon: 'pi pi-verified', command: () => handleSchduleChangeDecide(3, rowData.id)}, {label: 'Reject', icon: 'pi pi-times-circle', command: () => handleSchduleChangeDecide(5, rowData.id)}]} severity="danger" className='mr-2'></SplitButton>
        )}
        <Button
          icon="pi pi-pencil"
          severity="warning"
          rounded
          className="mr-2"
          onClick={() => timeoffApplicationEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          severity="danger"
          onClick={() => confirmDelete(rowData)}
        />
      </React.Fragment>
    )
  }

  const typeBodyTemplate = (rowData) => {
    return <span>{rowData.timeoff_application_type_hm}</span>
  }

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag severity={getSeverity(rowData.timeoff_application_status_hm)}>
        {rowData.timeoff_application_status_hm}
      </Tag>
    )
  }

  const applicantBodyTemplate = (rowData) => {
    return <span>{rowData.timeoff_application_applicant_hm}</span>
  }

  const approverBodyTemplate = (rowData) => {
    return <span>{rowData.timeoff_application_approver_hm}</span>
  }

  const startToEndBodyTemplate = (rowData) => {
    return (
      <>
        <span>
          From:{' '}
          <span className="font-bold">
            {new Date(
              rowData.timeoff_application_start_datetime
            ).toLocaleString()}
          </span>
        </span>
        <br />
        <span>
          To:{' '}
          <span className="font-bold">
            {new Date(
              rowData.timeoff_application_end_datetime
            ).toLocaleString()}
          </span>
        </span>
        <br />
      </>
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
      case 'Reject':
        return 'danger'
      default:
        return null
    }
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
          <Column field="id" header="ID" style={{ maxWidth: '3rem' }}></Column>
          <Column
            field="timeoff_application_applicant"
            header="Applicant"
            body={applicantBodyTemplate}
            style={{ minWidth: '6rem' }}></Column>
          <Column
            field="timeoff_application_applicant_dept_hm"
            header="Department"
            style={{ maxWidth: '7rem' }}></Column>
          <Column
            header="Approver"
            field="timeoff_application_approver"
            body={approverBodyTemplate}
            style={{ minWidth: '6rem' }}></Column>
          <Column
            header="TimeOff Reason"
            field="timeoff_application_apply_reason"
            style={{ minWidth: '8rem' }}></Column>
          <Column
            header="TimeOff Reject Reason"
            field="timeoff_application_reject_reason"
            style={{ minWidth: '8rem' }}></Column>
          <Column
            header="Type"
            field="timeoff_application_type"
            sortable
            body={typeBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Status"
            field="timeoff_application_status"
            body={statusBodyTemplate}
            sortable
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Start-To-End"
            body={startToEndBodyTemplate}
            style={{ minWidth: '5rem' }}></Column>
          <Column
            header="Timeoff Hours"
            field="timeoff_application_total_hours"
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
            'Showing {first} to {last} of {totalRecords} timeoff applications'
          }></Paginator>
      </div>

      {/* new instance dialog */}
      <Dialog
        visible={newInstanceDialog}
        style={{ width: '50rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header={
          submitMethod === 'POST'
            ? 'New Timeoff Application'
            : 'Update Timeoff Application'
        }
        modal
        className="p-fluid"
        onHide={() => setNewInstanceDialog(false)}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-column gap-2">
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

          <div className="field">
            <Controller
              name="timeoff_application_applicant"
              control={control}
              rules={{ required: 'Applicant is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_application_applicant,
                    })}>
                    <b>Applicant</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a Applicant..."
                    options={applicantList}
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
              name="timeoff_application_apply_reason"
              control={control}
              rules={{ required: 'Timeoff reason is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_application_apply_reason,
                    })}>
                    <b>Apply Reason</b>
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
              name="timeoff_application_reject_reason"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label htmlFor={field.name}>
                    <b>Reject Reason</b>
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

          <div className="field">
            <Controller
              name="timeoff_application_status"
              control={control}
              rules={{ required: 'Timeoff status is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_application_status,
                    })}>
                    <b>Timeoff Application Status</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a timeoff status..."
                    options={[
                      { value: 1, label: 'Apply' },
                      { value: 2, label: 'Manager Approval' },
                      { value: 3, label: 'HR Approval' },
                      { value: 4, label: 'Cancel' },
                      { value: 5, label: 'Reject' },
                    ]}
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

          <div className="field">
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

          <div className="field">
            <Controller
              name="timeoff_application_approver"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label htmlFor={field.name}>
                    <b>Approver</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a Approver..."
                    options={approverList}
                    optionValue="value"
                    focusInputRef={field.ref}
                    onChange={(e) => field.onChange(e.value)}
                  />
                </>
              )}
            />
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
              <b>{dataInstance.timeoff_application_apply_reason}</b>?<br />
              <h4>Timeoff Application Details</h4>
              <br />
              Timeoff Application ID:{' '}
              <span className="font-bold">{dataInstance.id}</span>
              <br />
              Timeoff Applicant:{' '}
              <span className="font-bold">
                {dataInstance.timeoff_application_applicant_hm}
              </span>
              <br />
              Timeoff Apply Reason:{' '}
              <span className="font-bold">
                {dataInstance.timeoff_application_apply_reason}
              </span>
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
              <h4>Items List Details - Applicant - Apply Reason(ID)</h4>
              {selectInstances.map((item) => (
                <>
                  <strong style={{ 'fontSize?': '150%' }} key={item.id}>
                    {item.timeoff_application_applicant_hm}{' '}
                  </strong>
                  - {item.timeoff_application_apply_reason} ({item.id})
                  <br />
                </>
              ))}
            </span>
          )}
        </div>
      </Dialog>
    </>
  )
}
