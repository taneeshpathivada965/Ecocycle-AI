import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ArrowLeft, Home, Scan } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24 text-center space-y-6 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
        <Recycle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-200">Page Lost in the Circular Stream</h2>
        <p className="text-xs text-slate-400">
          The requested resource could not be found or has already been recycled into something new.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-white font-semibold flex items-center gap-2"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <Link
          to="/scan"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2"
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Scan a Device</span>
        </Link>
      </div>
    </div>
  );
};
