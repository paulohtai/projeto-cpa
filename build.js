#!/usr/bin/env node
/**
 * build.js — remonta o app único a partir das partes editáveis.
 *
 * Uso:  node build.js
 * Saída: app/projeto-cpa-completo.jsx
 *
 * A concatenação é textual e determinística: o arquivo gerado é
 * byte a byte idêntico ao que está rodando no chat, desde que as
 * partes não sejam alteradas. Rode "node scripts/verificar.js"
 * depois de qualquer edição.
 */
const fs = require("fs");
const path = require("path");

const raiz = __dirname;
const ler = (p) => fs.readFileSync(path.join(raiz, p), "utf8");

const ordem = [
  "src/00-header.jsx",
  null, // marcador: abre o array MODULOS
  "src/dados/modulo-1.part.js",
  "src/dados/modulo-2.part.js",
  "src/dados/modulo-3.part.js",
  "src/dados/modulo-4.part.js",
  null, // marcador: fecha o array
  "src/dados/exemplos.part.js",
  "src/dados/glossario.part.js",
  "src/dados/confrontos.part.js",
  "src/dados/musicas.part.js",
  "src/dados/arvores.part.js",
  "src/50-ferramentas.jsx",
  "src/55-visual.jsx",
  "src/56-design.jsx",
  "src/99-motor.jsx",
];

let out = "";
out += ler("src/00-header.jsx");
out += "const MODULOS = [\n";
for (let i = 1; i <= 4; i++) out += ler(`src/dados/modulo-${i}.part.js`);
out += "\n];\n\n";
out += ler("src/dados/exemplos.part.js");
out += ler("src/dados/glossario.part.js");
out += ler("src/dados/confrontos.part.js");
out += ler("src/dados/musicas.part.js");
out += ler("src/dados/arvores.part.js");
out += ler("src/50-ferramentas.jsx");
out += ler("src/55-visual.jsx");
out += ler("src/56-design.jsx");
out += ler("src/99-motor.jsx");

fs.mkdirSync(path.join(raiz, "app"), { recursive: true });
const destino = path.join(raiz, "app", "projeto-cpa-completo.jsx");
fs.writeFileSync(destino, out);

console.log(`gerado: app/projeto-cpa-completo.jsx  (${Math.round(out.length / 1024)} KB)`);

// versão web para o iPhone (app/index.html)
require("./scripts/gerar-site.js");
