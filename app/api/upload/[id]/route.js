import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req, { params }) {
  const token = await getServerSession(authOptions)
  const id = params.id
  const res = await fetch(
    process.env.WORKPORTAL_BACKEND_URL + '/upload/' + id + '/',
    {
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + token.user.access,
        'Content-Type': 'application/json',
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
  const token = await getServerSession(authOptions)
  const post_data = await req.json()
  const id = params.id

  const res = await fetch(process.env.WORKPORTAL_BACKEND_URL + '/timeoff/' + id + '/', {
    method: "PATCH",
    headers: {
      'Authorization': 'Bearer ' + token.user.access,
      'Content-Type': 'application/json',
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
  const token = await getServerSession(authOptions)
  const post_data = await req.json()
  const id = params.id

  const res = await fetch(process.env.WORKPORTAL_BACKEND_URL + '/upload/' + id + '/', {
    method: "PUT",
    headers: {
      'Authorization': 'Bearer ' + token.user.access,
      'Content-Type': 'application/json',
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
  const token = await getServerSession(authOptions)
  const id = params.id
  const res = await fetch(
    process.env.WORKPORTAL_BACKEND_URL + '/upload/' + id + '/',
    {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + token.user.access,
        'Content-Type': 'application/json',
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
