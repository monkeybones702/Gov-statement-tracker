import type {
  IntelligenceReportInput,
  ProjectionMode,
  ProjectedScenario,
  LeadershipStatement,
} from '../types/aegis';

function projectionLabel(mode: ProjectionMode): string {
  switch (mode) {
    case 'mercator':
      return 'Standard Mercator (Google Maps)';
    case 'azimuthal-eq':
      return 'Azimuthal Equatorial [0, 0]';
    case 'azimuthal-south':
      return 'South-Pole Center Azimuthal [0, 90]';
  }
}

export function sanitizePdfText(input: string): string {
  return input
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00B7/g, '|')
    .replace(/\u00B0/g, ' deg')
    .replace(/\u2022/g, '*')
    .replace(/[^\x20-\x7E\n]/g, ' ');
}

export function wrapTextLines(text: string, maxChars: number): string[] {
  const normalized = sanitizePdfText(text).replace(/\r\n/g, '\n');
  const paragraphs = normalized.split('\n');
  const out: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      out.push('');
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = '';
    for (const word of words) {
      if (!current) {
        if (word.length <= maxChars) {
          current = word;
        } else {
          for (let i = 0; i < word.length; i += maxChars) {
            const chunk = word.slice(i, i + maxChars);
            if (chunk.length === maxChars) {
              out.push(chunk);
            } else {
              current = chunk;
            }
          }
        }
      } else if (current.length + 1 + word.length <= maxChars) {
        current = `${current} ${word}`;
      } else {
        out.push(current);
        if (word.length <= maxChars) {
          current = word;
        } else {
          current = '';
          for (let i = 0; i < word.length; i += maxChars) {
            const chunk = word.slice(i, i + maxChars);
            if (chunk.length === maxChars) {
              out.push(chunk);
            } else {
              current = chunk;
            }
          }
        }
      }
    }
    if (current) {
      out.push(current);
    }
  }
  return out;
}

function redactStatementForRole(
  stmt: LeadershipStatement,
  rbacRole: IntelligenceReportInput['rbacRole']
): LeadershipStatement {
  if (rbacRole === 'PUBLIC_BRIEF') {
    return { ...stmt, analyst_note: undefined };
  }
  return stmt;
}

function redactScenarioForRole(
  scen: ProjectedScenario,
  rbacRole: IntelligenceReportInput['rbacRole']
): ProjectedScenario {
  if (rbacRole === 'PUBLIC_BRIEF') {
    return { ...scen, private_clearance_memo: undefined };
  }
  return scen;
}

export function buildIntelligenceReportText(input: IntelligenceReportInput): string {
  const lines: string[] = [];
  const divider = '='.repeat(76);
  const subDivider = '-'.repeat(76);

  lines.push(divider);
  lines.push(`AEGIS-1945 // ${input.title.trim() || 'Strategic Intelligence Briefing'}`);
  lines.push(divider);
  lines.push(`Generated (UTC)   : ${input.generatedAtUtc}`);
  lines.push(
    `Clearance Mode    : ${
      input.rbacRole === 'PRIVATE_ANALYST'
        ? 'PRIVATE ANALYST (Full Dossier)'
        : 'PUBLIC BRIEF (Open Sources Only)'
    }`
  );
  lines.push(`Map Projection    : ${projectionLabel(input.projectionMode)}`);
  lines.push(`Selected Records  : ${input.statements.length} Statements | ${input.scenarios.length} Scenarios`);
  lines.push('');

  lines.push('1. VERIFIED LEADERSHIP STATEMENTS');
  lines.push(subDivider);
  if (input.statements.length === 0) {
    lines.push('No verified leadership statements selected for this briefing.');
    lines.push('');
  } else {
    input.statements.forEach((rawStmt, idx) => {
      const stmt = redactStatementForRole(rawStmt, input.rbacRole);
      lines.push(
        `[${idx + 1}] ${stmt.country_iso3} | ${stmt.category} | ${stmt.verification_status} | ${stmt.timestamp_utc}`
      );
      lines.push(`    Official      : ${stmt.official_title} (${stmt.leader_name})`);
      lines.push(`    Alignment     : ${stmt.regime_alignment} | Coordinates: [${stmt.coordinates[1].toFixed(2)}, ${stmt.coordinates[0].toFixed(2)}]`);
      lines.push(`    Statement     : "${stmt.verbatim_quote}"`);
      lines.push(`    Source URL    : ${stmt.official_source_url}`);
      if (stmt.analyst_note) {
        lines.push(`    Analyst Note  : ${stmt.analyst_note}`);
      }
      lines.push('');
    });
  }

  lines.push('2. MULTI-FACTOR SCENARIO PROJECTIONS');
  lines.push(subDivider);
  if (input.scenarios.length === 0) {
    lines.push('No projected scenarios selected for this briefing.');
    lines.push('');
  } else {
    input.scenarios.forEach((rawScen, idx) => {
      const scen = redactScenarioForRole(rawScen, input.rbacRole);
      lines.push(
        `[${idx + 1}] ${scen.scenario_title} (${scen.probability_index}% Probability | ${scen.time_horizon})`
      );
      lines.push(
        `    Theater       : ${scen.region || 'Multi-Theater'} | Actors: ${scen.primary_actors.join(', ') || 'Multilateral'}`
      );
      lines.push(`    Regime Playbook : ${scen.historical_precedent_ref}`);
      lines.push(`    Domestic Fault  : ${scen.internal_domestic_friction}`);
      lines.push(`    Wealth Stress   : ${scen.economic_wealth_stressors}`);
      lines.push(`    Trajectory      : ${scen.escalation_or_deescalation_path}`);
      if (scen.private_clearance_memo) {
        lines.push(`    Clearance Memo  : ${scen.private_clearance_memo}`);
      }
      lines.push('');
    });
  }

  if (input.hotspots && input.hotspots.length > 0) {
    lines.push('3. HISTORICAL THREAT DENSITY HOTSPOTS (1945-2026)');
    lines.push(subDivider);
    input.hotspots.forEach((hs, idx) => {
      lines.push(
        `[${idx + 1}] ${hs.region} (${hs.severityTier} | Density ${hs.densityScore}/100 | ${hs.historicalConflictCount} Historical Eras: ${hs.eraSpan})`
      );
      lines.push(`    Summary       : ${hs.summary}`);
    });
    lines.push('');
  }

  lines.push(divider);
  lines.push('END OF AEGIS-1945 INTELLIGENCE BRIEFING');
  return lines.join('\n');
}

interface PdfLineSpec {
  text: string;
  font: 'F1' | 'F2';
  size: number;
  leading: number;
  colorRgb: [number, number, number];
  indent?: number;
  ruleAfter?: boolean;
}

function escapePdfString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdfSpecs(input: IntelligenceReportInput): PdfLineSpec[] {
  const specs: PdfLineSpec[] = [];
  const darkInk: [number, number, number] = [0.09, 0.13, 0.2];
  const mutedInk: [number, number, number] = [0.32, 0.39, 0.49];
  const accentCyan: [number, number, number] = [0.03, 0.42, 0.56];
  const accentRed: [number, number, number] = [0.68, 0.14, 0.16];
  const accentAmber: [number, number, number] = [0.64, 0.38, 0.03];

  const titleLines = wrapTextLines(
    input.title.trim() || 'AEGIS-1945 Strategic Intelligence Briefing',
    62
  );
  titleLines.forEach((line, idx) => {
    specs.push({
      text: line,
      font: 'F2',
      size: 15,
      leading: idx === titleLines.length - 1 ? 20 : 18,
      colorRgb: darkInk,
    });
  });

  specs.push({
    text: `AEGIS-1945 OBSERVATORY  |  UTC: ${input.generatedAtUtc}  |  CLEARANCE: ${
      input.rbacRole === 'PRIVATE_ANALYST' ? 'PRIVATE ANALYST' : 'PUBLIC BRIEF'
    }`,
    font: 'F1',
    size: 8.5,
    leading: 13,
    colorRgb: accentCyan,
  });
  specs.push({
    text: `Projection: ${projectionLabel(input.projectionMode)}  |  Selected: ${
      input.statements.length
    } Statements, ${input.scenarios.length} Scenarios`,
    font: 'F1',
    size: 8.5,
    leading: 16,
    colorRgb: mutedInk,
    ruleAfter: true,
  });

  // Section 1: Selected Statements
  specs.push({
    text: '1. VERIFIED LEADERSHIP STATEMENTS',
    font: 'F2',
    size: 11,
    leading: 18,
    colorRgb: darkInk,
  });

  if (input.statements.length === 0) {
    specs.push({
      text: 'No leadership statements selected.',
      font: 'F1',
      size: 9.5,
      leading: 15,
      colorRgb: mutedInk,
    });
  } else {
    input.statements.forEach((rawStmt, idx) => {
      const stmt = redactStatementForRole(rawStmt, input.rbacRole);
      const badgeColor =
        stmt.category === 'MILITARY_STRIKE'
          ? accentRed
          : stmt.category === 'ESCALATION_WARNING'
          ? accentAmber
          : accentCyan;

      specs.push({
        text: `[${idx + 1}] ${stmt.country_iso3} | ${stmt.category} | ${stmt.official_title}`,
        font: 'F2',
        size: 9.5,
        leading: 13,
        colorRgb: badgeColor,
      });
      specs.push({
        text: `Leader: ${stmt.leader_name} | Alignment: ${stmt.regime_alignment} | ${stmt.timestamp_utc} | [${stmt.coordinates[1].toFixed(
          2
        )}, ${stmt.coordinates[0].toFixed(2)}]`,
        font: 'F1',
        size: 8,
        leading: 11,
        colorRgb: mutedInk,
        indent: 10,
      });
      for (const qLine of wrapTextLines(`"${stmt.verbatim_quote}"`, 86)) {
        specs.push({
          text: qLine,
          font: 'F1',
          size: 9,
          leading: 12,
          colorRgb: darkInk,
          indent: 10,
        });
      }
      for (const uLine of wrapTextLines(`Source (${stmt.verification_status}): ${stmt.official_source_url}`, 90)) {
        specs.push({
          text: uLine,
          font: 'F1',
          size: 8,
          leading: 11,
          colorRgb: accentCyan,
          indent: 10,
        });
      }
      if (stmt.analyst_note) {
        for (const nLine of wrapTextLines(`Analyst Note: ${stmt.analyst_note}`, 88)) {
          specs.push({
            text: nLine,
            font: 'F1',
            size: 8,
            leading: 11,
            colorRgb: accentAmber,
            indent: 10,
          });
        }
      }
      specs.push({ text: '', font: 'F1', size: 8, leading: 6, colorRgb: darkInk });
    });
  }

  // Section 2: Selected Scenario Projections
  specs.push({
    text: '2. MULTI-FACTOR SCENARIO PROJECTIONS',
    font: 'F2',
    size: 11,
    leading: 18,
    colorRgb: darkInk,
    ruleAfter: true,
  });

  if (input.scenarios.length === 0) {
    specs.push({
      text: 'No scenario projections selected.',
      font: 'F1',
      size: 9.5,
      leading: 15,
      colorRgb: mutedInk,
    });
  } else {
    input.scenarios.forEach((rawScen, idx) => {
      const scen = redactScenarioForRole(rawScen, input.rbacRole);
      for (const hLine of wrapTextLines(
        `[${idx + 1}] ${scen.scenario_title} (${scen.probability_index}% | ${scen.time_horizon})`,
        80
      )) {
        specs.push({
          text: hLine,
          font: 'F2',
          size: 9.5,
          leading: 13,
          colorRgb: darkInk,
        });
      }
      specs.push({
        text: `Region: ${scen.region || 'Multi-Theater'} | Actors: ${
          scen.primary_actors.join(', ') || 'Multilateral'
        }`,
        font: 'F1',
        size: 8,
        leading: 12,
        colorRgb: mutedInk,
        indent: 10,
      });

      const pillars: Array<[string, string, [number, number, number]]> = [
        ['Historical Playbook', scen.historical_precedent_ref, darkInk],
        ['Domestic Fault Lines', scen.internal_domestic_friction, darkInk],
        ['Wealth Stressors', scen.economic_wealth_stressors, darkInk],
        ['Trajectory', scen.escalation_or_deescalation_path, accentCyan],
      ];
      if (scen.private_clearance_memo) {
        pillars.push(['Clearance Memo', scen.private_clearance_memo, accentAmber]);
      }

      for (const [label, body, clr] of pillars) {
        for (const pLine of wrapTextLines(`${label}: ${body}`, 86)) {
          specs.push({
            text: pLine,
            font: 'F1',
            size: 8.5,
            leading: 11.5,
            colorRgb: clr,
            indent: 10,
          });
        }
      }
      specs.push({ text: '', font: 'F1', size: 8, leading: 7, colorRgb: darkInk });
    });
  }

  // Section 3: Threat Density Hotspots (optional)
  if (input.hotspots && input.hotspots.length > 0) {
    specs.push({
      text: '3. HISTORICAL THREAT DENSITY HOTSPOTS (1945-2026)',
      font: 'F2',
      size: 11,
      leading: 18,
      colorRgb: darkInk,
      ruleAfter: true,
    });
    input.hotspots.forEach((hs, idx) => {
      specs.push({
        text: `[${idx + 1}] ${hs.region} - ${hs.severityTier} (${hs.densityScore}/100, ${hs.historicalConflictCount} eras, ${hs.eraSpan})`,
        font: 'F2',
        size: 9,
        leading: 12.5,
        colorRgb: hs.severityTier === 'CRITICAL' ? accentRed : accentAmber,
      });
      for (const sLine of wrapTextLines(hs.summary, 86)) {
        specs.push({
          text: sLine,
          font: 'F1',
          size: 8.5,
          leading: 11.5,
          colorRgb: darkInk,
          indent: 10,
        });
      }
    });
  }

  return specs;
}

export function buildIntelligenceReportPdf(input: IntelligenceReportInput): Uint8Array {
  const specs = buildPdfSpecs(input);
  const pageWidth = 612; // US Letter width in pt
  const pageHeight = 792;
  const leftMargin = 48;
  const topY = 744;
  const bottomY = 58;

  const pages: string[][] = [];
  let currentCmds: string[] = [];
  let y = topY;

  const flushPage = () => {
    if (currentCmds.length > 0) {
      pages.push(currentCmds);
      currentCmds = [];
    }
    y = topY;
  };

  for (const spec of specs) {
    if (y - spec.leading < bottomY) {
      flushPage();
    }
    if (spec.text) {
      const x = leftMargin + (spec.indent ?? 0);
      const [r, g, b] = spec.colorRgb;
      currentCmds.push(
        `BT /${spec.font} ${spec.size.toFixed(1)} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(
          3
        )} rg 1 0 0 1 ${x} ${y.toFixed(1)} Tm (${escapePdfString(spec.text)}) Tj ET`
      );
    }
    y -= spec.leading;
    if (spec.ruleAfter) {
      const ruleY = y + 4;
      currentCmds.push(`0.80 0.84 0.89 RG 0.7 w ${leftMargin} ${ruleY.toFixed(1)} m ${pageWidth - leftMargin} ${ruleY.toFixed(1)} l S`);
      y -= 6;
    }
  }
  if (currentCmds.length > 0 || pages.length === 0) {
    pages.push(currentCmds);
  }

  // Add subtle footer to every page
  const totalPages = pages.length;
  const pageStreams = pages.map((cmds, idx) => {
    const footer = `BT /F1 8.0 Tf 0.42 0.48 0.56 rg 1 0 0 1 ${leftMargin} 32 Tm (AEGIS-1945 Geopolitical Intelligence Observatory  |  Page ${
      idx + 1
    } of ${totalPages}) Tj ET`;
    return [...cmds, footer].join('\n');
  });

  // Assemble PDF objects:
  // 1: Catalog
  // 2: Pages
  // 3: Helvetica (F1)
  // 4: Helvetica-Bold (F2)
  // 5..(4 + 2*N): pairs of (Page, ContentStream)
  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  const pageIds: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    pageIds.push(5 + i * 2);
  }
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${totalPages} >>\nendobj\n`
  );
  objects.push(
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n'
  );
  objects.push(
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n'
  );

  const encoder = new TextEncoder();
  pageStreams.forEach((stream, i) => {
    const pageObjId = 5 + i * 2;
    const contentObjId = 6 + i * 2;
    const streamBytes = encoder.encode(stream);
    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${streamBytes.byteLength} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
  });

  const chunks: string[] = ['%PDF-1.4\n'];
  const offsets: number[] = [0]; // object 0
  let byteCursor = encoder.encode(chunks[0]).byteLength;

  for (const obj of objects) {
    offsets.push(byteCursor);
    chunks.push(obj);
    byteCursor += encoder.encode(obj).byteLength;
  }

  const xrefOffset = byteCursor;
  const xrefLines = [
    `xref\n0 ${objects.length + 1}\n`,
    '0000000000 65535 f \n',
    ...offsets.slice(1).map((off) => `${String(off).padStart(10, '0')} 00000 n \n`),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`,
    `startxref\n${xrefOffset}\n%%EOF\n`,
  ];
  chunks.push(...xrefLines);

  return encoder.encode(chunks.join(''));
}

export function downloadReportFile(
  content: string | Uint8Array,
  filename: string,
  mimeType: string
): void {
  const blobPart: BlobPart =
    content instanceof Uint8Array ? new Uint8Array(content) : content;
  const blob = new Blob([blobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
