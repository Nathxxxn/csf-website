import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logout } from '@/app/admin/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SESSION_COOKIE_NAME, verifyCookie } from '@/lib/session'

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const session = verifyCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  if (!session) {
    redirect('/admin')
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">Administration</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Console administrateur</h1>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10">
              Se déconnecter
            </Button>
          </form>
        </header>

        <Card className="border-white/10 bg-[#111111] text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <CardContent className="p-8">
            <p className="text-lg font-medium">Console en cours de développement</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
