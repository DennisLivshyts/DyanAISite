"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AnimatedMark from "./AnimatedMark";

// ── Date helpers ──────────────────────────────────────────────────────────────
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LBLS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDOW(y: number, m: number)    { return new Date(y, m, 1).getDay(); }
function sameDay(a: Date, b: Date)         { return a.toDateString() === b.toDateString(); }
function isPast(d: Date)                   { const t = new Date(); t.setHours(0,0,0,0); return d < t; }
function isWeekend(d: Date)                { return d.getDay() === 0 || d.getDay() === 6; }
// Local calendar date, not toISOString(): that is UTC and shifts the day for visitors east of UTC
function toParam(d: Date)                  { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function fmtTime(slot: string) {
  const [h, m] = slot.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2,"0")} ${p}`;
}
function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
}

// ── UFO SVG ───────────────────────────────────────────────────────────────────
function UFO({ beaming }: { beaming?: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
        {/* glow ring */}
        <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none"
          stroke="rgba(20,184,166,0.2)" strokeWidth="3" />
        {/* saucer body */}
        <ellipse cx="16" cy="15" rx="13" ry="4.8"
          fill="rgba(20,184,166,0.82)" stroke="rgba(100,240,220,0.9)" strokeWidth="0.6" />
        {/* dome */}
        <ellipse cx="16" cy="12.5" rx="6" ry="5"
          fill="rgba(140,225,255,0.32)" stroke="rgba(180,240,255,0.75)" strokeWidth="0.5" />
        {/* lights */}
        <circle cx="7"  cy="15.5" r="1.4" fill="rgba(255,220,50,0.95)" />
        <circle cx="16" cy="18"   r="1.4" fill="rgba(255,90,90,0.95)"
          style={{ animation:"blink 1.6s ease-in-out infinite" }} />
        <circle cx="25" cy="15.5" r="1.4" fill="rgba(80,220,255,0.95)" />
      </svg>
      {/* tractor beam */}
      {beaming && (
        <div className="absolute top-[22px] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width:0, height:0,
            borderLeft:"10px solid transparent",
            borderRight:"10px solid transparent",
            borderTop:"18px solid rgba(20,184,166,0.35)",
            filter:"blur(2px)",
          }} />
      )}
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────────
const STEPS = ["Date","Time","Confirm"];
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-7">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            i < current  ? "text-teal-400" :
            i === current? "text-white"    : "text-gray-600"
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border transition-all ${
              i < current  ? "bg-teal-500/30 border-teal-500/60 text-teal-400"  :
              i === current? "bg-teal-500/20 border-teal-400    text-teal-300"  :
                             "bg-white/5    border-white/15     text-gray-600"
            }`}>
              {i < current ? "✓" : i + 1}
            </div>
            {label}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-px transition-colors ${i < current ? "bg-teal-500/50" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
interface Props { isOpen: boolean; onClose: () => void; }

export default function BookingModal({ isOpen, onClose }: Props) {
  const today = new Date(); today.setHours(0,0,0,0);

  const [step,          setStep]         = useState(0);
  const [month,         setMonth]        = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; });
  const [selectedDate,  setSelectedDate] = useState<Date|null>(null);
  const [hoveredDate,   setHoveredDate]  = useState<Date|null>(null);
  const [slots,         setSlots]        = useState<string[]>([]);
  const [loadingSlots,  setLoadingSlots] = useState(false);
  const [selectedTime,  setSelectedTime] = useState<string|null>(null);
  const [form,          setForm]         = useState({ name:"", email:"", notes:"", website:"" });
  const [submitting,    setSubmitting]   = useState(false);
  const [error,         setError]        = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  // Close on Escape + lock scroll
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);
  // Reset on open
  useEffect(() => {
    if (isOpen) { setStep(0); setSelectedDate(null); setSelectedTime(null); setSlots([]); setForm({name:"",email:"",notes:"",website:""}); setError(""); }
  }, [isOpen]);

  // Fetch slots when date selected
  const fetchSlots = useCallback(async (date: Date) => {
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res = await fetch(`/api/availability?date=${toParam(date)}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots(["09:00","09:30","10:00","10:30","11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // UFO position
  const ufoTarget = hoveredDate ?? selectedDate;
  const ufoPos = (() => {
    if (!ufoTarget || ufoTarget.getMonth() !== month.getMonth() || ufoTarget.getFullYear() !== month.getFullYear()) return null;
    const fd  = firstDOW(month.getFullYear(), month.getMonth());
    const idx = fd + ufoTarget.getDate() - 1;
    return { col: idx % 7, row: Math.floor(idx / 7) };
  })();

  const CELL_W_PCT = 100 / 7;
  const CELL_H = 44;
  const HEADER_H = 36; // day-of-week row

  // Calendar days
  const year    = month.getFullYear();
  const monthIdx= month.getMonth();
  const fd      = firstDOW(year, monthIdx);
  const total   = daysInMonth(year, monthIdx);
  const cells   = [...Array(fd).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  const handleDateClick = (day: number) => {
    const d = new Date(year, monthIdx, day);
    if (isPast(d) || isWeekend(d)) return;
    setSelectedDate(d);
    setSelectedTime(null);
    fetchSlots(d);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: toParam(selectedDate), time: selectedTime, ...form }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // 409/429/400 carry a message meant for the visitor
        throw new Error(res.status < 500 && data.error ? data.error : "");
      }
      setStep(3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg || "Something went wrong. Email us at livshytsd@dyanailabs.com");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#010a18]/85 backdrop-blur-md cursor-pointer" onClick={onClose} />

      {/* Nebula orbs */}
      <div className="nebula-orb-1 absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] max-w-[560px] rounded-full pointer-events-none"
        style={{ background:"radial-gradient(circle,rgba(20,184,166,0.22) 0%,transparent 70%)", filter:"blur(65px)" }} />
      <div className="nebula-orb-2 absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] max-w-[500px] rounded-full pointer-events-none"
        style={{ background:"radial-gradient(circle,rgba(6,182,212,0.18) 0%,transparent 70%)", filter:"blur(75px)" }} />
      <div className="nebula-orb-3 absolute top-[40%] right-[8%] w-[22vw] h-[22vw] max-w-[300px] rounded-full pointer-events-none"
        style={{ background:"radial-gradient(circle,rgba(99,102,241,0.16) 0%,transparent 70%)", filter:"blur(50px)" }} />

      {/* Modal */}
      <div className="animate-modal-unfold relative z-10 w-full max-w-md rounded-3xl border border-teal-500/20 overflow-hidden flex flex-col"
        style={{ background:"rgba(2,12,28,0.88)", backdropFilter:"blur(24px)", maxHeight:"90vh" }}>

        {/* Shimmer edge */}
        <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden pointer-events-none">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-teal-400/60 to-transparent"
            style={{ animation:"shimmer-line 3s ease-in-out infinite" }} />
        </div>

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="overflow-y-auto nebula-scroll flex-1 p-8">

          {/* ── Header ── */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 border border-teal-500/30 bg-teal-500/10 rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-teal-400 text-xs font-medium tracking-widest uppercase">Free Consultation</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Schedule a Mission</h2>
            <p className="text-gray-400 text-sm">30 minutes · No commitment · Monday – Friday</p>
          </div>

          {step < 3 && <StepBar current={step} />}

          {/* ══ STEP 0: Date picker ══════════════════════════════════════════ */}
          {step === 0 && (
            <div className="animate-fade-slide-up">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setMonth(m => { const n=new Date(m); n.setMonth(n.getMonth()-1); return n; })}
                  disabled={month.getFullYear() === today.getFullYear() && month.getMonth() <= today.getMonth()}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-white font-semibold">{MONTHS[monthIdx]} {year}</span>
                <button onClick={() => setMonth(m => { const n=new Date(m); n.setMonth(n.getMonth()+1); return n; })}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Calendar grid */}
              <div ref={gridRef} className="relative select-none">
                {/* UFO */}
                {ufoPos !== null && (
                  <div className="absolute z-10 pointer-events-none transition-all duration-300 ease-out"
                    style={{
                      top:  HEADER_H + ufoPos.row * CELL_H - 26,
                      left: `calc(${ufoPos.col * CELL_W_PCT + CELL_W_PCT / 2}% - 16px)`,
                    }}>
                    <UFO beaming={!!hoveredDate} />
                  </div>
                )}

                {/* Day-of-week labels */}
                <div className="grid grid-cols-7 mb-1" style={{ height: HEADER_H }}>
                  {DAY_LBLS.map(d => (
                    <div key={d} className={`flex items-center justify-center text-xs font-medium ${
                      d === "Su" || d === "Sa" ? "text-gray-600" : "text-gray-500"
                    }`}>{d}</div>
                  ))}
                </div>

                {/* Date cells */}
                <div className="grid grid-cols-7">
                  {cells.map((day, i) => {
                    if (day === null) return <div key={`e${i}`} style={{ height: CELL_H }} />;
                    const date     = new Date(year, monthIdx, day);
                    const disabled = isPast(date) || isWeekend(date);
                    const isToday  = sameDay(date, today);
                    const isSel    = !!selectedDate && sameDay(date, selectedDate);
                    const isHov    = !!hoveredDate  && sameDay(date, hoveredDate);
                    return (
                      <div key={day} style={{ height: CELL_H }} className="flex items-center justify-center">
                        <button
                          disabled={disabled}
                          onClick={() => handleDateClick(day)}
                          onMouseEnter={() => !disabled && setHoveredDate(date)}
                          onMouseLeave={() => setHoveredDate(null)}
                          className={`w-9 h-9 rounded-full text-sm font-medium transition-all duration-150 flex items-center justify-center relative ${
                            disabled
                              ? "text-gray-700 cursor-not-allowed"
                              : isSel
                              ? "bg-teal-500 text-white shadow-[0_0_16px_rgba(20,184,166,0.5)]"
                              : isHov
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                              : isToday
                              ? "border border-teal-500/50 text-teal-300"
                              : "text-gray-300 hover:text-white hover:bg-white/8"
                          }`}
                        >
                          {day}
                          {isToday && !isSel && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-400" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 1: Time slots ═══════════════════════════════════════════ */}
          {step === 1 && selectedDate && (
            <div className="animate-fade-slide-up">
              {/* Back + selected date */}
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setStep(0)}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <p className="text-white font-semibold text-sm">{fmtDate(selectedDate)}</p>
                  <p className="text-gray-500 text-xs">Pacific Time (PT)</p>
                </div>
              </div>

              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-teal-500/70 mb-4">
                Select a launch window
              </p>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-12 gap-3 text-gray-500 text-sm">
                  <svg className="w-4 h-4 animate-spin text-teal-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Scanning orbital windows…
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No availability on this date.<br />
                  <button onClick={() => setStep(0)} className="text-teal-400 hover:text-teal-300 mt-2">
                    Pick another day
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map(slot => (
                    <button key={slot}
                      onClick={() => { setSelectedTime(slot); setStep(2); }}
                      className={`py-2.5 px-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                        selectedTime === slot
                          ? "bg-teal-500 border-teal-400 text-white shadow-[0_0_14px_rgba(20,184,166,0.4)]"
                          : "border-white/10 bg-white/5 text-gray-300 hover:border-teal-500/40 hover:text-teal-300 hover:bg-teal-500/8"
                      }`}
                      onMouseEnter={e => { if (selectedTime !== slot) e.currentTarget.style.boxShadow = "0 0 10px rgba(20,184,166,0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; }}
                    >
                      {fmtTime(slot)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ STEP 2: Confirm form ═════════════════════════════════════════ */}
          {step === 2 && selectedDate && selectedTime && (
            <div className="animate-fade-slide-up">
              {/* Back + summary */}
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setStep(1)}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                  <p className="text-white text-sm font-medium">{fmtDate(selectedDate)}</p>
                  <p className="text-teal-400 text-xs">{fmtTime(selectedTime)} PT · 30 min</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { name:"name",  label:"Your Name *",  type:"text",  placeholder:"Jane Smith"          },
                  { name:"email", label:"Email *",       type:"email", placeholder:"jane@yourbiz.com"    },
                ].map(({ name, label, type, placeholder }) => (
                  <div key={name} className="relative">
                    <input
                      name={name}
                      type={type}
                      value={form[name as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                      required
                      placeholder=" "
                      className="peer w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-teal-500/60 rounded-xl px-4 pt-6 pb-3 text-white outline-none transition-colors text-sm"
                    />
                    <label className="absolute left-4 top-4 text-gray-500 text-sm pointer-events-none transition-all duration-200
                      peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-teal-400
                      peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:text-gray-400">
                      {label}
                    </label>
                  </div>
                ))}

                <div className="relative">
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder=" "
                    className="peer w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-teal-500/60 rounded-xl px-4 pt-6 pb-3 text-white outline-none transition-colors text-sm resize-none"
                  />
                  <label className="absolute left-4 top-4 text-gray-500 text-sm pointer-events-none transition-all duration-200
                    peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-teal-400
                    peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:text-gray-400">
                    What would you like to discuss?
                  </label>
                </div>

                {/* Honeypot: hidden from people, filled in by bots */}
                <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  className="absolute -left-[9999px] w-px h-px opacity-0" />

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button type="submit" disabled={submitting}
                  className="relative w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-all overflow-hidden group">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        Locking in orbit…
                      </>
                    ) : "Confirm Mission"}
                  </span>
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </button>
              </form>
            </div>
          )}

          {/* ══ STEP 3: Success ══════════════════════════════════════════════ */}
          {step === 3 && selectedDate && selectedTime && (
            <div className="animate-fade-slide-up text-center py-4">
              {/* the flight completes: the mark draws itself */}
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute inset-0 rounded-full" style={{ background:"radial-gradient(circle, rgba(20,184,166,0.16) 0%, transparent 65%)" }} />
                <AnimatedMark size={112} id="booked" className="relative" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Mission confirmed</h3>
              <p className="text-gray-400 text-sm mb-6">Check your inbox — a confirmation is on its way.</p>

              <div className="bg-white/5 border border-teal-500/20 rounded-2xl p-5 text-left mb-6"
                style={{ boxShadow:"inset 0 0 20px rgba(20,184,166,0.05)" }}>
                <p className="text-xs font-semibold tracking-widest uppercase text-teal-500/70 mb-3">Mission briefing</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white text-sm">{fmtDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white text-sm">{fmtTime(selectedTime)} PT · 30 min</span>
                  </div>
                </div>
              </div>

              <button onClick={onClose}
                className="w-full border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium py-3 rounded-xl transition-all text-sm">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
