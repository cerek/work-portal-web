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
import { MultiSelect } from 'primereact/multiselect'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { Paginator } from 'primereact/paginator'
import { classNames } from 'primereact/utils'
import {
  searchList,
  pageControl,
  delInsConfirm,
  dirtyValues,
  getFormErrorMessage,
} from '@/lib/utils/page'

export default function FingerRecordList({
  fingerRecordList,
  employeeList,
  clockingMachineList,
}) {
  const initDefaultValues = {
    finger_record_position: '',
    finger_record_choose: null,
    finger_record_employee: null,
    finger_record_machine: null,
  }
  const apiModule = 'fingerrecord'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [dataInstance, setDataInstance] = useState({})
  const [submitMethod, setSubmitMethod] = useState('POST')
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [mutipleDeleteDialog, setMutipleDeleteDialog] = useState(false)
  const [listData, setListData] = useState(fingerRecordList)
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
      <h4 className="m-0">Finger Record</h4>
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
  const fingerRecordEdit = async (id) => {
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
      setValue('finger_record_employee', resData.finger_record_employee)
      setValue('finger_record_machine', resData.finger_record_machine)
      setValue('finger_record_position', resData.finger_record_position)
      setValue('finger_record_choose', resData.finger_record_choose)
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
          deletedInsData.finger_record_employee_name_hm +
          "'s " +
          deletedInsData.finger_record_choose_hm +
          ' record had deleted!',
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
                item.finger_record_employee_name_hm +
                "'s " +
                item.finger_record_choose_hm +
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
                item.finger_record_employee_name_hm +
                "'s " +
                item.finger_record_choose_hm +
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
          submitMethod === 'POST'
            ? resData.finger_record_employee_name_hm +
              "'s " +
              resData.finger_record_choose_hm +
              ' create successfully!'
            : resData.finger_record_employee_name_hm +
              "'s " +
              resData.finger_record_choose_hm +
              ' update successfully!',
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

  // Table Template
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          severity="warning"
          rounded
          className="mr-2"
          onClick={() => fingerRecordEdit(rowData.id)}
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

  const machineBodyTemplate = (rowData) => {
    return <span>{rowData.finger_record_machine_name_hm.join(', ')}</span>
  }

  const fingerTypeBodyTemplate = (rowData) => {
    return <Tag>{rowData.finger_record_choose_hm}</Tag>
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
          rowGroupMode="rowspan"
          groupRowsBy="finger_record_employee_name_hm"
          sortField="finger_record_employee_name_hm"
          header={header}>
          <Column
            selectionMode="multiple"
            exportable={false}
            style={{ maxWidth: '1rem' }}></Column>
          <Column field="id" header="ID" style={{ maxWidth: '3rem' }}></Column>
          <Column
            field="finger_record_employee_name_hm"
            header="Employee"
            style={{ minWidth: '6rem' }}></Column>
          <Column
            field="finger_record_employee_dept_hm"
            header="Department"
            style={{ minWidth: '6rem' }}></Column>
          <Column
            header="Machine"
            field="finger_record_machine"
            body={machineBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Position"
            field="finger_record_position"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Finger Type"
            field="finger_record_choose"
            body={fingerTypeBodyTemplate}
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
            'Showing {first} to {last} of {totalRecords} finger record'
          }></Paginator>
      </div>

      {/* new instance dialog */}
      <Dialog
        visible={newInstanceDialog}
        style={{ width: '50rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header={
          submitMethod === 'POST' ? 'New Finger Record' : 'Update Finger Record'
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
              name="finger_record_employee"
              control={control}
              rules={{ required: 'Employee is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.finger_record_employee,
                    })}>
                    <b>Bind Employee</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a Employee..."
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
              name="finger_record_machine"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label htmlFor={field.name}>
                    <b>Bind Clocking Machine</b>
                  </label>
                  <MultiSelect
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a bind clocking machine..."
                    options={clockingMachineList}
                    optionValue="value"
                    focusInputRef={field.ref}
                    onChange={(e) => field.onChange(e.value)}
                  />
                </>
              )}
            />
          </div>

          <div className="field">
            <Controller
              name="finger_record_position"
              control={control}
              rules={{ required: 'Record position is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.finger_record_position,
                    })}>
                    <b>Record Position</b>
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
              name="finger_record_choose"
              control={control}
              rules={{ required: 'Finger Type is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.finger_record_choose,
                    })}>
                    <b>Finger Type</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a Finger type..."
                    options={[
                      { value: 9, label: 'Right Thumb' },
                      { value: 4, label: 'Left Thumb' },
                      { value: 8, label: 'Right Index Finger' },
                      { value: 3, label: 'Left Index Finger' },
                      { value: 7, label: 'Right Middle Finger' },
                      { value: 2, label: 'Left Middle Finger' },
                      { value: 6, label: 'Right Ring Finger' },
                      { value: 1, label: 'Left Ring Finger' },
                      { value: 5, label: 'Right Pinky Finger' },
                      { value: 0, label: 'Left Pinky Finger' },
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
              <b>
                {dataInstance.finger_record_employee_name_hm} 's{' '}
                {dataInstance.finger_record_choose_hm}
              </b>
              ?<br />
              <h4>Finger Record Details</h4>
              <br />
              Finger Record ID:{' '}
              <span className="font-bold">{dataInstance.id}</span>
              <br />
              Bind Employee:{' '}
              <span className="font-bold">
                {dataInstance.finger_record_employee_name_hm}
              </span>
              <br />
              Bind Finger Type:{' '}
              <span className="font-bold">
                {dataInstance.finger_record_choose_hm}
              </span>
              <br />
              Record Position:{' '}
              <span className="font-bold">
                {dataInstance.finger_record_position}
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
              <h4>Items List Details - Finger Record(ID)</h4>
              {selectInstances.map((item) => (
                <>
                  <strong style={{ 'fontSize?': '150%' }} key={item.id}>
                    - {item.finger_record_employee_name_hm} 's{' '}
                    {item.finger_record_choose_hm} ({item.id})
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
