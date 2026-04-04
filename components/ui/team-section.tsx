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

// ─── Scroll animation context ─────────────────────────────────────────────────

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
      'useScrollAnimationContext must be used within a ScrollAnimationContextProvider',
    );
  }
  return context;
}

// ─── Primitives (exact copy from spec) ───────────────────────────────────────

export function ScrollAnimation({
  spacerClass,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { spacerClass?: string }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
  });
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
    <div className={cn('space-y-6', className)} {...props}>
      <Image
        src={member.avatar}
        alt={member.name}
        width={200}
        height={200}
        className="aspect-square w-full object-cover"
      />
      <div className="space-y-1 pb-4 px-4">
        <h3 className="text-xl font-medium">{member.name}</h3>
        <h4 className="text-muted-foreground">{member.role}</h4>
      </div>
    </div>
  );
}

// ─── Team scroll preview (DemoOne pattern from spec) ─────────────────────────

export interface TeamScrollPreviewProps {
  members: TeamMember[];
}

export function TeamScrollPreview({ members }: TeamScrollPreviewProps) {
  return (
    <ScrollAnimation className="overflow-hidden">
      <ScrollTranslateY className="min-h-svh flex flex-col justify-center items-center gap-6">
        <div className="w-full">
          <ScrollTranslateX
            xRange={['-200%', '0%']}
            inputRange={[0.4, 0.9]}
            className="origin-bottom flex flex-nowrap gap-4"
          >
            {members.map((member, index) => (
              <TeamCard
                key={index}
                member={member}
                className="min-w-[48vw] md:min-w-[20vw] bg-card border"
              />
            ))}
          </ScrollTranslateX>
        </div>

        <ScrollScale
          inputRange={[0, 0.5]}
          scaleRange={[1.4, 1]}
          className="w-10/12 flex flex-col justify-center text-center items-center mx-auto origin-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Une équipe de{' '}
            <span className="text-indigo-500">stratèges</span>
          </h2>
        </ScrollScale>

        <div className="w-full">
          <ScrollTranslateX
            inputRange={[0.4, 0.9]}
            xRange={['100%', '-50%']}
            className="flex flex-nowrap gap-4"
          >
            {members.map((member, index) => (
              <TeamCard
                key={index}
                member={member}
                className="min-w-[48vw] md:min-w-[20vw] bg-card border"
              />
            ))}
          </ScrollTranslateX>
        </div>
      </ScrollTranslateY>
    </ScrollAnimation>
  );
}
