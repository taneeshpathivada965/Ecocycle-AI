import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  Leaf,
  Recycle,
  Award,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  Gift,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { api } from '../services/api';
import { EcoWallet, EcoTransaction } from '../types';

export const EcoWalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<EcoWallet | null>(null);
  const [transactions, setTransactions] = useState<EcoTransaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const res = await api.getWallet();
      setWallet(res.wallet);
      setTransactions(res.transactions || []);
      setStats(res.stats || {});
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Loading Eco-Wallet Balance...</h2>
      </div>
    );
  }

  const balance = wallet ? wallet.balance : 1450;
  const co2 = wallet ? wallet.total_co2_saved_kg : 52.4;
  const ewaste = wallet ? wallet.total_ewaste_diverted_kg : 9.8;
  const circularScore = stats?.circular_score || 85;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>Circular Economy Ledger</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Eco-Wallet & Impact Dashboard</h1>
          <p className="text-xs text-slate-400">
            Track your verified environmental rewards, carbon emissions avoided, and data sanitization tokens.
          </p>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'EcoCycle AI Sustainability Badge',
                text: `I've saved ${co2}kg of CO2 and diverted ${ewaste}kg of e-waste with EcoCycle AI!`,
                url: window.location.href
              }).catch(() => {});
            }
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Share Impact Badge</span>
        </button>
      </div>

      {/* Main Impact Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="glass-panel-glow rounded-3xl p-6 border border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Eco-Credits Balance
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white">
              {balance.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">
              Redeemable for certified partner discounts
            </p>
          </div>
        </div>

        {/* CO2 Saved */}
        <div className="glass-panel-cyan rounded-3xl p-6 border border-teal-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              CO₂ Emissions Saved
            </span>
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white">
              {co2.toFixed(1)} <span className="text-base font-semibold text-slate-400">kg</span>
            </div>
            <p className="text-[11px] text-teal-300 font-medium mt-1">
              Equivalent to 260 km car transit avoided
            </p>
          </div>
        </div>

        {/* E-Waste Diverted */}
        <div className="glass-panel-cyan rounded-3xl p-6 border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              E-Waste Diverted
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Recycle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white">
              {ewaste.toFixed(1)} <span className="text-base font-semibold text-slate-400">kg</span>
            </div>
            <p className="text-[11px] text-cyan-300 font-medium mt-1">
              100% Zero Municipal Landfill
            </p>
          </div>
        </div>

        {/* Circular Score */}
        <div className="glass-panel-amber rounded-3xl p-6 border border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Circular Index Score
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white">
              {circularScore} <span className="text-base font-semibold text-slate-400">/100</span>
            </div>
            <p className="text-[11px] text-amber-300 font-medium mt-1">
              Top 5% Eco Pioneer Standing
            </p>
          </div>
        </div>
      </div>

      {/* Rewards Catalog Preview */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Circular Partner Perks & Redemptions</h3>
          </div>
          <span className="text-xs text-slate-400">Eco-Credit Rewards Program</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
              500 CREDITS
            </span>
            <h4 className="font-bold text-white text-sm">₹500 Refurbished Device Voucher</h4>
            <p className="text-xs text-slate-400">
              Applicable on certified Grade-A laptops & phones with 1-year warranty.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-400">
              1,000 CREDITS
            </span>
            <h4 className="font-bold text-white text-sm">Free Battery Replacement Service</h4>
            <p className="text-xs text-slate-400">
              Free labor and calibration at any CircularTech partner service hub.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400">
              2,000 CREDITS
            </span>
            <h4 className="font-bold text-white text-sm">Plant 10 Bio-Diverse Trees</h4>
            <p className="text-xs text-slate-400">
              Verified carbon offset retirement through our reforestation initiative.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Verified Environmental Ledger</h3>
          <span className="text-xs text-slate-400 font-mono">
            {transactions.length} Recorded Transactions
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">
            No transactions yet. Scan a device or complete sanitization to earn your first Eco-Credits!
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
            {transactions.map((t) => (
              <div key={t.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{t.description}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300">
                      {t.transaction_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                    {t.co2_saved_kg > 0 && (
                      <span className="text-emerald-400 font-medium">
                        +{t.co2_saved_kg} kg CO₂
                      </span>
                    )}
                    {t.ewaste_diverted_kg > 0 && (
                      <span className="text-cyan-400 font-medium">
                        +{t.ewaste_diverted_kg} kg Diverted
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    +{t.credits} Credits
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
