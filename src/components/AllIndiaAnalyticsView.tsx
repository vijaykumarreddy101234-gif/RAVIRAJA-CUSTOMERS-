import React from 'react';
import {
  MapPin,
  TrendingUp,
  Flame,
  CheckCircle2,
  Package,
  Building,
  Users,
  Award,
} from 'lucide-react';
import { CustomerVisit } from '../types/customerVisit';

interface AllIndiaAnalyticsViewProps {
  visits: CustomerVisit[];
}

export const AllIndiaAnalyticsView: React.FC<AllIndiaAnalyticsViewProps> = ({ visits }) => {
  const total = visits.length;
  const hotCount = visits.filter((v) => v.leadStatus === 'Hot').length;
  const wonCount = visits.filter((v) => v.leadStatus === 'Won / Closed').length;
  const piSentCount = visits.filter((v) => v.piSent === 'Yes').length;

  // State distribution
  const stateMap: { [state: string]: number } = {};
  visits.forEach((v) => {
    stateMap[v.state] = (stateMap[v.state] || 0) + 1;
  });

  const sortedStates = Object.entries(stateMap)
    .map(([state, count]) => ({
      state,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Customer Type distribution
  const typeMap: { [type: string]: number } = {};
  visits.forEach((v) => {
    typeMap[v.customerType] = (typeMap[v.customerType] || 0) + 1;
  });

  // Brand Distribution
  const brandMap: { [brand: string]: number } = {};
  visits.forEach((v) => {
    brandMap[v.interestedBrand] = (brandMap[v.interestedBrand] || 0) + 1;
  });

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">All-India Sales Analytics</h2>
        <p className="text-xs text-slate-400">
          Raviraja Industries Private Limited • Real-time field coverage & lead conversion metrics.
        </p>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Visits</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white">{total}</p>
          <span className="text-[10px] text-sky-400 font-medium">All-India Entries</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Hot Inquiries</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{hotCount}</p>
          <span className="text-[10px] text-slate-400">
            {total > 0 ? Math.round((hotCount / total) * 100) : 0}% of all visits
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>PI Sent Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{piSentCount}</p>
          <span className="text-[10px] text-slate-400">
            {total > 0 ? Math.round((piSentCount / total) * 100) : 0}% conversion step
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Won / Closed</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{wonCount}</p>
          <span className="text-[10px] text-slate-400">Approved orders</span>
        </div>
      </div>

      {/* State-wise Coverage across India */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>State-wise All-India Distribution</span>
          </h3>
          <span className="text-[11px] text-slate-400">{sortedStates.length} Active States</span>
        </div>

        <div className="space-y-2.5">
          {sortedStates.map((st) => (
            <div key={st.state} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{st.state}</span>
                <span className="text-slate-400 font-mono">
                  {st.count} visits ({st.pct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full"
                  style={{ width: `${st.pct}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Types & SCRAFT Brand Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Customer Type Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-indigo-400" />
            <span>Customer Types</span>
          </h3>
          <div className="space-y-2">
            {Object.entries(typeMap).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-800/60">
                <span className="text-slate-300 font-medium">{type}</span>
                <span className="font-bold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SCRAFT uPVC Profile Interest */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-400" />
            <span>SCRAFT uPVC Profile Series</span>
          </h3>
          <div className="space-y-2">
            {Object.entries(brandMap).map(([brand, count]) => (
              <div key={brand} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-800/60">
                <span className="text-sky-300 font-medium truncate pr-2">{brand}</span>
                <span className="font-bold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
