'use client';
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  DollarSign, Activity, Globe, Leaf, BarChart2, RefreshCw
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

// Average carbon credit price history (global benchmark)
const globalPriceHistory = [
  { month: 'Nov', avgPrice: 12.4, high: 14.2, low: 10.8 },
  { month: 'Dec', avgPrice: 13.1, high: 15.0, low: 11.5 },
  { month: 'Jan', avgPrice: 14.8, high: 16.5, low: 13.0 },
  { month: 'Feb', avgPrice: 15.2, high: 17.1, low: 13.8 },
  { month: 'Mar', avgPrice: 16.0, high: 18.2, low: 14.5 },
  { month: 'Apr', avgPrice: 17.3, high: 19.5, low: 15.8 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,20,15,0.98)',
      border: '1px solid rgba(82,183,136,0.3)',
      borderRadius: '12px', padding: '12px 16px',
      backdropFilter: 'blur(20px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, fontSize: '13px', fontWeight: '600' }}>
          {p.name}: <span style={{ color: '#e2e8f0' }}>${typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, sub, icon, color, trend }: any) => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(10,20,15,0.95), rgba(15,30,20,0.9))',
    border: '1px solid rgba(82,183,136,0.15)',
    borderRadius: '18px', padding: '20px',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.3s ease',
    cursor: 'default',
  }}
    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)', e.currentTarget.style.boxShadow = '0 12px 40px rgba(45,134,89,0.25)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = 'none')}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</div>
      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
    </div>
    <div style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>{value}</div>
    {trend && (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
        color: trend.startsWith('+') ? '#10b981' : '#ef4444',
      }}>
        {trend.startsWith('+') ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        {trend} <span style={{ color: '#475569', marginLeft: '4px' }}>{sub}</span>
      </div>
    )}
    {!trend && sub && <div style={{ color: '#64748b', fontSize: '12px' }}>{sub}</div>}
  </div>
);

const SectionCard = ({ title, children, rightSlot }: any) => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(10,20,15,0.95), rgba(15,30,20,0.9))',
    border: '1px solid rgba(82,183,136,0.15)',
    borderRadius: '20px', padding: '24px',
    backdropFilter: 'blur(20px)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h3 style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: '700', margin: 0 }}>{title}</h3>
      {rightSlot}
    </div>
    {children}
  </div>
);

export function TradingDashboard() {
  const [tradingData, setTradingData] = useState<any>(null);
  const [regionalPrices, setRegionalPrices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePeriod, setActivePeriod] = useState('1D');

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [trading, regional] = await Promise.all([
        axios.get(`${API}/carbon/trading-data`).then(r => r.data).catch(() => null),
        axios.get(`${API}/carbon/regional-prices`).then(r => r.data).catch(() => []),
      ]);
      setTradingData(trading);
      setRegionalPrices(regional);
    } catch {
      // handled per-request
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Ticker data (live-feeling price display)
  const tickers = [
    { symbol: 'CCT', name: 'Carbon Credit Token', price: tradingData?.currentPrice ?? '---', change: '+2.4%', up: true },
    { symbol: 'VCU', name: 'Verified Carbon Unit', price: '18.50', change: '+1.2%', up: true },
    { symbol: 'CER', name: 'Certified Emission', price: '21.80', change: '-0.8%', up: false },
    { symbol: 'REC', name: 'Renewable Energy Cert', price: '9.20', change: '+3.1%', up: true },
  ];

  // Regional chart data (bar chart)
  const regionalChartData = regionalPrices.map(r => ({
    region: r.region.split(',')[0],
    price: r.price,
    volume: Math.round(r.volume / 1000),
    ndvi: r.ndviAvg,
  }));

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '3px solid rgba(82,183,136,0.2)',
            borderTopColor: '#52b788',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ color: '#52b788', fontSize: '14px' }}>Loading market data...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Ticker Strip */}
      <div style={{
        background: 'rgba(10,20,15,0.8)',
        border: '1px solid rgba(82,183,136,0.15)',
        borderRadius: '14px', padding: '14px 20px',
        display: 'flex', gap: '32px', overflowX: 'auto',
        backdropFilter: 'blur(10px)',
      }}>
        {tickers.map((t, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 'max-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '14px' }}>{t.symbol}</span>
              <span style={{
                padding: '1px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                background: t.up ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: t.up ? '#10b981' : '#ef4444',
              }}>{t.change}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '700' }}>${t.price}</span>
              <span style={{ color: '#64748b', fontSize: '11px' }}>{t.name}</span>
            </div>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => loadData(true)}
            style={{
              background: 'none', border: '1px solid rgba(82,183,136,0.2)',
              borderRadius: '8px', padding: '6px 10px',
              color: '#52b788', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px',
            }}
          >
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard label="Current CCT Price" value={`$${tradingData?.currentPrice ?? '---'}`} trend="+2.4%" sub="vs yesterday" icon={<DollarSign size={16} />} color="#10b981" />
        <StatCard label="24h Volume" value={tradingData?.volume24h?.toLocaleString() ?? '---'} sub="Credits traded today" icon={<Activity size={16} />} color="#60a5fa" />
        <StatCard label="Avg Market Price" value="$17.30" trend="+5.8%" sub="this month" icon={<TrendingUp size={16} />} color="#f59e0b" />
        <StatCard label="Active Regions" value={`${regionalPrices.length}`} sub="Verified ecosystems" icon={<Globe size={16} />} color="#a78bfa" />
      </div>

      {/* Average Price History Chart */}
      <SectionCard
        title="Global Average Carbon Credit Price (USD/tonne)"
        rightSlot={
          <div style={{ display: 'flex', gap: '6px' }}>
            {['1D', '1W', '1M', '6M', 'ALL'].map(p => (
              <button key={p} onClick={() => setActivePeriod(p)} style={{
                padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                background: activePeriod === p ? 'rgba(82,183,136,0.3)' : 'transparent',
                border: `1px solid ${activePeriod === p ? 'rgba(82,183,136,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: activePeriod === p ? '#52b788' : '#64748b',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>{p}</button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={globalPriceHistory}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d8659" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2d8659" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.08)" />
            <XAxis dataKey="month" stroke="#475569" style={{ fontSize: '12px' }} />
            <YAxis stroke="#475569" style={{ fontSize: '12px' }} tickFormatter={v => `$${v}`} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            <Area type="monotone" dataKey="high" name="High" stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" fill="url(#highGrad)" />
            <Area type="monotone" dataKey="avgPrice" name="Avg Price" stroke="#52b788" strokeWidth={2.5} fill="url(#priceGrad)" />
            <Area type="monotone" dataKey="low" name="Low" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Regional Prices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Regional Price Bar Chart */}
        <SectionCard title="Carbon Credit Prices by Region (USD/tonne)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regionalChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.08)" horizontal={false} />
              <XAxis type="number" stroke="#475569" style={{ fontSize: '11px' }} tickFormatter={v => `$${v}`} />
              <YAxis type="category" dataKey="region" stroke="#475569" style={{ fontSize: '10px' }} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="price" name="Price" fill="#2d8659" radius={[0, 6, 6, 0]}
                background={{ fill: 'rgba(255,255,255,0.02)', radius: 6 }} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Regional Prices Table */}
        <SectionCard title="Regional Market Overview">
          <div style={{ overflowY: 'auto', maxHeight: '260px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(82,183,136,0.15)' }}>
                  {['Region', 'Price', 'Trend', 'NDVI'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regionalPrices.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(82,183,136,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 10px', fontSize: '12px' }}>
                      <div style={{ color: '#e2e8f0', fontWeight: '600' }}>{r.region.split(',')[0]}</div>
                      <div style={{ color: '#475569', fontSize: '11px' }}>{r.type}</div>
                    </td>
                    <td style={{ padding: '10px', color: '#52b788', fontWeight: '700', fontSize: '13px' }}>${r.price}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                        background: r.trend.startsWith('+') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: r.trend.startsWith('+') ? '#10b981' : '#ef4444',
                      }}>{r.trend}</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{ width: `${r.ndviAvg * 100}%`, height: '100%', borderRadius: '3px', background: r.ndviAvg > 0.6 ? '#10b981' : r.ndviAvg > 0.4 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '11px', minWidth: '32px' }}>{r.ndviAvg}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Live Trades Table */}
      <SectionCard title="Recent Blockchain Trades">
        {tradingData?.recentTrades?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(82,183,136,0.15)' }}>
                  {['Time', 'Buyer', 'Seller', 'Credits', 'Price (USD)', 'Total'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tradingData.recentTrades.map((trade: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(82,183,136,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px', color: '#94a3b8', fontSize: '13px' }}>{trade.time}</td>
                    <td style={{ padding: '12px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'monospace' }}>{trade.buyer}</td>
                    <td style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', fontFamily: 'monospace' }}>{trade.seller}</td>
                    <td style={{ padding: '12px', color: '#52b788', fontSize: '13px', fontWeight: '700' }}>{trade.credits?.toLocaleString()}</td>
                    <td style={{ padding: '12px', color: '#f1f5f9', fontSize: '13px', fontWeight: '600' }}>${trade.price}</td>
                    <td style={{ padding: '12px', color: '#f59e0b', fontSize: '13px', fontWeight: '600' }}>${(trade.credits * trade.price)?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
            <BarChart2 size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div style={{ fontSize: '14px' }}>No trades recorded yet.</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Trades will appear here after a satellite verification mint.</div>
          </div>
        )}
      </SectionCard>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
