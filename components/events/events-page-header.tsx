"use client"

import {
  ContainerStagger,
  ContainerAnimated,
} from "@/components/ui/animated-gallery"
import type { SiteContent } from "@/lib/types"

const DEFAULT_EYEBROW = "Agenda & Rétrospective"
const DEFAULT_INTRO = "Conférences, ateliers, visites, rencontres alumni. On essaie surtout de faire des formats utiles, avec des intervenants qui connaissent vraiment le terrain."

export function EventsPageHeader({ content }: { content?: SiteContent }) {
  return (
    <ContainerStagger className="pt-24 px-6 max-w-6xl mx-auto text-center pb-0">
      <ContainerAnimated>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
          {content?.events_eyebrow || DEFAULT_EYEBROW}
        </p>
      </ContainerAnimated>
      <ContainerAnimated>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4">
          Événements
        </h1>
      </ContainerAnimated>
      <ContainerAnimated>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {content?.events_intro || DEFAULT_INTRO}
        </p>
      </ContainerAnimated>
    </ContainerStagger>
  )
}
