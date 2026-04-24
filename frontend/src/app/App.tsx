import { useState } from 'react';
import { Building2, Leaf, Shield, LogOut } from 'lucide-react';
import { NGODashboard } from './components/NGODashboard';
import { CompanyDashboard } from './components/CompanyDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { WalletConnect } from './components/WalletConnect';

type UserRole = 'ngo' | 'company' | 'admin';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
  };

  const handleLogout = () => {
    setCurrentRole(null);
  };

  if (!currentRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="mb-3 bg-gradient-to-r from-primary to-[#52b788] bg-clip-text text-transparent">
              Carbon Credit Marketplace
            </h1>
            <p className="text-muted-foreground">
              Select your dashboard to continue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => handleRoleSelect('ngo')}
              className="group bg-card backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-2">NGO Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Manage plantations, upload images, and connect with companies
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect('company')}
              className="group bg-card backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-2">Company Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Request carbon credits and partner with NGOs
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect('admin')}
              className="group bg-card backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-2">Admin Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Monitor blockchain, verify projects, and oversee platform
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              {currentRole === 'ngo' && <Leaf className="w-6 h-6 text-primary" />}
              {currentRole === 'company' && <Building2 className="w-6 h-6 text-primary" />}
              {currentRole === 'admin' && <Shield className="w-6 h-6 text-primary" />}
            </div>
            <div>
              <h2>
                {currentRole === 'ngo' && 'NGO Dashboard'}
                {currentRole === 'company' && 'Company Dashboard'}
                {currentRole === 'admin' && 'Admin Dashboard'}
              </h2>
              <p className="text-xs text-muted-foreground">Carbon Credit Marketplace</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <WalletConnect />
            <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Switch Dashboard
          </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentRole === 'ngo' && <NGODashboard />}
        {currentRole === 'company' && <CompanyDashboard />}
        {currentRole === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}