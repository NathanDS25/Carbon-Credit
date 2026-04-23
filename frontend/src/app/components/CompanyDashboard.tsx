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
      <div className="bg-card backdrop-blur-sm rounded-2xl p-2 border border-border shadow-sm inline-flex gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('trading')}
          className={`px-6 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'trading'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Trading
        </button>
      </div>

      {activeTab === 'trading' ? (
        <TradingDashboard />
      ) : (
        <>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Credits Needed</p>
              <h3 className="mt-1">8,200</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl">
              <Target className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Requests</p>
              <h3 className="mt-1">{requests.length}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">NGO Partners</p>
              <h3 className="mt-1">12</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Create New Request */}
      <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
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

      {/* Available NGOs */}
      <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
        <h3 className="mb-4">NGO Partners</h3>
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
