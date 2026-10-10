"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Schematic from "./Schematic";
import type { Case } from "@/content/work";

/* ──────────────────────────────────────────────────────────────────────────
 * The Work rail: compact cards you drag (mouse), swipe (touch) or step through
 * (arrows / keyboard). Clicking a card opens its dossier. A case can also be
 * opened from anywhere with a link to #case-<slug> (Capabilities uses this).
 * ────────────────────────────────────────────────────────────────────────── */

const DRAG_THRESHOLD = 6; // px of travel before a press counts as a drag, not a click

function DraftRibbon({ c }: { c: Case }) {
  if (c.cleared) return null;
  return (
    <div className="absolute top-0 left-0 right-0 z-20 bg-amber-400 text-navy-950 font-space-mono text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 text-left">
      Preview only · waiting on {c.waitingOn}
    </div>
  );
}

function Visual({ c, large }: { c: Case; large?: boolean }) {
  const v = c.visual;
  if (v.kind === "schematic") return <Schematic variant={v.variant} className="w-full h-auto block" />;
  return (
    <div className="relative">
      <Image
        src={v.desktop}
        alt={large ? v.alt : ""}
        width={v.size[0]}
        height={v.size[1]}
        sizes={large ? "(min-width: 1024px) 620px, 100vw" : "(min-width: 640px) 460px, 82vw"}
        className="w-full h-auto block"
        draggable={false}
      />
      {large && v.phone && (
        <Image
          src={v.phone}
          alt=""
          width={390}
          height={844}
          sizes="120px"
          draggable={false}
          className="hidden sm:block absolute -bottom-8 -right-4 w-[18%] h-auto rounded-xl border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
        />
      )}
    </div>
  );
}

/* ── Dossier: the opened case ─────────────────────────────────────────────── */

function Dossier({
  c, index, total, onClose, onStep,
}: {
  c: Case; index: number; total: number;
  onClose: () => void; onStep: (dir: -1 | 1) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onStep]);

  const titleId = `case-title-${c.slug}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-[#010a18]/85 backdrop-blur-md cursor-pointer" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-modal-unfold relative z-10 w-full max-w-5xl border border-teal-500/20 overflow-hidden flex flex-col"
        style={{ background: "rgba(2,12,28,0.92)", backdropFilter: "blur(24px)", maxHeight: "92vh" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden pointer-events-none">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-teal-400/60 to-transparent"
            style={{ animation: "shimmer-line 3s ease-in-out infinite" }} />
        </div>

        {/* Header bar */}
        <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 border-b border-white/8">
          <span className="font-space-mono text-[10px] tracking-[0.3em] uppercase text-gray-500">
            Case file {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onStep(-1)} aria-label="Previous case"
              className="w-8 h-8 border border-white/10 hover:border-teal-400/50 text-gray-400 hover:text-teal-300 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button type="button" onClick={() => onStep(1)} aria-label="Next case"
              className="w-8 h-8 border border-white/10 hover:border-teal-400/50 text-gray-400 hover:text-teal-300 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close case"
              className="ml-2 w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div key={c.slug} className="overflow-y-auto nebula-scroll animate-fade-slide-up">
          <div className="grid lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-10 p-5 sm:p-7 pb-10">
            <div className="relative border border-white/10 bg-navy-950 self-start mb-6 lg:mb-0">
              <DraftRibbon c={c} />
              <Visual c={c} large />
            </div>

            <div>
              <div className="font-space-mono text-[10px] tracking-[0.25em] uppercase text-teal-500/80 mb-3">{c.kicker}</div>
              <h3 id={titleId} className="font-syne font-bold text-white text-2xl md:text-3xl leading-tight mb-2">{c.name}</h3>
              <p className="text-teal-200/90 text-lg mb-6">{c.headline}</p>
              <ul className="space-y-3 mb-7">
                {c.lines.map((l) => (
                  <li key={l.text} className="flex gap-3 text-sm text-gray-300/90 leading-relaxed">
                    <span className="mt-2 w-3 h-px bg-teal-400/60 shrink-0" />
                    <span>{l.text}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 mb-7">
                {c.tags.map((t) => (
                  <span key={t} className="font-space-mono text-[10px] tracking-[0.15em] uppercase text-gray-500 border border-white/10 px-2.5 py-1">{t}</span>
                ))}
              </div>
              {c.link && (
                <a href={c.link.href} target="_blank" rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 bg-teal-400 hover:bg-teal-300 text-navy-950 font-syne font-bold text-sm px-6 py-3 transition-colors"
                  style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
                  Visit {c.link.label}
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Rail ─────────────────────────────────────────────────────────────────── */

export default function CaseRail({ cases }: { cases: Case[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const openRef = useRef<number | null>(null);
  openRef.current = open;

  /* progress + arrow state from the rail's scroll position */
  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /* step one card at a time */
  const step = (dir: -1 | 1) => {
    const el = railRef.current;
    const card = cardRefs.current[0];
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: "smooth" });
  };

  /* mouse drag-to-scroll; touch keeps native swiping */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !railRef.current) return;
    drag.current = { active: true, moved: false, startX: e.clientX, startScroll: railRef.current.scrollLeft };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = railRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      d.moved = true;
      setDragging(true);              // turns snapping off so the rail follows the pointer
      el.setPointerCapture(e.pointerId);
    }
    if (d.moved) el.scrollLeft = d.startScroll - dx;
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (railRef.current?.hasPointerCapture(e.pointerId)) railRef.current.releasePointerCapture(e.pointerId);
    if (d.moved) setDragging(false);  // snapping back on settles the rail onto a card
  };
  /* a drag must not also count as a click on the card under the pointer */
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  /* dossier open/close, deep-linkable as #case-<slug> */
  const openCase = useCallback((i: number) => setOpen(i), []);
  const closeCase = useCallback(() => {
    const i = openRef.current;
    setOpen(null);
    if (location.hash.startsWith("#case-")) history.replaceState(null, "", "#work");
    // hand focus back to the card that opened it
    if (i !== null) requestAnimationFrame(() => cardRefs.current[i]?.focus({ preventScroll: true }));
  }, []);
  const stepCase = useCallback((dir: -1 | 1) => {
    setOpen((i) => (i === null ? i : (i + dir + cases.length) % cases.length));
  }, [cases.length]);

  useEffect(() => {
    const fromHash = () => {
      const m = location.hash.match(/^#case-([a-z0-9-]+)$/);
      if (!m) return;
      const i = cases.findIndex((c) => c.slug === m[1]);
      if (i < 0) return;
      document.getElementById("work")?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      cardRefs.current[i]?.scrollIntoView({ inline: "start", block: "nearest" });
      setOpen(i);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [cases]);

  if (cases.length === 0) return null;

  return (
    <div>
      {/* Rail: bleeds to the viewport edges, padded to line up with the page column */}
      <div
        ref={railRef}
        role="region"
        aria-label="Case studies — drag, swipe or use the arrows"
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className={`rail-pad no-scrollbar flex gap-5 overflow-x-auto overscroll-x-contain pb-2 select-none
          ${dragging ? "cursor-grabbing" : "cursor-grab snap-x snap-mandatory"}`}
      >
        {cases.map((c, i) => (
          <button
            key={c.slug}
            ref={(el) => { cardRefs.current[i] = el; }}
            type="button"
            data-case={c.slug}
            onClick={() => openCase(i)}
            aria-haspopup="dialog"
            className="group relative shrink-0 snap-start w-[82vw] max-w-[380px] sm:w-[420px] sm:max-w-none lg:w-[440px] text-left bg-navy-950 border border-white/10 hover:border-teal-400/40 focus-visible:border-teal-300 focus-visible:outline-none transition-colors duration-300"
          >
            <div className="relative overflow-hidden border-b border-white/8 aspect-[16/10]">
              <DraftRibbon c={c} />
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03] [&_img]:h-full [&_img]:object-cover [&_img]:object-top [&_svg]:h-full [&_svg]:w-full">
                <Visual c={c} />
              </div>
            </div>
            <div className="p-6">
              <div className="font-space-mono text-[10px] tracking-[0.22em] uppercase text-teal-500/80 mb-2 truncate">{c.kicker}</div>
              <h3 className="font-syne font-bold text-white text-xl leading-tight mb-1.5">{c.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed min-h-[2.5rem]">{c.headline}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="font-space-mono text-[10px] tracking-[0.15em] uppercase text-gray-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-space-mono text-[10px] tracking-[0.2em] uppercase text-teal-400/80 group-hover:text-teal-300 inline-flex items-center gap-2">
                  Open case
                  <span className="w-5 h-px bg-current group-hover:w-8 transition-all duration-300" />
                </span>
              </div>
            </div>
          </button>
        ))}
        {/* trailing spacer so the last card can snap to the start edge on wide screens */}
        <div aria-hidden className="shrink-0 w-px" />
      </div>

      {/* Controls: the track is the flight path, the head is where you are */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 flex items-center gap-6">
        <div className="relative flex-1 h-px bg-white/10" aria-hidden>
          <div className="absolute left-0 top-0 h-px"
            style={{ width: `${progress * 100}%`, background: "linear-gradient(90deg, rgba(45,212,191,0) 0%, #2DD4BF 45%, #67E8F9 100%)" }} />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#A5F3FC] shadow-[0_0_12px_4px_rgba(103,232,249,0.35)]"
            style={{ left: `${progress * 100}%` }} />
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} disabled={atStart} aria-label="Scroll cases left"
            className="w-10 h-10 border border-white/10 text-gray-400 hover:text-teal-300 hover:border-teal-400/50 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-white/10 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button type="button" onClick={() => step(1)} disabled={atEnd} aria-label="Scroll cases right"
            className="w-10 h-10 border border-white/10 text-gray-400 hover:text-teal-300 hover:border-teal-400/50 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-white/10 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {open !== null && (
        <Dossier c={cases[open]} index={open} total={cases.length} onClose={closeCase} onStep={stepCase} />
      )}
    </div>
  );
}
