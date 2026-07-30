/**
 * Núcleo de cálculo OEE (função pura).
 * Tempos na mesma unidade (ex.: segundos). Ciclo ideal = tempo por unidade.
 */

export type OeeInput = {
  /** Tempo planejado de produção (já sem paradas planejadas). */
  tempoPlanejado: number;
  /** Tempo rodando (tempo planejado − paradas não planejadas). */
  tempoRodando: number;
  /** Tempo de ciclo ideal por unidade. */
  tempoCicloIdeal: number;
  totalProduzido: number;
  unidadesRefugo: number;
};

export type OeeResult = {
  disponibilidade: number;
  performance: number;
  qualidade: number;
  oee: number;
  dados_inconsistentes: boolean;
  motivos: string[];
};

function clamp01(value: number): { value: number; clamped: boolean } {
  if (value < 0) return { value: 0, clamped: true };
  if (value > 1) return { value: 1, clamped: true };
  return { value, clamped: false };
}

function isInvalidNumber(value: number): boolean {
  return !Number.isFinite(value);
}

/**
 * OEE = Disponibilidade × Performance × Qualidade
 *
 * Disponibilidade = Tempo Rodando / Tempo Planejado
 * Performance     = (Ciclo Ideal × Total Produzido) / Tempo Rodando
 * Qualidade       = Peças Boas / Total Produzido
 */
export function calculateOee(input: OeeInput): OeeResult {
  const motivos: string[] = [];

  const {
    tempoPlanejado,
    tempoRodando,
    tempoCicloIdeal,
    totalProduzido,
    unidadesRefugo,
  } = input;

  for (const [nome, valor] of [
    ["tempoPlanejado", tempoPlanejado],
    ["tempoRodando", tempoRodando],
    ["tempoCicloIdeal", tempoCicloIdeal],
    ["totalProduzido", totalProduzido],
    ["unidadesRefugo", unidadesRefugo],
  ] as const) {
    if (isInvalidNumber(valor)) {
      motivos.push(`${nome} não é um número finito`);
    }
  }

  if (tempoPlanejado < 0) motivos.push("tempoPlanejado negativo");
  if (tempoRodando < 0) motivos.push("tempoRodando negativo");
  if (tempoCicloIdeal < 0) motivos.push("tempoCicloIdeal negativo");
  if (totalProduzido < 0) motivos.push("totalProduzido negativo");
  if (unidadesRefugo < 0) motivos.push("unidadesRefugo negativo");
  if (unidadesRefugo > totalProduzido) {
    motivos.push("unidadesRefugo maior que totalProduzido");
  }
  if (tempoRodando > tempoPlanejado) {
    motivos.push("tempoRodando maior que tempoPlanejado");
  }

  let disponibilidadeRaw = 0;
  let performanceRaw = 0;
  let qualidadeRaw = 0;

  if (tempoPlanejado === 0) {
    motivos.push("divisão por zero: tempoPlanejado");
  } else {
    disponibilidadeRaw = tempoRodando / tempoPlanejado;
  }

  if (tempoRodando === 0) {
    motivos.push("divisão por zero: tempoRodando");
  } else {
    performanceRaw = (tempoCicloIdeal * totalProduzido) / tempoRodando;
  }

  if (totalProduzido === 0) {
    motivos.push("divisão por zero: totalProduzido");
  } else if (unidadesRefugo <= totalProduzido) {
    qualidadeRaw = (totalProduzido - unidadesRefugo) / totalProduzido;
  }
  // se refugo > produzido, qualidade permanece 0 e o motivo já foi registrado

  const d = clamp01(disponibilidadeRaw);
  const p = clamp01(performanceRaw);
  const q = clamp01(qualidadeRaw);

  if (d.clamped) motivos.push("disponibilidade fora de [0,1] — aplicado clamp");
  if (p.clamped) motivos.push("performance fora de [0,1] — aplicado clamp");
  if (q.clamped) motivos.push("qualidade fora de [0,1] — aplicado clamp");

  const uniqueMotivos = [...new Set(motivos)];

  return {
    disponibilidade: d.value,
    performance: p.value,
    qualidade: q.value,
    oee: d.value * p.value * q.value,
    dados_inconsistentes: uniqueMotivos.length > 0,
    motivos: uniqueMotivos,
  };
}

/** Apenas para testes de regressão do cenário de mentoria — não usar em produção. */
export function averageOeeFactors(
  disponibilidade: number,
  performance: number,
  qualidade: number,
): number {
  return (disponibilidade + performance + qualidade) / 3;
}
