'use client'
import React, { useState } from 'react'
import { TabView, TabPanel } from 'primereact/tabview'
import { Image } from 'primereact/image'
import MyCalender from '@/components/calender/page'
import { Chart } from 'primereact/chart'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import EmployeeChangePasswordForm from '../../changePasswordForm'


export default function EmployeeProfile({ employeeDetail }) {
  const chartData = {
    labels: [
      'Productivity',
      'Customer Satisfaction',
      'Quality',
      'Process and Compliance',
      'Process and Compliance',
      'Training and Certification',
    ],
    datasets: [
      {
        label: 'Jan.',
        data: [9, 9, 3, 5, 2, 3],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Feb.',
        data: [4, 5, 8, 1, 10, 5],
        backgroundColor: 'rgba(255, 98, 152, 0.8)',
        borderColor: 'rgba(210, 59, 132, 1)',
        borderWidth: 1,
      },
    ],
  }

  const assetList = [{
    id: '1000',
    name: 'Macbook pro 14\'',
    quantity: 1,
    status: 'Approved',
    details: 'xxxxxxxxxxxxxxxxxxxxxx'
  }]

  return (
    <>
      <div className="col-12 md:col-4">
        <div className="card mb-0 pb-3">
          <h5>Employee Profile</h5>
          <div className="flex flex-wrap align-items-center justify-content-center flex-wrap">
            <Image
              src={employeeDetail.employee_avatar.file_url}
              alt="Image"
              width="150"
              preview
            />
            <p className="text-4xl w-12 text-center capitalize text-yellow-600">
              {employeeDetail.employee.username}
            </p>
            <p className="text-4xl w-12 text-center capitalize text-yellow-600">
              {employeeDetail.employee_job_title}
            </p>
          </div>
        </div>
      </div>

      <div className="col-12 md:col-8">
        <div className="card">
          <TabView>
            <TabPanel header="Schedule">
              <MyCalender />
            </TabPanel>
            <TabPanel header="Performance Review">
              <Chart
                type="radar"
                data={chartData}
                className="w-full md:w-30rem"
              />
            </TabPanel>
            <TabPanel header="IT Asset">
              <DataTable value={assetList} tableStyle={{ minWidth: '50rem' }}>
                <Column field="id" header="Asset ID"></Column>
                <Column field="name" header="Asset Name"></Column>
                <Column field="quantity" header="Quantity"></Column>
                <Column field="status" header="Status"></Column>
                <Column field="details" header="Event Details"></Column>
              </DataTable>
            </TabPanel>
            <TabPanel header="Settings">
              <EmployeeChangePasswordForm employeeId={employeeDetail.id} personal={true} />
            </TabPanel>
            <TabPanel header="System Notes">
              <p>This is System Notes Tab...</p>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </>
  )
}
