import React from 'react'
import { clsx } from 'clsx'

export function Button({ className, variant = 'default', ...props }) {
  const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-9 px-4 py-2 ring-offset-[rgba(11,15,20,1)]'
  const variants = {
    default: 'bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-foreground',
    neon: 'bg-[rgba(0,255,255,0.12)] hover:bg-[rgba(0,255,255,0.2)] text-cyan-200 shadow-neon-cyan',
    outline: 'border border-[rgba(0,255,255,0.35)] text-foreground hover:bg-[rgba(0,255,255,0.08)]'
  }
  return <button className={clsx(base, variants[variant], className)} {...props} />
}
