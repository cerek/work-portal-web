'use client'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { Paginator } from 'primereact/paginator'
import MyCalender from '@/components/calender/page'
import { pageControl } from '@/lib/utils/page'

export default function ScheduleShow({ departmentList }) {
  const apiModule = 'schedule'
  const dt = useRef(null)
  const toast = useRef(null)
  const [selectDept, setSelectDept] = useState('')
  const [calData, setCalData] = useState()
  const [employeeListResult, setEmployeeListResult] = useState()
  const [firstPage, setFirstPage] = useState(0)
  const [pageRows, setPageRows] = useState(10)

  const selectDepartmentAction = async (e) => {
    const selectedEmployeeListRes = await fetch(
      '/api/employee/?employee_department=' + e.value
    )
    const selectedEmployeeList = await selectedEmployeeListRes.json()
    setEmployeeListResult(selectedEmployeeList)
    setSelectDept(e.value)
  }

  const CheckEmployeeSchedule = async (empId) => {
    // Add schedule dataList [Done]
    // Add timeoff dateList
    const today = new Date()
    const priorDate = new Date(today.setDate(today.getDate() - 60))
    const formattedPriorDate = priorDate.toISOString().split('T')[0]
    const futureDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 120
    )
    const formattedFutureDate = futureDate.toISOString().split('T')[0]

    const scheduleListRes = await fetch(
      '/api/' +
        apiModule +
        '/?schedule_employee=' +
        empId +
        '&schedule_date__gte=' +
        formattedPriorDate +
        '&schedule_date__lte=' +
        formattedFutureDate +
        '&page_size=500'
    )
    const scheduleList = await scheduleListRes.json()
    if ('error' in scheduleList) {
      toast.current.show({
        severity: 'error',
        summary: 'Failed',
        detail: JSON.stringify(scheduleList),
        life: 30000,
      })
    } else {
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail: 'Pull data successfully!',
        life: 3000,
      })
      const res_data = scheduleList.results.map(function (element) {
        return {
          title: 'Normal Work',
          start: element.schedule_work_start_datetime_hm,
          end: element.schedule_work_end_datetime_hm,
        }
      })
      // Add the TimeOff list to the calendar
      setCalData(res_data)
    }
  }

  // Table Template
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-eye"
          className="mr-2"
          severity="info"
          label="Check"
          rounded
          raised
          onClick={() => CheckEmployeeSchedule(rowData.id)}
        />
        <Link href={'/schedule/employee/' + rowData.id}>
          <Button
            icon="pi pi-pencil"
            className="mr-2"
            severity="warning"
            label="Edit"
            rounded
            raised
          />
        </Link>
      </React.Fragment>
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
        </span>
      </div>
    )
  }

  // Main operation function
  const onPage = async (event) => {
    setPageRows(event.rows)
    setFirstPage(event.first)
    const newPage = event.page + 1
    const newPageRes = await pageControl('employee', newPage, event.rows)
    setEmployeeListResult(newPageRes)
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="col-12 md:col-4">
        <div className="card mb-3 pb-3">
          <h5>Select Department to Filter Employee</h5>
          <div className="flex flex-row gap-3 align-items-center">
            <label htmlFor="department" className="text-xl font-bold">
              Department
            </label>
            <Dropdown
              value={selectDept}
              onChange={(e) => selectDepartmentAction(e)}
              options={departmentList}
              placeholder="Select a Department"
              className="w-full"
            />
          </div>
        </div>

        {employeeListResult && (
          <div className="card mb-0 pb-3">
            <DataTable dataKey="id" value={employeeListResult.results}>
              <Column
                field="id"
                header="ID"
                sortable
                style={{ maxWidth: '4rem' }}></Column>
              <Column
                field="employee.username"
                header="Name"
                style={{ minWidth: '5rem' }}></Column>
              <Column
                header="Job Info"
                body={jobBodyTemplate}
                style={{ minWidth: '6rem' }}></Column>
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: '4rem' }}></Column>
            </DataTable>
            <Paginator
              first={firstPage}
              last={employeeListResult.count}
              totalRecords={employeeListResult.count}
              rows={pageRows}
              rowsPerPageOptions={[10, 20, 50]}
              onPageChange={onPage}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate={
                'Showing {first} to {last} of {totalRecords} employee'
              }></Paginator>
          </div>
        )}
      </div>

      <div className="col-12 md:col-8">
        <div className="card">
          <MyCalender calEvent={calData} />
        </div>
      </div>
    </>
  )
}
