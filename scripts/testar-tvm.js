#!/usr/bin/env node
/**
 * testar-tvm.js — a matemática financeira da HP-12C, conferida contra
 * valores conhecidos.
 *
 * Uso: node build.js && node scripts/testar-tvm.js
 *
 * Fica separado do testar.js porque é a parte onde um erro passa
 * despercebido com mais facilidade: um VPL levemente errado não quebra
 * nada, só ensina errado. Todos os alvos abaixo são valores que qualquer
 * HP-12C devolve — dá para conferir na máquina física.
 */
const fs=require("fs");
const s=fs.readFileSync(require("path").join(__dirname,"..","app","projeto-cpa-completo.jsx"),"utf8");
const ex=(nome,fim)=>{const d="const "+nome+" = ";const i=s.indexOf(d);const j=s.indexOf(fim,i+d.length);
  return eval("("+s.slice(i+d.length,j+fim.length).trim().replace(/;$/,"")+")");};
global.tvmFator=ex("tvmFator","\n};");
const tvmResolver=ex("tvmResolver","\n};");
let ok=0,f=0;
const t=(n,got,esp,tol)=>{const bom=Math.abs(got-esp)<=(tol||0.01);
  console.log((bom?"  ok   ":"  FALHOU ")+n+"  → "+(Math.round(got*1e6)/1e6)+(bom?"":"  (esperado "+esp+")"));bom?ok++:f++;};

console.log("\nTVM — conferido contra valores conhecidos da HP-12C\n");
// 1. capitalização simples de VP
t("1.000 a 1% por 12 meses → FV",
  tvmResolver({n:12,i:1,pv:-1000,pmt:0,fv:0},"fv"), 1126.825, 0.01);
// 2. prestação de financiamento (clássico)
t("100.000 a 1% em 360 meses → PMT",
  tvmResolver({n:360,i:1,pv:100000,pmt:0,fv:0},"pmt"), -1028.6125, 0.01);
// 3. VF de série uniforme
t("5 depósitos de 100 a 10% → FV",
  tvmResolver({n:5,i:10,pv:0,pmt:-100,fv:0},"fv"), 610.51, 0.01);
// 4. VP de série uniforme
t("VP de 5 recebimentos de 100 a 10%",
  tvmResolver({n:5,i:10,pv:0,pmt:100,fv:0},"pv"), -379.0787, 0.01);
// 5. resolver a taxa
t("1.000 vira 2.000 em 10 períodos → i%",
  tvmResolver({n:10,i:0,pv:-1000,pmt:0,fv:2000},"i"), 7.17735, 0.0001);
// 6. taxa de um financiamento
t("100.000 em 360x de 1.028,61 → i%",
  tvmResolver({n:360,i:0,pv:100000,pmt:-1028.6125,fv:0},"i"), 1.0, 0.0001);
// 7. resolver n
t("quantos meses para 1.000 virar 2.000 a 1%",
  tvmResolver({n:0,i:1,pv:-1000,pmt:0,fv:2000},"n"), 69.6607, 0.001);
// 8. n com PMT
t("n para quitar 10.000 a 2% com PMT 500",
  tvmResolver({n:0,i:2,pv:10000,pmt:-500,fv:0},"n"), 25.795851, 0.0001);
// 9. modo BEGIN muda o resultado
const end=tvmResolver({n:12,i:1,pv:0,pmt:-100,fv:0},"fv",false);
const beg=tvmResolver({n:12,i:1,pv:0,pmt:-100,fv:0},"fv",true);
t("BEGIN rende 1 período a mais que END", beg/end, 1.01, 0.0001);
t("END: 12 depósitos de 100 a 1% → FV", end, 1268.250, 0.01);
// 10. taxa zero não divide por zero
t("i = 0: 12 × 100 = 1.200", tvmResolver({n:12,i:0,pv:0,pmt:-100,fv:0},"fv"), 1200, 0.001);
t("i = 0 resolvendo n", tvmResolver({n:0,i:0,pv:-1200,pmt:100,fv:0},"n"), 12, 0.001);
// 11. taxa negativa (deflação / prejuízo)
t("taxa negativa: 1.000 a −5% por 3", tvmResolver({n:3,i:-5,pv:-1000,pmt:0,fv:0},"fv"), 857.375, 0.001);
t("resolve i negativo: 1.000 vira 857,375 em 3", tvmResolver({n:3,i:0,pv:-1000,pmt:0,fv:857.375},"i"), -5, 0.0001);
// 12. casos sem solução devolvem NaN, não número errado
const nan=(v)=>!isFinite(v);
console.log((nan(tvmResolver({n:10,i:0,pv:1000,pmt:100,fv:500},"i"))?"  ok   ":"  FALHOU ")+"sem troca de sinal → NaN, não um número inventado"); nan(tvmResolver({n:10,i:0,pv:1000,pmt:100,fv:500},"i"))?ok++:f++;
console.log((nan(tvmResolver({n:0,i:1,pv:-1000,pmt:0,fv:0},"n"))?"  ok   ":"  FALHOU ")+"n impossível → NaN"); nan(tvmResolver({n:0,i:1,pv:-1000,pmt:0,fv:0},"n"))?ok++:f++;
// 13. ida e volta: resolver e recolocar tem de fechar
const pmt=tvmResolver({n:120,i:0.8,pv:250000,pmt:0,fv:0},"pmt");
const pvVolta=tvmResolver({n:120,i:0.8,pv:0,pmt:pmt,fv:0},"pv");
t("ida e volta PMT→PV fecha", pvVolta, 250000, 0.01);
const iVolta=tvmResolver({n:120,i:0,pv:250000,pmt:pmt,fv:0},"i");
t("ida e volta PMT→i fecha", iVolta, 0.8, 0.00001);
console.log(`\n${ok}/${ok+f} · ${f===0?"sem falhas":f+" FALHA(S)"}\n`);
process.exit(f?1:0);
