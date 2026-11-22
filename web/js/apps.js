// apps.js — the catalogue: every program of the Wincode lighting suite, what it is for and where it lives.
//  The hub page (main.js) draws one card per entry. To add a program, add an entry here — nothing else.
//   service  which local server hosts it (server/index.mjs SERVICES); the card shows that server's state
//   local    path on that server            online   address of the published version
//   links    extra buttons: { label, title, local (path on the service) | online (absolute) }
const PAGES = 'https://samcho93.github.io';
const GH = 'https://github.com/samcho93';

export const GROUPS = [
  { id: 'see', name: 'See the light', about: 'The 3D side: what the fixtures do when they receive DMX.' },
  { id: 'control', name: 'Control the light', about: 'The console side: programs that produce DMX.' },
  { id: 'network', name: 'Run the network', about: 'The network side: the nodes between console and fixtures.' },
  { id: 'hardware', name: 'Build the hardware', about: 'Circuit diagrams and firmware for the real nodes.' },
];

export const APPS = [
  { id: 'stage', group: 'see', icon: '🎭', name: 'Stage Editor', tag: '3D stage · visualiser',
    about: 'Build a stage from a fixture library and watch it follow DMX. Hang fixtures on trusses or stand them on the floor, address them, and see beams, colours, gobos and movement in haze.',
    points: ['615 fixtures: 5 Wincode models, the Open Fixture Library, GDTF import', 'Trusses, multi-select tools, automatic addressing, lamp test', 'Follows DMX Studio and the DMX Editor live; plays its own show'],
    service: 'simulator', local: '/stage.html', online: `${PAGES}/wincodeMovingHead/stage.html`, repo: `${GH}/wincodeMovingHead`,
    links: [{ label: 'Manual', local: '/manual/stage-en.html', online: `${PAGES}/wincodeMovingHead/manual/stage-en.html` }, { label: '한글', title: '사용 설명서 (한국어)', local: '/manual/stage-ko.html', online: `${PAGES}/wincodeMovingHead/manual/stage-ko.html` }] },
  { id: 'builder', group: 'see', icon: '🏗', name: 'Stage Builder', tag: 'truss rig · room',
    about: 'Build the stage itself: the size of the room and its truss structure. The rig it saves is loaded by the Stage Editor and the Fixture Simulator, where the fixtures are hung on it.',
    points: ['Straight trusses in any direction, towers, circles and arcs, in four truss sizes', 'Grid and end snapping, legs under a truss with one click, six ready-made rigs', 'Hand the rig to the Stage Editor and let it place the fixtures automatically'],
    service: 'simulator', local: '/rig.html', online: `${PAGES}/wincodeMovingHead/rig.html`, repo: `${GH}/wincodeMovingHead`,
    links: [{ label: 'Manual', local: '/manual/stage-en.html#builder', online: `${PAGES}/wincodeMovingHead/manual/stage-en.html#builder` }, { label: '한글', title: '사용 설명서 (한국어)', local: '/manual/stage-ko.html#builder', online: `${PAGES}/wincodeMovingHead/manual/stage-ko.html#builder` }] },
  { id: 'simulator', group: 'see', icon: '🔦', name: 'Fixture Simulator', tag: 'one fixture · digital twin',
    about: 'One Wincode moving head in full detail: its real channel chart, its front panel and menu, reset sequence, optics and beam. The place to learn a fixture before it is on the truss.',
    points: ['250W BSW · 500W Frame · ApexPointe 420 · Mega480 · AquaVortex TB5', 'Working LCD panel and menu, built-in programs, RDM', 'DMX in from the virtual cable, Art-Net, sACN or a serial adapter'],
    service: 'simulator', local: '/', online: `${PAGES}/wincodeMovingHead/`, repo: `${GH}/wincodeMovingHead`, links: [] },
  { id: 'studio', group: 'control', icon: '🎚', name: 'DMX Studio', tag: 'lighting console',
    about: 'A lighting console in the browser, working the way professional desks do: select fixtures, set values in the programmer, store groups, palettes and cues, add effects, play back from faders.',
    points: ['Programmer, palettes, cue lists with tracking, effects, playbacks, command line', 'Up to 64 universes; Virtual DMX cable, Art-Net, sACN, DMX USB Pro', 'Same fixture library as the Stage Editor — one click hands the patch to the 3D stage'],
    service: 'simulator', local: '/studio/', online: `${PAGES}/wincodeDmxStudio/`, repo: `${GH}/wincodeDmxStudio`,
    links: [{ label: 'Manual', local: '/studio/manual/en.html', online: `${PAGES}/wincodeDmxStudio/manual/en.html` }, { label: '한글', title: '사용 설명서 (한국어)', local: '/studio/manual/ko.html', online: `${PAGES}/wincodeDmxStudio/manual/ko.html` },
      { label: 'Tutorials', local: '/studio/manual/tutorial-en.html', online: `${PAGES}/wincodeDmxStudio/manual/tutorial-en.html` }, { label: '튜토리얼', title: '튜토리얼 (한국어)', local: '/studio/manual/tutorial-ko.html', online: `${PAGES}/wincodeDmxStudio/manual/tutorial-ko.html` }] },
  { id: 'editor', group: 'control', icon: '🎛', name: 'DMX Editor', tag: 'show programming · timeline',
    about: 'The editor built into the simulator, in the style of QLC+: scenes, chasers, EFX and audio arranged on a timeline into a show. The Stage Editor plays what is made here.',
    points: ['Fixtures → Functions → Shows → Virtual Console → Simple Desk', 'Shows against an audio track', 'Opened from the Stage Editor with “Edit show”'],
    service: 'simulator', local: '/editor.html', online: `${PAGES}/wincodeMovingHead/editor.html`, repo: `${GH}/wincodeMovingHead`, links: [] },
  { id: 'transmitter', group: 'control', icon: '🎚️', name: 'DMX Transmitter', tag: 'channel sliders · test tool',
    about: 'A plain bank of channel sliders that sends DMX to the simulator. The quickest way to move one channel and see what it does.',
    points: ['One slider per channel of the chosen fixture and mode', 'Sends over the virtual DMX cable'],
    service: 'simulator', local: '/console.html', online: `${PAGES}/wincodeMovingHead/console.html`, repo: `${GH}/wincodeMovingHead`, links: [] },
  { id: 'nodes', group: 'network', icon: '🖧', name: 'Node Manager', tag: 'configuration · commissioning · monitoring',
    about: 'Finds the Wincode nodes on a lighting network, configures them, sets up a whole rig in a few steps and shows what every node is doing: eDMX nodes, pixel nodes, hubs and kinetic winches.',
    points: ['Discovery, per-device configuration, universe map, alarms, event log', 'Commissioning tools: number universes, copy settings, backup and restore', 'Virtual devices with a Simulator: winches move, pixels light, eDMX ports merge real DMX'],
    service: 'nodemanager', local: '/', online: `${PAGES}/wincodeNodeManager/`, repo: `${GH}/wincodeNodeManager`,
    links: [{ label: 'Manual', local: '/manual/en.html', online: `${PAGES}/wincodeNodeManager/manual/en.html` }, { label: '한글', title: '사용 설명서 (한국어)', local: '/manual/ko.html', online: `${PAGES}/wincodeNodeManager/manual/ko.html` },
      { label: 'Tutorials', local: '/manual/tutorial-en.html', online: `${PAGES}/wincodeNodeManager/manual/tutorial-en.html` }, { label: '튜토리얼', title: '튜토리얼 (한국어)', local: '/manual/tutorial-ko.html', online: `${PAGES}/wincodeNodeManager/manual/tutorial-ko.html` },
      { label: 'Device API', title: 'Firmware specification for the nodes', online: `${GH}/wincodeNodeManager/blob/main/docs/DEVICE-API.md` }] },
];

/** how the programs work together — drawn as a strip under the cards */
// a card without `service` has no local server: it always opens its published page
APPS.push({ id: 'hardware', group: 'hardware', icon: '🔌', name: 'Node Hardware', tag: 'circuit diagrams · ESP32 firmware',
  about: 'The real nodes behind the Node Manager: block diagrams with pins and parts for the core board, the kinetic winch, the pixel node and the eDMX node, and the ESP32 firmware that implements the device API.',
  points: ['Core board: ESP32, Ethernet (LAN8720), 24 V power, USB-C programming', 'WN-WINCH: stepper with brake, limits, E-stop · WN-PIX4: four pixel outputs · WN-DMX2: two DMX512 ports', 'ESP-IDF firmware: discovery, HTTP API, Art-Net / sACN, the same behaviour as the simulator'],
  online: `${PAGES}/wincodeNodeHardware/`, repo: `${GH}/wincodeNodeHardware`,
  links: [{ label: 'Winch', title: 'The winch section', online: `${PAGES}/wincodeNodeHardware/#winch` }, { label: 'Pixel node', title: 'The pixel node section', online: `${PAGES}/wincodeNodeHardware/#pixel` }, { label: 'eDMX', title: 'The eDMX node section', online: `${PAGES}/wincodeNodeHardware/#edmx` }, { label: 'Firmware', title: 'Firmware and how to build it', online: `${PAGES}/wincodeNodeHardware/#firmware` }] });

export const FLOW = [
  { from: 'DMX Studio', to: 'Stage Editor', how: 'Virtual DMX cable', about: 'Patch in the studio, press 3D Stage: the stage shows the same fixtures and follows every cue.' },
  { from: 'Stage Editor', to: 'DMX Editor', how: 'Edit show / From editor', about: 'Build a stage, program its show on the timeline, bring it back and play it.' },
  { from: 'DMX Studio', to: 'Real fixtures', how: 'Art-Net · sACN · DMX USB Pro', about: 'The same show goes out to a real rig through the bridge or a USB interface.' },
  { from: 'Node Manager', to: 'Network nodes', how: 'Discovery + device API', about: 'The nodes that carry that DMX are found, configured and watched from one page.' },
];
