import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  ExternalLink,
  Handshake,
  History,
  Landmark,
  Search,
  ShieldAlert,
} from 'lucide-react';
import type {
  GroundingSource,
  LeadershipStatement,
  RbacRole,
  RegimeAlignment,
  StatementCategory,
} from '../types/aegis';
import { isOfficialGovDomain } from '../utils/intelligence';

interface StatementFeedProps {
  statements: LeadershipStatement[];
  categoryFilter: StatementCategory | 'ALL';
  onChangeCategory: (cat: StatementCategory | 'ALL') => void;
  regimeFilter: RegimeAlignment | 'ALL';
  onChangeRegime: (reg: RegimeAlignment | 'ALL') => void;
  searchQuery: string;
  onChangeSearch: (q: string) => void;
  selectedId: string | null;
  onSelectStatement: (stmt: LeadershipStatement) => void;
  onMatchPrecedent: (stmt: LeadershipStatement) => void;
  selectedForReportIds: string[];
  onToggleReportSelection: (id: string) => void;
  rbacRole: RbacRole;
  groundingSources: GroundingSource[];
  sweepQuery: string;
  onChangeSweepQuery: (q: string) => void;
  onRunCustomSweep: () => void;
  isSweeping: boolean;
}

const CATEGORY_TABS: Array<{ id: StatementCategory | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: 'ESCALATION_WARNING', label: 'Escalation' },
  { id: 'MILITARY_STRIKE', label: 'Strike' },
  { id: 'STRATEGIC_DEAL_ECONOMIC', label: 'Economic Deal' },
  { id: 'PEACE_OVERTURE', label: 'Peace' },
];

const REGIME_OPTIONS: Array<{ value: RegimeAlignment | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Alignments' },
  { value: 'LEFT_WING', label: 'Left-Wing' },
  { value: 'CENTER_LEFT', label: 'Center-Left' },
  { value: 'CENTER_RIGHT', label: 'Center-Right' },
  { value: 'RIGHT_WING', label: 'Right-Wing' },
  { value: 'AUTHORITARIAN_STATE', label: 'Authoritarian State' },
  { value: 'THEOCRATIC', label: 'Theocratic' },
];

function categoryMeta(cat: StatementCategory) {
  switch (cat) {
    case 'MILITARY_STRIKE':
      return {
        label: 'Military Strike',
        textClass: 'text-red-400',
        Icon: ShieldAlert,
      };
    case 'ESCALATION_WARNING':
      return {
        label: 'Escalation Warning',
        textClass: 'text-amber-400',
        Icon: AlertTriangle,
      };
    case 'STRATEGIC_DEAL_ECONOMIC':
      return {
        label: 'Strategic Economic Deal',
        textClass: 'text-cyan-400',
        Icon: Landmark,
      };
    case 'PEACE_OVERTURE':
      return {
        label: 'Peace Overture',
        textClass: 'text-emerald-400',
        Icon: Handshake,
      };
  }
}

function formatUtcShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

export const StatementFeed: React.FC<StatementFeedProps> = ({
  statements,
  categoryFilter,
  onChangeCategory,
  regimeFilter,
  onChangeRegime,
  searchQuery,
  onChangeSearch,
  selectedId,
  onSelectStatement,
  onMatchPrecedent,
  selectedForReportIds,
  onToggleReportSelection,
  rbacRole,
  groundingSources,
  sweepQuery,
  onChangeSweepQuery,
  onRunCustomSweep,
  isSweeping,
}) => {
  return (
    <aside
      aria-label="Verified leadership statement feed"
      className="flex flex-col h-full bg-[#0B0F17] border-l border-slate-800"
    >
      {/* Feed Header & Filter Controls */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-sm font-semibold text-slate-100">
              Verified Leadership Feed
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official state ministries &amp; UN records only
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {statements.length} active
          </span>
        </div>

        {/* Live Search Grounding Target Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onRunCustomSweep();
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="live-sweep-topic" className="sr-only">
            Live grounding sweep theater or country query
          </label>
          <input
            id="live-sweep-topic"
            type="text"
            value={sweepQuery}
            onChange={(e) => onChangeSweepQuery(e.target.value)}
            placeholder="Target theater for Gemini sweep (e.g. Red Sea, Baltic)…"
            className="flex-1 min-w-0 bg-[#07090E] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isSweeping}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
          >
            {isSweeping ? 'Sweeping…' : 'Sweep'}
          </button>
        </form>

        {/* Client-side Filter Search & Regime Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <label htmlFor="feed-filter-search" className="sr-only">
              Filter verified statements
            </label>
            <input
              id="feed-filter-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onChangeSearch(e.target.value)}
              placeholder="Filter quotes, ISO3, titles…"
              className="w-full bg-[#07090E] border border-slate-800 rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <label htmlFor="regime-filter" className="sr-only">
            Filter by regime alignment
          </label>
          <select
            id="regime-filter"
            value={regimeFilter}
            onChange={(e) => onChangeRegime(e.target.value as RegimeAlignment | 'ALL')}
            className="bg-[#07090E] border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {REGIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 4-Pillar Segmented Category Filter */}
        <div
          role="group"
          aria-label="Filter by statement pillar"
          className="flex flex-wrap items-center gap-1 bg-[#07090E] p-1 rounded border border-slate-800"
        >
          {CATEGORY_TABS.map((tab) => {
            const active = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeCategory(tab.id)}
                aria-pressed={active}
                className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Statement List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
        {statements.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-300 font-medium">
              No verified statements match current filters
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Clear your search query or select All categories to inspect active state dispatches.
            </p>
            <button
              type="button"
              onClick={() => {
                onChangeCategory('ALL');
                onChangeRegime('ALL');
                onChangeSearch('');
              }}
              className="mt-3 px-3 py-1.5 text-xs font-medium rounded bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors"
            >
              Reset Feed Filters
            </button>
          </div>
        ) : (
          statements.map((stmt) => {
            const meta = categoryMeta(stmt.category);
            const Icon = meta.Icon;
            const isSelected = selectedId === stmt.id;
            const canonicalVerified = isOfficialGovDomain(stmt.official_source_url);

            return (
              <article
                key={stmt.id}
                className={`p-4 transition-colors ${
                  isSelected ? 'bg-slate-900/90' : 'hover:bg-slate-900/40'
                }`}
              >
                {/* Unboxed clean metadata line */}
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400 tabular-nums">
                  <span className="truncate">
                    {stmt.country_iso3} · {formatUtcShort(stmt.timestamp_utc)} ·{' '}
                    {stmt.regime_alignment.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 shrink-0 ${
                      canonicalVerified ? 'text-emerald-400' : 'text-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>
                      {stmt.verification_status === 'UN_TRANSCRIPT'
                        ? 'UN_TRANSCRIPT'
                        : 'VERIFIED_GOV'}
                    </span>
                  </span>
                </div>

                {/* Category + Official Title */}
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${meta.textClass}`} />
                  <span className={meta.textClass}>{meta.label}</span>
                  <span className="text-slate-600" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-slate-200 truncate">{stmt.official_title}</span>
                </div>

                {/* Verbatim Quote */}
                <blockquote className="mt-2 text-xs text-slate-300 leading-relaxed">
                  “{stmt.verbatim_quote}”
                </blockquote>

                {/* RBAC Private Analyst Note */}
                {rbacRole === 'PRIVATE_ANALYST' && stmt.analyst_note && (
                  <div className="mt-2 px-2.5 py-1.5 bg-[#07090E] border border-amber-500/25 rounded text-[11px] text-amber-200/90">
                    Analyst Signal: {stmt.analyst_note}
                  </div>
                )}

                {/* Actions & Canonical URL */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectStatement(stmt)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-slate-700 text-slate-200 hover:border-cyan-500/60 hover:text-cyan-300 transition-colors"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Locate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onMatchPrecedent(stmt)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors"
                    >
                      <History className="w-3 h-3" />
                      <span>Precedent</span>
                    </button>
                    <label className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded border border-slate-800 text-slate-300 hover:border-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedForReportIds.includes(stmt.id)}
                        onChange={() => onToggleReportSelection(stmt.id)}
                        aria-label={`Include ${stmt.country_iso3} statement in report`}
                        className="accent-cyan-400"
                      />
                      <span>Briefing</span>
                    </label>
                  </div>

                  <a
                    href={stmt.official_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline truncate max-w-[180px]"
                    title={stmt.official_source_url}
                  >
                    <span className="truncate">
                      {stmt.official_source_url.replace(/^https?:\/\/(www\.)?/, '')}
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </article>
            );
          })
        )}

        {/* Live Search Grounding Citations when available */}
        {groundingSources.length > 0 && (
          <div className="p-4 bg-[#07090E]">
            <div className="text-xs font-semibold text-slate-200">
              Live Google Search Grounding Sources
            </div>
            <ul className="mt-2 space-y-1">
              {groundingSources.slice(0, 6).map((src) => (
                <li key={src.uri} className="truncate">
                  <a
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline truncate max-w-full"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{src.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};
