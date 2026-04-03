"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useMotionValueEvent, MotionConfig } from "motion/react"
import { cn } from "@/lib/utils"
import {
  ContainerScroll,
  ContainerSticky,
  GalleryContainer,
  GalleryCol,
  useContainerScrollContext,
} from "@/components/ui/animated-gallery"
import type { Event } from "@/lib/types"

interface EventItemProps {
  event: Event
  isRevealed: boolean
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr))
}

function EventItem({ event, isRevealed }: EventItemProps) {
  const card = (
    <div className={cn("relative group aspect-video w-full overflow-hidden rounded-md shadow", isRevealed && "cursor-pointer")}>
      {event.image ? (
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className="w-full h-full bg-secondary" />
      )}
      {/* Hover overlay: partner + date */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-white text-sm font-semibold leading-tight truncate">
          {event.partner}
        </p>
        <p className="text-white/60 text-xs mt-0.5">{formatDate(event.date)}</p>
      </div>
      {/* Ring indicator when gallery is fully revealed */}
      {isRevealed && (
        <div className="absolute inset-0 ring-1 ring-white/10 rounded-md pointer-events-none" />
      )}
    </div>
  )

  if (isRevealed) {
    return (
      <Link href={`/evenements/${event.id}`} className="block">
        {card}
      </Link>
    )
  }

  return <div>{card}</div>
}

interface ScrollTrackerProps {
  events: Event[]
}

// Must be rendered inside ContainerScroll to access scroll context
function ScrollTracker({ events }: ScrollTrackerProps) {
  const { scrollYProgress } = useContainerScrollContext()
  const [isRevealed, setIsRevealed] = React.useState(false)

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setIsRevealed(value > 0.75)
  })

  // Distribute 6 events across 3 columns: [0,3], [1,4], [2,5]
  const col1 = [events[0], events[3]].filter(Boolean)
  const col2 = [events[1], events[4]].filter(Boolean)
  const col3 = [events[2], events[5]].filter(Boolean)

  return (
    <GalleryContainer>
      <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
        {col1.map((event) => (
          <EventItem key={event.id} event={event} isRevealed={isRevealed} />
        ))}
      </GalleryCol>
      <GalleryCol className="mt-[-40%]" yRange={["15%", "5%"]}>
        {col2.map((event) => (
          <EventItem key={event.id} event={event} isRevealed={isRevealed} />
        ))}
      </GalleryCol>
      <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
        {col3.map((event) => (
          <EventItem key={event.id} event={event} isRevealed={isRevealed} />
        ))}
      </GalleryCol>
    </GalleryContainer>
  )
}

interface EventsGalleryProps {
  events: Event[]
}

export function EventsGallery({ events }: EventsGalleryProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        {/* Subtle ambient glow matching dark theme */}
        <div
          className="pointer-events-none absolute z-10 h-[60vh] w-full top-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
            filter: "blur(40px)",
            mixBlendMode: "screen",
          }}
        />
        <ContainerScroll className="relative h-[300vh]">
          <ContainerSticky className="h-svh">
            <ScrollTracker events={events} />
          </ContainerSticky>
        </ContainerScroll>
      </div>
    </MotionConfig>
  )
}
