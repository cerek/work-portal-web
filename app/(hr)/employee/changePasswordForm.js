'use client'

import React, { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { signOut } from 'next-auth/react'
import { Toast } from 'primereact/toast'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { classNames } from 'primereact/utils'
import { dirtyValues, getFormErrorMessage } from '@/lib/utils/page'

export default function EmployeeChangePasswordForm({ employeeId, personal }) {
  const {
    register,
    handleSubmit,
    formState: { dirtyFields, errors },
    control,
    reset,
    watch,
  } = useForm({})
  const toast = useRef(null)
  const password = useRef({})
  password.current = watch('password', '')
  const [isLogout, setIsLogout] = useState(personal)
  let endPointUrl = ''
  if (isLogout) {
    endPointUrl = '/api/employee/change-password/' + employeeId
  } else {
    endPointUrl = '/api/employee/admin-change-password/' + employeeId
  }

  const pwdHeader = <div className="font-bold mb-3">Pick a password</div>
  const pwdFooter = (
    <>
      <p className="mt-2">Suggestions</p>
      <ul className="pl-2 ml-2 mt-0 line-height-3">
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>Minimum 8 characters</li>
      </ul>
    </>
  )

  async function onSubmit(data) {
    const dirtyData = dirtyValues(dirtyFields, data)
    const res = await fetch(endPointUrl, {
      method: 'PUT',
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
      // For personal, the account need to logout after the password change
      if (isLogout) {
        signOut()
      } else {
        toast.current.show({
          severity: 'success',
          summary: 'Successful',
          detail: 'The password had change!!',
          life: 30000,
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-2">
      <Toast ref={toast} />
      <div className="p-fluid formgrid grid">
        <div className="field col-12" hidden={isLogout ? '' : 'hidden'}>
          <Controller
            name="old_password"
            control={control}
            rules={{
              required: {
                value: isLogout ? true : false,
                message: 'You must specify a password',
              },
            }}
            render={({ field, fieldState }) => (
              <>
                <label
                  htmlFor={field.name}
                  className={classNames({
                    'p-error': errors.old_password,
                  })}>
                  <b>Old Password</b>
                </label>
                <Password
                  id={field.name}
                  {...field}
                  inputRef={field.ref}
                  className={classNames({ 'p-invalid': fieldState.error })}
                  toggleMask
                />
                {getFormErrorMessage(field.name, errors)}
              </>
            )}
          />
        </div>

        <div className="field col-12">
          <Controller
            name="password"
            control={control}
            rules={{
              required: {
                value: true,
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
                    'p-error': errors.password,
                  })}>
                  <b>New Password</b>
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

        <div className="field col-12">
          <Controller
            name="password2"
            control={control}
            rules={{
              validate: (value) =>
                value === password.current || 'The password do not match',
            }}
            render={({ field, fieldState }) => (
              <>
                <label
                  htmlFor={field.name}
                  className={classNames({
                    'p-error': errors.password2,
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
          <div class="flex align-items-center justify-content-center font-bold border-round">
            <Button
              raised
              rounded
              label="Change Password"
              type="submit"></Button>
          </div>
        </div>
      </div>
    </form>
  )
}
