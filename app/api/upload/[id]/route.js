import { NextResponse, userAgent } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req, { params }) {
  const { ua } = userAgent(req)
  const clientIp = req.headers.get('x-forwarded-for')
  const token = await getServerSession(authOptions)
  const id = params.id
  const res = await fetch(
    process.env.WORKPORTAL_BACKEND_URL + '/upload/' + id + '/',
    {
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + token.user.access,
        'Content-Type': 'application/json',
        'User-Agent': ua,
        'User-Ip-Address': clientIp,
      },
    }
  )

  if (res.status !== 201) {
    const res_data = await res.data
    const res_status = res.status
    return NextResponse.json(res_data, { status: res_status })
  } else {
    const res_data = await res.data
    return NextResponse.json(res_data)
  }
}


export async function PATCH(req, { params }) {
  const { ua } = userAgent(req)
  const clientIp = req.headers.get('x-forwarded-for')
  const token = await getServerSession(authOptions)
  const post_data = await req.json()
  const id = params.id

  const res = await fetch(process.env.WORKPORTAL_BACKEND_URL + '/timeoff/' + id + '/', {
    method: "PATCH",
    headers: {
      'Authorization': 'Bearer ' + token.user.access,
      'Content-Type': 'application/json',
      'User-Agent': ua,
      'User-Ip-Address': clientIp,
    },
    body: JSON.stringify(post_data)
  })

  if (res.status !== 201) {
    const res_data = await res.data
    const res_status = res.status
    return NextResponse.json(res_data, { status: res_status })
  } else {
    const res_data = await res.data
    return NextResponse.json(res_data)
  }
}


export async function PUT(req, { params }) {
  const { ua } = userAgent(req)
  const clientIp = req.headers.get('x-forwarded-for')
  const token = await getServerSession(authOptions)
  const post_data = await req.json()
  const id = params.id

  const res = await fetch(process.env.WORKPORTAL_BACKEND_URL + '/upload/' + id + '/', {
    method: "PUT",
    headers: {
      'Authorization': 'Bearer ' + token.user.access,
      'Content-Type': 'application/json',
      'User-Agent': ua,
      'User-Ip-Address': clientIp,
    },
    body: JSON.stringify(post_data)
  })

  if (res.status !== 201) {
    const res_data = await res.data
    const res_status = res.status
    return NextResponse.json(res_data, { status: res_status })
  } else {
    const res_data = await res.data
    return NextResponse.json(res_data)
  }
}


export async function DELETE(req, { params }) {
  const { ua } = userAgent(req)
  const clientIp = req.headers.get('x-forwarded-for')
  const token = await getServerSession(authOptions)
  const id = params.id
  const res = await fetch(
    process.env.WORKPORTAL_BACKEND_URL + '/upload/' + id + '/',
    {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + token.user.access,
        'Content-Type': 'application/json',
        'User-Agent': ua,
        'User-Ip-Address': clientIp,
      },
    }
  )

  if (res.status !== 201) {
    const res_data = await res.data
    const res_status = res.status
    return NextResponse.json(res_data, { status: res_status })
  } else {
    const res_data = await res.data
    return NextResponse.json(res_data)
  }
}
