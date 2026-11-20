# Wincode Lighting Suite

Hub page + launcher for the sister projects in `D:\Work\Web\`: `wincodeMovingHead` (simulator, stage editor, DMX editor), `wincodeDmxStudio` (console), `wincodeNodeManager`. Details: [README.md](README.md).

## Run
- `npm start` → http://127.0.0.1:7700; starts the simulator server (7740, also serves DMX Studio at `/studio/`) and the Node Manager server (7760) as child processes. `npm run hub` = page only.
- Claude preview: `suite` in the simulator's `.claude/launch.json`.

## Layout
- `web/js/apps.js` — the catalogue (cards, groups, the "how they work together" strip). All card text lives here.
- `web/js/main.js` — draws the hub; `local` when `/api/status` answers, otherwise the page links to the published versions.
- `server/index.mjs` — `SERVICES` (folder, entry, port), spawn / stop / probe, logs, the loopback-only API.

## Rules
- The suite owns no program code: it starts the projects' own servers and links to their pages. Do not copy files from the other projects here.
- All user-visible text and code comments are English (links to the Korean manuals keep their Korean labels).
- The API binds 127.0.0.1 and accepts POST only from its own origin (`trusted()`); it can only start the entries of `SERVICES`. Do not add an endpoint that runs anything else.
- Each service gets its port explicitly (`env` / `args` in `SERVICES`) and never inherits the suite's `PORT`.
- When a program gains a manual, a tutorial or a new page, update its entry in `apps.js`.

## Verifying
- `curl http://127.0.0.1:7700/api/status` · the hub's **Log** button shows a service's output.
- Opened as a file or on a static host there is no API: the page must still list every program with its online address.
