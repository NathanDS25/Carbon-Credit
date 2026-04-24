import { useState } from 'react';
import { X, Calendar, Clock, Video, Loader2 } from 'lucide-react';
import { triggerAction } from '../api/carbonApi';

interface ScheduleMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  partnerType: 'company' | 'ngo';
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(82,183,136,0.35)',
  color: '#f1f5f9', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
  colorScheme: 'dark',
};

const labelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '7px',
  color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '7px',
};

export function ScheduleMeetModal({ isOpen, onClose, partnerName, partnerType }: ScheduleMeetModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await triggerAction('schedule_meet_submit', { partnerName, partnerType });
      alert(`Meeting scheduled successfully with ${partnerName}!`);
      onClose();
    } catch (err: any) {
      alert(`Failed to schedule meeting: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{
        background: 'rgba(10,22,14,0.98)',
        border: '1px solid rgba(82,183,136,0.35)',
        borderRadius: '22px', width: '100%', maxWidth: '460px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 50px rgba(45,134,89,0.15)',
        animation: 'slideUp 0.25s ease',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid rgba(82,183,136,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(45,134,89,0.2)', border: '1px solid rgba(82,183,136,0.3)',
              borderRadius: '12px', padding: '8px', display: 'flex',
            }}>
              <Calendar size={18} color="#52b788" />
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '16px' }}>Schedule Meeting</div>
              <div style={{ color: '#52b788', fontSize: '13px', marginTop: '2px' }}>{partnerName}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#64748b',
            display: 'flex', transition: 'all 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9', e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b', e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Date */}
          <div>
            <label style={labelStyle}>
              <Calendar size={14} color="#52b788" /> Meeting Date
            </label>
            <input type="date" required
              min={new Date().toISOString().split('T')[0]}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(82,183,136,0.7)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(82,183,136,0.35)')}
            />
          </div>

          {/* Time */}
          <div>
            <label style={labelStyle}>
              <Clock size={14} color="#52b788" /> Meeting Time
            </label>
            <input type="time" required
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(82,183,136,0.7)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(82,183,136,0.35)')}
            />
          </div>

          {/* Duration */}
          <div>
            <label style={labelStyle}>
              <Clock size={14} color="#52b788" /> Duration
            </label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {/* Meeting Type */}
          <div>
            <label style={labelStyle}>
              <Video size={14} color="#52b788" /> Meeting Type
            </label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="video">📹 Video Call</option>
              <option value="phone">📞 Phone Call</option>
              <option value="in-person">🤝 In Person</option>
            </select>
          </div>

          {/* Agenda */}
          <div>
            <label style={labelStyle}>
              Meeting Agenda <span style={{ color: '#475569', fontWeight: '400' }}>(Optional)</span>
            </label>
            <textarea rows={3}
              placeholder="Discuss carbon credit purchase terms..."
              style={{
                ...inputStyle, resize: 'none', lineHeight: '1.5',
                fontFamily: 'inherit',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(82,183,136,0.7)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(82,183,136,0.35)')}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)', e.currentTarget.style.color = '#f1f5f9')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)', e.currentTarget.style.color = '#94a3b8')}
            >Cancel</button>

            <button type="submit" disabled={isSubmitting} style={{
              flex: 2, padding: '12px', borderRadius: '12px',
              background: isSubmitting ? 'rgba(45,134,89,0.5)' : 'linear-gradient(135deg,#1d5c38,#2d8659)',
              border: '1px solid rgba(82,183,136,0.4)',
              color: '#fff', fontSize: '14px', fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 20px rgba(45,134,89,0.3)', transition: 'all 0.2s',
            }}>
              {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Calendar size={16} />}
              {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        select option { background: #0d1f13; color: #f1f5f9; }
      `}</style>
    </div>
  );
}
