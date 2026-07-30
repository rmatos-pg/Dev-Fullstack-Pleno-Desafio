import { describe, expect, it } from "vitest";
import { averageOeeFactors, calculateOee } from "../src/index.js";

describe("calculateOee", () => {
  it("calculates a consistent valid case (product of factors)", () => {
    // D=0.875, P=0.952, Q=0.95 → OEE ≈ 0.791 (ordem de grandeza do exemplo de negócio)
    const result = calculateOee({
      tempoPlanejado: 480,
      tempoRodando: 420,
      tempoCicloIdeal: 0.952,
      totalProduzido: 420,
      unidadesRefugo: 21,
    });

    expect(result.disponibilidade).toBeCloseTo(0.875, 5);
    expect(result.performance).toBeCloseTo(0.952, 5);
    expect(result.qualidade).toBeCloseTo(0.95, 5);
    expect(result.oee).toBeCloseTo(0.875 * 0.952 * 0.95, 5);
    expect(result.dados_inconsistentes).toBe(false);
    expect(result.motivos).toEqual([]);
  });

  it("uses product of factors, not the arithmetic mean (mentorship regression)", () => {
    const result = calculateOee({
      tempoPlanejado: 100,
      tempoRodando: 80,
      tempoCicloIdeal: 0.8,
      totalProduzido: 80,
      unidadesRefugo: 16,
    });

    // D=0.8, P=(0.8*80)/80=0.8, Q=(80-16)/80=0.8
    expect(result.disponibilidade).toBeCloseTo(0.8, 5);
    expect(result.performance).toBeCloseTo(0.8, 5);
    expect(result.qualidade).toBeCloseTo(0.8, 5);

    const product = 0.8 * 0.8 * 0.8;
    const mean = averageOeeFactors(0.8, 0.8, 0.8);

    expect(result.oee).toBeCloseTo(product, 5);
    expect(result.oee).not.toBeCloseTo(mean, 5);
    expect(mean).toBeCloseTo(0.8, 5);
    expect(product).toBeCloseTo(0.512, 5);
  });

  it("clamps factors to [0, 1] and flags inconsistency", () => {
    const result = calculateOee({
      tempoPlanejado: 100,
      tempoRodando: 100,
      tempoCicloIdeal: 2,
      totalProduzido: 100,
      unidadesRefugo: 0,
    });

    // Performance raw = (2*100)/100 = 2 → clamp 1
    expect(result.performance).toBe(1);
    expect(result.dados_inconsistentes).toBe(true);
    expect(result.motivos.some((m) => m.includes("performance"))).toBe(true);
  });

  it("flags invalid inputs without masking the problem", () => {
    const result = calculateOee({
      tempoPlanejado: 100,
      tempoRodando: 80,
      tempoCicloIdeal: 1,
      totalProduzido: 50,
      unidadesRefugo: 60,
    });

    expect(result.dados_inconsistentes).toBe(true);
    expect(result.motivos).toContain("unidadesRefugo maior que totalProduzido");
  });

  it("handles division by zero on planned time, running time and production", () => {
    const byPlanned = calculateOee({
      tempoPlanejado: 0,
      tempoRodando: 0,
      tempoCicloIdeal: 1,
      totalProduzido: 10,
      unidadesRefugo: 0,
    });
    expect(byPlanned.dados_inconsistentes).toBe(true);
    expect(byPlanned.motivos).toEqual(
      expect.arrayContaining([
        "divisão por zero: tempoPlanejado",
        "divisão por zero: tempoRodando",
      ]),
    );

    const byProduction = calculateOee({
      tempoPlanejado: 100,
      tempoRodando: 80,
      tempoCicloIdeal: 1,
      totalProduzido: 0,
      unidadesRefugo: 0,
    });
    expect(byProduction.dados_inconsistentes).toBe(true);
    expect(byProduction.motivos).toContain("divisão por zero: totalProduzido");
    expect(byProduction.qualidade).toBe(0);
  });

  it("rejects non-finite numbers", () => {
    const result = calculateOee({
      tempoPlanejado: Number.NaN,
      tempoRodando: 10,
      tempoCicloIdeal: 1,
      totalProduzido: 10,
      unidadesRefugo: 0,
    });
    expect(result.dados_inconsistentes).toBe(true);
    expect(result.motivos.some((m) => m.includes("tempoPlanejado"))).toBe(true);
  });

  it("flags negative inputs and running time greater than planned", () => {
    const result = calculateOee({
      tempoPlanejado: -10,
      tempoRodando: -5,
      tempoCicloIdeal: -1,
      totalProduzido: -5,
      unidadesRefugo: -1,
    });

    expect(result.dados_inconsistentes).toBe(true);
    expect(result.motivos).toEqual(
      expect.arrayContaining([
        "tempoPlanejado negativo",
        "tempoRodando negativo",
        "tempoRodando maior que tempoPlanejado",
        "tempoCicloIdeal negativo",
        "totalProduzido negativo",
        "unidadesRefugo negativo",
      ]),
    );
  });

  it("clamps disponibilidade above 1 when running exceeds planned without early exit", () => {
    // tempoRodando > tempoPlanejado already flagged; D raw > 1 → clamp
    const result = calculateOee({
      tempoPlanejado: 100,
      tempoRodando: 150,
      tempoCicloIdeal: 0.5,
      totalProduzido: 100,
      unidadesRefugo: 0,
    });

    expect(result.disponibilidade).toBe(1);
    expect(result.dados_inconsistentes).toBe(true);
    expect(result.motivos).toEqual(
      expect.arrayContaining([
        "tempoRodando maior que tempoPlanejado",
        "disponibilidade fora de [0,1] — aplicado clamp",
      ]),
    );
  });
});
