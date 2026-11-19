import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Crosshair, X } from 'lucide-react';
import { Header } from './components/Header';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { D3AzimuthalMap } from './components/D3AzimuthalMap';
import { GoogleMercatorMap } from './components/GoogleMercatorMap';
import { StatementFeed } from './components/StatementFeed';
import { ScenariosEngine } from './components/ScenariosEngine';
import { HistoricalTimeline } from './components/HistoricalTimeline';
import { ReportExportModal } from './components/ReportExportModal';
import {
  HISTORICAL_MILESTONES,
  SEED_CORRIDORS,
  SEED_INCIDENTS,
  SEED_SCENARIOS,
  SEED_STATEMENTS,
  SOUTHERN_CHOKEPOINTS,
} from './data/seedData';
import type {
  GroundingSource,
  IntelligenceSweepResponse,
  KineticIncident,
  LeadershipStatement,
  MapLayersState,
  ProjectedScenario,
  ProjectionMode,
  RbacRole,
  RegimeAlignment,
  RegionalThreatHotspot,
  StatementCategory,
  WorkspaceTab,
} from './types/aegis';
import {
  computeHistoricalThreatHotspots,
  filterScenarios,
  filterStatements,
  findMatchingMilestones,
  normalizeSweepPayload,
} from './utils/intelligence';

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('map');
  const [projection, setProjection] = useState<ProjectionMode>('azimuthal-south');
  const [rbacRole, setRbacRole] = useState<RbacRole>('PUBLIC_BRIEF');
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  const [mapsApiKey, setMapsApiKey] = useState<string>(
    () => (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? ''
  );

  const [layers, setLayers] = useState<MapLayersState>({
    kineticIncidents: true,
    diplomaticCorridors: true,
    rangeRings: true,
    leadershipPins: true,
    chokepoints: true,
    threatDensity: true,
  });

  // Intelligence Data State
  const [statements, setStatements] = useState<LeadershipStatement[]>(SEED_STATEMENTS);
  const [scenarios, setScenarios] = useState<ProjectedScenario[]>(SEED_SCENARIOS);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [lastSweptLabel, setLastSweptLabel] = useState<string>('2026-11-16 Baseline');

  // Statement Feed Filters
  const [categoryFilter, setCategoryFilter] = useState<StatementCategory | 'ALL'>('ALL');
  const [regimeFilter, setRegimeFilter] = useState<RegimeAlignment | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sweepQuery, setSweepQuery] = useState('');

  // Scenario Engine Filters
  const [regionFilter, setRegionFilter] = useState('all');
  const [horizonFilter, setHorizonFilter] = useState('all');
  const [stressFilter, setStressFilter] = useState('all');

  // Historical Timeline State
  const [activeMilestoneIdx, setActiveMilestoneIdx] = useState(
    HISTORICAL_MILESTONES.length - 1
  );

  // Report Selection & Export Modal State
  const [selectedReportStatementIds, setSelectedReportStatementIds] = useState<string[]>([]);
  const [selectedReportScenarioIds, setSelectedReportScenarioIds] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Map Focus & Selection State
  const [selectedItem, setSelectedItem] = useState<
    | { kind: 'statement'; data: LeadershipStatement }
    | { kind: 'incident'; data: KineticIncident }
    | { kind: 'hotspot'; data: RegionalThreatHotspot }
    | null
  >(null);
  const [focusCoords, setFocusCoords] = useState<[number, number] | null>(null);

  // Loading & Error States
  const [isSweeping, setIsSweeping] = useState(false);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  // Listen for Google Maps Platform quota events
  useEffect(() => {
    const onQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  // Fetch server config for Maps key if not bundled in Vite env
  useEffect(() => {
    if (mapsApiKey) return;
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { mapsApiKey?: string } | null) => {
        if (data?.mapsApiKey) {
          setMapsApiKey(data.mapsApiKey);
        }
      })
      .catch(() => {
        // Non-fatal; D3 projections remain available
      });
  }, [mapsApiKey]);

  const handleToggleLayer = useCallback((key: keyof MapLayersState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const filteredStatements = useMemo(
    () =>
      filterStatements(statements, {
        category: categoryFilter,
        regime: regimeFilter,
        searchQuery,
      }),
    [statements, categoryFilter, regimeFilter, searchQuery]
  );

  const filteredScenarios = useMemo(
    () =>
      filterScenarios(scenarios, {
        region: regionFilter,
        horizon: horizonFilter,
        stressFocus: stressFilter,
        role: rbacRole,
      }),
    [scenarios, regionFilter, horizonFilter, stressFilter, rbacRole]
  );

  const threatHotspots = useMemo(
    () =>
      computeHistoricalThreatHotspots(
        HISTORICAL_MILESTONES,
        SEED_INCIDENTS,
        statements
      ),
    [statements]
  );

  const handleSelectStatement = useCallback((stmt: LeadershipStatement) => {
    setSelectedItem({ kind: 'statement', data: stmt });
    setFocusCoords(stmt.coordinates);
  }, []);

  const handleSelectIncident = useCallback((inc: KineticIncident) => {
    setSelectedItem({ kind: 'incident', data: inc });
    setFocusCoords(inc.coordinates);
  }, []);

  const handleSelectHotspot = useCallback((hotspot: RegionalThreatHotspot) => {
    setSelectedItem({ kind: 'hotspot', data: hotspot });
    setFocusCoords(hotspot.coordinates);
  }, []);

  const handleToggleReportStatement = useCallback((id: string) => {
    setSelectedReportStatementIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleToggleReportScenario = useCallback((id: string) => {
    setSelectedReportScenarioIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleOpenExportModal = useCallback(() => {
    setSelectedReportStatementIds((prev) =>
      prev.length > 0 ? prev : filteredStatements.map((s) => s.id)
    );
    setSelectedReportScenarioIds((prev) =>
      prev.length > 0
        ? prev
        : filteredScenarios.map((sc, idx) => sc.id || `scen-idx-${idx}`)
    );
    setIsExportModalOpen(true);
  }, [filteredStatements, filteredScenarios]);

  const handleMatchPrecedent = useCallback((stmt: LeadershipStatement) => {
    const matches = findMatchingMilestones(
      `${stmt.region ?? ''} ${stmt.verbatim_quote} ${stmt.country_iso3}`,
      HISTORICAL_MILESTONES
    );
    if (matches.length > 0) {
      const idx = HISTORICAL_MILESTONES.findIndex((m) => m.id === matches[0].id);
      if (idx >= 0) setActiveMilestoneIdx(idx);
    }
    setActiveTab('timeline');
  }, []);

  const handleInspectPrecedentText = useCallback((text: string) => {
    const matches = findMatchingMilestones(text, HISTORICAL_MILESTONES);
    if (matches.length > 0) {
      const idx = HISTORICAL_MILESTONES.findIndex((m) => m.id === matches[0].id);
      if (idx >= 0) setActiveMilestoneIdx(idx);
    }
    setActiveTab('timeline');
  }, []);

  const handleLocateTheater = useCallback((coords: [number, number]) => {
    setFocusCoords(coords);
    setActiveTab('map');
  }, []);

  const runLiveSweep = useCallback(async () => {
    setIsSweeping(true);
    setBannerError(null);
    try {
      const res = await fetch('/api/intelligence/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: regionFilter === 'all' ? 'Global' : regionFilter,
          focusQuery: sweepQuery.trim(),
        }),
      });
      const payload = (await res.json()) as Partial<IntelligenceSweepResponse> & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Sweep failed with HTTP ${res.status}`);
      }

      const normalized = normalizeSweepPayload(payload);
      if (normalized.leadership_statements.length > 0) {
        setStatements((prev) => {
          const existingIds = new Set(normalized.leadership_statements.map((s) => s.id));
          return [
            ...normalized.leadership_statements,
            ...prev.filter((p) => !existingIds.has(p.id)),
          ];
        });
      }
      if (normalized.projected_scenarios.length > 0) {
        setScenarios((prev) => [...normalized.projected_scenarios, ...prev]);
      }
      if (Array.isArray(payload.groundingSources)) {
        setGroundingSources(payload.groundingSources);
      }
      setLastSweptLabel(new Date().toISOString().slice(11, 19) + ' UTC');
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Unable to complete live grounding sweep.'
      );
    } finally {
      setIsSweeping(false);
    }
  }, [regionFilter, sweepQuery]);

  const handleGenerateScenarios = useCallback(
    async (params: {
      region: string;
      horizon: string;
      stressFocus: string;
      customPrompt: string;
    }) => {
      setIsGeneratingScenarios(true);
      setBannerError(null);
      try {
        const res = await fetch('/api/intelligence/scenarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const payload = (await res.json()) as Partial<IntelligenceSweepResponse> & {
          error?: string;
        };
        if (!res.ok) {
          throw new Error(payload.error || `Scenario synthesis failed (${res.status})`);
        }
        const normalized = normalizeSweepPayload(payload);
        if (normalized.projected_scenarios.length > 0) {
          setScenarios((prev) => [...normalized.projected_scenarios, ...prev]);
        }
        if (normalized.leadership_statements.length > 0) {
          setStatements((prev) => [...normalized.leadership_statements, ...prev]);
        }
        if (Array.isArray(payload.groundingSources)) {
          setGroundingSources(payload.groundingSources);
        }
        setLastSweptLabel(new Date().toISOString().slice(11, 19) + ' UTC');
      } catch (err) {
        setBannerError(
          err instanceof Error ? err.message : 'Unable to synthesize projected scenarios.'
        );
      } finally {
        setIsGeneratingScenarios(false);
      }
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#07090E] text-slate-100">
      {/* Required Google Maps Platform Demo Key Quota Banner */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRunSweep={runLiveSweep}
        isSweeping={isSweeping}
      />

      <WorkspaceToolbar
        activeTab={activeTab}
        projection={projection}
        onChangeProjection={setProjection}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        rbacRole={rbacRole}
        onChangeRbacRole={setRbacRole}
        statementCount={statements.length}
        lastSweptLabel={lastSweptLabel}
        selectedReportCount={
          selectedReportStatementIds.length + selectedReportScenarioIds.length
        }
        onOpenExportModal={handleOpenExportModal}
      />

      {/* Global API Error Banner */}
      {bannerError && activeTab !== 'scenarios' && (
        <div
          role="alert"
          className="bg-red-950/70 border-b border-red-800/80 px-6 py-2.5 flex items-center justify-between gap-4 text-xs text-red-200"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{bannerError}</span>
          </div>
          <button
            type="button"
            aria-label="Dismiss alert"
            onClick={() => setBannerError(null)}
            className="text-red-300 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0">
        {activeTab === 'map' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-7rem)]">
            {/* Geospatial Viewport (8 cols on desktop) */}
            <div className="lg:col-span-8 relative flex flex-col min-h-[540px]">
              <div className="flex-1 relative">
                {projection === 'mercator' ? (
                  <GoogleMercatorMap
                    apiKey={mapsApiKey}
                    incidents={SEED_INCIDENTS}
                    corridors={SEED_CORRIDORS}
                    statements={filteredStatements}
                    chokepoints={SOUTHERN_CHOKEPOINTS}
                    hotspots={threatHotspots}
                    layers={layers}
                    selectedId={selectedItem?.data.id ?? null}
                    onSelectStatement={handleSelectStatement}
                    onSelectIncident={handleSelectIncident}
                    onSelectHotspot={handleSelectHotspot}
                    focusCoords={focusCoords}
                    onSwitchToSouthPole={() => setProjection('azimuthal-south')}
                  />
                ) : (
                  <D3AzimuthalMap
                    mode={projection}
                    incidents={SEED_INCIDENTS}
                    corridors={SEED_CORRIDORS}
                    statements={filteredStatements}
                    chokepoints={SOUTHERN_CHOKEPOINTS}
                    hotspots={threatHotspots}
                    layers={layers}
                    selectedId={selectedItem?.data.id ?? null}
                    onSelectStatement={handleSelectStatement}
                    onSelectIncident={handleSelectIncident}
                    onSelectHotspot={handleSelectHotspot}
                    focusCoords={focusCoords}
                  />
                )}
              </div>

              {/* Active Selection Tactical Dossier Bar */}
              {selectedItem && (
                <div className="border-t border-slate-800 bg-[#0B0F17] px-5 py-3 flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                      <Crosshair className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {selectedItem.kind === 'statement'
                          ? `${selectedItem.data.country_iso3} · ${selectedItem.data.official_title}`
                          : selectedItem.kind === 'incident'
                          ? `${selectedItem.data.theater} · ${selectedItem.data.severity}`
                          : `${selectedItem.data.region} · Density ${selectedItem.data.densityScore}/100 (${selectedItem.data.historicalConflictCount} eras · ${selectedItem.data.eraSpan})`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 line-clamp-2">
                      {selectedItem.kind === 'statement'
                        ? selectedItem.data.verbatim_quote
                        : selectedItem.data.summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFocusCoords(null)}
                      className="px-2.5 py-1.5 text-xs rounded border border-slate-700 text-slate-300 hover:text-white"
                    >
                      Reset Ring Origin
                    </button>
                    <button
                      type="button"
                      aria-label="Close tactical dossier bar"
                      onClick={() => setSelectedItem(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Verified Leadership Statement Feed (4 cols on desktop) */}
            <div className="lg:col-span-4 lg:h-[calc(100vh-7rem)] lg:overflow-hidden">
              <StatementFeed
                statements={filteredStatements}
                categoryFilter={categoryFilter}
                onChangeCategory={setCategoryFilter}
                regimeFilter={regimeFilter}
                onChangeRegime={setRegimeFilter}
                searchQuery={searchQuery}
                onChangeSearch={setSearchQuery}
                selectedId={selectedItem?.data.id ?? null}
                onSelectStatement={handleSelectStatement}
                onMatchPrecedent={handleMatchPrecedent}
                selectedForReportIds={selectedReportStatementIds}
                onToggleReportSelection={handleToggleReportStatement}
                rbacRole={rbacRole}
                groundingSources={groundingSources}
                sweepQuery={sweepQuery}
                onChangeSweepQuery={setSweepQuery}
                onRunCustomSweep={runLiveSweep}
                isSweeping={isSweeping}
              />
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <ScenariosEngine
            scenarios={filteredScenarios}
            regionFilter={regionFilter}
            onChangeRegion={setRegionFilter}
            horizonFilter={horizonFilter}
            onChangeHorizon={setHorizonFilter}
            stressFilter={stressFilter}
            onChangeStress={setStressFilter}
            rbacRole={rbacRole}
            onGenerateScenarios={handleGenerateScenarios}
            isGenerating={isGeneratingScenarios}
            errorMsg={bannerError}
            groundingSources={groundingSources}
            onInspectPrecedent={handleInspectPrecedentText}
            selectedScenarioIds={selectedReportScenarioIds}
            onToggleScenarioSelection={handleToggleReportScenario}
            onOpenExportModal={handleOpenExportModal}
          />
        )}

        {activeTab === 'timeline' && (
          <HistoricalTimeline
            milestones={HISTORICAL_MILESTONES}
            activeIndex={activeMilestoneIdx}
            onSelectIndex={setActiveMilestoneIdx}
            statements={statements}
            scenarios={scenarios}
            onLocateTheater={handleLocateTheater}
          />
        )}
      </main>

      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        statements={statements}
        scenarios={scenarios}
        hotspots={threatHotspots}
        selectedStatementIds={selectedReportStatementIds}
        onToggleStatementId={handleToggleReportStatement}
        onSetStatementIds={setSelectedReportStatementIds}
        selectedScenarioIds={selectedReportScenarioIds}
        onToggleScenarioId={handleToggleReportScenario}
        onSetScenarioIds={setSelectedReportScenarioIds}
        rbacRole={rbacRole}
        projectionMode={projection}
      />
    </div>
  );
}
