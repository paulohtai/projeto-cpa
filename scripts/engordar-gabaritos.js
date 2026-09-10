#!/usr/bin/env node
/**
 * engordar-gabaritos.js — reescreve gabaritos que eram sistematicamente mais
 * curtos que os distratores.
 *
 * Uso: node scripts/engordar-gabaritos.js [--conferir]
 *
 * ------------------------------------------------------------------
 * O DEFEITO
 * ------------------------------------------------------------------
 * Medindo o simulado de um concorrente com as nossas réguas, apareceu que lá
 * o gabarito é a alternativa mais LONGA em 66% das questões — quem chutasse
 * sempre a maior acertaria 66%, contra um corte de aprovação de 70%.
 *
 * A mesma medição aplicada ao nosso banco mostrou o defeito espelhado: o
 * gabarito era a alternativa mais CURTA em 63%. Chutar sempre a menor
 * acertava 63%. O nosso portão de viés só olhava para um lado — "a correta é
 * a mais longa?" — e por isso deu tudo certo durante meses.
 *
 * A origem é conhecida: numa rodada anterior nós tínhamos o viés clássico (a
 * correta mais longa) e a correção enxugou os gabaritos. Passou do ponto e
 * parou do outro lado.
 *
 * ------------------------------------------------------------------
 * O QUE ESTE SCRIPT FAZ, E O QUE ELE NÃO PODE FAZER
 * ------------------------------------------------------------------
 * Ele substitui o TEXTO do gabarito de questões escolhidas. Não muda o índice
 * `c` de nenhuma questão, não mexe em distrator e não toca em enunciado. O
 * gabarito continua sendo a mesma alternativa, dizendo a mesma coisa — com a
 * precisão que ele já deveria ter.
 *
 * A regra que eu me impus ao escrever: **nenhum texto novo pode trazer fato
 * que não esteja na explicação já auditada daquela questão.** Encher
 * alternativa com palavra vazia para bater uma métrica seria trocar um defeito
 * medido por um defeito não medido. Cada acréscimo aqui é informação que o
 * aluno usa — o valor do limite, o nome de quem apura, a razão do resultado.
 *
 * A meta não é "o gabarito nunca ser o mais curto". Isso seria outro sinal
 * igualmente explorável: bastaria descartar a menor. A meta é o tamanho não
 * dizer nada — perto de 25% em cada uma das quatro posições de comprimento,
 * que é o que o caderno oficial da ANBIMA faz (30% mais longa, 21% mais
 * curta). Por isso boa parte das questões fica de fora de propósito.
 */
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");

// [ref, textoAntigoDoGabarito, textoNovo]
// O texto antigo entra por extenso para servir de trava: se alguém editar a
// questão por outro caminho, a troca falha em vez de sobrescrever em silêncio.
const TROCAS = require("./dados-gabaritos.js");

const arquivos = ["modulo-1", "modulo-2", "modulo-3", "modulo-4"]
  .map((n) => path.join(raiz, "src", "dados", n + ".part.js"));
const conteudo = arquivos.map((f) => fs.readFileSync(f, "utf8"));

// A substituição precisa ser ANCORADA NA QUESTÃO, não no texto solto.
// Motivo prático: o mesmo texto de alternativa aparece como gabarito de uma
// questão e como distrator de outra — "monetário, em que se negocia liquidez
// de curtíssimo prazo…" é gabarito em 1.1|2|4 e distrator em 1.1|2|3. Trocar
// por busca global mudaria as duas, e a segunda ficaria com um distrator
// mais longo que o gabarito, criando exatamente o viés que estamos tirando.
//
// Então: localizamos o ENUNCIADO da questão (que é único) no arquivo e
// trocamos a primeira ocorrência do gabarito antigo depois dele.
const arqJsx = path.join(raiz, "app", "projeto-cpa-completo.jsx");
if (!fs.existsSync(arqJsx)) { console.error("Rode 'node build.js' antes."); process.exit(1); }
const jsx = fs.readFileSync(arqJsx, "utf8");
const iM = jsx.indexOf("const MODULOS = ["), fM = jsx.indexOf("\n];", iM);
const MODULOS = eval(jsx.slice(iM + "const MODULOS = ".length, fM + 2));
const PORREF = {};
MODULOS.forEach((m) => (m.blocos || []).forEach((b) => {
  (b.niveis || []).forEach((n, ni) => (n.questoes || []).forEach((q, qi) => { PORREF[`${b.id}|${ni + 1}|${qi + 1}`] = q; }));
  (b.boss || []).forEach((q, qi) => { PORREF[`${b.id}|BOSS|${qi + 1}`] = q; });
}));

let aplicadas = 0, jaFeitas = 0;
const problemas = [];

// Uma questão pode aparecer em mais de um lote: as rodadas foram feitas por
// medição, e a mesma questão podia continuar sendo a mais curta depois da
// primeira reescrita. Nesse caso o `de` do lote seguinte é o `para` do lote
// anterior, e o que vale é a ÚLTIMA versão. Sem esta consolidação, rodar o
// script do zero quebra na segunda entrada do mesmo ref.
const CADEIA = new Map();
TROCAS.forEach(([ref, de, para]) => {
  if (!CADEIA.has(ref)) CADEIA.set(ref, { versoes: [] });
  CADEIA.get(ref).versoes.push([de, para]);
});

[...CADEIA.entries()].forEach(([ref, { versoes }]) => {
  const para = versoes[versoes.length - 1][1];
  const aceitos = new Set([versoes[0][0], ...versoes.map((v) => v[1])]);
  const q = PORREF[ref];
  if (!q) { problemas.push(`${ref}: questão não existe mais com essa referência`); return; }
  if (q.alts[q.c] === para) { jaFeitas++; return; }
  if (!aceitos.has(q.alts[q.c])) {
    problemas.push(`${ref}: o gabarito atual não é nenhuma versão conhecida — está «${q.alts[q.c].slice(0, 50)}…»`);
    return;
  }
  const de = q.alts[q.c]; // parte de onde o arquivo realmente está
  // acha o arquivo e a posição do enunciado
  const iArq = conteudo.findIndex((c) => c.includes(q.q));
  if (iArq < 0) { problemas.push(`${ref}: não localizei o enunciado no src/dados`); return; }
  const base = conteudo[iArq].indexOf(q.q);
  const alvo = conteudo[iArq].indexOf(de, base);
  if (alvo < 0) { problemas.push(`${ref}: o gabarito não aparece depois do enunciado`); return; }
  conteudo[iArq] = conteudo[iArq].slice(0, alvo) + para + conteudo[iArq].slice(alvo + de.length);
  aplicadas++;
});

if (problemas.length) {
  console.error(`\nNADA FOI GRAVADO. ${problemas.length} problema(s):`);
  problemas.slice(0, 12).forEach((p) => console.error("  " + p));
  process.exit(1);
}

console.log(`\n${aplicadas} gabaritos reescritos · ${jaFeitas} já estavam aplicados`);
if (process.argv.includes("--conferir")) { console.log("Nada gravado (--conferir).\n"); process.exit(0); }
arquivos.forEach((f, i) => fs.writeFileSync(f, conteudo[i]));
console.log("Gravado. Rode: node build.js && node scripts/verificar.js\n");
