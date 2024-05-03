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
import { Tag } from 'primereact/tag'
import { Badge } from 'primereact/badge'
import { OverlayPanel } from 'primereact/overlaypanel'
import { InputText } from 'primereact/inputtext'
import { MultiSelect } from 'primereact/multiselect'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { InputTextarea } from 'primereact/inputtextarea'
import { Paginator } from 'primereact/paginator'
import { classNames } from 'primereact/utils'
import {
  searchList,
  pageControl,
  delInsConfirm,
  getObjectDiff,
  dirtyValues,
  getFormErrorMessage,
} from '@/lib/utils/page'

export default function SchedulePlanList({
  schedulePlanList,
  workShiftList,
  employeeList,
}) {
  const initDefaultValues = {
    schedule_plan_name: '',
    schedule_plan_work_day: '',
    schedule_plan_start_date: '',
    schedule_plan_end_date: '',
    schedule_plan_work_shift: null,
    schedule_plan_employee: null,
    schedule_plan_desc: ''
  }
  const apiModule = 'scheduleplan'
  const dt = useRef(null)
  const opBindEmployee = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [dataInstance, setDataInstance] = useState({})
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [mutipleDeleteDialog, setMutipleDeleteDialog] = useState(false)
  const [listData, setListData] = useState(schedulePlanList)
  const [bindEmployee, setBindEmployee] = useState()
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
    const searchRes = await searchList(apiModule, globalFilter)
    setListData(searchRes)
  }

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Location</h4>
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
      <Tag
        value={rowData.schedule_plan_status_hm}
        severity={getSeverity(rowData.schedule_plan_status_hm)}></Tag>
    )
  }

  const workShiftBodyTemplate = (rowData) => {
    return <>{rowData.schedule_plan_work_shift_hm}</>
  }

  const workDayBodyTemplate = (rowData) => {
    const workDayList = rowData.schedule_plan_work_day.split(',')
    const resList = workDayList.map((item) => (
      <Badge value={item} className="mr-1" severity="secondary"></Badge>
    ))
    return <>{resList}</>
  }

  const getBindEmployeeList = async (id, e) => {
    const bindEmployeeListRes = await fetch('/api/' + apiModule + '/' + id)
    const bindEmployeeList = await bindEmployeeListRes.json()
    if (!bindEmployeeListRes.ok) {
      toast.current.show({
        severity: 'error',
        summary: 'Failed',
        detail: JSON.stringify(bindEmployeeList),
        life: 30000,
      })
    } else {
      setBindEmployee(bindEmployeeList.schedule_plan_employee_hm.map(item => ({name:item})))
      opBindEmployee.current.toggle(e)
    }
  }

  const bindEmployeesBodyTemplate = (rowData) => {
    if (rowData.schedule_plan_employee_hm.length !== 0) {
    return (
      <>
        <Button
          type="button"
          icon="pi pi-info-circle"
          label="Detail"
          severity="warning"
          onClick={(e) => getBindEmployeeList(rowData.id, e)}
        />
        <OverlayPanel showCloseIcon ref={opBindEmployee}>
          <DataTable
            value={bindEmployee}
            scrollable
            scrollHeight="400px">
            <Column field="name" header="Name" style={{ minWidth: '12rem' }} />
          </DataTable>
        </OverlayPanel>
      </>
    )}
    else {
      return (
        <>-</>
      )
    }
  }

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          className="mr-2"
          onClick={() => confirmDelete(rowData)}
        />
      </React.Fragment>
    )
  }

  const getSeverity = (departmentStatus) => {
    switch (departmentStatus) {
      case 'Active':
        return 'success'
      case 'Suspend':
        return 'danger'
      default:
        return null
    }
  }

  // RowEditor Relative
  const onRowEditComplete = async (e) => {
    let { newData, data } = e
    // const formatNewData = {...newData, schedule_plan_work_day: newData.schedule_plan_work_day.toString(), schedule_plan_start_date: newData.schedule_plan_start_date.toISOString().split('T')[0], schedule_plan_end_date: newData.schedule_plan_end_date.toISOString().split('T')[0]}
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
      // [Enhance] Find the better method to format the submit data
      const originalData = await originalDataRes.json()
      const dirtyData = getObjectDiff(originalData, newData)
      if ('schedule_plan_work_day' in dirtyData) {
        dirtyData.schedule_plan_work_day =
          dirtyData.schedule_plan_work_day.toString()
      }
      if ('schedule_plan_end_date' in dirtyData) {
        dirtyData.schedule_plan_end_date = dirtyData.schedule_plan_end_date
          .toISOString()
          .split('T')[0]
      }
      if ('schedule_plan_start_date' in dirtyData) {
        dirtyData.schedule_plan_start_date = dirtyData.schedule_plan_start_date
          .toISOString()
          .split('T')[0]
      }
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
            JSON.stringify(resData.schedule_plan_name) + 'update Successfully!!',
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
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    )
  }

  const dateEditor = (options) => {
    let showValue = ''
    if (typeof options.value === 'string') {
      showValue = new Date(options.value + ' 00:00:00')
    } else if (typeof options.value === 'object') {
      showValue = options.value
    }
    return (
      <Calendar
        value={showValue}
        onChange={(e) => options.editorCallback(e.target.value)}
        dateFormat="yy-mm-dd"
        showButtonBar
      />
    )
  }

  const workShiftEditor = (options) => {
    return (
      <Dropdown
        value={options.value}
        onChange={(e) => options.editorCallback(e.value)}
        placeholder="Select a Work Shift"
        options={workShiftList}
      />
    )
  }

  const bindEmployeeEditor = (options) => {
    return (
      <MultiSelect
        value={options.value}
        onChange={(e) => options.editorCallback(e.value)}
        placeholder="Select bind employees"
        options={employeeList}
      />
    )
  }

  const workDayEditor = (options) => {
    let valueList = []
    if (typeof options.value === 'string') {
      valueList = options.value.split(',')
    } else if (typeof options.value === 'object') {
      valueList = options.value
    }
    const formatValueList = valueList.map((item) => parseInt(item))
    return (
      <MultiSelect
        value={formatValueList}
        onChange={(e) => options.editorCallback(e.value)}
        placeholder="Select bind work day"
        options={[
          { value: 1, label: 'Monday' },
          { value: 2, label: 'Tuesday' },
          { value: 3, label: 'Wednesday' },
          { value: 4, label: 'Thursday' },
          { value: 5, label: 'Friday' },
          { value: 6, label: 'Saturday' },
          { value: 7, label: 'Sunday' },
        ]}
      />
    )
  }

  const statusEditor = (options) => {
    return (
      <Dropdown
        id="schedule_plan_status"
        value={options.value}
        onChange={(e) => options.editorCallback(e.value)}
        placeholder="Select a Status"
        options={[
          { value: 1, label: 'Active' },
          { value: 0, label: 'Suspend' },
        ]}
      />
    )
  }

  // Main operation function
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
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail: deletedInsData.schedule_plan_name + ' deleted!',
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
              (item) => item.schedule_plan_name + ' - ' + '(' + item.id + ')'
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
              (item) => item.schedule_plan_name + ' - ' + '(' + item.id + ')'
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
    const dirtyData = dirtyValues(dirtyFields, data)
    if ('schedule_plan_work_day' in dirtyData) {
      dirtyData.schedule_plan_work_day =
        dirtyData.schedule_plan_work_day.toString()
    }
    if ('schedule_plan_end_date' in dirtyData) {
      dirtyData.schedule_plan_end_date = dirtyData.schedule_plan_end_date
        .toISOString()
        .split('T')[0]
    }
    if ('schedule_plan_start_date' in dirtyData) {
      dirtyData.schedule_plan_start_date = dirtyData.schedule_plan_start_date
        .toISOString()
        .split('T')[0]
    }
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
      setNewInstanceDialog(false)
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(resData.schedule_plan_name) + 'create Successfully!!',
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
          <Column
            field="id"
            header="ID"
            sortable
            style={{ maxWidth: '3rem' }}></Column>
          <Column
            header="Plan Name"
            editor={(options) => textEditor(options)}
            sortable
            field="schedule_plan_name"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Start Date"
            editor={(options) => dateEditor(options)}
            field="schedule_plan_start_date"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="End Date"
            editor={(options) => dateEditor(options)}
            field="schedule_plan_end_date"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Work Day"
            body={workDayBodyTemplate}
            editor={(options) => workDayEditor(options)}
            field="schedule_plan_work_day"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Work Shift"
            body={workShiftBodyTemplate}
            editor={(options) => workShiftEditor(options)}
            field="schedule_plan_work_shift"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Bind Employees"
            body={bindEmployeesBodyTemplate}
            editor={(options) => bindEmployeeEditor(options)}
            sortable
            field="schedule_plan_employee"
            style={{ minWidth: '6rem' }}></Column>
          <Column
            header="Description"
            editor={(options) => textEditor(options)}
            sortable
            field="schedule_plan_desc"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Status"
            field="schedule_plan_status"
            body={statusBodyTemplate}
            editor={(options) => statusEditor(options)}
            sortable
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="CreateTime"
            sortable
            field="created_time"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            rowEditor
            headerStyle={{ width: '10%', minWidth: '8rem' }}
            bodyStyle={{ textAlign: 'center' }}></Column>
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
            'Showing {first} to {last} of {totalRecords} locations'
          }></Paginator>
      </div>

      {/* new instance dialog */}
      <Dialog
        visible={newInstanceDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="New Schedule Plan"
        modal
        className="p-fluid"
        onHide={() => setNewInstanceDialog(false)}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-column gap-2">
          <div className="field">
            <Controller
              name="schedule_plan_name"
              control={control}
              rules={{ required: 'Schedule Plan Name is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.schedule_plan_name,
                    })}>
                    <b>Schedule Plan Name</b>
                  </label>
                  <InputText
                    id={field.name}
                    value={field.value}
                    className={classNames({ 'p-invalid': fieldState.error })}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  {getFormErrorMessage(field.name, errors)}
                </>
              )}
            />
          </div>

          <div className="field">
            <Controller
              name="schedule_plan_start_date"
              control={control}
              rules={{ required: 'Schedule Plan Start Date is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.schedule_plan_start_date,
                    })}>
                    <b>Schedule Plan Start Date</b>
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
              name="schedule_plan_end_date"
              control={control}
              rules={{ required: 'Schedule Plan End Date is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.schedule_plan_end_date,
                    })}>
                    <b>Schedule Plan End Date</b>
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
              name="schedule_plan_work_shift"
              control={control}
              rules={{ required: 'Work Shift is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.schedule_plan_work_shift,
                    })}>
                    <b>Work Shift</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a work shift..."
                    options={workShiftList}
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
              name="schedule_plan_work_day"
              control={control}
              rules={{ required: 'Work Day is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.schedule_plan_work_day,
                    })}>
                    <b>Work Days</b>
                  </label>
                  <MultiSelect
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a work shift..."
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
                    className={classNames({ 'p-invalid': fieldState.error })}
                  />
                  {getFormErrorMessage(field.name, errors)}
                </>
              )}
            />
          </div>

          <div className="field">
            <Controller
              name="schedule_plan_employee"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label htmlFor={field.name}>
                    <b>Bind Employee</b>
                  </label>
                  <MultiSelect
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select bind employees..."
                    options={employeeList}
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
              name="schedule_plan_desc"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label htmlFor={field.name}>Description</label>
                  <InputTextarea
                    id={field.name}
                    {...field}
                    rows={4}
                    cols={30}
                    className={classNames({ 'p-invalid': fieldState.error })}
                  />
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
              <b>{dataInstance.schedule_plan_name}</b>?<br />
              <h4>Schedule Plan Details</h4>
              <br />
              Schedule Plan ID:{' '}
              <span className="font-blod">{dataInstance.id}</span>
              <br />
              Schedule Plan Address:{' '}
              <span className="font-blod">
                {dataInstance.schedule_plan_name}
              </span>
              <br />
              Schedule Plan Start - End Date:{' '}
              <span className="font-blod">
                {dataInstance.schedule_plan_start_date} -{' '}
                {dataInstance.schedule_plan_end_date}
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
              <h4>Items List Details - Name(ID)</h4>
              {selectInstances.map((item) => (
                <>
                  <strong style={{ 'fontSize?': '150%' }} key={item.id}>
                    {item.schedule_plan_name} ({item.id})
                  </strong>
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
