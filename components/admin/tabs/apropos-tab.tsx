'use client'

import Link from 'next/link'
import { upsertContent } from '@/app/admin/actions/content'
import type { SiteContent, AdminPole } from '@/lib/types'

export function AProposTab({ content, team }: { content: SiteContent; team: AdminPole[] }) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Mission */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
        <h2 className="text-xs uppercase tracking-widest text-white/40">Mission</h2>
        <form action={upsertContent} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="apropos_mission_title" className="text-xs text-white/50">Titre de section</label>
            <input
              id="apropos_mission_title"
              name="apropos_mission_title"
              defaultValue={content.apropos_mission_title}
              className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="apropos_mission_text" className="text-xs text-white/50">Texte</label>
            <textarea
              id="apropos_mission_text"
              name="apropos_mission_text"
              defaultValue={content.apropos_mission_text}
              rows={5}
              className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white resize-none focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button type="submit" className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
            Enregistrer
          </button>
        </form>
      </section>

      {/* Descriptions des pôles */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
        <h2 className="text-xs uppercase tracking-widest text-white/40">Descriptions des pôles</h2>
        <p className="text-xs text-white/40">{"Se modifient depuis l'onglet Équipe → Éditer pôle"}</p>
        <div className="flex flex-col gap-2">
          {team.map(pole => (
            <div key={pole.id} className="flex items-center justify-between rounded border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm">{pole.name}</span>
              <Link href="/admin/dashboard?tab=equipe" className="text-xs text-blue-400 hover:text-blue-300">→ Équipe</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
