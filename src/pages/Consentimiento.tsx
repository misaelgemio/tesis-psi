import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../app/AppContext";
import { db } from "../db/dexie";

export default function Consentimiento() {
  const { id } = useParams<{ id: string }>();
  const { config } = useApp();
  const navigate = useNavigate();
  const participante = useLiveQuery(() => (id ? db.participantes.get(id) : undefined), [id]);

  if (!config || !id) return null;
  const c = config.consent;

  async function aceptar() {
    await db.participantes.update(id!, {
      consentimiento: { aceptado: true, fecha: new Date().toISOString() },
    });
    navigate(`/ficha/${id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-marca">{c.titulo}</h1>
        <span className="font-mono text-sm text-gray-500">{id}</span>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-3 leading-relaxed">
        {c.parrafos.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p className="text-sm text-gray-500 border-t pt-3 mt-3">{c.avisoPie}</p>
      </div>

      {participante?.consentimiento.aceptado ? (
        <p className="bg-green-50 border border-green-200 rounded p-3 text-green-800">
          ✓ Consentimiento aceptado el {new Date(participante.consentimiento.fecha!).toLocaleString("es-BO")}.
        </p>
      ) : (
        <div className="flex gap-3">
          <button onClick={aceptar} className="bg-marca text-white px-5 py-2 rounded hover:bg-marca-claro">
            {c.textoBotonAceptar}
          </button>
          <button onClick={() => navigate("/participantes")} className="px-5 py-2 rounded border">
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
