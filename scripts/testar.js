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
const LIMITE_HIST_ESPERADO = Number((s.match(/const LIMITE_HIST = (\d+)/) || [])[1]);
global.LIMITE_HIST = LIMITE_HIST_ESPERADO;

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
    vm.runInContext(topo + "\n;globalThis.__ok = { chaves: TODAS_CHAVES.length, elegiveis: ELEGIVEIS_EXAME.length, fora: FORA_DO_EXAME.length, niveis: TOTAL_NIVEIS, regras: REGRAS_EXAME.minimoAcertos.valor, dif: Object.keys(CHAVES_POR_MODULO_DIF).length };"
      // Exporta as peças REAIS da montagem para os testes de comportamento
      // mais abaixo. Sem isto, só dava para procurar texto no arquivo — e
      // texto não prova que a prova sai com a distribuição certa.
      + "\n;globalThis.__real = { montarItensProva, cotaMaiorResto, reescalar, montarArvore, ARVORES, TOTAL_ITENS_PROVA, PESOS, REGRAS_EXAME };",
      ctx, { timeout: 20000 });
    global.__real = ctx.__real;
  } catch (e) { erroTopo = e.message; }
  t("as constantes de topo executam sem erro de ordem (zona morta temporal)", !erroTopo, erroTopo);

  // O teste acima executa o TOPO do módulo, não a renderização. Um hook do
  // React usado sem estar importado só quebra na hora de renderizar — foi
  // assim que `useRef` derrubou o app inteiro em produção, com todos os
  // portões verdes. Aqui a checagem é estática e cobre esse buraco.
  {
    const usados = [...new Set((s.match(/\buse[A-Z][A-Za-z]*/g) || []))]
      .filter((h) => ["useState", "useEffect", "useRef", "useMemo", "useCallback",
        "useReducer", "useContext", "useLayoutEffect", "useId", "useTransition",
        "useDeferredValue", "useSyncExternalStore", "useImperativeHandle", "useDebugValue"].includes(h));
    const linha = (s.match(/const \{([^}]*)\} = React;/) || s.match(/import \{([^}]*)\} from "react"/) || [])[1] || "";
    const importados = linha.split(",").map((x) => x.trim()).filter(Boolean);
    const faltando = usados.filter((h) => !importados.includes(h));
    t(`todo hook do React usado está importado (${usados.length} em uso)`,
      faltando.length === 0, "faltando: " + faltando.join(", "));
    t("a lista de importação não está vazia", importados.length > 0, linha);
  }
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
  t("não aceita resposta com a prova entregue, pausada ou vencida",
    /if \(!prova \|\| prova\.entregue \|\| prova\.pausada \|\| Date\.now\(\) >= prova\.fimEm\) return;/.test(s));
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
  // MESMO BUG, terceiro lugar: a importação "somar" pulava o id já existente
  // e, com isso, descartava a versão melhor vinda do outro aparelho.
  t("importar por código também usa a união, não o 'pula se já existe'",
    /nhist = mesclarHistorico\(nhist, historicoValido\(d\.historico\), apagados\);/.test(s));
  t("o 'pula se já existe' foi removido da importação",
    !/if \(!nhist\.some\(\(x\) => x\.id === t\.id\)\) nhist\.push\(t\)/.test(s));
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
secao("6c. HISTÓRICO DE PROVAS ENTRE APARELHOS");
{
  const packItem = global.packItem = extrai("packItem", "].join(\";\");");
  const unpackItem = global.unpackItem = extrai("unpackItem", "\n};");
  const packTentativa = global.packTentativa = extrai("packTentativa", "\n});");
  const unpackTentativa = global.unpackTentativa = extrai("unpackTentativa", "\n});");
  global.respondidasDe = extrai("respondidasDe", "\n  }).length;");
  global.melhorVersao = extrai("melhorVersao", "\n};");
  const mesclarHistorico = extrai("mesclarHistorico", "\n};");
  const mesclarApagados = extrai("mesclarApagados", ".slice(-200);");

  // ---- ida e volta do empacotamento: nada pode se perder no caminho
  const mc = { tipo: "mc", chave: "2.4.12.1|0", mId: "2", nId: "2.4.12.1",
    ordem: [1, 3, 0, 2], gabarito: 0, resposta: 2, marcada: true };
  const v = unpackItem(packItem(mc));
  t("item de múltipla escolha volta igual do empacotamento",
    v.chave === mc.chave && JSON.stringify(v.ordem) === JSON.stringify(mc.ordem) &&
    v.gabarito === 0 && v.resposta === 2 && v.marcada === true,
    JSON.stringify(v));
  const branco = unpackItem(packItem({ ...mc, resposta: null, marcada: false }));
  t("resposta em branco continua em branco (null, não 0)", branco.resposta === null && branco.marcada === false, JSON.stringify(branco));
  const zero = unpackItem(packItem({ ...mc, resposta: 0 }));
  t("resposta 0 não vira branco — o ?? protege o zero", zero.resposta === 0, JSON.stringify(zero));
  const arv = unpackItem(packItem({ tipo: "arvore", chave: "A.3|2", arvId: "A.3", passo: 2,
    ordem: [2, 0, 3, 1], escolha: 3, grauEscolhido: 0, marcada: false }));
  t("item de árvore volta com árvore, passo, escolha e grau",
    arv.tipo === "arvore" && arv.arvId === "A.3" && arv.passo === 2 && arv.escolha === 3 && arv.grauEscolhido === 0,
    JSON.stringify(arv));
  const arvBranco = unpackItem(packItem({ tipo: "arvore", chave: "A.1|0", arvId: "A.1", passo: 0,
    ordem: [0, 1, 2, 3], escolha: null, grauEscolhido: null, marcada: false }));
  t("árvore em branco não vira grau 0", arvBranco.escolha === null && arvBranco.grauEscolhido === null);
  const anul = unpackItem(packItem({ ...mc, anulado: true, motivoAnulacao: "gabarito duplo" }));
  t("anulação e motivo sobrevivem ao empacotamento", anul.anulado === true && anul.motivoAnulacao === "gabarito duplo");
  // BUG REAL pego no teste de interface: a revisão de uma prova vinda de
  // outro aparelho mostrava "MUNDEFINED · UNDEFINED", porque mId/nId não
  // viajam. São rótulos: têm de ser rederivados do banco na volta.
  t("módulo e tópico voltam preenchidos, nunca undefined",
    v.mId !== undefined && v.nId !== undefined, `mId=${v.mId} nId=${v.nId}`);
  t("chave desconhecida não vira undefined na tela",
    (() => { const d = unpackItem("9.9.9|0;0123;1;1;"); return d.mId === "?" && d.nId === "9.9.9"; })());
  t("a tela da revisão tem rede para registros antigos sem mId/nId",
    /M\$\{it\.mId \|\| \(q && q\.mId\) \|\| "\?"\}/.test(s));
  t("o por-módulo também busca o módulo no banco quando falta",
    /const m = it\.mId \|\| \(IDX_Q\[it\.chave\] && IDX_Q\[it\.chave\]\.mId\)/.test(s));
  t("o rótulo é rederivado, o gabarito não",
    /mId: q \? q\.mId : "\?"/.test(s) && /gabarito: Number\(terceiro\)/.test(s));

  // ---- tamanho: o motivo de existir este codec
  const tent = { id: 1, entregueEm: 2, motivoFim: "manual", versaoGabarito: "2026-09-08",
    aparelho: "iPhone", resultado: { acertos: 35, total: 50, pct: 70, aprovado: true },
    itens: [...Array(50)].map(() => mc) };
  const cru = JSON.stringify(tent).length, packed = JSON.stringify(packTentativa(tent)).length;
  t(`a tentativa encolhe ao menos 4x (${cru} → ${packed} bytes)`, packed * 4 < cru, `${cru} → ${packed}`);
  t(`30 tentativas cabem com folga no teto de 300 KB (${Math.round(packed * 30 / 1024)} KB)`, packed * 30 < 120000);
  const volta = unpackTentativa(packTentativa(tent));
  t("a nota da tentativa NÃO é recalculada na volta — vem do que foi gravado",
    volta.resultado.acertos === 35 && volta.resultado.pct === 70 && volta.resultado.aprovado === true);
  t("o gabarito de cada item viaja junto, e não sai do banco atual",
    volta.itens[0].gabarito === 0 && volta.itens.length === 50);
  t("o aparelho de origem é preservado", volta.aparelho === "iPhone");

  // ---- união entre aparelhos
  const T = (id, itens) => ({ id, itens: itens || [], resultado: {} });
  const pc = [T(300), T(100)];      // computador
  const cel = [T(200), T(100)];     // celular, com uma em comum
  const u = mesclarHistorico(pc, cel, []);
  t("a união junta as provas dos dois aparelhos", u.length === 3, String(u.length));
  t("a prova que está nos dois lados não duplica", u.filter((x) => x.id === 100).length === 1);
  t("a lista sai da mais nova para a mais velha", u[0].id === 300 && u[2].id === 100);
  const comItens = mesclarHistorico([T(100)], [T(100, [1, 2, 3])], []);
  t("entre duas cópias da mesma prova, fica a que tem os itens", comItens[0].itens.length === 3);

  // ------------------------------------------------------------------
  // CASO REAL: a prova de 08/09 foi encerrada em DOIS aparelhos. O
  // computador (aba antiga) encerrou por tempo com 36 das 50 respondidas;
  // o celular terminou a mesma prova com as 50. A regra antiga desempatava
  // por "mais itens" — as duas tinham 50 — e acabava ficando com a primeira
  // da lista, sempre a local. Cada aparelho reescrevia o outro.
  const melhorVersao = global.melhorVersao;
  const item = (resp) => ({ tipo: "mc", resposta: resp });
  const tentDup = (id, respondidas, entregueEm, extra) => ({
    id, entregueEm,
    itens: [...Array(50)].map((_, k) => item(k < respondidas ? 1 : null)),
    ...extra,
  });
  const doPc = tentDup(999, 36, 1000, { aparelho: "Computador", motivoFim: "tempo" });
  const doCel = tentDup(999, 50, 2000, { aparelho: "iPhone", motivoFim: "manual" });
  t("respondidasDe conta só o que foi respondido", global.respondidasDe(doPc) === 36 && global.respondidasDe(doCel) === 50);
  t("vence quem RESPONDEU mais, não a ordem da lista",
    melhorVersao(doPc, doCel).aparelho === "iPhone" && melhorVersao(doCel, doPc).aparelho === "iPhone");
  t("na união, a versão do celular sobrevive vindo em qualquer ordem",
    mesclarHistorico([doPc], [doCel], [])[0].aparelho === "iPhone" &&
    mesclarHistorico([doCel], [doPc], [])[0].aparelho === "iPhone");
  t("empate em respondidas → vence a entregue por último",
    melhorVersao(tentDup(1, 50, 100), tentDup(1, 50, 900)).entregueEm === 900);
  t("a união avisa que houve duas versões da mesma prova",
    mesclarHistorico([doPc], [doCel], []).conflitos.length === 1);
  t("sem conflito, a lista de conflitos fica vazia",
    mesclarHistorico([doPc], [], []).conflitos.length === 0);
  t("a marca de conflito não polui os dados gravados",
    JSON.stringify(mesclarHistorico([doPc], [doCel], [])).indexOf("conflitos") === -1);
  t("o app avisa o usuário quando escolheu entre duas versões",
    /tinha duas versões \(encerrada em dois aparelhos\)/.test(s));
  t("união com lado vazio não perde nada", mesclarHistorico([], cel, []).length === 2);
  t("união de dois vazios não quebra", mesclarHistorico(null, undefined, null).length === 0);
  t("entradas sem id são descartadas", mesclarHistorico([{ itens: [] }, T(5)], [], []).length === 1);
  t(`a união respeita o teto de ${LIMITE_HIST_ESPERADO} tentativas`,
    mesclarHistorico([...Array(40)].map((_, i) => T(i + 1)), [], []).length === LIMITE_HIST_ESPERADO);

  // ---- lápides: apagar num aparelho precisa valer no outro
  const semApagada = mesclarHistorico(pc, cel, [100]);
  t("prova apagada não volta pela união", semApagada.length === 2 && !semApagada.some((x) => x.id === 100));
  t("a lápide funciona mesmo vindo como texto", mesclarHistorico(pc, cel, ["100"]).length === 2);
  t("lápides dos dois lados se somam", mesclarApagados([1, 2], [2, 3]).length === 3);
  t("lápide não guarda duplicata", mesclarApagados([7, 7, 7], [7]).length === 1);
  t("lápide ignora valores vazios", mesclarApagados([0, null, undefined, 5], []).length === 1);

  // ---- o app precisa mesmo usar tudo isso
  t("o histórico sobe compactado para a nuvem", /hist: historico\.map\(packTentativa\)/.test(s));
  t("as lápides sobem junto", /apagados: apagadosAgora \|\| apagados,/.test(s));
  t("a sincronia UNE o histórico em vez de substituir", /const unido = mesclarHistorico\(histLocal, daNuvem, mortos\);/.test(s));
  t("a união roda mesmo quando a decisão de sync foi \"nada\"",
    /Por isso este trecho roda SEMPRE, mesmo/.test(s));
  t("apagar cria lápide antes de gravar", /const mortos = mesclarApagados\(apagados, \[id\]\);/.test(s));
  t("apagar avisa a nuvem na hora", /const apagarTentativa[\s\S]{0,900}nuvemEnviar\(syncUrl, syncCod, estadoAtual\(/.test(s));
  t("apagar pede confirmação", /Apagar esta prova\?/.test(s) && /setApagarId\(h\.id\)/.test(s));
  t("a prova registra em que aparelho foi feita", /aparelho: nomeDoAparelho\(\)/.test(s));
}

// ================================================================
secao("6d. PAUSAR E RETOMAR A PROVA");
{
  global.packProva = extrai("packProva", "\n});");
  global.unpackProva = extrai("unpackProva", "\n});");
  const restanteDaProva = extrai("restanteDaProva", "\n};");
  const escolherProva = extrai("escolherProva", "\n};");
  const packProva = global.packProva, unpackProva = global.unpackProva;

  // ---- o relógio
  const agora = 1000000000;
  const rodando = { fimEm: agora + 3600e3, pausada: false };
  t("rodando, o relógio conta a partir do prazo absoluto", restanteDaProva(rodando, agora) === 3600);
  t("rodando, o tempo passa mesmo com o app fechado", restanteDaProva(rodando, agora + 600e3) === 3000);
  const pausada = { fimEm: agora + 3600e3, pausada: true, restanteSeg: 3000 };
  t("pausada, o relógio NÃO anda", restanteDaProva(pausada, agora) === 3000 && restanteDaProva(pausada, agora + 86400e3) === 3000);
  t("pausada ignora o fimEm velho", restanteDaProva(pausada, agora + 99999e3) === 3000);
  t("nunca devolve tempo negativo", restanteDaProva({ fimEm: agora - 1e6, pausada: false }, agora) === 0);
  t("prova inexistente devolve zero", restanteDaProva(null, agora) === 0);

  // retomar: o prazo renasce do que sobrou
  {
    const p = { fimEm: agora + 3600e3, pausada: false };
    const resta = restanteDaProva(p, agora + 600e3);              // 3000s
    const pausou = { ...p, pausada: true, restanteSeg: resta, pausadaEm: agora + 600e3 };
    const bemDepois = agora + 600e3 + 86400e3;                     // um dia parado
    const voltou = { ...pausou, pausada: false, fimEm: bemDepois + pausou.restanteSeg * 1000 };
    t("retomar um dia depois devolve exatamente o tempo que sobrou",
      restanteDaProva(voltou, bemDepois) === 3000, String(restanteDaProva(voltou, bemDepois)));
    t("pausar não cria tempo do nada", pausou.restanteSeg <= 3600);
  }

  // ---- ida e volta pela nuvem
  const prova = { id: 777, inicio: 777, i: 36, fimEm: agora + 6000e3, pausada: true, restanteSeg: 6404,
    pausas: 2, tempoPausadoMs: 120000, pausadaEm: agora, atualizadoEm: agora, aparelho: "Computador",
    versaoGabarito: "2026-09-08", regras: { minimoAcertos: 35 }, resultado: null,
    itens: [{ tipo: "mc", chave: "2.1.3.3|0", ordem: [1, 3, 0, 2], gabarito: 1, resposta: 1, marcada: false },
            { tipo: "mc", chave: "1.1.1|0", ordem: [0, 1, 2, 3], gabarito: 2, resposta: null, marcada: true }] };
  const v = unpackProva(packProva(prova));
  t("a prova pausada volta no mesmo item", v.i === 36);
  t("o tempo restante sobrevive à ida e volta", v.restanteSeg === 6404 && v.pausada === true);
  t("as respostas sobrevivem, inclusive a que estava em branco",
    v.itens[0].resposta === 1 && v.itens[1].resposta === null && v.itens[1].marcada === true);
  t("a contagem de pausas sobrevive", v.pausas === 2 && v.tempoPausadoMs === 120000);
  t("a prova volta como NÃO entregue", v.entregue === false && v.motivoFim === null);
  t("o aparelho onde foi pausada sobrevive", v.aparelho === "Computador");
  t("prova nula vira nula, sem quebrar", packProva(null) === null && unpackProva(null) === null);
  t(`a prova pausada é leve o bastante para a nuvem (${JSON.stringify(packProva(prova)).length} bytes com 2 itens)`,
    JSON.stringify(packProva(prova)).length < 1500);

  // ---- qual prova vale quando os dois lados têm uma
  const P = (id, u, extra) => ({ id, atualizadoEm: u, ...extra });
  t("só a nuvem tem prova → vale a da nuvem", escolherProva(null, P(1, 10), []).id === 1);
  t("só o aparelho tem prova → vale a daqui", escolherProva(P(2, 10), null, []).id === 2);
  t("mesma prova nos dois lados → vale a mexida mais recentemente",
    escolherProva(P(3, 10), P(3, 20), []).atualizadoEm === 20);
  t("mesma prova, a daqui é mais nova → fica a daqui",
    escolherProva(P(3, 30), P(3, 20), []).atualizadoEm === 30);
  t("provas diferentes → vale a mais recente", escolherProva(P(4, 10), P(5, 40), []).id === 5);
  t("prova já encerrada não ressuscita da nuvem", escolherProva(null, P(6, 99), [6]) === null);
  t("prova já encerrada não ressuscita do disco", escolherProva(P(7, 99), null, [7]) === null);
  t("nenhum dos lados tem prova → nada", escolherProva(null, null, []) === null);

  // ---- o app precisa mesmo usar isso
  t("existe ação de pausar", /const pausarProva = async \(\) => \{/.test(s));
  t("existe ação de retomar", /const retomarProva = async \(\) => \{/.test(s));
  t("pausar guarda o tempo restante", /pausada: true, restanteSeg: resta/.test(s));
  t("retomar recria o prazo a partir de agora", /fimEm: Date\.now\(\) \+ \(prova\.restanteSeg \|\| 0\) \* 1000/.test(s));
  t("pausada, o cronômetro nem roda nem encerra sozinha",
    /if \(!prova \|\| prova\.entregue \|\| prova\.pausada\) return;/.test(s));
  t("a tela da prova não abre com ela pausada", /tela === "prova" && prova && !prova\.entregue && !prova\.pausada/.test(s));
  t("pausar sobe para a nuvem na hora", /const pausarProva[\s\S]{0,700}await subirProva\(p\)/.test(s));
  t("a prova em andamento viaja no estado sincronizado", /prova: packProva\(prova\)/.test(s));
  t("encerrar tira a prova da nuvem", /prova: null, hist: novo\.map\(packTentativa\)/.test(s));
  t("a carga escolhe qual prova vale", /const vencedora = escolherProva\(provaLocal, daNuvemProva, ids\);/.test(s));
  t("o resultado avisa que a prova foi pausada", /Pausada \{h\.pausas\}×/.test(s));
  t("o aviso diz que pausar não reproduz a condição de prova",
    /[Nn]o exame de verdade não existe pausa/.test(s));
  // A pausa é uma escolha do produto, pedida pelo usuário. O relatório
  // precisa separar tempo ativo de tempo pausado SEM sugerir punição.
  t("o relatório separa tempo ativo de tempo pausado",
    /tempo ativo \{fmtRelogio/.test(s) && /min fora do relógio/.test(s));
  t("o relatório diz explicitamente que a pausa não desconta nota",
    /não desconta nada da sua nota/.test(s));
  t("pausas e tempo pausado sobrevivem ao backup e à sincronia",
    /p: t\.pausas \|\| 0, tp: t\.tempoPausadoMs \|\| 0/.test(s)
    && /pausas: p\.p \|\| 0, tempoPausadoMs: p\.tp \|\| 0/.test(s));
  t("a composição sorteada também sobrevive ao backup",
    /c: t\.cotas \|\| null/.test(s) && /cotas: p\.c \|\| null/.test(s));
  t("o botão de pausar está na barra fixa do topo da prova",
    /className="cx-provabar"[\s\S]{0,900}className="cx-pausa"/.test(s));
  t("o estado da prova aparece como TEXTO, não só como cor",
    /Prova ativa/.test(s) && /Prova pausada · relógio parado/.test(s));
  t("a tela explica que as respostas sobem AO PAUSAR", /As respostas sobem para a nuvem <b>ao pausar<\/b>/.test(s));
  // BUG REAL: pausar numa aba não parava o cronômetro da outra aba aberta,
  // e a aba atrasada encerrava a prova sozinha ao vencer o prazo antigo.
  t("abas do mesmo navegador se avisam pelo evento storage",
    /window\.addEventListener\("storage", aoMudarDisco\)/.test(s) && /ev\.key !== PROVA_KEY/.test(s));
  t("a aba que recebe o aviso fica com a versão mexida mais recentemente",
    /\(nova\.atualizadoEm \|\| 0\) >= \(atual\.atualizadoEm \|\| 0\) \? nova : atual/.test(s));
  t("encerrar por tempo confere o disco antes, para não matar a pausa de outra aba",
    /if \(noDisco && noDisco\.id === prova\.id && noDisco\.pausada\) \{ setProva\(noDisco\); return; \}/.test(s));
  t("se a prova já sumiu do disco, a aba atrasada não a encerra de novo",
    /if \(!noDisco\) \{ setProva\(null\); return; \}/.test(s));
}

// ================================================================
secao("6e. FERRAMENTAS — HP-12C (RPN e financeiras)");
{
  const hpNovo = extrai("hpNovo", "\n});");
  global.hpX = extrai("hpX", ");\n");
  global.hpLift = extrai("hpLift", "});\n");
  global.hpDrop = extrai("hpDrop", "});\n");
  global.hpFecharEntrada = extrai("hpFecharEntrada", ");\n");
  global.hpFecharEntradaSeNecessario = extrai("hpFecharEntradaSeNecessario", ";\n");
  const hpDigito = global.hpDigito = extrai("hpDigito", "\n};");
  const hpEnter = global.hpEnter = extrai("hpEnter", "\n};");
  const hpBinaria = global.hpBinaria = extrai("hpBinaria", "\n};");
  const hpUnaria = global.hpUnaria = extrai("hpUnaria", "\n};");
  const hpPorcento = global.hpPorcento = extrai("hpPorcento", "\n};");
  global.tvmFator = extrai("tvmFator", "\n};");
  const tvmResolver = global.tvmResolver = extrai("tvmResolver", "\n};");
  const hpFin = extrai("hpFin", "\n};");
  const hpLimpar = extrai("hpLimpar", "\n};");
  const hpVisor = extrai("hpVisor", "\n};");

  // teclar uma sequência, como numa máquina de verdade
  const teclar = (seq) => {
    let m = hpNovo();
    seq.split(" ").forEach((k) => {
      if (/^[0-9.]+$/.test(k)) k.split("").forEach((d) => { m = hpDigito(m, d); });
      else if (k === "E") m = hpEnter(m);
      else if ("+-*/^".includes(k)) m = hpBinaria(m, k);
      else if (k === "%") m = hpPorcento(m, "%");
      else if (k === "d%") m = hpPorcento(m, "d%");
      else if (k === "chs") m = hpUnaria(m, "chs");
      else if (["n", "i", "pv", "pmt", "fv"].includes(k)) m = hpFin(m, k);
      else m = hpUnaria(m, k);
    });
    return m;
  };
  const val = (seq) => { const m = teclar(seq); return m.digitando ? parseFloat(m.entrada) : m.x; };
  const perto = (nome, seq, esp, tol) => t(`${nome}  [${seq}]`, Math.abs(val(seq) - esp) <= (tol || 1e-6), String(val(seq)));

  perto("soma em RPN", "12 E 5 +", 17);
  perto("subtração respeita a ordem y−x", "12 E 5 -", 7);
  perto("divisão respeita a ordem y÷x", "12 E 5 /", 2.4);
  perto("encadeia sem parênteses: (2+3)×4", "2 E 3 + 4 *", 20);
  perto("potência", "2 E 10 ^", 1024);
  perto("raiz", "144 sqrt", 12);
  perto("inverso", "4 1/x", 0.25);
  perto("troca de sinal", "50 chs", -50);
  // BUG REAL: CHS fechava a entrada, e a tecla financeira seguinte tentava
  // RESOLVER em vez de GRAVAR. "1000 CHS PV" é o gesto mais comum da HP.
  t("CHS no meio da digitação não encerra a entrada",
    hpDigito(hpDigito(hpDigito(hpNovo(), "5"), "0"), "0") && hpUnaria(hpDigito(hpNovo(), "5"), "chs").digitando === true);
  t("CHS duas vezes volta ao positivo",
    hpUnaria(hpUnaria(hpDigito(hpNovo(), "7"), "chs"), "chs").entrada === "7");
  // o clássico da HP: a pilha NÃO cai depois do %, então dá para subtrair
  perto("1000 menos 10%", "1000 E 10 % -", 900);
  perto("a tecla % devolve a PARCELA, não o total", "1000 E 10 %", 100);
  perto("variação percentual Δ%", "200 E 250 d%", 25);
  // ENTER desliga o lift: o próximo número substitui X
  {
    const m = teclar("5 E 3");
    t("depois de ENTER, o número digitado não empurra a pilha", m.y === 5, `y=${m.y}`);
  }
  {
    const m = teclar("1 E 2 E 3 E 4");
    t("a pilha tem só 4 níveis: o mais antigo cai fora", m.t === 2 || m.z === 2, `z=${m.z} t=${m.t}`);
  }
  t("dividir por zero dá erro, não Infinity", teclar("5 E 0 /").erro === "Error 0");
  t("raiz de negativo dá erro", teclar("9 chs sqrt").erro === "Error 0");
  t("erro não vira número silencioso", hpVisor(teclar("5 E 0 /")) === "Error 0");

  // financeiras pelo teclado
  {
    const m = teclar("360 n 1 i 100000 pv pmt");
    t("360 n · 1 i · 100000 PV · PMT → −1.028,61", Math.abs(m.x - (-1028.6125)) < 0.01, String(m.x));
    t("o registrador PMT ficou gravado", Math.abs(m.fin.pmt - m.x) < 1e-9);
  }
  {
    const m = teclar("12 n 1 i 1000 chs pv fv");
    t("12 n · 1 i · −1000 PV · FV → 1.126,83", Math.abs(m.x - 1126.825) < 0.01, String(m.x));
  }
  t("CLEAR FIN zera só as financeiras", (() => {
    const m = hpLimpar(teclar("360 n 1 i 100000 pv"), "fin");
    return m.fin.n === 0 && m.fin.i === 0 && m.fin.pv === 0;
  })());
  t("o visor formata com as casas escolhidas", hpVisor({ ...hpNovo(), x: 1234.5678, casas: 2 }) === "1.234,57", hpVisor({ ...hpNovo(), x: 1234.5678, casas: 2 }));
  t("o visor usa vírgula decimal, como no Brasil", /,/.test(hpVisor({ ...hpNovo(), x: 0.5, casas: 2 })));

  // BEGIN muda o resultado, e o app expõe isso
  t("modo BEGIN rende um período a mais",
    Math.abs(tvmResolver({ n: 12, i: 1, pv: 0, pmt: -100, fv: 0 }, "fv", true) /
             tvmResolver({ n: 12, i: 1, pv: 0, pmt: -100, fv: 0 }, "fv", false) - 1.01) < 1e-9);
}

// ================================================================
secao("6f. FERRAMENTAS — planilha, fórmulas e o lacre do exame");
{
  global.PLAN_COLS = eval(s.slice(s.indexOf("const PLAN_COLS = ") + 18, s.indexOf("];", s.indexOf("const PLAN_COLS = ")) + 1));
  global.planTokenizar = extrai("planTokenizar", "\n};");
  global.planCelulasDoIntervalo = extrai("planCelulasDoIntervalo", "\n};");
  const planAvaliar = global.planAvaliar = extrai("planAvaliar", "\n};");
  const planMostrar = extrai("planMostrar", "\n};");

  const c = { A1: "10", A2: "20", A3: "30", B1: "=A1*2", B2: "=SOMA(A1:A3)", C1: "texto" };
  const av = (f, cel) => planAvaliar(f, cel || c, new Set());
  t("aritmética simples", av("2+3*4").v === 14);
  t("parênteses mudam a ordem", av("(2+3)*4").v === 20);
  t("potência", av("2^10").v === 1024);
  t("menos unário", av("-5+2").v === -3);
  t("vírgula é o separador decimal", av("1,5*2").v === 3);
  t("referência a célula", av("A1+A2").v === 30);
  t("referência a fórmula de outra célula", av("B1+1").v === 21);
  t("SOMA com intervalo", av("SOMA(A1:A3)").v === 60);
  t("MÉDIA com intervalo", av("MÉDIA(A1:A3)").v === 20);
  t("MÁXIMO e MÍNIMO", av("MÁXIMO(A1:A3)").v === 30 && av("MÍNIMO(A1:A3)").v === 10);
  t("CONT conta as células do intervalo", av("CONT(A1:A3)").v === 3);
  t("funções compõem", av("SOMA(A1:A3)/CONT(A1:A3)").v === 20);
  t("ARRED com casas", av("ARRED(1,23456;2)").erro === "#SINTAXE" || Math.abs(av("ARRED(1,23456,2)").v - 1.23) < 1e-9);
  t("célula com texto conta como zero, não quebra", av("C1+5").v === 5);
  t("célula vazia é zero", av("Z9+5").erro === "#SINTAXE" || av("F9+5").v === 5);
  t("divisão por zero vira #DIV/0", av("1/0").erro === "#DIV/0");
  t("função inexistente vira #NOME", av("FOO(1)").erro === "#NOME");
  t("sintaxe quebrada vira #SINTAXE", av("2+").erro === "#SINTAXE" && av("((2)").erro === "#SINTAXE");
  t("caractere estranho não passa", av("2 & 3").erro === "#SINTAXE");
  // o perigo real de um avaliador: referência circular travando o app
  {
    const ciclo = { A1: "=A2", A2: "=A1" };
    const r = planMostrar("A1", ciclo);
    t("referência circular vira #CICLO em vez de travar", r === "#CICLO", r);
  }
  {
    const longo = { A1: "=A2", A2: "=A3", A3: "=A1" };
    t("ciclo de três células também é pego", planMostrar("A1", longo) === "#CICLO");
  }
  t("nada de eval() no avaliador da planilha",
    !/eval\(/.test(s.slice(s.indexOf("const planAvaliar"), s.indexOf("const planMostrar"))));
  t("planMostrar devolve o texto cru quando não é fórmula", planMostrar("C1", c) === "texto");
  t("intervalo cobre as duas pontas", global.planCelulasDoIntervalo("A1", "B2").length === 4);

  // ---- fórmulas
  const iF = s.indexOf("const FORMULAS = [");
  const FORMULAS = eval(s.slice(iF + "const FORMULAS = ".length, s.indexOf("\n];", iF) + 2));
  t(`${FORMULAS.length} fórmulas na folha`, FORMULAS.length >= 20);
  t("toda fórmula tem grupo, nome e equação", FORMULAS.every((f) => f.g && f.f && f.e));
  t("a folha admite que não é a oficial da ANBIMA",
    /reconstrução nossa/.test(s) && /não publica/.test(s));
  t("tem a taxa real de Fisher, que a banca adora", FORMULAS.some((f) => /Fisher/.test(f.f)));
  t("tem taxa equivalente composta", FORMULAS.some((f) => /equivalente/.test(f.f)));

  // ---- o lacre: o que aparece DENTRO da prova
  t("as ferramentas abrem dentro da prova", /setFerrAberta\(true\)/.test(s));
  t("dentro da prova, a HP-12C fica de fora (noExame)",
    /<Ferramentas estado=\{ferr\} setEstado=\{setFerr\} noExame=\{true\} \/>/.test(s));
  t("a lista de abas filtra pelo que existe no exame", /\.filter\(\(a\) => !noExame \|\| a\.exame\)/.test(s));
  t("a HP-12C está marcada como não-exame", /\{ k: "hp", r: "HP-12C", exame: false \}/.test(s));
  t("o app avisa que a HP-12C não estará no exame", /Isto NÃO estará no seu exame/.test(s));
  t("o aviso cita o item do edital", /edital 13\.11/.test(s));
  t("rascunho e planilha são guardados; teclas da calculadora não",
    /ferr: \{ notas: ferr\.notas \|\| "", plan: ferr\.plan \|\| \{\} \}/.test(s));
  // DOIS BUGS REAIS, pegos abrindo a tela e usando:
  t("algo DISPARA a gravação do rascunho e da planilha",
    /useEffect\(\(\) => \{\s*if \(!loaded\) return;\s*const t = setTimeout\(\(\) => salvar\(\{\}\), 700\);/.test(s));
  t("a célula em edição é estado de INTERFACE, fora dos dados",
    /const \[editando, setEditando\] = useState\(null\);/.test(s) && !/__editando/.test(s));
  t("o que vai para o disco não carrega controle de foco",
    !/__editando/.test(s));
}

// ================================================================
secao("6g. CAMADA VISUAL — decoração não pode esconder conteúdo");
{
  const css = s.slice(s.indexOf("const VISUAL_CSS = `"), s.indexOf("`;", s.indexOf("const VISUAL_CSS = `")));
  // A primeira versão escondia por padrão e a home abriu EM BRANCO em
  // produção. O estado escondido agora só existe sob <html data-rv="1">,
  // que o JS só liga depois de confirmar que consegue revelar.
  t("o estado escondido depende da marca que o JS liga",
    /\[data-rv="1"\] \.rv\{opacity:0/.test(css));
  t("não existe regra que esconda .rv sem essa marca",
    !/(^|[^\]])\.rv\{opacity:0/.test(css.replace(/\[data-rv="1"\] \.rv\{opacity:0/g, "")));
  t("o JS marca a raiz só depois de medir os alvos",
    /raiz\.setAttribute\("data-rv", "1"\);\s*\/\/ agora sim/.test(s));
  t("sem IntersectionObserver, a marca é removida e tudo fica visível",
    /if \(!podeAnimar\) \{ raiz\.removeAttribute\("data-rv"\); return; \}/.test(s));
  t("com movimento reduzido, nem arma o modo escondido",
    /const podeAnimar = typeof IntersectionObserver !== "undefined" &&/.test(s) &&
    /!\(window\.matchMedia && window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)\.matches\)/.test(s) &&
    /if \(!podeAnimar\)/.test(s));
  t("há rede de segurança que revela tudo depois de 1,2 s",
    /document\.querySelectorAll\("\.rv:not\(\[data-on\]\)"\)\.forEach\(revelar\);\s*\n\s*\}, 1200\)/.test(s));
  t("o que já está na dobra é revelado sem esperar o observador",
    /requestAnimationFrame\(\(\) => daDobra\.forEach\(revelar\)\)/.test(s));
  // BUG REAL: o efeito rodava antes de o conteúdo existir, achava zero
  // alvos, DESARMAVA a marca e nunca mais voltava — nenhuma revelação.
  t("sem alvos o efeito apenas sai, não desarma a marca",
    /if \(!alvos\.length\) return;/.test(s) && !/if \(!alvos\.length\) \{ raiz\.removeAttribute/.test(s));
  t("a revelação roda de novo quando o conteúdo carrega",
    /useRevelar\(tela \+ "\|" \+ loaded\)/.test(s));
  // usar data-attribute em vez de className: o React não apaga o que não gerencia
  t("a revelação usa data-on, não classe (o React reescreveria a classe)",
    /el\.setAttribute\("data-on", "1"\)/.test(s) && !/classList\.add\("on"\)/.test(s));

  // o exame continua austero
  t("o exame desliga aurora, luz e revelação", /\.cx-lacrado \.cx-aurora\{display:none\}/.test(css) &&
    /\.cx-lacrado \[data-luz\]::before\{display:none\}/.test(css) &&
    /\.cx-lacrado \.rv\{opacity:1!important/.test(css));
  t("o exame não tem lift nem brilho no título",
    /\.cx-lacrado \.cx-alt:hover:not\(:disabled\)\{transform:none/.test(css) &&
    /\.cx-lacrado \.cx-h1\{animation:none/.test(css));
  // e a preferência do sistema desliga tudo
  t("prefers-reduced-motion desliga aurora, revelação e varredura",
    /@media \(prefers-reduced-motion:reduce\)\{[\s\S]{0,400}\.cx-aurora\{display:none\}/.test(css));
  // só transform e opacity animam: nada que force recálculo de layout
  {
    const keyframes = css.match(/@keyframes[^{]*\{[\s\S]*?\}\s*\}/g) || [];
    const proibidas = /\b(width|height|top|left|right|bottom|margin|padding)\s*:/;
    const ruins = keyframes.filter((k) => proibidas.test(k.replace(/background-position[^;]*;?/g, "")));
    t(`as ${keyframes.length} animações mexem só em transform/opacity/cor`, ruins.length === 0,
      ruins.slice(0, 1).join("").slice(0, 120));
  }
  t("um listener de ponteiro para o app inteiro, e passivo",
    /window\.addEventListener\("pointermove", aoMover, \{ passive: true \}\)/.test(s));
  t("o scroll também é passivo e só escreve variável CSS",
    /window\.addEventListener\("scroll", aoRolar, \{ passive: true \}\)/.test(s));
  t("o ponteiro é limitado a um quadro por vez (requestAnimationFrame)",
    /if \(pedido\) return;\s*\n\s*pedido = requestAnimationFrame/.test(s));
  t("sem cursor, o listener de ponteiro nem é instalado", /if \(!semCursor\) window\.addEventListener\("pointermove"/.test(s));
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
  t("há completação para o caso de o arredondamento não fechar", /if \(chaves\.length < alvo\) \{/.test(s) && /pegar\(ELEGIVEIS_EXAME, alvo - chaves\.length\)/.test(s));
  t("a completação NÃO é silenciosa: fica registrada em `faltou`",
    /faltou\.push\(\{ m: "qualquer", d: "qualquer"/.test(s));
  t("a completação também respeita a exclusão do exame",
    /CHAVES_POR_MODULO\[m\]\.filter\(\(k\) => !IDX_Q\[k\]\.foraDoExame\)/.test(s));
  t("o índice por dificuldade já exclui as questões fora do exame",
    /CHAVES_POR_MODULO\[m\.id\]\.filter\(\(k\) => !IDX_Q\[k\]\.foraDoExame\)/.test(s));
  t("questão fora do exame continua no estudo, com o motivo na tela",
    /q\.foraDoExame && \(/.test(s) && /className="cx-fora"/.test(s) && /\{q\.motivoFora\}/.test(s));
  t("o sorteio reparte a cota do módulo em fácil/médio/difícil", /const alvoPorFaixa = cotaMaiorResto\(cota, restoDif/.test(s));
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
  t("a árvore corta no décimo item", /itens\.length < REGRAS_EXAME\.itensArvore\.valor/.test(s));

  // REGRESSÃO: pop() dentro do find() era chamado a cada comparação e
  // esvaziava o baralho, devolvendo undefined. A prova quebrava ao montar.
  // REGRESSÃO HISTÓRICA: `pop()` era chamado DENTRO do callback do `find()`,
  // uma vez por comparação, e esvaziava o baralho. A montagem devolvia
  // undefined e a prova quebrava. O laço foi reescrito e não usa mais esse
  // par, então o antigo grep virou letra morta — e grep nunca provou nada
  // disso mesmo. Os testes agora exercitam o comportamento.
  t("item de árvore inexistente é descartado sem derrubar a montagem",
    /if \(!a\) \{ baralho\.splice\(i, 1\); continue; \}/.test(s));
  t("a preferência de um atendimento por módulo está declarada",
    /const tentar = \(respeitarModulo\)/.test(s) && /tentar\(true\);/.test(s) && /tentar\(false\);/.test(s));
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

  // ==================================================================
  // MONTAGEM DE VERDADE — a função real, executada, com os itens contados.
  //
  // Tudo o que existia antes disto era busca de texto no arquivo. Texto não
  // prova comportamento: as cotas de módulo eram aplicadas só às 40 de
  // múltipla escolha, os 10 itens de árvore entravam com o módulo 3 fixo, e
  // TODOS os testes passavam. A prova de 50 itens saía em M1 16 / M2 32 /
  // M3 44 / M4 8 contra os 20/40/30/10 do Programa Detalhado, e nada acusou.
  // ==================================================================
  if (global.__real) {
    const R = global.__real;
    const N = 120;

    // --- cotaMaiorResto: teste unitário da política de arredondamento
    {
      const c1 = R.cotaMaiorResto(50, { "1": 20, "2": 40, "3": 30, "4": 10 }, ["1", "2", "3", "4"]);
      t("cotas de módulo sobre 50 dão exatamente 10/20/15/5",
        c1["1"] === 10 && c1["2"] === 20 && c1["3"] === 15 && c1["4"] === 5,
        JSON.stringify(c1));
      const c2 = R.cotaMaiorResto(50, { 1: 25, 2: 50, 3: 25 }, ["1", "2", "3"]);
      t("cotas de dificuldade sobre 50 somam 50 e resolvem o 12,5 pela ordem declarada",
        c2["1"] + c2["2"] + c2["3"] === 50 && c2["2"] === 25 && c2["1"] >= c2["3"],
        JSON.stringify(c2));
      // determinismo: mesma entrada, mesma saída, sempre
      let igual = true;
      for (let i = 0; i < 50; i++) {
        const x = R.cotaMaiorResto(50, { 1: 25, 2: 50, 3: 25 }, ["1", "2", "3"]);
        if (JSON.stringify(x) !== JSON.stringify(c2)) igual = false;
      }
      t("o arredondamento é determinístico (50 repetições, mesmo resultado)", igual);
      // caso degenerado: nada a repartir não pode explodir nem inventar item
      const c3 = R.cotaMaiorResto(0, { 1: 25, 2: 50, 3: 25 }, ["1", "2", "3"]);
      t("repartir zero item devolve zero em todos os baldes",
        c3["1"] === 0 && c3["2"] === 0 && c3["3"] === 0);
    }

    // --- montagem completa
    const provas = [];
    let erroMonta = null;
    try { for (let i = 0; i < N; i++) provas.push(R.montarItensProva([])); }
    catch (e) { erroMonta = e.message; }
    t(`${N} montagens completas sem erro`, !erroMonta, erroMonta);

    // ------------------------------------------------------------------
    // O CHAMADOR TAMBÉM PRECISA EXECUTAR.
    //
    // Bug real de 10/09/2026, encontrado clicando no app e não aqui: ao mover
    // a montagem para fora do componente, `montarProva` continuou usando a
    // variável `alvo`, que passou a existir só dentro da função extraída.
    // Resultado: "Começar o exame" lançava ReferenceError e não acontecia
    // nada. TODOS os testes passavam, porque exercitavam a função extraída e
    // nunca quem a chama.
    //
    // A lição, e o motivo deste bloco: testar a peça não é testar a montagem.
    // Aqui o corpo de `montarProva` é executado de verdade, com as mesmas
    // dependências, e o objeto resultante é conferido campo a campo.
    // ------------------------------------------------------------------
    {
      const corpo = s.slice(s.indexOf("const montarProva = () => {"));
      const fim = corpo.indexOf("\n  };");
      const fonte = corpo.slice("const montarProva = () => {".length, fim);
      let erroChamador = null, p = null;
      try {
        const f = new Function("montarItensProva", "REGRAS_EXAME", "VERSAO_GABARITO", "historico",
          fonte.replace(/^\s*const \{/, "const {"));
        p = f(R.montarItensProva, R.REGRAS_EXAME, "vTeste", []);
      } catch (e) { erroChamador = e.message; }
      t("montarProva() — o chamador — executa sem variável perdida", !erroChamador, erroChamador);
      if (p) {
        t("a prova montada tem 50 itens, prazo absoluto e versão de gabarito",
          p.itens.length === 50 && p.fimEm > p.inicio && p.versaoGabarito === "vTeste");
        t("a prova montada guarda as cotas alvo e as obtidas",
          !!p.cotas && !!p.cotas.alvoMod && !!p.cotas.obtido && Array.isArray(p.cotas.faltou));
        t("a prova montada declara quantas são de múltipla escolha",
          p.regras.mc === 40, "veio " + p.regras.mc);
        t("a prova nasce não entregue, no item 0", p.entregue === false && p.i === 0);
      }
    }

    if (!erroMonta) {
      const itensDe = (p) => [...p.itensMC, ...p.itensArv];

      t("toda prova tem exatamente 50 itens",
        provas.every((p) => itensDe(p).length === R.TOTAL_ITENS_PROVA),
        "tamanhos: " + [...new Set(provas.map((p) => itensDe(p).length))].join("/"));

      t("toda prova tem 40 de múltipla escolha e 10 de árvore",
        provas.every((p) => p.itensMC.length === 40 && p.itensArv.length === 10));

      t("nenhuma questão se repete dentro da mesma prova",
        provas.every((p) => {
          const ch = itensDe(p).map((x) => x.chave);
          return new Set(ch).size === ch.length;
        }));

      // O que o defeito corrigido produzia: módulo fixo em "3" na árvore.
      t("nenhum item de árvore usa módulo fixo — cada um traz o da sua árvore",
        provas.every((p) => p.itensArv.every((x) => {
          const a = R.ARVORES.find((y) => y.id === x.arvId);
          return a && x.mId === a.mId;
        })));

      t("todo item de árvore tem dificuldade rotulada",
        provas.every((p) => p.itensArv.every((x) => [1, 2, 3].includes(x.dif))));

      // --- distribuição sobre os 50, que é o coração da correção
      const somaMod = { 1: 0, 2: 0, 3: 0, 4: 0 }, somaDif = { 1: 0, 2: 0, 3: 0 };
      let piorMod = 0, piorDif = 0;
      provas.forEach((p) => {
        const m = { 1: 0, 2: 0, 3: 0, 4: 0 }, d = { 1: 0, 2: 0, 3: 0 };
        itensDe(p).forEach((x) => { m[x.mId]++; d[x.dif]++; somaMod[x.mId]++; somaDif[x.dif]++; });
        [1, 2, 3, 4].forEach((k) => { piorMod = Math.max(piorMod, Math.abs(m[k] - R.cotaMaiorResto(50, R.PESOS, ["1", "2", "3", "4"])[k])); });
        const aD = R.cotaMaiorResto(50, { 1: 25, 2: 50, 3: 25 }, ["1", "2", "3"]);
        [1, 2, 3].forEach((k) => { piorDif = Math.max(piorDif, Math.abs(d[k] - aD[k])); });
      });
      const tot = N * 50;
      const pctM = (k) => (somaMod[k] / tot) * 100;
      const pctD = (k) => (somaDif[k] / tot) * 100;
      t(`módulos batem os 20/40/30/10 do Programa Detalhado (deu ${pctM(1).toFixed(1)}/${pctM(2).toFixed(1)}/${pctM(3).toFixed(1)}/${pctM(4).toFixed(1)})`,
        Math.abs(pctM(1) - 20) <= 1 && Math.abs(pctM(2) - 40) <= 1
        && Math.abs(pctM(3) - 30) <= 1 && Math.abs(pctM(4) - 10) <= 1);
      t(`dificuldade bate os 25/50/25 sobre os 50 itens (deu ${pctD(1).toFixed(1)}/${pctD(2).toFixed(1)}/${pctD(3).toFixed(1)})`,
        Math.abs(pctD(1) - 25) <= 2 && Math.abs(pctD(2) - 50) <= 2 && Math.abs(pctD(3) - 25) <= 2);
      t(`nenhuma prova individual desvia mais de 2 itens da cota de módulo (pior: ${piorMod})`, piorMod <= 2);
      t(`nenhuma prova individual desvia mais de 3 itens da cota de dificuldade (pior: ${piorDif})`, piorDif <= 3);

      // --- a conversa da árvore nunca começa no meio
      t("as decisões de cada atendimento vêm em sequência a partir da primeira",
        provas.every((p) => {
          const por = {};
          p.itensArv.forEach((x) => { (por[x.arvId] = por[x.arvId] || []).push(x.passo); });
          return Object.values(por).every((ps) => ps.join(",") === ps.map((_, i) => i).join(","));
        }));

      // --- banco insuficiente é DENUNCIADO, não completado em silêncio
      const semFalta = provas.filter((p) => p.faltou.length === 0).length;
      t(`com o banco atual nenhum balde fica sem material (${semFalta}/${N} montagens limpas)`, semFalta === N,
        "exemplo: " + JSON.stringify((provas.find((p) => p.faltou.length) || {}).faltou));

      // --- memória entre provas: a 2ª prova reaproveita menos
      {
        const p1 = R.montarItensProva([]);
        const hist = [{ itens: [...p1.itensMC, ...p1.itensArv] }];
        const p2 = R.montarItensProva(hist);
        const arv1 = new Set(p1.itensArv.map((x) => x.arvId));
        const arv2 = new Set(p2.itensArv.map((x) => x.arvId));
        const repetiu = [...arv2].filter((x) => arv1.has(x)).length;
        t("a prova seguinte não repete nenhum atendimento da anterior", repetiu === 0, repetiu + " repetidos");
        const mc1 = new Set(p1.itensMC.map((x) => x.chave));
        const rep = p2.itensMC.filter((x) => mc1.has(x.chave)).length;
        t(`a prova seguinte repete pouca múltipla escolha (repetiu ${rep} de 40)`, rep <= 2);
      }
    }
  } else {
    t("as peças da montagem foram exportadas para teste", false, "__real não veio do contexto");
  }

  // ------------------------------------------------------------------
  // MEMÓRIA ENTRE PROVAS
  //
  // O Paulo relatou "sempre respondo as mesmas questões" no modo prova. A
  // causa estava nas árvores: 10 dos 50 itens saíam de um pool pequeno e o
  // sorteio não guardava nada de uma prova para a outra.
  //
  // Estes testes exercitam o `porFrescor` de verdade, com o mesmo código que
  // está no motor, e não só a presença do texto no arquivo.
  // ------------------------------------------------------------------
  t("o sorteio lê a recência do histórico", /const recencia = new Map\(\)/.test(s));
  t("nunca sorteada vem antes da já sorteada", /recencia\.has\(a\) \? recencia\.get\(a\) : Infinity/.test(s));
  t("o baralho de árvores também passa pelo frescor", /porFrescor\(ARVORES\.map\(\(a\) => "@" \+ a\.id\)\)/.test(s));
  {
    // reconstrói porFrescor exatamente como no motor
    const mkFrescor = (recencia) => (lista) => shuffle(lista).sort((a, b) => {
      const ra = recencia.has(a) ? recencia.get(a) : Infinity;
      const rb = recencia.has(b) ? recencia.get(b) : Infinity;
      return rb - ra;
    });

    // 1. o que nunca saiu tem prioridade absoluta sobre o que já saiu
    {
      const rec = new Map([["a", 0], ["b", 3]]);
      let erro = 0;
      for (let i = 0; i < 200; i++) {
        const o = mkFrescor(rec)(["a", "b", "c", "d"]);
        if (o.indexOf("c") > 2 || o.indexOf("d") > 2) erro++;   // c e d são inéditas
        if (o.indexOf("b") > o.indexOf("a")) erro++;            // b é mais antiga que a
      }
      t("200 ordenações põem as inéditas na frente e a mais antiga antes da recente", erro === 0, erro + " erradas");
    }

    // 2. dentro da mesma faixa de recência a ordem varia (senão vira fila fixa)
    {
      const rec = new Map();
      const primeiros = new Set();
      for (let i = 0; i < 200; i++) primeiros.add(mkFrescor(rec)(["a", "b", "c", "d", "e"])[0]);
      t("entre iguais o sorteio continua aleatório", primeiros.size >= 4, "só " + primeiros.size + " começos diferentes");
    }

    // 3. o efeito prático: com 20 árvores, quantas provas até repetir uma?
    //    Sem memória, o esperado é repetir já na 2ª ou 3ª prova.
    const simular = (nArv, comMemoria, provas) => {
      const ids = [...Array(nArv)].map((_, i) => "A." + i);
      const rec = new Map();
      const historico = [];
      let repetiuEm = 0;
      for (let p = 0; p < provas; p++) {
        rec.clear();
        if (comMemoria) historico.forEach((usadas, idx) => usadas.forEach((k) => {
          if (!rec.has(k) || rec.get(k) > idx) rec.set(k, idx);
        }));
        const baralho = (comMemoria ? mkFrescor(rec)(ids) : shuffle(ids)).reverse();
        const usadas = [];
        let itens = 0;
        while (itens < 10 && baralho.length) {
          const id = baralho.pop();
          usadas.push(id);
          itens += Math.min(6, 10 - itens);
        }
        if (p > 0 && usadas.some((k) => historico[0].includes(k)) && !repetiuEm) repetiuEm = p + 1;
        historico.unshift(usadas);   // índice 0 = prova mais recente
      }
      return repetiuEm;
    };
    // com 5 árvores e sem memória, a prova seguinte reencontra uma das duas
    // quase sempre — é exatamente o que o Paulo estava vendo.
    let semMem = 0;
    for (let i = 0; i < 200; i++) if (simular(5, false, 2) === 2) semMem++;
    t(`com 5 árvores e sem memória, a 2ª prova repete em ${Math.round(semMem / 2)}% das vezes`, semMem / 200 > 0.5);
    let comMem = 0;
    for (let i = 0; i < 200; i++) if (simular(20, true, 2) === 2) comMem++;
    t("com 20 árvores e memória, a 2ª prova nunca repete", comMem === 0, comMem + " repetiram");
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
