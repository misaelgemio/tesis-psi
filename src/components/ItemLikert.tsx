// Un ítem Likert accesible: número, texto (si está configurado) y opciones radio.
interface Props {
  numero: number;
  texto: string;
  escala: { min: number; max: number; etiquetas: Record<string, string> };
  valor: number | null;
  onChange: (v: number) => void;
}

export default function ItemLikert({ numero, texto, escala, valor, onChange }: Props) {
  const opciones: number[] = [];
  for (let v = escala.min; v <= escala.max; v++) opciones.push(v);

  return (
    <fieldset
      className={`border rounded-lg p-4 ${valor === null ? "border-gray-200" : "border-marca/40 bg-marca/5"}`}
    >
      <legend className="font-medium px-1">
        <span className="text-marca font-bold mr-2">{numero}.</span>
        {texto ? texto : <span className="text-gray-400 italic">(texto del ítem sin configurar)</span>}
      </legend>
      <div className="flex flex-wrap gap-2 mt-2">
        {opciones.map((v) => {
          const sel = valor === v;
          return (
            <label
              key={v}
              className={`cursor-pointer border rounded-lg px-3 py-2 flex flex-col items-center min-w-[4.5rem] text-center ${
                sel ? "bg-marca text-white border-marca" : "bg-white hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name={`item-${numero}`}
                value={v}
                checked={sel}
                onChange={() => onChange(v)}
                className="sr-only"
              />
              <span className="font-bold">{v}</span>
              <span className={`text-xs mt-1 ${sel ? "text-white" : "text-gray-500"}`}>
                {escala.etiquetas[String(v)] ?? ""}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
