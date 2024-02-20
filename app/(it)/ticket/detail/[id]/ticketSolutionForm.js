'use client'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { Inplace, InplaceDisplay, InplaceContent } from 'primereact/inplace'
import { Editor } from 'primereact/editor'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { dirtyValues, getFormErrorMessage } from '@/lib/utils/page'

export default function TicketSolutionForm({ ticketIns }) {
  const { id, ticket_solution } = ticketIns
  const [ticketSolution, setTicketSolution] = useState(ticket_solution)
  const [editSwitch, setEditSwitch] = useState(false)
  const router = useRouter()
  const toast = useRef(null)
  const {
    handleSubmit,
    formState: { dirtyFields, errors },
    control,
  } = useForm()

  const handleEdiorActive = () => {
    setEditSwitch(!editSwitch)
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
    const res = await fetch('/api/ticket/' + id, {
      method: 'PATCH',
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
      setTicketSolution(resData.ticket_solution)
      setEditSwitch(false)
      router.push('/ticket/detail/' + id)
      router.refresh()
      toast.current.show({
        severity: 'success',
        summary: 'Successful',
        detail:
          JSON.stringify(resData.ticket_title) +
          'solution update Successfully!!',
        life: 3000,
      })
    }
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="flex flex-wrap align-items-start justify-content-start">
        <div className="surface-overlay border-round min-h-full py-0 col-12">
          <p className="text-3xl md:text-5xl text-left font-bold text-blue-500 mt-3 mb-2 ">
            Issue Solution:
          </p>
          <Inplace active={editSwitch} onOpen={() => setEditSwitch(true)}>
            <InplaceDisplay>
              <Editor
                value={ticketSolution || 'Click to Edit'}
                showHeader={false}
              />
            </InplaceDisplay>
            <InplaceContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="ticket_solution"
                  control={control}
                  rules={{ required: 'Solution is required.' }}
                  render={({ field }) => (
                    <>
                      <Editor
                        id={field.name}
                        name="ticket_solution"
                        value={ticketSolution}
                        onTextChange={(e) => field.onChange(e.htmlValue)}
                        style={{ height: '320px' }}
                      />
                      {getFormErrorMessage(field.name, errors)}
                    </>
                  )}
                />
                <div className="flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
                  <Button type="submit" label="Save" />
                  <Button
                    type="button"
                    severity="danger"
                    label="Cancel"
                    onClick={handleEdiorActive}
                  />
                </div>
              </form>
            </InplaceContent>
          </Inplace>
        </div>
      </div>
    </>
  )
}
