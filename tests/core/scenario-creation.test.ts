import { describe, it, expect } from 'vitest';
import { createEmptyScenario, CURRENT_SCENARIO_SCHEMA_VERSION, type ScenarioConfig } from '@core';

describe('createEmptyScenario', () => {
  it('creates a scenario with the requested name', () => {
    const name = 'Test Scenario';
    const scenario = createEmptyScenario(name);

    expect(scenario.name).toBe(name);
  });

  it('generates a non-empty scenario id', () => {
    const scenario = createEmptyScenario('Has Id');

    expect(typeof scenario.id).toBe('string');
    expect(scenario.id.length).toBeGreaterThan(0);
  });

  it('sets the version to CURRENT_SCENARIO_SCHEMA_VERSION', () => {
    const scenario = createEmptyScenario('Version Check');

    expect(scenario.version).toBe(CURRENT_SCENARIO_SCHEMA_VERSION);
  });

  it('returns a ScenarioConfig-compatible object (compile-time check)', () => {
    const scenario = createEmptyScenario('Type Check');

    // This assignment will fail at compile time if the shape is wrong.
    const typedScenario: ScenarioConfig = scenario;

    expect(typedScenario).toBe(scenario);
  });

  it('creates a default 4-leg layout with no lanes/movements/signal groups', () => {
    const scenario = createEmptyScenario('Layout Check');
    const { layout } = scenario;

    // 4 legs: N, E, S, W (order not strictly enforced here)
    expect(Array.isArray(layout.legs)).toBe(true);
    expect(layout.legs.length).toBe(4);

    const directions = layout.legs.map((leg) => leg.direction).sort();
    const expectedDirections = ['E', 'N', 'S', 'W'].sort();

    expect(directions).toEqual(expectedDirections);

    // No lanes/movements/signalGroups yet in Phase 0
    expect(Array.isArray(layout.lanes)).toBe(true);
    expect(layout.lanes.length).toBe(0);

    expect(Array.isArray(layout.movements)).toBe(true);
    expect(layout.movements.length).toBe(0);

    expect(Array.isArray(layout.signalGroups)).toBe(true);
    expect(layout.signalGroups.length).toBe(0);
  });

  it('initializes an empty demand configuration', () => {
    const scenario = createEmptyScenario('Demand Check');
    const { demand } = scenario;

    // No movement demands yet
    expect(demand.byMovementId).toBeDefined();
    expect(typeof demand.byMovementId).toBe('object');
    expect(Object.keys(demand.byMovementId)).toHaveLength(0);

    // Default global scale factor is 1.0 in Phase 0
    expect(demand.globalDemandScaleFactor).toBe(1.0);
  });

  it('creates a placeholder controller configuration', () => {
    const scenario = createEmptyScenario('Controller Check');
    const { controller } = scenario;

    expect(typeof controller.id).toBe('string');
    expect(controller.id.length).toBeGreaterThan(0);

    // Phase 0 default is a ring-barrier placeholder
    expect(controller.type).toBe('ring-barrier');

    // params is optional but should exist as an object in the default
    expect(controller.params).toBeDefined();
    expect(typeof controller.params).toBe('object');
  });
});
