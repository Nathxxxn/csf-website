'use server'

import { Resend } from 'resend'

interface ContactFormData {
  name: string
  company: string
  email: string
  subject: string
  message: string
}

interface ActionResult {
  success: boolean
  error?: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function sendContactEmail(data: ContactFormData): Promise<ActionResult> {
  if (!data.name.trim()) {
    return { success: false, error: 'Le nom est requis.' }
  }
  if (!validateEmail(data.email)) {
    return { success: false, error: "L'adresse email n'est pas valide." }
  }
  if (!data.subject.trim()) {
    return { success: false, error: 'Le sujet est requis.' }
  }
  if (data.message.trim().length < 10) {
    return { success: false, error: 'Le message est trop court (10 caractères minimum).' }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { success: false, error: "Configuration email manquante." }
  }

  const resend = new Resend(apiKey)
  const to = process.env.CONTACT_EMAIL ?? 'prez@csfinance.fr'
  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? 'noreply@csfinance.fr'

  try {
    const { error } = await resend.emails.send({
      from: `CS Finance <${fromEmail}>`,
      to,
      replyTo: data.email,
      subject: `[CS Finance] Nouveau message — ${data.subject} (${data.company})`,
      html: `
        <h2>Nouveau message via le site CS Finance</h2>
        <p><strong>Nom :</strong> ${data.name}</p>
        <p><strong>Société :</strong> ${data.company}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Sujet :</strong> ${data.subject}</p>
        <hr />
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    })

    if (error) {
      console.error('[Contact] Resend error:', error)
      return { success: false, error: "Une erreur est survenue lors de l'envoi." }
    }

    return { success: true }
  } catch (err) {
    console.error('[Contact] Unexpected error:', err)
    return { success: false, error: "Une erreur est survenue lors de l'envoi." }
  }
}
