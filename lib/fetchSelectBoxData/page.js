import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function fetchSelectBoxData(url) {
    const session = await getServerSession(authOptions)
    if (!session) {
      redirect('/')
    }
    const res = await fetch(process.env.WORKPORTAL_BACKEND_URL + url, {
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + session.user.access,
      },
    })
  
    if (!res.ok) {
      const res_data = await res.json()
      const res_status = res.status
      return {"error": res_data, "code":res_status}
    } else {
      const res_data_result = await res.json()
      const res_data = res_data_result.results.map(function (element) {
        return { value: element.id, label: element.value }
      })
      return res_data
    }
  }