import { Link } from "react-router-dom";

export default function Inicio() {
  return (
    <div className="space-y-6 py-4">
      <section className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-bold text-marca">
          Estrés parental y estrategias de afrontamiento
        </h1>
        <p className="text-gray-600 mt-1">
          Cuidadores primarios de adolescentes con TEA — Red Boliviana de Padres de Personas con
          Autismo (REDBOPEA). Perfil de tesis, Licenciatura en Psicología (UDABOL, La Paz, 2026).
        </p>
        <p className="mt-4 text-sm bg-amber-50 border border-amber-200 rounded p-3">
          🔒 <strong>Local-first:</strong> ningún dato sale de este dispositivo. Sin conexión, sin
          telemetría. Los participantes se identifican solo con un código anónimo.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/participantes"
          className="block bg-white rounded-lg border p-6 hover:border-marca hover:shadow"
        >
          <h2 className="font-bold text-lg text-marca">Participantes</h2>
          <p className="text-gray-600 text-sm mt-1">
            Registrar, ver avance y completar ficha, PSI-4-SF y COPE-28.
          </p>
        </Link>
        <Link
          to="/tablero"
          className="block bg-white rounded-lg border p-6 hover:border-marca hover:shadow"
        >
          <h2 className="font-bold text-lg text-marca">Tablero de análisis</h2>
          <p className="text-gray-600 text-sm mt-1">
            Descriptivos, fiabilidad, normalidad, correlaciones y gráficos.
          </p>
        </Link>
        <Link
          to="/exportar"
          className="block bg-white rounded-lg border p-6 hover:border-marca hover:shadow"
        >
          <h2 className="font-bold text-lg text-marca">Exportar</h2>
          <p className="text-gray-600 text-sm mt-1">CSV (crudo y puntuado), PDF y respaldo JSON.</p>
        </Link>
      </section>
    </div>
  );
}
