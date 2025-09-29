/**
 * Day 1 JS:
 * - Keep it minimal and safe.
 * - We wire up controls as disabled placeholders and ensure basic focus management.
 * - Real animation/timeline (Animator + Timeline + Event Recorder) comes on Day 2+.
 */

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

// For Day 1, everything remains disabled. We still add safe listeners so the UI
// feels “alive” and we can progressively enable features in later days without
// changing markup.

/** Announce helper for accessibility (aria-live region on canvas) */
function announce(msg) {
  // Create a visually-hidden announcer inside the canvas for screen readers
  const announcer = document.createElement('div');
  announcer.className = 'sr-only';
  announcer.textContent = msg;
  els.canvas.appendChild(announcer);
  // Remove after it has been read
  setTimeout(() => announcer.remove(), 500);
}

/** Safe no-op click handler to provide feedback on disabled controls (Day 1 only) */
function disabledHint(e) {
  // If control is disabled, softly communicate what’s coming next
  if (e.currentTarget.disabled) {
    e.preventDefault();
    announce('This control will be enabled in upcoming milestones.');
  }
}

// Attach listeners
[els.play, els.step, els.reset, els.randomize, els.themeToggle].forEach(btn => {
  btn?.addEventListener('click', disabledHint);
});
els.speed?.addEventListener('input', disabledHint);
els.algoSelect?.addEventListener('change', disabledHint);

// Keyboard affordance: press "/" to focus the algorithm select quickly
document.addEventListener('keydown', (e) => {
  if (e.key === '/') {
    e.preventDefault();
    els.algoSelect?.focus();
    announce('Algorithm selector focused.');
  }
});

// Initial welcome message in the code pane so the area isn’t empty.
const welcome = `
/*
  Welcome to AlgoViz!

  Day 1 goals completed:
  - Project structure (HTML/CSS/JS) with accessible, responsive layout
  - Top bar, visualization canvas, side panel, and controls footer
  - Design tokens and consistent styling
  - Keyboard focus management and screen-reader announcements

  Next (Day 2):
  - Implement Animator & Timeline classes
  - Wire Play/Step/Reset and enable the controls
  - Render a mocked event list to prove the loop
*/
`;
els.codePane.textContent = welcome.trim();
