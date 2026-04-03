"use client"

import { useState } from "react"
import Image from "next/image"
import {
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion"
import { ExternalLink, Mail, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { PoleData, Member } from "@/lib/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPoleId(pole: string): string {
  return pole
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
}

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.6, 0.05, 0.01, 0.9] },
  },
}

// ─── MemberCard ───────────────────────────────────────────────────────────────

function MemberCard({ member }: { member: Member }) {
  const [isHovered, setIsHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const shouldReduceMotion = useReducedMotion()

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left - rect.width / 2) / (rect.width / 2))
    mouseY.set((e.clientY - rect.top - rect.height / 2) / (rect.height / 2))
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const initials = getInitials(member.name)
  const hasLinkedin = Boolean(member.linkedin)
  const hasEmail = Boolean(member.email)
  const hasSkills = Array.isArray(member.skills) && member.skills.length > 0

  return (
    <MotionConfig reducedMotion="user">
    <motion.div variants={itemVariants} className="[perspective:1000px]">
      <motion.div
        style={shouldReduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="group relative"
      >
        <Card className="relative overflow-hidden rounded-2xl border border-border/60 bg-card backdrop-blur-xl transition-shadow duration-500 hover:shadow-xl hover:shadow-black/30">
          {/* Gradient overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Sparkle */}
          <motion.div
            className="absolute right-3 top-3 z-10"
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
            transition={{ duration: 0.25 }}
          >
            <Sparkles className="h-4 w-4 text-primary/70" aria-hidden />
          </motion.div>

          <div className="relative z-10 p-5">
            {/* Avatar */}
            <div className="mb-4 flex justify-center">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-secondary">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <span className="select-none text-lg font-semibold text-foreground/70">
                      {initials}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Name + role */}
            <div className="text-center">
              <motion.h4
                className="mb-1.5 text-base font-semibold tracking-tight text-foreground"
                animate={{ scale: isHovered ? 1.03 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {member.name}
              </motion.h4>

              <Badge
                variant="secondary"
                className="mb-3 bg-white/[0.08] text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur"
              >
                {member.role}
              </Badge>

              {/* Bio */}
              {member.bio && (
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>
              )}

              {/* Skills */}
              {hasSkills && (
                <motion.div
                  className="mb-3 flex flex-wrap justify-center gap-1"
                  animate={{ opacity: isHovered ? 1 : 0.65 }}
                  transition={{ duration: 0.3 }}
                >
                  {member.skills?.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="border-border/50 bg-white/[0.04] text-[10px] text-muted-foreground"
                    >
                      {skill}
                    </Badge>
                  ))}
                </motion.div>
              )}

              {/* Social links */}
              {(hasLinkedin || hasEmail) && (
                <motion.div
                  className="flex justify-center gap-2"
                  animate={{ opacity: isHovered ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {hasLinkedin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full border border-border/40 bg-white/5 text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <a
                        href={member.linkedin ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`LinkedIn de ${member.name}`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </Button>
                  )}
                  {hasEmail && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full border border-border/40 bg-white/5 text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <a
                        href={`mailto:${member.email}`}
                        aria-label={`Email de ${member.name}`}
                      >
                        <Mail className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
    </MotionConfig>
  )
}

// ─── PoleSection ──────────────────────────────────────────────────────────────

function getGridCols(count: number): string {
  if (count >= 4) return "sm:grid-cols-2 lg:grid-cols-4"
  if (count === 3) return "sm:grid-cols-2 lg:grid-cols-3"
  if (count === 2) return "sm:grid-cols-2"
  return "grid-cols-1"
}

function PoleSection({ pole }: { pole: PoleData }) {
  const gridCols = getGridCols(pole.members.length)
  const poleId = toPoleId(pole.pole)

  return (
    <section aria-labelledby={`pole-${poleId}-heading`} className="mb-20">
      {/* Pole header */}
      <div className="mb-8 text-center">
        <Badge
          variant="secondary"
          className="mb-3 bg-white/[0.08] text-xs uppercase tracking-widest text-muted-foreground"
        >
          {pole.badge}
        </Badge>
        <h3
          id={`pole-${poleId}-heading`}
          className="mb-2 text-2xl font-semibold tracking-tight text-foreground"
        >
          {pole.pole}
        </h3>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          {pole.description}
        </p>
      </div>

      {/* Members grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className={`grid gap-5 ${gridCols}`}
      >
        {pole.members.map((member) => (
          <MemberCard key={`${pole.pole}-${member.name}`} member={member} />
        ))}
      </motion.div>
    </section>
  )
}

// ─── TeamPolesSection (export) ────────────────────────────────────────────────

interface TeamPolesSectionProps {
  poles: PoleData[]
}

export function TeamPolesSection({ poles }: TeamPolesSectionProps) {
  return (
    <section
      aria-labelledby="team-poles-heading"
      className="relative w-full overflow-hidden px-4 py-16 sm:px-6 lg:px-10"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-emerald-400/[0.08] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <Badge
            variant="secondary"
            className="mb-4 gap-2 bg-white/[0.08] text-muted-foreground backdrop-blur"
          >
            <Sparkles className="h-3 w-3" aria-hidden />
            Notre Équipe
          </Badge>
          <h2
            id="team-poles-heading"
            className="mb-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
          >
            Les membres de CSF
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Une équipe passionnée organisée en pôles thématiques pour vous offrir le meilleur de la finance.
          </p>
        </motion.div>

        {/* Poles */}
        {poles.map((pole) => (
          <PoleSection key={pole.pole} pole={pole} />
        ))}
      </div>
    </section>
  )
}
