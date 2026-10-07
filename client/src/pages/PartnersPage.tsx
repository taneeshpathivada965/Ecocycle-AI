import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Globe,
  Search,
  Award,
  RefreshCw,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import { Partner } from '../types';

export const PartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const res = await api.getPartners();
      setPartners(res.partners || []);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
    }
  };

  const filtered = partners.filter(p => {
    if (selectedType !== 'ALL' && p.partner_type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5" />
          <span>Certified Circular Network</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Partner Directory</h1>
        <p className="text-xs text-slate-400 max-w-xl">
          Explore certified R2v3 e-waste recyclers, component-level refurbishers, and verified trade-in marketplaces in your region.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {['ALL', 'RECYCLER', 'MARKETPLACE', 'REFURBISHER', 'DROP_OFF'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedType === t
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Partners Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-2" />
          Loading certified partners...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 text-xs">
          No partners matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{p.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{p.address}, {p.city}</span>
                    </p>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {p.partner_type}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {p.description}
                </p>

                {/* Categories & Standards */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-slate-300 font-medium">Standard: {p.certification_standard || 'ISO 14001 / CPCB'}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.supported_categories.map((cat, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-400 capitalize">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact info footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{p.rating} / 5.0</span>
                </div>

                <span className="text-emerald-400 font-semibold">
                  Verified Active Partner
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
