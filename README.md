# Estudio REDBOPEA — Estrés parental y estrategias de afrontamiento

App **local-first** de apoyo a la investigación para un perfil de tesis (Psicología, UDABOL, La Paz, 2026):
aplica, puntúa y analiza el **PSI-4-SF** (estrés parental) y el **COPE-28** (estrategias de
afrontamiento) en cuidadores primarios de adolescentes con TEA.

> 🔒 **Privacidad por diseño:** ningún dato sale del dispositivo. Sin nube, sin telemetría.
> Los participantes se identifican solo con un código anónimo (`REDBOPEA-001`, …).
> Los datos se guardan en IndexedDB (navegador) o en el almacenamiento local de la app de escritorio.

## Requisitos

- Node.js ≥ 18 (probado con Node 25).
- Para empaquetar como app de escritorio: [Rust](https://rustup.rs) (toolchain `cargo`).

## Cómo correr

```bash
npm install
npm run dev        # abre en http://localhost:5188
```

### Pruebas (motor de puntuación y estadística)

```bash
npm test
```

Las pruebas validan el motor de puntuación (PSI/COPE, inversión, regla de exclusión) y los
estadísticos (alfa de Cronbach, Pearson, Spearman, Shapiro-Wilk) contra casos calculados a mano.

### Build web

```bash
npm run build      # genera dist/ (sitio estático, funciona offline)
```

### App de escritorio (Tauri)

Requiere Rust instalado. La primera vez, genere los iconos:

```bash
npm run tauri icon ruta/a/un-logo-1024.png   # crea src-tauri/icons/*
npm run tauri dev                              # desarrollo
npm run tauri build                            # genera instalador (.dmg/.app, .msi/.exe)
```

## Configuración editable (sin tocar código)

Los archivos en `public/config/` se editan con cualquier editor de texto:

| Archivo | Qué contiene |
|---|---|
| `psi_items.json` | Estructura del PSI-4-SF: escala, subescalas, **ítems inversos** y el **texto de cada ítem** (vacío por defecto). |
| `cope_items.json` | Texto de los 28 ítems del COPE-28 (vacío por defecto). |
| `cope_mapping.json` | Mapeo subescala → ítems → **estilo** (adaptativo / desadaptativo / evitativo). Configurable. |
| `consent.json` | Texto del consentimiento informado. |

> ⚠️ **Instrumentos propietarios.** El PSI-4-SF (PAR Inc.) y el COPE-28 son material con derechos.
> La app **no incluye el texto literal de los ítems**: solo la estructura y las reglas de puntuación.
> Pegue el texto de su copia licenciada en los archivos `*_items.json`.

### Ítems de puntuación inversa del PSI

`psi_items.json` trae `"inversos": []` (vacío). Confirme contra el **manual oficial** del PSI-4-SF
qué ítems se puntúan de forma inversa y agréguelos a esa lista (p. ej. `"inversos": [22, 33]`).
La inversión se aplica dentro de la escala 1–5 (1↔5, 2↔4, 3=3).

## Reglas de puntuación (Anexo A)

### PSI-4-SF (36 ítems, Likert 1–5)
- **PD** (Malestar parental) = Σ ítems 1–12
- **P-CDI** (Interacción disfuncional) = Σ ítems 13–24
- **DC** (Hijo difícil) = Σ ítems 25–36
- **Total** = PD + P-CDI + DC

### COPE-28 (28 ítems, Likert 0–3)
- 14 subescalas de 2 ítems; cada subescala = suma de sus 2 ítems (0–6).
- Estilos: **adaptativo**, **desadaptativo**, **evitativo** (autodistracción y desahogo → evitativo,
  configurable). Índice de estilo = media de sus subescalas.

### Exclusión
Un cuestionario con **> 10 % de ítems sin responder** se marca como **inválido**.

## Estructura del proyecto

```
public/config/      Archivos editables (instrumentos, mapeos, consentimiento)
src/domain/         scoring.ts (motor puro) + stats.ts (estadística) + types.ts
src/db/             Dexie (IndexedDB) + respaldo JSON
src/components/     Likert, barra de progreso, cuestionario genérico
src/pages/          Inicio, Consentimiento, Participantes, Ficha, PSI, COPE, Tablero, Exportar
tests/              Pruebas Vitest (scoring + stats)
src-tauri/          Configuración de la app de escritorio (Tauri v2)
```

## Estado de implementación

- [x] Scaffold (Vite + React + TS + Tailwind + Dexie + Tauri)
- [x] Motor de puntuación `scoring.ts` + pruebas
- [x] Módulo estadístico `stats.ts` + pruebas (alfa, Shapiro-Wilk, Pearson/Spearman, IC95, efecto)
- [x] Base local + alta de participantes + consentimiento
- [x] Formularios Ficha / PSI / COPE con autoguardado y progreso
- [x] Respaldo / restauración JSON
- [ ] Tablero de análisis con gráficos (paso 5)
- [ ] Exportación CSV (crudo y puntuado) y PDF (paso 6)
- [ ] Modo autoaplicado pulido + accesibilidad fina (paso 7)
```
