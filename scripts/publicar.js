#!/usr/bin/env node
/**
 * publicar.js — publica app/index.html no GitHub Pages.
 *
 * Uso: node scripts/publicar.js
 *
 * Requisitos:
 *  - o token de acesso (escopo "repo") salvo em scripts/.token — arquivo
 *    local, NUNCA publicado: o repositório recebe somente o index.html.
 *  - rode depois de "node build.js" e "node scripts/verificar.js".
 *
 * O que ele faz: garante o repositório público "projeto-cpa", sobe o
 * index.html via Contents API e ativa o GitHub Pages (branch main, raiz).
 * A URL final é https://<usuario>.github.io/projeto-cpa/
 */
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const tokenPath = path.join(__dirname, ".token");
if (!fs.existsSync(tokenPath)) {
  console.error("Falta o token: salve-o em scripts/.token (uma linha, começa com ghp_).");
  process.exit(1);
}
const TOKEN = fs.readFileSync(tokenPath, "utf8").trim();
const REPO = "projeto-cpa";

const api = async (metodo, rota, corpo) => {
  const r = await fetch("https://api.github.com" + rota, {
    method: metodo,
    headers: {
      Authorization: "Bearer " + TOKEN,
      Accept: "application/vnd.github+json",
      "User-Agent": "projeto-cpa-publicador",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text();
  let json = null;
  try { json = JSON.parse(texto); } catch (e) {}
  return { status: r.status, json };
};

(async () => {
  const eu = await api("GET", "/user");
  if (eu.status !== 200) { console.error("Token recusado (" + eu.status + "). Confira o escopo 'repo'."); process.exit(1); }
  const usuario = eu.json.login;
  console.log("autenticado como", usuario);

  // 1. garante o repositório
  const existe = await api("GET", `/repos/${usuario}/${REPO}`);
  if (existe.status === 404) {
    const criado = await api("POST", "/user/repos", {
      name: REPO,
      description: "App de estudo para a certificação CPA da ANBIMA (gerado pelo Projeto CPA)",
      auto_init: true,
      has_issues: false,
      has_projects: false,
      has_wiki: false,
    });
    if (criado.status !== 201) { console.error("Não consegui criar o repositório:", criado.status, criado.json && criado.json.message); process.exit(1); }
    console.log("repositório criado:", REPO);
    await new Promise((x) => setTimeout(x, 2000));
  } else if (existe.status !== 200) {
    console.error("Erro ao consultar o repositório:", existe.status); process.exit(1);
  }

  // 2. sobe o index.html (Contents API precisa do sha se o arquivo já existe)
  const conteudo = fs.readFileSync(path.join(raiz, "app", "index.html"));
  const atual = await api("GET", `/repos/${usuario}/${REPO}/contents/index.html`);
  const corpo = {
    message: "publica " + new Date().toISOString().slice(0, 16).replace("T", " "),
    content: conteudo.toString("base64"),
  };
  if (atual.status === 200 && atual.json.sha) corpo.sha = atual.json.sha;
  const put = await api("PUT", `/repos/${usuario}/${REPO}/contents/index.html`, corpo);
  if (put.status !== 200 && put.status !== 201) { console.error("Falha no upload:", put.status, put.json && put.json.message); process.exit(1); }
  console.log("index.html publicado (" + Math.round(conteudo.length / 1024) + " KB)");

  // 3. garante o Pages ligado (main, raiz)
  const pages = await api("GET", `/repos/${usuario}/${REPO}/pages`);
  if (pages.status === 404) {
    const on = await api("POST", `/repos/${usuario}/${REPO}/pages`, { source: { branch: "main", path: "/" } });
    if (on.status !== 201) { console.error("Não consegui ativar o Pages:", on.status, on.json && on.json.message); process.exit(1); }
    console.log("GitHub Pages ativado");
  }
  const fim = await api("GET", `/repos/${usuario}/${REPO}/pages`);
  const url = (fim.json && fim.json.html_url) || `https://${usuario}.github.io/${REPO}/`;
  console.log("\nNO AR: " + url);
  console.log("(a primeira publicação pode levar 1-2 minutos para propagar)");
})();
