// =====================================================================
// CAMADA VISUAL
//
// Objetivo: que o app pareça — e responda — como uma ferramenta cara.
// Três regras que esta camada NÃO pode quebrar, porque custaram trabalho:
//
//   1. CONTRASTE. Nada aqui muda cor de texto. Os efeitos são luz, sombra
//      e movimento sobre os fundos; a paleta conferida na WCAG fica intacta.
//   2. MOVIMENTO É OPCIONAL. Tudo passa por prefers-reduced-motion. Com a
//      preferência ligada, o app fica exatamente como era: estático e
//      legível. Animação nunca é pré-requisito para ver conteúdo.
//   3. O EXAME NÃO BRILHA. A tela da prova continua austera de propósito.
//      Efeito ali disputa atenção com a questão e pode sugerir estado que
//      não existe. `.cx-lacrado` desliga esta camada inteira.
//
// Técnica: só `transform` e `opacity` animam (as duas propriedades que a
// GPU resolve sem recalcular layout). Nada de listener de scroll — a
// revelação usa IntersectionObserver, e o ponteiro tem UM listener global.
// =====================================================================

const VISUAL_CSS = `
/* ---------- fundação: profundidade em camadas ---------- */
.cx{
  --sombra-1:0 1px 2px rgba(31,32,51,.04), 0 2px 6px rgba(31,32,51,.05);
  --sombra-2:0 2px 4px rgba(31,32,51,.05), 0 8px 22px rgba(31,32,51,.08);
  --sombra-3:0 4px 8px rgba(31,32,51,.06), 0 18px 44px rgba(31,32,51,.13);
  --mola:cubic-bezier(.22,1,.36,1);          /* desacelera no fim, como peso real */
  --rapido:180ms var(--mola);
  --medio:340ms var(--mola);
}

/* ---------- aurora: o fundo respira, muito devagar ----------
   28s por volta. Rápido o suficiente para não parecer parado, lento o
   bastante para nunca puxar o olho de um texto que está sendo lido. */
.cx-aurora{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;opacity:.30}
.cx-aurora i{position:absolute;display:block;border-radius:50%;filter:blur(90px);opacity:.34}
.cx-aurora i:nth-child(1){width:40vw;height:40vw;left:-16vw;top:-20vw;background:var(--azul);animation:auroraA 28s ease-in-out infinite}
.cx-aurora i:nth-child(2){width:34vw;height:34vw;right:-14vw;top:4vh;background:var(--verde);animation:auroraB 34s ease-in-out infinite}
.cx-aurora i:nth-child(3){width:30vw;height:30vw;left:26vw;top:52vh;background:var(--roxo);animation:auroraC 40s ease-in-out infinite}
@keyframes auroraA{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(6vw,4vh,0) scale(1.12)}}
@keyframes auroraB{0%,100%{transform:translate3d(0,0,0) scale(1.05)}50%{transform:translate3d(-5vw,6vh,0) scale(.94)}}
@keyframes auroraC{0%,100%{transform:translate3d(0,0,0) scale(.95)}50%{transform:translate3d(4vw,-5vh,0) scale(1.1)}}
.cx-wrap{position:relative;z-index:1}

/* ---------- revelação: o conteúdo sobe ao entrar na tela ----------
   REGRA DE OURO, aprendida quebrando: decoração NUNCA esconde conteúdo.
   Por padrão o texto está visível. O estado escondido só existe quando o
   JS confirma que consegue revelar — ele marca <html data-rv="1">. Se o
   IntersectionObserver faltar, se o script falhar, se a marcação não
   chegar: o app fica sem animação, e legível. Na primeira versão era o
   contrário e a home abriu em branco. */
[data-rv="1"] .rv{opacity:0;transform:translate3d(0,18px,0);
  transition:opacity 520ms var(--mola), transform 520ms var(--mola)}
[data-rv="1"] .rv[data-on]{opacity:1;transform:none}
[data-rv="1"] .rv-1{transition-delay:40ms}[data-rv="1"] .rv-2{transition-delay:90ms}
[data-rv="1"] .rv-3{transition-delay:140ms}[data-rv="1"] .rv-4{transition-delay:190ms}
[data-rv="1"] .rv-5{transition-delay:240ms}[data-rv="1"] .rv-6{transition-delay:290ms}

/* ---------- luz que segue o cursor ----------
   --mx/--my são preenchidas por um único listener global. Sem cursor
   (celular), o gradiente simplesmente não aparece: nada quebra. */
[data-luz]{position:relative;isolation:isolate}
[data-luz]::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:-1;
  opacity:0;transition:opacity var(--medio);pointer-events:none;
  background:radial-gradient(340px circle at var(--mx,50%) var(--my,50%),
    color-mix(in srgb, var(--luz, var(--azul)) 16%, transparent), transparent 62%)}
[data-luz]:hover::before{opacity:1}

/* ---------- cartões com peso ---------- */
.cx-mod{box-shadow:var(--sombra-1);
  transition:transform var(--rapido), box-shadow var(--medio), border-color var(--medio)}
.cx-mod:hover{transform:translate3d(0,-3px,0);box-shadow:var(--sombra-3)}
.cx-mod:active{transform:translate3d(0,-1px,0) scale(.995);transition-duration:80ms}
.cx-pane{transition:box-shadow var(--medio)}
.cx-pane:hover{box-shadow:var(--sombra-2)}

/* ---------- botões e fichas: resposta imediata ao toque ---------- */
.cx-btn{transition:transform var(--rapido), filter var(--rapido), box-shadow var(--medio)}
.cx-btn:hover:not(:disabled){transform:translate3d(0,-2px,0);filter:brightness(1.05)}
.cx-btn:active:not(:disabled){transform:translate3d(0,0,0) scale(.985);transition-duration:70ms}
.cx-chip{transition:transform var(--rapido), background var(--rapido), border-color var(--rapido), box-shadow var(--rapido)}
.cx-chip:hover{transform:translate3d(0,-2px,0);border-color:var(--azul);box-shadow:var(--sombra-1)}
.cx-chip:active{transform:scale(.97);transition-duration:70ms}

/* ---------- alternativas: entram escalonadas e afundam ao tocar ---------- */
.cx-alt{transition:transform var(--rapido), border-color var(--rapido),
  background var(--rapido), box-shadow var(--medio)}
.cx-alt:hover:not(:disabled){transform:translate3d(3px,0,0);box-shadow:var(--sombra-2)}
.cx-alt:active:not(:disabled){transform:translate3d(1px,0,0) scale(.995);transition-duration:70ms}
.cx-alt .k{transition:transform var(--rapido), background var(--rapido)}
.cx-alt:hover:not(:disabled) .k{transform:scale(1.08)}

/* ---------- cabeçalho que encolhe ao rolar ---------- */
.cx-topo{position:sticky;top:0;z-index:20;backdrop-filter:saturate(180%) blur(14px);
  -webkit-backdrop-filter:saturate(180%) blur(14px);
  background:color-mix(in srgb, var(--paper) 82%, transparent);
  transition:padding var(--medio), box-shadow var(--medio), background var(--medio)}
.cx-topo.enc{box-shadow:0 1px 0 var(--line), var(--sombra-1);
  background:color-mix(in srgb, var(--paper) 94%, transparent)}
/* trilho de leitura: quanto da tela já foi percorrido */
.cx-trilho{position:fixed;left:0;top:0;height:2px;z-index:30;pointer-events:none;
  background:linear-gradient(90deg, var(--azul), var(--verde));
  width:var(--lido,0%);transition:width 90ms linear}

/* ---------- entrada de tela ---------- */
.cx-tela{animation:entraTela 300ms var(--mola) both}
@keyframes entraTela{from{opacity:0;transform:translate3d(0,10px,0)}to{opacity:1;transform:none}}

/* ---------- números que sobem ---------- */
.cx-num{font-variant-numeric:tabular-nums;transition:color var(--medio)}

/* ---------- brilho no título ---------- */
.cx-h1{background-image:linear-gradient(120deg, var(--ink) 30%, var(--azul) 50%, var(--ink) 70%);
  background-size:220% 100%;-webkit-background-clip:text;background-clip:text;
  animation:varrer 9s linear infinite}
@keyframes varrer{0%{background-position:120% 0}100%{background-position:-120% 0}}
.cx-h1 span{-webkit-text-fill-color:currentColor}

/* =====================================================================
   DESLIGAMENTOS — o que NÃO pode brilhar
   ===================================================================== */

/* 1. O EXAME. Austero de propósito: nada de aurora, luz, revelação ou
      lift. Efeito na prova disputa atenção e pode sugerir estado. */
.cx-lacrado .cx-aurora{display:none}
.cx-lacrado .rv{opacity:1!important;transform:none!important;transition:none!important}
.cx-lacrado [data-luz]::before{display:none}
.cx-lacrado .cx-alt:hover:not(:disabled){transform:none;box-shadow:none}
.cx-lacrado .cx-btn:hover:not(:disabled){transform:none;filter:none}
.cx-lacrado .cx-h1{animation:none;background:none;-webkit-text-fill-color:currentColor}
.cx-lacrado .cx-tela{animation:none}

/* 2. QUEM PEDIU MENOS MOVIMENTO. Com a preferência do sistema ligada, o
      app volta a ser estático — e continua inteiro. A revelação vira
      visível de imediato, não escondida. */
@media (prefers-reduced-motion:reduce){
  .cx-aurora{display:none}
  .rv{opacity:1!important;transform:none!important;transition:none!important}
  .cx-h1{animation:none;background:none;-webkit-text-fill-color:currentColor}
  .cx-tela{animation:none}
  .cx-mod:hover,.cx-btn:hover:not(:disabled),.cx-chip:hover,.cx-alt:hover:not(:disabled){transform:none}
  [data-luz]::before{transition:none}
  .cx-trilho{transition:none}
}

/* 3. TELAS PEQUENAS. Sem cursor não há luz de ponteiro, e a aurora fica
      mais discreta para não competir com o texto nem gastar bateria. */
@media (hover:none){
  [data-luz]::before{display:none}
  .cx-mod:hover,.cx-btn:hover:not(:disabled),.cx-chip:hover,.cx-alt:hover:not(:disabled){transform:none;box-shadow:var(--sombra-1)}
  .cx-aurora{opacity:.38}
}
@media (max-width:480px){ .cx-aurora i{filter:blur(48px)} }
`;

// ---------------------------------------------------------------------
// Revelação por scroll. IntersectionObserver em vez de listener de
// scroll: o navegador avisa quando o elemento entra, sem rodar código a
// cada pixel rolado. `once` de propósito — reanimar ao subir de volta
// irrita quem está relendo uma questão.
// ---------------------------------------------------------------------
const useRevelar = (dep) => {
  useEffect(() => {
    const raiz = document.documentElement;
    const podeAnimar = typeof IntersectionObserver !== "undefined" &&
      !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    // sem condições de animar, o modo escondido nem chega a ser armado
    if (!podeAnimar) { raiz.removeAttribute("data-rv"); return; }

    // `data-on` em vez de classe: o React não gerencia esse atributo, então
    // não o apaga num re-render. Mexer no className de um nó controlado pelo
    // React é briga que a decoração perde.
    const revelar = (el) => el.setAttribute("data-on", "1");
    const alvos = [...document.querySelectorAll(".rv:not([data-on])")];
    if (!alvos.length) { raiz.removeAttribute("data-rv"); return; }

    // o que JÁ está na tela é revelado de imediato, sem esperar o observador
    const daDobra = [], abaixo = [];
    alvos.forEach((el) => {
      const r = el.getBoundingClientRect();
      (r.top < window.innerHeight * 0.95 && r.bottom > 0 ? daDobra : abaixo).push(el);
    });

    raiz.setAttribute("data-rv", "1");     // agora sim: esconder é seguro
    requestAnimationFrame(() => daDobra.forEach(revelar));

    let obs = null;
    if (abaixo.length) {
      obs = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => { if (e.isIntersecting) { revelar(e.target); obs.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
      abaixo.forEach((a) => obs.observe(a));
    }

    // Rede de segurança final: 1,2 s depois, o que ainda estiver escondido
    // é revelado de qualquer jeito. Melhor um efeito perdido do que uma
    // linha de conteúdo que o usuário nunca vê.
    const t = setTimeout(() => {
      document.querySelectorAll(".rv:not([data-on])").forEach(revelar);
    }, 1200);

    return () => { if (obs) obs.disconnect(); clearTimeout(t); };
  }, [dep]);
};

// ---------------------------------------------------------------------
// Luz do ponteiro + trilho de leitura + cabeçalho condensado.
// UM listener de ponteiro e UM de scroll para o app inteiro, ambos
// passivos e escrevendo só em variáveis CSS — nada de re-render.
// ---------------------------------------------------------------------
const useAmbiente = () => {
  useEffect(() => {
    const reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const semCursor = window.matchMedia && window.matchMedia("(hover: none)").matches;

    let pedido = 0;
    const aoMover = (ev) => {
      if (pedido) return;
      pedido = requestAnimationFrame(() => {
        pedido = 0;
        const alvo = ev.target && ev.target.closest ? ev.target.closest("[data-luz]") : null;
        if (!alvo) return;
        const r = alvo.getBoundingClientRect();
        alvo.style.setProperty("--mx", ((ev.clientX - r.left) / r.width) * 100 + "%");
        alvo.style.setProperty("--my", ((ev.clientY - r.top) / r.height) * 100 + "%");
      });
    };

    const aoRolar = () => {
      const doc = document.documentElement;
      const alcance = doc.scrollHeight - window.innerHeight;
      const pct = alcance > 4 ? Math.min(100, Math.max(0, (window.scrollY / alcance) * 100)) : 0;
      doc.style.setProperty("--lido", pct + "%");
      document.querySelectorAll(".cx-topo").forEach((t) => t.classList.toggle("enc", window.scrollY > 8));
    };

    if (!semCursor) window.addEventListener("pointermove", aoMover, { passive: true });
    window.addEventListener("scroll", aoRolar, { passive: true });
    aoRolar();
    return () => {
      window.removeEventListener("pointermove", aoMover);
      window.removeEventListener("scroll", aoRolar);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, []);
};

// ---------------------------------------------------------------------
// Número que sobe até o valor. Só na primeira vez que aquele valor
// aparece — recontar a cada re-render viraria ruído.
// ---------------------------------------------------------------------
const useContador = (valor, ms) => {
  const [mostrado, setMostrado] = useState(valor);
  const anterior = useRef(valor);
  useEffect(() => {
    const de = anterior.current, para = valor;
    anterior.current = valor;
    if (de === para) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setMostrado(para); return; }
    const dur = ms || 700, t0 = performance.now();
    let raf = 0;
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const suave = 1 - Math.pow(1 - p, 3);       // desacelera no fim
      setMostrado(Math.round(de + (para - de) * suave));
      if (p < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [valor]);
  return mostrado;
};

// Fundo animado. Componente separado para poder ser omitido no exame.
const Aurora = () => (
  <div className="cx-aurora" aria-hidden="true"><i /><i /><i /></div>
);
