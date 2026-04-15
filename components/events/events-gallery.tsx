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

// One entry per event
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

/** One gallery item per event, using the event's main image */
function toGalleryItems(events: Event[]): GalleryItem[] {
  return events
    .filter((event) => !!event.image)
    .map((event) => ({
      eventId: event.id,
      title: event.title,
      partner: event.partner,
      date: event.date,
      image: event.image as string,
    }))
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
  // Small positive initial y on col2/col3 creates stagger without CSS margin hacks.
  // yEnd matches the containerVh formula so columns finish exiting right as scroll ends.
  const maxPerCol = Math.ceil(items.length / 3)
  const yEnd = -(maxPerCol * 20 + 10)

  return (
    <GalleryContainer>
      <GalleryCol
        scrollRange={[0, REVEAL_THRESHOLD, 1]}
        yRange={["0vh", "0vh", `${yEnd}vh`]}
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
        yRange={["12vh", "12vh", `${yEnd + 12}vh`]}
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
        yRange={["4vh", "4vh", `${yEnd + 4}vh`]}
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
  const items = toGalleryItems(events)

  if (items.length === 0) {
    return (
      <div className="py-24 text-center text-sm text-muted-foreground">
        Aucune photo disponible pour l&apos;instant.
      </div>
    )
  }

  // Each column item is ~20vh tall (aspect-video at 33vw ≈ 18.5vh + gap).
  // yEnd: how far columns scroll up — just past the full column height.
  // containerVh: sized so columns finish exiting right as scroll ends,
  //   using the formula 4/3 * (flip_base + column_height) to leave ~25% for the
  //   flip animation and ~75% for browsing with minimal void at the end.
  const maxPerCol = Math.ceil(items.length / 3)
  const yEndVh = -(maxPerCol * 20 + 10)
  const containerVh = Math.min(500, Math.max(200, Math.round((4 / 3) * (110 + maxPerCol * 20))))

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
        <ContainerScroll className="relative" style={{ height: `${containerVh}vh` }}>
          <ContainerSticky className="h-svh">
            <ScrollTracker events={events} />
          </ContainerSticky>
        </ContainerScroll>
      </div>
    </MotionConfig>
  )
}
