// Contexto global: configuración cargada y modo de aplicación.
import { createContext, useContext, useEffect, useState } from "react";
import { AppConfig, cargarConfig } from "./config";

export type Modo = "entrevista" | "autoaplicado";

interface Ctx {
  config: AppConfig | null;
  cargando: boolean;
  error: string | null;
  modo: Modo;
  setModo: (m: Modo) => void;
  recargarConfig: () => Promise<void>;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modo, setModo] = useState<Modo>("entrevista");

  async function recargarConfig() {
    const c = await cargarConfig();
    setConfig(c);
  }

  useEffect(() => {
    cargarConfig()
      .then(setConfig)
      .catch((e) => setError(String(e)))
      .finally(() => setCargando(false));
  }, []);

  return (
    <AppCtx.Provider value={{ config, cargando, error, modo, setModo, recargarConfig }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}
