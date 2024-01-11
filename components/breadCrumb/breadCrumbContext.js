'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BreadCrumb } from 'primereact/breadcrumb'

export default function BreakCrumbWithContext() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const crumbSlice = pathname.split('/').slice(1, 3)

  const items = []
  const home = {
    icon: 'pi pi-home',
    url: '/employee/profile/' + session?.user?.user.employee,
  }

  for (const [i, value] of crumbSlice.entries()) {
    if (i === crumbSlice.length - 1) {
      items.push({ label: value, url: '#' })
    } else {
      items.push({ label: value, url: '/' + value })
    }
  }

  return (
    <div className="col-12">
      <BreadCrumb model={items} home={home} />
    </div>
  )
}
