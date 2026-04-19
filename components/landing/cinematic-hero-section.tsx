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
import { STATS } from "@/lib/constants";
import type { Event } from "@/lib/types";

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

// ── EventsTimeline ────────────────────────────────────────────────────────────
const MONTHS_FR = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC'] as const;
const EV_CARD_W = 280 + 18; // card width + gap-18
const EV_TRACK_TOP = 40;
const EV_CARD_HEIGHT = 210;
const EV_AXIS_TOP = EV_TRACK_TOP + EV_CARD_HEIGHT + 18;
const EV_CONNECTOR_GAP = EV_AXIS_TOP - EV_TRACK_TOP - EV_CARD_HEIGHT;
const EV_DOT_SIZE = 6;

function EventsTimeline({ events }: { events: Event[] }) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const txRef     = useRef(0);
  const targetRef = useRef(0);
  const dragRef   = useRef({ on: false, x0: 0, txStart: 0, last: 0, velocity: 0, lastTime: 0 });
  const rafRef    = useRef<number>(0);

  const today     = new Date();
  const sorted    = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const futureIdx = sorted.findIndex(e => new Date(e.date) >= today);
  const centerIdx = futureIdx >= 0 ? futureIdx : Math.max(0, sorted.length - 1);

  const todayLabel = `TODAY · ${String(today.getDate()).padStart(2, '0')} ${MONTHS_FR[today.getMonth()]} ${String(today.getFullYear()).slice(2)}`;

  useEffect(() => {
    const wrap  = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const maxLen = sorted.length;
    const initial = -centerIdx * EV_CARD_W;
    txRef.current     = initial;
    targetRef.current = initial;
    track.style.transform = `translateX(${initial}px)`;

    const clampX = (v: number) => Math.max(-(maxLen - 1) * EV_CARD_W, Math.min(0, v));
    const lerp   = (a: number, b: number, t: number) => a + (b - a) * t;

    function tick() {
      txRef.current = lerp(txRef.current, targetRef.current, 0.12);
      if (track) track.style.transform = `translateX(${txRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    const mouseDown = (e: MouseEvent) => {
      dragRef.current = { on: true, x0: e.clientX, txStart: txRef.current, last: e.clientX, velocity: 0, lastTime: performance.now() };
      wrap.style.cursor = 'grabbing';
    };
    const mouseMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d.on) return;
      const now = performance.now();
      const dt  = now - d.lastTime;
      if (dt > 0) d.velocity = (e.clientX - d.last) / dt;
      d.last = e.clientX;
      d.lastTime = now;
      targetRef.current = d.txStart + (e.clientX - d.x0);
    };
    const mouseUp = () => {
      const d = dragRef.current;
      if (!d.on) return;
      d.on = false;
      wrap.style.cursor = 'grab';
      targetRef.current = clampX(targetRef.current + d.velocity * 180);
    };
    const touchStart = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      dragRef.current = { on: true, x0: x, txStart: txRef.current, last: x, velocity: 0, lastTime: performance.now() };
    };
    const touchMove = (e: TouchEvent) => {
      const d = dragRef.current;
      if (!d.on) return;
      const x   = e.touches[0].clientX;
      const now = performance.now();
      const dt  = now - d.lastTime;
      if (dt > 0) d.velocity = (x - d.last) / dt;
      d.last = x;
      d.lastTime = now;
      targetRef.current = d.txStart + (x - d.x0);
    };
    const touchEnd = () => {
      const d = dragRef.current;
      if (!d.on) return;
      d.on = false;
      targetRef.current = clampX(targetRef.current + d.velocity * 180);
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        targetRef.current = clampX(targetRef.current - e.deltaX);
      }
    };

    wrap.addEventListener('mousedown',  mouseDown);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup',   mouseUp);
    wrap.addEventListener('touchstart',  touchStart, { passive: true });
    window.addEventListener('touchmove', touchMove,  { passive: true });
    window.addEventListener('touchend',  touchEnd);
    wrap.addEventListener('wheel',       onWheel,    { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      wrap.removeEventListener('mousedown',  mouseDown);
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup',   mouseUp);
      wrap.removeEventListener('touchstart',  touchStart);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend',  touchEnd);
      wrap.removeEventListener('wheel',       onWheel);
    };
  }, [events]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    /* timeline-wrap: padding 40px top, 80px bottom — matches reference */
    <div
      ref={wrapRef}
      className="relative overflow-hidden select-none h-full"
      style={{ padding: `${EV_TRACK_TOP}px 0 80px`, cursor: 'grab' }}
    >
      {/* Axis line */}
      <div
        data-testid="events-axis"
        data-axis-top={String(EV_AXIS_TOP)}
        className="absolute pointer-events-none"
        style={{
          top: `${EV_AXIS_TOP}px`,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(to right, transparent, #222 8%, #222 92%, transparent)',
          zIndex: 2,
        }}
      />

      {/* Today marker — vertical line 36px above + 36px below axis */}
      <div
        data-testid="today-marker"
        data-axis-top={String(EV_AXIS_TOP)}
        className="absolute pointer-events-none"
        style={{ top: `${EV_AXIS_TOP - 36}px`, left: '50%', width: '1px', height: '72px', background: '#fff', zIndex: 10 }}
      >
        <div
          className="absolute rounded-full"
          style={{
            top: '50%',
            left: '50%',
            width: '11px',
            height: '11px',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.3)',
            animation: 'tpulse 2s ease-out infinite',
          }}
        />
        <div
          data-testid="today-axis-dot"
          data-axis-top={String(EV_AXIS_TOP)}
          className="absolute rounded-full bg-white"
          style={{
            top: '50%',
            left: '50%',
            width: '11px',
            height: '11px',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Date label below axis */}
        <div
          className="absolute font-mono text-white whitespace-nowrap"
          style={{ top: '80px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', letterSpacing: '0.22em' }}
        >
          {todayLabel}
        </div>
      </div>

      {/* Draggable track — cards flow from the top, no vertical centering */}
      <div
        ref={trackRef}
        className="flex"
        style={{ gap: '18px', paddingLeft: '50vw', paddingRight: '50vw', willChange: 'transform', alignItems: 'flex-start' }}
      >
        {sorted.map((event) => {
          const isPast  = new Date(event.date) < today;
          const d       = new Date(event.date);
          const dateStr = `${String(d.getDate()).padStart(2, '0')} ${MONTHS_FR[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;

          return (
            <div
              key={event.id}
              className="relative flex flex-col"
              style={{
                flex: '0 0 auto',
                width: '280px',
                height: `${EV_CARD_HEIGHT}px`,
                padding: '22px',
                gap: '16px',
                border: '1px solid #161616',
                borderRadius: '14px',
                background: '#0d0d0d',
                opacity: isPast ? 0.45 : 1,
                transition: 'border-color 0.3s, transform 0.3s',
                userSelect: 'none',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#222'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#161616'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
            >
              {/* Connector — bridges card bottom to the axis line */}
              <div
                data-testid={`event-connector-${event.id}`}
                data-axis-top={String(EV_AXIS_TOP)}
                className="absolute pointer-events-none"
                style={{
                  top: '100%',
                  left: '24.5px',
                  width: '1px',
                  height: `${EV_CONNECTOR_GAP}px`,
                  background: isPast ? '#242424' : 'rgba(255,255,255,0.42)',
                }}
              />
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: `calc(100% + ${EV_CONNECTOR_GAP - EV_DOT_SIZE / 2}px)`,
                  left: '22px',
                  width: `${EV_DOT_SIZE}px`,
                  height: `${EV_DOT_SIZE}px`,
                  background: isPast ? '#333' : '#fff',
                  boxShadow: isPast ? 'none' : '0 0 0 3px rgba(255,255,255,0.12)',
                }}
              />

              {/* ev-date */}
              <div className="font-mono uppercase" style={{ fontSize: '10px', letterSpacing: '0.22em', color: '#8a8a8a' }}>
                {dateStr}
              </div>

              {/* ev-pole */}
              {event.pole && (
                <span
                  className="font-mono uppercase self-start"
                  style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#555', padding: '3px 8px', border: '1px solid #222', borderRadius: '999px' }}
                >
                  {event.pole}
                </span>
              )}

              {/* ev-title */}
              <div
                className="text-white"
                style={{
                  fontFamily: 'var(--font-serif), Georgia, serif',
                  fontSize: '22px',
                  lineHeight: 1.15,
                  letterSpacing: '-0.015em',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                }}
              >
                {event.title}
              </div>

              {/* ev-partner */}
              <div
                className="font-mono"
                style={{ fontSize: '11px', color: '#bababa', letterSpacing: '0.02em', borderTop: '1px solid #161616', paddingTop: '12px', marginTop: 'auto' }}
              >
                <span className="block" style={{ color: '#555', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Partenaire
                </span>
                {event.partner}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
const SCROLL_DISTANCE = 3000;

export function CinematicHeroSection({ members, events }: { members: TeamMember[]; events: Event[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);
  const card2Ref     = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const content2Ref  = useRef<HTMLDivElement>(null);
  const heroBgRef    = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let ctx: gsap.Context | undefined;

    const timer = setTimeout(() => {
      const container = containerRef.current;
      const card      = cardRef.current;
      const card2     = card2Ref.current;
      const content   = contentRef.current;
      const content2  = content2Ref.current;
      const heroBg    = heroBgRef.current;
      if (!container || !card || !card2 || !content || !content2 || !heroBg) return;

      ctx = gsap.context(() => {
        // ── Initial states ──────────────────────────────────────────────────
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
          .to(".ch-buttons", { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.0, ease: "power2.out" }, "-=0.7");

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
        tl.to(heroBg, { scale: 1.12, filter: "blur(20px)", opacity: 0.15, ease: "power2.inOut", duration: 3 }, 0)
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

    return () => {
      clearTimeout(timer);
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
                  La finance
                </span>
                <span
                  className="ch-line2 block text-transparent bg-clip-text bg-linear-to-r from-white to-white/80"
                  style={{ clipPath: "inset(0 100% 0 0)" }}
                >
                  à CentraleSupélec
                </span>
              </h1>
            </div>

            <p className="ch-sub invisible text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10">
              Des rencontres avec des professionnels, des formats pour progresser et un réseau qui aide vraiment à comprendre les métiers de la finance.
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
                {STATS.map((stat, i) => (
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

        {/* ── Card 2: events timeline ───────────────────────────────────────── */}
        <div
          ref={card2Ref}
          className="absolute inset-0 bg-[#050505] overflow-hidden"
          style={{ zIndex: 25, willChange: "transform" }}
        >
          <div ref={content2Ref} className="h-full w-full flex flex-col pt-16">

            {/* Section header — section-head style from reference */}
            <div className="shrink-0 px-8 pt-8 pb-12 flex items-end justify-between gap-6 flex-wrap">
              <div>
                {/* section-kicker */}
                <div className="flex items-center gap-3 mb-3 font-mono uppercase" style={{ fontSize: '11px', letterSpacing: '0.22em', color: '#8a8a8a' }}>
                  <span style={{ color: '#555' }}>01</span>
                  <span>Agenda 2025–2026</span>
                </div>
                {/* section-title */}
                <h2
                  className="text-white"
                  style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.0, letterSpacing: '-0.025em' }}
                >
                  Événements <em style={{ color: '#8a8a8a' }}>récents &amp; à venir</em>
                </h2>
              </div>
              {/* section-action */}
              <Link
                href="/evenements"
                className="hidden sm:block font-mono uppercase transition-colors"
                style={{ fontSize: '12px', letterSpacing: '0.15em', color: '#8a8a8a', borderBottom: '1px solid #333', paddingBottom: '4px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#8a8a8a'; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = '#333'; }}
              >
                Tous les événements →
              </Link>
            </div>

            {/* Timeline */}
            <div className="flex-1 min-h-0 relative">
              <EventsTimeline events={events} />
            </div>

            {/* timeline-hint */}
            <div className="shrink-0 flex items-center justify-between" style={{ padding: '0 32px 24px', marginTop: '16px' }}>
              <span className="font-mono uppercase" style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#555' }}>
                ← drag · swipe · flèches ←→
              </span>
              <span className="font-mono uppercase" style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#555' }}>
                {events.length} événement{events.length !== 1 ? "s" : ""}
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
