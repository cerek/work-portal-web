'use client'

import Link from 'next/link'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { SplitButton } from 'primereact/splitbutton';
import { Toolbar } from 'primereact/toolbar'
import { Dialog } from 'primereact/dialog'
import { Tag } from 'primereact/tag'
import { Badge } from 'primereact/badge'
import { InputText } from 'primereact/inputtext'
import { Paginator } from 'primereact/paginator'
import { searchList, pageControl, delInsConfirm } from '@/lib/utils/page'

export default function ScheduleChangeList({ scheduleChangeList }) {
  const apiModule = 'schedulechange'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState('')
  const [dataInstance, setDataInstance] = useState({})
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [mutipleDeleteDialog, setMutipleDeleteDialog] = useState(false)
  const [listData, setListData] = useState(scheduleChangeList)
  const [selectInstances, setSelectInstances] = useState(null)
  const [firstPage, setFirstPage] = useState(0)
  const [pageRows, setPageRows] = useState(10)

  // Table Header and Toolbar
  const exportCSV = () => {
    dt.current.exportCSV()
  }

  const startToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href={'/schedulechange/create'}>
          <Button label="New" icon="pi pi-plus" severity="success" />
        </Link>
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

  async function handleSchduleChangeDecide(operationStatus, id) {
    const dirtyData = { schedule_change_status: operationStatus }
    const res = await fetch('/api/schedulechange/decide/' + id, {
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

  const workShiftBodyTemplate = (rowData) => {
    return <>{rowData.schedule_change_work_shift_hm}</>
  }

  const workDayBodyTemplate = (rowData) => {
    if (rowData.schedule_change_work_day !== null) {
      const workDayList = rowData.schedule_change_work_day.split(',')
      const resList = workDayList.map((item) => (
        <Badge
          key={item}
          value={item}
          className="mr-1"
          severity="secondary"></Badge>
      ))
      return <>{resList}</>
    }
  }

  const startAndOffBodyTemplate = (rowData) => {
    if (rowData.schedule_change_type_hm == 'Long Term') {
      return rowData.schedule_change_start_date
    } else if (rowData.schedule_change_type_hm == 'Short Term') {
      return rowData.schedule_change_off_date
    }
  }

  const endAndWorkBodyTemplate = (rowData) => {
    if (rowData.schedule_change_type_hm == 'Long Term') {
      return rowData.schedule_change_end_date
    } else if (rowData.schedule_change_type_hm == 'Short Term') {
      return rowData.schedule_change_work_date
    }
  }

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        {rowData.schedule_change_status_hm === 'New' && (
          <SplitButton label="Decide" icon="pi pi-question-circle" model={[{label: 'Approval', icon: 'pi pi-verified', command: () => handleSchduleChangeDecide(1, rowData.id)}, {label: 'Reject', icon: 'pi pi-times-circle', command: () => handleSchduleChangeDecide(2, rowData.id)}]} severity="danger" className='mr-2'></SplitButton>
        )}
        <Link href={'/schedulechange/update/' + rowData.id}>
          <Button
            icon="pi pi-pencil"
            rounded
            outlined
            severity="warning"
            className="mr-2"
          />
        </Link>
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
            field="schedule_change_applicant_hm"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Start Date/Off Date"
            body={startAndOffBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="End Date/Work Date"
            body={endAndWorkBodyTemplate}
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Work Day"
            body={workDayBodyTemplate}
            field="schedule_plan_work_day"
            style={{ minWidth: '4rem' }}></Column>
          <Column
            header="Work Shift"
            body={workShiftBodyTemplate}
            field="schedule_plan_work_shift"
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
            header="CreateTime"
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
            'Showing {first} to {last} of {totalRecords} schedule changes'
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
        onHide={() => setDeleteDialog(false)}>
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: '2rem' }}
          />
          {dataInstance && (
            <span>
              Are you sure you want to delete{' '}
              <b>{dataInstance.schedule_change_applicant}</b>'s Schedule Change
              request?
              <br />
              <h4>Schedule Change Details</h4>
              <br />
              Schedule Change ID:{' '}
              <span className="font-blod">{dataInstance.id}</span>
              <br />
              Schedule Change Applicant:{' '}
              <span className="font-blod">
                {dataInstance.schedule_change_applicant_hm}
              </span>
              <br />
              Schedule Change Reason:{' '}
              <span className="font-blod">
                {dataInstance.schedule_change_apply_reason}
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
              <h4>Items List Details - Reason(ID)</h4>
              {selectInstances.map((item) => (
                <>
                  <strong style={{ 'fontSize?': '150%' }} key={item.id}>
                    {item.schedule_change_apply_reason} ({item.id})
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
