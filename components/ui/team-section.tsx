'use client';
import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  HTMLMotionProps,
  motion,
  MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';

// ─── Scroll animation context ────────────────────────────────────────────────

interface ScrollAnimationContextValue {
  scrollProgress: MotionValue<number>;
}

const ScrollAnimationContext = React.createContext<
  ScrollAnimationContextValue | undefined
>(undefined);

export function useScrollAnimationContext() {
  const context = React.useContext(ScrollAnimationContext);
  if (!context) {
    throw new Error(
      'useScrollAnimationContext must be used within a ScrollAnimation',
    );
  }
  return context;
}

// ─── Primitives ───────────────────────────────────────────────────────────────

export function ScrollAnimation({
  spacerClass,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { spacerClass?: string }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 400,
    restDelta: 0.001,
  });
  const reducedMotion = useReducedMotion();
  const scrollProgress = reducedMotion ? scrollYProgress : smoothProgress;

  return (
    <ScrollAnimationContext.Provider value={{ scrollProgress }}>
      <div ref={scrollRef} className={cn('relative', className)} {...props}>
        {children}
        <div className={cn('w-full h-96', spacerClass)} />
      </div>
    </ScrollAnimationContext.Provider>
  );
}

export function ScrollTranslateY({
  yRange = [0, 384],
  inputRange = [0, 1],
  style,
  className,
  ...props
}: HTMLMotionProps<'div'> & { yRange?: unknown[]; inputRange?: number[] }) {
  const { scrollProgress } = useScrollAnimationContext();
  const y = useTransform(scrollProgress, inputRange, yRange);
  return (
    <motion.div
      style={{ y, willChange: 'transform', ...style }}
      className={cn('relative origin-top', className)}
      {...props}
    />
  );
}

export function ScrollTranslateX({
  xRange = [0, 100],
  inputRange = [0, 1],
  style,
  className,
  ...props
}: HTMLMotionProps<'div'> & { xRange?: unknown[]; inputRange?: number[] }) {
  const { scrollProgress } = useScrollAnimationContext();
  const x = useTransform(scrollProgress, inputRange, xRange);
  return (
    <motion.div
      style={{ x, willChange: 'transform', ...style }}
      className={cn('relative origin-top', className)}
      {...props}
    />
  );
}

export function ScrollScale({
  scaleRange = [1.2, 1],
  inputRange = [0, 1],
  className,
  style,
  ...props
}: HTMLMotionProps<'div'> & { scaleRange?: unknown[]; inputRange?: number[] }) {
  const { scrollProgress } = useScrollAnimationContext();
  const scale = useTransform(scrollProgress, inputRange, scaleRange);
  return (
    <motion.div
      className={className}
      style={{ scale, willChange: 'transform', ...style }}
      {...props}
    />
  );
}

// ─── Team card ────────────────────────────────────────────────────────────────

export interface TeamMember {
  avatar: string;
  name: string;
  role: string;
}

export function TeamCard({
  member,
  className,
  ...props
}: React.ComponentProps<'div'> & { member: TeamMember }) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      <Image
        src={member.avatar}
        alt={member.name}
        width={200}
        height={200}
        className="aspect-square w-full object-cover"
      />
      <div className="space-y-0.5 pb-4 px-4">
        <h3 className="text-base font-medium">{member.name}</h3>
        <p className="text-sm text-muted-foreground">{member.role}</p>
      </div>
    </div>
  );
}

// ─── Main preview component ───────────────────────────────────────────────────

interface TeamScrollPreviewProps {
  members: TeamMember[];
}

export function TeamScrollPreview({ members }: TeamScrollPreviewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const reducedMotion = useReducedMotion();
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 400,
    restDelta: 0.001,
  });
  const progress = reducedMotion ? scrollYProgress : smoothProgress;

  // Cards start off-screen; slide in as user scrolls (0 → 60% of the section)
  const x1 = useTransform(progress, [0, 0.6], ['-120%', '0%']);
  const x2 = useTransform(progress, [0, 0.6], ['120%', '-30%']);
  // Heading starts large, scales down to normal once cards appear
  const scale = useTransform(progress, [0, 0.4], [1.4, 1]);

  return (
    // Tall container creates the scroll range; sticky inner stays pinned
    <div ref={containerRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center gap-6 py-8">
        {/* Row 1 — starts off-screen left, slides in on scroll */}
        <motion.div style={{ x: x1 }} className="flex flex-nowrap gap-4">
          {members.map((member, index) => (
            <TeamCard
              key={index}
              member={member}
              className="min-w-[48vw] md:min-w-[20vw] bg-card border"
            />
          ))}
        </motion.div>

        {/* Central heading — visible from the start, scales down as cards arrive */}
        <motion.div
          style={{ scale }}
          className="w-10/12 mx-auto text-center origin-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Une équipe de{' '}
            <span className="text-indigo-500">stratèges</span>
          </h2>
        </motion.div>

        {/* Row 2 — starts off-screen right, slides in on scroll */}
        <motion.div style={{ x: x2 }} className="flex flex-nowrap gap-4">
          {members.map((member, index) => (
            <TeamCard
              key={index}
              member={member}
              className="min-w-[48vw] md:min-w-[20vw] bg-card border"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
