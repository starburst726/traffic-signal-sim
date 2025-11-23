/**
 * Core data model types for Traffic Signal Sim.
 *
 * These types are deliberately DOM-free and JSON-friendly:
 * everything here should serialize/deserialize cleanly with JSON.stringify / JSON.parse.
 *
 * Phase 0 scope:
 * - Skeleton structures for legs, lanes, movements, signal groups.
 * - LayoutConfig, DemandConfig, ScenarioConfig.
 * - ControllerConfig as a generic placeholder for future controllers.
 */

/**
 * Basic ID aliases to make intent clearer.
 * Physically they are just strings in JSON.
 */
export type ScenarioId = string;
export type ControllerConfigId = string;
export type LegId = string;
export type LaneId = string;
export type MovementId = string;
export type SignalGroupId = string;

/**
 * Cardinal / inter-cardinal directions for legs and movements.
 * These correspond to typical intersection compass bearings.
 */
export type Direction = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';

/**
 * Primary user class for a lane or movement.
 * Additional classes (e.g., transit) can be added later as needed.
 */
export type UserClass = 'vehicle' | 'bike' | 'ped';

/**
 * High-level category of movement, used for both lanes and movements.
 * This is intentionally coarse; detailed conflict logic will live elsewhere.
 */
export type MovementCategory =
  | 'left'
  | 'through'
  | 'right'
  | 'uTurn'
  | 'pedCrossing'
  | 'bikeThrough';

/**
 * Minimal representation of an "intersection leg" (approach/departure).
 *
 * In Phase 0 this is a skeleton:
 * - It provides a place to attach lanes and movements.
 * - Geometry is handled at the lane level and by the view layer.
 */
export interface Leg {
  /** Unique identifier for the leg within the layout. */
  id: LegId;

  /**
   * General compass direction of the leg.
   * Convention: direction of travel for the *outbound* side of the leg.
   */
  direction: Direction;

  /**
   * Optional human-readable label, e.g. "NB Main St" or "East Leg".
   * This is for UI only and not required for simulation.
   */
  label?: string;
}

/**
 * Minimal geometric properties needed for rendering a lane in SVG.
 *
 * Phase 0 only requires width; additional fields can be added later
 * (e.g., polyline coordinates, centerline offset, length).
 */
export interface LaneGeometry {
  /**
   * Lane width in meters.
   * Defaults can be applied by the view layer if omitted.
   */
  widthMeters: number;

  /**
   * Optional offset from the leg centerline in meters.
   * Sign convention is view-layer dependent; positive values typically
   * represent a shift to the right when looking in the outbound direction.
   */
  offsetFromCenterMeters?: number;
}

/**
 * A single lane on a leg.
 *
 * Lanes are the core geometric unit:
 * - Movements reference lanes they can use.
 * - Signal groups ultimately control movements.
 */
export interface Lane {
  /** Unique identifier for this lane. */
  id: LaneId;

  /** The leg this lane belongs to. */
  legId: LegId;

  /**
   * True if this lane brings traffic *toward* the intersection center
   * (inbound/approach), false if it carries traffic away (outbound/departure).
   */
  isInbound: boolean;

  /**
   * Primary user class intended for this lane (vehicles, bikes, peds).
   * Mixed-use behavior can be modeled later using movements and conflicts.
   */
  userClass: UserClass;

  /**
   * High-level indication of the lane’s primary function
   * (left-turn, through, right-turn, etc.).
   *
   * This is a hint for the UI and for default movement creation.
   * The definitive mapping between lanes and movements is in `movementIds`.
   */
  primaryMovement?: MovementCategory;

  /**
   * IDs of movements that may use this lane.
   * Typically 1–2 movements (e.g., shared left+through) but not enforced here.
   */
  movementIds: MovementId[];

  /**
   * Optional geometric information for drawing this lane.
   * For Phase 0, only width is required when geometry is present.
   */
  geometry?: LaneGeometry;
}

/**
 * A movement is a logical flow (e.g., NBL, EBT, ped crossing on the south leg).
 *
 * Demand is specified per movement, and movements are grouped into signal groups.
 */
export interface Movement {
  /** Unique identifier for the movement (e.g., "NBL", "EBT1"). */
  id: MovementId;

  /** Primary user class served by this movement. */
  userClass: UserClass;

  /**
   * High-level movement category (left/through/right/uTurn/ped crossing/etc.).
   * This helps both the UI and any conflict logic in later phases.
   */
  category: MovementCategory;

  /**
   * Leg from which this movement originates.
   * For pedestrian crossings this is typically the leg whose crosswalk is being crossed.
   */
  fromLegId: LegId;

  /**
   * Optional destination leg.
   * For typical vehicle movements this is the leg the movement ends on;
   * for some ped/bike movements it may be omitted.
   */
  toLegId?: LegId;

  /**
   * IDs of lanes that may serve this movement.
   * This should be consistent with each lane’s `movementIds` but is not enforced here.
   */
  laneIds: LaneId[];

  /**
   * Optional human-readable label or description, e.g. "Northbound Left".
   * The `id` is still the canonical key for demand and configuration.
   */
  label?: string;
}

/**
 * A signal group is the basic control unit for the controller:
 * it aggregates one or more movements that share the same indication.
 */
export interface SignalGroup {
  /** Unique identifier for the signal group. */
  id: SignalGroupId;

  /**
   * Movements controlled by this signal group.
   * Each movement should typically belong to exactly one signal group.
   */
  movementIds: MovementId[];

  /**
   * Optional label used in timing/phase tables (e.g., "SG1", "NBL").
   */
  label?: string;
}

/**
 * Layout configuration describes the static geometry and control structure
 * of a single intersection (but not demand or timing).
 */
export interface LayoutConfig {
  /** Legs (approaches / departures) that define the intersection arms. */
  legs: Leg[];

  /** All lanes across all legs. */
  lanes: Lane[];

  /** Logical movements (NBL, EBT, ped crossings, etc.). */
  movements: Movement[];

  /** Signal groups that will be referenced by controllers. */
  signalGroups: SignalGroup[];

  /**
   * Optional layout-level label (e.g., intersection name or location).
   * The ScenarioConfig has its own name; this is more specific to geometry.
   */
  name?: string;
}

/**
 * Demand values for a single movement.
 * Units are per hour; all fields are optional to allow vehicle-only,
 * ped-only, or bike-only movements.
 */
export interface MovementDemand {
  /** Vehicles per hour for this movement (if applicable). */
  vehiclesPerHour?: number;

  /** Bikes per hour for this movement (if applicable). */
  bikesPerHour?: number;

  /** Pedestrians per hour for this movement (if applicable). */
  pedsPerHour?: number;
}

/**
 * Demand configuration for an intersection, keyed by movement ID.
 *
 * This structure is intentionally simple and JSON-friendly:
 * - Each movement ID maps to a small object of hourly demands.
 * - Scaling or scenario comparisons can operate directly on these numbers.
 */
export interface DemandConfig {
  /**
   * Mapping from movement ID → demand values.
   * Movements not present here are assumed to have zero demand.
   */
  byMovementId: Record<MovementId, MovementDemand>;

  /**
   * Optional overall scaling factor for quick what-if tests
   * (e.g., 0.8 for off-peak, 1.2 for growth scenario).
   * This is a hint; simulation logic can choose how to interpret it.
   */
  globalDemandScaleFactor?: number;
}

/**
 * Generic controller type identifiers.
 *
 * Phase 0 only needs a placeholder; more detailed controller-specific
 * types will be introduced in later phases (e.g., ring-and-barrier).
 */
export type ControllerType =
  | 'ring-barrier'
  | 'stage-based'
  | 'fixed-time'
  | 'flash'
  | 'stop-controlled'
  | 'unsignalized'
  | 'none';

/**
 * Generic controller configuration placeholder.
 *
 * The `params` field is intentionally untyped in Phase 0 to keep
 * the core data model stable while controller details evolve.
 */
export interface ControllerConfig {
  /** Unique identifier for this controller configuration. */
  id: ControllerConfigId;

  /** Type of controller (ring-and-barrier, stage-based, etc.). */
  type: ControllerType;

  /**
   * Optional short label shown in the UI, e.g. "AM Peak Plan".
   */
  name?: string;

  /**
   * Opaque parameter bag for controller-specific settings.
   * Future phases may introduce more strongly-typed sub-interfaces.
   */
  params?: Record<string, unknown>;
}

/**
 * A scenario ties together:
 * - A layout configuration (geometry + movements + signal groups).
 * - A demand configuration (volumes per movement).
 * - A controller configuration (timing/logic, placeholder in Phase 0).
 *
 * The `version` field is used to version the JSON representation
 * for future compatibility.
 */
export interface ScenarioConfig {
  /** Unique scenario identifier. */
  id: ScenarioId;

  /** Human-readable scenario name (e.g., "Existing AM Peak"). */
  name: string;

  /** Optional description or notes about the scenario. */
  description?: string;

  /** Static layout configuration for this scenario. */
  layout: LayoutConfig;

  /** Demand configuration for this scenario. */
  demand: DemandConfig;

  /** Controller configuration (placeholder in Phase 0). */
  controller: ControllerConfig;

  /**
   * Schema/version number of this ScenarioConfig.
   * Used to migrate JSON if the model evolves in future versions.
   */
  version: number;
}
