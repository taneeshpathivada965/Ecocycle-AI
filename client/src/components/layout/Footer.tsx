import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ShieldCheck, Heart, Sparkles, Cpu, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-base">EcoCycle AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              AI-driven circular economy platform transforming e-waste through condition-based routing, dual-pricing valuation, and cryptographic data sanitization.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>NIST SP 800-88 Rev 1 Compliant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px]">Workflow</h4>
            <ul className="space-y-2">
              <li><Link to="/scan" className="hover:text-emerald-400 transition-colors">AI Vision Scanner</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Condition Diagnostics</Link></li>
              <li><Link to="/eco-wallet" className="hover:text-emerald-400 transition-colors">Dual Pricing Engine</Link></li>
              <li><Link to="/history" className="hover:text-emerald-400 transition-colors">Sanitization Certificates</Link></li>
              <li><Link to="/demo" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">Hackathon Demo Mode</Link></li>
            </ul>
          </div>

          {/* Partners & Standards */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px]">Standards & Integrity</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-emerald-400" /> R2v3 Certified Recyclers</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> e-Stewards Ethical Standards</li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPCB Environmental Clearance</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Google GenAI Multi-Modal Vision</li>
            </ul>
          </div>

          {/* Environmental Commitment */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wider uppercase text-[11px]">Circular Mission</h4>
            <p className="leading-relaxed text-xs">
              Every device kept in circulation or hydrometallurgically recovered saves an average of 55kg of CO₂ emissions and prevents lead and mercury from polluting groundwater aquifers.
            </p>
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-[11px]">
              Active Zero-Landfill Goal: <span className="font-bold text-white">100% Traceability</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} EcoCycle AI Inc. Built for Circular Sustainability.</p>
          <div className="flex items-center gap-4">
            <Link to="/demo" className="text-slate-400 hover:text-white">Demo Scenarios</Link>
            <Link to="/partners" className="text-slate-400 hover:text-white">Verified Recyclers</Link>
            <Link to="/settings" className="text-slate-400 hover:text-white">Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
