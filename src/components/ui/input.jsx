import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={clsx(
        'flex h-9 w-full rounded-md border border-[rgba(0,255,255,0.3)] bg-transparent px-3 py-1 text-sm shadow-neon-cyan placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 ring-offset-[rgba(11,15,20,1)]',
        className
      )}
      {...props}
    />
  )
})
