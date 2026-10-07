import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Layers,
  Recycle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Coins,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [loadedResult, setLoadedResult] = useState<any | null>(null);

  const scenarios = [
    {
      id: '1',
      code: 'resale',
      title: 'Demo 1 — Premium Working Smartphone',
      device: 'Apple iPhone 14 Pro Max (256GB)',
      condition: 'Grade A • 94% Battery Health • Fully Functional',
      expectedRoute: 'RESALE',
      resaleEst: '₹62,000',
      scrapEst: '₹650',
      tag: 'High Secondary Demand',
      description: 'Demonstrates circular secondary market valuation where retained consumer value far exceeds raw scrap recovery. Directly extends silicon lifespan.',
      color: 'emerald',
      icon: TrendingUp
    },
    {
      id: '2',
      code: 'repair',
      title: 'Demo 2 — Damaged but Repairable Laptop',
      device: 'Apple MacBook Air (M1, 2020)',
      condition: 'Grade C • Cracked Retina Display Panel • Working Logic Board',
      expectedRoute: 'REPAIR',
      resaleEst: '₹38,000 (Repaired)',
      repairCost: '₹9,500',
      scrapEst: '₹1,850',
      tag: 'Refurbishment Viable',
      description: 'Demonstrates condition-based routing where repairing cracked glass unlocks ₹38,000 of value, making repair economically superior to raw recycling.',
      color: 'amber',
      icon: Layers
    },
    {
      id: '3',
      code: 'recycle',
      title: 'Demo 3 — Dead / Severely Damaged Smartphone',
      device: 'Samsung Galaxy S9 (Water Corroded)',
      condition: 'Dead / Scrap • Swollen Battery Hazard • Black Screen',
      expectedRoute: 'RECYCLE',
      resaleEst: '₹0 (Unviable)',
      scrapEst: '₹450 (Au + Ag + Cu Metals)',
      tag: 'Zero-Landfill Recovery',
      description: 'Demonstrates hazardous e-waste diversion where non-repairable legacy hardware is routed to R2v3 hydrometallurgical refiners to extract gold and silver.',
      color: 'cyan',
      icon: Recycle
    }
  ];

  const handleRunScenario = async (scenarioId: string) => {
    setLoadingScenario(scenarioId);
    try {
      const res = await api.loadDemoScenario(scenarioId);
      setLoadedResult(res.scenario);
      setLoadingScenario(null);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Jump directly to the decision engine page for the hydrated device
      setTimeout(() => {
        navigate(`/device/${res.scenario.device.id}/decision`);
      }, 1000);
    } catch (err) {
      setLoadingScenario(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hackathon Evaluation & Judge Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          3-Minute Hackathon Demo Command Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Instantly simulate the three primary circular-economy pathways with 1 click. Each scenario fully populates AI vision analysis, hardware diagnostics, dual-pricing, and verified partner matchmaking.
        </p>
      </div>

      {/* 3 Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isLoading = loadingScenario === sc.id;
          const isEmerald = sc.color === 'emerald';
          const isAmber = sc.color === 'amber';
          const isCyan = sc.color === 'cyan';

          return (
            <div
              key={sc.id}
              className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all relative overflow-hidden ${
                isEmerald
                  ? 'glass-panel-glow border-emerald-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950/20'
                  : isAmber
                  ? 'glass-panel-amber border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-amber-950/20'
                  : 'glass-panel-cyan border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-cyan-950/20'
              }`}
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    isEmerald ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    isAmber ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    ROUTE: {sc.expectedRoute}
                  </span>
                  <div className={`p-2 rounded-xl ${
                    isEmerald ? 'bg-emerald-500/20 text-emerald-400' :
                    isAmber ? 'bg-amber-500/20 text-amber-400' :
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{sc.title}</h3>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">{sc.device}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                    Input Condition:
                  </span>
                  <p className="text-slate-300 font-medium leading-relaxed">{sc.condition}</p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {sc.description}
                </p>

                {/* Metrics */}
                <div className="pt-3 border-t border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resale Yield:</span>
                    <span className="text-emerald-400 font-bold">{sc.resaleEst}</span>
                  </div>
                  {sc.repairCost && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Repair Cost:</span>
                      <span className="text-amber-400 font-bold">{sc.repairCost}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scrap Extract:</span>
                    <span className="text-cyan-400 font-bold">{sc.scrapEst}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleRunScenario(sc.id)}
                  disabled={!!loadingScenario}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isEmerald
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                      : isAmber
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Load Scenario {sc.id}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 30-Second Judge Guide */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>30-Second Judge Evaluation Flow</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          1. Click any scenario button above to populate the device pipeline.<br />
          2. Inspect the <strong>Intelligent Routing Card</strong> on the Decision Page (proves condition-based branching).<br />
          3. Check the <strong>Dual Valuation Card</strong> (Resale vs Scrap material recovery).<br />
          4. Test the <strong>NIST SP 800-88 Data Sanitization</strong> module to issue a signed certificate.<br />
          5. Visit the <strong>Eco-Wallet</strong> to inspect live CO₂ savings and Eco-Credits ledger.
        </p>
      </div>
    </div>
  );
};
