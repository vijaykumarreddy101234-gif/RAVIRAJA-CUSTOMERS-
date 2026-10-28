import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building,
  User,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Flame,
  CheckCircle,
  FileText,
  Trash2,
  Package,
  Layers,
  Save,
  FileBadge,
  Navigation,
  ExternalLink,
  Sparkles,
  Users,
  Briefcase,
  Clock,
  Camera,
  Image as ImageIcon,
  Eye,
  Plus,
  Loader2,
} from 'lucide-react';
import { CustomerVisit, LeadStatus, PISentStatus, VisitPhoto } from '../types/customerVisit';

interface CustomerVisitDetailModalProps {
  visit: CustomerVisit | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateVisit: (updated: CustomerVisit) => void;
  onDeleteVisit: (id: string) => void;
}

interface ModalContentProps {
  visit: CustomerVisit;
  onClose: () => void;
  onUpdateVisit: (updated: CustomerVisit) => void;
  onDeleteVisit: (id: string) => void;
}

/**
 * Compresses visit/workshop photos to crisp, lightweight data URLs (max 800px, JPEG 0.75)
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

const ModalContent: React.FC<ModalContentProps> = ({
  visit,
  onClose,
  onUpdateVisit,
  onDeleteVisit,
}) => {
  const [leadStatus, setLeadStatus] = useState<LeadStatus>(visit.leadStatus);
  const [piSent, setPiSent] = useState<PISentStatus>(visit.piSent);
  const [followUpDate, setFollowUpDate] = useState(visit.followUpDate || '');
  const [remarks, setRemarks] = useState(visit.visitRemarks || '');

  // Attached Photos State
  const [photos, setPhotos] = useState<VisitPhoto[]>(visit.photos || []);
  const [previewPhotoModal, setPreviewPhotoModal] = useState<VisitPhoto | null>(null);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
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
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    setIsProcessingPhotos(false);
    if (e.target) e.target.value = '';
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSave = () => {
    onUpdateVisit({
      ...visit,
      leadStatus,
      piSent,
      followUpDate,
      visitRemarks: remarks,
      photos: photos.length > 0 ? photos : undefined,
      updatedAt: Date.now(),
    });
    onClose();
  };

  const cleanPhone = visit.mobileNumber.replace(/[^0-9]/g, '');

  const visitBrand =
    visit.brand ||
    (visit.interestedBrand.includes('SMART')
      ? 'SMART'
      : visit.interestedBrand.includes('SCRAFT') || visit.interestedBrand.includes('S CRAFT')
      ? 'S CRAFT'
      : 'OTHERS');

  const visitSeries =
    visit.interestedSeries ||
    visit.interestedBrand.replace(/^.*-\s*/, '') ||
    visit.interestedBrand;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 space-y-4 shadow-2xl no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">
              uPVC Profile Visit File
            </span>
            <h3 className="text-lg font-black text-white leading-tight mt-0.5">
              {visit.companyName || visit.customerName}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-sky-300 font-semibold flex items-center gap-1 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800">
                <User className="w-3 h-3 text-sky-400" />
                <span>Dealt by Sales Executive: <strong className="text-white">{visit.salesExecutiveName}</strong></span>
              </span>
              <span className="text-[11px] text-slate-300 flex items-center gap-1 font-medium bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{visit.customerVisitDate}</span>
                {visit.customerVisitTime && (
                  <span className="text-cyan-300 font-mono font-semibold">({visit.customerVisitTime})</span>
                )}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Communication & Share Link Bar */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`tel:${visit.mobileNumber}`}
            className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-900/30"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-900/30"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat</span>
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `*SCRAFT uPVC Visit Report*\n` +
              `Company: ${visit.companyName || visit.customerName}\n` +
              `Customer: ${visit.customerName} (${visit.contactDesignation || 'Owner'})\n` +
              `Mobile: ${visit.mobileNumber}\n` +
              `Location: ${visit.city}, ${visit.state}\n` +
              `Series: ${visit.interestedBrand} (${visit.quantityPerMonth})\n` +
              `Status: ${visit.leadStatus} | PI: ${visit.piSent}\n` +
              `Executive: ${visit.salesExecutiveName}\n` +
              (visit.gpsLocationLink ? `📍 GPS: ${visit.gpsLocationLink}\n` : '') +
              `Remarks: ${visit.visitRemarks || 'N/A'}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-900/30"
            title="Share visit summary report & link via WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </a>
        </div>

        {/* Core Profile Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[10px] text-slate-400 block">Contact Person</span>
              <span className="text-[9px] font-bold text-sky-300 bg-sky-950/80 border border-sky-800/60 px-1.5 py-0.2 rounded truncate max-w-[105px]">
                {visit.contactDesignation || 'Owner / Proprietor'}
              </span>
            </div>
            <p className="font-bold text-white">{visit.customerName}</p>
            <span className="text-[11px] text-slate-400 font-mono">{visit.mobileNumber}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Customer Type</span>
            <p className="font-bold text-white mt-0.5">{visit.customerType}</p>
            <span className="text-[11px] text-sky-400 font-medium">Field Visit Entry</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Location</span>
            <p className="font-bold text-white mt-0.5">{visit.city || visit.district}</p>
            <span className="text-[11px] text-slate-400">{visit.state}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Visit Date</span>
            <p className="font-bold text-white mt-0.5">{visit.customerVisitDate}</p>
            <span className="text-[11px] text-slate-400">By: {visit.salesExecutiveName}</span>
          </div>
        </div>

        {/* Additional Directors, Supervisors & Unit Personnel Card */}
        {visit.additionalContacts && visit.additionalContacts.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs shadow-inner">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Unit Key Personnel ({visit.additionalContacts.length})</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Directors, Supervisors & Partners
              </span>
            </div>

            <div className="space-y-2">
              {visit.additionalContacts.map((contact, idx) => {
                const cPhoneClean = contact.mobileNumber.replace(/[^0-9]/g, '');
                return (
                  <div
                    key={contact.id || idx}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between gap-2.5 hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-xs truncate">
                          {contact.name || `Personnel #${idx + 1}`}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          {contact.designation || 'Supervisor'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300 font-mono block mt-0.5">
                        {contact.mobileNumber || 'No direct phone logged'}
                      </span>
                      {contact.notes && (
                        <span className="text-[10px] text-slate-400 italic block mt-0.5 truncate">
                          "{contact.notes}"
                        </span>
                      )}
                    </div>

                    {/* Direct Contact Buttons for each supervisor / director */}
                    {contact.mobileNumber && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`tel:${contact.mobileNumber}`}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white transition text-[11px] font-semibold shadow-sm"
                          title={`Call ${contact.name}`}
                        >
                          <Phone className="w-3 h-3" />
                          <span className="hidden sm:inline">Call</span>
                        </a>
                        <a
                          href={`https://wa.me/${cPhoneClean}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition text-[11px] font-semibold shadow-sm"
                          title={`WhatsApp ${contact.name}`}
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span className="hidden sm:inline">WA</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GPS Location Tag Link Card */}
        {visit.gpsLocationLink && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-sky-950/40 border border-rose-800/40 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-rose-400" />
                Live GPS Location Tagged
              </span>
              {visit.latitude && visit.longitude && (
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  {visit.latitude.toFixed(6)}, {visit.longitude.toFixed(6)}
                </span>
              )}
            </div>

            <a
              href={visit.gpsLocationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-sky-300 group transition"
            >
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-slate-400 block">Google Maps Link:</span>
                <span className="text-xs font-mono text-sky-400 truncate block underline">
                  {visit.gpsLocationLink}
                </span>
              </div>
              <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 text-[11px] font-bold group-hover:bg-sky-500/30">
                <span>Open Map</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          </div>
        )}

        {/* Brand & Series & Commercials */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
          {visit.gstNumber && (
            <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-sky-950/40 border border-sky-800/40">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <FileBadge className="w-3.5 h-3.5 text-sky-400" /> GST Number:
              </span>
              <span className="font-mono font-bold text-sky-300 tracking-wider">{visit.gstNumber}</span>
            </div>
          )}

          {/* Brand */}
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Brand:</span>
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-bold ${
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

          {/* Series */}
          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-400">uPVC Series:</span>
            <span className="font-bold text-white text-right max-w-[68%]">{visitSeries}</span>
          </div>

          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-400 shrink-0">Current Brand(s) Used:</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[68%]">
              {visit.currentBrands && visit.currentBrands.length > 0 ? (
                visit.currentBrands.map((b, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  >
                    {b}
                  </span>
                ))
              ) : visit.currentBrand && visit.currentBrand !== 'None' ? (
                visit.currentBrand.split(',').map((b, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  >
                    {b.trim()}
                  </span>
                ))
              ) : (
                <span className="font-medium text-slate-400">None</span>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Quantity / Month (Volume):</span>
            <span className="font-bold text-emerald-400">{visit.quantityPerMonth}</span>
          </div>

          {visit.customerAddress && (
            <div className="pt-1.5 border-t border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">Address:</span>
              <span className="text-slate-300 text-[11px]">{visit.customerAddress}</span>
            </div>
          )}
        </div>

        {/* Interactive Status Updaters */}
        <div className="space-y-3 pt-1 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Lead Status</label>
              <select
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Hot">🔥 Hot Lead</option>
                <option value="Warm">⚡ Warm Lead</option>
                <option value="Cold">❄️ Cold Lead</option>
                <option value="Won / Closed">🏆 Won / Closed</option>
                <option value="Lost">❌ Lost</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Proforma Invoice (PI)</label>
              <select
                value={piSent}
                onChange={(e) => setPiSent(e.target.value as PISentStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Yes">Yes (Dispatched)</option>
                <option value="No">No</option>
                <option value="Under Preparation">Under Preparation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Next Follow-up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Visit Remarks</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>
        </div>

        {/* Conversation Dialogue Logs View */}
        {visit.conversationLogs && visit.conversationLogs.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Conversation Dialogue Log ({visit.conversationLogs.length})</span>
            </span>
            <div className="space-y-2">
              {visit.conversationLogs.map((log, idx) => (
                <div key={log.id || idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-sky-300">
                      {log.speakerName} <span className="text-slate-400 font-normal">({log.speakerRole})</span>
                    </span>
                    {log.timestamp && <span className="text-slate-500 font-mono">{log.timestamp}</span>}
                  </div>
                  <p className="text-slate-200 text-xs">{log.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Opinion / Custom Remarks Cards View */}
        {visit.otherOpinionCards && visit.otherOpinionCards.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Other Opinion & Custom Cards ({visit.otherOpinionCards.length})</span>
            </span>
            <div className="space-y-2">
              {visit.otherOpinionCards.map((card, idx) => (
                <div key={card.id || idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300 block text-xs">{card.title}</span>
                  <p className="text-slate-300 text-xs">{card.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attached Photos & Workshop Gallery Section */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Attached Photos ({photos.length})</span>
            </span>

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

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isProcessingPhotos}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-50"
                title="Capture with camera"
              >
                <Camera className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingPhotos}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPhotos ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                <span>+ Add</span>
              </button>
            </div>
          </div>

          {photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  className="relative group rounded-xl overflow-hidden bg-slate-900 border border-slate-800"
                >
                  <img
                    src={photo.dataUrl}
                    alt={photo.caption || `Visit Photo ${idx + 1}`}
                    className="w-full aspect-video object-cover group-hover:scale-105 transition cursor-pointer"
                    onClick={() => setPreviewPhotoModal(photo)}
                  />
                  <div className="absolute top-1 right-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewPhotoModal(photo)}
                      className="p-1 rounded bg-black/70 hover:bg-black text-white transition cursor-pointer"
                      title="Enlarge"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="p-1 rounded bg-rose-950/80 hover:bg-rose-600 text-white transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {photo.caption && (
                    <div className="p-1.5 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-300 truncate">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] italic py-1">
              No photos attached to this visit entry yet. Click "+ Add" or "Camera" above to upload.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete customer visit entry for "${visit.customerName}"?`)) {
                onDeleteVisit(visit.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Updates</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal (Portal) */}
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
                    {previewPhotoModal.caption || `${visit.customerName} - Photo`}
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

              <div className="max-h-[72vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
                <img
                  src={previewPhotoModal.dataUrl}
                  alt={previewPhotoModal.caption || 'Visit Photo'}
                  className="max-h-[72vh] w-auto max-w-full object-contain"
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

export const CustomerVisitDetailModal: React.FC<CustomerVisitDetailModalProps> = ({
  visit,
  isOpen,
  onClose,
  onUpdateVisit,
  onDeleteVisit,
}) => {
  if (!isOpen || !visit) return null;

  return (
    <ModalContent
      key={visit.id}
      visit={visit}
      onClose={onClose}
      onUpdateVisit={onUpdateVisit}
      onDeleteVisit={onDeleteVisit}
    />
  );
};
