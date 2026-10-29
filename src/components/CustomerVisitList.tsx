import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  Navigation,
  ExternalLink,
  Sparkles,
  Users,
  Briefcase,
  Clock,
  Camera,
  Image as ImageIcon,
  X,
  Share2,
} from 'lucide-react';
import { CustomerVisit, VisitPhoto } from '../types/customerVisit';
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
  const [selectedExecutive, setSelectedExecutive] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedPISent, setSelectedPISent] = useState<string>('All');
  const [zoomedPhoto, setZoomedPhoto] = useState<
    (VisitPhoto & { customerName?: string; companyName?: string }) | null
  >(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const handleShareVisit = async (v: CustomerVisit) => {
    const brand =
      v.brand ||
      (v.interestedBrand.includes('SMART')
        ? 'SMART'
        : v.interestedBrand.includes('SCRAFT') || v.interestedBrand.includes('S CRAFT')
        ? 'S CRAFT'
        : 'OTHERS');

    const text = [
      `🏢 *SCRAFT uPVC Visit Report*`,
      `--------------------------------`,
      `*Company / Firm:* ${v.companyName || v.customerName}`,
      `*Customer / Owner:* ${v.customerName} (${v.contactDesignation || 'Owner'})`,
      `*Mobile:* ${v.mobileNumber}`,
      `*Location:* ${v.city}, ${v.state} ${v.gpsLocationLink ? `(GPS: ${v.gpsLocationLink})` : ''}`,
      `*Customer Type:* ${v.customerType}`,
      `*Brand Interested:* ${brand} - ${v.interestedSeries || v.interestedBrand}`,
      `*Monthly Volume:* ${v.quantityPerMonth}`,
      `*Competitors Used:* ${v.currentBrands?.join(', ') || v.currentBrand || 'None'}`,
      `*Lead Stage:* ${v.leadStatus} | *PI Status:* ${v.piSent}`,
      `*Follow-up Date:* ${v.followUpDate || 'None'}`,
      `*Conversation / Remarks:* "${v.visitRemarks || 'N/A'}"`,
      `*Dealt By Executive:* ${v.salesExecutiveName} (${v.customerVisitDate})`,
      `--------------------------------`,
      `_Generated via SCRAFT uPVC Sales Tracker_`,
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SCRAFT Visit Report: ${v.companyName || v.customerName}`,
          text: text,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
      }
    }

    // Fallback to clipboard and WhatsApp web
    try {
      await navigator.clipboard.writeText(text);
      setShareToast(`✓ Visit details for "${v.companyName || v.customerName}" copied to clipboard! Ready to paste on WhatsApp.`);
      setTimeout(() => setShareToast(null), 4000);
    } catch (e) {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  // Extract all unique sales executives dynamically
  const uniqueExecutives = useMemo(() => {
    const set = new Set<string>();
    visits.forEach((v) => {
      if (v.salesExecutiveName && v.salesExecutiveName.trim()) {
        set.add(v.salesExecutiveName.trim());
      }
    });
    return Array.from(set).sort();
  }, [visits]);

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const matchExecutive =
        selectedExecutive === 'All' || v.salesExecutiveName === selectedExecutive;

      const matchSearch =
        searchTerm === '' ||
        v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.contactDesignation && v.contactDesignation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.additionalContacts &&
          v.additionalContacts.some(
            (c) =>
              c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.mobileNumber.toLowerCase().includes(searchTerm.toLowerCase())
          )) ||
        v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.mobileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.gstNumber && v.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        v.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.brand && v.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.interestedSeries && v.interestedSeries.toLowerCase().includes(searchTerm.toLowerCase())) ||
        v.interestedBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.visitRemarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.salesExecutiveName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.otherOpinionCards &&
          v.otherOpinionCards.some(
            (o) =>
              o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              o.content.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      const matchStatus = selectedStatus === 'All' || v.leadStatus === selectedStatus;
      const matchType = selectedType === 'All' || v.customerType === selectedType;
      const matchState = selectedState === 'All' || v.state === selectedState;
      const matchPI = selectedPISent === 'All' || v.piSent === selectedPISent;

      // Brand filter: S CRAFT, SMART, OTHERS
      let matchBrand = true;
      if (selectedBrand !== 'All') {
        if (selectedBrand === 'S CRAFT') {
          matchBrand =
            v.brand === 'S CRAFT' ||
            (!v.brand && (v.interestedBrand.includes('SCRAFT') || v.interestedBrand.includes('S CRAFT')));
        } else if (selectedBrand === 'SMART') {
          matchBrand =
            v.brand === 'SMART' ||
            (!v.brand && v.interestedBrand.toLowerCase().includes('smart'));
        } else if (selectedBrand === 'OTHERS') {
          matchBrand =
            v.brand !== 'S CRAFT' &&
            v.brand !== 'SMART' &&
            !v.interestedBrand.includes('SCRAFT') &&
            !v.interestedBrand.includes('S CRAFT') &&
            !v.interestedBrand.toLowerCase().includes('smart');
        }
      }

      return matchExecutive && matchSearch && matchStatus && matchType && matchBrand && matchState && matchPI;
    });
  }, [
    visits,
    searchTerm,
    selectedExecutive,
    selectedStatus,
    selectedType,
    selectedBrand,
    selectedState,
    selectedPISent,
  ]);

  const cleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="space-y-4 pb-12">
      {shareToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl animate-fadeIn">
          <span>{shareToast}</span>
          <button
            type="button"
            onClick={() => setShareToast(null)}
            className="text-emerald-300 hover:text-white cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

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
          placeholder="Search fabricator, company, GST, mobile, city, brand, GPS..."
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

      {/* Sales Executive Selector: Person-Wise or All */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>Sales Executive:</span>
          </span>
          {selectedExecutive !== 'All' ? (
            <button
              type="button"
              onClick={() => setSelectedExecutive('All')}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-bold hover:underline"
            >
              Reset to All ({visits.length})
            </button>
          ) : (
            <span className="text-[10px] text-slate-500 font-medium">Viewing All Executives</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedExecutive('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border active:scale-95 ${
              selectedExecutive === 'All'
                ? 'bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Option ({visits.length})
          </button>
          {uniqueExecutives.map((exec) => {
            const count = visits.filter((v) => v.salesExecutiveName === exec).length;
            const isSelected = selectedExecutive === exec;
            return (
              <button
                key={exec}
                type="button"
                onClick={() => setSelectedExecutive(exec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{exec}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-sky-800 text-sky-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Filters (S CRAFT, SMART, OTHERS) */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 flex items-center gap-1.5 pb-0.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" /> Brand:
        </span>
        {['All', 'S CRAFT', 'SMART', 'OTHERS'].map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setSelectedBrand(b)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition ${
              selectedBrand === b
                ? b === 'SMART'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : b === 'OTHERS'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
          >
            {b === 'All' ? 'All Brands' : b}
          </button>
        ))}
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
          filteredVisits.map((visit, index) => {
            const isHot = visit.leadStatus === 'Hot';
            const isWon = visit.leadStatus === 'Won / Closed';
            const visitBrand =
              visit.brand ||
              (visit.interestedBrand.includes('SMART')
                ? 'SMART'
                : visit.interestedBrand.includes('SCRAFT') || visit.interestedBrand.includes('S CRAFT')
                ? 'S CRAFT'
                : 'OTHERS');

            return (
              <div
                key={visit.id}
                className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-sm group"
              >
                {/* Visit Number & Executive Deal Header */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800 text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-extrabold px-2 py-0.5 rounded-lg bg-sky-950 text-sky-300 border border-sky-800/80">
                      Visit #{filteredVisits.length - index}
                    </span>
                    {visit.customerVisitTime && (
                      <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {visit.customerVisitTime}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span>Dealt by: <strong className="text-white">{visit.salesExecutiveName}</strong></span>
                  </span>
                </div>

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
                      {visit.photos && visit.photos.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Camera className="w-2.5 h-2.5" /> {visit.photos.length}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300 mt-1 font-medium">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="font-bold text-white">{visit.customerName}</span>
                      <span className="text-[10px] font-semibold text-sky-300 bg-sky-950/80 border border-sky-800/60 px-1.5 py-0.2 rounded">
                        {visit.contactDesignation || 'Owner / Proprietor'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{visit.customerType}</span>
                      {visit.gstNumber && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950/60 text-sky-300 border border-sky-800/40">
                            GST: {visit.gstNumber}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Additional Directors, Supervisors & Unit Team */}
                    {visit.additionalContacts && visit.additionalContacts.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-800/60">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mb-1">
                          <Users className="w-3 h-3 text-sky-400" />
                          <span>Unit Personnel ({visit.additionalContacts.length}):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {visit.additionalContacts.map((contact, idx) => {
                            const cClean = contact.mobileNumber.replace(/[^0-9]/g, '');
                            return (
                              <div
                                key={contact.id || idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-[11px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="font-semibold text-slate-200">{contact.name}</span>
                                <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-1 py-0.2 rounded">
                                  {contact.designation}
                                </span>
                                {contact.mobileNumber && (
                                  <div className="flex items-center gap-1 pl-1 ml-0.5 border-l border-slate-700">
                                    <a
                                      href={`tel:${contact.mobileNumber}`}
                                      className="text-sky-400 hover:text-sky-300 transition"
                                      title={`Call ${contact.name}`}
                                    >
                                      <Phone className="w-2.5 h-2.5" />
                                    </a>
                                    <a
                                      href={`https://wa.me/${cClean}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-400 hover:text-emerald-300 transition"
                                      title={`WhatsApp ${contact.name}`}
                                    >
                                      <MessageCircle className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">
                          {visit.city}, {visit.state}
                        </span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300 font-medium">{visit.customerVisitDate}</span>
                      {visit.customerVisitTime && (
                        <span className="text-[10px] text-cyan-400 font-mono">({visit.customerVisitTime})</span>
                      )}

                      {/* GPS Location Tag Link Button */}
                      {visit.gpsLocationLink && (
                        <a
                          href={visit.gpsLocationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition shadow-sm"
                          title="View exact customer visit location on Google Maps"
                        >
                          <Navigation className="w-2.5 h-2.5 text-rose-400" />
                          <span>📍 View GPS Tag</span>
                          <ExternalLink className="w-2.5 h-2.5 text-rose-400/80" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Quick Connect: Phone, WhatsApp & Share */}
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
                    <button
                      type="button"
                      onClick={() => handleShareVisit(visit)}
                      className="p-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-400 transition cursor-pointer"
                      title="Share visit report and details"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Requirements & PI Status Bar */}
                <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 flex items-center justify-between gap-2 text-xs mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] text-slate-400">Brand:</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          visitBrand === 'SMART'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : visitBrand === 'OTHERS'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {visitBrand}
                      </span>
                    </div>
                    <span className="font-semibold text-white truncate block">
                      {visit.interestedSeries || visit.interestedBrand} ({visit.quantityPerMonth})
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

                {/* Currently Used Competitor Multi-Brands */}
                {((visit.currentBrands && visit.currentBrands.length > 0) || (visit.currentBrand && visit.currentBrand !== 'None' && visit.currentBrand !== 'Local/Competitor')) && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-2 text-[11px]">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      Brands Used ({visit.currentBrands?.length || visit.currentBrand.split(',').length}):
                    </span>
                    {(visit.currentBrands || visit.currentBrand.split(',')).map((b, bIdx) => (
                      <span
                        key={bIdx}
                        className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-950/40 text-amber-200 border border-amber-600/30"
                      >
                        {b.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Remarks & Follow-up */}
                {visit.visitRemarks && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-1 mb-2">
                    "{visit.visitRemarks}"
                  </p>
                )}

                {/* Attached Workshop & Visit Photos Strip */}
                {visit.photos && visit.photos.length > 0 && (
                  <div className="mb-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1.5">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Camera className="w-3 h-3" />
                        <span>Attached Photos ({visit.photos.length}):</span>
                      </span>
                      <span className="text-[9px] text-slate-500">Tap to view</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                      {visit.photos.map((p, pIdx) => (
                        <div
                          key={p.id || pIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedPhoto({
                              ...p,
                              customerName: visit.customerName,
                              companyName: visit.companyName,
                            });
                          }}
                          className="relative shrink-0 group cursor-pointer"
                        >
                          <img
                            src={p.dataUrl}
                            alt={p.caption || `Photo ${pIdx + 1}`}
                            className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-700/80 group-hover:border-emerald-400 group-hover:scale-105 transition shadow-sm"
                          />
                          {p.caption && (
                            <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-slate-200 px-1 py-0.2 truncate rounded-b-xl text-center">
                              {p.caption}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
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

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL (PORTAL) */}
      {zoomedPhoto &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setZoomedPhoto(null);
            }}
          >
            <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {zoomedPhoto.caption || 'Customer Visit Photo'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {zoomedPhoto.companyName || zoomedPhoto.customerName}
                      {zoomedPhoto.capturedAt && ` • ${zoomedPhoto.capturedAt}`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setZoomedPhoto(null)}
                  className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[72vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
                <img
                  src={zoomedPhoto.dataUrl}
                  alt={zoomedPhoto.caption || 'Visit Photo'}
                  className="max-h-[72vh] w-auto max-w-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {zoomedPhoto.caption ? `Caption: ${zoomedPhoto.caption}` : 'No custom caption provided'}
                </span>
                <button
                  type="button"
                  onClick={() => setZoomedPhoto(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
