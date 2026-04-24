'use client';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, Satellite, Leaf, Zap, MapPin, ExternalLink } from 'lucide-react';

interface SatelliteResult {
  ndviScore: number;
  creditsMinted: number;
  etherscanLink: string;
  satellite?: string;
  error?: string;
}

interface Props {
  result: SatelliteResult;
  isVerifying: boolean;
  landArea?: number;
}

function NDVIGauge({ score, animated }: { score: number; animated: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!animated) { setDisplayScore(score); return; }
    let current = 0;
    const step = score / 60;
    const interval = setInterval(() => {
      current = Math.min(current + step, score);
      setDisplayScore(parseFloat(current.toFixed(3)));
      if (current >= score) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [score, animated]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = canvas.width / 2;
    const cy = canvas.height - 20;
    const r = 85;
    const startAngle = Math.PI;
    const endAngle = 0;
    const progress = displayScore;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.lineWidth = 16;
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Colored progress arc
    const progressAngle = startAngle + (endAngle - startAngle + Math.PI * 2) * Math.min(progress, 1) - Math.PI;
    const color = progress < 0.4 ? '#ef4444' : progress < 0.6 ? '#f59e0b' : '#10b981';
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, progress < 0.4 ? '#ef4444' : '#10b981');
    gradient.addColorStop(1, progress < 0.4 ? '#f97316' : '#52b788');
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, progressAngle);
    ctx.lineWidth = 16;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Tick marks
    for (let i = 0; i <= 10; i++) {
      const angle = Math.PI + (Math.PI * i) / 10;
      const innerR = r - 22;
      const outerR = r - 10;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
      ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.stroke();
    }

    // Center score text
    ctx.font = 'bold 28px Inter, system-ui';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(displayScore.toFixed(3), cx, cy - 8);

    ctx.font = '12px Inter, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('NDVI SCORE', cx, cy + 12);

    // Labels
    ctx.font = '11px Inter, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'left';
    ctx.fillText('0.0', cx - r - 10, cy + 4);
    ctx.textAlign = 'right';
    ctx.fillText('1.0', cx + r + 10, cy + 4);
  }, [displayScore]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <canvas ref={canvasRef} width={220} height={130} />
    </div>
  );
}

function ScanLine() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden', borderRadius: '12px', background: 'rgba(0,0,0,0.3)' }}>
      {/* Simulated satellite grid */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gridTemplateRows: 'repeat(5,1fr)', gap: '1px', padding: '4px' }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            borderRadius: '3px',
            background: `hsl(${120 + (i % 7) * 10}, ${40 + (i % 5) * 8}%, ${15 + (i % 6) * 5}%)`,
            transition: 'background 0.5s ease',
          }} />
        ))}
      </div>
      {/* Scan line animation */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, transparent, #52b788, transparent)',
        boxShadow: '0 0 12px #52b788',
        animation: 'scanDown 2s linear infinite',
      }} />
      {/* Overlay text */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '8px',
      }}>
        <Satellite size={28} color="#52b788" style={{ animation: 'pulse 1.5s ease infinite' }} />
        <span style={{ color: '#52b788', fontSize: '12px', fontWeight: '600', letterSpacing: '2px' }}>
          SCANNING VIA SENTINEL-2
        </span>
      </div>
      <style>{`
        @keyframes scanDown {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export function SatelliteVerificationPanel({ result, isVerifying, landArea }: Props) {
  const isVerified = !result.error && result.ndviScore >= 0.4;
  const ndviColor = result.ndviScore < 0.4 ? '#ef4444' : result.ndviScore < 0.6 ? '#f59e0b' : '#10b981';
  const ndviLabel = result.ndviScore < 0.2 ? 'Barren / Urban' : result.ndviScore < 0.4 ? 'Sparse Vegetation' : result.ndviScore < 0.6 ? 'Moderate Vegetation' : result.ndviScore < 0.8 ? 'Dense Vegetation' : 'Tropical Rainforest';

  if (isVerifying) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(10,20,15,0.95), rgba(15,30,20,0.9))',
        border: '1px solid rgba(82,183,136,0.3)',
        borderRadius: '20px', padding: '24px',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Satellite size={20} color="#52b788" />
          <span style={{ color: '#52b788', fontWeight: '700', fontSize: '15px' }}>Satellite Verification in Progress</span>
        </div>
        <ScanLine />
        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['Fetching Sentinel-2 Bands...', 'Computing NDVI...', 'Validating Coordinates...'].map((s, i) => (
            <span key={i} style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '11px',
              background: 'rgba(82,183,136,0.1)', color: '#52b788',
              border: '1px solid rgba(82,183,136,0.2)',
              animation: `fadeIn 0.5s ease ${i * 0.3}s both`,
            }}>{s}</span>
          ))}
        </div>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }`}</style>
      </div>
    );
  }

  if (result.error) {
    return (
      <div style={{
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: '20px', padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <XCircle size={20} color="#ef4444" />
          <span style={{ color: '#f87171', fontWeight: '700' }}>Verification Failed</span>
        </div>
        <p style={{ color: '#fca5a5', fontSize: '14px' }}>{result.error}</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(10,20,15,0.95), rgba(15,30,20,0.9))',
      border: `1px solid ${isVerified ? 'rgba(82,183,136,0.4)' : 'rgba(239,68,68,0.3)'}`,
      borderRadius: '20px', padding: '24px',
      backdropFilter: 'blur(20px)',
      boxShadow: isVerified ? '0 8px 40px rgba(45,134,89,0.2)' : '0 8px 40px rgba(239,68,68,0.1)',
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Satellite size={20} color="#52b788" />
          <span style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '15px' }}>Satellite Verification Result</span>
        </div>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
          background: isVerified ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: isVerified ? '#10b981' : '#ef4444',
          border: `1px solid ${isVerified ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          {isVerified ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {isVerified ? 'VERIFIED' : 'NOT VERIFIED'}
        </span>
      </div>

      {/* Gauge + Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
        {/* NDVI Gauge */}
        <div style={{
          background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '16px',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <NDVIGauge score={result.ndviScore} animated={true} />
          <span style={{
            marginTop: '4px', padding: '4px 12px', borderRadius: '20px',
            fontSize: '11px', fontWeight: '600',
            background: `${ndviColor}22`, color: ndviColor,
            border: `1px solid ${ndviColor}44`,
          }}>{ndviLabel}</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Credits Minted', value: result.creditsMinted?.toLocaleString() ?? '0', icon: <Zap size={14} />, color: '#f59e0b' },
            { label: 'Land Area', value: landArea ? `${landArea} hectares` : 'N/A', icon: <MapPin size={14} />, color: '#60a5fa' },
            { label: 'Vegetation Index', value: result.ndviScore.toFixed(3), icon: <Leaf size={14} />, color: ndviColor },
            { label: 'Data Source', value: result.satellite || 'Sentinel-2 / GEE', icon: <Satellite size={14} />, color: '#a78bfa' },
          ].map((stat, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px' }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
                {stat.label}
              </div>
              <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Etherscan link */}
      {isVerified && result.etherscanLink && (
        <a
          href={result.etherscanLink}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px',
            padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(82,183,136,0.1)',
            border: '1px solid rgba(82,183,136,0.2)',
            color: '#52b788', fontSize: '13px', fontWeight: '600',
            textDecoration: 'none', transition: 'all 0.2s',
          }}
        >
          <ExternalLink size={14} />
          View Blockchain Transaction on Etherscan
        </a>
      )}
    </div>
  );
}
