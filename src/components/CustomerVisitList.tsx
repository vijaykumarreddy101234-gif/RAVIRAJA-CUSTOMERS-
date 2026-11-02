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
  Printer,
  Mail,
  Copy,
  Check,
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
  const [sharingVisit, setSharingVisit] = useState<CustomerVisit | null>(null);
  const [copiedShareModal, setCopiedShareModal] = useState(false);

  const formatVisitReportText = (v: CustomerVisit): string => {
    const brand =
      v.brand ||
      (v.interestedBrand?.includes('SMART')
        ? 'SMART'
        : v.interestedBrand?.includes('SCRAFT') || v.interestedBrand?.includes('S CRAFT')
        ? 'S CRAFT'
        : 'OTHERS');

    const hasPhotos = (v.photos && v.photos.length > 0) || v.visitingCardPhoto;

    return [
      `🏢 *RAVIRAJA INDUSTRIES - SCRAFT uPVC VISIT REPORT*`,
      `═══════════════════════════════════════════════`,
      `📋 *COMPANY & CUSTOMER DETAILS*`,
      `• Company / Firm: ${v.companyName || v.customerName}`,
      `• Customer / Owner: ${v.customerName} (${v.contactDesignation || 'Owner / Proprietor'})`,
      `• Mobile: ${v.mobileNumber}${v.whatsappNumber ? ` | WhatsApp: ${v.whatsappNumber}` : ''}`,
      `• Customer Type: ${v.customerType}`,
      v.gstNumber ? `• GSTIN: ${v.gstNumber}` : '',
      v.customerAddress ? `• Address: ${v.customerAddress}` : '',
      `• Location: ${v.city}, ${v.state}${v.pinCode ? ` - ${v.pinCode}` : ''}`,
      v.gpsLocationLink ? `• GPS Map: ${v.gpsLocationLink}` : '',
      ``,
      `📦 *PROFILE REQUIREMENTS & TONNAGE*`,
      `• Target Brand: ${brand}`,
      v.interestedSeries ? `• Interested Series: ${v.interestedSeries}` : `• Product: ${v.interestedBrand}`,
      `• Monthly Volume: ${v.quantityPerMonth || '5 MT / Month'}`,
      `• Currently Used Brands: ${v.currentBrands?.join(', ') || v.currentBrand || 'None'}`,
      ``,
      `🔥 *LEAD STATUS & FOLLOW-UP*`,
      `• Lead Stage: ${v.leadStatus}`,
      `• PI Status: ${v.piSent}`,
      `• Follow-up Date: ${v.followUpDate || 'None'}`,
      `• Executive: ${v.salesExecutiveName} (${v.customerVisitDate} ${v.customerVisitTime || ''})`,
      ``,
      `💬 *DISCUSSION REMARKS / OPINION*`,
      `"${v.visitRemarks || 'N/A'}"`,
      hasPhotos ? `\n📸 *ATTACHED VISIT MEDIA:* ${v.photos?.length || 0} Photos ${v.visitingCardPhoto ? '+ Visiting Card Stored' : ''}` : '',
      `═══════════════════════════════════════════════`,
      `_Official Record - Raviraja Industries CRM (ravirajaindustries@gmail.com)_`,
    ].filter(Boolean).join('\n');
  };

  const handleShareVisit = (v: CustomerVisit) => {
    setSharingVisit(v);
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

      {/* Simple, Non-Clumsy Filter Toolbar matching clean Excel design */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm space-y-2.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company, contact, city, mobile, brand..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
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

          {/* Clean Dropdown Selects */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Sales Executive Selector */}
            <select
              value={selectedExecutive}
              onChange={(e) => setSelectedExecutive(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-sky-500 outline-none cursor-pointer"
            >
              <option value="All">All Executives ({visits.length})</option>
              {uniqueExecutives.map((exec) => (
                <option key={exec} value={exec}>
                  {exec} ({visits.filter((v) => v.salesExecutiveName === exec).length})
                </option>
              ))}
            </select>

            {/* Stages / Status Selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-sky-500 outline-none cursor-pointer"
            >
              <option value="All">All Stages</option>
              <option value="Hot">🔥 Hot</option>
              <option value="Warm">⚡ Warm</option>
              <option value="Cold">❄️ Cold</option>
              <option value="Won / Closed">🏆 Won / Closed</option>
              <option value="Lost">Lost</option>
            </select>

            {/* Brand Selector */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-sky-500 outline-none cursor-pointer"
            >
              <option value="All">All Brands</option>
              <option value="S CRAFT">S CRAFT</option>
              <option value="SMART">SMART</option>
              <option value="OTHERS">OTHERS</option>
            </select>

            {/* Customer Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-sky-500 outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Fabricator">Fabricator</option>
              <option value="Dealer">Dealer</option>
              <option value="Distributor">Distributor</option>
              <option value="Builder">Builder</option>
              <option value="Wholesaler">Wholesaler</option>
              <option value="Direct OEM">Direct OEM</option>
            </select>

            {/* State Selector */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-2 focus:border-sky-500 outline-none cursor-pointer"
            >
              <option value="All">All States</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Showing Count */}
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap px-1">
              Showing {filteredVisits.length} of {visits.length}
            </span>

            {/* Reset All Filters Button */}
            {(selectedExecutive !== 'All' ||
              selectedStatus !== 'All' ||
              selectedBrand !== 'All' ||
              selectedType !== 'All' ||
              selectedState !== 'All' ||
              selectedPISent !== 'All' ||
              searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedExecutive('All');
                  setSelectedStatus('All');
                  setSelectedBrand('All');
                  setSelectedType('All');
                  setSelectedState('All');
                  setSelectedPISent('All');
                  setSearchTerm('');
                }}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold px-2.5 py-1.5 bg-sky-950/60 border border-sky-800/60 rounded-xl hover:underline cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>
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
                      className="px-2.5 py-2 rounded-xl bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
                      title="Share customer visit form with images"
                    >
                      <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">Share Form</span>
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

      {/* CUSTOMER VISIT DATA SHARE FORM MODAL (WITH IMAGES) */}
      {sharingVisit &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSharingVisit(null);
            }}
          >
            <div className="relative max-w-2xl w-full max-h-[92vh] flex flex-col bg-slate-900 border border-indigo-500/50 rounded-3xl overflow-hidden shadow-2xl">
              {/* Top Modal Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Customer Visit Data Form</span>
                      <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-950/90 border border-indigo-800/80 px-2 py-0.5 rounded-md">
                        Official Form View
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Complete visit report with photos ready to share or print
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSharingVisit(null)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body - Formatted Like an Official CRM Form */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                {/* Official Header Banner */}
                <div className="p-3.5 bg-gradient-to-r from-sky-950/70 via-slate-950 to-indigo-950/70 border border-sky-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-inner">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-sky-400 font-extrabold block">
                      RAVIRAJA INDUSTRIES • CRM
                    </span>
                    <h4 className="text-base font-black text-white">
                      {sharingVisit.companyName || sharingVisit.customerName}
                    </h4>
                    <span className="text-xs text-slate-300 font-medium">
                      {sharingVisit.customerType} • Visit #{sharingVisit.id.slice(-4)}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-mono text-cyan-300 block">
                      {sharingVisit.customerVisitDate} {sharingVisit.customerVisitTime || ''}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Dealt by: <strong className="text-white">{sharingVisit.salesExecutiveName}</strong>
                    </span>
                  </div>
                </div>

                {/* FORM GRID BOXES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* BOX 1: Owner & Contact Details */}
                  <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                      Customer & Owner Details
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Owner Name:</span>
                        <strong className="text-white">{sharingVisit.customerName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Designation:</span>
                        <span className="text-slate-200">{sharingVisit.contactDesignation || 'Owner / Proprietor'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mobile Number:</span>
                        <a href={`tel:${sharingVisit.mobileNumber}`} className="text-sky-400 font-mono font-bold hover:underline">
                          {sharingVisit.mobileNumber}
                        </a>
                      </div>
                      {sharingVisit.whatsappNumber && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">WhatsApp:</span>
                          <span className="text-emerald-400 font-mono">{sharingVisit.whatsappNumber}</span>
                        </div>
                      )}
                      {sharingVisit.gstNumber && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">GSTIN:</span>
                          <span className="text-amber-300 font-mono font-bold">{sharingVisit.gstNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOX 2: Location & GPS */}
                  <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                      Location & Geo Coordinates
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">City / Industrial Area:</span>
                        <strong className="text-white">{sharingVisit.city}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">State / Region:</span>
                        <span className="text-slate-200">{sharingVisit.state}</span>
                      </div>
                      {sharingVisit.customerAddress && (
                        <div>
                          <span className="text-slate-400 block text-[11px]">Address:</span>
                          <span className="text-slate-200 text-[11px] block">{sharingVisit.customerAddress}</span>
                        </div>
                      )}
                      {sharingVisit.gpsLocationLink && (
                        <div className="pt-1">
                          <a
                            href={sharingVisit.gpsLocationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-bold"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Open GPS Location on Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOX 3: Business & Brand Target */}
                  <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Profile Requirements & Volume
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Brand:</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                          {sharingVisit.brand || sharingVisit.interestedBrand}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly Volume:</span>
                        <strong className="text-white font-mono">{sharingVisit.quantityPerMonth || '5 MT / Month'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Currently Used Brands:</span>
                        <div className="flex flex-wrap gap-1">
                          {(sharingVisit.currentBrands || (sharingVisit.currentBrand ? [sharingVisit.currentBrand] : ['None'])).map((b, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOX 4: Lead Status & Deal */}
                  <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Lead Stage & Follow-Up
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Lead Status:</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {sharingVisit.leadStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">PI Sent:</span>
                        <span className="text-white font-bold">{sharingVisit.piSent}</span>
                      </div>
                      {sharingVisit.followUpDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Follow-up Due:</span>
                          <span className="text-amber-400 font-mono font-bold">{sharingVisit.followUpDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOX 5: Discussion Remarks & Opinion */}
                <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                    Discussion Remarks & Customer Opinion
                  </span>
                  <p className="text-slate-200 italic bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    "{sharingVisit.visitRemarks || 'No additional remarks provided'}"
                  </p>
                </div>

                {/* BOX 6: Attached Photos & Visiting Card (WITH ACTUAL IMAGES) */}
                <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Attached Photos & Visiting Card</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Total: {(sharingVisit.photos?.length || 0) + (sharingVisit.visitingCardPhoto ? 1 : 0)} items
                    </span>
                  </div>

                  {(!sharingVisit.photos || sharingVisit.photos.length === 0) && !sharingVisit.visitingCardPhoto ? (
                    <div className="p-4 text-center text-xs text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
                      No photos or visiting cards uploaded for this visit entry.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {sharingVisit.visitingCardPhoto && (
                        <div
                          className="relative rounded-xl overflow-hidden border border-sky-500/60 bg-black cursor-pointer group"
                          onClick={() => setZoomedPhoto({ id: 'card-photo', dataUrl: sharingVisit.visitingCardPhoto!, caption: 'Visiting Card', customerName: sharingVisit.customerName })}
                        >
                          <img
                            src={sharingVisit.visitingCardPhoto}
                            alt="Visiting Card"
                            className="w-full h-24 object-cover group-hover:scale-105 transition"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-sky-950/90 text-sky-200 text-[9px] text-center font-bold py-0.5">
                            Visiting Card
                          </span>
                        </div>
                      )}

                      {sharingVisit.photos?.map((photo, pIdx) => (
                        <div
                          key={photo.id || pIdx}
                          className="relative rounded-xl overflow-hidden border border-slate-700 bg-black cursor-pointer group"
                          onClick={() => setZoomedPhoto({ ...photo, customerName: sharingVisit.customerName, companyName: sharingVisit.companyName })}
                        >
                          <img
                            src={photo.dataUrl}
                            alt={photo.caption || `Visit photo ${pIdx + 1}`}
                            className="w-full h-24 object-cover group-hover:scale-105 transition"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[9px] text-center font-semibold py-0.5 truncate px-1">
                            {photo.caption || `Photo ${pIdx + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Sharing Action Buttons Bar */}
              <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Share to WhatsApp */}
                  <button
                    type="button"
                    onClick={() => {
                      const text = formatVisitReportText(sharingVisit);
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Share to WhatsApp</span>
                  </button>

                  {/* Email Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      const text = formatVisitReportText(sharingVisit);
                      const subject = `SCRAFT Visit Report: ${sharingVisit.companyName || sharingVisit.customerName} - ${sharingVisit.city}`;
                      window.location.href = `mailto:ravirajaindustries@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Admin (ravirajaindustries@gmail.com)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Form Details */}
                  <button
                    type="button"
                    onClick={async () => {
                      const text = formatVisitReportText(sharingVisit);
                      await navigator.clipboard.writeText(text);
                      setCopiedShareModal(true);
                      setTimeout(() => setCopiedShareModal(false), 3000);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedShareModal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShareModal ? '✓ Copied Form' : 'Copy Form'}</span>
                  </button>

                  {/* Print / Save PDF */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-sky-400" />
                    <span>Print Form</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

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
