import { BlurFade } from '@/components/ui/blur-fade'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedList } from '@/components/ui/animated-list'
import { BorderBeam } from '@/components/ui/border-beam'
import { EventCard } from '@/components/shared/event-card'
import { EventRow } from '@/components/shared/event-row'
import { getUpcomingEvents, getPastEvents } from '@/lib/data'

export const metadata = {
  title: 'Événements — CentraleSupélec Finance',
  description: 'Tous les événements organisés par CentraleSupélec Finance.',
}

export default function EventsPage() {
  const upcoming = getUpcomingEvents()
  const past = getPastEvents()

  return (
    <div className="pt-24 pb-24 px-6 max-w-6xl mx-auto">
      <BlurFade delay={0.1} inView>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
          Agenda & Rétrospective
        </p>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-4">Événements</h1>
        <p className="text-muted-foreground max-w-xl mb-12">
          Conférences avec des institutions de premier rang, workshops, networking, crack the case — une année riche en rencontres professionnelles.
        </p>
      </BlurFade>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-10 bg-secondary border border-border">
          <TabsTrigger value="upcoming">À venir ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Passés ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="relative rounded-xl border border-border bg-card overflow-hidden">
            {upcoming[0] && <BorderBeam size={300} duration={12} />}
            <AnimatedList delay={150}>
              {upcoming.map((event, i) => (
                <EventRow key={event.id} event={event} featured={i === 0} />
              ))}
            </AnimatedList>
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {past.map((event, i) => (
              <BlurFade key={event.id} delay={i * 0.07} inView>
                <EventCard event={event} />
              </BlurFade>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
