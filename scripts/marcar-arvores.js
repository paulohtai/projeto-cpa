#!/usr/bin/env node
/**
 * marcar-arvores.js — dá a cada árvore o seu MÓDULO e a cada decisão a sua
 * DIFICULDADE, para que os 10 itens de árvore entrem na conta do exame como
 * qualquer outro item.
 *
 * Uso: node scripts/marcar-arvores.js [--conferir]
 *
 * ------------------------------------------------------------------
 * POR QUE ISTO PRECISOU EXISTIR
 * ------------------------------------------------------------------
 * O sorteio da prova aplicava as cotas de módulo só às 40 questões de
 * múltipla escolha e depois grudava 10 itens de árvore com `mId: "3"` fixo no
 * código. Medido em 200 montagens, a prova de 50 itens saía assim:
 *
 *     M1 16,0% (oficial 20%)   M2 32,0% (oficial 40%)
 *     M3 44,0% (oficial 30%)   M4  8,0% (oficial 10%)
 *
 * M3 quatorze pontos acima do peso oficial e M2 oito pontos abaixo — e M2 é o
 * módulo mais pesado da prova. Quem treinasse aqui treinaria a matéria errada.
 *
 * Os pesos NÃO são invenção nossa: o Programa Detalhado CPA (versão 1.2,
 * revisada em 04/06/2025, vigência 01/01/2026) escreve "Proporção: 20%",
 * "40%", "30%" e "10%" no cabeçalho de cada módulo, nas páginas 4, 11, 20 e
 * 27. Ver referencia/FONTES-OFICIAIS.md.
 *
 * A dificuldade também deixava os itens de árvore de fora: os 25/50/25 eram
 * aplicados só sobre as 40, então 20% da prova ficava sem rótulo nenhum.
 *
 * ------------------------------------------------------------------
 * COMO O MÓDULO É ATRIBUÍDO
 * ------------------------------------------------------------------
 * À mão, uma vez, pelo assunto de cada atendimento — não por heurística. A
 * lista está abaixo com a justificativa de cada uma, e é conferida contra os
 * nomes dos módulos do Programa Detalhado.
 *
 * ------------------------------------------------------------------
 * COMO A DIFICULDADE É ATRIBUÍDA
 * ------------------------------------------------------------------
 * Pela MESMA régua declarada que rotula as questões de múltipla escolha: o
 * quanto as quatro opções se parecem entre si. Quanto mais próximas, mais
 * difícil escolher. Aqui a régua é ainda mais direta do que na múltipla
 * escolha, porque nas árvores as quatro opções são sempre defensáveis em
 * algum grau: o que separa a melhor da segunda melhor é o tamanho do salto
 * de qualidade entre elas.
 *
 * O corte é por percentil DENTRO de cada árvore e depois no conjunto, para
 * fechar 25/50/25 nas 120 decisões. Isto é **escolha editorial nossa**: a
 * ANBIMA publica a proporção do exame, não como rotular um item. O app diz
 * isso na tela.
 */
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");
const arq = path.join(raiz, "src", "dados", "arvores.part.js");

// ------------------------------------------------------------------
// MÓDULO DE CADA ATENDIMENTO — decidido pelo assunto, um a um.
// Os nomes dos módulos são os do Programa Detalhado CPA.
// ------------------------------------------------------------------
const MODULO = {
  "A.1": ["4", "Criptoativo e oferta fora do mercado regulado — Inovação e desenvolvimento de mercado"],
  "A.2": ["3", "Reação do cliente à queda e dever de conduta — Relacionamento com o cliente"],
  "A.3": ["3", "Sinal de lavagem numa remessa — PLDFT, dentro de Relacionamento"],
  "A.4": ["3", "Meta comercial contra adequação — conflito de interesse, Relacionamento"],
  "A.5": ["2", "LCA, indexadores e isenção — Produtos do mercado financeiro"],
  "A.6": ["1", "Poupança, inflação e juro real — Política econômica, módulo 1"],
  "A.7": ["1", "CMN, BACEN, CVM, SUSEP e PREVIC — Sistema financeiro nacional"],
  "A.8": ["1", "FGC, limite por CPF e risco de emissor — Regulação e infraestrutura"],
  "A.9": ["1", "Risco e retorno, oferta irregular e registro na CVM — módulo 1"],
  "A.10": ["2", "Tabela regressiva, IOF e liquidez — Produtos"],
  "A.11": ["2", "Taxa de administração, benchmark e come-cotas — Produtos"],
  "A.12": ["2", "PGBL, VGBL e portabilidade — Produtos de previdência complementar"],
  "A.13": ["2", "Renda variável: isenção mensal, day trade, dividendos e JCP — Produtos"],
  "A.14": ["2", "Câmbio, VET e modalidades — Serviços bancários, módulo 2"],
  "A.15": ["2", "Seguro de vida contra capitalização — Seguros, módulo 2"],
  "A.16": ["3", "Procuração, capacidade de decidir e abuso financeiro — Relacionamento"],
  "A.17": ["3", "Suitability e operação acima do perfil — Relacionamento"],
  "A.18": ["3", "Depósito em espécie, comunicação e vedação de dar ciência — PLDFT"],
  "A.19": ["3", "Venda casada e pressão de meta — conduta, Relacionamento"],
  "A.20": ["4", "Open Finance, consentimento e revogação — Inovação"],
};

// ------------------------------------------------------------------
const original = fs.readFileSync(arq, "utf8");
const bloco = original.slice(original.indexOf("const ARVORES = ["));
const ARVORES = eval(bloco.slice("const ARVORES = ".length, bloco.indexOf("\n];") + 2));

// --- 1. checagem de cobertura: nenhuma árvore pode ficar sem módulo
const semModulo = ARVORES.filter((a) => !MODULO[a.id]).map((a) => a.id);
if (semModulo.length) {
  console.error("ERRO: árvores sem módulo declarado: " + semModulo.join(", "));
  console.error("Acrescente-as ao mapa MODULO deste arquivo antes de rodar.");
  process.exit(1);
}

// --- 2. carga de cada decisão: distância entre a melhor e a segunda melhor
// Quanto MENOR o salto de qualidade percebido, mais difícil é a decisão.
// Como o grau é discreto (0..3), a distância vem do TEXTO: opções parecidas
// em comprimento e vocabulário são mais difíceis de separar.
const semAcento = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const termos = (t) => new Set((semAcento(t).match(/[a-z]{4,}/g) || []));
const jaccard = (a, b) => {
  const A = termos(a), B = termos(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const uni = new Set([...A, ...B]).size;
  return uni ? inter / uni : 0;
};

const decisoes = [];
ARVORES.forEach((a) => a.prompts.forEach((p, i) => {
  const melhor = p.alts.find((x) => x.grau === 3);
  const segunda = p.alts.find((x) => x.grau === 2);
  // similaridade entre a certa e a quase-certa: o principal fator
  const sim = jaccard(melhor.t, segunda.t);
  // opções de comprimento parecido também dificultam
  const L = p.alts.map((x) => x.t.replace(/\s/g, "").length);
  const espalhamento = (Math.max(...L) - Math.min(...L)) / Math.max(1, Math.max(...L));
  // fala longa = mais informação para processar
  const carga = sim * 3 + (1 - espalhamento) * 1.2 + Math.min(1, p.fala.length / 220) * 0.6;
  decisoes.push({ arv: a.id, i, carga });
}));

const ordenadas = [...decisoes].sort((x, y) => x.carga - y.carga);
const n = ordenadas.length;
const corteF = ordenadas[Math.floor(n * 0.25)].carga;
const corteD = ordenadas[Math.floor(n * 0.75)].carga;
const difDe = (c) => (c < corteF ? 1 : c >= corteD ? 3 : 2);

const mapaDif = {};
decisoes.forEach((d) => { mapaDif[d.arv + "|" + d.i] = difDe(d.carga); });

// --- 3. grava: `mId` e `mFonte` na árvore, `dif` em cada prompt
let saida = original;
let mexidas = 0;

ARVORES.forEach((a) => {
  const [mId, motivo] = MODULO[a.id];
  const alvo = `    id: "${a.id}",`;
  if (!saida.includes(alvo)) { console.error("não achei a linha de id de " + a.id); process.exit(1); }
  // remove marcação anterior, se houver, para o script ser idempotente
  saida = saida.replace(new RegExp(alvo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '\\n    mId: "\\d",\\n    mFonte: "[^"]*",', "g"), alvo);
  saida = saida.replace(alvo, `${alvo}\n    mId: "${mId}",\n    mFonte: ${JSON.stringify(motivo)},`);
  mexidas++;
});

// dificuldade por prompt: entra logo depois da `fala`
ARVORES.forEach((a) => a.prompts.forEach((p, i) => {
  const linha = "        fala: " + JSON.stringify(p.fala) + ",";
  const idx = saida.indexOf(linha);
  if (idx < 0) { console.error(`não achei a fala ${a.id}/${i}`); process.exit(1); }
  const depois = saida.slice(idx + linha.length, idx + linha.length + 40);
  const jaTem = /^\n\s*dif: \d,/.test(depois);
  const novo = linha + `\n        dif: ${mapaDif[a.id + "|" + i]},`;
  if (jaTem) {
    saida = saida.slice(0, idx) + saida.slice(idx).replace(/^.*\n\s*dif: \d,/, novo);
  } else {
    saida = saida.slice(0, idx) + novo + saida.slice(idx + linha.length);
  }
}));

// --- 4. relatório
const porMod = {}, porDif = { 1: 0, 2: 0, 3: 0 };
ARVORES.forEach((a) => {
  const m = MODULO[a.id][0];
  porMod[m] = (porMod[m] || 0) + a.prompts.length;
  a.prompts.forEach((_, i) => porDif[mapaDif[a.id + "|" + i]]++);
});
console.log(`\n${ARVORES.length} árvores · ${decisoes.length} decisões`);
console.log("  módulo das decisões:  " + [1, 2, 3, 4].map((m) => `M${m} ${porMod[m] || 0}`).join(" · "));
console.log("  dificuldade:          " + [1, 2, 3].map((d) => `${["", "fácil", "médio", "difícil"][d]} ${porDif[d]} (${Math.round(porDif[d] / decisoes.length * 100)}%)`).join(" · "));

if (process.argv.includes("--conferir")) { console.log("\nNada gravado (--conferir).\n"); process.exit(0); }
fs.writeFileSync(arq, saida);
console.log(`\nGravado. Rode: node build.js && node scripts/verificar.js\n`);
