import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { MessageList } from './components/MessageList.jsx'
import { MessageInput } from './components/MessageInput.jsx'
import { ConnectionForm } from './components/ConnectionForm.jsx'
import { Separator } from './components/ui/separator.jsx'

export default function App() {
  const [connected, setConnected] = useState(false)
  const [server, setServer] = useState('')
  const [nick, setNick] = useState('')
  const [channels, setChannels] = useState([])
  const [activeTarget, setActiveTarget] = useState('')
  const [messagesByTarget, setMessagesByTarget] = useState({})
  const [showConnect, setShowConnect] = useState(true)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const off = window.irc.onEvent((evt) => {
      if (evt.type === 'connected') {
        setConnected(true)
        setServer(evt.server)
        setNick(evt.nick)
      }
      if (evt.type === 'log') {
        setLogs(prev => [...prev.slice(-500), { at: Date.now(), message: evt.message }])
      }
      if (evt.type === 'raw') {
        const dir = evt.direction === 'in' ? '⇦' : '⇨'
        setLogs(prev => [...prev.slice(-500), { at: Date.now(), message: `${dir} ${evt.line}` }])
      }
      if (evt.type === 'disconnected') {
        setConnected(false)
      }
      if (evt.type === 'message') {
        const target = evt.target?.startsWith('#') ? evt.target : evt.from
        setMessagesByTarget(prev => {
          const next = { ...prev }
          const list = next[target] ? [...next[target]] : []
          list.push({ from: evt.from, text: evt.text, at: Date.now() })
          next[target] = list
          return next
        })
        if (!activeTarget) setActiveTarget(target)
        if (!channels.includes(target) && target.startsWith('#')) setChannels(prev => [...new Set([...prev, target])])
      }
      if (evt.type === 'join') {
        if (evt.nick === nick) {
          setChannels(prev => [...new Set([...prev, evt.channel])])
          if (!activeTarget) setActiveTarget(evt.channel)
        }
      }
      if (evt.type === 'part') {
        if (evt.nick === nick) {
          setChannels(prev => prev.filter(c => c !== evt.channel))
          if (activeTarget === evt.channel) setActiveTarget('')
        }
      }
      if (evt.type === 'notice') {
        const target = evt.target?.startsWith('#') ? evt.target : evt.from
        setMessagesByTarget(prev => {
          const next = { ...prev }
          const list = next[target] ? [...next[target]] : []
          list.push({ from: evt.from || 'notice', text: evt.text, at: Date.now(), notice: true })
          next[target] = list
          return next
        })
      }
      if (evt.type === 'error') {
        setMessagesByTarget(prev => {
          const next = { ...prev }
          const list = next['status'] ? [...next['status']] : []
          list.push({ from: 'system', text: evt.message, at: Date.now(), error: true })
          next['status'] = list
          return next
        })
      }
    })
    return () => off()
  }, [activeTarget, channels, nick])

  const messages = useMemo(() => messagesByTarget[activeTarget] || [], [messagesByTarget, activeTarget])

  const handleConnect = async (opts) => {
    const chans = (opts.channels || '').split(',').map(s => s.trim()).filter(Boolean)
    await window.irc.connect({
      host: opts.host,
      port: Number(opts.port) || 6667,
      nick: opts.nick,
      username: opts.username || opts.nick,
      realname: opts.realname || opts.nick,
      password: opts.password || undefined,
      channels: chans,
      tls: !!opts.tls,
      authMethod: opts.authMethod,
      saslAccount: opts.saslAccount,
      saslPassword: opts.saslPassword,
      saslMechanism: opts.saslMechanism,
      nickservPassword: opts.nickservPassword,
    })
    setShowConnect(false)
  }

  const handleSend = async (text) => {
    if (!activeTarget || !text) return
    await window.irc.send(activeTarget, text)
    setMessagesByTarget(prev => {
      const next = { ...prev }
      const list = next[activeTarget] ? [...next[activeTarget]] : []
      list.push({ from: nick, text, at: Date.now(), self: true })
      next[activeTarget] = list
      return next
    })
  }

  return (
    <div className="h-full flex text-sm">
      <Sidebar
        server={server}
        nick={nick}
        channels={channels}
        activeTarget={activeTarget}
        onSelect={setActiveTarget}
        onShowConnect={() => setShowConnect(true)}
        onJoinChannel={async (chan) => {
          await window.irc.join(chan)
          setChannels(prev => [...new Set([...prev, chan])])
          setActiveTarget(chan)
        }}
      />
      <Separator orientation="vertical" className="bg-[rgba(0,255,255,0.15)]" />
      <div className="flex-1 flex flex-col p-3 gap-3">
        {!connected || showConnect ? (
          <ConnectionForm onConnect={handleConnect} />
        ) : (
          <>
            <div className="flex items-center justify-between px-2 py-1 rounded-md neon-border">
              <div className="font-semibold tracking-wide text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]">
                {activeTarget || 'Status'}
              </div>
              <div className="text-xs text-muted-foreground">{server} · {nick}</div>
            </div>
            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-3 gap-3">
              <div className="xl:col-span-2">
                <MessageList messages={messages} />
              </div>
              <div className="hidden xl:block rounded-md neon-border p-3 bg-[rgba(255,255,255,0.02)] overflow-auto max-h-full">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Connection Log</div>
                <div className="space-y-1 text-[11px] leading-5">
                  {logs.map((l, i) => (
                    <div key={i} className="font-mono text-muted-foreground">{l.message}</div>
                  ))}
                </div>
              </div>
            </div>
            <MessageInput onSend={handleSend} disabled={!activeTarget} />
          </>
        )}
      </div>
    </div>
  )
}
