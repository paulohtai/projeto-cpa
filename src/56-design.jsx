// =====================================================================
// SISTEMA DE DESIGN
//
// Direção, em uma frase: um caderno de estudo, não um painel de controle.
//
// O que estava errado antes, medido no app publicado em 10/09/2026:
//   · a 1440px de largura o conteúdo era uma coluna de 780px centralizada —
//     645px de tela sem uso nenhum, e nenhuma navegação persistente;
//   · a navegação era uma fileira de treze botões rotulados por emoji
//     (🗂 💬 🎵 ⚖️ 🔢 🧮 📖 🎯 🎓 🔁 📅 ⏱), que não escalam, não têm
//     significado estável entre sistemas e são lidos em voz alta pelo leitor
//     de tela como "arquivo de fichário", "balão de fala";
//   · não havia hierarquia de superfície: tudo era cartão branco sobre
//     cartão branco.
//
// As cinco decisões desta camada:
//
// 1. UMA FAMÍLIA, DOIS PAPÉIS. A pilha do sistema, em dois usos: título
//    apertado (tracking negativo, peso alto) e texto de leitura solto
//    (16px/1.65). Nenhuma fonte é baixada — em rede móvel, fonte web é
//    tela em branco ou salto de layout.
//
// 2. MEDIDA DE LEITURA CONTROLADA. Enunciado e explicação param em 66
//    caracteres, que é onde o olho ainda encontra a linha seguinte sem se
//    perder. O resto da largura vira contexto lateral, não linha comprida.
//
// 3. ESTRUTURA EM VEZ DE ROLAGEM. Trilho fixo à esquerda a partir de
//    1024px; barra inferior de cinco destinos abaixo de 768px. As duas
//    convivem: o app não é o layout de desktop encolhido.
//
// 4. ÍCONES DESENHADOS, NÃO EMOJI. Um conjunto de traços de 1.6px, inline,
//    `currentColor`, com `aria-hidden` — o nome acessível vem do texto do
//    botão, não do desenho.
//
// 5. PROFUNDIDADE POR SUPERFÍCIE, NÃO POR SOMBRA. Três níveis de fundo e
//    duas espessuras de borda. Sombra só onde algo flutua de verdade
//    (barra fixa, diálogo).
//
// O que esta camada NÃO faz: mexer nos matizes já medidos na WCAG. As
// variáveis --ink, --azul, --ok, --no e companhia continuam com os mesmos
// valores conferidos pelo scripts/conferir-contraste.js.
// =====================================================================

const DESIGN_CSS = `
/* ---------- 1. tokens ---------- */
.cx{
  /* escala de espaço, base 4 */
  --e1:4px; --e2:8px; --e3:12px; --e4:16px; --e5:24px; --e6:32px; --e7:48px; --e8:64px;
  /* raios */
  --r1:8px; --r2:12px; --r3:16px; --r4:22px; --rp:999px;
  /* superfícies: três níveis, do fundo para a frente */
  --sup0:#FAF7F0;   /* fundo da página */
  --sup1:#FFFFFF;   /* cartão */
  --sup2:#F4F1EA;   /* recuo dentro do cartão */
  --linha:#E6DFD1;  /* borda comum */
  --linha2:#D2C8B4; /* borda de ênfase */
  /* medida de leitura */
  --medida:66ch;
  /* trilho */
  --rail:250px;
  /* tipografia */
  --t-xs:12px; --t-sm:13.5px; --t-md:15px; --t-lg:17px; --t-xl:21px; --t-2xl:27px; --t-3xl:36px;
  background:var(--sup0);
}
.cx-num,.cx-tab{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1}

/* tema escuro: mesmos papéis, outra matéria-prima.
   Só entra se o aparelho pedir — não há botão, porque a preferência do
   sistema já é a resposta do usuário a essa pergunta. */
@media (prefers-color-scheme: dark){
  .cx{
    --sup0:#141520; --sup1:#1C1D2B; --sup2:#232436;
    --linha:#2E3044; --linha2:#3D3F58;
    --paper:#141520; --card:#1C1D2B;
    --ink:#F2F1F6; --ink2:#B9BACB; --mut:#9394A8;
    --azul:#A5A0FF; --azul-l:#26263F;
    --verde:#5FD3A8; --verde-l:#122E26;
    --laranja:#FFA96B; --laranja-l:#33210F;
    --roxo:#C3A6FF; --roxo-l:#291F3D;
    --ok:#5FD3A8; --no:#FF8E90; --gold:#E5B45C;
  }
  .cx-dots{opacity:.14}
}

/* ---------- 2. tipografia ---------- */
.cx-h1{font-size:clamp(26px,4.2vw,var(--t-3xl));letter-spacing:-.035em;line-height:1.06}
.cx-h2{font-size:clamp(19px,2.6vw,var(--t-2xl));letter-spacing:-.025em;line-height:1.15}
.cx-h3{font-size:var(--t-lg);font-weight:800;letter-spacing:-.015em;line-height:1.25;margin:0}
.cx-p{font-size:var(--t-md);line-height:1.65;max-width:var(--medida)}
.cx-eye{font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:var(--mut)}
/* texto longo de leitura: enunciado, explicação, ficha */
.cx-leitura{font-size:16px;line-height:1.65;max-width:var(--medida);color:var(--ink)}
@media (max-width:520px){ .cx-leitura{font-size:16.5px;line-height:1.6} }

/* ---------- 3. o esqueleto ---------- */
/* A coluna deixa de ser centralizada na tela e passa a ser centralizada no
   espaço QUE SOBRA do trilho. Sem isto, abrir o trilho empurraria todo o
   conteúdo para a direita e o texto ficaria fora do eixo do olhar. */
.cx-wrap{max-width:820px;margin:0 auto;padding:0 var(--e4)}
@media (min-width:1024px){
  .cx-tela{padding-left:var(--rail)}
  .cx-wrap{max-width:860px}
}
@media (min-width:1500px){ .cx{--rail:280px} .cx-wrap{max-width:920px} }

/* trilho fixo — só existe onde há largura para ele */
.cx-rail{display:none}
@media (min-width:1024px){
  .cx-rail{
    display:flex;flex-direction:column;gap:var(--e1);
    position:fixed;left:0;top:0;bottom:0;width:var(--rail);z-index:40;
    padding:var(--e5) var(--e3) var(--e4);overflow-y:auto;overscroll-behavior:contain;
    background:var(--sup1);border-right:1px solid var(--linha)
  }
  .cx-rail::-webkit-scrollbar{width:6px}
  .cx-rail::-webkit-scrollbar-thumb{background:var(--linha2);border-radius:3px}
}
.cx-rail-marca{display:flex;align-items:center;gap:var(--e2);padding:0 var(--e2) var(--e4);font-weight:900;letter-spacing:-.03em;font-size:var(--t-md)}
.cx-rail-gr{margin:var(--e4) var(--e2) var(--e1);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:var(--mut)}
.cx-rail-it{
  display:flex;align-items:center;gap:var(--e3);width:100%;text-align:left;
  padding:9px var(--e2);border:0;border-radius:var(--r1);background:transparent;
  color:var(--ink2);font:inherit;font-size:var(--t-sm);font-weight:650;cursor:pointer;
  min-height:38px
}
.cx-rail-it:hover{background:var(--sup2);color:var(--ink)}
.cx-rail-it[aria-current="page"]{background:var(--azul-l);color:var(--azul);font-weight:800}
.cx-rail-it svg{flex:0 0 auto}
.cx-rail-it .cx-cnt{margin-left:auto;font-size:11px;font-weight:800;color:var(--mut);font-variant-numeric:tabular-nums}

/* barra inferior — o desktop encolhido não serve, o polegar manda aqui */
.cx-tabs{display:none}
@media (max-width:1023px){
  .cx-tabs{
    display:grid;grid-template-columns:repeat(5,1fr);
    position:fixed;left:0;right:0;bottom:0;z-index:45;
    background:color-mix(in srgb, var(--sup1) 94%, transparent);
    backdrop-filter:saturate(180%) blur(12px);-webkit-backdrop-filter:saturate(180%) blur(12px);
    border-top:1px solid var(--linha);
    padding-bottom:env(safe-area-inset-bottom,0px)
  }
  .cx{padding-bottom:calc(64px + env(safe-area-inset-bottom,0px))}
}
.cx-tab{
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
  min-height:56px;border:0;background:transparent;color:var(--mut);
  font:inherit;font-size:10.5px;font-weight:750;cursor:pointer;padding:6px 2px
}
.cx-tab[aria-current="page"]{color:var(--azul)}
.cx-tab:active{background:var(--sup2)}

/* ---------- 4. superfícies ---------- */
.cx-pane,.cx-mod{background:var(--sup1);border:1px solid var(--linha);border-radius:var(--r3)}
.cx-sub{background:var(--sup2);border-radius:var(--r2);padding:var(--e4)}

/* ---------- 5. tela de questão: uma coisa por vez ---------- */
/* O cenário é o cenário, a pergunta é a pergunta. Antes eles vinham no mesmo
   parágrafo, no mesmo tamanho, e o olho não sabia onde estava a tarefa. */
.cx-cena{
  font-size:15px;line-height:1.62;color:var(--ink2);max-width:var(--medida);
  border-left:3px solid var(--linha2);padding-left:var(--e4);margin-bottom:var(--e5)
}
.cx-perg{font-size:17.5px;line-height:1.45;font-weight:750;color:var(--ink);max-width:var(--medida);margin-bottom:var(--e4)}
@media (max-width:520px){ .cx-perg{font-size:17px} .cx-cena{font-size:15px;padding-left:var(--e3)} }

.cx-alt{
  display:flex;gap:var(--e3);align-items:flex-start;width:100%;text-align:left;
  padding:var(--e4);min-height:52px;border-radius:var(--r2);
  background:var(--sup1);border:1.5px solid var(--linha);
  font:inherit;font-size:15.5px;line-height:1.5;color:var(--ink);cursor:pointer
}
.cx-alt .k{
  flex:0 0 auto;width:26px;height:26px;border-radius:var(--r1);
  display:grid;place-items:center;font-size:12.5px;font-weight:800;
  background:var(--sup2);color:var(--ink2)
}
.cx-alt[aria-pressed="true"]{border-color:var(--azul);background:var(--azul-l)}
.cx-alt[aria-pressed="true"] .k{background:var(--azul);color:#fff}
.cx-alt:disabled{cursor:default}

/* ---------- 5b. árvore: andamento e histórico recolhido ---------- */
.cx-and{
  display:flex;align-items:center;gap:var(--e3);margin-top:var(--e3);
  font-size:13px;font-weight:700;color:var(--ink2)
}
.cx-and b{color:var(--ink);font-variant-numeric:tabular-nums}
.cx-and .cx-passos{flex:1;display:flex;gap:3px;margin:0}
.cx-and .cx-passos i{flex:1;height:5px;border-radius:3px;background:var(--sup2)}
.cx-and .cx-passos i.f{background:var(--roxo)}
.cx-and .cx-passos i.n{background:var(--roxo);opacity:.45}

.cx-hist{margin-top:var(--e4);border:1px solid var(--linha);border-radius:var(--r2);padding:var(--e3)}
.cx-hist-bt{
  display:inline-flex;align-items:center;gap:7px;min-height:40px;
  border:0;background:transparent;color:var(--ink2);
  font:inherit;font-size:13px;font-weight:750;cursor:pointer;padding:0 4px
}
.cx-hist-bt:hover{color:var(--azul)}
.cx-hist-min{list-style:none;margin:var(--e2) 0 0;padding:0;display:flex;flex-direction:column;gap:5px}
.cx-hist-min li{display:flex;align-items:center;gap:var(--e2);font-size:12.5px;color:var(--mut);line-height:1.4}
.cx-hist-min .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* o grau vira número + cor: quem não distingue as cores lê o algarismo */
.cx-gsel{
  flex:0 0 auto;width:20px;height:20px;border-radius:6px;display:grid;place-items:center;
  font-size:11px;font-weight:800;color:#fff;background:var(--mut)
}
.cx-gsel.g3{background:var(--ok)} .cx-gsel.g2{background:var(--azul)}
.cx-gsel.g1{background:var(--gold)} .cx-gsel.g0{background:var(--no)}

/* ---------- 5c. composição da prova no resultado ---------- */
.cx-comp{display:flex;flex-direction:column;gap:10px;margin-top:var(--e3)}
.cx-comp-l{display:grid;grid-template-columns:1fr auto;gap:2px var(--e3);align-items:baseline}
.cx-comp-l .rot{font-size:13px;font-weight:700;color:var(--ink2);min-width:0}
.cx-comp-l .val{font-size:13px;font-weight:800;color:var(--ink2);font-variant-numeric:tabular-nums;white-space:nowrap}
.cx-comp-l .val.fora{color:var(--gold)}
.cx-comp-l .barra{grid-column:1 / -1;height:6px;border-radius:3px;background:var(--sup2);overflow:hidden}
.cx-comp-l .barra > span{display:block;height:100%;background:var(--azul);border-radius:3px}
.cx-comp-l .val.fora ~ .barra > span{background:var(--gold)}
/* texto só para leitor de tela: a cor sozinha não pode carregar o aviso */
.sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}

/* ---------- 6. barra do exame: estado sempre visível ---------- */
.cx-provabar{
  position:sticky;top:0;z-index:30;
  padding:10px var(--e4);margin:0 calc(-1 * var(--e4)) var(--e4);
  background:color-mix(in srgb, var(--sup1) 96%, transparent);
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  border-bottom:1px solid var(--linha)
}
.cx-provabar .l1{display:flex;align-items:center;gap:var(--e3);min-width:0}
.cx-provabar .l1 .cx-eye{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cx-provabar .l1 .cx-cron{margin-left:auto;white-space:nowrap}
.cx-provabar .l2{display:flex;align-items:center;gap:var(--e2);margin-top:8px}
/* ações secundárias da prova: mesmo alvo de toque, peso visual menor */
.cx-acao{
  display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 var(--e3);
  border:1px solid var(--linha);border-radius:var(--r2);background:transparent;
  color:var(--ink2);font:inherit;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap
}
.cx-acao:hover{border-color:var(--azul);color:var(--azul)}
.cx-estado{
  display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:var(--rp);
  font-size:11.5px;font-weight:800;letter-spacing:.02em
}
.cx-estado.ativa{background:var(--verde-l);color:var(--verde)}
.cx-estado.pausada{background:var(--laranja-l);color:var(--laranja)}
.cx-estado .pt{width:7px;height:7px;border-radius:50%;background:currentColor}
.cx-estado.ativa .pt{animation:pulsa 2.4s ease-in-out infinite}
@keyframes pulsa{0%,100%{opacity:1}50%{opacity:.35}}

/* o botão de pausa é ação primária da barra, não item escondido em menu */
.cx-pausa{
  display:inline-flex;align-items:center;gap:7px;margin-left:auto;
  min-height:44px;padding:0 var(--e4);border-radius:var(--r2);
  border:1.5px solid var(--linha2);background:var(--sup1);color:var(--ink);
  font:inherit;font-size:14px;font-weight:800;cursor:pointer
}
.cx-pausa:hover{border-color:var(--azul);color:var(--azul)}
@media (max-width:400px){
  .cx-provabar .l1{gap:var(--e2)}
  .cx-pausa,.cx-acao{padding:0 10px;font-size:13px}
  .cx-provabar .l2{gap:6px}
}

/* ---------- 7. alvos de toque ----------
   Dois gatilhos, de propósito. 'pointer:coarse' cobre o dedo; a largura
   cobre o tablet que se anuncia como mouse e o navegador que não expõe o
   tipo de ponteiro. Medido a 768px: sem a regra de largura, nove fichas
   ficavam com 40px de altura. */
@media (pointer:coarse), (max-width:1023px){
  .cx-btn,.cx-chip,.cx-alt,.cx-rail-it,.cx-pausa,.cx-linkbt{min-height:44px}
  .cx-chip{padding-left:var(--e3);padding-right:var(--e3)}
}

/* ---------- 7b. piso do texto pequeno ----------
   Rótulo pequeno é recurso legítimo de hierarquia, mas 10px num celular na
   rua não se lê. O piso é 11px no computador e 11,5px no celular — vale para
   contadores, selos e títulos de grupo, não para texto de leitura, que já
   está em 16px. */
.cx-lb{font-size:11px}
.cx-rail-gr{font-size:11px}
@media (max-width:520px){
  .cx-lb,.cx-eye,.cx-cnt,.cx-peso,.cx-pat,.cx-kbd{font-size:11.5px}
}

/* ---------- 8. foco: um só desenho, em tudo ---------- */
.cx :focus-visible{outline:3px solid var(--azul);outline-offset:2px;border-radius:var(--r1)}

/* ---------- 9. o exame continua austero ---------- */
.cx-lacrado .cx-rail-gr,.cx-lacrado .cx-tabs{opacity:.55}

/* ---------- 9b. folha "Mais" ---------- */
.cx-folha-fundo{
  position:fixed;inset:0;z-index:60;background:rgba(20,21,32,.42);
  display:flex;align-items:flex-end;justify-content:center;
  animation:folhaFundo 180ms ease-out
}
.cx-folha{
  width:100%;max-width:560px;background:var(--sup1);
  border-radius:var(--r4) var(--r4) 0 0;border:1px solid var(--linha);border-bottom:0;
  padding:var(--e3) var(--e4) calc(var(--e4) + env(safe-area-inset-bottom,0px));
  max-height:78vh;overflow-y:auto;animation:folhaSobe 220ms cubic-bezier(.22,1,.36,1)
}
.cx-folha-alca{width:38px;height:4px;border-radius:2px;background:var(--linha2);margin:0 auto var(--e3)}
.cx-folha-lista{display:flex;flex-direction:column;gap:2px}
.cx-folha-it{
  display:flex;align-items:center;gap:var(--e3);width:100%;text-align:left;
  min-height:52px;padding:0 var(--e3);border:0;border-radius:var(--r2);
  background:transparent;color:var(--ink);font:inherit;font-size:15px;font-weight:650;cursor:pointer
}
.cx-folha-it .t{flex:1}
.cx-folha-it:active{background:var(--sup2)}
.cx-folha-it:disabled{opacity:.4;cursor:default}
.cx-folha-it[aria-current="page"]{background:var(--azul-l);color:var(--azul);font-weight:800}
@keyframes folhaFundo{from{opacity:0}to{opacity:1}}
@keyframes folhaSobe{from{transform:translateY(18px)}to{transform:none}}
@media (prefers-reduced-motion:reduce){
  .cx-folha,.cx-folha-fundo{animation:none}
  .cx-estado.ativa .pt{animation:none}
}

/* ---------- 10. impressão e telas baixas ---------- */
@media (max-height:560px) and (min-width:768px){
  .cx-h1{font-size:24px}
  .cx-rail{padding-top:var(--e3)}
  .cx-rail-marca{padding-bottom:var(--e2)}
}
`;

// =====================================================================
// ÍCONES
//
// Traço de 1.6px, caixa de 24, `currentColor`, sem preenchimento. São
// desenhados aqui e não importados: uma biblioteca de ícones custaria um
// pedido de rede e dezenas de KB para as quinze formas que usamos.
//
// `aria-hidden` em todos, de propósito: o nome acessível do botão vem do
// texto ao lado. Ícone que também é rotulado vira leitura dupla.
// =====================================================================
const ICONES = {
  casa: "M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5",
  camada: "M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 17.5l9 5 9-5",
  conversa: "M4 5h16v11H9l-5 4V5Z",
  cartao: "M4 6h16v12H4zM4 10h16M9 6v12",
  balanca: "M12 4v16M6 8h12M8 8l-3 6h6l-3-6ZM16 8l-3 6h6l-3-6Z",
  tabela: "M4 5h16v14H4zM4 10h16M4 14.5h16M10 5v14",
  calc: "M6 3h12v18H6zM9 7h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01M9 19h6",
  livro: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 5.5V20.5",
  alvo: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 12h.01",
  chapeu: "M3 8.5 12 4l9 4.5-9 4.5-9-4.5ZM7 11v5c0 1.5 2.5 2.5 5 2.5s5-1 5-2.5v-5",
  volta: "M4 12a8 8 0 1 0 2.6-5.9M4 4v4h4",
  agenda: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  relogio: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM12 8v4.5l3 1.8",
  pausa: "M9 5v14M15 5v14",
  play: "M7 4.5 19 12 7 19.5z",
  som: "M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM16 9.5a4 4 0 0 1 0 5",
  mudo: "M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM16.5 9.5l5 5M21.5 9.5l-5 5",
  engrenagem: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3H9.8l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.7h4.4l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z",
  seta: "M5 12h14M13 6l6 6-6 6",
  volta2: "M19 12H5M11 6l-6 6 6 6",
  grade: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
};

const Ico = ({ n, s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {(ICONES[n] || "").split("M").filter(Boolean).map((d, i) => <path key={i} d={"M" + d} />)}
  </svg>
);

// =====================================================================
// NAVEGAÇÃO
//
// A mesma lista de destinos, dois desenhos:
//   · ≥1024px  trilho fixo à esquerda, agrupado, com o item atual marcado;
//   · <1024px  barra inferior de CINCO destinos + folha "Mais".
//
// Cinco é o limite prático de uma barra inferior: acima disso os alvos caem
// abaixo dos 44px confortáveis num aparelho de 360px de largura. O que não
// cabe vai para a folha, que abre de baixo e é fechável por toque fora, por
// Esc e pelo botão — três saídas, porque folha sem saída clara é armadilha.
//
// `aria-current="page"` é o que marca o item atual para o leitor de tela; a
// cor sozinha não serve, e é por isso que o item atual também muda de peso.
// =====================================================================
const Nav = ({ tela, itens, aoIr, mostrarMais, setMostrarMais }) => {
  const naBarra = itens.filter((x) => x.barra).slice(0, 4);
  const noMais = itens.filter((x) => !x.barra);
  const grupos = [...new Set(itens.map((x) => x.grupo))];
  const atual = (x) => (x.tela && x.tela === tela ? "page" : undefined);

  return (
    <>
      {/* ---------- trilho (desktop) ---------- */}
      <nav className="cx-rail" aria-label="Seções do app">
        <div className="cx-rail-marca"><Ico n="chapeu" s={22} /> Projeto CPA</div>
        {grupos.map((g) => (
          <div key={g}>
            <div className="cx-rail-gr">{g}</div>
            {itens.filter((x) => x.grupo === g).map((x) => (
              <button key={x.id} className="cx-rail-it" aria-current={atual(x)}
                disabled={x.desabilitado} onClick={() => { setMostrarMais(false); x.onClick(); }}>
                <Ico n={x.ico} />
                <span>{x.rotulo}</span>
                {x.cnt !== undefined && <span className="cx-cnt">{x.cnt}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* ---------- barra inferior (celular e tablet) ---------- */}
      <nav className="cx-tabs" aria-label="Seções do app">
        {naBarra.map((x) => (
          <button key={x.id} className="cx-tab" aria-current={atual(x)}
            disabled={x.desabilitado} onClick={() => { setMostrarMais(false); x.onClick(); }}>
            <Ico n={x.ico} s={21} /><span>{x.curto || x.rotulo}</span>
          </button>
        ))}
        <button className="cx-tab" aria-expanded={mostrarMais} aria-haspopup="dialog"
          onClick={() => setMostrarMais(!mostrarMais)}>
          <Ico n="grade" s={21} /><span>Mais</span>
        </button>
      </nav>

      {/* ---------- folha "Mais" ---------- */}
      {mostrarMais && (
        <div className="cx-folha-fundo" onClick={() => setMostrarMais(false)}>
          <div className="cx-folha" role="dialog" aria-modal="true" aria-label="Mais seções"
            onClick={(e) => e.stopPropagation()}>
            <div className="cx-folha-alca" aria-hidden="true" />
            <div className="cx-folha-lista">
              {noMais.map((x) => (
                <button key={x.id} className="cx-folha-it" aria-current={atual(x)}
                  disabled={x.desabilitado} onClick={() => { setMostrarMais(false); x.onClick(); }}>
                  <Ico n={x.ico} s={22} />
                  <span className="t">{x.rotulo}</span>
                  {x.cnt !== undefined && <span className="cx-cnt">{x.cnt}</span>}
                </button>
              ))}
            </div>
            <button className="cx-btn" style={{ width: "100%", marginTop: 12 }}
              onClick={() => setMostrarMais(false)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
};
