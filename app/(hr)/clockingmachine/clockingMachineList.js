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
import { Paginator } from 'primereact/paginator'
import { classNames } from 'primereact/utils'
import {
  searchList,
  pageControl,
  delInsConfirm,
  dirtyValues,
  getFormErrorMessage,
} from '@/lib/utils/page'

export default function ClockingMachineList({
  clockingMachineList,
  locationList,
}) {
  const initDefaultValues = {
    clocking_machine_name: '',
    clocking_machine_status: null,
    clocking_machine_type: null,
    clocking_machine_firmware_version: '',
    clocking_machine_desc: '',
    clocking_machine_location: null,
  }
  const apiModule = 'clockingmachine'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [dataInstance, setDataInstance] = useState({})
  const [submitMethod, setSubmitMethod] = useState('POST')
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [mutipleDeleteDialog, setMutipleDeleteDialog] = useState(false)
  const [listData, setListData] = useState(clockingMachineList)
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
      <h4 className="m-0">Clocking Machine</h4>
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
  const clockingMachineEdit = async (id) => {
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
      setValue('clocking_machine_name', resData.clocking_machine_name)
      setValue('clocking_machine_status', resData.clocking_machine_status)
      setValue('clocking_machine_location', resData.clocking_machine_location)
      setValue('clocking_machine_type', resData.clocking_machine_type)
      setValue(
        'clocking_machine_firmware_version',
        resData.clocking_machine_firmware_version
      )
      setValue('clocking_machine_desc', resData.clocking_machine_desc)
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
        detail: deletedInsData.clocking_machine_name + 'had deleted!',
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
              (item) => item.clocking_machine_name + ' - ' + '(' + item.id + ')'
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
              (item) => item.clocking_machine_name + ' - ' + '(' + item.id + ')'
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
            ? resData.clocking_machine_name + ' Create Successfully!'
            : resData.clocking_machine_name + ' Update Successfully',
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
          onClick={() => clockingMachineEdit(rowData.id)}
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
    return <span>{rowData.clocking_machine_type_hm}</span>
  }

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag severity={getSeverity(rowData.clocking_machine_status_hm)}>
        {rowData.clocking_machine_status_hm}
      </Tag>
    )
  }

  const locationBodyTemplate = (rowData) => {
    return <span>{rowData.clocking_machine_location_hm}</span>
  }

  const getSeverity = (insStatus) => {
    switch (insStatus) {
      case 'Active':
        return 'success'
      case 'Suspend':
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
            field="clocking_machine_name"
            header="Machine Name"
            style={{ minWidth: '6rem' }}></Column>
          <Column
            header="Machine Type"
            field="clocking_machine_type"
            body={typeBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Status"
            field="clocking_machine_status"
            body={statusBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Location"
            field="clocking_machine_location"
            body={locationBodyTemplate}
            style={{ minWidth: '5rem' }}></Column>
          <Column
            header="Firmware Info"
            field="clocking_machine_firmware_version"
            style={{ minWidth: '5rem' }}></Column>
          <Column
            header="Description"
            field="clocking_machine_desc"
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
            'Showing {first} to {last} of {totalRecords} clocking machine'
          }></Paginator>
      </div>

      {/* new instance dialog */}
      <Dialog
        visible={newInstanceDialog}
        style={{ width: '50rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header={
          submitMethod === 'POST'
            ? 'New Clocking Machine'
            : 'Update Clocking Machine'
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
              name="clocking_machine_name"
              control={control}
              rules={{ required: 'Machine Name is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.clocking_machine_name,
                    })}>
                    <b>Machine Name</b>
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
              name="clocking_machine_status"
              control={control}
              rules={{ required: 'Machine Status is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.clocking_machine_status,
                    })}>
                    <b>Status</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a Status..."
                    options={[
                      { value: 1, label: 'Active' },
                      { value: 0, label: 'Suspend' },
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
              name="clocking_machine_type"
              control={control}
              rules={{ required: 'Machine Type is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.clocking_machine_type,
                    })}>
                    <b>Type</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a Type..."
                    options={[
                      { value: 0, label: 'Finger Print' },
                      { value: 1, label: 'WebCam' },
                      { value: 2, label: 'Card Tap' },
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
              name="clocking_machine_desc"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label htmlFor={field.name}>
                    <b>Description</b>
                  </label>
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

          <div className="field">
            <Controller
              name="clocking_machine_firmware_version"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.clocking_machine_firmware_version,
                    })}>
                    <b>Firmware Version</b>
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
              name="clocking_machine_location"
              control={control}
              rules={{ required: 'Machine Location is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.clocking_machine_location,
                    })}>
                    <b>Machine Location</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a Location..."
                    options={locationList}
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
              <b>{dataInstance.clocking_machine_name}</b>?<br />
              <h4>Clocking Machine Details</h4>
              <br />
              Machine ID: <span className="font-bold">{dataInstance.id}</span>
              <br />
              Machine Location:{' '}
              <span className="font-bold">
                {dataInstance.clocking_machine_location_hm}
              </span>
              <br />
              Machine Type:{' '}
              <span className="font-bold">
                {dataInstance.clocking_machine_type_hm}
              </span>
              <br />
              Machine Description:{' '}
              <span className="font-bold">
                {dataInstance.clocking_machine_desc}
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
              <h4>Items List Details - Machine Name(ID)</h4>
              {selectInstances.map((item) => (
                <>
                  <strong style={{ 'fontSize?': '150%' }} key={item.id}>
                    - {item.clocking_machine_name} ({item.id})
                  </strong>
                </>
              ))}
            </span>
          )}
        </div>
      </Dialog>
    </>
  )
}
