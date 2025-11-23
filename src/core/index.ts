/**
 * Core module public API for Traffic Signal Sim.
 *
 * This file re-exports:
 * - Core data model types (ScenarioConfig, LayoutConfig, DemandConfig, etc.).
 * - Scenario helpers (createEmptyScenario, cloneScenario, import/export, validation).
 *
 * The rest of the app should import from '@core' rather than reaching into
 * individual files inside src/core.
 */

/**
 * Type-only exports from the core data model.
 *
 * These are erased at compile time and exist purely for typing / IntelliSense.
 */
export type {
  ScenarioId,
  ControllerConfigId,
  LegId,
  LaneId,
  MovementId,
  SignalGroupId,
  Direction,
  UserClass,
  MovementCategory,
  Leg,
  LaneGeometry,
  Lane,
  Movement,
  SignalGroup,
  LayoutConfig,
  MovementDemand,
  DemandConfig,
  ControllerType,
  ControllerConfig,
  ScenarioConfig,
} from './model';

/**
 * Scenario-level helpers and schema version.
 *
 * These are the runtime functions other modules should use to:
 * - Create new scenarios.
 * - Clone existing scenarios.
 * - Validate / import / export scenario JSON.
 */
export {
  CURRENT_SCENARIO_SCHEMA_VERSION,
  createEmptyScenario,
  cloneScenario,
  validateScenario,
  exportScenarioJson,
  importScenarioJson,
} from './scenario';
