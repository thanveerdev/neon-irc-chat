import React from 'react'
import { Button } from './ui/button.jsx'
import { Separator } from './ui/separator.jsx'

export function Sidebar({ server, nick, channels, activeTarget, onSelect, onShowConnect, onJoinChannel }) {
  return (
    <div className="w-64 p-3 flex flex-col gap-3">
      <div className="p-3 rounded-md neon-border bg-[rgba(255,255,255,0.02)]">
        <div className="text-xs text-muted-foreground">Server</div>
        <div className="text-cyan-300 font-medium truncate drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]">{server || 'Not connected'}</div>
        <div className="text-xs text-muted-foreground">Nick</div>
        <div className="text-pink-300 font-medium truncate drop-shadow-[0_0_6px_rgba(255,0,128,0.5)]">{nick || '-'}</div>
        <div className="mt-2">
          <Button variant="neon" className="w-full" onClick={onShowConnect}>Connect</Button>
        </div>
      </div>
      <Separator className="bg-[rgba(0,255,255,0.15)]" />
      <div className="flex-1 min-h-0 overflow-auto rounded-md neon-border">
        <div className="sticky top-0 bg-[rgba(11,15,20,0.9)] backdrop-blur px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">Channels</div>
        <ul className="p-2 space-y-1">
          {(channels?.length ? channels : ['#']).map((chan, idx) => (
            <li key={chan + idx}>
              <button
                onClick={() => chan !== '#' && onSelect(chan)}
                className={`w-full text-left px-2 py-1 rounded-md transition ${activeTarget === chan ? 'bg-[rgba(0,255,255,0.12)] shadow-neon-cyan' : 'hover:bg-[rgba(255,0,128,0.08)]'}`}
              >
                <span className="text-[13px]">{chan}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <JoinBox onJoinChannel={onJoinChannel} />
    </div>
  )
}

function JoinBox({ onJoinChannel }) {
  const [value, setValue] = React.useState('')
  const onSubmit = (e) => {
    e.preventDefault()
    const chan = value.trim()
    if (!chan) return
    onJoinChannel?.(chan.startsWith('#') ? chan : `#${chan}`)
    setValue('')
  }
  return (
    <form onSubmit={onSubmit} className="p-2 rounded-md neon-border bg-[rgba(255,255,255,0.02)] flex gap-2 items-center">
      <input
        className="flex h-9 w-full rounded-md border border-[rgba(0,255,255,0.3)] bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 ring-offset-[rgba(11,15,20,1)]"
        placeholder="#channel"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button variant="neon" type="submit">Join</Button>
    </form>
  )
}
