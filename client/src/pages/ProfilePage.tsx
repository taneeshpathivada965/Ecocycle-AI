import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Coins,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { UserProfile, EcoWallet } from '../types';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<EcoWallet | null>(null);
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getMe();
      if (res.user?.profile) {
        setProfile(res.user.profile);
        setFullName(res.user.profile.full_name);
        setCurrency(res.user.profile.preferred_currency);
      }
      if (res.user?.wallet) {
        setWallet(res.user.wallet);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfile({
        full_name: fullName,
        preferred_currency: currency
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {}
  };

  const handleLogout = () => {
    api.setToken(null);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-2" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">User Profile & Circular Credentials</h1>
        <p className="text-xs text-slate-400">
          Manage your account profile, preferred valuation currency, and linked impact wallet.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-xl">
            {fullName ? fullName.charAt(0) : 'E'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{fullName || 'Eco Pioneer'}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
              Verified Circular Participant
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Valuation Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD')}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="INR">INR (₹ - Indian Rupee)</option>
              <option value="USD">USD ($ - US Dollar)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
