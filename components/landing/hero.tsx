"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import MotionButton from "@/components/ui/motion-button";

const DottedSurface = dynamic(
  () => import("@/components/ui/dotted-surface").then(m => ({ default: m.DottedSurface })),
  { ssr: false }
);

const TEXT_BADGE_DELAY  = 0.05     // seconds from mount
const TEXT_TITLE_DELAY  = 0.1
const TEXT_SUB_DELAY    = 0.25
const TEXT_BTNS_DELAY   = 0.4

const TITLE_WORDS = ["La", "finance", "à", "CentraleSupélec"];
const LIQUID_CTA_CLASS = "h-[46px] w-[13.5rem] rounded-full px-8 py-3 text-sm font-semibold text-white"
const MOTION_CTA_CLASS = "h-[46px] w-[13.5rem]"

export function Hero() {
  const router = useRouter()

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background pt-16">
      <div className="absolute inset-0 overflow-hidden">
        <DottedSurface className="-top-32 h-[calc(100%+8rem)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_52%),linear-gradient(to_bottom,rgba(6,6,6,0.04),rgba(6,6,6,0.42))]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 max-w-4xl mx-auto text-center">
        <BlurFade delay={TEXT_BADGE_DELAY} inView>
          <div className="mb-8 rounded-full border border-border px-4 py-1.5">
            <AnimatedShinyText className="text-xs tracking-widest uppercase text-muted-foreground">
              Association · CentraleSupélec · 2026–2027
            </AnimatedShinyText>
          </div>
        </BlurFade>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: TEXT_TITLE_DELAY }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-none mb-6">
            {TITLE_WORDS.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-[0.25em] last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: TEXT_TITLE_DELAY + wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
        </motion.div>

        <BlurFade delay={TEXT_SUB_DELAY} inView>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10">
            Des rencontres avec des professionnels, des formats pour progresser et un réseau qui aide vraiment à comprendre les métiers de la finance.
          </p>
        </BlurFade>

        <BlurFade delay={TEXT_BTNS_DELAY} inView>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <LiquidButton
              className={LIQUID_CTA_CLASS}
              onClick={() => router.push('/evenements')}
            >
              Voir les événements →
            </LiquidButton>
            <MotionButton
              label="Devenir partenaire"
              onClick={() => router.push('/contact')}
              classes={MOTION_CTA_CLASS}
            />
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
