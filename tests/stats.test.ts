import { describe, expect, it } from "vitest";
import {
  cronbachAlpha,
  de,
  descriptivos,
  media,
  pearson,
  shapiroWilk,
  spearman,
  varianza,
} from "../src/domain/stats";

describe("descriptivos", () => {
  it("media, varianza muestral y DE", () => {
    const x = [1, 2, 3, 4, 5];
    expect(media(x)).toBe(3);
    expect(varianza(x)).toBe(2.5); // (4+1+0+1+4)/4
    expect(de(x)).toBeCloseTo(1.5811, 4);
  });

  it("descriptivos ignora null/NaN", () => {
    const d = descriptivos([1, 2, null, 4, 5, undefined]);
    expect(d?.n).toBe(4);
    expect(d?.min).toBe(1);
    expect(d?.max).toBe(5);
    expect(d?.mediana).toBe(3); // mediana de [1,2,4,5]
  });
});

describe("cronbachAlpha", () => {
  // Caso calculado a mano (ver comentarios): α esperado ≈ 0.9650
  it("reproduce alfa de un caso conocido", () => {
    const matriz = [
      [1, 2, 2],
      [2, 3, 3],
      [3, 3, 4],
      [4, 5, 4],
      [5, 5, 5],
    ];
    // Σ var ítems = 2.5 + 1.8 + 1.3 = 5.6 ; var totales = 15.7
    // α = (3/2)(1 - 5.6/15.7) = 0.96497
    expect(cronbachAlpha(matriz)).toBeCloseTo(0.9650, 4);
  });

  it("devuelve null con menos de 2 ítems o casos", () => {
    expect(cronbachAlpha([[1], [2]])).toBeNull();
    expect(cronbachAlpha([[1, 2]])).toBeNull();
  });

  it("usa solo casos completos (ignora filas con null)", () => {
    const matriz = [
      [1, 2, 2],
      [2, 3, 3],
      [3, 3, 4],
      [4, 5, 4],
      [5, 5, 5],
      [null, 3, 4], // se descarta
    ];
    expect(cronbachAlpha(matriz)).toBeCloseTo(0.9650, 4);
  });
});

describe("pearson", () => {
  // x=[1..5], y=[2,4,5,4,5] ⇒ r = 6/sqrt(60) ≈ 0.774597 (calculado a mano)
  it("reproduce r de un caso conocido", () => {
    const r = pearson([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]);
    expect(r?.r).toBeCloseTo(0.7746, 4);
    expect(r?.n).toBe(5);
    expect(r?.efecto).toBe("grande");
  });

  it("empareja solo casos completos", () => {
    const r = pearson([1, 2, 3, 4, 5, 9], [2, 4, 5, 4, 5, null]);
    expect(r?.n).toBe(5);
    expect(r?.r).toBeCloseTo(0.7746, 4);
  });

  it("correlación perfecta positiva = 1 con p≈0", () => {
    const r = pearson([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]);
    expect(r?.r).toBeCloseTo(1, 10);
    expect(r?.significativa).toBe(true);
  });
});

describe("spearman", () => {
  // x=[1..5], y=[1,3,2,4,5] ⇒ rangos dan rho = 0.9 (calculado a mano)
  it("reproduce rho de un caso conocido", () => {
    const r = spearman([1, 2, 3, 4, 5], [1, 3, 2, 4, 5]);
    expect(r?.r).toBeCloseTo(0.9, 10);
    expect(r?.metodo).toBe("spearman");
  });

  it("monótona perfecta no lineal ⇒ rho = 1", () => {
    const r = spearman([1, 2, 3, 4, 5], [1, 4, 9, 16, 25]);
    expect(r?.r).toBeCloseTo(1, 10);
  });

  it("maneja empates con rangos promedio", () => {
    const r = spearman([1, 2, 2, 3], [1, 2, 3, 4]);
    expect(r).not.toBeNull();
    expect(Math.abs(r!.r)).toBeLessThanOrEqual(1);
  });
});

describe("shapiroWilk", () => {
  it("W está en (0,1] y n correcto", () => {
    const s = shapiroWilk([2, 4, 5, 7, 8, 9, 12, 14, 15, 18, 20, 22]);
    expect(s).not.toBeNull();
    expect(s!.W).toBeGreaterThan(0);
    expect(s!.W).toBeLessThanOrEqual(1);
    expect(s!.n).toBe(12);
  });

  it("datos aprox. normales ⇒ no rechaza (p alto, sugiere pearson)", () => {
    // Muestra simétrica y campaniforme.
    const x = [-3, -2, -2, -1, -1, -1, 0, 0, 0, 0, 1, 1, 1, 2, 2, 3];
    const s = shapiroWilk(x);
    expect(s!.p).toBeGreaterThan(0.05);
    expect(s!.sugerencia).toBe("pearson");
  });

  it("datos con outlier extremo ⇒ rechaza (p bajo, sugiere spearman)", () => {
    const x = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1000];
    const s = shapiroWilk(x);
    expect(s!.p).toBeLessThan(0.05);
    expect(s!.sugerencia).toBe("spearman");
  });

  it("devuelve null con n < 3", () => {
    expect(shapiroWilk([1, 2])).toBeNull();
  });
});
