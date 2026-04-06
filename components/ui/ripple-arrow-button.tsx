'use client'

import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface RippleArrowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export const RippleArrowButton = forwardRef<HTMLButtonElement, RippleArrowButtonProps>(
  ({ children, className, disabled, type = 'button', ...props }, ref) => {
    const hoverTextClass = disabled
      ? ''
      : 'group-hover:[text-shadow:5px_5px_5px_var(--button-shadow)] group-active:[text-shadow:none]'
    const hoverIconClass = disabled
      ? 'drop-shadow-none'
      : 'group-hover:me-[0.66em] group-hover:drop-shadow-[5px_5px_2.5px_var(--button-shadow)]'
    const hoverLeadPolygonClass = disabled
      ? ''
      : 'group-hover:translate-x-0 group-hover:[animation:contact-button-opacity_1s_infinite_0.6s]'
    const hoverMidPolygonClass = disabled
      ? ''
      : 'group-hover:translate-x-0 group-hover:[animation:contact-button-opacity_1s_infinite_0.4s]'
    const hoverTailPolygonClass = disabled
      ? ''
      : 'group-hover:[animation:contact-button-opacity_1s_infinite_0.2s]'

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        style={
          {
            '--button-text': '#050505',
            '--button-background': '#f5f5f5',
            '--button-background-hover': '#ffffff',
            '--button-outline': 'rgba(255,255,255,0.2)',
            '--button-shadow': 'rgba(0,0,0,0.28)',
          } as CSSProperties
        }
        className={cn(
          'group flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/14 px-0 py-[0.85rem] ps-7 pe-5 text-sm font-semibold tracking-tight whitespace-nowrap text-[var(--button-text)] [background:var(--button-background)] shadow-[0_0_0.2em_0_rgba(255,255,255,0.16)] transition-[transform,box-shadow,background-color,border-color] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] enabled:hover:border-transparent enabled:hover:shadow-[0_0_1em_0_rgba(255,255,255,0.2)] enabled:hover:[animation:contact-button-ripple_1s_linear_infinite,contact-button-colorize_1s_infinite] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:[animation:none]',
          className,
        )}
        {...props}
      >
        <span className={cn('mr-[0.3em] transition-all duration-500', hoverTextClass)}>
          {children}
        </span>

        <svg
          aria-hidden="true"
          viewBox="0 0 66 43"
          className={cn(
            'relative -me-[0.16em] h-[0.8em] fill-[var(--button-text)] transition-all duration-500',
            hoverIconClass,
          )}
        >
          <polygon
            points="39.58,4.46 44.11,0 66,21.5 44.11,43 39.58,38.54 56.94,21.5"
            className={cn('translate-x-[-60%] transition-transform duration-300', hoverLeadPolygonClass)}
          />
          <polygon
            points="19.79,4.46 24.32,0 46.21,21.5 24.32,43 19.79,38.54 37.15,21.5"
            className={cn('translate-x-[-30%] transition-transform duration-500', hoverMidPolygonClass)}
          />
          <polygon
            points="0,4.46 4.53,0 26.42,21.5 4.53,43 0,38.54 17.36,21.5"
            className={hoverTailPolygonClass}
          />
        </svg>
      </button>
    )
  },
)

RippleArrowButton.displayName = 'RippleArrowButton'
