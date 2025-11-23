\# Traffic Signal Sim

Traffic Signal Sim is a browser-based playground for exploring signalized intersections.

The goal is to give users (especially transportation/traffic-minded folks) a way to:

\- Define an intersection layout (lanes, movements, signal groups).

\- Specify traffic demand (vehicles, bikes, pedestrians).

\- Configure signal control.

\- Visualize how it behaves over time.

Phase 0 is focused on foundations only:

\- Vite + TypeScript skeleton app.

\- A DOM-free core data model (`ScenarioConfig`, `LayoutConfig`, `DemandConfig`, etc.).

\- Minimal UI shell with:

&nbsp; - Top control bar (play/pause + speed + time placeholders).

&nbsp; - Tab bar (Layout, Traffic, Signals, Timing/Phasing, Results/Metrics).

&nbsp; - Single SVG viewport with a placeholder intersection graphic.

\- JSON import/export of scenarios.

\- Basic tests + CI + static deployment (e.g., GitHub Pages).

---

\## Tech Stack

\- \*\*Build tool:\*\* Vite

\- \*\*Language:\*\* TypeScript

\- \*\*UI:\*\* Vanilla DOM + SVG (no framework in Phase 0)

\- \*\*Tests:\*\* Vitest (planned for Phase 0)

\- \*\*Hosting:\*\* GitHub Pages or similar static host (planned for Phase 0)

---

\## Getting Started

\### Prerequisites

\- Node.js (recommended: 18+ or 20+)

\- npm (comes with Node)

\### Install

```bash

git clone <repo-url> traffic-signal-sim

cd traffic-signal-sim

npm install



```
