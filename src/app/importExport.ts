// src/app/importExport.ts

import type { ScenarioConfig } from '@core';
import { exportScenarioJson, importScenarioJson } from '@core';

/**
 * Trigger a browser download of the given ScenarioConfig as a JSON file.
 *
 * Phase 0: simple, one-shot download helper with no UI of its own.
 * Callers are expected to wire this to a button click, etc.
 */
export function triggerScenarioDownload(
  scenario: ScenarioConfig,
  filename = 'scenario.json',
): void {
  const json = exportScenarioJson(scenario);

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Revoke the object URL on the next tick to avoid leaking memory.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

/**
 * Callback invoked when a scenario has been successfully imported.
 */
export type ScenarioLoadHandler = (scenario: ScenarioConfig) => void;

/**
 * Create and configure a hidden file input that can import a ScenarioConfig
 * from a JSON file selected by the user.
 *
 * Phase 0:
 * - Caller is responsible for inserting the input into the DOM (or keeping it
 *   detached and triggering `.click()` from a button).
 * - On success, `onScenarioLoaded` is invoked with a validated ScenarioConfig.
 * - On failure, errors are silently swallowed; callers can extend this later
 *   with better UI feedback if desired.
 */
export function setupScenarioImport(onScenarioLoaded: ScenarioLoadHandler): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.className = 'scenario-import-input';

  input.addEventListener('change', () => {
    const files = input.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : '';
        if (!text) {
          // Empty file; nothing to import.
          return;
        }

        const scenario = importScenarioJson(text);
        onScenarioLoaded(scenario);
      } catch {
        // Phase 0: fail silently. Callers can add UI error reporting later.
      } finally {
        // Allow the same file to be selected again if needed.
        input.value = '';
      }
    });

    reader.addEventListener('error', () => {
      // Phase 0: ignore read errors, but reset the input so the user can retry.
      input.value = '';
    });

    reader.readAsText(file);
  });

  return input;
}
