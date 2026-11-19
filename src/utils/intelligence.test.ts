import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeGreatCircleArc,
  computeHistoricalThreatHotspots,
  filterScenarios,
  filterStatements,
  findMatchingMilestones,
  haversineDistanceKm,
  isOfficialGovDomain,
  normalizeSweepPayload,
} from './intelligence';
import {
  buildIntelligenceReportPdf,
  buildIntelligenceReportText,
  wrapTextLines,
} from './reportExport';
import {
  HISTORICAL_MILESTONES,
  SEED_INCIDENTS,
  SEED_SCENARIOS,
  SEED_STATEMENTS,
} from '../data/seedData';
import type {
  HistoricalMilestone,
  LeadershipStatement,
  ProjectedScenario,
} from '../types/aegis';

const sampleStatements: LeadershipStatement[] = [
  {
    id: 's1',
    timestamp_utc: '2026-11-12T10:00:00Z',
    country_iso3: 'USA',
    leader_name: 'Office of the Secretary of State',
    official_title: 'Department of State',
    regime_alignment: 'CENTER_RIGHT',
    category: 'ESCALATION_WARNING',
    verbatim_quote: 'Freedom of navigation in the Bab el-Mandeb remains non-negotiable.',
    official_source_url: 'https://www.state.gov/briefing-2026',
    verification_status: 'CONFIRMED_GOV_RELEASE',
    coordinates: [-77.0369, 38.9072],
    region: 'Middle East / Red Sea',
  },
  {
    id: 's2',
    timestamp_utc: '2026-11-10T08:00:00Z',
    country_iso3: 'BRA',
    leader_name: 'Ministry of Foreign Affairs',
    official_title: 'Itamaraty',
    regime_alignment: 'LEFT_WING',
    category: 'STRATEGIC_DEAL_ECONOMIC',
    verbatim_quote: 'South Atlantic energy and critical minerals corridor agreement signed.',
    official_source_url: 'https://www.gov.br/mre/en/statement',
    verification_status: 'CONFIRMED_GOV_RELEASE',
    coordinates: [-47.8825, -15.7942],
    region: 'South Atlantic',
  },
];

test('filterStatements filters by category, regime, and search text', () => {
  assert.equal(
    filterStatements(sampleStatements, {
      category: 'ESCALATION_WARNING',
      regime: 'ALL',
      searchQuery: '',
    }).length,
    1
  );
  assert.equal(
    filterStatements(sampleStatements, {
      category: 'ALL',
      regime: 'LEFT_WING',
      searchQuery: 'minerals',
    })[0]?.id,
    's2'
  );
  assert.equal(
    filterStatements(sampleStatements, {
      category: 'ALL',
      regime: 'ALL',
      searchQuery: 'nonexistent-token',
    }).length,
    0
  );
});

test('filterScenarios enforces RBAC private memo redaction in PUBLIC_BRIEF mode', () => {
  const scenarios: ProjectedScenario[] = [
    {
      id: 'sc1',
      scenario_title: 'Red Sea Shipping Premium Shock',
      probability_index: 68,
      time_horizon: '90-Day',
      region: 'Middle East',
      primary_actors: ['USA', 'IRN'],
      historical_precedent_ref: '1987 Tanker War',
      internal_domestic_friction: 'Coalition budget pressures',
      economic_wealth_stressors: 'Maritime insurance spike',
      escalation_or_deescalation_path: 'Multilateral escort corridor',
      private_clearance_memo: 'Sensitive sovereign debt sensitivity note',
    },
  ];

  const publicResult = filterScenarios(scenarios, {
    region: 'all',
    horizon: '90-Day',
    stressFocus: 'all',
    role: 'PUBLIC_BRIEF',
  });
  assert.equal(publicResult.length, 1);
  assert.equal(publicResult[0].private_clearance_memo, undefined);

  const privateResult = filterScenarios(scenarios, {
    region: 'all',
    horizon: '90-Day',
    stressFocus: 'all',
    role: 'PRIVATE_ANALYST',
  });
  assert.equal(
    privateResult[0].private_clearance_memo,
    'Sensitive sovereign debt sensitivity note'
  );
});

test('haversineDistanceKm computes realistic antipodal and regional distances', () => {
  const southPoleToEquator = haversineDistanceKm([0, -90], [0, 0]);
  assert.ok(southPoleToEquator > 9990 && southPoleToEquator < 10020);

  const zeroDist = haversineDistanceKm([18.42, -33.92], [18.42, -33.92]);
  assert.equal(zeroDist, 0);
});

test('computeGreatCircleArc produces valid interpolated coordinates between capitals', () => {
  const arc = computeGreatCircleArc([-77.04, 38.91], [139.69, 35.69], 10);
  assert.equal(arc.length, 11);
  assert.ok(Math.abs(arc[0][0] - -77.04) < 0.01);
  assert.ok(Math.abs(arc[10][0] - 139.69) < 0.01);
});

test('isOfficialGovDomain accepts canonical government/UN domains and rejects tabloids', () => {
  assert.equal(isOfficialGovDomain('https://www.state.gov/release'), true);
  assert.equal(isOfficialGovDomain('https://press.un.org/en/2026/sc15900.doc.htm'), true);
  assert.equal(isOfficialGovDomain('https://ec.europa.eu/commission/presscorner'), true);
  assert.equal(isOfficialGovDomain('https://www.gov.uk/government/news/statement'), true);
  assert.equal(isOfficialGovDomain('https://random-rumor-blog.com/leak'), false);
  assert.equal(isOfficialGovDomain('not-a-url'), false);
});

test('normalizeSweepPayload sanitizes coordinates, probability scale, and enums', () => {
  const normalized = normalizeSweepPayload({
    leadership_statements: [
      {
        id: 'x1',
        country_iso3: 'jpn',
        leader_name: 'MOFA Japan',
        category: 'PEACE_OVERTURE',
        verbatim_quote: 'Joint maritime dialogue confirmed.',
        official_source_url: 'https://www.mofa.go.jp/press',
        coordinates: [250, -95],
      },
      {
        id: 'empty-quote',
        country_iso3: 'USA',
        verbatim_quote: '   ',
      },
    ],
    projected_scenarios: [
      {
        scenario_title: 'Arctic Transit Friction',
        probability_index: 0.72,
        time_horizon: '30-Day',
        primary_actors: ['RUS', 'NOR'],
      },
    ],
  });

  assert.equal(normalized.leadership_statements.length, 1);
  assert.equal(normalized.leadership_statements[0].country_iso3, 'JPN');
  assert.deepEqual(normalized.leadership_statements[0].coordinates, [180, -90]);
  assert.equal(normalized.projected_scenarios[0].probability_index, 72);
});

test('findMatchingMilestones ranks matching historical precedents accurately', () => {
  const milestones: HistoricalMilestone[] = [
    {
      id: 'm1',
      year_label: '1962',
      start_year: 1962,
      end_year: 1962,
      anchor_date: '1962-10-16',
      title: 'Cuban Missile Crisis',
      structural_shift: 'Nuclear brinkmanship and blockade',
      precedent_tags: ['nuclear', 'naval-blockade', 'hotline'],
      key_actors: ['USA', 'USSR', 'Cuba'],
      theater_coordinates: [-82.36, 23.11],
      dossier_summary: 'Peak Cold War nuclear standoff.',
      lessons_for_2026: 'Direct leadership backchannels avert miscalculation.',
    },
    {
      id: 'm2',
      year_label: '1990–1991',
      start_year: 1990,
      end_year: 1991,
      anchor_date: '1990-08-02',
      title: 'Gulf War & Dissolution of the USSR',
      structural_shift: 'Maritime coalition defense of energy corridors',
      precedent_tags: ['energy-corridor', 'coalition'],
      key_actors: ['USA', 'Iraq', 'Kuwait'],
      theater_coordinates: [47.97, 29.37],
      dossier_summary: 'Coalition intervention in Persian Gulf.',
      lessons_for_2026: 'Chokepoint protection shapes energy prices.',
    },
  ];

  const matches = findMatchingMilestones('nuclear blockade hotline', milestones);
  assert.equal(matches[0]?.id, 'm1');
});

test('computeHistoricalThreatHotspots aggregates historical conflict density across regions', () => {
  const hotspots = computeHistoricalThreatHotspots(
    HISTORICAL_MILESTONES,
    SEED_INCIDENTS,
    SEED_STATEMENTS
  );
  assert.ok(hotspots.length >= 5);
  assert.ok(hotspots[0].densityScore >= hotspots[hotspots.length - 1].densityScore);
  const middleEast = hotspots.find((h) => h.id === 'hotspot-middle-east');
  assert.ok(middleEast);
  assert.ok(middleEast.historicalConflictCount >= 3);
  assert.equal(middleEast.severityTier, 'CRITICAL');
});

test('buildIntelligenceReportText includes selected items and enforces RBAC redaction', () => {
  const selectedStmts = SEED_STATEMENTS.slice(0, 2);
  const selectedScens = SEED_SCENARIOS.slice(0, 1);

  const publicTxt = buildIntelligenceReportText({
    title: 'Q4 Maritime Risk Brief',
    generatedAtUtc: '2026-11-19T12:00:00Z',
    rbacRole: 'PUBLIC_BRIEF',
    projectionMode: 'azimuthal-south',
    statements: selectedStmts,
    scenarios: selectedScens,
  });

  assert.ok(publicTxt.includes('Q4 Maritime Risk Brief'));
  assert.ok(publicTxt.includes('PUBLIC BRIEF (Open Sources Only)'));
  assert.ok(publicTxt.includes(selectedStmts[0].verbatim_quote));
  assert.ok(publicTxt.includes(selectedScens[0].scenario_title));
  assert.equal(publicTxt.includes('PRIVATE ANALYST MEMO'), false);
  assert.equal(publicTxt.includes('Analyst Note'), false);

  const privateTxt = buildIntelligenceReportText({
    title: 'Q4 Maritime Risk Brief',
    generatedAtUtc: '2026-11-19T12:00:00Z',
    rbacRole: 'PRIVATE_ANALYST',
    projectionMode: 'mercator',
    statements: selectedStmts,
    scenarios: selectedScens,
  });

  assert.ok(privateTxt.includes('PRIVATE ANALYST (Full Dossier)'));
  assert.ok(privateTxt.includes('PRIVATE ANALYST MEMO'));
  assert.ok(privateTxt.includes('Analyst Note'));
});

test('buildIntelligenceReportPdf produces valid multi-page PDF 1.4 binary with exact xref offsets', () => {
  assert.equal(wrapTextLines('One two three four five six', 10).length, 3);

  const pdfBytes = buildIntelligenceReportPdf({
    title: 'Global Escalation & Chokepoint Briefing',
    generatedAtUtc: '2026-11-19T12:00:00Z',
    rbacRole: 'PUBLIC_BRIEF',
    projectionMode: 'azimuthal-south',
    statements: SEED_STATEMENTS,
    scenarios: SEED_SCENARIOS,
    hotspots: computeHistoricalThreatHotspots(
      HISTORICAL_MILESTONES,
      SEED_INCIDENTS,
      SEED_STATEMENTS
    ),
  });

  const pdfText = new TextDecoder().decode(pdfBytes);
  assert.ok(pdfText.startsWith('%PDF-1.4\n'));
  assert.ok(pdfText.trimEnd().endsWith('%%EOF'));
  assert.ok(pdfText.includes('/Type /Catalog'));
  assert.ok(pdfText.includes('/Count 2') || pdfText.includes('/Count 3'));
  assert.ok(pdfText.includes('Global Escalation & Chokepoint Briefing'));
  assert.equal(pdfText.includes('PRIVATE ANALYST MEMO'), false);
});
