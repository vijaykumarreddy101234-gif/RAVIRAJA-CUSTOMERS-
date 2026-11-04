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
  ChevronDown,
} from 'lucide-react';
import {
  CustomerVisit,
  CustomerType,
  LeadStatus,
  PISentStatus,
  AdditionalContact,
  VisitPhoto,
  UPVCBrand,
} from '../types/customerVisit';
import { AppUser } from '../services/firebaseAuth';
import { EmployeeService } from '../services/employeeService';
import { VoiceDictationButton } from './VoiceDictationButton';
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

/**
 * Compresses photos to clean, lightweight data URLs (max 800px, JPEG 0.75)
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

  // 3. CONVERSION CARD (Box 3)
  const [conversionRemarks, setConversionRemarks] = useState('');
  const [convStatus, setConvStatus] = useState<LeadStatus>('Hot');
  const [convTargetBrand, setConvTargetBrand] = useState<UPVCBrand>('S CRAFT');
  const [convExpectedTonnage, setConvExpectedTonnage] = useState('5 MT / Month');
  const [convDealValue, setConvDealValue] = useState('');
  const [convProbability, setConvProbability] = useState('80%');

  // 4. CUSTOMER OPINION CARD (Box 4)
  const [opinionRemarks, setOpinionRemarks] = useState('');
  const [opPricing, setOpPricing] = useState('');
  const [opQuality, setOpQuality] = useState('');
  const [opCompetitor, setOpCompetitor] = useState('');
  const [opInterest, setOpInterest] = useState('');
  const [opThickness, setOpThickness] = useState('');
  const [opTerms, setOpTerms] = useState('');

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

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showToast('GPS is not supported on this browser/device');
      return;
    }
    setIsDetectingGps(true);
    showToast('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const link = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        setGoogleMapsGps(link);
        
        try {
          // Use Geocoding API to reverse geocode
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);
          const data = await response.json();
          if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            const addressComponents = result.address_components;
            
            let city = '';
            let pincode = '';
            let state = '';
            
            addressComponents.forEach((comp: any) => {
              if (comp.types.includes('locality') || comp.types.includes('sublocality')) {
                city = comp.long_name;
              } else if (comp.types.includes('postal_code')) {
                pincode = comp.long_name;
              } else if (comp.types.includes('administrative_area_level_1')) {
                state = comp.long_name;
              }
            });

            if (city) setCompanyLocation(city);
            if (city && pincode) setCityPin(`${city} - ${pincode}`);
            else if (pincode) setCityPin(pincode);
            if (state) setStateDistrict(state);

            showToast('✓ Location & address detected!');
          }
        } catch (err) {
          console.error('Reverse geocoding failed', err);
          showToast('GPS detected, but address lookup failed.');
        }

        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        showToast(`GPS Notice: ${err.message || 'Please enable location access'}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleOpenGoogleMaps = () => {
    let url = '';
    if (googleMapsGps) {
      url = googleMapsGps;
    } else if (companyLocation || cityPin) {
      const q = encodeURIComponent(`${companyLocation} ${cityPin} ${stateDistrict}`);
      url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    } else {
      showToast('Please capture GPS or enter location first');
      return;
    }

    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(url, '_blank');
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
    setConversionRemarks('');
    setOpinionRemarks('');
    setConvExpectedTonnage('5 MT / Month');
    setConvDealValue('');
    setConvProbability('80%');
    setOpPricing('');
    setOpQuality('');
    setOpCompetitor('');
    setOpInterest('');
    setOpThickness('');
    setOpTerms('');
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

    const cityParts = cityPin.split(/[-–,]/);
    const resolvedCity = cityParts[0]?.trim() || companyLocation || 'Industrial Area';
    const resolvedPin = cityParts[1]?.trim() || '';

    const combinedRemarks = [
      conversionRemarks ? `Conversion: ${conversionRemarks}` : '',
      opinionRemarks ? `Opinion: ${opinionRemarks}` : '',
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
      leadStatus: convStatus,
      piSent: 'No',
      conversionRemarks,
      opinionRemarks,
      visitRemarks: combinedRemarks || 'Customer visit completed successfully',
      conversionCard: {
        status: convStatus,
        targetBrand: convTargetBrand,
        expectedTonnage: convExpectedTonnage,
        dealValue: convDealValue,
        probability: convProbability
      },
      opinionCard: {
        pricingOpinion: opPricing,
        qualityChambers: opQuality,
        competitorOpinion: opCompetitor,
        customerInterestSeries: opInterest,
        qualityWallThickness: opThickness,
        priceCreditTerms: opTerms
      },
      followUpDate,
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

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-sky-400 font-extrabold uppercase block">
            RAVIRAJA CRM
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Customer Visit Management
          </h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {existingCompanies.length > 0 && (
            <select
              onChange={(e) => {
                const found = existingCompanies.find((c) => c.companyName === e.target.value);
                if (found) handleSelectExistingCompany(found);
              }}
              defaultValue=""
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:border-sky-500 outline-none"
            >
              <option value="" disabled>
                Auto-fill company...
              </option>
              {existingCompanies.map((c) => (
                <option key={c.id} value={c.companyName}>
                  {c.companyName} ({c.city})
                </option>
              ))}
            </select>
          )}
          <div className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            Visit ID: <span className="font-mono text-sky-300 font-bold">{visitId}</span>
          </div>
        </div>
      </div>

      {/* MAIN SINGLE-PAGE VISIT FORM */}
      <form onSubmit={handleSaveVisit} className="space-y-4 text-xs">
        {/* CARD 1: COMPANY DETAILS */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-400" />
              <span>COMPANY DETAILS</span>
            </h2>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 border border-sky-800/50 px-2 py-0.5 rounded-lg">
              Card 1
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-300 block">Company Address</label>
                <VoiceDictationButton
                  onTranscript={(text) =>
                    setCompanyAddress((prev) => (prev ? `${prev} ${text}` : text))
                  }
                  title="Dictate company address via microphone"
                />
              </div>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Enter address or tap microphone to dictate"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: CUSTOMER DETAILS */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>CUSTOMER DETAILS</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-lg">
              Card 2
            </span>
          </div>

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

        {/* CARDS 3 & 4: CONVERSION CARD & CUSTOMER OPINION CARD (Exact match to image_acd258e0.png) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CARD 3: CONVERSION CARD */}
          <div className="bg-[#020712] border border-[#0d1f36] rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-black text-amber-400 uppercase tracking-wide">
                    CONVERSION CARD
                  </h2>
                  <p className="text-slate-400 text-xs mt-1 leading-snug">
                    Record what he said about order conversion & deal discussion
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <VoiceDictationButton
                  onTranscript={(text) =>
                    setConversionRemarks((prev) => (prev ? `${prev} ${text}` : text))
                  }
                  variant="ghost"
                  className="w-10 h-10 rounded-full bg-[#081220] border border-[#162740] text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95"
                  title="Dictate order conversion notes"
                />
                <div className="bg-[#1c0f05] border border-amber-600/70 rounded-xl px-3 py-1.5 text-center min-w-[46px] flex flex-col items-center justify-center">
                  <span className="text-[10px] text-amber-500 font-bold block leading-tight">Card</span>
                  <span className="text-xs text-amber-400 font-black block leading-tight">3</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 my-2" />

            <div>
              <textarea
                value={conversionRemarks}
                onChange={(e) => setConversionRemarks(e.target.value)}
                placeholder="Write or dictate what customer said regarding order conversion, deal terms, readiness to buy..."
                rows={4}
                className="w-full bg-[#040c1a] border border-[#0f2138] rounded-2xl p-4 text-white text-xs placeholder:text-slate-500 outline-none focus:border-amber-500/60 leading-relaxed resize-none font-medium min-h-[110px]"
              />
            </div>
          </div>

          {/* CARD 4: CUSTOMER OPINION CARD */}
          <div className="bg-[#020712] border border-[#0d1f36] rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <MessageCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-black text-sky-400 uppercase tracking-wide leading-tight">
                    CUSTOMER OPINION CARD
                  </h2>
                  <p className="text-slate-400 text-xs mt-1 leading-snug">
                    Record what he said regarding opinion, feedback & requirements
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <VoiceDictationButton
                  onTranscript={(text) =>
                    setOpinionRemarks((prev) => (prev ? `${prev} ${text}` : text))
                  }
                  variant="ghost"
                  className="w-10 h-10 rounded-full bg-[#081220] border border-[#162740] text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95"
                  title="Dictate customer opinion notes"
                />
                <div className="bg-[#051829] border border-sky-600/70 rounded-xl px-3 py-1.5 text-center min-w-[46px] flex flex-col items-center justify-center">
                  <span className="text-[10px] text-sky-400 font-bold block leading-tight">Card</span>
                  <span className="text-xs text-sky-400 font-black block leading-tight">4</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 my-2" />

            <div>
              <textarea
                value={opinionRemarks}
                onChange={(e) => setOpinionRemarks(e.target.value)}
                placeholder="Write or dictate what customer said regarding product opinion, quality, competitor comparison, remarks..."
                rows={4}
                className="w-full bg-[#040c1a] border border-[#0f2138] rounded-2xl p-4 text-white text-xs placeholder:text-slate-500 outline-none focus:border-sky-500/60 leading-relaxed resize-none font-medium min-h-[110px]"
              />
            </div>
          </div>
        </div>

        {/* CARD 5: VISIT PHOTOS & VISITING CARD */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
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

          <input type="file" ref={cameraInputRef} onChange={handlePhotoUpload} accept="image/*" capture="environment" className="hidden" />
          <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} multiple accept="image/*" className="hidden" />
          <input type="file" ref={cardCameraRef} onChange={handleVisitingCardUpload} accept="image/*" capture="environment" className="hidden" />
          <input type="file" ref={cardGalleryRef} onChange={handleVisitingCardUpload} accept="image/*" className="hidden" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-teal-400" /><span>A. VISIT PHOTOS ({photos.length})</span></span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => cameraInputRef.current?.click()} className="py-2.5 px-3 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition"><Camera className="w-4 h-4" /><span>Open Camera</span></button>
                <button type="button" onClick={() => photoInputRef.current?.click()} className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"><ImageIcon className="w-4 h-4 text-sky-400" /><span>+ ADD PHOTOS</span></button>
              </div>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {photos.map((photo, pIdx) => (
                    <div key={photo.id || pIdx} className="relative rounded-xl overflow-hidden border border-slate-700 bg-black">
                      <img src={photo.dataUrl} alt={`Visit ${pIdx}`} className="w-full h-16 object-cover cursor-pointer" onClick={() => setSelectedPhotoModal(photo.dataUrl)} />
                      <button type="button" onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))} className="absolute top-0.5 right-0.5 p-1 bg-black/60 rounded-full text-rose-400 hover:text-white"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-sky-400" /><span>B. VISITING CARD</span></span>
              </div>
              {!visitingCard ? (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => cardCameraRef.current?.click()} className="py-2.5 px-3 rounded-xl bg-sky-600/20 text-sky-300 border border-sky-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition"><Camera className="w-4 h-4" /><span>Capture Card</span></button>
                  <button type="button" onClick={() => cardGalleryRef.current?.click()} className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"><ImageIcon className="w-4 h-4" /><span>Add From Gallery</span></button>
                </div>
              ) : (
                <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-black aspect-[3/2] max-h-32">
                  <img src={visitingCard} alt="Visiting Card" className="w-full h-full object-contain cursor-pointer" onClick={() => setSelectedPhotoModal(visitingCard)} />
                  <button type="button" onClick={() => setVisitingCard(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-rose-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CARD 6: CUSTOMER LOCATION */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>CUSTOMER LOCATION</span>
            </h2>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 border border-rose-800/50 px-2 py-0.5 rounded-lg">
              Card 6
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-slate-200 block mb-1">Company Location *</label>
              <input type="text" required value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} placeholder="Enter location" className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-white outline-none" />
            </div>
            <div>
              <label className="font-bold text-slate-200 block mb-1">State / District *</label>
              <select value={stateDistrict} onChange={(e) => setStateDistrict(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-white outline-none">
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-200 block mb-1">City / PIN Code *</label>
              <input type="text" required value={cityPin} onChange={(e) => setCityPin(e.target.value)} placeholder="City and PIN" className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-white outline-none" />
            </div>
            <div>
              <label className="font-bold text-slate-200 block mb-1">Google Maps Link / GPS</label>
              <input type="text" value={googleMapsGps} onChange={(e) => setGoogleMapsGps(e.target.value)} placeholder="Map link or GPS" className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-white font-mono text-[11px] outline-none" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleGetCurrentLocation} disabled={isDetectingGps} className="px-3.5 py-2 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"><Navigation className="w-3.5 h-3.5" /><span>{isDetectingGps ? 'Capturing...' : 'GET GPS'}</span></button>
              <button type="button" onClick={handleOpenGoogleMaps} className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"><ExternalLink className="w-3.5 h-3.5 text-sky-400" /><span>OPEN MAPS</span></button>
              <button type="button" onClick={handleCopyAddress} className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"><Copy className="w-3.5 h-3.5 text-emerald-400" /><span>COPY ADDRESS</span></button>
            </div>
            <button type="button" onClick={() => setShowAddBranch(!showAddBranch)} className="px-3.5 py-2 rounded-xl bg-slate-800 text-sky-400 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"><Plus className="w-3.5 h-3.5" /><span>+ BRANCH</span></button>
          </div>
        </div>

        {/* CARD 7: NEXT FOLLOW-UP */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>NEXT FOLLOW-UP</span>
            </h2>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded-lg">
              Card 7
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-200 block mb-1">Follow-up Required *</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Yes', 'No'] as const).map((opt) => (
                  <button key={opt} type="button" onClick={() => setFollowUpRequired(opt)} className={`py-2 rounded-xl font-bold text-xs border transition ${followUpRequired === opt ? 'bg-cyan-600 text-white border-cyan-500 shadow' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-200 block mb-1">Follow-up Date</label>
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-300 block">Follow-up Discussion</label>
                <VoiceDictationButton onTranscript={(text) => setFollowUpDiscussion((prev) => (prev ? `${prev} ${text}` : text))} title="Dictate follow-up" />
              </div>
              <input type="text" value={followUpDiscussion} onChange={(e) => setFollowUpDiscussion(e.target.value)} placeholder="Purpose and discussion" className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-white outline-none" />
            </div>
            <div>
              <label className="font-bold text-slate-200 block mb-1">Lead Status</label>
              <select value={convStatus} onChange={(e) => setConvStatus(e.target.value as LeadStatus)} className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-white outline-none">
                {LEAD_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-200 block mb-1">Follow-up Status</label>
              <select value={followUpStatus} onChange={(e) => setFollowUpStatus(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-white outline-none">
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* EXECUTIVE & VISIT SUMMARY CARD */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-3.5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-sky-400 font-extrabold uppercase block">
                RAVIRAJA INDUSTRIES | CUSTOMER VISIT MANAGEMENT
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span>SINGLE-PAGE VISIT ENTRY FORM</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Complete the cards and save the visit • ID: <span className="font-mono text-sky-300 font-bold">{visitId}</span></p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs font-mono self-start sm:self-auto">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-white font-bold block">{currentDateTime.dateStr} • {currentDateTime.timeStr}</span>
                <span className="text-[10px] text-slate-400">Executive: {assignedSalesperson}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: SAVE VISIT */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white font-bold cursor-pointer px-3 py-2 text-xs flex items-center gap-1.5 transition"><RotateCcw className="w-3.5 h-3.5" /><span>Clear Form</span></button>
          <button type="submit" className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-950/50 transition active:scale-95 flex items-center justify-center gap-2.5"><CheckCircle2 className="w-5 h-5 text-white" /><span>SAVE VISIT</span></button>
        </div>
      </form>

      {selectedPhotoModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedPhotoModal(null)}>
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden p-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-bold text-white">Attached Visit Media</span>
              <button type="button" onClick={() => setSelectedPhotoModal(null)} className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center bg-black rounded-xl overflow-hidden">
              <img src={selectedPhotoModal} alt="Visit media fullsize" className="max-h-[70vh] w-auto max-w-full object-contain" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
