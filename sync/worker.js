/**
 * Serviço de sincronia do Projeto CPA — Cloudflare Worker.
 *
 * Guarda o progresso do estudo numa chave-valor, para o iPhone e o
 * computador enxergarem o mesmo estado. É deliberadamente burro: recebe
 * o JSON, guarda, devolve. Toda a inteligência de qual versão vale
 * (a mais recente) fica no app.
 *
 * Como publicar: veja sync/COMO-CONFIGURAR.md (leva ~3 minutos).
 * Precisa de um KV Namespace ligado ao worker com o nome PROGRESSO.
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Max-Age": "86400",
};
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...CORS, "content-type": "application/json" } });

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(req.url);
    const codigo = (url.searchParams.get("c") || "").trim();

    // o código é a senha do cofre: curto demais, recusa
    if (codigo.length < 12 || codigo.length > 100 || !/^[A-Za-z0-9._-]+$/.test(codigo)) {
      return json({ erro: "codigo invalido" }, 400);
    }
    const chave = "cpa:" + codigo;

    if (req.method === "GET") {
      const guardado = await env.PROGRESSO.get(chave);
      if (!guardado) return json({ vazio: true });
      try { return json(JSON.parse(guardado)); } catch (e) { return json({ vazio: true }); }
    }

    if (req.method === "PUT") {
      const corpo = await req.text();
      if (corpo.length > 300000) return json({ erro: "grande demais" }, 413);
      let dados;
      try { dados = JSON.parse(corpo); } catch (e) { return json({ erro: "json invalido" }, 400); }
      if (typeof dados !== "object" || dados === null) return json({ erro: "json invalido" }, 400);
      dados.quando = dados.quando || Date.now();
      await env.PROGRESSO.put(chave, JSON.stringify(dados));
      return json({ ok: true, quando: dados.quando });
    }

    return json({ erro: "metodo nao suportado" }, 405);
  },
};
