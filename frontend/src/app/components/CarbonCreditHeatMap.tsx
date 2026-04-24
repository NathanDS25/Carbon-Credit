'use client';
import { useState, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Satellite, Leaf, Star, Calendar, MessageCircle, Info, X, TrendingUp, MapPin } from 'lucide-react';

// GeoJSON world topology
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// NGO data with coordinates and carbon credit quality metrics
const NGO_MARKERS = [
  {
    id: 1, name: 'Wayanad Forest Trust', location: 'Kerala, India',
    lat: 11.66, lon: 76.04, ndvi: 0.702, credits: 12400,
    rating: 4.9, type: 'Tropical Forest', price: 18.5,
    verified: true, country: 'India',
  },
  {
    id: 2, name: 'Amazon Green Initiative', location: 'Amazonas, Brazil',
    lat: -3.46, lon: -62.21, ndvi: 0.810, credits: 89200,
    rating: 4.8, type: 'Rainforest', price: 24.3,
    verified: true, country: 'Brazil',
  },
  {
    id: 3, name: 'Congo Basin Alliance', location: 'DRC, Africa',
    lat: -1.65, lon: 23.97, ndvi: 0.790, credits: 45600,
    rating: 4.7, type: 'Tropical Forest', price: 21.1,
    verified: true, country: 'DRC',
  },
  {
    id: 4, name: 'Sundarbans Mangrove Fund', location: 'West Bengal, India',
    lat: 21.94, lon: 89.18, ndvi: 0.680, credits: 8700,
    rating: 4.6, type: 'Mangrove', price: 16.8,
    verified: true, country: 'India',
  },
  {
    id: 5, name: 'Borneo Wildlife Shield', location: 'Kalimantan, Indonesia',
    lat: 1.66, lon: 113.38, ndvi: 0.770, credits: 67300,
    rating: 4.8, type: 'Tropical Forest', price: 22.7,
    verified: true, country: 'Indonesia',
  },
  {
    id: 6, name: 'Atlantic Forest Restore', location: 'São Paulo, Brazil',
    lat: -23.55, lon: -46.63, ndvi: 0.650, credits: 23100,
    rating: 4.5, type: 'Reforestation', price: 19.2,
    verified: true, country: 'Brazil',
  },
  {
    id: 7, name: 'Himalayan Green Belt', location: 'Uttarakhand, India',
    lat: 29.39, lon: 79.46, ndvi: 0.580, credits: 5400,
    rating: 4.4, type: 'Alpine Forest', price: 14.6,
    verified: true, country: 'India',
  },
  {
    id: 8, name: 'Mekong Wetland Trust', location: 'Mekong Delta, Vietnam',
    lat: 10.45, lon: 105.63, ndvi: 0.540, credits: 11200,
    rating: 4.3, type: 'Wetland', price: 13.9,
    verified: true, country: 'Vietnam',
  },
  {
    id: 9, name: 'Sahel Regreen Project', location: 'Senegal, West Africa',
    lat: 14.49, lon: -14.45, ndvi: 0.430, credits: 4100,
    rating: 4.2, type: 'Dryland Restoration', price: 11.4,
    verified: true, country: 'Senegal',
  },
  {
    id: 10, name: 'Costa Rica Cloud Forest', location: 'Monteverde, Costa Rica',
    lat: 10.30, lon: -84.82, ndvi: 0.740, credits: 18600,
    rating: 4.7, type: 'Cloud Forest', price: 20.8,
    verified: true, country: 'Costa Rica',
  },
  {
    id: 11, name: 'Siberian Taiga Fund', location: 'Krasnoyarsk, Russia',
    lat: 56.01, lon: 92.87, ndvi: 0.620, credits: 32000,
    rating: 4.3, type: 'Boreal Forest', price: 15.2,
    verified: true, country: 'Russia',
  },
  {
    id: 12, name: 'Kenya Savanna Trust', location: 'Nairobi, Kenya',
    lat: -1.28, lon: 36.82, ndvi: 0.460, credits: 9800,
    rating: 4.4, type: 'Savanna', price: 12.6,
    verified: true, country: 'Kenya',
  },
];

// NDVI-based country fill map (which countries have NGO presence)
const COUNTRY_NDVI: Record<string, number> = {
  IND: 0.65, BRA: 0.76, COD: 0.79, IDN: 0.77,
  VNM: 0.54, SEN: 0.43, CRI: 0.74, RUS: 0.62,
  KEN: 0.46, USA: 0.45, CHN: 0.48, AUS: 0.38,
};

// Quality color scale
function ndviToColor(ndvi: number, alpha = 1): string {
  if (ndvi >= 0.75) return `rgba(5, 150, 80, ${alpha})`;
  if (ndvi >= 0.65) return `rgba(22, 163, 74, ${alpha})`;
  if (ndvi >= 0.55) return `rgba(74, 222, 128, ${alpha})`;
  if (ndvi >= 0.45) return `rgba(234, 179, 8, ${alpha})`;
  if (ndvi >= 0.35) return `rgba(249, 115, 22, ${alpha})`;
  return `rgba(239, 68, 68, ${alpha})`;
}

function QualityBadge({ ndvi }: { ndvi: number }) {
  const label = ndvi >= 0.75 ? 'Excellent' : ndvi >= 0.65 ? 'Very Good' : ndvi >= 0.55 ? 'Good' : ndvi >= 0.45 ? 'Fair' : 'Low';
  const color = ndviToColor(ndvi);
  return (
    <span style={{
      padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
      background: ndviToColor(ndvi, 0.15),
      color, border: `1px solid ${ndviToColor(ndvi, 0.4)}`,
    }}>{label}</span>
  );
}

interface NGOPopupProps {
  ngo: typeof NGO_MARKERS[0];
  onClose: () => void;
  onSchedule: (name: string) => void;
}

function NGOPopup({ ngo, onClose, onSchedule }: NGOPopupProps) {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '340px', zIndex: 100,
      background: 'rgba(8,15,10,0.97)',
      border: `1px solid ${ndviToColor(ngo.ndvi, 0.5)}`,
      borderRadius: '20px', padding: '24px',
      backdropFilter: 'blur(20px)',
      boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${ndviToColor(ngo.ndvi, 0.15)}`,
      animation: 'popIn 0.2s ease',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: '16px', right: '16px',
        background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
      }}><X size={16} /></button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px',
          background: ndviToColor(ngo.ndvi, 0.2),
          border: `1px solid ${ndviToColor(ngo.ndvi, 0.4)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Leaf size={18} color={ndviToColor(ngo.ndvi)} />
        </div>
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '14px' }}>{ngo.name}</div>
          <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={11} /> {ngo.location}
          </div>
        </div>
      </div>

      {/* NDVI Gauge Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>NDVI VEGETATION INDEX</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: ndviToColor(ngo.ndvi), fontWeight: '700', fontSize: '13px' }}>{ngo.ndvi}</span>
            <QualityBadge ndvi={ngo.ndvi} />
          </div>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${ngo.ndvi * 100}%`,
            background: `linear-gradient(90deg, ${ndviToColor(ngo.ndvi, 0.6)}, ${ndviToColor(ngo.ndvi)})`,
            borderRadius: '4px', transition: 'width 0.8s ease',
          }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Credits Available', value: ngo.credits.toLocaleString(), icon: <Satellite size={13} />, color: '#52b788' },
          { label: 'Price / tonne', value: `$${ngo.price}`, icon: <TrendingUp size={13} />, color: '#f59e0b' },
          { label: 'Rating', value: `⭐ ${ngo.rating}/5`, icon: <Star size={13} />, color: '#a78bfa' },
          { label: 'Type', value: ngo.type, icon: <Leaf size={13} />, color: '#34d399' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '10px 12px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ color: '#475569', fontSize: '10px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: s.color }}>{s.icon}</span>{s.label}
            </div>
            <div style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '13px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Verified badge */}
      {ngo.verified && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px',
          padding: '8px 12px', borderRadius: '10px',
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <Satellite size={13} color="#10b981" />
          <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>
            Verified via Sentinel-2 Satellite (GEE)
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onSchedule(ngo.name)}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2d8659, #52b788)',
            border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          <Calendar size={13} /> Schedule Meet
        </button>
        <button style={{
          flex: 1, padding: '10px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#94a3b8', fontSize: '13px', fontWeight: '600',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          <MessageCircle size={13} /> Chat
        </button>
      </div>
      <style>{`@keyframes popIn { from { opacity:0; transform: translate(-50%,-50%) scale(0.92); } to { opacity:1; transform: translate(-50%,-50%) scale(1); } }`}</style>
    </div>
  );
}

interface Props {
  onScheduleMeet?: (ngoName: string) => void;
}

export function CarbonCreditHeatMap({ onScheduleMeet }: Props) {
  const [selectedNGO, setSelectedNGO] = useState<typeof NGO_MARKERS[0] | null>(null);
  const [hoveredNGO, setHoveredNGO] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'excellent' | 'good' | 'fair'>('all');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipNGO, setTooltipNGO] = useState<typeof NGO_MARKERS[0] | null>(null);

  const filteredNGOs = NGO_MARKERS.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'excellent') return n.ndvi >= 0.65;
    if (filter === 'good') return n.ndvi >= 0.5 && n.ndvi < 0.65;
    if (filter === 'fair') return n.ndvi < 0.5;
    return true;
  });

  const handleSchedule = useCallback((name: string) => {
    setSelectedNGO(null);
    onScheduleMeet?.(name);
  }, [onScheduleMeet]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(5,12,8,0.98), rgba(10,20,14,0.95))',
      border: '1px solid rgba(82,183,136,0.2)',
      borderRadius: '22px', overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(82,183,136,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div>
          <h3 style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '16px', margin: 0 }}>
            🌍 Carbon Credit Quality Heatmap
          </h3>
          <p style={{ color: '#64748b', fontSize: '12px', margin: '4px 0 0' }}>
            Click any pin to view NGO details, NDVI score, and available credits
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All NGOs', color: '#52b788' },
            { key: 'excellent', label: '🟢 Excellent (NDVI ≥ 0.65)', color: '#10b981' },
            { key: 'good', label: '🟡 Good (0.5–0.65)', color: '#f59e0b' },
            { key: 'fair', label: '🔴 Fair (< 0.5)', color: '#ef4444' },
          ].map(({ key, label, color }) => (
            <button key={key} onClick={() => setFilter(key as any)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              background: filter === key ? `${color}22` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === key ? color : 'rgba(255,255,255,0.08)'}`,
              color: filter === key ? color : '#64748b',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ position: 'relative', background: 'radial-gradient(ellipse at center, rgba(10,30,20,0.9) 0%, rgba(3,10,6,1) 100%)' }}>
        <ComposableMap
          projection="geoNaturalEarth1"
          style={{ width: '100%', height: '480px' }}
        >
          <ZoomableGroup zoom={1} center={[20, 10]} maxZoom={6}>
            {/* Country Fills — heatmap by NDVI */}
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const iso = geo.properties?.adm0_a3 || geo.id;
                  const ndvi = COUNTRY_NDVI[iso];
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: ndvi ? ndviToColor(ndvi, 0.35) : 'rgba(255,255,255,0.04)',
                          stroke: 'rgba(82,183,136,0.12)',
                          strokeWidth: 0.5,
                          outline: 'none',
                        },
                        hover: {
                          fill: ndvi ? ndviToColor(ndvi, 0.55) : 'rgba(255,255,255,0.08)',
                          stroke: 'rgba(82,183,136,0.3)',
                          strokeWidth: 0.8,
                          outline: 'none',
                        },
                        pressed: { outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* NGO Markers */}
            {filteredNGOs.map((ngo) => {
              const isHovered = hoveredNGO === ngo.id;
              const isSelected = selectedNGO?.id === ngo.id;
              const color = ndviToColor(ngo.ndvi);
              const size = isHovered || isSelected ? 12 : 8;

              return (
                <Marker
                  key={ngo.id}
                  coordinates={[ngo.lon, ngo.lat]}
                  onClick={() => setSelectedNGO(selectedNGO?.id === ngo.id ? null : ngo)}
                  onMouseEnter={(e) => {
                    setHoveredNGO(ngo.id);
                    setTooltipNGO(ngo);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => {
                    setHoveredNGO(null);
                    setTooltipNGO(null);
                  }}
                >
                  {/* Pulse ring */}
                  <circle
                    r={size + 6}
                    fill={ndviToColor(ngo.ndvi, 0.1)}
                    stroke={ndviToColor(ngo.ndvi, 0.3)}
                    strokeWidth={1}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Main dot */}
                  <circle
                    r={size}
                    fill={color}
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    style={{ cursor: 'pointer', filter: isHovered ? `drop-shadow(0 0 6px ${color})` : 'none', transition: 'r 0.2s ease' }}
                  />
                  {/* NDVI label on hover */}
                  {(isHovered || isSelected) && (
                    <text
                      textAnchor="middle"
                      y={-16}
                      style={{ fontSize: '9px', fill: '#fff', fontWeight: '700', pointerEvents: 'none', fontFamily: 'monospace' }}
                    >
                      {ngo.ndvi}
                    </text>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Hover Tooltip (simple floating) */}
        {tooltipNGO && !selectedNGO && (
          <div style={{
            position: 'fixed',
            left: tooltipPos.x + 14,
            top: tooltipPos.y - 10,
            pointerEvents: 'none',
            zIndex: 9999,
            background: 'rgba(8,15,10,0.97)',
            border: `1px solid ${ndviToColor(tooltipNGO.ndvi, 0.5)}`,
            borderRadius: '12px', padding: '10px 14px',
            backdropFilter: 'blur(16px)',
            minWidth: '180px',
          }}>
            <div style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>{tooltipNGO.name}</div>
            <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '6px' }}>{tooltipNGO.location}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.07)' }}>
                <div style={{ width: `${tooltipNGO.ndvi * 100}%`, height: '100%', borderRadius: '3px', background: ndviToColor(tooltipNGO.ndvi) }} />
              </div>
              <span style={{ color: ndviToColor(tooltipNGO.ndvi), fontWeight: '700', fontSize: '12px' }}>NDVI {tooltipNGO.ndvi}</span>
            </div>
            <div style={{ color: '#52b788', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>
              {tooltipNGO.credits.toLocaleString()} credits • ${tooltipNGO.price}/t
            </div>
          </div>
        )}

        {/* NGO detail popup */}
        {selectedNGO && (
          <NGOPopup
            ngo={selectedNGO}
            onClose={() => setSelectedNGO(null)}
            onSchedule={handleSchedule}
          />
        )}
      </div>

      {/* Legend */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(82,183,136,0.1)',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>CREDIT QUALITY:</span>
          {[
            { label: 'Excellent (≥0.75)', color: 'rgba(5,150,80,1)' },
            { label: 'Very Good (≥0.65)', color: 'rgba(22,163,74,1)' },
            { label: 'Good (≥0.55)', color: 'rgba(74,222,128,1)' },
            { label: 'Fair (≥0.45)', color: 'rgba(234,179,8,1)' },
            { label: 'Low (<0.45)', color: 'rgba(249,115,22,1)' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ color: '#475569', fontSize: '11px' }}>
          Showing {filteredNGOs.length} of {NGO_MARKERS.length} verified NGOs
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1px', background: 'rgba(82,183,136,0.1)',
        borderTop: '1px solid rgba(82,183,136,0.1)',
      }}>
        {[
          { label: 'Total NGOs', value: NGO_MARKERS.length, color: '#52b788' },
          { label: 'Total Credits', value: NGO_MARKERS.reduce((s, n) => s + n.credits, 0).toLocaleString(), color: '#f59e0b' },
          { label: 'Avg NDVI', value: (NGO_MARKERS.reduce((s, n) => s + n.ndvi, 0) / NGO_MARKERS.length).toFixed(3), color: '#34d399' },
          { label: 'Avg Price', value: `$${(NGO_MARKERS.reduce((s, n) => s + n.price, 0) / NGO_MARKERS.length).toFixed(1)}/t`, color: '#60a5fa' },
          { label: 'Regions', value: '12 Countries', color: '#a78bfa' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '16px 20px', background: 'rgba(0,0,0,0.4)',
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            <span style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
            <span style={{ color: s.color, fontWeight: '700', fontSize: '18px' }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
