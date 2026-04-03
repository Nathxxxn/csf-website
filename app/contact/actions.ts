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
  if (data.message.trim().length < 10) {
    return { success: false, error: 'Le message est trop court (10 caractères minimum).' }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const to = process.env.CONTACT_EMAIL ?? 'contact@csf.fr'

  const { error } = await resend.emails.send({
    from: 'CS Finance Contact <onboarding@resend.dev>',
    to,
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
    return { success: false, error: "Une erreur est survenue lors de l'envoi." }
  }

  return { success: true }
}
