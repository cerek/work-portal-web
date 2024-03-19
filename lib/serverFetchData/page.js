import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { headers } from 'next/headers';


export default async function serverSideFetch(url) {
    const headersList = headers()
    const userAgent = headersList.get('user-agent')
    const clientIp = headersList.get('x-forwarded-for')
    const session = await getServerSession(authOptions)
    if (!session) {
      redirect('/')
    }
    const res = await fetch(process.env.WORKPORTAL_BACKEND_URL + url, {
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + session.user.access,
        'User-Agent': userAgent,
        'User-Ip-Address': clientIp,
      },
    })
  
    if (!res.ok) {
      const res_data = await res.json()
      const res_status = res.status
      return {"error": res_data, "code":res_status}
    } else {
      const res_data = await res.json()
      return res_data
    }
  }