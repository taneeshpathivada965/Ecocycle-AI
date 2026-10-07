import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Cpu,
  TrendingUp,
  ShieldCheck,
  Recycle,
  ChevronRight,
  ArrowRight,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { Device } from '../types';

export const DeviceOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDevice(id);
    }
  }, [id]);

  const loadDevice = async (deviceId: string) => {
    setLoading(true);
    try {
      const res = await api.getDeviceById(deviceId);
      setDevice(res.device);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Device not found.');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!device) return;
    if (confirm(`Remove ${device.brand} ${device.model} from your records?`)) {
      await api.deleteDevice(device.id);
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Loading Device Overview...</h2>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Device Not Found</h2>
        <Link to="/dashboard" className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const route = device.decision?.recommended_route || 'RESALE';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-200 font-medium">{device.brand} {device.model}</span>
        </div>

        <button
          onClick={handleDelete}
          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Record</span>
        </button>
      </div>

      {/* Main Spec Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
            <img
              src={device.image_url || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300'}
              alt={device.model}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {device.category}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                Grade {device.condition}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                {device.working_status.replace(/_/g, ' ')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {device.brand} {device.model}
            </h1>

            <p className="text-xs text-slate-400">
              {device.storage_capacity && `${device.storage_capacity} • `}
              {device.ram_capacity && `${device.ram_capacity} RAM • `}
              Release: {device.generation || 'N/A'} • Est. Age: ~{device.estimated_age_years} yrs
            </p>
          </div>
        </div>

        {/* Route CTA */}
        <div className="shrink-0">
          <Link
            to={`/device/${device.id}/decision`}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95"
          >
            <span>Decision Route ({route})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Diagnostics Module */}
        <Link
          to={`/device/${device.id}/diagnostics`}
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-semibold group-hover:text-emerald-400 flex items-center gap-1">
              <span>Run Tests</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Hardware Diagnostics</h3>
            <p className="text-xs text-slate-400 mt-1">
              Battery cycles, touch digitizer matrix, camera sensors, and storage SMART health wear level.
            </p>
          </div>
        </Link>

        {/* Routing Decision Module */}
        <Link
          to={`/device/${device.id}/decision`}
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-semibold group-hover:text-emerald-400 flex items-center gap-1">
              <span>View Route</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Intelligent Routing & Values</h3>
            <p className="text-xs text-slate-400 mt-1">
              Dual-pricing comparison: Resale Market Payout vs Intrinsic Precious Metal Scrap Extraction.
            </p>
          </div>
        </Link>

        {/* Data Sanitization Module */}
        <Link
          to={`/device/${device.id}/sanitize`}
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-semibold group-hover:text-emerald-400 flex items-center gap-1">
              <span>Start Wipe</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">NIST SP 800-88 Data Sanitization</h3>
            <p className="text-xs text-slate-400 mt-1">
              Step-by-step cryptographic erasure to efface personal credentials and generate an immutable certificate.
            </p>
          </div>
        </Link>

        {/* Resale or Recycling Direct Logistics */}
        <Link
          to={route === 'RECYCLE' ? `/device/${device.id}/recycling` : `/device/${device.id}/resale`}
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
              <Recycle className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-semibold group-hover:text-emerald-400 flex items-center gap-1">
              <span>Connect Hubs</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              {route === 'RECYCLE' ? 'Recycler Logistics Matchmaker' : 'Marketplace Payout Offers'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Doorstep courier pickup, certified drop-off stations, and verified trade-in partner network.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};
