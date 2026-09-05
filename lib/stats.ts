import { STATS } from './constants'
import type { SiteContent } from './types'

const OVERRIDE_KEYS = ['stats_poles', 'stats_membres', 'stats_etudiants', 'stats_evenements'] as const

/**
 * Merges the STATS defaults with any admin-configured overrides from site_content,
 * keeping the default when a value is missing or not a positive number.
 */
export function getStatsWithOverrides(content?: SiteContent) {
  return STATS.map((stat, i) => {
    const raw = content?.[OVERRIDE_KEYS[i]]
    const n = raw ? Number(raw) : NaN
    return Number.isFinite(n) && n > 0 ? { ...stat, value: n } : stat
  })
}
