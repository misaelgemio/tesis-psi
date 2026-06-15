// Funciones estadísticas para el tablero de análisis.
// Implementación propia + jStat para distribuciones. Todo en el cliente.
import jstat from "jstat";

// jStat expone distribuciones; tipamos lo mínimo que usamos.
const { normal, studentt } = jstat as unknown as {
  normal: { cdf: (x: number, m: number, s: number) => number; inv: (p: number, m: number, s: number) => number };
  studentt: { cdf: (x: number, df: number) => number };
};

// ---------------------- Descriptivos ----------------------

export interface Descriptivos {
  n: number;
  media: number;
  de: number; // desviación estándar muestral (n-1)
  min: number;
  max: number;
  mediana: number;
}

/** Filtra valores no finitos (null/NaN). */
export function limpiar(valores: (number | null | undefined)[]): number[] {
  return valores.filter((v): v is number => typeof v === "number" && isFinite(v));
}

export function media(x: number[]): number {
  return x.reduce((a, b) => a + b, 0) / x.length;
}

/** Varianza muestral (denominador n-1). */
export function varianza(x: number[]): number {
  if (x.length < 2) return 0;
  const m = media(x);
  return x.reduce((a, b) => a + (b - m) ** 2, 0) / (x.length - 1);
}

export function de(x: number[]): number {
  return Math.sqrt(varianza(x));
}

export function mediana(x: number[]): number {
  const s = [...x].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function descriptivos(valores: (number | null | undefined)[]): Descriptivos | null {
  const x = limpiar(valores);
  if (x.length === 0) return null;
  return {
    n: x.length,
    media: media(x),
    de: de(x),
    min: Math.min(...x),
    max: Math.max(...x),
    mediana: mediana(x),
  };
}

// ---------------------- Alfa de Cronbach ----------------------

/**
 * Alfa de Cronbach sobre una matriz casos × ítems.
 * Usa solo los casos completos (sin faltantes en los ítems considerados).
 */
export function cronbachAlpha(matriz: (number | null)[][]): number | null {
  const completos = matriz.filter((fila) => fila.every((v) => v !== null && isFinite(v as number))) as number[][];
  const k = completos[0]?.length ?? 0;
  if (k < 2 || completos.length < 2) return null;

  // Varianza de cada ítem (columna).
  let sumaVarItems = 0;
  for (let j = 0; j < k; j++) {
    sumaVarItems += varianza(completos.map((fila) => fila[j]));
  }
  // Varianza de los totales por caso.
  const totales = completos.map((fila) => fila.reduce((a, b) => a + b, 0));
  const varTotal = varianza(totales);
  if (varTotal === 0) return null;

  return (k / (k - 1)) * (1 - sumaVarItems / varTotal);
}

// ---------------------- Shapiro-Wilk (Royston 1992, AS R94) ----------------------

export interface ShapiroResultado {
  W: number;
  p: number;
  n: number;
  /** Sugerencia: 'pearson' si p >= alfa (normal), 'spearman' si no. */
  sugerencia: "pearson" | "spearman";
}

export function shapiroWilk(valores: (number | null | undefined)[], alfa = 0.05): ShapiroResultado | null {
  const x = limpiar(valores).sort((a, b) => a - b);
  const n = x.length;
  if (n < 3 || n > 5000) return null;

  // m_i = Φ^{-1}((i - 3/8)/(n + 1/4))
  const m: number[] = [];
  for (let i = 1; i <= n; i++) {
    m.push(normal.inv((i - 0.375) / (n + 0.25), 0, 1));
  }
  const ssm = m.reduce((a, b) => a + b * b, 0);
  const rootSsm = Math.sqrt(ssm);
  const a = new Array<number>(n);

  if (n === 3) {
    a[0] = Math.sqrt(0.5);
    a[1] = 0;
    a[2] = -Math.sqrt(0.5);
  } else {
    const u = 1 / Math.sqrt(n);
    const cn = m[n - 1] / rootSsm;
    const cn1 = m[n - 2] / rootSsm;
    const an =
      cn + 0.221157 * u - 0.147981 * u ** 2 - 2.071190 * u ** 3 + 4.434685 * u ** 4 - 2.706056 * u ** 5;
    const an1 =
      cn1 + 0.042981 * u - 0.293762 * u ** 2 - 1.752461 * u ** 3 + 5.682633 * u ** 4 - 3.582633 * u ** 5;

    let phi: number;
    if (n <= 5) {
      phi = (ssm - 2 * m[n - 1] ** 2) / (1 - 2 * an ** 2);
    } else {
      phi = (ssm - 2 * m[n - 1] ** 2 - 2 * m[n - 2] ** 2) / (1 - 2 * an ** 2 - 2 * an1 ** 2);
    }
    const rootPhi = Math.sqrt(phi);

    a[n - 1] = an;
    a[0] = -an;
    if (n > 5) {
      a[n - 2] = an1;
      a[1] = -an1;
    }
    const desde = n > 5 ? 2 : 1;
    const hasta = n > 5 ? n - 3 : n - 2;
    for (let i = desde; i <= hasta; i++) {
      a[i] = m[i] / rootPhi;
    }
  }

  // W = (Σ a_i x_(i))^2 / Σ (x_i - xbar)^2
  const xbar = media(x);
  let numer = 0;
  let denom = 0;
  for (let i = 0; i < n; i++) {
    numer += a[i] * x[i];
    denom += (x[i] - xbar) ** 2;
  }
  if (denom === 0) return null;
  const W = (numer * numer) / denom;

  // Significancia
  let p: number;
  if (n === 3) {
    p = (6 / Math.PI) * (Math.asin(Math.sqrt(W)) - Math.asin(Math.sqrt(0.75)));
    p = Math.max(0, Math.min(1, p));
  } else {
    let mu: number;
    let sigma: number;
    let w_: number;
    if (n <= 11) {
      const gamma = -2.273 + 0.459 * n;
      w_ = -Math.log(gamma - Math.log(1 - W));
      mu = 0.5440 - 0.39978 * n + 0.025054 * n ** 2 - 0.0006714 * n ** 3;
      sigma = Math.exp(1.3822 - 0.77857 * n + 0.062767 * n ** 2 - 0.0020322 * n ** 3);
    } else {
      const ln = Math.log(n);
      w_ = Math.log(1 - W);
      mu = -1.5861 - 0.31082 * ln - 0.083751 * ln ** 2 + 0.0038915 * ln ** 3;
      sigma = Math.exp(-0.4803 - 0.082676 * ln + 0.0030302 * ln ** 2);
    }
    const z = (w_ - mu) / sigma;
    p = 1 - normal.cdf(z, 0, 1);
  }

  return { W, p, n, sugerencia: p >= alfa ? "pearson" : "spearman" };
}

// ---------------------- Correlaciones ----------------------

export interface CorrelacionResultado {
  metodo: "pearson" | "spearman";
  r: number;
  p: number;
  n: number;
  ic95: [number, number];
  /** Interpretación del tamaño del efecto (Cohen): nulo/pequeño/mediano/grande. */
  efecto: "insignificante" | "pequeño" | "mediano" | "grande";
  significativa: boolean;
}

/** Empareja dos series quedándose solo con los casos completos en ambas. */
export function paresCompletos(
  xs: (number | null | undefined)[],
  ys: (number | null | undefined)[],
): { x: number[]; y: number[] } {
  const x: number[] = [];
  const y: number[] = [];
  const n = Math.min(xs.length, ys.length);
  for (let i = 0; i < n; i++) {
    const a = xs[i];
    const b = ys[i];
    if (typeof a === "number" && isFinite(a) && typeof b === "number" && isFinite(b)) {
      x.push(a);
      y.push(b);
    }
  }
  return { x, y };
}

function interpretarEfecto(r: number): CorrelacionResultado["efecto"] {
  const a = Math.abs(r);
  if (a < 0.1) return "insignificante";
  if (a < 0.3) return "pequeño";
  if (a < 0.5) return "mediano";
  return "grande";
}

/** Rangos con corrección de empates (promedio). */
function rangos(x: number[]): number[] {
  const indexado = x.map((v, i) => ({ v, i }));
  indexado.sort((a, b) => a.v - b.v);
  const r = new Array<number>(x.length);
  let i = 0;
  while (i < indexado.length) {
    let j = i;
    while (j + 1 < indexado.length && indexado[j + 1].v === indexado[i].v) j++;
    const rangoProm = (i + j) / 2 + 1; // rangos base 1
    for (let k = i; k <= j; k++) r[indexado[k].i] = rangoProm;
    i = j + 1;
  }
  return r;
}

function pearsonRaw(x: number[], y: number[]): number {
  const mx = media(x);
  const my = media(y);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return NaN;
  return sxy / Math.sqrt(sxx * syy);
}

/** Significancia y IC95 comunes a Pearson/Spearman (vía t y transformación de Fisher). */
function inferenciaCorrelacion(r: number, n: number, metodo: "pearson" | "spearman", alfa = 0.05): CorrelacionResultado {
  let p = NaN;
  let ic95: [number, number] = [NaN, NaN];
  if (isFinite(r) && n > 3 && Math.abs(r) < 1) {
    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    p = 2 * (1 - studentt.cdf(Math.abs(t), n - 2));
    // Fisher z para IC95
    const z = 0.5 * Math.log((1 + r) / (1 - r));
    const se = 1 / Math.sqrt(n - 3);
    const zcrit = normal.inv(1 - alfa / 2, 0, 1);
    const lo = Math.tanh(z - zcrit * se);
    const hi = Math.tanh(z + zcrit * se);
    ic95 = [lo, hi];
  } else if (Math.abs(r) >= 1 && isFinite(r)) {
    p = 0;
    ic95 = [r, r];
  }
  return {
    metodo,
    r,
    p,
    n,
    ic95,
    efecto: interpretarEfecto(r),
    significativa: isFinite(p) && p < alfa,
  };
}

export function pearson(
  xs: (number | null | undefined)[],
  ys: (number | null | undefined)[],
  alfa = 0.05,
): CorrelacionResultado | null {
  const { x, y } = paresCompletos(xs, ys);
  if (x.length < 3) return null;
  return inferenciaCorrelacion(pearsonRaw(x, y), x.length, "pearson", alfa);
}

export function spearman(
  xs: (number | null | undefined)[],
  ys: (number | null | undefined)[],
  alfa = 0.05,
): CorrelacionResultado | null {
  const { x, y } = paresCompletos(xs, ys);
  if (x.length < 3) return null;
  const r = pearsonRaw(rangos(x), rangos(y));
  return inferenciaCorrelacion(r, x.length, "spearman", alfa);
}

/** Elige automáticamente Pearson o Spearman según normalidad de ambas series. */
export function correlacionAuto(
  xs: (number | null | undefined)[],
  ys: (number | null | undefined)[],
  alfa = 0.05,
): CorrelacionResultado | null {
  const sx = shapiroWilk(xs, alfa);
  const sy = shapiroWilk(ys, alfa);
  const ambasNormales = sx?.sugerencia === "pearson" && sy?.sugerencia === "pearson";
  return ambasNormales ? pearson(xs, ys, alfa) : spearman(xs, ys, alfa);
}
