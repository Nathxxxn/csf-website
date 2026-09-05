import { STATS } from './constants'
import type { SiteContent } from './types'

const OVERRIDE_KEYS = ['stats_poles', 'stats_membres', 'stats_etudiants', 'stats_evenements'] as const

/**
 * Merges the STATS defaults with any admin-configured overrides from site_content,
 * keeping the default when a value is missing or not a positive number.
 *
 * Uses parseInt rather than Number so a value saved with its display suffix
 * still baked in (e.g. "20+", from before the suffix was split out of the
 * admin field) still parses instead of silently falling back to the default.
 */
export function getStatsWithOverrides(content?: SiteContent) {
  return STATS.map((stat, i) => {
    const raw = content?.[OVERRIDE_KEYS[i]]
    const n = raw ? parseInt(raw, 10) : NaN
    return Number.isFinite(n) && n > 0 ? { ...stat, value: n } : stat
  })
}
