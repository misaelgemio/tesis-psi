import { useRef, useState } from "react";
import { descargarRespaldo, exportarRespaldo, importarRespaldo, Respaldo } from "../db/backup";

export default function Exportar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function respaldar() {
    descargarRespaldo(await exportarRespaldo());
    setMsg("Respaldo JSON descargado.");
  }

  async function restaurar(file: File) {
    if (!confirm("Restaurar reemplazará TODOS los datos actuales. ¿Continuar?")) return;
    try {
      const respaldo = JSON.parse(await file.text()) as Respaldo;
      await importarRespaldo(respaldo);
      setMsg("Base restaurada correctamente.");
    } catch (e) {
      setMsg(`Error al restaurar: ${String(e)}`);
    }
  }

  return (
    <div className="py-4 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-marca">Exportar y respaldar</h1>

      <section className="bg-white border rounded-lg p-6 space-y-3">
        <h2 className="font-bold">CSV y PDF</h2>
        <p className="text-sm text-gray-600">
          En construcción (paso 6): CSV crudo (un participante por fila, columnas por ítem), CSV
          puntuado (subescalas/totales) y reporte PDF.
        </p>
      </section>

      <section className="bg-white border rounded-lg p-6 space-y-3">
        <h2 className="font-bold">Respaldo completo (JSON)</h2>
        <p className="text-sm text-gray-600">Exporte o restaure toda la base de datos local.</p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={respaldar} className="bg-marca text-white px-4 py-2 rounded hover:bg-marca-claro">
            Exportar respaldo JSON
          </button>
          <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded border">
            Restaurar desde JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && restaurar(e.target.files[0])}
          />
        </div>
      </section>

      {msg && <p className="bg-green-50 border border-green-200 rounded p-3 text-green-800">{msg}</p>}
    </div>
  );
}
