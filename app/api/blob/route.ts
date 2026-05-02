import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const blob = await put(file.name, file, { access: 'public' })
  return NextResponse.json({ url: blob.url })
}
