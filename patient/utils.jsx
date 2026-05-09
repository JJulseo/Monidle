// Utility helpers — spline path, mock data generators, formatters

// ─────────── CLINICAL REFERENCE VALUES ───────────
// Based on Banyan BTI / Abbott i-STAT TBI plasma assay literature
// GFAP (pg/mL): healthy ≤ 30, elevated 30-100, mTBI cutoff ~30,
//   moderate-severe TBI typically > 100-150
// UCH-L1 (pg/mL): healthy ≤ 327, elevated 327-1000, severe > 1000
// AUC (pg·h): cumulative exposure metric — derived
const CLINICAL = {
  GFAP: {
    baseline: 30,    // 정상 상한 (normal upper)
    caution: 60,     // 주의 (caution / mild elevation)
    critical: 100,   // 위험 (critical — moderate-severe TBI)
    unit: 'pg/mL',
  },
  UCHL1: {
    baseline: 327,
    caution: 600,
    critical: 1000,
    unit: 'pg/mL',
  },
  AUC: {
    baseline: 200,
    caution: 600,
    critical: 1200,
    unit: 'pg·h',
  },
};

// Catmull-Rom to Bezier spline path
function splinePath(points, tension = 0.5) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// Map values to SVG points
function mapPoints(values, w, h, padX = 0, padY = 8, minOverride, maxOverride) {
  const min = minOverride !== undefined ? minOverride : Math.min(...values);
  const max = maxOverride !== undefined ? maxOverride : Math.max(...values);
  const range = max - min || 1;
  return values.map((v, i) => ({
    x: padX + (i / (values.length - 1)) * (w - padX * 2),
    y: padY + (1 - (v - min) / range) * (h - padY * 2),
    v,
  }));
}

// Seeded random for stable mock data
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Status from value + biomarker
function statusOf(value, biomarker) {
  const c = CLINICAL[biomarker];
  if (!c) return 'good';
  if (value >= c.critical) return 'danger';
  if (value >= c.caution) return 'warn';
  return 'good';
}

// ─────────── PHASE-BASED REAL-TIME SIMULATION ───────────
// Cycles through clinically-plausible phases:
//   normal → rising → caution → spike → danger → recovery → normal ...
// Each phase has a target band; values converge toward the target with noise.
const PHASES = [
  { name: 'normal',   gfap: [12, 25],  uch: [120, 280],  duration: 18 },
  { name: 'rising',   gfap: [28, 50],  uch: [280, 550],  duration: 10 },
  { name: 'caution',  gfap: [55, 90],  uch: [600, 950],  duration: 12 },
  { name: 'spike',    gfap: [95, 140], uch: [1000, 1400],duration: 8  },
  { name: 'danger',   gfap: [110, 165],uch: [1100, 1600],duration: 10 },
  { name: 'recovery', gfap: [40, 80],  uch: [400, 800],  duration: 14 },
];

// Generate a 24-hour seeded series traversing phases (for static history)
function generatePhaseSeries(biomarker, hours = 24, seed = 42) {
  const rand = seededRandom(seed);
  const samples = hours * 4; // 15-min ticks
  const arr = [];
  let phaseIdx = 0;
  let phaseTick = 0;
  let prev = biomarker === 'GFAP' ? 18 : 200;

  for (let i = 0; i < samples; i++) {
    const phase = PHASES[phaseIdx];
    const band = biomarker === 'GFAP' ? phase.gfap : phase.uch;
    const target = band[0] + (band[1] - band[0]) * rand();
    // Smooth toward target
    prev = prev + (target - prev) * 0.25 + (rand() - 0.5) * (band[1] - band[0]) * 0.08;
    arr.push(Math.max(biomarker === 'GFAP' ? 5 : 50, prev));
    phaseTick++;
    if (phaseTick >= phase.duration) {
      phaseTick = 0;
      phaseIdx = (phaseIdx + 1) % PHASES.length;
    }
  }
  return arr;
}

// Legacy aliases for back-compat (now scaled to clinical units)
function generateGFAPSeries(hours = 24, seed = 42) { return generatePhaseSeries('GFAP', hours, seed); }
function generateUCHL1Series(hours = 24, seed = 99) { return generatePhaseSeries('UCHL1', hours, seed); }

function generateAUCSeries(gfapSeries, threshold = 30) {
  let cum = 0;
  const arr = [];
  for (const v of gfapSeries) {
    if (v > threshold) cum += (v - threshold) * 0.25; // 15-min step
    arr.push(cum);
  }
  return arr;
}

// Linear regression for trend line
function linearTrend(values) {
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return values.map((_, i) => slope * i + intercept);
}

// Moving average
function movingAvg(values, window = 8) {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

// ─────────── REAL-TIME SIMULATOR HOOK ───────────
// Returns continuously-updating GFAP/UCH-L1 series. Cycles through phases
// so the user can witness Normal → Caution → Danger → recovery transitions
// without intervention. Tick interval is configurable.
function useRealtimeSim({ tickMs = 1500, history = 96, onTransition } = {}) {
  // Bootstrap with 24h of phase-based history
  const [gfap, setGfap] = React.useState(() => generatePhaseSeries('GFAP', 24, 42));
  const [uch, setUch] = React.useState(() => generatePhaseSeries('UCHL1', 24, 99));
  const phaseRef = React.useRef({ idx: 0, tick: 0, prevGfap: 18, prevUch: 200 });
  const randRef = React.useRef(seededRandom(Date.now() % 233280));
  const lastStatusRef = React.useRef('good');

  React.useEffect(() => {
    // Sync phase pointer to whatever the bootstrapped history ended on
    const lastG = gfap[gfap.length - 1];
    const lastU = uch[uch.length - 1];
    phaseRef.current.prevGfap = lastG;
    phaseRef.current.prevUch = lastU;

    const id = setInterval(() => {
      const rand = randRef.current;
      const phase = PHASES[phaseRef.current.idx];

      const gBand = phase.gfap;
      const uBand = phase.uch;
      const gTarget = gBand[0] + (gBand[1] - gBand[0]) * rand();
      const uTarget = uBand[0] + (uBand[1] - uBand[0]) * rand();

      let nextG = phaseRef.current.prevGfap + (gTarget - phaseRef.current.prevGfap) * 0.18
        + (rand() - 0.5) * (gBand[1] - gBand[0]) * 0.06;
      let nextU = phaseRef.current.prevUch + (uTarget - phaseRef.current.prevUch) * 0.18
        + (rand() - 0.5) * (uBand[1] - uBand[0]) * 0.06;
      nextG = Math.max(5, nextG);
      nextU = Math.max(50, nextU);

      phaseRef.current.prevGfap = nextG;
      phaseRef.current.prevUch = nextU;
      phaseRef.current.tick++;
      if (phaseRef.current.tick >= phase.duration) {
        phaseRef.current.tick = 0;
        phaseRef.current.idx = (phaseRef.current.idx + 1) % PHASES.length;
      }

      // Detect overall status transition (worst of two markers)
      const sG = statusOf(nextG, 'GFAP');
      const sU = statusOf(nextU, 'UCHL1');
      const order = { good: 0, warn: 1, danger: 2 };
      const overall = order[sG] >= order[sU] ? sG : sU;
      const prev = lastStatusRef.current;
      if (overall !== prev) {
        if (onTransition) onTransition({ from: prev, to: overall, gfap: nextG, uch: nextU });
        lastStatusRef.current = overall;
      }

      setGfap(arr => [...arr.slice(-(history - 1)), nextG]);
      setUch(arr => [...arr.slice(-(history - 1)), nextU]);
    }, tickMs);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [tickMs, history]);

  return { gfap, uch };
}

Object.assign(window, {
  CLINICAL, statusOf,
  splinePath, mapPoints, seededRandom,
  generateGFAPSeries, generateUCHL1Series, generateAUCSeries,
  generatePhaseSeries,
  linearTrend, movingAvg,
  useRealtimeSim,
});
