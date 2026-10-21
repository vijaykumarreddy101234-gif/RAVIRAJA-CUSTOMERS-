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
  Palette,
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
  DEFAULT_INTERESTED_BRANDS,
  UPVC_COMPETITOR_BRANDS,
  UPVC_COLOR_FINISHES,
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
  const [customerType, setCustomerType] = useState<CustomerType>('Fabricator');
  const [state, setState] = useState('Gujarat');
  const [district, setDistrict] = useState('Ahmedabad');
  const [city, setCity] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [interestedBrand, setInterestedBrand] = useState('SCRAFT 60mm Casement Series (Windows & Doors)');
  const [profileColor, setProfileColor] = useState('Classic White');
  const [currentBrand, setCurrentBrand] = useState('');
  const [quantityPerMonth, setQuantityPerMonth] = useState('');
  const [piSent, setPiSent] = useState<PISentStatus>('No');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('Hot');
  const [followUpDate, setFollowUpDate] = useState('');
  const [visitRemarks, setVisitRemarks] = useState('');

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
      alert('Please fill in Customer Name and Mobile Number.');
      return;
    }

    const newVisit: CustomerVisit = {
      id: `scraft-upvc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      salesExecutiveName: salesExecutiveName.trim() || 'Raviraja uPVC Sales Executive',
      customerVisitDate,
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      companyName: companyName.trim() || customerName.trim(),
      customerType,
      state,
      district: district.trim() || state,
      city: city.trim() || district || state,
      customerAddress: customerAddress.trim(),
      interestedBrand,
      currentBrand: currentBrand.trim() || 'Local/Competitor',
      quantityPerMonth: quantityPerMonth.trim() || 'Pending Estimation',
      piSent,
      leadStatus,
      followUpDate,
      visitRemarks: visitRemarks.trim(),
      profileColor: profileColor as any,
      createdAt: Date.now(),
    };

    onSubmitVisit(newVisit);

    // Reset customer-specific fields for next visit entry
    setCustomerName('');
    setMobileNumber('');
    setCompanyName('');
    setCity('');
    setCustomerAddress('');
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

        {/* Section 2: Customer & Company Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <Building className="w-3.5 h-3.5 text-indigo-400" />
            <span>2. Customer & Company Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Customer Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Decision Maker / Contact Person"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Mobile Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Company / Firm Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Business / Enterprise Name"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Customer Type</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
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

        {/* Section 3: Geographic Location (All-India) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>3. Geographic Location (All-India)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">State</label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
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
              placeholder="GIDC / Industrial Area, Street, Pincode"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Section 4: Brand & Commercial Requirements for uPVC Profiles */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>4. SCRAFT uPVC Profile Series & Order Requirements</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Interested uPVC Series</label>
              <select
                value={interestedBrand}
                onChange={(e) => setInterestedBrand(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold text-sky-300"
              >
                {DEFAULT_INTERESTED_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Profile Color / Lamination</label>
              <select
                value={profileColor}
                onChange={(e) => setProfileColor(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              >
                {UPVC_COLOR_FINISHES.map((f) => (
                  <option key={f} value={f}>
                    {f}
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <datalist id="competitor-list">
                {UPVC_COMPETITOR_BRANDS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Quantity / Month (Volume)
              </label>
              <input
                type="text"
                value={quantityPerMonth}
                onChange={(e) => setQuantityPerMonth(e.target.value)}
                placeholder="e.g. 5 MT / Month, 1,000 Bars, 300 Windows"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Lead Status & Follow-up */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>5. Lead Status & Follow-up</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* PI Sent */}
            <div>
              <label className="text-slate-400 font-semibold block mb-1">PI Sent? (Proforma Invoice)</label>
              <select
                value={piSent}
                onChange={(e) => setPiSent(e.target.value as PISentStatus)}
                className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none ${
                  piSent === 'Yes'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="Yes">Yes (PI Dispatched)</option>
                <option value="No">No</option>
                <option value="Under Preparation">Under Preparation</option>
              </select>
            </div>

            {/* Lead Status */}
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Lead Status</label>
              <select
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none ${
                  leadStatus === 'Hot'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                    : leadStatus === 'Won / Closed'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="Hot">🔥 Hot Lead</option>
                <option value="Warm">⚡ Warm Lead</option>
                <option value="Cold">❄️ Cold Lead</option>
                <option value="Won / Closed">🏆 Won / Closed</option>
                <option value="Lost">❌ Lost</option>
              </select>
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>
          </div>

          {/* Visit Remarks */}
          <div className="text-xs">
            <label className="text-slate-400 font-semibold block mb-1">Visit Remarks / Meeting Notes</label>
            <textarea
              rows={3}
              value={visitRemarks}
              onChange={(e) => setVisitRemarks(e.target.value)}
              placeholder="Discussed sample testing, price per box, payment terms, competitor comparison..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>
        </div>

        {/* Big Prominent Submit Button matching sheet action */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-xl shadow-sky-950/50 flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          <span>SUBMIT CUSTOMER VISIT</span>
        </button>
      </form>
    </div>
  );
};
