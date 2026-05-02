"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import MotionButton from "@/components/ui/motion-button";
import TeamShowcase, { type TeamMember } from "@/components/ui/team-showcase";
import { LOADING_DONE_EVENT } from "@/components/layout/loading-screen";
import { STATS } from "@/lib/constants";
import { EventsMagazine } from "@/components/landing/events-magazine";
import type { Event, SiteContent } from "@/lib/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Graph data — single RNG chain matching reference HTML (seed=7) ───────────
const SVG_W = 100;
const SVG_H = 32;
const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type LineGraph   = { kind: "line";   d: string;        endpoint: [number, number] };
type AreaGraph   = { kind: "area";   linePath: string; fillPath: string; endpoint: [number, number] };
type BarsGraph   = { kind: "bars";   bars: { x: number; y: number; w: number; h: number }[] };
type CandleGraph = { kind: "candle"; elements: { x: number; y: number; w: number; h: number }[] };
type GraphData   = LineGraph | AreaGraph | BarsGraph | CandleGraph;

function buildAllGraphs(): GraphData[] {
  let s = 7;
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  // 1. Line — 1 init + 14 pts
  const linePts: [number, number][] = [];
  let y = 16 + (rng() - 0.5) * 8;
  for (let i = 0; i < 14; i++) {
    const trend = (i / 14) * -8;
    y += (rng() - 0.5) * 3;
    y = cl(y + trend / 14, 4, 28);
    linePts.push([+(i * (100 / 13)).toFixed(1), +y.toFixed(1)]);
  }
  const lineGraph: LineGraph = {
    kind: "line",
    d: linePts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" "),
    endpoint: linePts[linePts.length - 1],
  };

  // 2. Bars — 10 rng calls
  const bars = Array.from({ length: 10 }, (_, i) => {
    const h = +(8 + rng() * 22).toFixed(1);
    return { x: i * 10 + 1.5, y: +(SVG_H - h).toFixed(1), w: 7, h };
  });
  const barsGraph: BarsGraph = { kind: "bars", bars };

  // 3. Area — 1 init + 14 pts
  const areaPts: [number, number][] = [];
  y = 16 + (rng() - 0.5) * 8;
  for (let i = 0; i < 14; i++) {
    const trend = (i / 14) * -10;
    y += (rng() - 0.5) * 3;
    y = cl(y + trend / 14, 4, 28);
    areaPts.push([+(i * (100 / 13)).toFixed(1), +y.toFixed(1)]);
  }
  const areaLine = areaPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
  const areaGraph: AreaGraph = {
    kind: "area",
    linePath: areaLine,
    fillPath: `${areaLine} L100 32 L0 32 Z`,
    endpoint: areaPts[areaPts.length - 1],
  };

  // 4. Candle — 10 × 3 rng calls
  const candleEls: { x: number; y: number; w: number; h: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const mid   = 16 + (rng() - 0.5) * 8;
    const wickH = +(8 + rng() * 6).toFixed(1);
    const bodyH = +(6 + rng() * 8).toFixed(1);
    const cx    = i * 10 + 5;
    candleEls.push({ x: +(cx - 0.5).toFixed(1), y: +(mid - +wickH / 2).toFixed(1), w: 1,  h: +wickH });
    candleEls.push({ x: +(cx - 3).toFixed(1),   y: +(mid - +bodyH / 2).toFixed(1), w: 6,  h: +bodyH });
  }
  const candleGraph: CandleGraph = { kind: "candle", elements: candleEls };

  return [lineGraph, barsGraph, areaGraph, candleGraph];
}

const GRAPH_DATA: GraphData[] = buildAllGraphs();

// ── MiniGraph ─────────────────────────────────────────────────────────────────
function MiniGraph({ data }: { data: GraphData }) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {data.kind === "area" && (
        <path
          className="stat-graph-fill"
          d={data.fillPath}
          fill="rgba(255,255,255,0.05)"
          stroke="none"
          style={{ opacity: 0 }}
        />
      )}
      {(data.kind === "line" || data.kind === "area") && (
        <path
          className="stat-graph-line"
          d={data.kind === "area" ? data.linePath : data.d}
          fill="none"
          stroke="white"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {(data.kind === "line" || data.kind === "area") && (
        <circle
          className="stat-graph-dot"
          cx={data.endpoint[0]}
          cy={data.endpoint[1]}
          r="2"
          fill="white"
        />
      )}
      {data.kind === "bars" && data.bars.map((bar, i) => (
        <rect
          key={i}
          className="stat-graph-bar"
          x={bar.x}
          y={bar.y}
          width={bar.w}
          height={bar.h}
          fill="white"
          style={{ animationDelay: `${i * 0.04}s` }}
        />
      ))}
      {data.kind === "candle" && data.elements.map((el, i) => (
        <rect
          key={i}
          className="stat-graph-bar"
          x={el.x}
          y={el.y}
          width={el.w}
          height={el.h}
          fill="white"
          style={{ animationDelay: `${i * 0.04}s` }}
        />
      ))}
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
const SCROLL_DISTANCE = 3000;

export function CinematicHeroSection({ members, events, siteContent }: { members: TeamMember[]; events: Event[]; siteContent?: SiteContent }) {
  const heroTitle   = siteContent?.hero_title   || ''
  const heroSubtitle = siteContent?.hero_subtitle || "Des rencontres avec des professionnels, des formats pour progresser et un réseau qui aide vraiment à comprendre les métiers de la finance."
  const titleLines  = heroTitle ? heroTitle.split('\n').filter(Boolean) : ['La finance', 'à CentraleSupélec']
  const stats = STATS.map((stat, i) => {
    const raw = [siteContent?.stats_poles, siteContent?.stats_membres, undefined, siteContent?.stats_evenements][i]
    const n = raw ? Number(raw) : NaN
    return Number.isFinite(n) && n > 0 ? { ...stat, value: n } : stat
  })
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);
  const card2Ref     = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const content2Ref  = useRef<HTMLDivElement>(null);
  const heroBgRef    = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let ctx: gsap.Context | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    const card      = cardRef.current;
    const card2     = card2Ref.current;
    const content   = contentRef.current;
    const content2  = content2Ref.current;

    // Set initial hidden states immediately so they're invisible
    // before the loading screen fades away.
    if (card && card2 && content && content2) {
      gsap.set(".ch-scroll",  { autoAlpha: 0, y: 10 });
      gsap.set(".ch-badge",   { autoAlpha: 0, y: 30,  filter: "blur(10px)" });
      gsap.set(".ch-line1",   { autoAlpha: 0, y: 60,  scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".ch-line2",   { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".ch-sub",     { autoAlpha: 0, y: 30,  filter: "blur(10px)" });
      gsap.set(".ch-buttons", { autoAlpha: 0, y: 30,  filter: "blur(10px)" });
      gsap.set(card,    { yPercent: 108, borderRadius: "2.5rem", scale: 0.9 });
      gsap.set(content, { autoAlpha: 0, y: 40 });
      gsap.set(card2,   { yPercent: 108, borderRadius: "2.5rem", scale: 0.9 });
      gsap.set(content2, { autoAlpha: 0, y: 30 });
    }

    const initGsap = () => {
    timerId = setTimeout(() => {
      const container = containerRef.current;
      const card      = cardRef.current;
      const card2     = card2Ref.current;
      const content   = contentRef.current;
      const content2  = content2Ref.current;
      const heroBg    = heroBgRef.current;
      if (!container || !card || !card2 || !content || !content2 || !heroBg) return;

      ctx = gsap.context(() => {
        // ── Initial states (re-applied inside context for revert safety) ────
        gsap.set(".ch-scroll",  { autoAlpha: 0, y: 10 });
        gsap.set(".ch-badge",   { autoAlpha: 0, y: 30,  filter: "blur(10px)" });
        gsap.set(".ch-line1",   { autoAlpha: 0, y: 60,  scale: 0.85, filter: "blur(20px)", rotationX: -20 });
        gsap.set(".ch-line2",   { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
        gsap.set(".ch-sub",     { autoAlpha: 0, y: 30,  filter: "blur(10px)" });
        gsap.set(".ch-buttons", { autoAlpha: 0, y: 30,  filter: "blur(10px)" });
        gsap.set(card,    { yPercent: 108, borderRadius: "2.5rem", scale: 0.9 });
        gsap.set(content, { autoAlpha: 0, y: 40 });
        gsap.set(card2,   { yPercent: 108, borderRadius: "2.5rem", scale: 0.9 });
        gsap.set(content2, { autoAlpha: 0, y: 30 });

        // ── Intro timeline ─────────────────────────────────────────────────
        const intro = gsap.timeline({ delay: 0.3 });
        intro
          .to(".ch-badge",   { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.0, ease: "power2.out" })
          .to(".ch-line1",   { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, duration: 1.8, ease: "expo.out" }, "-=0.8")
          .to(".ch-line2",   { clipPath: "inset(0 0% 0 0)", duration: 1.4, ease: "power4.inOut" }, "-=1.0")
          .to(".ch-sub",     { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.0, ease: "power2.out" }, "-=0.8")
          .to(".ch-buttons", { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.0, ease: "power2.out" }, "-=0.7")
          .to(".ch-scroll",  { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4");

        // ── Scroll line loop ────────────────────────────────────────────────
        gsap.fromTo(".ch-scroll-line",
          { scaleY: 0, transformOrigin: "top center", yPercent: 0 },
          { scaleY: 1, yPercent: 160, duration: 1.1, ease: "power2.inOut", repeat: -1, repeatDelay: 0.3 }
        );

        // ── Scroll timeline ─────────────────────────────────────────────────
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: `+=${SCROLL_DISTANCE}`,
            scrub: 1.2,
          },
        });

        // Phase 1 (0→3): hero blurs + card1 rises
        tl.to(".ch-scroll", { autoAlpha: 0, y: -8, duration: 0.5, ease: "power2.in" }, 0)
          .to(heroBg, { scale: 1.12, filter: "blur(20px)", opacity: 0.15, ease: "power2.inOut", duration: 3 }, 0)
          .to(card,   { yPercent: 0, scale: 0.9, borderRadius: "1.5rem", ease: "power3.inOut", duration: 3 }, 0);

        // Phase 2 (2→4): card1 content fades in
        tl.to(content, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 2 }, 2);

        // Phase 2.5: stats mini-graphs animate
        container.querySelectorAll<SVGPathElement>(".stat-graph-line").forEach((path, i) => {
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          tl.to(path, { strokeDashoffset: 0, duration: 0.75, ease: "power2.out" }, 2.5 + i * 0.1);
        });
        container.querySelectorAll<SVGPathElement>(".stat-graph-fill").forEach((path) => {
          tl.to(path, { opacity: 1, duration: 0.6, ease: "power2.out" }, 2.5);
        });
        container.querySelectorAll<SVGRectElement>(".stat-graph-bar").forEach((rect, i) => {
          const oy = parseFloat(rect.getAttribute("y") ?? "0");
          const oh = parseFloat(rect.getAttribute("height") ?? "4");
          gsap.set(rect, { attr: { y: oy + oh, height: 0 } });
          tl.to(rect, { attr: { y: oy, height: oh }, duration: 0.7, ease: "power3.out" }, 2.5 + i * 0.04);
        });
        container.querySelectorAll<SVGCircleElement>(".stat-graph-dot").forEach((dot, i) => {
          gsap.set(dot, { autoAlpha: 0, scale: 0, transformOrigin: "center" });
          tl.to(dot, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(1.8)" }, 3.2 + i * 0.1);
        });

        // Number counters
        container.querySelectorAll<HTMLElement>(".stat-count").forEach((el, i) => {
          const target = parseInt(el.dataset.target ?? "0", 10);
          const proxy  = { value: 0 };
          gsap.set(el, { textContent: "0" });
          tl.to(proxy, {
            value: target,
            duration: 1.2,
            ease: "power3.out",
            onUpdate() { el.textContent = Math.round(proxy.value).toLocaleString("fr-FR"); },
          }, 2.5 + i * 0.08);
        });

        // Dwell on card1 (4→6)
        tl.to({}, { duration: 2 });

        // Phase 3 (6→7.5): card1 content out + hero disappears
        tl.to(content, { autoAlpha: 0, y: -30, ease: "power2.in", duration: 1.5 }, 6);
        tl.to(heroBg,  { opacity: 0, duration: 1.0, ease: "power2.in" }, 6.5);

        // Phase 4 (6.5→9): card1 shrinks, floats up, dissolves
        tl.to(card, { yPercent: -90, scale: 0.78, autoAlpha: 0, borderRadius: "2.5rem", ease: "power2.inOut", duration: 2.5 }, 6.5);

        // Phase 5 (7→8.5): card2 rises from below while card1 exits
        tl.to(card2, { yPercent: 0, scale: 0.9, borderRadius: "1.5rem", ease: "power3.inOut", duration: 1.5 }, 7);

        // Phase 5.5 (8→9): card2 content fades in
        tl.to(content2, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 1 }, 8);

        // Dwell on card2 (9→9.1)
        tl.to({}, { duration: 0.1 }, 9);

        // Phase 6 (9.1→10.2): card2 content exits
        tl.to(content2, { autoAlpha: 0, y: -30, ease: "power2.in", duration: 1.1 }, 9.1);

        // Phase 7 (9→11.3): card2 leaves, revealing the particle background
        tl.to(card2, { yPercent: -90, scale: 0.78, autoAlpha: 0, borderRadius: "2.5rem", ease: "power2.inOut", duration: 2.3 }, 9);

        // Keep the final scroll mapped to the footer reveal instead of a blank sticky screen.
        tl.to({}, { duration: 2.2 }, 11.3);

      }, containerRef);
    }, 50);
    };

    if (document.body.dataset.csfLoaded === '1') {
      initGsap();
    } else {
      window.addEventListener(LOADING_DONE_EVENT, initGsap, { once: true });
    }

    return () => {
      window.removeEventListener(LOADING_DONE_EVENT, initGsap);
      clearTimeout(timerId);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full"
      style={{
        height: `calc(100vh + ${SCROLL_DISTANCE}px)`,
        marginBottom: "calc(-100vh + 220px)",
        perspective: "1500px",
        zIndex: 10,
      }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ perspective: "1500px" }}>
        {/* Hero radial bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_52%),linear-gradient(to_bottom,rgba(6,6,6,0.04),rgba(6,6,6,0.42))]" />
        </div>

        {/* Bottom mask */}
        <div
          className="absolute bottom-0 inset-x-0 pointer-events-none"
          style={{ height: "8%", background: "linear-gradient(to bottom, transparent, #050505 55%)", zIndex: 15 }}
        />

        {/* Hero content */}
        <div
          ref={heroBgRef}
          className="absolute inset-0 z-10 flex items-center justify-center pt-16"
          style={{ perspective: "1500px" }}
        >
          <div className="flex flex-col items-center px-6 max-w-4xl mx-auto text-center">
            <div className="ch-badge invisible mb-8 rounded-full border border-border px-4 py-1.5">
              <AnimatedShinyText className="text-xs tracking-widest uppercase text-muted-foreground">
                Association · CentraleSupélec · 2026–2027
              </AnimatedShinyText>
            </div>

            <div style={{ perspective: "1500px" }}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-none mb-6">
                <span className="ch-line1 invisible block text-transparent bg-clip-text bg-linear-to-r from-white to-white/80">
                  {titleLines[0]}
                </span>
                {titleLines[1] && (
                  <span
                    className="ch-line2 block text-transparent bg-clip-text bg-linear-to-r from-white to-white/80"
                    style={{ clipPath: "inset(0 100% 0 0)" }}
                  >
                    {titleLines[1]}
                  </span>
                )}
              </h1>
            </div>

            <p className="ch-sub invisible text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10">
              {heroSubtitle}
            </p>

            <div className="ch-buttons invisible flex flex-col sm:flex-row gap-3 items-center">
              <LiquidButton
                className="h-11.5 w-54 rounded-full px-8 py-3 text-sm font-semibold text-white"
                onClick={() => router.push("/evenements")}
              >
                Voir les événements →
              </LiquidButton>
              <MotionButton
                label="Devenir partenaire"
                onClick={() => router.push("/contact")}
                classes="h-11.5 w-54"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="ch-scroll pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-medium select-none">Scroll</span>
          <div className="relative h-10 w-px bg-white/10">
            <div className="ch-scroll-line absolute top-0 left-0 w-full bg-white/50 rounded-full" style={{ height: '40%' }} />
          </div>
        </div>

        {/* ── Card 1: stats + team ──────────────────────────────────────────── */}
        <div
          ref={cardRef}
          className="absolute inset-0 bg-[#050505] z-20 overflow-hidden"
          style={{ willChange: "transform" }}
        >
          <div ref={contentRef} className="h-full w-full flex flex-col pt-16">

            {/* Stats bar */}
            <div className="shrink-0 border-b border-white/8">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
                {stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center justify-center py-6 px-6 text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tighter leading-none text-white">
                      <span className="stat-count" data-target={String(stat.value)}>0</span>
                      <span>{stat.suffix}</span>
                    </div>
                    <div className="mt-3 mb-2">
                      <MiniGraph data={GRAPH_DATA[i]} />
                    </div>
                    <p className="text-[9px] tracking-widest uppercase text-zinc-500 font-mono">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Team section */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-end justify-between px-6 md:px-10 pt-6 pb-3 shrink-0">
                <div>
                  <p className="text-xs tracking-widest uppercase text-zinc-500 mb-1">
                    L&apos;association
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    L&apos;équipe CS Finance
                  </h2>
                </div>
                <Link
                  href="/equipe"
                  className="hidden sm:block text-sm text-zinc-400 border-b border-zinc-600 pb-0.5 hover:text-white transition-colors"
                >
                  Voir toute l&apos;équipe →
                </Link>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <TeamShowcase members={members} />
              </div>

              <div className="px-6 pb-4 sm:hidden shrink-0">
                <Link
                  href="/equipe"
                  className="block text-center text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Voir toute l&apos;équipe →
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ── Card 2: events magazine grid ──────────────────────────────── */}
        <div
          ref={card2Ref}
          className="absolute inset-0 bg-[#050505] overflow-hidden"
          style={{ zIndex: 25, willChange: "transform" }}
        >
          <div ref={content2Ref} className="h-full w-full flex flex-col pt-16">

            {/* Section header */}
            <div className="shrink-0 px-8 pt-8 pb-5 flex items-end justify-between gap-6 flex-wrap">
              <div>
                <div className="mb-3 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                  <span className="text-zinc-700">01</span>
                  <span>Agenda 2025–2026</span>
                </div>
                <h2 className="text-3xl font-bold leading-none tracking-tight text-white md:text-5xl">
                  Événements <span className="text-zinc-400">récents &amp; à venir</span>
                </h2>
              </div>
              <Link
                href="/evenements"
                className="hidden border-b border-zinc-700 pb-1 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500 transition-colors hover:border-white hover:text-white sm:block"
              >
                Tous les événements →
              </Link>
            </div>

            {/* Magazine grid */}
            <div className="flex-1 min-h-0">
              <EventsMagazine events={events} />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
