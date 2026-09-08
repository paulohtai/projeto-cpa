#!/usr/bin/env node
/**
 * rotular-dificuldade.js — grava `dif` (1 fácil · 2 médio · 3 difícil) em
 * cada uma das questões, e `carga` (a pontuação bruta que gerou o rótulo).
 *
 * Uso: node scripts/rotular-dificuldade.js
 *
 * ---------------------------------------------------------------------
 * POR QUE ISTO NÃO É UM CLASSIFICADOR TREINADO NO RÓTULO DA ANBIMA
 *
 * O caderno oficial traz 39 questões com o rótulo de dificuldade da banca.
 * Medimos a correlação entre esse rótulo e todas as features de texto
 * disponíveis:
 *
 *     comprimento do contexto  r = 0,067
 *     comprimento das alternativas r = 0,071
 *     quantidade de números    r = 0,014
 *     números nas alternativas r = 0,044
 *     exige cálculo            r = 0,186   <- a mais forte, e ainda é ruído
 *
 * Ou seja: o rótulo da ANBIMA NÃO é previsível pelo texto da questão. Um
 * classificador ajustado nesses 39 exemplos seria adivinhação com aparência
 * de método. Então não fazemos isso.
 *
 * O que fazemos: ordenamos as questões por uma RÉGUA DE CARGA COGNITIVA
 * declarada (abaixo), e cortamos nos percentis 25 / 75 para que a
 * distribuição do sorteio bata com os 25% / 50% / 25% que a ANBIMA publica.
 *
 *   · a DISTRIBUIÇÃO é oficial (página da CPA);
 *   · a ORDENAÇÃO é nossa, e o app diz isso na tela.
 *
 * A régua é determinística: rodar de novo dá exatamente o mesmo resultado,
 * e qualquer pessoa pode conferir por que uma questão caiu onde caiu.
 * ---------------------------------------------------------------------
 */
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");

// ---------------------------------------------------------------- a régua
// A ideia central: o que torna uma questão difícil não é ela ser comprida,
// é as quatro alternativas serem PARECIDAS. Quando as quatro dizem quase a
// mesma coisa, o candidato precisa dominar a distinção fina; quando uma
// destoa das outras, ele elimina no olho. Isso é medível.
//
// Os componentes contínuos vêm primeiro (dão espalhamento à nota) e os
// binários entram como bônus. Nada aqui depende de opinião.
const palavras = (s) => new Set(
  String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3)
);
const jaccard = (a, b) => {
  let inter = 0;
  a.forEach((w) => { if (b.has(w)) inter++; });
  const uniao = a.size + b.size - inter;
  return uniao ? inter / uniao : 0;
};

// 0..1 — média da semelhança entre os 6 pares de alternativas
const similaridadeAlts = (q) => {
  const ps = q.alts.map(palavras);
  let soma = 0, n = 0;
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) { soma += jaccard(ps[i], ps[j]); n++; }
  return n ? soma / n : 0;
};

const CONTINUOS = [
  { nome: "alternativas parecidas entre si (o que exige distinção fina)", max: 12,
    valor: (q) => Math.min(1, similaridadeAlts(q) / 0.5) * 12 },
  { nome: "densidade de siglas e termos técnicos distintos", max: 4,
    valor: (q) => {
      const sig = new Set((q.q + " " + q.alts.join(" ")).match(/\b[A-ZÇÃÕ]{2,6}\b/g) || []);
      return Math.min(4, sig.size * 0.8);
    } },
  { nome: "carga de leitura (enunciado + alternativas)", max: 3,
    valor: (q) => {
      const ch = (q.q + q.alts.join("")).replace(/\s/g, "").length;
      return Math.max(0, Math.min(3, (ch - 550) / 200));
    } },
  { nome: "quantidade de números para acompanhar", max: 3,
    valor: (q) => Math.min(3, ((q.q + " " + q.alts.join(" ")).match(/\d[\d.,]*/g) || []).length * 0.6) },
];

const BINARIOS = [
  { nome: "exige cálculo", peso: 5, teste: (q) => {
      const t = q.q + " " + q.alts.join(" ");
      return /\d/.test(q.alts.join("")) &&
        /\bcalcul|quanto (vai |ir[áa] )?(receb|render|pagar|sobra)|montante|valor l[íi]quido|resultado l[íi]quido|taxa efetiva|rentabilidade (real|l[íi]quida)|quanto ele|quanto ela|receber[áa]|render[áa]|resultar[áa]/i.test(t);
    } },
  { nome: "alternativas se separam só pelo número", peso: 4, teste: (q) => {
      // tira os números: se as alternativas viram quase o mesmo texto, o
      // candidato precisa acertar o VALOR, não a ideia
      const semNum = q.alts.map((a) => a.replace(/[\d.,%]+/g, "#").replace(/\s+/g, " ").trim());
      return new Set(semNum).size <= 2 && /\d/.test(q.alts.join(""));
    } },
  { nome: "compara dois ou mais institutos", peso: 3, teste: (q) => {
      // o COMANDO é a última frase do enunciado
      const frases = q.q.split(/(?<=[.?!:])\s+/);
      const cmd = frases[frases.length - 1] || q.q;
      return /respectivamente|diferen[çc]a entre|enquanto|ao passo que|comparad|distingu|cada um dos|cada uma das|e a de|e o de/i.test(cmd);
    } },
  { nome: "gabarito com condição (não vale sempre)", peso: 3, teste: (q) =>
      /desde que|salvo|somente se|apenas quando|na hip[óo]tese de|exceto quando|contanto que|quando houver|se houver|independentemente de/i.test(q.alts[q.c] || "") },
  { nome: "aplica regra a caso concreto com valor ou prazo", peso: 2, teste: (q) =>
      /R\$ ?[\d.]/.test(q.q) || /\d+\s*(dias|meses|anos)/i.test(q.q) },
];

const carga = (q) => {
  const c = CONTINUOS.reduce((s, x) => s + x.valor(q), 0);
  const b = BINARIOS.reduce((s, x) => s + (x.teste(q) ? x.peso : 0), 0);
  return Math.round((c + b) * 100) / 100;
};

// ------------------------------------------------------------------ dados
const arquivos = [1, 2, 3, 4].map((i) => `src/dados/modulo-${i}.part.js`);
const mods = arquivos.map((f) => eval("[" + fs.readFileSync(path.join(raiz, f), "utf8") + "][0]"));

// junta todas as questões com uma referência viva para poder gravar o rótulo
const todas = [];
mods.forEach((m) => (m.blocos || []).forEach((b) => {
  (b.niveis || []).forEach((n) => (n.questoes || []).forEach((q) => todas.push(q)));
  (b.boss || []).forEach((q) => todas.push(q));
}));
console.log(`questões: ${todas.length}`);

todas.forEach((q) => { q.carga = carga(q); });

// ------------------------------------------------- corte nos percentis
// A ANBIMA publica 25% fácil / 50% médio / 25% difícil.
//
// O corte é feito DENTRO DE CADA MÓDULO, não no banco inteiro. Se fosse
// global, um módulo com questões naturalmente mais densas (M2, produtos)
// levaria quase todos os "difícil" e o M4 quase nenhum — e aí o sorteio,
// que é ponderado por módulo, não conseguiria montar 25/50/25.
// Cortando por módulo, cada um tem a sua própria escala e o sorteio fecha.
const porModulo = mods.map((m) => {
  const qs = [];
  (m.blocos || []).forEach((b) => {
    (b.niveis || []).forEach((nv) => (nv.questoes || []).forEach((q) => qs.push(q)));
    (b.boss || []).forEach((q) => qs.push(q));
  });
  return { id: m.id, qs };
});

porModulo.forEach(({ qs }) => {
  const ord = [...qs].sort((a, b) =>
    a.carga - b.carga ||
    (a.q + a.alts.join("")).length - (b.q + b.alts.join("")).length ||
    a.q.localeCompare(b.q));
  const n = ord.length;
  const cf = Math.round(n * 0.25), cm = Math.round(n * 0.75);
  ord.forEach((q, i) => { q.dif = i < cf ? 1 : i < cm ? 2 : 3; });
});

const n = todas.length;
const cont = todas.reduce((a, q) => ((a[q.dif] = (a[q.dif] || 0) + 1), a), {});
const pct = (k) => Math.round((cont[k] / n) * 1000) / 10;
console.log(`fácil ${cont[1]} (${pct(1)}%) · médio ${cont[2]} (${pct(2)}%) · difícil ${cont[3]} (${pct(3)}%)`);

const cargas = todas.map((q) => q.carga).sort((a, b) => a - b);
console.log(`carga: mín ${cargas[0]} · mediana ${cargas[Math.floor(n / 2)]} · máx ${cargas[n - 1]} · valores distintos ${new Set(cargas).size}`);

// quantos disparam cada critério — para dar para auditar a régua
CONTINUOS.forEach((c) => {
  const vs = todas.map((q) => c.valor(q));
  const m = vs.reduce((a, b) => a + b, 0) / n;
  console.log(`  contínuo · ${c.nome}: média ${(Math.round(m * 100) / 100)} de ${c.max}`);
});
BINARIOS.forEach((c) => {
  const q = todas.filter((x) => c.teste(x)).length;
  console.log(`  ${String(q).padStart(4)} questões · ${c.nome} (peso ${c.peso})`);
});

porModulo.forEach(({ id, qs }) => {
  const c = qs.reduce((a, q) => ((a[q.dif] = (a[q.dif] || 0) + 1), a), {});
  const cg = qs.map((q) => q.carga).sort((a, b) => a - b);
  console.log(`  M${id}: fácil ${c[1] || 0} · médio ${c[2] || 0} · difícil ${c[3] || 0} · carga mediana ${cg[Math.floor(cg.length / 2)]}`);
});

// ------------------------------------------------------------- regravação
// mesma serialização de sempre: 2 espaços de recuo, vírgula ao final
mods.forEach((m, i) => {
  const txt = "  " + JSON.stringify(m, null, 2).split("\n").join("\n  ").trimEnd() + ",\n";
  fs.writeFileSync(path.join(raiz, arquivos[i]), txt);
});
console.log("gravado. rode: node build.js && node scripts/verificar.js");
