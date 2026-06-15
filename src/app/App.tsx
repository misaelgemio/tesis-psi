import { NavLink, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext";
import Inicio from "../pages/Inicio";
import Consentimiento from "../pages/Consentimiento";
import Participantes from "../pages/Participantes";
import Ficha from "../pages/Ficha";
import PSI from "../pages/PSI";
import COPE from "../pages/COPE";
import Tablero from "../pages/Tablero";
import Exportar from "../pages/Exportar";

function Nav() {
  const { modo, setModo } = useApp();
  const linkBase = "px-3 py-2 rounded hover:bg-marca-claro hover:text-white transition-colors";
  const activo = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${isActive ? "bg-marca text-white" : "text-marca"}`;
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 flex-wrap">
        <span className="font-bold text-marca mr-4">Estudio REDBOPEA</span>
        <nav className="flex gap-1 flex-wrap text-sm">
          <NavLink to="/" end className={activo}>
            Inicio
          </NavLink>
          <NavLink to="/participantes" className={activo}>
            Participantes
          </NavLink>
          <NavLink to="/tablero" className={activo}>
            Tablero
          </NavLink>
          <NavLink to="/exportar" className={activo}>
            Exportar
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <label htmlFor="modo">Modo:</label>
          <select
            id="modo"
            value={modo}
            onChange={(e) => setModo(e.target.value as "entrevista" | "autoaplicado")}
            className="border rounded px-2 py-1"
          >
            <option value="entrevista">Entrevista</option>
            <option value="autoaplicado">Autoaplicado</option>
          </select>
        </div>
      </div>
    </header>
  );
}

function Contenido() {
  const { cargando, error, modo } = useApp();

  if (cargando) {
    return <p className="p-8 text-center">Cargando configuración…</p>;
  }
  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-red-700">
        <h2 className="font-bold text-lg">Error al cargar la configuración</h2>
        <p>{error}</p>
        <p className="mt-2 text-sm text-gray-600">
          Verifique que los archivos en <code>public/config</code> existan y sean JSON válido.
        </p>
      </div>
    );
  }

  return (
    <div className={modo === "autoaplicado" ? "modo-autoaplicado" : ""}>
      <Nav />
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/consentimiento/:id" element={<Consentimiento />} />
          <Route path="/participantes" element={<Participantes />} />
          <Route path="/ficha/:id" element={<Ficha />} />
          <Route path="/psi/:id" element={<PSI />} />
          <Route path="/cope/:id" element={<COPE />} />
          <Route path="/tablero" element={<Tablero />} />
          <Route path="/exportar" element={<Exportar />} />
        </Routes>
      </main>
      <footer className="max-w-5xl mx-auto p-4 text-xs text-gray-500 border-t mt-8">
        Datos con fines académicos; tratamiento confidencial y agregado. Esta aplicación funciona sin
        conexión: los datos se guardan únicamente en este dispositivo.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Contenido />
    </AppProvider>
  );
}
