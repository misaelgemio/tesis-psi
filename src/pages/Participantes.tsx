import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { db, siguienteCodigo } from "../db/dexie";
import { useApp } from "../app/AppContext";
import { puntuarCOPE, puntuarPSI } from "../domain/scoring";

export default function Participantes() {
  const { config } = useApp();
  const navigate = useNavigate();

  const filas = useLiveQuery(async () => {
    const participantes = await db.participantes.orderBy("id").toArray();
    return Promise.all(
      participantes.map(async (p) => {
        const ficha = await db.fichas.get(p.id);
        const psi = await db.psi.get(p.id);
        const cope = await db.cope.get(p.id);
        const psiRes = psi && config ? puntuarPSI(psi.respuestas, config.psi) : null;
        const copeRes = cope && config ? puntuarCOPE(cope.respuestas, config.copeMapping) : null;
        const fichaOk = !!(ficha?.cuidador.vinculo || ficha?.adolescente.edad);
        const psiCount = psi ? Object.values(psi.respuestas).filter((v) => v !== null && v !== undefined).length : 0;
        const copeCount = cope ? Object.values(cope.respuestas).filter((v) => v !== null && v !== undefined).length : 0;
        const avance = Math.round(((fichaOk ? 1 : 0) / 3 + (psiCount / 36) / 3 + (copeCount / 28) / 3) * 100);
        return { p, fichaOk, psiCount, copeCount, psiRes, copeRes, avance };
      }),
    );
  }, [config]);

  async function crear() {
    const id = await siguienteCodigo();
    await db.participantes.add({
      id,
      creado: new Date().toISOString(),
      consentimiento: { aceptado: false, fecha: null },
    });
    navigate(`/consentimiento/${id}`);
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-marca">Participantes</h1>
        <button onClick={crear} className="bg-marca text-white px-4 py-2 rounded hover:bg-marca-claro">
          + Nuevo participante
        </button>
      </div>

      {!filas || filas.length === 0 ? (
        <p className="text-gray-500 bg-white border rounded p-6 text-center">
          Aún no hay participantes. Cree el primero para iniciar.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Consent.</th>
                <th className="p-3">Ficha</th>
                <th className="p-3">PSI</th>
                <th className="p-3">COPE</th>
                <th className="p-3">Avance</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ p, fichaOk, psiCount, copeCount, psiRes, copeRes, avance }) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-mono">{p.id}</td>
                  <td className="p-3">{p.consentimiento.aceptado ? "✓" : "—"}</td>
                  <td className="p-3">{fichaOk ? "✓" : "—"}</td>
                  <td className="p-3">
                    {psiCount}/36{" "}
                    {psiRes && !psiRes.valido && <span className="text-red-600" title="Inválido por faltantes">⚠</span>}
                  </td>
                  <td className="p-3">
                    {copeCount}/28{" "}
                    {copeRes && !copeRes.valido && <span className="text-red-600" title="Inválido por faltantes">⚠</span>}
                  </td>
                  <td className="p-3">{avance}%</td>
                  <td className="p-3 flex gap-2 flex-wrap">
                    <Link to={`/ficha/${p.id}`} className="text-marca underline">Ficha</Link>
                    <Link to={`/psi/${p.id}`} className="text-marca underline">PSI</Link>
                    <Link to={`/cope/${p.id}`} className="text-marca underline">COPE</Link>
                    <button
                      onClick={async () => {
                        if (confirm(`¿Eliminar ${p.id} y todos sus datos?`)) {
                          await db.transaction("rw", db.participantes, db.fichas, db.psi, db.cope, async () => {
                            await db.participantes.delete(p.id);
                            await db.fichas.delete(p.id);
                            await db.psi.delete(p.id);
                            await db.cope.delete(p.id);
                          });
                        }
                      }}
                      className="text-red-600 underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
