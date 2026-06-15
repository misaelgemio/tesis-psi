export default function Tablero() {
  return (
    <div className="py-4 space-y-3">
      <h1 className="text-2xl font-bold text-marca">Tablero de análisis</h1>
      <p className="bg-blue-50 border border-blue-200 rounded p-4">
        En construcción (paso 5): descriptivos, alfa de Cronbach, Shapiro-Wilk, matriz de
        correlaciones estrés ↔ afrontamiento, comparaciones y gráficos. El motor estadístico ya está
        implementado y probado en <code>src/domain/stats.ts</code>.
      </p>
    </div>
  );
}
