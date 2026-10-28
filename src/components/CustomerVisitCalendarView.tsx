import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Building,
  MapPin,
  Phone,
  MessageCircle,
  Flame,
  CheckCircle,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import { CustomerVisit } from '../types/customerVisit';

interface CustomerVisitCalendarViewProps {
  visits: CustomerVisit[];
  onSelectVisit: (visit: CustomerVisit) => void;
}

export const CustomerVisitCalendarView: React.FC<CustomerVisitCalendarViewProps> = ({
  visits,
  onSelectVisit,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedExecutive, setSelectedExecutive] = useState<string>('All');

  // Extract all unique sales executives dynamically
  const uniqueExecutives = useMemo(() => {
    const set = new Set<string>();
    visits.forEach((v) => {
      if (v.salesExecutiveName && v.salesExecutiveName.trim()) {
        set.add(v.salesExecutiveName.trim());
      }
    });
    return Array.from(set).sort();
  }, [visits]);

  // Filter visits by sales executive
  const executiveFilteredVisits = useMemo(() => {
    if (selectedExecutive === 'All') return visits;
    return visits.filter((v) => v.salesExecutiveName === selectedExecutive);
  }, [visits, selectedExecutive]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Map visits by date string YYYY-MM-DD
  const visitsByDate = useMemo(() => {
    const map: Record<string, CustomerVisit[]> = {};
    executiveFilteredVisits.forEach((v) => {
      const d = v.customerVisitDate;
      if (!map[d]) map[d] = [];
      map[d].push(v);
    });
    return map;
  }, [executiveFilteredVisits]);

  const selectedDateVisits = visitsByDate[selectedDateStr] || [];

  const cleanPhone = (phone: string) => phone.replace(/[^0-9]/g, '');

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-400" />
            <span>Visit Calendar & Schedule</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {executiveFilteredVisits.length} of {visits.length} visits • Daily schedule & follow-ups
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white px-2">
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sales Executive Selector: Person-Wise or All */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>Sales Executive:</span>
          </span>
          {selectedExecutive !== 'All' ? (
            <button
              type="button"
              onClick={() => setSelectedExecutive('All')}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-bold hover:underline"
            >
              Reset to All ({visits.length})
            </button>
          ) : (
            <span className="text-[10px] text-slate-500 font-medium">Viewing All Executives</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedExecutive('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border active:scale-95 ${
              selectedExecutive === 'All'
                ? 'bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Option ({visits.length})
          </button>
          {uniqueExecutives.map((exec) => {
            const count = visits.filter((v) => v.salesExecutiveName === exec).length;
            const isSelected = selectedExecutive === exec;
            return (
              <button
                key={exec}
                type="button"
                onClick={() => setSelectedExecutive(exec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{exec}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-sky-800 text-sky-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Blank padding for first day */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-xl bg-slate-950/30 opacity-30"></div>
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateKey = `${year}-${monthStr}-${dayStr}`;

            const dayVisits = visitsByDate[dateKey] || [];
            const isSelected = selectedDateStr === dateKey;
            const isToday = new Date().toISOString().split('T')[0] === dateKey;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDateStr(dateKey)}
                className={`h-14 sm:h-16 p-1.5 rounded-xl border flex flex-col justify-between transition text-left relative overflow-hidden ${
                  isSelected
                    ? 'bg-sky-950/60 border-sky-500 shadow-md ring-1 ring-sky-500'
                    : isToday
                    ? 'bg-slate-800/80 border-sky-500/50'
                    : dayVisits.length > 0
                    ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                    : 'bg-slate-950/50 border-slate-800/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'bg-sky-500 text-slate-950 px-1.5 rounded-full'
                        : isSelected
                        ? 'text-sky-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayVisits.length > 0 && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-sky-500 text-slate-950">
                      {dayVisits.length}
                    </span>
                  )}
                </div>

                {dayVisits.length > 0 ? (
                  <div className="text-[9px] text-sky-200 truncate font-medium">
                    {dayVisits[0].companyName || dayVisits[0].customerName}
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-600">No visits</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Visits Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-sky-400" />
              <span>Visits on {selectedDateStr}</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {selectedDateVisits.length} visit(s) recorded on this date
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDateStr(new Date().toISOString().split('T')[0])}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2.5 py-1 rounded-lg"
          >
            Jump to Today
          </button>
        </div>

        {selectedDateVisits.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No customer visits found for {selectedDateStr}. Select another date on the calendar above.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateVisits.map((visit, vIdx) => {
              const isHot = visit.leadStatus === 'Hot';
              const isWon = visit.leadStatus === 'Won / Closed';
              return (
                <div
                  key={visit.id}
                  onClick={() => onSelectVisit(visit)}
                  className="bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-3.5 cursor-pointer transition shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                          #{vIdx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {visit.companyName || visit.customerName}
                        </h4>
                        {isHot ? (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <Flame className="w-3 h-3" /> HOT
                          </span>
                        ) : isWon ? (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            🏆 WON
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                            {visit.leadStatus}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-white">{visit.customerName}</span>
                        <span className="text-[10px] text-sky-300 bg-sky-950 px-1.5 py-0.2 rounded">
                          {visit.contactDesignation || 'Owner'}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{visit.customerType}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`tel:${visit.mobileNumber}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/${cleanPhone(visit.mobileNumber)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 transition"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Dealt by Sales Executive info */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                    <span className="text-sky-300 font-semibold flex items-center gap-1">
                      <User className="w-3 h-3 text-sky-400" />
                      Dealt by Sales Executive: <strong className="text-white">{visit.salesExecutiveName}</strong>
                    </span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" /> {visit.city}, {visit.state}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
