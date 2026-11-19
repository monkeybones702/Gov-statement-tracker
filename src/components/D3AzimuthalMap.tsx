import React, { useMemo, useState } from 'react';
import { geoAzimuthalEquidistant, geoCircle, geoGraticule, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import worldAtlas from 'world-atlas/countries-110m.json';
import { LocateFixed, Minus, Plus, RotateCcw } from 'lucide-react';
import type {
  DiplomaticCorridor,
  KineticIncident,
  LeadershipStatement,
  MapLayersState,
  ProjectionMode,
  RegionalThreatHotspot,
  SouthernChokepoint,
} from '../types/aegis';
import { computeGreatCircleArc, haversineDistanceKm } from '../utils/intelligence';

interface D3AzimuthalMapProps {
  mode: Extract<ProjectionMode, 'azimuthal-eq' | 'azimuthal-south'>;
  incidents: KineticIncident[];
  corridors: DiplomaticCorridor[];
  statements: LeadershipStatement[];
  chokepoints: SouthernChokepoint[];
  hotspots: RegionalThreatHotspot[];
  layers: MapLayersState;
  selectedId: string | null;
  onSelectStatement: (stmt: LeadershipStatement) => void;
  onSelectIncident: (inc: KineticIncident) => void;
  onSelectHotspot: (hotspot: RegionalThreatHotspot) => void;
  focusCoords: [number, number] | null;
}

const SVG_WIDTH = 920;
const SVG_HEIGHT = 680;
const BASE_SCALE = 112;

export const D3AzimuthalMap: React.FC<D3AzimuthalMapProps> = ({
  mode,
  incidents,
  corridors,
  statements,
  chokepoints,
  hotspots,
  layers,
  selectedId,
  onSelectStatement,
  onSelectIncident,
  onSelectHotspot,
  focusCoords,
}) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [hoveredLabel, setHoveredLabel] = useState<{
    title: string;
    subtitle: string;
    distFromCenterKm: number;
    coords: [number, number];
  } | null>(null);

  const countriesGeo = useMemo(() => {
    const topo = worldAtlas as unknown as Topology<{
      countries: GeometryCollection;
    }>;
    return feature(topo, topo.objects.countries);
  }, []);

  const projectionCenter: [number, number] =
    mode === 'azimuthal-south' ? [0, -90] : [0, 0];

  const projection = useMemo(() => {
    const rotation: [number, number] =
      mode === 'azimuthal-south' ? [0, 90] : [0, 0];
    return geoAzimuthalEquidistant()
      .rotate(rotation)
      .clipAngle(179.5)
      .scale(BASE_SCALE * zoomScale)
      .translate([SVG_WIDTH / 2, SVG_HEIGHT / 2]);
  }, [mode, zoomScale]);

  const pathGen = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => geoGraticule().step([15, 15])(), []);

  const rangeRingDistancesKm = [5000, 10000, 15000, 20000];
  const ringGeometries = useMemo(() => {
    const origin: [number, number] =
      focusCoords ?? (mode === 'azimuthal-south' ? [0, -90] : [0, 0]);
    return rangeRingDistancesKm.map((km) => {
      const degRadius = (km / 6371) * (180 / Math.PI);
      const circle = geoCircle().center(origin).radius(degRadius)();
      return {
        km,
        d: pathGen(circle) || '',
      };
    });
  }, [focusCoords, mode, pathGen]);

  const outerRim = useMemo(() => {
    const sphere = pathGen({ type: 'Sphere' });
    return sphere || '';
  }, [pathGen]);

  const landPaths = useMemo(() => {
    return countriesGeo.features.map((feat, idx) => ({
      id: feat.id ?? idx,
      d: pathGen(feat) || '',
    }));
  }, [countriesGeo, pathGen]);

  const graticulePath = useMemo(() => pathGen(graticule) || '', [pathGen, graticule]);

  const corridorPaths = useMemo(() => {
    return corridors.map((cor) => {
      const arcCoords = computeGreatCircleArc(cor.from, cor.to, 40);
      const lineString = {
        type: 'LineString' as const,
        coordinates: arcCoords,
      };
      return {
        corridor: cor,
        d: pathGen(lineString) || '',
      };
    });
  }, [corridors, pathGen]);

  const hotspotContours = useMemo(() => {
    const ringScales = [
      { factor: 1.0, opacity: 0.08, strokeOpacity: 0.35 },
      { factor: 0.66, opacity: 0.12, strokeOpacity: 0 },
      { factor: 0.36, opacity: 0.17, strokeOpacity: 0 },
    ];
    return hotspots.map((hs) => {
      const rings = ringScales.map((rs) => {
        const degRadius = ((hs.radiusKm * rs.factor) / 6371) * (180 / Math.PI);
        const circle = geoCircle().center(hs.coordinates).radius(degRadius)();
        return {
          factor: rs.factor,
          opacity: rs.opacity,
          strokeOpacity: rs.strokeOpacity,
          d: pathGen(circle) || '',
        };
      });
      return { hotspot: hs, rings };
    });
  }, [hotspots, pathGen]);

  const projectPoint = (coords: [number, number]): [number, number] | null => {
    const pt = projection(coords);
    if (!pt || Number.isNaN(pt[0]) || Number.isNaN(pt[1])) return null;
    return pt;
  };

  const severityColor = (sev: KineticIncident['severity']) => {
    if (sev === 'CRITICAL') return '#EF4444';
    if (sev === 'HIGH') return '#F59E0B';
    return '#06B6D4';
  };

  const categoryColor = (cat: LeadershipStatement['category']) => {
    switch (cat) {
      case 'MILITARY_STRIKE':
        return '#EF4444';
      case 'ESCALATION_WARNING':
        return '#F59E0B';
      case 'STRATEGIC_DEAL_ECONOMIC':
        return '#06B6D4';
      case 'PEACE_OVERTURE':
        return '#10B981';
    }
  };

  const corridorColor = (type: DiplomaticCorridor['type']) => {
    if (type === 'CEASEFIRE_MEDIATION') return '#10B981';
    if (type === 'TRADE_DEAL') return '#06B6D4';
    return '#F59E0B';
  };

  const discCenter = projection(projectionCenter) ?? [SVG_WIDTH / 2, SVG_HEIGHT / 2];

  return (
    <div
      data-testid={`d3-map-${mode}`}
      className="relative w-full h-full min-h-[540px] bg-[#07090E] overflow-hidden select-none flex items-center justify-center"
    >
      {/* Top-Left Projection Telemetry Readout */}
      <div className="absolute top-4 left-4 z-10 bg-[#0B0F17]/90 border border-slate-800 rounded px-3 py-2 sm:px-3.5 sm:py-2.5 max-w-[calc(100%-9.5rem)] sm:max-w-xs">
        <div className="text-xs font-semibold text-slate-100 leading-snug">
          {mode === 'azimuthal-south'
            ? 'South-Pole Azimuthal Equidistant'
            : 'Azimuthal Equatorial Projection'}
        </div>
        <div className="mt-1 text-[11px] sm:text-xs font-mono text-slate-400 tabular-nums leading-snug">
          {mode === 'azimuthal-south'
            ? 'Center: -90.0° S (Antarctica) · Rim: +90.0° N'
            : 'Center: 0.0° N, 0.0° E (Equatorial Nexus)'}
        </div>
        {focusCoords && (
          <div className="mt-1 text-[11px] sm:text-xs font-mono text-cyan-300 tabular-nums">
            Range Origin: {focusCoords[1].toFixed(2)}°, {focusCoords[0].toFixed(2)}°
          </div>
        )}
      </div>

      {/* Top-Right Zoom & Reset Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-[#0B0F17]/90 border border-slate-800 rounded p-1">
        <button
          type="button"
          aria-label="Zoom in projection"
          onClick={() => setZoomScale((z) => Math.min(2.4, Number((z + 0.2).toFixed(2))))}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out projection"
          onClick={() => setZoomScale((z) => Math.max(0.75, Number((z - 0.2).toFixed(2))))}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="Reset projection scale"
          onClick={() => setZoomScale(1)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Hover Coordinate & Distance HUD */}
      {hoveredLabel && (
        <div className="absolute bottom-4 left-4 z-10 bg-[#0B0F17]/95 border border-slate-700 rounded px-3.5 py-2.5 max-w-sm pointer-events-none">
          <div className="text-xs font-semibold text-slate-100">{hoveredLabel.title}</div>
          <div className="text-xs text-slate-300 mt-0.5">{hoveredLabel.subtitle}</div>
          <div className="mt-1.5 text-[11px] font-mono text-cyan-300 tabular-nums">
            {hoveredLabel.coords[1].toFixed(2)}°, {hoveredLabel.coords[0].toFixed(2)}° ·{' '}
            {Math.round(hoveredLabel.distFromCenterKm).toLocaleString()} km from projection center
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-[#0B0F17]/90 border border-slate-800 rounded px-3 py-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-300 max-w-[calc(100%-2rem)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          Kinetic / Strike
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          Warning / Risk
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
          Trade / Chokepoint
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          Peace / Mediation
        </span>
        {layers.threatDensity && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500/70 border border-orange-400 inline-block" />
            Threat Density
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-full max-h-full cursor-crosshair"
        role="img"
        aria-label={
          mode === 'azimuthal-south'
            ? 'South-Pole Centered Azimuthal Equidistant Map'
            : 'Equatorial Azimuthal Equidistant Map'
        }
      >
        <defs>
          <radialGradient id="ocean-disc" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0D1626" />
            <stop offset="75%" stopColor="#09101B" />
            <stop offset="100%" stopColor="#060910" />
          </radialGradient>
        </defs>

        {/* Earth Disc */}
        <path d={outerRim} fill="url(#ocean-disc)" stroke="#1E293B" strokeWidth={1.5} />

        {/* Graticule Grid */}
        <path d={graticulePath} fill="none" stroke="#162032" strokeWidth={0.6} />

        {/* Landmasses */}
        <g>
          {landPaths.map((land) => (
            <path
              key={land.id}
              d={land.d}
              fill="#162032"
              stroke="#26354D"
              strokeWidth={0.6}
            />
          ))}
        </g>

        {/* Historical Threat Density Heatmap Contours (1945–2026) */}
        {layers.threatDensity && (
          <g data-testid="d3-threat-density-layer">
            {hotspotContours.map(({ hotspot, rings }) => {
              const color = severityColor(hotspot.severityTier);
              const pt = projectPoint(hotspot.coordinates);
              const isSelected = selectedId === hotspot.id;
              return (
                <g key={hotspot.id}>
                  {rings.map((ring) => (
                    <path
                      key={`${hotspot.id}-${ring.factor}`}
                      d={ring.d}
                      fill={color}
                      fillOpacity={isSelected ? ring.opacity + 0.06 : ring.opacity}
                      stroke={ring.strokeOpacity > 0 ? color : 'none'}
                      strokeOpacity={isSelected ? 0.75 : ring.strokeOpacity}
                      strokeWidth={isSelected ? 1.4 : 0.9}
                      strokeDasharray={ring.strokeOpacity > 0 ? '3 3' : undefined}
                      className="cursor-pointer"
                      onClick={() => onSelectHotspot(hotspot)}
                    />
                  ))}
                  {pt && (() => {
                    const badgeOffset =
                      hotspot.id === 'hotspot-southern-cape'
                        ? [0, -22]
                        : hotspot.id === 'hotspot-south-atlantic'
                        ? [-18, 12]
                        : hotspot.id === 'hotspot-eastern-europe'
                        ? [0, 10]
                        : [0, 0];
                    return (
                      <g
                        transform={`translate(${pt[0] + badgeOffset[0]}, ${pt[1] + badgeOffset[1]})`}
                        onClick={() => onSelectHotspot(hotspot)}
                        onMouseEnter={() =>
                          setHoveredLabel({
                            title: `${hotspot.region} · Density ${hotspot.densityScore}/100`,
                            subtitle: `${hotspot.historicalConflictCount} historical eras (${hotspot.eraSpan})`,
                            distFromCenterKm: haversineDistanceKm(
                              projectionCenter,
                              hotspot.coordinates
                            ),
                            coords: hotspot.coordinates,
                          })
                        }
                        onMouseLeave={() => setHoveredLabel(null)}
                        className="cursor-pointer"
                      >
                        <circle
                          r={10}
                          fill="#07090E"
                          fillOpacity={0.9}
                          stroke={color}
                          strokeWidth={isSelected ? 2 : 1.1}
                        />
                        <text
                          y={3}
                          textAnchor="middle"
                          fill={color}
                          fontSize={8.5}
                          fontWeight={700}
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {hotspot.densityScore}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}
          </g>
        )}

        {/* Great-Circle Concentric Range Rings */}
        {layers.rangeRings && (
          <g>
            {ringGeometries.map((ring) => (
              <path
                key={ring.km}
                d={ring.d}
                fill="none"
                stroke="#06B6D4"
                strokeOpacity={0.28}
                strokeWidth={0.9}
                strokeDasharray="4 4"
              />
            ))}
            {/* Label rings along vertical meridian when centered */}
            {!focusCoords &&
              [1, 2, 3].map((step) => {
                const km = step * 5000;
                const rPx = (km / 20000) * (Math.PI * BASE_SCALE * zoomScale);
                return (
                  <text
                    key={km}
                    x={discCenter[0] + 6}
                    y={discCenter[1] - rPx + 12}
                    fill="#67E8F9"
                    fillOpacity={0.75}
                    fontSize={10}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {(km / 1000).toFixed(0)}k km
                  </text>
                );
              })}
          </g>
        )}

        {/* Diplomatic & Trade Great-Circle Corridors */}
        {layers.diplomaticCorridors && (
          <g>
            {corridorPaths.map(({ corridor, d }) => (
              <path
                key={corridor.id}
                d={d}
                fill="none"
                stroke={corridorColor(corridor.type)}
                strokeWidth={1.5}
                strokeOpacity={0.72}
                strokeDasharray={corridor.type === 'SANCTIONS_ENERGY' ? '5 3' : undefined}
              />
            ))}
          </g>
        )}

        {/* Southern Hemisphere Chokepoints */}
        {layers.chokepoints &&
          chokepoints.map((chk) => {
            const pt = projectPoint(chk.coordinates);
            if (!pt) return null;
            const labelOffset =
              chk.id === 'chk-magellan'
                ? { dx: -9, dy: -6, anchor: 'end' as const }
                : chk.id === 'chk-drake'
                ? { dx: 9, dy: 12, anchor: 'start' as const }
                : chk.id === 'chk-cape'
                ? { dx: 10, dy: 4, anchor: 'start' as const }
                : { dx: 9, dy: 3, anchor: 'start' as const };
            return (
              <g
                key={chk.id}
                transform={`translate(${pt[0]}, ${pt[1]})`}
                onMouseEnter={() =>
                  setHoveredLabel({
                    title: chk.name,
                    subtitle: chk.strategic_role,
                    distFromCenterKm: haversineDistanceKm(projectionCenter, chk.coordinates),
                    coords: chk.coordinates,
                  })
                }
                onMouseLeave={() => setHoveredLabel(null)}
                className="cursor-pointer"
              >
                <polygon
                  points="0,-6 6,0 0,6 -6,0"
                  fill="#06B6D4"
                  fillOpacity={0.25}
                  stroke="#22D3EE"
                  strokeWidth={1.2}
                />
                <text
                  x={labelOffset.dx}
                  y={labelOffset.dy}
                  textAnchor={labelOffset.anchor}
                  fill="#A5F3FC"
                  stroke="#07090E"
                  strokeWidth={3}
                  paintOrder="stroke"
                  fontSize={10}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {chk.name}
                </text>
              </g>
            );
          })}

        {/* Kinetic Incidents */}
        {layers.kineticIncidents &&
          incidents.map((inc) => {
            const pt = projectPoint(inc.coordinates);
            if (!pt) return null;
            const color = severityColor(inc.severity);
            const isSelected = selectedId === inc.id;
            return (
              <g
                key={inc.id}
                transform={`translate(${pt[0]}, ${pt[1]})`}
                onClick={() => onSelectIncident(inc)}
                onMouseEnter={() =>
                  setHoveredLabel({
                    title: inc.title,
                    subtitle: `${inc.theater} · ${inc.severity}`,
                    distFromCenterKm: haversineDistanceKm(projectionCenter, inc.coordinates),
                    coords: inc.coordinates,
                  })
                }
                onMouseLeave={() => setHoveredLabel(null)}
                className="cursor-pointer"
              >
                <circle
                  r={isSelected ? 12 : 8}
                  fill={color}
                  fillOpacity={0.2}
                  stroke={color}
                  strokeWidth={isSelected ? 2 : 1.2}
                />
                <circle r={3.5} fill={color} />
              </g>
            );
          })}

        {/* Verified Leadership Statements */}
        {layers.leadershipPins &&
          statements.map((stmt) => {
            const pt = projectPoint(stmt.coordinates);
            if (!pt) return null;
            const color = categoryColor(stmt.category);
            const isSelected = selectedId === stmt.id;
            const isoOffset =
              stmt.country_iso3 === 'GBR'
                ? { dx: -8, dy: -2, anchor: 'end' as const }
                : stmt.country_iso3 === 'EUR'
                ? { dx: 9, dy: 4, anchor: 'start' as const }
                : stmt.country_iso3 === 'USA'
                ? { dx: -8, dy: 8, anchor: 'end' as const }
                : stmt.country_iso3 === 'UNSC'
                ? { dx: 8, dy: -6, anchor: 'start' as const }
                : stmt.country_iso3 === 'ZAF'
                ? { dx: -9, dy: -4, anchor: 'end' as const }
                : { dx: 8, dy: 3, anchor: 'start' as const };
            return (
              <g
                key={stmt.id}
                transform={`translate(${pt[0]}, ${pt[1]})`}
                onClick={() => onSelectStatement(stmt)}
                onMouseEnter={() =>
                  setHoveredLabel({
                    title: `${stmt.country_iso3} · ${stmt.official_title}`,
                    subtitle: stmt.category,
                    distFromCenterKm: haversineDistanceKm(projectionCenter, stmt.coordinates),
                    coords: stmt.coordinates,
                  })
                }
                onMouseLeave={() => setHoveredLabel(null)}
                className="cursor-pointer"
              >
                <rect
                  x={isSelected ? -6 : -4.5}
                  y={isSelected ? -6 : -4.5}
                  width={isSelected ? 12 : 9}
                  height={isSelected ? 12 : 9}
                  rx={2}
                  fill="#0B0F17"
                  stroke={color}
                  strokeWidth={isSelected ? 2.2 : 1.5}
                />
                <circle r={2} fill={color} />
                <text
                  x={isoOffset.dx}
                  y={isoOffset.dy}
                  textAnchor={isoOffset.anchor}
                  fill="#CBD5E1"
                  stroke="#07090E"
                  strokeWidth={3}
                  paintOrder="stroke"
                  fontSize={9.5}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {stmt.country_iso3}
                </text>
              </g>
            );
          })}

        {/* Center Crosshair Marker */}
        <g transform={`translate(${discCenter[0]}, ${discCenter[1]})`} pointerEvents="none">
          <circle r={3} fill="none" stroke="#38BDF8" strokeWidth={1.2} />
          <line x1={-8} y1={0} x2={8} y2={0} stroke="#38BDF8" strokeOpacity={0.5} />
          <line x1={0} y1={-8} x2={0} y2={8} stroke="#38BDF8" strokeOpacity={0.5} />
        </g>
      </svg>

      {/* Center Label Helper */}
      <div className="sr-only">
        <LocateFixed className="w-3 h-3" />
      </div>
    </div>
  );
};
