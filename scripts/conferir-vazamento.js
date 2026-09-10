#!/usr/bin/env node
/**
 * conferir-vazamento.js — detector de vazamento de resposta, versão 2.
 *
 * Uso: node scripts/conferir-vazamento.js [--listar N] [--ref 1.4|BOSS|3]
 *
 * ------------------------------------------------------------------
 * POR QUE ESTE ARQUIVO EXISTE
 * ------------------------------------------------------------------
 * O verificar.js já tinha um detector de vazamento. Ele mede a MÉDIA do
 * banco: em quantos % dos casos o gabarito é a alternativa que mais repete
 * palavras do enunciado. Nas 872 questões ele deu 9% contra 34% do caderno
 * oficial, e concluiu "dentro da régua".
 *
 * O Paulo abriu a questão 1.4|BOSS|3 e viu em dois minutos o que a auditoria
 * de 872 questões não viu: o enunciado dizia "um mecanismo mantido pela bolsa
 * que RESSARCE, em até R$ 200 MIL, o cliente PREJUDICADO" e o gabarito era
 * "o Mecanismo de RESSARCIMENTO de PREJUÍZOS, que cobre até R$ 200 MIL".
 *
 * O v1 não pegou por três motivos concretos:
 *
 *   1. O regex de tokens era /[a-z]{4,}/g. Não casa dígito nenhum. "200"
 *      simplesmente não existia para o detector. E "mil" tem 3 letras, então
 *      caía no corte de tamanho. O número mais entregador da questão inteira
 *      era invisível.
 *   2. Não havia radical. "ressarce" e "Ressarcimento" eram duas palavras
 *      diferentes; "prejudicado" e "Prejuízos" também.
 *   3. Ele só olhava a MÉDIA. Uma questão podre no meio de 872 boas não move
 *      a média o suficiente para reprovar nada. Média é bom para detectar
 *      viés sistemático e péssima para achar a questão individual quebrada.
 *
 * O v2 corrige os três: conta número de qualquer tamanho, casa por radical, e
 * julga QUESTÃO POR QUESTÃO em vez de só reportar a média do banco.
 *
 * ------------------------------------------------------------------
 * AS TRÊS REGRAS
 * ------------------------------------------------------------------
 * R1 · TERMO DISTINTIVO — a regra principal.
 *      Um radical que aparece no enunciado E no gabarito E em NENHUM
 *      distrator. Isso é o que o aluno usa para acertar sem saber a matéria:
 *      ele procura no enunciado uma palavra rara e marca a alternativa que a
 *      repete. Quando o mesmo radical aparece também nos distratores, ele não
 *      distingue nada e não é vazamento.
 *
 * R2 · NÚMERO DISTINTIVO — o caso agravado de R1.
 *      Um valor ("200", "20", "180") no enunciado e no gabarito e em nenhum
 *      distrator. É pior que a palavra porque número é literal: não exige nem
 *      ler a frase, só bater o algarismo. Peso 2.
 *
 * R3 · SOBREPOSIÇÃO RELATIVA — a régua do v1, agora com números e radicais.
 *      Fração das palavras do gabarito que vieram do enunciado, menos a média
 *      dos distratores. Pega o caso difuso, em que nenhum termo é exclusivo
 *      mas o gabarito inteiro é uma paráfrase do enunciado.
 *
 * ------------------------------------------------------------------
 * DE ONDE VEM O CORTE
 * ------------------------------------------------------------------
 * De lugar nenhum que eu tenha inventado. O script parseia as 41 questões do
 * caderno oficial da ANBIMA (referencia/anbima-caderno-questoes-cpa.txt),
 * roda EXATAMENTE as mesmas três regras nelas, e usa a distribuição delas
 * como linha de base. O corte é o percentil 90 do oficial: se a banca tolera,
 * nós toleramos. O que reprova é o que está acima do que a própria ANBIMA faz.
 *
 * Isso importa porque repetição nenhuma é zero: toda questão bem escrita
 * repete algum termo do enunciado no gabarito. Sem medir o oficial primeiro,
 * qualquer corte seria chute.
 */
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const args = process.argv.slice(2);
const argVal = (nome) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : null; };

// =====================================================================
// NORMALIZAÇÃO E RADICAL
// =====================================================================

// Palavras que aparecem em toda questão e não distinguem nada. Se "cliente"
// está no enunciado e no gabarito, isso não entrega resposta nenhuma — mas
// contaria como termo distintivo se o acaso a deixasse fora dos distratores.
const STOP = new Set((
  "a o as os um uma uns umas de do da dos das em no na nos nas por para com sem sobre entre ate ao aos " +
  "e ou que se nao ser sao foi era sera como qual quais quando onde mais menos muito pouco seu sua seus suas " +
  "ele ela eles elas isso isto aquele esse este essa esta pelo pela pelos pelas nem ja tambem apenas cada " +
  "todo toda todos todas outro outra outros outras mesmo mesma pode podem deve devem tem ter ha havia " +
  "apos antes depois durante enquanto porque pois assim entao ainda somente sempre nunca lhe lhes " +
  "dele dela deles delas cliente clientes profissional profissionais cpa pergunta perguntou perguntar " +
  "diz disse dizer explica explicou explicar explicando responde respondeu responder correta corretamente " +
  "adequada adequado situacao caso exemplo alternativa opcao qual seguinte abaixo acima " +
  "ano anos mes meses dia dias reais real valor forma modo maneira parte caso casos " +
  "sendo estar esta estao sobre seja sejam fazer feito faz outros"
).split(/\s+/));

const semAcento = (t) =>
  String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Radical de uma palavra. Prefixo de 5 letras para palavras de 6+; a palavra
 * inteira para as curtas.
 *
 * Por que prefixo e não um stemmer de verdade: os pares que precisamos casar
 * são derivações longas e irregulares. Um RSLP tira "-mento" e "-ado" e ainda
 * assim deixa "prejudic" ≠ "prejuiz". O prefixo de 5 casa "preju"="preju" e
 * "ressa"="ressa". O preço é falso positivo ocasional ("constituicao" e
 * "constante" viram "const").
 *
 * Esse preço é aceitável porque o falso positivo é SIMÉTRICO: infla o gabarito
 * e os distratores igualmente, e as três regras são comparativas. E porque a
 * mesma regra roda no caderno oficial — se ela fosse só ruído, o oficial
 * pontuaria tão alto quanto nós e o corte subiria junto.
 */
const radical = (w) => (w.length >= 6 ? w.slice(0, 5) : w);

/**
 * Extrai os termos de um texto: radicais de palavras e números.
 *
 * Números são o conserto mais importante do v2. O regex antigo era
 * /[a-z]{4,}/ — nenhum dígito passava. Aqui eles viram o token "#200", e
 * ficam marcados para poderem valer peso dobrado na R2.
 *
 * "mil", "milhoes", "bilhoes" viram sufixo do número anterior, para que
 * "200 mil" seja um token só e não case com um "200" solto de outro contexto.
 */
const termos = (t) => {
  const s = semAcento(t).replace(/\.(?=\d{3}\b)/g, "").replace(/,(?=\d)/g, ".");
  const brutos = s.match(/[a-z]{3,}|\d+(?:\.\d+)?/g) || [];
  const saida = new Set();
  for (let i = 0; i < brutos.length; i++) {
    const w = brutos[i];
    if (/^\d/.test(w)) {
      const prox = brutos[i + 1];
      const escala = prox === "mil" ? "k" : prox === "milhoes" || prox === "milhao" ? "M" :
        prox === "bilhoes" || prox === "bilhao" ? "B" : "";
      saida.add("#" + w + escala);
      if (escala) i++;
      continue;
    }
    if (w.length < 4 || STOP.has(w)) continue;
    saida.add(radical(w));
  }
  return saida;
};

// =====================================================================
// AS TRÊS REGRAS, APLICADAS A UMA QUESTÃO
// =====================================================================
/**
 * @param q {{ q:string, alts:string[], c:number }}
 * @returns diagnóstico com os três indicadores e a carga combinada.
 */
const avaliar = (q) => {
  const enun = termos(q.q);
  const porAlt = q.alts.map(termos);
  const gab = porAlt[q.c];
  const distr = porAlt.filter((_, i) => i !== q.c);

  // R1/R2: no enunciado, no gabarito, em nenhum distrator.
  const distintivos = [...gab].filter(
    (t) => enun.has(t) && !distr.some((d) => d.has(t)));
  const numeros = distintivos.filter((t) => t.startsWith("#"));
  const palavras = distintivos.filter((t) => !t.startsWith("#"));

  // R3: fração do texto da alternativa que veio do enunciado.
  const ov = porAlt.map((a) => (a.size ? [...a].filter((x) => enun.has(x)).length / a.size : 0));
  const mediaDistr = ov.filter((_, i) => i !== q.c).reduce((a, b) => a + b, 0) / Math.max(1, q.alts.length - 1);
  const delta = ov[q.c] - mediaDistr;

  // Carga: quanto a questão entrega. Número pesa 2 porque não exige nem ler.
  // O delta entra multiplicado por 4 para ficar na mesma ordem de grandeza da
  // contagem de termos (delta típico vai de 0 a ~0,4).
  const carga = palavras.length + 2 * numeros.length + Math.max(0, delta) * 4;

  return { distintivos, numeros, palavras, ov, delta, carga };
};

// =====================================================================
// LINHA DE BASE: AS 41 QUESTÕES DO CADERNO OFICIAL
// =====================================================================
/**
 * O caderno vem de um PDF convertido para texto, com quebras de linha no meio
 * das frases e o cabeçalho "Caderno de questões • CPA" + número de página
 * injetado a cada página. O formato de cada questão é:
 *
 *   Questão N.
 *   Formato de resposta: ... / Identificação PD: ... / Nível cognitivo: ... / Dificuldade: ...
 *   Contexto:   <parágrafo>
 *   Enunciado:  <frase>
 *   A) <texto>            ← as quatro alternativas, em ordem
 *   Gabarito: <texto>     ← aparece logo DEPOIS da alternativa correta
 *   B) ... C) ... D) ...
 *
 * A posição do "Gabarito:" é o que revela qual alternativa é a correta.
 */
const lerCadernoOficial = () => {
  const arq = path.join(raiz, "referencia", "anbima-caderno-questoes-cpa.txt");
  if (!fs.existsSync(arq)) return [];
  const bruto = fs.readFileSync(arq, "utf8")
    .replace(/^Caderno de questões • CPA\s*$/gm, "")
    .replace(/^\d+\s*$/gm, "");

  const partes = bruto.split(/^Questão \d+\.\s*$/m).slice(1);
  const saida = [];
  partes.forEach((p, idx) => {
    const dificuldade = (p.match(/Dificuldade:\s*(\w+)/) || [])[1] || "?";
    const iCtx = p.indexOf("Contexto:");
    const iEnu = p.indexOf("Enunciado:");
    if (iCtx < 0 || iEnu < 0) return;

    // o corpo das alternativas começa na primeira linha "X) "
    const resto = p.slice(iEnu);
    const mAlt = resto.match(/^[A-D]\)\s/m);
    if (!mAlt) return;
    const iAlt = resto.indexOf(mAlt[0]);
    const enunciado = (p.slice(iCtx + 9, iEnu) + " " + resto.slice(10, iAlt))
      .replace(/\s+/g, " ").trim();

    // fatia o bloco de alternativas nos rótulos A) B) C) D)
    const corpo = resto.slice(iAlt);
    const pedacos = corpo.split(/^([A-D])\)\s/m);
    const alts = {}; let gabLetra = null;
    for (let i = 1; i < pedacos.length; i += 2) {
      const letra = pedacos[i];
      let txt = pedacos[i + 1] || "";
      const iGab = txt.indexOf("Gabarito:");
      if (iGab >= 0) { gabLetra = letra; txt = txt.slice(0, iGab); }
      alts[letra] = txt.replace(/\s+/g, " ").trim();
    }
    const letras = ["A", "B", "C", "D"];
    if (!gabLetra || letras.some((l) => !alts[l])) return;
    saida.push({
      ref: "OFICIAL-" + (idx + 1),
      dificuldade,
      q: enunciado,
      alts: letras.map((l) => alts[l]),
      c: letras.indexOf(gabLetra),
    });
  });
  return saida;
};

// =====================================================================
// NOSSO BANCO
// =====================================================================
const lerNossoBanco = () => {
  const arq = path.join(raiz, "app", "projeto-cpa-completo.jsx");
  if (!fs.existsSync(arq)) { console.error("Rode 'node build.js' antes."); process.exit(1); }
  const s = fs.readFileSync(arq, "utf8");
  const i = s.indexOf("const MODULOS = [");
  const f = s.indexOf("\n];", i);
  const MODULOS = eval(s.slice(i + "const MODULOS = ".length, f + 2));
  const out = [];
  MODULOS.forEach((m) => (m.blocos || []).forEach((b) => {
    (b.niveis || []).forEach((n, ni) =>
      (n.questoes || []).forEach((q, qi) =>
        out.push({ ...q, ref: `${b.id}|${ni + 1}|${qi + 1}`, mId: m.id, bId: b.id })));
    (b.boss || []).forEach((q, qi) =>
      out.push({ ...q, ref: `${b.id}|BOSS|${qi + 1}`, mId: m.id, bId: b.id }));
  }));
  return out;
};

// As três funções ficam exportadas para que outros scripts meçam OUTROS
// bancos com exatamente a mesma régua — foi assim que o simulado da T2 pôde
// ser comparado ao nosso sem eu reescrever o detector e, sem querer, afrouxá-lo.
module.exports = { avaliar, termos, radical, lerCadernoOficial, lerNossoBanco };
if (require.main !== module) return;

// =====================================================================
// EXECUÇÃO
// =====================================================================
const pctil = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};

const oficial = lerCadernoOficial();
const nosso = lerNossoBanco();

console.log("\nVAZAMENTO DE RESPOSTA — detector v2");
console.log("  regras: R1 palavra distintiva · R2 número distintivo (peso 2) · R3 sobreposição relativa");

if (oficial.length < 30) {
  console.error(`  ERRO só consegui parsear ${oficial.length} questões do caderno oficial; sem linha de base não dá para julgar.`);
  process.exit(1);
}

const dOfi = oficial.map((q) => ({ q, d: avaliar(q) }));
const dNos = nosso.map((q) => ({ q, d: avaliar(q) }));

const resumo = (nome, lista) => {
  const cargas = lista.map((x) => x.d.carga);
  const med = cargas.reduce((a, b) => a + b, 0) / cargas.length;
  const comNum = lista.filter((x) => x.d.numeros.length).length;
  const p90 = pctil(cargas, 90);
  const max = Math.max(...cargas);
  console.log(`\n  ${nome} (${lista.length} questões)`);
  console.log(`    carga média ${med.toFixed(2)} · p90 ${p90.toFixed(2)} · máx ${max.toFixed(2)}`);
  console.log(`    com número distintivo: ${comNum} (${Math.round((comNum / lista.length) * 100)}%)`);
  console.log(`    palavras distintivas por questão: média ${(lista.reduce((a, x) => a + x.d.palavras.length, 0) / lista.length).toFixed(2)}`);
  return { med, p90, max };
};

const rOfi = resumo("CADERNO OFICIAL ANBIMA", dOfi);
const rNos = resumo("NOSSO BANCO", dNos);

// O corte é o p90 do oficial: 10% das questões da banca ficam acima dele.
// Tudo nosso que passa disso está entregando mais resposta do que a ANBIMA
// entrega nos seus próprios 10% piores.
const CORTE = Math.max(rOfi.p90, 3);
console.log(`\n  CORTE = ${CORTE.toFixed(2)} (p90 do caderno oficial, piso 3)`);

const graves = dNos.filter((x) => x.d.carga > CORTE).sort((a, b) => b.d.carga - a.d.carga);
const pctGraves = (graves.length / dNos.length) * 100;
const ofiAcima = dOfi.filter((x) => x.d.carga > CORTE).length;

console.log(`\n  ACIMA DO CORTE`);
console.log(`    oficial: ${ofiAcima} de ${dOfi.length} (${((ofiAcima / dOfi.length) * 100).toFixed(1)}%)`);
console.log(`    nosso:   ${graves.length} de ${dNos.length} (${pctGraves.toFixed(1)}%)`);

const alvo = argVal("--ref");
if (alvo) {
  const x = dNos.find((y) => y.q.ref === alvo);
  if (!x) { console.log(`\n  ref ${alvo} não encontrada.`); }
  else {
    console.log(`\n  DIAGNÓSTICO DE ${alvo} · carga ${x.d.carga.toFixed(2)}`);
    console.log(`    números distintivos:  ${x.d.numeros.join(", ") || "(nenhum)"}`);
    console.log(`    palavras distintivas: ${x.d.palavras.join(", ") || "(nenhuma)"}`);
    console.log(`    sobreposição gabarito ${x.d.ov[x.q.c].toFixed(3)} vs distratores ${(x.d.ov[x.q.c] - x.d.delta).toFixed(3)} (delta ${x.d.delta >= 0 ? "+" : ""}${x.d.delta.toFixed(3)})`);
  }
}

// ------------------------------------------------------------------
// SEPARAÇÃO ENTRE VAZAMENTO E CONTA
// ------------------------------------------------------------------
// Nem todo termo repetido é defeito. Numa questão de cálculo, o enunciado
// PRECISA dar os números e o gabarito PRECISA usá-los: "aplicou R$ 10.000 por
// 30 dias" → "R$ 200 e R$ 10.200, pois 30 dias...". Isso não entrega resposta
// nenhuma — quem não souber fazer a conta não escolhe certo, porque os
// distratores trazem os mesmos dados com resultados diferentes.
//
// O critério: se os termos distintivos são só números e a questão pede um
// resultado numérico, é conta, não vazamento. Marcamos como "conta" em vez de
// esconder do relatório, porque esconder é o que o v1 fazia sem querer.
const NUM_ESCRITO = /^\s*(R\$\s*[\d.,]+|[\d.,]+|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)\b/i;
const ehConta = (x) =>
  x.d.palavras.length <= 1 &&
  x.d.numeros.length > 0 &&
  NUM_ESCRITO.test(x.q.alts[x.q.c]);

const contas = graves.filter(ehConta);
const vazando = graves.filter((x) => !ehConta(x));
console.log(`    dos nossos: ${vazando.length} vazamento · ${contas.length} questão de cálculo (o número no gabarito é o resultado, não a dica)`);

const nOfi = parseInt(argVal("--oficial") || "0", 10);
if (nOfi > 0) {
  const pOfi = [...dOfi].sort((a, b) => b.d.carga - a.d.carga).slice(0, nOfi);
  console.log(`\n  ${pOfi.length} PIORES DO CADERNO OFICIAL — a resposta à pergunta "a banca faz isso?"`);
  pOfi.forEach((x) => {
    console.log(`\n  ── ${x.q.ref} (${x.q.dificuldade}) · carga ${x.d.carga.toFixed(2)}`);
    if (x.d.numeros.length) console.log(`     nº distintivos: ${x.d.numeros.join(", ")}`);
    if (x.d.palavras.length) console.log(`     palavras:       ${x.d.palavras.join(", ")}`);
    console.log(`     enunciado: …${x.q.q.replace(/\s+/g, " ").slice(-200)}`);
    console.log(`     gabarito:  ${x.q.alts[x.q.c].replace(/\s+/g, " ").slice(0, 200)}`);
  });
}

const n = parseInt(argVal("--listar") || "0", 10);
if (n > 0) {
  console.log(`\n  ${Math.min(n, vazando.length)} PIORES (excluídas as de cálculo)`);
  vazando.slice(0, n).forEach((x) => {
    console.log(`\n  ── ${x.q.ref} · carga ${x.d.carga.toFixed(2)}`);
    if (x.d.numeros.length) console.log(`     nº distintivos: ${x.d.numeros.join(", ")}`);
    if (x.d.palavras.length) console.log(`     palavras:       ${x.d.palavras.join(", ")}`);
    console.log(`     enunciado: …${x.q.q.replace(/\s+/g, " ").slice(-190)}`);
    console.log(`     gabarito:  ${x.q.alts[x.q.c].replace(/\s+/g, " ").slice(0, 190)}`);
  });
}

// A contagem chegou a zero em 09/09/2026, então daqui para a frente o script
// REPROVA. Ele é o quinto portão: nenhuma questão nova entra no banco
// entregando a própria resposta, e nenhuma reescrita futura reintroduz o
// padrão sem que o build acuse.
console.log(vazando.length
  ? `\n  ${vazando.length} questão(ões) a reescrever.\n`
  : "\n  NENHUMA QUESTÃO ENTREGA A RESPOSTA.\n");
process.exit(vazando.length ? 1 : 0);
