"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CinematicSectionProps {
  children: React.ReactNode;
  scrollDistance?: number;
  fadeHero?: boolean;
}

export function CinematicSection({
  children,
  scrollDistance = 2200,
  fadeHero = false,
}: CinematicSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    const content = contentRef.current;
    if (!container || !card || !content) return;

    const heroEl = fadeHero ? document.getElementById("hero-content") : null;

    const ctx = gsap.context(() => {
      gsap.set(card, { yPercent: 108, borderRadius: "2.5rem", scale: 0.9 });
      gsap.set(content, { opacity: 0, y: 40 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: `+=${scrollDistance}`,
          pin: true,
          scrub: 1.4,
          anticipatePin: 1,
        },
      });

      // Phase 1 (0→3): card rises and fills screen
      tl.to(
        card,
        { yPercent: 0, borderRadius: "0px", scale: 1, ease: "power3.inOut", duration: 3 },
        0
      );

      // Simultaneously fade out hero title if requested
      if (heroEl) {
        tl.to(
          heroEl,
          { opacity: 0, filter: "blur(16px)", scale: 1.08, ease: "power2.inOut", duration: 2.5 },
          0
        );
      }

      // Phase 2 (2→4): content fades in
      tl.to(
        content,
        { opacity: 1, y: 0, ease: "power2.out", duration: 2 },
        2
      );

      // Dwell (4→7)
      tl.to({}, { duration: 3 });

      // Phase 3 (7→8): content fades out
      tl.to(
        content,
        { opacity: 0, y: -30, ease: "power2.in", duration: 1.5 },
        7
      );

      // Phase 4 (7.5→10): card shrinks and exits upward
      tl.to(
        card,
        { yPercent: -108, scale: 0.9, borderRadius: "2.5rem", ease: "power3.inOut", duration: 2.5 },
        7.5
      );
    });

    return () => ctx.revert();
  }, [scrollDistance, fadeHero]);

  return (
    <div ref={containerRef} className="relative h-screen w-full">
      <div
        ref={cardRef}
        className="absolute inset-0 bg-[#050505] overflow-auto"
        style={{ willChange: "transform" }}
      >
        <div ref={contentRef} className="h-full w-full min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
