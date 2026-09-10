#!/usr/bin/env node
/**
 * equilibrar-tamanho-arvores.js — tira o tamanho da alternativa como pista da
 * melhor escolha nas árvores de decisão.
 *
 * Uso: node scripts/equilibrar-tamanho-arvores.js [--conferir]
 *
 * ------------------------------------------------------------------
 * O DEFEITO
 * ------------------------------------------------------------------
 * Em 10/09/2026 o Paulo fez um simulado e disse: "a resposta das novas
 * árvores sempre são as alternativas maiores". Medido no banco inteiro:
 *
 *     melhor escolha é a mais longa em 120 de 120 decisões — 100%
 *     tamanho médio: melhor 134 caracteres · outras três 54
 *
 * Os 10 itens de árvore de cada prova, um quinto da nota, saíam de graça
 * para quem clicasse sempre na maior. Pior que o simulado do concorrente que
 * nós mesmos medimos e criticamos por dar 66% a esse chute.
 *
 * ------------------------------------------------------------------
 * A CAUSA, QUE É DE ESCRITA E NÃO DE SORTEIO
 * ------------------------------------------------------------------
 * Eu escrevi a melhor escolha como "fala + justificativa + próximo passo",
 * e as outras três como frase curta. Isso é natural para quem redige: a
 * resposta certa é a que se quer explicar. E é errado, porque a alternativa
 * é uma FALA do profissional, não um comentário sobre ela.
 *
 * A justificativa já tem lugar próprio: o campo `nota`, que aparece depois
 * da escolha. Ela nunca deveria ter vazado para dentro do `t`.
 *
 * Regra adotada aqui: **toda alternativa é uma fala plausível de 70 a 110
 * caracteres**, e as quatro de uma mesma decisão ficam na mesma faixa. O
 * raciocínio fica no `nota`. Distrator curto demais também é defeito — ele
 * se elimina sozinho, sem o aluno precisar saber a matéria.
 *
 * ------------------------------------------------------------------
 * O QUE ESTE SCRIPT NÃO FAZ
 * ------------------------------------------------------------------
 * Não muda grau nenhum. A melhor escolha continua sendo a mesma alternativa,
 * dizendo a mesma coisa — só que no comprimento de uma fala. O `nota` de
 * cada uma fica intacto, e o portão em verificar.js passou a medir as
 * árvores com a mesma régua das 872 questões de múltipla escolha.
 */
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");
const arq = path.join(raiz, "src", "dados", "arvores.part.js");

// [arvId, passo, grau, textoNovo] — casa pelo grau dentro da decisão, que é
// único (o verificar.js já garante graus 0,1,2,3 distintos em cada prompt).
const TROCAS = require("./dados-arvores-tamanho.js");

const original = fs.readFileSync(arq, "utf8");
const bloco = original.slice(original.indexOf("const ARVORES = ["));
const ARVORES = eval(bloco.slice("const ARVORES = ".length, bloco.indexOf("\n];") + 2));

let saida = original;
let feitas = 0, jaOk = 0;
const problemas = [];

TROCAS.forEach(([id, passo, grau, novo]) => {
  const a = ARVORES.find((x) => x.id === id);
  if (!a) { problemas.push(`${id}: árvore não existe`); return; }
  const p = a.prompts[passo];
  if (!p) { problemas.push(`${id}/${passo}: decisão não existe`); return; }
  const alt = p.alts.find((x) => x.grau === grau);
  if (!alt) { problemas.push(`${id}/${passo}: não há alternativa de grau ${grau}`); return; }
  if (alt.t === novo) { jaOk++; return; }
  const de = JSON.stringify(alt.t);
  if (saida.split(de).length - 1 !== 1) {
    problemas.push(`${id}/${passo}/g${grau}: o texto antigo aparece ${saida.split(de).length - 1}x — «${alt.t.slice(0, 45)}…»`);
    return;
  }
  saida = saida.replace(de, JSON.stringify(novo));
  feitas++;
});

if (problemas.length) {
  console.error(`\nNADA FOI GRAVADO. ${problemas.length} problema(s):`);
  problemas.slice(0, 10).forEach((x) => console.error("  " + x));
  process.exit(1);
}

// relatório antes/depois, medido no próprio arquivo
const medir = (txt) => {
  const b = txt.slice(txt.indexOf("const ARVORES = ["));
  const AR = eval(b.slice("const ARVORES = ".length, b.indexOf("\n];") + 2));
  const len = (t) => String(t || "").replace(/\s/g, "").length;
  let mL = 0, mC = 0, n = 0, sg = 0, so = 0;
  AR.forEach((a) => a.prompts.forEach((p) => {
    const L = p.alts.map((x) => len(x.t));
    const i3 = p.alts.findIndex((x) => x.grau === 3);
    const mx = Math.max(...L), mn = Math.min(...L);
    if (L[i3] === mx) mL += 1 / L.filter((x) => x === mx).length;
    if (L[i3] === mn) mC += 1 / L.filter((x) => x === mn).length;
    sg += L[i3]; so += L.filter((_, k) => k !== i3).reduce((x, y) => x + y, 0) / 3; n++;
  }));
  return { pL: (mL / n) * 100, pC: (mC / n) * 100, g: sg / n, o: so / n, n };
};
const a0 = medir(original), a1 = medir(saida);
console.log(`\n${feitas} alternativas reescritas · ${jaOk} já estavam no formato`);
console.log(`  antes:  melhor é a mais longa em ${a0.pL.toFixed(0)}% · mais curta ${a0.pC.toFixed(0)}% · ${Math.round(a0.g)} vs ${Math.round(a0.o)} caracteres`);
console.log(`  depois: melhor é a mais longa em ${a1.pL.toFixed(0)}% · mais curta ${a1.pC.toFixed(0)}% · ${Math.round(a1.g)} vs ${Math.round(a1.o)} caracteres`);
console.log(`  (acaso 25% · faixa aceita 15% a 35%)`);

if (process.argv.includes("--conferir")) { console.log("\nNada gravado (--conferir).\n"); process.exit(0); }
fs.writeFileSync(arq, saida);
console.log("\nGravado. Rode: node build.js && node scripts/verificar.js\n");
