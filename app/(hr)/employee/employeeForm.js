'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { InputMask } from 'primereact/inputmask'
import { Password } from 'primereact/password'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { Divider } from 'primereact/divider'
import { Calendar } from 'primereact/calendar'
import { FileUpload } from 'primereact/fileupload'
import { Image } from 'primereact/image'
import { classNames } from 'primereact/utils'
import { dirtyValues, getFormErrorMessage } from '@/lib/utils/page'

export default function EmployeeForm({
  formType,
  employeeIns,
  employeeId,
  locationList,
  departmentList,
}) {
  const router = useRouter()
  const toast = useRef(null)
  let initDefaultValues = {}
  let endPointUrl = ''
  let httpMethod = ''
  if (formType === 'create') {
    initDefaultValues = {
      employee: {
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: '',
        is_active: null,
      },
      employee_department: null,
      employee_work_location: null,
      employee_num: '',
      employee_job_title: '',
      employee_gender: null,
      employee_phone: '',
      employee_extension: '',
      employee_join_day: '',
      employee_avatar: '',
    }

    httpMethod = 'POST'
    endPointUrl = '/api/employee'
  } else if (formType === 'update') {
    initDefaultValues = employeeIns
    httpMethod = 'PATCH'
    endPointUrl = '/api/employee/' + employeeId
  }
  const {
    handleSubmit,
    formState: { dirtyFields, errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm({
    defaultValues: initDefaultValues,
  })
  const password = useRef({})
  password.current = watch('employee.password', '')

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
      router.push('/employee')
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(resData.employee.username) +
          formType.charAt(0).toUpperCase() +
          formType.slice(1) +
          ' Successfully!!',
        life: 3000,
      })
    }
  }

  // Setup the upload avatar
  const [avatarUrl, setAvatarUrl] = useState('')
  const uploadAvatar = async (event) => {
    const formData = new FormData()
    formData.append('file_url', event.files[0])
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
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
      setAvatarUrl(resData.file_url)
      setValue('employee_avatar', resData.id, { shouldDirty: true })
    }
  }

  const pwdHeader = <div className="font-bold mb-3">Pick a password</div>
  const pwdFooter = (
    <>
      <Divider />
      <p className="mt-2">Suggestions</p>
      <ul className="pl-2 ml-2 mt-0 line-height-3">
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>Minimum 8 characters</li>
      </ul>
    </>
  )

  return (
    <>
      <div className="card">
        <h4>{formType.charAt(0).toUpperCase() + formType.slice(1)} Employee</h4>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-column gap-2">
          <Toast ref={toast} />
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-3">
              <Controller
                name="employee.username"
                control={control}
                rules={{ required: 'Username is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee?.username,
                      })}>
                      <b>Username</b>
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

            <div className="field col-12 md:col-3">
              <Controller
                name="employee.email"
                control={control}
                rules={{
                  required: { value: true, message: 'Email is required.' },
                  pattern: {
                    value:
                      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    message: 'Invalid email format',
                  },
                }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee?.email,
                      })}>
                      <b>Email</b>
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

            <div
              className="field col-12 md:col-3"
              hidden={formType === 'update' ? 'hidden' : ''}>
              <Controller
                name="employee.password"
                control={control}
                rules={{
                  required: {
                    value: formType === 'update' ? false : true,
                    message: 'You must specify a password',
                  },
                  minLength: {
                    value: 8,
                    message: 'Password must have at least 8 characters',
                  },
                }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee?.password,
                      })}>
                      <b>Password</b>
                    </label>
                    <Password
                      id={field.name}
                      {...field}
                      inputRef={field.ref}
                      className={classNames({ 'p-invalid': fieldState.error })}
                      feedback={true}
                      header={pwdHeader}
                      footer={pwdFooter}
                      toggleMask
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div
              className="field col-12 md:col-3"
              hidden={formType === 'update' ? 'hidden' : ''}>
              <Controller
                name="employee.password_confirm"
                control={control}
                rules={{
                  validate:
                    formType == 'update'
                      ? false
                      : (value) =>
                          value === password.current ||
                          'The password do not match',
                }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee?.password_confirm,
                      })}>
                      <b>Password Confirm</b>
                    </label>
                    <Password
                      id={field.name}
                      {...field}
                      inputRef={field.ref}
                      className={classNames({ 'p-invalid': fieldState.error })}
                      feedback={false}
                      toggleMask
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-3">
              <Controller
                name="employee.first_name"
                control={control}
                rules={{ required: 'First Name is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee?.first_name,
                      })}>
                      <b>First Name</b>
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

            <div className="field col-12 md:col-3">
              <Controller
                name="employee.last_name"
                control={control}
                rules={{ required: 'Last Name is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee?.last_name,
                      })}>
                      <b>Last Name</b>
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

            <div className="field col-12 md:col-3">
              <Controller
                name="employee.is_active"
                control={control}
                rules={{ required: 'Status is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee?.is_active,
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
                        { value: 'true', label: 'Active' },
                        { value: 'false', label: 'Disable' },
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

            <div className="field col-12 md:col-3">
              <Controller
                name="employee_job_title"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee_job_title,
                      })}>
                      <b>Job Title</b>
                    </label>
                    <InputText
                      id={field.name}
                      value={field.value}
                      className={classNames({ 'p-invalid': fieldState.error })}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-3">
              <Controller
                name="employee_department"
                control={control}
                rules={{ required: 'Department is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee_department,
                      })}>
                      <b>Department</b>
                    </label>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      showClear
                      filter
                      optionLabel="label"
                      placeholder="Select a Department..."
                      options={departmentList}
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

            <div className="field col-12 md:col-3">
              <Controller
                name="employee_work_location"
                control={control}
                rules={{ required: 'Work location is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee_work_location,
                      })}>
                      <b>Work Location</b>
                    </label>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      showClear={true}
                      filter
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select a Work Location..."
                      options={locationList}
                      focusInputRef={field.ref}
                      onChange={(e) => field.onChange(e.value)}
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-3">
              <Controller
                name="employee_phone"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee_phone,
                      })}>
                      <b>Phone Number</b>
                    </label>
                    <InputMask
                      id={field.name}
                      value={field.value}
                      className={classNames({ 'p-invalid': fieldState.error })}
                      onChange={(e) => field.onChange(e.target.value)}
                      mask="+1 (999)-9999999"
                      placeholder="+1 (999)-9999999"
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-3">
              <Controller
                name="employee_extension"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee_extension,
                      })}>
                      <b>Phone Extension</b>
                    </label>
                    <InputMask
                      id={field.name}
                      value={field.value}
                      className={classNames({ 'p-invalid': fieldState.error })}
                      onChange={(e) => field.onChange(e.target.value)}
                      mask="x (9999)"
                      placeholder="x (9999)"
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-3">
              <Controller
                name="employee_join_day"
                control={control}
                rules={{ required: 'Join Day is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee_join_day,
                      })}>
                      <b>Join Day</b>
                    </label>
                    <Calendar
                      inputId={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      dateFormat="dd/mm/yy"
                      showTime
                      showButtonBar
                      hourFormat="24"
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
                    {getFormErrorMessage(field.name, errors)}
                  </>
                )}
              />
            </div>

            <div className="field col-12 md:col-3">
              <Controller
                name="employee_gender"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee_gender,
                      })}>
                      <b>Gender</b>
                    </label>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      showClear
                      filter
                      optionLabel="label"
                      placeholder="Select a Gender..."
                      options={[
                        { value: 0, label: 'Female' },
                        { value: 1, label: 'Male' },
                        { value: 10, label: 'Prefer Not to Answer' },
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

            <div
              className="field col-12 md:col-3"
              hidden={formType === 'update' ? 'hidden' : ''}>
              <Controller
                name="employee_avatar"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className={classNames({
                        'p-error': errors.employee_avatar,
                      })}>
                      <b>Employee Avatar ID</b>
                    </label>
                    <InputText
                      id={field.name}
                      value={field.value}
                      disabled
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
                  </>
                )}
              />
            </div>

            <div
              className="field col-12 md:col-3"
              hidden={formType === 'update' ? 'hidden' : ''}>
              <label htmlFor="employee_avatar">
                <b>Employee Avatar</b>
              </label>
              <FileUpload
                mode="advanced"
                accept="image/*"
                customUpload
                uploadHandler={uploadAvatar}
                maxFileSize={1000000}
                emptyTemplate={
                  <p className="m-0">Drag and drop files to here to upload.</p>
                }
              />
            </div>

            {avatarUrl && (
              <div className="field col-12 md:col-3">
                <Image src={avatarUrl} alt="Image" width="250" />
              </div>
            )}
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
