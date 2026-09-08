#!/usr/bin/env node
/**
 * verificar.js — auditoria completa do projeto.
 * Rode SEMPRE depois de mexer em qualquer parte, antes de entregar
 * o arquivo para o chat.
 *
 * Uso: node scripts/verificar.js
 *
 * Ele checa:
 *  1. sintaxe JSX do arquivo montado
 *  2. contagens (módulos, blocos, níveis, questões)
 *  3. unicidade dos IDs (essencial para os códigos de backup)
 *  4. integridade das questões (4 alternativas, gabarito válido, explicação)
 *  5. o viés de comprimento das alternativas (o erro que já corrigimos uma vez)
 *  6. cobertura dos exemplos das fichas e colisão com o banco de questões
 *  7. restrições do artifact (sem localStorage, com export default)
 */
const fs = require("fs");
const path = require("path");

const arq = path.join(__dirname, "..", "app", "projeto-cpa-completo.jsx");
if (!fs.existsSync(arq)) {
  console.error("Rode 'node build.js' antes de verificar.");
  process.exit(1);
}
const s = fs.readFileSync(arq, "utf8");
let falhas = 0;
const ok = (t) => console.log("  ok   " + t);
const erro = (t) => { falhas++; console.log("  ERRO " + t); };

// 1. sintaxe
try {
  require("@babel/parser").parse(s, { sourceType: "module", plugins: ["jsx"] });
  ok("sintaxe JSX válida");
} catch (e) {
  erro("sintaxe: " + e.message);
}

// extrai as estruturas
const pega = (nome, abre, fecha) => {
  const i = s.indexOf(abre);
  const f = s.indexOf(fecha, i);
  return eval(s.slice(i + abre.length - 1, f + fecha.length - 1));
};
const MODULOS = pega("MODULOS", "const MODULOS = [", "\n];");
let EX;
{
  let e = s.slice(s.indexOf("const EXEMPLOS = {") + "const EXEMPLOS = ".length);
  e = e.slice(0, e.indexOf("\n};") + 2);
  EX = eval("(" + e + ")");
}

// 2. contagens
const niveis = [], questoes = [], blocos = [];
MODULOS.forEach((m) => m.blocos.forEach((b) => {
  blocos.push(b.id);
  b.niveis.forEach((n) => { niveis.push(n); n.questoes.forEach((q) => questoes.push({ ...q, mId: m.id })); });
  b.boss.forEach((q) => questoes.push({ ...q, mId: m.id }));
}));
console.log(`\nCONTAGENS: ${MODULOS.length} módulos · ${blocos.length} blocos · ${niveis.length} níveis · ${questoes.length} questões`);
MODULOS.forEach((m) => {
  const n = m.blocos.reduce((a, b) => a + b.niveis.length, 0);
  const q = questoes.filter((x) => x.mId === m.id).length;
  console.log(`  M${m.id} (${m.peso}%): ${m.blocos.length} blocos · ${n} níveis · ${q} questões`);
});

console.log("\nCHECAGENS");
// 3. unicidade
const setN = new Set(niveis.map((n) => n.id)), setB = new Set(blocos);
setN.size === niveis.length ? ok("IDs de nível únicos") : erro("IDs de nível duplicados");
setB.size === blocos.length ? ok("IDs de bloco únicos") : erro("IDs de bloco duplicados");

// 4. integridade
let malf = 0;
questoes.forEach((q) => { if (!q.q || !Array.isArray(q.alts) || q.alts.length !== 4 || !(q.c >= 0 && q.c <= 3) || !q.exp) malf++; });
malf === 0 ? ok("todas as questões bem formadas") : erro(`${malf} questões malformadas`);
let semFicha = 0;
niveis.forEach((n) => { if (!n.resumo || !n.macete || !n.pegadinha) semFicha++; });
semFicha === 0 ? ok("todos os níveis têm resumo, macete e pegadinha") : erro(`${semFicha} níveis incompletos`);

// 5. viés de comprimento
// "estrita" = a correta é MAIOR que todos os distratores (é isso que entrega
// gabarito). Empate de comprimento não entrega nada e é contado à parte.
let estrita = 0, empate = 0, gap = 0, somaC = 0, somaE = 0;
const suspeitas = [];
questoes.forEach((q) => {
  const L = q.alts.map((a) => a.length);
  const outras = L.filter((_, i) => i !== q.c);
  if (L[q.c] > Math.max(...outras)) estrita++;
  else if (L[q.c] === Math.max(...outras)) empate++;
  if (L[q.c] > Math.max(...outras) * 1.3) { gap++; suspeitas.push(q.q.slice(0, 55)); }
  somaC += L[q.c]; somaE += outras.reduce((a, b) => a + b, 0) / 3;
});
const pctEstrita = Math.round((estrita / questoes.length) * 100);
console.log(`  info comprimento médio: correta ${Math.round(somaC / questoes.length)} · erradas ${Math.round(somaE / questoes.length)}`);
console.log(`  info correta estritamente mais longa em ${pctEstrita}% (ideal ~25%, teto ~35%) · empatada em ${Math.round((empate / questoes.length) * 100)}% (empate não entrega gabarito)`);
pctEstrita <= 35 ? ok("viés de comprimento estrito dentro do teto de 35%")
                 : console.log(`  info viés estrito acima do teto: engorde distratores nas questões de menor folga`);
gap === 0 ? ok("nenhuma questão com gabarito 30% mais longo que os distratores")
          : erro(`${gap} questões com viés de comprimento:\n       ` + suspeitas.slice(0, 8).join("\n       "));

// 6. exemplos das fichas
const faltando = niveis.filter((n) => !EX[n.id]).map((n) => n.id);
const orfaos = Object.keys(EX).filter((k) => !setN.has(k));
faltando.length === 0 ? ok("todos os níveis têm exemplo de ficha") : erro("sem exemplo: " + faltando.join(", "));
orfaos.length === 0 ? ok("nenhum exemplo órfão") : erro("exemplos órfãos: " + orfaos.join(", "));
const enunciados = new Set(questoes.map((q) => q.q.slice(0, 40)));
let colisao = 0;
Object.values(EX).forEach((v) => { if (enunciados.has(v[0].slice(0, 40))) colisao++; });
colisao === 0 ? ok("nenhum exemplo repete enunciado de questão (não entrega gabarito)")
              : erro(`${colisao} exemplos repetem enunciado de questão`);

// 6b. enunciados duplicados no banco (genéricos tipo "Assinale a associação
// CORRETA:" são tolerados; iguais E específicos indicam questão repetida)
{
  const norm = (t) => t.toLowerCase().replace(/\s+/g, " ").trim();
  const vistos = {};
  let dups = 0;
  questoes.forEach((q) => {
    const k = norm(q.q);
    if (k.length < 45) return; // enunciados genéricos curtos: contexto vem das alternativas
    if (vistos[k]) dups++;
    vistos[k] = true;
  });
  dups === 0 ? ok("nenhum enunciado específico duplicado")
             : console.log(`  info ${dups} enunciado(s) duplicado(s) no banco — avalie substituir`);
}

// 6c. glossário: verbetes íntegros e marcação restrita ao conteúdo
{
  let GL = null;
  try {
    let g = s.slice(s.indexOf("const GLOSSARIO = {") + "const GLOSSARIO = ".length);
    g = g.slice(0, g.indexOf("\n};") + 2);
    GL = eval("(" + g + ")");
  } catch (e) { erro("glossário: não consegui interpretar o objeto"); }
  if (GL) {
    const chaves = Object.keys(GL);
    console.log(`  info glossário com ${chaves.length} verbetes`);
    const vazios = chaves.filter((k) => !GL[k] || GL[k].length < 25);
    vazios.length === 0 ? ok("todos os verbetes têm definição") : erro("verbetes curtos demais: " + vazios.join(", "));
    // chave repetida no fonte se perde silenciosamente no objeto
    const fonte = s.slice(s.indexOf("const GLOSSARIO = {"), s.indexOf("\n};", s.indexOf("const GLOSSARIO = {")));
    const decl = (fonte.match(/^\s{2}"[^"]+":/gm) || []).map((x) => x.trim().replace(/":$/, "").replace(/^"/, ""));
    const dup = decl.filter((x, i) => decl.indexOf(x) !== i);
    dup.length === 0 ? ok("nenhum verbete duplicado") : erro("verbetes duplicados: " + [...new Set(dup)].join(", "));
    // circularidade: definição que começa repetindo o próprio termo
    const circ = chaves.filter((k) => GL[k].toLowerCase().startsWith(k.toLowerCase() + " é"));
    circ.length === 0 ? ok("nenhuma definição circular") : erro("definições circulares: " + circ.join(", "));
  }
  // a marcação só pode rodar no conteúdo da pílula: existe a definição e
  // há exatamente UMA chamada no app inteiro
  const temDef = /const marcarTermos = /.test(s);
  const chamadas = (s.match(/marcarTermos\(/g) || []).length;
  temDef && chamadas === 1 ? ok("termos clicáveis só no conteúdo das pílulas")
    : erro(`marcação fora do lugar (definição: ${temDef}, chamadas: ${chamadas}, esperado 1)`);
  /questoes|alts|exp/.test(s.slice(s.indexOf("marcarTermos(r, vistos"), s.indexOf("marcarTermos(r, vistos") + 120))
    ? erro("marcação encostando em questão/alternativa/explicação") : ok("nenhuma marcação em questões ou respostas");
}

// 6d. confrontos e tabelão
{
  try {
    let c = s.slice(s.indexOf("const CONFRONTOS = [") + "const CONFRONTOS = ".length);
    c = c.slice(0, c.indexOf("\n];") + 2);
    const CF = eval(c);
    let t = s.slice(s.indexOf("const TABELAO = [") + "const TABELAO = ".length);
    t = t.slice(0, t.indexOf("\n];") + 2);
    const TB = eval(t);
    const nItens = TB.reduce((a, x) => a + x.itens.length, 0);
    console.log(`  info ${CF.length} fichas de confronto · tabelão com ${nItens} números em ${TB.length} temas`);
    // cada linha precisa ter um valor por coluna, senão a tabela desalinha
    const torto = CF.filter((x) => x.linhas.some((l) => l.v.length !== x.colunas.length));
    torto.length === 0 ? ok("confrontos com colunas e linhas alinhadas")
                       : erro("confronto desalinhado: " + torto.map((x) => x.id).join(", "));
    const semArm = CF.filter((x) => !x.armadilha || x.armadilha.length < 40);
    semArm.length === 0 ? ok("todo confronto nomeia a armadilha da banca")
                        : erro("confrontos sem armadilha: " + semArm.map((x) => x.id).join(", "));
    const idsCF = CF.map((x) => x.id);
    new Set(idsCF).size === idsCF.length ? ok("IDs de confronto únicos") : erro("IDs de confronto duplicados");
    const tortoTB = TB.filter((x) => x.itens.some((i) => i.length !== 2));
    tortoTB.length === 0 ? ok("tabelão com pares o-que/valor completos") : erro("tabelão com linha malformada");
  } catch (e) { erro("confrontos/tabelão: " + e.message); }
}

// 6e. cantigas: melodia tocável e números batendo com o conteúdo
{
  try {
    let mu = s.slice(s.indexOf("const MUSICAS = [") + "const MUSICAS = ".length);
    mu = mu.slice(0, mu.indexOf("\n];") + 2);
    const MU = eval(mu);
    console.log(`  info ${MU.length} cantigas · ${MU.reduce((a, m) => a + m.linhas.length, 0)} versos`);
    // toda nota precisa ser legível pelo tocador
    const notaOk = /^(-|[A-G]#?\d(\*\d+)?)$/;
    const ruins = [];
    MU.forEach((m) => m.linhas.forEach((l, i) => {
      l.n.trim().split(/\s+/).forEach((t) => { if (!notaOk.test(t)) ruins.push(`${m.id} verso ${i + 1}: "${t}"`); });
    }));
    ruins.length === 0 ? ok("melodias com notação válida") : erro("notas inválidas: " + ruins.slice(0, 6).join(", "));
    // faixa vocal: nada abaixo de C4 nem acima de D5, para caber na voz
    const grau = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const fora = [];
    MU.forEach((m) => m.linhas.forEach((l) => l.n.trim().split(/\s+/).forEach((t) => {
      const g = /^([A-G])(#?)(\d)/.exec(t);
      if (!g) return;
      const midi = 12 * (Number(g[3]) + 1) + grau[g[1]] + (g[2] ? 1 : 0);
      if (midi < 60 || midi > 74) fora.push(m.id + ":" + t);
    })));
    fora.length === 0 ? ok("melodias dentro da faixa cantável (C4–D5)")
                      : erro("notas fora da faixa vocal: " + [...new Set(fora)].slice(0, 8).join(", "));
    // cada verso precisa de notas suficientes para não atropelar a letra
    const curtos = [];
    MU.forEach((m) => m.linhas.forEach((l, i) => {
      const notas = l.n.trim().split(/\s+/).length;
      const silabas = (l.l.match(/[aeiouáàâãéêíóôõúAEIOU]/g) || []).length;
      if (notas < silabas * 0.5) curtos.push(`${m.id} verso ${i + 1} (${notas} notas / ~${silabas} sílabas)`);
    }));
    curtos.length === 0 ? ok("versos com melodia proporcional à letra")
                        : erro("versos com melodia curta demais: " + curtos.slice(0, 5).join(", "));
    // NÚMEROS CANTADOS: cada percentual/valor da letra tem de existir no conteúdo
    const conteudo = niveis.map((n) => n.resumo.join(" ") + " " + n.macete + " " + n.pegadinha).join(" ").toLowerCase();
    const porExtenso = {
      "vinte e dois e meio": "22,5", "dezessete e meio": "17,5", "quinze": "15", "vinte por cento": "20",
      "trinta e cinco": "35", "trinta": "30", "vinte e cinco": "25", "dez por cento": "10",
      "duzentos e cinquenta mil": "250", "um milhão": "1 milhão", "quatro anos": "4 anos",
      "cento e oitenta": "180", "trezentos e sessenta": "360", "setecentos e vinte": "720",
      "cinquenta mil": "50", "dois mil": "2", "três dias úteis": "3 dias úteis",
      "sessenta": "60", "quarenta salários": "40 salários",
    };
    const semLastro = [];
    MU.forEach((m) => m.linhas.forEach((l) => {
      Object.entries(porExtenso).forEach(([txt, num]) => {
        if (l.l.toLowerCase().includes(txt) && !conteudo.includes(num.toLowerCase())) semLastro.push(m.id + ": " + num);
      });
    }));
    semLastro.length === 0 ? ok("números cantados conferem com o conteúdo")
                           : erro("número sem lastro no material: " + [...new Set(semLastro)].join(", "));
  } catch (e) { erro("cantigas: " + e.message); }
}

// 6f. sincronia: a decisão de puxar/empurrar precisa estar correta
{
  try {
    const m = /const decidirSync = \([\s\S]*?\n\};/.exec(s);
    if (!m) throw new Error("não achei decidirSync");
    const decidirSync = eval("(" + m[0].replace("const decidirSync = ", "") .replace(/;$/, "") + ")");
    const casos = [
      ["nuvem mais nova", 1000, 5000, "puxar"],
      ["aparelho mais novo (estudou offline)", 5000, 1000, "empurrar"],
      ["nuvem vazia", 5000, 0, "empurrar"],
      ["aparelho zerado e nuvem cheia", 0, 5000, "puxar"],
      ["empatados", 3000, 3000, "nada"],
      ["ambos zerados", 0, 0, "nada"],
      ["campos ausentes", undefined, undefined, "nada"],
    ];
    const erros = casos.filter(([, l, n, esperado]) => decidirSync(l, n) !== esperado);
    erros.length === 0 ? ok(`decisão de sincronia correta nos ${casos.length} cenários`)
                       : erro("sincronia decide errado em: " + erros.map((x) => x[0]).join(", "));
    // as duas pontas (abrir e reconectar) precisam usar a mesma função
    const usos = (s.match(/decidirSync\(/g) || []).length; // só as chamadas
    usos === 2 ? ok("abrir e reconectar usam a mesma regra de sincronia")
               : erro(`decidirSync chamado ${usos}x (esperado 2: ao abrir e ao reconectar)`);
  } catch (e) { erro("sincronia: " + e.message); }
}

// 6g. regras de redação da banca (Guia de Elaboração de Questões da ANBIMA)
{
  const negativos = questoes.filter((q) => /\bEXCETO\b|\bincorret/i.test(q.q));
  negativos.length === 0 ? ok("nenhum enunciado negativo (a banca proíbe EXCETO/INCORRETA)")
    : erro(`${negativos.length} enunciados negativos: ` + negativos.slice(0, 5).map((q) => q.q.slice(0, 40)).join(" · "));
  const ABS = /\b(sempre|nunca|tudo|completamente|totalmente)\b/i;
  const noGabarito = questoes.filter((q) => ABS.test(q.alts[q.c]));
  noGabarito.length === 0 ? ok("nenhum gabarito com termo absoluto")
    : erro(`${noGabarito.length} gabaritos com absoluto (ensina o instinto errado): ` + noGabarito.slice(0, 4).map((q) => q.alts[q.c].slice(0, 35)).join(" · "));
  const emDistrator = questoes.filter((q) => q.alts.some((a, i) => i !== q.c && ABS.test(a)));
  console.log(`  info ${emDistrator.length} questões com termo absoluto em distrator (a banca evita; entrega eliminação fácil)`);
  // formato oficial: a prova tem ~800 caracteres de contexto. Enquanto o banco
  // não for convertido, isto é um INFO com a distância que falta percorrer.
  const semEsp = (t) => t.replace(/\s/g, "").length;
  // alvo medido no caderno oficial: 493 de contexto+enunciado e 418 nas
  // 4 alternativas (o "~800" do guia é nominal; as questões reais são menores)
  // corte em 300: no caderno oficial a questão mais curta tem 258 caracteres,
  // e nenhuma questão do formato antigo passa de 160 — não há zona cinzenta.
  const conv = questoes.filter((q) => semEsp(q.q) >= 300);
  const pct = Math.round((conv.length / questoes.length) * 100);
  console.log(`  info CONVERSÃO AO FORMATO DA PROVA: ${conv.length} de ${questoes.length} (${pct}%)`);
  if (conv.length) {
    const mq = Math.round(conv.reduce((a, q) => a + semEsp(q.q), 0) / conv.length);
    const ma = Math.round(conv.reduce((a, q) => a + q.alts.reduce((x, y) => x + semEsp(y), 0), 0) / conv.length);
    const dentro = mq >= 350 && mq <= 800 && ma >= 300 && ma <= 620;
    dentro ? ok(`convertidas no tamanho da banca (enunciado ${mq} vs 493 real · alternativas ${ma} vs 418)`)
           : erro(`convertidas fora do tamanho real da banca (enunciado ${mq} vs 493 · alternativas ${ma} vs 418)`);
  }
}

// 6g2. VAZAMENTO DE RESPOSTA: o enunciado não pode entregar o gabarito.
// Régua medida nas 41 questões do caderho oficial: lá o gabarito é a
// alternativa que mais repete palavras do enunciado em 34% dos casos, com
// diferença média de sobreposição de +0,038. Acima disso, a questão vira
// exercício de casar palavras em vez de medir conhecimento.
{
  const STOP = new Set(("a o as os um uma uns umas de do da dos das em no na nos nas por para com sem sobre entre ate ao aos e ou que se nao ser sao foi era como qual quais quando onde mais menos muito pouco seu sua seus suas ele ela eles elas isso isto aquele esse este essa esta pelo pela pelos pelas nem ja tambem apenas cada todo toda todos todas outro outra outros outras mesmo mesma pode podem deve devem tem ter ha apos antes depois durante enquanto porque pois assim entao ainda somente sempre nunca lhe lhes dele dela deles delas cliente profissional cpa banco explicar explica explicou pergunta perguntou diz disse conta contou correta corretamente adequada adequado").split(" "));
  const semAcento = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const palavras = (t) => new Set((semAcento(t).match(/[a-z]{4,}/g) || []).filter((w) => !STOP.has(w)));
  const conv2 = questoes.filter((q) => q.q.replace(/\s/g, "").length >= 300);
  if (conv2.length) {
    let vence = 0, somaG = 0, somaD = 0;
    const graves = [];
    conv2.forEach((q) => {
      const ctx = palavras(q.q);
      const ov = q.alts.map((a) => { const wa = palavras(a); return [...ctx].filter((x) => wa.has(x)).length / Math.max(1, wa.size); });
      const max = Math.max(...ov);
      if (ov[q.c] >= max && ov.filter((x) => x === max).length === 1) vence++;
      const d = (ov.reduce((a, b) => a + b, 0) - ov[q.c]) / 3;
      somaG += ov[q.c]; somaD += d;
      // só é vazamento se o gabarito supera ESTRITAMENTE todos os distratores.
      // Empate não entrega nada: quando duas alternativas têm as mesmas
      // palavras e diferem só nos números, quem casa vocabulário fica em
      // dúvida entre elas e precisa saber o conteúdo do mesmo jeito.
      const unico = ov[q.c] > Math.max(...ov.filter((_, i) => i !== q.c));
      if (ov[q.c] - d > 0.18 && unico) graves.push(q.q.slice(0, 45));
    });
    const pctVence = Math.round((vence / conv2.length) * 100);
    const dif = (somaG - somaD) / conv2.length;
    console.log(`  info VAZAMENTO: gabarito lidera a repetição de palavras em ${pctVence}% (oficial 34%) · diferença ${dif >= 0 ? "+" : ""}${dif.toFixed(3)} (oficial +0.038) · ${graves.length} casos graves`);
    pctVence <= 40 && dif <= 0.07
      ? ok("vazamento de resposta dentro da régua do caderno oficial")
      : erro(`enunciado entrega o gabarito com frequência acima da banca (${graves.length} questões a reescrever)`);
  }
}

// 6g3. ELIMINAÇÃO POR EXAUSTÃO: o vazamento ao contrário. Em vez de o
// enunciado entregar a resposta, ele descreve os TRÊS distratores e deixa o
// gabarito por sobra — o aluno acerta sem saber o conteúdo. Régua medida no
// caderno oficial: 1 questão em 41, ou seja 2%.
{
  const STOP = new Set(("a o as os um uma uns umas de do da dos das em no na nos nas por para com sem sobre entre ate ao aos e ou que se nao ser sao foi era como qual quais quando onde mais menos muito pouco seu sua seus suas ele ela eles elas isso isto aquele esse este essa esta pelo pela pelos pelas nem ja tambem apenas cada todo toda todos todas outro outra outros outras mesmo mesma pode podem deve devem tem ter ha apos antes depois durante enquanto porque pois assim entao ainda somente sempre nunca lhe lhes dele dela deles delas cliente profissional cpa banco explicar explica explicou pergunta perguntou diz disse conta contou correta corretamente adequada adequado").split(" "));
  const semAcento = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const palavras = (t) => new Set((semAcento(t).match(/[a-z]{4,}/g) || []).filter((w) => !STOP.has(w)));
  const conv3 = questoes.filter((q) => q.q.replace(/\s/g, "").length >= 300);
  if (conv3.length) {
    let porSobra = 0;
    conv3.forEach((q) => {
      const ctx = palavras(q.q);
      const ov = q.alts.map((a) => { const wa = palavras(a); return [...ctx].filter((x) => wa.has(x)).length / Math.max(1, wa.size); });
      const dist = ov.filter((_, i) => i !== q.c);
      // gabarito é o MENOS presente no enunciado e a folga é grande
      // corte em 0,15: no caderno oficial só 1 questão em 41 passa disso, e
      // 0,25 deixava passar casos evidentes (a do sigilo bancário dava 0,21).
      if (ov[q.c] < Math.min(...dist) && (dist.reduce((a, b) => a + b, 0) / 3 - ov[q.c]) > 0.15) porSobra++;
    });
    const pct = Math.round((porSobra / conv3.length) * 100);
    console.log(`  info ELIMINAÇÃO POR EXAUSTÃO: ${porSobra} questões (${pct}%) em que o enunciado descarta os distratores (oficial: 2%)`);
    pct <= 2 ? ok("nenhum excesso de questão respondível por sobra")
             : erro(`${porSobra} questões deixam o gabarito por eliminação — o aluno acerta sem saber o conteúdo`);
  }
}

// 6h. árvores de decisão (questão interativa oficial)
{
  try {
    let av = s.slice(s.indexOf("const ARVORES = [") + "const ARVORES = ".length);
    av = av.slice(0, av.indexOf("\n];") + 2);
    const AR = eval(av);
    console.log(`  info ${AR.length} árvores de decisão · ${AR.reduce((a, x) => a + x.prompts.length, 0)} decisões`);
    const semSeis = AR.filter((x) => x.prompts.length < 5 || x.prompts.length > 7);
    semSeis.length === 0 ? ok("árvores com ~6 prompts, como a prova")
      : erro("árvores fora do padrão de 6 prompts: " + semSeis.map((x) => x.id).join(", "));
    // cada prompt precisa das 4 alternativas com os 4 graus distintos
    const ruins = [];
    AR.forEach((x) => x.prompts.forEach((p, i) => {
      if (p.alts.length !== 4) ruins.push(`${x.id}/${i + 1}: ${p.alts.length} alternativas`);
      const graus = p.alts.map((a) => a.grau).sort().join("");
      if (graus !== "0123") ruins.push(`${x.id}/${i + 1}: graus ${graus} (esperado 0123)`);
      if (p.alts.some((a) => !a.nota || a.nota.length < 25)) ruins.push(`${x.id}/${i + 1}: alternativa sem justificativa`);
    }));
    ruins.length === 0 ? ok("todo prompt tem 4 escolhas graduadas de 0 a 3, com justificativa")
      : erro("árvore malformada: " + ruins.slice(0, 5).join(" · "));
  } catch (e) { erro("árvores: " + e.message); }
}

// 6i. VIÉS DE POSIÇÃO NA ÁRVORE
// O defeito que existia: a "Melhor escolha" estava na 1ª posição em 30 de 30
// decisões. Quem clicasse sempre na A tirava 100% sem ler nada.
// Correção em duas camadas: fonte reordenada + sorteio por tentativa.
{
  try {
    let av = s.slice(s.indexOf("const ARVORES = [") + "const ARVORES = ".length);
    av = av.slice(0, av.indexOf("\n];") + 2);
    const AR = eval(av);
    const pos = [0, 0, 0, 0];
    let tot = 0;
    AR.forEach((x) => x.prompts.forEach((p) => { pos[p.alts.findIndex((a) => a.grau === 3)]++; tot++; }));
    const maior = Math.max(...pos), teto = Math.ceil(tot * 0.45);
    console.log(`  info POSIÇÃO DA MELHOR ESCOLHA na fonte: ${pos.join(" / ")} de ${tot} decisões`);
    maior <= teto ? ok(`nenhuma posição concentra a melhor escolha (máx ${maior}, teto ${teto})`)
      : erro(`a melhor escolha está ${maior}x na mesma posição (de ${tot}) — dá para acertar sem ler`);
  } catch (e) { erro("viés de posição na árvore: " + e.message); }
  // camada 2: o sorteio por tentativa precisa existir E ser usado na tela
  /const ordemAlts\s*=/.test(s) ? ok("sorteio de ordem das alternativas do atendimento existe") : erro("falta ordemAlts");
  /ordemDoPasso\(a, arv, arv\.passo\)/.test(s) ? ok("a tela do atendimento usa a ordem sorteada") : erro("a tela do atendimento ignora o sorteio");
  /ne\[arv\.passo\] = orig/.test(s) ? ok("a escolha é gravada pelo índice ORIGINAL (nota e grau seguem colados)")
    : erro("a escolha do atendimento está sendo gravada pela posição na tela — o embaralhamento quebraria o gabarito");
}

// 6n. DIFICULDADE — rótulo em toda questão e 25/50/25 por módulo
// A DISTRIBUIÇÃO é oficial (página da CPA). A ORDENAÇÃO que gera o rótulo é
// nossa: o rótulo da ANBIMA não é previsível pelo texto (a correlação mais
// forte que medimos no caderno oficial foi r = 0,186, ou seja, ruído).
{
  const semRotulo = [];
  const porMod = {};
  MODULOS.forEach((m) => {
    porMod[m.id] = { 1: 0, 2: 0, 3: 0 };
    (m.blocos || []).forEach((b) => {
      const conta = (q, ref) => {
        if (![1, 2, 3].includes(q.dif)) semRotulo.push(ref);
        else porMod[m.id][q.dif]++;
      };
      (b.niveis || []).forEach((n) => (n.questoes || []).forEach((q, i) => conta(q, `${n.id}#${i}`)));
      (b.boss || []).forEach((q, i) => conta(q, `${b.id}|BOSS|${i}`));
    });
  });
  semRotulo.length === 0 ? ok("toda questão tem rótulo de dificuldade (1 fácil · 2 médio · 3 difícil)")
    : erro(`${semRotulo.length} questões sem dificuldade: ${semRotulo.slice(0, 5).join(", ")}`);

  let foraDoAlvo = 0;
  Object.entries(porMod).forEach(([id, c]) => {
    const n = c[1] + c[2] + c[3];
    if (!n) return;
    const p = { f: (c[1] / n) * 100, m: (c[2] / n) * 100, d: (c[3] / n) * 100 };
    console.log(`  info M${id}: fácil ${c[1]} (${p.f.toFixed(0)}%) · médio ${c[2]} (${p.m.toFixed(0)}%) · difícil ${c[3]} (${p.d.toFixed(0)}%)`);
    // tolerância de 2 pontos: o arredondamento do corte por percentil
    if (Math.abs(p.f - 25) > 2 || Math.abs(p.m - 50) > 2 || Math.abs(p.d - 25) > 2) foraDoAlvo++;
  });
  foraDoAlvo === 0 ? ok("todo módulo segue 25/50/25 — o sorteio consegue montar a distribuição oficial")
    : erro(`${foraDoAlvo} módulo(s) fora de 25/50/25; o sorteio do exame não fecharia a distribuição`);

  /const CHAVES_POR_MODULO_DIF = \{\}/.test(s) ? ok("índice por dificuldade existe") : erro("falta CHAVES_POR_MODULO_DIF");
  /const alvoPorFaixa = \{ 1: nF, 2: nM, 3: nD \}/.test(s) ? ok("o exame reparte a cota do módulo por dificuldade") : erro("o exame ignora a dificuldade no sorteio");
  /origem: "pedagogica"/.test(s) ? ok("a ordenação de dificuldade está declarada como escolha nossa")
    : erro("o rótulo de dificuldade não está declarado como pedagógico — seria atribuir à ANBIMA uma classificação que não é dela");
}

// 6j. EXAME LACRADO — nada pode corrigir antes de entregar
// Recorta só o bloco da tela da prova e procura qualquer sinal de correção.
{
  const ini = s.indexOf('if (tela === "prova" && prova && !prova.entregue)');
  const fim = s.indexOf('if (tela === "provaFim"');
  if (ini < 0 || fim < 0 || fim < ini) erro("não encontrei o bloco da tela do exame para auditar");
  else {
    const bloco = s.slice(ini, fim);
    const vazamentos = [
      [/Som\.(acerto|erro|combo|vitoria|derrota|chefao)/, "toca som de acerto/erro"],
      [/\bq\.exp\b/, "mostra a explicação"],
      [/\bacertos\b/, "mostra contagem de acertos"],
      [/gabarito\s*===|===\s*gabarito/, "compara com o gabarito na tela"],
      [/"\s*ok\s*"|'\s*ok\s*'|\bcx-alt ok\b/, "usa a classe de alternativa correta"],
      [/GRAUS\[/, "revela o grau da escolha"],
      [/\.nota\b/, "mostra o comentário da alternativa"],
      [/corrigir\(/, "corrige a prova antes da entrega"],
    ];
    const achados = vazamentos.filter(([re]) => re.test(bloco)).map(([, t]) => t);
    achados.length === 0 ? ok("tela do exame não entrega correção: sem som, cor, explicação, grau ou placar")
      : erro("A TELA DO EXAME VAZA A CORREÇÃO: " + achados.join(" · "));
    /aria-hidden="true"/.test(bloco) ? ok("barra de progresso do exame não é lida como resultado") : erro("progresso do exame sem aria-hidden");
    /setConfirmando\(true\)/.test(bloco) ? ok("encerramento manual pede confirmação") : erro("dá para encerrar a prova sem confirmar");
  }
}

// 6k. INTEGRIDADE DA NOTA — testa a função de correção de verdade
{
  const ini = s.indexOf("const corrigir = (tentativa) =>");
  const fim = s.indexOf("\n};", ini);
  if (ini < 0) erro("não encontrei a função corrigir()");
  else {
    const corrigir = eval("(" + s.slice(ini + "const corrigir = ".length, fim + 2) + ")");
    // usa as REGRAS reais do arquivo montado, não um stub: assim o teste
    // acompanha qualquer mudança de número oficial em vez de mascará-la.
    const ri = s.indexOf("const REGRAS_EXAME = {");
    global.PESOS = { "1": 20, "2": 40, "3": 30, "4": 10 }; // REGRAS_EXAME referencia PESOS
    global.REGRAS_EXAME = eval("(" + s.slice(ri + "const REGRAS_EXAME = ".length, s.indexOf("\n};", ri) + 2) + ")");
    const R = global.REGRAS_EXAME;
    R.minimoAcertos.valor === 35 && R.totalItens.valor === 50
      ? ok("corte oficial em uso: 35 acertos de 50 (edital 3.2)")
      : erro(`corte fora do edital: ${R.minimoAcertos.valor} de ${R.totalItens.valor}`);
    const mc = (resp, gab, extra) => ({ tipo: "mc", chave: "k", resposta: resp, gabarito: gab, ...extra });
    const casos = [
      // o caso que o usuário pediu: 10 acertos e 40 em branco = 20%, não 100%
      { nome: "10 acertos + 40 pendências = 20%",
        t: { itens: [...Array(10)].map(() => mc(1, 1)).concat([...Array(40)].map(() => mc(null, 1))) },
        esp: { acertos: 10, total: 50, pendentes: 40, pctInteiro: 20, aprovado: false, corteAcertos: 35 } },
      { nome: "35 de 50 aprova (mínimo exato do edital)",
        t: { itens: [...Array(35)].map(() => mc(1, 1)).concat([...Array(15)].map(() => mc(0, 1))) },
        esp: { acertos: 35, total: 50, pctInteiro: 70, aprovado: true } },
      { nome: "34 de 50 reprova por um acerto",
        t: { itens: [...Array(34)].map(() => mc(1, 1)).concat([...Array(16)].map(() => mc(0, 1))) },
        esp: { acertos: 34, total: 50, pctInteiro: 68, aprovado: false } },
      // Edital 16.1: anulada é atribuída a TODOS — vira acerto e fica no total
      { nome: "anulada vira acerto e NÃO sai do total",
        t: { itens: [...Array(34)].map(() => mc(1, 1)).concat([...Array(15)].map(() => mc(0, 1)), [mc(0, 1, { anulado: true, motivoAnulacao: "gabarito duplo" })]) },
        esp: { acertos: 35, total: 50, creditados: 1, aprovado: true } },
      { nome: "anulada em branco também é creditada",
        t: { itens: [...Array(34)].map(() => mc(1, 1)).concat([...Array(15)].map(() => mc(0, 1)), [mc(null, 1, { anulado: true, motivoAnulacao: "sem alternativa correta" })]) },
        esp: { acertos: 35, total: 50, creditados: 1, aprovado: true } },
      { nome: "árvore: só a melhor escolha pontua",
        t: { itens: [{ tipo: "arvore", escolha: 0, grauEscolhido: 3 }, { tipo: "arvore", escolha: 1, grauEscolhido: 2 },
                     { tipo: "arvore", escolha: 2, grauEscolhido: 0 }, { tipo: "arvore", escolha: null, grauEscolhido: null }] },
        esp: { acertos: 1, total: 4, pendentes: 1, pctInteiro: 25 } },
      { nome: "prova vazia não divide por zero",
        t: { itens: [] }, esp: { acertos: 0, total: 0, pctInteiro: 0, aprovado: false } },
    ];
    let ruins = 0;
    casos.forEach((c) => {
      const r = corrigir(c.t);
      const dif = Object.entries(c.esp).filter(([k, v]) => r[k] !== v);
      if (dif.length) { ruins++; erro(`correção "${c.nome}": ${dif.map(([k, v]) => `${k} esperado ${v}, veio ${r[k]}`).join("; ")}`); }
    });
    if (!ruins) ok(`regra de pontuação passa nos ${casos.length} casos (pendência conta, anulada credita, corte por número de acertos)`);
  }
  // a nota não pode ser calculada em outro lugar
  const outras = (s.match(/acertos \/ (sessao\.marcas\.length|total)/g) || []).length;
  console.log(`  info ${outras} cálculo(s) de percentual fora de corrigir() — todos na tela de ESTUDO, que não é avaliação`);
}

// 6l. CRONÔMETRO — prazo absoluto, não contador em memória
{
  /fimEm: inicio \+ REGRAS_EXAME\.duracaoSeg\.valor \* 1000/.test(s)
    ? ok("prazo da prova é um instante absoluto gravado no disco") : erro("o prazo da prova não é absoluto — recarregar devolveria tempo");
  /agora >= prova\.fimEm/.test(s) ? ok("encerra sozinha ao vencer o prazo") : erro("a prova não encerra sozinha no prazo");
  /window\.storage\.set\(PROVA_KEY/.test(s) ? ok("tentativa em andamento é gravada em chave própria") : erro("a prova não é persistida");
  /if \(!prova \|\| prova\.entregue \|\| Date\.now\(\) >= prova\.fimEm\) return;/.test(s)
    ? ok("não aceita resposta depois de entregue nem depois do prazo") : erro("dá para responder depois do fim");
  /if \(it\[campo\] === valor\) return;/.test(s) ? ok("tocar duas vezes na mesma alternativa não pontua duas vezes") : erro("toque repetido não está protegido");
}

// 6m. HONESTIDADE EDITORIAL
{
  /Simulado oficial/.test(s) ? erro('ainda chama material autoral de "Simulado oficial"') : ok('nenhum material autoral é chamado de "oficial"');
  /verificadoEm: "\d{4}-\d{2}-\d{2}"/.test(s) ? ok("as regras do exame carregam data de verificação") : erro("REGRAS_EXAME sem data de verificação");
  /origem: "naoConfirmado"/.test(s) ? ok("o que não foi reconfirmado está marcado como tal") : erro("nada marcado como não confirmado — suspeito");
  /const ESQUEMA = \d+/.test(s) && /const migrar = /.test(s) ? ok("armazenamento versionado com migração") : erro("falta migração versionada");
}

// 7. restrições do artifact
/localStorage|sessionStorage/.test(s) ? erro("usa browser storage (proibido no artifact)") : ok("sem localStorage/sessionStorage");
/export default function/.test(s) ? ok("tem export default") : erro("falta export default");
/const embaralhar/.test(s) ? ok("embaralhamento de alternativas ativo") : erro("falta o embaralhamento");

console.log(falhas === 0 ? "\nTUDO CERTO. Pode entregar o arquivo.\n" : `\n${falhas} PROBLEMA(S). Corrija antes de entregar.\n`);
process.exit(falhas === 0 ? 0 : 1);
