import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Globe,
  Clock,
  Wallet,
  Smartphone,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import heroImg from '@/assets/hero-banking.jpg';
import logoImg from '@/assets/logo.png';
import { useState } from 'react';

const features = [
  {
    icon: Wallet,
    title: 'Smart Accounts',
    desc: 'Open savings, current, or fixed deposit accounts in minutes with zero paperwork.',
    gradient: 'from-blue-500 to-cyan-500',
    delay: 'stagger-1',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Transfers',
    desc: 'Send money instantly to any account with real-time balance updates and notifications.',
    gradient: 'from-purple-500 to-pink-500',
    delay: 'stagger-2',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    desc: '256-bit SSL encryption, biometric authentication, and 24/7 fraud monitoring.',
    gradient: 'from-emerald-500 to-teal-500',
    delay: 'stagger-3',
  },
  {
    icon: Globe,
    title: 'Global Access',
    desc: 'Manage your finances from anywhere with our secure multi-platform banking suite.',
    gradient: 'from-orange-500 to-rose-500',
    delay: 'stagger-4',
  },
  {
    icon: Clock,
    title: 'Instant Statements',
    desc: 'Download e-statements, track transaction history, and export reports with one click.',
    gradient: 'from-indigo-500 to-blue-500',
    delay: 'stagger-5',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    desc: 'Full-featured mobile banking with fingerprint login, QR payments, and push alerts.',
    gradient: 'from-violet-500 to-fuchsia-500',
    delay: 'stagger-6',
  },
];

const stats = [
  { label: 'Active Users', value: '2.4M+', suffix: 'Happy customers' },
  { label: 'Daily Transfers', value: '₹840M', suffix: 'Processed daily' },
  { label: 'Uptime', value: '99.99%', suffix: 'Guaranteed reliability' },
  { label: 'Branch Network', value: '1,200+', suffix: 'Nationwide branches' },
];

export default function Index() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white overflow-x-hidden">
      {/* ── Navigation ──────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-[#0A1628]/80 backdrop-blur-xl border-b border-white/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/15 transition-all duration-300 overflow-hidden">
                <img src={logoImg} alt="NeoBank" className="w-6 h-6 lg:w-7 lg:h-7 object-contain" />
              </div>
              <div>
                <span className="font-heading font-bold text-lg lg:text-xl text-white tracking-tight">NeoBank</span>
                <p className="text-[9px] lg:text-[10px] text-blue-300/60 -mt-0.5 uppercase tracking-[0.2em] font-medium">Digital Banking</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
              <a href="#stats" className="text-sm text-white/60 hover:text-white transition-colors">About</a>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-lg shadow-blue-500/25 transition-all duration-300 flex items-center gap-1.5 group"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white/60 hover:text-white"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0A1628]/95 backdrop-blur-xl animate-slide-down">
            <div className="px-4 py-4 space-y-2">
              <a href="#features" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">Features</a>
              <a href="#stats" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">About</a>
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => { setMobileOpen(false); navigate('/login'); }}
                  className="w-full text-center text-sm font-medium text-white px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate('/register'); }}
                  className="w-full text-center text-sm font-semibold text-white px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628]/95 via-[#0A1628]/80 to-[#1E40AF]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent" />
        </div>

        {/* Animated Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-2s' }} />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 mb-6 animate-slide-up">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-xs font-medium text-white/70 tracking-wide">Trusted by 2.4M+ customers worldwide</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-7xl leading-[1.1] tracking-tight animate-slide-up stagger-1">
              Banking for the
              <br />
              <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Digital Era
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-white/50 max-w-xl leading-relaxed animate-slide-up stagger-2">
              Experience secure, intelligent banking that adapts to your life. 
              Manage accounts, transfer funds, and grow your wealth — all from one powerful platform.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 animate-slide-up stagger-3">
              <button
                onClick={() => navigate('/register')}
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-100 text-base"
              >
                <span>Open Free Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/15 text-white font-medium rounded-2xl border border-white/10 transition-all duration-300 text-base"
              >
                Sign In
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center gap-6 text-white/30 text-xs animate-fade-in stagger-4">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                <span>FDIC Insured</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                <span>PCI DSS Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-[10px] text-white/20 uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/30 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────────────── */}
      <section id="features" className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/3 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-xs font-medium text-blue-300">Everything you need</span>
            </div>
            <h2 className="font-heading font-bold text-3xl lg:text-5xl text-white leading-tight">
              Modern banking,{' '}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                simplified
              </span>
            </h2>
            <p className="mt-4 text-white/40 text-base lg:text-lg max-w-lg mx-auto">
              From smart accounts to real-time transfers, experience banking that works as hard as you do.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group relative p-6 lg:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all duration-500 animate-slide-up ${f.delay}`}
              >
                {/* Gradient Border on Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none`} />
                
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} p-2.5 mb-4 shadow-lg`}>
                  <f.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="font-heading font-bold text-lg text-white mb-2 group-hover:text-blue-200 transition-colors">
                  {f.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ────────────────────────────────────────── */}
      <section id="stats" className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`relative p-6 lg:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center animate-slide-up stagger-${i + 1} group hover:bg-white/[0.06] transition-all duration-300`}
              >
                <p className="font-heading font-bold text-3xl lg:text-4xl bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="mt-2 font-heading font-semibold text-sm text-white/70">
                  {stat.label}
                </p>
                <p className="mt-1 text-xs text-white/30">
                  {stat.suffix}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/8 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 lg:p-16 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-cyan-500/10 border border-blue-500/10 backdrop-blur-sm">
            <h2 className="font-heading font-bold text-3xl lg:text-5xl text-white leading-tight mb-4">
              Ready to experience{' '}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                modern banking
              </span>
              ?
            </h2>
            <p className="text-white/40 text-base lg:text-lg max-w-lg mx-auto mb-8">
              Join 2.4 million customers who trust NeoBank for their everyday banking needs. 
              Get started in under 2 minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-100 text-base"
              >
                Open Free Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/15 text-white font-medium rounded-2xl border border-white/10 transition-all duration-300 text-base"
              >
                Sign In
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative border-t border-white/5 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                  <img src={logoImg} alt="NeoBank" className="w-6 h-6 object-contain" />
                </div>
                <span className="font-heading font-bold text-lg text-white">NeoBank</span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed max-w-xs">
                Next-generation digital banking platform built for speed, security, and simplicity.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="font-heading font-semibold text-sm text-white mb-3">Platform</p>
              <div className="space-y-2.5">
                {['Features', 'Security', 'Pricing', 'API'].map((item) => (
                  <p key={item} className="text-sm text-white/30 hover:text-white/50 cursor-pointer transition-colors">{item}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-white mb-3">Company</p>
              <div className="space-y-2.5">
                {['About', 'Careers', 'Blog', 'Press'].map((item) => (
                  <p key={item} className="text-sm text-white/30 hover:text-white/50 cursor-pointer transition-colors">{item}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-white mb-3">Support</p>
              <div className="space-y-2.5">
                {['Help Center', 'Contact Us', 'Community', 'Status'].map((item) => (
                  <p key={item} className="text-sm text-white/30 hover:text-white/50 cursor-pointer transition-colors">{item}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} NeoBank. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-white/20">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Cookie Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
