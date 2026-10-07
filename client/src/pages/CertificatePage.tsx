import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  FileCheck,
  Recycle,
  Lock,
  ExternalLink,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { Certificate } from '../types';

export const CertificatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCertificate(id);
    }
  }, [id]);

  const loadCertificate = async (certId: string) => {
    setLoading(true);
    try {
      const res = await api.getCertificate(certId);
      setCertificate(res.certificate);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Certificate not found or expired.');
      setLoading(false);
    }
  };

  const handleCopyHash = () => {
    if (certificate?.certificate_hash) {
      navigator.clipboard.writeText(certificate.certificate_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Verifying Cryptographic Certificate...</h2>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 mx-auto rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Certificate Verification Failed</h2>
        <p className="text-xs text-slate-400">{error || 'No certificate record matching this identifier.'}</p>
        <Link
          to="/dashboard"
          className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const device = certificate.device;
  const sanitization = certificate.sanitization;

  return (
    <div className="max-w-3xl mx-auto space-y-8 print:p-0 print:m-0">
      {/* Action Bar (hidden in print) */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyHash}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Hash Copied!' : 'Copy Hash'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Certificate</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Paper Document */}
      <div className="rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-8 sm:p-12 shadow-2xl relative overflow-hidden print:border-black print:bg-white print:text-black print:shadow-none">
        {/* Hologram Corner Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 hologram-seal rounded-full opacity-30 blur-xl pointer-events-none print:hidden" />

        {/* Certificate Header */}
        <div className="border-b border-slate-800 pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 print:border-gray-300">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight print:text-black">
                EcoCycle AI Security & Circular Logistics
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">
              Official Certificate of Cryptographic Data Sanitization
            </p>
          </div>

          {/* Verification Badge */}
          <div className="text-right flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold print:text-gray-600">
                STATUS
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1 print:border-green-600 print:text-green-700">
                <CheckCircle2 className="w-3 h-3" />
                <span>{certificate.verification_status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="py-8 space-y-6">
          <div className="text-center space-y-2 py-4">
            <h2 className="text-2xl font-bold text-white print:text-black tracking-tight">
              CERTIFICATE OF MEDIA DISPOSITION
            </h2>
            <p className="text-xs text-slate-400 print:text-gray-600 max-w-lg mx-auto">
              This document certifies that the electronic storage media listed below has undergone sanitized cryptographic erasure in adherence with international media sanitation standards.
            </p>
          </div>

          {/* Details Table Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 print:bg-gray-50 print:border-gray-200">
            <div>
              <span className="text-[11px] text-slate-400 block print:text-gray-600">Certificate Number</span>
              <span className="font-mono text-sm font-bold text-white print:text-black">
                {certificate.certificate_number}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block print:text-gray-600">Date of Issuance</span>
              <span className="text-sm font-medium text-white print:text-black">
                {new Date(certificate.issued_at).toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block print:text-gray-600">Target Device</span>
              <span className="text-sm font-bold text-white print:text-black">
                {device ? `${device.brand} ${device.model}` : 'Electronic Device'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block print:text-gray-600">Device Category</span>
              <span className="text-sm font-medium text-white print:text-black uppercase">
                {device ? device.category : 'General Electronics'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block print:text-gray-600">Sanitization Standard</span>
              <span className="text-sm font-semibold text-emerald-400 print:text-green-700">
                {sanitization?.standard || 'NIST SP 800-88 Rev 1'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block print:text-gray-600">Attestation Method</span>
              <span className="text-sm font-medium text-white print:text-black">
                {sanitization?.method || 'NIST_CLEAR (Cryptographic Erase)'}
              </span>
            </div>
          </div>

          {/* Cryptographic Hash Seal Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 print:bg-white print:border-gray-300">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 uppercase tracking-widest font-bold print:text-gray-600">
                Tamper-Evident SHA-256 Cryptographic Hash
              </span>
              <span className="text-emerald-400 font-mono text-[10px] print:text-green-700">
                IMMUTABLE AUDIT LOG
              </span>
            </div>
            <div className="font-mono text-xs text-slate-300 break-all select-all p-2 rounded bg-slate-900 border border-slate-800 print:bg-gray-100 print:text-black">
              {certificate.certificate_hash}
            </div>
          </div>
        </div>

        {/* Certificate Signatures & QR Seal */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 print:border-gray-300">
          <div className="flex items-center gap-4">
            {/* Simulated QR Code box */}
            <div className="w-20 h-20 rounded-xl bg-white p-2 flex flex-col items-center justify-center shadow">
              <QrCode className="w-14 h-14 text-black" />
              <span className="text-[8px] font-mono text-black font-bold">VERIFY</span>
            </div>
            <div className="space-y-0.5 text-xs text-slate-400 print:text-gray-600">
              <p className="font-semibold text-white print:text-black">Scan to Authenticate</p>
              <p className="text-[11px]">Verification URL: ecocycle.ai/verify/{certificate.certificate_number}</p>
              <p className="text-[10px] text-emerald-400 print:text-green-700 font-medium">Valid for Circular Exchange</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="h-10 flex items-end justify-end">
              <span className="font-serif italic text-lg text-emerald-400 print:text-black">
                EcoCycle Cryptographic Authority
              </span>
            </div>
            <div className="w-48 border-t border-slate-700 print:border-black ml-auto" />
            <p className="text-[10px] text-slate-400 print:text-gray-600 uppercase tracking-widest">
              Digital Signature Authority
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
