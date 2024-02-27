'use client'

import Link from 'next/link'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { Editor } from 'primereact/editor'
import { Checkbox } from 'primereact/checkbox'
import { classNames } from 'primereact/utils'
import Uploader from '@/components/uploader/page'
import { dirtyValues, getFormErrorMessage } from '@/lib/utils/page'

export default function MyTicketForm({
  formType,
  ticketIns,
  ticketId,
  ticketTypeList,
  ticketAssignDepartment,
}) {
  const router = useRouter()
  const toast = useRef(null)
  let initDefaultValues = {}
  let endPointUrl = ''
  let httpMethod = ''
  if (formType === 'create') {
    initDefaultValues = {
      ticket_title: '',
      ticket_description: '',
      ticket_assign_department: null,
      ticket_type: null,
    }

    httpMethod = 'POST'
    endPointUrl = '/api/myticket'
  } else if (formType === 'update') {
    initDefaultValues = ticketIns
    httpMethod = 'PATCH'
    endPointUrl = '/api/myticket/' + ticketId
  }
  const {
    handleSubmit,
    formState: { dirtyFields, errors },
    reset,
    control,
    setValue,
  } = useForm({
    defaultValues: initDefaultValues,
  })

  const [uploadedAttachments, setUploadedAttachments] = useState([])
  const [attchments, setAttchments] = useState([])
  function getAttachmentsFromUpload(attchmentList) {
    if (formType === 'create') {
      setAttchments(attchmentList)
      setValue('ticket_attachment', attchmentList, { shouldDirty: true })
    } else if (formType === 'update') {
      setAttchments(attchmentList.concat(uploadedAttachments))
      setValue('ticket_attachment', attchmentList.concat(uploadedAttachments), {
        shouldDirty: true,
      })
    }
  }

  async function onSubmit(data) {
    const dirtyData = dirtyValues(dirtyFields, data)
    if (Object.keys(dirtyData).length === 0) {
      toast.current.show({
        severity: 'error',
        summary: 'No Any Update',
        detail: 'Please make sure you are making some update...',
        life: 30000,
      })
      return 100
    }
    const res = await fetch(endPointUrl, {
      method: httpMethod,
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
      router.push('/myticket')
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(resData.ticket_title) + formType + ' Successfully!!',
        life: 3000,
      })
    }
  }

  const handleAttachmentCheckBox = (e) => {
    let _selectedUploadAttachments = [...uploadedAttachments]

    if (e.checked) {
      _selectedUploadAttachments.push(e.value)
    } else {
      _selectedUploadAttachments = _selectedUploadAttachments.filter(
        (attachment) => attachment !== e.value
      )
    }

    setUploadedAttachments(_selectedUploadAttachments)
    setAttchments(_selectedUploadAttachments)
    setValue('ticket_attachment', _selectedUploadAttachments, {
      shouldDirty: true,
    })
  }

  useEffect(() => {
    setAttchments(ticketIns.ticket_attachment)
    setUploadedAttachments(ticketIns.ticket_attachment)
  }, [])

  return (
    <>
      <Toast ref={toast} />
      <div className="card">
        <h4 className="capitalize">{formType} ticket</h4>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column">
          <div className="p-fluid formgrid grid">
            <div className="field col-12">
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
                      <b>Titcket Title</b>
                    </label>
                    <InputText
                      id={field.name}
                      value={field.value}
                      placeholder="Write something brief..."
                      className={classNames({ 'p-invalid': fieldState.error })}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-6">
              <Controller
                name="ticket_assign_department"
                control={control}
                rules={{ required: 'Ticket Assigner is required.' }}
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
                      placeholder="Select a Ticket Assign Department..."
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

            <div className="field col-12 md:col-6">
              <Controller
                name="ticket_type"
                control={control}
                rules={{ required: 'Ticket Type is required.' }}
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
                      placeholder="Select a Ticket Type..."
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

            <div className="field col-12">
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
                      style={{ height: '400px' }}
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            {formType === 'update' && (
              <div className="field col-12 md:col-6">
                <label>
                  <b>Ticket Uploaded Attachments</b>
                </label>
                {ticketIns?.ticket_attachment_hm?.map((tick) => {
                  return (
                    <div
                      key={tick.id}
                      className="flex align-items-center gap-2 mt-2">
                      <Checkbox
                        inputId={tick.name}
                        name={tick.attachment_name}
                        value={tick.id}
                        onChange={handleAttachmentCheckBox}
                        checked={uploadedAttachments.includes(tick.id)}
                      />
                      <label htmlFor={tick.key} className="ml-2">
                        <Link href={tick.attachment_url} target="_blank">
                          {tick.attachment_name}
                        </Link>
                      </label>
                    </div>
                  )
                })}
              </div>
            )}

            <Uploader getAttachmentList={getAttachmentsFromUpload} />

            <div className="field col-12" hidden>
              <Controller
                name="ticket_attachment"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.ticket_attachment,
                      })}>
                      <b>Titcket Attachments</b>
                    </label>
                    <InputText
                      id={field.name}
                      value={attchments}
                      className={classNames({ 'p-invalid': fieldState.error })}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>
          </div>

          <div className="field col-12">
            <Button
              raised
              rounded
              label={formType.charAt(0).toUpperCase() + formType.slice(1)}
              type="submit"></Button>
            <Button
              raised
              rounded
              label="Reset"
              style={{ float: 'right' }}
              severity="danger"
              onClick={() => {
                reset()
              }}
              type="button"></Button>
          </div>
        </form>
      </div>
    </>
  )
}
