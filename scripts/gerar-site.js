#!/usr/bin/env node
/**
 * gerar-site.js — converte app/projeto-cpa-completo.jsx numa página web
 * independente (app/index.html) para rodar no Safari do iPhone.
 *
 * O que muda em relação ao artifact do chat:
 *  - JSX compilado aqui, em build (nada de Babel no navegador do celular);
 *  - window.storage ganha um shim com localStorage (no site é permitido;
 *    a regra 5 do README vale para o artifact, que continua sem isso);
 *  - meta tags de PWA: "Adicionar à Tela de Início" abre em tela cheia.
 *
 * Uso: node scripts/gerar-site.js   (o build.js chama sozinho)
 */
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const raiz = path.join(__dirname, "..");
const jsx = fs.readFileSync(path.join(raiz, "app", "projeto-cpa-completo.jsx"), "utf8");

// adapta o módulo do artifact para script de navegador
let fonte = jsx
  .replace('import { useState, useEffect } from "react";', "const { useState, useEffect } = React;")
  .replace("export default function ProjetoCPA", "function ProjetoCPA");

const { code } = babel.transformSync(fonte, {
  presets: [["@babel/preset-react", { runtime: "classic" }]],
  compact: true,
  babelrc: false,
  configFile: false,
});

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Projeto CPA</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Projeto CPA">
<meta name="theme-color" content="#FFFDF7">
<link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%234F46E5'/><text x='50' y='68' font-size='52' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='900'>C</text></svg>">
<style>html,body{margin:0;padding:0;background:#FFFDF7}#raiz{min-height:100vh}</style>
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
<div id="raiz"></div>
<script>
// shim: no site, o progresso vive no localStorage do Safari.
// Os códigos de backup do app continuam funcionando para migrar do chat.
if (!window.storage) {
  window.storage = {
    get: async (k) => { const v = localStorage.getItem(k); return v == null ? null : { key: k, value: v }; },
    set: async (k, v) => { localStorage.setItem(k, v); },
    delete: async (k) => { localStorage.removeItem(k); },
  };
}
</script>
<script>
${code}
ReactDOM.createRoot(document.getElementById("raiz")).render(React.createElement(ProjetoCPA));
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(raiz, "app", "index.html"), html);
console.log(`gerado: app/index.html  (${Math.round(html.length / 1024)} KB)`);
