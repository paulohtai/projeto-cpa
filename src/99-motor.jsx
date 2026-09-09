// =====================================================================
// ÍNDICES
// =====================================================================
const IDX_Q = {};
const IDX_NIVEL = {};
const IDX_BLOCO = {};
MODULOS.forEach((m) => {
  m.blocos.forEach((b) => {
    IDX_BLOCO[b.id] = { ...b, mId: m.id };
    b.niveis.forEach((n) => {
      IDX_NIVEL[n.id] = { ...n, mId: m.id, bId: b.id, bTitulo: b.titulo };
      n.questoes.forEach((q, i) => {
        const k = `${n.id}|${i}`;
        IDX_Q[k] = { ...q, key: k, mId: m.id, bId: b.id, nId: n.id, origem: `${n.id} ${n.titulo}` };
      });
    });
    b.boss.forEach((q, i) => {
      const k = `${b.id}|BOSS|${i}`;
      IDX_Q[k] = { ...q, key: k, mId: m.id, bId: b.id, nId: "BOSS", origem: `Chefão ${b.id}` };
    });
  });
});
const CHAVES_POR_MODULO = {};
MODULOS.forEach((m) => (CHAVES_POR_MODULO[m.id] = Object.keys(IDX_Q).filter((k) => IDX_Q[k].mId === m.id)));
// mesmo índice, agora quebrado por dificuldade (1 fácil · 2 médio · 3 difícil)
// para o exame conseguir montar os 25% / 50% / 25% que a ANBIMA publica.
const CHAVES_POR_MODULO_DIF = {};
MODULOS.forEach((m) => {
  CHAVES_POR_MODULO_DIF[m.id] = { 1: [], 2: [], 3: [] };
  CHAVES_POR_MODULO[m.id].filter((k) => !IDX_Q[k].foraDoExame).forEach((k) => {
    const d = IDX_Q[k].dif;
    CHAVES_POR_MODULO_DIF[m.id][d === 1 || d === 3 ? d : 2].push(k);
  });
});
const TODAS_CHAVES = Object.keys(IDX_Q);
// Questões cujo conteúdo não tem lastro em nenhuma das fontes declaradas
// ficam FORA do sorteio do exame — avaliação não cobra o que não dá para
// justificar. Continuam disponíveis no estudo, com o aviso na tela.
// (Precisa vir DEPOIS de TODAS_CHAVES: `const` não sobe, e usar antes
//  derruba o app inteiro na carga. Já aconteceu; o teste de fumaça pega.)
const ELEGIVEIS_EXAME = TODAS_CHAVES.filter((k) => !IDX_Q[k].foraDoExame);
const FORA_DO_EXAME = TODAS_CHAVES.filter((k) => IDX_Q[k].foraDoExame);
const TODOS_NIVEIS = Object.values(IDX_NIVEL);
const TOTAL_NIVEIS = TODOS_NIVEIS.length;
const TOTAL_QUESTOES = TODAS_CHAVES.length;

const CORES = { "1": "azul", "2": "verde", "3": "laranja", "4": "roxo" };

const PATENTES = [
  { xp: 0, nome: "Estagiário do balcão", emoji: "🪑" },
  { xp: 300, nome: "Caixa", emoji: "💵" },
  { xp: 800, nome: "Gerente de contas", emoji: "🤝" },
  { xp: 1600, nome: "Assessor de investimentos", emoji: "📈" },
  { xp: 2800, nome: "Planejador financeiro", emoji: "🧭" },
  { xp: 4200, nome: "Banker do private", emoji: "🏛️" },
  { xp: 6000, nome: "Lenda da ANBIMA", emoji: "👑" },
];

const mainsOf = (n) => n.questoes.slice(0, -1);
const patenteAtual = (xp) => { let p = PATENTES[0]; for (const x of PATENTES) if (xp >= x.xp) p = x; return p; };
const proxPatente = (xp) => PATENTES.find((p) => p.xp > xp) || null;
const brl = (n) => n.toLocaleString("pt-BR");
const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
// A prova passa de uma hora: "149:36" não se lê. Acima de 60 min, mostra h:mm:ss.
const fmtRelogio = (s) => {
  const h = Math.floor(s / 3600);
  if (!h) return fmtTime(s);
  return `${h}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const embaralhar = (q) => {
  if (!q || !Array.isArray(q.alts)) return q;
  const o = shuffle(q.alts.map((_, i) => i));
  return { ...q, alts: o.map((i) => q.alts[i]), c: o.indexOf(q.c) };
};
// Ordem de apresentação das alternativas de um atendimento. Sorteada UMA vez
// por tentativa e guardada junto com ela: a associação entre o que está na
// tela e o grau/comentário nunca se perde, e a ordem não muda ao voltar.
// As escolhas são gravadas pelo ÍNDICE ORIGINAL, não pela posição na tela.
const ordemAlts = (n) => shuffle(Array.from({ length: n }, (_, i) => i));
const ordensDaArvore = (a) => a.prompts.map((p) => ordemAlts(p.alts.length));
// Ordem do passo, com rede de segurança: se a tentativa vier de uma versão
// antiga do app (sem `ordens`), cai na ordem de declaração em vez de quebrar.
const ordemDoPasso = (a, arv, i) => {
  const o = arv && arv.ordens && arv.ordens[i];
  const n = a.prompts[i].alts.length;
  if (Array.isArray(o) && o.length === n) return o;
  return Array.from({ length: n }, (_, k) => k);
};
// exemplo da ficha: caso escrito só para a ficha, fora do banco de questões
const exemploDoNivel = (n) => {
  const e = EXEMPLOS[n.id];
  return e ? { caso: e[0], resolve: e[1] } : null;
};

// =====================================================================
// TERMOS CLICÁVEIS — marca o vocabulário técnico no CONTEÚDO das pílulas.
// Nunca roda em questões, alternativas ou explicações: a caixinha explica
// o termo, não pode entregar resposta de exercício.
// =====================================================================
// plurais irregulares e variantes de escrita que apontam para a mesma verbete
const ALIASES = {
  "ações": "ação", "opções": "opção", "cotações": "cota",
  "WACC": "CMPC", "Chinese Wall": "chinese wall", "muralha da China": "chinese wall",
  "come cotas": "come-cotas", "insider": "insider trading",
  "análise do perfil do investidor": "API", "juros sobre capital próprio": "JCP",
  "arrendamento mercantil": "leasing", "valor presente líquido": "VPL",
  "taxa interna de retorno": "TIR", "conheça seu cliente": "KYC",
  "desdobramento": "split", "grupamento": "inplit",
  // plurais em -ais / -ões, que o sufixo automático não alcança
  "investidores profissionais": "investidor profissional",
  "investidores qualificados": "investidor qualificado",
  "juros reais": "juro real", "ativos subjacentes": "ativo subjacente",
  "derivativos": "derivativo", "criptoativos": "criptoativo",
};
// palavras ambíguas: ficam no glossário para consulta, mas NÃO viram link
// automático, porque no conteúdo elas aparecem em outro sentido —
// "termo de adesão", "opção de compra", "os juros são o prêmio por esperar".
const NAO_MARCAR = new Set(["termo", "opção", "prêmio"]);
const VERBETES = { ...GLOSSARIO };
const CHAVE_DE = (t) => (GLOSSARIO[t] ? t : ALIASES[t] || null);
// alternação por tamanho decrescente: "taxa de performance" vence "performance"
const TERMOS_ORD = [...Object.keys(GLOSSARIO), ...Object.keys(ALIASES)]
  .filter((t) => !NAO_MARCAR.has(t))
  .sort((a, b) => b.length - a.length);
const escapaRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// cada palavra do termo aceita plural: pega "fundos abertos" e
// "investidores qualificados" a partir de "fundo aberto" e "investidor qualificado"
const comPlural = (t) => t.split(" ").map((p) => escapaRe(p) + (/[a-zA-ZÀ-ÿ]{3,}$/.test(p) ? "(?:es|s)?" : "")).join(" ");
const RE_TERMOS = new RegExp("(?:" + TERMOS_ORD.map(comPlural).join("|") + ")", "gi");
const LETRA = /[0-9A-Za-zÀ-ÿ]/;
// siglas só casam em caixa alta: evita "IR" pegar o verbo "ir", "API" pegar "api"
const eSigla = (t) => t === t.toUpperCase() && /^[A-Z0-9\-]{2,6}$/.test(t);
const semPlural = (txt) => txt.toLowerCase().split(/\s+/).map((p) => p.replace(/(es|s)$/, "")).join(" ");
const IDX_TERMO = {};
TERMOS_ORD.forEach((t) => { IDX_TERMO[semPlural(t)] = t; });
const acharChave = (trecho) => {
  const exata = TERMOS_ORD.find((t) => t === trecho);
  if (exata) return CHAVE_DE(exata);
  const cand = IDX_TERMO[semPlural(trecho)];
  if (cand && !eSigla(cand)) return CHAVE_DE(cand);
  if (cand && eSigla(cand) && trecho === trecho.toUpperCase()) return CHAVE_DE(cand);
  return null;
};
// devolve os pedaços do parágrafo, com os termos virando botões.
// "vistos" evita repetir o mesmo termo várias vezes na mesma pílula.
const marcarTermos = (texto, vistos, aoTocar) => {
  const saida = [];
  let ultimo = 0, m;
  RE_TERMOS.lastIndex = 0;
  while ((m = RE_TERMOS.exec(texto)) !== null) {
    const ini = m.index, fim = ini + m[0].length;
    const antes = ini > 0 ? texto[ini - 1] : "";
    const depois = fim < texto.length ? texto[fim] : "";
    const chave = acharChave(m[0]);
    if (LETRA.test(antes) || LETRA.test(depois) || !chave || vistos.has(chave)) {
      RE_TERMOS.lastIndex = ini + 1;
      continue;
    }
    vistos.add(chave);
    if (ini > ultimo) saida.push(texto.slice(ultimo, ini));
    saida.push(
      <button key={chave + ini} className="cx-termo" onClick={() => aoTocar(chave)}
        aria-label={"O que significa " + chave}>{m[0]}</button>
    );
    ultimo = fim;
  }
  if (ultimo < texto.length) saida.push(texto.slice(ultimo));
  return saida;
};

// =====================================================================
// SINCRONIA ENTRE APARELHOS
// O app continua sem servidor próprio: quem guarda é um endereço que
// VOCÊ configura (veja sync/COMO-CONFIGURAR.md). Sem endereço, nada é
// enviado para lugar nenhum — o app funciona 100% local, como sempre.
// Regra de conflito: vence a versão com a data mais recente.
// =====================================================================
const nuvemBuscar = async (url, cod) => {
  const r = await fetch(url.replace(/\/+$/, "") + "?c=" + encodeURIComponent(cod), { cache: "no-store" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
};
const nuvemEnviar = async (url, cod, estado) => {
  const r = await fetch(url.replace(/\/+$/, "") + "?c=" + encodeURIComponent(cod), {
    method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(estado),
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
};
const novoCodigo = () => {
  const abc = "abcdefghijkmnopqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 20; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s.slice(0, 5) + "-" + s.slice(5, 10) + "-" + s.slice(10, 15) + "-" + s.slice(15);
};
let temporizadorNuvem = null; // envio com atraso, para não subir a cada questão
// Último estado que AINDA NÃO chegou à nuvem. Existe por causa de um defeito
// real: o envio era um setTimeout de 4 segundos, e no iPhone basta bloquear a
// tela ou trocar de app para o Safari congelar a página — o timer nunca
// dispara. O progresso ficava salvo no aparelho e invisível para os outros.
let pendenteNuvem = null;
// Envio que sobrevive ao fechamento da página. `keepalive` faz o navegador
// concluir a requisição mesmo depois de a aba morrer (limite de 64 KB; o
// nosso estado tem ~10 KB). sendBeacon não serve aqui porque só faz POST e
// o serviço só aceita PUT.
const nuvemEnviarAgora = (url, cod, estado) => {
  try {
    return fetch(url.replace(/\/+$/, "") + "?c=" + encodeURIComponent(cod), {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify(estado), keepalive: true,
    });
  } catch (e) { return Promise.reject(e); }
};
// Decide o que fazer ao abrir (e ao reconectar). Função pura, para poder
// ser testada sem navegador: "puxar" | "empurrar" | "nada".
const decidirSync = (qLocal, qNuvem) => {
  const l = qLocal || 0, n = qNuvem || 0;
  if (n > l) return "puxar";
  if (l > n) return "empurrar";
  return "nada";
};
// =====================================================================
// HISTÓRICO DE PROVAS NA NUVEM
//
// A tentativa crua ocupa 6,6 KB (50 itens com nome de campo repetido 50
// vezes). Trinta delas dariam 199 KB e o serviço aceita 300 KB — folga
// pequena demais, e o progresso de estudo ainda cresce por dentro.
//
// Em vez de mandar só um resumo, COMPACTAMOS: cada item vira uma linha
// "chave;ordem;gabarito;resposta;marcada". Some o nome dos campos e a
// tentativa cai para ~1,3 KB. Trinta cabem em ~39 KB — e o que trafega é
// a prova INTEIRA, então a revisão item a item funciona em qualquer
// aparelho, não só naquele em que a prova foi feita.
//
// O `gabarito` vai junto de propósito, em vez de ser recalculado a partir
// do banco atual: uma correção feita no banco depois não pode reescrever
// o que aquela prova mostrou na tela.
// =====================================================================
const LIMITE_HIST = 30;
const packItem = (it) => [
  it.tipo === "arvore" ? "@" + it.arvId + "|" + it.passo : it.chave,
  (it.ordem || []).join(""),
  it.tipo === "arvore" ? (it.grauEscolhido === null || it.grauEscolhido === undefined ? "" : it.grauEscolhido) : it.gabarito,
  (it.tipo === "arvore" ? it.escolha : it.resposta) ?? "",
  (it.marcada ? "m" : "") + (it.anulado ? "a" : ""),
  it.anulado ? (it.motivoAnulacao || "") : "",
].join(";");
const unpackItem = (linha) => {
  const [ref, ordem, terceiro, resp, flags, motivo] = String(linha).split(";");
  const marcada = (flags || "").includes("m");
  const anulado = (flags || "").includes("a");
  const base = { ordem: (ordem || "").split("").map(Number), marcada };
  if (anulado) { base.anulado = true; base.motivoAnulacao = motivo || ""; }
  if (ref.startsWith("@")) {
    const [arvId, passo] = ref.slice(1).split("|");
    return { ...base, tipo: "arvore", chave: ref.slice(1), arvId, passo: Number(passo), mId: "3",
      escolha: resp === "" ? null : Number(resp),
      grauEscolhido: terceiro === "" ? null : Number(terceiro) };
  }
  // `mId` e `nId` NÃO viajam: são só rótulos de tela e saem do banco atual.
  // O `gabarito`, esse sim, viaja — porque mexer no banco depois não pode
  // reescrever o que aquela prova mostrou. Rótulo se recalcula; nota, não.
  const q = (typeof IDX_Q !== "undefined" && IDX_Q[ref]) || null;
  return { ...base, tipo: "mc", chave: ref, gabarito: Number(terceiro),
    mId: q ? q.mId : "?", nId: q ? q.nId : ref.split("|")[0],
    resposta: resp === "" ? null : Number(resp) };
};
const packTentativa = (t) => ({
  i: t.id, e: t.entregueEm, m: t.motivoFim, v: t.versaoGabarito,
  n: t.aparelho || "", r: t.resultado, g: t.regras,
  x: (t.itens || []).map(packItem),
});
const unpackTentativa = (p) => ({
  id: p.i, inicio: p.i, entregue: true, entregueEm: p.e, motivoFim: p.m,
  versaoGabarito: p.v, aparelho: p.n || "", resultado: p.r, regras: p.g,
  itens: (p.x || []).map(unpackItem),
});
// União por id, com lápides. Sem isto, a regra do "carimbo mais recente"
// apagaria as provas do outro aparelho a cada sincronização — e apagar uma
// prova num aparelho não pegaria no outro, porque a união a traria de volta.
const mesclarHistorico = (a, b, apagados) => {
  const mortos = new Set((apagados || []).map(Number));
  const porId = new Map();
  [...(a || []), ...(b || [])].forEach((t) => {
    if (!t || !t.id || mortos.has(Number(t.id))) return;
    const anterior = porId.get(t.id);
    // se a mesma prova vier dos dois lados, fica a que tem os itens
    const melhor = !anterior || ((t.itens || []).length > (anterior.itens || []).length) ? t : anterior;
    porId.set(t.id, melhor);
  });
  return [...porId.values()].sort((x, y) => y.id - x.id).slice(0, LIMITE_HIST);
};
const mesclarApagados = (a, b) =>
  [...new Set([...(a || []), ...(b || [])].map(Number).filter(Boolean))].slice(-200);

// Nome curto do aparelho, para a lista dizer onde cada prova foi feita.
const nomeDoAparelho = () => {
  const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Computador";
  return "Aparelho";
};

// Quanto trabalho um estado carrega. Serve para uma pergunta só: puxar a
// nuvem por cima deste aparelho DESTRUIRIA alguma coisa?
const trabalhoDe = (s) => {
  const st = (s && s.stats) || {};
  return {
    respostas: Object.values(st).reduce((a, v) => a + (v.r || 0) + (v.w || 0), 0),
    pilulas: Object.keys((s && s.feitos) || {}).length,
    xp: (s && s.xp) || 0,
  };
};
// A regra do carimbo mais recente é simples, mas cega: quem gravou por
// último leva tudo. Se este aparelho tem respostas ou pílulas que a nuvem
// não tem, puxar apaga esse trabalho. Nesse caso a decisão passa a ser do
// usuário, não do relógio. Função pura, para poder ser testada.
const conflitoDeSync = (local, nuvem) => {
  const l = trabalhoDe(local), n = trabalhoDe(nuvem);
  const perde = [];
  if (l.respostas > n.respostas) perde.push(`${l.respostas - n.respostas} resposta(s)`);
  if (l.pilulas > n.pilulas) perde.push(`${l.pilulas - n.pilulas} pílula(s) vencida(s)`);
  if (l.xp > n.xp) perde.push(`${l.xp - n.xp} XP`);
  return perde.length ? { perde, local: l, nuvem: n } : null;
};

const SAVE_KEY = "projeto-cpa-completo-v1";
const PROVA_KEY = "projeto-cpa-prova-v1";   // tentativa em andamento (separada)
const HIST_KEY = "projeto-cpa-historico-v1"; // tentativas encerradas (imutáveis)
const ESQUEMA = 2; // versão do formato salvo; migração em migrar()
const TEMPO_QUESTAO = 45;
const PESOS = { "1": 20, "2": 40, "3": 30, "4": 10 };

// =====================================================================
// REGRAS DO EXAME — configuração central, com origem declarada.
//
// origem: "oficial"       → publicado pela ANBIMA, conferido na data abaixo
//         "pedagogica"    → escolha nossa, não é regra da banca
//         "naoConfirmado" → consta em fontes secundárias, não reconferido
//
// NUNCA altere um número aqui sem atualizar fonte e verificadoEm.
// =====================================================================
const REGRAS_EXAME = {
  fonte: "Edital dos Exames de Certificação Anbima v1.4 (28/05/2026), item 3.2 e 13.5, cruzado com a página oficial da CPA (anbimaedu.com.br/certificacao/cpa)",
  verificadoEm: "2026-09-08",
  duracaoSeg: { valor: 150 * 60, origem: "oficial", nota: "Edital 13.5.a: 2h30 para responder às questões da prova." },
  totalItens: { valor: 50, origem: "oficial", nota: "Edital 3.2 e 13.5.a: a CPA tem 50 questões." },
  multiplaEscolha: { valor: 40, origem: "oficial", nota: "Página oficial da CPA: 40 questões de múltipla escolha contextualizada. \"Múltipla\" é o número de OPÇÕES, não de respostas: o edital 13.4 diz que são quatro alternativas, \"sendo apenas uma das alternativas correta\". Você marca uma só. \"Contextualizada\" quer dizer que vem um caso antes e o comando fica no fim. O mesmo item 13.4 acrescenta que a prova também traz CASES — múltiplas escolhas encadeadas no mesmo enunciado, que entram nessas 40." },
  itensArvore: { valor: 10, origem: "oficial", nota: "Página oficial da CPA: 10 questões relacionadas a árvore de decisão (o edital 13.4 chama de \"árvore de diálogo\"). A ANBIMA conta QUESTÕES, não árvores: aqui são 10 decisões, tiradas de atendimentos inteiros a partir da primeira fala. Aqui também se marca uma alternativa só." },
  umaCorreta: { valor: "sim", origem: "oficial", nota: "Edital 13.4, sobre a CPA: \"sendo apenas uma das alternativas correta\". Vale para os três formatos — case, múltipla escolha e árvore de diálogo. Não existe questão de marcar mais de uma. Observação honesta: o Guia de Elaboração de Questões da ANBIMA descreve as alternativas da interativa como GRADUADAS em quatro níveis, o que puxa para o outro lado. Os dois documentos não combinam nesse ponto; adotamos a letra do edital (só a melhor pontua) e mostramos a graduação à parte, como estudo." },
  minimoAcertos: { valor: 35, origem: "oficial", nota: "Edital 3.2, tabela \"Mínimo de acertos para aprovação\": CPA · 2h30 · 50 questões · 35 acertos. O edital fixa um NÚMERO de acertos, não um percentual — 35 de 50 dá 70%, mas quem decide é o 35." },
  dificuldade: { valor: { facil: 25, medio: 50, dificil: 25 }, origem: "oficial", nota: "Página oficial da CPA: 25% fácil, 50% médio, 25% difícil. A DISTRIBUIÇÃO é essa; quem classificou cada questão nossa nessas faixas fomos nós — veja a linha abaixo." },
  rotuloDificuldade: { valor: "régua própria, cortada nos percentis oficiais", origem: "pedagogica", nota: "Medimos, no caderno oficial, se o rótulo de dificuldade da ANBIMA é previsível pelo texto da questão. A correlação mais forte foi r = 0,186 — ruído. Um classificador treinado ali seria adivinhação com cara de método. Então ordenamos as questões por uma régua declarada (o quanto as quatro alternativas se parecem, densidade técnica, cálculo, carga de leitura) e cortamos nos percentis 25/75 dentro de cada módulo. A ordenação é nossa; a proporção é da ANBIMA." },
  anulacao: { valor: "credita a todos", origem: "oficial", nota: "Edital 16.1: o resultado \"pode ser alterado caso alguma questão seja atribuída a todas as pessoas candidatas\". Questão anulada NÃO sai da prova: ela é creditada como acerto para todo mundo e o total continua 50." },
  fechamentoAutomatico: { valor: true, origem: "oficial", nota: "Edital 13.6: o sistema fecha automaticamente ao término do tempo." },
  pesosModulo: { valor: PESOS, origem: "naoConfirmado", nota: "Distribuição por módulo usada no sorteio. O edital remete o conteúdo programático ao ANBIMA Edu e não publica o peso de cada módulo; estes pesos vêm do programa detalhado anterior." },
};
const TOTAL_ITENS_PROVA = REGRAS_EXAME.multiplaEscolha.valor + REGRAS_EXAME.itensArvore.valor; // 50
const PROVA_SEG = REGRAS_EXAME.duracaoSeg.valor;
const QUESTOES_PROVA = REGRAS_EXAME.multiplaEscolha.valor;
// Identifica a versão do banco. Guardada em cada tentativa encerrada, para
// que uma correção de gabarito feita depois não reescreva uma nota antiga.
const VERSAO_GABARITO = "2026-09-07";

// =====================================================================
// MIGRAÇÃO — sobe um save antigo para o esquema atual, sem perder nada.
// Regra: só ACRESCENTA campos. Nenhum dado antigo é descartado ou
// recalculado. Um save sem `esquema` é do v1 e sobe para o v2.
// =====================================================================
const migrar = (s) => {
  if (!s || typeof s !== "object") return s;
  let e = { ...s };
  if (!e.esquema) {
    // v1 → v2: a prova passou a morar em chave própria e o histórico nasceu.
    // O v1 não guardava nem uma nem outro, então não há o que converter:
    // basta carimbar a versão e preservar todo o resto como está.
    e.esquema = 2;
  }
  return e;
};

// =====================================================================
// CORREÇÃO — regra ÚNICA de pontuação. Usada na tela da prova, no
// resultado e no histórico. Não existe outro lugar que calcule nota.
//
// Contrato:
//  · o denominador são os itens VÁLIDOS da tentativa (as pendências
//    continuam contando: em branco vale zero, não some da conta);
//  · itens anulados saem do denominador e trazem o motivo junto;
//  · a aprovação compara a fração exata com o corte — o arredondamento
//    é só de exibição e nunca decide aprovado/reprovado.
// =====================================================================
const corrigir = (tentativa) => {
  const itens = (tentativa && tentativa.itens) || [];
  const total = itens.length;
  let acertos = 0, respondidos = 0, creditados = 0;
  const anulados = [];
  itens.forEach((it) => {
    const r = it.tipo === "arvore" ? it.escolha : it.resposta;
    if (r !== null && r !== undefined) respondidos++;
    if (it.anulado) {
      // Edital 16.1: questão anulada é "atribuída a todas as pessoas
      // candidatas". Ela CONTINUA na prova e vira acerto para todo mundo —
      // não sai do denominador. Ficar de fora facilitaria a aprovação.
      acertos++; creditados++;
      anulados.push({ chave: it.chave, motivo: it.motivoAnulacao || "sem motivo registrado" });
      return;
    }
    if (it.tipo === "arvore") { if (it.grauEscolhido === 3) acertos++; }
    else if (it.resposta === it.gabarito) acertos++;
  });
  // O corte oficial é um NÚMERO de acertos (35 em 50), não um percentual.
  // Em sessões de tamanho diferente, escala na mesma proporção.
  const oficialMin = REGRAS_EXAME.minimoAcertos.valor;
  const oficialTot = REGRAS_EXAME.totalItens.valor;
  const corteAcertos = total ? Math.ceil((total * oficialMin) / oficialTot) : 0;
  const fracao = total ? acertos / total : 0;
  return {
    acertos, total, respondidos,
    pendentes: total - respondidos,
    anulados, creditados,
    fracao,
    pct: Math.round(fracao * 1000) / 10,   // uma casa: 34,0% nunca vira 35%
    pctInteiro: Math.round(fracao * 100),
    // decide pelo NÚMERO de acertos, como o edital. Nenhum arredondamento
    // de exibição entra nesta conta.
    aprovado: total > 0 && acertos >= corteAcertos,
    corteAcertos,
    corte: Math.round((corteAcertos / (total || 1)) * 100),
    corteOrigem: REGRAS_EXAME.minimoAcertos.origem,
  };
};
// revisão espaçada das fichas favoritas: intervalos crescentes em dias
const INTERVALOS_REV = [1, 3, 7, 15, 30];
const hojeISO = () => new Date().toISOString().slice(0, 10);
const somaDias = (d) => { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };

// =====================================================================
// ESTILO — tema claro
// =====================================================================
const CSS = `
/* Cores conferidas com a fórmula de contraste da WCAG contra os dois fundos
   do app (#FFFDF7 e #FFFFFF) e contra os próprios realces claros. Todas as
   combinações de texto ficam em 4,5:1 ou mais — o mínimo do nível AA para
   texto normal. Antes, 11 pares estavam abaixo disso; o pior era o dourado
   do cronômetro, em 2,15:1. Medido por scripts/conferir-contraste.js.
   Os matizes são os mesmos: só ficaram mais escuros. */
.cx{--paper:#FFFDF7;--card:#FFFFFF;--line:#E8E0D0;--ink:#1F2033;--ink2:#5A5B71;--mut:#737484;
  --azul:#4F46E5;--azul-l:#EEF0FF;--verde:#0B7D56;--verde-l:#E7F8F1;--laranja:#BB480A;--laranja-l:#FFF1E6;--roxo:#7B51DA;--roxo-l:#F4EEFF;
  --ok:#0B7D56;--no:#BF3C40;--gold:#A06707;
  background:var(--paper);min-height:100vh;color:var(--ink);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding-bottom:70px;position:relative}
.cx *{box-sizing:border-box}
.cx-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.cx-wrap{max-width:780px;margin:0 auto;padding:0 16px}
.cx-dots{position:fixed;inset:0;pointer-events:none;opacity:.5;
  background-image:radial-gradient(#E8E0D0 1px,transparent 1px);background-size:22px 22px}

/* topo */
.cx-top{position:sticky;top:0;z-index:40;background:rgba(255,253,247,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.cx-topin{max-width:780px;margin:0 auto;padding:11px 16px;display:flex;align-items:center;gap:12px}
.cx-logo{font-weight:900;font-size:16px;letter-spacing:-.03em}
.cx-logo b{color:var(--azul)}
.cx-xp{margin-left:auto;display:flex;align-items:center;gap:9px}
.cx-pat{display:flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:5px 11px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 1px 2px rgba(31,32,51,.05)}
.cx-num{font-size:19px;font-weight:900;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.cx-delta{font-size:12px;font-weight:900;font-variant-numeric:tabular-nums}
.cx-delta.up{color:var(--ok)}.cx-delta.dn{color:var(--no)}
.cx-prog{height:4px;background:#F0EAE0}
.cx-prog>i{display:block;height:100%;background:linear-gradient(90deg,var(--azul),var(--roxo),var(--gold));transition:width .5s}

/* textos */
.cx-h1{font-size:32px;font-weight:900;letter-spacing:-.04em;line-height:1.03;margin:22px 0 6px}
.cx-h2{font-size:23px;font-weight:900;letter-spacing:-.03em;margin:2px 0 5px;line-height:1.12}
.cx-p{color:var(--ink2);font-size:14px;line-height:1.6;max-width:56ch;margin:0}
.cx-eye{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--mut);font-weight:800}

/* cartões de módulo */
.cx-mods{display:grid;gap:12px;margin-top:20px}
.cx-mod{position:relative;overflow:hidden;width:100%;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 16px 14px;cursor:pointer;font:inherit;color:inherit;box-shadow:0 2px 6px rgba(31,32,51,.05);transition:transform .16s,box-shadow .16s}
.cx-mod:hover{transform:translateY(-3px);box-shadow:0 10px 22px rgba(31,32,51,.1)}
.cx-mod:focus-visible{outline:3px solid var(--azul);outline-offset:2px}
.cx-mod .faixa{position:absolute;left:0;top:0;bottom:0;width:6px}
.cx-mod .cab{display:flex;align-items:flex-start;gap:12px;padding-left:8px}
.cx-badge{flex:0 0 auto;width:44px;height:44px;border-radius:13px;display:grid;place-items:center;font-size:18px;font-weight:900;color:#fff}
.cx-peso{margin-left:auto;font-size:11px;font-weight:900;padding:4px 9px;border-radius:8px;white-space:nowrap}
.cx-mtt{font-size:16px;font-weight:900;letter-spacing:-.02em;line-height:1.2}
.cx-mst{font-size:12.5px;color:var(--ink2);margin-top:2px}
.cx-trilha{height:9px;border-radius:999px;background:#F0EAE0;overflow:hidden;margin-top:12px}
.cx-trilha>i{display:block;height:100%;border-radius:999px;transition:width .6s cubic-bezier(.2,.8,.2,1)}
.cx-meta{display:flex;gap:10px;margin-top:8px;font-size:11.5px;color:var(--mut);font-weight:700;flex-wrap:wrap}

/* botões */
.cx-btn{width:100%;border:0;border-radius:14px;padding:16px;font-weight:900;font-size:13.5px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;background:var(--azul);color:#fff;font-family:inherit;box-shadow:0 4px 12px rgba(79,70,229,.28);transition:transform .12s,filter .15s}
.cx-btn:hover{filter:brightness(1.07)}
.cx-btn:active{transform:scale(.985)}
.cx-btn:disabled{background:#F0EAE0;color:#A9AABB;box-shadow:none;cursor:not-allowed}
.cx-btn.sec{background:var(--card);color:var(--ink);border:1.5px solid var(--line);box-shadow:none}
.cx-btn.sec:hover{border-color:var(--azul);color:var(--azul)}
.cx-chip{display:inline-flex;align-items:center;gap:6px;background:var(--card);border:1.5px solid var(--line);border-radius:11px;padding:9px 13px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;color:var(--ink2);transition:.15s}
.cx-chip:hover{border-color:var(--azul);color:var(--azul)}
.cx-chip.on{background:var(--azul);border-color:var(--azul);color:#fff}
.cx-bar{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}

/* painel */
.cx-pane{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:11px;box-shadow:0 2px 6px rgba(31,32,51,.04)}
.cx-pane p{margin:0 0 9px;font-size:15px;line-height:1.65;color:var(--ink)}
.cx-pane p:last-child{margin-bottom:0}
.cx-lb{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--mut);font-weight:900;margin-bottom:10px}

/* níveis */
.cx-lv{width:100%;display:flex;align-items:center;gap:12px;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:13px 15px;margin-bottom:8px;cursor:pointer;font:inherit;color:inherit;transition:.16s;box-shadow:0 1px 3px rgba(31,32,51,.04)}
.cx-lv:hover{transform:translateX(4px);box-shadow:0 4px 12px rgba(31,32,51,.08)}
.cx-lv .n{font-size:11.5px;font-weight:900;min-width:58px}
.cx-lv .t{font-size:14.5px;font-weight:700;letter-spacing:-.015em;line-height:1.3}
.cx-lv .s{margin-left:auto;font-size:12px;font-weight:900;white-space:nowrap}

/* questão */
.cx-q{font-size:17.5px;line-height:1.48;font-weight:700;letter-spacing:-.015em;margin:14px 0 16px}
.cx-alt{width:100%;display:flex;gap:12px;align-items:flex-start;text-align:left;background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:14px;margin-bottom:9px;cursor:pointer;font:inherit;color:inherit;transition:.14s;box-shadow:0 1px 3px rgba(31,32,51,.04)}
.cx-alt:hover:not(:disabled){border-color:var(--azul);background:#FCFCFF;transform:translateY(-1px)}
.cx-alt:disabled{cursor:default}
.cx-alt .k{flex:0 0 26px;height:26px;border-radius:8px;display:grid;place-items:center;font-size:12px;font-weight:900;background:#F4F0E8;color:var(--ink2)}
.cx-alt .t{font-size:15px;line-height:1.45}
.cx-alt.ok{border-color:var(--ok);background:var(--verde-l)}
.cx-alt.ok .k{background:var(--ok);color:#fff}
.cx-alt.no{border-color:var(--no);background:#FEECEC}
.cx-alt.no .k{background:var(--no);color:#fff}
.cx-alt.off{opacity:.45}
.cx-fb{border-radius:14px;padding:15px;border:1.5px solid;animation:cxUp .24s ease both}
.cx-fb.ok{border-color:var(--ok);background:var(--verde-l)}
.cx-fb.no{border-color:var(--no);background:#FEECEC}
.cx-fb p{margin:0;font-size:14.5px;line-height:1.6}
@keyframes cxUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.cx-pop{position:fixed;left:50%;top:88px;transform:translateX(-50%);z-index:60;font-size:15px;font-weight:900;padding:9px 18px;border-radius:999px;color:#fff;animation:cxPop 1.1s ease forwards;pointer-events:none;box-shadow:0 6px 18px rgba(31,32,51,.2)}
.cx-pop.ok{background:var(--ok)}.cx-pop.no{background:var(--no)}
@keyframes cxPop{0%{opacity:0;transform:translateX(-50%) scale(.7)}18%{opacity:1;transform:translateX(-50%) scale(1.05)}70%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-14px)}}

/* progresso da sessão */
.cx-pgs{display:flex;gap:3px;margin:11px 0 3px}
.cx-pgs i{flex:1;height:5px;border-radius:3px;background:#F0EAE0}
.cx-pgs i.ok{background:var(--ok)}.cx-pgs i.no{background:var(--no)}.cx-pgs i.now{background:var(--gold)}
.cx-timer{height:6px;border-radius:999px;background:#F0EAE0;overflow:hidden;margin:12px 0}
.cx-timer>i{display:block;height:100%;background:var(--ok);transition:width 1s linear}
.cx-timer.w>i{background:var(--gold)}.cx-timer.d>i{background:var(--no)}

/* FICHAS */
.cx-deck{display:grid;gap:12px;margin-top:14px}
.cx-ficha{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(31,32,51,.05)}
.cx-fh{display:flex;align-items:center;gap:10px;padding:13px 15px;cursor:pointer}
.cx-fh .id{font-size:11px;font-weight:900;font-family:ui-monospace,Menlo,monospace}
.cx-fh .tt{font-size:14.5px;font-weight:800;letter-spacing:-.015em;line-height:1.25}
.cx-star{margin-left:auto;background:transparent;border:0;font-size:19px;cursor:pointer;line-height:1;padding:2px 4px;opacity:.35;transition:.15s}
.cx-star.on{opacity:1;transform:scale(1.12)}
.cx-fb2{padding:0 15px 15px;animation:cxUp .2s ease both}
.cx-box{border-radius:13px;padding:13px;margin-bottom:9px;border-left:4px solid}
.cx-box .h{font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:900;margin-bottom:6px}
.cx-box p{margin:0;font-size:14px;line-height:1.6}
.cx-box.mac{background:var(--azul-l);border-color:var(--azul)}
.cx-box.mac .h{color:var(--azul)}
.cx-box.peg{background:#FEECEC;border-color:var(--no)}
.cx-box.peg .h{color:var(--no)}
.cx-box.ex{background:var(--verde-l);border-color:var(--verde)}
.cx-box.ex .h{color:var(--verde)}
.cx-ex-q{font-size:13.5px;font-weight:700;line-height:1.5;margin:0 0 8px}
.cx-ex-r{font-size:13.5px;line-height:1.5;margin:0 0 8px;padding:8px 10px;background:rgba(14,159,110,.13);border-radius:9px;font-weight:700}
.cx-ex-p{font-size:13px;line-height:1.55;color:var(--ink2);margin:0}

/* gráfico */
.cx-chart{display:grid;gap:7px;margin-top:11px}
.cx-crow{display:grid;grid-template-columns:66px 1fr 42px;gap:10px;align-items:center;font-size:11.5px;font-weight:700}
.cx-track{height:10px;border-radius:999px;background:#F0EAE0;overflow:hidden}
.cx-track>i{display:block;height:100%;border-radius:999px;transition:width .6s}

/* resultado */
.cx-score{font-size:70px;font-weight:900;letter-spacing:-.055em;line-height:1;font-variant-numeric:tabular-nums}
.cx-medal{width:86px;height:86px;border-radius:50%;display:grid;place-items:center;font-size:40px;margin:0 auto 14px;border:3px solid}
.cx-tbl{width:100%;border-collapse:collapse;font-size:13px;margin-top:10px}
.cx-tbl td{padding:7px 4px;border-bottom:1px solid var(--line);text-align:left}
.cx-tbl td:last-child{text-align:right;font-weight:900;font-variant-numeric:tabular-nums}

.cx-ta{width:100%;background:#FAF7F0;border:1.5px solid var(--line);border-radius:12px;color:var(--ink);padding:11px;font-family:ui-monospace,Menlo,monospace;font-size:11px;line-height:1.5;resize:vertical;min-height:78px;-webkit-user-select:text;user-select:text}
.cx-ta:focus{outline:2.5px solid var(--azul);outline-offset:1px}
.cx-foot{color:var(--mut);font-size:11.5px;text-align:center;margin-top:26px;line-height:1.7}
.cx-kbd{display:inline-block;background:var(--card);border:1px solid var(--line);border-bottom-width:2.5px;border-radius:6px;padding:2px 6px;font-size:10.5px;font-weight:800}

/* termos do glossário dentro do conteúdo */
.cx-termo{font:inherit;color:var(--azul);background:transparent;border:0;padding:0;margin:0;cursor:pointer;
  font-weight:800;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px;text-decoration-thickness:1.5px}
.cx-termo:hover{background:var(--azul-l);border-radius:4px}
.cx-termo:focus-visible{outline:2px solid var(--azul);outline-offset:2px;border-radius:4px}
.cx-veu{position:fixed;inset:0;z-index:70;background:rgba(31,32,51,.28);animation:cxFade .16s ease both}
@keyframes cxFade{from{opacity:0}to{opacity:1}}
.cx-sheet{position:fixed;left:0;right:0;bottom:0;z-index:71;background:var(--card);border-top:1px solid var(--line);
  border-radius:20px 20px 0 0;padding:18px 18px calc(20px + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(31,32,51,.16);
  max-width:780px;margin:0 auto;animation:cxSobe .2s cubic-bezier(.2,.8,.2,1) both}
@keyframes cxSobe{from{transform:translateY(100%)}to{transform:none}}
.cx-sheet .puxador{width:38px;height:4px;border-radius:99px;background:var(--line);margin:0 auto 13px}
.cx-sheet h4{margin:0 0 8px;font-size:19px;font-weight:900;letter-spacing:-.02em}
.cx-sheet p{margin:0;font-size:15px;line-height:1.6;color:var(--ink2)}
.cx-glos{display:grid;gap:9px;margin-top:14px}
.cx-gitem{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:13px 15px;box-shadow:0 1px 3px rgba(31,32,51,.04)}
.cx-gitem b{font-size:14.5px;letter-spacing:-.01em}
.cx-gitem p{margin:5px 0 0;font-size:13.5px;line-height:1.55;color:var(--ink2)}
.cx-busca{width:100%;background:var(--card);border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;
  font-family:inherit;font-size:15px;color:var(--ink);margin-top:14px}
.cx-busca:focus{outline:2.5px solid var(--azul);outline-offset:1px}

/* recuperação ativa */
.cx-recall{background:linear-gradient(180deg,#FFFDF7,#FAF7F0);border:1.5px dashed var(--line);border-radius:13px;
  padding:16px 15px;margin:0 15px 13px;text-align:center}
.cx-recall .pergunta{font-size:13.5px;font-weight:800;color:var(--ink2);line-height:1.5;margin-bottom:12px}
.cx-recall .dica{font-size:11.5px;color:var(--mut);margin-top:10px;font-weight:700}

/* confrontos */
.cx-conf{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;
  box-shadow:0 2px 8px rgba(31,32,51,.05);margin-bottom:12px}
.cx-conf-h{padding:14px 15px;display:flex;align-items:center;gap:10px;cursor:pointer}
.cx-conf-h .tt{font-size:15.5px;font-weight:900;letter-spacing:-.02em}
.cx-conf-b{padding:0 15px 15px}
.cx-ctab{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed}
.cx-ctab th{text-align:left;padding:8px 7px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--azul);border-bottom:2px solid var(--line);font-weight:900}
.cx-ctab th:first-child{width:29%;color:var(--mut)}
.cx-ctab td{padding:9px 7px;border-bottom:1px solid var(--line);vertical-align:top;line-height:1.45}
.cx-ctab td:first-child{font-weight:800;color:var(--ink2);font-size:12px}
.cx-conf .arm{background:#FEECEC;border-left:4px solid var(--no);border-radius:11px;padding:12px;margin-top:12px}
.cx-conf .arm .h{font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:900;color:var(--no);margin-bottom:5px}
.cx-conf .arm p{margin:0;font-size:13.5px;line-height:1.55}

/* árvore de decisão (questão interativa) */
.cx-chat{display:grid;gap:11px;margin-top:16px}
.cx-bolha{max-width:86%;padding:13px 15px;border-radius:16px;font-size:14.5px;line-height:1.5;
  box-shadow:0 1px 3px rgba(31,32,51,.06)}
.cx-bolha.cli{background:var(--card);border:1px solid var(--line);border-bottom-left-radius:5px;justify-self:start}
.cx-bolha.eu{background:var(--azul);color:#fff;border-bottom-right-radius:5px;justify-self:end}
.cx-bolha .quem{font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:900;
  color:var(--mut);margin-bottom:5px}
.cx-bolha.eu .quem{color:rgba(255,255,255,.75)}
.cx-nota{justify-self:end;max-width:86%;font-size:12.5px;line-height:1.5;padding:9px 12px;border-radius:11px;
  border-left:4px solid;background:var(--card);font-weight:700}
.cx-nota.g3{border-color:var(--ok);background:var(--verde-l)}
.cx-nota.g2{border-color:var(--azul);background:var(--azul-l)}
.cx-nota.g1{border-color:var(--gold);background:#FFF6E5}
.cx-nota.g0{border-color:var(--no);background:#FEECEC}
.cx-nota .selo{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px}
.cx-esc{width:100%;text-align:left;background:var(--card);border:1.5px solid var(--line);border-radius:14px;
  padding:13px 15px;margin-bottom:9px;cursor:pointer;font:inherit;color:inherit;font-size:14.5px;line-height:1.45;
  transition:.14s;box-shadow:0 1px 3px rgba(31,32,51,.04)}
.cx-esc:hover{border-color:var(--azul);background:#FCFCFF;transform:translateY(-1px)}
.cx-ctx{background:linear-gradient(180deg,#FFFDF7,#FAF7F0);border:1.5px dashed var(--line);border-radius:14px;
  padding:15px;font-size:14.5px;line-height:1.6;color:var(--ink)}
.cx-passos{display:flex;gap:4px;margin:12px 0 4px}
.cx-passos i{flex:1;height:5px;border-radius:3px;background:#F0EAE0}
.cx-passos i.f{background:var(--azul)}

/* cantigas */
.cx-mus{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:15px;margin-bottom:12px;
  box-shadow:0 2px 8px rgba(31,32,51,.05)}
.cx-mus.on{border-color:var(--roxo);box-shadow:0 6px 20px rgba(139,92,246,.18)}
.cx-mus-h{display:flex;align-items:center;gap:12px}
.cx-mus-h .tt{font-size:16px;font-weight:900;letter-spacing:-.02em;line-height:1.2}
.cx-mus-h .sub{font-size:12px;color:var(--mut);font-weight:700;margin-top:2px}
.cx-play{flex:0 0 auto;width:44px;height:44px;border-radius:50%;border:0;cursor:pointer;font-size:17px;
  background:var(--roxo);color:#fff;display:grid;place-items:center;box-shadow:0 3px 10px rgba(139,92,246,.35);transition:.15s}
.cx-play:hover{filter:brightness(1.08)}
.cx-play.stop{background:var(--no);box-shadow:0 3px 10px rgba(229,72,77,.3)}
.cx-letra{margin-top:14px;display:grid;gap:3px}
.cx-verso{font-size:15.5px;line-height:1.5;padding:7px 11px;border-radius:9px;color:var(--ink2);
  transition:background .15s,color .15s,transform .15s;font-weight:700}
.cx-verso.ativa{background:var(--roxo-l);color:var(--ink);transform:translateX(5px);font-weight:900;
  box-shadow:inset 3px 0 0 var(--roxo)}
.cx-mus .dica{margin-top:12px;font-size:13px;line-height:1.55;color:var(--ink2);
  background:var(--azul-l);border-left:4px solid var(--azul);border-radius:10px;padding:11px}

/* tabelão */
.cx-tema{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 15px;margin-bottom:10px;
  box-shadow:0 1px 3px rgba(31,32,51,.04)}
.cx-tema h5{margin:0 0 9px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--azul);font-weight:900}
.cx-tema .lin{display:flex;gap:10px;padding:6px 0;border-bottom:1px dashed var(--line);font-size:13.5px;line-height:1.4}
.cx-tema .lin:last-child{border-bottom:0}
.cx-tema .lin span:first-child{flex:1;color:var(--ink2)}
.cx-tema .lin b{white-space:nowrap;font-variant-numeric:tabular-nums;text-align:right}
/* ---------- EXAME ----------
   Regra de ouro desta seção: NENHUMA cor aqui pode significar acerto ou
   erro. Verde e vermelho só aparecem depois de entregue, na revisão. */
.cx-lacrado{padding-bottom:40px}
.cx-provahd{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.cx-cron{margin-left:auto;font-size:15px;font-weight:900;font-variant-numeric:tabular-nums;
  color:var(--ink2);background:var(--card);border:1.5px solid var(--line);border-radius:10px;padding:5px 11px}
.cx-cron.d{color:#fff;background:var(--gold);border-color:var(--gold)}
/* cheio = respondido. Sem verde/vermelho: o traço não entrega nada. */
.cx-pgs i.feito{background:var(--ink2)}
.cx-provasub{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:6px;
  font-size:12px;font-weight:700;color:var(--mut)}
.cx-linkbt{background:none;border:0;padding:8px 4px;font:inherit;font-size:12.5px;font-weight:800;
  color:var(--azul);text-decoration:underline;cursor:pointer;min-height:44px}
.cx-alt.sel{border-color:var(--azul);background:var(--azul-l)}
.cx-alt.sel .k{background:var(--azul);color:#fff}
.cx-provanav{display:flex;gap:9px;align-items:center;margin-top:18px;flex-wrap:wrap}
.cx-provanav .cx-btn{flex:1 1 34%;min-width:120px;padding:15px 10px}
.cx-provanav .cx-btn:disabled{opacity:.4;cursor:default}
.cx-modal{position:fixed;inset:0;background:rgba(31,32,51,.55);display:grid;place-items:center;
  padding:18px;z-index:60;overflow:auto}
.cx-modalcx{background:var(--card);border-radius:18px;padding:20px;max-width:460px;width:100%;
  max-height:88vh;overflow:auto;box-shadow:0 18px 50px rgba(31,32,51,.3)}
.cx-mapa{display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:7px;margin-top:12px}
.cx-mq{min-height:44px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);
  font:inherit;font-size:13px;font-weight:800;color:var(--ink2);cursor:pointer;position:relative}
.cx-mq.f{background:var(--ink2);color:#fff;border-color:var(--ink2)}
.cx-mq.m::after{content:"🔖";position:absolute;top:-6px;right:-4px;font-size:11px}
.cx-mq.a{outline:3px solid var(--gold);outline-offset:1px}
/* revisão pós-entrega: aqui a cor JÁ pode significar acerto e erro */
.cx-rev{border:1px solid var(--line);border-left-width:5px;border-radius:12px;padding:13px 15px;margin-bottom:9px;background:var(--card)}
.cx-rev.ok{border-left-color:var(--ok)}.cx-rev.no{border-left-color:var(--no)}.cx-rev.br{border-left-color:var(--mut)}
.cx-revh{display:flex;gap:9px;align-items:center;font-size:11.5px;letter-spacing:.1em;
  text-transform:uppercase;font-weight:900;color:var(--ink2);margin-bottom:7px}
.cx-revq{font-size:14px;line-height:1.5;margin:0 0 8px}
.cx-reva,.cx-revg,.cx-revx{font-size:13px;line-height:1.5;margin:0 0 6px;color:var(--ink2)}
.cx-revg{color:var(--ok);font-weight:700}
.cx-revx{color:var(--mut)}
.cx-selo{display:inline-block;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;
  font-weight:900;padding:3px 7px;border-radius:6px;margin-top:3px}
.cx-selo.oficial{background:var(--verde-l);color:var(--ok)}
.cx-selo.pedagogica{background:var(--roxo-l);color:var(--roxo)}
.cx-selo.naoConfirmado{background:#FFF4E0;color:#B45309}
/* linha do histórico: o corpo abre a revisão, a lixeira é alvo separado */
.cx-histbt{flex:1;min-width:0;text-align:left;background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer}
.cx-apagar{flex:0 0 44px;min-height:44px;border:1.5px solid var(--line);border-radius:11px;background:var(--card);
  font-size:16px;cursor:pointer;color:var(--ink2);margin-left:8px}
.cx-apagar:hover{border-color:var(--no);color:var(--no)}
/* aviso de questão que está fora do sorteio do exame */
.cx-fora{margin-top:10px;padding:10px 12px;border-radius:10px;background:#FFF4E0;
  border:1px solid #F0C980;color:#8A5A08;font-size:12.5px;line-height:1.5;font-weight:600}
/* alvo de toque: nada abaixo de 44px, e enunciado que respira em tela pequena */
.cx-alt,.cx-esc{min-height:52px}
.cx-chip{min-height:40px}
.cx-q{overflow-wrap:anywhere}
@media (max-width:400px){
  .cx-provanav .cx-btn{flex:1 1 100%}
  .cx-alt .t,.cx-esc{font-size:14.5px}
}
/* ---------- ACESSIBILIDADE ----------
   Foco visível próprio: o contorno padrão do navegador some em cima dos
   nossos cartões claros. :focus-visible só aparece na navegação por
   teclado, então não polui o toque. */
.cx button:focus-visible,.cx input:focus-visible,.cx textarea:focus-visible,.cx [tabindex]:focus-visible{
  outline:3px solid var(--azul);outline-offset:2px;border-radius:10px}
.cx .cx-alt:focus-visible,.cx .cx-esc:focus-visible{outline-offset:-1px}
/* Texto ampliado: em rem, a caixa acompanha o tamanho escolhido no sistema
   em vez de cortar. Só onde o corte seria perda de conteúdo. */
.cx-alt .t,.cx-esc,.cx-q,.cx-ctx,.cx-p{max-width:100%;overflow-wrap:anywhere;hyphens:auto}
.cx-mq{min-width:44px}
/* Um atalho para pular direto ao conteúdo, para quem navega por teclado */
.cx-pular{position:absolute;left:-9999px;top:0;background:var(--card);color:var(--ink);
  padding:12px 16px;border:2px solid var(--azul);border-radius:10px;font-weight:800;z-index:99}
.cx-pular:focus{left:8px;top:8px}
@media (prefers-reduced-motion:reduce){.cx *{animation:none!important;transition:none!important}}
`;

// =====================================================================
// ÁUDIO — trilha ambiente calma e efeitos, tudo sintetizado em WebAudio puro
// (o artifact não pode carregar arquivos de áudio; no iPhone o som só
// destrava após o primeiro toque, por isso o listener de pointerdown)
// =====================================================================
const Som = (() => {
  let ctx = null, sfxG = null, musG = null, cantoG = null, timer = null, passo = 0, prox = 0, ativo = true;
  const N = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const ativar = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      sfxG = ctx.createGain(); sfxG.gain.value = 0.22; sfxG.connect(ctx.destination);
      musG = ctx.createGain(); musG.gain.value = 0.09; musG.connect(ctx.destination);
      // as cantigas tocam mais alto: são para cantar junto, não para ficar de fundo
      cantoG = ctx.createGain(); cantoG.gain.value = 0.4; cantoG.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return true;
  };
  const nota = (dest, freq, t, dur, tipo, vol, slide) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.02);
  };
  // trilha: pads lentos e suaves em Am7 · Fmaj7 · Cmaj7 · G6, um acorde a
  // cada 4 s, ataque de 1,2 s — ambiente calmo, sem bateria e sem melodia
  const ACORDES = [[45, 60, 64, 67], [41, 57, 60, 64], [48, 55, 64, 71], [43, 59, 62, 64]];
  const DUR = 4;
  const pad = (m, t) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = N(m);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.25, t + 1.2);
    g.gain.setValueAtTime(0.25, t + DUR - 0.8);
    g.gain.linearRampToValueAtTime(0.0001, t + DUR + 0.6);
    o.connect(g); g.connect(musG);
    o.start(t); o.stop(t + DUR + 0.7);
  };
  const agendar = () => {
    while (prox < ctx.currentTime + 0.3) {
      ACORDES[passo % 4].forEach((m, i) => pad(m, prox + i * 0.07));
      passo++; prox += DUR;
    }
  };
  const tocar = () => {
    if (timer || !ativar()) return;
    passo = 0; prox = ctx.currentTime + 0.05;
    agendar(); timer = setInterval(agendar, 60);
  };
  const parar = () => { if (timer) { clearInterval(timer); timer = null; } };
  const fx = (fn) => { if (ativo && ativar()) fn(ctx.currentTime); };

  // ---- cantigas mnemônicas ----
  // "C4" = colcheia; "C4*2" = o dobro; "-" = pausa. Toca a melodia e avisa
  // o app a cada troca de linha, para a letra acender em sincronia.
  const GRAU = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const midiDe = (tok) => {
    const m = /^([A-G])(#?)(\d)$/.exec(tok);
    if (!m) return null;
    return 12 * (Number(m[3]) + 1) + GRAU[m[1]] + (m[2] ? 1 : 0);
  };
  let timers = [], vozes = [], tocandoM = null;
  const pararMusica = () => {
    timers.forEach(clearTimeout); timers = [];
    vozes.forEach((o) => { try { o.stop(); } catch (e) {} }); vozes = [];
    tocandoM = null;
    if (ativo) tocar(); // devolve a trilha ambiente
  };
  const cantar = (musica, aoLinha, aoFim) => {
    if (!ativar()) return false;
    pararMusica();
    parar(); // a trilha ambiente sai de cena enquanto a cantiga toca
    tocandoM = musica.id;
    const bat = 60 / (musica.bpm || 100);
    const t0 = ctx.currentTime + 0.25;
    let t = 0;
    musica.linhas.forEach((linha, iL) => {
      const inicio = t;
      linha.n.trim().split(/\s+/).forEach((tok) => {
        const [nome, mult] = tok.split("*");
        const dur = bat * 0.5 * (mult ? Number(mult) : 1);
        const midi = midiDe(nome);
        if (midi !== null) {
          const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
          f.type = "lowpass"; f.frequency.value = 2600;
          o.type = "triangle"; o.frequency.value = N(midi);
          const ini = t0 + t, fim = ini + dur * 0.92;
          g.gain.setValueAtTime(0.0001, ini);
          g.gain.exponentialRampToValueAtTime(0.5, ini + 0.02);
          g.gain.setValueAtTime(0.5, fim - 0.05 > ini ? fim - 0.05 : ini);
          g.gain.exponentialRampToValueAtTime(0.001, fim);
          o.connect(f); f.connect(g); g.connect(cantoG);
          o.start(ini); o.stop(fim + 0.02);
          vozes.push(o);
        }
        t += dur;
      });
      timers.push(setTimeout(() => aoLinha(iL), Math.max(0, (t0 + inicio - ctx.currentTime) * 1000)));
    });
    timers.push(setTimeout(() => { tocandoM = null; aoFim(); if (ativo) tocar(); },
      Math.max(0, (t0 + t + 0.5 - ctx.currentTime) * 1000)));
    return true;
  };

  return {
    cantar, pararMusica, tocandoMusica: () => tocandoM,
    set(on) { ativo = on; on ? tocar() : parar(); },
    destrava() { if (ativo) { ativar(); if (!timer) tocar(); } },
    acerto: () => fx((t) => { nota(sfxG, 660, t, 0.09, "square", 0.5); nota(sfxG, 880, t + 0.08, 0.14, "square", 0.5); }),
    combo: () => fx((t) => [660, 880, 1174, 1318].forEach((f, i) => nota(sfxG, f, t + i * 0.06, 0.12, "square", 0.5))),
    erro: () => fx((t) => nota(sfxG, 196, t, 0.22, "sawtooth", 0.45, 98)),
    vitoria: () => fx((t) => [523, 659, 784, 1047].forEach((f, i) => nota(sfxG, f, t + i * 0.11, i === 3 ? 0.5 : 0.13, "square", 0.5))),
    chefao: () => fx((t) => {
      [523, 659, 784, 1047, 1319].forEach((f, i) => nota(sfxG, f, t + i * 0.12, i === 4 ? 0.7 : 0.14, "square", 0.55));
      [262, 330, 392].forEach((f) => nota(sfxG, f, t + 0.48, 0.7, "triangle", 0.4));
    }),
    derrota: () => fx((t) => { nota(sfxG, 330, t, 0.18, "triangle", 0.5); nota(sfxG, 262, t + 0.16, 0.3, "triangle", 0.5, 196); }),
    fav: () => fx((t) => { nota(sfxG, 1568, t, 0.08, "triangle", 0.45); nota(sfxG, 2093, t + 0.07, 0.16, "triangle", 0.45); }),
  };
})();

// =====================================================================
export default function ProjetoCPA() {
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState({});
  const [feitos, setFeitos] = useState({});
  const [bossBest, setBossBest] = useState({});
  const [errados, setErrados] = useState([]);
  const [favs, setFavs] = useState([]);
  const [pressao, setPressao] = useState(false);
  const [rev, setRev] = useState({});
  const [som, setSom] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const [tela, setTela] = useState("home");
  const [mId, setMId] = useState("1");
  const [bId, setBId] = useState(null);
  const [nId, setNId] = useState(null);
  const [sessao, setSessao] = useState(null);
  const [escolha, setEscolha] = useState(null);
  const [delta, setDelta] = useState(null);
  const [pop, setPop] = useState(null);
  const [tick, setTick] = useState(TEMPO_QUESTAO);
  const [relogio, setRelogio] = useState(0);
  const [aberta, setAberta] = useState({});
  const [filtroFicha, setFiltroFicha] = useState("todas");
  const [termo, setTermo] = useState(null);
  const [revelado, setRevelado] = useState({}); // recuperação ativa: ficha já revelada
  const [desfazer, setDesfazer] = useState(null); // última resposta, para anular
  const [arv, setArv] = useState(null); // { id, passo, escolhas: [i] }
  const [tocandoMus, setTocandoMus] = useState(null);
  const [linhaMus, setLinhaMus] = useState(-1);
  const [confAberto, setConfAberto] = useState({});
  const [buscaGl, setBuscaGl] = useState("");
  const [backup, setBackup] = useState("");
  const [entrada, setEntrada] = useState("");
  const [msgBk, setMsgBk] = useState("");
  const [conf, setConf] = useState(false);
  const [syncUrl, setSyncUrl] = useState("");
  const [syncCod, setSyncCod] = useState("");
  const [msgSync, setMsgSync] = useState("");
  const [sincronizando, setSincronizando] = useState(false);
  // EXAME — vive à parte do progresso de estudo, em outra chave de disco.
  const [prova, setProva] = useState(null);        // tentativa em andamento
  const [historico, setHistorico] = useState([]);  // tentativas encerradas
  const [apagados, setApagados] = useState([]);    // lápides: provas apagadas de propósito
  const [provaVista, setProvaVista] = useState(null); // tentativa aberta na revisão
  const [agora, setAgora] = useState(Date.now());  // relógio de parede da prova
  const [conflitoSync, setConflitoSync] = useState(null); // nuvem x aparelho
  const [apagarId, setApagarId] = useState(null);  // prova aguardando confirmação
  const [confirmando, setConfirmando] = useState(false);
  const [mapaAberto, setMapaAberto] = useState(false);
  const [avisoDados, setAvisoDados] = useState("");

  // aplica um estado inteiro (vindo do disco ou da nuvem) na tela
  const aplicarEstado0 = (s) => {
    if (!s) return;
    setXp(s.xp || 0); setCombo(s.combo || 0); setStats(s.stats || {});
    setFeitos(s.feitos || {}); setBossBest(s.bossBest || {});
    setErrados(s.errados || []); setFavs(s.favs || []); setPressao(!!s.pressao);
    setSom(s.som !== false); setRev(s.rev || {});
    if (s.syncUrl !== undefined) setSyncUrl(s.syncUrl || "");
    if (s.syncCod !== undefined) setSyncCod(s.syncCod || "");
  };
  const aplicarEstado = (s) => aplicarEstado0(migrar(s));

  useEffect(() => {
    (async () => {
      let local = null;
      try {
        const r = await window.storage.get(SAVE_KEY);
        if (r && r.value) { local = migrar(JSON.parse(r.value)); aplicarEstado(local); }
      } catch (e) {
        // dado ilegível não é apagado: o app segue vazio e avisa, para que o
        // backup possa ser restaurado por cima em vez de sumir em silêncio.
        setAvisoDados("Não consegui ler o progresso guardado neste aparelho. Nada foi apagado — abra Ajustes e restaure um backup, ou sincronize com a nuvem.");
      }
      // exame e histórico moram em chaves próprias: um erro no estudo não
      // derruba uma prova em andamento, e vice-versa.
      try {
        const rp = await window.storage.get(PROVA_KEY);
        if (rp && rp.value) {
          const p = JSON.parse(rp.value);
          if (p && Array.isArray(p.itens) && !p.entregue) setProva(p);
        }
      } catch (e) { setAvisoDados((a) => a || "A prova em andamento não pôde ser lida e foi descartada. O histórico e o progresso de estudo estão intactos."); }
      let histLocal = [], apagadosLocal = [];
      try {
        const rh = await window.storage.get(HIST_KEY);
        if (rh && rh.value) {
          const g = JSON.parse(rh.value);
          // v1 gravava um array puro; v2 guarda { h, apagados }
          if (Array.isArray(g)) histLocal = g;
          else if (g && typeof g === "object") { histLocal = g.h || []; apagadosLocal = g.apagados || []; }
          setHistorico(histLocal); setApagados(apagadosLocal);
        }
      } catch (e) { setAvisoDados((a) => a || "O histórico de provas não pôde ser lido. Nada foi apagado."); }
      setLoaded(true);
      // Sincronia automática ao abrir, nos DOIS sentidos:
      // nuvem mais nova → adota; aparelho mais novo (típico de quem estudou
      // sem internet) → sobe na hora, sem depender de uma ação seguinte.
      if (local && local.syncUrl && local.syncCod) {
        try {
          const nuvem = await nuvemBuscar(local.syncUrl, local.syncCod);
          const qNuvem = (nuvem && !nuvem.vazio && nuvem.quando) || 0;
          const qLocal = local.quando || 0;
          const acao = decidirSync(qLocal, qNuvem);
          if (acao === "puxar") {
            // A nuvem é mais recente — mas "mais recente" não quer dizer
            // "mais completa". Se este aparelho tem trabalho que a nuvem não
            // tem, puxar apagaria. Nesse caso, para e pergunta.
            const conf = conflitoDeSync(local, nuvem);
            if (conf) {
              setConflitoSync({ ...conf, nuvemEstado: nuvem, localEstado: local });
              setMsgSync("");
            } else {
              const juntado = { ...nuvem, syncUrl: local.syncUrl, syncCod: local.syncCod };
              aplicarEstado(juntado);
              await window.storage.set(SAVE_KEY, JSON.stringify(juntado));
              setMsgSync("Progresso atualizado com o que estava na nuvem.");
            }
          } else if (acao === "empurrar") {
            await nuvemEnviar(local.syncUrl, local.syncCod, local);
            setMsgSync(qNuvem ? "Este aparelho estava à frente: enviei o progresso para a nuvem."
                              : "Primeiro envio feito: a nuvem agora tem o seu progresso.");
          }

          // ---- HISTÓRICO DE PROVAS: sempre UNIÃO, nunca substituição ----
          // O XP e a precisão seguem a regra do carimbo mais recente, porque
          // são o mesmo dado evoluindo. As provas encerradas não: cada uma é
          // um fato próprio, e uma feita no celular não pode apagar a que foi
          // feita no computador. Por isso este trecho roda SEMPRE, mesmo
          // quando a decisão acima foi "nada".
          try {
            const mortos = mesclarApagados(apagadosLocal, nuvem.apagados);
            const daNuvem = (nuvem.hist || []).map(unpackTentativa);
            const unido = mesclarHistorico(histLocal, daNuvem, mortos);
            const mudouAqui = unido.length !== histLocal.length || mortos.length !== apagadosLocal.length;
            const faltaNaNuvem = unido.length !== daNuvem.length || mortos.length !== (nuvem.apagados || []).length;
            if (mudouAqui) {
              setHistorico(unido); setApagados(mortos);
              await window.storage.set(HIST_KEY, JSON.stringify({ h: unido, apagados: mortos }));
            }
            if (faltaNaNuvem) {
              await nuvemEnviar(local.syncUrl, local.syncCod, {
                ...(acao === "puxar" ? nuvem : local),
                hist: unido.map(packTentativa), apagados: mortos, quando: Date.now(),
              });
            }
            if (mudouAqui && unido.length > histLocal.length) {
              setMsgSync(`Trouxe ${unido.length - histLocal.length} prova(s) feita(s) em outro aparelho.`);
            }
          } catch (e) {}
        } catch (e) { setMsgSync("Sem conexão com a nuvem agora — seguindo com o progresso local."); }
      }
    })();
  }, []);

  const salvar = (patch) => {
    // `histAgora` e `apagadosAgora` permitem gravar já com o valor novo,
    // sem esperar o React reprocessar o estado.
    const { histAgora, apagadosAgora, ...resto } = patch || {};
    const st = { esquema: ESQUEMA, xp, combo, stats, feitos, bossBest, errados, favs, pressao, som, rev,
      syncUrl, syncCod,
      hist: (histAgora || historico).map(packTentativa),
      apagados: apagadosAgora || apagados,
      ...resto, quando: Date.now() };
    (async () => { try { await window.storage.set(SAVE_KEY, JSON.stringify(st)); } catch (e) {} })();
    // sobe para a nuvem pouco depois da última mexida. O atraso é curto de
    // propósito: cada segundo aqui é uma janela em que fechar o app deixa o
    // progresso preso neste aparelho.
    if (st.syncUrl && st.syncCod) {
      pendenteNuvem = st;
      clearTimeout(temporizadorNuvem);
      temporizadorNuvem = setTimeout(() => {
        const alvo = pendenteNuvem;
        if (!alvo) return;
        nuvemEnviar(alvo.syncUrl, alvo.syncCod, alvo)
          .then(() => { if (pendenteNuvem === alvo) pendenteNuvem = null; })
          .catch(() => {});
      }, 1500);
    }
  };

  // Fecha a janela em que o progresso ficava preso no aparelho: quando a
  // página é escondida ou descarregada, o que estiver pendente vai AGORA,
  // com keepalive, sem esperar o temporizador.
  useEffect(() => {
    const despejar = () => {
      const alvo = pendenteNuvem;
      if (!alvo || !alvo.syncUrl || !alvo.syncCod) return;
      clearTimeout(temporizadorNuvem);
      pendenteNuvem = null;
      nuvemEnviarAgora(alvo.syncUrl, alvo.syncCod, alvo).catch(() => { pendenteNuvem = alvo; });
    };
    // pagehide cobre o fechamento e o "voltar" no iOS; visibilitychange cobre
    // bloquear a tela e trocar de app, que é o caso do dia a dia no celular.
    const aoEsconder = () => { if (document.visibilityState === "hidden") despejar(); };
    window.addEventListener("pagehide", despejar);
    document.addEventListener("visibilitychange", aoEsconder);
    return () => {
      window.removeEventListener("pagehide", despejar);
      document.removeEventListener("visibilitychange", aoEsconder);
    };
  }, []);

  const modulo = MODULOS.find((m) => m.id === mId);
  const bloco = bId ? IDX_BLOCO[bId] : null;
  const nivel = nId ? IDX_NIVEL[nId] : null;
  const qAtual = sessao ? sessao.itens[sessao.i] : null;
  const respondida = escolha !== null;

  // internet de volta: sobe o que ficou pendente. Nunca troca a tela no meio
  // da sessão — se a nuvem estiver à frente, apenas avisa.
  useEffect(() => {
    const aoReconectar = async () => {
      try {
        const r = await window.storage.get(SAVE_KEY);
        if (!r || !r.value) return;
        const s = JSON.parse(r.value);
        if (!s.syncUrl || !s.syncCod) return;
        const nuvem = await nuvemBuscar(s.syncUrl, s.syncCod);
        const qNuvem = (nuvem && !nuvem.vazio && nuvem.quando) || 0;
        const acao = decidirSync(s.quando, qNuvem);
        if (acao === "empurrar") {
          await nuvemEnviar(s.syncUrl, s.syncCod, s);
          setMsgSync("Conexão de volta: enviei para a nuvem o que você fez offline.");
        } else if (acao === "puxar") {
          setMsgSync("Há progresso mais novo na nuvem. Recarregue o app para trazê-lo.");
        }
      } catch (e) {}
    };
    window.addEventListener("online", aoReconectar);
    return () => window.removeEventListener("online", aoReconectar);
  }, []);

  // som: liga/desliga trilha e efeitos; no iPhone o áudio destrava no 1º toque
  useEffect(() => { if (loaded) Som.set(som); }, [som, loaded]);
  useEffect(() => {
    const h = () => Som.destrava();
    window.addEventListener("pointerdown", h);
    return () => { window.removeEventListener("pointerdown", h); Som.set(false); };
  }, []);

  useEffect(() => {
    if (tela !== "quiz" || !sessao) return;
    const t = setInterval(() => setRelogio((r) => r + 1), 1000);
    return () => clearInterval(t);
  }, [tela, sessao]);

  // Cronômetro da prova. Conta a partir de `fimEm`, um instante ABSOLUTO
  // gravado no disco: recarregar a página, bloquear o celular ou trocar de
  // app não reinicia nada nem devolve tempo. Voltar depois do prazo cai
  // direto no encerramento automático.
  useEffect(() => {
    if (!prova || prova.entregue) return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    setAgora(Date.now());
    return () => clearInterval(t);
  }, [prova && prova.id, prova && prova.entregue]);

  useEffect(() => {
    if (!prova || prova.entregue) return;
    if (agora >= prova.fimEm) encerrarProva("tempo");
  }, [agora, prova]);

  useEffect(() => {
    if (tela !== "quiz" || !pressao || respondida || !sessao) return;
    if (tick <= 0) { responder(-1); return; }
    const t = setTimeout(() => setTick((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [tick, tela, pressao, respondida, sessao]);

  useEffect(() => {
    if (tela !== "quiz") return;
    const h = (e) => {
      if (!respondida && ["1", "2", "3", "4"].includes(e.key)) responder(Number(e.key) - 1);
      else if (respondida && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); avancar(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const abrir = (cfg) => {
    setSessao({ ...cfg, itens: cfg.itens.map(embaralhar), i: 0, acertos: 0, marcas: [], erros: [], resgate: false, porMod: {} });
    setEscolha(null); setDelta(null); setTick(TEMPO_QUESTAO); setRelogio(0); setDesfazer(null); setTela("quiz");
  };
  const jogarNivel = (id) => {
    const n = IDX_NIVEL[id];
    setNId(id);
    abrir({ tipo: "nivel", titulo: `${n.id} · ${n.titulo}`, itens: mainsOf(n).map((_, k) => IDX_Q[`${id}|${k}`]), nId: id, bId: n.bId });
  };
  const jogarChefao = (id) => {
    const b = IDX_BLOCO[id];
    abrir({ tipo: "boss", titulo: `Chefão · ${b.titulo}`, itens: b.boss.map((_, k) => IDX_Q[`${id}|BOSS|${k}`]), bId: id });
  };
  const jogarRevisao = () => {
    const itens = shuffle(errados).slice(0, 25).map((k) => IDX_Q[k]).filter(Boolean);
    if (!itens.length) return;
    abrir({ tipo: "revisao", titulo: "Revisão dos erros", itens });
  };
  // simulado ponderado como a prova: 20 / 40 / 30 / 10
  const jogarSimulado = (n) => {
    let itens = [];
    Object.entries(PESOS).forEach(([m, p]) => {
      const qtd = Math.round((n * p) / 100);
      itens = itens.concat(shuffle(CHAVES_POR_MODULO[m]).slice(0, qtd).map((k) => IDX_Q[k]));
    });
    // "autoral": as questões são nossas, escritas no formato da banca. Chamar
    // de "oficial" seria atribuir à ANBIMA um material que não é dela.
    abrir({ tipo: "simulado", titulo: `Simulado autoral · ${itens.length} questões`, itens: shuffle(itens) });
  };
  // ===================================================================
  // EXAME — sessão completa e lacrada, com a estrutura oficial:
  // 40 de múltipla escolha contextualizada + 10 itens de árvore, 2h30.
  // Nada aqui reaproveita a tela de estudo: é justamente a mistura das
  // duas que fazia a correção vazar no meio da prova.
  // ===================================================================
  const salvarProva = (p) => {
    setProva(p);
    (async () => { try { await window.storage.set(PROVA_KEY, JSON.stringify(p)); } catch (e) {} })();
  };

  const montarProva = () => {
    // Múltipla escolha: sorteio em duas dimensões ao mesmo tempo —
    //   · por MÓDULO, nos pesos 20/40/30/10;
    //   · por DIFICULDADE, nos 25% fácil / 50% médio / 25% difícil que a
    //     ANBIMA publica na página oficial da CPA.
    // A cota de cada módulo é repartida nessas três faixas; o que faltar
    // numa faixa é completado pela faixa vizinha e, em último caso, por
    // qualquer questão, para a prova nunca sair com menos de 40.
    const alvo = REGRAS_EXAME.multiplaEscolha.valor;
    const D = REGRAS_EXAME.dificuldade.valor; // { facil, medio, dificil }
    const usadas = new Set();
    const pegar = (lista, n) => {
      const out = [];
      for (const k of shuffle(lista)) {
        if (out.length >= n) break;
        if (!usadas.has(k)) { usadas.add(k); out.push(k); }
      }
      return out;
    };

    let chaves = [];
    Object.entries(PESOS).forEach(([m, p]) => {
      const cota = Math.round((alvo * p) / 100);
      const porDif = CHAVES_POR_MODULO_DIF[m] || { 1: [], 2: [], 3: [] };
      // reparte a cota do módulo nas três faixas, fechando a sobra no médio
      const nF = Math.round((cota * D.facil) / 100);
      const nD = Math.round((cota * D.dificil) / 100);
      const nM = cota - nF - nD;
      const alvoPorFaixa = { 1: nF, 2: nM, 3: nD };
      let doModulo = [];
      [1, 2, 3].forEach((d) => { doModulo = doModulo.concat(pegar(porDif[d], alvoPorFaixa[d])); });
      // faltou em alguma faixa? completa com o restante do próprio módulo
      if (doModulo.length < cota) doModulo = doModulo.concat(pegar(CHAVES_POR_MODULO[m].filter((k) => !IDX_Q[k].foraDoExame), cota - doModulo.length));
      chaves = chaves.concat(doModulo);
    });
    // rede final: arredondar quatro vezes pode fechar em 39 ou 41
    if (chaves.length < alvo) chaves = chaves.concat(pegar(ELEGIVEIS_EXAME, alvo - chaves.length));
    chaves = shuffle(chaves).slice(0, alvo);

    const itensMC = chaves.map((k) => {
      const q = IDX_Q[k];
      const ordem = ordemAlts(q.alts.length);
      return { tipo: "mc", chave: k, mId: q.mId, nId: q.nId, ordem, dif: q.dif || 2,
        gabarito: ordem.indexOf(q.c), // gabarito JÁ na ordem em que vai aparecer
        resposta: null, marcada: false };
    });

    // árvore: a ANBIMA conta 10 QUESTÕES, não 10 árvores. Pegamos atendimentos
    // inteiros a partir da primeira fala (a conversa precisa fazer sentido) e
    // cortamos no décimo item.
    const itensArv = [];
    const baralho = shuffle(ARVORES.map((a) => a.id));
    while (itensArv.length < REGRAS_EXAME.itensArvore.valor && baralho.length) {
      // pop() UMA vez, fora do find: dentro do callback ele era chamado a cada
      // comparação e esvaziava o baralho, devolvendo undefined (bug real,
      // pego no teste de interface — a prova quebrava ao montar).
      const id = baralho.pop();
      const a = ARVORES.find((x) => x.id === id);
      if (!a) continue;
      for (let i = 0; i < a.prompts.length && itensArv.length < REGRAS_EXAME.itensArvore.valor; i++) {
        itensArv.push({ tipo: "arvore", chave: `${a.id}|${i}`, arvId: a.id, passo: i,
          mId: "3", ordem: ordemAlts(a.prompts[i].alts.length),
          escolha: null, grauEscolhido: null, marcada: false });
      }
    }
    const inicio = Date.now();
    return {
      id: inicio,
      inicio,
      fimEm: inicio + REGRAS_EXAME.duracaoSeg.valor * 1000, // prazo ABSOLUTO
      versaoGabarito: VERSAO_GABARITO,
      regras: { duracaoSeg: REGRAS_EXAME.duracaoSeg.valor, mc: alvo,
        arvore: REGRAS_EXAME.itensArvore.valor, minimoAcertos: REGRAS_EXAME.minimoAcertos.valor,
        verificadoEm: REGRAS_EXAME.verificadoEm },
      i: 0,
      itens: [...itensMC, ...itensArv], // MC primeiro, atendimentos ao final
      entregue: false, entregueEm: null, motivoFim: null,
    };
  };

  // Apagar uma prova é ato deliberado: além de sair da lista, o id entra na
  // lápide. Sem isso, a próxima união com a nuvem traria a prova de volta —
  // o outro aparelho ainda a tem e não teria como saber que ela foi apagada.
  const apagarTentativa = async (id) => {
    const novo = historico.filter((h) => h.id !== id);
    const mortos = mesclarApagados(apagados, [id]);
    setHistorico(novo); setApagados(mortos);
    if (provaVista && provaVista.id === id) { setProvaVista(null); setTela("provaHome"); }
    try { await window.storage.set(HIST_KEY, JSON.stringify({ h: novo, apagados: mortos })); } catch (e) {}
    // manda a exclusão para a nuvem na hora, não daqui a pouco
    if (syncUrl && syncCod) {
      try { await nuvemEnviar(syncUrl, syncCod, estadoAtual({ hist: novo.map(packTentativa), apagados: mortos })); }
      catch (e) { setMsgSync("Apaguei aqui, mas não consegui avisar a nuvem. Ela some dos outros aparelhos quando houver internet."); }
    }
    salvar({ histAgora: novo, apagadosAgora: mortos });
  };

  const iniciarProva = () => { setConfirmando(false); setMapaAberto(false); salvarProva(montarProva()); setTela("prova"); };

  // grava uma resposta. Tocar de novo na MESMA alternativa não faz nada;
  // trocar por outra sobrescreve. Nunca acumula nem pontua duas vezes.
  const responderProva = (valor) => {
    if (!prova || prova.entregue || Date.now() >= prova.fimEm) return;
    const it = prova.itens[prova.i];
    const campo = it.tipo === "arvore" ? "escolha" : "resposta";
    if (it[campo] === valor) return;
    const itens = prova.itens.map((x, k) => {
      if (k !== prova.i) return x;
      if (x.tipo === "arvore") {
        const a = ARVORES.find((y) => y.id === x.arvId);
        return { ...x, escolha: valor, grauEscolhido: a.prompts[x.passo].alts[valor].grau };
      }
      return { ...x, resposta: valor };
    });
    salvarProva({ ...prova, itens });
  };

  const irPara = (i) => { if (prova && !prova.entregue) salvarProva({ ...prova, i: Math.max(0, Math.min(prova.itens.length - 1, i)) }); };
  const marcarItem = () => {
    if (!prova || prova.entregue) return;
    salvarProva({ ...prova, itens: prova.itens.map((x, k) => (k === prova.i ? { ...x, marcada: !x.marcada } : x)) });
  };

  // encerra e LACRA. A tentativa vai para o histórico com a versão do
  // gabarito usada; a partir daqui a interface não deixa mais mexer nela.
  const encerrarProva = (motivo) => {
    if (!prova || prova.entregue) return;
    const fechada = { ...prova, entregue: true, entregueEm: Date.now(), motivoFim: motivo,
      aparelho: nomeDoAparelho(), resultado: corrigir(prova) };
    // O histórico guarda as 30 mais recentes. Passou disso, a mais antiga
    // sai — e o usuário fica sabendo, em vez de a prova sumir em silêncio.
    const juntado = [fechada, ...historico];
    const novo = juntado.slice(0, LIMITE_HIST);
    if (juntado.length > 30) {
      const velha = juntado[30];
      setAvisoDados(`O histórico guarda as ${LIMITE_HIST} provas mais recentes. Para abrir espaço para esta, a de ${new Date(velha.id).toLocaleDateString("pt-BR")} saiu da lista. Se quiser guardar as antigas, baixe o arquivo de backup em Ajustes antes de fazer a próxima.`);
    }
    setHistorico(novo); setProva(null); setProvaVista(fechada);
    salvar({ histAgora: novo });
    setConfirmando(false); setMapaAberto(false);
    (async () => {
      try { await window.storage.set(HIST_KEY, JSON.stringify({ h: novo, apagados })); } catch (e) {}
      try { await window.storage.set(PROVA_KEY, ""); } catch (e) {}
    })();
    setTela("provaFim");
  };

  const responder = (i) => {
    if (escolha !== null || !sessao) return;
    const q = sessao.itens[sessao.i];
    const ok = i === q.c;
    setEscolha(i);
    const d = ok ? (combo >= 3 ? 20 : 10) : -5;
    const nxp = Math.max(0, xp + d);
    setDelta(d); setXp(nxp); setCombo(ok ? combo + 1 : 0);
    if (ok) { if (combo >= 3) Som.combo(); else Som.acerto(); } else Som.erro();
    setPop(ok ? (combo >= 3 ? "combo x2 🔥" : "acertou") : "errou");
    setTimeout(() => setPop(null), 1150);

    const ch = `${q.bId}/${q.nId}`;
    const ns = { ...stats, [ch]: { r: (stats[ch]?.r || 0) + (ok ? 1 : 0), w: (stats[ch]?.w || 0) + (ok ? 0 : 1) } };
    setStats(ns);
    let ne = errados;
    if (!ok && !errados.includes(q.key)) ne = [...errados, q.key];
    if (ok && sessao.tipo === "revisao") ne = errados.filter((k) => k !== q.key);
    setErrados(ne);
    setSessao((s) => {
      const pm = { ...s.porMod };
      pm[q.mId] = { r: (pm[q.mId]?.r || 0) + (ok ? 1 : 0), t: (pm[q.mId]?.t || 0) + 1 };
      return { ...s, acertos: s.acertos + (ok ? 1 : 0), marcas: [...s.marcas, ok], erros: ok ? s.erros : [...s.erros, q.key], porMod: pm };
    });
    // guarda o que esta resposta mudou, para permitir anular o toque errado
    setDesfazer({ key: q.key, ch, ok, delta: d, xpAntes: xp, comboAntes: combo,
      estavaNaFila: errados.includes(q.key), statsAntes: stats[ch] ? { ...stats[ch] } : null });
    salvar({ xp: nxp, combo: ok ? combo + 1 : 0, stats: ns, errados: ne });
  };

  // "cliquei sem querer": devolve XP, combo, precisão e fila de erros ao
  // estado anterior à resposta, e deixa a questão em aberto de novo.
  const anularResposta = () => {
    if (!desfazer || !sessao) return;
    const d = desfazer;
    setXp(d.xpAntes); setCombo(d.comboAntes); setDelta(null); setPop(null);
    const ns = { ...stats };
    if (d.statsAntes) ns[d.ch] = d.statsAntes; else delete ns[d.ch];
    setStats(ns);
    const ne = d.ok || d.estavaNaFila ? errados : errados.filter((k) => k !== d.key);
    setErrados(ne);
    setSessao((s) => {
      const pm = { ...s.porMod };
      const q = s.itens[s.i];
      if (pm[q.mId]) pm[q.mId] = { r: pm[q.mId].r - (d.ok ? 1 : 0), t: pm[q.mId].t - 1 };
      return { ...s, acertos: s.acertos - (d.ok ? 1 : 0), marcas: s.marcas.slice(0, -1),
        erros: d.ok ? s.erros : s.erros.filter((k) => k !== d.key), porMod: pm };
    });
    setDesfazer(null);
    setEscolha(null); setTick(TEMPO_QUESTAO);
    salvar({ xp: d.xpAntes, combo: d.comboAntes, stats: ns, errados: ne });
  };

  const avancar = () => {
    if (!sessao) return;
    setEscolha(null); setDelta(null); setTick(TEMPO_QUESTAO); setDesfazer(null);
    if (sessao.i + 1 < sessao.itens.length) { setSessao((s) => ({ ...s, i: s.i + 1 })); return; }
    if (sessao.tipo === "nivel" && sessao.erros.length && !sessao.resgate) {
      const n = IDX_NIVEL[sessao.nId];
      const r = IDX_Q[`${sessao.nId}|${n.questoes.length - 1}`];
      setSessao((s) => ({ ...s, itens: [...s.itens, embaralhar(r)], i: s.i + 1, resgate: true }));
      return;
    }
    if (sessao.tipo === "nivel") {
      const nf = { ...feitos, [sessao.nId]: { acertos: sessao.acertos, total: sessao.marcas.length } };
      setFeitos(nf); salvar({ feitos: nf });
    }
    if (sessao.tipo === "boss") {
      const nb = { ...bossBest, [sessao.bId]: Math.max(bossBest[sessao.bId] ?? -1, sessao.acertos) };
      setBossBest(nb); salvar({ bossBest: nb });
    }
    const passou = sessao.marcas.length && Math.round((sessao.acertos / sessao.marcas.length) * 100) >= 70;
    if (sessao.tipo === "boss") { if (passou) Som.chefao(); else Som.derrota(); }
    else if (passou) Som.vitoria(); else Som.derrota();
    setTela("resultado");
  };

  const toggleFav = (id) => {
    let nr = rev;
    if (favs.includes(id)) {
      const { [id]: _, ...resto } = rev; nr = resto;
    } else {
      Som.fav();
      nr = { ...rev, [id]: { n: 0, due: somaDias(1) } };
    }
    const nf = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
    setFavs(nf); setRev(nr); salvar({ favs: nf, rev: nr });
  };
  // revisão espaçada: favorita sem agenda (save antigo) conta como vencida
  const revDevidas = favs.filter((id) => !rev[id] || rev[id].due <= hojeISO());
  const marcarRev = (id, lembrou) => {
    const n = lembrou ? Math.min((rev[id]?.n ?? 0) + 1, INTERVALOS_REV.length - 1) : 0;
    const nr = { ...rev, [id]: { n, due: somaDias(INTERVALOS_REV[n]) } };
    setRev(nr); salvar({ rev: nr });
    if (lembrou) Som.acerto(); else Som.erro();
  };

  const zerar = async () => {
    setXp(0); setCombo(0); setStats({}); setFeitos({}); setBossBest({}); setErrados([]); setFavs([]); setRev({});
    setConf(false); setTela("home");
    try { await window.storage.set(SAVE_KEY, JSON.stringify({ xp: 0, combo: 0, stats: {}, feitos: {}, bossBest: {}, errados: [], favs: [], rev: {}, pressao, som })); } catch (e) {}
  };

  const gerarBackup = () => {
    try {
      // v4 passa a levar junto o histórico de provas, que a nuvem não sincroniza
      const d = { v: 4, esquema: ESQUEMA, xp, combo, stats, feitos, bossBest, errados, favs, rev, pressao,
        historico, quando: new Date().toISOString().slice(0, 10) };
      setBackup(btoa(unescape(encodeURIComponent(JSON.stringify(d)))));
      setMsgBk(`Código gerado com o progresso e ${historico.length} prova(s) do histórico. Guarde num bloco de notas.`);
    } catch (e) { setMsgBk("Não consegui gerar o código."); }
  };
  const copiar = async () => {
    try { await navigator.clipboard.writeText(backup); setMsgBk("Copiado."); }
    catch (e) { setMsgBk("Segure o dedo no código, selecione tudo e copie."); }
  };
  // Baixa o backup como ARQUIVO. O código para copiar e colar funciona, mas
  // some junto com o histórico do navegador; um arquivo o usuário guarda
  // onde quiser (iCloud, Drive, e-mail para si mesmo) e não depende deste
  // aparelho continuar existindo.
  const baixarBackup = () => {
    try {
      if (!backup) { setMsgBk("Gere o código primeiro."); return; }
      const conteudo = [
        "# Backup do Projeto CPA",
        "# Gerado em " + new Date().toLocaleString("pt-BR"),
        "# XP " + xp + " · " + Object.keys(stats).length + " tópicos com precisão · " + historico.length + " prova(s) no histórico",
        "#",
        "# Para restaurar: abra o app → Ajustes → cole a linha abaixo em",
        "# \"Restaurar de um código\" → escolha Somar ou Substituir.",
        "",
        backup,
        "",
      ].join("\n");
      const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `projeto-cpa-backup-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setMsgBk("Arquivo baixado. Guarde-o fora deste aparelho.");
    } catch (e) { setMsgBk("Não consegui baixar o arquivo. Use o botão de copiar."); }
  };
  // ---- sincronia manual ----
  // O que trafega. `hist` vai compactado (ver packTentativa) e `apagados`
  // leva as lápides, para apagar num aparelho valer em todos.
  const estadoAtual = (extra) => ({ xp, combo, stats, feitos, bossBest, errados, favs, pressao, som, rev,
    syncUrl, syncCod, hist: historico.map(packTentativa), apagados,
    ...extra, quando: Date.now() });
  const enviarNuvem = async () => {
    if (!syncUrl || !syncCod) { setMsgSync("Cole o endereço e gere um código primeiro."); return; }
    setSincronizando(true); setMsgSync("");
    try {
      const st = estadoAtual();
      await nuvemEnviar(syncUrl, syncCod, st);
      await window.storage.set(SAVE_KEY, JSON.stringify(st));
      setMsgSync("Enviado. Agora use o mesmo endereço e código no outro aparelho.");
    } catch (e) { setMsgSync("Não consegui enviar (" + e.message + "). Confira o endereço."); }
    setSincronizando(false);
  };
  const buscarNuvem = async () => {
    if (!syncUrl || !syncCod) { setMsgSync("Cole o endereço e o código primeiro."); return; }
    setSincronizando(true); setMsgSync("");
    try {
      const nuvem = await nuvemBuscar(syncUrl, syncCod);
      if (!nuvem || nuvem.vazio) { setMsgSync("Não há nada guardado nesse código ainda."); setSincronizando(false); return; }
      const juntado = { ...nuvem, syncUrl, syncCod };
      aplicarEstado(juntado);
      await window.storage.set(SAVE_KEY, JSON.stringify(juntado));
      const q = nuvem.quando ? new Date(nuvem.quando).toLocaleString("pt-BR") : "data desconhecida";
      setMsgSync("Progresso trazido da nuvem (salvo em " + q + ").");
    } catch (e) { setMsgSync("Não consegui buscar (" + e.message + "). Confira o endereço e o código."); }
    setSincronizando(false);
  };

  // aceita o código novo e também os quatro códigos antigos, somando o progresso
  // modo "somar" junta ao que já existe (serve para fundir apps antigos);
  // modo "substituir" troca o progresso local pelo do código — é o que se
  // usa para copiar de um aparelho para o outro sem inflar XP.
  // Um backup só é aceito se tiver a cara de um backup. Sem isto, colar
  // qualquer texto em base64 gravava lixo por cima do progresso.
  const backupValido = (d) => (
    d && typeof d === "object" &&
    typeof d.xp === "number" && isFinite(d.xp) && d.xp >= 0 &&
    (d.stats === undefined || (d.stats && typeof d.stats === "object")) &&
    (d.errados === undefined || Array.isArray(d.errados)) &&
    (d.favs === undefined || Array.isArray(d.favs)) &&
    (d.historico === undefined || Array.isArray(d.historico))
  );
  // tentativas encerradas: só entram as que ainda dá para corrigir
  const historicoValido = (h) => (Array.isArray(h) ? h : []).filter(
    (t) => t && t.id && Array.isArray(t.itens) && t.entregue
  );

  const restaurar = (modo = "somar") => {
    const linhas = entrada.split(/\s*\n\s*/).map((x) => x.trim()).filter(Boolean);
    if (!linhas.length) { setMsgBk("Cole um ou mais códigos, um por linha."); return; }
    if (modo === "substituir") {
      try {
        const d = JSON.parse(decodeURIComponent(escape(atob(linhas[0]))));
        if (!backupValido(d)) { setMsgBk("Esse código não é um backup deste app (ou está truncado). Nada foi alterado."); return; }
        const novo = { xp: d.xp || 0, combo: 0, stats: d.stats || {}, feitos: d.feitos || {},
          bossBest: d.bossBest || {}, errados: d.errados || [], favs: d.favs || [],
          rev: d.rev || {}, pressao: !!d.pressao, som, syncUrl, syncCod };
        aplicarEstado(novo);
        salvar(novo);
        let extra = "";
        if (d.historico !== undefined) {
          const h = historicoValido(d.historico);
          setHistorico(h);
          (async () => { try { await window.storage.set(HIST_KEY, JSON.stringify(h)); } catch (e) {} })();
          extra = ` Histórico de provas substituído por ${h.length} tentativa(s).`;
        } else {
          extra = " O código é de uma versão anterior e não trazia histórico de provas — o daqui foi mantido.";
        }
        setEntrada("");
        setMsgBk("Progresso SUBSTITUÍDO pelo do código. O que havia neste aparelho foi descartado." + extra);
      } catch (e) { setMsgBk("Código inválido. Confira se copiou o texto inteiro. Nada foi alterado."); }
      return;
    }
    let nxp = xp, ns = { ...stats }, nf = { ...feitos }, nb = { ...bossBest }, ne = [...errados], nfa = [...favs];
    let nrev = { ...rev };
    let nhist = [...historico];
    let ok = 0, ruins = 0;
    linhas.forEach((txt) => {
      try {
        const d = JSON.parse(decodeURIComponent(escape(atob(txt))));
        if (!backupValido(d)) { ruins++; return; }
        // tentativas encerradas não se somam nem se recalculam: só entram as
        // que este aparelho ainda não tem, identificadas pelo instante de início
        historicoValido(d.historico).forEach((t) => { if (!nhist.some((x) => x.id === t.id)) nhist.push(t); });
        nxp += d.xp || 0;
        Object.entries(d.stats || {}).forEach(([k, v]) => {
          ns[k] = { r: (ns[k]?.r || 0) + (v.r || 0), w: (ns[k]?.w || 0) + (v.w || 0) };
        });
        Object.assign(nf, d.feitos || {});
        Object.entries(d.bossBest || {}).forEach(([k, v]) => { nb[k] = Math.max(nb[k] ?? -1, v); });
        (d.errados || []).forEach((k) => { if (!ne.includes(k)) ne.push(k); });
        (d.favs || []).forEach((k) => { if (!nfa.includes(k)) nfa.push(k); });
        Object.entries(d.rev || {}).forEach(([k, v]) => { if (!nrev[k]) nrev[k] = v; });
        ok++;
      } catch (e) { ruins++; }
    });
    if (!ok) { setMsgBk(`Nenhum código válido (${ruins} recusado${ruins > 1 ? "s" : ""}). Nada foi alterado.`); return; }
    nhist.sort((a, b) => b.id - a.id);
    nhist = nhist.slice(0, 30);
    setXp(nxp); setStats(ns); setFeitos(nf); setBossBest(nb); setErrados(ne); setFavs(nfa); setRev(nrev);
    setHistorico(nhist);
    salvar({ xp: nxp, stats: ns, feitos: nf, bossBest: nb, errados: ne, favs: nfa, rev: nrev });
    (async () => { try { await window.storage.set(HIST_KEY, JSON.stringify(nhist)); } catch (e) {} })();
    setEntrada("");
    setMsgBk(`${ok} código${ok > 1 ? "s" : ""} importado${ok > 1 ? "s" : ""} e somado${ok > 1 ? "s" : ""} ao progresso${ruins ? ` · ${ruins} recusado(s) por não parecerem backup` : ""}. Histórico com ${nhist.length} prova(s).`);
  };

  // derivados
  const feitosDoBloco = (b) => b.niveis.filter((n) => feitos[n.id]).length;
  const feitosDoModulo = (m) => m.blocos.reduce((a, b) => a + feitosDoBloco(b), 0);
  const niveisDoModulo = (m) => m.blocos.reduce((a, b) => a + b.niveis.length, 0);
  const totalFeitos = MODULOS.reduce((a, m) => a + feitosDoModulo(m), 0);
  const pat = patenteAtual(xp), prox = proxPatente(xp);
  const pctPat = prox ? Math.min(100, ((xp - pat.xp) / (prox.xp - pat.xp)) * 100) : 100;
  // comparação EXATA: com startsWith, 1.1.1 absorvia 1.1.10/11/12 e
  // 2.1.3 absorvia 2.1.3.1–3 (IDs de nível são prefixo uns dos outros)
  const precisao = (chave) => {
    const v = stats[chave];
    return v && v.r + v.w ? Math.round((v.r / (v.r + v.w)) * 100) : null;
  };
  const precisaoModulo = (m) => {
    let r = 0, w = 0;
    m.blocos.forEach((b) => Object.entries(stats).forEach(([k, v]) => { if (k.startsWith(b.id + "/")) { r += v.r; w += v.w; } }));
    return r + w ? Math.round((r / (r + w)) * 100) : null;
  };
  const cor = (id) => `var(--${CORES[id]})`;
  const corL = (id) => `var(--${CORES[id]}-l)`;
  // maço automático: níveis com precisão abaixo de 70%, do pior para o melhor.
  // Vem depois de precisao() de propósito — é ela que alimenta a lista.
  const fracos = TODOS_NIVEIS
    .map((n) => ({ id: n.id, p: precisao(`${n.bId}/${n.id}`) }))
    .filter((x) => x.p !== null && x.p < 70)
    .sort((a, b) => a.p - b.p)
    .map((x) => x.id);

  if (!loaded) return (
    <div className="cx"><style>{CSS}</style>
      <div className="cx-wrap" style={{ paddingTop: 130, textAlign: "center" }}>
        <div className="cx-eye">carregando seu progresso...</div>
      </div>
    </div>
  );

  const Topo = ({ voltar, cAtiva }) => (
    <>
      <div className="cx-top">
        <div className="cx-topin">
          {voltar ? <button className="cx-chip" onClick={voltar}>← Voltar</button>
            : <div className="cx-logo">Projeto <b>CPA</b></div>}
          <div className="cx-xp">
            {delta !== null && <span className={"cx-delta " + (delta > 0 ? "up" : "dn")}>{delta > 0 ? "+" : "−"}{Math.abs(delta)}</span>}
            <span className="cx-num" style={{ color: cAtiva || "var(--azul)" }}>{brl(xp)}</span>
            <button className="cx-chip" style={{ padding: "5px 9px" }} aria-label={som ? "Desligar som" : "Ligar som"}
              onClick={() => { const v = !som; setSom(v); salvar({ som: v }); }}>{som ? "🔊" : "🔇"}</button>
            <span className="cx-pat">{pat.emoji}<span style={{ display: "none" }}>x</span></span>
          </div>
        </div>
        <div className="cx-prog"><i style={{ width: pctPat + "%" }} /></div>
      </div>
      {pop && <div className={"cx-pop " + (pop === "errou" ? "no" : "ok")}>{pop}</div>}
    </>
  );

  // caixinha com o significado do termo tocado no conteúdo
  const CaixaTermo = () => !termo ? null : (
    <>
      <div className="cx-veu" onClick={() => setTermo(null)} />
      <div className="cx-sheet" role="dialog" aria-label={"Significado de " + termo}>
        <div className="puxador" />
        <h4>{termo}</h4>
        <p>{VERBETES[termo]}</p>
        <button className="cx-chip" style={{ marginTop: 15 }} onClick={() => setTermo(null)}>Entendi</button>
      </div>
    </>
  );

  // ---------------- HOME ----------------
  if (tela === "home") {
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo />
        <div className="cx-wrap">
          {conflitoSync && (
            <div className="cx-pane" style={{ marginTop: 14, borderColor: "var(--gold)", borderWidth: 2 }} role="alert">
              <div className="cx-lb" style={{ color: "var(--gold)" }}>Os dois lados têm progresso diferente</div>
              <p style={{ color: "var(--ink2)" }}>
                A nuvem foi gravada depois, mas <b>este aparelho tem coisa que ela não tem</b>:
                {" "}{conflitoSync.perde.join(" · ")}. Trazer a nuvem por cima apagaria isso, então
                parei aqui. <b>Nada foi alterado ainda.</b>
              </p>
              <table className="cx-tbl"><tbody>
                <tr><td /><td style={{ textAlign: "right" }}>Este aparelho</td></tr>
                <tr><td>Respostas dadas</td><td>{conflitoSync.local.respostas} · nuvem {conflitoSync.nuvem.respostas}</td></tr>
                <tr><td>Pílulas vencidas</td><td>{conflitoSync.local.pilulas} · nuvem {conflitoSync.nuvem.pilulas}</td></tr>
                <tr><td>XP</td><td>{brl(conflitoSync.local.xp)} · nuvem {brl(conflitoSync.nuvem.xp)}</td></tr>
              </tbody></table>
              <div style={{ display: "grid", gap: 9, marginTop: 14 }}>
                <button className="cx-btn" onClick={async () => {
                  // fica com o deste aparelho e manda para a nuvem
                  const st = { ...estadoAtual(), quando: Date.now() };
                  try { await nuvemEnviar(st.syncUrl, st.syncCod, st); await window.storage.set(SAVE_KEY, JSON.stringify(st)); setMsgSync("Este aparelho virou a versão boa: enviei para a nuvem."); }
                  catch (e) { setMsgSync("Não consegui enviar agora. Seu progresso continua intacto aqui; tente de novo com internet."); }
                  setConflitoSync(null);
                }}>Ficar com o deste aparelho e enviar</button>
                <button className="cx-btn sec" onClick={async () => {
                  const n = conflitoSync.nuvemEstado;
                  const juntado = { ...n, syncUrl, syncCod };
                  aplicarEstado(juntado);
                  try { await window.storage.set(SAVE_KEY, JSON.stringify(juntado)); } catch (e) {}
                  setMsgSync("Trouxe o da nuvem. Se precisar do que havia aqui, use um código de backup antigo.");
                  setConflitoSync(null);
                }}>Trazer o da nuvem (descarta o daqui)</button>
                <button className="cx-chip" style={{ justifyContent: "center" }} onClick={() => {
                  // não decide nada: leva à cópia de segurança para o usuário
                  // guardar o estado deste aparelho ANTES de escolher
                  const el = document.getElementById("cx-backup");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}>
                  Guardar um backup deste aparelho antes de decidir
                </button>
              </div>
            </div>
          )}
          {avisoDados && (
            <div className="cx-pane" style={{ marginTop: 14, borderColor: "var(--no)" }} role="alert">
              <div className="cx-lb" style={{ color: "var(--no)" }}>Atenção com os dados</div>
              <p style={{ color: "var(--ink2)" }}>{avisoDados}</p>
              <button className="cx-chip" style={{ marginTop: 9 }} onClick={() => setAvisoDados("")}>Entendi</button>
            </div>
          )}
          <h1 className="cx-h1">Um app,<br />quatro módulos,<br /><span style={{ color: "var(--azul)" }}>{TOTAL_QUESTOES} questões.</span></h1>
          <p className="cx-p">
            {pat.emoji} <b>{pat.nome}</b>{prox ? ` · faltam ${brl(prox.xp - xp)} XP para ${prox.nome}` : " · patente máxima"}.
            Você venceu {totalFeitos} das {TOTAL_NIVEIS} pílulas.
          </p>

          <div className="cx-bar">
            <button className="cx-chip" onClick={() => setTela("fichas")}>🗂 Fichas de memorização</button>
            <button className="cx-chip" onClick={() => { setArv(null); setTela("arvores"); }}>💬 Atendimento (árvore)</button>
            <button className="cx-chip" onClick={() => setTela("musicas")}>🎵 Cantigas da prova</button>
            <button className="cx-chip" onClick={() => setTela("confrontos")}>⚖️ Fichas de confronto</button>
            <button className="cx-chip" onClick={() => setTela("tabelao")}>🔢 Tabelão da prova</button>
            <button className="cx-chip" onClick={() => { setBuscaGl(""); setTela("glossario"); }}>📖 Glossário</button>
            <button className="cx-chip" onClick={() => jogarSimulado(60)}>🎯 Simulado autoral (60)</button>
            <button className="cx-chip" onClick={() => setTela("provaHome")}>🎓 Exame · {TOTAL_ITENS_PROVA} itens · 2h30{prova ? " (em andamento)" : ""}</button>
            <button className="cx-chip" onClick={jogarRevisao} disabled={!errados.length}>🔁 Revisar erros ({errados.length})</button>
            <button className="cx-chip" onClick={() => { setFiltroFicha("rev"); setTela("fichas"); }} disabled={!favs.length}>📅 Revisão do dia ({revDevidas.length})</button>
            <button className={"cx-chip" + (pressao ? " on" : "")} onClick={() => { setPressao(!pressao); salvar({ pressao: !pressao }); }}>
              ⏱ Modo pressão {pressao ? "on" : "off"}
            </button>
          </div>

          <div className="cx-mods">
            {MODULOS.map((m) => {
              const f = feitosDoModulo(m), tot = niveisDoModulo(m);
              const pct = Math.round((f / tot) * 100);
              const prec = precisaoModulo(m);
              return (
                <button key={m.id} className="cx-mod" onClick={() => { setMId(m.id); setTela("modulo"); }}>
                  <span className="faixa" style={{ background: cor(m.id) }} />
                  <div className="cab">
                    <span className="cx-badge" style={{ background: cor(m.id) }}>{m.id}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cx-mtt">{m.nome}</div>
                      <div className="cx-mst">{m.subtitulo}</div>
                    </div>
                    <span className="cx-peso" style={{ background: corL(m.id), color: cor(m.id) }}>{m.peso}% da prova</span>
                  </div>
                  <div className="cx-trilha"><i style={{ width: pct + "%", background: cor(m.id) }} /></div>
                  <div className="cx-meta">
                    <span>{f}/{tot} pílulas</span>
                    {prec !== null && <span>· {prec}% de acerto</span>}
                    <span style={{ marginLeft: "auto" }}>{pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="cx-pane" id="cx-backup" style={{ marginTop: 22 }}>
            <div className="cx-lb">Cópia de segurança</div>
            <p style={{ fontSize: 13.5, color: "var(--ink2)" }}>
              O progresso salva sozinho a cada questão. Este código é a apólice, e o campo de restauração
              aceita também os códigos dos quatro apps antigos: cole um por linha e o progresso é somado.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 10px" }}>
              <button className="cx-chip" onClick={gerarBackup}>⬇ Gerar código</button>
              {backup && <button className="cx-chip" onClick={copiar}>📋 Copiar</button>}
              {backup && <button className="cx-chip" onClick={baixarBackup}>⬇ Baixar arquivo</button>}
            </div>
            {backup && <textarea className="cx-ta" readOnly value={backup} rows={4} onFocus={(e) => e.target.select()} />}
            <div className="cx-lb" style={{ marginTop: 16 }}>Restaurar ou importar</div>
            <textarea className="cx-ta" rows={3} value={entrada} onChange={(e) => setEntrada(e.target.value)} placeholder="cole aqui um ou mais códigos, um por linha" />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 9 }}>
              <button className="cx-chip" onClick={() => restaurar("somar")}>➕ Somar ao que já tenho</button>
              <button className="cx-chip" onClick={() => restaurar("substituir")}>♻️ Substituir tudo</button>
            </div>
            <p style={{ fontSize: 12, color: "var(--mut)", marginTop: 8, fontWeight: 700 }}>
              Para juntar apps antigos, use Somar. Para copiar o progresso de outro aparelho, use Substituir.
            </p>
            {msgBk && <p style={{ fontSize: 13, color: "var(--azul)", fontWeight: 700, marginTop: 10 }}>{msgBk}</p>}
          </div>

          <div className="cx-pane">
            <div className="cx-lb">Sincronizar entre aparelhos</div>
            <p style={{ fontSize: 13.5, color: "var(--ink2)" }}>
              Com um endereço de sincronia configurado, iPhone e computador passam a mostrar o mesmo
              progresso sozinhos. Sem endereço, o app continua 100% local e nada sai daqui.
            </p>
            <p style={{ fontSize: 12.5, color: "var(--ink2)", marginTop: 9, fontWeight: 700, lineHeight: 1.5 }}>
              <b>Vai para a nuvem:</b> XP, precisão por tópico, pílulas vencidas, fila de erros, favoritas e revisão.<br />
              <b>Fica só neste aparelho:</b> a prova em andamento e o histórico de provas encerradas — são pesados
              demais para o limite do serviço. Para levá-los a outro aparelho, use o código de backup abaixo.
            </p>
            <input className="cx-busca" style={{ marginTop: 12 }} value={syncUrl}
              onChange={(e) => { setSyncUrl(e.target.value.trim()); salvar({ syncUrl: e.target.value.trim() }); }}
              placeholder="endereço do serviço (https://...workers.dev)" aria-label="Endereço de sincronia" />
            <input className="cx-busca" style={{ marginTop: 8 }} value={syncCod}
              onChange={(e) => { setSyncCod(e.target.value.trim()); salvar({ syncCod: e.target.value.trim() }); }}
              placeholder="seu código secreto" aria-label="Código de sincronia" />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <button className="cx-chip" onClick={() => { const c = novoCodigo(); setSyncCod(c); salvar({ syncCod: c }); setMsgSync("Código criado. Guarde-o: é a chave do seu cofre."); }}>🔑 Gerar código</button>
              <button className="cx-chip" disabled={sincronizando} onClick={enviarNuvem}>⬆ Enviar para a nuvem</button>
              <button className="cx-chip" disabled={sincronizando} onClick={buscarNuvem}>⬇ Buscar da nuvem</button>
            </div>
            {msgSync && <p style={{ fontSize: 13, color: "var(--azul)", fontWeight: 700, marginTop: 10 }}>{msgSync}</p>}
            <p style={{ fontSize: 12, color: "var(--mut)", marginTop: 10, fontWeight: 700, lineHeight: 1.5 }}>
              Em caso de conflito, vence a versão mais recente. Trate o código como senha:
              quem tiver o endereço e o código enxerga o seu progresso.
            </p>
          </div>

          <div className="cx-foot">
            <span className="cx-kbd">1</span> <span className="cx-kbd">2</span> <span className="cx-kbd">3</span> <span className="cx-kbd">4</span> respondem · <span className="cx-kbd">Enter</span> avança
            <br />
            {!conf ? <button className="cx-chip" style={{ marginTop: 14 }} onClick={() => setConf(true)}>Zerar progresso</button>
              : <span style={{ display: "inline-flex", gap: 8, marginTop: 14 }}>
                  <button className="cx-chip" style={{ borderColor: "var(--no)", color: "var(--no)" }} onClick={zerar}>Apagar tudo mesmo</button>
                  <button className="cx-chip" onClick={() => setConf(false)}>Cancelar</button>
                </span>}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- MÓDULO ----------------
  if (tela === "modulo") {
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => setTela("home")} cAtiva={cor(mId)} />
        <div className="cx-wrap">
          <div className="cx-eye" style={{ marginTop: 20, color: cor(mId) }}>Módulo {modulo.id} · {modulo.peso}% da prova</div>
          <h1 className="cx-h1" style={{ fontSize: 27, margin: "5px 0 6px" }}>{modulo.nome}</h1>
          <p className="cx-p">{modulo.subtitulo}</p>
          <div style={{ marginTop: 18 }}>
            {modulo.blocos.map((b) => {
              const f = feitosDoBloco(b), pct = Math.round((f / b.niveis.length) * 100);
              const best = bossBest[b.id], corte = Math.ceil(b.boss.length * 0.7);
              return (
                <button key={b.id} className="cx-mod" style={{ marginBottom: 11 }} onClick={() => { setBId(b.id); setTela("bloco"); }}>
                  <span className="faixa" style={{ background: cor(mId) }} />
                  <div className="cab">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cx-eye" style={{ color: cor(mId) }}>Bloco {b.id}</div>
                      <div className="cx-mtt" style={{ marginTop: 2 }}>{b.titulo}</div>
                      {b.subtitulo && <div className="cx-mst">{b.subtitulo}</div>}
                    </div>
                    <span style={{ fontSize: 20, color: "var(--mut)" }}>›</span>
                  </div>
                  <div className="cx-trilha"><i style={{ width: pct + "%", background: cor(mId) }} /></div>
                  <div className="cx-meta">
                    <span>{f}/{b.niveis.length} pílulas</span>
                    {best !== undefined && <span>· chefão {best}/{b.boss.length}{best >= corte ? " 🏆" : ""}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- BLOCO ----------------
  if (tela === "bloco") {
    const f = feitosDoBloco(bloco), tudo = f === bloco.niveis.length;
    const corte = Math.ceil(bloco.boss.length * 0.7);
    const linhas = bloco.niveis.map((n) => {
      const p = precisao(`${bloco.id}/${n.id}`);
      return p === null ? null : { id: n.id, pct: p };
    }).filter(Boolean).sort((a, b) => a.pct - b.pct);
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => setTela("modulo")} cAtiva={cor(mId)} />
        <div className="cx-wrap">
          <div className="cx-eye" style={{ marginTop: 20, color: cor(mId) }}>Bloco {bloco.id}</div>
          <h2 className="cx-h2">{bloco.titulo}</h2>
          {bloco.subtitulo && <p className="cx-p">{bloco.subtitulo}</p>}
          <div style={{ marginTop: 18 }}>
            {bloco.niveis.map((n) => {
              const d = feitos[n.id], perf = d && d.acertos === d.total;
              return (
                <button key={n.id} className="cx-lv" onClick={() => { setNId(n.id); setTela("pilula"); }}>
                  <span className="n cx-mono" style={{ color: cor(mId) }}>{n.id}</span>
                  <span className="t">{n.titulo}</span>
                  <span className="s" style={{ color: perf ? "var(--gold)" : d ? "var(--ok)" : "var(--mut)" }}>
                    {perf ? "★ 100%" : d ? `✓ ${d.acertos}/${d.total}` : "abrir"}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="cx-btn" disabled={!tudo} style={tudo ? { background: cor(mId), boxShadow: "none" } : {}} onClick={() => jogarChefao(bloco.id)}>
              {tudo ? `⚔ Chefão · ${bloco.boss.length} questões` : `Chefão travado · faltam ${bloco.niveis.length - f} pílulas`}
            </button>
            {bossBest[bloco.id] !== undefined && (
              <div style={{ textAlign: "center", fontSize: 12, color: "var(--mut)", marginTop: 9, fontWeight: 700 }}>
                melhor placar {bossBest[bloco.id]}/{bloco.boss.length} · aprovação a partir de {corte}
              </div>
            )}
          </div>
          {linhas.length > 0 && (
            <div className="cx-pane" style={{ marginTop: 20 }}>
              <div className="cx-lb">Onde você mais escorrega</div>
              <div className="cx-chart">
                {linhas.slice(0, 9).map((l) => (
                  <div className="cx-crow" key={l.id}>
                    <span className="cx-mono" style={{ color: "var(--mut)" }}>{l.id}</span>
                    <span className="cx-track"><i style={{ width: l.pct + "%", background: l.pct >= 70 ? "var(--ok)" : l.pct >= 50 ? "var(--gold)" : "var(--no)" }} /></span>
                    <span style={{ textAlign: "right" }}>{l.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- PÍLULA (só o conteúdo) ----------------
  if (tela === "pilula") {
    const vistos = new Set(); // um mesmo termo é marcado uma vez por pílula
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => setTela("bloco")} cAtiva={cor(mId)} />
        <div className="cx-wrap">
          <div className="cx-eye" style={{ marginTop: 20, color: cor(mId) }}>Pílula {nivel.id}</div>
          <h2 className="cx-h2" style={{ marginBottom: 14 }}>{nivel.titulo}</h2>
          <div className="cx-pane">
            <div className="cx-lb">Conteúdo</div>
            {nivel.resumo.map((r, i) => <p key={i}>{marcarTermos(r, vistos, setTermo)}</p>)}
            <p style={{ fontSize: 12, color: "var(--mut)", marginTop: 12, fontWeight: 700 }}>
              Toque nas palavras <span style={{ color: "var(--azul)", textDecoration: "underline", textDecorationStyle: "dotted" }}>sublinhadas</span> para ver o significado.
            </p>
          </div>
          <button className="cx-btn" style={{ background: cor(mId), boxShadow: "none", marginTop: 4 }} onClick={() => jogarNivel(nivel.id)}>
            ⚡ Responder · {mainsOf(nivel).length} questões
          </button>
          <button className="cx-btn sec" style={{ marginTop: 9 }} onClick={() => { setFiltroFicha(mId); setAberta({ [nivel.id]: true }); setTela("fichas"); }}>
            🗂 Ver a ficha deste tópico
          </button>
        </div>
        <CaixaTermo />
      </div>
    );
  }

  // ---------------- ÁRVORE DE DECISÃO (questão interativa) ----------------
  if (tela === "arvores") {
    const a = arv ? ARVORES.find((x) => x.id === arv.id) : null;

    // lista de árvores
    if (!a) {
      return (
        <div className="cx"><style>{CSS}</style><div className="cx-dots" />
          <Topo voltar={() => setTela("home")} />
          <div className="cx-wrap">
            <h1 className="cx-h1" style={{ fontSize: 27 }}>Atendimento (árvore de decisão)</h1>
            <p className="cx-p">
              O tipo de questão que vale <b>20% da prova</b> e quase ninguém treina: um atendimento
              em forma de conversa, com seis decisões encadeadas. Aqui não existe certo e errado —
              cada resposta vale mais ou menos, como no exame oficial.
            </p>
            <div style={{ marginTop: 18 }}>
              {ARVORES.map((x) => (
                <button key={x.id} className="cx-mod" style={{ marginBottom: 11 }}
                  onClick={() => { setArv({ id: x.id, passo: 0, escolhas: [], ordens: ordensDaArvore(x) }); }}>
                  <span className="faixa" style={{ background: "var(--roxo)" }} />
                  <div className="cab">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cx-eye" style={{ color: "var(--roxo)" }}>{x.prompts.length} decisões</div>
                      <div className="cx-mtt" style={{ marginTop: 2 }}>{x.titulo}</div>
                      <div className="cx-mst">{x.tema}</div>
                    </div>
                    <span style={{ fontSize: 20, color: "var(--mut)" }}>›</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const fim = arv.passo >= a.prompts.length;
    const pontos = arv.escolhas.reduce((s, esc, i) => s + a.prompts[i].alts[esc].grau, 0);
    const maxPontos = a.prompts.length * 3;
    const pct = Math.round((pontos / maxPontos) * 100);

    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => setArv(null)} cAtiva="var(--roxo)" />
        <div className="cx-wrap">
          <div className="cx-eye" style={{ marginTop: 18, color: "var(--roxo)" }}>Atendimento · {a.titulo}</div>
          <div className="cx-passos">
            {a.prompts.map((_, i) => <i key={i} className={i < arv.passo ? "f" : ""} />)}
          </div>
          <div className="cx-ctx" style={{ marginTop: 10 }}>{a.contexto}</div>

          <div className="cx-chat">
            {a.prompts.slice(0, arv.passo + (fim ? 0 : 1)).map((p, i) => (
              <div key={i} style={{ display: "contents" }}>
                <div className="cx-bolha cli">
                  <div className="quem">{a.cliente}</div>
                  {p.fala}
                </div>
                {arv.escolhas[i] !== undefined && (
                  <div style={{ display: "contents" }}>
                    <div className="cx-bolha eu">
                      <div className="quem">Você</div>
                      {p.alts[arv.escolhas[i]].t}
                    </div>
                    <div className={"cx-nota g" + p.alts[arv.escolhas[i]].grau}>
                      <span className="selo">{GRAUS[p.alts[arv.escolhas[i]].grau]}</span>
                      {p.alts[arv.escolhas[i]].nota}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!fim && arv.escolhas[arv.passo] === undefined && (
            <div style={{ marginTop: 16 }}>
              <div className="cx-lb">Selecione a alternativa que melhor concilia a informação correta a um atendimento adequado</div>
              {ordemDoPasso(a, arv, arv.passo).map((orig, i) => {
                const alt = a.prompts[arv.passo].alts[orig];
                return (
                  <button key={orig} className="cx-esc" onClick={() => {
                    // grava o índice ORIGINAL: o comentário e o grau seguem colados
                    const ne = [...arv.escolhas]; ne[arv.passo] = orig;
                    setArv({ ...arv, escolhas: ne });
                    if (alt.grau === 3) Som.acerto(); else if (alt.grau === 0) Som.erro();
                  }}>{alt.t}</button>
                );
              })}
            </div>
          )}

          {!fim && arv.escolhas[arv.passo] !== undefined && (
            <button className="cx-btn" style={{ marginTop: 14, background: "var(--roxo)", boxShadow: "none" }}
              onClick={() => setArv({ ...arv, passo: arv.passo + 1 })}>
              {arv.passo + 1 < a.prompts.length ? "Continuar o atendimento →" : "Ver o resultado"}
            </button>
          )}

          {fim && (
            <div style={{ textAlign: "center", marginTop: 22 }}>
              <div className="cx-medal" style={{ borderColor: "var(--roxo)", color: "var(--roxo)", background: "var(--roxo-l)" }}>
                {pct >= 85 ? "🌟" : pct >= 70 ? "👍" : "📎"}
              </div>
              <div className="cx-score" style={{ color: "var(--roxo)" }}>{pct}%</div>
              <div style={{ color: "var(--mut)", fontSize: 13.5, fontWeight: 700, marginTop: 5 }}>
                {pontos} de {maxPontos} pontos de qualidade no atendimento
              </div>
              <p className="cx-p" style={{ margin: "16px auto 20px" }}>
                {pct >= 85 ? "Conduta de quem entende o cliente antes de oferecer. É esse o padrão que a prova premia."
                  : pct >= 70 ? "Bom atendimento, com espaço nas respostas que pularam o diagnóstico."
                  : "Reveja as notas em vermelho: elas costumam ser as condutas que a banca considera falha."}
              </p>
              <div style={{ display: "grid", gap: 9 }}>
                <button className="cx-btn" style={{ background: "var(--roxo)", boxShadow: "none" }}
                  onClick={() => setArv({ id: a.id, passo: 0, escolhas: [], ordens: ordensDaArvore(a) })}>Refazer este atendimento</button>
                <button className="cx-btn sec" onClick={() => setArv(null)}>Escolher outro</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- CANTIGAS ----------------
  if (tela === "musicas") {
    const tocarMusica = (m) => {
      if (tocandoMus === m.id) { Som.pararMusica(); setTocandoMus(null); setLinhaMus(-1); return; }
      Som.pararMusica();
      setLinhaMus(-1);
      const foi = Som.cantar(m, (i) => setLinhaMus(i), () => { setTocandoMus(null); setLinhaMus(-1); });
      setTocandoMus(foi ? m.id : null);
    };
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => { Som.pararMusica(); setTocandoMus(null); setLinhaMus(-1); setTela("home"); }} />
        <div className="cx-wrap">
          <h1 className="cx-h1" style={{ fontSize: 27 }}>Cantigas da prova</h1>
          <p className="cx-p">
            {MUSICAS.length} melodias curtas para os números que mais escapam. Toque no play, acompanhe
            a linha que acende e <b>cante junto</b> — é cantando que gruda. Melodias originais, feitas
            para caber em qualquer voz.
          </p>
          <div style={{ marginTop: 18 }}>
            {MUSICAS.map((m) => {
              const on = tocandoMus === m.id;
              return (
                <div key={m.id} className={"cx-mus" + (on ? " on" : "")}>
                  <div className="cx-mus-h">
                    <button className={"cx-play" + (on ? " stop" : "")} onClick={() => tocarMusica(m)}
                      aria-label={on ? "Parar" : "Tocar " + m.titulo}>{on ? "■" : "▶"}</button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="tt">{m.titulo}</div>
                      <div className="sub">{m.tema} · {m.linhas.length} versos</div>
                    </div>
                  </div>
                  <div className="cx-letra">
                    {m.linhas.map((li, i) => (
                      <div key={i} className={"cx-verso" + (on && linhaMus === i ? " ativa" : "")}>{li.l}</div>
                    ))}
                  </div>
                  <div className="dica">💡 {m.dica}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- CONFRONTOS ----------------
  if (tela === "confrontos") {
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => setTela("home")} />
        <div className="cx-wrap">
          <h1 className="cx-h1" style={{ fontSize: 27 }}>Fichas de confronto</h1>
          <p className="cx-p">
            {CONFRONTOS.length} pares que a prova adora comparar, lado a lado na linha exata em que
            se separam. Toque para abrir e leia sempre a armadilha no fim.
          </p>
          <div style={{ marginTop: 16 }}>
            {CONFRONTOS.map((c) => {
              const on = !!confAberto[c.id];
              return (
                <div key={c.id} className="cx-conf" style={on ? { borderColor: "var(--azul)" } : {}}>
                  <div className="cx-conf-h" onClick={() => setConfAberto((a) => ({ ...a, [c.id]: !a[c.id] }))}>
                    <span className="tt" style={{ flex: 1 }}>{c.titulo}</span>
                    <span className="cx-mono" style={{ fontSize: 11, color: "var(--mut)" }}>{c.onde}</span>
                    <span style={{ color: "var(--mut)", fontSize: 15 }}>{on ? "▾" : "▸"}</span>
                  </div>
                  {on && (
                    <div className="cx-conf-b">
                      <table className="cx-ctab">
                        <thead><tr><th></th>{c.colunas.map((col) => <th key={col}>{col}</th>)}</tr></thead>
                        <tbody>
                          {c.linhas.map((l) => (
                            <tr key={l.c}><td>{l.c}</td>{l.v.map((v, i) => <td key={i}>{v}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="arm">
                        <div className="h">⚠ Como a banca derruba você aqui</div>
                        <p>{c.armadilha}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- TABELÃO ----------------
  if (tela === "tabelao") {
    const totalItens = TABELAO.reduce((a, t) => a + t.itens.length, 0);
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => setTela("home")} />
        <div className="cx-wrap">
          <h1 className="cx-h1" style={{ fontSize: 27 }}>Tabelão da prova</h1>
          <p className="cx-p">
            Os {totalItens} números que a prova cobra de cor, agrupados por tema. Esta é a folha da
            última semana: leia inteira uma vez por dia nos três dias antes do exame.
          </p>
          <div style={{ marginTop: 16 }}>
            {TABELAO.map((t) => (
              <div key={t.tema} className="cx-tema">
                <h5>{t.tema}</h5>
                {t.itens.map(([o, v]) => (
                  <div className="lin" key={o}><span>{o}</span><b>{v}</b></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- GLOSSÁRIO ----------------
  if (tela === "glossario") {
    const termos = Object.keys(VERBETES).sort((a, b) => a.localeCompare(b, "pt-BR"));
    const alvo = buscaGl.trim().toLowerCase();
    const lista = alvo
      ? termos.filter((t) => t.toLowerCase().includes(alvo) || VERBETES[t].toLowerCase().includes(alvo))
      : termos;
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => setTela("home")} />
        <div className="cx-wrap">
          <h1 className="cx-h1" style={{ fontSize: 27 }}>Glossário</h1>
          <p className="cx-p">
            {termos.length} termos do mercado explicados em português claro. No conteúdo das pílulas
            eles aparecem sublinhados: é só tocar para ver o significado sem sair da leitura.
          </p>
          <input className="cx-busca" value={buscaGl} onChange={(e) => setBuscaGl(e.target.value)}
            placeholder="buscar termo (ex.: benchmark, come-cotas, spread)" aria-label="Buscar no glossário" />
          {lista.length === 0 && (
            <div className="cx-pane" style={{ marginTop: 14 }}>
              <p style={{ color: "var(--ink2)" }}>Nada encontrado para "{buscaGl}".</p>
            </div>
          )}
          <div className="cx-glos">
            {lista.map((t) => (
              <div key={t} className="cx-gitem">
                <b>{t}</b>
                <p>{VERBETES[t]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- EXAME · abertura ----------------
  if (tela === "provaHome") {
    const R = REGRAS_EXAME;
    const linha = (rot, v, o, nota) => (
      <tr key={rot}>
        <td style={{ verticalAlign: "top" }}><b>{rot}</b><div style={{ color: "var(--mut)", fontSize: 12, fontWeight: 600, marginTop: 2 }}>{nota}</div></td>
        <td style={{ whiteSpace: "nowrap", verticalAlign: "top" }}>
          {v}<br /><span className={"cx-selo " + o}>{o === "oficial" ? "regra oficial" : o === "pedagogica" ? "escolha nossa" : "não reconfirmado"}</span>
        </td>
      </tr>
    );
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => setTela("home")} />
        <div className="cx-wrap">
          <h1 className="cx-h1" style={{ fontSize: 27 }}>Exame</h1>
          <p className="cx-p">
            Uma sessão completa, no formato da prova. Aqui <b>nada é corrigido antes do fim</b>:
            sem cor, sem som, sem contador de acertos, sem explicação. Você responde, revisa e entrega.
          </p>

          {prova && (
            <div className="cx-pane" style={{ marginTop: 16, borderColor: "var(--gold)" }}>
              <div className="cx-lb" style={{ color: "var(--gold)" }}>Tentativa em andamento</div>
              <p style={{ color: "var(--ink2)" }}>
                Iniciada em {new Date(prova.inicio).toLocaleString("pt-BR")} · restam {fmtRelogio(Math.max(0, Math.round((prova.fimEm - agora) / 1000)))}.
                O relógio não parou enquanto o app esteve fechado.
              </p>
              <button className="cx-btn" style={{ marginTop: 11, background: "var(--gold)", boxShadow: "none" }} onClick={() => setTela("prova")}>Continuar a prova</button>
            </div>
          )}

          <div className="cx-pane" style={{ marginTop: 16 }}>
            <div className="cx-lb">Estrutura reproduzida</div>
            <table className="cx-tbl"><tbody>
              {linha("Duração", "2h30", R.duracaoSeg.origem, R.duracaoSeg.nota)}
              {linha("Total de questões", R.totalItens.valor, R.totalItens.origem, R.totalItens.nota)}
              {linha("Múltipla escolha", R.multiplaEscolha.valor, R.multiplaEscolha.origem, R.multiplaEscolha.nota)}
              {linha("Quantas se marca", "uma", R.umaCorreta.origem, R.umaCorreta.nota)}
              {linha("Árvore de decisão", R.itensArvore.valor, R.itensArvore.origem, R.itensArvore.nota)}
              {linha("Aprovação", R.minimoAcertos.valor + " acertos", R.minimoAcertos.origem, R.minimoAcertos.nota)}
              {linha("Dificuldade", "25 / 50 / 25", R.dificuldade.origem, R.dificuldade.nota)}
              {linha("Quem classificou", "régua nossa", R.rotuloDificuldade.origem, R.rotuloDificuldade.nota)}
              {linha("Questão anulada", "vira acerto", R.anulacao.origem, R.anulacao.nota)}
            </tbody></table>
            <p style={{ color: "var(--mut)", fontSize: 12, fontWeight: 600, marginTop: 10 }}>
              Fonte: {R.fonte} · conferido em {new Date(R.verificadoEm + "T12:00:00").toLocaleDateString("pt-BR")}.
            </p>
          </div>

          <div className="cx-pane" style={{ marginTop: 12 }}>
            <div className="cx-lb">De onde saem as questões</div>
            <p style={{ color: "var(--ink2)" }}>
              O sorteio usa <b>{ELEGIVEIS_EXAME.length}</b> das {TODAS_CHAVES.length} questões do banco.
              {FORA_DO_EXAME.length > 0 ? <> As outras <b>{FORA_DO_EXAME.length}</b> estão fora do exame
              porque o conteúdo delas não tem lastro nas fontes declaradas — continuam no modo de estudo,
              com o motivo escrito na tela. Avaliação não cobra o que não dá para justificar.</> : null}
            </p>
          </div>

          <div className="cx-pane" style={{ marginTop: 12 }}>
            <div className="cx-lb">O que é adaptação nossa</div>
            <p style={{ color: "var(--ink2)" }}>
              As questões são <b>autorais</b>, escritas no formato da banca — não são questões da ANBIMA.
              Nos {R.itensArvore.valor} itens de árvore, a banca gradua as respostas em quatro níveis e não
              publica como converte isso em nota; aqui, <b>só a “Melhor escolha” conta ponto</b> na nota do
              exame. A qualidade graduada do atendimento aparece à parte, como recurso de estudo.
            </p>
          </div>

          {!prova && (
            <button className="cx-btn" style={{ marginTop: 16 }} onClick={iniciarProva}>
              Começar o exame · {TOTAL_ITENS_PROVA} itens
            </button>
          )}

          {historico.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <div className="cx-lb">Tentativas encerradas</div>
              <p style={{ color: "var(--mut)", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                As provas encerradas sobem para a nuvem e aparecem em todos os seus aparelhos,
                com a revisão item a item. Apagar aqui apaga em todos.
              </p>
              {historico.map((h) => {
                const r = h.resultado || corrigir(h);
                return (
                  <div key={h.id} className="cx-mod" style={{ marginBottom: 9, cursor: "default" }}>
                    <span className="faixa" style={{ background: r.aprovado ? "var(--ok)" : "var(--no)" }} />
                    <div className="cab">
                      <button className="cx-histbt" onClick={() => { setProvaVista(h); setTela("provaFim"); }}>
                        <div className="cx-eye" style={{ color: r.aprovado ? "var(--ok)" : "var(--no)" }}>{r.acertos}/{r.total} · {r.pct}%</div>
                        <div className="cx-mtt" style={{ marginTop: 2 }}>{new Date(h.id).toLocaleString("pt-BR")}</div>
                        <div className="cx-mst">
                          {h.motivoFim === "tempo" ? "encerrada pelo tempo" : "entregue por você"}
                          {r.pendentes ? ` · ${r.pendentes} em branco` : ""}
                          {h.aparelho ? ` · ${h.aparelho}` : ""} · gabarito {h.versaoGabarito || "?"}
                        </div>
                      </button>
                      <button className="cx-apagar" aria-label={`Apagar a prova de ${new Date(h.id).toLocaleString("pt-BR")}`}
                        onClick={() => setApagarId(h.id)}>🗑</button>
                    </div>
                  </div>
                );
              })}
              {apagarId && (
                <div className="cx-modal" role="dialog" aria-modal="true" aria-label="Apagar prova">
                  <div className="cx-modalcx">
                    <div className="cx-lb">Apagar esta prova?</div>
                    <p style={{ color: "var(--ink2)" }}>
                      A tentativa de <b>{new Date(apagarId).toLocaleString("pt-BR")}</b> sai da lista
                      <b> em todos os seus aparelhos</b> e não volta. O progresso de estudo não é afetado.
                    </p>
                    <div style={{ display: "grid", gap: 9, marginTop: 14 }}>
                      <button className="cx-btn" onClick={() => { const id = apagarId; setApagarId(null); apagarTentativa(id); }}>Sim, apagar</button>
                      <button className="cx-btn sec" onClick={() => setApagarId(null)}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- EXAME · sessão lacrada ----------------
  if (tela === "prova" && prova && !prova.entregue) {
    const it = prova.itens[prova.i];
    const total = prova.itens.length;
    const resta = Math.max(0, Math.round((prova.fimEm - agora) / 1000));
    const apertado = resta <= 5 * 60;
    const respondidos = prova.itens.filter((x) => (x.tipo === "arvore" ? x.escolha : x.resposta) !== null).length;
    const pendentes = total - respondidos;
    const arv = it.tipo === "arvore" ? ARVORES.find((x) => x.id === it.arvId) : null;
    const q = it.tipo === "mc" ? IDX_Q[it.chave] : null;
    const escolhido = it.tipo === "arvore" ? it.escolha : it.resposta;
    const letras = ["A", "B", "C", "D"];
    // as alternativas aparecem na ordem sorteada e guardada na tentativa
    const alts = it.tipo === "arvore"
      ? it.ordem.map((o) => ({ v: o, t: arv.prompts[it.passo].alts[o].t }))
      : it.ordem.map((o, k) => ({ v: k, t: q.alts[o] }));

    return (
      <div className="cx cx-lacrado"><style>{CSS}</style>
        <div className="cx-wrap" style={{ paddingTop: 14 }}>
          <div className="cx-provahd">
            <span className="cx-eye">Exame · item {prova.i + 1} de {total}</span>
            <span className={"cx-cron" + (apertado ? " d" : "")} role="timer" aria-live="off">⏳ {fmtRelogio(resta)}</span>
          </div>
          {/* progresso SEM cor de acerto: cheio = respondido, contorno = em branco */}
          <div className="cx-pgs" aria-hidden="true">
            {prova.itens.map((x, i) => {
              const feito = (x.tipo === "arvore" ? x.escolha : x.resposta) !== null;
              return <i key={i} className={i === prova.i ? "now" : feito ? "feito" : ""} />;
            })}
          </div>
          <div className="cx-provasub">
            {respondidos} respondidos · {pendentes} em branco
            <button className="cx-linkbt" onClick={() => setMapaAberto(true)}>ver o mapa</button>
          </div>

          {it.tipo === "arvore" ? (
            <div style={{ marginTop: 14 }}>
              <div className="cx-eye" style={{ color: "var(--roxo)" }}>Árvore de decisão · {arv.titulo}</div>
              <div className="cx-ctx" style={{ marginTop: 8 }}>{arv.contexto}</div>
              {/* as falas anteriores desta mesma conversa, sem comentário nenhum */}
              {arv.prompts.slice(0, it.passo + 1).map((p, i) => {
                const ant = prova.itens.find((x) => x.tipo === "arvore" && x.arvId === arv.id && x.passo === i);
                return (
                  <div key={i} style={{ display: "contents" }}>
                    <div className="cx-bolha cli"><div className="quem">{arv.cliente}</div>{p.fala}</div>
                    {i < it.passo && ant && ant.escolha !== null && (
                      <div className="cx-bolha eu"><div className="quem">Você</div>{p.alts[ant.escolha].t}</div>
                    )}
                  </div>
                );
              })}
              <div className="cx-lb" style={{ marginTop: 14 }}>Selecione a alternativa que melhor concilia a informação correta a um atendimento adequado</div>
            </div>
          ) : (
            <div>
              <div className="cx-eye" style={{ marginTop: 14, color: "var(--mut)" }}>Módulo {q.mId}</div>
              <p className="cx-q">{q.q}</p>
            </div>
          )}

          {alts.map((a, i) => (
            <button key={i} className={"cx-alt" + (escolhido === a.v ? " sel" : "")}
              aria-pressed={escolhido === a.v}
              onClick={() => responderProva(a.v)}>
              <span className="k">{letras[i]}</span><span className="t">{a.t}</span>
            </button>
          ))}

          <div className="cx-provanav">
            <button className="cx-btn sec" disabled={prova.i === 0} onClick={() => irPara(prova.i - 1)}>← Anterior</button>
            <button className={"cx-chip" + (it.marcada ? " on" : "")} onClick={marcarItem}>
              {it.marcada ? "🔖 Marcada" : "🔖 Marcar"}
            </button>
            {prova.i + 1 < total
              ? <button className="cx-btn" onClick={() => irPara(prova.i + 1)}>Próxima →</button>
              : <button className="cx-btn" onClick={() => setConfirmando(true)}>Entregar</button>}
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
            <button className="cx-linkbt" onClick={() => setConfirmando(true)}>Encerrar a prova agora</button>
            <span style={{ color: "var(--mut)" }}>·</span>
            {/* sem esta saída a tela virava beco: só dava para sair entregando */}
            <button className="cx-linkbt" style={{ color: "var(--mut)" }} onClick={() => setTela("home")}>
              Sair sem entregar (o relógio continua correndo)
            </button>
          </div>

          {mapaAberto && (
            <div className="cx-modal" role="dialog" aria-modal="true" aria-label="Mapa da prova">
              <div className="cx-modalcx">
                <div className="cx-lb">Mapa da prova</div>
                <p style={{ color: "var(--ink2)", fontSize: 13 }}>
                  Cheio = respondido · contorno = em branco · 🔖 = marcado para revisar.
                  Nenhum indica acerto ou erro.
                </p>
                <div className="cx-mapa">
                  {prova.itens.map((x, i) => {
                    const feito = (x.tipo === "arvore" ? x.escolha : x.resposta) !== null;
                    return (
                      <button key={i} className={"cx-mq" + (feito ? " f" : "") + (x.marcada ? " m" : "") + (i === prova.i ? " a" : "")}
                        aria-label={`Item ${i + 1}${feito ? ", respondido" : ", em branco"}${x.marcada ? ", marcado" : ""}`}
                        onClick={() => { irPara(i); setMapaAberto(false); }}>{i + 1}</button>
                    );
                  })}
                </div>
                <button className="cx-btn sec" style={{ marginTop: 14 }} onClick={() => setMapaAberto(false)}>Voltar à prova</button>
              </div>
            </div>
          )}

          {confirmando && (
            <div className="cx-modal" role="dialog" aria-modal="true" aria-label="Confirmar entrega">
              <div className="cx-modalcx">
                <div className="cx-lb">Encerrar a prova?</div>
                <p style={{ color: "var(--ink2)" }}>
                  {pendentes > 0
                    ? <>Você tem <b>{pendentes} {pendentes === 1 ? "item em branco" : "itens em branco"}</b>. Em branco conta zero e continua no total: a nota sai sobre os {total} itens.</>
                    : <>Todos os {total} itens estão respondidos.</>}
                  <br /><br />Depois de entregar, <b>as respostas desta tentativa não podem mais ser mudadas</b>.
                </p>
                <div style={{ display: "grid", gap: 9, marginTop: 14 }}>
                  <button className="cx-btn" onClick={() => encerrarProva("manual")}>Sim, entregar</button>
                  <button className="cx-btn sec" onClick={() => setConfirmando(false)}>Voltar à prova</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- EXAME · resultado e revisão ----------------
  if (tela === "provaFim" && provaVista) {
    const h = provaVista;
    const r = h.resultado || corrigir(h);
    const porMod = {};
    h.itens.forEach((it) => {
      if (it.anulado) return;
      const m = it.mId || (IDX_Q[it.chave] && IDX_Q[it.chave].mId) || (it.tipo === "arvore" ? "3" : "?");
      const acertou = it.tipo === "arvore" ? it.grauEscolhido === 3 : it.resposta === it.gabarito;
      porMod[m] = { r: (porMod[m]?.r || 0) + (acertou ? 1 : 0), t: (porMod[m]?.t || 0) + 1 };
    });
    const qualidade = (() => {
      const arv = h.itens.filter((it) => it.tipo === "arvore" && !it.anulado);
      if (!arv.length) return null;
      const p = arv.reduce((s, it) => s + (it.grauEscolhido || 0), 0);
      return { p, max: arv.length * 3, pct: Math.round((p / (arv.length * 3)) * 100) };
    })();
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => setTela("provaHome")} />
        <div className="cx-wrap">
          <div style={{ textAlign: "center", paddingTop: 14 }}>
            <div className="cx-medal" style={{ borderColor: r.aprovado ? "var(--ok)" : "var(--no)", color: r.aprovado ? "var(--ok)" : "var(--no)", background: r.aprovado ? "var(--verde-l)" : "#FEECEC" }}>
              {r.aprovado ? "🏆" : "💪"}
            </div>
            <div className="cx-eye">Exame de {new Date(h.id).toLocaleDateString("pt-BR")}</div>
            <div className="cx-score" style={{ color: r.aprovado ? "var(--ok)" : "var(--no)" }}>{r.pct}%</div>
            <div style={{ color: "var(--mut)", fontSize: 13.5, fontWeight: 700, marginTop: 5 }}>
              {r.acertos} de {r.total} itens · aprovação a partir de {r.corteAcertos} acertos
            </div>
            {r.pendentes > 0 && (
              <div style={{ color: "var(--no)", fontSize: 13, fontWeight: 700, marginTop: 6 }}>
                {r.pendentes} {r.pendentes === 1 ? "item ficou" : "itens ficaram"} em branco e {r.pendentes === 1 ? "contou" : "contaram"} zero — o denominador continuou sendo {r.total}.
              </div>
            )}
            {h.motivoFim === "tempo" && (
              <div style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700, marginTop: 6 }}>Encerrada automaticamente ao fim das 2h30.</div>
            )}
          </div>

          <div className="cx-pane" style={{ marginTop: 20 }}>
            <div className="cx-lb">Como esta nota foi calculada</div>
            <table className="cx-tbl"><tbody>
              <tr><td>Itens da prova</td><td>{r.total}</td></tr>
              <tr><td>Respondidos</td><td>{r.respondidos}</td></tr>
              <tr><td>Em branco (valem zero, seguem no total)</td><td>{r.pendentes}</td></tr>
              <tr><td>Anulados (creditados a você, seguem no total)</td><td>{r.creditados}</td></tr>
              <tr><td>Acertos</td><td>{r.acertos}</td></tr>
              <tr><td><b>Aprovação a partir de</b></td><td><b>{r.corteAcertos} acertos</b></td></tr>
              <tr><td><b>Resultado</b></td><td><b>{r.acertos} de {r.total} = {r.pct}%</b></td></tr>
            </tbody></table>
            {r.anulados.length > 0 && (
              <p style={{ color: "var(--ink2)", fontSize: 13, marginTop: 9 }}>
                Anulados e creditados: {r.anulados.map((a) => `${a.chave} (${a.motivo})`).join(" · ")}.
                Como no exame oficial, a questão anulada é atribuída a todo mundo e continua contando no total.
              </p>
            )}
            <p style={{ color: "var(--mut)", fontSize: 12, fontWeight: 600, marginTop: 9 }}>
              Corrigida com o gabarito da versão <b>{h.versaoGabarito || "?"}</b>. Correções feitas no banco depois
              desta data não mexem nesta nota. O corte é de <b>{r.corteAcertos} acertos</b> — o edital fixa um número,
              não um percentual ({r.corteOrigem === "oficial" ? "regra oficial, conferida no edital" : "não reconfirmado"}).
            </p>
          </div>

          <div className="cx-pane" style={{ marginTop: 12 }}>
            <div className="cx-lb">Por módulo</div>
            <table className="cx-tbl"><tbody>
              {Object.keys(porMod).sort().map((m) => {
                const d = porMod[m], p = Math.round((d.r / d.t) * 100);
                return <tr key={m}><td><b style={{ color: cor(m) }}>M{m}</b></td><td style={{ color: p >= 70 ? "var(--ok)" : "var(--no)" }}>{d.r}/{d.t} · {p}%</td></tr>;
              })}
            </tbody></table>
          </div>

          {qualidade && (
            <div className="cx-pane" style={{ marginTop: 12, borderColor: "var(--roxo)" }}>
              <div className="cx-lb" style={{ color: "var(--roxo)" }}>Qualidade do atendimento · recurso de estudo</div>
              <p style={{ color: "var(--ink2)" }}>
                {qualidade.p} de {qualidade.max} pontos ({qualidade.pct}%) somando os quatro níveis das respostas de árvore.
                <b> Isto não entra na nota acima</b> e não é a regra da banca: é a nossa leitura pedagógica, para mostrar
                que uma resposta “razoável” não é o mesmo que uma resposta errada.
              </p>
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <div className="cx-lb">Revisão item a item</div>
            <p style={{ color: "var(--mut)", fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>
              Somente leitura. Uma tentativa encerrada não muda mais.
            </p>
            {h.itens.map((it, i) => {
              const arv = it.tipo === "arvore" ? ARVORES.find((x) => x.id === it.arvId) : null;
              const q = it.tipo === "mc" ? IDX_Q[it.chave] : null;
              const dado = it.tipo === "arvore" ? it.escolha : it.resposta;
              const acertou = it.tipo === "arvore" ? it.grauEscolhido === 3 : it.resposta === it.gabarito;
              const branco = dado === null || dado === undefined;
              return (
                <div key={i} className={"cx-rev " + (branco ? "br" : acertou ? "ok" : "no")}>
                  <div className="cx-revh">
                    <b>{i + 1}</b>
                    <span>{branco ? "Em branco" : acertou ? "Acertou" : "Errou"}</span>
                    <span style={{ marginLeft: "auto", color: "var(--mut)", fontSize: 11.5 }}>
                      {/* rótulo com rede: tentativas gravadas antes da correção
                          do empacotamento não têm mId/nId, e mostravam
                          "Mundefined · undefined". Aqui o banco preenche. */}
                      {it.tipo === "arvore" ? `Árvore ${it.arvId}`
                        : `M${it.mId || (q && q.mId) || "?"} · ${it.nId || (q && q.nId) || it.chave}`}
                    </span>
                  </div>
                  {it.tipo === "arvore" ? (
                    <div>
                      <p className="cx-revq">{arv.prompts[it.passo].fala}</p>
                      {!branco && (
                        <p className="cx-reva">Sua resposta: “{arv.prompts[it.passo].alts[dado].t}” — <i>{GRAUS[it.grauEscolhido]}</i>. {arv.prompts[it.passo].alts[dado].nota}</p>
                      )}
                      <p className="cx-revg">Melhor escolha: “{arv.prompts[it.passo].alts.find((a) => a.grau === 3).t}” — {arv.prompts[it.passo].alts.find((a) => a.grau === 3).nota}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="cx-revq">{q.q}</p>
                      {!branco && <p className="cx-reva">Sua resposta: {q.alts[it.ordem[dado]]}</p>}
                      <p className="cx-revg">Gabarito: {q.alts[q.c]}</p>
                      <p className="cx-revx">{q.exp}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button className="cx-btn sec" style={{ marginTop: 18 }} onClick={() => setTela("provaHome")}>Voltar</button>
        </div>
      </div>
    );
  }

  // ---------------- QUIZ ----------------
  if (tela === "quiz" && sessao && qAtual) {
    const q = qAtual, acertou = escolha === q.c, letras = ["A", "B", "C", "D"];
    const total = sessao.itens.length, pctT = (tick / TEMPO_QUESTAO) * 100;
    const cAtiva = cor(q.mId);
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => setTela(sessao.tipo === "nivel" || sessao.tipo === "boss" ? "bloco" : "home")} cAtiva={cAtiva} />
        <div className="cx-wrap">
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <span className="cx-eye" style={{ color: cAtiva }}>
              {sessao.resgate && sessao.i === total - 1 ? "🔥 Questão de redenção" : sessao.titulo}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--mut)", fontWeight: 700 }}>
              {sessao.i + 1}/{total} · {sessao.acertos} ✓ · ⏱ {fmtTime(relogio)}
            </span>
          </div>
          <div className="cx-pgs">
            {Array.from({ length: total }).map((_, i) => (
              <i key={i} className={i < sessao.marcas.length ? (sessao.marcas[i] ? "ok" : "no") : i === sessao.i ? "now" : ""} />
            ))}
          </div>
          {pressao && !respondida && (
            <div className={"cx-timer" + (pctT < 25 ? " d" : pctT < 55 ? " w" : "")}><i style={{ width: pctT + "%" }} /></div>
          )}
          {(sessao.tipo === "simulado" || sessao.tipo === "revisao") && (
            <div className="cx-eye" style={{ marginTop: 8, color: cAtiva }}>Módulo {q.mId} · {q.origem}</div>
          )}
          <p className="cx-q">{q.q}</p>
          {q.alts.map((a, i) => {
            let cls = "cx-alt";
            if (respondida) cls += i === q.c ? " ok" : i === escolha ? " no" : " off";
            return (
              <button key={i} className={cls} disabled={respondida} onClick={() => responder(i)}>
                <span className="k">{letras[i]}</span><span className="t">{a}</span>
              </button>
            );
          })}
          {respondida && (
            <div className={"cx-fb " + (acertou ? "ok" : "no")}>
              <div className="cx-lb" style={{ color: acertou ? "var(--ok)" : "var(--no)", marginBottom: 7 }}>
                {acertou ? (delta === 20 ? "Acertou · combo em dobro" : "Acertou") : escolha === -1 ? "Tempo esgotado" : "Errou · combo zerado"}
              </div>
              <p>{q.exp}</p>
              {q.foraDoExame && (
                <p className="cx-fora">⚠ {q.motivoFora}</p>
              )}
              <button className="cx-btn" style={{ marginTop: 13, background: cAtiva, boxShadow: "none" }} onClick={avancar}>
                {sessao.i + 1 < total ? "Próxima →" : sessao.tipo === "nivel" && sessao.erros.length && !sessao.resgate ? "Encarar a redenção →" : "Ver resultado"}
              </button>
              {desfazer && (
                <button className="cx-chip" style={{ marginTop: 9, width: "100%", justifyContent: "center" }}
                  onClick={anularResposta}>↩ Toquei sem querer · anular esta resposta</button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- RESULTADO ----------------
  if (tela === "resultado" && sessao) {
    const total = sessao.marcas.length;
    const pct = total ? Math.round((sessao.acertos / total) * 100) : 0;
    const passou = pct >= 70;
    const nAtual = sessao.nId ? IDX_NIVEL[sessao.nId] : null;
    const irmaos = nAtual ? IDX_BLOCO[nAtual.bId].niveis : [];
    const pos = nAtual ? irmaos.findIndex((x) => x.id === nAtual.id) : -1;
    const prox = pos >= 0 && pos + 1 < irmaos.length ? irmaos[pos + 1] : null;
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo />
        <div className="cx-wrap" style={{ textAlign: "center", paddingTop: 32 }}>
          <div className="cx-medal" style={{ borderColor: passou ? "var(--ok)" : "var(--no)", color: passou ? "var(--ok)" : "var(--no)", background: passou ? "var(--verde-l)" : "#FEECEC" }}>
            {passou ? "🏆" : "💪"}
          </div>
          <div className="cx-eye">{sessao.titulo}</div>
          <div className="cx-score" style={{ color: passou ? "var(--ok)" : "var(--no)" }}>{pct}%</div>
          <div style={{ color: "var(--mut)", fontSize: 13.5, fontWeight: 700, marginTop: 5 }}>
            {sessao.acertos} de {total} · tempo {fmtTime(relogio)} · corte em 70%
          </div>
          {sessao.tipo === "simulado" && (
            <div className="cx-pane" style={{ marginTop: 20, textAlign: "left" }}>
              <div className="cx-lb">Desempenho por módulo</div>
              <table className="cx-tbl"><tbody>
                {MODULOS.map((m) => {
                  const d = sessao.porMod[m.id];
                  if (!d) return null;
                  const p = Math.round((d.r / d.t) * 100);
                  return (
                    <tr key={m.id}>
                      <td><b style={{ color: cor(m.id) }}>M{m.id}</b> {m.nome}</td>
                      <td style={{ color: p >= 70 ? "var(--ok)" : "var(--no)" }}>{d.r}/{d.t} · {p}%</td>
                    </tr>
                  );
                })}
              </tbody></table>
            </div>
          )}
          <p className="cx-p" style={{ margin: "16px auto 22px" }}>
            {sessao.tipo === "simulado"
              ? passou ? "Ritmo de aprovado. Repita em outro dia para confirmar." : "Abaixo do corte. Use a revisão de erros e volte ao módulo mais fraco."
              : sessao.tipo === "revisao" ? `Os acertos saíram da fila. Restam ${errados.length} questões para revisar.`
              : passou ? "Dominado. Próximo." : "Vale reler o conteúdo e a ficha antes de seguir."}
          </p>
          <div style={{ display: "grid", gap: 9 }}>
            {prox && <button className="cx-btn" style={{ background: cor(mId), boxShadow: "none" }} onClick={() => { setNId(prox.id); setTela("pilula"); }}>Próxima pílula · {prox.id}</button>}
            {sessao.tipo === "boss" && !passou && <button className="cx-btn" onClick={() => jogarChefao(sessao.bId)}>Encarar o chefão de novo</button>}
            {sessao.tipo === "simulado" && <button className="cx-btn" onClick={() => jogarSimulado(60)}>Novo simulado</button>}
            {sessao.erros.length > 0 && <button className="cx-btn sec" onClick={jogarRevisao}>Revisar os {sessao.erros.length} erros agora</button>}
            <button className="cx-btn sec" onClick={() => setTela(sessao.tipo === "nivel" || sessao.tipo === "boss" ? "bloco" : "home")}>Voltar</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- FICHAS ----------------
  if (tela === "fichas") {
    const lista = filtroFicha === "fracos"
      ? fracos.map((id) => IDX_NIVEL[id])
      : TODOS_NIVEIS.filter((n) =>
          filtroFicha === "todas" ? true : filtroFicha === "favs" ? favs.includes(n.id) : filtroFicha === "rev" ? revDevidas.includes(n.id) : n.mId === filtroFicha
        );
    // na revisão e no maço de fracos, o conteúdo fica coberto até você tentar lembrar
    const modoRecall = filtroFicha === "rev" || filtroFicha === "fracos";
    return (
      <div className="cx"><style>{CSS}</style><div className="cx-dots" />
        <Topo voltar={() => setTela("home")} />
        <div className="cx-wrap">
          <h1 className="cx-h1" style={{ fontSize: 27 }}>Fichas de memorização</h1>
          <p className="cx-p">
            Uma ficha por tópico, com o macete, a pegadinha da banca e uma situação real aplicada.
            Toque para abrir e use a ⭐ para montar seu próprio maço de revisão.
          </p>
          <div className="cx-bar">
            <button className={"cx-chip" + (filtroFicha === "todas" ? " on" : "")} onClick={() => setFiltroFicha("todas")}>Todas ({TOTAL_NIVEIS})</button>
            <button className={"cx-chip" + (filtroFicha === "favs" ? " on" : "")} onClick={() => setFiltroFicha("favs")}>⭐ Minhas ({favs.length})</button>
            <button className={"cx-chip" + (filtroFicha === "rev" ? " on" : "")} onClick={() => setFiltroFicha("rev")}>📅 Revisão ({revDevidas.length})</button>
            <button className={"cx-chip" + (filtroFicha === "fracos" ? " on" : "")} onClick={() => setFiltroFicha("fracos")}>🎯 Pontos fracos ({fracos.length})</button>
            {MODULOS.map((m) => (
              <button key={m.id} className={"cx-chip" + (filtroFicha === m.id ? " on" : "")}
                style={filtroFicha === m.id ? { background: cor(m.id), borderColor: cor(m.id) } : {}}
                onClick={() => setFiltroFicha(m.id)}>M{m.id}</button>
            ))}
          </div>
          {lista.length === 0 && (
            <div className="cx-pane" style={{ marginTop: 16 }}>
              <p style={{ color: "var(--ink2)" }}>
                {filtroFicha === "rev"
                  ? "Nenhuma ficha vence hoje. As favoritas voltam em intervalos crescentes: 1, 3, 7, 15 e 30 dias."
                  : filtroFicha === "fracos"
                  ? "Nenhum ponto fraco por enquanto: ou você ainda não respondeu questões suficientes, ou está acima de 70% em tudo que treinou."
                  : "Nenhuma ficha aqui ainda. Toque na ⭐ de uma ficha para guardá-la neste maço."}
              </p>
            </div>
          )}
          <div className="cx-deck">
            {lista.map((n) => {
              // no modo recuperação, a ficha só abre depois de você tentar lembrar
              const liberada = !modoRecall || revelado[n.id];
              const on = !!aberta[n.id] && liberada, ex = exemploDoNivel(n), fav = favs.includes(n.id);
              const prec = precisao(`${n.bId}/${n.id}`);
              return (
                <div key={n.id} className="cx-ficha" style={on ? { borderColor: cor(n.mId) } : {}}>
                  <div className="cx-fh" onClick={() => { if (liberada) setAberta((a) => ({ ...a, [n.id]: !a[n.id] })); }}>
                    <span className="id" style={{ color: cor(n.mId) }}>{n.id}</span>
                    <span className="tt">{n.titulo}</span>
                    {filtroFicha === "fracos" && prec !== null && (
                      <span style={{ fontSize: 11.5, fontWeight: 900, color: "var(--no)", whiteSpace: "nowrap" }}>{prec}%</span>
                    )}
                    <button className={"cx-star" + (fav ? " on" : "")} onClick={(e) => { e.stopPropagation(); toggleFav(n.id); }}
                      aria-label={fav ? "Remover do meu maço" : "Guardar no meu maço"}>{fav ? "⭐" : "☆"}</button>
                    <span style={{ color: "var(--mut)", fontSize: 15, marginLeft: 4 }}>{liberada ? (on ? "▾" : "▸") : "🔒"}</span>
                  </div>
                  {modoRecall && !liberada && (
                    <div className="cx-recall">
                      <div className="pergunta">
                        Antes de abrir: qual é o macete deste tópico e onde a banca costuma te pegar?
                      </div>
                      <button className="cx-chip" onClick={() => { setRevelado((r) => ({ ...r, [n.id]: true })); setAberta((a) => ({ ...a, [n.id]: true })); }}>
                        👁 Tentei — revelar a ficha
                      </button>
                      <div className="dica">Puxar da memória fixa muito mais que reler.</div>
                    </div>
                  )}
                  {filtroFicha === "rev" && liberada && (
                    <div style={{ display: "flex", gap: 8, padding: "0 15px 13px" }}>
                      <button className="cx-chip" style={{ borderColor: "var(--ok)", color: "var(--ok)" }} onClick={() => marcarRev(n.id, true)}>✓ Lembrei</button>
                      <button className="cx-chip" style={{ borderColor: "var(--no)", color: "var(--no)" }} onClick={() => marcarRev(n.id, false)}>✗ Esqueci · volta amanhã</button>
                    </div>
                  )}
                  {on && (
                    <div className="cx-fb2">
                      <div className="cx-box mac">
                        <div className="h">🔑 Macete</div>
                        <p>{n.macete}</p>
                      </div>
                      <div className="cx-box peg">
                        <div className="h">⚠ Pegadinha da banca</div>
                        <p>{n.pegadinha}</p>
                      </div>
                      {ex && (
                        <div className="cx-box ex">
                          <div className="h">💡 Na prática</div>
                          <p className="cx-ex-q">{ex.caso}</p>
                          <p className="cx-ex-r">{ex.resolve}</p>
                        </div>
                      )}
                      <button className="cx-btn sec" onClick={() => { setMId(n.mId); setBId(n.bId); setNId(n.id); setTela("pilula"); }}>
                        Abrir o conteúdo de {n.id}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
