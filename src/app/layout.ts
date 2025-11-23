import type { ScenarioConfig } from '@core';
import { createIntersectionSvg } from './view-intersection';

export type TabId = 'layout' | 'traffic' | 'signals' | 'timing' | 'results';

export interface LayoutRenderContext {
  activeTab: TabId;
  scenario: ScenarioConfig;
}

/**
 * Callback invoked when the active tab changes.
 */
export type TabChangeHandler = (nextTab: TabId) => void;

/**
 * Render the tab bar (Layout, Traffic, Signals, Timing/Phasing, Results/Metrics).
 *
 * This function is DOM-only and does not know about application state beyond
 * the currently active tab and a callback to change it.
 */
export function renderTabBar(activeTab: TabId, onTabChange: TabChangeHandler): HTMLElement {
  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'layout', label: 'Layout' },
    { id: 'traffic', label: 'Traffic' },
    { id: 'signals', label: 'Signals' },
    { id: 'timing', label: 'Timing / Phasing' },
    { id: 'results', label: 'Results / Metrics' },
  ];

  const bar = document.createElement('div');
  bar.className = 'app-tab-bar';

  for (const tab of tabs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'app-tab-bar__tab';

    if (tab.id === activeTab) {
      button.classList.add('is-active');
    }

    button.textContent = tab.label;

    button.addEventListener('click', () => {
      if (tab.id !== activeTab) {
        onTabChange(tab.id);
      }
    });

    bar.appendChild(button);
  }

  return bar;
}

/**
 * Render the content for the currently active tab.
 *
 * For Phase 0, all tabs except Layout show placeholders. The Layout tab
 * uses a simple SVG intersection placeholder via createIntersectionSvg.
 */
export function renderTabContent(ctx: LayoutRenderContext): HTMLElement {
  switch (ctx.activeTab) {
    case 'layout':
      return renderLayoutTab(ctx.scenario);
    case 'traffic':
      return renderTrafficTab();
    case 'signals':
      return renderSignalsTab();
    case 'timing':
      return renderTimingTab();
    case 'results':
      return renderResultsTab();
    default: {
      const fallback = document.createElement('div');
      fallback.className = 'tab-panel';
      fallback.textContent = 'Unknown tab.';
      return fallback;
    }
  }
}

function renderLayoutTab(scenario: ScenarioConfig): HTMLElement {
  const container = document.createElement('div');
  container.className = 'tab-panel tab-panel--layout';

  const heading = document.createElement('h2');
  heading.textContent = 'Layout';

  const description = document.createElement('p');
  description.textContent =
    'This tab shows the intersection geometry. In Phase 0, we render a simple placeholder.';

  const viewWrapper = document.createElement('div');
  viewWrapper.className = 'intersection-view-wrapper';

  // Phase 0: simple + intersection SVG from the current scenario
  const svg = createIntersectionSvg(scenario);
  viewWrapper.appendChild(svg);

  container.appendChild(heading);
  container.appendChild(description);
  container.appendChild(viewWrapper);

  return container;
}

function renderTrafficTab(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'tab-panel tab-panel--traffic';

  const heading = document.createElement('h2');
  heading.textContent = 'Traffic';

  const description = document.createElement('p');
  description.textContent =
    'This tab will configure demands per movement (vehicles, bikes, pedestrians). Phase 0 uses a placeholder.';

  container.appendChild(heading);
  container.appendChild(description);

  return container;
}

function renderSignalsTab(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'tab-panel tab-panel--signals';

  const heading = document.createElement('h2');
  heading.textContent = 'Signals';

  const description = document.createElement('p');
  description.textContent =
    'This tab will show signal groups and controller configuration. Phase 0 provides only a placeholder.';

  container.appendChild(heading);
  container.appendChild(description);

  return container;
}

function renderTimingTab(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'tab-panel tab-panel--timing';

  const heading = document.createElement('h2');
  heading.textContent = 'Timing / Phasing';

  const description = document.createElement('p');
  description.textContent =
    'This tab will configure phase timings and sequences. Phase 0 uses a static placeholder.';

  container.appendChild(heading);
  container.appendChild(description);

  return container;
}

function renderResultsTab(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'tab-panel tab-panel--results';

  const heading = document.createElement('h2');
  heading.textContent = 'Results / Metrics';

  const description = document.createElement('p');
  description.textContent =
    'This tab will show performance metrics from the simulation. Phase 0 does not yet run a sim.';

  container.appendChild(heading);
  container.appendChild(description);

  return container;
}
