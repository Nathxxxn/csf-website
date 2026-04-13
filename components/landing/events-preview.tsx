'use client'

import Link from 'next/link'
import { BlurFade } from '@/components/ui/blur-fade'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedList } from '@/components/ui/animated-list'
import { BorderBeam } from '@/components/ui/border-beam'
import { EventCard } from '@/components/shared/event-card'
import { EventRow } from '@/components/shared/event-row'
import type { Event } from '@/lib/types'

interface EventsPreviewProps {
  upcoming: Event[]
  past: Event[]
}

export function EventsPreview({ upcoming, past }: EventsPreviewProps) {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <BlurFade delay={0} inView>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
              Agenda & Rétrospective
            </p>
            <h2 className="text-4xl font-bold tracking-tight">Événements</h2>
          </div>
          <Link
            href="/evenements"
            className="text-sm text-muted-foreground border-b border-muted-foreground/30 pb-0.5 hover:text-foreground transition-colors hidden sm:block"
          >
            Voir tous →
          </Link>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} inView>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-8 bg-secondary border border-border">
            <TabsTrigger value="upcoming">À venir</TabsTrigger>
            <TabsTrigger value="past">Passés</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="relative rounded-xl border border-border bg-card overflow-hidden">
              {upcoming[0] && <BorderBeam size={250} duration={12} />}
              <AnimatedList delay={200}>
                {upcoming.map((event, i) => (
                  <EventRow key={event.id} event={event} featured={i === 0} />
                ))}
              </AnimatedList>
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
              {past.map((event, i) => (
                <BlurFade key={event.id} delay={i * 0.08} inView>
                  <EventCard event={event} />
                </BlurFade>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </BlurFade>
    </section>
  )
}
