import React, { useState, useMemo, useRef } from 'react';
import {
  Scissors,
  FileSpreadsheet,
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Settings,
  Cloud,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  UPVCCutItem,
  UPVCWastageProject,
} from '../types/upvcWastage';
import { UPVCOptimizerService } from '../services/upvcOptimizer';

interface UPVCWastageCalculatorViewProps {
  onSaveToCloud?: (project: UPVCWastageProject) => Promise<void>;
  cloudProjects?: UPVCWastageProject[];
  onDeleteCloudProject?: (id: string) => Promise<void>;
  userEmail?: string | null;
}

const DEFAULT_PRESET_CUTS: UPVCCutItem[] = [
  {
    id: 'cut-1',
    profileName: 'SCRAFT 60mm Outer Frame',
    lengthMm: 1500,
    quantity: 4,
    angle: '45/45',
    tag: 'W1 Frame Width (1500mm)',
  },
  {
    id: 'cut-2',
    profileName: 'SCRAFT 60mm Outer Frame',
    lengthMm: 1200,
    quantity: 4,
    angle: '45/45',
    tag: 'W1 Frame Height (1200mm)',
  },
  {
    id: 'cut-3',
    profileName: 'SCRAFT 60mm Casement Sash',
    lengthMm: 1140,
    quantity: 4,
    angle: '45/45',
    tag: 'W1 Sash Height',
  },
  {
    id: 'cut-4',
    profileName: 'SCRAFT 60mm Casement Sash',
    lengthMm: 710,
    quantity: 4,
    angle: '45/45',
    tag: 'W1 Sash Width',
  },
  {
    id: 'cut-5',
    profileName: 'SCRAFT 60mm Mullion',
    lengthMm: 1120,
    quantity: 2,
    angle: '90/90',
    tag: 'W1 Center Mullion',
  },
  {
    id: 'cut-6',
    profileName: 'SCRAFT 2.5 Track Sliding Outer Frame',
    lengthMm: 1800,
    quantity: 4,
    angle: '45/45',
    tag: 'W2 Sliding Width',
  },
  {
    id: 'cut-7',
    profileName: 'SCRAFT 2.5 Track Sliding Outer Frame',
    lengthMm: 1350,
    quantity: 4,
    angle: '45/45',
    tag: 'W2 Sliding Height',
  },
  {
    id: 'cut-8',
    profileName: 'SCRAFT Sliding Sash Profile',
    lengthMm: 1290,
    quantity: 4,
    angle: '45/45',
    tag: 'W2 Shutter Height',
  },
];

export const UPVCWastageCalculatorView: React.FC<UPVCWastageCalculatorViewProps> = ({
  onSaveToCloud,
  cloudProjects = [],
  onDeleteCloudProject,
  userEmail,
}) => {
  const [projectName, setProjectName] = useState('Apex Fabricators - Window Batch 1');
  const [stockLengthMm, setStockLengthMm] = useState(6000); // 6.0 Meters standard
  const [kerfMm, setKerfMm] = useState(4); // 4mm saw blade kerf
  const [reusableThresholdMm, setReusableThresholdMm] = useState(800); // ≥800mm is reusable offcut
  const [profileWeightKgPerM, setProfileWeightKgPerM] = useState(1.25);
  const [costPerKgInr, setCostPerKgInr] = useState(190);
  const [showSettings, setShowSettings] = useState(false);

  const [cuts, setCuts] = useState<UPVCCutItem[]>(DEFAULT_PRESET_CUTS);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);

  // New Cut row state
  const [newProfileName, setNewProfileName] = useState('SCRAFT 60mm Casement Profile');
  const [newLengthMm, setNewLengthMm] = useState('1450');
  const [newQuantity, setNewQuantity] = useState('2');
  const [newAngle, setNewAngle] = useState<'45/45' | '90/90' | '45/90'>('45/45');
  const [newTag, setNewTag] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run Optimizer whenever cuts or parameters change
  const optimization = useMemo(() => {
    return UPVCOptimizerService.optimizeCutting(cuts, {
      stockLengthMm,
      kerfMm,
      reusableThresholdMm,
      profileWeightKgPerM,
      costPerKgInr,
    });
  }, [cuts, stockLengthMm, kerfMm, reusableThresholdMm, profileWeightKgPerM, costPerKgInr]);

  const { bars, summary } = optimization;

  const handleAddCut = (e: React.FormEvent) => {
    e.preventDefault();
    const length = parseFloat(newLengthMm);
    const qty = parseInt(newQuantity, 10);
    if (!length || length <= 0 || !qty || qty <= 0) return;

    const newItem: UPVCCutItem = {
      id: `cut-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      profileName: newProfileName.trim() || 'uPVC Profile',
      lengthMm: Math.round(length),
      quantity: qty,
      angle: newAngle,
      tag: newTag.trim() || undefined,
    };

    setCuts([newItem, ...cuts]);
    setNewTag('');
    setStatusMessage(`Added ${qty}x ${length}mm cut piece(s)`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteCut = (id: string) => {
    setCuts(cuts.filter((c) => c.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Clear all cut entries?')) {
      setCuts([]);
    }
  };

  const handleLoadPreset = () => {
    setCuts(DEFAULT_PRESET_CUTS);
    setStatusMessage('Loaded standard uPVC window cutting preset!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage('Parsing Excel / CSV cut list...');

    try {
      const parsed = await UPVCOptimizerService.parseCuttingListFile(file);
      if (parsed.length > 0) {
        setCuts(parsed);
        setStatusMessage(`✓ Loaded ${parsed.length} cut specifications from "${file.name}"!`);
      } else {
        setStatusMessage('No cut sizes detected in uploaded sheet. Please check columns.');
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Upload failed: ${err.message || 'Error parsing spreadsheet'}`);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleExportExcel = () => {
    const project: UPVCWastageProject = {
      id: `upvc-waste-${Date.now()}`,
      projectName,
      stockLengthMm,
      kerfMm,
      weldingAllowanceMm: 3,
      profileWeightKgPerM,
      costPerKgInr,
      reusableThresholdMm,
      cuts,
      optimizedBars: bars,
      summary,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdByEmail: userEmail || 'ravirajaindustries@gmail.com',
    };
    UPVCOptimizerService.exportToExcel(project);
  };

  const handleExportPdf = () => {
    const project: UPVCWastageProject = {
      id: `upvc-waste-${Date.now()}`,
      projectName,
      stockLengthMm,
      kerfMm,
      weldingAllowanceMm: 3,
      profileWeightKgPerM,
      costPerKgInr,
      reusableThresholdMm,
      cuts,
      optimizedBars: bars,
      summary,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdByEmail: userEmail || 'ravirajaindustries@gmail.com',
    };
    UPVCOptimizerService.exportToPdf(project);
  };

  const handleSaveToCloud = async () => {
    if (!onSaveToCloud) return;
    setIsSavingCloud(true);
    try {
      const project: UPVCWastageProject = {
        id: `upvc-waste-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        projectName,
        stockLengthMm,
        kerfMm,
        weldingAllowanceMm: 3,
        profileWeightKgPerM,
        costPerKgInr,
        reusableThresholdMm,
        cuts,
        optimizedBars: bars,
        summary,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdByEmail: userEmail || 'ravirajaindustries@gmail.com',
      };
      await onSaveToCloud(project);
      setStatusMessage('✓ Saved to Cloud Firestore! Synced across all devices.');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Failed to save to cloud.');
    } finally {
      setIsSavingCloud(false);
    }
  };

  // Color generator for cut pieces on stock bars
  const CUT_COLORS = [
    'bg-sky-500 border-sky-400 text-slate-950',
    'bg-indigo-500 border-indigo-400 text-white',
    'bg-emerald-500 border-emerald-400 text-slate-950',
    'bg-amber-500 border-amber-400 text-slate-950',
    'bg-purple-500 border-purple-400 text-white',
    'bg-cyan-500 border-cyan-400 text-slate-950',
    'bg-teal-500 border-teal-400 text-slate-950',
    'bg-blue-500 border-blue-400 text-white',
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Title & Brand */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
              SCRAFT uPVC Optimization
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Real-Time Wastage
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
            uPVC Profile Cutting & Wastage Calculator
          </h2>
          <p className="text-xs text-slate-400">
            Upload window cutting Excel, optimize 6.0m stock bars, and minimize scrap waste.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={bars.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 active:scale-95"
            title="Download Cutting Sheet (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={bars.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition shadow-sm disabled:opacity-50 active:scale-95"
            title="Download PDF"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>PDF</span>
          </button>
          {onSaveToCloud && (
            <button
              type="button"
              onClick={handleSaveToCloud}
              disabled={isSavingCloud || bars.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 active:scale-95"
              title="Save to Cloud"
            >
              <Cloud className="w-4 h-4" />
              <span>{isSavingCloud ? 'Saving...' : 'Sync Cloud'}</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-500/40 text-xs text-sky-200 flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* TOP WASTAGE KPI METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Wastage Percentage */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Wastage Ratio</span>
            <Scissors className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-black ${
                summary.wastagePercentage <= 5
                  ? 'text-emerald-400'
                  : summary.wastagePercentage <= 8
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {summary.wastagePercentage}%
            </span>
            <span className="text-[10px] text-slate-400">
              {summary.wastagePercentage <= 5 ? 'Excellent' : 'Calculated'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {summary.totalWastageMeters}m scrap of {summary.totalStockLengthMeters}m
          </span>
        </div>

        {/* Total Stock Bars Needed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Bars Required</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{summary.totalBarsRequired}</span>
            <span className="text-[10px] text-sky-400 font-bold">Bars (6.0m)</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {summary.totalPiecesCut} cut pieces placed
          </span>
        </div>

        {/* Reusable Offcuts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Reusable Offcuts</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400">
              {summary.reusableRemnantsCount}
            </span>
            <span className="text-[10px] text-slate-400">Pieces</span>
          </div>
          <span className="text-[10px] text-emerald-300/80">
            {summary.reusableRemnantsMeters}m reusable (≥{reusableThresholdMm}mm)
          </span>
        </div>

        {/* Estimated Cost Loss in INR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Financial Loss</span>
            <span className="text-amber-400 font-bold">₹ INR</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-400">
              ₹{summary.estimatedCostLossInr.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {summary.estimatedWastageKg} kg @ ₹{costPerKgInr}/kg
          </span>
        </div>
      </div>

      {/* EXCEL IMPORT & PRESET CONTROLS CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Upload Window Cutting Excel / Sheet</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Upload your fabricator cutting list (.xlsx, .csv) with length (mm), quantity, and profile.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Reading file...' : 'Upload Cut List Excel'}</span>
            </button>
            <button
              type="button"
              onClick={handleLoadPreset}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Load 2-Track Preset</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Cutting Parameters"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Cutting Parameters */}
        {showSettings && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Stock Bar Length</label>
              <div className="flex items-center bg-slate-800 rounded-xl px-2.5 py-1 border border-slate-700">
                <input
                  type="number"
                  value={stockLengthMm}
                  onChange={(e) => setStockLengthMm(Number(e.target.value) || 6000)}
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 ml-1">mm</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Saw Blade Kerf</label>
              <div className="flex items-center bg-slate-800 rounded-xl px-2.5 py-1 border border-slate-700">
                <input
                  type="number"
                  value={kerfMm}
                  onChange={(e) => setKerfMm(Number(e.target.value) || 4)}
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 ml-1">mm</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Reusable Offcut</label>
              <div className="flex items-center bg-slate-800 rounded-xl px-2.5 py-1 border border-slate-700">
                <input
                  type="number"
                  value={reusableThresholdMm}
                  onChange={(e) => setReusableThresholdMm(Number(e.target.value) || 800)}
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 ml-1">mm</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Weight (kg/m)</label>
              <div className="flex items-center bg-slate-800 rounded-xl px-2.5 py-1 border border-slate-700">
                <input
                  type="number"
                  step="0.05"
                  value={profileWeightKgPerM}
                  onChange={(e) => setProfileWeightKgPerM(Number(e.target.value) || 1.25)}
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 ml-1">kg/m</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Cost per kg</label>
              <div className="flex items-center bg-slate-800 rounded-xl px-2.5 py-1 border border-slate-700">
                <input
                  type="number"
                  value={costPerKgInr}
                  onChange={(e) => setCostPerKgInr(Number(e.target.value) || 190)}
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 ml-1">₹</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK ADD CUT ROW FORM */}
      <form
        onSubmit={handleAddCut}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Single Cut Piece</span>
          </span>
          <span className="text-[10px] text-slate-400">Total in Cut List: {cuts.length} Items</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="col-span-2 sm:col-span-2">
            <label className="text-[10px] text-slate-400 block mb-0.5">Profile Section</label>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="e.g. SCRAFT 60mm Casement Outer Frame"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Cut Length (mm)</label>
            <input
              type="number"
              required
              min="50"
              max={stockLengthMm}
              value={newLengthMm}
              onChange={(e) => setNewLengthMm(e.target.value)}
              placeholder="1450"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Quantity (Qty)</label>
            <input
              type="number"
              required
              min="1"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              placeholder="4"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Cut</span>
            </button>
          </div>
        </div>
      </form>

      {/* VISUAL STOCK BAR CUTTING LAYOUT */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Visual Bar-by-Bar Cutting Layout</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Each bar represents one standard 6,000mm uPVC stock bar.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {bars.length} Bars Total
          </span>
        </div>

        {bars.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No cuts defined. Add a cut above or upload an Excel cut list to see optimized stock bars.
          </div>
        ) : (
          <div className="space-y-3.5">
            {bars.map((bar) => {
              const wastePercentage = bar.wastagePercentage;
              const isLowWaste = wastePercentage <= 6;

              return (
                <div
                  key={bar.barIndex}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  {/* Bar Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white">Bar #{bar.barIndex}</span>
                      <span className="text-[10px] text-slate-400">
                        {bar.cuts.length} cuts • {bar.usedMm}mm used
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          bar.isReusableRemnant
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {bar.isReusableRemnant ? 'Reusable Offcut' : 'Scrap Waste'} ({bar.remnantMm}mm)
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          isLowWaste ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {bar.wastagePercentage}%
                      </span>
                    </div>
                  </div>

                  {/* VISUAL PROPORTIONAL CUT DIAGRAM */}
                  <div className="w-full h-8 bg-slate-800 rounded-xl overflow-hidden flex border border-slate-700/80 shadow-inner">
                    {bar.cuts.map((cut, cutIdx) => {
                      const widthPct = (cut.lengthMm / bar.stockLengthMm) * 100;
                      const colorClass = CUT_COLORS[cutIdx % CUT_COLORS.length];

                      return (
                        <div
                          key={cut.cutId}
                          style={{ width: `${widthPct}%` }}
                          className={`h-full ${colorClass} border-r border-slate-900/50 flex items-center justify-center px-1 truncate text-[10px] font-bold tracking-tight shadow-sm`}
                          title={`${cut.lengthMm}mm - ${cut.profileName} ${cut.tag ? `(${cut.tag})` : ''}`}
                        >
                          <span className="truncate">{cut.lengthMm}mm</span>
                        </div>
                      );
                    })}

                    {/* Kerf loss visual if any */}
                    {bar.kerfLossMm > 0 && (
                      <div
                        style={{ width: `${(bar.kerfLossMm / bar.stockLengthMm) * 100}%` }}
                        className="h-full bg-slate-700/80 flex items-center justify-center text-[8px] text-slate-400"
                        title={`Saw Kerf Loss: ${bar.kerfLossMm}mm`}
                      ></div>
                    )}

                    {/* Remnant / Scrap */}
                    {bar.remnantMm > 0 && (
                      <div
                        style={{ width: `${(bar.remnantMm / bar.stockLengthMm) * 100}%` }}
                        className={`h-full ${
                          bar.isReusableRemnant
                            ? 'bg-emerald-950/70 text-emerald-300 border-dashed border-l border-emerald-500/50'
                            : 'bg-rose-950/70 text-rose-300 border-dashed border-l border-rose-500/50'
                        } flex items-center justify-center px-1 text-[9px] font-semibold truncate`}
                        title={`Remnant: ${bar.remnantMm}mm`}
                      >
                        <span className="truncate">{bar.remnantMm}mm offcut</span>
                      </div>
                    )}
                  </div>

                  {/* Cut item details badges */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {bar.cuts.map((cut, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 font-medium"
                      >
                        {cut.lengthMm}mm [{cut.angle}] {cut.tag && <span className="text-sky-300">({cut.tag})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CUT LIST TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Current Cut Specifications ({cuts.length} Types)
          </h3>
          {cuts.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold transition"
            >
              Clear All Cuts
            </button>
          )}
        </div>

        {cuts.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500">
            Cut list is empty. Add entries above or upload an Excel sheet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2 px-2.5 rounded-l-xl">#</th>
                  <th className="py-2 px-2.5">Profile Section</th>
                  <th className="py-2 px-2.5 text-right">Length (mm)</th>
                  <th className="py-2 px-2.5 text-right">Qty</th>
                  <th className="py-2 px-2.5 text-right">Total (m)</th>
                  <th className="py-2 px-2.5">Angle</th>
                  <th className="py-2 px-2.5">Tag / Window</th>
                  <th className="py-2 px-2.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cuts.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-2 px-2.5 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-2.5 font-medium text-slate-200">{item.profileName}</td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold text-sky-400">
                      {item.lengthMm}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-slate-400">
                      {((item.lengthMm * item.quantity) / 1000).toFixed(2)}m
                    </td>
                    <td className="py-2 px-2.5 text-slate-400">{item.angle}</td>
                    <td className="py-2 px-2.5 text-slate-300">{item.tag || '-'}</td>
                    <td className="py-2 px-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCut(item.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SAVED CLOUD PROJECTS (SYNCED ACROSS DEVICES) */}
      {cloudProjects.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-sky-400" />
              <span>Cloud Synced Wastage Projects ({cloudProjects.length})</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold">Multi-Device Synced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {cloudProjects.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{p.projectName}</h4>
                  <p className="text-[10px] text-slate-400">
                    {p.summary.totalBarsRequired} Bars • {p.summary.wastagePercentage}% Waste • ₹{p.summary.estimatedCostLossInr} Loss
                  </p>
                  <span className="text-[9px] text-sky-400">
                    {new Date(p.updatedAt).toLocaleDateString('en-IN')} by {p.createdByEmail || 'Raviraja Industries'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCuts(p.cuts);
                      setProjectName(p.projectName);
                      setStockLengthMm(p.stockLengthMm);
                      setStatusMessage(`Loaded project "${p.projectName}"!`);
                      setTimeout(() => setStatusMessage(null), 3000);
                    }}
                    className="px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold transition"
                  >
                    Load
                  </button>
                  {onDeleteCloudProject && (
                    <button
                      type="button"
                      onClick={() => onDeleteCloudProject(p.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
