import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Send,
  Building,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  FileCheck,
  Package,
  Navigation,
  Loader2,
  Plus,
  Trash2,
  Briefcase,
  FileText,
  ShieldCheck,
  MessageSquare,
  Camera,
  Image as ImageIcon,
  Eye,
  X,
} from 'lucide-react';
import {
  CustomerVisit,
  CustomerType,
  LeadStatus,
  PISentStatus,
  AdditionalContact,
  OtherOpinionCard,
  VisitPhoto,
} from '../types/customerVisit';
import { AppUser } from '../services/firebaseAuth';
import {
  INDIAN_STATES,
  POPULAR_DISTRICTS,
  CUSTOMER_TYPES,
  LEAD_STATUS_OPTIONS,
  COMMON_DESIGNATIONS,
} from '../data/indiaLocations';

interface CustomerVisitFormProps {
  onSubmitVisit: (visit: CustomerVisit) => void;
  defaultExecutiveName: string;
  user?: AppUser | null;
}

const COMMON_OPINION_PRESETS = [
  'Pricing Opinion',
  'Quality & Chambers',
  'Competitor Credit Terms',
  'Delivery Time',
  'Sample Corner Request',
  'Hardware & Gaskets',
];

/**
 * Compresses visit/workshop photos to crisp, lightweight data URLs (max 800px, JPEG 0.75)
 * so multiple photos can be stored securely without exceeding Firestore limits.
 */
function compressPhotoToDataUrl(file: File, maxDim: number = 800, quality: number = 0.75): Promise<string> {
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

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Failed to parse uploaded photo.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read photo file.'));
    reader.readAsDataURL(file);
  });
}

export const CustomerVisitForm: React.FC<CustomerVisitFormProps> = ({
  onSubmitVisit,
  defaultExecutiveName,
  user,
}) => {
  // Live Date and Time (auto-stamped on submit, no manual schedule needed)
  const [currentDateTime, setCurrentDateTime] = useState({
    dateStr: new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    timeStr: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  });

  // Keep live time current every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime({
        dateStr: now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        timeStr: now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      });
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Customer & Enterprise Fields
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [contactDesignation, setContactDesignation] = useState('Owner / Proprietor');
  const [companyName, setCompanyName] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Fabricator');
  const [gstNumber, setGstNumber] = useState('');

  // Additional Persons (Partners, Supervisors, Purchase Incharge) - simple 1-button add
  const [additionalContacts, setAdditionalContacts] = useState<AdditionalContact[]>([]);

  // Location Fields (Default to user's assigned state if available)
  const defaultState = user?.assignedState && INDIAN_STATES.includes(user.assignedState)
    ? user.assignedState
    : 'Telangana';
  const [state, setState] = useState(defaultState);
  const [district, setDistrict] = useState(
    POPULAR_DISTRICTS[defaultState]?.[0] || 'Hyderabad'
  );
  const [city, setCity] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // GPS Location Tracking
  const [gpsLocationLink, setGpsLocationLink] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  // Auto-capture GPS on initial load
  useEffect(() => {
    captureGpsLocation();
  }, []);

  // uPVC Products & Brands (Series removed as requested)
  const [brand, setBrand] = useState<'S CRAFT' | 'SMART' | 'OTHERS'>('S CRAFT');
  const [quantityPerMonth, setQuantityPerMonth] = useState('');
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [customCompetitor, setCustomCompetitor] = useState('');

  // Deal Stage & Follow-Up
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('Hot');
  const [piSent, setPiSent] = useState<PISentStatus>('No');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  // Conversation & Other Opinion Cards
  const [conversation, setConversation] = useState('');
  const [otherOpinionCards, setOtherOpinionCards] = useState<OtherOpinionCard[]>([]);

  // Multiple Visit & Workshop Photos
  const [photos, setPhotos] = useState<VisitPhoto[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [previewPhotoModal, setPreviewPhotoModal] = useState<VisitPhoto | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    setPhotoError(null);

    const newPhotos: VisitPhoto[] = [];
    const filesArray = Array.from(files);

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      try {
        const dataUrl = await compressPhotoToDataUrl(file, 800, 0.75);
        const timeNow = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          dataUrl,
          caption: '',
          capturedAt: timeNow,
        });
      } catch (err: any) {
        console.error('Photo processing failed:', err);
        setPhotoError('Some images could not be loaded. Please try standard JPG or PNG images.');
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    setIsProcessingPhotos(false);
    if (e.target) e.target.value = '';
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleUpdatePhotoCaption = (photoId: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, caption } : p))
    );
  };

  const [formError, setFormError] = useState<string | null>(null);

  const captureGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatusMsg('GPS geolocation not supported on this device.');
      return;
    }

    setIsDetectingGps(true);
    setGpsStatusMsg('Acquiring precise satellite GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setLatitude(lat);
        setLongitude(lng);
        setLocationAccuracy(acc);

        const mapsLink = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        setGpsLocationLink(mapsLink);
        setGpsStatusMsg(`✓ GPS Tagged: ${lat.toFixed(5)}, ${lng.toFixed(5)} (±${acc}m accuracy)`);
        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsStatusMsg('Tap to retry GPS tagging or enter address below.');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const handleStateChange = (newState: string) => {
    setState(newState);
    const districts = POPULAR_DISTRICTS[newState];
    if (districts && districts.length > 0) {
      setDistrict(districts[0]);
    } else {
      setDistrict('');
    }
  };

  const toggleCompetitor = (comp: string) => {
    setSelectedCompetitors((prev) =>
      prev.includes(comp) ? prev.filter((item) => item !== comp) : [...prev, comp]
    );
  };

  const addCustomCompetitor = () => {
    const trimmed = customCompetitor.trim();
    if (trimmed && !selectedCompetitors.includes(trimmed)) {
      setSelectedCompetitors((prev) => [...prev, trimmed]);
      setCustomCompetitor('');
    }
  };

  // Add person button handler
  const handleAddPerson = () => {
    setAdditionalContacts((prev) => [
      ...prev,
      {
        id: `person-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        designation: 'Workshop Supervisor',
        mobileNumber: '',
        notes: '',
      },
    ]);
  };

  const handleUpdatePerson = (id: string, field: keyof AdditionalContact, value: string) => {
    setAdditionalContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemovePerson = (id: string) => {
    setAdditionalContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Other Opinion Cards handlers
  const handleAddOpinionCard = (presetTitle?: string) => {
    setOtherOpinionCards((prev) => [
      ...prev,
      {
        id: `opinion-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: presetTitle || 'Pricing Opinion',
        content: '',
      },
    ]);
  };

  const handleUpdateOpinionCard = (id: string, field: 'title' | 'content', value: string) => {
    setOtherOpinionCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveOpinionCard = (id: string) => {
    setOtherOpinionCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !mobileNumber.trim()) {
      setFormError('Please enter Customer / Owner Name and Mobile Number before submitting.');
      return;
    }
    setFormError(null);

    const now = new Date();
    const todayYMD = now.toISOString().split('T')[0];
    const liveTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const formattedSubmit = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ', ' + liveTime;

    const activeExecutive = user?.displayName || defaultExecutiveName || 'nagarjuna';

    const validPersons = additionalContacts.filter((c) => c.name.trim() || c.mobileNumber.trim());
    const validOpinions = otherOpinionCards.filter((o) => o.content.trim() || o.title.trim());

    const newVisit: CustomerVisit = {
      id: `scraft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      salesExecutiveName: activeExecutive,
      executiveEmail: user?.email || 'nagarjuna@scraft.in',
      userId: user?.uid,
      customerVisitDate: todayYMD,
      customerVisitTime: liveTime,
      submittedAt: formattedSubmit,
      customerName: customerName.trim(),
      contactDesignation: contactDesignation.trim(),
      mobileNumber: mobileNumber.trim(),
      companyName: companyName.trim() || customerName.trim(),
      customerType,
      gstNumber: gstNumber.trim().toUpperCase() || undefined,
      state,
      district: district.trim() || state,
      city: city.trim() || district || state,
      customerAddress: customerAddress.trim(),
      gpsLocationLink: gpsLocationLink.trim() || undefined,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      locationAccuracy: locationAccuracy ?? undefined,
      gpsCapturedAt: gpsLocationLink ? now.toISOString() : undefined,
      brand,
      interestedSeries: undefined,
      interestedBrand: brand,
      currentBrand: selectedCompetitors.length > 0 ? selectedCompetitors.join(', ') : 'None',
      currentBrands: selectedCompetitors.length > 0 ? selectedCompetitors : undefined,
      quantityPerMonth: quantityPerMonth.trim() || 'Pending Estimation',
      piSent,
      leadStatus,
      followUpDate,
      visitRemarks: conversation.trim() || 'Customer visit logged.',
      additionalContacts: validPersons.length > 0 ? validPersons : undefined,
      otherOpinionCards: validOpinions.length > 0 ? validOpinions : undefined,
      photos: photos.length > 0 ? photos : undefined,
      createdAt: now.getTime(),
    };

    onSubmitVisit(newVisit);

    // Reset customer-specific inputs for the next visit entry
    setCustomerName('');
    setMobileNumber('');
    setCompanyName('');
    setGstNumber('');
    setCity('');
    setCustomerAddress('');
    setQuantityPerMonth('');
    setConversation('');
    setOtherOpinionCards([]);
    setPhotos([]);
    setSelectedCompetitors([]);
    setAdditionalContacts([]);
    captureGpsLocation();
  };

  const executiveDisplayName = user?.displayName || defaultExecutiveName || 'nagarjuna';
  const executiveRole = (user?.role || 'sales').toUpperCase();
  const executiveTerritory = user?.assignedState || state || 'All-India';

  return (
    <div className="space-y-4 pb-12">
      {/* FORM START */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-2xl text-rose-200 text-xs font-semibold flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
            <span>{formError}</span>
          </div>
        )}

        {/* SECTION 1: CUSTOMER & FABRICATOR PROFILE */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-400" />
              <span>1. Customer & Fabricator Details</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Step 1 of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Customer Contact Name */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Customer / Owner Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. K. Venkat Reddy"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder:text-slate-600 outline-none transition font-medium"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Mobile Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold text-xs">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={mobileNumber.replace(/^\+91\s*/, '')}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="94401 23456"
                  maxLength={14}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-11 pr-3 py-2.5 text-white font-mono placeholder:text-slate-600 outline-none transition font-medium"
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Contact Designation
              </label>
              <select
                value={contactDesignation}
                onChange={(e) => setContactDesignation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none transition font-medium"
              >
                {COMMON_DESIGNATIONS.map((des) => (
                  <option key={des} value={des}>
                    {des}
                  </option>
                ))}
              </select>
            </div>

            {/* Company / Firm Name */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Company / Workshop Firm Name
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Sri Balaji uPVC Window Systems"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder:text-slate-600 outline-none transition font-medium"
                />
              </div>
            </div>

            {/* Customer Type */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Customer Type
              </label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none transition font-medium"
              >
                {CUSTOMER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* GST Number */}
            <div>
              <label className="text-slate-300 font-bold block mb-1 flex items-center justify-between">
                <span>GSTIN Number</span>
                <span className="text-[10px] text-slate-500 font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 36AABCS1234F1Z1"
                maxLength={15}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white font-mono placeholder:text-slate-600 outline-none transition font-medium uppercase"
              />
            </div>
          </div>

          {/* SIMPLY PLACE ONE BUTTON: "+ Add Person" */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            {additionalContacts.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                  Additional Personnel / Directors ({additionalContacts.length}):
                </span>
                {additionalContacts.map((c, idx) => (
                  <div
                    key={c.id}
                    className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs relative shadow-inner"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-slate-900">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        <span>Person #{idx + 1}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePerson(c.id)}
                        className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                          Person Name
                        </label>
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => handleUpdatePerson(c.id, 'name', e.target.value)}
                          placeholder="e.g. Ramesh Reddy"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-2.5 py-1.5 text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                          Role / Designation
                        </label>
                        <input
                          type="text"
                          value={c.designation}
                          onChange={(e) => handleUpdatePerson(c.id, 'designation', e.target.value)}
                          placeholder="e.g. Partner, Supervisor, MD"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-2.5 py-1.5 text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={c.mobileNumber}
                          onChange={(e) => handleUpdatePerson(c.id, 'mobileNumber', e.target.value)}
                          placeholder="+91 98480 12345"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* The single clean Add Person button */}
            <button
              type="button"
              onClick={handleAddPerson}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-sky-500/50 hover:border-sky-400 bg-sky-950/20 hover:bg-sky-950/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>+ Add Person</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: LOCATION & GPS TAGGING */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>2. Location & GPS Geo-Tag</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Step 2 of 4</span>
          </div>

          {/* Quick GPS Tag Button */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Factory / Workshop GPS Coordinate</span>
              </span>
              <p className="text-[11px] text-slate-400">
                {gpsStatusMsg || 'Tap button to tag customer location directly from your device GPS.'}
              </p>
            </div>

            <button
              type="button"
              onClick={captureGpsLocation}
              disabled={isDetectingGps}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              {isDetectingGps ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Tagging GPS...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{gpsLocationLink ? 'Re-Tag GPS' : 'Tag GPS Location'}</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            {/* State */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">State</label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none transition font-medium"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none transition font-medium"
              >
                {(POPULAR_DISTRICTS[state] || [district || state]).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* City / Industrial Area */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">City / Industrial Area</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kukatpally IDA"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-600 outline-none transition font-medium"
              />
            </div>
          </div>

          {/* Full Address */}
          <div className="text-xs">
            <label className="text-slate-300 font-bold block mb-1">
              Customer Workshop / Site Address
            </label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="e.g. Plot 55, Phase II, Kukatpally Industrial Area, Hyderabad"
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-600 outline-none transition font-medium"
            />
          </div>
        </div>

        {/* SECTION 3: uPVC PRODUCTS & COMPETITORS (Series removed as requested) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>3. uPVC Product Requirements & Competitors</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Step 3 of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Preferred Brand */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">Interested Brand</label>
              <div className="grid grid-cols-3 gap-2">
                {(['S CRAFT', 'SMART', 'OTHERS'] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrand(b)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition border active:scale-95 ${
                      brand === b
                        ? 'bg-sky-600 border-sky-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Volume */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Estimated Monthly Volume
              </label>
              <input
                type="text"
                value={quantityPerMonth}
                onChange={(e) => setQuantityPerMonth(e.target.value)}
                placeholder="e.g. 5 MT / Month (or 800 Bars)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-600 outline-none transition font-medium"
              />
            </div>
          </div>

          {/* Competitor Brands in Use */}
          <div className="text-xs space-y-2">
            <label className="text-slate-300 font-bold block">
              Current Competitor Brands Used by Fabricator
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Kommerling',
                'Prominance',
                'NCL VEKA',
                'Aluplast',
                'Deceuninck',
                'Plastone',
                'Simta Astrix',
                'Eurocell',
              ].map((comp) => {
                const isSelected = selectedCompetitors.includes(comp);
                return (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => toggleCompetitor(comp)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {comp}
                  </button>
                );
              })}
            </div>

            {/* Custom competitor input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customCompetitor}
                onChange={(e) => setCustomCompetitor(e.target.value)}
                placeholder="Other competitor brand (e.g. Rehau, Fenesta)..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition"
              />
              <button
                type="button"
                onClick={addCustomCompetitor}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition shrink-0 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: DEAL STAGE & FOLLOW-UP (Conversation & Other Opinion Cards) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-400" />
              <span>4. Deal Stage & Follow-Up</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Step 4 of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            {/* Lead Status */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">Lead Stage</label>
              <select
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none transition font-bold"
              >
                {LEAD_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* PI Sent */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Proforma Invoice (PI) Status
              </label>
              <select
                value={piSent}
                onChange={(e) => setPiSent(e.target.value as PISentStatus)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none transition font-bold"
              >
                <option value="No">No - Pending</option>
                <option value="Under Preparation">Under Preparation</option>
                <option value="Yes">Yes - Dispatched</option>
              </select>
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Next Follow-Up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none transition font-medium"
              />
            </div>
          </div>

          {/* CONVERSATION FIELD (Renamed from Visit Discussion & Remarks) */}
          <div className="text-xs">
            <label className="text-slate-300 font-bold block mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Conversation</span> <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Discussion details with fabricator</span>
            </label>
            <textarea
              rows={3}
              required
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              placeholder="e.g. Corner weld tests, profile chambers discussed, pricing expectations, sample corner requirements, projects in hand..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl p-3 text-white placeholder:text-slate-600 outline-none transition font-medium"
            />
          </div>

          {/* OTHER OPINION CARDS */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Other Opinion & Feedback Cards</span>
              </span>
              <button
                type="button"
                onClick={() => handleAddOpinionCard()}
                className="px-2.5 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Opinion Card</span>
              </button>
            </div>

            {/* Quick Presets - Flex wrap to avoid scrollbar */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 font-semibold shrink-0">Quick presets:</span>
              {COMMON_OPINION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddOpinionCard(preset)}
                  className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-[10px] text-slate-400 hover:text-indigo-300 font-medium transition shrink-0 active:scale-95 cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {/* Rendered Opinion Cards */}
            {otherOpinionCards.length > 0 && (
              <div className="space-y-2.5 pt-1">
                {otherOpinionCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 shadow-inner"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => handleUpdateOpinionCard(card.id, 'title', e.target.value)}
                          placeholder="Opinion Title (e.g. Pricing, Credit, Quality)"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-indigo-300 font-bold outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOpinionCard(card.id)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={card.content}
                      onChange={(e) => handleUpdateOpinionCard(card.id, 'content', e.target.value)}
                      placeholder="Enter customer opinion, market feedback, competitor terms, or specific request..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-2 text-xs text-white placeholder:text-slate-600 outline-none resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. MULTI-PHOTO UPLOAD & WORKSHOP GALLERY SECTION */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Visit & Workshop Photos</span>
                  {photos.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {photos.length} Photo{photos.length > 1 ? 's' : ''}
                    </span>
                  )}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Upload fabricator workshop, showroom samples, visiting cards, machinery or corner tests
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoFilesSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handlePhotoFilesSelect}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                {/* Camera Capture Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessingPhotos}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Take photo using device camera"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Camera</span>
                </button>

                {/* Multi-photo file picker */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingPhotos}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPhotos ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>+ Add Photos</span>
                </button>
              </div>
            </div>

            {photoError && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center justify-between">
                <span>{photoError}</span>
                <button
                  type="button"
                  onClick={() => setPhotoError(null)}
                  className="text-rose-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {isProcessingPhotos && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs text-emerald-300">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Optimizing & compressing photo(s)...</span>
              </div>
            )}

            {/* Photo Grid Preview */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative bg-slate-950 border border-slate-800 rounded-2xl p-2 space-y-2 hover:border-slate-700 transition"
                  >
                    {/* Thumbnail with overlay view button */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80">
                      <img
                        src={photo.dataUrl}
                        alt={photo.caption || `Visit Photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200 cursor-pointer"
                        onClick={() => setPreviewPhotoModal(photo)}
                      />
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewPhotoModal(photo)}
                          className="p-1 rounded-lg bg-black/70 hover:bg-black text-white transition cursor-pointer"
                          title="View Full Size"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="p-1 rounded-lg bg-rose-950/80 hover:bg-rose-600 text-white transition cursor-pointer"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {photo.capturedAt && (
                        <span className="absolute bottom-1 left-1.5 text-[9px] font-mono bg-black/70 px-1.5 py-0.5 rounded text-slate-300">
                          {photo.capturedAt}
                        </span>
                      )}
                    </div>

                    {/* Caption input */}
                    <div>
                      <input
                        type="text"
                        value={photo.caption || ''}
                        onChange={(e) => handleUpdatePhotoCaption(photo.id, e.target.value)}
                        placeholder="Add caption (e.g. Workshop Front)..."
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-2 py-1 text-[11px] text-slate-200 placeholder:text-slate-600 outline-none"
                      />
                      {/* Quick caption presets */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {['Workshop', 'Sample', 'Visiting Card', 'Corner Joint'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleUpdatePhotoCaption(photo.id, tag)}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-300 transition cursor-pointer"
                          >
                            +{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/50 flex flex-col items-center justify-center text-center cursor-pointer transition group"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
                  <Camera className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-300 group-hover:text-emerald-400 transition">
                  Click to add workshop & fabricator visit photos
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Multiple photos supported (gallery & camera) • Auto-optimized for instant cloud sync
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SUBMISSION ACTION BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-xl shadow-sky-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <Send className="w-5 h-5 group-hover:translate-x-0.5 transition" />
            <span>Submit Customer Visit Entry</span>
          </button>
          <p className="text-[11px] text-center text-slate-400 mt-2">
            Auto-recorded as <b className="text-white">{executiveDisplayName}</b> • Current Date & Time stamped automatically upon submit
          </p>
        </div>
      </form>

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL (PORTAL) */}
      {previewPhotoModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setPreviewPhotoModal(null);
            }}
          >
            <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    {previewPhotoModal.caption || 'Visit Photo Preview'}
                  </span>
                  {previewPhotoModal.capturedAt && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({previewPhotoModal.capturedAt})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoModal(null)}
                  className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
                <img
                  src={previewPhotoModal.dataUrl}
                  alt={previewPhotoModal.caption || 'Visit Photo'}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {previewPhotoModal.caption || 'No caption provided'}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoModal(null)}
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
