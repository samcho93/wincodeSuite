# Wincode Lighting Suite

One hub and one launcher for the Wincode lighting programs. Choose a program on the hub page; on your own computer
the suite also runs the servers those programs need.

| Program | What it is for | Project |
|---|---|---|
| **Stage Editor** | Build a 3D stage from a fixture library (Wincode models, Open Fixture Library, GDTF) and watch it follow DMX | [wincodeMovingHead](https://github.com/samcho93/wincodeMovingHead) |
| **Fixture Simulator** | One Wincode moving head in full detail: channels, panel and menu, optics | wincodeMovingHead |
| **DMX Studio** | Lighting console: programmer, palettes, cue lists, effects, playbacks | [wincodeDmxStudio](https://github.com/samcho93/wincodeDmxStudio) |
| **DMX Editor** | Scenes, chasers and EFX on a timeline; the show the Stage Editor plays | wincodeMovingHead |
| **DMX Transmitter** | A bank of channel sliders for quick tests | wincodeMovingHead |
| **Node Manager** | Find, configure, commission and monitor eDMX nodes, pixel nodes, hubs and winches | [wincodeNodeManager](https://github.com/samcho93/wincodeNodeManager) |

## Run

Put the four projects next to each other:

```
wincodeSuite/   wincodeMovingHead/   wincodeDmxStudio/   wincodeNodeManager/
```

Run `npm install` once in `wincodeMovingHead`, then in `wincodeSuite`:

```bash
npm start
```

and open http://127.0.0.1:7700. Node 18 or newer; the suite itself has no dependencies.

| Command | What |
|---|---|
| `npm start` | Hub page + starts every server that is not running yet |
| `npm run hub` | Hub page only; start the servers from the page |

## What the launcher does

- Starts each project's **own** server in its own folder as a child process — nothing is copied into the suite:
  the simulator server on port 7740 (Fixture Simulator, Stage Editor, DMX Editor, Transmitter, and DMX Studio under
  `/studio/`) and the Node Manager server on port 7760 (with its virtual devices).
- Shows for each server whether it is running, since when, and its log; **Start**, **Restart**, **Stop**.
- A server that was started by hand is left alone and shown as "started outside the suite".
- Stopping the suite stops the servers it started.
- A project that is not there is shown as "not installed", with a link to its repository.

Folders elsewhere: create `suite.config.json` next to `package.json`:

```json
{ "services": { "simulator": { "dir": "D:/somewhere/wincodeMovingHead" } } }
```

## The hub page

One card per program — what it is for, an **Open** button, its manuals and tutorials (English and Korean). With the launcher running, *Open* goes to the program on your computer; a program whose server is stopped,
and the page opened without the launcher (a static web host), go to the published version on GitHub Pages.

Run locally, the programs share one origin (`127.0.0.1:7740`), which is what lets DMX Studio drive the 3D stage over
the Virtual DMX cable.

## Add a program

One entry in [`web/js/apps.js`](web/js/apps.js) (card text, addresses, links). If it needs a server of its own, one
entry in `SERVICES` in [`server/index.mjs`](server/index.mjs).
