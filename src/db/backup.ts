// Respaldo y restauración de toda la base como archivo JSON.
import { db, Ficha, Participante, RespuestasCOPE, RespuestasPSI } from "./dexie";

export interface Respaldo {
  app: "tesis-psi";
  version: 1;
  exportado: string;
  participantes: Participante[];
  fichas: Ficha[];
  psi: RespuestasPSI[];
  cope: RespuestasCOPE[];
}

export async function exportarRespaldo(): Promise<Respaldo> {
  const [participantes, fichas, psi, cope] = await Promise.all([
    db.participantes.toArray(),
    db.fichas.toArray(),
    db.psi.toArray(),
    db.cope.toArray(),
  ]);
  return {
    app: "tesis-psi",
    version: 1,
    exportado: new Date().toISOString(),
    participantes,
    fichas,
    psi,
    cope,
  };
}

export function descargarRespaldo(respaldo: Respaldo): void {
  const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `respaldo-tesis-psi-${respaldo.exportado.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Reemplaza toda la base con el contenido del respaldo (previa confirmación en UI). */
export async function importarRespaldo(respaldo: Respaldo): Promise<void> {
  if (respaldo.app !== "tesis-psi") {
    throw new Error("El archivo no es un respaldo válido de esta aplicación.");
  }
  await db.transaction("rw", db.participantes, db.fichas, db.psi, db.cope, async () => {
    await Promise.all([db.participantes.clear(), db.fichas.clear(), db.psi.clear(), db.cope.clear()]);
    await db.participantes.bulkAdd(respaldo.participantes ?? []);
    await db.fichas.bulkAdd(respaldo.fichas ?? []);
    await db.psi.bulkAdd(respaldo.psi ?? []);
    await db.cope.bulkAdd(respaldo.cope ?? []);
  });
}
