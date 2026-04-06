import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { logout } from '@/app/admin/actions/auth'
import { AccueilTab } from '@/components/admin/tabs/accueil-tab'
import { EvenementsTab } from '@/components/admin/tabs/evenements-tab'
import { EquipeTab } from '@/components/admin/tabs/equipe-tab'
import { PartenairesTab } from '@/components/admin/tabs/partenaires-tab'
import { AProposTab } from '@/components/admin/tabs/apropos-tab'
import { getSiteContent, getAdminEvents, getAdminTeam, getAdminPartners } from '@/lib/data'
import Link from 'next/link'

const TABS = ['accueil', 'evenements', 'equipe', 'partenaires', 'apropos'] as const
type Tab = typeof TABS[number]

const TAB_LABELS: Record<Tab, string> = {
  accueil: 'Accueil',
  evenements: 'Événements',
  equipe: 'Équipe',
  partenaires: 'Partenaires',
  apropos: 'À propos',
}

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) redirect('/admin')

  const { tab: rawTab } = await searchParams
  const activeTab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : 'accueil'

  const [content, events, team, partners] = await Promise.all([
    getSiteContent(),
    getAdminEvents(),
    getAdminTeam(),
    getAdminPartners(),
  ])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-[#111] px-6 py-3">
        <span className="font-bold">Console Admin</span>
        <form action={logout}>
          <button type="submit" className="rounded border border-white/20 px-3 py-1 text-sm text-white/60 hover:border-white/40 hover:text-white">
            Déconnexion
          </button>
        </form>
      </header>

      {/* Tab navigation */}
      <nav className="flex border-b border-white/10 bg-[#111] px-6">
        {TABS.map(tab => (
          <Link
            key={tab}
            href={`/admin/dashboard?tab=${tab}`}
            className={`px-4 py-2.5 text-sm transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 font-semibold text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {TAB_LABELS[tab]}
          </Link>
        ))}
      </nav>

      {/* Tab content */}
      <main className="p-6">
        {activeTab === 'accueil' && <AccueilTab content={content} />}
        {activeTab === 'evenements' && <EvenementsTab events={events} />}
        {activeTab === 'equipe' && <EquipeTab team={team} />}
        {activeTab === 'partenaires' && <PartenairesTab partners={partners} />}
        {activeTab === 'apropos' && <AProposTab content={content} team={team} />}
      </main>
    </div>
  )
}
