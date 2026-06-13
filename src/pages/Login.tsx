import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@/lib/auth';
import { Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import heroImg from '@/assets/hero-banking.jpg';
import logoImg from '@/assets/logo.png';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success(`Welcome back, ${result.user?.name.split(' ')[0]}!`);
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Login failed.');
      }
    } catch (err) {
      toast.error('Network error. Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: string) => {
    const creds: Record<string, { email: string; password: string }> = {
      customer: { email: 'alice@neobank.com', password: 'password123' },
      teller:   { email: 'teller@neobank.com', password: 'teller123' },
      admin:    { email: 'admin@neobank.com', password: 'admin123' },
    };
    const c = creds[role];
    setEmail(c.email);
    setPassword(c.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Hero Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden">
        <img src={heroImg} alt="NeoBank" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628]/90 via-[#0A1628]/70 to-[#1E40AF]/60" />
        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <img src={logoImg} alt="NeoBank" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-heading font-bold text-xl text-white">NeoBank</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-heading font-bold text-white leading-tight mb-4">
              Banking for the<br />
              <span className="text-gradient bg-gradient-to-r from-blue-300 to-cyan-300 [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">Digital Era</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              Experience secure, fast, and reliable banking — manage accounts, transfer funds, and track every transaction in real time.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: 'Active Users', value: '2.4M+' },
                { label: 'Daily Transfers', value: '₹840M' },
                { label: 'Uptime', value: '99.99%' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/8 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-white font-heading font-bold text-xl">{stat.value}</p>
                  <p className="text-white/50 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>256-bit SSL encryption · FDIC insured · PCI DSS compliant</span>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <img src={logoImg} alt="NeoBank" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-heading font-bold text-xl">NeoBank</span>
          </div>

          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl text-foreground mb-1">Sign in to your account</h1>
            <p className="text-muted-foreground text-sm">Enter your credentials to access online banking.</p>
          </div>

          {/* Quick Login Helpers */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2">Demo Quick Login</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { role: 'customer', label: 'Customer', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                { role: 'teller', label: 'Teller', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                { role: 'admin', label: 'Admin', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
              ].map(({ role, label, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => quickLogin(role)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${color}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-blue-500/20 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
