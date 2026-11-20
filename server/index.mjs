/* =====================================================================
 *  Wincode Lighting Suite — launcher
 *    node server/index.mjs [--port 7700] [--no-start]
 *  One program for the whole suite: it serves the hub page and runs the servers the other programs need.
 *    simulator    ../wincodeMovingHead   → :7740   Simulator, Stage Editor, DMX Editor, Transmitter and DMX Studio (/studio/)
 *    nodemanager  ../wincodeNodeManager  → :7760   Node Manager (with its virtual devices)
 *  Each service is the project's own server, started as a child process in its own folder — nothing is copied here.
 *  A service that is already running (started by hand) is left alone and shown as "running elsewhere".
 *  API (loopback only):  GET /api/status · POST /api/service/<id>/start | stop | restart · GET /api/service/<id>/log
 *  Folders can be changed in suite.config.json: { "services": { "simulator": { "dir": "D:/somewhere/wincodeMovingHead" } } }
 * ===================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), WEB = path.join(HERE, 'web');
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const PORT = +(arg('--port') || process.env.PORT || 7700);
let config = {}; try { config = JSON.parse(fs.readFileSync(path.join(HERE, 'suite.config.json'), 'utf8')); } catch (e) {}

const SERVICES = [
  { id: 'simulator', name: 'Simulator server', dir: '../wincodeMovingHead', entry: 'server/index.js', port: 7740, env: { WMH_PORT: '7740' }, needsInstall: true, repo: 'https://github.com/samcho93/wincodeMovingHead',
    hosts: 'Fixture Simulator, Stage Editor, DMX Editor, DMX Transmitter and DMX Studio; bridges Art-Net and sACN' },
  { id: 'nodemanager', name: 'Node Manager server', dir: '../wincodeNodeManager', entry: 'server/index.mjs', args: ['--port', '7760'], port: 7760, repo: 'https://github.com/samcho93/wincodeNodeManager',
    hosts: 'Node Manager and its virtual devices' },
].map(s => { const dir = path.resolve(HERE, (config.services && config.services[s.id] && config.services[s.id].dir) || s.dir); return { ...s, dir, child: null, log: [], startedAt: 0, lastExit: null }; });
const svc = id => SERVICES.find(s => s.id === id);

/** is something listening on the port? */
const probe = port => new Promise(res => { const c = net.connect({ port, host: '127.0.0.1' }); const done = v => { c.destroy(); res(v); }; c.setTimeout(500); c.on('connect', () => done(true)); c.on('timeout', () => done(false)); c.on('error', () => done(false)); });
const installed = s => fs.existsSync(path.join(s.dir, s.entry));
const depsMissing = s => !!s.needsInstall && !fs.existsSync(path.join(s.dir, 'node_modules'));
const note = (s, line) => { s.log.push(`${new Date().toLocaleTimeString('en-GB')}  ${line.replace(/\x1b\[[0-9;]*m/g, '')}`); if (s.log.length > 300) s.log.shift(); };

async function start(s) {
  if (!installed(s)) throw new Error(`${s.name}: not found in ${s.dir}`);
  if (depsMissing(s)) throw new Error(`${s.name}: run "npm install" in ${s.dir} first`);
  if (s.child) throw new Error(`${s.name} is already running`);
  if (await probe(s.port)) throw new Error(`Port ${s.port} is in use: ${s.name} is already running elsewhere`);
  // each service gets its own port: a PORT variable meant for the suite must not reach it
  const env = { ...process.env, ...(s.env || {}) }; delete env.PORT;
  const child = spawn(process.execPath, [s.entry, ...(s.args || [])], { cwd: s.dir, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  s.child = child; s.startedAt = Date.now(); s.lastExit = null; note(s, `started (pid ${child.pid})`);
  for (const stream of [child.stdout, child.stderr]) { let buf = ''; stream.on('data', d => { buf += d; const lines = buf.split(/\r?\n/); buf = lines.pop(); for (const l of lines) if (l.trim()) note(s, l); }); }
  child.on('exit', (code, sig) => { if (s.child === child) s.child = null; s.lastExit = { code, signal: sig, at: Date.now() }; note(s, `stopped (${sig || 'exit ' + code})`); });
  child.on('error', e => note(s, 'could not start: ' + e.message));
}
function stop(s) {
  if (!s.child) throw new Error(`${s.name} was not started by the suite — stop it where it was started`);
  const child = s.child; child.kill();
  return new Promise(res => { const t = setTimeout(res, 3000); child.once('exit', () => { clearTimeout(t); res(); }); });
}
async function status() {
  return { app: 'wincode-suite', version: 1, services: await Promise.all(SERVICES.map(async s => ({
    id: s.id, name: s.name, port: s.port, hosts: s.hosts, repo: s.repo, dir: s.dir, installed: installed(s), depsMissing: depsMissing(s),
    running: await probe(s.port), managed: !!s.child, pid: s.child ? s.child.pid : null, uptime: s.child ? Math.round((Date.now() - s.startedAt) / 1000) : 0, lastExit: s.lastExit }))) };
}

/* ── http ── */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const LOCAL = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);
/** only this page, on this computer, may start and stop programs */
const trusted = req => LOCAL.has(req.headers.host || '') && (!req.headers.origin || LOCAL.has(req.headers.origin.replace(/^https?:\/\//, '')));

const server = http.createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    if (p === '/api/status') return json(res, 200, await status());
    const m = /^\/api\/service\/([a-z]+)\/(start|stop|restart|log)$/.exec(p);
    if (m) {
      const s = svc(m[1]); if (!s) return json(res, 404, { ok: false, error: 'unknown service' });
      if (m[2] === 'log') return json(res, 200, { lines: s.log });
      if (req.method !== 'POST' || !trusted(req)) return json(res, 403, { ok: false, error: 'not allowed' });
      if (m[2] !== 'start') await stop(s);
      if (m[2] !== 'stop') { await start(s); for (let i = 0; i < 20 && s.child && !(await probe(s.port)); i++) await new Promise(r => setTimeout(r, 150)); }   // answer when it listens
      return json(res, 200, { ok: true });
    }
    if (p.startsWith('/api/')) return json(res, 404, { ok: false, error: 'not found' });
  } catch (e) { return json(res, 400, { ok: false, error: e.message }); }
  const file = path.normalize(path.join(WEB, p === '/' ? 'index.html' : p));
  if (!file.startsWith(WEB)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => { if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); } res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(buf); });
});
server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Wincode Lighting Suite → http://127.0.0.1:${PORT}`);
  if (process.argv.includes('--no-start')) return;
  for (const s of SERVICES) {
    if (!installed(s)) { console.log(`  ${s.name}: not installed (${s.dir})`); continue; }
    if (await probe(s.port)) { console.log(`  ${s.name}: already running on port ${s.port}`); continue; }
    try { await start(s); console.log(`  ${s.name}: started on port ${s.port}`); } catch (e) { console.log(`  ${e.message}`); }
  }
});
// the services belong to the suite: they stop with it
const shutdown = () => { for (const s of SERVICES) if (s.child) try { s.child.kill(); } catch (e) {} process.exit(0); };
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown); process.on('exit', () => { for (const s of SERVICES) if (s.child) try { s.child.kill(); } catch (e) {} });
