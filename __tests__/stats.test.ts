import { describe, expect, it } from 'vitest'
import { getStatsWithOverrides } from '@/lib/stats'
import { STATS } from '@/lib/constants'
import type { SiteContent } from '@/lib/types'

const baseContent: SiteContent = {
  hero_title: '',
  hero_subtitle: '',
  stats_poles: '',
  stats_membres: '',
  stats_etudiants: '',
  stats_evenements: '',
  partners_marquee_label: '',
  partners_cta_eyebrow: '',
  partners_cta_title: '',
  partners_cta_body: '',
  partners_cta_primary_label: '',
  partners_cta_secondary_label: '',
  events_eyebrow: '',
  events_intro: '',
  about_heading: '',
  about_intro: '',
  about_legal_address: '',
  about_legal_rna: '',
}

describe('getStatsWithOverrides', () => {
  it('falls back to the STATS defaults when no content is provided', () => {
    expect(getStatsWithOverrides(undefined)).toEqual(STATS)
  })

  it('overrides all four stats, including "Étudiants", from site content', () => {
    const stats = getStatsWithOverrides({
      ...baseContent,
      stats_poles: '7',
      stats_membres: '25',
      stats_etudiants: '5000',
      stats_evenements: '30',
    })

    expect(stats.map((s) => s.value)).toEqual([7, 25, 5000, 30])
    expect(stats.map((s) => s.label)).toEqual(['Pôles', 'Membres', 'Étudiants', 'Événements / an'])
  })

  it('keeps the default for a stat left blank or non-numeric', () => {
    const stats = getStatsWithOverrides({ ...baseContent, stats_etudiants: '', stats_poles: 'abc' })
    expect(stats[0].value).toBe(STATS[0].value)
    expect(stats[2].value).toBe(STATS[2].value)
  })

  it('parses a value saved with its display suffix still attached (e.g. "10+")', () => {
    const stats = getStatsWithOverrides({ ...baseContent, stats_evenements: '10+' })
    expect(stats[3].value).toBe(10)
  })
})
