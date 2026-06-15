// Carga los archivos de configuración editables desde /config.
import { CopeConfig, CopeMapping, PsiConfig } from "../domain/types";

export interface ConsentConfig {
  titulo: string;
  version: string;
  parrafos: string[];
  avisoPie: string;
  textoBotonAceptar: string;
}

export interface AppConfig {
  psi: PsiConfig;
  copeItems: CopeConfig;
  copeMapping: CopeMapping;
  consent: ConsentConfig;
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
  return { psi, copeItems, copeMapping, consent };
}
