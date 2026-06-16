import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../app/AppContext";
import { db } from "../db/dexie";
import { Respuestas } from "../domain/types";
import Cuestionario from "../components/Cuestionario";

export default function COPE() {
  const { id } = useParams<{ id: string }>();
  const { config } = useApp();
  const navigate = useNavigate();
  // Default `null` en la 1.ª render = "aún cargando". Una vez resuelta la consulta,
  // devuelve el registro o `undefined` (participante sin respuestas todavía).
  const registro = useLiveQuery(() => (id ? db.cope.get(id) : undefined), [id], null);

  if (!config || !id) return null;
  if (registro === null) return <p className="p-4">Cargando…</p>;

  const inicial: Respuestas = registro?.respuestas ?? {};
  const sinTexto = config.copeItems.items.every((it) => !it.texto);

  return (
    <div className="py-2">
      {sinTexto && (
        <p className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 text-sm">
          ⚠ El texto de los ítems del COPE-28 no está cargado. Péguelo en{" "}
          <code>public/config/cope_items.json</code>. La puntuación por subescalas y estilos ya
          funciona.
        </p>
      )}
      <Cuestionario
        titulo="COPE-28 — Estrategias de afrontamiento"
        subtitulo="28 ítems. Escala: 0 = Nunca … 3 = Casi siempre."
        items={config.copeItems.items.map((it) => ({ numero: it.n, texto: it.texto }))}
        escala={config.copeItems.escala}
        inicial={inicial}
        onGuardar={async (r) => {
          await db.cope.put({ participanteId: id, respuestas: r, actualizado: new Date().toISOString() });
        }}
        onFinalizar={() => navigate("/participantes")}
      />
    </div>
  );
}
