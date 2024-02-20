import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req) {
  const token = await getServerSession(authOptions)
  const searchKey = req.nextUrl.searchParams.get('search')
  const pageKey = req.nextUrl.searchParams.get('page')
  let url = process.env.WORKPORTAL_BACKEND_URL + '/ticket/'
  if (searchKey) {
    url = process.env.WORKPORTAL_BACKEND_URL + '/ticket/?search=' + searchKey
  }
  if (pageKey) {
    url = process.env.WORKPORTAL_BACKEND_URL + '/ticket/?page=' + pageKey
  }
  const res = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + token.user.access,
      'Content-Type': 'application/json',
    },
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
  const token = await getServerSession(authOptions)

  const post_data = await req.json()

  const res = await fetch(process.env.WORKPORTAL_BACKEND_URL + '/ticket/', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.user.access,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(post_data),
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
