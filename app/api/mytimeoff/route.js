import { NextResponse, userAgent } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'


export async function GET(req) {
  const { ua } = userAgent(req)
  const clientIp = req.headers.get('x-forwarded-for')
  const token = await getServerSession(authOptions)
  const searchKey = req.nextUrl.searchParams.get('search')
  const pageKey = req.nextUrl.searchParams.get('page')
  const pageSize = req.nextUrl.searchParams.get('page_size')

  let url = process.env.WORKPORTAL_BACKEND_URL + '/mytimeoff/'
  if (searchKey) {
    url = process.env.WORKPORTAL_BACKEND_URL + '/mytimeoff/?search=' + searchKey
  }
  if (pageKey && pageSize) {
    url = process.env.WORKPORTAL_BACKEND_URL + '/mytimeoff/?page=' + pageKey + '&page_size=' + pageSize
  } else if (pageKey) {
    url = process.env.WORKPORTAL_BACKEND_URL + '/mytimeoff/?page=' + pageKey
  } else if (pageSize) {
    url = process.env.WORKPORTAL_BACKEND_URL + '/mytimeoff/?page_size=' + pageSize
  }
  const res = await fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token.user.access,
      'Content-Type': 'application/json',
      'User-Agent': ua,
      'User-Ip-Address': clientIp,
    }
  })

  if (!res.ok) {
    const res_data = await res.json()
    const res_status = res.status
    return NextResponse.json(res_data, { status: res_status })
  } else {
    const res_data = await res.json()
    return NextResponse.json(res_data)
  }
}

export async function POST(req) {
  const { ua } = userAgent(req)
  const clientIp = req.headers.get('x-forwarded-for')
  const token = await getServerSession(authOptions)

  const post_data = await req.json()

  const res = await fetch(process.env.WORKPORTAL_BACKEND_URL + '/mytimeoff/', {
    method: "POST",
    headers: {
      'Authorization': 'Bearer ' + token.user.access,
      'Content-Type': 'application/json',
      'User-Agent': ua,
      'User-Ip-Address': clientIp,
    },
    body: JSON.stringify(post_data)
  })

  if (!res.ok) {
    const res_data = await res.json()
    const res_status = res.status
    return NextResponse.json(res_data, { status: res_status })
  } else {
    const res_data = await res.json()
    return NextResponse.json(res_data)
  }
}