'use client'
import { LayoutProvider } from '@/layout/context/layoutcontext'
import { PrimeReactProvider } from 'primereact/api'
import 'primereact/resources/primereact.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import '@/styles/layout/layout.scss'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          id="theme-css"
          href={`/themes/lara-light-indigo/theme.css`}
          rel="stylesheet"></link>
      </head>
      <body>
        <PrimeReactProvider>
          <LayoutProvider>{children}</LayoutProvider>
        </PrimeReactProvider>
      </body>
    </html>
  )
}
