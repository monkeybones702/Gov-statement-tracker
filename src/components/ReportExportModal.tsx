import React, { useEffect, useMemo, useState } from 'react';
import { CheckSquare, Download, FileText, Lock, Square, Unlock, X } from 'lucide-react';
import type {
  LeadershipStatement,
  ProjectedScenario,
  ProjectionMode,
  RbacRole,
  RegionalThreatHotspot,
} from '../types/aegis';
import {
  buildIntelligenceReportPdf,
  buildIntelligenceReportText,
  downloadReportFile,
} from '../utils/reportExport';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  statements: LeadershipStatement[];
  scenarios: ProjectedScenario[];
  hotspots: RegionalThreatHotspot[];
  selectedStatementIds: string[];
  onToggleStatementId: (id: string) => void;
  onSetStatementIds: (ids: string[]) => void;
  selectedScenarioIds: string[];
  onToggleScenarioId: (id: string) => void;
  onSetScenarioIds: (ids: string[]) => void;
  rbacRole: RbacRole;
  projectionMode: ProjectionMode;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  statements,
  scenarios,
  hotspots,
  selectedStatementIds,
  onToggleStatementId,
  onSetStatementIds,
  selectedScenarioIds,
  onToggleScenarioId,
  onSetScenarioIds,
  rbacRole,
  projectionMode,
}) => {
  const [reportTitle, setReportTitle] = useState(
    'AEGIS-1945 Strategic Intelligence Briefing'
  );
  const [includeHotspots, setIncludeHotspots] = useState(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const selectedStatements = useMemo(
    () => statements.filter((s) => selectedStatementIds.includes(s.id)),
    [statements, selectedStatementIds]
  );

  const selectedScenarios = useMemo(
    () =>
      scenarios.filter((sc, idx) =>
        selectedScenarioIds.includes(sc.id || `scen-idx-${idx}`)
      ),
    [scenarios, selectedScenarioIds]
  );

  const generatedAtUtc = useMemo(
    () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    [isOpen, selectedStatementIds.length, selectedScenarioIds.length, rbacRole]
  );

  const previewText = useMemo(
    () =>
      buildIntelligenceReportText({
        title: reportTitle,
        generatedAtUtc,
        rbacRole,
        projectionMode,
        statements: selectedStatements,
        scenarios: selectedScenarios,
        hotspots: includeHotspots ? hotspots : [],
      }),
    [
      reportTitle,
      generatedAtUtc,
      rbacRole,
      projectionMode,
      selectedStatements,
      selectedScenarios,
      includeHotspots,
      hotspots,
    ]
  );

  if (!isOpen) return null;

  const hasSelection =
    selectedStatements.length > 0 || selectedScenarios.length > 0;
  const dateStamp = new Date().toISOString().slice(0, 10);

  const handleDownloadTxt = () => {
    const filename = `aegis-1945-intelligence-report-${dateStamp}.txt`;
    downloadReportFile(previewText, filename, 'text/plain;charset=utf-8');
    setExportNotice(`Exported plain-text briefing (${filename}).`);
  };

  const handleDownloadPdf = () => {
    const filename = `aegis-1945-intelligence-report-${dateStamp}.pdf`;
    const pdfBytes = buildIntelligenceReportPdf({
      title: reportTitle,
      generatedAtUtc,
      rbacRole,
      projectionMode,
      statements: selectedStatements,
      scenarios: selectedScenarios,
      hotspots: includeHotspots ? hotspots : [],
    });
    downloadReportFile(pdfBytes, filename, 'application/pdf');
    setExportNotice(`Exported formatted PDF briefing (${filename}).`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-report-modal-title"
    >
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0B0F17] border border-slate-700 rounded shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2
              id="export-report-modal-title"
              className="font-display text-base font-bold text-slate-50"
            >
              Export External Intelligence Briefing
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                {rbacRole === 'PRIVATE_ANALYST' ? (
                  <>
                    <Unlock className="w-3 h-3 text-amber-300" />
                    <span className="text-amber-200">
                      Private Analyst scope (includes internal memos)
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300">
                      Public Brief scope (analyst memos automatically redacted)
                    </span>
                  </>
                )}
              </span>
            </p>
          </div>
          <button
            type="button"
            aria-label="Close export modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Report Title & Options */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <label
                htmlFor="report-title-input"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Briefing Document Title
              </label>
              <input
                id="report-title-input"
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full bg-[#07090E] border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="md:col-span-5">
              <label className="flex items-center gap-2 px-3 py-2 bg-[#07090E] border border-slate-800 rounded text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHotspots}
                  onChange={(e) => setIncludeHotspots(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span>Include 1945–2026 Threat Density Hotspots ({hotspots.length})</span>
              </label>
            </div>
          </div>

          {/* Two-Column Selector: Statements & Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Statements Checklist */}
            <section className="bg-[#07090E] border border-slate-800 rounded flex flex-col max-h-60">
              <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  Leadership Statements ({selectedStatements.length}/{statements.length})
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => onSetStatementIds(statements.map((s) => s.id))}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    Select All
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={() => onSetStatementIds([])}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70">
                {statements.map((stmt) => {
                  const checked = selectedStatementIds.includes(stmt.id);
                  return (
                    <label
                      key={stmt.id}
                      className="flex items-start gap-2.5 px-3.5 py-2.5 text-xs hover:bg-slate-900/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleStatementId(stmt.id)}
                        className="mt-0.5 accent-cyan-400"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[11px] text-slate-400">
                          {stmt.country_iso3} · {stmt.category}
                        </span>
                        <span className="block text-slate-200 truncate">
                          {stmt.official_title}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Scenario Projections Checklist */}
            <section className="bg-[#07090E] border border-slate-800 rounded flex flex-col max-h-60">
              <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  Scenario Projections ({selectedScenarios.length}/{scenarios.length})
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() =>
                      onSetScenarioIds(
                        scenarios.map((sc, idx) => sc.id || `scen-idx-${idx}`)
                      )
                    }
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    Select All
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={() => onSetScenarioIds([])}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70">
                {scenarios.map((scen, idx) => {
                  const scenId = scen.id || `scen-idx-${idx}`;
                  const checked = selectedScenarioIds.includes(scenId);
                  return (
                    <label
                      key={scenId}
                      className="flex items-start gap-2.5 px-3.5 py-2.5 text-xs hover:bg-slate-900/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleScenarioId(scenId)}
                        className="mt-0.5 accent-cyan-400"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[11px] text-slate-400">
                          {scen.probability_index}% · {scen.time_horizon} ·{' '}
                          {scen.region || 'Multi-Theater'}
                        </span>
                        <span className="block text-slate-200 truncate">
                          {scen.scenario_title}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Live Briefing Preview */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
              <span className="font-medium inline-flex items-center gap-1.5">
                {hasSelection ? (
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>Briefing Output Preview</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                {previewText.split('\n').length} lines
              </span>
            </div>
            <pre
              data-testid="report-export-preview"
              className="bg-[#07090E] border border-slate-800 rounded p-3.5 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed"
            >
              {previewText}
            </pre>
          </div>

          {exportNotice && (
            <div
              role="status"
              className="px-3.5 py-2 rounded bg-emerald-950/50 border border-emerald-700/60 text-xs text-emerald-200"
            >
              {exportNotice}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#0D121C] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {hasSelection
              ? `Ready to export ${selectedStatements.length} statement(s) and ${selectedScenarios.length} scenario(s).`
              : 'Select at least one statement or scenario projection to export.'}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadTxt}
              disabled={!hasSelection}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded border border-slate-700 text-slate-100 hover:bg-slate-800 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Text (.txt)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!hasSelection}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF (.pdf)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
