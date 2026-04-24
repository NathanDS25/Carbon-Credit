import { useState } from 'react';
import { Building2, Leaf, Shield, LogOut, ChevronDown } from 'lucide-react';
import { NGODashboard } from './components/NGODashboard';
import { CompanyDashboard } from './components/CompanyDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { WalletProvider } from './components/WalletProvider';
import { ConnectWallet } from './components/ConnectWallet';

type UserRole = 'ngo' | 'company' | 'admin';

const ROLE_META = {
  ngo: {
    label: 'NGO Dashboard',
    icon: Leaf,
    gradient: 'from-emerald-600 to-teal-700',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-600',
    accent: '#10b981',
    tag: 'Land Owner & Conservation',
  },
  company: {
    label: 'Company Dashboard',
    icon: Building2,
    gradient: 'from-blue-600 to-indigo-700',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-600',
    accent: '#3b82f6',
    tag: 'Carbon Credit Buyer',
  },
  admin: {
    label: 'Admin Dashboard',
    icon: Shield,
    gradient: 'from-violet-600 to-purple-700',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-600',
    accent: '#8b5cf6',
    tag: 'Platform Regulator',
  },
};

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  const handleLogin = (role: UserRole, email: string) => {
    setCurrentRole(role);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setUserEmail('');
  };

  if (!currentRole) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const meta = ROLE_META[currentRole];
  const Icon = meta.icon;

  return (
    <WalletProvider>
      <div className="min-h-screen bg-background">

        {/* ── Top accent bar ────────────────────────── */}
        <div className={`h-1 w-full bg-gradient-to-r ${meta.gradient}`} />

        {/* ── Header ───────────────────────────────── */}
        <header className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

            {/* Left — Logo + breadcrumb */}
            <div className="flex items-center gap-4">
              {/* Platform logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground hidden sm:block">CarbonChain</span>
              </div>

              <span className="text-border hidden sm:block">|</span>

              {/* Role badge */}
              <div className="flex items-center gap-2.5">
                <div className={`${meta.iconBg} p-1.5 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">{meta.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{meta.tag}</p>
                </div>
              </div>
            </div>

            {/* Right — user info + signout */}
            <div className="flex items-center gap-4">
              <ConnectWallet />
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}99)` }}
                >
                  {userEmail[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-muted-foreground max-w-[160px] truncate">{userEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Hero strip ───────────────────────────── */}
        <div
          className="border-b border-border"
          style={{
            background: `linear-gradient(135deg, ${meta.accent}0d 0%, transparent 60%)`,
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{meta.label}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Welcome back, <span className="font-medium text-foreground">{userEmail}</span>
              </p>
            </div>
            <div
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium"
              style={{
                borderColor: `${meta.accent}40`,
                background: `${meta.accent}10`,
                color: meta.accent,
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: meta.accent }} />
              {currentRole === 'ngo' ? 'Satellite Sync Active' : currentRole === 'company' ? 'Marketplace Live' : 'Platform Monitoring'}
            </div>
          </div>
        </div>

        {/* ── Main Content ──────────────────────────── */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {currentRole === 'ngo' && <NGODashboard />}
          {currentRole === 'company' && <CompanyDashboard />}
          {currentRole === 'admin' && <AdminDashboard />}
        </main>
      </div>
    </WalletProvider>
  );
}