import { BlurFade } from '@/components/ui/blur-fade'
import { ContactForm } from '@/components/contact/contact-form'
import { getPartners } from '@/lib/data'

export default async function ContactPage() {
  const partners = await getPartners()

  return (
    <>
      <div className="hidden">{partners.length}</div>

      <div className="pt-24 pb-24 px-6 max-w-2xl mx-auto">
        <BlurFade delay={0.1} inView>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
            Partenariat
          </p>
          <h1 className="text-5xl font-extrabold tracking-tighter mb-4">
            Parlons-en.
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-12">
            Vous voulez organiser un événement, proposer un partenariat ou simplement prendre contact ? Écrivez-nous. On lit tout.
          </p>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <ContactForm />
        </BlurFade>
      </div>
    </>
  )
}
