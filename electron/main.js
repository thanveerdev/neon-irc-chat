const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { Client } = require('irc-framework');

let mainWindow = null;
let ircClient = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    backgroundColor: '#0b0f14',
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const url = process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '..', 'dist', 'index.html')}`;
  mainWindow.loadURL(url);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

function emitToRenderer(type, payload) {
  if (mainWindow) {
    mainWindow.webContents.send('irc:event', { type, ...payload });
  }
}

ipcMain.handle('irc:connect', async (_event, opts) => {
  const {
    host,
    port = 6667,
    nick,
    username,
    realname,
    password,
    channels = [],
    tls = false,
    authMethod = 'none',
    saslAccount,
    saslPassword,
    saslMechanism = 'PLAIN',
    nickservPassword,
  } = opts || {};
  if (!host || !nick) {
    throw new Error('Host and nick are required');
  }
  if (ircClient) {
    try { ircClient.quit('reconnecting'); } catch {}
    ircClient = null;
  }
  return await new Promise((resolve, reject) => {
    const client = new Client();
    ircClient = client;

    // Verbose logging hooks
    client.on('debug', (out) => emitToRenderer('log', { message: String(out) }));
    client.on('debug', (out) => console.log('[IRC DEBUG]', out));
    client.on('raw', (payload) => {
      let line = payload?.line || '';
      const fromServer = !!payload?.from_server;
      const redact = !fromServer && (line.startsWith('PASS') || line.startsWith('AUTHENTICATE') || /identify\s+/i.test(line));
      if (redact) line = '[redacted sensitive outbound line]';
      emitToRenderer('raw', { direction: fromServer ? 'in' : 'out', line });
      console.log(`[IRC ${fromServer ? 'IN ' : 'OUT'}]`, line);
    });
    client.on('connecting', () => { emitToRenderer('log', { message: 'Connecting…' }); console.log('[IRC] Connecting…'); });
    client.on('socket connected', () => { emitToRenderer('log', { message: 'Socket connected' }); console.log('[IRC] Socket connected'); });
    client.on('reconnecting', (info) => { emitToRenderer('log', { message: `Reconnecting attempt ${info?.attempt}/${info?.max_retries} in ${info?.wait}ms` }); console.log('[IRC] Reconnecting', info); });

    client.on('registered', () => {
      emitToRenderer('connected', { server: host, nick: client.user.nick });
      // If NickServ auth is requested, identify after registration
      if (authMethod === 'nickserv' && nickservPassword) {
        try {
          client.say('NickServ', `IDENTIFY ${nickservPassword}`);
        } catch {}
      }
      for (const chan of channels) {
        if (chan) {
          client.join(chan);
        }
      }
      resolve({ ok: true });
    });

    client.on('close', () => emitToRenderer('disconnected', {}));
    client.on('socket close', () => emitToRenderer('disconnected', {}));
    client.on('error', (err) => {
      emitToRenderer('error', { message: err?.message || String(err) });
      if (!client.connection?.socket || client.connection.socket.destroyed) {
        reject(new Error(err?.message || 'IRC error'));
      }
    });

    client.on('sasl failed', (event) => {
      const reason = event?.reason || 'SASL failed';
      emitToRenderer('error', { message: `SASL failed: ${reason}` });
      console.warn('[IRC] SASL failed:', reason);
    });
    client.on('irc error', (event) => {
      const code = event?.error || event?.command || 'irc_error';
      emitToRenderer('error', { message: `IRC error: ${code}` });
      console.error('[IRC] Error:', code, event || '');
    });

    client.on('message', (event) => {
      emitToRenderer('message', {
        from: event.nick,
        target: event.target,
        text: event.message,
      });
    });

    client.on('join', (event) => emitToRenderer('join', { nick: event.nick, channel: event.channel }));
    client.on('part', (event) => emitToRenderer('part', { nick: event.nick, channel: event.channel }));
    client.on('notice', (event) => emitToRenderer('notice', { from: event.nick, target: event.target, text: event.message }));

    const connectOptions = {
      host,
      port,
      nick,
      username: username || nick,
      gecos: realname || nick,
      password,
      tls,
    };

    if (authMethod === 'sasl' && (saslAccount || nick) && saslPassword) {
      connectOptions.account = { account: saslAccount || nick, password: saslPassword };
      connectOptions.sasl_mechanism = (saslMechanism || 'PLAIN').toUpperCase();
      connectOptions.sasl_disconnect_on_fail = false;
    }

    client.connect(connectOptions);
  });
});

ipcMain.handle('irc:send', async (_event, { target, text }) => {
  if (!ircClient) return { ok: false, error: 'Not connected' };
  if (!target || !text) return { ok: false, error: 'Missing target or text' };
  ircClient.say(target, text);
  return { ok: true };
});

ipcMain.handle('irc:join', async (_event, { channel }) => {
  if (!ircClient) return { ok: false, error: 'Not connected' };
  if (!channel) return { ok: false, error: 'Missing channel' };
  ircClient.join(channel);
  return { ok: true };
});

ipcMain.handle('irc:part', async (_event, { channel }) => {
  if (!ircClient) return { ok: false, error: 'Not connected' };
  if (!channel) return { ok: false, error: 'Missing channel' };
  ircClient.part(channel);
  return { ok: true };
});

ipcMain.handle('irc:disconnect', async () => {
  if (ircClient) {
    try { ircClient.quit('bye'); } catch {}
    ircClient = null;
  }
  return { ok: true };
});
