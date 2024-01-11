import AuthProvider from '@/components/authProvider/page'
import React from "react"

export const metadata = {
  title: "WorkPortal",
  description:
    "The All-in-One HR manager system."
}

export default function SimpleLayout({ children }) {
  return (
    <React.Fragment>
      <AuthProvider>
        {children}
      </AuthProvider>
    </React.Fragment>
  )
}
