import React, { useState } from 'react';
import {
  Activity,
  Building2,
  Download,
  ExternalLink,
  History,
  Lock,
  Scale,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type {
  GroundingSource,
  ProjectedScenario,
  RbacRole,
} from '../types/aegis';

interface ScenariosEngineProps {
  scenarios: ProjectedScenario[];
  regionFilter: string;
  onChangeRegion: (r: string) => void;
  horizonFilter: string;
  onChangeHorizon: (h: string) => void;
  stressFilter: string;
  onChangeStress: (s: string) => void;
  rbacRole: RbacRole;
  onGenerateScenarios: (params: {
    region: string;
    horizon: string;
    stressFocus: string;
    customPrompt: string;
  }) => Promise<void>;
  isGenerating: boolean;
  errorMsg: string | null;
  groundingSources: GroundingSource[];
  onInspectPrecedent: (text: string) => void;
  selectedScenarioIds: string[];
  onToggleScenarioSelection: (id: string) => void;
  onOpenExportModal: () => void;
}

const REGIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'Middle East', label: 'Middle East & Red Sea' },
  { value: 'Eastern Europe', label: 'Eastern Europe' },
  { value: 'Indo-Pacific', label: 'Indo-Pacific' },
  { value: 'South Atlantic', label: 'South Atlantic & Antarctic' },
];

const HORIZONS = [
  { value: 'all', label: 'All Horizons' },
  { value: '30-Day', label: '30-Day Horizon' },
  { value: '90-Day', label: '90-Day Horizon' },
  { value: '365-Day', label: '365-Day Horizon' },
];

const STRESS_FACTORS = [
  { value: 'all', label: 'All 4 Analytical Factors' },
  { value: 'historical', label: 'Historical Regime Playbook' },
  { value: 'domestic', label: 'Ideological & Domestic Fault Lines' },
  { value: 'wealth', label: 'Wealth & Corporate Stressors' },
  { value: 'diplomatic', label: 'Live Diplomatic Signals' },
];

export const ScenariosEngine: React.FC<ScenariosEngineProps> = ({
  scenarios,
  regionFilter,
  onChangeRegion,
  horizonFilter,
  onChangeHorizon,
  stressFilter,
  onChangeStress,
  rbacRole,
  onGenerateScenarios,
  isGenerating,
  errorMsg,
  groundingSources,
  onInspectPrecedent,
  selectedScenarioIds,
  onToggleScenarioSelection,
  onOpenExportModal,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const handleExportBrief = () => {
    const blob = new Blob([JSON.stringify(scenarios, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-1945-scenarios-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header & Synthesis Query Controls */}
      <section className="bg-[#0B0F17] border border-slate-800 rounded p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-50">
              Multi-Factor Projected Events Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Synthesizes post-1945 regime playbooks, left/right domestic coalition pressures,
              sovereign wealth &amp; shipping stressors, and verified leadership statements into
              probability-weighted contingencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report (PDF / TXT)</span>
            </button>
            {rbacRole === 'PRIVATE_ANALYST' && (
              <button
                type="button"
                onClick={handleExportBrief}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dossier JSON</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Live Synthesis Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onGenerateScenarios({
              region: regionFilter === 'all' ? 'Global' : regionFilter,
              horizon: horizonFilter === 'all' ? '90-Day' : horizonFilter,
              stressFocus: stressFilter === 'all' ? 'All 4 Analytical Factors' : stressFilter,
              customPrompt,
            });
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-800"
        >
          <div className="md:col-span-3">
            <label htmlFor="scen-region" className="block text-xs text-slate-400 mb-1">
              Strategic Region
            </label>
            <select
              id="scen-region"
              value={regionFilter}
              onChange={(e) => onChangeRegion(e.target.value)}
              className="w-full bg-[#07090E] border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="scen-horizon" className="block text-xs text-slate-400 mb-1">
              Time Horizon
            </label>
            <select
              id="scen-horizon"
              value={horizonFilter}
              onChange={(e) => onChangeHorizon(e.target.value)}
              className="w-full bg-[#07090E] border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {HORIZONS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="scen-stress" className="block text-xs text-slate-400 mb-1">
              Analytical Stress Factor
            </label>
            <select
              id="scen-stress"
              value={stressFilter}
              onChange={(e) => onChangeStress(e.target.value)}
              className="w-full bg-[#07090E] border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {STRESS_FACTORS.map((sf) => (
                <option key={sf.value} value={sf.value}>
                  {sf.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <label htmlFor="scen-custom" className="block text-xs text-slate-400 mb-1">
                Synthesis Focus (Optional)
              </label>
              <input
                id="scen-custom"
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. LNG insurance shock, Cape port delays…"
                className="w-full bg-[#07090E] border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Synthesizing…' : 'Synthesize Scenarios'}</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div
            role="alert"
            className="p-3 rounded bg-red-950/50 border border-red-800/70 text-xs text-red-200"
          >
            {errorMsg}
          </div>
        )}
      </section>

      {/* Scenario Cards Grid */}
      {scenarios.length === 0 ? (
        <div className="bg-[#0B0F17] border border-slate-800 rounded p-8 text-center">
          <p className="text-sm font-medium text-slate-200">
            No projected scenarios match the selected filters.
          </p>
          <button
            type="button"
            onClick={() => {
              onChangeRegion('all');
              onChangeHorizon('all');
              onChangeStress('all');
            }}
            className="mt-3 px-3.5 py-2 text-xs font-medium rounded bg-slate-800 text-slate-100 hover:bg-slate-700"
          >
            Show All Scenarios
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {scenarios.map((scen, idx) => {
            const probColor =
              scen.probability_index >= 70
                ? 'bg-red-500'
                : scen.probability_index >= 55
                ? 'bg-amber-400'
                : 'bg-cyan-400';

            const scenId = scen.id || `scen-idx-${idx}`;
            const isSelectedForReport = selectedScenarioIds.includes(scenId);

            return (
              <article
                key={scenId}
                className="bg-[#0B0F17] border border-slate-800 rounded p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-4">
                  {/* Unboxed Metadata + Probability Index */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
                        <span>
                          {scen.time_horizon} · {scen.region || 'Multi-Theater'} · Actors:{' '}
                          {scen.primary_actors.join(', ') || 'Multilateral'}
                        </span>
                      </div>
                      <h2 className="font-display text-base font-semibold text-slate-100 mt-1">
                        {scen.scenario_title}
                      </h2>
                    </div>

                    <div className="flex items-start gap-3 shrink-0">
                      <label className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded border border-slate-800 text-slate-300 hover:border-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSelectedForReport}
                          onChange={() => onToggleScenarioSelection(scenId)}
                          aria-label={`Include scenario ${scen.scenario_title} in report`}
                          className="accent-cyan-400"
                        />
                        <span>Briefing</span>
                      </label>
                      <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-slate-50 tabular-nums">
                          {scen.probability_index}%
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Probability
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calibrated Probability Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${probColor}`}
                      style={{ width: `${Math.max(4, Math.min(100, scen.probability_index))}%` }}
                    />
                  </div>

                  {/* 4 Analytical Pillars */}
                  <dl className="space-y-3 pt-1 text-xs">
                    <div>
                      <dt className="inline-flex items-center gap-1.5 font-semibold text-slate-200">
                        <History className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Historical Regime Playbook</span>
                      </dt>
                      <dd className="mt-1 text-slate-400 leading-relaxed flex items-start justify-between gap-2">
                        <span>{scen.historical_precedent_ref}</span>
                        <button
                          type="button"
                          onClick={() => onInspectPrecedent(scen.historical_precedent_ref)}
                          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 shrink-0 underline-offset-2 hover:underline"
                        >
                          Open Era
                        </button>
                      </dd>
                    </div>

                    <div className="pt-2 border-t border-slate-800/70">
                      <dt className="inline-flex items-center gap-1.5 font-semibold text-slate-200">
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ideological &amp; Domestic Fault Lines</span>
                      </dt>
                      <dd className="mt-1 text-slate-400 leading-relaxed">
                        {scen.internal_domestic_friction}
                      </dd>
                    </div>

                    <div className="pt-2 border-t border-slate-800/70">
                      <dt className="inline-flex items-center gap-1.5 font-semibold text-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Wealth &amp; Corporate Stressors</span>
                      </dt>
                      <dd className="mt-1 text-slate-400 leading-relaxed">
                        {scen.economic_wealth_stressors}
                      </dd>
                    </div>

                    <div className="pt-2 border-t border-slate-800/70">
                      <dt className="inline-flex items-center gap-1.5 font-semibold text-slate-200">
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Escalation / De-escalation Path</span>
                      </dt>
                      <dd className="mt-1 text-slate-300 leading-relaxed">
                        {scen.escalation_or_deescalation_path}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* RBAC Private Clearance Note */}
                {rbacRole === 'PRIVATE_ANALYST' && scen.private_clearance_memo ? (
                  <div className="pt-3 border-t border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
                    {scen.private_clearance_memo}
                  </div>
                ) : rbacRole === 'PUBLIC_BRIEF' ? (
                  <div className="pt-2 border-t border-slate-800/70 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                    <Lock className="w-3 h-3" />
                    <span>Switch RBAC mode to Private Analyst for sovereign-debt sensitivity memos</span>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {/* Grounding Sources Footer */}
      {groundingSources.length > 0 && (
        <section className="bg-[#0B0F17] border border-slate-800 rounded p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search Grounding References</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5">
            {groundingSources.map((src) => (
              <a
                key={src.uri}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                <span>{src.title}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
