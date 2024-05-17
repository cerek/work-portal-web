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

export default function TimeoffTypeList({ timeoffTypeList }) {
  const initDefaultValues = {
    timeoff_type_name: ''
  }
  const apiModule = 'timeofftype'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [dataInstance, setDataInstance] = useState({})
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [mutipleDeleteDialog, setMutipleDeleteDialog] = useState(false)
  const [listData, setListData] = useState(timeoffTypeList)
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

  const leftToolbarTemplate = () => {
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

  const rightToolbarTemplate = () => {
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
      <h4 className="m-0">TimeOff Type</h4>
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
            JSON.stringify(resData.timeoff_type_name) + 'update Successfully!!',
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
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail: deletedInsData.timeoff_type_name + ' deleted!',
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
              (item) => item.timeoff_type_name + ' - ' + '(' + item.id + ')'
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
              (item) => item.timeoff_type_name + ' - ' + '(' + item.id + ')'
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
          JSON.stringify(resData.timeoff_type_name) + 'create Successfully!!',
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
          start={leftToolbarTemplate}
          end={rightToolbarTemplate}></Toolbar>
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
            header="Name"
            editor={(options) => textEditor(options)}
            sortable
            field="timeoff_type_name"
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
            'Showing {first} to {last} of {totalRecords} timeoff types'
          }></Paginator>
      </div>

      {/* new instance dialog */}
      <Dialog
        visible={newInstanceDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="New TimeOff Type"
        modal
        className="p-fluid"
        onHide={() => setNewInstanceDialog(false)}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-column gap-2">
          <div className="field">
            <Controller
              name="timeoff_type_name"
              control={control}
              rules={{ required: 'TimeOff Type Name is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.timeoff_type_name,
                    })}>
                    <b>TimeOff Type Name</b>
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
              <b>{dataInstance.timeoff_type_name}</b>?<br />
              <h4>TimeOff Type Details</h4>
              <br />
              TimeOff Type ID: <span className="font-blod">{dataInstance.id}</span>
              <br />
              TimeOff Name:{' '}
              <span className="font-blod">{dataInstance.timeoff_type_name}</span>
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
                    {item.timeoff_type_name} ({item.id})
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
