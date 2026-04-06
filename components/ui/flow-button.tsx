'use client'

import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

interface FlowButtonProps {
  text?: string
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function FlowButton({
  text = 'Modern Button',
  className,
  onClick,
  type = 'button',
}: FlowButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'group relative flex cursor-pointer items-center gap-1 overflow-hidden rounded-[100px] border border-white/15 bg-transparent px-8 py-3 text-sm font-semibold text-white transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-black active:scale-[0.95]',
        className,
      )}
    >
      <ArrowRight className="absolute left-[-25%] z-[9] h-4 w-4 stroke-white fill-none transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-4 group-hover:stroke-black" />

      <span className="relative z-[1] -translate-x-3 transition-all duration-[800ms] ease-out group-hover:translate-x-3">
        {text}
      </span>

      <span className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-white opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:h-[220px] group-hover:w-[220px] group-hover:opacity-100" />

      <ArrowRight className="absolute right-4 z-[9] h-4 w-4 stroke-white fill-none transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%] group-hover:stroke-black" />
    </button>
  )
}
