import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Recycle,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Truck,
  Building2,
  Clock,
  Sparkles,
  RefreshCw,
  Navigation,
  ExternalLink,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { Device, Match, DualValuation, Partner } from '../types';

export const RecyclingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<Device | null>(null);
  const [options, setOptions] = useState<Match[]>([]);
  const [valuation, setValuation] = useState<DualValuation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pickupScheduled, setPickupScheduled] = useState<boolean>(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (deviceId: string) => {
    setLoading(true);
    try {
      const devRes = await api.getDeviceById(deviceId);
      setDevice(devRes.device);

      const optRes = await api.getRecyclingOptions(deviceId);
      setOptions(optRes.options || []);

      const valRes = await api.getValuation(deviceId).catch(() => null);
      if (valRes?.valuation) setValuation(valRes.valuation);

      setLoading(false);
    } catch (err: any) {
      setLoading(false);
    }
  };

  const handleScheduleRecycling = (partner: Partner) => {
    setSelectedPartner(partner);
    setPickupScheduled(true);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Locating Certified R2v3 Recyclers...</h2>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white">Device Not Found</h2>
        <Link to="/dashboard" className="px-6 py-2 rounded-xl bg-slate-800 text-white text-xs inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const scrapAmount = valuation?.scrap_value?.amount || 650;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/device/${device.id}`} className="hover:text-emerald-400">{device.brand} {device.model}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-200 font-medium">Eco-Logistics Matchmaker</span>
        </div>

        <Link
          to={`/device/${device.id}/decision`}
          className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
        >
          <span>Routing Decision</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Hero Header */}
      <div className="glass-panel-cyan rounded-3xl p-6 sm:p-8 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
            <Recycle className="w-3.5 h-3.5" />
            <span>Certified R2v3 / e-Stewards Eco-Logistics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Responsible Recycling Matchmaker
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Non-working and end-of-life electronics are safely diverted from municipal landfills. Gold, silver, copper, and lithium are recovered via zero-emission hydrometallurgical extraction.
          </p>
        </div>

        {/* Commodity Scrap Yield */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-right shrink-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
            Material Commodity Yield
          </span>
          <div className="text-3xl font-black text-cyan-400">
            ₹{scrapAmount.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Zero Landfill Certificate</span>
        </div>
      </div>

      {/* Pickup Scheduled Notice */}
      {pickupScheduled && selectedPartner && (
        <div className="p-6 rounded-3xl glass-panel-glow border-emerald-500/40 bg-emerald-950/30 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Eco-Logistics Collection Booked with {selectedPartner.name}!
              </h3>
              <p className="text-xs text-emerald-300">
                Safe containment vehicle dispatched • Dispatch Reference: #REC-LOG-{Math.floor(10000 + Math.random() * 90000)}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Certified handlers will seal your device inside fireproof hazardous-lithium shipping sleeves and provide a physical transfer manifest upon arrival.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              to={`/device/${device.id}/sanitize`}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              Confirm Sanitization Protocol
            </Link>
            <button
              onClick={() => setPickupScheduled(false)}
              className="px-4 py-2.5 rounded-xl glass-panel text-slate-300 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Interactive Map Visual Mock Header */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Interactive Radius: Bengaluru Metropolitan Region
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            3 Facilities Active within 15 km
          </span>
        </div>

        {/* Visual Map Canvas Graphic */}
        <div className="h-44 w-full rounded-xl bg-slate-950 border border-slate-800/80 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Simulated Hub Markers */}
          <div className="absolute top-1/4 left-1/3 flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] shadow-lg animate-pulse">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>GreenTech R2v3 Facility</span>
          </div>

          <div className="absolute bottom-1/3 right-1/4 flex items-center gap-1.5 p-1.5 rounded-lg bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-[10px] shadow-lg">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Community Drop-Off Bin</span>
          </div>

          <div className="absolute center flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-emerald-500/30 animate-ping" />
            <span className="text-[10px] font-bold text-white mt-1 bg-slate-900/80 px-2 py-0.5 rounded">
              Your Location
            </span>
          </div>

          <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded">
            Demo Map Telemetry • Coordinates: 12.9716° N, 77.5946° E
          </div>
        </div>
      </div>

      {/* Recycler Matches List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Certified Metallurgical Recovery Partners</h3>
        <div className="grid grid-cols-1 gap-4">
          {options.map((opt, idx) => {
            const partner = opt.partner;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-white">{partner?.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {partner?.partner_type}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-teal-400 font-semibold">
                      <Award className="w-3.5 h-3.5" />
                      <span>{partner?.certification_standard || 'R2v3 Certified'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {partner?.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {partner?.address}, {partner?.city} ({opt.distance_km || 3.8} km)
                    </span>
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Open Mon - Sat 9:00 - 18:00
                    </span>
                  </div>
                </div>

                {/* Logistics Button */}
                <div className="text-left md:text-right space-y-2 shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    Zero Toxic Landfill Disposal
                  </span>
                  <button
                    onClick={() => partner && handleScheduleRecycling(partner)}
                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all"
                  >
                    Schedule Collection / Drop-off
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
