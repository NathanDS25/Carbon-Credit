import { useState } from 'react';
import { Leaf, Building2, Shield, Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';

type UserRole = 'ngo' | 'company' | 'admin';

interface LoginPageProps {
  onLogin: (role: UserRole, email: string) => void;
}

const ROLES = [
  {
    id: 'ngo' as UserRole,
    label: 'NGO',
    subtitle: 'Land Owner / Conservation',
    icon: Leaf,
    description: 'Register land parcels, trigger satellite scans, and mint carbon credit tokens.',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    bgSelected: 'bg-emerald-500/10 border-emerald-500',
    iconColor: 'text-emerald-600',
    demoEmail: 'ngo@carbonchain.io',
  },
  {
    id: 'company' as UserRole,
    label: 'Company',
    subtitle: 'Carbon Credit Buyer',
    icon: Building2,
    description: 'Browse verified credits, purchase ERC-20 tokens, and offset your CO₂ footprint.',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    bgSelected: 'bg-blue-500/10 border-blue-500',
    iconColor: 'text-blue-600',
    demoEmail: 'company@carbonchain.io',
  },
  {
    id: 'admin' as UserRole,
    label: 'Admin',
    subtitle: 'Platform Regulator',
    icon: Shield,
    description: 'Verify users, approve land registrations, and oversee all blockchain transactions.',
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50 border-violet-200 hover:border-violet-400',
    bgSelected: 'bg-violet-500/10 border-violet-500',
    iconColor: 'text-violet-600',
    demoEmail: 'admin@carbonchain.io',
  },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeRole = ROLES.find((r) => r.id === selectedRole);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    // Auto-fill demo email
    const r = ROLES.find((x) => x.id === role);
    if (r) setEmail(r.demoEmail);
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return setError('Please select your role first.');
    if (!email || !password) return setError('Please enter your email and password.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    setError('');

    // Simulate auth delay (replace with real API call)
    await new Promise((res) => setTimeout(res, 1200));

    setLoading(false);
    onLogin(selectedRole, email);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #34d399, transparent)' }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">CarbonChain</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Blockchain-Verified<br />Carbon Credits
          </h2>
          <p className="text-emerald-200 text-base leading-relaxed">
            Satellite-verified carbon credits minted as ERC-20 tokens. A transparent marketplace connecting conservation NGOs with companies seeking to offset their emissions.
          </p>
        </div>

        {/* Workflow steps */}
        <div className="relative z-10 space-y-4">
          {[
            { num: '01', label: 'NGO registers land', sub: 'GPS coordinates + area submitted' },
            { num: '02', label: 'Satellite scan', sub: 'Sentinel Hub returns NDVI data' },
            { num: '03', label: 'Credits calculated', sub: 'NDVI diff → tons CO₂ → tokens' },
            { num: '04', label: 'Mint on blockchain', sub: 'ERC-20 tokens issued to NGO' },
            { num: '05', label: 'Company purchases', sub: 'ETH sent, tokens transferred' },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-emerald-300">{step.num}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{step.label}</p>
                <p className="text-emerald-300 text-xs">{step.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-emerald-400 text-xs">
          © 2025 CarbonChain Marketplace. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">CarbonChain</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to your dashboard</p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">Select your role</label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                      ${isSelected
                        ? `${role.bgSelected} shadow-sm`
                        : 'bg-card border-border hover:border-primary/40 hover:bg-accent/30'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                      ${isSelected ? `bg-gradient-to-br ${role.color}` : 'bg-muted'}
                    `}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : role.iconColor}`} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {role.label}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">{role.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Role description */}
            {activeRole && (
              <div className={`mt-3 p-3 rounded-lg border text-xs text-muted-foreground transition-all ${activeRole.bgLight}`}>
                {activeRole.description}
              </div>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@organization.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <span>⚠</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? '#6ee7b7'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(16,185,129,0.35)',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Demo accounts</p>
            <div className="space-y-1.5">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <r.icon className={`w-3.5 h-3.5 ${r.iconColor}`} />
                    <span className="font-medium">{r.label}:</span> {r.demoEmail}
                  </span>
                  <span className="text-muted-foreground/50 group-hover:text-primary text-xs">
                    password123
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
