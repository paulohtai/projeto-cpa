#!/usr/bin/env node
/**
 * marcar-origem.js — grava, em cada NÍVEL, de onde o conteúdo veio e quando
 * foi conferido. O rastro passa a viver no dado, não só no README.
 *
 * Uso: node scripts/marcar-origem.js
 *
 * Campos gravados em cada nível:
 *   fonte      "apostila"  → apostila T2 Educação, edição 2026
 *              "pd"        → redigido a partir do Programa Detalhado da
 *                            ANBIMA, nos pontos que a apostila não cobre
 *                            (blocos R e S do Módulo 3 — a exceção declarada
 *                            na Regra Zero do README)
 *   auditadoEm data da última auditoria AUTOMÁTICA que este nível passou
 *              (estrutura, gabarito válido, viés, vazamento, absolutos)
 *   revisadoEm data da última revisão CONCEITUAL HUMANA contra fonte
 *              primária. Ausente = ainda não teve. Isto é de propósito:
 *              é a diferença entre "checado por script" e "conferido".
 *
 * A distinção entre auditadoEm e revisadoEm é o ponto do arquivo. Marcar
 * tudo como revisado seria mentir sobre o alcance da auditoria.
 */
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");

const HOJE = new Date().toISOString().slice(0, 10);

// Níveis com revisão conceitual humana feita contra fonte primária, com a
// data e a fonte. Só entra aqui o que foi de fato aberto e conferido.
const REVISADOS = {
  "2.1.3.3": { em: "2026-09-07", fonte: "Resolução CMN 5.215/2025 (prazo mínimo de LCI e LCA sem atualização por índice de preços)" },
  "2.3.1.1": { em: "2026-09-07", fonte: "Resolução CVM 43 e material da B3 sobre COE (proteção do nominal é obrigação do emissor; COE fora do FGC)" },
  "2.3":     { em: "2026-09-07", fonte: "idem COE — chefão do bloco revisado junto" },
  "1.1.1":   { em: "2026-09-07", fonte: "apostila T2 2026, fluxo circular da renda (retirada de termo absoluto do gabarito)" },
  "2.1.2":   { em: "2026-09-07", fonte: "Tesouro Direto — características da NTN-F (retirada de termo absoluto do gabarito)" },
  "2.5.1":   { em: "2026-09-08", fonte: "Lei 11.053/2004 e IN RFB — dedução de 12% da renda bruta no PGBL" },
  "2.5.5":   { em: "2026-09-08", fonte: "Lei 11.053/2004 — tabela regressiva da previdência, 10% acima de dez anos" },
  "2.1.3.2": { em: "2026-09-08", fonte: "Resolução CMN 4.222 e regulamento do FGC — teto de R$ 250 mil por CPF e conglomerado" },
  "2.4.10.1": { em: "2026-09-08", fonte: "IN RFB 1.585 — come-cotas de 15% em fundo de longo prazo e 20% em curto prazo" },
};

const arquivos = [1, 2, 3, 4].map((i) => `src/dados/modulo-${i}.part.js`);
const mods = arquivos.map((f) => eval("[" + fs.readFileSync(path.join(raiz, f), "utf8") + "][0]"));

let niveis = 0, deApostila = 0, doPD = 0, comRevisao = 0;
mods.forEach((m) => (m.blocos || []).forEach((b) => {
  // Blocos R (reforço técnico) e S (situacional) do M3 nasceram do Programa
  // Detalhado, porque a apostila não cobre esses pontos. Está no README.
  const doPrograma = /^[RS](\.|$)/.test(b.id) || /^[RS]\./.test(b.id);
  (b.niveis || []).forEach((n) => {
    niveis++;
    const daFonteDoPrograma = doPrograma || /^[RS]\./.test(n.id);
    n.fonte = daFonteDoPrograma ? "pd" : "apostila";
    daFonteDoPrograma ? doPD++ : deApostila++;
    n.auditadoEm = HOJE;
    const r = REVISADOS[n.id];
    if (r) { n.revisadoEm = r.em; n.revisadoFonte = r.fonte; comRevisao++; }
    else { delete n.revisadoEm; delete n.revisadoFonte; }
  });
}));

console.log(`níveis: ${niveis}`);
console.log(`  fonte apostila: ${deApostila} · fonte programa detalhado: ${doPD}`);
console.log(`  com revisão conceitual humana: ${comRevisao} (${Math.round((comRevisao / niveis) * 100)}%)`);
console.log(`  auditados automaticamente: ${niveis} (100%)`);

mods.forEach((m, i) => {
  const txt = "  " + JSON.stringify(m, null, 2).split("\n").join("\n  ").trimEnd() + ",\n";
  fs.writeFileSync(path.join(raiz, arquivos[i]), txt);
});
console.log("gravado.");
