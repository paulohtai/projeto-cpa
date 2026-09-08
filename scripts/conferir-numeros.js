#!/usr/bin/env node
/**
 * conferir-numeros.js — auditoria conceitual em escala.
 *
 * Uso: node scripts/conferir-numeros.js [--listar]
 *
 * O problema que ele resolve: dá para auditar ESTRUTURA de 872 questões com
 * script, mas conferir CONCEITO exige ler. Ler 872 à mão não acontece. Este
 * script cobre a fatia mais perigosa do conceito — os NÚMEROS — em 100% do
 * banco, de duas maneiras:
 *
 *  1. TABELA DE FATOS: valores conferidos em fonte primária (norma, lei,
 *     regulamento). Se um gabarito afirma um número diferente do fato para
 *     aquele tema, é ERRO e o build para.
 *
 *  2. LASTRO NA APOSTILA: todo número afirmado num gabarito tem de aparecer
 *     na apostila (a fonte declarada na Regra Zero) perto do mesmo tema.
 *     Número sem lastro não reprova sozinho — vira lista de conferência,
 *     porque pode ser um valor de exemplo inventado pelo enunciado.
 *
 * Isto não substitui leitura humana. Substitui a ilusão de que dava para
 * conferir 872 questões no olho.
 */
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");
const listar = process.argv.includes("--listar");

// ---------------------------------------------------------------------
// 1. TABELA DE FATOS — cada linha foi conferida na fonte citada.
//    tema:  quando bater, a regra vale para aquela questão
//    certo: valores aceitos
//    errado: valores que, se afirmados como resposta daquele tema, são erro
// ---------------------------------------------------------------------
const FATOS = [
  { id: "FGC-teto-cpf", fonte: "Resolução CMN 4.222 e regulamento do FGC",
    tema: /FGC[^.]{0,120}?(teto|limite|at[ée]|garante|cobre|cobertura)/i,
    certo: [/250\.?000|250 mil|duzentos e cinquenta mil/],
    errado: [/\b(100|150|200|300|500)\.000\b[^.]{0,40}por CPF/i] },

  { id: "FGC-teto-global", fonte: "Resolução CMN 4.222 — teto global de R$ 1 milhão a cada 4 anos",
    tema: /FGC[^.]{0,120}?(global|teto total|quatro anos|4 anos|per[íi]odo de)/i,
    certo: [/1 milh|1\.000\.000|um milh/],
    errado: [/\b(2|3|5)\s*milh/i] },

  { id: "IR-regressiva-rf", fonte: "Lei 11.033/2004 — tabela regressiva da renda fixa: 22,5% · 20% · 17,5% · 15%",
    tema: /tabela regressiva[^.]{0,80}?(renda fixa|imposto de renda)/i,
    certo: [/22,5|20%|17,5|15%/],
    errado: [/\b(10|12,5|27,5|35)%[^.]{0,60}renda fixa/i] },

  { id: "IR-regressiva-rf-piso", fonte: "Lei 11.033/2004 — a alíquota mínima da renda fixa é 15%, nunca 10%",
    tema: /(al[íi]quota|faixa)[^.]{0,60}(m[íi]nima|menor)[^.]{0,60}(tabela )?regressiva[^.]{0,60}renda fixa|renda fixa[^.]{0,60}al[íi]quota m[íi]nima/i,
    certo: [/15%/],
    errado: [/\b10%/] },

  { id: "IR-regressiva-prev", fonte: "Lei 11.053/2004 — tabela regressiva da previdência: 35% até 2 anos … 10% acima de 10 anos",
    tema: /tabela regressiva[^.]{0,80}?previd[êe]ncia|previd[êe]ncia[^.]{0,80}tabela regressiva/i,
    certo: [/35%|30%|25%|20%|15%|10%/],
    errado: [/\b22,5%[^.]{0,60}previd[êe]ncia/i] },

  { id: "PGBL-12", fonte: "Lei 9.532/1997 art. 11 — dedução limitada a 12% da renda bruta anual tributável",
    tema: /PGBL[^.]{0,140}?(dedu|abat|dedu[çz]|declara[çc]ão completa|base de c[áa]lculo)/i,
    certo: [/12%/],
    errado: [/\b(10|15|20|27,5|30)%[^.]{0,50}(da renda|renda bruta)/i] },

  { id: "come-cotas", fonte: "IN RFB 1.585 — come-cotas de 15% em fundo de longo prazo e 20% em curto prazo",
    tema: /come-?cotas/i,
    certo: [/15%|20%/],
    errado: [/\b(10|17,5|22,5|25|30)%[^.]{0,40}come-?cotas|come-?cotas[^.]{0,40}\b(10|17,5|22,5|25|30)%/i] },

  { id: "IOF-30", fonte: "Decreto 6.306/2007 — IOF regressivo some no 30º dia",
    tema: /\bIOF\b[^.]{0,140}?(regressiv|prazo|dias|deixa de|zera|isent)/i,
    certo: [/30 dias|trinta dias|30º|30 º|29 dias/],
    errado: [/\b(60|90|180|360) dias[^.]{0,40}IOF|IOF[^.]{0,40}\b(60|90|180|360) dias/i] },

  { id: "LCI-LCA-prazo", fonte: "Resolução CMN 5.215/2025 — 6 meses para LCI e LCA SEM atualização por índice de preços",
    tema: /LC[IA][^.]{0,140}?(prazo m[íi]nimo|car[êe]ncia)|prazo m[íi]nimo[^.]{0,80}LC[IA]/i,
    certo: [/6 meses|seis meses|12 meses|doze meses/],
    errado: [/\b(90 dias|noventa dias|9 meses|nove meses|3 meses|tr[êe]s meses)\b/i] },

  { id: "LCD-prazo", fonte: "Lei 14.937/2024 e Resolução CMN — LCD com prazo mínimo de 12 meses",
    tema: /\bLCD\b[^.]{0,140}?(prazo m[íi]nimo|car[êe]ncia)/i,
    certo: [/12 meses|doze meses/],
    errado: [/LCD[^.]{0,60}(6 meses|seis meses|9 meses|24 meses)/i] },

  { id: "deb-incentivada", fonte: "Lei 12.431/2011 — prazo médio ponderado mínimo de 24 meses; isenta para PF, 15% para PJ",
    tema: /deb[êe]nture[^.]{0,120}?(incentivada|infraestrutura)[^.]{0,120}?(prazo|al[íi]quota|isen|tribut)/i,
    certo: [/24 meses|vinte e quatro meses|15%|isent/],
    errado: [/deb[êe]nture[^.]{0,80}incentivada[^.]{0,80}(6 meses|12 meses|48 meses)/i] },

  { id: "COE-tributacao", fonte: "IN RFB 1.585 — COE segue a tabela regressiva da renda fixa",
    tema: /COE[^.]{0,140}?(tribut|imposto de renda|al[íi]quota)/i,
    certo: [/regressiva|22,5|20%|17,5|15%/],
    errado: [/COE[^.]{0,80}(isent|15% fixo|renda vari[áa]vel[^.]{0,20}20%)/i] },

  { id: "COE-fgc", fonte: "Resolução CMN 4.222 — o COE não está na lista de instrumentos garantidos pelo FGC",
    tema: /COE[^.]{0,140}?FGC/i,
    certo: [/n[ãa]o (tem|conta com|possui|est[áa])|fora do FGC|sem (a )?cobertura|ausência de/i],
    errado: [/COE[^.]{0,60}(tem|possui|conta com|é coberto pel)[^.]{0,20}FGC/i] },

  { id: "selic-over", fonte: "Metodologia do Banco Central — a Selic Over fica cerca de 0,10 p.p. abaixo da Meta",
    tema: /Selic Over[^.]{0,140}?(Meta|abaixo|acima|ponto percentual)/i,
    certo: [/abaixo/],
    errado: [/Selic Over[^.]{0,60}acima da (Selic )?Meta/i] },

  { id: "suitability-24", fonte: "Resolução CVM 30 — o perfil deve ser atualizado em no máximo 24 meses",
    tema: /(suitability|perfil do investidor|API)[^.]{0,140}?(atualiz|validade|prazo|vence|renova)/i,
    certo: [/24 meses|dois anos/],
    errado: [/(suitability|perfil)[^.]{0,80}\b(12 meses|um ano|36 meses|tr[êe]s anos|60 meses)\b/i] },
];

// ---------------------------------------------------------------------
// 2. carrega banco e apostila
// ---------------------------------------------------------------------
const mods = [1, 2, 3, 4].map((i) =>
  eval("[" + fs.readFileSync(path.join(raiz, `src/dados/modulo-${i}.part.js`), "utf8") + "][0]"));
const Q = [];
mods.forEach((m) => (m.blocos || []).forEach((b) => {
  (b.niveis || []).forEach((n) => (n.questoes || []).forEach((q, i) =>
    Q.push({ ...q, ref: `${n.id}#${i}`, mId: m.id, nId: n.id })));
  (b.boss || []).forEach((q, i) => Q.push({ ...q, ref: `${b.id}|BOSS|${i}`, mId: m.id, nId: b.id }));
}));

const apostilaPath = path.join(raiz, "referencia/apostila-t2-2026.txt");
const temApostila = fs.existsSync(apostilaPath);
const apostila = temApostila
  ? fs.readFileSync(apostilaPath, "utf8").replace(/\r/g, "").replace(/\s+/g, " ")
  : "";

let falhas = 0;
const ok = (t) => console.log("  ok   " + t);
const erro = (t) => { falhas++; console.log("  ERRO " + t); };

// ---------------------------------------------------------------------
// 3. checagem contra a tabela de fatos
// ---------------------------------------------------------------------
console.log("\nTABELA DE FATOS (fonte primária)");
let totalTocadas = 0;
const contradicoes = [];
FATOS.forEach((f) => {
  const alvo = Q.filter((q) => f.tema.test(q.alts[q.c] + " " + q.exp));
  totalTocadas += alvo.length;
  const ruins = alvo.filter((q) => {
    const t = q.alts[q.c] + " " + q.exp;
    const contradiz = f.errado.some((re) => re.test(t));
    const confirma = f.certo.some((re) => re.test(t));
    return contradiz && !confirma;
  });
  ruins.forEach((q) => contradicoes.push({ fato: f.id, ref: q.ref, fonte: f.fonte, gab: q.alts[q.c] }));
  console.log(`  ${String(alvo.length).padStart(3)} questões · ${f.id}${ruins.length ? `  ← ${ruins.length} CONTRADIZ` : ""}`);
});
if (contradicoes.length) {
  contradicoes.forEach((c) => erro(`${c.ref} contradiz "${c.fato}" (${c.fonte})\n         gabarito: ${c.gab.slice(0, 120)}`));
} else {
  ok(`nenhum gabarito contradiz os ${FATOS.length} fatos conferidos em fonte primária (${totalTocadas} questões tocadas)`);
}

// ---------------------------------------------------------------------
// 4. lastro na apostila
// ---------------------------------------------------------------------
console.log("\nLASTRO NA APOSTILA");
if (!temApostila) {
  console.log("  info apostila não encontrada em referencia/ — checagem de lastro pulada");
} else {
  // Só interessa o número que funciona como REGRA. Ficam de fora:
  //  · o que o próprio enunciado forneceu (é dado do caso, não norma);
  //  · resultado de conta — a explicação mostra a operação que o gerou;
  //  · número de lei, resolução ou instrução — identifica a norma, não é valor.
  // Sem esses três filtros a lista vira 100% falso positivo: na primeira
  // rodada os 20 "sem lastro" eram 17 resultados de conta e 3 números de lei.
  const eNumeroDeNorma = (gab, n) =>
    new RegExp("(lei|leis|lc|resolu[çc][ãa]o|instru[çc][ãa]o|decreto|circular|res\\.?|cvm|cmn|bacen)[^.]{0,40}" +
      n.replace(/[.]/g, "\\.").replace(/%$/, ""), "i").test(gab);
  const eResultadoDeConta = (gab) => /[×x*÷/]|\^|\bsoma\b|\bsomando\b|diferen[çc]a entre|resultado d[eao]|elevar|capitaliza|multiplic/i.test(gab);

  const semLastro = [];
  let comNumero = 0;
  Q.forEach((q) => {
    const gab = q.alts[q.c] + " " + q.exp;
    const daConta = eResultadoDeConta(gab);
    const nums = [...new Set((gab.match(/\d{1,3}(?:\.\d{3})*(?:,\d+)?%?/g) || []))]
      .filter((n) => /%$/.test(n) || /\d{3}/.test(n))          // percentual ou número grande
      .filter((n) => !q.q.includes(n.replace(/%$/, "")))        // não é dado do próprio enunciado
      .filter((n) => !eNumeroDeNorma(gab, n))                   // não é o número da lei
      .filter((n) => !daConta);                                 // não é resultado da conta
    if (!nums.length) return;
    comNumero++;
    const faltando = nums.filter((n) => !apostila.includes(n.replace(/%$/, "")));
    if (faltando.length) semLastro.push({ ref: q.ref, nums: faltando, gab: gab.slice(0, 110) });
  });
  const pct = comNumero ? Math.round((semLastro.length / comNumero) * 100) : 0;
  console.log(`  info ${comNumero} questões afirmam número de regra no gabarito`);
  console.log(`  info ${semLastro.length} (${pct}%) usam ao menos um número que não aparece na apostila`);
  if (listar) semLastro.slice(0, 40).forEach((x) => console.log(`       ${x.ref}: ${x.nums.join(", ")} — ${x.gab}`));
  // teto: acima de 12% significa que o banco está inventando números
  pct <= 12
    ? ok(`lastro na apostila dentro do teto (${pct}%, teto 12%) — rode com --listar para ver os casos`)
    : erro(`${pct}% dos gabaritos numéricos não têm lastro na apostila (teto 12%)`);
}

// ---------------------------------------------------------------------
// 5. conceitos sem lastro em fonte nenhuma (a "Regra Zero")
// ---------------------------------------------------------------------
console.log("\nCONCEITOS FORA DAS FONTES");
if (temApostila) {
  const cadernos = ["referencia/anbima-caderno-questoes-cpa.txt", "referencia/anbima-caderno-2026-03-12.txt"]
    .filter((f) => fs.existsSync(path.join(raiz, f)))
    .map((f) => fs.readFileSync(path.join(raiz, f), "utf8")).join(" ");
  const suspeitos = [];
  // termos que aparecem no banco e em fonte nenhuma são candidatos a remoção
  const termos = new Set();
  Q.forEach((q) => ((q.q + " " + q.alts.join(" ")).match(/\b[A-ZÇÃÕ]{3,6}\b/g) || []).forEach((s) => termos.add(s)));
  const IGNORAR = new Set(["CPA", "REDENÇÃO", "REDEN", "ANBIMA"]);
  [...termos].sort().forEach((t) => {
    if (IGNORAR.has(t)) return;
    if (!apostila.includes(t) && !cadernos.includes(t)) {
      const n = Q.filter((q) => new RegExp("\\b" + t + "\\b").test(q.q + " " + q.alts.join(" "))).length;
      suspeitos.push({ termo: t, n });
    }
  });
  if (!suspeitos.length) ok("nenhuma sigla do banco está fora da apostila e dos cadernos oficiais");
  else {
    console.log(`  info ${suspeitos.length} sigla(s) sem lastro em nenhuma das fontes:`);
    suspeitos.sort((a, b) => b.n - a.n).forEach((x) => console.log(`       ${x.termo} — em ${x.n} questão(ões)`));
    console.log("  info não reprova o build: pode ser sigla nova de norma posterior à apostila.");
    console.log("       Confira contra o Programa Detalhado antes de manter.");
  }
}

console.log(falhas === 0 ? "\nSEM CONTRADIÇÃO COM AS FONTES.\n" : `\n${falhas} PROBLEMA(S) DE CONTEÚDO.\n`);
process.exit(falhas === 0 ? 0 : 1);
