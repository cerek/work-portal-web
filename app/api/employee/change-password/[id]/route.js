import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'


export async function PUT(req, { params }) {
    const token = await getServerSession(authOptions)
    const post_data = await req.json()
    const id = params.id
  
    const res = await fetch(process.env.WORKPORTAL_BACKEND_URL + '/employee/change-password/' + id + '/', {
      method: "PUT",
      headers: {
        'Authorization': 'Bearer ' + token.user.access,
        'Content-Type': 'application/json',
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