import React from 'react'
import { clsx } from 'clsx'

export function Separator({ orientation = 'horizontal', className }) {
  const base = 'shrink-0 bg-[rgba(255,255,255,0.08)]'
  return (
    <div
      className={clsx(
        base,
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-auto',
        className
      )}
    />
  )
}
