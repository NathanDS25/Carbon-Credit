import { useState } from 'react';
import { Calendar, MessageCircle, Plus, Building2, Target, BarChart3, Loader2 } from 'lucide-react';
import { triggerAction } from '../api/carbonApi';
import { TradingDashboard } from './TradingDashboard';
import { ScheduleMeetModal } from './ScheduleMeetModal';

interface CreditRequest {
  id: number;
  creditsNeeded: number;
  purpose: string;
  deadline: string;
  status: 'pending' | 'active' | 'fulfilled';
}

interface NGO {
  id: number;
  name: string;
  creditsAvailable: number;
  location: string;
  rating: number;
}

const mockNGOs: NGO[] = [
  { id: 1, name: 'Green Earth Foundation', creditsAvailable: 12000, location: 'Costa Rica', rating: 4.8 },
  { id: 2, name: 'TreePlant Initiative', creditsAvailable: 8500, location: 'India', rating: 4.9 },
  { id: 3, name: 'Forest Guardians', creditsAvailable: 15000, location: 'Brazil', rating: 4.7 },
  { id: 4, name: 'Carbon Offset Alliance', creditsAvailable: 6200, location: 'Kenya', rating: 4.6 },
];

export function CompanyDashboard() {
  const [requests, setRequests] = useState<CreditRequest[]>([
    { id: 1, creditsNeeded: 5000, purpose: 'Manufacturing emissions offset', deadline: '2026-05-30', status: 'active' },
    { id: 2, creditsNeeded: 3200, purpose: 'Logistics carbon neutrality', deadline: '2026-06-15', status: 'pending' },
  ]);

  const [showNewRequest, setShowNewRequest] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trading'>('overview');
  const [scheduleMeetModal, setScheduleMeetModal] = useState<{ isOpen: boolean; ngoName: string }>({
    isOpen: false,
    ngoName: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActionClick = async (actionType: string, payload: any) => {
    try {
      await triggerAction(actionType, payload);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleNewRequestSubmit = async () => {
    setIsSubmitting(true);
    try {
      await triggerAction('submit_credit_request', { /* dummy payload */ });
      alert('Credit Request submitted successfully!');
      setShowNewRequest(false);
    } catch (err: any) {
      alert('Failed to submit request: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted/60 rounded-xl border border-border w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('trading')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'trading'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Trading
        </button>
      </div>

      {activeTab === 'trading' ? (
        <TradingDashboard />
      ) : (
        <>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Credits Needed', value: '8,200', icon: Target, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', sub: 'Across all requests' },
          { label: 'Active Requests', value: requests.length, icon: Building2, color: '#10b981', bg: 'rgba(16,185,129,0.1)', sub: 'Currently open' },
          { label: 'NGO Partners', value: '12', icon: MessageCircle, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', sub: 'Available to connect' },
        ].map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label}
            className="bg-card rounded-2xl border border-border shadow-sm hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            style={{ boxShadow: `0 0 0 1px ${color}20` }}
          >
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium">{label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: bg }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Request */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />
        <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Credit Requests</h3>
          <button
            onClick={() => setShowNewRequest(!showNewRequest)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>

        {showNewRequest && (
          <div className="mb-6 p-4 bg-accent/50 rounded-xl space-y-4">
            <div>
              <label className="block text-sm mb-2">Credits Needed</label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., 5000"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Purpose</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., Offset Q2 manufacturing emissions"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Deadline</label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button 
              onClick={handleNewRequestSubmit}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all hover:shadow-primary/50 disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Submit Request
            </button>
          </div>
        )}

        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="p-4 bg-accent/50 rounded-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h4>{request.purpose}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Credits: {request.creditsNeeded.toLocaleString()} • Deadline: {request.deadline}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  request.status === 'active' ? 'bg-primary/20 text-primary' :
                  request.status === 'fulfilled' ? 'bg-green-500/20 text-green-700' :
                  'bg-yellow-500/20 text-yellow-700'
                }`}>
                  {request.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Available NGOs */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="h-0.5 w-full bg-gradient-to-r from-violet-400 to-purple-500" />
        <div className="p-6">
        <h3 className="mb-1 text-base font-semibold">NGO Partners</h3>
        <p className="text-xs text-muted-foreground mb-4">Connect with verified conservation organisations</p>
        <div className="space-y-3">
          {mockNGOs.map((ngo) => (
            <div
              key={ngo.id}
              className="flex items-center justify-between p-4 bg-accent/50 rounded-xl hover:bg-accent transition-colors"
            >
              <div>
                <h4>{ngo.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {ngo.location} • Rating: {ngo.rating}/5
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4">
                  <p className="text-sm text-muted-foreground">Credits Available</p>
                  <p className="text-primary">{ngo.creditsAvailable.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => {
                    setScheduleMeetModal({ isOpen: true, ngoName: ngo.name });
                    handleActionClick('schedule_meet', { ngoId: ngo.id });
                  }}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all hover:shadow-md flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Meet
                </button>
                <button 
                  onClick={() => handleActionClick('chat', { ngoId: ngo.id })}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-all hover:shadow-md flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
        </>
      )}

      {/* Schedule Meet Modal */}
      <ScheduleMeetModal
        isOpen={scheduleMeetModal.isOpen}
        onClose={() => setScheduleMeetModal({ isOpen: false, ngoName: '' })}
        partnerName={scheduleMeetModal.ngoName}
        partnerType="ngo"
      />
    </div>
  );
}
