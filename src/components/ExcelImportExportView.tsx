import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Table,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { CustomerVisit } from '../types/customerVisit';
import { ExportVisitService } from '../services/exportVisitService';

interface ExcelImportExportViewProps {
  visits: CustomerVisit[];
  onImportVisits: (newVisits: CustomerVisit[]) => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onLoadWorkspaceFile: () => void;
}

export const ExcelImportExportView: React.FC<ExcelImportExportViewProps> = ({
  visits,
  onImportVisits,
  onExportExcel,
  onExportPdf,
  onLoadWorkspaceFile,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportStatus('Reading and parsing file...');

    try {
      const parsed = await ExportVisitService.parseFile(file);
      if (parsed.length > 0) {
        onImportVisits(parsed);
        setImportStatus(`Successfully imported ${parsed.length} customer visits from "${file.name}"!`);
      } else {
        setImportStatus('No customer records detected in the uploaded file.');
      }
    } catch (err: any) {
      console.error(err);
      setImportStatus(`Import error: ${err.message || 'Failed to parse file'}`);
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Excel & PDF Data Hub</h2>
        <p className="text-xs text-slate-400">
          Upload SCRAFT Customer Visit sheets, import All-India records, and download reports.
        </p>
      </div>

      {/* 1. UPLOAD EXCEL / CSV CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-sky-400">
          <Upload className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Upload & Import Excel / CSV</h3>
        </div>
        <p className="text-xs text-slate-300">
          Upload your <code className="text-sky-300 font-mono">SCRAFT_Customer_Visit_With_Submit_Setup.csv</code> or any All-India Sales Excel workbook to sync visits into your mobile app.
        </p>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />

        {/* Dropzone button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full border-2 border-dashed border-sky-500/40 hover:border-sky-400 bg-sky-950/20 hover:bg-sky-950/30 rounded-2xl p-6 text-center transition group active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition">
            <FileUp className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-white block">
            {isProcessing ? 'Parsing spreadsheet...' : 'Tap to Select Excel or CSV File'}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Supports .xlsx, .xls, and .csv formats
          </span>
        </button>

        {/* Workspace Quick-Load Button for user's attached file */}
        <button
          type="button"
          onClick={onLoadWorkspaceFile}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Load Uploaded SCRAFT Visit Template File</span>
        </button>

        {importStatus && (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>

      {/* 2. DOWNLOAD EXCEL & PDF REPORTS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Download className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Download Sales Reports & Templates</h3>
          </div>
          <button
            type="button"
            onClick={() => ExportVisitService.downloadTemplate()}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-sky-950/40 px-2.5 py-1 rounded-lg border border-sky-800/40"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Blank Template (.xlsx)</span>
          </button>
        </div>
        <p className="text-xs text-slate-300">
          Download formatted records containing customer visits, GPS Google Maps tag links, Brand (S CRAFT, SMART, OTHERS), uPVC series, GST numbers, and follow-up schedules.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Download Excel */}
          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-700/80 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-emerald-100" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">Download Excel (.xlsx)</div>
                <div className="text-[10px] text-emerald-200 font-normal">
                  With Clickable GPS Maps Links + Summary
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-200 group-hover:translate-y-0.5 transition" />
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={onExportPdf}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-[0.98] text-white font-bold text-xs shadow-lg border border-slate-700 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">Download PDF Report</div>
                <div className="text-[10px] text-slate-300 font-normal">
                  Printable Table with GPS Tag Links
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-300 group-hover:translate-y-0.5 transition" />
          </button>
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
          <span>Active Records: <strong className="text-white">{visits.length} Visits</strong></span>
          <span>Company: Raviraja Industries Pvt Ltd</span>
        </div>
      </div>
    </div>
  );
};
