import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Coins,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Device, SanitizationGuide, SanitizationRecord, Certificate } from '../types';

export const SanitizePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<Device | null>(null);
  const [guidance, setGuidance] = useState<SanitizationGuide | null>(null);
  const [sanitization, setSanitization] = useState<SanitizationRecord | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [verificationType, setVerificationType] = useState<string>('USER_CONFIRMED');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [completedCert, setCompletedCert] = useState<Certificate | null>(null);
  const [rewardCredits, setRewardCredits] = useState<number | null>(null);
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

      const guideRes = await api.getSanitizationGuidance(deviceId);
      setGuidance(guideRes.guidance);
      if (guideRes.current_record) {
        setSanitization(guideRes.current_record);
        setCheckedSteps(guideRes.current_record.checklist_answers || {});
        if (guideRes.current_record.status === 'CONFIRMED') {
          const certRes = await api.getCertificate(deviceId).catch(() => null);
          if (certRes?.certificate) {
            setCompletedCert(certRes.certificate);
          }
        }
      }

      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to load sanitization guidance.');
      setLoading(false);
    }
  };

  const handleToggleStep = (stepId: string) => {
    setCheckedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const allCriticalDone = guidance
    ? guidance.steps.filter(s => s.critical).every(s => checkedSteps[s.id])
    : false;

  const handleConfirmSanitization = async () => {
    if (!device || !guidance) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.confirmSanitization(device.id, checkedSteps, verificationType);
      setSanitization(res.sanitization);
      setCompletedCert(res.certificate);
      setRewardCredits(res.eco_reward?.credits || 200);
      setSubmitting(false);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to confirm sanitization.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Loading NIST SP 800-88 Protocol...</h2>
      </div>
    );
  }

  if (error || !device || !guidance) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sanitization Error</h2>
        <p className="text-xs text-slate-400">{error || 'Unable to load wipe instructions.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 rounded-xl bg-slate-800 text-white text-xs"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/device/${device.id}`} className="hover:text-emerald-400">{device.brand} {device.model}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-200 font-medium">Data Sanitization</span>
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
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy Protection Layer • NIST SP 800-88 Rev 1</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Cryptographic Data Sanitization Workflow
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Before transferring or recycling {device.brand} {device.model}, ensure personal photos, banking tokens, and stored credentials are cryptographically effaced. We generate an immutable SHA-256 digital certificate upon completion.
        </p>

        {/* Security Warning Notice */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300 block">Strict Privacy & Zero-Knowledge Policy:</span>
            <p className="text-slate-300 leading-relaxed">
              EcoCycle AI will <strong>NEVER</strong> ask for your device passcode, Apple ID password, Google password, UPI PIN, or bank credentials. Always perform resets directly in your native device Settings menu.
            </p>
          </div>
        </div>
      </div>

      {/* Completion Modal / Banner if already completed */}
      {completedCert && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border-emerald-500/40 bg-emerald-950/20 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Sanitization Successfully Certified!
                </h3>
                <p className="text-xs text-emerald-300 font-mono mt-0.5">
                  Cert #{completedCert.certificate_number} • SHA-256 Verified
                </p>
              </div>
            </div>

            {rewardCredits && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>+{rewardCredits} Eco-Credits Earned!</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your cryptographic certificate is permanently recorded in your EcoCycle registry. You can present this certificate to trade-in inspectors or certified recyclers as tamper-evident proof of data erasure.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/certificates/${completedCert.certificate_number}`}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>View Official Digital Certificate</span>
            </Link>

            <Link
              to={`/device/${device.id}/decision`}
              className="px-5 py-2.5 rounded-xl glass-panel text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2"
            >
              <span>Back to Decision & Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Guided Checklist Steps */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Device-Specific Protocol: {guidance.device_type}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Standard: <span className="text-emerald-400 font-semibold">{guidance.standard}</span> • Est. Duration: ~{guidance.estimated_duration_minutes} mins
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {Object.values(checkedSteps).filter(Boolean).length} / {guidance.steps.length} completed
          </span>
        </div>

        <div className="space-y-4">
          {guidance.steps.map((step, idx) => {
            const isChecked = !!checkedSteps[step.id];
            return (
              <div
                key={step.id}
                onClick={() => handleToggleStep(step.id)}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                  isChecked
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isChecked
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 border border-slate-700 text-transparent'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-bold ${isChecked ? 'text-white' : 'text-slate-200'}`}>
                      {idx + 1}. {step.title}
                    </h4>
                    {step.critical && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.instruction}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Verification Provenance Mode Selector */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Certificate Attestation Mode:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'USER_CONFIRMED', label: 'User Confirmed', desc: 'User attests manual completion of checklist.' },
              { id: 'GUIDED', label: 'Guided Step-by-Step', desc: 'Guided interactive wipe walkthrough.' },
              { id: 'SIMULATED', label: 'Hackathon Simulated', desc: 'Simulated lab environment evaluation.' }
            ].map(m => (
              <div
                key={m.id}
                onClick={() => setVerificationType(m.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  verificationType === m.id
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold block">{m.label}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            {allCriticalDone
              ? 'All critical steps checked. Ready to generate tamper-evident certificate.'
              : 'Please complete all critical steps above to issue your certificate.'}
          </p>

          <button
            type="button"
            onClick={handleConfirmSanitization}
            disabled={!allCriticalDone || submitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 hover:opacity-95 disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Computing Cryptographic Hash...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Attest & Issue NIST Certificate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
