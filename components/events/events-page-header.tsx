"use client"

import {
  ContainerStagger,
  ContainerAnimated,
} from "@/components/ui/animated-gallery"

export function EventsPageHeader() {
  return (
    <ContainerStagger className="pt-24 px-6 max-w-6xl mx-auto text-center pb-0">
      <ContainerAnimated>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
          Agenda & Rétrospective
        </p>
      </ContainerAnimated>
      <ContainerAnimated>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4">
          Nos Événements
        </h1>
      </ContainerAnimated>
      <ContainerAnimated>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Conférences avec des institutions de premier rang, workshops, networking, CS Finance possède une grande expérience en rencontres professionnelles.
        </p>
      </ContainerAnimated>
    </ContainerStagger>
  )
}
