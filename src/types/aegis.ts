export type ProjectionMode = 'mercator' | 'azimuthal-eq' | 'azimuthal-south';

export type WorkspaceTab = 'map' | 'scenarios' | 'timeline';

export type RbacRole = 'PUBLIC_BRIEF' | 'PRIVATE_ANALYST';

export type RegimeAlignment =
  | 'LEFT_WING'
  | 'CENTER_LEFT'
  | 'CENTER_RIGHT'
  | 'RIGHT_WING'
  | 'AUTHORITARIAN_STATE'
  | 'THEOCRATIC';

export type StatementCategory =
  | 'ESCALATION_WARNING'
  | 'MILITARY_STRIKE'
  | 'STRATEGIC_DEAL_ECONOMIC'
  | 'PEACE_OVERTURE';

export type VerificationStatus = 'CONFIRMED_GOV_RELEASE' | 'UN_TRANSCRIPT';

export interface LeadershipStatement {
  id: string;
  timestamp_utc: string;
  country_iso3: string;
  leader_name: string;
  official_title: string;
  regime_alignment: RegimeAlignment;
  category: StatementCategory;
  verbatim_quote: string;
  official_source_url: string;
  verification_status: VerificationStatus;
  /** [longitude, latitude] */
  coordinates: [number, number];
  region?: string;
  analyst_note?: string;
}

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'ELEVATED';

export interface KineticIncident {
  id: string;
  title: string;
  theater: string;
  severity: IncidentSeverity;
  timestamp_utc: string;
  /** [longitude, latitude] */
  coordinates: [number, number];
  summary: string;
  verified_source: string;
  range_ring_km?: number;
}

export type CorridorType = 'TRADE_DEAL' | 'CEASEFIRE_MEDIATION' | 'SANCTIONS_ENERGY';

export interface DiplomaticCorridor {
  id: string;
  label: string;
  type: CorridorType;
  from_iso3: string;
  to_iso3: string;
  /** [longitude, latitude] */
  from: [number, number];
  /** [longitude, latitude] */
  to: [number, number];
  status: string;
}

export interface SouthernChokepoint {
  id: string;
  name: string;
  /** [longitude, latitude] */
  coordinates: [number, number];
  strategic_role: string;
}

export interface ProjectedScenario {
  id?: string;
  scenario_title: string;
  probability_index: number;
  time_horizon: string;
  region?: string;
  primary_actors: string[];
  historical_precedent_ref: string;
  internal_domestic_friction: string;
  economic_wealth_stressors: string;
  escalation_or_deescalation_path: string;
  private_clearance_memo?: string;
}

export interface HistoricalMilestone {
  id: string;
  year_label: string;
  start_year: number;
  end_year: number;
  anchor_date: string;
  title: string;
  structural_shift: string;
  precedent_tags: string[];
  key_actors: string[];
  theater_coordinates: [number, number];
  dossier_summary: string;
  lessons_for_2026: string;
}

export interface RegionalThreatHotspot {
  id: string;
  region: string;
  theaterLabel: string;
  /** [longitude, latitude] */
  coordinates: [number, number];
  radiusKm: number;
  historicalConflictCount: number;
  densityScore: number;
  severityTier: IncidentSeverity;
  eraSpan: string;
  linkedMilestones: string[];
  summary: string;
}

export interface MapLayersState {
  kineticIncidents: boolean;
  diplomaticCorridors: boolean;
  rangeRings: boolean;
  leadershipPins: boolean;
  chokepoints: boolean;
  threatDensity: boolean;
}

export interface IntelligenceReportInput {
  title: string;
  generatedAtUtc: string;
  rbacRole: RbacRole;
  projectionMode: ProjectionMode;
  statements: LeadershipStatement[];
  scenarios: ProjectedScenario[];
  hotspots?: RegionalThreatHotspot[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface IntelligenceSweepResponse {
  leadership_statements: LeadershipStatement[];
  projected_scenarios: ProjectedScenario[];
  groundingSources: GroundingSource[];
  sweptAtUtc: string;
  query: string;
}
