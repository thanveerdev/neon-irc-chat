import React, { useEffect, useRef, useState } from 'react'
import { Input } from './ui/input.jsx'
import { Button } from './ui/button.jsx'

export function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  const handleSend = () => {
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
    inputRef.current?.focus()
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <Input
        ref={inputRef}
        value={value}
        disabled={disabled}
        onKeyDown={onKey}
        onChange={(e) => setValue(e.target.value)}
        placeholder={disabled ? 'Select a channel to start chatting' : 'Type a message…'}
      />
      <Button variant="neon" onClick={handleSend} disabled={disabled}>Send</Button>
    </div>
  )
}
