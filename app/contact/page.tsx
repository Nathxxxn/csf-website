'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ShineBorder } from '@/components/ui/shine-border'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { BlurFade } from '@/components/ui/blur-fade'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { sendContactEmail } from './actions'

const SUBJECTS = [
  { value: 'partnership', label: 'Partenariat événementiel' },
  { value: 'sponsoring', label: 'Sponsoring' },
  { value: 'conference', label: 'Conférence / Workshop' },
  { value: 'recruiting', label: 'Recrutement' },
  { value: 'other', label: 'Autre' },
]

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      company: (form.elements.namedItem('company') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      subject,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    const result = await sendContactEmail(data)
    setLoading(false)

    if (result.success) {
      toast.success('Message envoyé !', {
        description: 'Nous vous répondrons dans les meilleurs délais.',
      })
      form.reset()
      setSubject('')
    } else {
      toast.error('Erreur', { description: result.error })
    }
  }

  return (
    <div className="pt-24 pb-24 px-6 max-w-2xl mx-auto">
      <BlurFade delay={0.1} inView>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
          Partenariat
        </p>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-4">
          Collaborons ensemble.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-12">
          Vous souhaitez organiser un événement, sponsoriser une activité ou rencontrer nos membres ? Écrivez-nous.
        </p>
      </BlurFade>

      <BlurFade delay={0.2} inView>
        <div className="relative rounded-xl border border-border bg-card p-8">
          <ShineBorder shineColor={['#333', '#555', '#222']} />
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs tracking-widest uppercase text-muted-foreground">
                  Nom *
                </label>
                <Input id="name" name="name" required placeholder="Jean Dupont" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="company" className="text-xs tracking-widest uppercase text-muted-foreground">
                  Société *
                </label>
                <Input id="company" name="company" required placeholder="Goldman Sachs" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs tracking-widest uppercase text-muted-foreground">
                Email *
              </label>
              <Input id="email" name="email" type="email" required placeholder="jean@goldman.com" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">
                Sujet *
              </label>
              <Select onValueChange={setSubject} value={subject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un sujet" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-xs tracking-widest uppercase text-muted-foreground">
                Message *
              </label>
              <Textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="Décrivez votre projet ou demande..."
              />
            </div>

            <ShimmerButton
              type="submit"
              disabled={loading || !subject}
              className="w-full py-3 text-sm font-semibold"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le message →'}
            </ShimmerButton>
          </form>
        </div>
      </BlurFade>
    </div>
  )
}
