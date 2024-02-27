'use client'

import Link from 'next/link'
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
import { Editor } from 'primereact/editor'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { Paginator } from 'primereact/paginator'
import { classNames } from 'primereact/utils'
import {
  searchList,
  pageControl,
  dirtyValues,
  getFormErrorMessage,
} from '@/lib/utils/page'

export default function MyTicketList({
  ticketList,
  ticketTypeList,
  ticketAssignDepartment,
}) {
  const initDefaultValues = {
    ticket_title: '',
    ticket_description: '',
    ticket_assign_department: null,
    ticket_type: null,
  }
  const apiModule = 'myticket'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [listData, setListData] = useState(ticketList)
  const [delInstances, setDelInstances] = useState(null)
  const [firstPage, setFirstPage] = useState(0)
  const [pageRows, setPageRows] = useState(10)
  const [displayConfirmation, setDisplayConfirmation] = useState(false)
  const {
    handleSubmit,
    formState: { dirtyFields, errors },
    reset,
    control,
  } = useForm({
    defaultValues: initDefaultValues,
  })

  // Table Header and Toolbar
  const startToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="New(Brief)"
          icon="pi pi-plus"
          severity="success"
          onClick={() => setNewInstanceDialog(true)}
        />
        <Link href={'/myticket/create'}>
          <Button label="New(Detail)" icon="pi pi-plus" severity="success" />
        </Link>
      </div>
    )
  }

  async function searchEvent() {
    const searchRes = await searchList(apiModule, globalFilter)
    setListData(searchRes)
  }

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">My Ticket</h4>
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

  const handleShowCloseConfirmation = (r) => {
    setDelInstances(r)
    setDisplayConfirmation(true)
  }

  const handleCloseTicket = async () => {
    const closeBody = { ticket_status: 5 }
    const res = await fetch('/api/' + apiModule + '/' + delInstances.id, {
      method: 'PATCH',
      body: JSON.stringify(closeBody),
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
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail: delInstances.ticket_title + ' was close successfully!!',
        life: 10000,
      })
    }
    setDelInstances(null)
    setDisplayConfirmation(false)
  }

  // Table Template
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
        onClick={handleCloseTicket}
        autoFocus
      />
    </>
  )

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Link href={'/myticket/detail/' + rowData.id}>
          <Button icon="pi pi-eye" rounded className="mr-2" severity="info" />
        </Link>
        {!['Closed', 'Finished'].includes(rowData.ticket_status_hm) && (
          <Link href={'/myticket/update/' + rowData.id}>
            <Button
              icon="pi pi-pencil"
              rounded
              className="mr-2"
              severity="warning"
            />
          </Link>
        )}
        {!['Closed', 'Rejected'].includes(rowData.ticket_status_hm) && (
          <Button
            icon="pi pi-times"
            rounded
            severity="danger"
            onClick={() => handleShowCloseConfirmation(rowData)}
          />
        )}
      </React.Fragment>
    )
  }

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag severity={getSeverity(rowData.ticket_status_hm)}>
        {rowData.ticket_status_hm}
      </Tag>
    )
  }

  const creatorBodyTemplate = (rowData) => {
    return (
      <>
        <strong style={{ 'fontSize?': '150%' }}>
          {rowData.ticket_creator_hm}
        </strong>
        <br />
        <Tag
          icon="pi pi-users"
          severity="info"
          value={rowData.ticket_creator_department_hm}></Tag>
      </>
    )
  }

  const assignerBodyTemplate = (rowData) => {
    return (
      <>
        <strong style={{ 'fontSize?': '150%' }}>
          {rowData.ticket_assigner_hm}
        </strong>
        <br />
        <Tag
          icon="pi pi-users"
          severity="success"
          value={rowData.ticket_assign_department_hm}></Tag>
      </>
    )
  }

  const shortBodyTemplate = (rowData, flag) => {
    let res = ''
    if (flag == 'desc') {
      res = rowData.ticket_description
    } else if (flag == 'solu') {
      res = rowData.ticket_solution || ''
    }

    if (res.length > 50) {
      return res.slice(0, 50) + '...'
    } else {
      return res
    }
  }

  const getSeverity = (insStatus) => {
    switch (insStatus) {
      case 'New':
        return 'info'
      case 'Finished':
        return 'success'
      case 'Closed':
        return 'danger'
      case 'In progress':
        return 'primary'
      case 'On hold':
        return 'danger'
      case 'Rejected':
        return 'danger'
      default:
        return null
    }
  }

  // Main operation function
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
        detail: JSON.stringify(resData.ticket_title) + ' create Successfully!!',
        life: 3000,
      })
      reset()
    }
  }

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
        <Toolbar className="mb-4" start={startToolbarTemplate}></Toolbar>
        <DataTable
          dataKey="id"
          ref={dt}
          value={listData.results}
          stripedRows
          header={header}>
          <Column
            field="id"
            header="ID"
            sortable
            style={{ maxWidth: '3rem' }}></Column>
          <Column
            field="ticket_creator_hm"
            header="Creator"
            body={creatorBodyTemplate}
            style={{ mixWidth: '6rem' }}></Column>
          <Column
            field="ticket_assigner_hm"
            header="Assigner"
            body={assignerBodyTemplate}
            style={{ mixWidth: '6rem' }}></Column>
          <Column
            field="ticket_title"
            header="Title"
            style={{ minWidth: '8rem' }}></Column>
          <Column
            header="Description"
            body={(e) => shortBodyTemplate(e, 'desc')}
            style={{ minWidth: '8rem' }}></Column>
          <Column
            header="Solution"
            body={(e) => shortBodyTemplate(e, 'solu')}
            style={{ minWidth: '8rem' }}></Column>
          <Column
            header="Type"
            field="ticket_type_hm"
            style={{ minWidth: '5rem' }}></Column>
          <Column
            header="Status"
            field="ticket_status_hm"
            body={statusBodyTemplate}
            style={{ mixWidth: '6rem' }}></Column>
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
            'Showing {first} to {last} of {totalRecords} products'
          }></Paginator>
      </div>

      {/* new instance dialog */}
      <Dialog
        visible={newInstanceDialog}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="New Ticket"
        modal
        className="p-fluid"
        maximizable
        onHide={() => setNewInstanceDialog(false)}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-column gap-2">
          <div className="field">
            <Controller
              name="ticket_title"
              control={control}
              rules={{ required: 'Ticket Title is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.ticket_title,
                    })}>
                    <b>Ticket Title</b>
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
              name="ticket_description"
              control={control}
              rules={{ required: 'Ticket Description is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.ticket_description,
                    })}>
                    <b>Ticket Description</b>
                  </label>
                  <Editor
                    id={field.name}
                    value={field.value}
                    onTextChange={(e) => field.onChange(e.htmlValue)}
                    className={classNames({ 'p-invalid': fieldState.error })}
                    style={{ height: '200px' }}
                  />
                  {getFormErrorMessage(field.name, errors)}
                </>
              )}
            />
          </div>

          <div className="field">
            <Controller
              name="ticket_type"
              control={control}
              rules={{ required: 'Ticket type is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.ticket_type,
                    })}>
                    <b>Ticket Type</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a ticket type..."
                    options={ticketTypeList}
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
              name="ticket_assign_department"
              control={control}
              rules={{ required: 'Ticket assign department is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.ticket_assign_department,
                    })}>
                    <b>Ticket Assign Department</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a assign department..."
                    options={ticketAssignDepartment}
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

      {/* close confirmation dialog */}
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
            Are you sure you want to Close this Ticket - {delInstances?.id}?
          </span>
        </div>
      </Dialog>
    </>
  )
}
