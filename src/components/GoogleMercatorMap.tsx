import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  ColorScheme,
  InfoWindow,
  Map as GoogleMap,
  useApiLoadingStatus,
  APILoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer, type Marker as ClusterMarker } from '@googlemaps/markerclusterer';
import { Layers, Satellite, Map as MapIcon } from 'lucide-react';
import type {
  DiplomaticCorridor,
  KineticIncident,
  LeadershipStatement,
  MapLayersState,
  RegionalThreatHotspot,
  SouthernChokepoint,
} from '../types/aegis';
import { computeGreatCircleArc } from '../utils/intelligence';

interface GoogleMercatorMapProps {
  apiKey: string;
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
  onSwitchToSouthPole: () => void;
}

type TacticalMarkerItem =
  | {
      kind: 'statement';
      id: string;
      position: google.maps.LatLngLiteral;
      title: string;
      subtitle: string;
      color: string;
      data: LeadershipStatement;
    }
  | {
      kind: 'incident';
      id: string;
      position: google.maps.LatLngLiteral;
      title: string;
      subtitle: string;
      color: string;
      data: KineticIncident;
    }
  | {
      kind: 'chokepoint';
      id: string;
      position: google.maps.LatLngLiteral;
      title: string;
      subtitle: string;
      color: string;
      data: SouthernChokepoint;
    };

function categoryColorHex(cat: LeadershipStatement['category']): string {
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
}

function severityColorHex(sev: KineticIncident['severity']): string {
  if (sev === 'CRITICAL') return '#EF4444';
  if (sev === 'HIGH') return '#F59E0B';
  return '#06B6D4';
}

interface MercatorOverlayLayerProps {
  items: TacticalMarkerItem[];
  corridors: DiplomaticCorridor[];
  incidents: KineticIncident[];
  hotspots: RegionalThreatHotspot[];
  layers: MapLayersState;
  selectedId: string | null;
  focusCoords: [number, number] | null;
  onSelectStatement: (stmt: LeadershipStatement) => void;
  onSelectIncident: (inc: KineticIncident) => void;
  onSelectHotspot: (hotspot: RegionalThreatHotspot) => void;
}

const MercatorOverlayLayer: React.FC<MercatorOverlayLayerProps> = ({
  items,
  corridors,
  incidents,
  hotspots,
  layers,
  selectedId,
  focusCoords,
  onSelectStatement,
  onSelectIncident,
  onSelectHotspot,
}) => {
  const map = useMap();
  const markerLib = useMapsLibrary('marker');
  const mapsLib = useMapsLibrary('maps');

  const [activeInfo, setActiveInfo] = useState<{
    item: TacticalMarkerItem;
    anchor: google.maps.marker.AdvancedMarkerElement;
  } | null>(null);

  const markerMapRef = useRef<Record<string, google.maps.marker.AdvancedMarkerElement>>({});
  const clustererRef = useRef<MarkerClusterer | null>(null);

  // Pan camera when user selects a statement or incident from the side feed
  useEffect(() => {
    if (!map || !focusCoords) return;
    map.panTo({ lat: focusCoords[1], lng: focusCoords[0] });
    if ((map.getZoom() ?? 2) < 4) {
      map.setZoom(4);
    }
  }, [map, focusCoords]);

  // Initialize MarkerClusterer once map is ready
  useEffect(() => {
    if (!map) return;
    const clusterer = new MarkerClusterer({ map });
    clustererRef.current = clusterer;
    return () => {
      clusterer.clearMarkers();
      clustererRef.current = null;
    };
  }, [map]);

  // Render clustered AdvancedMarkerElement instances
  useEffect(() => {
    if (!map || !markerLib || !clustererRef.current) return;

    const clusterer = clustererRef.current;
    const createdMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
    const nextLookup: Record<string, google.maps.marker.AdvancedMarkerElement> = {};

    for (const item of items) {
      const badge = document.createElement('div');
      const isSelected = selectedId === item.id;
      badge.style.width = item.kind === 'incident' ? '16px' : '14px';
      badge.style.height = item.kind === 'incident' ? '16px' : '14px';
      badge.style.borderRadius = item.kind === 'chokepoint' ? '2px' : '9999px';
      badge.style.transform = item.kind === 'chokepoint' ? 'rotate(45deg)' : 'none';
      badge.style.backgroundColor = item.color;
      badge.style.border = isSelected ? '2.5px solid #FFFFFF' : '2px solid #0B0F17';
      badge.style.boxShadow = '0 0 0 1px rgba(15, 23, 42, 0.8)';
      badge.style.cursor = 'pointer';

      const marker = new markerLib.AdvancedMarkerElement({
        position: item.position,
        title: item.title,
        content: badge,
      });

      const handleMarkerClick = () => {
        setActiveInfo({ item, anchor: marker });
        if (item.kind === 'statement') {
          onSelectStatement(item.data);
        } else if (item.kind === 'incident') {
          onSelectIncident(item.data);
        }
      };

      marker.addEventListener('gmp-click', handleMarkerClick);

      createdMarkers.push(marker);
      nextLookup[item.id] = marker;
    }

    markerMapRef.current = nextLookup;
    clusterer.clearMarkers();
    clusterer.addMarkers(createdMarkers as ClusterMarker[]);

    return () => {
      clusterer.clearMarkers();
      for (const m of createdMarkers) {
        m.map = null;
      }
    };
  }, [map, markerLib, items, selectedId, onSelectStatement, onSelectIncident]);

  // Render Great-Circle Diplomatic Corridors as native Polyline overlays
  useEffect(() => {
    if (!map || !mapsLib || !layers.diplomaticCorridors) return;
    const polylines: google.maps.Polyline[] = corridors.map((cor) => {
      const arc = computeGreatCircleArc(cor.from, cor.to, 32).map(([lng, lat]) => ({
        lat,
        lng,
      }));
      const strokeColor =
        cor.type === 'CEASEFIRE_MEDIATION'
          ? '#10B981'
          : cor.type === 'TRADE_DEAL'
          ? '#06B6D4'
          : '#F59E0B';
      return new mapsLib.Polyline({
        path: arc,
        geodesic: false,
        strokeColor,
        strokeOpacity: 0.75,
        strokeWeight: 2,
        map,
      });
    });

    return () => {
      for (const pl of polylines) {
        pl.setMap(null);
      }
    };
  }, [map, mapsLib, corridors, layers.diplomaticCorridors]);

  // Render Historical Threat Density Heatmap Contours using concentric thermal Circles
  useEffect(() => {
    if (!map || !mapsLib || !layers.threatDensity) return;
    const densityCircles: google.maps.Circle[] = [];
    const ringSpecs = [
      { factor: 1.0, fillOpacity: 0.08, strokeOpacity: 0.35, strokeWeight: 1 },
      { factor: 0.65, fillOpacity: 0.12, strokeOpacity: 0, strokeWeight: 0 },
      { factor: 0.35, fillOpacity: 0.18, strokeOpacity: 0, strokeWeight: 0 },
    ];

    for (const hs of hotspots) {
      const color = severityColorHex(hs.severityTier);
      for (const spec of ringSpecs) {
        const circle = new mapsLib.Circle({
          center: { lat: hs.coordinates[1], lng: hs.coordinates[0] },
          radius: hs.radiusKm * spec.factor * 1000,
          strokeColor: color,
          strokeOpacity: spec.strokeOpacity,
          strokeWeight: spec.strokeWeight,
          fillColor: color,
          fillOpacity: spec.fillOpacity,
          clickable: true,
          zIndex: 1,
          map,
        });
        circle.addListener('click', () => onSelectHotspot(hs));
        densityCircles.push(circle);
      }
    }

    return () => {
      for (const c of densityCircles) {
        c.setMap(null);
      }
    };
  }, [map, mapsLib, hotspots, layers.threatDensity, onSelectHotspot]);

  // Render Range Rings around active Kinetic Incidents
  useEffect(() => {
    if (!map || !mapsLib || !layers.rangeRings) return;
    const circles: google.maps.Circle[] = incidents.map((inc) => {
      const color = severityColorHex(inc.severity);
      return new mapsLib.Circle({
        center: { lat: inc.coordinates[1], lng: inc.coordinates[0] },
        radius: (inc.range_ring_km ?? 1400) * 1000,
        strokeColor: color,
        strokeOpacity: 0.45,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: 0.06,
        map,
      });
    });

    return () => {
      for (const c of circles) {
        c.setMap(null);
      }
    };
  }, [map, mapsLib, incidents, layers.rangeRings]);

  if (!activeInfo) return null;

  return (
    <InfoWindow
      anchor={activeInfo.anchor}
      onCloseClick={() => setActiveInfo(null)}
      maxWidth={280}
    >
      <div className="bg-slate-950 text-slate-100 p-1.5 rounded text-xs">
        <div className="font-semibold text-slate-50">{activeInfo.item.title}</div>
        <div className="text-slate-300 mt-1">{activeInfo.item.subtitle}</div>
        <div className="mt-1.5 font-mono text-[11px] text-cyan-300 tabular-nums">
          {activeInfo.item.position.lat.toFixed(2)}°, {activeInfo.item.position.lng.toFixed(2)}°
        </div>
      </div>
    </InfoWindow>
  );
};

const MapsStatusMonitor: React.FC<{
  onSwitchToSouthPole: () => void;
}> = ({ onSwitchToSouthPole }) => {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.AUTH_FAILURE || status === APILoadingStatus.FAILED) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07090E]/90 p-6">
        <div className="max-w-md bg-[#0B0F17] border border-slate-800 rounded p-5 text-sm">
          <div className="font-semibold text-amber-300">
            Standard Mercator Map Unavailable
          </div>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            Google Maps JavaScript API could not initialize in this session. You can switch to the
            D3 Azimuthal Equatorial or South-Pole Center projections without interruption.
          </p>
          <button
            type="button"
            onClick={onSwitchToSouthPole}
            className="mt-4 px-3.5 py-2 text-xs font-semibold rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Switch to South-Pole Azimuthal
          </button>
        </div>
      </div>
    );
  }
  return null;
};

export const GoogleMercatorMap: React.FC<GoogleMercatorMapProps> = ({
  apiKey,
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
  onSwitchToSouthPole,
}) => {
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [zoomPreset, setZoomPreset] = useState<number>(2);

  const markerItems = useMemo<TacticalMarkerItem[]>(() => {
    const list: TacticalMarkerItem[] = [];
    if (layers.leadershipPins) {
      for (const s of statements) {
        list.push({
          kind: 'statement',
          id: s.id,
          position: { lat: s.coordinates[1], lng: s.coordinates[0] },
          title: `${s.country_iso3} · ${s.official_title}`,
          subtitle: s.verbatim_quote,
          color: categoryColorHex(s.category),
          data: s,
        });
      }
    }
    if (layers.kineticIncidents) {
      for (const inc of incidents) {
        list.push({
          kind: 'incident',
          id: inc.id,
          position: { lat: inc.coordinates[1], lng: inc.coordinates[0] },
          title: inc.title,
          subtitle: `${inc.theater} · ${inc.severity}`,
          color: severityColorHex(inc.severity),
          data: inc,
        });
      }
    }
    if (layers.chokepoints) {
      for (const chk of chokepoints) {
        list.push({
          kind: 'chokepoint',
          id: chk.id,
          position: { lat: chk.coordinates[1], lng: chk.coordinates[0] },
          title: chk.name,
          subtitle: chk.strategic_role,
          color: '#22D3EE',
          data: chk,
        });
      }
    }
    return list;
  }, [incidents, statements, chokepoints, layers]);

  const handleApiError = useCallback((err: unknown) => {
    const msg = String(err);
    if (msg.includes('OverQuota') || msg.includes('Quota')) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  }, []);

  if (!apiKey) {
    return (
      <div
        data-testid="mercator-fallback"
        className="w-full h-full min-h-[540px] flex items-center justify-center bg-[#07090E] p-6"
      >
        <div className="max-w-md bg-[#0B0F17] border border-slate-800 rounded p-6">
          <div className="text-sm font-semibold text-slate-100">
            Google Maps API Key Not Active
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Provide a Google Maps Platform key in your project secrets to render the Standard
            Mercator vector and satellite layers, or use the built-in D3 Azimuthal projections.
          </p>
          <button
            type="button"
            onClick={onSwitchToSouthPole}
            className="mt-4 px-3.5 py-2 text-xs font-semibold rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Open South-Pole Azimuthal Projection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="google-mercator-map"
      className="relative w-full h-full min-h-[540px] bg-[#07090E]"
    >
      {/* Mercator Map Mode & Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center p-1 bg-[#0B0F17]/95 border border-slate-800 rounded gap-1">
          <button
            type="button"
            onClick={() => setMapTypeId('roadmap')}
            aria-pressed={mapTypeId === 'roadmap'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
              mapTypeId === 'roadmap'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Dark Vector</span>
          </button>
          <button
            type="button"
            onClick={() => setMapTypeId('hybrid')}
            aria-pressed={mapTypeId === 'hybrid'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
              mapTypeId === 'hybrid'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>
        </div>

        <div className="inline-flex items-center p-1 bg-[#0B0F17]/95 border border-slate-800 rounded gap-1">
          <span className="px-2 text-[11px] font-mono text-slate-400 inline-flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Zoom:
          </span>
          {[
            { label: 'Global', z: 2 },
            { label: 'Theater', z: 5 },
            { label: 'Street', z: 12 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setZoomPreset(preset.z)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                zoomPreset === preset.z
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <APIProvider
        apiKey={apiKey}
        libraries={['marker', 'maps']}
        language="en"
        region="US"
        onError={handleApiError}
      >
        <MapsStatusMonitor onSwitchToSouthPole={onSwitchToSouthPole} />
        <GoogleMap
          mapId="DEMO_MAP_ID"
          colorScheme={ColorScheme.DARK}
          mapTypeId={mapTypeId}
          defaultCenter={{ lat: 20, lng: 20 }}
          defaultZoom={zoomPreset}
          zoom={zoomPreset}
          onZoomChanged={(ev) => setZoomPreset(ev.detail.zoom)}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <MercatorOverlayLayer
            items={markerItems}
            corridors={corridors}
            incidents={incidents}
            hotspots={hotspots}
            layers={layers}
            selectedId={selectedId}
            focusCoords={focusCoords}
            onSelectStatement={onSelectStatement}
            onSelectIncident={onSelectIncident}
            onSelectHotspot={onSelectHotspot}
          />
        </GoogleMap>
      </APIProvider>
    </div>
  );
};
