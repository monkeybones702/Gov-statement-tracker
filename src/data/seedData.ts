import type {
  DiplomaticCorridor,
  HistoricalMilestone,
  KineticIncident,
  LeadershipStatement,
  ProjectedScenario,
  SouthernChokepoint,
} from '../types/aegis';

export const SEED_STATEMENTS: LeadershipStatement[] = [
  {
    id: 'stmt-usa-2026-01',
    timestamp_utc: '2026-11-15T14:20:00Z',
    country_iso3: 'USA',
    leader_name: 'Department of Defense & State Joint Briefing',
    official_title: 'U.S. Department of State',
    regime_alignment: 'CENTER_RIGHT',
    category: 'ESCALATION_WARNING',
    verbatim_quote:
      'Any interdiction of commercial maritime transit through the Bab el-Mandeb or Cape of Good Hope sea lanes will trigger proportional coalition naval deterrence measures.',
    official_source_url: 'https://www.state.gov/briefings-2026/maritime-corridors',
    verification_status: 'CONFIRMED_GOV_RELEASE',
    coordinates: [-77.0369, 38.9072],
    region: 'Middle East & Red Sea',
    analyst_note: 'Cross-referenced with U.S. 5th Fleet posture alert and Lloyd’s war-risk underwriting bulletin.',
  },
  {
    id: 'stmt-un-2026-02',
    timestamp_utc: '2026-11-14T19:05:00Z',
    country_iso3: 'UNSC',
    leader_name: 'United Nations Security Council',
    official_title: 'UNSC Emergency Session Record',
    regime_alignment: 'CENTER_LEFT',
    category: 'PEACE_OVERTURE',
    verbatim_quote:
      'Council members urge immediate resumption of maritime deconfliction talks in Geneva and establish a 72-hour humanitarian grain and medical transit window.',
    official_source_url: 'https://press.un.org/en/2026/sc15942.doc.htm',
    verification_status: 'UN_TRANSCRIPT',
    coordinates: [-73.9679, 40.7489],
    region: 'Global / Multilateral',
    analyst_note: 'Draft resolution tabled jointly by non-permanent members with humanitarian corridor verification.',
  },
  {
    id: 'stmt-eu-2026-03',
    timestamp_utc: '2026-11-14T11:30:00Z',
    country_iso3: 'EUR',
    leader_name: 'European External Action Service',
    official_title: 'High Representative for Foreign Affairs',
    regime_alignment: 'CENTER_RIGHT',
    category: 'STRATEGIC_DEAL_ECONOMIC',
    verbatim_quote:
      'The European Union has ratified strategic critical-minerals and green-hydrogen supply protocols with Southern African and Andean partners to insulate industrial grids.',
    official_source_url: 'https://ec.europa.eu/commission/presscorner/detail/en/ip_26_4410',
    verification_status: 'CONFIRMED_GOV_RELEASE',
    coordinates: [4.3517, 50.8503],
    region: 'Europe & Southern Hemisphere',
    analyst_note: 'Directly offsets rare-earth export licensing bottlenecks in East Asia.',
  },
  {
    id: 'stmt-ukr-2026-04',
    timestamp_utc: '2026-11-13T21:40:00Z',
    country_iso3: 'UKR',
    leader_name: 'Ministry of Defense of Ukraine',
    official_title: 'Minister of Defense',
    regime_alignment: 'CENTER_RIGHT',
    category: 'MILITARY_STRIKE',
    verbatim_quote:
      'Long-range unmanned aerial and naval systems neutralized verified military logistics depots and radar batteries supporting cross-border artillery strikes.',
    official_source_url: 'https://www.mil.gov.ua/en/news/2026/11/13/operational-briefing',
    verification_status: 'CONFIRMED_GOV_RELEASE',
    coordinates: [30.5234, 50.4501],
    region: 'Eastern Europe',
    analyst_note: 'Confirmed via official MoD operational summary; correlates with air-defense readiness telemetry.',
  },
  {
    id: 'stmt-chn-2026-05',
    timestamp_utc: '2026-11-12T07:15:00Z',
    country_iso3: 'CHN',
    leader_name: 'Ministry of Foreign Affairs (PRC)',
    official_title: 'Foreign Ministry Spokesperson',
    regime_alignment: 'AUTHORITARIAN_STATE',
    category: 'STRATEGIC_DEAL_ECONOMIC',
    verbatim_quote:
      'Bilateral local-currency settlement frameworks and port modernization accords with South American Atlantic terminals will expand resilient multipolar trade.',
    official_source_url: 'https://www.fmprc.gov.cn/eng/xwfw_665399/s2510_665401/',
    verification_status: 'CONFIRMED_GOV_RELEASE',
    coordinates: [116.4074, 39.9042],
    region: 'Indo-Pacific & South Atlantic',
    analyst_note: 'Signals continued dual-track strategy: economic anchor in South Atlantic alongside regional naval drills.',
  },
  {
    id: 'stmt-zaf-2026-06',
    timestamp_utc: '2026-11-11T15:50:00Z',
    country_iso3: 'ZAF',
    leader_name: 'Department of International Relations and Cooperation',
    official_title: 'Minister of International Relations',
    regime_alignment: 'CENTER_LEFT',
    category: 'STRATEGIC_DEAL_ECONOMIC',
    verbatim_quote:
      'As rerouted container tonnage around the Cape of Good Hope reaches historic highs, South Africa is expanding maritime port capacity and naval search-and-rescue coordination.',
    official_source_url: 'https://www.gov.za/news/speeches/maritime-cape-corridor-2026',
    verification_status: 'CONFIRMED_GOV_RELEASE',
    coordinates: [18.4241, -33.9249],
    region: 'Southern Ocean & Cape Corridor',
    analyst_note: 'Cape of Good Hope throughput up significantly due to Red Sea risk avoidance.',
  },
  {
    id: 'stmt-jpn-2026-07',
    timestamp_utc: '2026-11-10T04:10:00Z',
    country_iso3: 'JPN',
    leader_name: 'Ministry of Foreign Affairs of Japan',
    official_title: 'Minister for Foreign Affairs',
    regime_alignment: 'CENTER_RIGHT',
    category: 'ESCALATION_WARNING',
    verbatim_quote:
      'Unannounced live-fire maritime exclusion zones in international sea lanes near the first island chain pose an unacceptable risk to regional aviation and shipping.',
    official_source_url: 'https://www.mofa.go.jp/press/release/index.html',
    verification_status: 'CONFIRMED_GOV_RELEASE',
    coordinates: [139.6917, 35.6895],
    region: 'Indo-Pacific',
    analyst_note: 'Followed by trilateral maritime domain awareness patrol notice.',
  },
  {
    id: 'stmt-bra-2026-08',
    timestamp_utc: '2026-11-09T17:25:00Z',
    country_iso3: 'BRA',
    leader_name: 'Ministry of Foreign Affairs (Itamaraty)',
    official_title: 'Chancellor of Brazil',
    regime_alignment: 'LEFT_WING',
    category: 'PEACE_OVERTURE',
    verbatim_quote:
      'Brazil and regional Southern Cone partners propose an expanded South Atlantic Peace and Cooperation Zone summit to safeguard submarine cables and Antarctic logistics.',
    official_source_url: 'https://www.gov.br/mre/en/contact-us/press-room',
    verification_status: 'CONFIRMED_GOV_RELEASE',
    coordinates: [-47.8825, -15.7942],
    region: 'South Atlantic & Antarctic',
    analyst_note: 'Links South American Atlantic ports with Strait of Magellan transit governance.',
  },
  {
    id: 'stmt-rus-2026-09',
    timestamp_utc: '2026-11-08T12:00:00Z',
    country_iso3: 'RUS',
    leader_name: 'Ministry of Foreign Affairs of the Russian Federation',
    official_title: 'Foreign Minister',
    regime_alignment: 'AUTHORITARIAN_STATE',
    category: 'ESCALATION_WARNING',
    verbatim_quote:
      'Deployment of intermediate-range strike infrastructure along our western frontier will compel reciprocal asymmetric deterrence adjustments under revised doctrine.',
    official_source_url: 'https://mid.ru/en/foreign_policy/news/',
    verification_status: 'CONFIRMED_GOV_RELEASE',
    coordinates: [37.6173, 55.7558],
    region: 'Eastern Europe',
    analyst_note: 'Nuclear-posture rhetorical signaling tied to NATO force-posture announcements.',
  },
  {
    id: 'stmt-gbr-2026-10',
    timestamp_utc: '2026-11-07T09:45:00Z',
    country_iso3: 'GBR',
    leader_name: 'UK Ministry of Defence',
    official_title: 'Secretary of State for Defence',
    regime_alignment: 'CENTER_LEFT',
    category: 'MILITARY_STRIKE',
    verbatim_quote:
      'Royal Navy escort destroyers intercepted unmanned aerial threats targeting merchant vessels transiting the southern Red Sea maritime security corridor.',
    official_source_url: 'https://www.gov.uk/government/news/maritime-interception-update',
    verification_status: 'CONFIRMED_GOV_RELEASE',
    coordinates: [-0.1276, 51.5072],
    region: 'Middle East & Red Sea',
    analyst_note: 'Verified defensive kinetic interception in coalition maritime security zone.',
  },
];

export const SEED_INCIDENTS: KineticIncident[] = [
  {
    id: 'inc-redsea-01',
    title: 'Bab el-Mandeb Naval Interdiction & Drone Intercept',
    theater: 'Red Sea Maritime Corridor',
    severity: 'CRITICAL',
    timestamp_utc: '2026-11-15T06:40:00Z',
    coordinates: [43.33, 12.58],
    summary:
      'Coalition destroyers intercepted anti-ship aerial drones near Bab el-Mandeb; commercial freighters diverting via Cape of Good Hope.',
    verified_source: 'UKMTO / USCENTCOM Official Advisory',
    range_ring_km: 1800,
  },
  {
    id: 'inc-dnipro-02',
    title: 'Eastern Front Precision Strike & Air-Defense Engagement',
    theater: 'Eastern Europe',
    severity: 'CRITICAL',
    timestamp_utc: '2026-11-14T22:15:00Z',
    coordinates: [35.04, 48.46],
    summary:
      'High-intensity long-range drone and missile exchange targeting energy grid substations and forward logistics depots.',
    verified_source: 'Ukrainian MoD / UN OCHA Flash Update',
    range_ring_km: 1500,
  },
  {
    id: 'inc-hormuz-03',
    title: 'Strait of Hormuz Tanker Escort Standoff',
    theater: 'Persian Gulf',
    severity: 'HIGH',
    timestamp_utc: '2026-11-13T11:20:00Z',
    coordinates: [56.25, 26.56],
    summary:
      'Fast-attack patrol craft challenged flagged energy tankers transiting inbound lanes; maritime insurance war-risk surcharges elevated.',
    verified_source: 'IMSC Official Maritime Notice',
    range_ring_km: 1400,
  },
  {
    id: 'inc-scs-04',
    title: 'Second Thomas Shoal / Luzon Strait Naval Readiness Drill',
    theater: 'Indo-Pacific',
    severity: 'HIGH',
    timestamp_utc: '2026-11-12T03:50:00Z',
    coordinates: [120.8, 20.4],
    summary:
      'Joint amphibious and maritime coast guard patrol exclusion notices issued across Bashi Channel transit lanes.',
    verified_source: 'Japan MoD / Philippines DFA Official Release',
    range_ring_km: 2000,
  },
  {
    id: 'inc-cape-05',
    title: 'Cape of Good Hope High-Density Reroute Congestion',
    theater: 'Southern Ocean Maritime Lane',
    severity: 'ELEVATED',
    timestamp_utc: '2026-11-11T16:00:00Z',
    coordinates: [18.49, -34.35],
    summary:
      'Record merchant vessel diversion around southern Africa requiring expanded naval patrol and bunker-fuel coordination.',
    verified_source: 'South African Maritime Safety Authority',
    range_ring_km: 1600,
  },
  {
    id: 'inc-magellan-06',
    title: 'Strait of Magellan & Drake Passage Strategic Transit Audit',
    theater: 'South Atlantic / Antarctic Rim',
    severity: 'ELEVATED',
    timestamp_utc: '2026-11-10T18:10:00Z',
    coordinates: [-70.91, -53.16],
    summary:
      'Joint Southern Cone hydrographic and naval monitoring patrol safeguarding alternative inter-oceanic shipping lanes.',
    verified_source: 'Chilean & Argentine Foreign Ministries',
    range_ring_km: 1500,
  },
];

export const SOUTHERN_CHOKEPOINTS: SouthernChokepoint[] = [
  {
    id: 'chk-cape',
    name: 'Cape of Good Hope',
    coordinates: [18.49, -34.35],
    strategic_role: 'Primary Suez-bypass container & LNG rerouting nexus',
  },
  {
    id: 'chk-magellan',
    name: 'Strait of Magellan',
    coordinates: [-70.91, -53.16],
    strategic_role: 'Panama-bypass Atlantic-Pacific strategic passage',
  },
  {
    id: 'chk-drake',
    name: 'Drake Passage',
    coordinates: [-65.0, -58.5],
    strategic_role: 'Antarctic logistics & deep-draft maritime corridor',
  },
  {
    id: 'chk-lombok',
    name: 'Lombok & Sunda Straits',
    coordinates: [115.72, -8.75],
    strategic_role: 'Southern Indo-Pacific submarine & tanker bypass to Malacca',
  },
  {
    id: 'chk-torres',
    name: 'Tasman / Bass Corridor',
    coordinates: [146.5, -39.5],
    strategic_role: 'South Pacific energy and submarine cable trunk',
  },
];

export const SEED_CORRIDORS: DiplomaticCorridor[] = [
  {
    id: 'cor-01',
    label: 'Geneva Maritime Deconfliction Channel',
    type: 'CEASEFIRE_MEDIATION',
    from_iso3: 'USA',
    to_iso3: 'CHE',
    from: [-77.0369, 38.9072],
    to: [6.1432, 46.2044],
    status: 'Active multilateral mediation',
  },
  {
    id: 'cor-02',
    label: 'EU–Cape Critical Minerals & Hydrogen Pact',
    type: 'TRADE_DEAL',
    from_iso3: 'BEL',
    to_iso3: 'ZAF',
    from: [4.3517, 50.8503],
    to: [18.4241, -33.9249],
    status: 'Ratified strategic supply protocol',
  },
  {
    id: 'cor-03',
    label: 'South Atlantic Peace & Logistics Axis',
    type: 'CEASEFIRE_MEDIATION',
    from_iso3: 'BRA',
    to_iso3: 'ZAF',
    from: [-47.8825, -15.7942],
    to: [18.4241, -33.9249],
    status: 'Joint maritime security framework',
  },
  {
    id: 'cor-04',
    label: 'Beijing–Santos Local-Currency Port Corridor',
    type: 'TRADE_DEAL',
    from_iso3: 'CHN',
    to_iso3: 'BRA',
    from: [116.4074, 39.9042],
    to: [-46.3336, -23.9608],
    status: 'Bilateral settlement expansion',
  },
  {
    id: 'cor-05',
    label: 'Tokyo–Washington First Island Chain Deterrence Link',
    type: 'SANCTIONS_ENERGY',
    from_iso3: 'JPN',
    to_iso3: 'USA',
    from: [139.6917, 35.6895],
    to: [-77.0369, 38.9072],
    status: 'Aligned export controls & LNG swap',
  },
  {
    id: 'cor-06',
    label: 'Kyiv–London–Brussels Defense Industrial Corridor',
    type: 'SANCTIONS_ENERGY',
    from_iso3: 'GBR',
    to_iso3: 'UKR',
    from: [-0.1276, 51.5072],
    to: [30.5234, 50.4501],
    status: 'Air-defense munitions replenishment',
  },
];

export const SEED_SCENARIOS: ProjectedScenario[] = [
  {
    id: 'scen-redsea-90',
    scenario_title: 'Sustained Bab el-Mandeb Diversion & Cape Port Bottleneck',
    probability_index: 74,
    time_horizon: '90-Day',
    region: 'Middle East & Southern Ocean',
    primary_actors: ['USA', 'GBR', 'IRN', 'ZAF'],
    historical_precedent_ref:
      '1967–1975 Suez Closure & 1987 Operation Earnest Will Tanker Escorts',
    internal_domestic_friction:
      'Coalition governments face voter sensitivity to energy-driven inflation while regional actors balance domestic economic distress against deterrence credibility.',
    economic_wealth_stressors:
      'Maritime hull war-risk premiums remain +320% above 2023 baselines; sovereign debt servicing in Red Sea littoral states strains fiscal reserves while Cape port operators face capex pressure.',
    escalation_or_deescalation_path:
      'Likely stabilization around permanent Cape rerouting for high-value container traffic unless direct state-on-state naval engagements close the Strait of Hormuz.',
    private_clearance_memo:
      'PRIVATE ANALYST MEMO: Sovereign bond spread widening in Egypt (>680 bps) increases likelihood of IMF emergency tranche linkage to Red Sea security mediation.',
  },
  {
    id: 'scen-europe-365',
    scenario_title: 'Eastern European Attrition Equilibrium & Frozen Ceasefire Framework',
    probability_index: 61,
    time_horizon: '365-Day',
    region: 'Eastern Europe',
    primary_actors: ['UKR', 'RUS', 'EUR', 'USA'],
    historical_precedent_ref:
      '1953 Korean Armistice Demarcation & 1975 Helsinki Accords Security Architecture',
    internal_domestic_friction:
      'Center-right and populist parliamentary shifts across European capitals tighten fiscal authorization for multi-year munitions subsidies; mobilization fatigue constrains offensive tempo.',
    economic_wealth_stressors:
      'Defense-industrial artillery and interceptor backlogs clash with European sovereign bond yield ceilings and industrial electricity pricing pressures.',
    escalation_or_deescalation_path:
      'High probability of structured ceasefire negotiations anchored on third-party verification lines, punctuated by pre-negotiation deep-strike leverage campaigns.',
    private_clearance_memo:
      'PRIVATE ANALYST MEMO: Oligarch asset-freeze litigation in Euroclear jurisdictions creates quiet diplomatic leverage for prisoner-swap and energy-transit sub-accords.',
  },
  {
    id: 'scen-indopacific-90',
    scenario_title: 'Bashi Channel Grey-Zone Quarantine & Semiconductor Supply Hedge',
    probability_index: 56,
    time_horizon: '90-Day',
    region: 'Indo-Pacific',
    primary_actors: ['CHN', 'JPN', 'USA', 'PHL'],
    historical_precedent_ref:
      '1954–1958 Taiwan Strait Crises & 1962 Naval Quarantine Doctrine',
    internal_domestic_friction:
      'Nationalist domestic expectations in East Asia incentivize visible maritime patrol assertions, countered by export-dependent manufacturing lobbies urging de-escalation.',
    economic_wealth_stressors:
      'High-bandwidth memory and lithography export restrictions drive corporate capital migration toward ASEAN, Japan, and U.S. fabrication hubs, elevating debt-financed industrial subsidies.',
    escalation_or_deescalation_path:
      'Customary coast-guard inspections and temporary exclusion zones stop short of kinetic blockade, preserving direct military hotline channels to prevent accidental collision.',
    private_clearance_memo:
      'PRIVATE ANALYST MEMO: Insurer underwriting withdrawals for Luzon Strait LNG carriers would trigger automatic Japanese strategic reserve releases within 14 days.',
  },
  {
    id: 'scen-southatlantic-30',
    scenario_title: 'Southern Hemisphere Critical Minerals & Polar Sea-Lane Alignment',
    probability_index: 68,
    time_horizon: '30-Day',
    region: 'South Atlantic & Antarctic',
    primary_actors: ['BRA', 'ZAF', 'EUR', 'CHN'],
    historical_precedent_ref:
      '1959 Antarctic Treaty Demilitarization & 1986 ZOPACAS South Atlantic Accord',
    internal_domestic_friction:
      'Left- and center-left coalitions in South America prioritize resource nationalism and non-aligned diplomacy against external pressure to join single-bloc export controls.',
    economic_wealth_stressors:
      'Lithium, copper, and green-ammonia port concessions attract competing sovereign wealth fund bids from Brussels, Beijing, and Gulf funds.',
    escalation_or_deescalation_path:
      'De-escalatory institutionalization via multilateral port-security accords around the Strait of Magellan and Cape of Good Hope, barring unilateral Antarctic resource claims.',
    private_clearance_memo:
      'PRIVATE ANALYST MEMO: Subsea fiber-optic cable landing stations in Fortaleza and Cape Town remain focal points for dual-use maritime surveillance diplomacy.',
  },
];

export const HISTORICAL_MILESTONES: HistoricalMilestone[] = [
  {
    id: 'era-1945',
    year_label: 'Sep 2, 1945',
    start_year: 1945,
    end_year: 1945,
    anchor_date: '1945-09-02',
    title: 'Official End of WWII & Post-War Order Anchor',
    structural_shift:
      'Signing of the Japanese Instrument of Surrender aboard USS Missouri concludes WWII and inaugurates the UN multilateral era.',
    precedent_tags: ['wwii-end', 'un-charter', 'bipolar-dawn', 'sovereign-order'],
    key_actors: ['USA', 'GBR', 'USSR', 'CHN', 'JPN'],
    theater_coordinates: [139.75, 35.35],
    dossier_summary:
      'With industrial Europe and East Asia devastated, the Bretton Woods financial architecture and United Nations Security Council veto system established the baseline rules for post-1945 statecraft.',
    lessons_for_2026:
      'Great-power institutional vetoes remain intact even as economic multipolarity stresses post-1945 trade rules.',
  },
  {
    id: 'era-1945-1949',
    year_label: '1945–1949',
    start_year: 1945,
    end_year: 1949,
    anchor_date: '1948-06-24',
    title: 'UN Charter Ratification, Berlin Blockade, NATO & Soviet Atomic Test',
    structural_shift:
      'Rapid transition from wartime Grand Alliance to institutionalized Cold War deterrence blocs and nuclear parity.',
    precedent_tags: ['nato', 'berlin-blockade', 'nuclear-deterrence', 'sanctions'],
    key_actors: ['USA', 'USSR', 'GBR', 'FRA', 'DEU'],
    theater_coordinates: [13.405, 52.52],
    dossier_summary:
      'The 1948–1949 Berlin Airlift demonstrated non-kinetic logistics endurance under blockade; NATO’s April 1949 treaty and RDS-1 in August 1949 locked in European collective security.',
    lessons_for_2026:
      'Air/maritime bypass corridors can defeat coercive blockades without crossing kinetic red lines.',
  },
  {
    id: 'era-1950-1953',
    year_label: '1950–1953',
    start_year: 1950,
    end_year: 1953,
    anchor_date: '1950-06-25',
    title: 'Korean War (First Major Cold War Proxy Clash)',
    structural_shift:
      'High-intensity conventional warfare constrained below the nuclear threshold, culminating in an armed armistice without a formal peace treaty.',
    precedent_tags: ['proxy-war', 'armistice', 'coalition', 'unsc'],
    key_actors: ['USA', 'CHN', 'USSR', 'KOR', 'PRK'],
    theater_coordinates: [126.978, 37.5665],
    dossier_summary:
      'UN Security Council authorization during the Soviet boycott enabled a multinational coalition, establishing how regional wars can freeze along fortified demarcation lines for decades.',
    lessons_for_2026:
      'Frozen armistice lines remain the highest-probability off-ramp for protracted high-intensity territorial wars.',
  },
  {
    id: 'era-1962',
    year_label: '1962',
    start_year: 1962,
    end_year: 1962,
    anchor_date: '1962-10-16',
    title: 'Cuban Missile Crisis & Moscow–Washington Hotline',
    structural_shift:
      'Peak nuclear brinkmanship forced institutionalization of direct head-of-state crisis hotlines and arms-control treaties.',
    precedent_tags: ['nuclear', 'naval-blockade', 'hotline', 'brinkmanship'],
    key_actors: ['USA', 'USSR', 'CUB'],
    theater_coordinates: [-82.3666, 23.1136],
    dossier_summary:
      'A 13-day standoff over medium-range ballistic missiles triggered a U.S. naval quarantine and secret reciprocal concessions (Turkey/Cuba), proving the necessity of real-time leadership communications.',
    lessons_for_2026:
      'Grey-zone maritime quarantines require preserved executive backchannels to prevent escalation spirals.',
  },
  {
    id: 'era-1955-1975',
    year_label: '1955–1975',
    start_year: 1955,
    end_year: 1975,
    anchor_date: '1969-03-02',
    title: 'Vietnam War & Sino-Soviet Split',
    structural_shift:
      'Ideological fracture of the communist bloc and limits of asymmetric expeditionary intervention amid domestic political friction.',
    precedent_tags: ['domestic-friction', 'asymmetric', 'bloc-realignment', 'suez'],
    key_actors: ['USA', 'CHN', 'USSR', 'VNM'],
    theater_coordinates: [105.8342, 21.0278],
    dossier_summary:
      'Border clashes along the Ussuri River in 1969 split Beijing and Moscow, enabling Nixon–Mao rapprochement while domestic anti-war pressures reshaped U.S. defense budgets and currency stability.',
    lessons_for_2026:
      'Internal domestic coalition friction and sovereign fiscal deficits frequently dictate military withdrawal timelines.',
  },
  {
    id: 'era-1979-1989',
    year_label: '1979–1989',
    start_year: 1979,
    end_year: 1989,
    anchor_date: '1979-12-24',
    title: 'Soviet–Afghan War & Iranian Revolution',
    structural_shift:
      'Reshaping of Middle Eastern theocratic alignment, Central Asian insurgency dynamics, and Persian Gulf tanker-war escort doctrines.',
    precedent_tags: ['theocratic', 'energy-corridor', 'hormuz', 'tanker-war'],
    key_actors: ['USSR', 'IRN', 'AFG', 'USA', 'SAU'],
    theater_coordinates: [51.389, 35.6892],
    dossier_summary:
      'The 1979 revolution transformed Gulf energy security; the 1980–1988 Iran–Iraq Tanker War required international naval reflagging and escort operations through the Strait of Hormuz.',
    lessons_for_2026:
      'Energy chokepoint insurance shocks rapidly force multilateral naval escort coalitions.',
  },
  {
    id: 'era-1990-1991',
    year_label: '1990–1991',
    start_year: 1990,
    end_year: 1991,
    anchor_date: '1991-12-26',
    title: 'Gulf War & Dissolution of the USSR',
    structural_shift:
      'Transition from bipolar Cold War to U.S.-led unipolarity and precision-guided conventional warfare.',
    precedent_tags: ['unipolarity', 'energy-corridor', 'coalition', 'sanctions'],
    key_actors: ['USA', 'RUS', 'IRQ', 'KWT', 'UNSC'],
    theater_coordinates: [47.9774, 29.3759],
    dossier_summary:
      'UN-sanctioned coalition reversal of Kuwait’s annexation coincided with the Soviet Union’s economic collapse and formal dissolution into 15 sovereign republics.',
    lessons_for_2026:
      'Sovereign debt and fiscal exhaustion inside major powers trigger sudden geopolitical realignments.',
  },
  {
    id: 'era-1991-2001',
    year_label: '1991–2001',
    start_year: 1991,
    end_year: 2001,
    anchor_date: '1995-07-11',
    title: 'Yugoslav Wars & Rwandan Genocide',
    structural_shift:
      'Post-Cold War ethnic fragmentation exposed the operational limits of UN peacekeeping mandates.',
    precedent_tags: ['peacekeeping', 'fragmentation', 'nato', 'unsc'],
    key_actors: ['UNSC', 'NATO', 'SRB', 'BIH', 'RWA'],
    theater_coordinates: [18.4131, 43.8563],
    dossier_summary:
      'Failure to enforce safe areas in Bosnia and Rwanda catalyzed the Responsibility to Protect (R2P) debate and NATO out-of-area stabilization missions.',
    lessons_for_2026:
      'Divided Security Council vetoes push regional coalitions toward ad-hoc intervention frameworks.',
  },
  {
    id: 'era-2001-2021',
    year_label: '2001–2021',
    start_year: 2001,
    end_year: 2021,
    anchor_date: '2001-09-11',
    title: 'Global War on Terror (Afghanistan & Iraq)',
    structural_shift:
      'Two decades of counter-insurgency interventionism strained Western defense budgets while great-power rivals modernized.',
    precedent_tags: ['counterinsurgency', 'fiscal-strain', 'intervention'],
    key_actors: ['USA', 'GBR', 'AFG', 'IRQ', 'NATO'],
    theater_coordinates: [69.2075, 34.5553],
    dossier_summary:
      'Trillion-dollar expeditionary campaigns in Afghanistan and Iraq redirected strategic attention away from peer industrial competition and maritime chokepoint modernization.',
    lessons_for_2026:
      'Prolonged expeditionary commitments erode domestic appetite for open-ended foreign security guarantees.',
  },
  {
    id: 'era-2014-present',
    year_label: '2014–Present',
    start_year: 2014,
    end_year: 2026,
    anchor_date: '2022-02-24',
    title: 'Russo-Ukrainian War',
    structural_shift:
      'Return of high-intensity, attritional state-on-state warfare in Europe alongside sweeping financial sanctions.',
    precedent_tags: ['europe-war', 'sanctions', 'attrition', 'drone-warfare', 'nuclear'],
    key_actors: ['UKR', 'RUS', 'EUR', 'USA', 'GBR'],
    theater_coordinates: [30.5234, 50.4501],
    dossier_summary:
      'From the 2014 Donbas/Crimea crisis through the 2022 full-scale invasion to 2026 autonomous strike operations, industrial munitions throughput and central-bank asset freezes redefined modern economic warfare.',
    lessons_for_2026:
      'Artillery, air-defense interceptor production, and energy-grid resilience determine diplomatic leverage.',
  },
  {
    id: 'era-2023-2026',
    year_label: '2023–2026',
    start_year: 2023,
    end_year: 2026,
    anchor_date: '2026-11-16',
    title: 'Multi-Theater Escalations & Multipolar Economic Decoupling',
    structural_shift:
      'Simultaneous Middle East maritime crises, Indo-Pacific deterrence, Southern Ocean rerouting, and critical-mineral bloc decoupling.',
    precedent_tags: [
      'red-sea',
      'cape-corridor',
      'indo-pacific',
      'critical-minerals',
      'hormuz',
      'south-atlantic',
    ],
    key_actors: ['USA', 'CHN', 'EUR', 'ZAF', 'BRA', 'JPN', 'IRN'],
    theater_coordinates: [43.33, 12.58],
    dossier_summary:
      'By 2026, disruptions at Bab el-Mandeb and Strait of Hormuz forced global shipping around the Cape of Good Hope and Strait of Magellan, elevating Southern Hemisphere chokepoints and local-currency resource accords.',
    lessons_for_2026:
      'Southern Hemisphere maritime lanes and critical-mineral corridors now anchor global strategic stability.',
  },
];
