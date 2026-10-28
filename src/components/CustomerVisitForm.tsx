import React, { useState, useEffect } from 'react';
import {
  Send,
  Building,
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  Flame,
  FileCheck,
  Package,
  Layers,
  Map,
  FileBadge,
  Navigation,
  ExternalLink,
  Loader2,
  Crosshair,
  Check,
  Users,
  Plus,
  Trash2,
  Briefcase,
  FileText,
  MessageCircle,
} from 'lucide-react';
import {
  CustomerVisit,
  CustomerType,
  LeadStatus,
  PISentStatus,
  AdditionalContact,
  ConversationLog,
  OtherOpinionCard,
} from '../types/customerVisit';
import {
  INDIAN_STATES,
  POPULAR_DISTRICTS,
  CUSTOMER_TYPES,
  LEAD_STATUS_OPTIONS,
  UPVC_BRANDS,
  UPVC_SERIES_OPTIONS,
  UPVC_COMPETITOR_BRANDS,
  POPULAR_MULTI_BRAND_PRESETS,
  COMMON_DESIGNATIONS,
  ADDITIONAL_CONTACT_ROLES,
} from '../data/indiaLocations';


interface CustomerVisitFormProps {
  onSubmitVisit: (visit: CustomerVisit) => void;
  defaultExecutiveName: string;
}

export const CustomerVisitForm: React.FC<CustomerVisitFormProps> = ({
  onSubmitVisit,
  defaultExecutiveName,
}) => {
  const [salesExecutiveName, setSalesExecutiveName] = useState(defaultExecutiveName);
  const [customerVisitDate, setCustomerVisitDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [customerName, setCustomerName] = useState('');
  const [contactDesignation, setContactDesignation] = useState('Owner / Proprietor');
  const [mobileNumber, setMobileNumber] = useState('');
  const [additionalContacts, setAdditionalContacts] = useState<AdditionalContact[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Fabricator');
  const [state, setState] = useState('Gujarat');
  const [district, setDistrict] = useState('Ahmedabad');
  const [city, setCity] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const handleAddAdditionalContact = () => {
    setAdditionalContacts((prev) => [
      ...prev,
      {
        id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        designation: 'Workshop Supervisor',
        mobileNumber: '',
        notes: '',
      },
    ]);
  };

  const handleUpdateAdditionalContact = (
    id: string,
    field: keyof AdditionalContact,
    value: string
  ) => {
    setAdditionalContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveAdditionalContact = (id: string) => {
    setAdditionalContacts((prev) => prev.filter((c) => c.id !== id));
  };


  // GPS Location Tracking
  const [gpsLocationLink, setGpsLocationLink] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  // Auto detect current GPS Location on mount (entry time)
  useEffect(() => {
    captureGpsLocation();
  }, []);

  // Brands: S CRAFT, SMART, OTHERS
  const [brand, setBrand] = useState<'S CRAFT' | 'SMART' | 'OTHERS'>('S CRAFT');
  const [customBrand, setCustomBrand] = useState('');

  // Multi-brand selection: fabricators often use 3 to 5 brands simultaneously
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [customBrandInput, setCustomBrandInput] = useState('');

  const toggleBrand = (b: string) => {
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const addCustomBrand = () => {
    const trimmed = customBrandInput.trim();
    if (trimmed && !selectedBrands.includes(trimmed)) {
      setSelectedBrands((prev) => [...prev, trimmed]);
      setCustomBrandInput('');
    }
  };

  const removeBrand = (b: string) => {
    setSelectedBrands((prev) => prev.filter((item) => item !== b));
  };

  const applyPreset = (presetBrands: string[]) => {
    setSelectedBrands(presetBrands);
  };

  const [quantityPerMonth, setQuantityPerMonth] = useState('');
  const [piSent, setPiSent] = useState<PISentStatus>('No');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('Hot');
  const [followUpDate, setFollowUpDate] = useState('');
  const [visitRemarks, setVisitRemarks] = useState('');

  // Conversation Dialogue Logger & Other Opinion Cards
  const [conversationLogs, setConversationLogs] = useState<ConversationLog[]>([]);
  const [otherOpinionCards, setOtherOpinionCards] = useState<OtherOpinionCard[]>([]);

  const handleAddConversationLog = () => {
    setConversationLogs((prev) => [
      ...prev,
      {
        id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        speakerName: customerName || 'Customer / Fabricator',
        speakerRole: 'Fabricator',
        message: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleUpdateConversationLog = (id: string, field: keyof ConversationLog, value: string) => {
    setConversationLogs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveConversationLog = (id: string) => {
    setConversationLogs((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddOtherOpinionCard = () => {
    setOtherOpinionCards((prev) => [
      ...prev,
      {
        id: `opinion-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Competitor / Market Insight',
        content: '',
      },
    ]);
  };

  const handleUpdateOtherOpinionCard = (id: string, field: 'title' | 'content', value: string) => {
    setOtherOpinionCards((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  const handleRemoveOtherOpinionCard = (id: string) => {
    setOtherOpinionCards((prev) => prev.filter((o) => o.id !== id));
  };

  const [formError, setFormError] = useState<string | null>(null);

  // Auto detect current GPS Location
  const captureGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatusMsg('Geolocation is not supported by your browser or device.');
      return;
    }

    setIsDetectingGps(true);
    setGpsStatusMsg('Acquiring satellite GPS coordinates from your device...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setLatitude(lat);
        setLongitude(lng);
        setLocationAccuracy(acc);

        const mapsLink = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        setGpsLocationLink(mapsLink);
        setGpsStatusMsg(`✓ Live GPS Tagged: ${lat.toFixed(6)}, ${lng.toFixed(6)} (Accuracy ±${acc}m)`);
        setIsDetectingGps(false);

        // Try reverse geocoding to auto-fill city or state if empty
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const detectedCity = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
            const detectedState = addr.state || '';
            if (detectedCity && !city) {
              setCity(detectedCity);
            }
            if (detectedState && INDIAN_STATES.includes(detectedState)) {
              handleStateChange(detectedState);
            }
          }
        } catch {
          // Reverse geocode is best-effort
        }
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsStatusMsg(
          `Unable to fetch GPS: ${err.message}. You can manually paste a Google Maps location link below.`
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Handle State Change to update default district
  const handleStateChange = (newState: string) => {
    setState(newState);
    const districts = POPULAR_DISTRICTS[newState];
    if (districts && districts.length > 0) {
      setDistrict(districts[0]);
    } else {
      setDistrict('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !mobileNumber.trim()) {
      setFormError('Please enter both Customer Name and Mobile Number before submitting.');
      return;
    }
    setFormError(null);

    const effectiveBrand = brand === 'OTHERS' ? customBrand.trim() || 'OTHERS' : brand;

    const newVisit: CustomerVisit = {
      id: `scraft-upvc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      salesExecutiveName: salesExecutiveName.trim() || 'Raviraja uPVC Sales Executive',
      customerVisitDate,
      customerName: customerName.trim(),
      contactDesignation: contactDesignation.trim() || 'Owner / Proprietor',
      mobileNumber: mobileNumber.trim(),
      additionalContacts: additionalContacts
        .filter((c) => c.name.trim() || c.mobileNumber.trim())
        .map((c) => ({
          ...c,
          name: c.name.trim(),
          designation: c.designation.trim() || 'Workshop Supervisor',
          mobileNumber: c.mobileNumber.trim(),
          notes: c.notes?.trim() || undefined,
        })),
      companyName: companyName.trim() || customerName.trim(),
      gstNumber: gstNumber.trim().toUpperCase() || undefined,
      customerType,
      state,
      district: district.trim() || state,
      city: city.trim() || district || state,
      customerAddress: customerAddress.trim(),

      // GPS Tag
      gpsLocationLink: gpsLocationLink.trim() || undefined,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      locationAccuracy: locationAccuracy ?? undefined,
      gpsCapturedAt: gpsLocationLink ? new Date().toISOString() : undefined,

      // Brand
      brand: effectiveBrand,
      interestedBrand: effectiveBrand,

      currentBrand:
        selectedBrands.length > 0
          ? selectedBrands.join(', ')
          : 'Local / Unspecified Extruder',
      currentBrands: selectedBrands.length > 0 ? selectedBrands : undefined,
      quantityPerMonth: quantityPerMonth.trim() || 'Pending Estimation',
      piSent,
      leadStatus,
      followUpDate,
      visitRemarks: visitRemarks.trim(),
      conversationLogs:
        conversationLogs.filter((c) => c.message.trim()).length > 0
          ? conversationLogs.map((c) => ({ ...c, message: c.message.trim() }))
          : undefined,
      otherOpinionCards:
        otherOpinionCards.filter((o) => o.content.trim()).length > 0
          ? otherOpinionCards.map((o) => ({
              ...o,
              title: o.title.trim() || 'Custom Opinion',
              content: o.content.trim(),
            }))
          : undefined,
      createdAt: Date.now(),
    };

    onSubmitVisit(newVisit);

    // Reset customer-specific fields for next visit entry
    setCustomerName('');
    setContactDesignation('Owner / Proprietor');
    setMobileNumber('');
    setAdditionalContacts([]);
    setCompanyName('');
    setGstNumber('');
    setCity('');
    setCustomerAddress('');
    setGpsLocationLink('');
    setLatitude(null);
    setLongitude(null);
    setLocationAccuracy(null);
    setGpsStatusMsg(null);
    setBrand('S CRAFT');
    setCustomBrand('');
    setSelectedBrands([]);
    setCustomBrandInput('');
    setQuantityPerMonth('');
    setVisitRemarks('');
    setFollowUpDate('');
    setPiSent('No');
    setConversationLogs([]);
    setOtherOpinionCards([]);
  };

  const districtList = POPULAR_DISTRICTS[state] || [];

  return (
    <div className="space-y-4 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-950/60 via-blue-950/40 to-slate-900 border border-sky-800/40 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-sky-400 tracking-wider uppercase">
            Official All-India Sales Entry
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300">
            uPVC PROFILES
          </span>
        </div>
        <h2 className="text-lg font-black text-white">SCRAFT uPVC Profiles Visit Form</h2>
        <p className="text-xs text-slate-300 mt-0.5">
          Raviraja Industries Private Limited • Field visit entry for Window & Door Fabricators
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Executive & Visit Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>1. Executive & Visit Schedule</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Sales Executive Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={salesExecutiveName}
                onChange={(e) => setSalesExecutiveName(e.target.value)}
                placeholder="Executive Full Name"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Customer Visit Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={customerVisitDate}
                onChange={(e) => setCustomerVisitDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Customer & Company Profile */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Customer & Fabricator Enterprise Profile</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Users className="w-3 h-3 text-sky-400" />
              Multi-Contact Unit Support
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Customer / Owner Contact Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rajeshbhai / Suresh Sharma"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>
            </div>

            {/* Designation / Role for Owner/Customer */}
            <div>
              <label className="text-slate-400 font-semibold flex items-center justify-between mb-1">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-sky-400" />
                  <span>Customer / Owner Designation</span>
                </span>
                <span className="text-[10px] text-slate-500">e.g. Owner, MD, Partner</span>
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  list="common-designations-list"
                  value={contactDesignation}
                  onChange={(e) => setContactDesignation(e.target.value)}
                  placeholder="Owner / Proprietor, Managing Director, Partner..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                />
                <datalist id="common-designations-list">
                  {COMMON_DESIGNATIONS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Customer Mobile Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98250 00000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Company / Fabricator Firm Name
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Royal Window Systems / Shreeji Fenestrations"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>
            </div>

            {/* GST Number */}
            <div>
              <label className="text-slate-400 font-semibold flex items-center justify-between mb-1">
                <span className="flex items-center gap-1">
                  <FileBadge className="w-3 h-3 text-sky-400" />
                  <span>GST No. (15-Digit GSTIN)</span>
                </span>
                <span className="text-[10px] text-slate-500 uppercase">Optional</span>
              </label>
              <div className="relative">
                <FileBadge className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. 24AAAAA0000A1Z5"
                  maxLength={15}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono tracking-wider uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Customer Type</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              >
                {CUSTOMER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-Section: Additional Unit Personnel (Directors, Supervisors, Partners) */}
          <div className="pt-3 border-t border-slate-800/90 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>Additional Unit Key Personnel (Directors & Supervisors)</span>
                  {additionalContacts.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {additionalContacts.length} Added
                    </span>
                  )}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Add 2 or more partners, directors, or workshop supervisors who run the unit
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddAdditionalContact}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-sm active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Director / Supervisor</span>
              </button>
            </div>

            {additionalContacts.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>
                  Unit run by multiple people? Click <strong className="text-sky-300">+ Add Director / Supervisor</strong> to record workshop heads, co-directors, or procurement managers.
                </span>
                <button
                  type="button"
                  onClick={handleAddAdditionalContact}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 underline shrink-0"
                >
                  + Add Person
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {additionalContacts.map((contact, index) => (
                  <div
                    key={contact.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700/80 space-y-2.5 transition"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 text-[10px] flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span>Key Personnel #{index + 1}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalContact(contact.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs flex items-center gap-1"
                        title="Remove this contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) =>
                              handleUpdateAdditionalContact(contact.id, 'name', e.target.value)
                            }
                            placeholder="e.g. Ramesh Patel / Dinesh Shah"
                            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">
                          Role / Designation
                        </label>
                        <select
                          value={contact.designation}
                          onChange={(e) =>
                            handleUpdateAdditionalContact(contact.id, 'designation', e.target.value)
                          }
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                        >
                          {ADDITIONAL_CONTACT_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">
                          Mobile Number (Direct Line)
                        </label>
                        <div className="relative">
                          <Phone className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5" />
                          <input
                            type="tel"
                            value={contact.mobileNumber}
                            onChange={(e) =>
                              handleUpdateAdditionalContact(contact.id, 'mobileNumber', e.target.value)
                            }
                            placeholder="+91 98250 00000"
                            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">
                          Responsibility / Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={contact.notes || ''}
                          onChange={(e) =>
                            handleUpdateAdditionalContact(contact.id, 'notes', e.target.value)
                          }
                          placeholder="e.g. Workshop supervisor for 3-track sliding, cutting"
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Geographic Location & Live GPS Tag Link */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>3. Geographic Location (All-India) & GPS Tag</span>
            </h3>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-sky-400" />
              Auto-links location to Excel & PDF exports
            </span>
          </div>

          {/* India Map & GPS Locator Visual Card */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 border border-indigo-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs shadow-inner">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300">
                <Map className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="font-bold text-white block">All-India GPS Map Locator</span>
                <span className="text-[11px] text-slate-300">
                  Auto-detecting location for <strong className="text-sky-300">{state}</strong> ({district || 'District'}) on entry.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Auto-GPS Active
            </span>
          </div>

          {/* GPS Auto-detect Button and Live Link Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950/40 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={captureGpsLocation}
                disabled={isDetectingGps}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${
                  isDetectingGps
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                    : gpsLocationLink
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                    : 'bg-gradient-to-r from-rose-600 to-sky-600 hover:from-rose-500 hover:to-sky-500 text-white shadow-rose-900/30'
                }`}
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    <span>Acquiring Device GPS Coordinates...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4 text-white animate-pulse" />
                    <span>
                      {gpsLocationLink ? 'Re-Capture Current GPS Location' : '📍 Auto-Detect My Current GPS Location Tag'}
                    </span>
                  </>
                )}
              </button>

              {gpsLocationLink && (
                <a
                  href={gpsLocationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-semibold transition"
                  title="Verify customer visit coordinates on Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Verify on Google Maps</span>
                </a>
              )}
            </div>

            {/* GPS Status Message & Verification */}
            {gpsStatusMsg && (
              <div
                className={`text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                  gpsLocationLink
                    ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                    : 'bg-amber-950/60 border border-amber-800/60 text-amber-300'
                }`}
              >
                {gpsLocationLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                )}
                <span className="font-mono text-xs break-all">{gpsStatusMsg}</span>
              </div>
            )}

            {/* Quick Hub Selector (Bypasses Browser Permissions Policy Restrictions) */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                ⚡ Quick-Tag Major Indian Industrial Hubs (Instant GPS Pin):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Surat', state: 'Gujarat', district: 'Surat', lat: 21.1702, lng: 72.8311 },
                  { name: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
                  { name: 'Rajkot', state: 'Gujarat', district: 'Rajkot', lat: 22.3039, lng: 70.8022 },
                  { name: 'Vadodara', state: 'Gujarat', district: 'Vadodara', lat: 22.3072, lng: 73.1812 },
                  { name: 'Mumbai', state: 'Maharashtra', district: 'Mumbai', lat: 19.0760, lng: 72.8777 },
                  { name: 'Pune', state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567 },
                  { name: 'New Delhi', state: 'Delhi', district: 'New Delhi', lat: 28.6139, lng: 77.2090 },
                  { name: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946 },
                  { name: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707 },
                  { name: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
                ].map((hub) => (
                  <button
                    key={hub.name}
                    type="button"
                    onClick={() => {
                      setState(hub.state);
                      setDistrict(hub.district);
                      setCity(hub.name);
                      setLatitude(hub.lat);
                      setLongitude(hub.lng);
                      const link = `https://www.google.com/maps?q=${hub.lat.toFixed(6)},${hub.lng.toFixed(6)}`;
                      setGpsLocationLink(link);
                      setGpsStatusMsg(`✓ Quick-Tagged Hub: ${hub.name}, ${hub.state} (${hub.lat}, ${hub.lng})`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-900/60 border border-slate-700 hover:border-sky-500/50 text-[11px] font-semibold text-slate-300 hover:text-white transition flex items-center gap-1 shadow-sm"
                  >
                    <MapPin className="w-3 h-3 text-sky-400" />
                    <span>{hub.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Google Maps Link Input for viewing or manual paste */}
            <div className="text-xs pt-1">
              <label className="text-slate-400 font-semibold block mb-1 flex items-center justify-between">
                <span>Google Maps GPS Tag Link (Saved to Firestore, Excel & PDF)</span>
                {latitude && longitude && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                  </span>
                )}
              </label>
              <div className="relative">
                <Navigation className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={gpsLocationLink}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGpsLocationLink(val);
                    // Parse coordinates if standard maps url
                    const match = val.match(/q=([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)/);
                    if (match) {
                      setLatitude(parseFloat(match[1]));
                      setLongitude(parseFloat(match[2]));
                    }
                  }}
                  placeholder="https://www.google.com/maps?q=latitude,longitude"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">State</label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">District</label>
              {districtList.length > 0 ? (
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                >
                  {districtList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Enter District"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              )}
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">City / Town</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Morbi, Vapi, Bhiwandi"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-slate-400 font-semibold block mb-1">Customer Address / Landmark</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="GIDC / Industrial Area, Street, Unit No."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Section 4: uPVC Profile Brand & Order Requirements */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
          <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>4. uPVC Profile Brand & Order Requirements</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              BRAND SELECTION
            </span>
          </div>

          {/* BRANDS SELECTION: S CRAFT, SMART, OTHERS */}
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-400 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-200 font-bold">Brand Selection</span>
                <span className="text-rose-400">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Choose Primary Brand: S CRAFT, SMART, or OTHERS
              </span>
            </label>

            {/* Segmented Brand Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBrand('S CRAFT')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-2 ${
                  brand === 'S CRAFT'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border-sky-400 shadow-md shadow-sky-900/40 ring-2 ring-sky-500/40'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <span>S CRAFT</span>
                {brand === 'S CRAFT' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => setBrand('SMART')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-2 ${
                  brand === 'SMART'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-900/40 ring-2 ring-emerald-500/40'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <span>SMART</span>
                {brand === 'SMART' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => setBrand('OTHERS')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-2 ${
                  brand === 'OTHERS'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-400 shadow-md shadow-amber-900/40 ring-2 ring-amber-500/40'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <span>OTHERS</span>
                {brand === 'OTHERS' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>

            {/* If OTHERS is chosen, provide specific brand name input with datalist */}
            {brand === 'OTHERS' && (
              <div className="pt-2 animate-fadeIn">
                <label className="text-amber-400 font-semibold block mb-1">
                  Specify Other Brand Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  list="other-brands-list"
                  required
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="Type other brand name (e.g. Prominance, Kommerling, Veka, Aluplast)"
                  className="w-full bg-slate-800 border border-amber-600/60 rounded-xl px-3 py-2 text-xs text-amber-200 focus:outline-none focus:border-amber-400 font-medium"
                />
                <datalist id="other-brands-list">
                  {UPVC_COMPETITOR_BRANDS.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>
            )}
          </div>

          {/* Multi-Brand Switcher & Selector */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <span>Current uPVC Brand(s) Used by Fabricator</span>
                  </label>
                  {selectedBrands.length >= 3 && selectedBrands.length <= 5 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{selectedBrands.length} Brands Active (Multi-Brand Unit)</span>
                    </span>
                  ) : selectedBrands.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {selectedBrands.length} Brand{selectedBrands.length > 1 ? 's' : ''} Selected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/50">
                      Select 3 to 5 brands
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Fabricators in India typically use 3 to 5 profile brands to cater to different budget tiers. Tap the switches below to select all brands currently fabricated.
                </p>
              </div>

              {/* Quick Presets for 3 to 5 Brands */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 font-medium">Quick Presets:</span>
                {POPULAR_MULTI_BRAND_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset.brands)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-sky-950 text-slate-300 hover:text-sky-300 border border-slate-700 hover:border-sky-700 transition"
                    title={`Apply: ${preset.brands.join(', ')}`}
                  >
                    {preset.name}
                  </button>
                ))}
                {selectedBrands.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedBrands([])}
                    className="text-[10px] text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Selected Brands Active Pills Area */}
            {selectedBrands.length > 0 ? (
              <div className="bg-slate-900/90 rounded-xl p-3 border border-sky-900/40 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
                  <span className="flex items-center gap-1.5 text-sky-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Selected Competitor Brands ({selectedBrands.length}):</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Click &times; on any chip to remove</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBrands.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-950/90 text-sky-200 border border-sky-500/50 shadow-sm"
                    >
                      <Check className="w-3 h-3 text-sky-400 shrink-0" />
                      <span>{b}</span>
                      <button
                        type="button"
                        onClick={() => removeBrand(b)}
                        className="text-slate-400 hover:text-rose-300 ml-1 rounded p-0.5 hover:bg-rose-500/20 transition"
                        title={`Remove ${b}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/40 border border-dashed border-slate-700/80 rounded-xl p-3 text-center text-xs text-slate-400">
                No competitor brands selected. Tap brand switches below (e.g. Kommerling, Prominance, Veka) or type custom brand name.
              </div>
            )}

            {/* Clickable Brand Switches (Multi-Select Pills) */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Switch Brand On / Off (Tap to select multiple brands):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {UPVC_COMPETITOR_BRANDS.map((comp) => {
                  const isSelected = selectedBrands.includes(comp);
                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => toggleBrand(comp)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border-sky-400 shadow-sm shadow-sky-900/30 font-bold ring-1 ring-sky-400'
                          : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3 h-3 text-white shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                      )}
                      <span>{comp}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom / Other Brand */}
            <div className="pt-1">
              <label className="text-slate-400 font-semibold block mb-1 text-[11px]">
                + Add Other Brand / Local Extruder Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBrandInput}
                  onChange={(e) => setCustomBrandInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomBrand();
                    }
                  }}
                  placeholder="Type other brand (e.g. Plastone, Koemmerling, Torfenster) and press Add"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={addCustomBrand}
                  disabled={!customBrandInput.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 disabled:hover:bg-sky-600 transition flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Brand</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs pt-1">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Estimated Monthly Requirement (MT / Month or Bars / Month)
              </label>
              <input
                type="text"
                value={quantityPerMonth}
                onChange={(e) => setQuantityPerMonth(e.target.value)}
                placeholder="e.g. 5 MT / Month (800 Bars), 12 Tons / Month"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Commercial Status & Sales Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>5. Commercial Status & Sales Pipeline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Proforma Invoice (PI) Sent?
              </label>
              <select
                value={piSent}
                onChange={(e) => setPiSent(e.target.value as PISentStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold"
              >
                <option value="No">No - Pending Discussion</option>
                <option value="Yes">Yes - PI Shared with Customer</option>
                <option value="Under Preparation">Under Preparation</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Lead Priority Status</label>
              <select
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-bold"
              >
                {LEAD_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-slate-400 font-semibold block mb-1">
                Executive Visit Remarks / Discussion Highlights
              </label>
              <textarea
                rows={3}
                value={visitRemarks}
                onChange={(e) => setVisitRemarks(e.target.value)}
                placeholder="Details of factory visit: profile sample shown, price negotiations, competitor feedback, workshop machinery status..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Conversation Dialogue Logger (Sales Person vs Fabricator / Dealer / Distributor) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>6. Conversation Dialogue (Sales Person & Fabricator / Dealer / Distributor)</span>
            </h3>
            <button
              type="button"
              onClick={handleAddConversationLog}
              className="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dialogue Turn</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Log discussion Q&A between Sales Executive and Customer / Fabricator / Dealer / Distributor during the visit.
          </p>

          {conversationLogs.length > 0 ? (
            <div className="space-y-3">
              {conversationLogs.map((log, idx) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 border border-sky-800 px-2 py-0.5 rounded">
                        Turn #{idx + 1}
                      </span>
                      <select
                        value={log.speakerRole}
                        onChange={(e) => handleUpdateConversationLog(log.id, 'speakerRole', e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-semibold text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="Sales Executive">Sales Executive</option>
                        <option value="Fabricator">Fabricator</option>
                        <option value="Dealer">Dealer</option>
                        <option value="Distributor">Distributor</option>
                        <option value="Director">Director / Partner</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="text"
                        value={log.speakerName}
                        onChange={(e) => handleUpdateConversationLog(log.id, 'speakerName', e.target.value)}
                        placeholder="Speaker Name"
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500 w-36"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveConversationLog(log.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                      title="Remove dialogue turn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      value={log.message}
                      onChange={(e) => handleUpdateConversationLog(log.id, 'message', e.target.value)}
                      placeholder="Write conversation details (e.g. Sales Executive explained 3-track sliding weight; Fabricator asked about corner bracket price and delivery timeline)..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 placeholder-slate-500 resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-dashed border-slate-700/60 rounded-xl p-3 text-center text-xs text-slate-400">
              No conversation dialogue logged yet. Click "Add Dialogue Turn" to record Q&A or discussion points.
            </div>
          )}
        </div>

        {/* Section 7: Other Opinion / Custom Remarks Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>7. Other Opinion / Custom Remarks Cards</span>
            </h3>
            <button
              type="button"
              onClick={handleAddOtherOpinionCard}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Card</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Add extra opinion cards for competitor pricing analysis, machinery status, fabricator expectations, or special notes.
          </p>

          {otherOpinionCards.length > 0 ? (
            <div className="space-y-3">
              {otherOpinionCards.map((card, idx) => (
                <div key={card.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => handleUpdateOtherOpinionCard(card.id, 'title', e.target.value)}
                      placeholder="Card Title (e.g. Competitor Price Feedback, Machinery Check)"
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOtherOpinionCard(card.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                      title="Remove custom card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      value={card.content}
                      onChange={(e) => handleUpdateOtherOpinionCard(card.id, 'content', e.target.value)}
                      placeholder="Write custom opinion or analysis details here..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-dashed border-slate-700/60 rounded-xl p-3 text-center text-xs text-slate-400">
              No custom opinion cards added. Click "Add Custom Card" to record additional structured notes.
            </div>
          )}
        </div>

        {formError && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl">
            {formError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-900/40 transition active:scale-[0.99]"
        >
          <Send className="w-4 h-4" />
          <span>Save & Log uPVC Customer Visit Entry</span>
        </button>
      </form>
    </div>
  );
};
