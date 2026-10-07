import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scan,
  TrendingUp,
  Layers,
  Recycle,
  Coins,
  ShieldCheck,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  Cpu,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { Device, EcoWallet } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [wallet, setWallet] = useState<EcoWallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const devRes = await api.getDevices();
      setDevices(devRes.devices || []);

      const walRes = await api.getWallet().catch(() => null);
      if (walRes?.wallet) setWallet(walRes.wallet);

      setLoading(false);
    } catch (err: any) {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to remove this device assessment?')) {
      await api.deleteDevice(deviceId);
      setDevices(prev => prev.filter(d => d.id !== deviceId));
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-emerald-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Circular Logistics Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome to EcoCycle AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Diagnose old electronics, unlock secondary market liquidity, verify cryptographic data erasure, and ensure zero-landfill e-waste processing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/scan')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:opacity-95"
          >
            <Scan className="w-4 h-4" />
            <span>Scan New Device</span>
          </button>

          <Link
            to="/demo"
            className="w-full sm:w-auto px-5 py-3 rounded-xl glass-panel border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-500/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Mode</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Devices Assessed
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {devices.length}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Eco-Credits Balance
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {wallet ? wallet.balance.toLocaleString() : '1,450'}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            CO₂ Saved
          </span>
          <div className="text-2xl sm:text-3xl font-black text-teal-400">
            {wallet ? wallet.total_co2_saved_kg.toFixed(1) : '52.4'} kg
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            E-Waste Diverted
          </span>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400">
            {wallet ? wallet.total_ewaste_diverted_kg.toFixed(1) : '9.8'} kg
          </div>
        </div>
      </div>

      {/* Registered Devices List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your Assessed Devices</h2>
          <button
            onClick={loadDashboard}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
            Loading devices...
          </div>
        ) : devices.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <Scan className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Devices Assessed Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Scan your first smartphone, laptop, or legacy electronics to see its condition score, resale value, and recommended route.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/scan')}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Scan A Device
              </button>
              <button
                onClick={() => navigate('/demo')}
                className="px-5 py-2.5 rounded-xl glass-panel text-amber-300 text-xs font-semibold"
              >
                Load Hackathon Demo Device
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {devices.map((device) => {
              const route = device.decision?.recommended_route || 'RESALE';
              const isResale = route === 'RESALE';
              const isRepair = route === 'REPAIR';
              const isRecycle = route === 'RECYCLE';

              return (
                <div
                  key={device.id}
                  onClick={() => navigate(`/device/${device.id}/decision`)}
                  className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    {/* Device Thumbnail & Route Badge */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                        <img
                          src={device.image_url || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=150'}
                          alt={device.model}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isResale
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isRepair
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {route}
                        </span>

                        <button
                          onClick={(e) => handleDeleteDevice(device.id, e)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Device"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">
                        {device.brand} {device.model}
                      </h3>
                      <p className="text-xs text-slate-400 capitalize">
                        {device.category} • Grade {device.condition} • {device.storage_capacity || 'Standard'}
                      </p>
                    </div>

                    {/* Condition & Values Pill */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex justify-between items-center">
                      <span className="text-slate-400">
                        Diagnostic: <span className="text-white font-semibold">{device.diagnostics ? `${device.diagnostics.overall_score}/100` : 'Assessed'}</span>
                      </span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {device.decision ? `₹${device.decision.resale_value.toLocaleString()}` : 'Valued'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      {new Date(device.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>View Route Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
