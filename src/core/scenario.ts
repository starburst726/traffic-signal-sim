import type {
  ScenarioConfig,
  ScenarioId,
  LayoutConfig,
  DemandConfig,
  ControllerConfig,
  Leg,
} from './model';

/**
 * Current JSON schema version for ScenarioConfig.
 * Increment this if the structure changes in a backward-incompatible way.
 */
export const CURRENT_SCENARIO_SCHEMA_VERSION = 1;

/**
 * Generate a reasonably unique, human-readable ID with a prefix.
 * This is JSON-friendly and stable enough for client-side usage.
 */
function generateId(prefix: string): string {
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timePart}_${randomPart}`;
}

/**
 * Internal helper to create a simple default 4-leg layout skeleton
 * (N, E, S, W) with no lanes or movements yet.
 *
 * This keeps the core layout non-empty while still Phase-0 minimal.
 */
function createDefaultLayoutConfig(): LayoutConfig {
  const legs: Leg[] = [
    { id: 'leg_N', direction: 'N', label: 'North Leg' },
    { id: 'leg_E', direction: 'E', label: 'East Leg' },
    { id: 'leg_S', direction: 'S', label: 'South Leg' },
    { id: 'leg_W', direction: 'W', label: 'West Leg' },
  ];

  return {
    name: 'Default 4-leg cross',
    legs,
    lanes: [],
    movements: [],
    signalGroups: [],
  };
}

/**
 * Create an empty demand configuration.
 * No movements are present yet, so the mapping is empty.
 */
function createEmptyDemandConfig(): DemandConfig {
  return {
    byMovementId: {},
    globalDemandScaleFactor: 1.0,
  };
}

/**
 * Create a placeholder controller configuration.
 *
 * Phase 0 doesn’t implement controller logic yet, but we
 * keep this object around so the scenario is structurally complete.
 */
function createDefaultControllerConfig(): ControllerConfig {
  return {
    id: generateId('controller'),
    type: 'ring-barrier', // aligns with future ring-and-barrier controller work
    name: 'Default controller (placeholder)',
    params: {},
  };
}

/**
 * Create a brand-new, structurally valid ScenarioConfig with:
 * - Default 4-leg layout (no lanes/movements yet).
 * - Empty demand configuration.
 * - Placeholder controller configuration.
 */
export function createEmptyScenario(name: string): ScenarioConfig {
  const layout = createDefaultLayoutConfig();
  const demand = createEmptyDemandConfig();
  const controller = createDefaultControllerConfig();

  const scenarioId: ScenarioId = generateId('scenario');

  return {
    id: scenarioId,
    name,
    description: undefined,
    layout,
    demand,
    controller,
    version: CURRENT_SCENARIO_SCHEMA_VERSION,
  };
}

/**
 * Deep clone a ScenarioConfig.
 *
 * By default, this creates a new scenario ID and adjusts the name
 * to indicate it is a copy. Callers can override ID/name via `overrides`.
 */
export function cloneScenario(
  base: ScenarioConfig,
  overrides?: { id?: ScenarioId; name?: string },
): ScenarioConfig {
  // JSON-based deep clone is sufficient for our plain-data model.
  const clone: ScenarioConfig = JSON.parse(JSON.stringify(base)) as ScenarioConfig;

  clone.id = overrides?.id ?? generateId('scenario');

  if (overrides?.name) {
    clone.name = overrides.name;
  } else {
    clone.name = `${base.name} (copy)`;
  }

  // Keep the version as-is; callers can bump it if a migration occurs.
  return clone;
}

/**
 * Runtime helper: narrow a value to a non-null object (record) type.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Minimal shape validation for LayoutConfig.
 * This does NOT check every nested field, just enough to ensure
 * basic structural integrity for import/export.
 */
function isLayoutConfig(value: unknown): value is LayoutConfig {
  if (!isRecord(value)) return false;

  const { legs, lanes, movements, signalGroups } = value;

  if (!Array.isArray(legs) || !Array.isArray(lanes) || !Array.isArray(movements)) return false;
  if (!Array.isArray(signalGroups)) return false;

  return true;
}

/**
 * Minimal shape validation for DemandConfig.
 */
function isDemandConfig(value: unknown): value is DemandConfig {
  if (!isRecord(value)) return false;

  const { byMovementId, globalDemandScaleFactor } = value;

  if (!isRecord(byMovementId)) return false;
  if (globalDemandScaleFactor !== undefined && typeof globalDemandScaleFactor !== 'number') {
    return false;
  }

  return true;
}

/**
 * Minimal shape validation for ControllerConfig.
 */
function isControllerConfig(value: unknown): value is ControllerConfig {
  if (!isRecord(value)) return false;

  const { id, type } = value;

  if (typeof id !== 'string') return false;
  if (typeof type !== 'string') return false;

  // `name` and `params` are optional and left intentionally loose for Phase 0
  return true;
}

/**
 * Type guard: check whether an unknown value appears to be a ScenarioConfig.
 *
 * This is intentionally conservative but not exhaustive:
 * it checks key fields and nested configs without validating every property.
 */
export function validateScenario(value: unknown): value is ScenarioConfig {
  if (!isRecord(value)) return false;

  const { id, name, layout, demand, controller, version } = value;

  if (typeof id !== 'string') return false;
  if (typeof name !== 'string') return false;
  if (typeof version !== 'number') return false;

  if (!isLayoutConfig(layout)) return false;
  if (!isDemandConfig(demand)) return false;
  if (!isControllerConfig(controller)) return false;

  // Reject clearly unsupported future versions; older/equal versions are allowed.
  if (version > CURRENT_SCENARIO_SCHEMA_VERSION) return false;

  return true;
}

/**
 * Export a ScenarioConfig to a pretty-printed JSON string.
 * This is suitable for saving to disk or downloading in the browser.
 */
export function exportScenarioJson(scenario: ScenarioConfig): string {
  return JSON.stringify(scenario, null, 2);
}

/**
 * Parse and validate a ScenarioConfig from JSON.
 *
 * Throws a descriptive error if:
 * - The JSON is invalid, or
 * - The parsed object does not conform to the expected ScenarioConfig shape.
 */
export function importScenarioJson(json: string): ScenarioConfig {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON: unable to parse scenario configuration.');
  }

  if (!validateScenario(parsed)) {
    throw new Error('Invalid scenario: JSON does not match ScenarioConfig schema.');
  }

  const scenario = parsed as ScenarioConfig;

  // Optional future hook: normalize/migrate scenario here if needed.
  return scenario;
}
