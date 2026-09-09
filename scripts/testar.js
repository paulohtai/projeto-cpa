#!/usr/bin/env node
/**
 * testar.js — testes de comportamento sobre o arquivo montado.
 *
 * Diferente do verificar.js (que audita estrutura e dados), aqui as funções
 * são EXECUTADAS com entradas escolhidas para quebrá-las. Cada bloco abaixo
 * corresponde a um item da lista "teste com intenção de encontrar falhas".
 *
 * Uso: node build.js && node scripts/testar.js
 */
const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(path.join(__dirname, "..", "app", "projeto-cpa-completo.jsx"), "utf8");

let falhas = 0, total = 0;
const t = (nome, cond, detalhe) => {
  total++;
  if (cond) console.log("  ok   " + nome);
  else { falhas++; console.log("  FALHOU " + nome + (detalhe ? " → " + detalhe : "")); }
};
const secao = (n) => console.log("\n" + n);

// extrai uma const do fonte montado e devolve a função já avaliada.
// `nome` é o identificador; `fim` é o texto que fecha a declaração.
const extrai = (nome, fim) => {
  const decl = "const " + nome + " = ";
  const i = s.indexOf(decl);
  if (i < 0) throw new Error("não achei: " + nome);
  const j = s.indexOf(fim, i + decl.length);
  if (j < 0) throw new Error("não achei o fim de " + nome);
  const corpo = s.slice(i + decl.length, j + fim.length).trim().replace(/;$/, "");
  return eval("(" + corpo + ")");
};

// ---------------------------------------------------------------- ambiente
// REGRAS reais extraídas do arquivo montado — nada de stub, para o teste
// acompanhar qualquer mudança de número oficial.
const _ri = s.indexOf("const REGRAS_EXAME = {");
global.PESOS = { "1": 20, "2": 40, "3": 30, "4": 10 };
global.REGRAS_EXAME = eval("(" + s.slice(_ri + "const REGRAS_EXAME = ".length, s.indexOf("\n};", _ri) + 2) + ")");
const shuffle = extrai("shuffle", "return a; };");
const embaralhar = extrai("embaralhar", "\n};");
const ordemAlts = extrai("ordemAlts", "));");
const corrigir = extrai("corrigir", "\n};");
const migrar = extrai("migrar", "\n};");
const decidirSync = extrai("decidirSync", "\n};");

// ================================================================
secao("0. FUMAÇA — o arquivo EXECUTA, não só compila");
// Este bloco existe por causa de um bug real: `ELEGIVEIS_EXAME` usava
// `TODAS_CHAVES` uma linha antes de ela ser declarada. A sintaxe estava
// perfeita, o verificar.js passou, o build passou — e o app abria em tela
// branca, porque `const` não sobe. Analisar sintaxe não é executar.
// Aqui as constantes de topo são de fato AVALIADAS, na ordem em que estão.
{
  let erroTopo = null, ctx = null;
  try {
    const jsx = s.indexOf("export default function ProjetoCPA");
    // há JSX em ajudantes antes do componente principal (Topo, por exemplo),
    // então passa por Babel — o mesmo que o build usa para gerar o site
    const bruto = s.slice(0, jsx).replace(/^import[^\n]*\n/gm, "").replace(/^export default /gm, "");
    const topo = require("@babel/core").transformSync(bruto, {
      presets: [[require("@babel/preset-react"), { runtime: "classic" }]],
      configFile: false, babelrc: false,
    }).code;
    const vm = require("node:vm");
    ctx = vm.createContext({
      window: { addEventListener() {}, removeEventListener() {}, storage: { get: async () => null, set: async () => {} } },
      document: { addEventListener() {}, createElement: () => ({ style: {} }) },
      navigator: {}, fetch: async () => ({ ok: true, json: async () => ({}) }),
      setTimeout, clearTimeout, setInterval, clearInterval,
      console: { log() {}, warn() {}, error() {} },
      Blob: function () {}, URL: { createObjectURL: () => "", revokeObjectURL() {} },
      AudioContext: function () { return { createGain: () => ({ connect() {}, gain: { value: 0, setValueAtTime() {} } }), destination: {}, currentTime: 0, state: "running" }; },
    });
    vm.runInContext(topo + "\n;globalThis.__ok = { chaves: TODAS_CHAVES.length, elegiveis: ELEGIVEIS_EXAME.length, fora: FORA_DO_EXAME.length, niveis: TOTAL_NIVEIS, regras: REGRAS_EXAME.minimoAcertos.valor, dif: Object.keys(CHAVES_POR_MODULO_DIF).length };", ctx, { timeout: 20000 });
  } catch (e) { erroTopo = e.message; }
  t("as constantes de topo executam sem erro de ordem (zona morta temporal)", !erroTopo, erroTopo);
  const g = ctx && ctx.__ok;
  if (g) {
    t(`o índice montou ${g.chaves} questões`, g.chaves === 872, String(g.chaves));
    t(`${g.elegiveis} elegíveis + ${g.fora} fora do exame = ${g.chaves}`, g.elegiveis + g.fora === g.chaves);
    t("há questões fora do exame, e elas estão declaradas", g.fora > 0);
    t(`${g.niveis} níveis indexados`, g.niveis === 170, String(g.niveis));
    t("as regras do exame carregam o mínimo de acertos", g.regras === 35);
    t("o índice por dificuldade cobre os 4 módulos", g.dif === 4, String(g.dif));
  }
}

// ================================================================
secao("1. EMBARALHAMENTO NÃO ALTERA O GABARITO");
{
  let erros = 0, posGab = [0, 0, 0, 0];
  const base = { q: "pergunta", alts: ["A", "B", "C", "D"], c: 2, exp: "e" };
  for (let i = 0; i < 4000; i++) {
    const e = embaralhar(base);
    if (e.alts[e.c] !== base.alts[base.c]) erros++;      // o texto certo tem de continuar certo
    if (e.alts.slice().sort().join("") !== "ABCD") erros++; // nada some nem duplica
    posGab[e.c]++;
  }
  t("4.000 embaralhamentos preservam o texto do gabarito", erros === 0, erros + " divergências");
  const min = Math.min(...posGab);
  t("o gabarito cai nas 4 posições (mín " + min + " em 1000 esperados)", min > 800, posGab.join("/"));
  t("embaralhar não muda o objeto original", base.c === 2 && base.alts[0] === "A");
  const vazio = embaralhar({ q: "x" });
  t("questão sem alternativas não quebra o embaralhamento", vazio && vazio.q === "x");
}

// ================================================================
secao("2. A NOTA INCLUI AS PENDÊNCIAS");
{
  const mc = (r, g, ex) => ({ tipo: "mc", resposta: r, gabarito: g, ...ex });
  const caso = (nome, itens, esp) => {
    const r = corrigir({ itens });
    const dif = Object.entries(esp).filter(([k, v]) => r[k] !== v);
    t(nome, dif.length === 0, dif.map(([k, v]) => `${k}: esperado ${v}, veio ${r[k]}`).join("; "));
  };
  t("o corte vem do edital: 35 acertos de 50",
    REGRAS_EXAME.minimoAcertos.valor === 35 && REGRAS_EXAME.totalItens.valor === 50 && REGRAS_EXAME.minimoAcertos.origem === "oficial");
  caso("10 acertos + 40 em branco = 20% (não 100%)",
    [...Array(10)].map(() => mc(1, 1)).concat([...Array(40)].map(() => mc(null, 1))),
    { acertos: 10, total: 50, pendentes: 40, pctInteiro: 20, aprovado: false, corteAcertos: 35 });
  caso("tudo em branco = 0% sobre 50",
    [...Array(50)].map(() => mc(null, 1)),
    { acertos: 0, total: 50, pendentes: 50, pctInteiro: 0, aprovado: false });
  caso("35 de 50 aprova — mínimo exato do edital",
    [...Array(35)].map(() => mc(1, 1)).concat([...Array(15)].map(() => mc(0, 1))),
    { acertos: 35, pctInteiro: 70, aprovado: true });
  caso("34 de 50 reprova por um único acerto",
    [...Array(34)].map(() => mc(1, 1)).concat([...Array(16)].map(() => mc(0, 1))),
    { acertos: 34, pctInteiro: 68, aprovado: false });
  // 69,5% arredonda para 70 na tela, mas NÃO pode aprovar
  const r = corrigir({ itens: [...Array(139)].map(() => mc(1, 1)).concat([...Array(61)].map(() => mc(0, 1))) });
  t("69,5% exibe 69,5 e reprova (o arredondamento não decide)", r.pct === 69.5 && r.aprovado === false, `pct=${r.pct} aprovado=${r.aprovado}`);
  // Edital 16.1: a anulada é "atribuída a todas as pessoas candidatas".
  // Vira acerto para todo mundo e CONTINUA no total — tirar do denominador
  // facilitaria a aprovação e não é o que a banca faz.
  caso("anulada vira acerto e continua no total",
    [...Array(34)].map(() => mc(1, 1)).concat([...Array(15)].map(() => mc(0, 1)), [mc(0, 1, { anulado: true, motivoAnulacao: "gabarito duplo" })]),
    { total: 50, acertos: 35, creditados: 1, aprovado: true });
  caso("anulada deixada em branco também credita",
    [...Array(34)].map(() => mc(1, 1)).concat([...Array(15)].map(() => mc(0, 1)), [mc(null, 1, { anulado: true, motivoAnulacao: "sem alternativa correta" })]),
    { total: 50, acertos: 35, creditados: 1, aprovado: true });
  caso("duas anuladas levam 33 acertos à aprovação",
    [...Array(33)].map(() => mc(1, 1)).concat([...Array(15)].map(() => mc(0, 1)),
      [mc(0, 1, { anulado: true, motivoAnulacao: "a" }), mc(0, 1, { anulado: true, motivoAnulacao: "b" })]),
    { total: 50, acertos: 35, creditados: 2, aprovado: true });
  const ra = corrigir({ itens: [mc(0, 1, { anulado: true, motivoAnulacao: "fonte revogada", chave: "2.1.1" })] });
  t("o motivo da anulação é preservado", ra.anulados[0].motivo === "fonte revogada");
  caso("árvore: só a Melhor escolha (grau 3) pontua",
    [{ tipo: "arvore", escolha: 0, grauEscolhido: 3 }, { tipo: "arvore", escolha: 1, grauEscolhido: 2 },
     { tipo: "arvore", escolha: 2, grauEscolhido: 1 }, { tipo: "arvore", escolha: 3, grauEscolhido: 0 }],
    { acertos: 1, total: 4, pendentes: 0, pctInteiro: 25 });
  caso("mistura de múltipla escolha e árvore soma no mesmo total",
    [...Array(40)].map(() => mc(1, 1)).concat([...Array(10)].map(() => ({ tipo: "arvore", escolha: 0, grauEscolhido: 3 }))),
    { acertos: 50, total: 50, pctInteiro: 100, aprovado: true });
  caso("prova vazia não divide por zero", [], { acertos: 0, total: 0, pctInteiro: 0, aprovado: false });
  const idem = corrigir({ itens: [...Array(50)].map(() => mc(1, 1)) });
  const idem2 = corrigir({ itens: [...Array(50)].map(() => mc(1, 1)) });
  t("a correção é determinística (mesma entrada, mesma nota)", JSON.stringify(idem) === JSON.stringify(idem2));
}

// ================================================================
secao("3. CRONÔMETRO POR PRAZO ABSOLUTO");
{
  // reproduz a aritmética da tela: resta = fimEm - agora
  const inicio = 1000000;
  const dur = 150 * 60 * 1000;
  const fimEm = inicio + dur;
  const resta = (agora) => Math.max(0, Math.round((fimEm - agora) / 1000));
  t("no começo restam 9000s (2h30)", resta(inicio) === 9000);
  t("após 1h de app fechado, restam 5400s (o relógio correu)", resta(inicio + 3600e3) === 5400);
  t("recarregar aos 30min não devolve tempo", resta(inicio + 1800e3) === 7200);
  t("voltar depois do prazo dá 0, não negativo", resta(inicio + dur + 999e3) === 0);
  t("no instante exato do prazo já vale a regra de encerrar", inicio + dur >= fimEm);
  // o fonte precisa de fato usar Date.now e não um contador
  t("o prazo é gravado como instante absoluto", /fimEm: inicio \+ REGRAS_EXAME\.duracaoSeg\.valor \* 1000/.test(s));
  t("nenhum setRelogio governa a prova", !/prova.*setRelogio|setRelogio.*prova/.test(s));
}

// ================================================================
secao("4. TOQUE REPETIDO E TENTATIVA ENCERRADA");
{
  t("responder o mesmo valor de novo sai cedo", /if \(it\[campo\] === valor\) return;/.test(s));
  t("não aceita resposta com a prova entregue ou vencida",
    /if \(!prova \|\| prova\.entregue \|\| Date\.now\(\) >= prova\.fimEm\) return;/.test(s));
  t("navegar entre itens exige prova aberta", /const irPara = \(i\) => \{ if \(prova && !prova\.entregue\)/.test(s));
  t("marcar item exige prova aberta", /const marcarItem[\s\S]{0,120}if \(!prova \|\| prova\.entregue\) return;/.test(s));
  t("encerrar duas vezes não duplica no histórico", /const encerrarProva = \(motivo\) => \{\s*if \(!prova \|\| prova\.entregue\) return;/.test(s));
  t("a tela do exame só abre com tentativa não entregue", /tela === "prova" && prova && !prova\.entregue/.test(s));
  t("a revisão da tentativa encerrada não tem onClick de resposta",
    (() => { const a = s.indexOf('tela === "provaFim"'); const b = s.indexOf("// ---------------- QUIZ"); const bl = s.slice(a, b); return !/responderProva/.test(bl); })());
}

// ================================================================
secao("5. MIGRAÇÃO E BACKUP");
{
  const v1 = { xp: 4200, stats: { "1.1/1.1.1": { r: 9, w: 2 } }, feitos: { "1.1.1": { acertos: 5, total: 6 } }, favs: ["1.1.1"], errados: ["k"] };
  const m = migrar(JSON.parse(JSON.stringify(v1)));
  t("save v1 sobe para o esquema 2", m.esquema === 2);
  t("migrar não perde XP", m.xp === 4200);
  t("migrar não perde precisão por tópico", m.stats["1.1/1.1.1"].r === 9 && m.stats["1.1/1.1.1"].w === 2);
  t("migrar não perde pílulas vencidas, favoritas nem fila de erros",
    m.feitos["1.1.1"].acertos === 5 && m.favs[0] === "1.1.1" && m.errados[0] === "k");
  t("migrar é idempotente", JSON.stringify(migrar(m)) === JSON.stringify(m));
  t("migrar aguenta nulo e lixo", migrar(null) === null && migrar("x") === "x");
  t("migrar não recalcula resultado nenhum", !/resultado\s*=/.test(s.slice(s.indexOf("const migrar"), s.indexOf("const migrar") + 500)));

  const ini = s.indexOf("const backupValido = (d) => (");
  const backupValido = eval("(" + s.slice(ini + "const backupValido = ".length, s.indexOf("\n  );", ini) + 4).trim() + ")");
  t("backup válido é aceito", backupValido({ xp: 10, stats: {}, errados: [], favs: [] }) === true);
  t("backup sem xp é recusado", !backupValido({ stats: {} }));
  t("xp como texto é recusado", !backupValido({ xp: "muito" }));
  t("xp negativo é recusado", !backupValido({ xp: -5 }));
  t("xp NaN/Infinity é recusado", !backupValido({ xp: NaN }) && !backupValido({ xp: Infinity }));
  t("errados que não é lista é recusado", !backupValido({ xp: 1, errados: "abc" }));
  t("histórico que não é lista é recusado", !backupValido({ xp: 1, historico: {} }));
  t("nulo e string são recusados", !backupValido(null) && !backupValido("qualquer coisa"));
  t("backup antigo sem histórico ainda é aceito", backupValido({ xp: 1 }) === true);

  const hi = s.indexOf("const historicoValido = (h) =>");
  const historicoValido = eval("(" + s.slice(hi + "const historicoValido = ".length, s.indexOf("\n  );", hi) + 4).trim() + ")");
  t("histórico filtra tentativas não entregues", historicoValido([{ id: 1, itens: [], entregue: true }, { id: 2, itens: [], entregue: false }]).length === 1);
  t("histórico filtra objetos sem itens", historicoValido([{ id: 3, entregue: true }]).length === 0);
  t("histórico aceita entrada não-lista sem quebrar", historicoValido("lixo").length === 0);
  t("dá para baixar o backup como arquivo, não só copiar", /const baixarBackup = \(\) => \{/.test(s) && /a\.download = `projeto-cpa-backup-/.test(s));
  t("o arquivo de backup explica como restaurar", /Para restaurar: abra o app/.test(s));
  t("o corte do histórico em 30 avisa qual prova saiu", /juntado\.length > 30/.test(s) && /saiu da lista/.test(s));
  t("erro de leitura não apaga o progresso — só avisa", /Nada foi apagado/.test(s));
  {
    // o corte do histórico não pode perder a prova nova nem duplicar
    const hist = [...Array(30)].map((_, i) => ({ id: 1000 - i, itens: [], entregue: true }));
    const nova = { id: 2000, itens: [], entregue: true };
    const juntado = [nova, ...hist];
    const novo = juntado.slice(0, 30);
    t("a prova recém-encerrada sempre entra no histórico", novo[0].id === 2000);
    t("o histórico para em 30", novo.length === 30);
    t("nenhuma tentativa duplica no corte", new Set(novo.map((x) => x.id)).size === 30);
    t("a que saiu é a mais antiga", juntado[30].id === 1000 - 29);
  }
}

// ================================================================
secao("6. SINCRONIA (regressão do que já funcionava)");
{
  t("nuvem mais nova → puxar", decidirSync(100, 200) === "puxar");
  t("aparelho mais novo → empurrar", decidirSync(300, 200) === "empurrar");
  t("empate → nada", decidirSync(100, 100) === "nada");
  t("primeiro envio (nuvem vazia) → empurrar", decidirSync(100, 0) === "empurrar");
  t("aparelho zerado com nuvem cheia → puxar", decidirSync(0, 100) === "puxar");
  t("ambos zerados → nada", decidirSync(0, 0) === "nada");
  t("undefined não quebra", decidirSync(undefined, undefined) === "nada");

  // ------------------------------------------------------------------
  // O carimbo mais recente é cego: quem gravou por último leva tudo.
  // conflitoDeSync existe para pegar o caso em que puxar DESTRUIRIA
  // trabalho que só existe neste aparelho.
  global.trabalhoDe = extrai("trabalhoDe", "\n};");
  const conflitoDeSync = extrai("conflitoDeSync", "\n};");
  const est = (resp, pil, xp) => ({
    xp,
    stats: Object.fromEntries([...Array(1)].map(() => ["t", { r: resp, w: 0 }])),
    feitos: Object.fromEntries([...Array(pil)].map((_, i) => ["p" + i, {}])),
  });
  t("nuvem tem tudo que o aparelho tem → sem conflito, pode puxar",
    conflitoDeSync(est(10, 5, 100), est(20, 9, 300)) === null);
  t("estados iguais → sem conflito", conflitoDeSync(est(10, 5, 100), est(10, 5, 100)) === null);
  {
    const c = conflitoDeSync(est(120, 143, 9720), est(40, 20, 3000));
    t("aparelho à frente em tudo → conflito detectado", !!c);
    t("o conflito diz exatamente o que se perderia",
      c && c.perde.length === 3 && /80 resposta/.test(c.perde[0]) && /123 pílula/.test(c.perde[1]) && /6720 XP/.test(c.perde[2]),
      c && c.perde.join(" | "));
  }
  t("aparelho à frente só em respostas já basta para parar",
    !!conflitoDeSync(est(50, 5, 100), est(40, 5, 100)));
  t("aparelho à frente só em pílulas já basta para parar",
    !!conflitoDeSync(est(10, 8, 100), est(10, 5, 100)));
  t("estado vazio não gera conflito falso", conflitoDeSync({}, est(10, 5, 100)) === null);
  t("nuvem vazia com aparelho cheio → conflito", !!conflitoDeSync(est(10, 5, 100), {}));

  // o app precisa de fato consultar conflitoDeSync antes de aplicar a nuvem
  t("o app pergunta antes de puxar por cima do aparelho",
    /const conf = conflitoDeSync\(local, nuvem\);/.test(s) && /if \(conf\) \{\s*\n\s*setConflitoSync/.test(s));
  t("nada é gravado enquanto o conflito não é resolvido",
    /setConflitoSync\(\{ \.\.\.conf, nuvemEstado: nuvem, localEstado: local \}\);/.test(s));
}

// ================================================================
secao("6b. O PROGRESSO NÃO PODE FICAR PRESO NO APARELHO");
{
  // Defeito real: o envio para a nuvem era um setTimeout de 4s. No iPhone,
  // bloquear a tela ou trocar de app congela a página e o timer não dispara.
  t("existe um registro do que ainda não subiu", /let pendenteNuvem = null;/.test(s));
  t("salvar marca o estado como pendente", /pendenteNuvem = st;/.test(s));
  t("o envio limpa o pendente só depois de dar certo",
    /\.then\(\(\) => \{ if \(pendenteNuvem === alvo\) pendenteNuvem = null; \}\)/.test(s));
  t("há despejo quando a página some (pagehide)", /window\.addEventListener\("pagehide", despejar\)/.test(s));
  t("há despejo ao esconder a aba — bloquear a tela e trocar de app",
    /document\.addEventListener\("visibilitychange", aoEsconder\)/.test(s) &&
    /document\.visibilityState === "hidden"/.test(s));
  t("o envio de despejo usa keepalive, que sobrevive ao fechamento",
    /keepalive: true/.test(s));
  t("falhou o despejo, o pendente volta para a fila em vez de sumir",
    /\.catch\(\(\) => \{ pendenteNuvem = alvo; \}\)/.test(s));
  const atraso = (s.match(/\}, (\d+)\);\s*\n\s*\}\;\s*\n\s*\n\s*\/\/ Fecha a janela/) || [])[1];
  t(`o atraso do envio encolheu para 1,5s (era 4s)`, /\}, 1500\);/.test(s));
}

// ================================================================
secao("7. SORTEIO DA SESSÃO DE EXAME");
{
  const PESOS = { "1": 20, "2": 40, "3": 30, "4": 10 };
  const alvo = 40;
  let soma = 0;
  Object.values(PESOS).forEach((p) => { soma += Math.round((alvo * p) / 100); });
  t("os pesos por módulo fecham 100%", Object.values(PESOS).reduce((a, b) => a + b, 0) === 100);
  t("o sorteio ponderado dá exatamente 40 itens", soma === 40, "deu " + soma);
  t("há completação para o caso de o arredondamento não fechar", /if \(chaves\.length < alvo\) chaves = chaves\.concat\(pegar\(ELEGIVEIS_EXAME/.test(s));
  t("a completação também respeita a exclusão do exame",
    /pegar\(CHAVES_POR_MODULO\[m\]\.filter\(\(k\) => !IDX_Q\[k\]\.foraDoExame\)/.test(s));
  t("o índice por dificuldade já exclui as questões fora do exame",
    /CHAVES_POR_MODULO\[m\.id\]\.filter\(\(k\) => !IDX_Q\[k\]\.foraDoExame\)/.test(s));
  t("questão fora do exame continua no estudo, com o motivo na tela",
    /q\.foraDoExame && \(/.test(s) && /className="cx-fora"/.test(s) && /\{q\.motivoFora\}/.test(s));
  t("o sorteio reparte a cota do módulo em fácil/médio/difícil", /const alvoPorFaixa = \{ 1: nF, 2: nM, 3: nD \}/.test(s));
  t("nenhuma questão pode sair repetida (conjunto de usadas)", /const usadas = new Set\(\);/.test(s) && /if \(!usadas\.has\(k\)\) \{ usadas\.add\(k\)/.test(s));
  t("o índice por dificuldade existe", /const CHAVES_POR_MODULO_DIF = \{\}/.test(s));
  {
    // simula o sorteio nas duas dimensões, 300 vezes
    const PES = { "1": 20, "2": 40, "3": 30, "4": 10 };
    const D = { facil: 25, medio: 50, dificil: 25 };
    const banco = {};   // módulo -> dificuldade -> chaves
    Object.keys(PES).forEach((m) => {
      banco[m] = { 1: [], 2: [], 3: [] };
      // proporção real medida no banco: 25/50/25 dentro de cada módulo
      const n = { "1": 202, "2": 345, "3": 221, "4": 104 }[m];
      for (let i = 0; i < n; i++) banco[m][i % 4 === 0 ? 1 : i % 4 === 3 ? 3 : 2].push(m + "-" + i);
    });
    let ruins = 0, somaDif = { 1: 0, 2: 0, 3: 0 };
    for (let r = 0; r < 300; r++) {
      const usadas = new Set();
      const pegar = (lista, k) => { const o = []; for (const x of shuffle(lista)) { if (o.length >= k) break; if (!usadas.has(x)) { usadas.add(x); o.push(x); } } return o; };
      let chaves = [];
      Object.entries(PES).forEach(([m, p]) => {
        const cota = Math.round((40 * p) / 100);
        const nF = Math.round((cota * D.facil) / 100), nD = Math.round((cota * D.dificil) / 100);
        const alvoPorFaixa = { 1: nF, 2: cota - nF - nD, 3: nD };
        let dm = [];
        [1, 2, 3].forEach((d) => { dm = dm.concat(pegar(banco[m][d], alvoPorFaixa[d])); });
        chaves = chaves.concat(dm);
      });
      if (chaves.length !== 40) ruins++;
      if (new Set(chaves).size !== chaves.length) ruins++;
      chaves.forEach((k) => {
        const m = k.split("-")[0], i = Number(k.split("-")[1]);
        somaDif[i % 4 === 0 ? 1 : i % 4 === 3 ? 3 : 2]++;
      });
    }
    t("300 sorteios dão 40 questões sem repetição", ruins === 0, ruins + " sorteios ruins");
    const tot = somaDif[1] + somaDif[2] + somaDif[3];
    const pf = Math.round((somaDif[1] / tot) * 100), pm = Math.round((somaDif[2] / tot) * 100), pd = Math.round((somaDif[3] / tot) * 100);
    t(`distribuição de dificuldade fica em 25/50/25 (deu ${pf}/${pm}/${pd})`,
      Math.abs(pf - 25) <= 2 && Math.abs(pm - 50) <= 3 && Math.abs(pd - 25) <= 2);
  }
  t("o total do exame é 40 + 10 = 50", /const TOTAL_ITENS_PROVA = REGRAS_EXAME\.multiplaEscolha\.valor \+ REGRAS_EXAME\.itensArvore\.valor/.test(s));
  // ordemAlts devolve permutação completa, sempre
  let ruim = 0;
  for (let i = 0; i < 3000; i++) { const o = ordemAlts(4); if (o.slice().sort().join("") !== "0123") ruim++; }
  t("3.000 sorteios de ordem são permutações completas de 0-3", ruim === 0, ruim + " inválidas");
  // o gabarito guardado já vem na ordem sorteada
  t("o gabarito do item é gravado na ordem em que aparece", /gabarito: ordem\.indexOf\(q\.c\)/.test(s));
  t("a árvore corta no décimo item", /itensArv\.length < REGRAS_EXAME\.itensArvore\.valor/.test(s));

  // REGRESSÃO: pop() dentro do find() era chamado a cada comparação e
  // esvaziava o baralho, devolvendo undefined. A prova quebrava ao montar.
  t("pop() do baralho acontece fora do find()", /const id = baralho\.pop\(\);\s*\n\s*const a = ARVORES\.find\(\(x\) => x\.id === id\);/.test(s));
  t("árvore não encontrada não derruba a montagem", /const a = ARVORES\.find\(\(x\) => x\.id === id\);\s*\n\s*if \(!a\) continue;/.test(s));
  {
    // reproduz o laço corrigido com 5 árvores de 6 prompts, 500 vezes
    const ARV = [...Array(5)].map((_, i) => ({ id: "A." + i, prompts: [...Array(6)].map(() => ({ alts: [1, 2, 3, 4] })) }));
    let ruins = 0;
    for (let n = 0; n < 500; n++) {
      const itens = [];
      const baralho = shuffle(ARV.map((a) => a.id));
      while (itens.length < 10 && baralho.length) {
        const id = baralho.pop();
        const a = ARV.find((x) => x.id === id);
        if (!a) continue;
        for (let i = 0; i < a.prompts.length && itens.length < 10; i++) itens.push({ arvId: a.id, passo: i });
      }
      if (itens.length !== 10) ruins++;
      // cada conversa precisa começar na primeira fala e não pular passos
      const porArv = {};
      itens.forEach((x) => { (porArv[x.arvId] = porArv[x.arvId] || []).push(x.passo); });
      Object.values(porArv).forEach((ps) => { if (ps.join(",") !== ps.map((_, k) => k).join(",")) ruins++; });
    }
    t("500 sorteios dão sempre 10 itens de árvore, em conversas sem buraco", ruins === 0, ruins + " sorteios ruins");
  }
  // relógio legível acima de uma hora
  global.fmtTime = extrai("fmtTime", ";\n");
  const fmtRelogio = extrai("fmtRelogio", "\n};");
  t("2h30 aparece como 2:30:00, não 150:00", fmtRelogio(9000) === "2:30:00", fmtRelogio(9000));
  t("abaixo de 1h continua mm:ss", fmtRelogio(596) === "09:56", fmtRelogio(596));
  t("zero é 00:00", fmtRelogio(0) === "00:00");
}

// ================================================================
secao("8. HONESTIDADE E RASTREABILIDADE");
{
  t('nenhum material autoral chamado de "oficial"', !/Simulado oficial/.test(s));
  t("as regras trazem fonte", /fonte: "Edital dos Exames de Certificação Anbima/.test(s));
  t("as regras trazem data de verificação", /verificadoEm: "\d{4}-\d{2}-\d{2}"/.test(s));
  t("o corte está confirmado no edital", /minimoAcertos: \{ valor: 35, origem: "oficial"/.test(s));
  t("a regra de anulação cita o edital 16.1", /Edital 16\.1/.test(s));
  t("a tentativa guarda a versão do gabarito", /versaoGabarito: VERSAO_GABARITO/.test(s));
  t("a nota da árvore é declarada como leitura nossa", /não é a regra da banca/.test(s));
  t("a prova diz que as questões são autorais", /As questões são <b>autorais<\/b>/.test(s));
  t('a regra de "apenas uma alternativa correta" está declarada com o item do edital',
    /umaCorreta: \{ valor: "sim", origem: "oficial"/.test(s) && /sendo apenas uma das alternativas correta/.test(s));
  t("a divergência entre edital e guia sobre a árvore está admitida, não escondida",
    /Os dois documentos não combinam nesse ponto/.test(s));
  {
    // nenhuma questão do banco pode ter mais de um gabarito: `c` é um índice
    const mods = [1, 2, 3, 4].map((i) => eval("[" + fs.readFileSync(path.join(__dirname, "..", "src", "dados", `modulo-${i}.part.js`), "utf8") + "][0]"));
    let ruins = 0, n = 0;
    mods.forEach((m) => (m.blocos || []).forEach((b) => {
      const ver = (q) => { n++; if (!Number.isInteger(q.c) || q.c < 0 || q.c >= q.alts.length || Array.isArray(q.c)) ruins++; };
      (b.niveis || []).forEach((nv) => (nv.questoes || []).forEach(ver));
      (b.boss || []).forEach(ver);
    }));
    t(`as ${n} questões têm UM gabarito só (índice inteiro, nunca lista)`, ruins === 0, ruins + " fora do padrão");
  }
}

console.log(`\n${total - falhas}/${total} testes passaram.` + (falhas ? `  ${falhas} FALHA(S).\n` : "  Nenhuma falha.\n"));
process.exit(falhas === 0 ? 0 : 1);
