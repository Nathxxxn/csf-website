'use client'

import { ArrowRight } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Props {
  label: string
  variant?: 'primary' | 'secondary'
  classes?: string
  animate?: boolean
  delay?: number
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export default function MotionButton({
  label,
  variant = 'primary',
  classes,
  onClick,
  type = 'button',
}: Props) {
  const circleClass = variant === 'secondary' ? 'bg-foreground' : 'bg-primary'

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'group relative inline-flex h-[46px] w-[13.5rem] cursor-pointer items-center overflow-hidden rounded-full border border-white/10 bg-black p-0.5 outline-none',
        classes,
      )}
    >
      <span
        className={cn(
          'm-0 block h-full w-[42px] overflow-hidden rounded-full duration-500 group-hover:w-full',
          circleClass,
        )}
        aria-hidden="true"
      />
      <div className="absolute top-1/2 left-3.5 translate-x-0 -translate-y-1/2 duration-500 group-hover:translate-x-[0.4rem]">
        <ArrowRight className="text-background size-4" />
      </div>
      <span className="text-white group-hover:text-background absolute inset-0 flex items-center justify-center pl-3 text-center text-sm font-semibold whitespace-nowrap duration-500">
        {label}
      </span>
    </button>
  )
}
