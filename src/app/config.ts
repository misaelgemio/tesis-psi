// Carga los archivos de configuración editables desde /config,
// fusionando los ajustes que la investigadora haya guardado en el dispositivo.
import { db } from "../db/dexie";
import { CopeConfig, CopeMapping, PsiConfig } from "../domain/types";

export interface ConsentConfig {
  titulo: string;
  version: string;
  parrafos: string[];
  avisoPie: string;
  textoBotonAceptar: string;
}

export interface IncentivoConfig {
  intro: string;
  opciones: string[];
}

export interface AppConfig {
  psi: PsiConfig;
  copeItems: CopeConfig;
  copeMapping: CopeMapping;
  consent: ConsentConfig;
  incentivo: IncentivoConfig;
}

async function cargarJson<T>(ruta: string): Promise<T> {
  const res = await fetch(ruta);
  if (!res.ok) throw new Error(`No se pudo cargar ${ruta}`);
  return (await res.json()) as T;
}

export async function cargarConfig(): Promise<AppConfig> {
  const base = import.meta.env.BASE_URL;
  const [psi, copeItems, copeMapping, consent] = await Promise.all([
    cargarJson<PsiConfig>(`${base}config/psi_items.json`),
    cargarJson<CopeConfig>(`${base}config/cope_items.json`),
    cargarJson<CopeMapping>(`${base}config/cope_mapping.json`),
    cargarJson<ConsentConfig>(`${base}config/consent.json`),
  ]);

  const incentivo: IncentivoConfig = { intro: "", opciones: [] };

  // Sobrescribir con los ajustes guardados por la investigadora (su copia licenciada).
  const ajustes = await db.ajustes.get("config");
  if (ajustes) {
    if (ajustes.psiTextos) {
      psi.items = psi.items.map((it) => ({ ...it, texto: ajustes.psiTextos![it.n] ?? it.texto }));
    }
    if (ajustes.psiInversos) {
      psi.inversos = ajustes.psiInversos;
    }
    if (ajustes.copeTextos) {
      copeItems.items = copeItems.items.map((it) => ({
        ...it,
        texto: ajustes.copeTextos![it.n] ?? it.texto,
      }));
    }
    if (ajustes.incentivo) {
      incentivo.intro = ajustes.incentivo.intro ?? "";
      incentivo.opciones = ajustes.incentivo.opciones ?? [];
    }
  }

  return { psi, copeItems, copeMapping, consent, incentivo };
}
