import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  CustomerVisit,
  CustomerType,
  LeadStatus,
  PISentStatus,
} from '../types/customerVisit';
import {
  INDIAN_STATES,
  POPULAR_DISTRICTS,
  CUSTOMER_TYPES,
  LEAD_STATUS_OPTIONS,
  UPVC_BRANDS,
  UPVC_SERIES_OPTIONS,
  UPVC_COMPETITOR_BRANDS,
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
  const [mobileNumber, setMobileNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Fabricator');
  const [state, setState] = useState('Gujarat');
  const [district, setDistrict] = useState('Ahmedabad');
  const [city, setCity] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // GPS Location Tracking
  const [gpsLocationLink, setGpsLocationLink] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  // Brands: S CRAFT, SMART, OTHERS
  const [brand, setBrand] = useState<'S CRAFT' | 'SMART' | 'OTHERS'>('S CRAFT');
  const [customBrand, setCustomBrand] = useState('');
  // Series: 60mm Casement, 2.5 Track Sliding, 3 Track Sliding, etc.
  const [interestedSeries, setInterestedSeries] = useState(UPVC_SERIES_OPTIONS[0]);

  const [currentBrand, setCurrentBrand] = useState('');
  const [quantityPerMonth, setQuantityPerMonth] = useState('');
  const [piSent, setPiSent] = useState<PISentStatus>('No');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('Hot');
  const [followUpDate, setFollowUpDate] = useState('');
  const [visitRemarks, setVisitRemarks] = useState('');
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
    const combinedBrandSeries = `${effectiveBrand} - ${interestedSeries}`;

    const newVisit: CustomerVisit = {
      id: `scraft-upvc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      salesExecutiveName: salesExecutiveName.trim() || 'Raviraja uPVC Sales Executive',
      customerVisitDate,
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
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

      // Brand & Series distinction
      brand: effectiveBrand,
      interestedSeries,
      interestedBrand: combinedBrandSeries,

      currentBrand: currentBrand.trim() || 'Local/Competitor',
      quantityPerMonth: quantityPerMonth.trim() || 'Pending Estimation',
      piSent,
      leadStatus,
      followUpDate,
      visitRemarks: visitRemarks.trim(),
      createdAt: Date.now(),
    };

    onSubmitVisit(newVisit);

    // Reset customer-specific fields for next visit entry
    setCustomerName('');
    setMobileNumber('');
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
    setInterestedSeries(UPVC_SERIES_OPTIONS[0]);
    setCurrentBrand('');
    setQuantityPerMonth('');
    setVisitRemarks('');
    setFollowUpDate('');
    setPiSent('No');
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Customer & Fabricator Enterprise Profile</span>
          </h3>

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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
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

            <div className="sm:col-span-2">
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

        {/* Section 4: uPVC Profile Brand, Series & Order Requirements */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
          <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>4. uPVC Profile Brand, Series & Order Requirements</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              BRANDS & SERIES SELECTION
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

          {/* SERIES SELECTION: 60mm Casement, 2.5 Track Sliding, 3 Track Sliding, etc. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                uPVC Profile Series <span className="text-rose-400">*</span>
              </label>
              <select
                value={interestedSeries}
                onChange={(e) => setInterestedSeries(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold text-sky-300"
              >
                {UPVC_SERIES_OPTIONS.map((series) => (
                  <option key={series} value={series}>
                    {series}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Current uPVC Brand Used by Fabricator
              </label>
              <input
                type="text"
                list="competitor-list"
                value={currentBrand}
                onChange={(e) => setCurrentBrand(e.target.value)}
                placeholder="e.g. Kommerling, Prominance, Veka, Aluplast"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <datalist id="competitor-list">
                {UPVC_COMPETITOR_BRANDS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="sm:col-span-2">
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
