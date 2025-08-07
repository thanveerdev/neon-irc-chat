import React, { useState } from 'react'
import { Button } from './ui/button.jsx'
import { Input } from './ui/input.jsx'

export function ConnectionForm({ onConnect }) {
  const [form, setForm] = useState({
    host: 'irc.libera.chat',
    port: 6697,
    tls: true,
    nick: 'cyberpunk_user',
    channels: '#libera',
    authMethod: 'none', // 'none' | 'nickserv' | 'sasl'
    nickservPassword: '',
    saslAccount: '',
    saslPassword: '',
    saslMechanism: 'PLAIN',
  })

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    onConnect(form)
  }

  return (
    <form onSubmit={submit} className="max-w-xl w-full mx-auto p-4 rounded-lg neon-border bg-[rgba(255,255,255,0.03)] space-y-3">
      <div className="text-lg font-semibold tracking-wide text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]">Connect to IRC</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Host</label>
          <Input value={form.host} onChange={(e) => update('host', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Port</label>
          <Input type="number" value={form.port} onChange={(e) => update('port', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Nick</label>
          <Input value={form.nick} onChange={(e) => update('nick', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Channels (comma separated)</label>
          <Input value={form.channels} onChange={(e) => update('channels', e.target.value)} />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input id="tls" type="checkbox" checked={!!form.tls} onChange={(e) => update('tls', e.target.checked)} />
          <label htmlFor="tls" className="text-sm">Use TLS</label>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-muted-foreground">Auth Method</label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {['none','nickserv','sasl'].map(m => (
              <button type="button" key={m}
                onClick={() => update('authMethod', m)}
                className={`px-3 py-2 rounded-md text-sm ${form.authMethod===m ? 'bg-[rgba(0,255,255,0.18)] shadow-neon-cyan' : 'bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)]'}`}
              >{m.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {form.authMethod === 'nickserv' && (
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">NickServ Password</label>
            <Input type="password" value={form.nickservPassword} onChange={(e) => update('nickservPassword', e.target.value)} />
          </div>
        )}

        {form.authMethod === 'sasl' && (
          <>
            <div>
              <label className="text-xs text-muted-foreground">SASL Account (leave blank to use nick)</label>
              <Input value={form.saslAccount} onChange={(e) => update('saslAccount', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">SASL Password</label>
              <Input type="password" value={form.saslPassword} onChange={(e) => update('saslPassword', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">SASL Mechanism</label>
              <select className="mt-1 w-full bg-transparent border border-[rgba(0,255,255,0.3)] rounded-md h-9 px-3"
                value={form.saslMechanism}
                onChange={(e) => update('saslMechanism', e.target.value)}
              >
                <option className="bg-[#0b0f14]" value="PLAIN">PLAIN</option>
                <option className="bg-[#0b0f14]" value="EXTERNAL">EXTERNAL (client cert)</option>
              </select>
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end">
        <Button variant="neon" type="submit">Connect</Button>
      </div>
    </form>
  )
}
