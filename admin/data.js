/* Monidle data — patients, biomarkers, alerts, time-series */
/* Loaded as plain JS, exposes window.MonidleData */

(function () {
  // ── helpers ────────────────────────────────────────────
  // deterministic pseudo-random for reproducible series
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Generate timestamped series. nPoints over hours window, interval auto.
  function genSeries({ seed, nPoints, base, drift, noise, jumpAt, jumpTo, ma = false }) {
    const rand = mulberry32(seed);
    const points = [];
    let val = base;
    for (let i = 0; i < nPoints; i++) {
      val += (drift / nPoints) + (rand() - 0.5) * noise;
      if (jumpAt && i === jumpAt) val = jumpTo;
      // mild trend after jump
      if (jumpAt && i > jumpAt) val += (rand() - 0.3) * (noise * 1.4);
      points.push(Math.max(0, val));
    }
    return points;
  }

  // ── thresholds (환자 앱 utils.jsx CLINICAL과 통일) ───────
  // GFAP: 정상 ≤30, 주의 30-100, 위험 ≥100 pg/mL
  // UCH-L1: 정상 ≤327, 주의 327-1000, 위험 ≥1000 pg/mL
  // AUC: 정상 ≤200, 주의 200-1200, 위험 ≥1200 pg·h
  const GFAP_THRESHOLD = 100;   // 위험 임계값 (pg/mL)
  const UCHL1_THRESHOLD = 1000; // 위험 임계값 (pg/mL)
  const AUC_DANGER = 1200;      // 위험 임계값 (pg·h)
  const GFAP_CAUTION = 30;      // 주의 진입
  const UCHL1_CAUTION = 327;    // 주의 진입

  // ── 김민준 — 6h detailed series, 360 points (1/min) ────
  // Climbing, breaches threshold around hour 4
  const minjunGfap = (function () {
    const r = mulberry32(7);
    const arr = [];
    let v = 48;
    for (let i = 0; i < 360; i++) {
      // baseline drift + ramp after t=180
      const ramp = i > 180 ? Math.pow((i - 180) / 180, 1.6) * 110 : 0;
      const noise = (r() - 0.5) * 4.5;
      v = 48 + ramp + noise;
      arr.push(+v.toFixed(2));
    }
    return arr;
  })();
  const minjunUchl1 = (function () {
    const r = mulberry32(11);
    const arr = [];
    for (let i = 0; i < 360; i++) {
      const ramp = i > 220 ? Math.pow((i - 220) / 140, 1.4) * 70 : 0;
      const noise = (r() - 0.5) * 3;
      arr.push(+(28 + ramp + noise).toFixed(2));
    }
    return arr;
  })();

  // moving average (window n)
  function movingAvg(arr, n = 15) {
    const out = [];
    let sum = 0;
    const q = [];
    for (let i = 0; i < arr.length; i++) {
      q.push(arr[i]); sum += arr[i];
      if (q.length > n) sum -= q.shift();
      out.push(sum / q.length);
    }
    return out;
  }

  // linear regression y = a + b*x over arr (returns predicted line array)
  function trendLine(arr) {
    const n = arr.length;
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (let i = 0; i < n; i++) {
      sx += i; sy += arr[i]; sxx += i * i; sxy += i * arr[i];
    }
    const b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const a = (sy - b * sx) / n;
    return arr.map((_, i) => a + b * i);
  }

  function stdBand(arr, ma, k = 1) {
    // rolling std (last 30)
    const out = [];
    const win = 30;
    for (let i = 0; i < arr.length; i++) {
      const start = Math.max(0, i - win);
      const slice = arr.slice(start, i + 1);
      const m = ma[i];
      const v = slice.reduce((s, x) => s + (x - m) * (x - m), 0) / slice.length;
      out.push(Math.sqrt(v));
    }
    return out.map((s, i) => ({ upper: ma[i] + k * s, lower: Math.max(0, ma[i] - k * s) }));
  }

  // ── Patients ────────────────────────────────────────────
  const patients = [
    {
      id: 'PT-0042', name: '김민재', name_en: 'Kim Minjae',
      sex: '남', age: 38, room: '신경외과 305',
      status: 'good',
      scenario: 'live',
      diagnosis: '경증 두부 외상 관찰',
      symptoms: ['경미한 두통'],
      gfap:  { value: 26.4, delta: 0.3, baseline: 30, threshold: GFAP_THRESHOLD },
      uchl1: { value: 198.2, delta: 0.2, baseline: 327, threshold: UCHL1_THRESHOLD },
      auc:   { value: 78,    danger: AUC_DANGER },
      connected: true, lastUpdate: '방금 전',
      memo: { author: 'Dr. 이수현', time: '08:20', text: '낙상 후 경과 관찰 중. 24시간 모니터링 권고.' },
      prescription: ['Acetaminophen 500mg PRN'],
    },
    // ── 주의 (warning) — 3명 ──
    // 이수진: 회복 시나리오 — 며칠 전 피크, 치료 후 정상으로 회복 중 (현재 주의 하한)
    {
      id: 'PT-0038', name: '이수진', name_en: 'Lee Sujin', sex: '여', age: 41, room: '신경외과 215', status: 'warning',
      scenario: 'recovery',
      diagnosis: '외상성 뇌손상 (TBI) — 회복기',
      symptoms: ['두통(호전)', '인지기능 정상화 중'],
      gfap: { value: 38.4, delta: -1.6, baseline: 42, threshold: GFAP_THRESHOLD },
      uchl1: { value: 372.1, delta: -12.4, baseline: 240, threshold: UCHL1_THRESHOLD },
      auc: { value: 482, danger: AUC_DANGER },
      connected: true, lastUpdate: '1분 전',
      memo: { author: 'Dr. 이수현', time: '15:40', text: '치료 후 GFAP·UCH-L1 정상 범위로 하향 안정. 24시간 후 퇴원 검토.' },
      prescription: ['Mannitol 20% 250mL IV (D/C)', 'Acetaminophen 500mg PRN'],
    },
    // 박재형: 허혈성 뇌졸중 시나리오 — 주의 범위 내 진동 (오르락 내리락)
    {
      id: 'PT-0029', name: '박재형', name_en: 'Park Jaehyung', sex: '남', age: 67, room: 'ICU 04', status: 'warning',
      scenario: 'ischemic',
      diagnosis: '허혈성 뇌졸중 의증',
      symptoms: ['두통', '어지러움', '일시적 언어장애'],
      gfap: { value: 56.2, delta: 2.8, baseline: 38, threshold: GFAP_THRESHOLD },
      uchl1: { value: 612.7, delta: 18.3, baseline: 220, threshold: UCHL1_THRESHOLD },
      auc: { value: 856, danger: AUC_DANGER },
      connected: true, lastUpdate: '방금 전' },
    // 정유리: 일반 주의 추세 (완만한 상승)
    {
      id: 'PT-0051', name: '정유리', name_en: 'Jung Yuri', sex: '여', age: 36, room: '신경외과 308', status: 'warning',
      scenario: 'rising',
      diagnosis: '경증 TBI',
      symptoms: ['두통'],
      gfap: { value: 48.4, delta: 1.2, baseline: 31, threshold: GFAP_THRESHOLD },
      uchl1: { value: 491.2, delta: 8.8, baseline: 190, threshold: UCHL1_THRESHOLD },
      auc: { value: 540, danger: AUC_DANGER },
      connected: true, lastUpdate: '2분 전' },

    // ── 정상 (good) — 12명 ──
    { id: 'PT-0142', name: '김민준', name_en: 'Kim Minjun', sex: '남', age: 54, room: '신경외과 302', status: 'good',
      gfap: { value: 24.3, delta: 0.4, baseline: 22, threshold: GFAP_THRESHOLD },
      uchl1: { value: 214.1, delta: 1.2, baseline: 200, threshold: UCHL1_THRESHOLD },
      auc: { value: 156, danger: AUC_DANGER },
      connected: true, lastUpdate: '방금 전' },
    { id: 'PT-0047', name: '최도윤', name_en: 'Choi Doyoon', sex: '남', age: 29, room: '신경외과 311', status: 'good',
      gfap: { value: 18.1, delta: 0.6, baseline: 18, threshold: GFAP_THRESHOLD },
      uchl1: { value: 168.9, delta: 0.8, baseline: 170, threshold: UCHL1_THRESHOLD },
      auc: { value: 122, danger: AUC_DANGER },
      connected: true, lastUpdate: '4분 전' },
    { id: 'PT-0044', name: '한지민', name_en: 'Han Jimin', sex: '여', age: 52, room: '신경외과 209', status: 'good',
      gfap: { value: 21.7, delta: 0.6, baseline: 20, threshold: GFAP_THRESHOLD },
      uchl1: { value: 196.1, delta: 1.1, baseline: 180, threshold: UCHL1_THRESHOLD },
      auc: { value: 144, danger: AUC_DANGER },
      connected: true, lastUpdate: '6분 전' },
    { id: 'PT-0040', name: '오세훈', name_en: 'Oh Sehoon', sex: '남', age: 48, room: '신경외과 312', status: 'good',
      gfap: { value: 16.2, delta: 0.5, baseline: 17, threshold: GFAP_THRESHOLD },
      uchl1: { value: 153.4, delta: 0.6, baseline: 170, threshold: UCHL1_THRESHOLD },
      auc: { value: 108, danger: AUC_DANGER },
      connected: false, lastUpdate: '12분 전' },
    { id: 'PT-0051b', name: '신예린', name_en: 'Shin Yerin', sex: '여', age: 31, room: '신경외과 308', status: 'good',
      gfap: { value: 14.5, delta: 0.3, baseline: 16, threshold: GFAP_THRESHOLD },
      uchl1: { value: 142.6, delta: 0.4, baseline: 150, threshold: UCHL1_THRESHOLD },
      auc: { value: 96, danger: AUC_DANGER },
      connected: true, lastUpdate: '7분 전' },
    { id: 'PT-0033', name: '홍지훈', name_en: 'Hong Jihun', sex: '남', age: 59, room: '신경외과 204', status: 'good',
      gfap: { value: 12.1, delta: 0.4, baseline: 14, threshold: GFAP_THRESHOLD },
      uchl1: { value: 124.3, delta: 0.5, baseline: 160, threshold: UCHL1_THRESHOLD },
      auc: { value: 88, danger: AUC_DANGER },
      connected: false, lastUpdate: '23분 전' },
    { id: 'PT-0031', name: '서연우', name_en: 'Seo Yeonwoo', sex: '여', age: 33, room: '신경외과 205', status: 'good',
      gfap: { value: 18.4, delta: 1.1, baseline: 15, threshold: GFAP_THRESHOLD },
      uchl1: { value: 174.2, delta: 1.3, baseline: 170, threshold: UCHL1_THRESHOLD },
      auc: { value: 142, danger: AUC_DANGER },
      connected: true, lastUpdate: '8분 전' },
    { id: 'PT-0028', name: '강민서', name_en: 'Kang Minseo', sex: '여', age: 27, room: '신경외과 206', status: 'good',
      gfap: { value: 9.8, delta: 0.0, baseline: 12, threshold: GFAP_THRESHOLD },
      uchl1: { value: 112.4, delta: 0.0, baseline: 140, threshold: UCHL1_THRESHOLD },
      auc: { value: 64, danger: AUC_DANGER },
      connected: true, lastUpdate: '5분 전' },
    { id: 'PT-0024', name: '윤도현', name_en: 'Yoon Dohyun', sex: '남', age: 44, room: '신경외과 207', status: 'good',
      gfap: { value: 22.6, delta: 1.8, baseline: 19, threshold: GFAP_THRESHOLD },
      uchl1: { value: 218.1, delta: 2.4, baseline: 180, threshold: UCHL1_THRESHOLD },
      auc: { value: 188, danger: AUC_DANGER },
      connected: true, lastUpdate: '11분 전' },
    { id: 'PT-0019', name: '임수아', name_en: 'Lim Sua', sex: '여', age: 38, room: '신경외과 210', status: 'good',
      gfap: { value: 15.3, delta: 0.5, baseline: 14, threshold: GFAP_THRESHOLD },
      uchl1: { value: 138.8, delta: 0.6, baseline: 150, threshold: UCHL1_THRESHOLD },
      auc: { value: 102, danger: AUC_DANGER },
      connected: true, lastUpdate: '3분 전' },
    { id: 'PT-0015', name: '배준호', name_en: 'Bae Junho', sex: '남', age: 61, room: '신경외과 213', status: 'good',
      gfap: { value: 19.7, delta: 0.7, baseline: 17, threshold: GFAP_THRESHOLD },
      uchl1: { value: 191.6, delta: 0.9, baseline: 170, threshold: UCHL1_THRESHOLD },
      auc: { value: 178, danger: AUC_DANGER },
      connected: false, lastUpdate: '34분 전' },
    { id: 'PT-0011', name: '문지아', name_en: 'Moon Jia', sex: '여', age: 25, room: '신경외과 214', status: 'good',
      gfap: { value: 11.2, delta: 0.0, baseline: 12, threshold: GFAP_THRESHOLD },
      uchl1: { value: 120.0, delta: 0.0, baseline: 130, threshold: UCHL1_THRESHOLD },
      auc: { value: 71, danger: AUC_DANGER },
      connected: true, lastUpdate: '9분 전' },
  ];

  // 김민준 alerts
  const minjunAlerts = [
    { time: '16:50', level: 'danger',  text: 'GFAP 임계값 초과', detail: '142.3 pg/mL (임계값 2.49×)' },
    { time: '15:23', level: 'warning', text: 'UCH-L1 상승 감지', detail: '+11.2% (vs. baseline)' },
    { time: '14:32', level: 'danger',  text: '위험 상태 진입', detail: 'GFAP 임계값 첫 돌파' },
    { time: '13:10', level: 'good',    text: '센서 재연결', detail: 'Sensor B 통신 복구' },
    { time: '12:00', level: 'info',    text: '일일 리포트 생성', detail: '오전 측정 완료' },
  ];

  // 김민재 alerts (정상 상태에서 시작)
  const minjaeAlerts = [
    { time: '08:20', level: 'good', text: '입원 등록', detail: '경증 두부 외상 관찰' },
    { time: '08:30', level: 'info', text: '센서 부착 완료', detail: 'MNDL-2 정상 작동' },
    { time: '09:15', level: 'good', text: '바이탈 정상', detail: 'GFAP 26.4 / UCH-L1 198.2' },
  ];

  // ── Per-patient biomarker series ─────────────────────────────
  // Each series is 360 points (1/min over 6h). Shape varies by `scenario`:
  //  · 'live'     — 김민재 (PT-0042). Live buffer fed by patient app.
  //  · 'recovery' — 이수진. Peaked early then decayed back to normal.
  //  · 'ischemic' — 박재형. Oscillates in/out of warning range (stroke-like).
  //  · 'rising'   — 정유리. Slow climb toward threshold.
  //  · 'flat'     — default for 정상 환자. Mild baseline drift.
  function buildScenario(scenario, opts = {}) {
    const r = mulberry32(opts.seed || 1);
    const N = 360;
    const arr = [];
    const base = opts.base || 20;
    const noise = opts.noise || 1.5;

    if (scenario === 'recovery') {
      // peak around i=70, then exponential decay back to baseline
      const peakI = opts.peakI || 70;
      const peakH = opts.peakH || 90;        // peak height ABOVE baseline
      for (let i = 0; i < N; i++) {
        const peak = Math.exp(-Math.pow((i - peakI) / 35, 2)) * peakH;
        const decay = i > peakI ? Math.min(1, (i - peakI) / 240) : 0;
        const v = base + peak * (1 - decay * 0.95);
        arr.push(+(v + (r() - 0.5) * noise).toFixed(2));
      }
      return arr;
    }
    if (scenario === 'ischemic') {
      // oscillation in/around warning range — repeated mini-peaks crossing caution but not critical
      const amp = opts.amp || 14;
      for (let i = 0; i < N; i++) {
        const wave1 = Math.sin(i / 26) * amp;
        const wave2 = Math.sin(i / 11 + 1.4) * (amp * 0.45);
        const drift = Math.sin(i / 130) * (amp * 0.35);
        const v = base + wave1 + wave2 + drift + amp * 0.4;
        arr.push(+(Math.max(base * 0.3, v) + (r() - 0.5) * noise).toFixed(2));
      }
      return arr;
    }
    if (scenario === 'rising') {
      // gradual climb
      for (let i = 0; i < N; i++) {
        const ramp = Math.pow(i / N, 1.4) * (opts.climb || 25);
        const drift = Math.sin(i / 60) * 2;
        const v = base + ramp + drift;
        arr.push(+(v + (r() - 0.5) * noise).toFixed(2));
      }
      return arr;
    }
    // 'flat' / default — mild drift
    for (let i = 0; i < N; i++) {
      const drift = Math.sin(i / 80) * (opts.drift || 1.5) + Math.cos(i / 35) * 0.6;
      arr.push(+(base + drift + (r() - 0.5) * noise).toFixed(2));
    }
    return arr;
  }

  // 김민재 live buffers — initialized with flat baseline; appended on each tick
  const minjaeGfap = buildScenario('flat', { seed: 17, base: 26, noise: 1.6, drift: 1.2 });
  const minjaeUchl1 = buildScenario('flat', { seed: 23, base: 198, noise: 4, drift: 6 });

  // Pre-build deterministic series for non-live patients, keyed by id
  const _seriesCache = new Map();
  function _patientSeries(patient, marker) {
    const key = patient.id + ':' + marker;
    if (_seriesCache.has(key)) return _seriesCache.get(key);

    const isGfap = marker === 'gfap';
    const seedBase = patient.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const seed = seedBase + (isGfap ? 0 : 100);
    const cur = patient[marker].value;

    let series;
    if (patient.scenario === 'recovery') {
      // Peaked around hr 1, recovered to current value
      series = buildScenario('recovery', {
        seed,
        base: isGfap ? 22 : 220,
        peakI: 80,
        peakH: isGfap ? 95 : 720,
        noise: isGfap ? 1.8 : 8,
      });
    } else if (patient.scenario === 'ischemic') {
      series = buildScenario('ischemic', {
        seed,
        base: isGfap ? 50 : 480,
        amp: isGfap ? 14 : 130,
        noise: isGfap ? 2.0 : 9,
      });
    } else if (patient.scenario === 'rising') {
      series = buildScenario('rising', {
        seed,
        base: isGfap ? patient[marker].baseline : patient[marker].baseline,
        climb: cur - patient[marker].baseline,
        noise: isGfap ? 1.6 : 7,
      });
    } else {
      // flat / good — tight band around current value
      series = buildScenario('flat', {
        seed,
        base: cur,
        noise: isGfap ? 1.0 : 5,
        drift: isGfap ? 1.2 : 6,
      });
    }
    _seriesCache.set(key, series);
    return series;
  }

  function seriesFor(patientId, marker) {
    const p = (typeof patientId === 'string')
      ? patients.find(x => x.id === patientId)
      : patientId;
    if (!p) return [];
    if (p.scenario === 'live') {
      return marker === 'gfap' ? minjaeGfap : minjaeUchl1;
    }
    return _patientSeries(p, marker);
  }

  // Append a live data point to 김민재's buffer (called by orchestrator)
  function appendMinjae(gfapVal, uchl1Val) {
    if (typeof gfapVal === 'number') {
      minjaeGfap.push(+gfapVal.toFixed(2));
      if (minjaeGfap.length > 360) minjaeGfap.shift();
    }
    if (typeof uchl1Val === 'number') {
      minjaeUchl1.push(+uchl1Val.toFixed(2));
      if (minjaeUchl1.length > 360) minjaeUchl1.shift();
    }
  }

  // ── Pub/sub for live updates (orchestrator can mutate `patients`
  //    in place and call MonidleData.notify() to refresh consumers) ──
  const _subscribers = new Set();
  function subscribe(fn) { _subscribers.add(fn); return () => _subscribers.delete(fn); }
  function notify(payload) { _subscribers.forEach(fn => { try { fn(payload || {}); } catch (e) { console.error(e); } }); }

  window.MonidleData = {
    patients,
    minjunAlerts,
    minjaeAlerts,
    minjunGfap, minjunUchl1,
    minjaeGfap, minjaeUchl1,
    seriesFor, appendMinjae,
    GFAP_THRESHOLD, UCHL1_THRESHOLD, AUC_DANGER,
    GFAP_CAUTION, UCHL1_CAUTION,
    movingAvg, trendLine, stdBand,
    subscribe, notify,
  };
})();
