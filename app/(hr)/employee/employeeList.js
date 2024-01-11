'use client'

import Link from 'next/link'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { Toolbar } from 'primereact/toolbar'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { Paginator } from 'primereact/paginator'
import { Avatar } from 'primereact/avatar'
import { searchList, pageControl, delInsConfirm } from '@/lib/utils/page'

export default function EmployeeList({ employeeList }) {
  const apiModule = 'employee'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState('')
  const [dataInstance, setDataInstance] = useState({})
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [mutipleDeleteDialog, setMutipleDeleteDialog] = useState(false)
  const [listData, setListData] = useState(employeeList)
  const [selectInstances, setSelectInstances] = useState(null)
  const [firstPage, setFirstPage] = useState(0)
  const [pageRows, setPageRows] = useState(10)

  // Table Header and Toolbar
  const exportCSV = () => {
    dt.current.exportCSV()
  }

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href={'/employee/create'}>
          <Button label="New" icon="pi pi-plus" severity="success" />
        </Link>
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          onClick={()=>setMutipleDeleteDialog(true)}
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
      <h4 className="m-0">Employees</h4>
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
        <Avatar
          image={rowData.employee_avatar?.file_url || '#'}
          size="xlarge"
        />
        <span>
          <strong style={{ 'fontSize?': '150%' }}>
            {rowData.employee.username}
          </strong>
          <br />
          {rowData.employee.first_name} {rowData.employee.last_name}
        </span>
      </div>
    )
  }

  const jobBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-4">
        <span>
          Job Title:{' '}
          <strong style={{ fontSize: '130%' }}>
            {rowData.employee_job_title}
          </strong>
          <br />
          Department:{' '}
          <strong style={{ fontSize: '130%' }}>
            {rowData.employee_department?.department.name}
          </strong>
          <br />
          Location:{' '}
          <strong style={{ fontSize: '130%' }}>
            {rowData.employee_work_location?.location_name}
          </strong>
          <br />
          Join Day:{' '}
          <strong style={{ fontSize: '130%' }}>
            {new Date(rowData.employee_join_day).toLocaleDateString()}
          </strong>
          <br />
        </span>
      </div>
    )
  }

  const contactBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-4">
        <span>
          Phone:{' '}
          <strong style={{ fontSize: '130%' }}>{rowData.employee_phone}</strong>
          <br />
          Extension:{' '}
          <strong style={{ fontSize: '130%' }}>
            {rowData.employee_extension}
          </strong>
          <br />
        </span>
      </div>
    )
  }

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.employee.is_active ? 'Active' : 'Deactivated'}
        severity={getSeverity(rowData.employee.is_active)}></Tag>
    )
  }

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Link href={'/employee/detail/' + rowData.id}>
          <Button
            icon="pi pi-eye"
            rounded
            outlined
            className="mr-2"
            severity="info"
          />
        </Link>
        <Link href={'/employee/update/' + rowData.id}>
          <Button
            icon="pi pi-pencil"
            rounded
            outlined
            className="mr-2"
            severity="warning"
          />
        </Link>
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

  const getSeverity = (insStatus) => {
    switch (insStatus) {
      case true:
        return 'success'
      case false:
        return 'danger'
      default:
        return null
    }
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
      const listRefreshData = await fetch('/api/' + apiModule)
      const newListData = await listRefreshData.json()
      setListData(newListData)
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail: deletedInsData.employee.username + ' deleted!',
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
              (item) => item.employee.username + ' - ' + '(' + item.id + ')'
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
              (item) => item.employee.username + ' - ' + '(' + item.id + ')'
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

  const deleteDialogFoot = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={()=>setDeleteDialog(false)}
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
        onClick={()=>setMutipleDeleteDialog(false)}
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
        <Toolbar
          className="mb-4"
          left={leftToolbarTemplate}
          right={rightToolbarTemplate}></Toolbar>
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
            header="Name"
            sortable
            body={nameBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Job Info"
            body={jobBodyTemplate}
            sortable
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Contact Info"
            body={contactBodyTemplate}
            sortable
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="CreateTime"
            sortable
            field="created_time"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Status"
            body={statusBodyTemplate}
            sortable
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
            'Showing {first} to {last} of {totalRecords} products'
          }></Paginator>
      </div>

      {/* delete dialog */}
      <Dialog
        visible={deleteDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Confirm"
        modal
        footer={deleteDialogFoot}
        onHide={()=>setDeleteDialog(false)}>
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: '2rem' }}
          />
          {dataInstance && (
            <span>
              Are you sure you want to delete{' '}
              <b>{dataInstance.employee?.username}</b>?<br />
              <h4>Employee Details</h4>
              Employee ID:{' '}
              <strong style={{ 'fontSize?': '150%' }}>
                {dataInstance?.id}
              </strong>
              <br />
              Department:{' '}
              <strong style={{ 'fontSize?': '150%' }}>
                {dataInstance.employee_department?.department?.name}
              </strong>
              <br />
              Job Title:{' '}
              <strong style={{ 'fontSize?': '150%' }}>
                {dataInstance.employee_job_title || '-'}
              </strong>
              <br />
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
        onHide={()=>setMutipleDeleteDialog(false)}>
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
                  <strong style={{ 'fontSize?': '150%' }}>
                    {item.employee.username} ({item.id})
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
