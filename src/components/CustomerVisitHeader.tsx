import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppUser } from '../services/firebaseAuth';
import {
  FileSpreadsheet,
  FileText,
  LogOut,
  CheckCircle2,
  RefreshCw,
  Cloud,
  ChevronDown,
  Edit3,
  Camera,
  Upload,
  Trash2,
  X,
  Check,
  Building,
  Image as ImageIcon,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';

interface CustomerVisitHeaderProps {
  user: AppUser | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onExportExcel: () => void;
  onExportPdf: () => void;
  visitCount: number;
  isCloudConnected?: boolean;
  onForceSync?: () => void;
  isSyncing?: boolean;
}

// Built-in high-quality SVG/Color Preset Logos for quick 1-tap branding
const PRESET_LOGOS = [
  {
    id: 'scraft-blue',
    name: 'S CRAFT Blue',
    bg: 'from-blue-600 via-sky-500 to-indigo-700',
    text: 'SCRAFT',
    sub: 'uPVC',
  },
  {
    id: 'raviraja-royal',
    name: 'Raviraja Gold',
    bg: 'from-amber-500 via-orange-600 to-amber-700',
    text: 'RAVIRAJ',
    sub: 'IND',
  },
  {
    id: 'smart-green',
    name: 'SMART Profiles',
    bg: 'from-emerald-500 via-teal-600 to-cyan-700',
    text: 'SMART',
    sub: 'uPVC',
  },
  {
    id: 'upvc-classic',
    name: 'Classic Gradient',
    bg: 'from-sky-500 via-indigo-600 to-blue-700',
    text: 'uPVC',
    sub: 'PRO',
  },
];

/**
 * Resizes and compresses any user-uploaded image file down to a lightweight,
 * high-clarity data URL (max 256x256) so it never fails localStorage quota limits.
 */
function compressImageToDataUrl(file: File, maxDim: number = 256): Promise<string> {
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

        // Draw with crisp smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as PNG dataUrl
        const compressed = canvas.toDataURL('image/png', 0.9);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Failed to parse uploaded image.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

export const CustomerVisitHeader: React.FC<CustomerVisitHeaderProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  onExportExcel,
  onExportPdf,
  visitCount,
  isCloudConnected = true,
  onForceSync,
  isSyncing = false,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Custom Company Branding & Logo State (persisted locally)
  const [appTitle, setAppTitle] = useState(() => {
    const saved = localStorage.getItem('scraft_app_title');
    if (!saved || saved === 'SCRAFT uPVC Profiles' || saved.includes('Customer Visits')) {
      localStorage.setItem('scraft_app_title', 'SCRAFT uPVC Sales Tracker');
      return 'SCRAFT uPVC Sales Tracker';
    }
    return saved;
  });
  const [appSubtitle, setAppSubtitle] = useState(
    () =>
      localStorage.getItem('scraft_app_subtitle') ||
      'Raviraja Industries • Multi-Brands'
  );
  const [appLogo, setAppLogo] = useState<string | null>(
    () => localStorage.getItem('scraft_app_logo') || null
  );

  // Edit Brand Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(appTitle);
  const [editSubtitle, setEditSubtitle] = useState(appSubtitle);
  const [editLogo, setEditLogo] = useState<string | null>(appLogo);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Escape key and body scroll lock for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditModalOpen) {
        setIsEditModalOpen(false);
      }
    };
    if (isEditModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isEditModalOpen]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEdit = () => {
    setEditTitle(appTitle);
    setEditSubtitle(appSubtitle);
    setEditLogo(appLogo);
    setUrlInput('');
    setUploadError(null);
    setIsEditModalOpen(true);
  };

  // Process File and compress
  const processAndSetLogo = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 256);
      setEditLogo(compressedDataUrl);
      setAppLogo(compressedDataUrl);
      try {
        localStorage.setItem('scraft_app_logo', compressedDataUrl);
      } catch (err) {
        console.warn('Storage quota notice:', err);
      }
    } catch (err: any) {
      console.error(err);
      setUploadError('Failed to process image. Please try another PNG or JPG.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndSetLogo(file);
    if (e.target) e.target.value = '';
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      setEditLogo(trimmed);
      setUrlInput('');
    }
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = editTitle.trim() || 'SCRAFT uPVC Sales Tracker';
    const finalSubtitle =
      editSubtitle.trim() || 'Raviraja Industries • Multi-Brands';

    setAppTitle(finalTitle);
    setAppSubtitle(finalSubtitle);
    setAppLogo(editLogo);
    document.title = finalTitle;

    try {
      localStorage.setItem('scraft_app_title', finalTitle);
      localStorage.setItem('scraft_app_subtitle', finalSubtitle);
      if (editLogo) {
        localStorage.setItem('scraft_app_logo', editLogo);
      } else {
        localStorage.removeItem('scraft_app_logo');
      }
      window.dispatchEvent(
        new CustomEvent('scraft-brand-updated', {
          detail: { title: finalTitle, subtitle: finalSubtitle, logo: editLogo },
        })
      );
    } catch (err) {
      console.warn('Local storage write warning:', err);
    }

    setIsEditModalOpen(false);
  };

  const handleResetToDefault = () => {
    const defTitle = 'SCRAFT uPVC Sales Tracker';
    const defSub = 'Raviraja Industries • Multi-Brands';
    setEditTitle(defTitle);
    setEditSubtitle(defSub);
    setEditLogo(null);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-4 py-2.5 shadow-md backdrop-blur-md bg-opacity-95">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Brand identity (Editable Logo & Company Name) */}
        <div className="flex items-center gap-2">
          {/* Clean, uncluttered Logo */}
          <button
            type="button"
            onClick={handleOpenEdit}
            className="relative shrink-0 cursor-pointer focus:outline-none transition hover:scale-105 active:scale-95 group"
            title="Click to customize logo and company title"
          >
            {appLogo ? (
              <img
                src={appLogo}
                alt={appTitle}
                className="w-8 h-8 rounded-xl object-contain bg-slate-950 border border-slate-700/80 shadow-sm group-hover:border-sky-400 transition"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-blue-700 flex items-center justify-center text-white font-black text-xs text-center leading-none shadow-sm group-hover:border group-hover:border-sky-400 transition">
                uPVC
              </div>
            )}
          </button>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1
                onClick={handleOpenEdit}
                className="text-xs sm:text-sm font-extrabold tracking-tight text-white leading-tight cursor-pointer hover:text-sky-300 transition flex items-center gap-1 group"
                title="Click to edit company name and title"
              >
                <span>{appTitle}</span>
                <Edit3 className="w-2.5 h-2.5 text-slate-500 group-hover:text-sky-400 transition shrink-0" />
              </h1>

              {/* LIVE SYNC STATUS BADGE */}
              <button
                type="button"
                onClick={onForceSync}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border transition active:scale-95 ${
                  isCloudConnected
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                }`}
                title="Click to force sync all records across devices"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                ></span>
                <span className="hidden sm:inline">
                  {isSyncing ? 'SYNCING...' : isCloudConnected ? 'LIVE SYNC' : 'OFFLINE'}
                </span>
                <RefreshCw
                  className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-emerald-300' : ''}`}
                />
              </button>
            </div>
            <p
              onClick={handleOpenEdit}
              className="text-[9px] text-slate-400 leading-tight truncate max-w-[200px] sm:max-w-none cursor-pointer hover:text-slate-300 transition"
              title="Click to edit subtitle"
            >
              {appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Manual Cloud Push & Sync Button */}
          {onForceSync && (
            <button
              type="button"
              onClick={onForceSync}
              disabled={isSyncing}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition active:scale-95 disabled:opacity-50"
              title="Force Sync All Records to Cloud Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          )}

          {/* Quick Excel Export */}
          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            title="Download Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {/* Quick PDF Export */}
          <button
            type="button"
            onClick={onExportPdf}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-sm transition active:scale-95"
            title="Download PDF Report"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Google / Gmail Connected Profile */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1 p-1 rounded-full hover:ring-2 hover:ring-sky-500/50 transition bg-slate-800 border border-slate-700"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Executive'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {user.email ? user.email[0].toUpperCase() : 'R'}
                  </div>
                )}
                <span className="hidden md:inline text-[11px] font-medium text-slate-200 max-w-[120px] truncate pr-1">
                  {user.email}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 text-xs">
                  <div className="pb-2 border-b border-slate-700 mb-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-bold text-white truncate">
                        {user.displayName || 'Sales Executive'}
                      </p>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${user.role === 'admin' ? 'bg-amber-500 text-slate-950' : 'bg-sky-500 text-slate-950'}`}>
                        {(user.role || 'sales').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-300 font-mono truncate">{user.mobileNumber || user.email}</p>
                    {user.designation && (
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{user.designation}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Live Synced Across Devices</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      handleOpenEdit();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-slate-700 text-slate-200 flex items-center gap-2 transition mb-1 text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Edit Company Logo & Name</span>
                  </button>

                  {onForceSync && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onForceSync();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-slate-700 text-slate-200 flex items-center gap-2 transition mb-1 text-xs"
                    >
                      <Cloud className="w-3.5 h-3.5 text-sky-400" />
                      <span>Force Push & Sync All Records</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-60"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{isLoggingIn ? 'Connecting...' : 'Connect'}</span>
            </button>
          )}
        </div>
      </div>

      {/* FULLY SCROLLABLE & CENTERED EDIT BRAND & LOGO MODAL (PORTAL TO BODY) */}
      {isEditModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsEditModalOpen(false);
            }}
          >
            <div className="relative bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-5 space-y-4 shadow-2xl my-auto no-scrollbar">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Edit Company Branding & Logo</h3>
                    <p className="text-[10px] text-slate-400">Set custom logo image and edit app company header</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                    {uploadError}
                  </div>
                )}

                {/* 1. LOGO UPLOAD & PREVIEW SECTION */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-sky-400" />
                      <span>Company Logo</span>
                    </label>
                    {editLogo && (
                      <button
                        type="button"
                        onClick={() => setEditLogo(null)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Current Active Preview */}
                    <div className="shrink-0">
                      {editLogo ? (
                        <div className="relative">
                          <img
                            src={editLogo}
                            alt="Logo Preview"
                            className="w-16 h-16 rounded-2xl object-contain bg-slate-900 border-2 border-sky-500/60 p-1 shadow-lg"
                          />
                          <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[9px] font-bold px-1 rounded-full">
                            ✓
                          </span>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-blue-700 flex flex-col items-center justify-center text-white font-black text-sm shadow-md shadow-sky-500/20">
                          <span>uPVC</span>
                          <span className="text-[9px] font-normal opacity-80">Default</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold transition flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-sky-600/20 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUploading ? 'Compressing...' : 'Upload Logo From Device'}</span>
                      </button>

                      <p className="text-[10px] text-slate-400 leading-tight">
                        Supports JPG, PNG, WEBP, or SVG. Auto-compressed for instant loading.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Quick Preset Badges */}
                  <div className="pt-2 border-t border-slate-900 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Or select pre-styled logo badge:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_LOGOS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            // Create an inline canvas badge
                            const canvas = document.createElement('canvas');
                            canvas.width = 128;
                            canvas.height = 128;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.fillStyle =
                                p.id === 'scraft-blue'
                                  ? '#0284c7'
                                  : p.id === 'raviraja-royal'
                                  ? '#d97706'
                                  : p.id === 'smart-green'
                                  ? '#059669'
                                  : '#4f46e5';
                              ctx.roundRect ? ctx.roundRect(0, 0, 128, 128, 24) : ctx.rect(0, 0, 128, 128);
                              ctx.fill();
                              ctx.fillStyle = '#ffffff';
                              ctx.font = 'bold 24px sans-serif';
                              ctx.textAlign = 'center';
                              ctx.fillText(p.text, 64, 64);
                              ctx.font = '14px sans-serif';
                              ctx.fillText(p.sub, 64, 88);
                              setEditLogo(canvas.toDataURL('image/png'));
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 flex items-center gap-2 text-left transition active:scale-95 cursor-pointer"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${p.bg} flex items-center justify-center text-white font-extrabold text-[9px] shrink-0`}
                          >
                            {p.text.substring(0, 2)}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-300 truncate">
                            {p.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. COMPANY / APP NAME */}
                <div>
                  <label className="font-bold text-slate-200 block mb-1">
                    Company / App Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. SCRAFT uPVC Sales Tracker"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none font-bold text-xs"
                  />
                </div>

                {/* 3. SUBTITLE / ORGANIZATION */}
                <div>
                  <label className="font-bold text-slate-200 block mb-1">
                    Subtitle / Organization <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    placeholder="e.g. Raviraja Industries • Multi-Brands"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-white outline-none text-xs"
                  />
                </div>

                {/* MODAL FOOTER BUTTONS */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-slate-400 hover:text-slate-200 text-xs font-semibold underline cursor-pointer"
                  >
                    Reset Defaults
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-600/30 active:scale-95 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
