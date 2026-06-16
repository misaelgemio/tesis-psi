import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../app/AppContext";
import { db } from "../db/dexie";
import { Respuestas } from "../domain/types";
import Cuestionario from "../components/Cuestionario";

export default function PSI() {
  const { id } = useParams<{ id: string }>();
  const { config } = useApp();
  const navigate = useNavigate();
  // Default `null` en la 1.ª render = "aún cargando". Una vez resuelta la consulta,
  // devuelve el registro o `undefined` (participante sin respuestas todavía).
  const registro = useLiveQuery(() => (id ? db.psi.get(id) : undefined), [id], null);

  if (!config || !id) return null;
  if (registro === null) return <p className="p-4">Cargando…</p>;

  const inicial: Respuestas = registro?.respuestas ?? {};
  const sinTexto = config.psi.items.every((it) => !it.texto);

  return (
    <div className="py-2">
      {sinTexto && (
        <p className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 text-sm">
          ⚠ El texto de los ítems del PSI-4-SF no está cargado (instrumento propietario). Péguelo desde
          su copia licenciada en <code>public/config/psi_items.json</code>. La estructura de puntuación
          ya funciona.
        </p>
      )}
      <Cuestionario
        titulo="PSI-4-SF — Estrés parental"
        subtitulo="36 ítems. Escala: 1 = Totalmente en desacuerdo … 5 = Totalmente de acuerdo."
        items={config.psi.items.map((it) => ({ numero: it.n, texto: it.texto }))}
        escala={config.psi.escala}
        inicial={inicial}
        onGuardar={async (r) => {
          await db.psi.put({ participanteId: id, respuestas: r, actualizado: new Date().toISOString() });
        }}
        onFinalizar={() => navigate(`/cope/${id}`)}
      />
    </div>
  );
}
