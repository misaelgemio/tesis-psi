// Motor de puntuación PURO (sin UI, sin DB). Testeable de forma aislada.
// Implementa las reglas del Anexo A del brief.

import {
  CopeMapping,
  EstiloCope,
  PsiConfig,
  Respuestas,
  ResultadoCOPE,
  ResultadoPSI,
  UMBRAL_EXCLUSION,
} from "./types";

/** Invierte un valor Likert dentro de [min, max]. Ej. escala 1–5: 1↔5, 2↔4, 3=3. */
export function invertir(valor: number, min: number, max: number): number {
  return min + max - valor;
}

/** Suma los ítems indicados; devuelve null si alguno falta. */
function sumarItems(
  respuestas: Respuestas,
  items: number[],
): number | null {
  let total = 0;
  for (const n of items) {
    const v = respuestas[n];
    if (v === null || v === undefined) return null;
    total += v;
  }
  return total;
}

/** Cuenta ítems sin responder dentro de un conjunto de números de ítem. */
function contarFaltantes(respuestas: Respuestas, items: number[]): number {
  let faltan = 0;
  for (const n of items) {
    const v = respuestas[n];
    if (v === null || v === undefined) faltan++;
  }
  return faltan;
}

// ---------------------- PSI-4-SF ----------------------

/**
 * Puntúa el PSI-4-SF (36 ítems, Likert 1–5).
 * PD = Σ ítems 1–12, P-CDI = Σ 13–24, DC = Σ 25–36, total = PD+P-CDI+DC.
 * Aplica puntuación inversa a los ítems listados en config.inversos.
 */
export function puntuarPSI(
  respuestas: Respuestas,
  config: PsiConfig,
): ResultadoPSI {
  const { min, max } = config.escala;
  const inversos = new Set(config.inversos);
  const todosItems = config.subescalas.flatMap((s) => s.items);

  // Respuestas con la inversión ya aplicada.
  const ajustadas: Respuestas = {};
  for (const n of todosItems) {
    const v = respuestas[n];
    if (v === null || v === undefined) {
      ajustadas[n] = null;
    } else {
      ajustadas[n] = inversos.has(n) ? invertir(v, min, max) : v;
    }
  }

  const sub: Record<string, number | null> = {};
  for (const s of config.subescalas) {
    sub[s.id] = sumarItems(ajustadas, s.items);
  }

  const PD = sub["PD"] ?? null;
  const P_CDI = sub["P_CDI"] ?? null;
  const DC = sub["DC"] ?? null;

  const total =
    PD !== null && P_CDI !== null && DC !== null ? PD + P_CDI + DC : null;

  const faltantes = contarFaltantes(respuestas, todosItems);
  const propFaltantes = todosItems.length ? faltantes / todosItems.length : 0;
  const valido = propFaltantes <= UMBRAL_EXCLUSION;

  return {
    subescalas: { PD, P_CDI, DC },
    total,
    faltantes,
    propFaltantes,
    valido,
  };
}

// ---------------------- COPE-28 ----------------------

/** Media aritmética; null si la lista está vacía o contiene null. */
function media(valores: (number | null)[]): number | null {
  if (valores.length === 0) return null;
  let suma = 0;
  for (const v of valores) {
    if (v === null) return null;
    suma += v;
  }
  return suma / valores.length;
}

/**
 * Puntúa el COPE-28 (28 ítems, Likert 0–3).
 * Cada subescala = suma de sus 2 ítems (0–6).
 * Índice por estilo = media de las subescalas de ese estilo.
 */
export function puntuarCOPE(
  respuestas: Respuestas,
  mapping: CopeMapping,
): ResultadoCOPE {
  const subescalas: Record<string, number | null> = {};
  for (const s of mapping.subescalas) {
    subescalas[s.id] = sumarItems(respuestas, s.items);
  }

  // Índices por estilo: media de las subescalas asignadas a cada estilo.
  const estilos = {} as Record<EstiloCope, number | null>;
  for (const estilo of mapping.estilos) {
    const valores = mapping.subescalas
      .filter((s) => s.estilo === estilo)
      .map((s) => subescalas[s.id]);
    estilos[estilo] = media(valores);
  }

  const todosItems = mapping.subescalas.flatMap((s) => s.items);
  const faltantes = contarFaltantes(respuestas, todosItems);
  const propFaltantes = todosItems.length ? faltantes / todosItems.length : 0;
  const valido = propFaltantes <= UMBRAL_EXCLUSION;

  return { subescalas, estilos, faltantes, propFaltantes, valido };
}
