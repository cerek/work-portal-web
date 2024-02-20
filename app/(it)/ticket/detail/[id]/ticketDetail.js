'use client'
import React from 'react'
import Link from 'next/link'
import { Editor } from 'primereact/editor'
import TicketSolutionForm from './ticketSolutionForm'

export default function TicketDetail({ ticketDetail }) {
  return (
    <>
      <div className="col-12 md:col-6">
        <div className="card">
          <h5>Ticket Detail</h5>
          {/* Ticket Title */}
          <div className="flex align-items-center surface-border surface-overlay w-full ">
            <span className="text-2xl md:text-5xl text-left font-bold text-blue-500 mb-2 mr-4">
              Ticket Title:
            </span>
            <span className="text-2xl md:text-5xl text-left font-bold mb-2">
              {ticketDetail.ticket_title}
            </span>
          </div>

          {/* Ticket Tag */}
          <div className="flex flex-wrap align-items-stretch justify-content-center">
            <div className="flex align-items-center justify-content-center flex-column col-12 md:col-3 text-center bg-blue-100 font-bold border-round m-2">
              <span className="text-2xl text-indigo-300 text-center">
                Ticket Creator
              </span>
              <span className="text-4xl font-bold capitalize text-center">
                {ticketDetail.ticket_creator_hm}
              </span>
            </div>

            <div className="flex align-items-center justify-content-center flex-column col-12 md:col-3 text-center bg-yellow-100 font-bold border-round m-2">
              <span className="text-2xl text-indigo-300 text-center">
                Ticket Assigner
              </span>
              <span className="text-4xl font-bold capitalize text-center">
                {ticketDetail.ticket_assigner_hm || '-'}
              </span>
            </div>

            <div className="flex align-items-center justify-content-center flex-column col-12 md:col-4 text-center bg-black-alpha-10 font-bold border-round m-2">
              <span className="text-2xl text-indigo-300 text-center">
                Ticket Type
              </span>
              <span className="text-4xl font-bold capitalize text-center">
                {ticketDetail.ticket_type_hm}
              </span>
            </div>

            <div className="flex align-items-center justify-content-center flex-column col-12 md:col-3 text-center bg-orange-100 font-bold border-round m-2">
              <span className="text-2xl text-indigo-300 text-center">
                Ticket Status
              </span>
              <span className="text-4xl font-bold capitalize text-center">
                {ticketDetail.ticket_status_hm}
              </span>
            </div>

            <div className="flex align-items-center justify-content-center flex-column col-12 md:col-4 text-center bg-primary-100 font-bold border-round m-2">
              <span className="text-2xl text-indigo-300 text-center">
                Ticket CreateTime
              </span>
              <span className="text-4xl font-bold capitalize text-center">
                {new Date(ticketDetail.created_time).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Ticket Description */}
          <div className="flex flex-wrap align-items-start justify-content-start">
            <div className="surface-overlay border-round min-h-full py-0 col-12">
              <p className="text-3xl md:text-5xl text-left font-bold text-blue-500 mb-2">
                Issue Description:
              </p>
              <Editor
                value={ticketDetail.ticket_description}
                showHeader={false}
                readOnly={true}
              />
            </div>
          </div>

          {/* Ticket Solution */}
          <TicketSolutionForm ticketIns={ticketDetail} />
        </div>
      </div>

      {/* Ticket Attachment */}
      <div className="col-12 md:col-6">
        <div className="card">
          <h5>Ticket Attachments</h5>
          <ul>
            {ticketDetail.ticket_attachment_hm.map((item) => 
              <li className='mt-3' key={item.attachment_name}>
                <Link href={item.attachment_url} target="_blank">{item.attachment_name}</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  )
}
