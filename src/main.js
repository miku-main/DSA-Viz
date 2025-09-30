/**
 * First:
 * - Keeping it minimal and safe.
 * - Wire up controls as disabled placeholders and ensure basic focus management
 * - Real animation/timeline (Animator + Timeline + Event Recorder) comes later
 * 
 * Second:
 * - Add Animator + Timeline
 * - Render a simple bar chart (SVG) for an array
 * - Use a mocked event list (compare/swap/set) to prove deterministic playback
 * - Enable Play/Step/Reset/Speed controls
 * 
 * Third:
 * - Use a bubble sort to generate the event timeline
 * - Keep the same Animator + Timeline + SVG renderer
 * - Add handlers for new events: markSortedEnd, done
 * 
 * Fourth:
 * - Code Pane with live line-highlighting synced to events
 * - Render a readable Bubble Sort source in the side code pane
 * - On each event (compare/swap/markSortedEnd/done), highlight the relevant line
 * - The code shown is a canonical "teach-mode" bubble sort, not the event-emitting one.
 * - map events -> line numbers via payload.line OR a fallback table
 * - keep highlight changes minimal and accessible
 */

import { Animator } from './core/animator.js';
import { Timeline } from './core/timeline.js';
import { bubbleSort } from './algos/sorting/bubble.js';

// Query a helper to avoid repetition
const $ = (sel) => document.querySelector(sel);

// Cache references to controls
const els = {
  algoSelect: $('#algoSelect'),
  themeToggle: $('#themeToggle'),
  play: $('#play'),
  step: $('#step'),
  reset: $('#reset'),
  speed: $('#speed'),
  randomize: $('#randomize'),
  canvas: $('#canvas'),
  codePane: $('#codePane'),
  ops: $('#ops'),
  cmps: $('#cmps'),
  swps: $('#swps'),
};

// Make controls active
[els.play, els.step, els.reset, els.speed, els.randomize, els.algoSelect].forEach(
  (el) => el && (el.disabled = false)
);

// Announce helper for accessibility (aria-live region on canvas)
function announce(msg) {
  // Create a visually-hidden announcer inside the cancas for screen readers
  const announcer = document.createElement('div');
  announcer.className = 'sr-only';
  announcer.textContent = msg;
  els.canvas.appendChild(announcer);
  // Remove after it has been read
  setTimeout(() => announcer.remove(), 500);
}
// Simple bar renderer state
const state = {
  data: [5, 2, 7, 1, 6, 4, 3], // Initial demo array
  svg: null,
  barEls: [],
  ops: 0,
  cmps: 0,
  swps: 0,
  done: false,
  sortedMarkers: new Set(), // indices confirmed sorted
};

// CODE PANE (Teach-mode Bubble Sort)
// Display-only source (what learners expect)
const bubbleTeachSource = [
  'function bubbleSort(arr) {',                             // 1
  ' const a = arr.slice();',                                // 2
  ' let swapped = true;',                                   // 3
  ' for (let i = 0; i < a.length - 1 && swapped; i++) {',   // 4
  '   swapped = false;',                                    // 5
  '   for (let j = 0; j < a.length - 1 - i; j++) {',        // 6
  '     // compare adjacent elements',                      // 7
  '     if (a[j] > a[j + 1]) {',                            // 8
  '       [a[j], a[j + 1]] = [a[j + 1], a[j]];',            // 9
  '       swapped = true;',                                 // 10
  '     }',                                                 // 11
  '   }',                                                   // 12
  '   // end of pass: last element is now in place',        // 13
  ' }',                                                     // 14
  ' return a;',                                             // 15
  '}',                                                      // 16
];

// Render code lines into #codePane as <div class="code-line" data-line="n">
function renderCodePane(lines) {
  const frag = document.createDocumentFragment();
  lines.forEach((text, idx) => {
    const div = document.createElement('div');
    div.className = 'code-line';
    div.dataset.line = String(idx + 1);
    // Use textContent to avoid any HTML in the code
    div.textContent = text;
    frag.appendChild(div);
  });
  // Replace content
  els.codePane.textContent = ''; // clear
  els.codePane.appendChild(frag);
}

// Keep track of the current highlight to remove it before setting a new one
let currentHL = null;

// Highlight a specific code line (1-based). Scroll into view, centered
function highlightLine(lineNum) {
  if (!lineNum || lineNum < 1) return;
  if (currentHL) currentHL.classList.remove('hl');

  const node = els.codePane.querySelector(`.code-line[data-line="${lineNum}"]`);
  if (!node) return;

  node.classList.add('hl');
  currentHL = node;

  // Scroll roughly to center for context
  const paneRect = els.codePane.getBoundingClientRect();
  const nodeRect = node.getBoundingClientRect();
  const offset = nodeRect.top - paneRect.top - paneRect.height / 2 + nodeRect.height / 2;
  els.codePane.scrollTop += offset;
}

// If events don't carry payload.line, fall back to this mapping
const typeToLineFallback = {
  init: 2,
  compare: 8,
  swap: 9,
  markSortedEnd: 13,
  done: 15,
};

// Create an SVG inside the canvas and draw the bars once
function initSVG() {
  els.canvas.innerHTML = ''; // clear placeholder
  const w = els.canvas.clientWidth || 640;
  const h = Math.max(els.canvas.clientHeight, 320);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', 'Array visualization as bars')
  els.canvas.appendChild(svg);

  state.svg = svg;
  state.barEls = [];

  const n = state.data.length;
  const gap = 6;
  const barW = (w - gap * (n + 1)) / n;
  const maxVal = Math.max(...state.data);
  const scaleY = (val) => (val / maxVal) * (h - 24); // leave top padding

  for (let i = 0; i < n; i++) {
    const val = state.data[i];
    const x = gap + i * (barW + gap);
    const barH = scaleY(val);
    const y = h - barH;

    const rect = document.createElementNS(svg.namespaceURI, 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', String(barW));
    rect.setAttribute('height', String(barH));
    rect.setAttribute('rx', '6');
    rect.setAttribute('class', 'bar');
    rect.dataset.index = String(i);

    svg.appendChild(rect);
    state.barEls.push(rect);

    // Value label (helpful for demo)
    const txt = document.createElementNS(svg.namespaceURI, 'text');
    txt.setAttribute('x', String(x + barW / 2));
    txt.setAttribute('y', String(y - 6));
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('class', 'bar-label');
    txt.textContent = String(val);
    svg.appendChild(txt);
  }
}

// Update two bars' heights after a swap/set
function updateBar(i, newVal) {
  const w = state.svg.viewBox.baseVal.width || els.canvas.clientWidth || 640;
  const h = state.svg.viewBox.baseVal.height || Math.max(els.canvas.clientHeight, 320);
  const n = state.data.length;
  const gap = 6;
  const barW = (w - gap * (n + 1)) / n;
  const maxVal = Math.max(...state.data);
  const scaleY = (val) => (val / maxVal) * (h - 24);

  // update data
  state.data[i] = newVal;

  // update bar shape
  const rect = state.barEls[i];
  const barH = scaleY(newVal);
  const y = h - barH;
  rect.setAttribute('y', String(y));
  rect.setAttribute('height', String(barH));

  // update label (next sibling is the text we appended after rect)
  const txt = rect.nextSibling;
  if (txt && txt.tagName === 'text') {
    txt.setAttribute('y', String(y - 6));
    txt.textContent = String(newVal);
  }
}

// ---- Mocked event list (like bubble sort trace)
// REMOVE LATER OR NOW
// Event types:
// - init: initial array shown (tick 0)
// - compare: highlight two indices being compared
// - swap: swap values at i and j (payload carries the updated array state)
// - clear: clear any highlights
/* function mockEventsFromArray(arr) {
  const a = arr.slice();
  const events = [{ t: 0, type: 'init', payload: { a: a.slice() } }];
  let t = 1;

  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      events.push({ t: t++, type: 'compare', payload: { i: j, j: j + 1} });
      if (a[j] > a[j + 1]) {
        const tmp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = tmp;
        events.push({t: t++, type: 'swap', payload: { i: j, j: j + 1, a: a.slice() } });
      }
      events.push({ t: t++, type: 'clear', payload: {} });
    }
  }
  return events;
}
*/

// Draw function: consume events and update the SVG/metrics
function draw(events) {
  for (const ev of events) {
    // Prefer payload.line; otherwise fallback by type
    const lineHint = ev?.payload?.line ?? typeToLineFallback[ev.type];
    if (lineHint) highlightLine(lineHint);

    switch (ev.type) {
      case 'init': {
        // Set initial data and draw bars
        state.data = ev.payload.a.slice();
        state.done = false;
        state.sortedMarkers.clear();
        initSVG();
        break;
      }
      case 'compare': {
        state.cmps++;
        els.cmps.textContent = String(state.cmps);
        highlightPair(ev.payload.i, ev.payload.j, 'bar-compare');
        break;
      }
      case 'swap': {
        state.swps++;
        els.swps.textContent = String(state.swps);
        const { i, j, a} = ev.payload;
        // Update both bars to new values
        updateBar(i, a[i]);
        updateBar(j, a[j]);
        highlightPair(i, j, 'bar-swap');
        break;
      }
      case 'clear': {
        clearHighlights();
        break;
      }
      case 'markSortedEnd': {
        // Persist a visual marker at the index that bubbled to the end
        state.sortedMarkers.add(ev.payload.index);
        clearHighlights(); // re-applies sorted markers
        break;
      }
      case 'done': {
        state.done = true;
        clearHighlights(); // applies bar-done style to all bars
        announce('Bubble sort complete.');
        break;
      }
      default:
        break;
    }
    // Count all events as "operations" for a simple live metric
    state.ops++;
    els.ops.textContent = String(state.ops);
  }
}

function highlightPair(i, j, cls) {
  clearHighlights();
  state.barEls[i]?.classList.add(cls);
  state.barEls[j]?.classList.add(cls);
}

function clearHighlights() {
  for (const r of state.barEls) {
    r.classList.remove('bar-compare', 'bar-swap', 'bar-done', 'bar-sorted');
  }

  // Re-apply sorted markers after clearning (they persist across steps)
  for (const idx of state.sortedMarkers) {
    state.barEls[idx]?.classList.add('bar-sorted');
  }
  if (state.done) {
    for (const r of state.barEls) r.classList.add('bar-done');
  }
}

// Boot: Build a timeline from a mock trace and attack Animator
let animator;
let timeline;

function buildFromBubbleSort() {
  // Reset live metrics
  state.ops = state.cmps = state.swps = 0;
  els.ops.textContent = els.cmps.textContent = els.swps.textContent = '0';

  const events = bubbleSort(state.data);
  timeline = new Timeline(events);
  animator.setTimeline(timeline);
  // Reset & render tick 0
  animator.reset();
}

function randomizeData() {
  const n = 8 + Math.floor(Math.random() * 8); // 8...15 items
  state.data = Array.from({ length: n}, () => 1 + Math.floor(Math.random() * 20));
  buildFromBubbleSort();
  announce('Randomized dataset');
}

// Initialize once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  // 1) Render the code pane once on load
  renderCodePane(bubbleTeachSource);

  // Prime the highlight at line 2 (copy input) to match 'init'
  highlightLine(2);

  // 2) Boot animator pipeline
  animator = new Animator({ draw });
  initSVG();
  buildFromBubbleSort();
});

// Control wiring
els.play.addEventListener('click', () => {
  if (animator.playing) {
    animator.pause();
    els.play.textContent = 'Play';
  } else {
    animator.play();
    els.play.textContent = 'Pause';
  }
});

els.step.addEventListener('click', () => {
  animator.step();
});


els.reset.addEventListener('click', () => {
  animator.reset();
  clearHighlights();
  highlightLine(2);
  announce('Reset to start.');
});

els.speed.addEventListener('input', (e) => {
  animator.setSpeed(e.target.value);
  announce(`Speed ${e.target.value}x`);
});

els.randomize.addEventListener('click', () => {
  randomizeData();
  els.play.textContent = 'Play'; // ensure label resets
  // Re-sync code pane to init line
  highlightLine(2);
});