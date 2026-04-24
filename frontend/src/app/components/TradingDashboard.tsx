'use client';
import { useState, useEffect } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Globe, RefreshCw, IndianRupee } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// ── Tier config ────────────────────────────────────────────────────────────────
const TIERS = {
  Platinum: { color:'#475569', accent:'#1e293b', bg:'#f8fafc', border:'#e2e8f0', emoji:'💎', avgPrice:1962, range:[1837,2088] as [number,number], badge:'bg-slate-100 text-slate-700' },
  Gold:     { color:'#92400e', accent:'#78350f', bg:'#fffbeb', border:'#fde68a', emoji:'🥇', avgPrice:1595, range:[1420,1754] as [number,number], badge:'bg-amber-50 text-amber-800' },
  Silver:   { color:'#374151', accent:'#4b5563', bg:'#f9fafb', border:'#d1d5db', emoji:'🥈', avgPrice:1169, range:[1086,1336] as [number,number], badge:'bg-gray-100 text-gray-700' },
  Bronze:   { color:'#7c2d12', accent:'#9a3412', bg:'#fff7ed', border:'#fed7aa', emoji:'🥉', avgPrice: 818, range:[668,1002]   as [number,number], badge:'bg-orange-50 text-orange-800' },
};

// ── Candlestick OHLC data (₹/tonne) ──────────────────────────────────────────
const CANDLE_DATA = [
  { month:'Nov', open:1019, close:1152, high:1211, low: 985 },
  { month:'Dec', open:1152, close:1261, high:1319, low:1102 },
  { month:'Jan', open:1261, close:1202, high:1353, low:1161 },
  { month:'Feb', open:1202, close:1403, high:1461, low:1169 },
  { month:'Mar', open:1403, close:1520, high:1595, low:1353 },
  { month:'Apr', open:1520, close:1445, high:1629, low:1403 },
];

// ── Candlestick tooltip ────────────────────────────────────────────────────────
const CandleTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const bullish = d.close >= d.open;
  return (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px',
      padding:'12px 16px', boxShadow:'0 10px 40px rgba(0,0,0,0.1)' }}>
      <div style={{ color:'#64748b', fontSize:'12px', fontWeight:'700', marginBottom:'8px' }}>{label}</div>
      {([['Open','open','#3b82f6'],['High','high','#10b981'],['Low','low','#ef4444'],['Close','close',bullish?'#10b981':'#ef4444']] as [string,string,string][]).map(([lbl,key,clr])=>(
        <div key={lbl} style={{ display:'flex', justifyContent:'space-between', gap:'24px', fontSize:'13px', marginBottom:'3px' }}>
          <span style={{ color:'#94a3b8' }}>{lbl}</span>
          <span style={{ color:clr, fontWeight:'700' }}>{fmt(d[key])}</span>
        </div>
      ))}
      <div style={{ borderTop:'1px solid #f1f5f9', marginTop:'8px', paddingTop:'6px',
        display:'flex', justifyContent:'space-between', fontSize:'12px' }}>
        <span style={{ color:'#94a3b8' }}>Change</span>
        <span style={{ color:bullish?'#10b981':'#ef4444', fontWeight:'700' }}>
          {bullish?'+':''}{(d.close-d.open).toLocaleString('en-IN')} ({((d.close-d.open)/d.open*100).toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};

// ── Regional prices ────────────────────────────────────────────────────────────
const REGIONAL = [
  { region:'Western Ghats',   price:1545, tier:'Gold'     as keyof typeof TIERS },
  { region:'Northeast India', price:1820, tier:'Platinum' as keyof typeof TIERS },
  { region:'Nilgiris',        price:1895, tier:'Platinum' as keyof typeof TIERS },
  { region:'Himalayan Belt',  price:1219, tier:'Silver'   as keyof typeof TIERS },
  { region:'Sundarbans',      price:1403, tier:'Gold'     as keyof typeof TIERS },
  { region:'Rajasthan',       price: 785, tier:'Bronze'   as keyof typeof TIERS },
];

// ── Reusable card shell ───────────────────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'16px',
    padding:'22px', boxShadow:'0 1px 6px rgba(0,0,0,0.06)', ...style }}>
    {children}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export function TradingDashboard() {
  const [tradingData, setTradingData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('6M');

  const load = async (r = false) => {
    if (r) setRefreshing(true);
    try {
      const res = await axios.get(`${API}/carbon/trading-data`).then(r => r.data).catch(() => null);
      setTradingData(res);
    } finally { setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  // transform candle data for stacked bar trick
  const transformed = CANDLE_DATA.map(d => ({
    ...d, bullish: d.close >= d.open,
    gap:    Math.min(d.open, d.close) - d.low,
    body:   Math.abs(d.close - d.open) || 1,
    topGap: d.high - Math.max(d.open, d.close),
  }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'18px',
      background:'#f8fafc', borderRadius:'20px', padding:'20px' }}>

      {/* ── Tier avg price cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
        {(Object.entries(TIERS) as [string, typeof TIERS[keyof typeof TIERS]][]).map(([tier, cfg]) => (
          <Card key={tier} style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}`, padding:'18px' }}>
            <div style={{ color:cfg.color, fontWeight:'800', fontSize:'13px', marginBottom:'8px' }}>
              {cfg.emoji} {tier}
            </div>
            <div style={{ color:'#0f172a', fontSize:'26px', fontWeight:'800', letterSpacing:'-0.5px' }}>
              {fmt(cfg.avgPrice)}
            </div>
            <div style={{ color:'#94a3b8', fontSize:'11px', marginTop:'4px' }}>
              avg · {fmt(cfg.range[0])} – {fmt(cfg.range[1])}/tonne
            </div>
          </Card>
        ))}
      </div>

      {/* ── Stats row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
        {[
          { label:'Market Price (CCT)', value: tradingData?.currentPrice ? fmt(Math.round(tradingData.currentPrice * 83.5)) : '—', sub:'Carbon Credit Token', icon:<IndianRupee size={15}/>, color:'#10b981' },
          { label:'24h Volume',         value: tradingData?.volume24h?.toLocaleString('en-IN') ?? '—', sub:'Credits traded',      icon:<Activity size={15}/>,   color:'#3b82f6' },
          { label:'Platinum High',      value: '₹2,088',   sub:'Max this month',      icon:<TrendingUp size={15}/>,  color:'#475569' },
          { label:'Active Regions',     value: '12',        sub:'Verified ecosystems', icon:<Globe size={15}/>,       color:'#8b5cf6' },
        ].map((s, i) => (
          <Card key={i}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
              <span style={{ color:'#94a3b8', fontSize:'12px', fontWeight:'600' }}>{s.label}</span>
              <div style={{ width:'30px', height:'30px', borderRadius:'8px',
                background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color }}>
                {s.icon}
              </div>
            </div>
            <div style={{ color:'#0f172a', fontSize:'22px', fontWeight:'800' }}>{s.value}</div>
            <div style={{ color:'#94a3b8', fontSize:'11px', marginTop:'4px' }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* ── Candlestick Chart ── */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
          <div>
            <h3 style={{ color:'#0f172a', fontSize:'15px', fontWeight:'700', margin:0 }}>
              Carbon Credit Market — Monthly OHLC
            </h3>
            <p style={{ color:'#94a3b8', fontSize:'12px', margin:'4px 0 0' }}>Price per tonne CO₂ (₹)</p>
          </div>
          <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
            <button onClick={() => load(true)} style={{ background:'#f8fafc', border:'1px solid #e2e8f0',
              borderRadius:'8px', padding:'6px 10px', color:'#64748b', cursor:'pointer',
              display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', fontWeight:'600' }}>
              <RefreshCw size={12} style={{ animation:refreshing?'spin 0.8s linear infinite':'none' }} /> Refresh
            </button>
            {['1M','3M','6M','1Y'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding:'5px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:'600',
                background: period===p ? '#0f172a' : '#f1f5f9',
                color: period===p ? '#fff' : '#64748b',
                border:'none', cursor:'pointer', transition:'all 0.15s',
              }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display:'flex', gap:'16px', marginBottom:'12px' }}>
          {[['#10b981','Bullish (close ≥ open)'],['#ef4444','Bearish (close < open)']].map(([c,l])=>(
            <div key={l} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <div style={{ width:'12px', height:'12px', borderRadius:'3px', background:c }} />
              <span style={{ color:'#94a3b8', fontSize:'11px' }}>{l}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={transformed} barCategoryGap="25%" margin={{ top:20, right:10, bottom:5, left:15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fill:'#94a3b8', fontSize:12 }} axisLine={false} tickLine={false} />
            <YAxis domain={['auto','auto']} tick={{ fill:'#94a3b8', fontSize:11 }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `₹${Number(v).toLocaleString('en-IN')}`} width={65} />
            <Tooltip content={<CandleTooltip />} cursor={{ fill:'rgba(0,0,0,0.03)' }} />

            {/* Transparent base (low) */}
            <Bar dataKey="low" stackId="c" fill="transparent" stroke="none" />
            {/* Gap + wick below body */}
            <Bar dataKey="gap" stackId="c" fill="transparent" stroke="none"
              shape={(props: any) => {
                const d = transformed[props.index];
                const color = d?.bullish ? '#10b981' : '#ef4444';
                const cx = props.x + props.width / 2;
                return <line x1={cx} y1={props.y} x2={cx} y2={props.y + props.height} stroke={color} strokeWidth={2} />;
              }} />
            {/* Body */}
            <Bar dataKey="body" stackId="c" radius={[3,3,3,3]}
              shape={(props: any) => {
                const d = transformed[props.index];
                const color = d?.bullish ? '#10b981' : '#ef4444';
                return <rect x={props.x + 5} y={props.y} width={props.width - 10}
                  height={Math.max(props.height, 2)} fill={color} rx={3}
                  fillOpacity={0.9} stroke={color} strokeWidth={0.5} />;
              }}>
              {transformed.map((d, i) => <Cell key={i} fill={d.bullish ? '#10b981' : '#ef4444'} />)}
            </Bar>
            {/* Top wick */}
            <Bar dataKey="topGap" stackId="c" fill="transparent" stroke="none"
              shape={(props: any) => {
                const d = transformed[props.index];
                const color = d?.bullish ? '#10b981' : '#ef4444';
                const cx = props.x + props.width / 2;
                return <line x1={cx} y1={props.y} x2={cx} y2={props.y + props.height} stroke={color} strokeWidth={2} />;
              }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Regional + Trades ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px' }}>

        {/* Regional prices */}
        <Card>
          <h3 style={{ color:'#0f172a', fontSize:'14px', fontWeight:'700', margin:'0 0 16px' }}>
            Regional Prices — India (₹/tonne CO₂)
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {REGIONAL.map((r, i) => {
              const cfg = TIERS[r.tier];
              const maxP = 2088;
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px',
                  padding:'10px 12px', borderRadius:'10px', background:'#f8fafc',
                  border:'1px solid #f1f5f9', transition:'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f8fafc')}>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#1e293b', fontSize:'13px', fontWeight:'600' }}>{r.region}</div>
                    <div style={{ height:'5px', borderRadius:'3px', background:'#e2e8f0', marginTop:'5px' }}>
                      <div style={{ width:`${(r.price/maxP)*100}%`, height:'100%', borderRadius:'3px',
                        background: r.tier==='Platinum'?'#475569':r.tier==='Gold'?'#d97706':r.tier==='Silver'?'#9ca3af':'#c2713c' }} />
                    </div>
                  </div>
                  <div style={{ textAlign:'right', minWidth:'90px' }}>
                    <div style={{ color:'#0f172a', fontWeight:'800', fontSize:'14px' }}>{fmt(r.price)}</div>
                    <span style={{ padding:'1px 7px', borderRadius:'20px', fontSize:'10px', fontWeight:'700',
                      background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                      {cfg.emoji} {r.tier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Trades */}
        <Card>
          <h3 style={{ color:'#0f172a', fontSize:'14px', fontWeight:'700', margin:'0 0 16px' }}>
            Recent Blockchain Trades
          </h3>
          {tradingData?.recentTrades?.length > 0 ? (
            <div style={{ overflowY:'auto', maxHeight:'300px' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #f1f5f9' }}>
                    {['Time','Credits','Price','Total'].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'8px 10px',
                        color:'#94a3b8', fontSize:'11px', fontWeight:'700', textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tradingData.recentTrades.map((t: any, i: number) => (
                    <tr key={i} style={{ borderBottom:'1px solid #f8fafc', transition:'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding:'10px', color:'#94a3b8', fontSize:'12px' }}>{t.time}</td>
                      <td style={{ padding:'10px', color:'#10b981', fontWeight:'700', fontSize:'13px' }}>{t.credits?.toLocaleString('en-IN')}</td>
                      <td style={{ padding:'10px', color:'#1e293b', fontWeight:'600', fontSize:'13px' }}>{fmt(Math.round(t.price*83.5))}</td>
                      <td style={{ padding:'10px', color:'#d97706', fontWeight:'700', fontSize:'13px' }}>{fmt(Math.round(t.credits*t.price*83.5))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'48px 0', color:'#94a3b8' }}>
              <Activity size={30} style={{ margin:'0 auto 12px', opacity:0.3 }} />
              <div style={{ fontSize:'13px', fontWeight:'600', color:'#64748b' }}>No trades yet</div>
              <div style={{ fontSize:'12px', marginTop:'4px' }}>Trades appear after a satellite mint.</div>
            </div>
          )}
        </Card>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
