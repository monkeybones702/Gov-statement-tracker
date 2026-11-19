import React from 'react';
import { ArrowRight, BookOpen, Crosshair, History } from 'lucide-react';
import type {
  HistoricalMilestone,
  LeadershipStatement,
  ProjectedScenario,
} from '../types/aegis';
import { findMatchingMilestones } from '../utils/intelligence';

interface HistoricalTimelineProps {
  milestones: HistoricalMilestone[];
  activeIndex: number;
  onSelectIndex: (idx: number) => void;
  statements: LeadershipStatement[];
  scenarios: ProjectedScenario[];
  onLocateTheater: (coords: [number, number]) => void;
}

export const HistoricalTimeline: React.FC<HistoricalTimelineProps> = ({
  milestones,
  activeIndex,
  onSelectIndex,
  statements,
  scenarios,
  onLocateTheater,
}) => {
  const safeIdx = Math.max(0, Math.min(milestones.length - 1, activeIndex));
  const active = milestones[safeIdx];

  const matchingStatements = statements.filter((stmt) => {
    const matches = findMatchingMilestones(
      `${stmt.region ?? ''} ${stmt.verbatim_quote} ${stmt.country_iso3}`,
      [active]
    );
    return matches.length > 0;
  });

  const matchingScenarios = scenarios.filter((scen) => {
    const matches = findMatchingMilestones(
      `${scen.scenario_title} ${scen.historical_precedent_ref} ${scen.primary_actors.join(' ')}`,
      [active]
    );
    return matches.length > 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Horizontal Interactive Scrubber Header */}
      <section className="bg-[#0B0F17] border border-slate-800 rounded p-5 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-50">
              Post-WWII Historical Conflict Timeline (1945–2026)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Anchored at September 2, 1945 (Official End of WWII) through 2026 multi-theater
              deterrence shifts.
            </p>
          </div>
          <div className="text-xs font-mono text-cyan-300 tabular-nums">
            Era {safeIdx + 1} / {milestones.length} · Anchor {active.anchor_date}
          </div>
        </div>

        {/* Horizontal Era Stepper Nodes */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max">
            {milestones.map((m, idx) => {
              const isActive = idx === safeIdx;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectIndex(idx)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`px-3 py-2 rounded border text-left transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    isActive
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                      : 'bg-[#07090E] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-mono tabular-nums">{m.year_label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Continuous Range Scrubber */}
        <div className="space-y-1.5">
          <label htmlFor="wwii-scrubber" className="sr-only">
            Scrub historical era from 1945 to 2026
          </label>
          <input
            id="wwii-scrubber"
            type="range"
            min={0}
            max={milestones.length - 1}
            step={1}
            value={safeIdx}
            onChange={(e) => onSelectIndex(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
            <span>1945-09-02 (End of WWII)</span>
            <span>1962 (Cuban Missile Crisis)</span>
            <span>1991 (USSR Dissolution)</span>
            <span>2026-11-16 (Present)</span>
          </div>
        </div>
      </section>

      {/* Active Milestone Dossier & Live Precedent Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Dossier */}
        <section className="lg:col-span-7 bg-[#0B0F17] border border-slate-800 rounded p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-mono text-cyan-300 tabular-nums truncate min-w-0">
              {active.year_label} · Anchor {active.anchor_date} · Actors:{' '}
              {active.key_actors.join(', ')}
            </span>
            <button
              type="button"
              onClick={() => onLocateTheater(active.theater_coordinates)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-700 text-slate-200 hover:border-cyan-500 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Locate Theater on Map</span>
            </button>
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-50">
            {active.title}
          </h2>

          <p className="text-sm font-medium text-slate-200 leading-relaxed">
            {active.structural_shift}
          </p>

          <p className="text-sm text-slate-400 leading-relaxed">{active.dossier_summary}</p>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Strategic Precedent for 2026</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {active.lessons_for_2026}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
            Precedent Index: {active.precedent_tags.join(' · ')}
          </div>
        </section>

        {/* Right Precedent Correlation */}
        <section className="lg:col-span-5 bg-[#0B0F17] border border-slate-800 rounded p-5 space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display text-sm font-semibold text-slate-100">
              2026 Precedent Correlation
            </h3>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-300">
              Correlated Projected Scenarios ({matchingScenarios.length})
            </div>
            {matchingScenarios.length === 0 ? (
              <p className="text-xs text-slate-500">
                No active scenario directly overlaps this era’s primary actors or precedent tags.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80 border-t border-slate-800/80">
                {matchingScenarios.map((sc, i) => (
                  <div key={sc.id || i} className="py-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-100">
                        {sc.scenario_title}
                      </span>
                      <span className="font-mono text-cyan-300 tabular-nums shrink-0">
                        {sc.probability_index}%
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1">{sc.historical_precedent_ref}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-xs font-medium text-slate-300">
              Correlated Verified Statements ({matchingStatements.length})
            </div>
            {matchingStatements.length === 0 ? (
              <p className="text-xs text-slate-500">
                Select 1962, 1979–1989, 2014–Present, or 2023–2026 to inspect live matching
                statements.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80 border-t border-slate-800/80">
                {matchingStatements.slice(0, 3).map((st) => (
                  <div key={st.id} className="py-2.5 text-xs">
                    <div className="font-mono text-[11px] text-slate-400">
                      {st.country_iso3} · {st.official_title}
                    </div>
                    <div className="text-slate-300 mt-1 line-clamp-2">
                      “{st.verbatim_quote}”
                    </div>
                    <button
                      type="button"
                      onClick={() => onLocateTheater(st.coordinates)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                    >
                      <span>View on Map</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
