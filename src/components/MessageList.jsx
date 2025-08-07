import React, { useEffect, useRef } from 'react'
import { ScrollArea } from './ui/scroll-area.jsx'

export function MessageList({ messages }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div ref={ref} className="h-full overflow-auto rounded-md neon-border p-3 space-y-2 bg-[rgba(255,255,255,0.02)]">
      {messages?.length ? messages.map((m, i) => (
        <div key={i} className="flex gap-2">
          <div className={`min-w-[120px] text-right pr-2 text-xs sm:text-[13px] ${m.self ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]' : m.notice ? 'text-purple-300' : 'text-pink-300 drop-shadow-[0_0_6px_rgba(255,0,128,0.6)]'}`}>{m.from}</div>
          <div className={`flex-1 text-sm leading-6 ${m.error ? 'text-red-300' : 'text-foreground'}`}>{m.text}</div>
        </div>
      )) : (
        <div className="text-muted-foreground text-sm">No messages yet.</div>
      )}
    </div>
  )
}
