#!/usr/bin/env node
/**
 * conferir-contraste.js — mede o contraste de TODAS as combinações de cor
 * que o app usa em texto, pela fórmula da WCAG 2.1.
 *
 * Uso: node scripts/conferir-contraste.js
 *
 * Reprova se alguma combinação de texto normal ficar abaixo de 4,5:1
 * (nível AA). O app é usado no celular, muitas vezes na rua e com a tela
 * no claro — contraste aqui não é detalhe de acabamento.
 *
 * As cores são lidas do arquivo montado, não copiadas: se alguém mexer na
 * paleta e esquecer de conferir, este script pega.
 */
const fs = require("fs");
const path = require("path");
const arq = path.join(__dirname, "..", "app", "projeto-cpa-completo.jsx");
if (!fs.existsSync(arq)) { console.error("Rode 'node build.js' antes."); process.exit(1); }
const s = fs.readFileSync(arq, "utf8");

// lê as variáveis da paleta direto do CSS embutido
const ini = s.indexOf(".cx{--paper:");
const bloco = s.slice(ini, ini + 900);
const C = {};
(bloco.match(/--[a-z0-9-]+:#[0-9A-Fa-f]{3,6}/g) || []).forEach((d) => {
  const [k, v] = d.split(":");
  C[k.replace(/^--/, "")] = v;
});
const faltando = ["paper", "card", "ink", "ink2", "mut", "azul", "ok", "no", "gold"].filter((k) => !C[k]);
if (faltando.length) { console.error("não achei as cores: " + faltando.join(", ")); process.exit(1); }

const hex = (h) => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)); };
const lum = (rgb) => { const a = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; };
const ratio = (a, b) => { const l1 = lum(hex(a)), l2 = lum(hex(b)); const [x, y] = l1 > l2 ? [l1, l2] : [l2, l1]; return (x + 0.05) / (y + 0.05); };

// [frente, fundo, onde aparece, mínimo]
// 4.5 = texto normal (AA) · 3.0 = texto grande a partir de 18,66px negrito
const PARES = [
  ["ink", "paper", "texto principal", 4.5],
  ["ink", "card", "texto principal no cartão", 4.5],
  ["ink2", "card", "texto secundário", 4.5],
  ["ink2", "paper", "texto secundário no fundo", 4.5],
  ["mut", "paper", "texto apagado de 12px (nota de rodapé, contagem)", 4.5],
  ["mut", "card", "texto apagado no cartão", 4.5],
  ["azul", "card", "link e destaque", 4.5],
  ["azul", "paper", "link no fundo", 4.5],
  ["ok", "card", "verde de acerto na revisão", 4.5],
  ["no", "card", "vermelho de erro na revisão", 4.5],
  ["gold", "card", "dourado do cronômetro apertado", 4.5],
  ["gold", "paper", "dourado no fundo", 4.5],
  ["verde", "verde-l", "verde sobre o realce verde", 4.5],
  ["roxo", "roxo-l", "roxo do atendimento sobre o realce", 4.5],
  ["laranja", "laranja-l", "laranja do M3 sobre o realce", 4.5],
  ["ink", "azul-l", "texto sobre o realce azul", 4.5],
  ["card", "azul", "texto branco no botão azul", 4.5],
  ["card", "gold", "texto branco no cronômetro apertado", 4.5],
  ["card", "ok", "branco sobre verde", 4.5],
  ["card", "no", "branco sobre vermelho", 4.5],
  ["ink2", "line", "cinza sobre a borda", 3.0],
];

let falhas = 0;
console.log("\nCONTRASTE (WCAG 2.1)");
PARES.forEach(([f, b, onde, min]) => {
  if (!C[f] || !C[b]) { console.log(`  info par ${f}/${b} não existe mais na paleta`); return; }
  const r = ratio(C[f], C[b]);
  const passa = r >= min;
  if (!passa) falhas++;
  console.log(`  ${passa ? "ok  " : "ERRO"} ${r.toFixed(2).padStart(5)}:1 (mín ${min}) · ${onde}  [${C[f]} sobre ${C[b]}]`);
});

// foco visível é requisito, não enfeite
/:focus-visible\{[^}]*outline:3px solid/.test(s)
  ? console.log("  ok   foco de teclado tem contorno próprio (o padrão some sobre os cartões claros)")
  : (falhas++, console.log("  ERRO sem estilo de foco visível para navegação por teclado"));
/prefers-reduced-motion/.test(s)
  ? console.log("  ok   respeita a preferência de reduzir movimento")
  : (falhas++, console.log("  ERRO ignora prefers-reduced-motion"));
/overflow-wrap:anywhere/.test(s)
  ? console.log("  ok   texto longo quebra em vez de estourar a caixa")
  : (falhas++, console.log("  ERRO texto longo pode estourar a caixa com fonte ampliada"));

console.log(falhas === 0 ? "\nCONTRASTE E FOCO OK.\n" : `\n${falhas} PROBLEMA(S) DE ACESSIBILIDADE.\n`);
process.exit(falhas === 0 ? 0 : 1);
