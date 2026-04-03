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

// One entry per photo — multiple per event
interface GalleryItem {
  eventId: string
  title: string
  partner: string
  date: string
  image: string
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr))
}

// Progress threshold at which the gallery flips flat and navigation becomes active
const REVEAL_THRESHOLD = 0.25

/** Flatten each event's images[] into individual gallery items */
function toGalleryItems(events: Event[]): GalleryItem[] {
  return events.flatMap((event) => {
    const imgs = event.images.length > 0 ? event.images : event.image ? [event.image] : []
    return imgs.map((image) => ({
      eventId: event.id,
      title: event.title,
      partner: event.partner,
      date: event.date,
      image,
    }))
  })
}

interface GalleryItemCardProps {
  item: GalleryItem
  isRevealed: boolean
  priority?: boolean
}

function GalleryItemCard({ item, isRevealed, priority }: GalleryItemCardProps) {
  const card = (
    <div
      className={cn(
        "relative group aspect-video w-full overflow-hidden rounded-md shadow",
        isRevealed && "cursor-pointer"
      )}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
        priority={priority}
      />
      {/* Hover overlay: partner + date */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-white text-sm font-semibold leading-tight truncate">
          {item.partner}
        </p>
        <p className="text-white/60 text-xs mt-0.5">{formatDate(item.date)}</p>
      </div>
      {isRevealed && (
        <div className="absolute inset-0 ring-1 ring-white/10 rounded-md pointer-events-none" />
      )}
    </div>
  )

  if (isRevealed) {
    return (
      <Link href={`/evenements/${item.eventId}`} className="block">
        {card}
      </Link>
    )
  }

  return <>{card}</>
}

interface ScrollTrackerProps {
  events: Event[]
}

// Must be rendered inside ContainerScroll to access scroll context
function ScrollTracker({ events }: ScrollTrackerProps) {
  const { scrollYProgress } = useContainerScrollContext()
  const [isRevealed, setIsRevealed] = React.useState(false)

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setIsRevealed(value > REVEAL_THRESHOLD)
  })

  const items = React.useMemo(() => toGalleryItems(events), [events])
  const col1 = React.useMemo(() => items.filter((_, i) => i % 3 === 0), [items])
  const col2 = React.useMemo(() => items.filter((_, i) => i % 3 === 1), [items])
  const col3 = React.useMemo(() => items.filter((_, i) => i % 3 === 2), [items])

  // Scroll range: [0, REVEAL_THRESHOLD] = frozen during flip; [REVEAL_THRESHOLD, 1] = browse upward
  // Small positive initial y on col2/col3 creates stagger without CSS margin hacks
  return (
    <GalleryContainer>
      <GalleryCol
        scrollRange={[0, REVEAL_THRESHOLD, 1]}
        yRange={["0vh", "0vh", "-150vh"]}
      >
        {col1.map((item, i) => (
          <GalleryItemCard
            key={`${item.eventId}-${item.image}`}
            item={item}
            isRevealed={isRevealed}
            priority={i === 0}
          />
        ))}
      </GalleryCol>
      <GalleryCol
        scrollRange={[0, REVEAL_THRESHOLD, 1]}
        yRange={["12vh", "12vh", "-138vh"]}
      >
        {col2.map((item, i) => (
          <GalleryItemCard
            key={`${item.eventId}-${item.image}`}
            item={item}
            isRevealed={isRevealed}
            priority={i === 0}
          />
        ))}
      </GalleryCol>
      <GalleryCol
        scrollRange={[0, REVEAL_THRESHOLD, 1]}
        yRange={["4vh", "4vh", "-146vh"]}
      >
        {col3.map((item, i) => (
          <GalleryItemCard
            key={`${item.eventId}-${item.image}`}
            item={item}
            isRevealed={isRevealed}
            priority={i === 0}
          />
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
        <div
          className="pointer-events-none absolute z-10 h-[60vh] w-full top-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
            filter: "blur(40px)",
            mixBlendMode: "screen",
          }}
        />
        <ContainerScroll className="relative h-[700vh]">
          <ContainerSticky className="h-svh">
            <ScrollTracker events={events} />
          </ContainerSticky>
        </ContainerScroll>
      </div>
    </MotionConfig>
  )
}
