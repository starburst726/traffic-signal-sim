import '../style.css';
import { createEmptyScenario, type ScenarioConfig } from '@core';
import { renderTabBar, renderTabContent, type TabId } from './layout';
import { triggerScenarioDownload, setupScenarioImport } from './importExport';

interface AppState {
  activeTab: TabId;
  scenario: ScenarioConfig;
  isPlaying: boolean;
  simSpeed: number; // multiplier, e.g., 0.5, 1, 2
  simTimeSeconds: number; // placeholder for now
}

function createInitialState(): AppState {
  return {
    activeTab: 'layout',
    scenario: createEmptyScenario('Default Scenario'),
    isPlaying: false,
    simSpeed: 1,
    simTimeSeconds: 0,
  };
}

/**
 * Very simple filename sanitizer: replace non-alphanumerics with underscores
 * and ensure we always end with .json.
 */
function buildScenarioFilename(scenario: ScenarioConfig): string {
  const baseName = scenario.name.trim() || 'scenario';
  const safeBase = baseName.replace(/[^a-z0-9\-]+/gi, '_');
  return `${safeBase}.json`;
}

function renderControlBar(
  state: AppState,
  setState: (update: Partial<AppState>) => void,
  onExport: () => void,
  onImport: () => void,
): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'app-control-bar';

  const left = document.createElement('div');
  left.className = 'app-control-bar__left';

  const playPauseButton = document.createElement('button');
  playPauseButton.type = 'button';
  playPauseButton.className = 'app-button app-button--primary';
  playPauseButton.textContent = state.isPlaying ? 'Pause' : 'Play';
  playPauseButton.addEventListener('click', () => {
    setState({ isPlaying: !state.isPlaying });
  });

  const speedLabel = document.createElement('label');
  speedLabel.className = 'app-control-bar__label';
  speedLabel.textContent = 'Speed:';

  const speedSelect = document.createElement('select');
  speedSelect.className = 'app-select';

  const speedOptions: Array<{ label: string; value: number }> = [
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
  ];

  for (const opt of speedOptions) {
    const optionEl = document.createElement('option');
    optionEl.value = String(opt.value);
    optionEl.textContent = opt.label;
    if (opt.value === state.simSpeed) {
      optionEl.selected = true;
    }
    speedSelect.appendChild(optionEl);
  }

  speedSelect.addEventListener('change', () => {
    const next = Number(speedSelect.value);
    if (!Number.isNaN(next)) {
      setState({ simSpeed: next });
    }
  });

  left.appendChild(playPauseButton);
  left.appendChild(speedLabel);
  left.appendChild(speedSelect);

  const right = document.createElement('div');
  right.className = 'app-control-bar__right';

  const scenarioName = document.createElement('span');
  scenarioName.className = 'app-control-bar__scenario-name';
  scenarioName.textContent = state.scenario.name;

  const timeDisplay = document.createElement('span');
  timeDisplay.className = 'app-control-bar__time';
  timeDisplay.textContent = `Time: ${state.simTimeSeconds.toFixed(0)} s`;

  const exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.className = 'app-button';
  exportButton.textContent = 'Export JSON';
  exportButton.addEventListener('click', () => {
    onExport();
  });

  const importButton = document.createElement('button');
  importButton.type = 'button';
  importButton.className = 'app-button';
  importButton.textContent = 'Import JSON';
  importButton.addEventListener('click', () => {
    onImport();
  });

  right.appendChild(scenarioName);
  right.appendChild(timeDisplay);
  right.appendChild(exportButton);
  right.appendChild(importButton);

  bar.appendChild(left);
  bar.appendChild(right);

  return bar;
}

function bootstrapApp(): void {
  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) {
    throw new Error('Root element "#app" not found.');
  }

  const state = createInitialState();

  const setState = (update: Partial<AppState>): void => {
    Object.assign(state, update);
    render();
  };

  // Configure the hidden file input for scenario import.
  const importInput = setupScenarioImport((loadedScenario) => {
    setState({
      scenario: loadedScenario,
      activeTab: 'layout',
      simTimeSeconds: 0,
    });
  });

  const handleExport = (): void => {
    const filename = buildScenarioFilename(state.scenario);
    triggerScenarioDownload(state.scenario, filename);
  };

  const handleImport = (): void => {
    // This will open the file chooser; the rest is handled in setupScenarioImport.
    importInput.click();
  };

  const render = (): void => {
    root.innerHTML = '';

    const appShell = document.createElement('div');
    appShell.className = 'app-root';

    const controlBar = renderControlBar(state, setState, handleExport, handleImport);
    const tabBar = renderTabBar(state.activeTab, (nextTab) => {
      if (nextTab !== state.activeTab) {
        setState({ activeTab: nextTab });
      }
    });

    const tabContent = renderTabContent({
      activeTab: state.activeTab,
      scenario: state.scenario,
    });

    appShell.appendChild(controlBar);
    appShell.appendChild(tabBar);
    appShell.appendChild(tabContent);

    root.appendChild(appShell);
  };

  render();
}

bootstrapApp();
