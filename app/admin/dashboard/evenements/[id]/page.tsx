import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { getAdminEventById } from '@/lib/data'
import { EventEditClient } from '@/components/admin/event-edit-client'

interface Props { params: Promise<{ id: string }> }

export default async function EventEditPage({ params }: Props) {
  const cookieStore = await cookies()
  const session = verifyCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value)
  if (!session) redirect('/admin')

  const { id } = await params
  const event = await getAdminEventById(id)
  if (!event) notFound()

  return <EventEditClient event={event} />
}
