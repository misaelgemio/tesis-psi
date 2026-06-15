import { describe, expect, it } from "vitest";
import { invertir, puntuarCOPE, puntuarPSI } from "../src/domain/scoring";
import { CopeMapping, PsiConfig, Respuestas } from "../src/domain/types";
import psiJson from "../public/config/psi_items.json";
import copeItemsJson from "../public/config/cope_items.json";
import copeMappingJson from "../public/config/cope_mapping.json";

const psiConfig = psiJson as unknown as PsiConfig;
const copeMapping = copeMappingJson as unknown as CopeMapping;

/** Construye respuestas con el mismo valor para un rango [desde, hasta]. */
function rango(desde: number, hasta: number, valor: number | null): Respuestas {
  const r: Respuestas = {};
  for (let n = desde; n <= hasta; n++) r[n] = valor;
  return r;
}

describe("invertir", () => {
  it("invierte en escala 1–5: 1↔5, 2↔4, 3=3", () => {
    expect(invertir(1, 1, 5)).toBe(5);
    expect(invertir(2, 1, 5)).toBe(4);
    expect(invertir(3, 1, 5)).toBe(3);
    expect(invertir(5, 1, 5)).toBe(1);
  });
});

describe("Configuración de instrumentos", () => {
  it("PSI tiene 36 ítems y 3 subescalas de 12", () => {
    expect(psiConfig.items.length).toBe(36);
    expect(psiConfig.subescalas.map((s) => s.items.length)).toEqual([12, 12, 12]);
    const todos = psiConfig.subescalas.flatMap((s) => s.items).sort((a, b) => a - b);
    expect(todos).toEqual(Array.from({ length: 36 }, (_, i) => i + 1));
  });

  it("COPE tiene 28 ítems y 14 subescalas de 2 que cubren 1–28 sin repetir", () => {
    expect((copeItemsJson as any).items.length).toBe(28);
    expect(copeMapping.subescalas.length).toBe(14);
    const todos = copeMapping.subescalas.flatMap((s) => s.items).sort((a, b) => a - b);
    expect(todos).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
    copeMapping.subescalas.forEach((s) => expect(s.items.length).toBe(2));
  });

  it("COPE clasifica autodistracción y desahogo como evitativo", () => {
    const auto = copeMapping.subescalas.find((s) => s.id === "autodistraccion");
    const des = copeMapping.subescalas.find((s) => s.id === "desahogo");
    expect(auto?.estilo).toBe("evitativo");
    expect(des?.estilo).toBe("evitativo");
  });
});

describe("puntuarPSI", () => {
  it("todas las respuestas = 3 ⇒ PD=36, P-CDI=36, DC=36, total=108", () => {
    const r = puntuarPSI(rango(1, 36, 3), psiConfig);
    expect(r.subescalas).toEqual({ PD: 36, P_CDI: 36, DC: 36 });
    expect(r.total).toBe(108);
    expect(r.valido).toBe(true);
    expect(r.faltantes).toBe(0);
  });

  it("aplica puntuación inversa en los ítems configurados", () => {
    // Ítem 1 inverso: respuesta 1 → cuenta como 5; resto en 3.
    const cfg: PsiConfig = { ...psiConfig, inversos: [1] };
    const resp = { ...rango(1, 36, 3), 1: 1 };
    const r = puntuarPSI(resp, cfg);
    // PD = 11 ítems en 3 (33) + ítem1 invertido (5) = 38
    expect(r.subescalas.PD).toBe(38);
    expect(r.total).toBe(38 + 36 + 36);
  });

  it("marca inválido con > 10 % de ítems faltantes (>3.6 ⇒ ≥4 de 36)", () => {
    const resp = rango(1, 36, 3);
    resp[1] = null;
    resp[2] = null;
    resp[3] = null;
    resp[4] = null; // 4 faltantes = 11.1 %
    const r = puntuarPSI(resp, psiConfig);
    expect(r.faltantes).toBe(4);
    expect(r.valido).toBe(false);
    expect(r.subescalas.PD).toBeNull(); // subescala con faltantes no se suma
  });

  it("3 faltantes (8.3 %) sigue siendo válido", () => {
    const resp = rango(1, 36, 3);
    resp[13] = null;
    resp[14] = null;
    resp[15] = null;
    const r = puntuarPSI(resp, psiConfig);
    expect(r.valido).toBe(true);
    expect(r.subescalas.P_CDI).toBeNull();
    expect(r.subescalas.PD).toBe(36);
  });
});

describe("puntuarCOPE", () => {
  it("todas las respuestas = 2 ⇒ cada subescala = 4 y cada estilo = 4", () => {
    const r = puntuarCOPE(rango(1, 28, 2), copeMapping);
    Object.values(r.subescalas).forEach((v) => expect(v).toBe(4));
    expect(r.estilos.adaptativo).toBe(4);
    expect(r.estilos.desadaptativo).toBe(4);
    expect(r.estilos.evitativo).toBe(4);
    expect(r.valido).toBe(true);
  });

  it("suma correctamente una subescala concreta (afrontamiento activo = ítems 2 y 10)", () => {
    const resp = rango(1, 28, 0);
    resp[2] = 3;
    resp[10] = 1;
    const r = puntuarCOPE(resp, copeMapping);
    expect(r.subescalas.afrontamiento_activo).toBe(4);
    expect(r.subescalas.planificacion).toBe(0);
  });

  it("índice de estilo es la MEDIA de sus subescalas", () => {
    // Estilo evitativo = autodistracción (4,22) y desahogo (12,23).
    const resp = rango(1, 28, 0);
    resp[4] = 3;
    resp[22] = 3; // autodistracción = 6
    resp[12] = 0;
    resp[23] = 0; // desahogo = 0
    const r = puntuarCOPE(resp, copeMapping);
    expect(r.subescalas.autodistraccion).toBe(6);
    expect(r.subescalas.desahogo).toBe(0);
    expect(r.estilos.evitativo).toBe(3); // media de 6 y 0
  });

  it("marca inválido con > 10 % faltantes (>2.8 ⇒ ≥3 de 28)", () => {
    const resp = rango(1, 28, 1);
    resp[1] = null;
    resp[2] = null;
    resp[3] = null; // 3 faltantes = 10.7 %
    const r = puntuarCOPE(resp, copeMapping);
    expect(r.valido).toBe(false);
  });
});
