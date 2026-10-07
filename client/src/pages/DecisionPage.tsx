import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  Layers,
  Recycle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Coins,
  MapPin,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Device, Decision, Diagnostics, DualValuation, Match } from '../types';

export const DecisionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<Device | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [valuations, setValuations] = useState<DualValuation | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

      // Decision & Matches
      try {
        const decRes = await api.getDecision(deviceId);
        setDecision(decRes.decision);
        setMatches(decRes.matches || []);
      } catch (decErr) {
        // Evaluate if not already generated
        const evaluated = await api.evaluateDecision(deviceId);
        setDecision(evaluated.decision);
        setMatches(evaluated.matches || []);
      }

      // Diagnostics
      try {
        const diagRes = await api.getDiagnostics(deviceId);
        setDiagnostics(diagRes.diagnostics);
      } catch (e) {}

      // Valuations
      try {
        const valRes = await api.getValuation(deviceId);
        setValuations(valRes.valuation);
      } catch (e) {}

      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to load device decision.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white">Synthesizing Circular Decision...</h2>
        <p className="text-xs text-slate-400">
          Evaluating hardware condition score, repairability index, secondary market yields, and material extraction coefficients.
        </p>
      </div>
    );
  }

  if (error || !device || !decision) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Decision Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Unable to retrieve routing analysis for this device.'}</p>
        <button
          onClick={() => navigate('/scan')}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Scan Another Device
        </button>
      </div>
    );
  }

  const isResale = decision.recommended_route === 'RESALE';
  const isRepair = decision.recommended_route === 'REPAIR';
  const isRecycle = decision.recommended_route === 'RECYCLE';

  const routeColor = isResale
    ? 'emerald'
    : isRepair
    ? 'amber'
    : 'cyan';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Breadcrumb & Device Pill */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/device/${device.id}`} className="hover:text-emerald-400">{device.brand} {device.model}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-200 font-medium">Circular Routing Engine</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/device/${device.id}/diagnostics`}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Diagnostics ({diagnostics ? `${diagnostics.overall_score}/100` : 'View'})</span>
          </Link>
          <Link
            to={`/device/${device.id}/sanitize`}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-400 font-semibold flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Data Sanitization</span>
          </Link>
        </div>
      </div>

      {/* Prominent Recommendation Banner */}
      <div
        className={`rounded-3xl p-8 sm:p-10 border transition-all relative overflow-hidden ${
          isResale
            ? 'glass-panel-glow border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40'
            : isRepair
            ? 'glass-panel-amber border-amber-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40'
            : 'glass-panel-cyan border-cyan-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/80 border border-slate-700 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recommended Optimal Circular Route</span>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isResale
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                  : isRepair
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
              }`}>
                {isResale && <TrendingUp className="w-8 h-8" />}
                {isRepair && <Layers className="w-8 h-8" />}
                {isRecycle && <Recycle className="w-8 h-8" />}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  ROUTE: {decision.recommended_route}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {isResale && 'Direct Circular Resale — Maximizes Cash Value & Product Longevity'}
                  {isRepair && 'Authorized Refurbishment — Economical Repair Restores Value'}
                  {isRecycle && 'Certified Metallurgical Recycling — Zero-Landfill Precious Metal Extraction'}
                </p>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <p className="font-semibold text-slate-400 mb-1 text-xs uppercase tracking-wider">
                Why EcoCycle AI Recommends This:
              </p>
              {decision.explanation}
            </div>
          </div>

          {/* Quick Metrics Block */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 shrink-0 md:w-56">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Condition Score</span>
              <div className="text-2xl font-extrabold text-white">
                {decision.condition_score}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Repairability Index</span>
              <div className="text-2xl font-extrabold text-white">
                {decision.repairability_score}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Valuation Comparison Cards (Resale vs Scrap) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resale Market Valuation Card */}
        <div className={`glass-panel rounded-2xl p-6 border ${isResale ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Secondary Market Resale Yield
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-1 mb-4">
            <div className="text-3xl font-extrabold text-emerald-400">
              ₹{decision.resale_value.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">
              Estimated direct payout from verified refurbishers & trade-in partners.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Market Demand:</span>
              <span className="font-semibold text-white">{isResale ? 'High Tier' : 'Constrained'}</span>
            </div>
            {decision.repair_cost_estimate > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Est. Servicing Cost:</span>
                <span className="font-semibold text-amber-400">₹{decision.repair_cost_estimate.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">CO₂ Avoided:</span>
              <span className="font-semibold text-emerald-300">~55 - 180 kg CO₂</span>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <Link
              to={`/device/${device.id}/resale`}
              className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore Marketplace Offers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metallurgical Scrap Valuation Card */}
        <div className={`glass-panel rounded-2xl p-6 border ${isRecycle ? 'border-cyan-500/40 bg-cyan-950/10' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recoverable Scrap Material Value
            </span>
            <Recycle className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-1 mb-4">
            <div className="text-3xl font-extrabold text-cyan-400">
              ₹{decision.scrap_value.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">
              Intrinsic commodity value extracted through R2v3 hydrometallurgy.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Precious Metals:</span>
              <span className="font-semibold text-white">Gold (Au), Silver (Ag), Copper (Cu)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recovery Standard:</span>
              <span className="font-semibold text-white">R2v3 / e-Stewards</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Toxic Landfill Risk:</span>
              <span className="font-semibold text-teal-300">0% (Closed-Loop Smelting)</span>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <Link
              to={`/device/${device.id}/recycling`}
              className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>View Certified Recyclers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mandatory Data Sanitization Callout */}
      <div className="p-6 rounded-2xl glass-panel-glow border-emerald-500/30 bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Step Before Handover: Cryptographic Data Sanitization
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Before parting with your device, ensure all personal photos, credentials, and cryptographic keys are erased under NIST SP 800-88 guidelines.
            </p>
          </div>
        </div>

        <Link
          to={`/device/${device.id}/sanitize`}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <span>Start Sanitization Guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Verified Partner Matchmaker List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Top Matched Certified Partners</h3>
            <p className="text-xs text-slate-400">
              Ranked by category suitability, certification integrity, and proximity.
            </p>
          </div>
          <Link
            to="/partners"
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All Partners</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.slice(0, 4).map((m, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{m.partner?.name || 'Verified Circular Partner'}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{m.partner?.city || 'Bengaluru'}, {m.distance_km || 3.2} km away</span>
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {m.match_score}% Match
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">
                {m.partner?.description}
              </p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Cert: <span className="text-slate-200 font-medium">{m.partner?.certification_standard || 'ISO 14001'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => navigate(isResale ? `/device/${device.id}/resale` : `/device/${device.id}/recycling`)}
                  className="font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Select Partner</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
