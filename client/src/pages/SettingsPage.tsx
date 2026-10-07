import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Moon,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Platform Configuration & Settings</h1>
        <p className="text-xs text-slate-400">
          Configure offline telemetry caches, privacy policies, and verified circular alerts.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings saved!</span>
        </div>
      )}

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-white block">Eco-Logistics Alerts</span>
              <p className="text-xs text-slate-400">
                Receive notifications when certified collection vans are operating within 5 km of your address.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-white block">Offline Diagnostic Caching</span>
              <p className="text-xs text-slate-400">
                Store cryptographic certificates and telemetry offline for field auditing without cellular data.
              </p>
            </div>
            <input
              type="checkbox"
              checked={offlineSync}
              onChange={(e) => setOfflineSync(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-slate-800">
            <span className="text-sm font-bold text-white block mb-1">Privacy & NIST SP 800-88 Policy</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              EcoCycle AI utilizes cryptographic SHA-256 digests. Raw device photos and telemetry are evaluated statelessly and never stored for biometric profiling.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
