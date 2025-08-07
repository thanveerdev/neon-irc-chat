const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('irc', {
  connect: (opts) => ipcRenderer.invoke('irc:connect', opts),
  send: (target, text) => ipcRenderer.invoke('irc:send', { target, text }),
  join: (channel) => ipcRenderer.invoke('irc:join', { channel }),
  part: (channel) => ipcRenderer.invoke('irc:part', { channel }),
  disconnect: () => ipcRenderer.invoke('irc:disconnect'),
  onEvent: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('irc:event', listener);
    return () => ipcRenderer.removeListener('irc:event', listener);
  }
});
