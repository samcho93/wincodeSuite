// main.js — the hub page of the Wincode Lighting Suite.
//  Local  : the launcher (server/index.mjs) answers /api/status — the page shows the servers it runs, can start and stop
//           them, and "Open" goes to the program on this computer.
//  Online : no launcher (a static web host) — "Open" goes to the published version of each program.
import { APPS, GROUPS, FLOW } from './apps.js';

const $ = s => document.querySelector(s);
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) { if (v == null || v === false) continue; if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else if (k === 'class') el.className = v; else if (k in el) el[k] = v; else el.setAttribute(k, v); }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const fill = (el, ...kids) => { el.replaceChildren(...kids.flat(Infinity).filter(k => k != null && k !== false)); return el; };
let toastT; const toast = (text, bad) => { let t = $('.toast'); if (!t) document.body.append(t = h('div', { class: 'toast' })); t.textContent = text; t.className = 'toast show' + (bad ? ' bad' : ''); clearTimeout(toastT); toastT = setTimeout(() => { t.className = 'toast'; }, 3200); };
const uptime = s => (s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.floor(s % 3600 / 60)} min` : s >= 60 ? `${Math.floor(s / 60)} min` : `${s} s`);

let local = false, services = [], openLog = null, logLines = [];
const service = id => services.find(s => s.id === id);
const origin = s => `http://${location.hostname}:${s.port}`;
/** where a link goes now: the local server when it runs, else the published page */
const hrefOf = (app, link) => { const s = service(app.service); return local && s && s.running && link.local ? origin(s) + link.local : link.online || null; };

async function act(id, what) {
  try { const r = await fetch(`api/service/${id}/${what}`, { method: 'POST' }), j = await r.json(); if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`); toast({ start: 'Started', stop: 'Stopped', restart: 'Restarted' }[what]); }
  catch (e) { toast(e.message, true); }
  await refresh();
}
function drawServices() {
  const box = $('#services'); box.hidden = !local; if (!local) return;
  fill(box, h('h2', null, 'Servers on this computer'), services.map(s => {
    const state = !s.installed ? ['bad', `not installed — expected in ${s.dir}`] : s.depsMissing ? ['warn', `run “npm install” in ${s.dir}`] : s.running ? ['ok', s.managed ? `running on port ${s.port} · ${uptime(s.uptime)}` : `running on port ${s.port} · started outside the suite`] : ['', s.lastExit ? `stopped (${s.lastExit.signal || 'exit ' + s.lastExit.code})` : 'stopped'];
    return [h('div', { class: 'svc' }, h('span', { class: 'dot ' + state[0] }), h('div', null, h('div', { class: 'nm' }, s.name), h('div', { class: 'note' }, state[1])), h('div', { class: 'note' }, s.hosts),
      h('div', { class: 'acts' },
        !s.installed ? h('a', { class: 'btn sm', href: s.repo, target: '_blank', rel: 'noopener' }, 'Get it on GitHub')
          : [!s.running && h('button', { class: 'btn sm', onclick: () => act(s.id, 'start'), disabled: s.depsMissing }, '▶ Start'),
            s.managed && h('button', { class: 'btn sm', onclick: () => act(s.id, 'restart') }, '↻ Restart'), s.managed && h('button', { class: 'btn sm warn', onclick: () => act(s.id, 'stop') }, '■ Stop'),
            h('button', { class: 'btn sm ghost', onclick: () => { openLog = openLog === s.id ? null : s.id; refresh(); } }, openLog === s.id ? 'Hide log' : 'Log')])),
      openLog === s.id && h('div', { class: 'svc', style: 'border-top:0;padding-top:0' }, h('span'), h('div', { class: 'log' }, logLines.length ? logLines.join('\n') : 'Nothing yet. A server that was started outside the suite writes its log where it was started.'))];
  }));
  const lg = box.querySelector('.log'); if (lg) lg.scrollTop = lg.scrollHeight;
}
function drawApps() {
  fill($('#groups'), GROUPS.map(g => h('section', { class: `group g-${g.id}` }, h('h2', null, g.name, h('span', null, g.about)),
    h('div', { class: 'cards' }, APPS.filter(a => a.group === g.id).map(a => {
      const s = service(a.service), here = local && s && s.running, url = here ? origin(s) + a.local : a.online, docs = !a.service;   // docs: nothing to run, only a published page
      return h('article', { class: 'card', id: 'app-' + a.id },
        h('div', { class: 'head' }, h('span', { class: 'ic' }, a.icon), h('div', null, h('h3', null, a.name), h('div', { class: 'tag' }, a.tag))),
        h('p', null, a.about), h('ul', null, a.points.map(p => h('li', null, p))),
        h('div', { class: 'acts' }, h('a', { class: 'btn go', href: url, target: 'wincode-' + a.id, title: url }, 'Open ', a.name),
          a.links.map(l => { const href = hrefOf(a, l); return href && h('a', { class: 'btn sm', href, target: 'wincode-doc', title: l.title || `${l.label} — ${a.name}` }, l.label); })),
        h('div', { class: 'where' }, docs ? `Documentation · ${url.replace(/^https:\/\//, '')}` : local ? [h('span', { class: 'dot ' + (here ? 'ok' : 'warn') }), here ? `This computer · ${url.replace(/^http:\/\//, '')}` : `${s ? s.name : 'Its server'} is not running — Open goes to the online version`] : `Online · ${url.replace(/^https:\/\//, '')}`));
    })))));
}
async function refresh() {
  try { const r = await fetch('api/status', { cache: 'no-store' }), j = r.ok ? await r.json() : null; local = !!j && j.app === 'wincode-suite'; services = local ? j.services : []; } catch (e) { local = false; services = []; }
  if (local && openLog) try { logLines = (await (await fetch(`api/service/${openLog}/log`, { cache: 'no-store' })).json()).lines; } catch (e) { logLines = []; }
  const up = services.filter(s => s.running).length, pill = $('#modePill');
  pill.className = 'pill ' + (local ? (up === services.length ? 'on' : 'warn') : ''); pill.textContent = local ? `Local suite · ${up} of ${services.length} servers running` : 'Online · published versions';
  drawServices(); drawApps();
}

fill($('#flow'), FLOW.map(f => h('div', { class: 'flow' }, h('div', { class: 'line' }, f.from, ' → ', f.to, h('span', { class: 'how' }, f.how)), h('p', null, f.about))));
fill($('#foot'), 'Run everything on your own computer: clone the four repositories side by side (', h('code', null, 'wincodeSuite'), ', ', h('code', null, 'wincodeMovingHead'), ', ', h('code', null, 'wincodeDmxStudio'), ', ', h('code', null, 'wincodeNodeManager'),
  ') and run ', h('code', null, 'npm start'), ' in ', h('code', null, 'wincodeSuite'), '. Local programs share one origin, which is what lets DMX Studio drive the 3D stage.');
await refresh();
// keep watching only where a launcher was found: on a static host the status request would fail every time
if (local) setInterval(refresh, 2500);
