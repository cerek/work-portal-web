'use client'
import React, { useState, useRef } from 'react'
import { PickList } from 'primereact/picklist'
import { Toolbar } from 'primereact/toolbar'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'

export default function DepartmentPermissionDetailPage({
  allPermissionList,
  departmentList,
}) {
  const toast = useRef(null)
  const [selectDepartment, setSelectDepartment] = useState(null)
  const [source, setSource] = useState([])
  const [target, setTarget] = useState([])

  const checkPermission = async () => {
    setSource([])
    setTarget([])
    if (!selectDepartment) {
      toast.current.show({
        severity: 'error',
        summary: 'Failed',
        detail: 'Please select the department...',
        life: 5000,
      })
      return 99
    }

    const insPermissionRes = await fetch(
      '/api/permission/department/' + selectDepartment
    )
    if (insPermissionRes.ok) {
      const insPermissionJson = await insPermissionRes.json()
      const insPermission = insPermissionJson.department.permissions
      const avaPermissionList = [...allPermissionList].filter((x) =>
        [...insPermission].every((y) => y.id !== x.id)
      )
      setTarget(insPermission)
      setSource(avaPermissionList)
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Failed',
        detail: 'Some thing wrong with retrieve permission request...',
        life: 30000,
      })
    }
  }

  const savePermission = async () => {
    const new_permission_list = target.map(x=>x.id)
    const res = await fetch('/api/permission/department/update/' + selectDepartment, {
      method: 'PATCH',
      body: JSON.stringify({"permissions": new_permission_list})
    })
    
    if (!res.ok) {
      const resData = await res.json()
      toast.current.show({
        severity: 'error',
        summary: 'Permission update Failed!',
        detail: JSON.stringify(resData),
        life: 30000,
      })
    } else {
      toast.current.show({
        severity: 'success',
        summary: 'Permission update Successfully!',
        detail: 'New permission!',
        life: 30000,
      })
    }
  }

  const startToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-4 align-items-center justify-content-center">
        <div className="flex align-items-center justify-content-center">
          <span className="text-2xl text-justify font-bold">
            Department Name:
          </span>
        </div>
        <div className="flex align-items-center justify-content-center ">
          <Dropdown
            id="department_id"
            value={selectDepartment}
            showClear
            filter
            optionLabel="label"
            placeholder="Select a Department..."
            options={departmentList}
            optionValue="value"
            onChange={(e) => setSelectDepartment(e.value)}
            className="w-full md:w-24rem"
          />
        </div>
        <Button
          label="Search"
          icon="pi pi-search"
          severity="primary"
          onClick={checkPermission}
        />
      </div>
    )
  }

  const onChange = (event) => {
    setSource(event.source)
    setTarget(event.target)
  }

  const itemTemplate = (item) => {
    return (
      <div className="flex flex-wrap p-2 align-items-center gap-3">
        <div className="flex-1 flex flex-column gap-2">
          <span className="font-bold">{item.name}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <Toast ref={toast} />
      <Toolbar className="mb-4" start={startToolbarTemplate}></Toolbar>
      <PickList
        source={source}
        target={target}
        filter
        filterBy="name"
        showSourceControls={false}
        showTargetControls={false}
        onChange={onChange}
        itemTemplate={itemTemplate}
        breakpoint="1280px"
        sourceHeader="Available"
        targetHeader="Selected"
        sourceStyle={{ height: '24rem' }}
        targetStyle={{ height: '24rem' }}
      />
      <div className="block text-center p-4 border-round mb-12">
        <Button
          raised
          rounded
          label="Save"
          severity="success"
          className='col-12 md:col-4 font-bold text-4xl'
          onClick={savePermission}
          ></Button>
      </div>
    </div>
  )
}
