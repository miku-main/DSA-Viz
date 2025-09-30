# DSA Visual
# Part 1: Project Setup
Welcome to AlgoViz (Name will change later/maybe)

HTML (index.html)
1. Created the basic page structure with a topbar, canvas, side panel, and footer controls

2. Added placeholder buttons and toggles (Play, Step, Reset, Speed, Randomize, Theme toggle)

3. Split CSS into base.css and layout.css
 - base.css = design tokens, colors, spacing, resets
 - layout.css = structural rules (grid, panels, canvas)

4. Controls in footer (themeToggle, randomize)
 - Footer has secondary actions. Randomize button starts disabled until ready.

CSS (base.css)
1. Design tokens with :root variables
 - Define --bg, --text, --accent, --radius, etc.
2. Interactive feedback (hover, focus, disabled)
 - Buttons highlight on hover, depress on active, fade when disabled.
3. Accessibility focus styles
 - Clear focus rings using --focus

CSS (layout.css)
1. Grid for main layout
 - grid-template-columns: 1fr 360px; gives canvas + control panel
2. Sticky header
 - Top bar stays visible when scrolling
3. Canvas box with overflow: hidden
 - Keeps animations bounded
4. Side panel = flex column with gap
 - Organizes form controls vertically
5. Responsive breakpoint at 980px
 - Switch to single-column stack on small screens

JavaScript (main.js)
1. Small $ helper (const $ = (sel) => document.querySelector(sel))
 - Keeps DOM loopups short and readable
2. Element cache (const els = {...})
 - Store all important controls in one object
3. Disabled buttons & safe wiring
 - Play/Step/Reset are disabled until an algorithm and dataset are ready
4. Theme toggle wiring (disabled for now)
 - Switch dark/light by flipping tokens.