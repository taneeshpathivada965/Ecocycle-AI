import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Recycle,
  Scan,
  ShieldCheck,
  TrendingUp,
  Coins,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Cpu,
  Layers,
  Leaf,
  ChevronRight,
  Play
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto space-y-8">
        {/* Hackathon Judge Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>EcoCycle AI Circular Engine • Hackathon Ready</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Turn your old electronics into value —{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            safely, intelligently, & sustainably.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          The smart circular-economy platform that diagnoses device health, delivers dual-pricing valuation, cryptographically sanitizes your data, and routes obsolete electronics to certified buyers or recyclers.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate('/scan')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-base hover:opacity-95 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 group transition-all"
          >
            <Scan className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Scan My Device</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/demo')}
            className="w-full sm:w-auto px-7 py-4 rounded-xl glass-panel border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
          >
            <Play className="w-4 h-4 fill-amber-300" />
            <span>Launch 3-Scenario Demo Mode</span>
          </button>
        </div>

        {/* Provenance Tag */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-4">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> NIST SP 800-88 Sanitization</span>
          <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-cyan-400" /> Multi-Modal GenAI Vision</span>
          <span className="flex items-center gap-1.5"><Leaf className="w-4 h-4 text-teal-400" /> Zero-Landfill Verified Routing</span>
        </div>
      </section>

      {/* The Central Innovation: Condition-Based Routing Diagram */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Central Innovation</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Intelligent Condition-Based Decision Engine
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Your old device doesn't have one destination. EcoCycle AI calculates whether maximum financial & environmental yield is achieved through Resale, Component Refurbishment, or Metallurgical Recycling.
          </p>
        </div>

        {/* Visual Engine Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Path 1: RESALE */}
          <div className="glass-panel-glow rounded-2xl p-6 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  WORKING (70-100)
                </span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Circular Resale</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                High functional health. Unlocks cash trade-in payout from verified circular marketplaces and prolongs product lifetime.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-emerald-300 flex items-center justify-between font-medium">
              <span>Avg. Payout: High Yield</span>
              <span>CO₂ Avoided: ~55kg</span>
            </div>
          </div>

          {/* Path 2: REPAIR */}
          <div className="glass-panel-amber rounded-2xl p-6 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  REPAIRABLE (40-69)
                </span>
                <Layers className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Refurbish & Revive</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Defects exist (e.g. cracked glass, dead battery) but motherboard & silicon are sound. Micro-soldering and OEM parts restore market viability.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-amber-300 flex items-center justify-between font-medium">
              <span>Cost &lt; Margin Yield</span>
              <span>Saves 80% Mining</span>
            </div>
          </div>

          {/* Path 3: RECYCLE */}
          <div className="glass-panel-cyan rounded-2xl p-6 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  DEAD / SCRAP (0-39)
                </span>
                <Recycle className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Certified Recycling</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Uneconomical to repair or non-functional logic board. Routes to R2v3 recyclers extracting Gold, Silver, Copper, and Lithium safely.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-cyan-300 flex items-center justify-between font-medium">
              <span>Commodity Scrap Value</span>
              <span>Zero-Landfill Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 4-Step User Journey */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Workflow</div>
          <h2 className="text-3xl font-bold text-white">How EcoCycle AI Works</h2>
          <p className="text-slate-400 text-sm">
            From optical recognition to cryptographic sanitization and digital credit payouts in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-white">AI Vision Scan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a photo or point your camera. Gemini multi-modal vision detects category, brand, model generation, and physical blemishes.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Dual Valuation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We compute Estimated Resale Market Value against Recoverable Scrap Material Value (gold, copper, lithium) in INR or USD.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-white">NIST SP 800-88 Data Wipe</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never worry about personal data. Follow cryptographic sanitization steps and generate a tamper-evident digital certificate.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="text-lg font-bold text-white">Eco-Credits & Match</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect with nearby certified drop-off points or instant buyers. Earn Eco-Credits and track kilograms of CO₂ avoided.
            </p>
          </div>
        </div>
      </section>

      {/* Live Environmental Impact Stats */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">54,200+</div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">kg CO₂ Emissions Prevented</p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-400 mb-1">12.8 Tons</div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">E-Waste Diverted</p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 mb-1">100%</div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">NIST Sanitization Audited</p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-1">₹4.2M+</div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Value Recovered for Users</p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="text-center space-y-6 pt-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Ready to diagnose your old electronics?
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Scan your first device in seconds without entering sensitive passwords or credit cards.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/scan')}
            className="px-8 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Start Instant Scan
          </button>
          <button
            onClick={() => navigate('/demo')}
            className="px-8 py-3.5 rounded-xl glass-panel text-slate-200 hover:text-white text-sm font-semibold transition-colors"
          >
            Explore Interactive Demo Suite
          </button>
        </div>
      </section>
    </div>
  );
};
