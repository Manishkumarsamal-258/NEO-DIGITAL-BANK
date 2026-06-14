import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { requireAuth } from '@/lib/auth';
import type { User } from '@/types';
import { Menu, Bell, Search, Sparkles } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const u = requireAuth();
    if (!u) { navigate('/login'); return; }
    setUser(u);
  }, [navigate]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10" onClick={e => e.stopPropagation()}>
            <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="shrink-0 bg-white border-b border-border px-4 lg:px-6 py-3.5 flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            {title && <h1 className="font-heading font-bold text-lg text-foreground truncate">{title}</h1>}
            {subtitle && (
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              </div>
            )}
            <p className="text-[10px] text-blue-500/70 font-medium tracking-wide mt-0.5">
              NeoBank Digital Banking · Developed by Manish Kumar Samal
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-48">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                placeholder="Search..."
                className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-all">
              {user.avatarInitials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
