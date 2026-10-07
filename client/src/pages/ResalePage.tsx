import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  Building2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Coins,
  RefreshCw,
  Clock,
  Sparkles,
  Truck
} from 'lucide-react';
import { api } from '../services/api';
import { Device, Match, DualValuation, Decision } from '../types';

export const ResalePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<Device | null>(null);
  const [options, setOptions] = useState<Match[]>([]);
  const [valuation, setValuation] = useState<DualValuation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOffer, setSelectedOffer] = useState<Match | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);

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

      const optRes = await api.getResaleOptions(deviceId);
      setOptions(optRes.options || []);

      const valRes = await api.getValuation(deviceId).catch(() => null);
      if (valRes?.valuation) setValuation(valRes.valuation);

      setLoading(false);
    } catch (err: any) {
      setLoading(false);
    }
  };

  const handleAcceptOffer = (match: Match) => {
    setSelectedOffer(match);
    setOrderConfirmed(true);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Aggregating Secondary Market Bids...</h2>
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

  const resaleAmount = valuation?.resale_value?.amount || 32000;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/device/${device.id}`} className="hover:text-emerald-400">{device.brand} {device.model}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-200 font-medium">Resale & Trade-In</span>
        </div>

        <Link
          to={`/device/${device.id}/decision`}
          className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>Routing Decision</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Hero Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Circular Market Liquidity Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Resell & Trade-In Offers: {device.brand} {device.model}
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Directly connect with certified refurbishers and instant trade-in liquidity providers. Guaranteed payouts, free doorstep inspection, and automated escrow.
          </p>
        </div>

        {/* Valuation Box */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-right shrink-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
            Target Market Payout
          </span>
          <div className="text-3xl font-black text-emerald-400">
            ₹{resaleAmount.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Instant Escrow Guarantee</span>
        </div>
      </div>

      {/* Offer Confirmed Modal Alert */}
      {orderConfirmed && selectedOffer && (
        <div className="p-6 rounded-3xl glass-panel-glow border-emerald-500/40 bg-emerald-950/30 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Trade-In Pickup Scheduled with {selectedOffer.partner?.name}!
              </h3>
              <p className="text-xs text-emerald-300">
                Doorstep verification technician dispatched • Order Reference: #ORD-ECO-{Math.floor(10000 + Math.random() * 90000)}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Before the agent arrives tomorrow between 10:00 AM - 1:00 PM, please make sure you have executed the NIST SP 800-88 Data Sanitization and have your certificate ready.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              to={`/device/${device.id}/sanitize`}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              Verify Sanitization Certificate
            </Link>
            <button
              onClick={() => setOrderConfirmed(false)}
              className="px-4 py-2.5 rounded-xl glass-panel text-slate-300 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Available Partner Marketplace Offers */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Live Verified Partner Quotes</h3>
        <div className="grid grid-cols-1 gap-4">
          {options.map((opt, idx) => {
            const partner = opt.partner;
            const payout = Math.round(resaleAmount * (0.92 + (idx === 0 ? 0.08 : -idx * 0.04)));
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-white">{partner?.name || 'Verified Circular Partner'}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {partner?.partner_type}
                    </span>
                    {partner?.certified && (
                      <span className="flex items-center gap-1 text-[10px] text-teal-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Certified</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {partner?.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {partner?.city || 'Bengaluru'} ({opt.distance_km || 2.4} km away)
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-cyan-400" />
                      Free Doorstep Pickup
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Instant UPI / Bank Transfer
                    </span>
                  </div>
                </div>

                {/* Offer amount & action */}
                <div className="text-left md:text-right space-y-2 shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Payout</span>
                    <div className="text-2xl font-black text-emerald-400">
                      ₹{payout.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptOffer(opt)}
                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    Lock-In Payout & Book Pickup
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
