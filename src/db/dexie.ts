// Base de datos local (IndexedDB vía Dexie). Privacidad por diseño: nada sale del dispositivo.
import Dexie, { Table } from "dexie";
import { Respuestas } from "../domain/types";

export interface Participante {
  id: string; // p. ej. "REDBOPEA-001"
  creado: string; // ISO
  consentimiento: { aceptado: boolean; fecha: string | null };
}

export interface Ficha {
  participanteId: string;
  cuidador: {
    vinculo?: string; // madre / padre / tutor / otro
    sexo?: string;
    edad?: number;
    estadoCivil?: string;
    nivelEducativo?: string;
    ocupacion?: string;
    cuidadorUnico?: boolean;
    redesApoyo?: string;
  };
  adolescente: {
    sexo?: string;
    edad?: number; // 10–19
    nivelApoyoTEA?: 1 | 2 | 3;
    comorbilidades?: string;
    tiempoDesdeDx?: string;
  };
  /** Incentivo elegido o entregado a este participante (opción configurada). */
  incentivo?: string;
}

export interface RespuestasPSI {
  participanteId: string;
  respuestas: Respuestas;
  actualizado: string;
}

export interface RespuestasCOPE {
  participanteId: string;
  respuestas: Respuestas;
  actualizado: string;
}

/**
 * Ajustes editables por la investigadora (sobrescriben los archivos JSON).
 * Aquí se cargan los textos de su copia licenciada de los instrumentos.
 */
export interface Ajustes {
  id: "config"; // registro único
  psiTextos?: Record<number, string>; // n.º de ítem → texto
  psiInversos?: number[];
  copeTextos?: Record<number, string>;
  /** Incentivo por participación: texto para el consentimiento y opciones a registrar. */
  incentivo?: { intro: string; opciones: string[] };
}

export class TesisDB extends Dexie {
  participantes!: Table<Participante, string>;
  fichas!: Table<Ficha, string>;
  psi!: Table<RespuestasPSI, string>;
  cope!: Table<RespuestasCOPE, string>;
  ajustes!: Table<Ajustes, string>;

  constructor() {
    super("tesis-psi");
    this.version(1).stores({
      participantes: "id, creado",
      fichas: "participanteId",
      psi: "participanteId",
      cope: "participanteId",
    });
    this.version(2).stores({
      participantes: "id, creado",
      fichas: "participanteId",
      psi: "participanteId",
      cope: "participanteId",
      ajustes: "id",
    });
  }
}

export const db = new TesisDB();

/** Genera el siguiente código REDBOPEA-NNN según los participantes existentes. */
export async function siguienteCodigo(): Promise<string> {
  const todos = await db.participantes.toArray();
  let max = 0;
  for (const p of todos) {
    const m = p.id.match(/(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `REDBOPEA-${String(max + 1).padStart(3, "0")}`;
}
