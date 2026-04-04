import Image from 'next/image'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { login } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SESSION_COOKIE_NAME, verifyCookie } from '@/lib/session'

type AdminLoginPageProps = {
  searchParams?: Promise<{ error?: string }>
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const cookieStore = await cookies()
  const session = verifyCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  if (session) {
    redirect('/admin/dashboard')
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const hasInvalidCredentials = resolvedSearchParams?.error === 'invalid'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-16">
      <Card className="w-full max-w-md border-white/10 bg-[#111111] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <CardHeader className="items-center space-y-5 pb-4 text-center">
          <Image src="/logo.svg" alt="CSF Logo" width={72} height={72} className="h-[72px] w-[72px]" priority />
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              Espace administrateur
            </CardTitle>
            <p className="text-sm text-white/60">Connectez-vous pour accéder à la console.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-white/80">
                Identifiant
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="border-white/10 bg-[#0a0a0a] text-white placeholder:text-white/35"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-white/80">
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="border-white/10 bg-[#0a0a0a] text-white placeholder:text-white/35"
              />
            </div>
            {hasInvalidCredentials ? (
              <p className="text-sm text-red-400">Identifiants incorrects.</p>
            ) : null}
            <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
