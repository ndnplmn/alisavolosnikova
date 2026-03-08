// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, email, projectType, message, printName } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // TODO: Integrate with email service (Resend, SendGrid, etc.)
  console.log('Contact form submission:', { name, email, projectType, message, printName })

  return NextResponse.json({ success: true })
}
