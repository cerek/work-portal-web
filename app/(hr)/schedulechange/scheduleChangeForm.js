'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import { Toast } from 'primereact/toast'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import { classNames } from 'primereact/utils'
import { dirtyValues, getFormErrorMessage } from '@/lib/utils/page'

export default function ScheduleChangeForm({
  formType,
  scheduleChangeIns,
  scheduleChangeId,
  workShiftList,
  applicantList,
  approverList,
}) {
  const router = useRouter()
  const toast = useRef(null)
  const [selectedValue, setSelectedValue] = useState('')
  let initDefaultValues = {}
  let endPointUrl = ''
  let httpMethod = ''
  if (formType === 'create') {
    initDefaultValues = {
      schedule_change_apply_reason: '',
      schedule_change_reject_reason: '',
      schedule_change_type: null,
      schedule_change_status: null,
      schedule_change_start_date: '',
      schedule_change_end_date: '',
      schedule_change_off_date: '',
      schedule_change_work_date: '',
      schedule_change_work_day: '',
      schedule_change_applicant: null,
      schedule_change_approver: null,
      schedule_change_work_shift: null,
    }
    httpMethod = 'POST'
    endPointUrl = '/api/schedulechange'
  } else if (formType === 'update') {
    initDefaultValues = scheduleChangeIns
    httpMethod = 'PATCH'
    endPointUrl = '/api/schedulechange/' + scheduleChangeId
  }
  const {
    handleSubmit,
    formState: { dirtyFields, errors },
    reset,
    control,
  } = useForm({
    defaultValues: initDefaultValues,
  })

  async function onSubmit(data) {
    const dirtyData = dirtyValues(dirtyFields, data)
    if ('schedule_change_work_day' in dirtyData) {
      dirtyData.schedule_change_work_day =
        dirtyData.schedule_change_work_day.toString()
    }
    if ('schedule_change_end_date' in dirtyData) {
      dirtyData.schedule_change_end_date = dirtyData.schedule_change_end_date
        .toISOString()
        .split('T')[0]
    }
    if ('schedule_change_start_date' in dirtyData) {
      dirtyData.schedule_change_start_date =
        dirtyData.schedule_change_start_date.toISOString().split('T')[0]
    }
    if ('schedule_change_work_date' in dirtyData) {
      const workDateStringArr = dirtyData.schedule_change_work_date.map(
        (item) => item.toISOString().split('T')[0]
      )
      dirtyData.schedule_change_work_date = workDateStringArr.toString()
    }
    if ('schedule_change_off_date' in dirtyData) {
      const offDateStringArr = dirtyData.schedule_change_off_date.map(
        (item) => item.toISOString().split('T')[0]
      )
      dirtyData.schedule_change_off_date = offDateStringArr.toString()
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
      router.push('/schedulechange')
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(resData.schedule_change_apply_reason) +
          formType.charAt(0).toUpperCase() +
          formType.slice(1) +
          ' Successfully!!',
        life: 3000,
      })
    }
  }

  const scheduleContext = (f, event) => {
    f.onChange(event.value)
    setSelectedValue(event.value)
  }

  useEffect(() => {
    setSelectedValue(scheduleChangeIns.schedule_change_type)
  }, [])

  return (
    <>
      <Toast ref={toast} />
      <div className="card">
        <h4 className="capitalize">{formType} Schedule Change</h4>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column">
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6">
              <Controller
                name="schedule_change_applicant"
                control={control}
                rules={{ required: 'Schedule Change applicant is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.schedule_change_applicant,
                      })}>
                      <b>Schedule Change Applicant</b>
                    </label>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      showClear
                      filter
                      optionLabel="label"
                      placeholder="Select a Schedule Change Applicant..."
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

            <div className="field col-12 md:col-6">
              <Controller
                name="schedule_change_approver"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label htmlFor={field.name}>
                      <b>Schedule Change Approver</b>
                    </label>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      showClear
                      filter
                      optionLabel="label"
                      placeholder="Select a Schedule Change Approver..."
                      options={approverList}
                      optionValue="value"
                      focusInputRef={field.ref}
                      onChange={(e) => field.onChange(e.value)}
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-6">
              <Controller
                name="schedule_change_type"
                control={control}
                rules={{ required: 'Schedule Change Type is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.schedule_change_type,
                      })}>
                      <b>Schedule Change Type</b>
                    </label>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      showClear
                      filter
                      optionLabel="label"
                      placeholder="Select a Schedule Change Type..."
                      options={[
                        { value: 0, label: 'Short Term' },
                        { value: 1, label: 'Long Term' },
                      ]}
                      optionValue="value"
                      focusInputRef={field.ref}
                      onChange={(e) => scheduleContext(field, e)}
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-6">
              <Controller
                name="schedule_change_status"
                control={control}
                rules={{ required: 'Schedule Change Status is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.schedule_change_status,
                      })}>
                      <b>Schedule Change Status</b>
                    </label>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      showClear
                      filter
                      optionLabel="label"
                      placeholder="Select a Schedule Change Status..."
                      options={[
                        { value: 0, label: 'New' },
                        { value: 1, label: 'Approval' },
                        { value: 2, label: 'Reject' },
                        { value: 3, label: 'Cancel' },
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

            {selectedValue === 0 && (
              <>
                <div className="field col-12 md:col-4">
                  <Controller
                    name="schedule_change_off_date"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <label htmlFor={field.name}>
                          <b>Select the Off Day</b>
                        </label>
                        <Calendar
                          inputId={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          dateFormat="yy-mm-dd"
                          showButtonBar
                          selectionMode="multiple"
                          maxDateCount={3}
                        />
                      </>
                    )}
                  />
                </div>
                <div className="field col-12 md:col-4">
                  <Controller
                    name="schedule_change_work_date"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <label htmlFor={field.name}>
                          <b>Select the Work Day</b>
                        </label>
                        <Calendar
                          inputId={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          dateFormat="yy-mm-dd"
                          showButtonBar
                          selectionMode="multiple"
                          maxDateCount={3}
                        />
                      </>
                    )}
                  />
                </div>
                <div className="field col-12 md:col-4">
                  <Controller
                    name="schedule_change_work_shift"
                    control={control}
                    rules={{ required: 'Select the work shift is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.schedule_change_work_shift,
                          })}>
                          <b>Select Work Shift</b>
                        </label>
                        <Dropdown
                          id={field.name}
                          value={field.value}
                          showClear
                          filter
                          optionLabel="label"
                          placeholder="Select a Work Shift..."
                          options={workShiftList}
                          optionValue="value"
                          focusInputRef={field.ref}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
              </>
            )}

            {selectedValue === 1 && (
              <>
                <div className="field col-12 md:col-3">
                  <Controller
                    name="schedule_change_start_date"
                    control={control}
                    rules={{
                      required:
                        'Select the start date of the changes is required.',
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.schedule_change_start_date,
                          })}>
                          <b>Select the Start Date</b>
                        </label>
                        <Calendar
                          inputId={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          dateFormat="yy-mm-dd"
                          showButtonBar
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
                <div className="field col-12 md:col-3">
                  <Controller
                    name="schedule_change_end_date"
                    control={control}
                    rules={{
                      required:
                        'Select the end date of the changes is required.',
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.schedule_change_end_date,
                          })}>
                          <b>Select the End Date</b>
                        </label>
                        <Calendar
                          inputId={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          dateFormat="yy-mm-dd"
                          showButtonBar
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
                <div className="field col-12 md:col-3">
                  <Controller
                    name="schedule_change_work_day"
                    control={control}
                    rules={{ required: 'Select the work day is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.schedule_change_work_day,
                          })}>
                          <b>Select Work Day</b>
                        </label>
                        <MultiSelect
                          id={field.name}
                          value={field.value}
                          showClear
                          filter
                          optionLabel="label"
                          placeholder="Select a work day..."
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
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
                <div className="field col-12 md:col-3">
                  <Controller
                    name="schedule_change_work_shift"
                    control={control}
                    rules={{ required: 'Select the work shift is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.schedule_change_work_shift,
                          })}>
                          <b>Select Work Shift</b>
                        </label>
                        <Dropdown
                          id={field.name}
                          value={field.value}
                          showClear
                          filter
                          optionLabel="label"
                          placeholder="Select a Work Shift..."
                          options={workShiftList}
                          optionValue="value"
                          focusInputRef={field.ref}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
              </>
            )}

            <div className="field col-12 md:col-6">
              <Controller
                name="schedule_change_apply_reason"
                control={control}
                rules={{ required: 'Schedule Change Reason is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.schedule_change_apply_reason,
                      })}>
                      <b>Schedule Change Apply Reason</b>
                    </label>
                    <InputTextarea
                      id={field.name}
                      {...field}
                      rows={8}
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-6">
              <Controller
                name="schedule_change_reject_reason"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label htmlFor={field.name}>
                      <b>Schedule Change Reject Reason</b>
                    </label>
                    <InputTextarea id={field.name} {...field} rows={8} />
                  </>
                )}
              />
            </div>

            {/* <div className="field col-12 md:col-6">
              <Controller
                name="schedule_change_apply_reason"
                control={control}
                rules={{ required: 'Schedule Change Reason is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.schedule_change_apply_reason,
                      })}>
                      <b>Schedule Change Apply Reason</b>
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

            <div className="field col-12 md:col-6">
              <Controller
                name="schedule_change_reject_reason"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.schedule_change_reject_reason,
                      })}>
                      <b>Schedule Change Reject Reason</b>
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
            </div> */}
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
