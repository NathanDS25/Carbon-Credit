'use client';
import { useState, useEffect } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ErrorBar, Cell, Legend, BarChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Globe, RefreshCw, DollarSign } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

// ── Tier config ─────────────────────────────────────────────────────────────
const TIERS = {
  Platinum: { color:'#e2e8f0', bg:'rgba(226,232,240,0.08)', border:'rgba(226,232,240,0.25)', emoji:'💎', avgPrice:23.5, range:[22,25] as [number,number] },
  Gold:     { color:'#fbbf24', bg:'rgba(251,191,36,0.08)',  border:'rgba(251,191,36,0.25)',  emoji:'🥇', avgPrice:19.1, range:[17,21] as [number,number] },
  Silver:   { color:'#94a3b8', bg:'rgba(148,163,184,0.08)', border:'rgba(148,163,184,0.25)', emoji:'🥈', avgPrice:14.0, range:[13,16] as [number,number] },
  Bronze:   { color:'#c2713c', bg:'rgba(194,113,60,0.08)',  border:'rgba(194,113,60,0.25)',  emoji:'🥉', avgPrice:9.8,  range:[8,12]  as [number,number] },
};

// ── Candlestick data (6-month OHLC) ─────────────────────────────────────────
const CANDLE_DATA = [
  { month:'Nov', open:12.2, close:13.8, high:14.5, low:11.8 },
  { month:'Dec', open:13.8, close:15.1, high:15.8, low:13.2 },
  { month:'Jan', open:15.1, close:14.4, high:16.2, low:13.9 },
  { month:'Feb', open:14.4, close:16.8, high:17.5, low:14.0 },
  { month:'Mar', open:16.8, close:18.2, high:19.1, low:16.2 },
  { month:'Apr', open:18.2, close:17.3, high:19.5, low:16.8 },
];

// ── Custom Candlestick bar ───────────────────────────────────────────────────
const CandleBar = (props: any) => {
  const { x, y, width, height, open, close, high, low, chartBottom, yScale } = props;
  if (!yScale) return null;
  const bullish = close >= open;
  const color = bullish ? '#10b981' : '#ef4444';
  const bodyTop = Math.min(yScale(open), yScale(close));
  const bodyH   = Math.abs(yScale(open) - yScale(close)) || 2;
  const cx = x + width / 2;
  return (
    <g>
      {/* Wick */}
      <line x1={cx} y1={yScale(high)} x2={cx} y2={yScale(low)} stroke={color} strokeWidth={1.5} />
      {/* Body */}
      <rect x={x + 4} y={bodyTop} width={width - 8} height={bodyH}
        fill={bullish ? color : color} fillOpacity={bullish ? 0.85 : 0.7}
        rx={2} stroke={color} strokeWidth={0.5} />
    </g>
  );
};

// ── Custom tooltip ───────────────────────────────────────────────────────────
const CandleTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const bullish = d.close >= d.open;
  return (
    <div style={{ background:'rgba(4,10,6,0.98)', border:'1px solid rgba(82,183,136,0.3)',
      borderRadius:'12px', padding:'12px 16px', backdropFilter:'blur(20px)',
      boxShadow:'0 10px 40px rgba(0,0,0,0.6)' }}>
      <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'8px', fontWeight:'700' }}>{label}</div>
      {[['Open','open','#60a5fa'],['High','high','#10b981'],['Low','low','#ef4444'],['Close','close', bullish?'#10b981':'#ef4444']].map(([lbl,key,clr])=>(
        <div key={lbl} style={{ display:'flex', justifyContent:'space-between', gap:'20px', fontSize:'12px', marginBottom:'3px' }}>
          <span style={{ color:'#64748b' }}>{lbl}</span>
          <span style={{ color:clr, fontWeight:'700' }}>${(d[key as string] as number).toFixed(2)}</span>
        </div>
      ))}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:'8px', paddingTop:'6px',
        display:'flex', justifyContent:'space-between', fontSize:'12px' }}>
        <span style={{ color:'#64748b' }}>Change</span>
        <span style={{ color: bullish?'#10b981':'#ef4444', fontWeight:'700' }}>
          {bullish?'+':''}{(d.close-d.open).toFixed(2)} ({((d.close-d.open)/d.open*100).toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};

// ── Chart that draws candles using composedChart bars ────────────────────────
function CandlestickChart({ data }: { data: typeof CANDLE_DATA }) {
  // Transform data for ComposedChart: use stacked bars to simulate candle body
  // low → bodyBottom (transparent), bodyBottom → body (colored), rest transparent
  const transformed = data.map(d => {
    const bullish = d.close >= d.open;
    const bodyBottom = Math.min(d.open, d.close);
    const bodyTop    = Math.max(d.open, d.close);
    return {
      ...d,
      bullish,
      gap:      bodyBottom - d.low,
      body:     bodyTop - bodyBottom || 0.1,
      topGap:   d.high - bodyTop,
      lowBase:  d.low,
    };
  });

  const CustomTick = ({ x, y, payload }: any) => (
    <text x={x} y={y+12} textAnchor="middle" fill="#64748b" fontSize={12}>{payload.value}</text>
  );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={transformed} barCategoryGap="25%" margin={{ top:20, right:10, bottom:5, left:10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.07)" vertical={false} />
        <XAxis dataKey="month" tick={<CustomTick/>} axisLine={false} tickLine={false} />
        <YAxis domain={['auto','auto']} tick={{ fill:'#64748b', fontSize:11 }}
          axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={45} />
        <Tooltip content={<CandleTooltip />} cursor={{ fill:'rgba(82,183,136,0.05)' }} />

        {/* Transparent base (low) */}
        <Bar dataKey="lowBase" stackId="candle" fill="transparent" stroke="none" />
        {/* Gap below body */}
        <Bar dataKey="gap" stackId="candle" fill="transparent" stroke="none"
          shape={(props: any) => {
            const d = props.data?.[props.index] || transformed[props.index];
            const color = d?.bullish ? '#10b981' : '#ef4444';
            const cx = props.x + props.width/2;
            return <line x1={cx} y1={props.y} x2={cx} y2={props.y+props.height} stroke={color} strokeWidth={2}/>;
          }} />
        {/* Candle body */}
        <Bar dataKey="body" stackId="candle" radius={[2,2,2,2]}
          shape={(props: any) => {
            const d = transformed[props.index];
            const color = d?.bullish ? '#10b981' : '#ef4444';
            return <rect x={props.x+4} y={props.y} width={props.width-8} height={Math.max(props.height,2)}
              fill={color} fillOpacity={0.85} rx={2} stroke={color} strokeWidth={0.5}/>;
          }}>
          {transformed.map((d,i) => <Cell key={i} fill={d.bullish?'#10b981':'#ef4444'} />)}
        </Bar>
        {/* Top gap (wick above body) */}
        <Bar dataKey="topGap" stackId="candle" fill="transparent" stroke="none"
          shape={(props: any) => {
            const d = transformed[props.index];
            const color = d?.bullish ? '#10b981' : '#ef4444';
            const cx = props.x + props.width/2;
            return <line x1={cx} y1={props.y} x2={cx} y2={props.y+props.height} stroke={color} strokeWidth={2}/>;
          }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Regional bar chart ───────────────────────────────────────────────────────
const REGIONAL = [
  { region:'Western Ghats', price:18.5, tier:'Gold' },
  { region:'Northeast India', price:21.8, tier:'Platinum' },
  { region:'Nilgiris', price:22.7, tier:'Platinum' },
  { region:'Himalayan Belt', price:14.6, tier:'Silver' },
  { region:'Sundarbans', price:16.8, tier:'Gold' },
  { region:'Rajasthan', price:9.4,  tier:'Bronze' },
];

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, color }: any) => (
  <div style={{ background:'rgba(6,14,9,0.9)', border:'1px solid rgba(82,183,136,0.12)',
    borderRadius:'16px', padding:'18px 20px', backdropFilter:'blur(12px)', transition:'all 0.3s' }}
    onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-3px)',e.currentTarget.style.boxShadow=`0 10px 30px ${color}22`)}
    onMouseLeave={e=>(e.currentTarget.style.transform='none',e.currentTarget.style.boxShadow='none')}>
    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
      <span style={{ color:'#64748b', fontSize:'12px' }}>{label}</span>
      <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:`${color}18`,
        display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</div>
    </div>
    <div style={{ color:'#f1f5f9', fontSize:'22px', fontWeight:'700', marginBottom:'4px' }}>{value}</div>
    {sub && <div style={{ color:'#475569', fontSize:'11px' }}>{sub}</div>}
  </div>
);

// ── Section wrapper ──────────────────────────────────────────────────────────
const Card = ({ title, children, right }: any) => (
  <div style={{ background:'rgba(6,14,9,0.9)', border:'1px solid rgba(82,183,136,0.12)',
    borderRadius:'18px', padding:'22px', backdropFilter:'blur(12px)' }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
      <h3 style={{ color:'#e2e8f0', fontSize:'14px', fontWeight:'700', margin:0 }}>{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────
export function TradingDashboard() {
  const [tradingData, setTradingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('6M');

  const load = async (r=false) => {
    if(r) setRefreshing(true);
    try {
      const res = await axios.get(`${API}/carbon/trading-data`).then(r=>r.data).catch(()=>null);
      setTradingData(res);
    } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(()=>{ load(); },[]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

      {/* ── Tier avg price cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
        {(Object.entries(TIERS) as [string, typeof TIERS[keyof typeof TIERS]][]).map(([tier,cfg])=>(
          <div key={tier} style={{ padding:'16px 18px', borderRadius:'16px',
            background: cfg.bg, border:`1px solid ${cfg.border}`,
            backdropFilter:'blur(12px)', transition:'all 0.25s' }}
            onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-3px)', e.currentTarget.style.boxShadow=`0 10px 28px ${cfg.border}`)}
            onMouseLeave={e=>(e.currentTarget.style.transform='none', e.currentTarget.style.boxShadow='none')}>
            <div style={{ color:cfg.color, fontWeight:'800', fontSize:'12px', marginBottom:'6px' }}>
              {cfg.emoji} {tier}
            </div>
            <div style={{ color:'#f1f5f9', fontSize:'24px', fontWeight:'800' }}>${cfg.avgPrice}</div>
            <div style={{ color:'#475569', fontSize:'11px', marginTop:'2px' }}>
              avg · ${cfg.range[0]}–${cfg.range[1]}/tonne
            </div>
          </div>
        ))}
      </div>

      {/* ── Stats row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
        <StatCard label="Market Price (CCT)" value={`$${tradingData?.currentPrice??'---'}`}
          sub="Carbon Credit Token" icon={<DollarSign size={14}/>} color="#10b981" />
        <StatCard label="24h Volume" value={tradingData?.volume24h?.toLocaleString()??'---'}
          sub="Credits traded" icon={<Activity size={14}/>} color="#60a5fa" />
        <StatCard label="Platinum Avg" value="$23.50" sub="+4.2% this month"
          icon={<TrendingUp size={14}/>} color="#e2e8f0" />
        <StatCard label="Active Regions" value="12" sub="Verified ecosystems"
          icon={<Globe size={14}/>} color="#a78bfa" />
      </div>

      {/* ── Candlestick Chart ── */}
      <Card title="Carbon Credit Market — Monthly OHLC (Candlestick)"
        right={
          <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
            <button onClick={()=>load(true)} style={{ background:'none', border:'1px solid rgba(82,183,136,0.2)',
              borderRadius:'7px', padding:'5px 9px', color:'#52b788', cursor:'pointer',
              display:'flex', alignItems:'center', gap:'5px', fontSize:'11px' }}>
              <RefreshCw size={11} style={{ animation:refreshing?'spin 0.8s linear infinite':'none' }} /> Refresh
            </button>
            {['1M','3M','6M','1Y'].map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} style={{
                padding:'4px 10px', borderRadius:'7px', fontSize:'11px', fontWeight:'600',
                background: period===p ? 'rgba(82,183,136,0.2)' : 'transparent',
                border:`1px solid ${period===p ? 'rgba(82,183,136,0.5)' : 'rgba(255,255,255,0.07)'}`,
                color: period===p ? '#52b788' : '#475569', cursor:'pointer', transition:'all 0.15s'
              }}>{p}</button>
            ))}
          </div>
        }>
        {/* Legend */}
        <div style={{ display:'flex', gap:'16px', marginBottom:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'12px', height:'12px', borderRadius:'2px', background:'#10b981' }}/>
            <span style={{ color:'#64748b', fontSize:'11px' }}>Bullish (close ≥ open)</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'12px', height:'12px', borderRadius:'2px', background:'#ef4444' }}/>
            <span style={{ color:'#64748b', fontSize:'11px' }}>Bearish (close &lt; open)</span>
          </div>
        </div>
        <CandlestickChart data={CANDLE_DATA} />
      </Card>

      {/* ── Regional prices + Trades ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px' }}>

        <Card title="Regional Carbon Credit Prices (India)">
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {REGIONAL.map((r,i)=>{
              const cfg = TIERS[r.tier as keyof typeof TIERS];
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'10px 12px', borderRadius:'10px',
                  background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)',
                  transition:'background 0.15s' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(82,183,136,0.05)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.02)')}>
                  <div>
                    <div style={{ color:'#e2e8f0', fontSize:'13px', fontWeight:'600' }}>{r.region}</div>
                    <span style={{ padding:'1px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'700',
                      background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                      {cfg.emoji} {r.tier}
                    </span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ color:'#52b788', fontWeight:'700', fontSize:'15px' }}>${r.price}</div>
                    <div style={{ color:'#475569', fontSize:'11px' }}>per tonne CO₂</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Recent Blockchain Trades">
          {tradingData?.recentTrades?.length > 0 ? (
            <div style={{ overflowY:'auto', maxHeight:'280px' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(82,183,136,0.12)' }}>
                    {['Time','Seller','Credits','Price','Total'].map(h=>(
                      <th key={h} style={{ textAlign:'left', padding:'8px 10px',
                        color:'#475569', fontSize:'10px', fontWeight:'600', textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tradingData.recentTrades.map((t:any,i:number)=>(
                    <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}
                      onMouseEnter={e=>(e.currentTarget.style.background='rgba(82,183,136,0.05)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                      <td style={{ padding:'10px', color:'#64748b', fontSize:'12px' }}>{t.time}</td>
                      <td style={{ padding:'10px', color:'#94a3b8', fontSize:'12px', fontFamily:'monospace' }}>{t.seller}</td>
                      <td style={{ padding:'10px', color:'#52b788', fontWeight:'700', fontSize:'12px' }}>{t.credits?.toLocaleString()}</td>
                      <td style={{ padding:'10px', color:'#f1f5f9', fontWeight:'600', fontSize:'12px' }}>${t.price}</td>
                      <td style={{ padding:'10px', color:'#f59e0b', fontWeight:'600', fontSize:'12px' }}>${(t.credits*t.price)?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'40px', color:'#475569' }}>
              <Activity size={28} style={{ margin:'0 auto 10px', opacity:0.3 }}/>
              <div style={{ fontSize:'13px' }}>No trades yet.</div>
              <div style={{ fontSize:'11px', marginTop:'4px' }}>Trades appear after a satellite mint.</div>
            </div>
          )}
        </Card>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
