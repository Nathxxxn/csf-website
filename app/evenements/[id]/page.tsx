import { getEvents } from "@/lib/data"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { BlurFade } from "@/components/ui/blur-fade"
import { Badge } from "@/components/ui/badge"

export async function generateStaticParams() {
  return getEvents().map((e) => ({ id: e.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = getEvents().find((e) => e.id === id)
  if (!event) return {}
  return {
    title: `${event.title} — CentraleSupélec Finance`,
    description: event.description,
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = getEvents().find((e) => e.id === id)
  if (!event) notFound()

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(event.date))

  return (
    <div className="pt-24 pb-24 px-6 max-w-4xl mx-auto">
      <BlurFade delay={0.05} inView>
        <Link
          href="/evenements"
          className="text-xs text-muted-foreground hover:text-white transition-colors mb-8 inline-block"
        >
          ← Tous les événements
        </Link>
      </BlurFade>

      <BlurFade delay={0.1} inView>
        <Badge variant="secondary" className="mb-4">
          {event.pole}
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tighter mb-2">
          {event.title}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          {event.partner} · {formattedDate}
        </p>
      </BlurFade>

      {event.image && (
        <BlurFade delay={0.15} inView>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 border border-border">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        </BlurFade>
      )}

      <BlurFade delay={0.2} inView>
        <p className="text-muted-foreground leading-relaxed">
          {event.description}
        </p>
      </BlurFade>
    </div>
  )
}
