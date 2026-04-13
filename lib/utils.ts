import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatte une date ISO (YYYY-MM-DD) en mois + année en français.
 * Ex: "2025-04-10" → "avril 2025"
 */
export function formatEventDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Retourne le jour du mois formaté sur 2 chiffres.
 * Ex: "2025-04-10" → "10"
 */
export function formatEventDay(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit' })
}

/**
 * Retourne le mois abrégé en majuscules.
 * Ex: "2025-04-10" → "AVR."
 */
export function formatEventMonth(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00')
    .toLocaleDateString('fr-FR', { month: 'short' })
    .toUpperCase()
}
