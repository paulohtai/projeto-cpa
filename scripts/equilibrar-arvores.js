#!/usr/bin/env node
/**
 * equilibrar-arvores.js — espalha a "Melhor escolha" pelas quatro posições
 * na FONTE das árvores de decisão.
 *
 * Uso: node scripts/equilibrar-arvores.js [--conferir]
 *
 * Por que isso é necessário e por que é honesto:
 *
 * Quem escreve uma conversa tende a redigir primeiro a resposta certa e
 * depois inventar as erradas. O resultado aparece na fonte: a melhor escolha
 * cai na primeira posição muito mais do que deveria. Já aconteceu aqui uma
 * vez, em 30 de 30 decisões — dava para tirar 100% clicando sempre na
 * primeira sem ler nada.
 *
 * O app sorteia a ordem a cada tentativa, então o defeito não chega à tela.
 * Mesmo assim a fonte precisa estar equilibrada, por dois motivos: o sorteio
 * é uma camada que pode falhar ou ser removida por engano, e um material que
 * só está correto por causa de uma correção em tempo de execução não é um
 * material correto.
 *
 * O que este script faz é ROTACIONAR as quatro alternativas de cada decisão.
 * Rotação não inventa, não corta e não reescreve nada: as mesmas quatro
 * alternativas, com os mesmos graus e as mesmas justificativas, mudam de
 * lugar entre si. O conteúdo é idêntico antes e depois.
 *
 * A rotação é escolhida de forma determinística, varrendo as decisões na
 * ordem do arquivo e mandando cada melhor escolha para a posição que estiver
 * mais vazia até ali. Determinístico importa: rodar duas vezes dá o mesmo
 * arquivo, e o diff de uma alteração futura não vem poluído de ruído.
 */
const fs = require("fs");
const path = require("path");

const arq = path.join(__dirname, "..", "src", "dados", "arvores.part.js");
const original = fs.readFileSync(arq, "utf8");
const linhas = original.split("\n");

// Uma decisão, no arquivo, é sempre um "alts: [" seguido de exatamente
// quatro linhas "{ t: ... grau: N ... }," e um "]," de fechamento.
const RE_ALT = /^\s*\{ t: .*grau: (\d).*\},\s*$/;

const blocos = [];
for (let i = 0; i < linhas.length; i++) {
  if (!/^\s*alts: \[\s*$/.test(linhas[i])) continue;
  const corpo = linhas.slice(i + 1, i + 5);
  if (corpo.length !== 4 || !corpo.every((l) => RE_ALT.test(l))) continue;
  if (!/^\s*\],\s*$/.test(linhas[i + 5] || "")) continue;
  blocos.push({ ini: i + 1, corpo });
}

if (!blocos.length) { console.error("não encontrei nenhuma decisão no formato esperado."); process.exit(1); }

const grauDe = (l) => Number(l.match(RE_ALT)[1]);
const posAntes = [0, 0, 0, 0];
blocos.forEach((b) => posAntes[b.corpo.findIndex((l) => grauDe(l) === 3)]++);

// Distribui: para cada decisão, manda a melhor escolha para a posição menos
// usada até agora. Empate resolve pela menor posição, o que mantém o
// resultado estável entre execuções.
const contagem = [0, 0, 0, 0];
let mexidas = 0;
blocos.forEach((b) => {
  const atual = b.corpo.findIndex((l) => grauDe(l) === 3);
  let alvo = 0;
  for (let p = 1; p < 4; p++) if (contagem[p] < contagem[alvo]) alvo = p;
  contagem[alvo]++;
  if (atual === alvo) { b.novo = b.corpo; return; }
  // rotação pura: o elemento na posição `atual` vai para `alvo` e os demais
  // acompanham, preservando a ordem circular original.
  const giro = (alvo - atual + 4) % 4;
  b.novo = b.corpo.map((_, k) => b.corpo[(k - giro + 4) % 4]);
  mexidas++;
});

// A indentação pertence à posição na lista, não à alternativa: as linhas do
// arquivo têm todas o mesmo recuo, então reaproveitamos o recuo de destino.
const recuo = (l) => l.match(/^\s*/)[0];
const saida = [...linhas];
blocos.forEach((b) => {
  b.novo.forEach((l, k) => {
    saida[b.ini + k] = recuo(b.corpo[k]) + l.trim();
  });
});

const posDepois = [0, 0, 0, 0];
blocos.forEach((b) => posDepois[b.novo.findIndex((l) => grauDe(l) === 3)]++);

console.log(`\n${blocos.length} decisões encontradas`);
console.log(`  posição da melhor escolha ANTES:  ${posAntes.join(" / ")}`);
console.log(`  posição da melhor escolha DEPOIS: ${posDepois.join(" / ")}`);
console.log(`  ${mexidas} decisões rotacionadas (conteúdo idêntico, ordem diferente)`);

// Prova de que a rotação não perdeu nada: o multiconjunto de linhas de
// alternativa tem de ser exatamente o mesmo antes e depois.
const todas = (arr) => arr.filter((l) => RE_ALT.test(l)).map((l) => l.trim()).sort().join("\n");
if (todas(linhas) !== todas(saida)) {
  console.error("\nABORTADO: o conjunto de alternativas mudou. Isso é bug do script, não do conteúdo.");
  process.exit(1);
}
console.log("  ok  o conjunto de alternativas é idêntico ao original");

if (process.argv.includes("--conferir")) { console.log("\nNada gravado (--conferir).\n"); process.exit(0); }
fs.writeFileSync(arq, saida.join("\n"));
console.log("\nGravado. Rode: node build.js && node scripts/verificar.js\n");
