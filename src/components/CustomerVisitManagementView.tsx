import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Clock,
  Flame,
  Building,
  User,
  MapPin,
  ExternalLink,
  Trash2,
  X,
  Navigation,
  Eye,
  Plus,
  CreditCard,
  Building2,
  Tag,
  Phone,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Percent,
  IndianRupee,
  HelpCircle,
  Send,
  UserCheck,
} from 'lucide-react';
import {
  CustomerVisit,
  CustomerType,
  LeadStatus,
  PISentStatus,
  AdditionalContact,
  VisitPhoto,
} from '../types/customerVisit';
import { AppUser } from '../services/firebaseAuth';
import { EmployeeService } from '../services/employeeService';
import {
  INDIAN_STATES,
  CUSTOMER_TYPES,
  LEAD_STATUS_OPTIONS,
  COMMON_DESIGNATIONS,
} from '../data/indiaLocations';

interface CustomerVisitManagementViewProps {
  onSubmitVisit: (visit: CustomerVisit) => void;
  onUpdateVisit?: (visit: CustomerVisit) => void;
  onSelectVisit?: (visit: CustomerVisit) => void;
  defaultExecutiveName: string;
  user?: AppUser | null;
  visits: CustomerVisit[];
}

const COMMON_OPINION_PRESETS = [
  'Pricing Opinion',
  'Quality & Chambers',
  'Competitor Credit Terms',
  'Delivery Time',
  'Sample Corner Request',
];

const POPULAR_COMPETITOR_BRANDS = [
  'Kommerling',
  'Prominance',
  'NCL VEKA',
  'Plastone',
  'Aluplast',
  'Deceuninck',
  'Simta Astrix',
];

/**
 * Compresses photos to clean, lightweight data URLs (max 800px, JPEG 0.75)
 * for permanent storage without quota or memory errors.
 */
function compressPhoto(file: File, maxDim = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to parse photo'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read photo'));
    reader.readAsDataURL(file);
  });
}

export const CustomerVisitManagementView: React.FC<CustomerVisitManagementViewProps> = ({
  onSubmitVisit,
  defaultExecutiveName,
  user,
  visits,
}) => {
  const employees = EmployeeService.getEmployees();

  // Existing unique companies list for quick auto-fill
  const existingCompanies = useMemo(() => {
    const map = new Map<string, CustomerVisit>();
    visits.forEach((v) => {
      if (v.companyName && !map.has(v.companyName.trim().toLowerCase())) {
        map.set(v.companyName.trim().toLowerCase(), v);
      }
    });
    return Array.from(map.values());
  }, [visits]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Live Auto Time
  const [currentDateTime, setCurrentDateTime] = useState({
    dateStr: new Date().toISOString().split('T')[0],
    timeStr: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime({
        dateStr: now.toISOString().split('T')[0],
        timeStr: now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      });
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // 1. CUSTOMER / COMPANY DETAILS (BOX 1)
  const [companyName, setCompanyName] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Fabricator');
  const [currentlyUsingBrands, setCurrentlyUsingBrands] = useState<string[]>(['Kommerling']);
  const [newBrandInput, setNewBrandInput] = useState('');
  const [monthlyTonnage, setMonthlyTonnage] = useState('5 MT / Month');
  const [gstNumber, setGstNumber] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // 2. CUSTOMER DETAILS (BOX 2)
  const [customerName, setCustomerName] = useState('');
  const [designation, setDesignation] = useState('Owner / Proprietor');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappEmail, setWhatsappEmail] = useState('');
  const [additionalContacts, setAdditionalContacts] = useState<AdditionalContact[]>([]);

  // 3. CONVERSION CARD & 4. CUSTOMER OPINION CARD (Single clean writing fields for what he said)
  const [conversionText, setConversionText] = useState('');
  const [opinionText, setOpinionText] = useState('');

  // 5. VISIT PHOTOS & VISITING CARD
  const [customerId] = useState(() => `CUST-${Math.floor(1000 + Math.random() * 9000)}`);
  const [visitId] = useState(() => `VST-${Date.now().toString().slice(-6)}`);
  const [photos, setPhotos] = useState<VisitPhoto[]>([]);
  const [visitingCard, setVisitingCard] = useState<string | null>(null);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // 6. CUSTOMER LOCATION (BOX 6)
  const defaultState = user?.assignedState && INDIAN_STATES.includes(user.assignedState)
    ? user.assignedState
    : 'Telangana';
  const [companyLocation, setCompanyLocation] = useState('');
  const [stateDistrict, setStateDistrict] = useState(defaultState);
  const [cityPin, setCityPin] = useState('');
  const [googleMapsGps, setGoogleMapsGps] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [branches, setBranches] = useState<
    Array<{ id: string; name: string; address: string; city: string; state: string }>
  >([]);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [branchInput, setBranchInput] = useState({ name: '', city: '', address: '' });

  // 7. NEXT FOLLOW-UP (BOX 7)
  const [followUpRequired, setFollowUpRequired] = useState<'Yes' | 'No'>('Yes');
  const [followUpDate, setFollowUpDate] = useState(
    () => new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [assignedSalesperson, setAssignedSalesperson] = useState(
    user?.displayName || defaultExecutiveName || 'nagarjuna'
  );
  const [followUpDiscussion, setFollowUpDiscussion] = useState(
    'Deliver uPVC sample corner section & discuss payment terms'
  );
  const [followUpStatus, setFollowUpStatus] = useState<
    'Pending' | 'Completed' | 'Rescheduled' | 'Cancelled'
  >('Pending');

  // Input file references
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const cardGalleryRef = useRef<HTMLInputElement>(null);
  const cardCameraRef = useRef<HTMLInputElement>(null);

  // Quick auto-fill from existing registered company
  const handleSelectExistingCompany = (comp: CustomerVisit) => {
    setCompanyName(comp.companyName || '');
    setCustomerType(comp.customerType || 'Fabricator');
    if (comp.currentBrands && comp.currentBrands.length > 0) {
      setCurrentlyUsingBrands(comp.currentBrands);
    } else if (comp.currentBrand) {
      setCurrentlyUsingBrands(comp.currentBrand.split(',').map((s) => s.trim()));
    }
    setMonthlyTonnage(comp.quantityPerMonth || '5 MT / Month');
    setGstNumber(comp.gstNumber || '');
    setCompanyAddress(comp.customerAddress || '');

    setCustomerName(comp.customerName || '');
    setDesignation(comp.contactDesignation || 'Owner / Proprietor');
    setMobileNumber(comp.mobileNumber || '');
    setWhatsappEmail(comp.whatsappNumber || comp.emailAddress || comp.mobileNumber || '');

    if (comp.companyName) setCompanyLocation(comp.city ? `${comp.city} Industrial Area` : '');
    if (comp.state) setStateDistrict(comp.state);
    if (comp.city) setCityPin(comp.pinCode ? `${comp.city} - ${comp.pinCode}` : comp.city);
    if (comp.gpsLocationLink) setGoogleMapsGps(comp.gpsLocationLink);
    if (comp.visitingCardPhoto) setVisitingCard(comp.visitingCardPhoto);
    if (comp.additionalContacts && comp.additionalContacts.length > 0) {
      setAdditionalContacts(comp.additionalContacts);
    }
    showToast(`✓ Auto-filled details for "${comp.companyName}"`);
  };

  // Add Brand Chip
  const handleAddBrandChip = (brandToAdd?: string) => {
    const target = (brandToAdd || newBrandInput).trim();
    if (!target) return;
    if (!currentlyUsingBrands.includes(target)) {
      setCurrentlyUsingBrands((prev) => [...prev, target]);
    }
    setNewBrandInput('');
  };

  const handleRemoveBrandChip = (b: string) => {
    setCurrentlyUsingBrands((prev) => prev.filter((item) => item !== b));
  };

  // Add Person (Additional contact row)
  const handleAddPerson = () => {
    setAdditionalContacts((prev) => [
      ...prev,
      {
        id: `person-${Date.now()}`,
        name: '',
        designation: 'Workshop Supervisor',
        mobileNumber: '',
        notes: '',
      },
    ]);
  };

  // GPS Location capture
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('GPS is not supported on this browser/device');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const link = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        setGoogleMapsGps(link);
        setIsDetectingGps(false);
        showToast('✓ GPS Coordinates captured successfully!');
      },
      (err) => {
        setIsDetectingGps(false);
        showToast(`GPS Notice: ${err.message || 'Please enable location access'}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleOpenGoogleMaps = () => {
    if (googleMapsGps) {
      window.open(googleMapsGps, '_blank');
    } else if (companyLocation || cityPin) {
      const q = encodeURIComponent(`${companyLocation} ${cityPin} ${stateDistrict}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
    } else {
      showToast('Please capture GPS or enter location first');
    }
  };

  const handleCopyAddress = async () => {
    const full = [companyName, companyLocation, companyAddress, cityPin, stateDistrict, gstNumber ? `GST: ${gstNumber}` : '']
      .filter(Boolean)
      .join(', ');
    if (!full) {
      showToast('No address entered yet to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(full);
      showToast('✓ Address copied to clipboard!');
    } catch {
      showToast('Address ready: ' + full);
    }
  };

  // Add Branch
  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchInput.name.trim()) return;
    setBranches((prev) => [
      ...prev,
      {
        id: `br-${Date.now()}`,
        name: branchInput.name.trim(),
        city: branchInput.city.trim() || cityPin,
        state: stateDistrict,
        address: branchInput.address.trim(),
      },
    ]);
    setBranchInput({ name: '', city: '', address: '' });
    setShowAddBranch(false);
    showToast('✓ Branch location added');
  };

  // Photos & Visiting Card Uploads
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const added: VisitPhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressPhoto(files[i], 800, 0.75);
        added.push({
          id: `p-${Date.now()}-${i}`,
          dataUrl: compressed,
          caption: files[i].name ? files[i].name.replace(/\.[^/.]+$/, '') : `Visit Photo ${photos.length + i + 1}`,
        });
      } catch (err) {
        console.warn('Photo error', err);
      }
    }
    setPhotos((prev) => [...prev, ...added]);
    if (e.target) e.target.value = '';
    showToast(`✓ Added ${added.length} visit photo(s)`);
  };

  const handleVisitingCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressPhoto(file, 900, 0.8);
      setVisitingCard(compressed);
      showToast('✓ Visiting card stored');
    } catch {
      showToast('Could not process visiting card');
    }
    if (e.target) e.target.value = '';
  };

  // Clear Form
  const resetForm = () => {
    setCompanyName('');
    setCustomerType('Fabricator');
    setCurrentlyUsingBrands(['Kommerling']);
    setMonthlyTonnage('5 MT / Month');
    setGstNumber('');
    setCompanyAddress('');
    setCustomerName('');
    setDesignation('Owner / Proprietor');
    setMobileNumber('');
    setWhatsappEmail('');
    setAdditionalContacts([]);
    setConversionText('');
    setOpinionText('');
    setPhotos([]);
    setVisitingCard(null);
    setCompanyLocation('');
    setCityPin('');
    setGoogleMapsGps('');
    setBranches([]);
    setFollowUpRequired('Yes');
    setFollowUpDiscussion('Deliver uPVC sample corner section & discuss payment terms');
    setFollowUpStatus('Pending');
  };

  // Submit Visit
  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      showToast('Please enter Company Name');
      return;
    }
    if (!customerName.trim()) {
      showToast('Please enter Customer / Owner Name');
      return;
    }
    if (!mobileNumber.trim()) {
      showToast('Please enter Mobile Number');
      return;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Derive city and pin
    const cityParts = cityPin.split(/[-–,]/);
    const resolvedCity = cityParts[0]?.trim() || companyLocation || 'Industrial Area';
    const resolvedPin = cityParts[1]?.trim() || '';

    // Combined remarks
    const combinedRemarks = [
      conversionText ? `Conversion: ${conversionText}` : '',
      opinionText ? `Opinion: ${opinionText}` : '',
      followUpDiscussion ? `Follow-up: ${followUpDiscussion}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const newVisit: CustomerVisit = {
      id: `vst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId,
      visitId,
      salesExecutiveName: assignedSalesperson || user?.displayName || defaultExecutiveName || 'nagarjuna',
      customerVisitDate: todayStr,
      customerVisitTime: timeStr,
      submittedAt: `${todayStr} at ${timeStr}`,
      companyName: companyName.trim(),
      customerName: customerName.trim(),
      contactDesignation: designation,
      mobileNumber: mobileNumber.trim(),
      whatsappNumber: whatsappEmail.includes('@') ? mobileNumber.trim() : (whatsappEmail.trim() || mobileNumber.trim()),
      emailAddress: whatsappEmail.includes('@') ? whatsappEmail.trim() : undefined,
      additionalContacts: additionalContacts.filter((c) => c.name.trim()),
      customerType,
      gstNumber: gstNumber.trim().toUpperCase() || undefined,
      city: resolvedCity,
      district: resolvedCity,
      state: stateDistrict,
      pinCode: resolvedPin || undefined,
      customerAddress: [companyAddress.trim(), companyLocation.trim(), cityPin.trim(), stateDistrict].filter(Boolean).join(', '),
      currentBrand: currentlyUsingBrands.join(', '),
      currentBrands: currentlyUsingBrands,
      quantityPerMonth: monthlyTonnage || '5 MT / Month',
      brand: 'S CRAFT',
      interestedSeries: `SCRAFT uPVC Profiles`,
      interestedBrand: `SCRAFT Profiles - ${monthlyTonnage || '5 MT / Month'}`,
      leadStatus: 'Hot',
      piSent: 'No',
      visitRemarks: combinedRemarks || 'Customer visit completed successfully',
      conversionCard: conversionText
        ? {
            leadStatus: 'Hot',
            productsDiscussed: 'S CRAFT',
            targetBrand: 'S CRAFT',
            discussionNotes: conversionText,
          }
        : undefined,
      opinionCard: opinionText
        ? {
            customerFeedback: opinionText,
          }
        : undefined,
      followUpDate,
      followUpTime: '11:00 AM',
      followUpPurpose: followUpDiscussion,
      followUpRequired,
      followUpDiscussion,
      assignedSalesperson,
      followUpStatus,
      branchLocations: branches,
      photos,
      visitingCardPhoto: visitingCard || undefined,
      gpsLocationLink: googleMapsGps || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      executiveEmail: user?.email || 'ravirajaindustries@gmail.com',
      userId: user?.uid,
    };

    onSubmitVisit(newVisit);
    showToast(`✓ Customer Visit for "${companyName}" saved to CRM!`);
    resetForm();
  };

  return (
    <div className="space-y-4 pb-16 animate-fadeIn max-w-4xl mx-auto">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-950 border border-emerald-500/60 text-emerald-200 text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER BANNER: Exactly as in CSV */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-sky-400 font-extrabold uppercase block">
              RAVIRAJA INDUSTRIES | CUSTOMER VISIT MANAGEMENT
            </span>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>SINGLE-PAGE VISIT ENTRY FORM</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Complete the cards and save the visit in your CRM • ID: <span className="font-mono text-sky-300 font-bold">{visitId}</span>
            </p>
          </div>

          {/* Live timestamp & Executive */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs font-mono self-start sm:self-auto">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-white font-bold block">{currentDateTime.dateStr} • {currentDateTime.timeStr}</span>
              <span className="text-[10px] text-slate-400">Executive: {assignedSalesperson}</span>
            </div>
          </div>
        </div>

        {/* Existing Company Auto-Fill Shortcut */}
        {existingCompanies.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Auto-fill from previous records:</span>
            </span>
            <select
              onChange={(e) => {
                const found = existingCompanies.find((c) => c.companyName === e.target.value);
                if (found) handleSelectExistingCompany(found);
              }}
              defaultValue=""
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:border-sky-500 outline-none"
            >
              <option value="" disabled>
                Select previous company to auto-fill...
              </option>
              {existingCompanies.map((c) => (
                <option key={c.id} value={c.companyName}>
                  {c.companyName} ({c.city})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* MAIN SINGLE-PAGE VISIT FORM */}
      <form onSubmit={handleSaveVisit} className="space-y-4 text-xs">
        {/* CARD 1: CUSTOMER / COMPANY DETAILS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-400" />
              <span>CUSTOMER / COMPANY DETAILS</span>
            </h2>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 border border-sky-800/50 px-2 py-0.5 rounded-lg">
              Card 1
            </span>
          </div>

          {/* Row 1: Company Name *, Customer Type *, CURRENT USING BRANDS +ADD BUTTON, MONTHLY TONNAGE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Company Name * */}
            <div>
              <label className="font-bold text-slate-200 block mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none transition font-medium"
              />
            </div>

            {/* Customer Type * */}
            <div>
              <label className="font-bold text-slate-200 block mb-1">Customer Type *</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none transition"
              >
                {CUSTOMER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* CURRENT USING BRANDS +ADD BUTTON */}
            <div>
              <label className="font-bold text-slate-200 block mb-1">CURRENT USING BRANDS</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newBrandInput}
                  onChange={(e) => setNewBrandInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBrandChip();
                    }
                  }}
                  placeholder="e.g. Kommerling"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-2.5 py-2 text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddBrandChip()}
                  className="px-2.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shrink-0 transition active:scale-95 cursor-pointer text-[11px]"
                >
                  +ADD
                </button>
              </div>
              {/* Brand Chips */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {currentlyUsingBrands.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10px]"
                  >
                    <span>{b}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBrandChip(b)}
                      className="hover:text-rose-400"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* MONTHLY TONNAGE */}
            <div>
              <label className="font-bold text-slate-200 block mb-1">MONTHLY TONNAGE</label>
              <input
                type="text"
                value={monthlyTonnage}
                onChange={(e) => setMonthlyTonnage(e.target.value)}
                placeholder="5 MT / Month"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none transition font-medium"
              />
            </div>
          </div>

          {/* Row 2: GST Number, Company Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="font-bold text-slate-300 block mb-1">GST Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="Enter GST number"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white font-mono uppercase outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-300 block mb-1">Company Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Enter address"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: CUSTOMER DETAILS (Owner & Contacts) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>CUSTOMER DETAILS</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-lg">
              Card 2
            </span>
          </div>

          {/* Row 1: Name *, Designation *, Mobile Number *, WhatsApp / Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-slate-200 block mb-1">Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter owner name"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1">Designation *</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white outline-none"
              >
                {COMMON_DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter mobile number"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1">WhatsApp / Email</label>
              <input
                type="text"
                value={whatsappEmail}
                onChange={(e) => setWhatsappEmail(e.target.value)}
                placeholder="Enter WhatsApp or email"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white outline-none"
              />
            </div>
          </div>

          {/* Action: + ADD PERSON | In the CRM, allow multiple contact rows under the same company */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 font-semibold">
                Multiple contact rows under the same company:
              </span>
              <button
                type="button"
                onClick={handleAddPerson}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD PERSON</span>
              </button>
            </div>

            {additionalContacts.length > 0 && (
              <div className="space-y-2 pt-1">
                {additionalContacts.map((contact, idx) => (
                  <div
                    key={contact.id}
                    className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                  >
                    <input
                      type="text"
                      placeholder={`Person #${idx + 1} Name`}
                      value={contact.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdditionalContacts((prev) =>
                          prev.map((c) => (c.id === contact.id ? { ...c, name: val } : c))
                        );
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Designation"
                      value={contact.designation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdditionalContacts((prev) =>
                          prev.map((c) => (c.id === contact.id ? { ...c, designation: val } : c))
                        );
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={contact.mobileNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdditionalContacts((prev) =>
                          prev.map((c) => (c.id === contact.id ? { ...c, mobileNumber: val } : c))
                        );
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono"
                    />
                    <div className="flex items-center gap-1.5 justify-between">
                      <input
                        type="text"
                        placeholder="Notes / Email"
                        value={contact.notes || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdditionalContacts((prev) =>
                            prev.map((c) => (c.id === contact.id ? { ...c, notes: val } : c))
                          );
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white w-full"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAdditionalContacts((prev) => prev.filter((c) => c.id !== contact.id))
                        }
                        className="p-1.5 text-rose-400 hover:text-white rounded-lg hover:bg-rose-950 transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CARDS 3 & 4: CONVERSION CARD & CUSTOMER OPINION CARD (SINGLE CLEAN WRITING AREAS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CONVERSION CARD */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>CONVERSION CARD</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Record what he said about order conversion & deal discussion
                </p>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 border border-amber-800/50 px-2 py-0.5 rounded-lg">
                Card 3
              </span>
            </div>

            <textarea
              rows={3}
              value={conversionText}
              onChange={(e) => setConversionText(e.target.value)}
              placeholder="Write what customer said regarding order conversion, deal terms, readiness to buy..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl p-3 text-white outline-none resize-none text-xs placeholder-slate-500 transition font-normal"
            />
          </div>

          {/* CUSTOMER OPINION CARD */}
          <div className="bg-slate-900 border border-sky-500/30 rounded-3xl p-4 sm:p-5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-sky-400" />
                  <span>CUSTOMER OPINION CARD</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Record what he said regarding opinion, feedback & requirements
                </p>
              </div>
              <span className="text-[10px] font-mono text-sky-300 bg-sky-950/80 border border-sky-800/50 px-2 py-0.5 rounded-lg">
                Card 4
              </span>
            </div>

            <textarea
              rows={3}
              value={opinionText}
              onChange={(e) => setOpinionText(e.target.value)}
              placeholder="Write what customer said regarding product opinion, quality, competitor comparison, remarks..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl p-3 text-white outline-none resize-none text-xs placeholder-slate-500 transition font-normal"
            />
          </div>
        </div>

        {/* CARD 5: VISIT PHOTOS & VISITING CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-400" />
                <span>VISIT PHOTOS & VISITING CARD</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Linked to Customer ID: <span className="font-mono text-teal-300 font-bold">{customerId}</span> • Visit ID: <span className="font-mono text-teal-300 font-bold">{visitId}</span>
              </p>
            </div>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-950/80 border border-teal-800/50 px-2 py-0.5 rounded-lg">
              Card 5
            </span>
          </div>

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <input
            type="file"
            ref={photoInputRef}
            onChange={handlePhotoUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cardCameraRef}
            onChange={handleVisitingCardUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <input
            type="file"
            ref={cardGalleryRef}
            onChange={handleVisitingCardUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* A. VISIT PHOTOS */}
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                  <span>A. VISIT PHOTOS ({photos.length})</span>
                </span>
                <span className="text-[10px] text-slate-500">Workshop & Factory</span>
              </div>

              {/* Large Button: + ADD MULTIPLE PHOTOS */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>+ ADD MULTIPLE PHOTOS</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 leading-tight">
                Camera / Gallery • Preview • Description • Store against this Customer ID + Visit ID
              </p>

              {/* Photos Gallery Strip */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {photos.map((photo, pIdx) => (
                    <div
                      key={photo.id || pIdx}
                      className="relative rounded-xl overflow-hidden border border-slate-700 bg-black group"
                    >
                      <img
                        src={photo.dataUrl}
                        alt={`Visit photo ${pIdx + 1}`}
                        className="w-full h-16 object-cover cursor-pointer group-hover:scale-105 transition"
                        onClick={() => setSelectedPhotoModal(photo.dataUrl)}
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
                        className="absolute top-1 right-1 p-0.5 rounded bg-black/80 text-rose-400 hover:text-white"
                      >
                        ✕
                      </button>
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white px-1 py-0.2 truncate text-center">
                        {photo.caption || `Photo ${pIdx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* B. VISITING CARD */}
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                  <span>B. VISITING CARD</span>
                </span>
                <span className="text-[10px] text-slate-500">Owner / Director Card</span>
              </div>

              {/* Large Button: UPLOAD VISITING CARD */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cardCameraRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => cardGalleryRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>UPLOAD VISITING CARD</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 leading-tight">
                Camera / Gallery • Contact Person Name • Keep visiting cards separate from visit photos
              </p>

              {/* Card Thumbnail Preview */}
              {visitingCard ? (
                <div className="relative rounded-xl overflow-hidden border border-sky-500/60 bg-black p-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={visitingCard}
                      alt="Visiting card"
                      className="w-16 h-12 rounded-lg object-cover cursor-pointer"
                      onClick={() => setSelectedPhotoModal(visitingCard)}
                    />
                    <div>
                      <span className="text-[11px] font-bold text-white block">Visiting Card Stored</span>
                      <span className="text-[9px] text-sky-300">{customerName || 'Contact Person'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisitingCard(null)}
                    className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-white mr-1"
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div className="p-3 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-[10px]">
                  No visiting card uploaded yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CARD 4: CUSTOMER LOCATION */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>CUSTOMER LOCATION</span>
            </h2>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 border border-rose-800/50 px-2 py-0.5 rounded-lg">
              Card 6
            </span>
          </div>

          {/* Row 1: Company Location *, State / District *, City / PIN Code *, Google Maps Link / GPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-slate-200 block mb-1">Company Location *</label>
              <input
                type="text"
                required
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                placeholder="Enter company location"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1">State / District *</label>
              <select
                value={stateDistrict}
                onChange={(e) => setStateDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-white outline-none"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1">City / PIN Code *</label>
              <input
                type="text"
                required
                value={cityPin}
                onChange={(e) => setCityPin(e.target.value)}
                placeholder="Enter city and PIN"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1">Google Maps Link / GPS</label>
              <input
                type="text"
                value={googleMapsGps}
                onChange={(e) => setGoogleMapsGps(e.target.value)}
                placeholder="Paste map link or GPS"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-white font-mono text-[11px] outline-none"
              />
            </div>
          </div>

          {/* Action Buttons Row: Exactly as in CSV */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* GET CURRENT LOCATION */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isDetectingGps}
                className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isDetectingGps ? 'Capturing GPS...' : 'GET CURRENT LOCATION'}</span>
              </button>

              {/* OPEN IN GOOGLE MAPS */}
              <button
                type="button"
                onClick={handleOpenGoogleMaps}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span>OPEN IN GOOGLE MAPS</span>
              </button>

              {/* COPY ADDRESS */}
              <button
                type="button"
                onClick={handleCopyAddress}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>COPY ADDRESS</span>
              </button>
            </div>

            {/* + ADD BRANCH */}
            <button
              type="button"
              onClick={() => setShowAddBranch(!showAddBranch)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ ADD BRANCH</span>
            </button>
          </div>

          {/* Add Branch Inline Panel */}
          {showAddBranch && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 animate-fadeIn">
              <span className="font-bold text-slate-300 block">Add Branch Location:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Branch Name (e.g. Surat Warehouse)"
                  value={branchInput.name}
                  onChange={(e) => setBranchInput((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Branch City"
                  value={branchInput.city}
                  onChange={(e) => setBranchInput((prev) => ({ ...prev, city: e.target.value }))}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                />
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Branch Street Address"
                    value={branchInput.address}
                    onChange={(e) => setBranchInput((prev) => ({ ...prev, address: e.target.value }))}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white w-full"
                  />
                  <button
                    type="button"
                    onClick={handleAddBranchSubmit}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shrink-0"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Branch list */}
          {branches.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1.5">
              {branches.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                >
                  <strong>{b.name}</strong> • {b.city}
                  <button
                    type="button"
                    onClick={() => setBranches((prev) => prev.filter((item) => item.id !== b.id))}
                    className="text-rose-400 hover:text-white ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CARD 5: NEXT FOLLOW-UP */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>NEXT FOLLOW-UP</span>
            </h2>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded-lg">
              Card 7
            </span>
          </div>

          {/* Row 1: Follow-up Required *, Follow-up Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-200 block mb-1">Follow-up Required *</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Yes', 'No'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFollowUpRequired(opt)}
                    className={`py-2 rounded-xl font-bold text-xs border transition ${
                      followUpRequired === opt
                        ? 'bg-cyan-600 text-white border-cyan-500 font-extrabold shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1">Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          {/* Row 2: Follow-up Discussion, Follow-up Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-300 block mb-1">Follow-up Discussion</label>
              <input
                type="text"
                value={followUpDiscussion}
                onChange={(e) => setFollowUpDiscussion(e.target.value)}
                placeholder="Enter purpose and discussion"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Follow-up Status</label>
              <select
                value={followUpStatus}
                onChange={(e) => setFollowUpStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-white outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 8 / BOTTOM BAR: SAVE VISIT */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="text-slate-400 hover:text-white font-bold cursor-pointer px-3 py-2 text-xs flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>

          {/* Big Primary Action: SAVE VISIT */}
          <button
            type="submit"
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-950/50 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>SAVE VISIT</span>
          </button>
        </div>
      </form>

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      {selectedPhotoModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
            onClick={() => setSelectedPhotoModal(null)}
          >
            <div className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden p-3 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold text-white">Attached Visit Media</span>
                <button
                  type="button"
                  onClick={() => setSelectedPhotoModal(null)}
                  className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-[70vh] flex items-center justify-center bg-black rounded-xl overflow-hidden">
                <img
                  src={selectedPhotoModal}
                  alt="Visit media fullsize"
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
