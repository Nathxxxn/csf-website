import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as HandleUploadBody
  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => ({ allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] }),
    onUploadCompleted: async () => {},
  })
  return NextResponse.json(jsonResponse)
}
