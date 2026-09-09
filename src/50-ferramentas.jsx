// =====================================================================
// FERRAMENTAS
//
// O edital dos Exames de Certificação Anbima é explícito sobre o que a
// plataforma dá durante a prova:
//
//   13.8  "a plataforma já disponibiliza ferramentas digitais de rascunho,
//          bloco de notas e calculadora"
//   13.10 "Serão disponibilizadas fórmulas no sistema de provas"
//   13.11 "Não será permitido utilizar calculadora própria, pois a Anbima
//          oferece no sistema de provas uma calculadora e uma planilha
//          eletrônica"
//
// Ou seja: NÃO existe HP-12C no exame, nem a da banca nem a sua. Treinar
// só em HP-12C prepara para uma ferramenta que não vai estar lá.
//
// Então aqui moram QUATRO ferramentas de prova (calculadora, planilha,
// bloco de notas e fórmulas) e, à parte e declarada como tal, a HP-12C —
// que continua sendo o melhor jeito de ENTENDER matemática financeira,
// e que a maioria dos cursos ensina.
// =====================================================================

// ---------------------------------------------------------------------
// MOTOR DA HP-12C — RPN puro, sem estado de React, para poder ser testado
//
// Pilha de quatro registradores (X, Y, Z, T) mais LASTx, como na máquina
// de verdade. `liftDesligado` reproduz o comportamento que mais confunde
// quem está aprendendo: depois de ENTER, o próximo número digitado
// SOBRESCREVE o X em vez de empurrar a pilha.
// ---------------------------------------------------------------------
const hpNovo = () => ({
  x: 0, y: 0, z: 0, t: 0, lastx: 0,
  entrada: "", digitando: false, liftDesligado: true,
  mem: {}, fin: { n: 0, i: 0, pv: 0, pmt: 0, fv: 0 },
  begin: false, casas: 2, prefixo: null, erro: null,
});

const hpX = (m) => (m.digitando ? parseFloat(m.entrada.replace(",", ".")) || 0 : m.x);

// empurra a pilha: T perde o valor mais antigo, como na máquina
const hpLift = (m, v) => ({ ...m, t: m.z, z: m.y, y: m.x, x: v });
// derruba a pilha depois de uma operação binária: T se copia para baixo
const hpDrop = (m, v) => ({ ...m, x: v, y: m.z, z: m.t });

const hpFecharEntrada = (m) => (m.digitando ? { ...m, x: hpX(m), entrada: "", digitando: false } : m);

const hpDigito = (m, d) => {
  const a = hpFecharEntradaSeNecessario(m);
  if (!a.digitando) {
    // ENTER desliga o lift: o número novo substitui X em vez de empurrar
    const base = a.liftDesligado ? a : hpLift(a, 0);
    return { ...base, entrada: d === "." ? "0." : d, digitando: true, liftDesligado: false, erro: null };
  }
  if (d === "." && a.entrada.includes(".")) return a;
  if (a.entrada.replace(/[.-]/g, "").length >= 10) return a; // 10 dígitos, como o visor
  return { ...a, entrada: a.entrada + d };
};
// digitar não fecha a entrada anterior; existe só para manter a assinatura clara
const hpFecharEntradaSeNecessario = (m) => m;

const hpEnter = (m) => {
  const a = hpFecharEntrada(m);
  return { ...hpLift(a, a.x), liftDesligado: true, erro: null };
};

const hpBinaria = (m, op) => {
  const a = hpFecharEntrada(m);
  const x = a.x, y = a.y;
  let r;
  if (op === "+") r = y + x;
  else if (op === "-") r = y - x;
  else if (op === "*") r = y * x;
  else if (op === "/") { if (x === 0) return { ...a, erro: "Error 0" }; r = y / x; }
  else if (op === "^") r = Math.pow(y, x);
  else return a;
  return { ...hpDrop(a, r), lastx: x, liftDesligado: false, erro: null };
};

const hpUnaria = (m, op) => {
  // CHS no meio da digitação apenas troca o sinal do que está sendo digitado,
  // sem encerrar a entrada — é assim na máquina, e é o que faz o gesto
  // clássico "1000 CHS PV" GRAVAR o PV em vez de tentar RESOLVER. Fechar a
  // entrada aqui era um bug: a tecla financeira seguinte via digitando=false.
  if (op === "chs" && m.digitando) {
    const e = m.entrada.startsWith("-") ? m.entrada.slice(1) : "-" + m.entrada;
    return { ...m, entrada: e, erro: null };
  }
  const a = hpFecharEntrada(m);
  const x = a.x;
  let r;
  if (op === "1/x") { if (x === 0) return { ...a, erro: "Error 0" }; r = 1 / x; }
  else if (op === "sqrt") { if (x < 0) return { ...a, erro: "Error 0" }; r = Math.sqrt(x); }
  else if (op === "x2") r = x * x;
  else if (op === "ln") { if (x <= 0) return { ...a, erro: "Error 0" }; r = Math.log(x); }
  else if (op === "ex") r = Math.exp(x);
  else if (op === "chs") r = -x;
  else if (op === "intg") r = Math.trunc(x);
  else if (op === "frac") r = x - Math.trunc(x);
  else return a;
  // CHS não mexe em LASTx na máquina real
  return op === "chs" ? { ...a, x: r, erro: null } : { ...a, x: r, lastx: x, liftDesligado: false, erro: null };
};

// A tecla % da HP-12C: y × x/100, e a PILHA NÃO CAI — Y continua lá.
// É isso que permite "1000 ENTER 10 % -" dar 900.
const hpPorcento = (m, tipo) => {
  const a = hpFecharEntrada(m);
  const x = a.x, y = a.y;
  let r;
  if (tipo === "%") r = (y * x) / 100;
  else if (tipo === "d%") { if (y === 0) return { ...a, erro: "Error 0" }; r = ((x - y) / y) * 100; }
  else if (tipo === "%t") { if (y === 0) return { ...a, erro: "Error 0" }; r = (x / y) * 100; }
  else return a;
  return { ...a, x: r, lastx: x, liftDesligado: false, erro: null };
};

// ---------------------------------------------------------------------
// TVM — o coração da calculadora financeira
//
// Convenção de sinal da HP: dinheiro que SAI é negativo. A equação é
//
//   PV + PMT · (1 − (1+i)^−n)/i · (1 + i·S) + FV · (1+i)^−n = 0
//
// com S = 1 no modo BEGIN (pagamento no início do período) e S = 0 no END.
// Com i = 0 ela degenera para PV + PMT·n + FV = 0.
// ---------------------------------------------------------------------
const tvmFator = (i, n, begin) => {
  const v = Math.pow(1 + i, -n);           // fator de desconto
  const a = i === 0 ? n : ((1 - v) / i) * (1 + i * (begin ? 1 : 0));
  return { v, a };
};
const tvmResiduo = (f, i) => {
  const { v, a } = tvmFator(i, f.n, f.begin);
  return f.pv + f.pmt * a + f.fv * v;
};
const tvmResolver = (fin, alvo, begin) => {
  const f = { ...fin, i: fin.i / 100, begin: !!begin };
  if (alvo === "fv") {
    const { v, a } = tvmFator(f.i, f.n, f.begin);
    return -(f.pv + f.pmt * a) / v;
  }
  if (alvo === "pv") {
    const { v, a } = tvmFator(f.i, f.n, f.begin);
    return -(f.pmt * a + f.fv * v);
  }
  if (alvo === "pmt") {
    const { v, a } = tvmFator(f.i, f.n, f.begin);
    if (a === 0) return NaN;
    return -(f.pv + f.fv * v) / a;
  }
  if (alvo === "n") {
    if (f.i === 0) { if (f.pmt === 0) return NaN; return -(f.pv + f.fv) / f.pmt; }
    if (f.pmt === 0) {
      if (f.pv === 0 || f.fv === 0) return NaN;
      const razao = -f.fv / f.pv;
      if (razao <= 0) return NaN;
      return Math.log(razao) / Math.log(1 + f.i);
    }
    const k = (f.pmt * (1 + f.i * (f.begin ? 1 : 0))) / f.i;
    const den = k - f.fv;
    if (den === 0) return NaN;
    const v = (f.pv + k) / den;
    if (v <= 0) return NaN;
    return -Math.log(v) / Math.log(1 + f.i);
  }
  if (alvo === "i") {
    // Não há fórmula fechada para a taxa: resolve-se numericamente.
    //
    // A primeira versão usava um intervalo fixo de −99,99% a 1000%. Perto de
    // −100% o fator (1+i)^−n explode para Infinity com n grande (360 meses),
    // a função deixa de ser finita e a bisseção desistia — devolvia NaN para
    // um financiamento comum de 360 parcelas. Agora o intervalo é PROCURADO:
    // varremos taxas plausíveis, guardamos só os pontos onde a função é
    // finita e pegamos o primeiro par consecutivo com troca de sinal.
    const res = (i) => {
      const { v, a } = tvmFator(i, f.n, f.begin);
      return f.pv + f.pmt * a + f.fv * v;
    };
    if (f.n === 0) return NaN;
    const r0 = f.pv + f.pmt * f.n + f.fv;      // taxa zero é solução exata?
    if (Math.abs(r0) < 1e-10) return 0;

    const grade = [-0.95, -0.9, -0.8, -0.6, -0.4, -0.3, -0.2, -0.15, -0.1, -0.05,
      -0.02, -0.01, -0.005, -0.001, 0, 0.001, 0.005, 0.01, 0.02, 0.05, 0.1,
      0.15, 0.2, 0.3, 0.5, 1, 2, 5, 10];
    const pontos = [];
    grade.forEach((i) => { const v = res(i); if (isFinite(v)) pontos.push([i, v]); });
    let lo = null, hi = null, flo = 0;
    for (let k = 0; k < pontos.length - 1; k++) {
      const [ia, va] = pontos[k], [ib, vb] = pontos[k + 1];
      if (va === 0) return ia * 100;
      if (vb === 0) return ib * 100;
      if (va * vb < 0) { lo = ia; hi = ib; flo = va; break; }
    }
    if (lo === null) return NaN;             // sem troca de sinal: sem solução
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2;
      const fm = res(mid);
      if (!isFinite(fm)) return NaN;
      if (Math.abs(fm) < 1e-12 || hi - lo < 1e-15) return mid * 100;
      if (flo * fm < 0) hi = mid; else { lo = mid; flo = fm; }
    }
    return ((lo + hi) / 2) * 100;
  }
  return NaN;
};

// tecla financeira: com número digitado GRAVA o registrador; sozinha, RESOLVE
const hpFin = (m, reg) => {
  const a = hpFecharEntrada(m);
  if (m.digitando || m.gravarProximo) {
    return { ...a, fin: { ...a.fin, [reg]: a.x }, liftDesligado: false, erro: null, gravarProximo: false };
  }
  const v = tvmResolver(a.fin, reg, a.begin);
  if (!isFinite(v)) return { ...a, erro: "Error 5" };
  return { ...hpLift(a, v), fin: { ...a.fin, [reg]: v }, liftDesligado: false, erro: null };
};

const hpLimpar = (m, oque) => {
  if (oque === "x") return { ...m, x: 0, entrada: "", digitando: false, liftDesligado: true, erro: null };
  if (oque === "fin") return { ...hpFecharEntrada(m), fin: { n: 0, i: 0, pv: 0, pmt: 0, fv: 0 }, erro: null };
  if (oque === "reg") return { ...hpNovo(), casas: m.casas, begin: m.begin };
  return m;
};

const hpMem = (m, acao, k) => {
  const a = hpFecharEntrada(m);
  if (acao === "sto") return { ...a, mem: { ...a.mem, [k]: a.x }, erro: null };
  if (acao === "rcl") return { ...hpLift(a, a.mem[k] || 0), liftDesligado: false, erro: null };
  return a;
};

// visor: sempre com o número de casas fixado, como a HP
const hpVisor = (m) => {
  if (m.erro) return m.erro;
  if (m.digitando) return m.entrada.replace(".", ",");
  const v = m.x;
  if (!isFinite(v)) return "Error 0";
  if (Math.abs(v) >= 1e10 || (v !== 0 && Math.abs(v) < 1e-9)) {
    return v.toExponential(6).replace(".", ",");
  }
  return v.toLocaleString("pt-BR", { minimumFractionDigits: m.casas, maximumFractionDigits: m.casas });
};

// ---------------------------------------------------------------------
// PLANILHA — avaliador próprio, sem eval()
//
// Aceita número, texto e fórmula começando por "=". Na fórmula valem
// + − × ÷ ^, parênteses, referências (A1, B7), intervalos em funções
// (SOMA, MÉDIA, MÁXIMO, MÍNIMO, CONT) e números com vírgula decimal.
// Referência circular é detectada e vira #CICLO em vez de travar.
// ---------------------------------------------------------------------
const PLAN_COLS = ["A", "B", "C", "D", "E", "F"];
const PLAN_LINHAS = 14;

const planTokenizar = (f) => {
  const t = [];
  let i = 0;
  const s = f.replace(/\s+/g, "");
  while (i < s.length) {
    const c = s[i];
    if ("+-*/^(),:".includes(c)) { t.push({ tipo: c }); i++; continue; }
    if (/[0-9]/.test(c) || (c === "," && /[0-9]/.test(s[i + 1] || ""))) {
      let j = i;
      while (j < s.length && /[0-9,.]/.test(s[j])) j++;
      t.push({ tipo: "num", v: parseFloat(s.slice(i, j).replace(",", ".")) });
      i = j; continue;
    }
    if (/[A-Za-zÀ-ÿ]/.test(c)) {
      let j = i;
      while (j < s.length && /[A-Za-zÀ-ÿ0-9]/.test(s[j])) j++;
      const p = s.slice(i, j).toUpperCase();
      if (/^[A-F][0-9]{1,2}$/.test(p)) t.push({ tipo: "ref", v: p });
      else t.push({ tipo: "func", v: p });
      i = j; continue;
    }
    return null; // caractere que não pertence a uma fórmula
  }
  return t;
};

const planCelulasDoIntervalo = (a, b) => {
  const ca = a[0], la = Number(a.slice(1)), cb = b[0], lb = Number(b.slice(1));
  const i1 = PLAN_COLS.indexOf(ca), i2 = PLAN_COLS.indexOf(cb);
  const out = [];
  for (let c = Math.min(i1, i2); c <= Math.max(i1, i2); c++)
    for (let l = Math.min(la, lb); l <= Math.max(la, lb); l++) out.push(PLAN_COLS[c] + l);
  return out;
};

// avaliador recursivo-descendente: expr → termo (+|−) · termo → fator (×|÷) …
const planAvaliar = (formula, celulas, visitando) => {
  const toks = planTokenizar(formula);
  if (!toks) return { erro: "#SINTAXE" };
  let p = 0;
  const ver = () => toks[p];
  const come = (t) => (toks[p] && toks[p].tipo === t ? toks[p++] : null);

  const valorDe = (ref) => {
    if (visitando.has(ref)) return { erro: "#CICLO" };
    const bruto = (celulas[ref] || "").trim();
    if (bruto === "") return { v: 0 };
    if (bruto.startsWith("=")) {
      visitando.add(ref);
      const r = planAvaliar(bruto.slice(1), celulas, visitando);
      visitando.delete(ref);
      return r;
    }
    const n = parseFloat(bruto.replace(/\./g, "").replace(",", "."));
    return isNaN(n) ? { v: 0 } : { v: n };
  };

  let falhou = null;
  const expr = () => {
    let v = termo();
    for (;;) {
      if (come("+")) v += termo();
      else if (come("-")) v -= termo();
      else return v;
    }
  };
  const termo = () => {
    let v = potencia();
    for (;;) {
      if (come("*")) v *= potencia();
      else if (come("/")) { const d = potencia(); if (d === 0) { falhou = falhou || "#DIV/0"; return 0; } v /= d; }
      else return v;
    }
  };
  const potencia = () => {
    const b = unario();
    if (come("^")) return Math.pow(b, potencia());
    return b;
  };
  const unario = () => {
    if (come("-")) return -unario();
    if (come("+")) return unario();
    return primario();
  };
  const primario = () => {
    const n = come("num"); if (n) return n.v;
    const r = come("ref");
    if (r) { const g = valorDe(r.v); if (g.erro) { falhou = falhou || g.erro; return 0; } return g.v; }
    const f = come("func");
    if (f) {
      if (!come("(")) { falhou = falhou || "#SINTAXE"; return 0; }
      const nums = [];
      if (!ver() || ver().tipo !== ")") {
        for (;;) {
          const a1 = ver();
          if (a1 && a1.tipo === "ref" && toks[p + 1] && toks[p + 1].tipo === ":") {
            p += 2;
            const a2 = come("ref");
            if (!a2) { falhou = falhou || "#SINTAXE"; return 0; }
            planCelulasDoIntervalo(a1.v, a2.v).forEach((c) => {
              const g = valorDe(c); if (g.erro) falhou = falhou || g.erro; else nums.push(g.v);
            });
          } else nums.push(expr());
          if (!come(",")) break;
        }
      }
      if (!come(")")) { falhou = falhou || "#SINTAXE"; return 0; }
      const nome = f.v;
      if (nome === "SOMA") return nums.reduce((a, b) => a + b, 0);
      if (nome === "MÉDIA" || nome === "MEDIA") return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      if (nome === "MÁXIMO" || nome === "MAXIMO") return nums.length ? Math.max(...nums) : 0;
      if (nome === "MÍNIMO" || nome === "MINIMO") return nums.length ? Math.min(...nums) : 0;
      if (nome === "CONT") return nums.length;
      if (nome === "RAIZ") return nums[0] >= 0 ? Math.sqrt(nums[0]) : (falhou = falhou || "#NÚM", 0);
      if (nome === "ABS") return Math.abs(nums[0] || 0);
      if (nome === "ARRED") return Math.round((nums[0] || 0) * Math.pow(10, nums[1] || 0)) / Math.pow(10, nums[1] || 0);
      falhou = falhou || "#NOME";
      return 0;
    }
    if (come("(")) { const v = expr(); if (!come(")")) falhou = falhou || "#SINTAXE"; return v; }
    falhou = falhou || "#SINTAXE";
    return 0;
  };

  const v = expr();
  if (falhou) return { erro: falhou };
  if (p !== toks.length) return { erro: "#SINTAXE" };
  if (!isFinite(v)) return { erro: "#NÚM" };
  return { v };
};

const planMostrar = (ref, celulas) => {
  const bruto = (celulas[ref] || "");
  if (!bruto.trim().startsWith("=")) return bruto;
  const r = planAvaliar(bruto.trim().slice(1), celulas, new Set([ref]));
  if (r.erro) return r.erro;
  const v = r.v;
  return Number.isInteger(v) ? String(v) : v.toLocaleString("pt-BR", { maximumFractionDigits: 6 });
};

// ---------------------------------------------------------------------
// FÓRMULAS — a folha que a plataforma disponibiliza (edital 13.10).
// A ANBIMA não publica QUAIS fórmulas entrega; esta lista cobre o que o
// programa da CPA cobra. Está marcada como reconstrução nossa na tela.
// ---------------------------------------------------------------------
const FORMULAS = [
  { g: "Juros", f: "Juros simples", e: "M = C · (1 + i · n)", n: "Só o capital rende. O juro do período não entra na base do período seguinte." },
  { g: "Juros", f: "Juros compostos", e: "M = C · (1 + i)ⁿ", n: "Juro sobre juro. i e n têm de estar na MESMA unidade de tempo." },
  { g: "Juros", f: "Taxa proporcional (simples)", e: "i₂ = i₁ · (n₂ / n₁)", n: "Divisão direta: 12% ao ano = 1% ao mês. Vale no regime SIMPLES." },
  { g: "Juros", f: "Taxa equivalente (composta)", e: "i₂ = (1 + i₁)^(n₂/n₁) − 1", n: "No regime composto, 12% ao ano NÃO é 1% ao mês — é 0,9489%." },
  { g: "Juros", f: "Taxa real (Fisher)", e: "(1 + i_real) = (1 + i_nominal) / (1 + inflação)", n: "Nunca subtraia a inflação da taxa nominal: a banca cobra exatamente esse erro." },
  { g: "Valor do dinheiro", f: "Valor presente", e: "VP = VF / (1 + i)ⁿ", n: "Trazer para hoje é dividir; levar para frente é multiplicar." },
  { g: "Valor do dinheiro", f: "Valor futuro", e: "VF = VP · (1 + i)ⁿ", n: "" },
  { g: "Valor do dinheiro", f: "Série uniforme (VP de PMT)", e: "VP = PMT · [1 − (1 + i)^−n] / i", n: "Parcelas iguais, período regular, primeira parcela ao FIM do período." },
  { g: "Valor do dinheiro", f: "Série uniforme (VF de PMT)", e: "VF = PMT · [(1 + i)ⁿ − 1] / i", n: "" },
  { g: "Valor do dinheiro", f: "Perpetuidade", e: "VP = PMT / i", n: "Fluxo que não acaba. Se crescer a g: VP = PMT / (i − g)." },
  { g: "Amortização", f: "Prestação no Price", e: "PMT = VP · i / [1 − (1 + i)^−n]", n: "Prestação constante; juros caem e amortização sobe." },
  { g: "Amortização", f: "Amortização no SAC", e: "A = VP / n   ·   PMT_t = A + saldo_{t−1} · i", n: "Amortização constante; prestação começa maior e cai." },
  { g: "Análise", f: "VPL", e: "VPL = Σ FC_t / (1 + i)^t − investimento", n: "VPL > 0: o projeto cria valor à taxa exigida." },
  { g: "Análise", f: "TIR", e: "0 = Σ FC_t / (1 + TIR)^t − investimento", n: "É a taxa que zera o VPL. Sem fórmula fechada — resolve-se por tentativa." },
  { g: "Risco", f: "Retorno esperado", e: "E(R) = Σ (p_i · R_i)", n: "Média ponderada pelas probabilidades." },
  { g: "Risco", f: "Variância", e: "σ² = Σ p_i · [R_i − E(R)]²", n: "" },
  { g: "Risco", f: "Desvio-padrão", e: "σ = √σ²", n: "Medida de risco TOTAL: sistemático + não sistemático." },
  { g: "Risco", f: "Covariância", e: "COV(A,B) = Σ p_i · [R_Ai − E(R_A)] · [R_Bi − E(R_B)]", n: "" },
  { g: "Risco", f: "Correlação", e: "ρ = COV(A,B) / (σ_A · σ_B)", n: "Vai de −1 a +1. Diversificação só reduz risco com ρ < 1." },
  { g: "Risco", f: "Beta", e: "β = COV(ativo, mercado) / σ²_mercado", n: "Mede o risco SISTEMÁTICO, o que a diversificação não elimina." },
  { g: "Risco", f: "CAPM", e: "E(R) = R_f + β · [E(R_m) − R_f]", n: "Retorno exigido = livre de risco + prêmio pelo risco de mercado." },
  { g: "Risco", f: "Índice de Sharpe", e: "IS = [E(R) − R_f] / σ", n: "Retorno acima do livre de risco por unidade de risco TOTAL." },
  { g: "Risco", f: "Índice de Treynor", e: "IT = [E(R) − R_f] / β", n: "Igual ao Sharpe, mas por unidade de risco SISTEMÁTICO." },
  { g: "Renda fixa", f: "Duration de Macaulay", e: "D = Σ [t · VP(FC_t)] / preço", n: "Prazo médio ponderado. Título sem cupom: duration = prazo." },
  { g: "Renda fixa", f: "Duration modificada", e: "D_mod = D / (1 + i)", n: "Aproxima a variação % do preço para 1 p.p. de variação na taxa." },
];

// =====================================================================
// INTERFACE
// =====================================================================
const FerrCSS = `
.fr-wrap{display:grid;gap:12px}
.fr-abas{display:flex;gap:6px;flex-wrap:wrap}
.fr-aba{flex:1 1 auto;min-height:44px;padding:10px 12px;border-radius:11px;border:1.5px solid var(--line);
  background:var(--card);font:inherit;font-size:12.5px;font-weight:800;color:var(--ink2);cursor:pointer}
.fr-aba.on{background:var(--azul);border-color:var(--azul);color:#fff}
/* --- calculadoras --- */
.fr-visor{background:#1F2033;color:#E8F5C8;border-radius:12px;padding:14px 16px;text-align:right;
  font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:26px;font-weight:700;
  letter-spacing:.02em;overflow-x:auto;white-space:nowrap;min-height:58px;display:flex;
  align-items:center;justify-content:flex-end;font-variant-numeric:tabular-nums}
.fr-visor .peq{font-size:11px;color:#9BB07A;margin-right:auto;letter-spacing:.1em;text-transform:uppercase}
.fr-teclas{display:grid;gap:6px}
.fr-teclas.c4{grid-template-columns:repeat(4,1fr)}
.fr-teclas.c5{grid-template-columns:repeat(5,1fr)}
.fr-t{min-height:50px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);
  font:inherit;font-size:15px;font-weight:800;color:var(--ink);cursor:pointer;padding:4px 2px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15}
.fr-t:active{transform:translateY(1px)}
.fr-t.op{background:#F4F0E8}
.fr-t.acao{background:var(--azul);border-color:var(--azul);color:#fff}
.fr-t.fin{background:#EDEBFF;border-color:#C9C2F5;color:#3A2E8F}
.fr-t.pref-f{background:#BF3C40;border-color:#BF3C40;color:#fff}
.fr-t.pref-g{background:#0B7D56;border-color:#0B7D56;color:#fff}
.fr-t .sup{font-size:9px;font-weight:900;letter-spacing:.04em;min-height:11px}
.fr-t .sup.f{color:#BF3C40}.fr-t .sup.g{color:#0B7D56}
.fr-t.on{outline:3px solid var(--gold);outline-offset:1px}
.fr-regs{display:flex;gap:5px;flex-wrap:wrap;font-size:11px;font-weight:800;color:var(--ink2)}
.fr-regs b{background:var(--azul-l);border-radius:7px;padding:3px 8px;font-variant-numeric:tabular-nums}
/* --- planilha --- */
.fr-planbox{overflow:auto;border:1px solid var(--line);border-radius:12px;background:var(--card);-webkit-overflow-scrolling:touch}
.fr-plan{border-collapse:collapse;font-size:13px;min-width:100%}
.fr-plan th{background:#F4F0E8;color:var(--ink2);font-size:11px;font-weight:900;padding:6px 4px;
  border:1px solid var(--line);position:sticky;top:0;z-index:1}
.fr-plan th.lin{left:0;z-index:2;min-width:34px}
.fr-plan td{border:1px solid var(--line);padding:0;min-width:92px}
.fr-plan td.lin{background:#F4F0E8;color:var(--ink2);font-size:11px;font-weight:900;text-align:center;
  min-width:34px;position:sticky;left:0}
.fr-plan input{width:100%;border:0;background:transparent;padding:9px 7px;font:inherit;font-size:13px;
  color:var(--ink);min-height:40px;text-align:right;font-variant-numeric:tabular-nums}
.fr-plan input:focus{outline:2px solid var(--azul);outline-offset:-2px;background:var(--azul-l)}
.fr-plan td.erro input{color:var(--no);font-weight:800}
/* --- notas e fórmulas --- */
.fr-notas{width:100%;min-height:220px;border:1.5px solid var(--line);border-radius:12px;padding:13px;
  font:inherit;font-size:14.5px;line-height:1.6;background:var(--card);color:var(--ink);resize:vertical}
.fr-form{border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--card);margin-bottom:8px}
.fr-form .tt{font-size:13.5px;font-weight:900;color:var(--ink)}
.fr-form .eq{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:14px;color:var(--azul);
  background:var(--azul-l);border-radius:8px;padding:9px 11px;margin:7px 0;overflow-x:auto;white-space:nowrap}
.fr-form .nt{font-size:12.5px;color:var(--ink2);line-height:1.5}
.fr-gtit{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:900;color:var(--mut);margin:14px 0 7px}
@media (max-width:400px){ .fr-t{min-height:46px;font-size:13.5px} .fr-visor{font-size:22px} }
`;

// ---------------------------------------------------------------------
function Hp12c({ maq, setMaq }) {
  const m = maq;
  const P = m.prefixo;
  const ap = (fn) => () => setMaq({ ...fn(m), prefixo: null });
  const comPrefixo = (semP, comF, comG) => () => {
    if (P === "f" && comF) return setMaq({ ...comF(m), prefixo: null });
    if (P === "g" && comG) return setMaq({ ...comG(m), prefixo: null });
    return setMaq({ ...semP(m), prefixo: null });
  };
  const T = ({ cls, sup, supF, supG, sub, onClick, label }) => (
    <button className={"fr-t " + (cls || "")} onClick={onClick} aria-label={label || sup}>
      {supF ? <span className="sup f">{supF}</span> : <span className="sup" />}
      <span>{sup}</span>
      {supG ? <span className="sup g">{supG}</span> : <span className="sup" />}
    </button>
  );
  const dig = (d) => ap((x) => hpDigito(x, d));

  return (
    <div className="fr-wrap">
      <div className="fr-visor" role="status" aria-live="polite">
        <span className="peq">
          {P ? (P === "f" ? "f" : "g") + " ▸" : ""} {m.begin ? "BEGIN" : ""}
        </span>
        {hpVisor(m)}
      </div>
      <div className="fr-regs">
        <b>n {m.fin.n.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}</b>
        <b>i {m.fin.i.toLocaleString("pt-BR", { maximumFractionDigits: 6 })}</b>
        <b>PV {m.fin.pv.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</b>
        <b>PMT {m.fin.pmt.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</b>
        <b>FV {m.fin.fv.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</b>
      </div>

      <div className="fr-teclas c5">
        <T cls="fin" sup="n" supF="AMORT" onClick={ap((x) => hpFin(x, "n"))} label="n períodos" />
        <T cls="fin" sup="i" supF="INT" onClick={ap((x) => hpFin(x, "i"))} label="i taxa" />
        <T cls="fin" sup="PV" supF="NPV" onClick={ap((x) => hpFin(x, "pv"))} label="valor presente" />
        <T cls="fin" sup="PMT" supF="RND" onClick={ap((x) => hpFin(x, "pmt"))} label="prestação" />
        <T cls="fin" sup="FV" supF="IRR" onClick={ap((x) => hpFin(x, "fv"))} label="valor futuro" />

        <T sup="yˣ" supG="LN" onClick={comPrefixo((x) => hpBinaria(x, "^"), null, (x) => hpUnaria(x, "ln"))} label="y elevado a x" />
        <T sup="1/x" supG="eˣ" onClick={comPrefixo((x) => hpUnaria(x, "1/x"), null, (x) => hpUnaria(x, "ex"))} label="inverso" />
        <T sup="%" supG="Δ%" onClick={comPrefixo((x) => hpPorcento(x, "%"), null, (x) => hpPorcento(x, "d%"))} label="porcentagem" />
        <T sup="√x" supG="x²" onClick={comPrefixo((x) => hpUnaria(x, "sqrt"), null, (x) => hpUnaria(x, "x2"))} label="raiz quadrada" />
        <T sup="÷" cls="op" onClick={ap((x) => hpBinaria(x, "/"))} label="dividir" />

        <button className={"fr-t pref-f" + (P === "f" ? " on" : "")}
          onClick={() => setMaq({ ...m, prefixo: P === "f" ? null : "f" })} aria-pressed={P === "f"}>
          <span className="sup" /><span>f</span><span className="sup" />
        </button>
        <button className={"fr-t pref-g" + (P === "g" ? " on" : "")}
          onClick={() => setMaq({ ...m, prefixo: P === "g" ? null : "g" })} aria-pressed={P === "g"}>
          <span className="sup" /><span>g</span><span className="sup" />
        </button>
        <T sup="STO" onClick={ap((x) => ({ ...x, aguardando: "sto" }))} label="guardar na memória" />
        <T sup="RCL" onClick={ap((x) => ({ ...x, aguardando: "rcl" }))} label="trazer da memória" />
        <T sup="×" cls="op" onClick={ap((x) => hpBinaria(x, "*"))} label="multiplicar" />

        <T sup="7" onClick={dig("7")} /><T sup="8" onClick={dig("8")} /><T sup="9" onClick={dig("9")} />
        <T sup="CHS" onClick={ap((x) => hpUnaria(x, "chs"))} label="trocar o sinal" />
        <T sup="−" cls="op" onClick={ap((x) => hpBinaria(x, "-"))} label="subtrair" />

        <T sup="4" onClick={dig("4")} /><T sup="5" onClick={dig("5")} /><T sup="6" onClick={dig("6")} />
        <T sup="CLx" supF="CLEAR" onClick={comPrefixo((x) => hpLimpar(x, "x"), (x) => hpLimpar(x, "reg"), (x) => hpLimpar(x, "fin"))} label="limpar visor" />
        <T sup="+" cls="op" onClick={ap((x) => hpBinaria(x, "+"))} label="somar" />

        <T sup="1" onClick={dig("1")} /><T sup="2" onClick={dig("2")} /><T sup="3" onClick={dig("3")} />
        <T sup="0" onClick={dig("0")} /><T sup="," onClick={dig(".")} label="vírgula decimal" />

        <T cls="acao" sup="ENTER" onClick={ap(hpEnter)} />
        <T sup="BEG" supG="END" onClick={() => setMaq({ ...m, begin: !m.begin, prefixo: null })} label="alternar início e fim do período" />
        <T sup="FIN" onClick={ap((x) => hpLimpar(x, "fin"))} label="limpar registradores financeiros" />
        <T sup="REG" onClick={ap((x) => hpLimpar(x, "reg"))} label="limpar tudo" />
        <T sup={m.casas + " cs"} onClick={() => setMaq({ ...m, casas: m.casas >= 4 ? 0 : m.casas + 2, prefixo: null })} label="casas decimais" />
      </div>

      {m.aguardando && (
        <div className="cx-pane" style={{ borderColor: "var(--gold)" }}>
          <div className="cx-lb" style={{ color: "var(--gold)" }}>
            {m.aguardando === "sto" ? "Guardar em qual memória?" : "Trazer de qual memória?"}
          </div>
          <div className="fr-teclas c5" style={{ marginTop: 9 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => (
              <button key={k} className="fr-t" onClick={() => setMaq({ ...hpMem(m, m.aguardando, k), aguardando: null })}>
                <span className="sup" /><span>{k}</span>
                <span className="sup g">{m.mem[k] !== undefined ? "•" : ""}</span>
              </button>
            ))}
          </div>
          <button className="cx-chip" style={{ marginTop: 9 }} onClick={() => setMaq({ ...m, aguardando: null })}>Cancelar</button>
        </div>
      )}

      <div className="cx-pane">
        <div className="cx-lb">Como usar (RPN)</div>
        <p style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.55 }}>
          Primeiro os números, depois a operação: <b>12 ENTER 5 +</b> dá 17.<br />
          <b>Financeiras:</b> digite o valor e toque na tecla para GRAVAR (100000 PV).
          Toque na tecla SOZINHA para RESOLVER aquele registrador.<br />
          <b>Sinal:</b> dinheiro que sai é negativo — use CHS. Empréstimo de 100.000
          em 360x a 1%: <b>360 n · 1 i · 100000 PV · PMT</b> → −1.028,61.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
function CalcSimples({ est, setEst }) {
  const e = est;
  const mostra = e.entrada;
  const num = () => parseFloat(String(e.entrada).replace(/\./g, "").replace(",", ".")) || 0;
  const digitar = (d) => {
    if (e.novo) return setEst({ ...e, entrada: d === "," ? "0," : d, novo: false });
    if (d === "," && String(e.entrada).includes(",")) return;
    if (String(e.entrada).replace(/[^0-9]/g, "").length >= 12) return;
    setEst({ ...e, entrada: e.entrada === "0" && d !== "," ? d : e.entrada + d });
  };
  const fmt = (v) => (isFinite(v) ? v.toLocaleString("pt-BR", { maximumFractionDigits: 8 }) : "Erro");
  const aplicar = (a, b, op) => op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : op === "/" ? (b === 0 ? NaN : a / b) : b;
  const operar = (op) => {
    const x = num();
    const r = e.op && !e.novo ? aplicar(e.acum, x, e.op) : x;
    setEst({ ...e, acum: r, op, entrada: fmt(r), novo: true });
  };
  const igual = () => {
    const x = num();
    const r = e.op ? aplicar(e.acum, x, e.op) : x;
    setEst({ ...e, acum: r, op: null, entrada: fmt(r), novo: true });
  };
  const uni = (fn) => setEst({ ...e, entrada: fmt(fn(num())), novo: true });
  const T = (rot, onClick, cls, label) => (
    <button className={"fr-t " + (cls || "")} onClick={onClick} aria-label={label || rot}>
      <span className="sup" /><span>{rot}</span><span className="sup" />
    </button>
  );
  return (
    <div className="fr-wrap">
      <div className="fr-visor" role="status" aria-live="polite">
        <span className="peq">{e.mem ? "M " + fmt(e.mem) : ""}{e.op ? "  " + e.op : ""}</span>
        {mostra}
      </div>
      <div className="fr-teclas c4">
        {T("MC", () => setEst({ ...e, mem: 0 }), "op", "limpar memória")}
        {T("MR", () => setEst({ ...e, entrada: fmt(e.mem || 0), novo: true }), "op", "trazer memória")}
        {T("M+", () => setEst({ ...e, mem: (e.mem || 0) + num(), novo: true }), "op", "somar à memória")}
        {T("M−", () => setEst({ ...e, mem: (e.mem || 0) - num(), novo: true }), "op", "subtrair da memória")}

        {T("C", () => setEst({ entrada: "0", acum: 0, op: null, novo: true, mem: e.mem }), "op", "limpar")}
        {T("±", () => setEst({ ...e, entrada: fmt(-num()) }), "op", "trocar sinal")}
        {T("%", () => uni((x) => x / 100), "op", "porcentagem")}
        {T("÷", () => operar("/"), "op", "dividir")}

        {T("7", () => digitar("7"))}{T("8", () => digitar("8"))}{T("9", () => digitar("9"))}
        {T("×", () => operar("*"), "op", "multiplicar")}
        {T("4", () => digitar("4"))}{T("5", () => digitar("5"))}{T("6", () => digitar("6"))}
        {T("−", () => operar("-"), "op", "subtrair")}
        {T("1", () => digitar("1"))}{T("2", () => digitar("2"))}{T("3", () => digitar("3"))}
        {T("+", () => operar("+"), "op", "somar")}
        {T("0", () => digitar("0"))}{T(",", () => digitar(","), "", "vírgula")}
        {T("√", () => uni((x) => (x < 0 ? NaN : Math.sqrt(x))), "op", "raiz quadrada")}
        {T("=", igual, "acao")}

        {T("x²", () => uni((x) => x * x), "op", "ao quadrado")}
        {T("1/x", () => uni((x) => (x === 0 ? NaN : 1 / x)), "op", "inverso")}
        {T("xʸ", () => operar("^"), "op", "potência")}
        {T("⌫", () => setEst({ ...e, entrada: String(e.entrada).length > 1 ? String(e.entrada).slice(0, -1) : "0" }), "op", "apagar dígito")}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
function Planilha({ celulas, setCelulas }) {
  // qual célula está sendo digitada. É estado de INTERFACE: não pertence aos
  // dados, não vai para o disco e não entra na corrida do onChange/onBlur.
  const [editando, setEditando] = useState(null);
  return (
    <div className="fr-wrap">
      <p style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.55 }}>
        Digite números direto, ou uma fórmula começando por <b>=</b>. Valem
        <b> + − * / ^ ( )</b>, referências como <b>A1</b>, intervalos e as funções
        <b> SOMA · MÉDIA · MÁXIMO · MÍNIMO · CONT · RAIZ · ABS · ARRED</b>.
        <br />Exemplo: <b>=SOMA(A1:A5)/CONT(A1:A5)</b> ou <b>=B2*(1+B3)^B4</b>.
      </p>
      <div className="fr-planbox">
        <table className="fr-plan">
          <thead>
            <tr>
              <th className="lin" scope="col"> </th>
              {PLAN_COLS.map((c) => <th key={c} scope="col">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: PLAN_LINHAS }).map((_, li) => {
              const l = li + 1;
              return (
                <tr key={l}>
                  <td className="lin">{l}</td>
                  {PLAN_COLS.map((c) => {
                    const ref = c + l;
                    const bruto = celulas[ref] || "";
                    const exibido = planMostrar(ref, celulas);
                    const erro = /^#/.test(exibido);
                    return (
                      <td key={ref} className={erro ? "erro" : ""}>
                        <input
                          value={editando === ref ? bruto : exibido}
                          aria-label={`célula ${ref}`}
                          inputMode={bruto.startsWith("=") ? "text" : "decimal"}
                          onFocus={() => setEditando(ref)}
                          onBlur={() => setEditando((a) => (a === ref ? null : a))}
                          onChange={(ev) => setCelulas({ ...celulas, [ref]: ev.target.value })}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button className="cx-chip" style={{ justifySelf: "start" }}
        onClick={() => { setCelulas({}); setEditando(null); }}>Limpar a planilha</button>
    </div>
  );
}

// ---------------------------------------------------------------------
function Formulas() {
  const grupos = [...new Set(FORMULAS.map((f) => f.g))];
  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.55, marginBottom: 4 }}>
        O edital (13.10) diz que a plataforma disponibiliza fórmulas, mas <b>não publica quais</b>.
        Esta folha é uma reconstrução nossa a partir do que o programa da CPA cobra — trate como
        material de estudo, não como cópia da folha oficial.
      </p>
      {grupos.map((g) => (
        <div key={g}>
          <div className="fr-gtit">{g}</div>
          {FORMULAS.filter((f) => f.g === g).map((f) => (
            <div key={f.f} className="fr-form">
              <div className="tt">{f.f}</div>
              <div className="eq">{f.e}</div>
              {f.n ? <div className="nt">{f.n}</div> : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// Painel único. `noExame` muda o texto de abertura e some com o que não
// existe na prova — a HP-12C fica fora quando você está fazendo o exame,
// porque lá ela não existe.
// ---------------------------------------------------------------------
function Ferramentas({ estado, setEstado, noExame }) {
  const e = estado;
  const aba = e.aba || "calc";
  const set = (p) => setEstado({ ...e, ...p });
  const ABAS = [
    { k: "calc", r: "Calculadora", exame: true },
    { k: "plan", r: "Planilha", exame: true },
    { k: "notas", r: "Rascunho", exame: true },
    { k: "form", r: "Fórmulas", exame: true },
    { k: "hp", r: "HP-12C", exame: false },
  ].filter((a) => !noExame || a.exame);

  return (
    <div>
      <style>{FerrCSS}</style>
      <div className="fr-abas" role="tablist">
        {ABAS.map((a) => (
          <button key={a.k} role="tab" aria-selected={aba === a.k}
            className={"fr-aba" + (aba === a.k ? " on" : "")}
            onClick={() => set({ aba: a.k })}>{a.r}</button>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        {aba === "calc" && <CalcSimples est={e.calc || { entrada: "0", acum: 0, op: null, novo: true, mem: 0 }}
          setEst={(v) => set({ calc: v })} />}
        {aba === "plan" && <Planilha celulas={e.plan || {}} setCelulas={(v) => set({ plan: v })} />}
        {aba === "notas" && (
          <div className="fr-wrap">
            <p style={{ fontSize: 13, color: "var(--ink2)" }}>
              O mesmo rascunho da prova: some do papel, fica aqui. É salvo sozinho e continua
              disponível depois.
            </p>
            <textarea className="fr-notas" value={e.notas || ""} aria-label="Rascunho"
              placeholder="Anote aqui o que você faria no papel…"
              onChange={(ev) => set({ notas: ev.target.value })} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--mut)", fontWeight: 700, alignSelf: "center" }}>
                {(e.notas || "").length} caracteres
              </span>
              <button className="cx-chip" onClick={() => set({ notas: "" })}>Limpar rascunho</button>
            </div>
          </div>
        )}
        {aba === "form" && <Formulas />}
        {aba === "hp" && <Hp12c maq={e.hp || hpNovo()} setMaq={(v) => set({ hp: v })} />}
      </div>

      {aba === "hp" && !noExame && (
        <div className="cx-pane" style={{ marginTop: 12, borderColor: "var(--gold)" }}>
          <div className="cx-lb" style={{ color: "var(--gold)" }}>Isto NÃO estará no seu exame</div>
          <p style={{ color: "var(--ink2)", fontSize: 13, lineHeight: 1.55 }}>
            O edital 13.11 é direto: <i>"Não será permitido utilizar calculadora própria, pois a
            Anbima oferece no sistema de provas uma calculadora e uma planilha eletrônica"</i>.
            Não há HP-12C na plataforma, e você não pode levar a sua.
            <br /><br />
            Ela está aqui porque continua sendo o melhor jeito de <b>entender</b> juros compostos e
            séries — e porque quase todo curso ensina por ela. Mas treine as contas da prova nas
            abas <b>Calculadora</b> e <b>Planilha</b>: são essas que você terá na mão.
          </p>
        </div>
      )}
    </div>
  );
}
