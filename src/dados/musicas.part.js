// =====================================================================
// CANTIGAS MNEMÔNICAS — melodias ORIGINAIS, curtas e repetitivas, feitas
// para grudar os números que a prova cobra de cor.
//
// Notação: cada linha tem a letra (l) e a melodia (n). Na melodia, cada
// token é uma nota — "C4" dura uma colcheia; "C4*2" dura o dobro; "-" é
// pausa. O tocador destaca a linha inteira enquanto ela soa, então a
// contagem de notas só precisa ficar PERTO do número de sílabas, não
// exata. Faixa vocal proposital entre C4 e D5: cabe em quase toda voz.
//
// Regra: nenhum número entra aqui sem estar no conteúdo já validado do
// app. O verificar.js confere isso.
// =====================================================================
const MUSICAS = [
  {
    id: "M.1",
    titulo: "A escada do imposto",
    tema: "IR regressivo em renda fixa",
    bpm: 100,
    dica: "Cada degrau desce 2,5 pontos. Se lembrar disso, monta a tabela inteira sem decorar linha por linha.",
    linhas: [
      { l: "Vinte e dois e meio até cento e oitenta", n: "G4 G4 A4 G4 E4 G4 A4 A4 G4 E4 D4*2" },
      { l: "Vinte por cento até trezentos e sessenta", n: "G4 G4 A4 G4 E4 G4 A4 A4 G4 E4 C4*2" },
      { l: "Dezessete e meio até setecentos e vinte", n: "C5 C5 B4 A4 G4 A4 B4 B4 A4 G4 E4*2" },
      { l: "E acima disso, quinze para sempre", n: "G4 A4 B4 C5 B4 A4 G4 F4 E4 D4 C4*3" },
      { l: "Desce dois e meio a cada degrau", n: "E4 E4 F4 G4 G4 F4 E4 D4 C4*2" },
      { l: "Quatro faixas, e o fim é quinze", n: "E4 F4 G4 A4 G4 F4 E4 D4 C4*3" },
    ],
  },
  {
    id: "M.2",
    titulo: "De dois em dois, cai cinco",
    tema: "Tabela regressiva da previdência",
    bpm: 108,
    dica: "A régua da previdência anda de 2 em 2 anos e cai 5 pontos por degrau, de 35% até 10%.",
    linhas: [
      { l: "Até dois anos, trinta e cinco", n: "C4 D4 E4 E4 G4 G4 F4 E4*2" },
      { l: "De dois a quatro, trinta", n: "C4 D4 E4 E4 G4 F4 E4*2" },
      { l: "De quatro a seis, vinte e cinco", n: "E4 F4 G4 G4 A4 A4 G4 F4*2" },
      { l: "De seis a oito, vinte", n: "E4 F4 G4 G4 A4 G4 F4*2" },
      { l: "De oito a dez, quinze", n: "G4 A4 B4 B4 C5 B4 A4*2" },
      { l: "Mais de dez anos, dez por cento", n: "C5 B4 A4 G4 F4 E4 D4 C4*3" },
      { l: "De dois em dois anos, cai cinco", n: "E4 E4 D4 E4 F4 F4 E4 D4 C4*3" },
    ],
  },
  {
    id: "M.3",
    titulo: "Duzentos e cinquenta",
    tema: "FGC: limites e o que ele cobre",
    bpm: 96,
    dica: "O FGC é do BANCO. Papel de securitizadora (CRI, CRA) e debênture ficam de fora, mesmo sendo isentos.",
    linhas: [
      { l: "Duzentos e cinquenta mil por CPF", n: "C4 D4 E4 G4 G4 A4 G4 E4 D4 C4*2" },
      { l: "Em cada banco, é esse o teto", n: "E4 F4 G4 G4 F4 E4 D4 C4*2" },
      { l: "Um milhão somando tudo", n: "G4 G4 A4 C5 B4 A4 G4*2" },
      { l: "E a cada quatro anos, renova", n: "G4 A4 B4 C5 B4 A4 G4 E4 D4*2" },
      { l: "Banco tem FGC: CDB, LCI, poupança", n: "C5 C5 B4 A4 G4 G4 A4 B4 C5 B4 A4 G4*2" },
      { l: "CRI, CRA e debênture, não!", n: "E4 E4 F4 G4 A4 G4 F4 E4 C4*3" },
    ],
  },
  {
    id: "M.4",
    titulo: "Maio e novembro",
    tema: "Come-cotas",
    bpm: 104,
    dica: "O come-cotas leva COTA, não dinheiro, e sempre na alíquota menor da faixa do fundo.",
    linhas: [
      { l: "Maio e novembro, último dia útil", n: "G4 G4 E4 G4 A4 G4 E4 D4 C4 D4 E4*2" },
      { l: "O leão come cota, não come o seu dinheiro", n: "E4 E4 F4 G4 G4 F4 E4 D4 E4 F4 G4 E4*2" },
      { l: "Longo prazo, quinze; curto prazo, vinte", n: "C5 C5 A4 A4 G4 G4 B4 B4 A4 G4 E4*2" },
      { l: "E fundo de ações não tem come-cotas", n: "G4 A4 B4 C5 B4 A4 G4 F4 E4 D4 C4*3" },
    ],
  },
  {
    id: "M.5",
    titulo: "Sessenta, trinta, dez",
    tema: "Índices de inflação e quem calcula",
    bpm: 100,
    dica: "IPCA é do IBGE e mede a prateleira; IGP-M é da FGV e o atacado manda nele com 60%.",
    linhas: [
      { l: "IPCA é do IBGE, o oficial", n: "C4 E4 G4 G4 A4 G4 E4 D4 C4*2" },
      { l: "De um a quarenta salários mínimos", n: "E4 F4 G4 G4 A4 G4 F4 E4 D4 C4*2" },
      { l: "IGP-M é da FGV", n: "G4 A4 B4 C5 B4 A4 G4*2" },
      { l: "Sessenta, trinta, dez: e o IPA que manda", n: "C5 C5 B4 A4 G4 A4 B4 C5 B4 A4 G4*2" },
      { l: "Sessenta é atacado, trinta é consumidor", n: "E4 F4 G4 A4 G4 F4 E4 F4 G4 A4 G4 E4*2" },
      { l: "Dez é construção, e o cálculo acabou", n: "G4 F4 E4 D4 E4 F4 G4 F4 E4 D4 C4*3" },
    ],
  },
  {
    id: "M.6",
    titulo: "Suspeita não tem piso",
    tema: "PLDFT: registros e comunicação",
    bpm: 112,
    dica: "Valores acionam REGISTRO; suspeita aciona COMUNICAÇÃO. São gatilhos diferentes, e a banca mistura os dois.",
    linhas: [
      { l: "Dois mil em espécie: registra o portador", n: "C4 D4 E4 E4 G4 G4 A4 G4 E4 D4 C4*2" },
      { l: "Cinquenta mil: portador e proprietário", n: "E4 F4 G4 G4 A4 A4 G4 F4 E4 D4 C4*2" },
      { l: "Saque de cinquenta mil, três dias úteis", n: "G4 A4 B4 C5 B4 A4 G4 A4 B4 G4*2" },
      { l: "Mas a suspeita não tem piso: vai ao COAF", n: "C5 B4 A4 G4 A4 B4 C5 B4 A4 G4 E4*3" },
      { l: "Colocação, ocultação, integração", n: "E4 E4 F4 G4 G4 G4 A4 B4 C5 B4 A4 G4*2" },
      { l: "Três fases da lavagem, nessa ordem", n: "G4 F4 E4 D4 E4 F4 E4 D4 C4*3" },
    ],
  },
  {
    id: "M.7",
    titulo: "Quinze, vinte, vinte mil",
    tema: "Renda variável: alíquotas e isenções",
    bpm: 106,
    dica: "Isenção de 20 mil no mês existe só no swing trade. Day trade não tem isenção nenhuma.",
    linhas: [
      { l: "Swing trade quinze, day trade vinte", n: "G4 G4 A4 G4 E4 G4 A4 G4 E4*2" },
      { l: "Vinte mil no mês, isento só no swing", n: "E4 F4 G4 A4 G4 F4 E4 D4 E4 C4*2" },
      { l: "Dividendo isento até cinquenta mil", n: "C5 C5 B4 A4 G4 A4 B4 C5 A4 G4*2" },
      { l: "Passou disso, dez por cento sobre tudo", n: "G4 A4 B4 C5 B4 A4 G4 F4 E4 D4*2" },
      { l: "E o JCP não escapa: dezessete e meio", n: "E4 E4 F4 G4 A4 G4 F4 E4 D4 E4 C4*3" },
    ],
  },
];
