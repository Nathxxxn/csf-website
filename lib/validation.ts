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
})

export const partnerSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  logo_url: z.string().url('URL du logo invalide'),
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
