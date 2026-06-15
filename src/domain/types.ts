// Tipos del dominio: configuración de instrumentos, respuestas y puntuaciones.

// ---------- Configuración de instrumentos ----------

export interface EscalaConfig {
  min: number;
  max: number;
  etiquetas: Record<string, string>;
}

export interface PsiSubescala {
  id: "PD" | "P_CDI" | "DC";
  nombre: string;
  items: number[];
}

export interface PsiConfig {
  escala: EscalaConfig;
  subescalas: PsiSubescala[];
  /** Números de ítem con puntuación inversa (configurable). */
  inversos: number[];
  items: { n: number; texto: string }[];
}

export type EstiloCope = "adaptativo" | "desadaptativo" | "evitativo";

export interface CopeSubescala {
  id: string;
  nombre: string;
  items: number[];
  estilo: EstiloCope;
}

export interface CopeMapping {
  estilos: EstiloCope[];
  subescalas: CopeSubescala[];
}

export interface CopeConfig {
  escala: EscalaConfig;
  items: { n: number; texto: string }[];
}

// ---------- Respuestas crudas ----------

/** Respuestas por número de ítem. `null` = sin responder. */
export type Respuestas = Record<number, number | null>;

// ---------- Resultados de puntuación ----------

export interface ResultadoPSI {
  subescalas: { PD: number | null; P_CDI: number | null; DC: number | null };
  total: number | null;
  /** Cantidad de ítems sin responder (sobre 36). */
  faltantes: number;
  /** Proporción de ítems faltantes (0–1). */
  propFaltantes: number;
  /** false si supera el umbral de exclusión. */
  valido: boolean;
}

export interface ResultadoCOPE {
  /** Puntaje por subescala (suma de sus 2 ítems, 0–6). null si faltan datos. */
  subescalas: Record<string, number | null>;
  /** Índices por estilo = media de las subescalas del estilo. */
  estilos: Record<EstiloCope, number | null>;
  faltantes: number;
  propFaltantes: number;
  valido: boolean;
}

/** Umbral de exclusión: > 10 % de ítems sin responder ⇒ inválido. */
export const UMBRAL_EXCLUSION = 0.1;
