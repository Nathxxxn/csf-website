// lib/constants.ts

export const STATS = [
  { value: 6,    suffix: '',  label: 'Pôles' },
  { value: 200,  suffix: '+', label: 'Membres' },
  { value: 4000, suffix: '+', label: 'Étudiants' },
  { value: 20,   suffix: '+', label: 'Événements / an' },
] as const

export const CONTACT_SUBJECTS = [
  { value: 'partnership', label: 'Partenariat événementiel' },
  { value: 'sponsoring',  label: 'Sponsoring' },
  { value: 'conference',  label: 'Conférence / Workshop' },
  { value: 'recruiting',  label: 'Recrutement' },
  { value: 'other',       label: 'Autre' },
] as const

export type Stat = typeof STATS[number]
export type ContactSubject = typeof CONTACT_SUBJECTS[number]
