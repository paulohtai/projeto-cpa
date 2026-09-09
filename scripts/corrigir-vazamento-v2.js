#!/usr/bin/env node
/**
 * corrigir-vazamento-v2.js — reescreve as questões em que o enunciado
 * entregava a resposta, apontadas pelo conferir-vazamento.js.
 *
 * Uso: node scripts/corrigir-vazamento-v2.js [--conferir]
 *
 * ------------------------------------------------------------------
 * O QUE ESTE SCRIPT PODE E NÃO PODE FAZER
 * ------------------------------------------------------------------
 * NENHUMA troca aqui muda qual alternativa é a correta. O índice `c` de
 * nenhuma questão é tocado. O que muda é o TEXTO do enunciado (tirando dele a
 * definição que o gabarito repetia) e, em cinco casos, o TEXTO da justificativa
 * do gabarito ou de um distrator — nunca a sua posição.
 *
 * Isso importa porque o Paulo já tem tentativas de exame gravadas. O código de
 * backup guarda a chave da questão e o gabarito da época; recalcular nota a
 * partir do banco novo seria reescrever prova antiga. Como o índice não muda,
 * nada nas tentativas dele se desloca.
 *
 * ------------------------------------------------------------------
 * OS DOIS PADRÕES DE DEFEITO
 * ------------------------------------------------------------------
 * P1 · O ENUNCIADO EXPLICA DEMAIS. O personagem "lembra" a definição do
 *      conceito e a pergunta pede justamente essa definição. Vira leitura, não
 *      conhecimento. Correção: cortar a definição e deixar só a cena.
 *
 * P2 · O GABARITO ECOA O ENUNCIADO. A justificativa depois da vírgula é uma
 *      paráfrase da última frase da cena, e é a única alternativa que repete
 *      aquelas palavras. Correção: a justificativa passa a ACRESCENTAR
 *      informação (um limite, uma norma, uma consequência) em vez de repetir.
 *
 * Em oito casos apareceu junto um terceiro defeito, o de eliminação por
 * exaustão: o enunciado descartava explicitamente um ou dois distratores
 * ("um diretor citou R$ 20 milhões, que pertence a outra sanção"). Esses
 * trechos saíram também.
 */
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");

// [ref, de, para] — `de` tem de casar UMA vez só em todo o src/dados.
const TROCAS = [

  // ---------- MÓDULO 1 ----------

  // P1: o enunciado definia "emprestador de última instância" e o gabarito
  // repetia "crédito de última instância". Sobrou a cena: banco sem caixa,
  // interbancário fechado, corre para o BC.
  ["1.1|13|1",
    "a instituição recorreu à autoridade monetária, que atua como emprestadora de última instância e concede crédito de curtíssimo prazo para cobrir necessidades emergenciais de caixa. O instrumento acionado",
    "a instituição recorreu diretamente à autoridade monetária, antes do fechamento do sistema de liquidação. O instrumento acionado"],

  // P1 agravado: Luciana "lembrava" quem apura cada índice, na mesma ordem da
  // resposta. Era uma questão de copiar três nomes da própria cena.
  ["1.1|BOSS|3",
    "Ela lembrou que o índice oficial de inflação do país, usado no sistema de metas, é apurado pelo instituto federal de estatística, que o índice geral de preços de mercado é calculado por uma fundação privada de pesquisa econômica, e que a taxa média dos depósitos interfinanceiros é divulgada pela bolsa brasileira. Calculam",
    "Ela sabia que creditar um indicador à instituição errada comprometeria a credibilidade do informativo inteiro, e conferiu a autoria de cada um antes de publicar. Calculam"],

  // P1 no limite: o supervisor recitava as quatro definições certas e depois
  // pedia a associação correta. A resposta estava inteira no enunciado.
  ["1.1|BOSS|7",
    "Ele lembrou que o compulsório é a parcela dos depósitos retida no Banco Central, que o redesconto é o socorro de liquidez de última instância, que o open market envolve leilões de títulos públicos com os dealers e que a Selic Over é apurada no mercado, enquanto o Copom define a Selic Meta. A associação correta é:",
    "Ele avisou que havia trocado de propósito o nome de alguns instrumentos pela definição de outros, e que só uma das linhas do quadro sobreviveria à conferência. A associação correta é:"],

  // P1: "a definição do alvo numérico cabe ao colegiado normativo" é o
  // gabarito escrito por extenso. Fica a régua geral (quem normatiza x quem
  // executa), que não aponta para nenhuma alternativa específica.
  ["1.2|3|2",
    "Otacílio esclareceu que o Banco Central conduz a política monetária, guarda as reservas oficiais e administra os sistemas de pagamentos, mas que a definição do alvo numérico cabe ao colegiado normativo do sistema. Entre as competências",
    "Otacílio esclareceu que a divisão de tarefas no sistema separa quem fixa as diretrizes de quem as executa no dia a dia, e que o erro do cliente estava em juntar as duas pontas. Entre as competências",
  ],

  // P1: Solange já respondia ("equiparou as duas figuras") antes da pergunta.
  ["1.2|7|3",
    "Solange explicou que a distinção existia no passado, quando a atuação das distribuidoras era mais restrita, mas que decisão conjunta do Banco Central e da CVM equiparou as duas figuras quanto à intermediação. Sobre CTVM e DTVM",
    "Solange explicou que a resposta depende de uma decisão conjunta do Banco Central e da CVM sobre o alcance da atuação das distribuidoras, tomada anos depois de a distinção original ter sido criada. Sobre CTVM e DTVM"],

  // P1 sutil: o discriminante entre a alternativa certa e a 2 é "dirigida ao
  // quadro de associados" — e o enunciado dizia exatamente isso.
  ["1.2|7|4",
    "vota nas assembleias e participa das sobras apuradas no exercício, e que o atendimento é dirigido a esse quadro social. Nessas condições",
    "vota nas assembleias e participa das sobras apuradas no exercício. Nessas condições"],

  // Exaustão: a fala do participante descartava o distrator 0 (6,00 semestres)
  // antes de o aluno fazer qualquer conta.
  ["1.3|10|3",
    "Um participante respondeu que o resultado seria igual ao prazo de vencimento. Ronaldo refez a conta no quadro. Nesse exemplo",
    "Ronaldo pediu que cada um fechasse a própria conta antes de olhar as opções. Nesse exemplo"],

  // Exaustão: o enunciado dizia que o mercado institucional fica "em um
  // sistema mantido pelo Banco Central", eliminando o Selic de graça.
  ["1.4|2|1",
    "explicou que os títulos são escriturais e que a guarda depende do ambiente de negociação: as operações do mercado institucional, entre bancos e fundos, ficam em um sistema mantido pelo Banco Central, enquanto as compras feitas por pessoas físicas na plataforma do Tesouro têm custódia e liquidação em outra estrutura. No caso de Ubirajara",
    "explicou que os títulos são escriturais e que a guarda depende do ambiente em que a compra foi feita, e não do papel adquirido. No caso de Ubirajara"],

  // P1: Sidney definia risco sistêmico ("contaminar as demais, efeito dominó")
  // e a pergunta era "risco sistêmico pode ser definido como".
  ["1.4|3|4",
    "Sidney explicou que a preocupação não era a perda de um investidor específico nem a oscilação de um título, mas a possibilidade de a dificuldade de uma instituição relevante contaminar as demais, em efeito dominó capaz de travar o crédito e os pagamentos. O risco sistêmico",
    "Sidney explicou que o que tirava o sono das autoridades não era o tamanho da perda de quem tinha dinheiro naquele banco, e sim o que viria depois dela. O risco sistêmico"],

  // O caso que o Paulo achou. Dois defeitos somados: exaustão (a frase
  // descartava os três distratores por nome) e vazamento literal (o enunciado
  // trazia "ressarce", "prejudicado" e "R$ 200 mil", que só reapareciam no
  // gabarito). Agora a cena descreve a SITUAÇÃO do investidor lesado sem
  // nomear o mecanismo nem repetir o valor — que passa a ser informação nova
  // trazida pela alternativa.
  ["1.4|BOSS|4",
    "Lembrou que o compulsório, as linhas financeiras de liquidez e o acordo de Basileia atuam sobre o conjunto do sistema financeiro, enquanto existe um mecanismo mantido pela bolsa que ressarce, em até R$ 200 mil, o cliente prejudicado por ação ou omissão de um participante na intermediação. O mecanismo",
    "Um aluno perguntou qual delas ele poderia acionar em nome próprio, sozinho, caso uma corretora deixasse de repassar o dinheiro de uma venda que ele havia ordenado. O mecanismo"],

  // ---------- MÓDULO 2 ----------

  // P1: Thiago entregava a justificativa do gabarito ("contrapartida do prazo
  // mínimo de carência") dentro do enunciado.
  ["2.1|9|3",
    "e que as letras de crédito recebem tratamento tributário distinto quando o investidor é pessoa física, justamente como contrapartida do prazo mínimo de carência exigido. Sobre a tributação da LCI",
    "e pediu que ela verificasse a regra aplicável às letras de crédito para a pessoa física antes de comparar os percentuais do CDI. Sobre a tributação da LCI"],

  // P1: Simone recitava as duas espécies com garantia, e a pergunta era só
  // apontar qual delas a escritura descrevia.
  ["2.1|11|1",
    "Simone lembrou que existe uma espécie em que o bem dado em garantia fica vinculado até a quitação, sem possibilidade de troca, e outra em que o credor tem privilégio geral sobre o ativo da companhia, com bens que podem ser substituídos ao longo do tempo. Nessas condições",
    "Simone pediu que ele olhasse um único detalhe da escritura — a faculdade de trocar os bens dados em garantia —, porque é ele que separa as duas espécies garantidas. Nessas condições"],

  // P1: "incentivo para atrair recursos ao financiamento dos setores
  // imobiliário e do agronegócio" era palavra por palavra o final do gabarito.
  ["2.1|12|4",
    "e que o CRI e o CRA receberam tratamento tributário diferenciado para a pessoa física, como incentivo para atrair recursos ao financiamento dos setores imobiliário e do agronegócio. Sobre a tributação do CRI",
    "e pediu que ela conferisse qual regra alcança os certificados de recebíveis quando o investidor é pessoa física. Sobre a tributação do CRI"],

  // P1: Gustavo enunciava o princípio ("avaliar a gestão dentro do mesmo
  // universo de risco") que a pergunta em seguida pedia.
  ["2.4|3|3",
    "O profissional CPA Gustavo Andrade explicou que o índice de referência de uma classe existe para permitir avaliar a gestão dentro do mesmo universo de risco, e que comparar uma carteira de ações com um indicador de juros de curto prazo distorce a leitura do resultado obtido. Sobre a escolha",
    "O profissional CPA Gustavo Andrade explicou que a conclusão do cliente nasceu de uma comparação que a própria escolha do índice de referência deveria ter impedido. Sobre a escolha"],

  // Exaustão: "quem negocia os ativos não é quem os precifica" eliminava o
  // gestor, que era o distrator mais forte.
  ["2.4|4|4",
    "explicou que existe separação de funções: quem negocia os ativos não é quem os precifica, justamente para evitar conflito de interesse na marcação e na divulgação do valor da cota aos cotistas. A responsabilidade",
    "explicou que a regulação distribui essas funções entre prestadores diferentes justamente para evitar conflito de interesse na marcação. A responsabilidade"],

  // P2: "linha d'água" aparecia no enunciado e só no gabarito. Agora um
  // distrator também usa o termo — e usa com um erro que gente de verdade
  // comete: achar que a marca é zerada a cada período de apuração.
  ["2.4|5|1",
    "haverá cobrança sobre a valorização de R$ 11,00 para R$ 11,90, pois o período apresentou rentabilidade positiva.",
    "haverá cobrança sobre a valorização de R$ 11,00 para R$ 11,90, pois a linha d'água é redefinida a cada período de apuração."],

  // P1: o enunciado descrevia a composição da carteira do fundo simples
  // ("títulos públicos pós-fixados ou risco equivalente ao do governo"), que
  // é o conteúdo do gabarito.
  ["2.4|8|1",
    "explicou que essa dispensa se justifica pelo perfil ultraconservador da carteira, concentrada em títulos públicos federais pós-fixados ou em ativos de emissores com risco de crédito equivalente ao do governo, com percentual mínimo elevado. A subcategoria",
    "explicou que a dispensa se justifica pelo perfil ultraconservador exigido daquela carteira, cuja composição mínima é fixada em norma. A subcategoria"],

  // Padrão delator: três das quatro alternativas terminavam dizendo que o
  // termo É exigido. Quem não soubesse nada marcaria a única que não dizia.
  ["2.4|8|1",
    "dívida externa, voltada a títulos da dívida soberana negociados fora do país, com assinatura do termo exigida.",
    "dívida externa, voltada a títulos representativos da dívida soberana brasileira negociados fora do país."],
  ["2.4|8|1",
    "curto prazo, cuja carteira observa prazo médio reduzido, mas exige a assinatura do termo pelo investidor.",
    "curto prazo, cuja carteira observa prazo médio ponderado reduzido, definido na norma da CVM."],
  ["2.4|8|1",
    "referenciada, que acompanha um indexador com percentual mínimo elevado, sem dispensa da assinatura do termo.",
    "referenciada, que persegue a variação de um indicador declarado no regulamento da classe."],

  // P1: "os dois produtos recebem tratamentos fiscais distintos" é a segunda
  // metade do gabarito.
  ["2.5|7|1",
    "O profissional explicou que a portabilidade tem regras próprias e que os dois produtos recebem tratamentos fiscais distintos no momento do resgate. Diante do pedido",
    "O profissional explicou que a portabilidade tem regras próprias, que não mudam conforme o modelo de declaração escolhido pelo cliente. Diante do pedido"],

  // P1: o enunciado listava patrimônio, renda, garantia, cenário e histórico —
  // as cinco palavras que só o gabarito repetia. Agora a cena diz apenas que
  // são cinco itens com a mesma inicial, e a tradução dos cinco Cs passa a ser
  // informação que a alternativa acrescenta.
  ["2.6|1|3",
    "Diego explicou que a análise segue um roteiro clássico de cinco itens, que reúne a situação patrimonial do tomador, a renda disponível para honrar as parcelas, a garantia vinculada ao contrato, o cenário econômico do setor em que ele atua e o histórico de honrar compromissos assumidos. Cada item recebe peso próprio conforme a modalidade contratada. Os cinco Cs",
    "Diego explicou que a análise segue um roteiro clássico de cinco itens, todos começados pela mesma letra, e que cada um recebe peso próprio conforme a modalidade contratada. Os cinco Cs"],

  // P1 + exaustão: o enunciado dava a base de cálculo do teto ("em relação ao
  // valor original da dívida") e ainda descartava o distrator do cheque
  // especial.
  ["2.6|2|1",
    "Helena explicou que existe regra específica para essa modalidade, que limita o montante de juros e encargos acumulados em relação ao valor original da dívida, e que esse limite não se confunde com o teto mensal aplicável ao cheque especial. Sobre o teto legal",
    "Helena explicou que existe, sim, regra específica para essa modalidade, editada pelo Conselho Monetário Nacional depois da escalada dos encargos observada no mercado. Sobre o teto legal"],

  // P1: "está ligada à captação de depósitos à vista" é o discriminante do
  // gabarito, e era a única alternativa a repetir a expressão.
  ["2.7|1|4",
    "Aline explicou que a conta corrente depende de autorização específica e está ligada à captação de depósitos à vista, atividade sujeita a recolhimento compulsório e amparada pelo Fundo Garantidor de Créditos. Já a conta de pagamento é o instrumento típico das instituições de pagamento. Nesse contexto",
    "Aline explicou que manter conta corrente depende de uma autorização específica do Banco Central, que não é concedida a toda instituição por ele supervisionada. Nesse contexto"],

  // P1 literal: "prazo de vigência definido em contrato, ao fim do qual cabe
  // ao segurado decidir sobre a renovação" é a definição do seguro temporário,
  // e o gabarito era "temporário, contratado por prazo definido, com decisão
  // de renovar ao final". A cena (quatro anos de faculdade) já basta.
  ["2.8|3|3",
    "O profissional CPA Ivan indica a modalidade de seguro de vida com prazo de vigência definido em contrato, ao fim do qual cabe ao segurado decidir sobre a renovação. A modalidade",
    "O profissional CPA Ivan indica a modalidade cujo desenho acompanha exatamente esse horizonte e que, por isso, custa menos que as demais para a mesma importância segurada. A modalidade"],

  // ---------- MÓDULO 3 ----------

  // P1: Sueli descrevia a fase de distribuição inteira antes de perguntar qual
  // era a fase.
  ["3.1|BOSS|12",
    "Sueli lembrou que o ciclo de vida do investidor prevê uma etapa final, na qual o patrimônio deixa de ser formado e passa a custear o padrão de vida da pessoa, com a organização da herança ganhando peso na conversa. Nessa classificação",
    "Sueli lembrou que o ciclo de vida do investidor tem quatro etapas e que a posição de Arnaldo em uma delas orienta tanto a carteira quanto a conversa sobre herança. Nessa classificação"],

  // P1 fraco mas real: "associação criada pelos próprios profissionais" só
  // casava com a alternativa que começa por "Associação".
  ["3.1|6|4",
    "lembrando que o selo nasceu de um padrão internacional e que, no Brasil, quem o concede é uma associação criada pelos próprios profissionais da área. A certificação CFP",
    "lembrando que o selo nasceu de um padrão internacional e que cada país tem uma única entidade licenciada para concedê-lo. A certificação CFP"],

  // Exaustão pura: o enunciado descartava por nome dois dos quatro distratores.
  ["3.2|BOSS|5",
    "Um deles citou a norma dos fundos de investimento; o outro citou a lei que trata dos crimes contra o mercado de capitais. Nelson esclareceu que ambas cuidam de outros assuntos. A norma",
    "Nelson pediu que os dois conferissem a resposta no texto da norma antes da reunião seguinte, adiantando que os dois temas estão no mesmo diploma. A norma"],

  // P2: o enunciado narrava a compra e a revenda "ficando com a diferença
  // apurada", e o gabarito era "spread, diferença entre o preço de compra e o
  // preço de venda". Além disso, a fala da Tatiane descartava o rebate. Agora
  // a alternativa explica por que o custo não aparece no extrato — informação
  // que a cena não tinha.
  ["3.3|4|4",
    "Ele perguntou à assessora Tatiane, profissional CPA, se esse ganho corresponde à devolução de parte da taxa de administração feita pelo gestor ao distribuidor. Tatiane explicou que se trata de outro mecanismo, comum na renda fixa. Esse ganho",
    "Ele perguntou à assessora Tatiane, profissional CPA, qual é o nome dessa remuneração e por que ela não aparece destacada em nenhuma linha do extrato. Esse ganho"],
  ["3.3|4|4",
    "spread, diferença entre o preço de compra e o preço de venda do ativo negociado.",
    "spread, remuneração embutida no próprio preço do papel, e não cobrada em rubrica separada."],

  // P1 + estrutura: o enunciado agrupava três segmentos "por movimentarem
  // ativos de alto valor" e apresentava o quarto como sugestão de um colega —
  // o próprio enredo apontava o intruso.
  ["3.4|1|4",
    "listou joalherias, empresários de artistas e atletas de grande expressão e transportadoras de valores, por movimentarem ativos de alto valor ou numerário em espécie. Um colega sugeriu incluir uma rede de escolas de ensino básico atendida pela agência, por ter faturamento elevado. Vanderleia consultou o rol legal de pessoas obrigadas. O segmento",
    "recebeu de um colega uma lista com quatro segmentos atendidos pela agência, todos de faturamento elevado, para conferir um a um contra o rol legal de pessoas obrigadas. O segmento"],
  ["3.4|1|4",
    "escolas de ensino básico, cuja atividade educacional está fora da lista legal de obrigados.",
    "escolas de ensino básico, que não constam do rol de pessoas obrigadas da lei de lavagem."],

  // Exaustão + P2: Anderson descrevia o spoofing (distrator 0) e a
  // justificativa do gabarito repetia "camadas de ordens em vários preços".
  ["3.4|7|1",
    "Anderson observou que uma única ordem falsa de grande volume caracterizaria outra prática. A conduta descrita é de:",
    "Anderson pediu à equipe que classificasse a conduta antes de acionar o compliance. A conduta descrita é de:"],
  ["3.4|7|1",
    "layering, pela criação de camadas de ordens em vários preços para simular interesse no papel.",
    "layering, modalidade de manipulação do livro de ofertas vedada pela regulação da CVM."],

  // Exaustão + vazamento numérico: o enunciado descartava o teto de R$ 20
  // milhões pelo nome e ainda entregava "o dobro do valor da operação".
  ["3.4|7|4",
    "Um diretor citou o teto de R$ 20 milhões, que pertence às sanções de prevenção à lavagem de dinheiro. Cristina explicou que aqui a multa parte do dobro do valor da operação irregular. O teto dessa multa é de:",
    "Um diretor disse de memória um valor que Cristina não conseguiu confirmar, e o levantamento foi refeito a partir do texto da lei. O teto dessa multa é de:"],

  // ---------- MÓDULO 4 E REVISÃO ----------

  // P1: "meio ambiente, às pessoas e ao clima" traduzia a sigla na ordem
  // exata das palavras do gabarito (Ambiental, Social, Climática).
  ["4.1|3|3",
    "A primeira é o documento aprovado pela alta administração que registra as diretrizes que a instituição observa, nos negócios e na relação com terceiros, quanto ao meio ambiente, às pessoas e ao clima. A segunda",
    "A primeira é o documento aprovado pela alta administração que registra as diretrizes de conduta socioambiental observadas nos negócios e na relação com terceiros. A segunda"],

  // P1: "com limites de pessoal e de dívida" no enunciado e "com limites de
  // pessoal e de endividamento" no gabarito, em nenhum distrator.
  ["R|5|3",
    "e a última disciplina a gestão fiscal dos entes públicos, com limites de pessoal e de dívida. A instrutora Marlene, profissional CPA, pediu que ele apontasse qual delas disciplina a gestão fiscal dos entes públicos. A Lei de Responsabilidade Fiscal",
    "e a última disciplina a gestão fiscal dos entes públicos. A instrutora Marlene, profissional CPA, pediu que ele identificasse o número e o ano da norma fiscal. A Lei de Responsabilidade Fiscal"],

  // P2: o gabarito repetia "falta de contraparte disposta a comprar", que era
  // a cena inteira. Agora ele traz a definição do risco, que a cena não dava.
  ["R|BOSS|6",
    "liquidez, pela falta de contraparte disposta a comprar as cotas colocadas à venda.",
    "liquidez, o risco de não converter o ativo em dinheiro no prazo e no preço desejados."],

  // P1: Rosana enunciava a regra ("assuntos restritos a uma classe são
  // tratados em reunião própria") que a pergunta pedia.
  ["R|10|2",
    "Ela lembrou que assuntos restritos a uma classe ou subclasse de cotas são tratados em reunião própria daqueles cotistas. Essa reunião é a:",
    "Ela lembrou que a Resolução CVM 175 prevê mais de um tipo de assembleia e que o critério de escolha é o alcance da matéria posta em deliberação. Essa reunião é a:"],

  // =================================================================
  // SEGUNDA RODADA — o que sobrou depois de medir de novo
  //
  // Nestas quatro o enunciado já estava limpo: o eco vinha do OUTRO lado,
  // da justificativa do gabarito, que parafraseava a cena. São questões em
  // que a cena PRECISA descrever o fenômeno (o método de cálculo da
  // duration, a conversão do plano em renda) — o que não precisava era a
  // alternativa repetir a descrição em vez de acrescentar algo.
  // =================================================================

  // O enunciado ensina o método da duration de Macaulay, e tem de ensinar:
  // é um exercício de cálculo. O gabarito repetia o método em vez de dizer
  // o que o número significa. Agora ele explica POR QUE a duration é menor
  // que o vencimento, que é o conceito que a questão quer fixar.
  ["1.3|10|3",
    "5,21 semestres, prazo médio dos fluxos ponderado pelos valores presentes de cada período.",
    "5,21 semestres, abaixo do vencimento porque os cupons devolvem parte do capital antes do fim."],

  // "bens que podem ser substituídos" estava na cena e só no gabarito.
  // A alternativa passa a destacar a consequência para a emissora, que é
  // informação nova.
  ["2.1|11|1",
    "flutuante, pois há privilégio geral sobre o ativo, com bens que podem ser substituídos pela emissora.",
    "flutuante, pois o credor tem privilégio geral e a emissora conserva a livre disposição dos bens."],

  // Sobrava eco em três radicais: "reparam o PREJUÍZO" ↔ "Ressarcimento de
  // PREJUÍZOS", e o próprio "O MECANISMO que protege o INVESTIDOR" da linha
  // da pergunta, que só podia casar com a alternativa chamada "Mecanismo".
  // A pergunta passa a dizer "ferramenta" e a cena, "socorrem".
  ["1.4|BOSS|4",
    "pediu à turma que separasse as ferramentas de estabilidade do sistema daquelas que reparam o prejuízo de um investidor específico.",
    "pediu à turma que separasse as ferramentas de estabilidade do sistema daquelas que socorrem um cliente específico, um de cada vez."],
  ["1.4|BOSS|4",
    "O mecanismo que protege o investidor individual é:",
    "A ferramenta que atende esse pedido é:"],

  // "converteu... e passou a receber" ↔ "há recebimento... do saldo já
  // convertido". A alternativa passa a nomear a irreversibilidade, que é o
  // ponto da fase de benefícios e não estava na cena.
  ["2.5|3|4",
    "há recebimento da renda contratada, sem possibilidade de resgatar o saldo já convertido.",
    "o benefício contratado torna-se irreversível, e o saldo que o lastreia deixa de ser resgatável."],

  // =================================================================
  // TERCEIRA RODADA — a última, e a mais discutível
  //
  // Aqui o eco não era conceito nenhum: eram os NOMES da cena. O enunciado
  // fala do CNPJ do fundo, do banco e da gestora, e o gabarito volta a
  // falar dos três porque a resposta é sobre eles. Dá para argumentar que
  // não é vazamento — o conceito (segregação patrimonial) não está no
  // enunciado em lugar nenhum, e quem não souber não acerta.
  //
  // Ainda assim vale arrumar, por dois motivos. Primeiro, quem responde
  // casando palavras é atraído para a única alternativa que retoma os
  // personagens da cena, e isso é ruído mesmo quando não é gabarito de
  // graça. Segundo, os distratores começavam com "Ele" sem antecedente
  // claro — trocar por "O fundo" melhora a leitura de qualquer jeito.
  // =================================================================
  ["2.4|1|2",
    "O patrimônio do fundo fica separado do patrimônio da gestora e do banco, e não responde por dívidas dessas instituições.",
    "O patrimônio da carteira não se comunica com o de seus prestadores de serviço e não responde por dívidas deles."],
  ["2.4|1|2",
    "Ele fica autorizado a emitir ações no mercado de capitais, captando recursos junto a investidores como uma companhia.",
    "O fundo fica autorizado a emitir ações no mercado de capitais, captando recursos junto a investidores como uma companhia."],
  ["2.4|1|2",
    "Ele fica dispensado do registro junto à CVM, bastando a inscrição cadastral para iniciar a distribuição das cotas ao público.",
    "O fundo fica dispensado do registro junto à CVM, bastando a inscrição cadastral para o banco iniciar a distribuição das cotas."],
  ["2.4|1|2",
    "Ele passa a recolher imposto de renda como pessoa jurídica, apurando lucro tributável ao fim de cada exercício social.",
    "O fundo passa a recolher imposto de renda como pessoa jurídica, apurando com a gestora o lucro tributável do exercício."],
];

// ---------------------------------------------------------------------
const arquivos = ["modulo-1", "modulo-2", "modulo-3", "modulo-4"]
  .map((n) => path.join(raiz, "src", "dados", n + ".part.js"));
const conteudo = arquivos.map((f) => fs.readFileSync(f, "utf8"));

let aplicadas = 0;
const problemas = [];

let jaFeitas = 0;
TROCAS.forEach(([ref, de, para]) => {
  // Idempotência. Sem isto, rodar o script duas vezes reprova por "origem
  // não encontrada" e o erro real fica escondido no meio dos falsos.
  //
  // A comparação é por PREFIXO do texto novo, não pelo texto inteiro: uma
  // rodada posterior pode ter mexido no fim da mesma frase (foi o que
  // aconteceu em 1.4|BOSS|4, cuja pergunta mudou depois). O prefixo de 50
  // caracteres continua identificando a troca sem exigir que o resto da
  // frase tenha ficado intacto.
  const marca = para.slice(0, 50);
  if (conteudo.some((c) => c.includes(marca))) { jaFeitas++; return; }
  const ondes = conteudo
    .map((c, i) => [i, c.split(de).length - 1])
    .filter(([, n]) => n > 0);
  const total = ondes.reduce((a, [, n]) => a + n, 0);
  if (total === 0) { problemas.push(`${ref}: texto de origem não encontrado — «${de.slice(0, 60)}…»`); return; }
  if (total > 1) { problemas.push(`${ref}: texto de origem aparece ${total}x, ambíguo — «${de.slice(0, 60)}…»`); return; }
  const [i] = ondes[0];
  conteudo[i] = conteudo[i].replace(de, para);
  aplicadas++;
});

if (problemas.length) {
  console.error("\nNADA FOI GRAVADO. Problemas:");
  problemas.forEach((p) => console.error("  " + p));
  process.exit(1);
}

if (args_conferir()) {
  console.log(`\n${aplicadas} trocas casariam. Nada gravado (--conferir).\n`);
  process.exit(0);
}

arquivos.forEach((f, i) => fs.writeFileSync(f, conteudo[i]));
console.log(`\n${aplicadas} trocas aplicadas em ${arquivos.length} arquivos de dados.`);
console.log("Rode: node build.js && node scripts/verificar.js && node scripts/conferir-vazamento.js\n");

function args_conferir() { return process.argv.includes("--conferir"); }
