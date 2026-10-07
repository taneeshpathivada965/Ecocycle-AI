import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan,
  Upload,
  Camera,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { api } from '../services/api';
import { DeviceIdentification, DeviceCategory, WorkingStatus, ConditionGrade } from '../types';

export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Initializing AI engine...');
  const [identification, setIdentification] = useState<DeviceIdentification | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form confirmation overrides
  const [category, setCategory] = useState<DeviceCategory>('smartphone');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [generation, setGeneration] = useState<string>('');
  const [condition, setCondition] = useState<ConditionGrade>('B');
  const [workingStatus, setWorkingStatus] = useState<WorkingStatus>('WORKING');
  const [storageCapacity, setStorageCapacity] = useState<string>('128GB');
  const [ramCapacity, setRamCapacity] = useState<string>('6GB');
  const [userNotes, setUserNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPG, PNG, WebP).');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Webcam
  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setError('Unable to access device camera. Please upload a photo instead.');
      setIsCameraActive(false);
    }
  };

  // Stop Webcam
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Capture Photo from Webcam
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(dataUrl);
        stopCamera();
      }
    }
  };

  // Run AI Identification
  const runAiAnalysis = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setError(null);

    const steps = [
      'Scanning device geometry & chassis contour...',
      'Extracting camera lens assembly & brand markings...',
      'Assessing display glass and perimeter integrity...',
      'Evaluating hardware generation & silicon tier...',
      'Synthesizing diagnostic parameters...'
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setAnalysisStep(steps[stepIdx]);
      }
    }, 600);

    try {
      const res = await api.identifyDevice({
        image: imagePreview
      });

      clearInterval(interval);
      setIsAnalyzing(false);

      if (res.identification) {
        const idResult = res.identification;
        setIdentification(idResult);
        setCategory(idResult.category);
        setBrand(idResult.brand);
        setModel(idResult.model);
        setGeneration(idResult.generation || '2022');
        setCondition(idResult.condition_grade as ConditionGrade);
        setWorkingStatus(idResult.condition_grade === 'BROKEN' ? 'NON_WORKING' : 'WORKING');
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setError(err?.message || 'AI recognition failed. You can manually enter device details below.');
      // Pre-fill sensible defaults
      setBrand('Apple');
      setModel('iPhone 13');
    }
  };

  // Save device, execute diagnostics & routing, and proceed to decision page
  const handleProceedToDiagnostics = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create Device
      const created = await api.createDevice({
        category,
        brand,
        model,
        generation,
        condition,
        working_status: workingStatus,
        identification_confidence: identification?.confidence || 0.88,
        estimated_age_years: generation ? Math.max(1, new Date().getFullYear() - parseInt(generation)) : 2,
        storage_capacity: storageCapacity,
        ram_capacity: ramCapacity,
        user_notes: userNotes,
        image_url: imagePreview || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600'
      });

      const deviceId = created.device.id;

      // 2. Trigger Automated Diagnostics
      await api.runDiagnostics(deviceId, {
        source: 'AI_ESTIMATED'
      });

      // 3. Trigger Dual Valuation
      await api.calculateValuation(deviceId, 'INR');

      // 4. Trigger Deterministic Decision Engine
      await api.evaluateDecision(deviceId);

      // Redirect to decision page
      navigate(`/device/${deviceId}/decision`);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Failed to complete device assessment. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          <span>Multi-Modal Optical Vision Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Device Optical Scanner</h1>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Capture or upload a clear photo of your device. EcoCycle AI detects brand, model, and physical wear with high-confidence recognition.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Scanner Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        {/* Viewport: Webcam or Image Preview or Dropzone */}
        <div className="relative w-full aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center group">
          {/* Active Webcam */}
          {isCameraActive && (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Radar scanner line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-radar pointer-events-none" />
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Captured / Uploaded Image Preview */}
          {!isCameraActive && imagePreview && (
            <div className="relative w-full h-full flex items-center justify-center bg-black/60">
              <img
                src={imagePreview}
                alt="Device Preview"
                className="max-h-full max-w-full object-contain"
              />
              {/* Radar sweep during analysis */}
              {isAnalyzing && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-radar pointer-events-none" />
              )}
              <button
                onClick={() => {
                  setImagePreview(null);
                  setIdentification(null);
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Empty Upload Dropzone */}
          {!isCameraActive && !imagePreview && (
            <div className="text-center p-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Scan className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  Position your device in frame or upload an image
                </p>
                <p className="text-xs text-slate-400">
                  Supported formats: PNG, JPG, JPEG, WebP (Front or rear perspective recommended)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  Browse Files
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-colors border border-emerald-500/30"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  Use Camera
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Action button: Trigger AI Analysis */}
        {imagePreview && !identification && (
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={runAiAnalysis}
              disabled={isAnalyzing}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-3 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{analysisStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Identification</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* AI Findings Preview & Confirmation Card */}
        {identification && (
          <div className="space-y-6 pt-4 border-t border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">AI Identification Results</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {Math.round(identification.confidence * 100)}% Confidence
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{identification.reasoning_summary}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setIdentification(null);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Re-scan
              </button>
            </div>

            {/* Identified damage items */}
            {identification.visible_damage && identification.visible_damage.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Visual Damage Indicators:
                </span>
                <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                  {identification.visible_damage.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confirmation & Refinement Form */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                  Confirm or Refine Specifications
                </h4>
                <span className="text-[11px] text-slate-400">Review before launching diagnostics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DeviceCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="smartphone">Smartphone</option>
                    <option value="laptop">Laptop</option>
                    <option value="tablet">Tablet</option>
                    <option value="smartwatch">Smartwatch</option>
                    <option value="monitor">Monitor</option>
                    <option value="desktop">Desktop PC</option>
                    <option value="gaming_console">Gaming Console</option>
                    <option value="other">Other Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Apple, Samsung, Dell"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. iPhone 14 Pro, MacBook Air"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Release Year</label>
                  <input
                    type="text"
                    value={generation}
                    onChange={(e) => setGeneration(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. 2021"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Working Condition</label>
                  <select
                    value={workingStatus}
                    onChange={(e) => setWorkingStatus(e.target.value as WorkingStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="WORKING">Working (Powers on, touch/keys ok)</option>
                    <option value="PARTIALLY_WORKING">Partially Working (Defects/cracks)</option>
                    <option value="NON_WORKING">Non-Working (Fails to boot)</option>
                    <option value="DEAD">Dead / Scrap (Water damage / crushed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Cosmetic Grade</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ConditionGrade)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="A">Grade A (Mint / Minor micro-scuffs)</option>
                    <option value="B">Grade B (Normal wear / light scratches)</option>
                    <option value="C">Grade C (Heavy dents / glass fracture)</option>
                    <option value="BROKEN">Broken / Severely Damaged</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Storage</label>
                  <input
                    type="text"
                    value={storageCapacity}
                    onChange={(e) => setStorageCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. 128GB, 512GB SSD"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">RAM</label>
                  <input
                    type="text"
                    value={ramCapacity}
                    onChange={(e) => setRamCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. 8GB, 16GB"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Notes / Known Faults</label>
                  <input
                    type="text"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Screen replaced once, original battery"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleProceedToDiagnostics}
                  disabled={isSubmitting || !brand || !model}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:opacity-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Computing Decision Route...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Diagnostics & Valuation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Quick Entry Helper if user has no camera/photo */}
      {!imagePreview && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setImagePreview('https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600');
              setIdentification({
                category: 'smartphone',
                brand: 'Apple',
                model: 'iPhone 13 Pro',
                generation: '2021',
                condition_grade: 'A',
                visible_damage: ['Minor edge scuffs'],
                confidence: 0.93,
                reasoning_summary: 'Manual sample device selected for rapid testing.',
                needs_user_confirmation: false
              });
              setBrand('Apple');
              setModel('iPhone 13 Pro');
              setGeneration('2021');
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 underline underline-offset-4"
          >
            Don't have a photo right now? Load demo smartphone sample
          </button>
        </div>
      )}
    </div>
  );
};
