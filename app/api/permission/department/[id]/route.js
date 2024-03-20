import { NextResponse, userAgent } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req, { params }) {
  const { ua } = userAgent(req)
  const clientIp = req.headers.get('x-forwarded-for')
  const token = await getServerSession(authOptions)
  const id = params.id
  const res = await fetch(
    process.env.WORKPORTAL_BACKEND_URL + '/permission/department/' + id + '/',
    {
      headers: {
        Authorization: 'Bearer ' + token.user.access,
        'Content-Type': 'application/json',
        'User-Agent': ua,
        'User-Ip-Address': clientIp,
      },
    }
  )

  if (!res.ok) {
    const res_data = await res.json()
    const res_status = res.status
    return NextResponse.json(res_data, { status: res_status })
  } else {
    const res_data = await res.json()
    return NextResponse.json(res_data)
  }
}
