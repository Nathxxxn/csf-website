import Image from "next/image"
import type { Event } from "@/lib/types"

interface EventPhotosSectionProps {
  event: Event
}

export function EventPhotosSection({ event }: EventPhotosSectionProps) {
  const photos = event.photos ?? []
  if (photos.length === 0) return null

  return (
    <section className="px-6 max-w-5xl mx-auto pt-16 pb-0 space-y-12">
      <div>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
          Galerie
        </p>
        <h2 className="text-2xl font-bold tracking-tighter">
          En images
        </h2>
      </div>
      {photos.map((photo, i) => (
        <div
          key={photo.src}
          className={`flex flex-col md:flex-row gap-8 items-center ${
            i % 2 === 1 ? "md:flex-row-reverse" : ""
          }`}
        >
          <div className="w-full md:w-1/2 aspect-video relative rounded-xl overflow-hidden border border-border flex-shrink-0">
            <Image
              src={photo.src}
              alt={photo.caption ?? ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <p className="w-full md:w-1/2 text-muted-foreground leading-relaxed">
            {photo.caption}
          </p>
        </div>
      ))}
    </section>
  )
}
