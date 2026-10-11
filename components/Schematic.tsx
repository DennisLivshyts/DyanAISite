/**
 * Abstract card art for work we can't (or shouldn't) screenshot: a demo that
 * isn't built yet, internal tooling, and an NDA-bound client. Drawn in the
 * brand palette, no real data, no real UI.
 */

type Variant = "invitation" | "agents" | "pipeline";

const TEAL = "#2DD4BF";
const CYAN = "#67E8F9";
const ICE = "#A5F3FC";

function Grid() {
  return (
    <pattern id="sch-grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M20 0H0V20" fill="none" stroke={TEAL} strokeOpacity="0.07" strokeWidth="1" />
    </pattern>
  );
}

function Invitation() {
  // Four acts, one path through them.
  const acts = [
    { x: 40, y: 120 },
    { x: 130, y: 70 },
    { x: 220, y: 110 },
    { x: 310, y: 60 },
  ];
  return (
    <>
      <path
        d="M30 190 C 70 160, 90 150, 70 140 S 140 120, 160 105 S 240 150, 250 140 S 320 100, 345 90"
        fill="none" stroke={CYAN} strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="3 5"
      />
      {acts.map((a, i) => (
        <g key={i} transform={`translate(${a.x} ${a.y})`}>
          <rect width="60" height="78" rx="30" ry="30" fill="#0A1628" stroke={TEAL} strokeOpacity={0.35 + i * 0.18} strokeWidth="1.5" />
          <rect x="8" y="8" width="44" height="62" rx="22" ry="22" fill="none" stroke={TEAL} strokeOpacity="0.15" />
          <text x="30" y="47" textAnchor="middle" style={{ fontFamily: "var(--font-space-mono), monospace" }} fontSize="11" fill={i === 3 ? ICE : TEAL} fillOpacity={0.5 + i * 0.15}>
            {["I", "II", "III", "IV"][i]}
          </text>
        </g>
      ))}
      <circle cx="345" cy="90" r="3.5" fill={ICE} />
      <circle cx="345" cy="90" r="9" fill={CYAN} opacity="0.2" />
    </>
  );
}

function Agents() {
  // A hub with agents on orbits; one is mid-task (the bright one).
  const cx = 200, cy = 125;
  const orbits = [42, 72, 100];
  const sats = [
    { r: 42, a: -40 }, { r: 72, a: 200 }, { r: 72, a: 35 }, { r: 100, a: 130 }, { r: 100, a: -10 },
  ];
  return (
    <>
      {orbits.map((r) => (
        <ellipse key={r} cx={cx} cy={cy} rx={r * 1.5} ry={r * 0.62} fill="none" stroke={TEAL} strokeOpacity="0.2" />
      ))}
      <circle cx={cx} cy={cy} r="16" fill="#0D3A45" stroke={TEAL} strokeOpacity="0.6" />
      <circle cx={cx} cy={cy} r="5" fill={TEAL} opacity="0.8" />
      {sats.map((s, i) => {
        const t = (s.a * Math.PI) / 180;
        const x = cx + Math.cos(t) * s.r * 1.5;
        const y = cy + Math.sin(t) * s.r * 0.62;
        const hot = i === 4;
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={hot ? CYAN : TEAL} strokeOpacity={hot ? 0.5 : 0.12} strokeDasharray={hot ? "2 3" : undefined} />
            <rect x={x - 6} y={y - 6} width="12" height="12" rx="3" fill="#0A1628" stroke={hot ? ICE : TEAL} strokeOpacity={hot ? 1 : 0.55} />
            {hot && <circle cx={x} cy={y} r="13" fill={CYAN} opacity="0.15" />}
          </g>
        );
      })}
    </>
  );
}

function Pipeline() {
  // Scattered inputs → a stage that orders them → ranked output.
  const dots = Array.from({ length: 22 }, (_, i) => ({
    x: 30 + ((i * 37) % 90),
    y: 50 + ((i * 53) % 150),
    o: 0.25 + ((i * 7) % 10) / 20,
  }));
  const bars = [0.92, 0.78, 0.7, 0.55, 0.46, 0.33];
  return (
    <>
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="2.4" fill={TEAL} opacity={d.o} />)}
      <path d="M135 55 L185 105 L185 145 L135 195" fill="none" stroke={TEAL} strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M135 55 L135 195" fill="none" stroke={TEAL} strokeOpacity="0.12" />
      <rect x="185" y="105" width="40" height="40" fill="#0D3A45" stroke={CYAN} strokeOpacity="0.6" />
      <path d="M197 125h16M205 117v16" stroke={ICE} strokeOpacity="0.8" strokeWidth="1.5" />
      <path d="M225 125 H250" stroke={CYAN} strokeOpacity="0.5" strokeDasharray="3 4" />
      {bars.map((w, i) => (
        <g key={i}>
          <rect x="258" y={72 + i * 19} width={w * 110} height="11" fill={i === 0 ? ICE : TEAL} opacity={i === 0 ? 0.9 : 0.25 + w * 0.4} />
        </g>
      ))}
    </>
  );
}

export default function Schematic({ variant, className }: { variant: Variant; className?: string }) {
  return (
    <svg viewBox="0 0 400 250" className={className} role="presentation" aria-hidden="true">
      <defs><Grid /></defs>
      <rect width="400" height="250" fill="#050D1A" />
      <rect width="400" height="250" fill="url(#sch-grid)" />
      {variant === "invitation" && <Invitation />}
      {variant === "agents" && <Agents />}
      {variant === "pipeline" && <Pipeline />}
    </svg>
  );
}
