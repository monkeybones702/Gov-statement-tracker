import type {
  HistoricalMilestone,
  KineticIncident,
  LeadershipStatement,
  ProjectedScenario,
  RbacRole,
  RegimeAlignment,
  RegionalThreatHotspot,
  StatementCategory,
  VerificationStatus,
} from '../types/aegis';

export interface StatementFilterOptions {
  category: StatementCategory | 'ALL';
  regime: RegimeAlignment | 'ALL';
  searchQuery: string;
}

export function filterStatements(
  statements: LeadershipStatement[],
  filters: StatementFilterOptions
): LeadershipStatement[] {
  const q = filters.searchQuery.trim().toLowerCase();
  return statements.filter((s) => {
    if (filters.category !== 'ALL' && s.category !== filters.category) {
      return false;
    }
    if (filters.regime !== 'ALL' && s.regime_alignment !== filters.regime) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      s.country_iso3,
      s.leader_name,
      s.official_title,
      s.verbatim_quote,
      s.official_source_url,
      s.region ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export interface ScenarioFilterOptions {
  region: string;
  horizon: string;
  stressFocus: string;
  role: RbacRole;
}

export function filterScenarios(
  scenarios: ProjectedScenario[],
  filters: ScenarioFilterOptions
): ProjectedScenario[] {
  const regionFilter = filters.region.trim().toLowerCase();
  const horizonFilter = filters.horizon.trim().toLowerCase();
  const stressFilter = filters.stressFocus.trim().toLowerCase();

  return scenarios
    .filter((sc) => {
      if (regionFilter && regionFilter !== 'all') {
        const regionMatch =
          (sc.region ?? '').toLowerCase().includes(regionFilter) ||
          sc.scenario_title.toLowerCase().includes(regionFilter) ||
          sc.primary_actors.some((a) => a.toLowerCase().includes(regionFilter));
        if (!regionMatch) return false;
      }

      if (horizonFilter && horizonFilter !== 'all') {
        if (!sc.time_horizon.toLowerCase().includes(horizonFilter)) {
          return false;
        }
      }

      if (stressFilter && stressFilter !== 'all') {
        if (stressFilter === 'historical' && !sc.historical_precedent_ref) return false;
        if (stressFilter === 'domestic' && !sc.internal_domestic_friction) return false;
        if (stressFilter === 'wealth' && !sc.economic_wealth_stressors) return false;
        if (stressFilter === 'diplomatic' && !sc.escalation_or_deescalation_path) return false;
      }

      return true;
    })
    .map((sc) =>
      filters.role === 'PUBLIC_BRIEF'
        ? { ...sc, private_clearance_memo: undefined }
        : sc
    );
}

/**
 * Great-circle geodesic distance in kilometers using the Haversine formula.
 * Coordinates are [longitude, latitude] in degrees.
 */
export function haversineDistanceKm(
  a: [number, number],
  b: [number, number]
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Computes spherical linear interpolation points along a great-circle arc.
 * Returns [longitude, latitude] pairs suitable for D3 GeoJSON LineString or Google Maps Polyline.
 */
export function computeGreatCircleArc(
  from: [number, number],
  to: [number, number],
  steps = 36
): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const lon1 = toRad(from[0]);
  const lat1 = toRad(from[1]);
  const lon2 = toRad(to[0]);
  const lat2 = toRad(to[1]);

  const x1 = Math.cos(lat1) * Math.cos(lon1);
  const y1 = Math.cos(lat1) * Math.sin(lon1);
  const z1 = Math.sin(lat1);

  const x2 = Math.cos(lat2) * Math.cos(lon2);
  const y2 = Math.cos(lat2) * Math.sin(lon2);
  const z2 = Math.sin(lat2);

  const dot = Math.max(-1, Math.min(1, x1 * x2 + y1 * y2 + z1 * z2));
  const omega = Math.acos(dot);

  if (omega < 1e-6) {
    return [from, to];
  }

  const sinOmega = Math.sin(omega);
  const points: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const k1 = Math.sin((1 - t) * omega) / sinOmega;
    const k2 = Math.sin(t * omega) / sinOmega;
    const x = k1 * x1 + k2 * x2;
    const y = k1 * y1 + k2 * y2;
    const z = k1 * z1 + k2 * z2;

    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);
    points.push([toDeg(lon), toDeg(lat)]);
  }

  return points;
}

const OFFICIAL_DOMAIN_PATTERNS = [
  /\.gov$/i,
  /\.mil$/i,
  /\.gov\.[a-z]{2}$/i,
  /\.gob\.[a-z]{2}$/i,
  /\.gouv\.[a-z]{2}$/i,
  /\.europa\.eu$/i,
  /(^|\.)un\.org$/i,
  /(^|\.)nato\.int$/i,
  /(^|\.)iaea\.org$/i,
  /(^|\.)mofa\.go\.jp$/i,
  /(^|\.)fmprc\.gov\.cn$/i,
  /(^|\.)mid\.ru$/i,
  /(^|\.)government\.ru$/i,
  /(^|\.)kremlin\.ru$/i,
  /(^|\.)diplomatie\.gouv\.fr$/i,
  /(^|\.)auswaertiges-amt\.de$/i,
  /(^|\.)bundesregierung\.de$/i,
  /(^|\.)esteri\.it$/i,
  /(^|\.)president\.gov\.ua$/i,
  /(^|\.)mfa\.gov\.ua$/i,
  /(^|\.)pmo\.gov\.in$/i,
  /(^|\.)mea\.gov\.in$/i,
  /(^|\.)gov\.uk$/i,
  /(^|\.)gov\.il$/i,
  /(^|\.)mfa\.ir$/i,
];

export function isOfficialGovDomain(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    return OFFICIAL_DOMAIN_PATTERNS.some((pattern) => pattern.test(host));
  } catch {
    return false;
  }
}

const VALID_CATEGORIES = new Set<StatementCategory>([
  'ESCALATION_WARNING',
  'MILITARY_STRIKE',
  'STRATEGIC_DEAL_ECONOMIC',
  'PEACE_OVERTURE',
]);

const VALID_REGIMES = new Set<RegimeAlignment>([
  'LEFT_WING',
  'CENTER_LEFT',
  'CENTER_RIGHT',
  'RIGHT_WING',
  'AUTHORITARIAN_STATE',
  'THEOCRATIC',
]);

const VALID_VERIFICATIONS = new Set<VerificationStatus>([
  'CONFIRMED_GOV_RELEASE',
  'UN_TRANSCRIPT',
]);

export function normalizeSweepPayload(raw: unknown): {
  leadership_statements: LeadershipStatement[];
  projected_scenarios: ProjectedScenario[];
} {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const rawStatements = Array.isArray(input.leadership_statements)
    ? input.leadership_statements
    : [];
  const rawScenarios = Array.isArray(input.projected_scenarios)
    ? input.projected_scenarios
    : [];

  const leadership_statements: LeadershipStatement[] = rawStatements
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item, idx) => {
      const category = VALID_CATEGORIES.has(item.category as StatementCategory)
        ? (item.category as StatementCategory)
        : 'ESCALATION_WARNING';
      const regime = VALID_REGIMES.has(item.regime_alignment as RegimeAlignment)
        ? (item.regime_alignment as RegimeAlignment)
        : 'CENTER_RIGHT';
      const verification = VALID_VERIFICATIONS.has(
        item.verification_status as VerificationStatus
      )
        ? (item.verification_status as VerificationStatus)
        : 'CONFIRMED_GOV_RELEASE';

      const coords = Array.isArray(item.coordinates) && item.coordinates.length === 2
        ? [
            Math.max(-180, Math.min(180, Number(item.coordinates[0]) || 0)),
            Math.max(-90, Math.min(90, Number(item.coordinates[1]) || 0)),
          ] as [number, number]
        : ([0, 20] as [number, number]);

      return {
        id: String(item.id || `live-stmt-${Date.now()}-${idx}`),
        timestamp_utc: String(item.timestamp_utc || new Date().toISOString()),
        country_iso3: String(item.country_iso3 || 'INT').slice(0, 3).toUpperCase(),
        leader_name: String(item.leader_name || 'Official Spokesperson'),
        official_title: String(item.official_title || 'Ministry of Foreign Affairs'),
        regime_alignment: regime,
        category,
        verbatim_quote: String(item.verbatim_quote || '').trim(),
        official_source_url: String(item.official_source_url || 'https://www.un.org'),
        verification_status: verification,
        coordinates: coords,
      };
    })
    .filter((s) => s.verbatim_quote.length > 0);

  const projected_scenarios: ProjectedScenario[] = rawScenarios
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item, idx) => {
      const probNum = Number(item.probability_index);
      const probability_index = Number.isFinite(probNum)
        ? Math.max(0, Math.min(100, probNum <= 1 ? Math.round(probNum * 100) : Math.round(probNum)))
        : 50;

      return {
        id: `live-scen-${Date.now()}-${idx}`,
        scenario_title: String(item.scenario_title || 'Regional Strategic Contingency'),
        probability_index,
        time_horizon: String(item.time_horizon || '90-Day'),
        primary_actors: Array.isArray(item.primary_actors)
          ? item.primary_actors.map((a) => String(a))
          : [],
        historical_precedent_ref: String(item.historical_precedent_ref || ''),
        internal_domestic_friction: String(item.internal_domestic_friction || ''),
        economic_wealth_stressors: String(item.economic_wealth_stressors || ''),
        escalation_or_deescalation_path: String(item.escalation_or_deescalation_path || ''),
      };
    });

  return { leadership_statements, projected_scenarios };
}

export function findMatchingMilestones(
  textOrActors: string,
  milestones: HistoricalMilestone[]
): HistoricalMilestone[] {
  const tokens = textOrActors
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4);

  if (tokens.length === 0) return [];

  return milestones
    .map((m) => {
      const hay = [
        m.title,
        m.structural_shift,
        m.dossier_summary,
        ...m.precedent_tags,
        ...m.key_actors,
      ]
        .join(' ')
        .toLowerCase();
      const score = tokens.reduce((acc, tok) => (hay.includes(tok) ? acc + 1 : acc), 0);
      return { milestone: m, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.milestone);
}

interface RegionBasinSeed {
  id: string;
  region: string;
  theaterLabel: string;
  coordinates: [number, number];
  radiusKm: number;
  matchRadiusKm: number;
  tagKeywords: string[];
  summary: string;
}

const THREAT_DENSITY_BASINS: RegionBasinSeed[] = [
  {
    id: 'hotspot-middle-east',
    region: 'Middle East & Red Sea Corridor',
    theaterLabel: 'Bab el-Mandeb / Hormuz Nexus',
    coordinates: [47.5, 22.8],
    radiusKm: 2100,
    matchRadiusKm: 2900,
    tagKeywords: ['hormuz', 'red-sea', 'tanker-war', 'energy-corridor', 'theocratic'],
    summary:
      'Persistent energy-corridor flashpoint uniting 1979–1991 Gulf conflicts, post-2001 interventions, and 2026 Bab el-Mandeb naval interdictions.',
  },
  {
    id: 'hotspot-eastern-europe',
    region: 'Eastern Europe & Black Sea',
    theaterLabel: 'Dnipro / Baltic Deterrence Front',
    coordinates: [26.8, 49.2],
    radiusKm: 1850,
    matchRadiusKm: 2300,
    tagKeywords: ['europe-war', 'berlin-blockade', 'nato', 'peacekeeping', 'attrition'],
    summary:
      'High-intensity state-on-state deterrence arc spanning the 1948 Berlin Blockade, 1990s Balkan wars, and 2014–2026 Russo-Ukrainian attritional strikes.',
  },
  {
    id: 'hotspot-indo-pacific',
    region: 'Indo-Pacific & First Island Chain',
    theaterLabel: 'Luzon / Korean Strait Theater',
    coordinates: [125.4, 29.5],
    radiusKm: 2200,
    matchRadiusKm: 2700,
    tagKeywords: ['indo-pacific', 'proxy-war', 'armistice', 'wwii-end', 'asymmetric'],
    summary:
      'Long-horizon strategic basin anchored by the 1945 Pacific surrender, 1950–1975 East Asian wars, and 2026 maritime exclusion drills.',
  },
  {
    id: 'hotspot-southern-cape',
    region: 'Southern Ocean & Cape Corridor',
    theaterLabel: 'Cape of Good Hope Bypass',
    coordinates: [18.5, -34.2],
    radiusKm: 1750,
    matchRadiusKm: 2800,
    tagKeywords: ['cape-corridor', 'critical-minerals'],
    summary:
      'Elevated maritime chokepoint density driven by Suez-bypass container rerouting and critical-mineral supply competition.',
  },
  {
    id: 'hotspot-south-atlantic',
    region: 'South Atlantic & Magellan Rim',
    theaterLabel: 'Strait of Magellan / Drake Passage',
    coordinates: [-66.5, -52.5],
    radiusKm: 1650,
    matchRadiusKm: 3200,
    tagKeywords: ['south-atlantic'],
    summary:
      'Strategic inter-oceanic and Antarctic logistics corridor experiencing heightened hydrographic patrols and port-security competition.',
  },
  {
    id: 'hotspot-caribbean',
    region: 'Caribbean & Western Atlantic',
    theaterLabel: 'Florida Straits / Nuclear Hotline Anchor',
    coordinates: [-80.5, 24.5],
    radiusKm: 1500,
    matchRadiusKm: 2500,
    tagKeywords: ['naval-blockade', 'hotline', 'brinkmanship'],
    summary:
      'Historical nuclear-brinkmanship and naval-quarantine anchor from the 1962 Cuban Missile Crisis shaping modern maritime escalation doctrine.',
  },
];

export function computeHistoricalThreatHotspots(
  milestones: HistoricalMilestone[],
  incidents: KineticIncident[],
  statements: LeadershipStatement[]
): RegionalThreatHotspot[] {
  return THREAT_DENSITY_BASINS.map((basin) => {
    const matchedMilestones = milestones.filter((m) => {
      const dist = haversineDistanceKm(basin.coordinates, m.theater_coordinates);
      const tagHit = m.precedent_tags.some((t) => basin.tagKeywords.includes(t));
      return dist <= basin.matchRadiusKm || tagHit;
    });

    const matchedIncidents = incidents.filter(
      (inc) => haversineDistanceKm(basin.coordinates, inc.coordinates) <= basin.matchRadiusKm
    );

    const escalationStatements = statements.filter(
      (stmt) =>
        (stmt.category === 'ESCALATION_WARNING' || stmt.category === 'MILITARY_STRIKE') &&
        haversineDistanceKm(basin.coordinates, stmt.coordinates) <= basin.matchRadiusKm
    );

    const years = matchedMilestones.flatMap((m) => [m.start_year, m.end_year]);
    const minYear = years.length > 0 ? Math.min(...years) : 2023;
    const maxYear = years.length > 0 ? Math.max(...years) : 2026;
    const eraSpan = minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`;

    const incidentWeight = matchedIncidents.reduce((sum, inc) => {
      if (inc.severity === 'CRITICAL') return sum + 14;
      if (inc.severity === 'HIGH') return sum + 10;
      return sum + 6;
    }, 0);

    const rawScore =
      26 +
      matchedMilestones.length * 12 +
      incidentWeight +
      Math.min(18, escalationStatements.length * 5);

    const densityScore = Math.max(20, Math.min(98, rawScore));
    const severityTier: RegionalThreatHotspot['severityTier'] =
      densityScore >= 76 ? 'CRITICAL' : densityScore >= 56 ? 'HIGH' : 'ELEVATED';

    return {
      id: basin.id,
      region: basin.region,
      theaterLabel: basin.theaterLabel,
      coordinates: basin.coordinates,
      radiusKm: basin.radiusKm,
      historicalConflictCount: matchedMilestones.length,
      densityScore,
      severityTier,
      eraSpan,
      linkedMilestones: matchedMilestones.map((m) => `${m.year_label}: ${m.title}`),
      summary: basin.summary,
    };
  }).sort((a, b) => b.densityScore - a.densityScore);
}
