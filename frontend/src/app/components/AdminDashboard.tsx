import { useState } from 'react';
import { Building2, Leaf, Eye, MapPin, Shield, Activity, BarChart3 } from 'lucide-react';
import { TradingDashboard } from './TradingDashboard';

interface Transaction {
  id: string;
  type: 'purchase' | 'verification' | 'transfer';
  from: string;
  to: string;
  credits: number;
  timestamp: string;
  blockHash: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'purchase',
    from: 'GreenTech Industries',
    to: 'Green Earth Foundation',
    credits: 5000,
    timestamp: '2026-04-23 14:30',
    blockHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57'
  },
  {
    id: '2',
    type: 'verification',
    from: 'TreePlant Initiative',
    to: 'Verified Pool',
    credits: 8500,
    timestamp: '2026-04-23 12:15',
    blockHash: '0x3a5d9b2e8c1f7a4d6e9c3b5a8f2e1d4c7b'
  },
  {
    id: '3',
    type: 'transfer',
    from: 'Forest Guardians',
    to: 'EcoLogistics Corp',
    credits: 3200,
    timestamp: '2026-04-23 10:45',
    blockHash: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a'
  },
];

export function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'blockchain' | 'verification' | 'trading'>('overview');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-card backdrop-blur-sm rounded-2xl p-2 border border-border shadow-sm inline-flex gap-2">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-6 py-2 rounded-xl transition-colors ${
            selectedTab === 'overview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab('blockchain')}
          className={`px-6 py-2 rounded-xl transition-colors ${
            selectedTab === 'blockchain'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Blockchain
        </button>
        <button
          onClick={() => setSelectedTab('verification')}
          className={`px-6 py-2 rounded-xl transition-colors ${
            selectedTab === 'verification'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Verification
        </button>
        <button
          onClick={() => setSelectedTab('trading')}
          className={`px-6 py-2 rounded-xl transition-colors ${
            selectedTab === 'trading'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Trading
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Companies</p>
              <h3 className="mt-1">48</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total NGOs</p>
              <h3 className="mt-1">32</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Credits</p>
              <h3 className="mt-1">284,500</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Verified Projects</p>
              <h3 className="mt-1">156</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Companies List */}
          <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="mb-4">Registered Companies</h3>
            <div className="space-y-3">
              {['GreenTech Industries', 'EcoLogistics Corp', 'SustainEnergy Ltd', 'CleanAir Solutions'].map((company, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4>{company}</h4>
                      <p className="text-sm text-muted-foreground">Active since 2025</p>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* NGOs List */}
          <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="mb-4">Registered NGOs</h3>
            <div className="space-y-3">
              {['Green Earth Foundation', 'TreePlant Initiative', 'Forest Guardians', 'Carbon Offset Alliance'].map((ngo, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4>{ngo}</h4>
                      <p className="text-sm text-muted-foreground">Verified Organization</p>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'blockchain' && (
        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <h3 className="mb-4">Blockchain Transactions</h3>
          <div className="space-y-3">
            {mockTransactions.map((tx) => (
              <div key={tx.id} className="p-4 bg-accent/50 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        tx.type === 'purchase' ? 'bg-blue-500/20 text-blue-700' :
                        tx.type === 'verification' ? 'bg-green-500/20 text-green-700' :
                        'bg-purple-500/20 text-purple-700'
                      }`}>
                        {tx.type}
                      </span>
                      <span className="text-sm text-muted-foreground">{tx.timestamp}</span>
                    </div>
                    <p className="text-sm">
                      <span className="text-foreground">{tx.from}</span>
                      <span className="text-muted-foreground"> → </span>
                      <span className="text-foreground">{tx.to}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary">{tx.credits.toLocaleString()} credits</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded-lg">
                  <Shield className="w-3 h-3" />
                  {tx.blockHash}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'verification' && (
        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <h3 className="mb-4">Satellite Verification Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-video bg-muted rounded-xl overflow-hidden relative group cursor-pointer">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-primary/40" />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-sm">Project Site {i}</p>
                  <p className="text-white/70 text-xs">Verified: Apr {i}, 2026</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'trading' && (
        <TradingDashboard />
      )}
    </div>
  );
}
