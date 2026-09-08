// =====================================================================
// FICHAS DE CONFRONTO — o formato que a prova mais cobra: dois (ou três)
// conceitos parecidos lado a lado, na linha em que eles se separam.
// Os dados vêm dos resumos já validados; nada aqui é conteúdo novo, é
// a mesma matéria reorganizada para o contraste ficar visível.
//
// TABELÃO — todos os números decorados da prova numa folha só, para a
// última semana de estudo.
// =====================================================================
const CONFRONTOS = [
  {
    id: "C.1",
    titulo: "PGBL × VGBL",
    onde: "2.5.1",
    colunas: ["PGBL", "VGBL"],
    linhas: [
      { c: "Dedução na declaração", v: ["Abate até 12% da renda bruta tributável", "Não abate nada"] },
      { c: "Modelo de declaração", v: ["Só compensa no COMPLETO", "Indicado no SIMPLIFICADO"] },
      { c: "IR na saída incide sobre", v: ["TODO o valor resgatado", "Só o RENDIMENTO"] },
      { c: "Perfil típico", v: ["Contribui para a previdência e declara completo", "Isento, autônomo ou já usou os 12%"] },
    ],
    armadilha: "A banca oferece PGBL a quem declara no simplificado. Sem o modelo completo, o benefício fiscal do PGBL simplesmente não existe — e ainda sobra a desvantagem de pagar IR sobre o total.",
  },
  {
    id: "C.2",
    titulo: "Ação ordinária × preferencial",
    onde: "2.2.3",
    colunas: ["ON (ordinária)", "PN (preferencial)"],
    linhas: [
      { c: "Direito a voto", v: ["Sim, vota nas assembleias", "Não vota, em regra"] },
      { c: "Preferência nos lucros", v: ["Não tem preferência", "Tem preferência no recebimento"] },
      { c: "Tag along por lei", v: ["Mínimo de 80% do valor pago ao controlador", "Só se o estatuto previr"] },
      { c: "Ganha voto quando", v: ["Já tem desde sempre", "Após 3 anos consecutivos sem dividendos"] },
    ],
    armadilha: "Duas trocas clássicas: dizer que a PN nunca vota (ela adquire o voto após 3 anos sem distribuição) e estender o tag along legal de 80% às preferenciais, que só o têm se o estatuto conceder.",
  },
  {
    id: "C.3",
    titulo: "CDB × LCI/LCA × CRI/CRA",
    onde: "2.1.3",
    colunas: ["CDB", "LCI/LCA", "CRI/CRA"],
    linhas: [
      { c: "Quem emite", v: ["Banco", "Banco", "Securitizadora"] },
      { c: "IR para pessoa física", v: ["Tabela regressiva", "ISENTO", "ISENTO"] },
      { c: "Cobertura do FGC", v: ["TEM", "TEM", "NÃO TEM"] },
      { c: "Lastro exigido", v: ["Livre", "Crédito imobiliário ou do agro", "Recebíveis imobiliários ou do agro"] },
    ],
    armadilha: "A pegadinha mora no cruzamento: o aluno associa 'isento' a 'seguro' e conclui que CRI e CRA têm FGC. Isenção e garantia são coisas independentes — o CRI é isento E desprotegido.",
  },
  {
    id: "C.4",
    titulo: "Tributável × exclusiva × isento",
    onde: "3.1.7",
    colunas: ["Tributável", "Exclusiva/definitiva", "Isento"],
    linhas: [
      { c: "Pagou imposto?", v: ["Paga no ajuste anual", "SIM, retido na fonte", "NÃO paga"] },
      { c: "Entra no ajuste anual?", v: ["Sim, é a base dele", "Não entra", "Não entra"] },
      { c: "Exemplos", v: ["Salário, aluguel, pró-labore", "CDB, título público, fundos", "Poupança, LCI, LCA, debênture incentivada"] },
    ],
    armadilha: "Tratar 'exclusiva' como sinônimo de 'isento'. Na exclusiva o imposto foi pago e encerrado na fonte; no isento não houve imposto nenhum. As duas ficam fora do ajuste, e é justamente isso que confunde.",
  },
  {
    id: "C.5",
    titulo: "Fundo aberto × fechado",
    onde: "2.4",
    colunas: ["Aberto", "Fechado"],
    linhas: [
      { c: "Número de cotas", v: ["Varia com aplicações e resgates", "Fixo, definido na emissão"] },
      { c: "Como o cotista sai", v: ["Resgata no próprio fundo", "Vende as cotas a outro investidor"] },
      { c: "Liquidez", v: ["Conforme o prazo do regulamento", "Depende de achar comprador no mercado"] },
      { c: "Exemplos típicos", v: ["Renda fixa, multimercado, ETF", "FII, FIP, boa parte dos FIDC"] },
    ],
    armadilha: "Dizer que fundo fechado é ilíquido por natureza. Ele não tem RESGATE, o que é diferente: um FII muito negociado pode ter liquidez alta no secundário.",
  },
  {
    id: "C.6",
    titulo: "Curto prazo × longo prazo (fundos)",
    onde: "2.4.10",
    colunas: ["Curto prazo", "Longo prazo"],
    linhas: [
      { c: "Prazo médio da carteira", v: ["Até 365 dias", "Superior a 365 dias"] },
      { c: "Faixas de IR", v: ["Até 180 dias 22,5% · acima de 180 dias 20%", "22,5% · 20% · 17,5% · 15%"] },
      { c: "Alíquota mínima", v: ["Para em 20%, por mais que espere", "Chega a 15% acima de 720 dias"] },
      { c: "Come-cotas", v: ["20% em maio e novembro", "15% em maio e novembro"] },
    ],
    armadilha: "Aplicar 15% num multimercado de curto prazo mantido por três anos. Na tabela de curto prazo só existem duas faixas: tempo não compra desconto abaixo dos 20%.",
  },
  {
    id: "C.7",
    titulo: "Investidor qualificado × profissional",
    onde: "3.2.3",
    colunas: ["Qualificado", "Profissional"],
    linhas: [
      { c: "Patrimônio investido", v: ["Acima de R$ 1 milhão", "Acima de R$ 10 milhões"] },
      { c: "Atestado", v: ["Anexo B, por escrito", "Anexo A, por escrito"] },
      { c: "Quem é por enquadramento", v: ["Certificados, quanto aos próprios recursos", "Bancos, seguradoras, fundos, previdência, não residentes"] },
      { c: "Relação entre as duas", v: ["Nem todo qualificado é profissional", "TODO profissional também é qualificado"] },
    ],
    armadilha: "Inverter a inclusão. Profissional é o subconjunto mais exigente: quem é profissional automaticamente também é qualificado, nunca o contrário.",
  },
  {
    id: "C.8",
    titulo: "SAC × Price",
    onde: "1.3.7",
    colunas: ["SAC", "Price"],
    linhas: [
      { c: "Amortização", v: ["CONSTANTE (dívida ÷ nº de parcelas)", "Crescente ao longo do contrato"] },
      { c: "Prestação", v: ["Decrescente: começa alta e cai", "FIXA do começo ao fim"] },
      { c: "Juros", v: ["Caem junto com o saldo devedor", "Altos no início, caem depois"] },
      { c: "Total de juros pago", v: ["Menor", "Maior"] },
    ],
    armadilha: "Confundir o que é constante em cada sistema: no SAC o constante é a AMORTIZAÇÃO; na Price é a PRESTAÇÃO. Trocar isso derruba a questão inteira de cálculo.",
  },
  {
    id: "C.9",
    titulo: "Dividendo × JCP",
    onde: "2.2.10.1",
    colunas: ["Dividendo", "JCP"],
    linhas: [
      { c: "Natureza para a empresa", v: ["Distribuição de lucro", "DESPESA financeira: abate o IR da empresa"] },
      { c: "IR do investidor (2026)", v: ["Isento até R$ 50 mil/mês por empresa", "17,5% retidos na fonte, sempre"] },
      { c: "Acima do limite", v: ["10% sobre TODO o valor daquela empresa", "Não há limite: incide sobre tudo"] },
      { c: "O teto acumula entre empresas?", v: ["NÃO: é por empresa, por mês", "Não se aplica"] },
    ],
    armadilha: "Somar dividendos de empresas diferentes para comparar com o teto (o limite é por empresa) e aplicar os 10% só sobre o excedente (incidem sobre o valor inteiro).",
  },
  {
    id: "C.10",
    titulo: "Swing trade × day trade",
    onde: "2.2.10",
    colunas: ["Swing trade", "Day trade"],
    linhas: [
      { c: "Definição", v: ["Compra e venda em dias diferentes", "Compra e venda no MESMO dia"] },
      { c: "Alíquota de IR", v: ["15% sobre o lucro", "20% sobre o lucro"] },
      { c: "Isenção mensal", v: ["Vendas até R$ 20 mil no mês", "NÃO tem isenção"] },
      { c: "Compensação de prejuízo", v: ["Só com swing trade", "Só com day trade"] },
    ],
    armadilha: "Estender a isenção de R$ 20 mil ao day trade — ela não existe lá — e compensar prejuízo de day trade com lucro de swing: a compensação só vale entre operações da mesma natureza.",
  },
  {
    id: "C.11",
    titulo: "Progressiva × regressiva (previdência)",
    onde: "2.5.5",
    colunas: ["Progressiva (compensável)", "Regressiva (definitiva)"],
    linhas: [
      { c: "O que define a alíquota", v: ["O VALOR recebido", "O TEMPO no plano"] },
      { c: "Faixas", v: ["Mesma tabela do salário", "35% caindo até 10% acima de 10 anos"] },
      { c: "Ajuste na declaração", v: ["Sim: 15% na fonte e acerta depois", "Não: é definitiva na fonte"] },
      { c: "Indicada para", v: ["Resgate próximo ou renda mensal baixa", "Acumulação de longo prazo"] },
    ],
    armadilha: "Achar que a regressiva é sempre melhor. Para quem vai resgatar em pouco tempo, os 35% da regressiva batem muito acima da progressiva.",
  },
  {
    id: "C.12",
    titulo: "CMN × BC × CVM",
    onde: "1.2",
    colunas: ["CMN", "Banco Central", "CVM"],
    linhas: [
      { c: "Papel", v: ["NORMATIVO: cria as regras", "SUPERVISOR e executor", "Regula o mercado de CAPITAIS"] },
      { c: "Composição", v: ["3 membros", "Presidente + 8 diretores", "Presidente + 4 diretores"] },
      { c: "Cuida de", v: ["Diretrizes de moeda e crédito", "Bancos, meio circulante, Selic", "Bolsa, fundos, companhias abertas"] },
      { c: "Executa política monetária?", v: ["Não: só define diretrizes", "SIM, via Copom", "Não"] },
    ],
    armadilha: "A troca de atribuições entre BC e CVM (tarifa de conta é BC; oferta de ações é CVM) e a confusão de estrutura: BC é 1+8, CVM é 1+4.",
  },
  {
    id: "C.13",
    titulo: "Score × rating",
    onde: "2.6.1",
    colunas: ["Score", "Rating"],
    linhas: [
      { c: "Sobre quem", v: ["Pessoa física, pelo birô de crédito", "Empresas, bancos e países"] },
      { c: "Quem calcula", v: ["Birôs, a partir do histórico", "Agências classificadoras de risco"] },
      { c: "Serve para", v: ["Decidir crédito no varejo", "Precificar risco de emissores e títulos"] },
    ],
    armadilha: "Inverter os dois na hora de associar. O macete é o idioma: rating é nota de emissor no mercado; score é a nota do cliente no balcão.",
  },
  {
    id: "C.15",
    titulo: "Manipulação × Informação privilegiada × Sem registro",
    onde: "3.4.6",
    colunas: ["Manipulação", "Informação privilegiada", "Exercício irregular"],
    linhas: [
      { c: "Pena", v: ["RECLUSÃO de 1 a 8 anos", "RECLUSÃO de 1 a 5 anos", "DETENÇÃO de 6 a 24 meses"] },
      { c: "Multa", v: ["Até 3× a vantagem obtida", "Até 3× a vantagem obtida", "Multa, sem múltiplo definido"] },
      { c: "O que é", v: ["Operações simuladas para mexer no preço", "Negociar com informação relevante não divulgada", "Atuar sem registro, ainda que de graça"] },
      { c: "O que se enquadra", v: ["Condição artificial, manipulação de preço, operação fraudulenta", "Prática não equitativa", "Administrador, assessor, auditor, analista, agente fiduciário"] },
    ],
    armadilha: "Duas trocas: dar reclusão ao exercício irregular, que é o único de DETENÇÃO, e inverter as faixas de 8 e 5 anos. O macete é 8-5-2: manipulação até 8 anos, informação até 5, exercício irregular até 24 meses. E a lavagem, que é de 3 a 10, não pertence a esse grupo.",
  },
  {
    id: "C.14",
    titulo: "Prêmio × indenização × franquia",
    onde: "2.8.1",
    colunas: ["Prêmio", "Indenização", "Franquia"],
    linhas: [
      { c: "Quem paga", v: ["O SEGURADO paga à seguradora", "A SEGURADORA paga ao segurado", "O segurado absorve"] },
      { c: "Quando", v: ["Na contratação e nas renovações", "Quando ocorre o sinistro coberto", "No momento do sinistro"] },
      { c: "Natureza", v: ["Preço da proteção", "Reparação do prejuízo", "Parte do prejuízo que fica com o segurado"] },
    ],
    armadilha: "Trocar prêmio por indenização é o erro mais comum do módulo. Prêmio é o que ENTRA na seguradora; indenização é o que SAI dela.",
  },
];

const TABELAO = [
  {
    tema: "IR em renda fixa e fundos de longo prazo",
    itens: [
      ["Até 180 dias", "22,5%"],
      ["De 181 a 360 dias", "20%"],
      ["De 361 a 720 dias", "17,5%"],
      ["Acima de 720 dias", "15%"],
    ],
  },
  {
    tema: "IR em fundos de curto prazo",
    itens: [
      ["Até 180 dias", "22,5%"],
      ["Acima de 180 dias", "20% (piso: não desce mais)"],
      ["Prazo médio da carteira", "até 365 dias = curto prazo"],
    ],
  },
  {
    tema: "Come-cotas",
    itens: [
      ["Quando", "último dia útil de MAIO e NOVEMBRO"],
      ["Fundo de longo prazo", "15%"],
      ["Fundo de curto prazo", "20%"],
      ["Fundo de ações", "NÃO tem come-cotas"],
    ],
  },
  {
    tema: "IOF regressivo",
    itens: [
      ["Incide em resgates com", "menos de 30 dias"],
      ["Cobrança", "1% ao dia, limitada à tabela sobre o rendimento"],
      ["A partir do 30º dia", "alíquota ZERO"],
      ["Ordem de cobrança", "IOF primeiro, IR depois"],
    ],
  },
  {
    tema: "Renda variável",
    itens: [
      ["Swing trade", "15% sobre o lucro"],
      ["Day trade", "20% sobre o lucro"],
      ["Isenção PF (só swing)", "vendas até R$ 20 mil no mês"],
      ["Dividendos (2026)", "isentos até R$ 50 mil/mês por empresa; acima, 10% sobre tudo"],
      ["JCP", "17,5% retidos na fonte, sem teto"],
      ["Tag along legal (ON)", "mínimo de 80%"],
      ["Dividendo mínimo da PN eletiva", "25% do lucro líquido"],
      ["PN ganha voto após", "3 anos consecutivos sem dividendos"],
    ],
  },
  {
    tema: "Previdência — tabela regressiva",
    itens: [
      ["Até 2 anos", "35%"],
      ["De 2 a 4 anos", "30%"],
      ["De 4 a 6 anos", "25%"],
      ["De 6 a 8 anos", "20%"],
      ["De 8 a 10 anos", "15%"],
      ["Acima de 10 anos", "10%"],
      ["Dedução do PGBL", "até 12% da renda bruta tributável"],
      ["Carência de resgate no diferimento", "60 dias"],
    ],
  },
  {
    tema: "FGC",
    itens: [
      ["Por CPF/CNPJ por instituição", "R$ 250 mil"],
      ["Teto global", "R$ 1 milhão"],
      ["Renovação do teto", "a cada 4 anos"],
      ["Conta conjunta", "R$ 250 mil dividida entre os titulares"],
      ["Cobre", "só recursos em BANCOS (CDB, LCI, LCA, poupança)"],
      ["NÃO cobre", "CRI, CRA, debênture, LF, fundos"],
    ],
  },
  {
    tema: "Classificação do investidor",
    itens: [
      ["Qualificado", "acima de R$ 1 milhão + atestado (Anexo B)"],
      ["Profissional", "acima de R$ 10 milhões + atestado (Anexo A)"],
      ["Regra de ouro", "todo profissional é qualificado; o inverso, não"],
    ],
  },
  {
    tema: "PLDFT",
    itens: [
      ["Registro do portador", "operações em espécie a partir de R$ 2 mil"],
      ["Portador e proprietário", "a partir de R$ 50 mil"],
      ["Saque igual ou acima de R$ 50 mil", "provisionamento com 3 dias úteis"],
      ["Comunicação ao COAF", "suspeita de QUALQUER valor, sem piso"],
    ],
  },
  {
    tema: "Penas criminais — decore o trio 10-8-5",
    itens: [
      ["Lavagem de dinheiro", "RECLUSÃO de 3 a 10 anos + multa"],
      ["Manipulação de mercado", "RECLUSÃO de 1 a 8 anos + multa até 3× a vantagem"],
      ["Uso indevido de informação privilegiada", "RECLUSÃO de 1 a 5 anos + multa até 3× a vantagem"],
      ["Exercício irregular de cargo (sem registro)", "DETENÇÃO de 6 a 24 meses + multa"],
      ["Violação de sigilo bancário", "RECLUSÃO de 1 a 4 anos + multa"],
      ["A única que é DETENÇÃO", "exercício irregular; as demais são reclusão"],
      ["Lavagem: pena aumentada", "de 1 a 2/3 (reiteração, organização criminosa, ativos virtuais)"],
      ["Lavagem: pena reduzida", "de 1 a 2/3 se houver colaboração"],
      ["Omissão imprópria", "quem devia evitar e se omitiu responde pela MESMA pena"],
    ],
  },
  {
    tema: "Multas e sanções administrativas — 20 × 50 milhões",
    itens: [
      ["PLDFT (instituição que descumpre)", "dobro do lucro, teto de R$ 20 milhões"],
      ["PLDFT: inabilitação", "até 10 anos para cargo de administrador"],
      ["LGPD", "até 2% do faturamento, teto de R$ 50 milhões POR INFRAÇÃO"],
      ["Prática não equitativa (CVM)", "dobro da operação, teto de R$ 50 milhões"],
      ["Prática não equitativa: inabilitação", "até 20 anos (e proibição de distribuir por até 20)"],
      ["Prática não equitativa: proibição de operar", "até 10 anos"],
      ["Multa CRIMINAL da lavagem", "sem teto legal — quem fixa é o juiz"],
    ],
  },
  {
    tema: "Curto prazo: dois critérios diferentes",
    itens: [
      ["Curto prazo pela RECEITA (imposto)", "prazo médio da carteira até 365 dias"],
      ["Curto prazo pela CVM (tipo de fundo)", "prazo médio até 60 dias E título até 375 dias"],
      ["Por que confunde", "um define a alíquota, o outro define a classificação do fundo"],
    ],
  },
  {
    tema: "Composição de fundos — os percentuais mínimos",
    itens: [
      ["Ações", "no mínimo 67% do PL em ativos de renda variável"],
      ["Referenciado", "no mínimo 95% em ativos ligados ao indexador da cota"],
      ["Simples", "no mínimo 95% em títulos públicos federais ou risco equivalente"],
      ["Dívida externa", "no mínimo 80% em títulos do governo emitidos fora do país"],
      ["Crédito privado", "mais de 50% do PL em emissor empresa (inclui banco)"],
      ["Único que dispensa termo de adesão", "o SIMPLES"],
      ["Taxa de performance: apuração mínima", "a cada 180 dias, só em fundo ativo, acima de 100% do benchmark"],
    ],
  },
  {
    tema: "Prazos mínimos e carências",
    itens: [
      ["LCI e LCA", "6 meses de prazo mínimo"],
      ["LCD", "12 meses, e o emissor é banco de DESENVOLVIMENTO"],
      ["Previdência: carência de resgate", "60 dias no diferimento"],
      ["Tesouro Direto: resgate antecipado do Educa+ e Renda+", "só 60 dias após a compra"],
      ["Reunião do Copom", "a cada 45 dias, 8 vezes por ano"],
      ["Meta de inflação descumprida", "6 meses consecutivos = carta aberta ao Ministro da Fazenda"],
    ],
  },
  {
    tema: "Câmbio — a escada dos limites por operação",
    itens: [
      ["Bancos comerciais, de investimento e Caixa", "SEM limite de valor"],
      ["Corretoras, DTVM, agências de fomento e financeiras", "US$ 500.000"],
      ["Instituições de pagamento", "US$ 100.000"],
      ["VET", "custo total da operação; divulgação obrigatória (é o CET do câmbio)"],
    ],
  },
  {
    tema: "Tesouro Educa+ × Renda+",
    itens: [
      ["Educa+: duração da renda", "60 meses (5 anos)"],
      ["Renda+: duração da renda", "240 meses (20 anos)"],
      ["Educa+: custódia zerada até", "4 salários mínimos"],
      ["Renda+: custódia zerada até", "6 salários mínimos"],
      ["Taxa de custódia da B3", "0,20% ao ano; isenta até R$ 10 mil só na LFT"],
    ],
  },
  {
    tema: "Metas de inflação",
    itens: [
      ["Quem define a meta", "CMN"],
      ["Quem cumpre", "Banco Central, via Selic"],
      ["Quem mede", "IBGE, pelo IPCA"],
      ["Exemplo do material", "meta 3% com tolerância de 1,5 p.p. → banda de 1,5% a 4,5%"],
      ["Desde janeiro de 2025", "meta CONTÍNUA, avaliada pelo acumulado em 12 meses"],
    ],
  },
  {
    tema: "Estruturas e órgãos",
    itens: [
      ["CMN", "3 membros, órgão normativo máximo"],
      ["Banco Central", "presidente + 8 diretores"],
      ["CVM", "presidente + 4 diretores"],
      ["Copom", "define a Selic a cada 45 dias"],
      ["Selic Over", "cerca de 0,10 p.p. abaixo da Meta"],
    ],
  },
  {
    tema: "Indicadores",
    itens: [
      ["IPCA", "IBGE, famílias de 1 a 40 salários mínimos"],
      ["INPC", "IBGE, faixa de renda mais baixa"],
      ["IGP-M", "FGV: 60% IPA + 30% IPC + 10% INCC"],
      ["Poupança (Selic acima de 8,5%)", "0,5% ao mês + TR"],
      ["Poupança (Selic até 8,5%)", "70% da Selic + TR"],
    ],
  },
  {
    tema: "Tesouro Direto e crédito",
    itens: [
      ["Compra mínima", "0,01 do título (1%)"],
      ["Limite mensal", "R$ 2 milhões"],
      ["Resgate até as 13h", "paga em D0; após as 13h, D+1"],
      ["Cheque especial", "teto de 8% ao mês, juros simples, só sobre o usado"],
      ["Prova de aprovação (CPA)", "70% de acertos, 2h30 de duração"],
    ],
  },
];
