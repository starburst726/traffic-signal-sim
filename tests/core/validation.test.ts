import { describe, it, expect } from 'vitest';
import {
  createEmptyScenario,
  cloneScenario,
  validateScenario,
  CURRENT_SCENARIO_SCHEMA_VERSION,
  type ScenarioConfig,
} from '@core';

describe('validateScenario', () => {
  it('returns true for a freshly created scenario', () => {
    const scenario = createEmptyScenario('Valid Scenario');

    const result = validateScenario(scenario);

    expect(result).toBe(true);
  });

  it('narrows unknown to ScenarioConfig when validation passes', () => {
    const unknownValue: unknown = createEmptyScenario('Narrowing Scenario');

    if (!validateScenario(unknownValue)) {
      throw new Error('Expected validateScenario to pass for a freshly created scenario.');
    }

    // At this point, TypeScript should treat unknownValue as ScenarioConfig.
    const typedScenario: ScenarioConfig = unknownValue;

    expect(typedScenario.name).toBe('Narrowing Scenario');
    expect(typedScenario.version).toBe(CURRENT_SCENARIO_SCHEMA_VERSION);
  });

  it('returns true for a cloned scenario', () => {
    const original = createEmptyScenario('Original');
    const clone = cloneScenario(original);

    expect(validateScenario(clone)).toBe(true);
  });

  it('returns false for non-object values', () => {
    expect(validateScenario(null)).toBe(false);
    expect(validateScenario(42)).toBe(false);
    expect(validateScenario('not a scenario')).toBe(false);
    expect(validateScenario(false)).toBe(false);
  });

  it('returns false when required top-level fields are missing', () => {
    const base = createEmptyScenario('Base');

    const withoutLayout: Partial<ScenarioConfig> = { ...base };
    delete withoutLayout.layout;

    const withoutDemand: Partial<ScenarioConfig> = { ...base };
    delete withoutDemand.demand;

    const withoutController: Partial<ScenarioConfig> = { ...base };
    delete withoutController.controller;

    const withoutId: Partial<ScenarioConfig> = { ...base };
    delete withoutId.id;

    const withoutName: Partial<ScenarioConfig> = { ...base };
    delete withoutName.name;

    const withoutVersion: Partial<ScenarioConfig> = { ...base };
    delete withoutVersion.version;

    expect(validateScenario(withoutLayout)).toBe(false);
    expect(validateScenario(withoutDemand)).toBe(false);
    expect(validateScenario(withoutController)).toBe(false);
    expect(validateScenario(withoutId)).toBe(false);
    expect(validateScenario(withoutName)).toBe(false);
    expect(validateScenario(withoutVersion)).toBe(false);
  });

  it('returns false when id, name, or version have the wrong type', () => {
    const base = createEmptyScenario('Base');

    const badId = { ...base, id: 123 };
    const badName = { ...base, name: 456 };
    const badVersion = { ...base, version: '1' };

    expect(validateScenario(badId)).toBe(false);
    expect(validateScenario(badName)).toBe(false);
    expect(validateScenario(badVersion)).toBe(false);
  });

  it('returns false when version is greater than the current schema version', () => {
    const base = createEmptyScenario('Too New');
    const tooNew = { ...base, version: CURRENT_SCENARIO_SCHEMA_VERSION + 1 };

    expect(validateScenario(tooNew)).toBe(false);
  });

  it('returns false when layout, demand, or controller fail their minimal shape checks', () => {
    const base = createEmptyScenario('Shape Checks');

    // Layout must have legs/lanes/movements/signalGroups arrays.
    const badLayout = { ...base, layout: {} };

    // Demand must have byMovementId as an object and optional numeric scale factor.
    const badDemandByMovement = {
      ...base,
      demand: {
        ...base.demand,
        byMovementId: 123,
      },
    };

    const badDemandScale = {
      ...base,
      demand: {
        ...base.demand,
        globalDemandScaleFactor: 'not-a-number',
      },
    };

    // Controller must have string id and type.
    const badControllerId = {
      ...base,
      controller: {
        ...base.controller,
        id: 123,
      },
    };

    const badControllerType = {
      ...base,
      controller: {
        ...base.controller,
        type: 999,
      },
    };

    expect(validateScenario(badLayout)).toBe(false);
    expect(validateScenario(badDemandByMovement)).toBe(false);
    expect(validateScenario(badDemandScale)).toBe(false);
    expect(validateScenario(badControllerId)).toBe(false);
    expect(validateScenario(badControllerType)).toBe(false);
  });
});
