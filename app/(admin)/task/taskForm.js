'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { Calendar } from 'primereact/calendar'
import { classNames } from 'primereact/utils'
import { dirtyValues, getFormErrorMessage } from '@/lib/utils/page'

export default function TaskForm({ formType, taskIns, taskId }) {
  const router = useRouter()
  const toast = useRef(null)
  let initDefaultValues = {}
  let endPointUrl = ''
  let httpMethod = ''
  if (formType === 'create') {
    initDefaultValues = {
      name: '',
      task: '',
      args: [],
      kwargs: {},
      queue: '',
      expires: '',
      one_off: false,
      start_time: '',
      enabled: null,
      last_run_at: '',
      description: '',
      task_type: null,
      interval: null,
      crontab: null,
      clocked: null,
    }

    httpMethod = 'POST'
    endPointUrl = '/api/task'
  } else if (formType === 'update') {
    initDefaultValues = taskIns
    httpMethod = 'PATCH'
    endPointUrl = '/api/task/' + taskId
  }
  const {
    handleSubmit,
    formState: { dirtyFields, errors },
    reset,
    control,
  } = useForm({
    defaultValues: initDefaultValues,
  })
  const [selectedValue, setSelectedValue] = useState('')

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
      router.push('/task')
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(resData.name) +
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

  return (
    <>
      <div className="card">
        <h4>{formType.charAt(0).toUpperCase() + formType.slice(1)} Task</h4>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-column gap-2">
          <Toast ref={toast} />
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6">
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Task Name is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.name,
                      })}>
                      <b>Task Name</b>
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

            <div className="field col-12 md:col-6">
              <Controller
                name="task"
                control={control}
                rules={{
                  required: { value: true, message: 'Task Path is required.' },
                }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.task,
                      })}>
                      <b>Task Path</b>
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

            <div className="field col-12 md:col-6">
              <Controller
                name="start_time"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label htmlFor={field.name}>
                      <b>Task StartTime</b>
                    </label>
                    <Calendar
                      inputId={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      dateFormat="dd/mm/yy"
                      showTime
                      showButtonBar
                      hourFormat="24"
                    />
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-6">
              <Controller
                name="expires"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label htmlFor={field.name}>
                      <b>Task EndTime</b>
                    </label>
                    <Calendar
                      inputId={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      dateFormat="dd/mm/yy"
                      showTime
                      showButtonBar
                      hourFormat="24"
                    />
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-6">
              <Controller
                name="enabled"
                control={control}
                rules={{ required: 'Enabled is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.enabled,
                      })}>
                      <b>Enabled</b>
                    </label>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      showClear
                      filter
                      optionLabel="label"
                      placeholder="Select a Status..."
                      options={[
                        { value: 'true', label: 'Active' },
                        { value: 'false', label: 'Disable' },
                      ]}
                      optionValue="value"
                      focusInputRef={field.ref}
                      onChange={(e) => field.onChange(e)}
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-6">
              <Controller
                name="task_type"
                control={control}
                rules={{ required: 'Task type is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.task_type,
                      })}>
                      <b>Task Type</b>
                    </label>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      showClear
                      filter
                      optionLabel="label"
                      placeholder="Select a type..."
                      options={[
                        { value: 0, label: 'OneTime Job' },
                        { value: 1, label: 'Cron Job' },
                        { value: 2, label: 'Interval Job' },
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

            {selectedValue === 0 && (
              <div className="field col-12">
                {/* <label>
                  <b>Schedule Choose</b>
                </label> */}
                <Controller
                  name="period_data.clocked_time"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <label htmlFor={field.name}>
                        <b>Schedule Choose</b>
                      </label>
                      <Calendar
                        inputId={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        dateFormat="dd/mm/yy"
                        showTime
                        showButtonBar
                        hourFormat="24"
                      />
                    </>
                  )}
                />
              </div>
            )}

            {selectedValue === 1 && (
              <>
                <div className="field col-12 md:col-2">
                  <Controller
                    name="period_data.minute"
                    control={control}
                    rules={{ required: 'Schedule minute is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.minute,
                          })}>
                          <b>Minute</b>
                        </label>
                        <InputText
                          id={field.name}
                          value={field.value || ''}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
                <div className="field col-12 md:col-2">
                  <Controller
                    name="period_data.hour"
                    control={control}
                    rules={{ required: 'Schedule hour is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.hour,
                          })}>
                          <b>Hour</b>
                        </label>
                        <InputText
                          id={field.name}
                          value={field.value || ''}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
                <div className="field col-12 md:col-2">
                  <Controller
                    name="period_data.day_of_week"
                    control={control}
                    rules={{ required: 'Schedule day of week is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.day_of_week,
                          })}>
                          <b>Day of Week</b>
                        </label>
                        <InputText
                          id={field.name}
                          value={field.value || ''}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
                <div className="field col-12 md:col-2">
                  <Controller
                    name="period_data.day_of_month"
                    control={control}
                    rules={{ required: 'Schedule day of month is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.day_of_month,
                          })}>
                          <b>Day of Month</b>
                        </label>
                        <InputText
                          id={field.name}
                          value={field.value || ''}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
                <div className="field col-12 md:col-2">
                  <Controller
                    name="period_data.month_of_year"
                    control={control}
                    rules={{ required: 'Schedule month of year is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className={classNames({
                            'p-error': errors.month_of_year,
                          })}>
                          <b>Month of Year</b>
                        </label>
                        <InputText
                          id={field.name}
                          value={field.value || ''}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
                <div className="field col-12 md:col-2">
                  <Controller
                    name="period_data.timezone"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <label htmlFor={field.name}>
                          <b>Timezone</b>
                        </label>
                        <InputText
                          id={field.name}
                          value={field.value || 'America/Los_Angeles'}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </>
                    )}
                  />
                </div>
              </>
            )}

            {selectedValue === 2 && (
              <div className="field col-12">
                <label>
                  <b>Schedule Choose</b>
                </label>
                <div className="p-inputgroup">
                  <span className="p-inputgroup-addon">every</span>
                  <Controller
                    name="period_data.every"
                    control={control}
                    rules={{ required: 'Schedule every is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <InputNumber
                          id={field.name}
                          inputRef={field.ref}
                          onValueChange={(e) => field.onChange(e)}
                          useGrouping={false}
                          max={100}
                          inputClassName={classNames({
                            'p-invalid': fieldState.error,
                          })}
                          className="col-6"
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                  <Controller
                    name="period_data.period"
                    control={control}
                    rules={{ required: 'Task type is required.' }}
                    render={({ field, fieldState }) => (
                      <>
                        <Dropdown
                          id={field.name}
                          value={field.value}
                          filter
                          optionLabel="label"
                          placeholder="Select a type..."
                          options={[
                            { value: 'days', label: 'Days' },
                            { value: 'hours', label: 'Hours' },
                            { value: 'minutes', label: 'Minutes' },
                            { value: 'seconds', label: 'Seconds' },
                          ]}
                          optionValue="value"
                          focusInputRef={field.ref}
                          onChange={(e) => field.onChange(e)}
                        />
                        {getFormErrorMessage(field.name, errors)}
                      </>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="field col-12">
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label htmlFor={field.name}>Description</label>
                    <InputTextarea
                      id={field.name}
                      {...field}
                      rows={6}
                      cols={30}
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
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
