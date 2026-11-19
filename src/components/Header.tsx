import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { WorkspaceTab } from '../types/aegis';

interface HeaderProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onRunSweep: () => void;
  isSweeping: boolean;
}

const NAV_ITEMS: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'map', label: 'Strategic Map' },
  { id: 'scenarios', label: 'Projected Scenarios' },
  { id: 'timeline', label: '1945–2026 Timeline' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onRunSweep,
  isSweeping,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0B0F17] px-4 md:px-6 flex flex-wrap md:flex-nowrap md:h-14 items-center justify-between gap-x-6 gap-y-0 shrink-0">
      {/* Zone 1: Single-line Brand Wordmark */}
      <button
        type="button"
        onClick={() => onSelectTab('map')}
        className="h-12 md:h-auto font-display text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 order-1"
      >
        AEGIS-1945
      </button>

      {/* Zone 2: Clean single-line text navigation */}
      <nav
        aria-label="Primary observatory views"
        className="w-full md:w-auto flex items-center gap-5 md:gap-6 overflow-x-auto border-t border-slate-800/80 md:border-t-0 order-3 md:order-2"
      >
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`py-2.5 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                active
                  ? 'border-cyan-400 text-slate-50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Single Primary Action */}
      <div className="flex items-center shrink-0 order-2 md:order-3">
        <button
          type="button"
          onClick={onRunSweep}
          disabled={isSweeping}
          className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs font-semibold rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isSweeping ? 'Sweeping Sources…' : 'Live Grounding Sweep'}
          </span>
          <span className="sm:hidden">{isSweeping ? 'Sweeping…' : 'Live Sweep'}</span>
        </button>
      </div>
    </header>
  );
};
