// Cuestionario Likert genérico con autoguardado en IndexedDB y barra de progreso.
import { useEffect, useMemo, useRef, useState } from "react";
import { Respuestas } from "../domain/types";
import ItemLikert from "./ItemLikert";
import ProgressBar from "./ProgressBar";

interface ItemDef {
  numero: number;
  texto: string;
}

interface Props {
  titulo: string;
  subtitulo?: string;
  items: ItemDef[];
  escala: { min: number; max: number; etiquetas: Record<string, string> };
  inicial: Respuestas;
  /** Persiste las respuestas (autoguardado). */
  onGuardar: (r: Respuestas) => Promise<void> | void;
  /** Resultado de puntuación para mostrar validez (faltantes). */
  onFinalizar: () => void;
}

export default function Cuestionario({
  titulo,
  subtitulo,
  items,
  escala,
  inicial,
  onGuardar,
  onFinalizar,
}: Props) {
  const [respuestas, setRespuestas] = useState<Respuestas>(inicial);
  const [guardado, setGuardado] = useState<"guardado" | "guardando" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const respondidos = useMemo(
    () => items.filter((it) => respuestas[it.numero] !== null && respuestas[it.numero] !== undefined).length,
    [respuestas, items],
  );

  // Autoguardado con rebote de 400 ms.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    setGuardado("guardando");
    timer.current = setTimeout(async () => {
      await onGuardar(respuestas);
      setGuardado("guardado");
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [respuestas]);

  const faltan = items.length - respondidos;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-marca">{titulo}</h1>
        {subtitulo && <p className="text-gray-600">{subtitulo}</p>}
      </div>
      <ProgressBar valor={respondidos} total={items.length} />
      <div className="text-right text-xs text-gray-500 h-4">
        {guardado === "guardando" ? "Guardando…" : guardado === "guardado" ? "✓ Guardado" : ""}
      </div>

      <div className="space-y-3">
        {items.map((it) => (
          <ItemLikert
            key={it.numero}
            numero={it.numero}
            texto={it.texto}
            escala={escala}
            valor={respuestas[it.numero] ?? null}
            onChange={(v) => setRespuestas((prev) => ({ ...prev, [it.numero]: v }))}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-gray-600">
          {faltan === 0 ? "Todos los ítems respondidos." : `Faltan ${faltan} ítem(s).`}
        </p>
        <button
          onClick={onFinalizar}
          className="bg-marca text-white px-4 py-2 rounded hover:bg-marca-claro"
        >
          Guardar y volver
        </button>
      </div>
    </div>
  );
}
