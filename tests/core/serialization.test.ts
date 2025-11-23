import { describe, it, expect } from 'vitest';
import {
  createEmptyScenario,
  cloneScenario,
  exportScenarioJson,
  importScenarioJson,
  validateScenario,
  type ScenarioConfig,
} from '@core';

describe('scenario JSON serialization', () => {
  it('exports a scenario to a valid JSON string', () => {
    const scenario = createEmptyScenario('Export Test');

    const json = exportScenarioJson(scenario);

    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);

    // Parsed object should be structurally valid as a ScenarioConfig
    expect(validateScenario(parsed)).toBe(true);
  });

  it('round-trips a scenario through JSON export/import', () => {
    const original = createEmptyScenario('Roundtrip Test');

    const json = exportScenarioJson(original);
    const roundTripped = importScenarioJson(json);

    // Still a valid ScenarioConfig
    expect(validateScenario(roundTripped)).toBe(true);

    // Basic fields remain the same
    expect(roundTripped.name).toBe(original.name);
    expect(roundTripped.version).toBe(original.version);

    // Layout basics
    expect(roundTripped.layout.legs.length).toBe(original.layout.legs.length);
    expect(roundTripped.layout.lanes.length).toBe(original.layout.lanes.length);
    expect(roundTripped.layout.movements.length).toBe(original.layout.movements.length);
    expect(roundTripped.layout.signalGroups.length).toBe(original.layout.signalGroups.length);

    // Demand basics
    expect(Object.keys(roundTripped.demand.byMovementId)).toHaveLength(
      Object.keys(original.demand.byMovementId).length,
    );
    expect(roundTripped.demand.globalDemandScaleFactor).toBe(
      original.demand.globalDemandScaleFactor,
    );

    // Controller basics
    expect(roundTripped.controller.type).toBe(original.controller.type);
  });

  it('round-trips a cloned scenario through JSON export/import', () => {
    const base = createEmptyScenario('Base for Clone');
    const cloned = cloneScenario(base, { name: 'Cloned Scenario' });

    const json = exportScenarioJson(cloned);
    const roundTripped = importScenarioJson(json);

    expect(validateScenario(roundTripped)).toBe(true);
    expect(roundTripped.name).toBe('Cloned Scenario');

    // IDs may or may not match depending on future behavior,
    // but they must be non-empty strings.
    expect(typeof roundTripped.id).toBe('string');
    expect(roundTripped.id.length).toBeGreaterThan(0);
  });

  it('throws a descriptive error for invalid JSON input', () => {
    const badJson = 'this is not valid json';

    expect(() => importScenarioJson(badJson)).toThrowError(
      'Invalid JSON: unable to parse scenario configuration.',
    );
  });

  it('throws a descriptive error when the JSON shape is not a valid ScenarioConfig', () => {
    const scenario = createEmptyScenario('Bad Shape Base');

    // Corrupt the scenario by removing a required field
    const invalid: Partial<ScenarioConfig> = {
      ...scenario,
      layout: undefined,
    };

    const json = JSON.stringify(invalid);

    expect(() => importScenarioJson(json)).toThrowError(
      'Invalid scenario: JSON does not match ScenarioConfig schema.',
    );
  });
});
