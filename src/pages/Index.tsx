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
  Quote,
  Star,
  Code2,
  Building2,
  Award,
  Zap,
  Infinity,
  PiggyBank,
  Send,
  Lock,
} from 'lucide-react';
import heroImg from '@/assets/hero-banking.jpg';
import logoImg from '@/assets/logo.png';
import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Data ─────────────────────────────────────────────────────── */

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
  {
    label: 'Active Users', value: '2.4M+', suffix: 'Happy customers',
    icon: Building2, color: 'from-blue-400 to-cyan-400',
    gradient: 'from-blue-500/20 to-cyan-500/10', progress: 96,
  },
  {
    label: 'Daily Transfers', value: '₹840M', suffix: 'Processed daily',
    icon: TrendingUp, color: 'from-violet-400 to-pink-400',
    gradient: 'from-violet-500/20 to-pink-500/10', progress: 88,
  },
  {
    label: 'Uptime', value: '99.99%', suffix: 'Guaranteed reliability',
    icon: Award, color: 'from-emerald-400 to-teal-400',
    gradient: 'from-emerald-500/20 to-teal-500/10', progress: 99,
  },
  {
    label: 'Branch Network', value: '1,200+', suffix: 'Nationwide branches',
    icon: Globe, color: 'from-orange-400 to-rose-400',
    gradient: 'from-orange-500/20 to-rose-500/10', progress: 78,
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Small Business Owner',
    avatar: 'PS',
    text: 'NeoBank transformed how I manage my business finances. Real-time transfers and instant statements save me hours every week.',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    role: 'Freelance Developer',
    avatar: 'RV',
    text: 'The mobile-first approach is incredible. I can manage everything from my phone — transfers, deposits, even KYC verification.',
    rating: 5,
  },
  {
    name: 'Ananya Patel',
    role: 'Enterprise Client',
    avatar: 'AP',
    text: 'Bank-grade security with consumer-friendly UX. Finally, a bank that understands both safety and convenience.',
    rating: 5,
  },
];

/* ── Particles Component ─────────────────────────────────────── */

function Particles({ count = 20 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 4,
    delay: `${Math.random() * 5}s`,
    duration: `${4 + Math.random() * 6}s`,
    dx: `${-30 + Math.random() * 60}px`,
    dy: `${-80 - Math.random() * 60}px`,
    opacity: 0.3 + Math.random() * 0.5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white animate-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
            '--dx': p.dx,
            '--dy': p.dy,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ── Counter Component ───────────────────────────────────────── */

function AnimatedCounter({ value, duration = 2000 }: { value: string; duration?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse value into: prefix (₹, $, etc.), number, suffix (M, K, +, %)
  const parsed = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  const prefix = parsed?.[1] ?? '';
  const numStr = parsed?.[2] ?? '';
  const suffix = parsed?.[3] ?? '';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !numStr) { return; }
    const target = parseFloat(numStr);
    const isDecimal = numStr.includes('.');
    const stepTime = Math.floor(duration / 60);
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayed(prefix + (isDecimal ? target.toFixed(2) : Math.round(target)) + suffix);
        clearInterval(timer);
      } else {
        setDisplayed(prefix + (isDecimal ? current.toFixed(2) : Math.round(current)) + suffix);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [visible, value, prefix, numStr, suffix, duration]);

  return (
    <span ref={ref} className={`inline-block ${visible ? 'animate-counter-pop' : ''}`}>
      {displayed || '0'}
      {!displayed && <span className="text-white/20">{value}</span>}
    </span>
  );
}

/* ── Scroll Reveal Hook ──────────────────────────────────────── */

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Carousel Data ────────────────────────────────────────── */

const carouselSlides = [
  {
    icon: Infinity,
    title: 'Digital Banking',
    subtitle: 'Bank anytime, anywhere',
    desc: 'Seamless online banking with real-time transactions, instant notifications, and 24/7 account access from any device.',
    gradient: 'from-blue-300 to-cyan-300',
    accent: 'bg-blue-500/20 border-blue-500/30',
    badge: 'Next-Gen Banking',
  },
  {
    icon: PiggyBank,
    title: 'Smart Savings',
    subtitle: 'Grow your wealth intelligently',
    desc: 'High-yield savings accounts, automated savings plans, and intelligent investment tools designed to maximize your returns.',
    gradient: 'from-emerald-300 to-teal-300',
    accent: 'bg-emerald-500/20 border-emerald-500/30',
    badge: 'Earn More',
  },
  {
    icon: Send,
    title: 'Global Transfers',
    subtitle: 'Send money worldwide instantly',
    desc: 'International transfers at real exchange rates with zero hidden fees. Send money to 150+ countries in under 60 seconds.',
    gradient: 'from-violet-300 to-pink-300',
    accent: 'bg-violet-500/20 border-violet-500/30',
    badge: 'Global Reach',
  },
  {
    icon: Lock,
    title: 'Secure Platform',
    subtitle: 'Enterprise-grade security',
    desc: 'Multi-layer encryption, biometric authentication, AI-powered fraud detection, and real-time monitoring keep your money safe 24/7.',
    gradient: 'from-orange-300 to-rose-300',
    accent: 'bg-orange-500/20 border-orange-500/30',
    badge: 'Always Protected',
  },
];

/* ── Hero Carousel Component ────────────────────────────────── */

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused]);

  const slide = carouselSlides[current];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Current slide — no box, full-screen responsive */}
      <div key={current} className="animate-fade-in-up">
        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${slide.accent} backdrop-blur-sm mb-5`}>
          <slide.icon className="w-3.5 h-3.5" style={{ color: slide.gradient.includes('blue') ? '#93c5fd' : slide.gradient.includes('emerald') ? '#6ee7b7' : slide.gradient.includes('violet') ? '#c4b5fd' : '#fdba74' }} />
          <span className="text-xs font-medium text-white/80">{slide.badge}</span>
        </div>

        {/* Title */}
        <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-7xl leading-[1.1] tracking-tight [text-shadow:_0_2px_40px_rgba(59,130,246,0.15)]">
          <span className={`bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent bg-[length:200%_auto] animate-text-shimmer`}>
            {slide.title}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-white/40 text-sm sm:text-base lg:text-lg font-medium tracking-wide">
          {slide.subtitle}
        </p>

        {/* Description */}
        <p className="mt-3 text-sm sm:text-base lg:text-lg text-white/50 max-w-xl leading-relaxed">
          {slide.desc}
        </p>
      </div>

      {/* Progress bars & dots */}
      <div className="mt-6 flex items-center gap-3">
        {carouselSlides.map((s, i) => (
          <button
            key={i}
            onClick={() => { goToSlide(i); setIsPaused(true); setTimeout(() => setIsPaused(false), 6000); }}
            className="group relative flex items-center gap-2"
          >
            {/* Progress bar */}
            <div className="w-12 sm:w-16 h-1 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className={`h-full rounded-full ${s.gradient} ${i === current ? 'animate-carousel-progress' : ''}`}
                style={{
                  animationPlayState: isPaused ? 'paused' : 'running',
                  animationDuration: '5s',
                }}
              />
            </div>
            {/* Dot */}
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i === current
                  ? 'bg-white/80 scale-125'
                  : 'bg-white/15 group-hover:bg-white/30'
              }`}
            />
            {/* Slide label on hover */}
            <span className={`absolute -bottom-5 left-0 text-[9px] uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              i === current ? 'text-white/40' : 'text-white/20'
            }`}>
              {s.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Star Rating ─────────────────────────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`}
        />
      ))}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */

export default function Index() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const featuresRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const testimonialsRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  /* ── Parallax scroll effect for nav ──────── */
  const handleScroll = useCallback(() => setScrolled(window.scrollY > 40), []);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white overflow-x-hidden">
      {/* ── Navigation ──────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'shadow-2xl shadow-blue-900/10' : ''}`}>
        <div className={`absolute inset-0 transition-all duration-500 ${scrolled ? 'bg-[#0A1628]/95 backdrop-blur-xl border-b border-white/10' : 'bg-[#0A1628]/60 backdrop-blur-sm border-b border-transparent'}`} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 overflow-hidden group-hover:shadow-lg group-hover:shadow-blue-500/20">
                <img src={logoImg} alt="NeoBank" className="w-6 h-6 lg:w-7 lg:h-7 object-contain transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div>
                <span className="font-heading font-bold text-lg lg:text-xl text-white tracking-tight [text-shadow:_0_0_20px_rgba(59,130,246,0.3)]">NeoBank</span>
                <p className="text-[9px] lg:text-[10px] text-blue-300/60 -mt-0.5 uppercase tracking-[0.2em] font-medium">Digital Banking</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-all duration-300 hover:tracking-wider">Features</a>
              <a href="#stats" className="text-sm text-white/60 hover:text-white transition-all duration-300 hover:tracking-wider">About</a>
              <a href="#testimonials" className="text-sm text-white/60 hover:text-white transition-all duration-300 hover:tracking-wider">Testimonials</a>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="group relative text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-lg shadow-blue-500/25 transition-all duration-300 flex items-center gap-1.5 overflow-hidden"
                >
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="relative z-10 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
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
              <a href="#testimonials" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">Testimonials</a>
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

      {/* ── Hero Section ────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover scale-105 animate-glow-pulse-soft" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628]/95 via-[#0A1628]/80 to-[#1E40AF]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent" />
        </div>

        {/* Animated Grid Lines */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '-1.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-purple-500/8 rounded-full blur-[80px] animate-glow-pulse" style={{ animationDelay: '-3s' }} />
        
        {/* Particles */}
        <Particles count={30} />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-3xl">
            {/* Carousel Banner */}
            <HeroCarousel />

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 animate-fade-in">
              <button
                onClick={() => navigate('/register')}
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-100 text-base overflow-hidden"
              >
                <span className="relative z-10">Open Free Account</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/15 text-white font-medium rounded-2xl border border-white/10 transition-all duration-300 text-base hover:border-white/20 active:scale-95"
              >
                Sign In
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center gap-6 text-white/30 text-xs animate-fade-in stagger-4">
              <div className="flex items-center gap-2 hover:text-white/50 transition-colors duration-300">
                <Shield className="w-3.5 h-3.5" />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2 hover:text-white/50 transition-colors duration-300">
                <Shield className="w-3.5 h-3.5" />
                <span>FDIC Insured</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2 hover:text-white/50 transition-colors duration-300">
                <Shield className="w-3.5 h-3.5" />
                <span>PCI DSS Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Credit — Watermark */}
        <div className="absolute bottom-6 right-6 lg:right-12 z-10 flex items-center gap-2 text-white/20 hover:text-white/40 transition-all duration-500 group cursor-default">
          <div className="w-6 h-px bg-white/20 group-hover:w-10 transition-all duration-500" />
          <Code2 className="w-3 h-3 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-[10px] tracking-[0.15em] uppercase font-medium whitespace-nowrap">
            Developed by <span className="text-white/30 group-hover:text-blue-300 transition-colors duration-300">Manish Kumar Samal</span>
          </span>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float md:flex">
          <span className="text-[9px] text-white/15 uppercase tracking-[0.25em]">Scroll</span>
          <div className="w-4 h-7 rounded-full border border-white/10 flex justify-center pt-1">
            <div className="w-1 h-1.5 bg-white/20 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Wave Divider ────────────────────── */}
      <div className="relative h-24 overflow-hidden -mt-12 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(59,130,246,0.03) 100%)',
        }} />
      </div>

      {/* ── Features Section ────────────────── */}
      <section id="features" className="relative py-16 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/3 via-cyan-500/2 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 hover:border-blue-400/30 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-xs font-medium text-blue-300">Everything you need</span>
            </div>
            <h2 className="font-heading font-bold text-3xl lg:text-5xl text-white leading-tight">
              Modern banking,{' '}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-text-shimmer">
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
                className={`group relative p-6 lg:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all duration-500 animate-slide-up ${f.delay} cursor-default overflow-hidden`}
              >
                {/* Shimmer overlay on hover */}
                <div className="absolute inset-0 pointer-events-none shimmer-overlay" />
                
                {/* Gradient Border glow on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.1] transition-opacity duration-500 pointer-events-none`} />
                <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.05] blur-sm transition-opacity duration-500 pointer-events-none`} />

                {/* Glow dot */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.06] blur-[30px] rounded-full transition-opacity duration-500 pointer-events-none`} />
                
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} p-2.5 mb-4 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}>
                  <f.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="font-heading font-bold text-lg text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">
                  {f.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ───────────────────── */}
      <section id="stats" className="relative py-16 lg:py-28 overflow-hidden">
        {/* Animated background gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '-1s' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px] animate-glow-pulse" style={{ animationDelay: '-3s' }} />
        
        {/* Animated grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={statsRef}>
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-xs font-medium text-blue-300">By the numbers</span>
            </div>
            <h2 className="font-heading font-bold text-3xl lg:text-5xl text-white leading-tight">
              Our{' '}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-text-shimmer">
                impact
              </span>{' '}
              in numbers
            </h2>
            <p className="mt-4 text-white/40 text-base lg:text-lg max-w-lg mx-auto">
              Metrics that reflect our commitment to excellence and customer trust.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`group relative p-6 lg:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center animate-fade-in-up hover:bg-white/[0.06] transition-all duration-700 cursor-default overflow-hidden`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Animated gradient border glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} style={{ margin: '-1px', zIndex: -1 }} />
                
                {/* Pulsing ring behind icon */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white/[0.02] animate-ring-pulse group-hover:opacity-0 transition-opacity duration-500" />

                {/* Animated ring decoration */}
                <div className="absolute -top-8 -right-8 w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" 
                      className="text-blue-300"
                      style={{ strokeDasharray: '4 4', animation: 'border-dash 20s linear infinite' }} />
                  </svg>
                </div>

                {/* Icon with float animation */}
                <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-2.5 mb-4 shadow-lg animate-icon-float transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}
                  style={{ animationDelay: `${i * 0.2}s` }}>
                  <stat.icon className="w-full h-full text-white drop-shadow-sm" />
                </div>

                {/* Value with dramatic reveal */}
                <p className={`font-heading font-bold text-3xl lg:text-4xl bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent animate-value-reveal`}
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                  <AnimatedCounter value={stat.value} duration={2200} />
                </p>

                {/* Label */}
                <p className="mt-2 font-heading font-semibold text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
                  {stat.label}
                </p>

                {/* Suffix with slide animation */}
                <p className={`mt-1 text-xs text-white/30 group-hover:text-white/50 transition-colors duration-300 animate-suffix-slide`}
                  style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                  {stat.suffix}
                </p>

                {/* Progress bar */}
                <div className="mt-4 h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${stat.color} animate-progress-fill`}
                    style={{
                      '--progress-target': `${stat.progress}%`,
                      width: `${stat.progress}%`,
                      animationDelay: `${0.4 + i * 0.15}s`,
                    } as React.CSSProperties}
                  />
                </div>

                {/* Hover shine effect */}
                <div className="absolute inset-0 pointer-events-none shimmer-overlay" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials Section ────────────── */}
      <section id="testimonials" className="relative py-16 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/2 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={testimonialsRef}>
          <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
              <Quote className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-xs font-medium text-blue-300">What our users say</span>
            </div>
            <h2 className="font-heading font-bold text-3xl lg:text-5xl text-white leading-tight">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                thousands
              </span>
            </h2>
            <p className="mt-4 text-white/40 text-base lg:text-lg max-w-lg mx-auto">
              Don&apos;t just take our word for it — hear from real users who power their finances with NeoBank.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="group relative p-6 lg:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all duration-500 animate-fade-in-up cursor-default overflow-hidden"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {/* Quote mark */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-white/[0.03] group-hover:text-blue-300/[0.06] transition-all duration-500" />

                {/* Stars */}
                <StarRating rating={t.rating} />

                {/* Text */}
                <p className="mt-4 text-sm text-white/50 leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────── */}
      <section className="relative py-16 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/8 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ctaRef}>
          <div className="relative p-8 lg:p-16 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-cyan-500/10 border border-blue-500/10 backdrop-blur-sm overflow-hidden animate-fade-in-up">
            {/* Decorative glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-glow-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '-2s' }} />

            <div className="relative z-10">
              <Zap className="w-8 h-8 mx-auto mb-4 text-blue-300/40" />
              <h2 className="font-heading font-bold text-3xl lg:text-5xl text-white leading-tight mb-4">
                Ready to experience{' '}
                <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-text-shimmer">
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
                  className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-100 text-base overflow-hidden"
                >
                  <span className="relative z-10">Open Free Account</span>
                  <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/15 text-white font-medium rounded-2xl border border-white/10 transition-all duration-300 text-base hover:border-white/20 active:scale-95"
                >
                  Sign In
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────── */}
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
              {/* Developer Credit in Footer */}
              <div className="mt-4 flex items-center gap-2 text-white/15 group cursor-default">
                <Code2 className="w-3 h-3 group-hover:text-blue-300 transition-colors" />
                <span className="text-[10px] tracking-wide">
                  Developed by{' '}
                  <span className="text-white/25 group-hover:text-blue-300 transition-colors">Manish Kumar Samal</span>
                </span>
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="font-heading font-semibold text-sm text-white mb-3">Platform</p>
              <div className="space-y-2.5">
                {['Features', 'Security', 'Pricing', 'API'].map((item) => (
                  <p key={item} className="text-sm text-white/30 hover:text-white/50 cursor-pointer transition-colors hover:translate-x-1 duration-300">{item}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-white mb-3">Company</p>
              <div className="space-y-2.5">
                {['About', 'Careers', 'Blog', 'Press'].map((item) => (
                  <p key={item} className="text-sm text-white/30 hover:text-white/50 cursor-pointer transition-colors hover:translate-x-1 duration-300">{item}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-white mb-3">Support</p>
              <div className="space-y-2.5">
                {['Help Center', 'Contact Us', 'Community', 'Status'].map((item) => (
                  <p key={item} className="text-sm text-white/30 hover:text-white/50 cursor-pointer transition-colors hover:translate-x-1 duration-300">{item}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} NeoBank. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-white/20">
              <span className="hover:text-white/40 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white/40 cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white/40 cursor-pointer transition-colors">Cookie Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
