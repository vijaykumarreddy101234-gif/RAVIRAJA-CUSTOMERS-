import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Phone,
  MessageCircle,
  Building,
  User,
  MapPin,
  Calendar,
  Flame,
  CheckCircle,
  ArrowUpDown,
  FileCheck,
  Eye,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { CustomerVisit } from '../types/customerVisit';
import { INDIAN_STATES } from '../data/indiaLocations';

interface CustomerVisitListProps {
  visits: CustomerVisit[];
  onSelectVisit: (visit: CustomerVisit) => void;
  onDeleteVisit: (id: string) => void;
  onQuickTogglePI: (visit: CustomerVisit) => void;
}

export const CustomerVisitList: React.FC<CustomerVisitListProps> = ({
  visits,
  onSelectVisit,
  onDeleteVisit,
  onQuickTogglePI,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedPISent, setSelectedPISent] = useState<string>('All');

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const matchSearch =
        searchTerm === '' ||
        v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.mobileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.interestedBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.visitRemarks.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = selectedStatus === 'All' || v.leadStatus === selectedStatus;
      const matchType = selectedType === 'All' || v.customerType === selectedType;
      const matchState = selectedState === 'All' || v.state === selectedState;
      const matchPI = selectedPISent === 'All' || v.piSent === selectedPISent;

      return matchSearch && matchStatus && matchType && matchState && matchPI;
    });
  }, [visits, searchTerm, selectedStatus, selectedType, selectedState, selectedPISent]);

  const cleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Title & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">uPVC Visits & Fabricator Log</h2>
          <p className="text-xs text-slate-400">
            {filteredVisits.length} of {visits.length} records • SCRAFT All-India Field Entries
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search fabricator, company, mobile, city, uPVC series..."
          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Customer Type Quick Filters (Fabricator, Distributor, etc.) */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 flex gap-1.5 pb-0.5">
        {['All', 'Fabricator', 'Distributor', 'Wholesaler', 'Direct OEM', 'Dealer'].map((ct) => (
          <button
            key={ct}
            type="button"
            onClick={() => setSelectedType(ct)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedType === ct
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
          >
            {ct === 'Fabricator' ? '🔨 Fabricators' : ct}
          </button>
        ))}
      </div>

      {/* Filter Row: Status Pills */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 flex gap-1.5 pb-1">
        {['All', 'Hot', 'Warm', 'Cold', 'Won / Closed', 'Lost'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setSelectedStatus(st)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
              selectedStatus === st
                ? st === 'Hot'
                  ? 'bg-rose-500 text-white shadow-md'
                  : st === 'Won / Closed'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-indigo-500 text-white shadow-md'
                : 'bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            {st === 'Hot' ? '🔥 Hot' : st === 'Warm' ? '⚡ Warm' : st === 'Won / Closed' ? '🏆 Won' : st}
          </button>
        ))}
      </div>

      {/* Filter Row 2: State & PI dropdowns */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="All">All States (India)</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedPISent}
            onChange={(e) => setSelectedPISent(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="All">PI Sent: All</option>
            <option value="Yes">PI Sent: Yes</option>
            <option value="No">PI Sent: No</option>
            <option value="Under Preparation">PI: Under Prep</option>
          </select>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {filteredVisits.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
            <Building className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No Customer Visits Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              No entries match your search filters. Try clearing filters or submit a new customer visit.
            </p>
          </div>
        ) : (
          filteredVisits.map((visit) => {
            const isHot = visit.leadStatus === 'Hot';
            const isWon = visit.leadStatus === 'Won / Closed';

            return (
              <div
                key={visit.id}
                className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-sm group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelectVisit(visit)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white truncate">
                        {visit.companyName || visit.customerName}
                      </h4>
                      {isHot ? (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> HOT LEAD
                        </span>
                      ) : isWon ? (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          🏆 WON / CLOSED
                        </span>
                      ) : (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                          {visit.leadStatus}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1 font-medium">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{visit.customerName}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{visit.customerType}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">
                        {visit.city}, {visit.state}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{visit.customerVisitDate}</span>
                    </div>
                  </div>

                  {/* Quick Connect: Phone & WhatsApp */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${visit.mobileNumber}`}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                      title="Call Customer"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(visit.mobileNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 transition"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Requirements & PI Status Bar */}
                <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 flex items-center justify-between gap-2 text-xs mb-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block">Brand & Quantity:</span>
                    <span className="font-semibold text-white truncate block">
                      {visit.interestedBrand} ({visit.quantityPerMonth})
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">PI Sent:</span>
                    <button
                      type="button"
                      onClick={() => onQuickTogglePI(visit)}
                      className={`font-bold px-2 py-0.5 rounded text-[10px] transition ${
                        visit.piSent === 'Yes'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {visit.piSent === 'Yes' ? '✓ PI Dispatched' : 'No PI'}
                    </button>
                  </div>
                </div>

                {/* Remarks & Follow-up */}
                {visit.visitRemarks && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-1 mb-2">
                    "{visit.visitRemarks}"
                  </p>
                )}

                {/* Footer metadata */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>Executive: {visit.salesExecutiveName}</span>
                  {visit.followUpDate && (
                    <span className="text-amber-400/90 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Due: {visit.followUpDate}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
