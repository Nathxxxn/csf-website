"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full text-white" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const TITLE_WORDS = ["Shaping", "the", "future", "of", "Finance."];

export function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background pt-16">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 max-w-4xl mx-auto text-center">
        <BlurFade delay={0.2} inView>
          <div className="mb-8 rounded-full border border-border px-4 py-1.5">
            <AnimatedShinyText className="text-xs tracking-widest uppercase text-muted-foreground">
              Association · CentraleSupélec · 2026–2027
            </AnimatedShinyText>
          </div>
        </BlurFade>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
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
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
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

        <BlurFade delay={0.6} inView>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10">
            L&apos;association finance de référence à CentraleSupélec. Événements exclusifs, formations intensives, réseau industrie.
          </p>
        </BlurFade>

        <BlurFade delay={0.75} inView>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Link href="/evenements">
              <ShimmerButton className="px-8 py-3 text-sm font-semibold">
                Découvrir nos événements →
              </ShimmerButton>
            </Link>
            <div className="inline-block group relative bg-gradient-to-b from-white/10 to-black/10 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Button
                variant="ghost"
                asChild
                className="rounded-[1.15rem] px-8 py-3 text-sm font-semibold backdrop-blur-md bg-black/95 hover:bg-black/100 text-white transition-all duration-300 group-hover:-translate-y-0.5 border border-white/10 hover:shadow-md hover:shadow-neutral-800/50 h-auto"
              >
                <Link href="/contact">
                  <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                    Devenir partenaire
                  </span>
                  <span className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300">
                    →
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
