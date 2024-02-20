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
import { InputTextarea } from 'primereact/inputtextarea'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { Paginator } from 'primereact/paginator'
import { Chip } from 'primereact/chip'
import { classNames } from 'primereact/utils'
import {
  searchList,
  pageControl,
  delInsConfirm,
  dirtyValues,
  getFormErrorMessage,
} from '@/lib/utils/page'

export default function TicketList({
  ticketList,
  ticketTypeList,
  ticketCreatorList,
  ticketAssignerList,
  ticketAssignDepartment,
}) {
  const initDefaultValues = {
    ticket_title: '',
    ticket_description: '',
    ticket_solution: '',
    ticket_status: 0,
    ticket_creator: '',
    ticket_assigner: '',
    ticket_assign_department: '',
    ticket_type: null,
  }
  const apiModule = 'ticket'
  const dt = useRef(null)
  const toast = useRef(null)
  const router = useRouter()
  const [newInstanceDialog, setNewInstanceDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [dataInstance, setDataInstance] = useState({})
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [mutipleDeleteDialog, setMutipleDeleteDialog] = useState(false)
  const [listData, setListData] = useState(ticketList)
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
        <Link href={'/ticket/create'}>
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
      <h4 className="m-0">Ticket</h4>
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
        <Link href={'/ticket/detail/' + rowData.id}>
          <Button
            icon="pi pi-eye"
            rounded
            outlined
            className="mr-2"
            severity="info"
          />
        </Link>
        <Link href={'/ticket/update/' + rowData.id}>
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
        res = rowData.ticket_solution || ""
    }

    if (res.length > 50) {
        return res.slice(0, 50) + "...";
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
        return 'success'
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
          deletedInsData.ticket_title +
          ' from ' +
          deleteInstance.ticket_creator_hm +
          'was deleted!',
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
              (item) => item.ticket_title + ' - ' + '(' + item.id + ')'
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
              (item) => item.ticket_title + ' - ' + '(' + item.id + ')'
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
        detail: JSON.stringify(resData.ticket_title) + ' create Successfully!!',
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
          end={rightToolbarTemplate}></Toolbar>
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
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="New Ticket"
        modal
        className="p-fluid"
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
              rules={{ required: 'Ticket description is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.ticket_description,
                    })}>
                    <b>Description</b>
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
              name="ticket_status"
              control={control}
              rules={{ required: 'Ticket status is required.' }}
              render={({ field, fieldState }) => (
                <>
                  <label
                    htmlFor={field.name}
                    className={classNames({
                      'p-error': errors.ticket_status,
                    })}>
                    <b>Ticket Status</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a ticket status..."
                    options={[
                      { value: 0, label: 'New' },
                      { value: 1, label: 'In progress' },
                      { value: 2, label: 'On hold' },
                      { value: 3, label: 'Finished' },
                      { value: 4, label: 'Rejected' },
                      { value: 5, label: 'Closed' },
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
              name="ticket_creator"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label htmlFor={field.name}>
                    <b>Ticket Creator</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a Creator..."
                    options={ticketCreatorList}
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
              name="ticket_assigner"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label htmlFor={field.name}>
                    <b>Ticket Assigner</b>
                  </label>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    showClear
                    filter
                    optionLabel="label"
                    placeholder="Select a assigner..."
                    options={ticketAssignerList}
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
              name="ticket_assign_department"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label htmlFor={field.name}>
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
              Are you sure you want to delete <b>{dataInstance.ticket_title}</b>
              ?<br />
              <h4>Ticket Details</h4>
              <br />
              Ticket ID: <span className="font-bold">{dataInstance.id}</span>
              <br />
              Ticket Creator:{' '}
              <span className="font-bold">
                {dataInstance.ticket_creator_hm}
              </span>
              <br />
              Ticket Title:{' '}
              <span className="font-bold">{dataInstance.ticket_title}</span>
              <br />
              Ticket Description:{' '}
              <span className="font-bold">
                {dataInstance.ticket_description}
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
                    {item.ticket_title} ({item.id})
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
