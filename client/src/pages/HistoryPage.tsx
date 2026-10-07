import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  FileText,
  ShieldCheck,
  TrendingUp,
  Recycle,
  Layers,
  ChevronRight,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { Device } from '../types';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getDevices();
      setDevices(res.devices || []);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
    }
  };

  const filtered = devices.filter(d => {
    if (filter === 'ALL') return true;
    if (filter === 'RESALE') return d.decision?.recommended_route === 'RESALE';
    if (filter === 'REPAIR') return d.decision?.recommended_route === 'REPAIR';
    if (filter === 'RECYCLE') return d.decision?.recommended_route === 'RECYCLE';
    if (filter === 'SANITIZED') return d.sanitization?.status === 'CONFIRMED';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Audit & Activity Trail</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Device History & Registry</h1>
          <p className="text-xs text-slate-400">
            Track all previously assessed electronics, sanitization certificates, and circular dispositions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          {['ALL', 'RESALE', 'REPAIR', 'RECYCLE', 'SANITIZED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === f
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Device History List */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-2" />
          Loading activity records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 text-xs space-y-3">
          <p>No devices matching this filter.</p>
          <button
            onClick={() => navigate('/scan')}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Scan a Device
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((d) => {
            const route = d.decision?.recommended_route || 'RESALE';
            const isSanitized = d.sanitization?.status === 'CONFIRMED';
            return (
              <div
                key={d.id}
                className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                    <img
                      src={d.image_url || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=150'}
                      alt={d.model}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white text-base">{d.brand} {d.model}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {d.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        route === 'RESALE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : route === 'REPAIR'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {route}
                      </span>
                      {isSanitized && (
                        <span className="flex items-center gap-1 text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>NIST Certified</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400">
                      Assessed on {new Date(d.created_at).toLocaleDateString()} • Grade {d.condition} • Score: {d.diagnostics?.overall_score || 85}/100
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {isSanitized && (
                    <Link
                      to={`/certificates/${d.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-400 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Certificate</span>
                    </Link>
                  )}

                  <Link
                    to={`/device/${d.id}/decision`}
                    className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Routing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
