import { z, ZodError } from 'zod'

export const eventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  partner: z.string().min(1, 'Le partenaire est requis').max(200),
  partner_description: z.string().max(2000).optional().nullable(),
  pole: z.string().max(100).optional().nullable(),
  description: z.string().min(1, 'La description est requise').max(5000),
  status: z.enum(['upcoming', 'past']),
})

export const highlightSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().min(1, 'La description est requise').max(2000),
})

export const poleSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  badge: z.string().min(1, 'Le badge est requis').max(50),
  description: z.string().min(1, 'La description est requise').max(1000),
})

export const memberSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  role: z.string().min(1, 'Le rôle est requis').max(100),
  pole_id: z.string().min(1, 'Le pôle est requis'),
  linkedin: z.string().url('URL LinkedIn invalide').optional().or(z.literal('')).nullable(),
  tagline: z.string().max(180).optional().nullable(),
  bio: z.string().max(1200).optional().nullable(),
  promo: z.string().max(20).optional().nullable(),
  joined_year: z.string().regex(/^\d{4}$/, 'Année invalide').optional().or(z.literal('')).nullable(),
  contributions: z.preprocess(
    (value) => value === '' || value === null || value === undefined ? null : Number(value),
    z.number().int().min(0).max(9999).nullable(),
  ).optional(),
  skills: z.string().max(500).optional().nullable(),
  email: z.string().email('Email invalide').optional().or(z.literal('')).nullable(),
})

export const partnerSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  logo_url: z.string().url('URL du logo invalide'),
})

export const formationSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  category: z.string().min(1, 'La catégorie est requise').max(100),
  description: z.string().min(1, 'La description est requise').max(5000),
  speaker_name: z.string().min(1, "Le nom de l'intervenant est requis").max(150),
  speaker_role: z.string().min(1, "Le rôle de l'intervenant est requis").max(150),
})

/**
 * Parse un FormData avec un schéma Zod.
 * Retourne { data } en succès ou lance une Error en échec.
 */
export function parseFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData,
): T {
  const raw = Object.fromEntries(formData.entries())
  const result = schema.safeParse(raw)
  if (!result.success) {
    const messages = (result.error as ZodError).issues.map((e: { message: string }) => e.message).join(', ')
    throw new Error(`Validation échouée : ${messages}`)
  }
  return result.data
}
