'use client';
import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { X, Leaf, Star, Calendar, MessageCircle, Satellite, TrendingUp, MapPin } from 'lucide-react';

const INDIA_GEO = 'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson';

type Tier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze';

const TIER_CONFIG: Record<Tier, { color: string; glow: string; bg: string; border: string; minNdvi: number; priceRange: string }> = {
  Platinum: { color: '#e2e8f0', glow: 'rgba(226,232,240,0.4)', bg: 'rgba(226,232,240,0.12)', border: 'rgba(226,232,240,0.4)', minNdvi: 0.75, priceRange: '$22–$25' },
  Gold:     { color: '#fbbf24', glow: 'rgba(251,191,36,0.4)',  bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.4)',  minNdvi: 0.65, priceRange: '$17–$21' },
  Silver:   { color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)', minNdvi: 0.50, priceRange: '$13–$16' },
  Bronze:   { color: '#c2713c', glow: 'rgba(194,113,60,0.4)',  bg: 'rgba(194,113,60,0.12)',  border: 'rgba(194,113,60,0.4)',  minNdvi: 0.00, priceRange: '$8–$12'  },
};

const NGOs = [
  { id:1,  name: 'Wayanad Forest Trust',      state: 'Kerala',             lat:11.61, lon:76.04, ndvi:0.702, tier:'Gold'     as Tier, credits:12400, price:18.5, rating:4.9 },
  { id:2,  name: 'Kodagu Green Shield',        state: 'Karnataka',          lat:12.42, lon:75.74, ndvi:0.780, tier:'Platinum' as Tier, credits:9800,  price:23.1, rating:4.8 },
  { id:3,  name: 'Sahyadri Carbon Fund',       state: 'Maharashtra',        lat:17.10, lon:73.60, ndvi:0.660, tier:'Gold'     as Tier, credits:7600,  price:19.2, rating:4.7 },
  { id:4,  name: 'Sundarbans Mangrove Trust',  state: 'West Bengal',        lat:21.94, lon:89.18, ndvi:0.680, tier:'Gold'     as Tier, credits:8700,  price:16.8, rating:4.6 },
  { id:5,  name: 'Arunachal Bio Reserve',      state: 'Arunachal Pradesh',  lat:27.50, lon:93.80, ndvi:0.810, tier:'Platinum' as Tier, credits:21000, price:24.3, rating:4.9 },
  { id:6,  name: 'Assam Rainforest Alliance',  state: 'Assam',              lat:26.20, lon:92.93, ndvi:0.620, tier:'Silver'   as Tier, credits:5400,  price:14.2, rating:4.3 },
  { id:7,  name: 'Himalayan Belt Initiative',  state: 'Uttarakhand',        lat:30.07, lon:79.01, ndvi:0.580, tier:'Silver'   as Tier, credits:4100,  price:13.9, rating:4.4 },
  { id:8,  name: 'HP Alpine Forest Fund',      state: 'Himachal Pradesh',   lat:31.90, lon:77.10, ndvi:0.590, tier:'Silver'   as Tier, credits:3800,  price:14.6, rating:4.3 },
  { id:9,  name: 'Rajasthan Dryland Restore',  state: 'Rajasthan',          lat:26.90, lon:73.90, ndvi:0.350, tier:'Bronze'   as Tier, credits:2100,  price:9.4,  rating:3.9 },
  { id:10, name: 'Gujarat Coastal Green',      state: 'Gujarat',            lat:22.25, lon:71.19, ndvi:0.410, tier:'Bronze'   as Tier, credits:2800,  price:10.1, rating:4.0 },
  { id:11, name: 'Nilgiri Biosphere Trust',    state: 'Tamil Nadu',         lat:11.40, lon:76.70, ndvi:0.760, tier:'Platinum' as Tier, credits:15200, price:22.7, rating:4.8 },
  { id:12, name: 'Odisha Forest Alliance',     state: 'Odisha',             lat:20.50, lon:84.00, ndvi:0.540, tier:'Silver'   as Tier, credits:4600,  price:13.1, rating:4.2 },
];

function TierBadge({ tier }: { tier: Tier }) {
  const cfg = TIER_CONFIG[tier];
  return (
    <span style={{ padding:'2px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'800',
      background: cfg.bg, color: cfg.color, border:`1px solid ${cfg.border}`, letterSpacing:'0.5px' }}>
      {tier === 'Platinum' ? '💎' : tier === 'Gold' ? '🥇' : tier === 'Silver' ? '🥈' : '🥉'} {tier}
    </span>
  );
}

function NGOPopup({ ngo, onClose, onSchedule }: { ngo: typeof NGOs[0]; onClose:()=>void; onSchedule:(n:string)=>void }) {
  const cfg = TIER_CONFIG[ngo.tier];
  return (
    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
      width:'320px', zIndex:200,
      background:'rgba(6,12,8,0.97)', border:`1px solid ${cfg.border}`,
      borderRadius:'20px', padding:'22px', backdropFilter:'blur(20px)',
      boxShadow:`0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${cfg.glow}`,
      animation:'popIn 0.2s ease' }}>
      <button onClick={onClose} style={{ position:'absolute', top:'14px', right:'14px',
        background:'none', border:'none', color:'#475569', cursor:'pointer', fontSize:'18px' }}>✕</button>

      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:cfg.bg,
          border:`1px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Leaf size={18} color={cfg.color} />
        </div>
        <div>
          <div style={{ color:'#f1f5f9', fontWeight:'700', fontSize:'13px' }}>{ngo.name}</div>
          <div style={{ color:'#64748b', fontSize:'11px', display:'flex', alignItems:'center', gap:'4px' }}>
            <MapPin size={10}/> {ngo.state}
          </div>
        </div>
      </div>

      <div style={{ marginBottom:'14px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
          <span style={{ color:'#64748b', fontSize:'11px' }}>NDVI SCORE</span>
          <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
            <span style={{ color:cfg.color, fontWeight:'700', fontSize:'12px' }}>{ngo.ndvi}</span>
            <TierBadge tier={ngo.tier} />
          </div>
        </div>
        <div style={{ height:'7px', borderRadius:'4px', background:'rgba(255,255,255,0.06)' }}>
          <div style={{ width:`${ngo.ndvi*100}%`, height:'100%', borderRadius:'4px',
            background:`linear-gradient(90deg, ${cfg.color}80, ${cfg.color})` }} />
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'14px' }}>
        {[
          { label:'Credits', value:ngo.credits.toLocaleString(), color:'#52b788' },
          { label:'Price/tonne', value:`$${ngo.price}`, color:'#f59e0b' },
          { label:'Rating', value:`⭐ ${ngo.rating}/5`, color:'#a78bfa' },
          { label:'State', value:ngo.state, color:'#60a5fa' },
        ].map((s,i) => (
          <div key={i} style={{ padding:'8px 10px', borderRadius:'10px',
            background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color:'#475569', fontSize:'10px', marginBottom:'3px' }}>{s.label}</div>
            <div style={{ color:s.color, fontWeight:'700', fontSize:'12px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px',
        padding:'7px 10px', borderRadius:'8px',
        background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)' }}>
        <Satellite size={12} color="#10b981"/>
        <span style={{ color:'#10b981', fontSize:'11px', fontWeight:'600' }}>Sentinel-2 GEE Verified</span>
      </div>

      <div style={{ display:'flex', gap:'8px' }}>
        <button onClick={() => { onSchedule(ngo.name); }}
          style={{ flex:1, padding:'9px', borderRadius:'9px',
            background:`linear-gradient(135deg, #1d5c38, #2d8659)`,
            border:'none', color:'#fff', fontSize:'12px', fontWeight:'700',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          <Calendar size={12}/> Schedule Meet
        </button>
        <button style={{ flex:1, padding:'9px', borderRadius:'9px',
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
          color:'#94a3b8', fontSize:'12px', fontWeight:'600', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          <MessageCircle size={12}/> Chat
        </button>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.9)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
    </div>
  );
}

export function CarbonCreditHeatMap({ onScheduleMeet }: { onScheduleMeet?: (n:string)=>void }) {
  const [selectedNGO, setSelectedNGO] = useState<typeof NGOs[0]|null>(null);
  const [hoveredId, setHoveredId] = useState<number|null>(null);
  const [tierFilter, setTierFilter] = useState<Tier|'All'>('All');

  const filtered = tierFilter === 'All' ? NGOs : NGOs.filter(n => n.tier === tierFilter);

  const tierAvgs = (Object.keys(TIER_CONFIG) as Tier[]).map(tier => {
    const group = NGOs.filter(n => n.tier === tier);
    const avg = group.reduce((s,n) => s+n.price, 0) / group.length;
    return { tier, avg: avg.toFixed(1), count: group.length, cfg: TIER_CONFIG[tier] };
  });

  return (
    <div style={{ background:'linear-gradient(135deg,rgba(4,10,6,0.98),rgba(8,18,11,0.96))',
      border:'1px solid rgba(82,183,136,0.18)', borderRadius:'22px', overflow:'hidden' }}>

      {/* Tier price header */}
      <div style={{ padding:'18px 24px', borderBottom:'1px solid rgba(82,183,136,0.1)',
        background:'rgba(0,0,0,0.4)' }}>
        <h3 style={{ color:'#e2e8f0', fontWeight:'700', fontSize:'15px', margin:'0 0 14px' }}>
          🇮🇳 India Carbon Credit Registry — NGO Tier Map
        </h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
          {tierAvgs.map(({ tier, avg, count, cfg }) => (
            <div key={tier} style={{ padding:'12px 14px', borderRadius:'14px',
              background: cfg.bg, border:`1px solid ${cfg.border}`,
              cursor:'pointer', transition:'all 0.2s',
              boxShadow: tierFilter === tier ? `0 0 20px ${cfg.glow}` : 'none',
              transform: tierFilter === tier ? 'translateY(-2px)' : 'none' }}
              onClick={() => setTierFilter(tierFilter === tier ? 'All' : tier)}>
              <div style={{ color:cfg.color, fontWeight:'800', fontSize:'13px', marginBottom:'3px' }}>
                {tier === 'Platinum' ? '💎' : tier === 'Gold' ? '🥇' : tier === 'Silver' ? '🥈' : '🥉'} {tier}
              </div>
              <div style={{ color:'#f1f5f9', fontWeight:'700', fontSize:'20px' }}>${avg}</div>
              <div style={{ color:'#64748b', fontSize:'11px' }}>avg · {count} NGOs</div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ position:'relative', background:'radial-gradient(ellipse at center,rgba(8,22,14,0.95),rgba(2,7,4,1))' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1050, center: [82.5, 23] }}
          style={{ width:'100%', height:'500px' }}>
          <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={8}>
            <Geographies geography={INDIA_GEO}>
              {({ geographies }) => geographies.map(geo => (
                <Geography key={geo.rsmKey} geography={geo}
                  style={{
                    default: { fill:'rgba(45,134,89,0.12)', stroke:'rgba(82,183,136,0.35)', strokeWidth:0.8, outline:'none' },
                    hover:   { fill:'rgba(45,134,89,0.22)', stroke:'rgba(82,183,136,0.6)',  strokeWidth:1,   outline:'none' },
                    pressed: { outline:'none' },
                  }} />
              ))}
            </Geographies>

            {filtered.map(ngo => {
              const cfg = TIER_CONFIG[ngo.tier];
              const isHov = hoveredId === ngo.id;
              const isSel = selectedNGO?.id === ngo.id;
              const r = isHov || isSel ? 10 : 7;
              return (
                <Marker key={ngo.id} coordinates={[ngo.lon, ngo.lat]}
                  onClick={() => setSelectedNGO(selectedNGO?.id===ngo.id ? null : ngo)}
                  onMouseEnter={() => setHoveredId(ngo.id)}
                  onMouseLeave={() => setHoveredId(null)}>
                  <circle r={r+7} fill={cfg.bg} stroke={cfg.border} strokeWidth={1} style={{cursor:'pointer'}} />
                  <circle r={r} fill={cfg.color} stroke="rgba(255,255,255,0.9)" strokeWidth={isSel?2.5:1.5}
                    style={{ cursor:'pointer', filter: isHov ? `drop-shadow(0 0 8px ${cfg.color})` : 'none', transition:'r 0.15s' }} />
                  {(isHov||isSel) && (
                    <text textAnchor="middle" y={-16}
                      style={{ fontSize:'9px', fill:'#fff', fontWeight:'700', pointerEvents:'none', fontFamily:'monospace' }}>
                      {ngo.tier}
                    </text>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {selectedNGO && (
          <NGOPopup ngo={selectedNGO}
            onClose={() => setSelectedNGO(null)}
            onSchedule={(name) => { setSelectedNGO(null); onScheduleMeet?.(name); }} />
        )}
      </div>

      {/* Legend */}
      <div style={{ padding:'14px 24px', borderTop:'1px solid rgba(82,183,136,0.1)',
        background:'rgba(0,0,0,0.4)',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
          {(Object.entries(TIER_CONFIG) as [Tier, typeof TIER_CONFIG[Tier]][]).map(([tier,cfg]) => (
            <div key={tier} style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' }}
              onClick={() => setTierFilter(tierFilter===tier?'All':tier)}>
              <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:cfg.color,
                boxShadow: tierFilter===tier ? `0 0 8px ${cfg.color}` : 'none' }} />
              <span style={{ color: tierFilter===tier ? cfg.color : '#64748b', fontSize:'12px', fontWeight:'600' }}>
                {tier}
              </span>
            </div>
          ))}
        </div>
        <span style={{ color:'#475569', fontSize:'11px' }}>
          {filtered.length}/{NGOs.length} NGOs · Click pin for details · Scroll to zoom
        </span>
      </div>
    </div>
  );
}
