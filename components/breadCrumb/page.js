'use client'

import { SessionProvider } from "next-auth/react"
import BreakCrumbWithContext from './breadCrumbContext'


export default function NewBreadCrumb() {

  return (
    <SessionProvider >
        <BreakCrumbWithContext />
    </SessionProvider>
  )
}
