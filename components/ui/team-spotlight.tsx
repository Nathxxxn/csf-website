"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Mail } from "lucide-react"
import type { Member, PoleData } from "@/lib/types"
import styles from "./team-spotlight.module.css"

const INITIAL_VIEWPORT_OFFSET = 36

type SpotlightMember = Member & {
  id: string
  poleId: string
  poleLabel: string
  absoluteIndex: number
}

type PoleTab = {
  id: string
  label: string
  count: number
}

function toPoleId(pole: string): string {
  return pole
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
}

function firstNameOf(name: string): string {
  return name.split(" ").filter(Boolean)[0] ?? name
}

function padCounter(value: number): string {
  return String(value).padStart(2, "0")
}

function placeholderBg(seed: number): string {
  const tones = [
    ["#1a1a1a", "#0a0a0a"],
    ["#1e1612", "#0a0706"],
    ["#121a1e", "#060a0d"],
    ["#181218", "#0a060a"],
    ["#1a1814", "#0a0806"],
  ]
  const tone = tones[seed % tones.length]
  return `linear-gradient(${135 + (seed * 17) % 70}deg, ${tone[0]}, ${tone[1]})`
}

function LinkedInIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function MemberImage({
  member,
  className,
  priority = false,
  sizes,
}: {
  member: SpotlightMember
  className: string
  priority?: boolean
  sizes: string
}) {
  const seed = member.absoluteIndex * 7

  return (
    <div
      className={className}
      style={member.photo ? undefined : { background: placeholderBg(seed) }}
    >
      {member.photo ? (
        <Image
          src={member.photo}
          alt={member.name}
          fill
          priority={priority}
          sizes={sizes}
          className={styles.portraitImage}
        />
      ) : null}
    </div>
  )
}

function buildTeam(poles: PoleData[]) {
  const tabs: PoleTab[] = [
    {
      id: "all",
      label: "Tous",
      count: poles.reduce((total, pole) => total + pole.members.length, 0),
    },
  ]

  const members: SpotlightMember[] = []

  poles.forEach((pole) => {
    const poleId = toPoleId(pole.pole)
    tabs.push({ id: poleId, label: pole.pole, count: pole.members.length })

    pole.members.forEach((member, index) => {
      members.push({
        ...member,
        id: `${poleId}-${member.name}-${index}`,
        poleId,
        poleLabel: pole.pole,
        absoluteIndex: members.length + 1,
      })
    })
  })

  return { tabs, members }
}

interface TeamSpotlightProps {
  poles: PoleData[]
}

export function TeamSpotlight({ poles }: TeamSpotlightProps) {
  const { tabs, members } = useMemo(() => buildTeam(poles), [poles])
  const [filter, setFilter] = useState("all")
  const [idx, setIdx] = useState(0)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const activeThumbRef = useRef<HTMLButtonElement | null>(null)
  const rosterTrackRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (window.location.hash || window.scrollY > 4) return
    window.scrollTo?.({ top: INITIAL_VIEWPORT_OFFSET, behavior: "auto" })
  }, [])

  const filteredMembers = useMemo(() => {
    if (filter === "all") return members
    return members.filter((member) => member.poleId === filter)
  }, [filter, members])

  const total = filteredMembers.length
  const selected = filteredMembers[idx] ?? filteredMembers[0]
  const displayIndex = selected ? idx + 1 : 0
  const progressWidth = total > 0 ? `${(displayIndex / total) * 100}%` : "0%"
  const selectedStats = selected
    ? [
        selected.promo ? { label: "Promo", value: selected.promo } : null,
        selected.joinedYear ? { label: "Au bureau", value: selected.joinedYear } : null,
        selected.contributions !== undefined ? { label: "Contributions", value: String(selected.contributions) } : null,
      ].filter((stat): stat is { label: string; value: string } => Boolean(stat))
    : []
  const hasEnrichedStats = selectedStats.length > 0
  const selectedSkills = selected?.skills?.filter(Boolean) ?? []

  const step = useCallback(
    (delta: number) => {
      if (total === 0) return
      setIdx((current) => (current + delta + total) % total)
    },
    [total],
  )

  const selectFilter = (nextFilter: string) => {
    setFilter(nextFilter)
    setIdx(0)
  }

  useEffect(() => {
    if (idx >= total) setIdx(0)
  }, [idx, total])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return
      }

      if (event.key === "ArrowLeft") step(-1)
      if (event.key === "ArrowRight") step(1)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [step])

  useEffect(() => {
    const track = rosterTrackRef.current
    const activeThumb = activeThumbRef.current
    if (!track || !activeThumb) return

    const targetLeft = activeThumb.offsetLeft - (track.clientWidth - activeThumb.clientWidth) / 2
    track.scrollTo?.({
      left: Math.max(0, targetLeft),
      behavior: "smooth",
    })
  }, [idx, filter])

  if (!selected) {
    return (
      <section className={styles.root} role="region" aria-labelledby="team-spotlight-heading">
        <div className={styles.inner}>
          <h1 id="team-spotlight-heading" className={styles.srOnly}>
            Trombinoscope de l&apos;équipe
          </h1>
          <div className={styles.empty}>Aucun membre à afficher pour le moment.</div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.root} role="region" aria-labelledby="team-spotlight-heading">
      <div className={styles.inner}>
        <h1 id="team-spotlight-heading" className={styles.srOnly}>
          Trombinoscope de l&apos;équipe
        </h1>

        <div className={styles.tabs} role="tablist" aria-label="Filtrer les membres par pôle">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              aria-label={`${tab.label} ${tab.count}`}
              className={`${styles.tab} ${filter === tab.id ? styles.tabActive : ""}`}
              onClick={() => selectFilter(tab.id)}
            >
              {tab.label}
              <span className={styles.count}>{tab.count}</span>
            </button>
          ))}
        </div>

        <article
          className={styles.spotlight}
          aria-live="polite"
          onTouchStart={(event) => {
            const touch = event.touches[0]
            touchStart.current = { x: touch.clientX, y: touch.clientY }
          }}
          onTouchEnd={(event) => {
            if (!touchStart.current) return
            const touch = event.changedTouches[0]
            const dx = touch.clientX - touchStart.current.x
            const dy = touch.clientY - touchStart.current.y
            touchStart.current = null
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
              step(dx > 0 ? -1 : 1)
            }
          }}
        >
          <div className={styles.grid}>
            <div className={styles.portrait}>
              <div className={styles.portraitFrame}>
                <MemberImage
                  key={`portrait-${selected.id}`}
                  member={selected}
                  className={styles.portraitMedia}
                  priority={idx === 0}
                  sizes="(max-width: 980px) 100vw, 44vw"
                />
                {selected.photo ? null : (
                  <span className={styles.portraitPlaceholder}>{initialsOf(selected.name)}</span>
                )}
                <div className={styles.portraitStripes} />
                <div className={styles.portraitGradient} />
                <div className={styles.portraitIndex}>
                  N° {padCounter(displayIndex)} / {padCounter(total)}
                </div>
                <div className={styles.portraitPole}>{selected.poleLabel}</div>
              </div>
            </div>

            <div className={styles.info}>
              <div className={styles.infoTop}>
                <span>CS Finance · Équipe</span>
                <span className={styles.infoRight}>
                  <span className={styles.dash} />
                  <span>
                    {padCounter(displayIndex)} / {padCounter(total)}
                  </span>
                </span>
              </div>

              <div key={`role-${selected.id}`} className={styles.role}>
                <span className={styles.roleBullet} />
                <span>{selected.role}</span>
              </div>

              <h2 key={`name-${selected.id}`} className={styles.name} aria-label={selected.name}>
                {selected.name.split(" ").map((word, wordIndex) => (
                  <span key={`${word}-${wordIndex}`}>
                    {wordIndex > 0 ? " " : null}
                    <span className={styles.nameWord}>
                      <span
                        className={styles.nameWordInner}
                        style={{ animationDelay: `${wordIndex * 0.08}s` }}
                      >
                        {word}
                      </span>
                    </span>
                  </span>
                ))}
              </h2>

              {selected.tagline ? (
                <p key={`tagline-${selected.id}`} className={styles.tagline}>
                  &quot;{selected.tagline}&quot;
                </p>
              ) : null}

              {selected.bio ? (
                <p key={`bio-${selected.id}`} className={styles.bio}>
                  {selected.bio}
                </p>
              ) : null}

              {hasEnrichedStats ? (
                <div key={`stats-${selected.id}`} className={styles.profileStats}>
                  {selectedStats.map((stat) => (
                    <div key={stat.label} className={styles.statItem}>
                      <div className={styles.statKey}>{stat.label}</div>
                      <div className={styles.statValue}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div key={`meta-${selected.id}`} className={styles.focusMeta}>
                  <div className={styles.metaItem}>
                    <div className={styles.metaKey}>Pôle</div>
                    <div className={styles.metaValue}>{selected.poleLabel}</div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaKey}>Rang</div>
                    <div className={styles.metaValue}>
                      {padCounter(displayIndex)}
                      <span aria-hidden="true">/{padCounter(total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedSkills.length > 0 ? (
                <div key={`skills-${selected.id}`} className={styles.skills}>
                  {selectedSkills.map((skill) => (
                    <span key={skill} className={styles.skillChip}>{skill}</span>
                  ))}
                </div>
              ) : null}

              <div className={styles.footer}>
                <div className={styles.links}>
                  {selected.linkedin ? (
                    <a
                      href={selected.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={`LinkedIn de ${selected.name}`}
                    >
                      <LinkedInIcon />
                    </a>
                  ) : null}
                  {selected.email ? (
                    <a
                      href={`mailto:${selected.email}`}
                      className={styles.socialLink}
                      aria-label={`Email de ${selected.name}`}
                    >
                      <Mail className={styles.icon} aria-hidden="true" strokeWidth={1.6} />
                    </a>
                  ) : null}
                </div>

                <div className={styles.nav}>
                  <button
                    type="button"
                    className={styles.arrow}
                    onClick={() => step(-1)}
                    aria-label="Membre précédent"
                  >
                    <ChevronLeft className={styles.arrowIcon} aria-hidden="true" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    className={styles.arrow}
                    onClick={() => step(1)}
                    aria-label="Membre suivant"
                  >
                    <ChevronRight className={styles.arrowIcon} aria-hidden="true" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className={styles.progress} aria-hidden="true">
          <div className={styles.progressCount}>
            <strong>{padCounter(displayIndex)}</strong>/ {padCounter(total)}
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: progressWidth }} />
          </div>
          <div className={styles.progressLabel}>
            {selected.poleLabel} · {selected.role}
          </div>
        </div>

        <div className={styles.rosterHeader}>
          <div className={styles.rosterLabel}>Toute l&apos;équipe</div>
          <div className={styles.hint}>
            <kbd className={styles.kbd}>←</kbd>
            <kbd className={styles.kbd}>→</kbd>
            <span>pour naviguer</span>
          </div>
        </div>

        <div ref={rosterTrackRef} className={styles.rosterTrack} aria-label="Sélectionner un membre">
          {filteredMembers.map((member, memberIndex) => {
            const active = memberIndex === idx
            return (
              <button
                key={member.id}
                ref={active ? activeThumbRef : null}
                type="button"
                className={`${styles.thumb} ${active ? styles.thumbActive : ""}`}
                onClick={() => setIdx(memberIndex)}
                aria-label={`Afficher ${member.name}`}
                aria-current={active ? "true" : undefined}
              >
                <MemberImage
                  member={member}
                  className={styles.thumbMedia}
                  sizes="82px"
                />
                {member.photo ? null : (
                  <span className={styles.thumbInitials}>{initialsOf(member.name)}</span>
                )}
                <span className={styles.thumbStripe} />
                <span className={styles.thumbNum}>{padCounter(memberIndex + 1)}</span>
                <span className={styles.thumbLabel}>{firstNameOf(member.name)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
