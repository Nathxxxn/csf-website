'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { RippleArrowButton } from '@/components/ui/ripple-arrow-button'
import { ShineBorder } from '@/components/ui/shine-border'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { sendContactEmail } from '@/app/contact/actions'
import { CONTACT_SUBJECTS } from '@/lib/constants'

export function ContactForm() {
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
        description: 'On vous répond rapidement.',
      })
      form.reset()
      setSubject('')
      return
    }

    toast.error('Erreur', { description: result.error })
  }

  return (
    <div className="relative rounded-xl border border-border bg-card p-8">
      <ShineBorder shineColor={['#333', '#555', '#222']} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-xs tracking-widest uppercase text-muted-foreground"
            >
              Nom *
            </label>
            <Input id="name" name="name" required placeholder="Jean Dupont" />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="company"
              className="text-xs tracking-widest uppercase text-muted-foreground"
            >
              Société *
            </label>
            <Input id="company" name="company" required placeholder="Goldman Sachs" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-xs tracking-widest uppercase text-muted-foreground"
          >
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
              {CONTACT_SUBJECTS.map(subjectOption => (
                <SelectItem key={subjectOption.value} value={subjectOption.value}>
                  {subjectOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="message"
            className="text-xs tracking-widest uppercase text-muted-foreground"
          >
            Message *
          </label>
          <Textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="Expliquez-nous votre idée ou votre demande..."
          />
        </div>

        <RippleArrowButton
          type="submit"
          disabled={loading || !subject}
          className="mt-1"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer'}
        </RippleArrowButton>
      </form>
    </div>
  )
}
