import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, Ficha as FichaT } from "../db/dexie";
import { useApp } from "../app/AppContext";

const vacia = (id: string): FichaT => ({
  participanteId: id,
  cuidador: {},
  adolescente: {},
});

export default function Ficha() {
  const { id } = useParams<{ id: string }>();
  const { config } = useApp();
  const navigate = useNavigate();
  const guardada = useLiveQuery(() => (id ? db.fichas.get(id) : undefined), [id]);
  const [ficha, setFicha] = useState<FichaT | null>(null);

  useEffect(() => {
    if (id) setFicha(guardada ?? vacia(id));
  }, [guardada, id]);

  if (!ficha || !id) return null;

  const edadAdo = ficha.adolescente.edad;
  const edadInvalida = edadAdo !== undefined && (edadAdo < 10 || edadAdo > 19);

  function set<T extends "cuidador" | "adolescente">(grupo: T, campo: string, valor: unknown) {
    setFicha((f) => (f ? { ...f, [grupo]: { ...f[grupo], [campo]: valor } } : f));
  }

  async function guardar() {
    if (edadInvalida) return;
    await db.fichas.put(ficha!);
    navigate(`/psi/${id}`);
  }

  const inputCls = "border rounded px-3 py-2 w-full";
  const labelCls = "block text-sm font-medium mb-1";

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-marca">Ficha sociodemográfica</h1>
        <span className="font-mono text-sm text-gray-500">{id}</span>
      </div>

      <fieldset className="bg-white border rounded-lg p-6 space-y-4">
        <legend className="font-bold text-marca px-2">Del cuidador</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Parentesco / vínculo</label>
            <select className={inputCls} value={ficha.cuidador.vinculo ?? ""} onChange={(e) => set("cuidador", "vinculo", e.target.value)}>
              <option value="">—</option>
              <option>Madre</option>
              <option>Padre</option>
              <option>Tutor/a</option>
              <option>Otro</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Sexo</label>
            <select className={inputCls} value={ficha.cuidador.sexo ?? ""} onChange={(e) => set("cuidador", "sexo", e.target.value)}>
              <option value="">—</option>
              <option>Femenino</option>
              <option>Masculino</option>
              <option>Otro</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Edad</label>
            <input type="number" className={inputCls} value={ficha.cuidador.edad ?? ""} onChange={(e) => set("cuidador", "edad", e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div>
            <label className={labelCls}>Estado civil</label>
            <input className={inputCls} value={ficha.cuidador.estadoCivil ?? ""} onChange={(e) => set("cuidador", "estadoCivil", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Nivel educativo</label>
            <input className={inputCls} value={ficha.cuidador.nivelEducativo ?? ""} onChange={(e) => set("cuidador", "nivelEducativo", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Ocupación</label>
            <input className={inputCls} value={ficha.cuidador.ocupacion ?? ""} onChange={(e) => set("cuidador", "ocupacion", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>¿Cuidador único o compartido?</label>
            <select className={inputCls} value={ficha.cuidador.cuidadorUnico === undefined ? "" : ficha.cuidador.cuidadorUnico ? "unico" : "compartido"} onChange={(e) => set("cuidador", "cuidadorUnico", e.target.value === "" ? undefined : e.target.value === "unico")}>
              <option value="">—</option>
              <option value="unico">Único</option>
              <option value="compartido">Compartido</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Redes de apoyo</label>
            <input className={inputCls} value={ficha.cuidador.redesApoyo ?? ""} onChange={(e) => set("cuidador", "redesApoyo", e.target.value)} />
          </div>
        </div>
      </fieldset>

      <fieldset className="bg-white border rounded-lg p-6 space-y-4">
        <legend className="font-bold text-marca px-2">Del adolescente</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Sexo</label>
            <select className={inputCls} value={ficha.adolescente.sexo ?? ""} onChange={(e) => set("adolescente", "sexo", e.target.value)}>
              <option value="">—</option>
              <option>Femenino</option>
              <option>Masculino</option>
              <option>Otro</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Edad (10–19)</label>
            <input type="number" min={10} max={19} className={`${inputCls} ${edadInvalida ? "border-red-500" : ""}`} value={edadAdo ?? ""} onChange={(e) => set("adolescente", "edad", e.target.value ? Number(e.target.value) : undefined)} />
            {edadInvalida && <p className="text-red-600 text-sm mt-1">La edad debe estar entre 10 y 19 años.</p>}
          </div>
          <div>
            <label className={labelCls}>Grado de apoyo / severidad (DSM-5-TR)</label>
            <select className={inputCls} value={ficha.adolescente.nivelApoyoTEA ?? ""} onChange={(e) => set("adolescente", "nivelApoyoTEA", e.target.value ? (Number(e.target.value) as 1 | 2 | 3) : undefined)}>
              <option value="">—</option>
              <option value={1}>Nivel 1 (requiere apoyo)</option>
              <option value={2}>Nivel 2 (apoyo sustancial)</option>
              <option value={3}>Nivel 3 (apoyo muy sustancial)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Tiempo desde el diagnóstico</label>
            <input className={inputCls} value={ficha.adolescente.tiempoDesdeDx ?? ""} onChange={(e) => set("adolescente", "tiempoDesdeDx", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Comorbilidades</label>
            <input className={inputCls} value={ficha.adolescente.comorbilidades ?? ""} onChange={(e) => set("adolescente", "comorbilidades", e.target.value)} />
          </div>
        </div>
      </fieldset>

      {config && config.incentivo.opciones.length > 0 && (
        <fieldset className="bg-white border rounded-lg p-6 space-y-3">
          <legend className="font-bold text-marca px-2">Incentivo</legend>
          <label className={labelCls}>Incentivo elegido / entregado</label>
          <select
            className={inputCls}
            value={ficha.incentivo ?? ""}
            onChange={(e) => setFicha((f) => (f ? { ...f, incentivo: e.target.value || undefined } : f))}
          >
            <option value="">—</option>
            {config.incentivo.opciones.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </fieldset>
      )}

      <div className="flex gap-3">
        <button onClick={guardar} disabled={edadInvalida} className="bg-marca text-white px-5 py-2 rounded hover:bg-marca-claro disabled:opacity-50">
          Guardar y continuar al PSI
        </button>
        <button onClick={() => navigate("/participantes")} className="px-5 py-2 rounded border">
          Volver
        </button>
      </div>
    </div>
  );
}
