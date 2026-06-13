import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '@/lib/auth';
import type { User } from '@/types';
import logoImg from '@/assets/logo.png';
import {
  LayoutDashboard,
  ArrowLeftRight,
  History,
  Users2,
  Shield,
  UserCircle,
  LogOut,
  ChevronRight,
  Banknote,
  PieChart,
  Server,
  Wallet,
  Landmark,
  FileText,
  Fingerprint,
} from 'lucide-react';

interface SidebarProps {
  user: User;
  onClose?: () => void;
}

const customerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transfer', icon: ArrowLeftRight, label: 'Transfer Funds' },
  { to: '/deposit', icon: Banknote, label: 'Deposit' },
  { to: '/withdraw', icon: Wallet, label: 'Withdraw' },
  { to: '/transactions', icon: History, label: 'Transactions' },
  { to: '/beneficiaries', icon: Users2, label: 'Beneficiaries' },
  { to: '/accounts', icon: Landmark, label: 'My Accounts' },
  { to: '/statements', icon: FileText, label: 'E-Statements' },
  { to: '/kyc', icon: Fingerprint, label: 'KYC Verification' },
  { to: '/loans', icon: Landmark, label: 'Loans' },
  { to: '/analytics', icon: PieChart, label: 'Analytics' },
  { to: '/services', icon: Shield, label: 'Services Demo' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

const tellerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teller', icon: Banknote, label: 'Account Center' },
  { to: '/transactions', icon: History, label: 'Transactions' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

const adminNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin', icon: Shield, label: 'Admin Console' },
  { to: '/transactions', icon: History, label: 'All Transactions' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function Sidebar({ user, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const navItems =
    user.role === 'admin' ? adminNav :
    user.role === 'teller' ? tellerNav :
    customerNav;

  const roleBadgeColor =
    user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
    user.role === 'teller' ? 'bg-yellow-500/20 text-yellow-300' :
    'bg-green-500/20 text-green-300';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-full flex flex-col gradient-navy text-white w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
          <img src={logoImg} alt="NeoBank" className="w-7 h-7 object-contain" />
        </div>
        <div>
          <span className="font-heading font-bold text-lg text-white tracking-tight">NeoBank</span>
          <p className="text-[10px] text-white/40 -mt-0.5 uppercase tracking-widest">Digital Banking</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-white/40 hover:text-white lg:hidden">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Badge */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/8 glass-dark">
          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user.avatarInitials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${roleBadgeColor}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="text-[10px] uppercase tracking-widest text-white/30 px-3 mb-2">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-white/15 text-white shadow-lg shadow-blue-900/20'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-red-500/15 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
