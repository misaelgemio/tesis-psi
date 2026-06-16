// Editor de configuración de instrumentos. La investigadora pega aquí el texto
// de los ítems desde su copia licenciada (PSI-4-SF, COPE-28) y marca los inversos.
// Nada de esto sale del dispositivo.
import { useEffect, useState } from "react";
import { useApp } from "../app/AppContext";
import { db } from "../db/dexie";

export default function Configuracion() {
  const { config, recargarConfig } = useApp();
  const [psiTextos, setPsiTextos] = useState<Record<number, string>>({});
  const [copeTextos, setCopeTextos] = useState<Record<number, string>>({});
  const [psiInversos, setPsiInversos] = useState<number[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    const psi: Record<number, string> = {};
    config.psi.items.forEach((it) => (psi[it.n] = it.texto ?? ""));
    const cope: Record<number, string> = {};
    config.copeItems.items.forEach((it) => (cope[it.n] = it.texto ?? ""));
    setPsiTextos(psi);
    setCopeTextos(cope);
    setPsiInversos(config.psi.inversos ?? []);
  }, [config]);

  if (!config) return null;

  /** Reparte un pegado de varias líneas en los ítems 1..n (una línea por ítem). */
  function pegarMasivo(texto: string, total: number, setter: (r: Record<number, string>) => void) {
    const lineas = texto.replace(/\r/g, "").split("\n");
    const r: Record<number, string> = {};
    for (let n = 1; n <= total; n++) r[n] = (lineas[n - 1] ?? "").trim();
    setter(r);
  }

  function toggleInverso(n: number) {
    setPsiInversos((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  }

  async function guardar() {
    await db.ajustes.put({
      id: "config",
      psiTextos,
      copeTextos,
      psiInversos,
    });
    await recargarConfig();
    setMsg("✓ Ítems guardados en este dispositivo.");
    setTimeout(() => setMsg(null), 4000);
  }

  async function limpiar() {
    if (!confirm("¿Borrar los textos e inversos configurados y volver a los valores por defecto (vacíos)?")) return;
    await db.ajustes.delete("config");
    await recargarConfig();
    setMsg("Configuración restablecida.");
  }

  const psiCargados = Object.values(psiTextos).filter((t) => t.trim()).length;
  const copeCargados = Object.values(copeTextos).filter((t) => t.trim()).length;

  return (
    <div className="py-4 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-marca">Configuración de instrumentos</h1>
        <p className="text-gray-600 mt-1">
          Pegue aquí el texto de los ítems desde su copia licenciada del PSI-4-SF y del COPE-28. La
          información se guarda solo en este dispositivo.
        </p>
        <p className="text-sm bg-amber-50 border border-amber-200 rounded p-3 mt-3">
          ⚠️ El PSI-4-SF (PAR Inc.) y el COPE-28 son instrumentos con derechos de autor. La aplicación
          no los incluye; cárguelos usted desde su material autorizado.
        </p>
      </div>

      {/* ---------------- PSI ---------------- */}
      <section className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-bold text-lg text-marca">PSI-4-SF — 36 ítems ({psiCargados}/36 con texto)</h2>

        <details className="border rounded p-3">
          <summary className="cursor-pointer font-medium">Pegado rápido (una línea por ítem, en orden 1→36)</summary>
          <p className="text-sm text-gray-600 mt-2">
            Pegue las 36 frases, cada una en su propia línea. Se asignan al ítem 1, 2, 3, … en ese orden.
          </p>
          <textarea
            className="border rounded w-full p-2 mt-2 font-mono text-sm"
            rows={6}
            placeholder={"Frase del ítem 1\nFrase del ítem 2\n…"}
            onChange={(e) => pegarMasivo(e.target.value, 36, setPsiTextos)}
          />
        </details>

        <div className="space-y-2">
          <p className="text-sm font-medium">Ítems inversos: marque los que se puntúan al revés (según su manual).</p>
          {config.psi.items.map((it) => (
            <div key={it.n} className="flex items-start gap-2">
              <span className="font-mono text-marca w-7 pt-2 text-right">{it.n}.</span>
              <input
                className="border rounded px-2 py-1 flex-1"
                value={psiTextos[it.n] ?? ""}
                placeholder={`Texto del ítem ${it.n}`}
                onChange={(e) => setPsiTextos((p) => ({ ...p, [it.n]: e.target.value }))}
              />
              <label className="flex items-center gap-1 text-xs pt-2 whitespace-nowrap">
                <input type="checkbox" checked={psiInversos.includes(it.n)} onChange={() => toggleInverso(it.n)} />
                inverso
              </label>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          Inversos seleccionados: {psiInversos.length ? psiInversos.join(", ") : "ninguno"}.
        </p>
      </section>

      {/* ---------------- COPE ---------------- */}
      <section className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-bold text-lg text-marca">COPE-28 — 28 ítems ({copeCargados}/28 con texto)</h2>

        <details className="border rounded p-3">
          <summary className="cursor-pointer font-medium">Pegado rápido (una línea por ítem, en orden 1→28)</summary>
          <textarea
            className="border rounded w-full p-2 mt-2 font-mono text-sm"
            rows={6}
            placeholder={"Frase del ítem 1\nFrase del ítem 2\n…"}
            onChange={(e) => pegarMasivo(e.target.value, 28, setCopeTextos)}
          />
        </details>

        <div className="space-y-2">
          {config.copeItems.items.map((it) => (
            <div key={it.n} className="flex items-start gap-2">
              <span className="font-mono text-marca w-7 pt-2 text-right">{it.n}.</span>
              <input
                className="border rounded px-2 py-1 flex-1"
                value={copeTextos[it.n] ?? ""}
                placeholder={`Texto del ítem ${it.n}`}
                onChange={(e) => setCopeTextos((p) => ({ ...p, [it.n]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3 sticky bottom-0 bg-white/95 backdrop-blur py-3 border-t">
        <button onClick={guardar} className="bg-marca text-white px-5 py-2 rounded hover:bg-marca-claro">
          Guardar
        </button>
        <button onClick={limpiar} className="px-5 py-2 rounded border text-red-600">
          Restablecer
        </button>
        {msg && <span className="text-green-700">{msg}</span>}
      </div>
    </div>
  );
}
