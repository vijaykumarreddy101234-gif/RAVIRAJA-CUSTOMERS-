import React, { useState } from 'react';
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
} from 'lucide-react';
import { CustomerVisit, LeadStatus, PISentStatus } from '../types/customerVisit';

interface CustomerVisitDetailModalProps {
  visit: CustomerVisit | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateVisit: (visit: CustomerVisit) => void;
  onDeleteVisit: (id: string) => void;
}

export const CustomerVisitDetailModal: React.FC<CustomerVisitDetailModalProps> = ({
  visit,
  isOpen,
  onClose,
  onUpdateVisit,
  onDeleteVisit,
}) => {
  if (!isOpen || !visit) return null;

  const [leadStatus, setLeadStatus] = useState<LeadStatus>(visit.leadStatus);
  const [piSent, setPiSent] = useState<PISentStatus>(visit.piSent);
  const [followUpDate, setFollowUpDate] = useState(visit.followUpDate || '');
  const [remarks, setRemarks] = useState(visit.visitRemarks || '');

  const handleSave = () => {
    onUpdateVisit({
      ...visit,
      leadStatus,
      piSent,
      followUpDate,
      visitRemarks: remarks,
    });
    onClose();
  };

  const cleanPhone = visit.mobileNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-5 shadow-2xl text-white space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-sky-400">
              SCRAFT All-India Sales Entry
            </span>
            <h3 className="text-base font-extrabold text-white">
              {visit.companyName || visit.customerName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${visit.mobileNumber}`}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition active:scale-95 shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>Call Customer</span>
          </a>
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition active:scale-95 shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Message</span>
          </a>
        </div>

        {/* Detail Matrix */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Contact Person</span>
            <p className="font-bold text-white mt-0.5">{visit.customerName}</p>
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

        {/* Brand & Commercials */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Interested uPVC Series:</span>
            <span className="font-bold text-sky-400 text-right max-w-[65%]">{visit.interestedBrand}</span>
          </div>
          {visit.profileColor && (
            <div className="flex justify-between">
              <span className="text-slate-400">Profile Color / Finish:</span>
              <span className="font-semibold text-amber-300">{visit.profileColor}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Current uPVC Brand Used:</span>
            <span className="font-medium text-slate-200">{visit.currentBrand || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Quantity / Month (Volume):</span>
            <span className="font-bold text-emerald-400">{visit.quantityPerMonth}</span>
          </div>
          {visit.customerAddress && (
            <div className="pt-1 border-t border-slate-800/80">
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
    </div>
  );
};
