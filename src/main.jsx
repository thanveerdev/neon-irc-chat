import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Mirror IRC events to the browser console for debugging
if (window.irc && typeof window.irc.onEvent === 'function') {
  try {
    window.irc.onEvent((evt) => {
      if (evt?.type === 'raw') {
        // Already redacted in main where necessary
        // eslint-disable-next-line no-console
        console.debug('[IRC RAW]', evt.direction, evt.line)
      } else if (evt?.type === 'log') {
        // eslint-disable-next-line no-console
        console.debug('[IRC]', evt.message)
      } else if (evt?.type === 'error') {
        // eslint-disable-next-line no-console
        console.error('[IRC ERROR]', evt.message)
      }
    })
  } catch {}
}
