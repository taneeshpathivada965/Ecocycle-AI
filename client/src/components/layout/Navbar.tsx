import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Recycle,
  Scan,
  Coins,
  ShieldCheck,
  Building2,
  History,
  Sparkles,
  Menu,
  X,
  User,
  Zap,
  Globe2
} from 'lucide-react';
import { api } from '../../services/api';
import { EcoWallet } from '../../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wallet, setWallet] = useState<EcoWallet | null>(null);

  useEffect(() => {
    loadWallet();
    const interval = setInterval(loadWallet, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const loadWallet = async () => {
    try {
      const res = await api.getWallet();
      if (res.wallet) {
        setWallet(res.wallet);
      }
    } catch (e) {
      // Fallback
    }
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Globe2 },
    { path: '/scan', label: 'AI Scanner', icon: Scan, highlight: true },
    { path: '/history', label: 'My Devices', icon: History },
    { path: '/eco-wallet', label: 'Eco-Wallet', icon: Coins },
    { path: '/partners', label: 'Partners', icon: Building2 },
    { path: '/demo', label: 'Demo Suite', icon: Sparkles, badge: 'Judge Mode' }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Recycle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">EcoCycle</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-medium">CIRCULAR LOGISTICS</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : link.highlight
                      ? 'text-emerald-300 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right controls: Eco-Wallet Pill & User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live Eco-Wallet Pill */}
            <Link
              to="/eco-wallet"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 transition-colors shadow-inner"
              title="Click to view your Eco-Credits and environmental impact"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                {wallet ? wallet.balance.toLocaleString() : '1,450'}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Credits</span>
            </Link>

            {/* Quick Scan CTA */}
            <button
              onClick={() => navigate('/scan')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold text-xs hover:opacity-95 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Scan Device</span>
            </button>

            {/* Profile */}
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-emerald-500/60 transition-colors"
              title="User Profile & Settings"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/eco-wallet"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>{wallet ? wallet.balance : '1,450'}</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 bg-slate-950/95 backdrop-blur-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-emerald-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/scan');
              }}
              className="w-full py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              Scan My Device
            </button>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 rounded-lg text-center text-slate-300 text-xs hover:bg-slate-800"
            >
              Profile & Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
