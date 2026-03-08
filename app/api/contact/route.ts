import { NextRequest, NextResponse } from 'next/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: { name?: unknown; email?: unknown; projectType?: unknown; message?: unknown; printName?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, email, projectType, message, printName } = body

  if (!name || typeof name !== 'string' || name.length > 200) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  if (!message || typeof message !== 'string' || message.length > 5000) {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
  }

  // TODO: Integrate with email service (Resend, SendGrid, etc.)
  console.log('Contact form submission:', { name, email, projectType, message, printName })

  return NextResponse.json({ success: true })
}
