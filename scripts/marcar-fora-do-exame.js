#!/usr/bin/env node
/**
 * marcar-fora-do-exame.js — tira do sorteio do EXAME as questões cujo
 * gabarito depende de algo que não tem lastro em nenhuma das fontes.
 *
 * Uso: node scripts/marcar-fora-do-exame.js
 *
 * Por que marcar em vez de apagar: apagar esconde o problema e some com
 * conteúdo que talvez esteja certo. A questão continua no modo ESTUDO,
 * com um aviso visível, e fica fora da avaliação até alguém conferir
 * contra o Programa Detalhado. Avaliação não pode cobrar o que não dá
 * para justificar; estudo pode mostrar, desde que avise.
 *
 * Grava em cada questão afetada:
 *   foraDoExame: true
 *   motivoFora:  o texto que aparece na tela, explicando por quê
 */
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");

// Termos cujo gabarito depende deles e que não aparecem nem na apostila
// T2 2026 nem nos dois cadernos oficiais da ANBIMA que temos.
// Conferido por scripts/conferir-numeros.js.
const SEM_LASTRO = [
  { termo: "DAO",
    motivo: "Fora do sorteio do exame: “DAO” não aparece na apostila T2 2026 nem nos dois cadernos oficiais da ANBIMA que temos. O conceito pode estar no Programa Detalhado completo — que ainda não conferimos —, mas até lá não é honesto cobrá-lo numa avaliação. Continua aqui para estudo." },
];

const arquivos = [1, 2, 3, 4].map((i) => `src/dados/modulo-${i}.part.js`);
const mods = arquivos.map((f) => eval("[" + fs.readFileSync(path.join(raiz, f), "utf8") + "][0]"));

let marcadas = 0, desmarcadas = 0, total = 0;
const lista = [];
mods.forEach((m) => (m.blocos || []).forEach((b) => {
  const trata = (q, ref) => {
    total++;
    // o termo precisa estar no ENUNCIADO, no GABARITO ou na explicação:
    // nesses três lugares a questão depende dele para ser respondida.
    // Se aparece só como distrator, dá para acertar sem conhecer o termo.
    const decisivo = SEM_LASTRO.find((t) =>
      new RegExp("\\b" + t.termo + "\\b").test(
        (q.q || "") + " " + (q.alts[q.c] || "") + " " + (q.exp || "")));
    if (decisivo) {
      if (!q.foraDoExame) marcadas++;
      q.foraDoExame = true;
      q.motivoFora = decisivo.motivo;
      lista.push(`${ref} — ${decisivo.termo}`);
    } else if (q.foraDoExame) {
      delete q.foraDoExame; delete q.motivoFora; desmarcadas++;
    }
  };
  (b.niveis || []).forEach((n) => (n.questoes || []).forEach((q, i) => trata(q, `${n.id}#${i}`)));
  (b.boss || []).forEach((q, i) => trata(q, `${b.id}|BOSS|${i}`));
}));

console.log(`questões: ${total}`);
console.log(`fora do sorteio do exame: ${lista.length} (${((lista.length / total) * 100).toFixed(1)}%)`);
lista.forEach((x) => console.log("  " + x));
if (desmarcadas) console.log(`voltaram ao sorteio: ${desmarcadas}`);

mods.forEach((m, i) => {
  const txt = "  " + JSON.stringify(m, null, 2).split("\n").join("\n  ").trimEnd() + ",\n";
  fs.writeFileSync(path.join(raiz, arquivos[i]), txt);
});
console.log("gravado.");
