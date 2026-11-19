import React from 'react';
import {
  Compass,
  FileDown,
  Globe,
  Layers,
  Lock,
  Radio,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import type {
  MapLayersState,
  ProjectionMode,
  RbacRole,
  WorkspaceTab,
} from '../types/aegis';

interface WorkspaceToolbarProps {
  activeTab: WorkspaceTab;
  projection: ProjectionMode;
  onChangeProjection: (mode: ProjectionMode) => void;
  layers: MapLayersState;
  onToggleLayer: (key: keyof MapLayersState) => void;
  rbacRole: RbacRole;
  onChangeRbacRole: (role: RbacRole) => void;
  statementCount: number;
  lastSweptLabel: string;
  selectedReportCount: number;
  onOpenExportModal: () => void;
}

const PROJECTION_OPTIONS: Array<{
  id: ProjectionMode;
  label: string;
  shortDesc: string;
}> = [
  {
    id: 'mercator',
    label: 'Mercator',
    shortDesc: 'Google Maps Dark Vector',
  },
  {
    id: 'azimuthal-eq',
    label: 'Azimuthal Eq',
    shortDesc: 'Centered [0°, 0°]',
  },
  {
    id: 'azimuthal-south',
    label: 'South-Pole',
    shortDesc: 'Antarctica Center [0, 90]',
  },
];

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  activeTab,
  projection,
  onChangeProjection,
  layers,
  onToggleLayer,
  rbacRole,
  onChangeRbacRole,
  statementCount,
  lastSweptLabel,
  selectedReportCount,
  onOpenExportModal,
}) => {
  return (
    <div className="border-b border-slate-800 bg-[#0D121C] px-4 md:px-6 py-2 flex flex-wrap xl:flex-nowrap items-center justify-between gap-2.5">
      {activeTab === 'map' ? (
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          {/* Tri-Projection Mode Switcher */}
          <div
            role="group"
            aria-label="Geospatial projection mode"
            className="inline-flex items-center p-1 bg-[#07090E] border border-slate-800 rounded-md gap-1"
          >
            {PROJECTION_OPTIONS.map((opt) => {
              const isActive = projection === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeProjection(opt.id)}
                  aria-pressed={isActive}
                  title={opt.shortDesc}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {opt.id === 'mercator' ? (
                    <Globe className="w-3.5 h-3.5" />
                  ) : (
                    <Compass className="w-3.5 h-3.5" />
                  )}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Map Layers */}
          <div
            role="group"
            aria-label="Map tactical layers"
            className="flex flex-wrap items-center gap-1"
          >
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 mr-0.5 whitespace-nowrap">
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Layers:</span>
            </span>
            {(
              [
                { key: 'threatDensity', label: 'Density' },
                { key: 'kineticIncidents', label: 'Incidents' },
                { key: 'diplomaticCorridors', label: 'Corridors' },
                { key: 'rangeRings', label: 'Rings' },
                { key: 'leadershipPins', label: 'Statements' },
                { key: 'chokepoints', label: 'Chokepoints' },
              ] as const
            ).map((layer) => {
              const active = layers[layer.key];
              return (
                <button
                  key={layer.key}
                  type="button"
                  onClick={() => onToggleLayer(layer.key)}
                  aria-pressed={active}
                  className={`px-2 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    active
                      ? layer.key === 'threatDensity'
                        ? 'bg-amber-500/15 text-amber-200 border-amber-500/45'
                        : 'bg-slate-800 text-slate-100 border-slate-600'
                      : 'bg-transparent text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {layer.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
          <span className="inline-flex items-center gap-1.5 text-slate-200 font-sans font-medium">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Verified Feed Baseline
          </span>
          <span aria-hidden="true">·</span>
          <span>{statementCount} Confirmed Records</span>
          <span aria-hidden="true">·</span>
          <span>Last Grounding: {lastSweptLabel}</span>
        </div>
      )}

      {/* Export Report & RBAC Access Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 sm:ml-auto">
        <button
          type="button"
          onClick={onOpenExportModal}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border border-slate-700 bg-[#07090E] text-slate-100 hover:border-cyan-500/50 hover:text-cyan-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <FileDown className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Export{selectedReportCount > 0 ? ` (${selectedReportCount})` : ' Report'}
          </span>
        </button>

        <div
          role="group"
          aria-label="RBAC clearance mode"
          className="inline-flex items-center p-1 bg-[#07090E] border border-slate-800 rounded-md gap-1 max-w-full"
        >
          <button
            type="button"
            onClick={() => onChangeRbacRole('PUBLIC_BRIEF')}
            aria-pressed={rbacRole === 'PUBLIC_BRIEF'}
            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              rbacRole === 'PUBLIC_BRIEF'
                ? 'bg-slate-800 text-slate-100 border border-slate-600'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Public Brief</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeRbacRole('PRIVATE_ANALYST')}
            aria-pressed={rbacRole === 'PRIVATE_ANALYST'}
            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              rbacRole === 'PRIVATE_ANALYST'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Unlock className="w-3 h-3" />
            <span>Private Analyst</span>
          </button>
        </div>

        <ShieldCheck
          aria-label={rbacRole === 'PRIVATE_ANALYST' ? 'RBAC Full Dossier' : 'RBAC Open Sources'}
          className="w-4 h-4 text-emerald-400 hidden sm:block"
        />
      </div>
    </div>
  );
};
