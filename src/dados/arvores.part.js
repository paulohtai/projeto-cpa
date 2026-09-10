// =====================================================================
// ÁRVORES DE DECISÃO — o tipo "questão interativa" da prova oficial.
//
// Formato copiado do Guia de Elaboração de Questões da ANBIMA
// (referencia/LEIA-ANBIMA-OFICIAL.md):
//   · contexto de ~400 caracteres, em 2ª pessoa ("Você é...");
//   · média de SEIS prompts, formando uma rede de conversa simulada;
//   · cada prompt tem ~200 caracteres e 4 alternativas somando ~500;
//   · as alternativas NÃO são certo/errado — são graduadas, e TODAS
//     levam ao prompt seguinte.
//
// grau: 3 = melhor escolha · 2 = boa escolha · 1 = escolha razoável
//       0 = escolha abaixo do ideal
// A nota final é a soma dos graus sobre o máximo possível.
// =====================================================================
const GRAUS = ["Escolha abaixo do ideal", "Escolha razoável", "Boa escolha", "Melhor escolha"];

const ARVORES = [
  {
    id: "A.5",
    titulo: "Duas LCAs e um carro para a neta",
    tema: "Indexadores, rentabilidade comparada e linguagem com o cliente",
    cliente: "Antônio",
    contexto: "Você atende no varejo de um banco. Pela manhã conferiu os indicadores: CDI a 15% ao ano e IPCA acumulado em 4%. Antônio, 63 anos, aposentado, chega para resgatar. No sistema constam duas LCAs dele: uma de R$ 110.000 a 92% do CDI, aplicada há 13 meses, e outra de R$ 130.000 a IPCA + 5,5%, aplicada há 25 meses. Ele quer sacar R$ 80.000.",
    prompts: [
      {
        fala: "Boa tarde! Preciso resgatar 80 mil para dar um carro de presente para minha neta, que faz 18 anos. Tenho uma LCA do CDI e outra do IPCA. Pode me explicar a diferença para me ajudar a decidir?",
        alts: [
          { t: "Claro. Uma acompanha os juros do mercado e a outra paga a inflação mais uma taxa fixa. Vamos ver o que isso significou no seu caso.", grau: 3, nota: "Explica os dois indexadores em linguagem simples e já sinaliza que vai olhar os números dele, que é o que a decisão exige." },
          { t: "Posso consultar os valores no sistema e ver qual rendeu mais até agora, para você decidir.", grau: 1, nota: "Consultar é útil, porém entregar só o número sem explicar o mecanismo deixa o cliente sem entender a escolha." },
          { t: "As duas são LCAs, então são bem parecidas. A diferença fica só na forma de calcular o rendimento.", grau: 0, nota: "Minimiza uma diferença que é justamente o ponto da decisão." },
          { t: "A diferença é o indexador: uma segue o CDI, a outra o IPCA somado a uma taxa fixa contratada.", grau: 2, nota: "Correto e claro, mas para em definição: não avança para o caso concreto do cliente." },
        ],
      },
      {
        fala: "Tá, mas não entendi direito. Sempre preferi coisa atrelada à inflação, por causa dos anos 80. Só que minha filha falou que a do CDI está rendendo mais.",
        alts: [
          { t: "Como o senhor prefere inflação, o melhor é manter a do IPCA e resgatar a outra.", grau: 0, nota: "Recomenda pela preferência declarada sem checar rentabilidade, prazo ou isenção. É atalho, não diagnóstico." },
          { t: "Sua filha tem razão neste momento: com o CDI a 15% e a inflação em 4%, a do CDI está entregando bem mais. Mas isso muda quando os juros caem.", grau: 3, nota: "Usa os números que estão na mesa e ainda mostra que a vantagem é do cenário, não permanente." },
          { t: "A do CDI acompanha os juros, hoje em 15%. A do IPCA paga a inflação, hoje em 4%, mais 5,5% ao ano.", grau: 2, nota: "Traz os dados corretos, mas deixa a comparação por conta do cliente." },
          { t: "As duas rendem parecido no longo prazo. A diferença aparece mais no curto prazo.", grau: 1, nota: "Afirmação genérica que não se sustenta com esses números e não ajuda a decidir." },
        ],
      },
      {
        fala: "Deixa eu ver se entendi: a do IPCA me garante a inflação e a do CDI depende de como o Banco Central mexer nos juros?",
        alts: [
          { t: "Exato. A do IPCA garante a inflação e a do CDI depende da política monetária do Banco Central.", grau: 2, nota: "Correto, embora deixe de fora a taxa fixa de 5,5%, que é parte relevante do retorno." },
          { t: "Mais ou menos. As duas protegem da inflação, só que de jeitos diferentes.", grau: 1, nota: "Impreciso: a do CDI pode ficar abaixo da inflação em certos cenários, então proteção não é garantida." },
          { t: "É isso. A do IPCA repõe a inflação e ainda soma uma taxa fixa. A do CDI acompanha a taxa básica, que sobe e desce conforme a política monetária.", grau: 3, nota: "Confirma o entendimento do cliente e completa o que faltava: a parte fixa do IPCA e a origem da variação do CDI." },
          { t: "Na prática o CDI acompanha a inflação, então dá no mesmo escolher qualquer uma.", grau: 0, nota: "Informação incorreta: CDI e IPCA são indicadores distintos e podem divergir bastante." },
        ],
      },
      {
        fala: "E se eu resgatar a do CDI? Ela tem 13 meses. Vou pagar imposto sobre esse rendimento?",
        alts: [
          { t: "Com 13 meses o senhor já saiu da faixa mais alta da tabela, então o imposto fica menor.", grau: 0, nota: "Erro grave: aplica a tabela regressiva a um produto isento." },
          { t: "Vou verificar no sistema como fica a tributação nesse resgate específico.", grau: 1, nota: "Prudente, mas a isenção da LCA é regra conhecida; adiar aqui passa insegurança." },
          { t: "Não paga imposto de renda. A LCA é isenta para pessoa física.", grau: 2, nota: "Correto, mas perde a oportunidade de alertar sobre a carência." },
          { t: "Nesse caso não: LCA é isenta de imposto de renda para pessoa física, independentemente do prazo. O que é bom conferir é a carência mínima.", grau: 3, nota: "Responde com precisão e traz o ponto que de fato limita o resgate numa LCA: a carência." },
        ],
      },
      {
        fala: "Entendi. Mas e se eu resgatar a do IPCA, que é maior? Assim sobra mais dinheiro aplicado depois.",
        alts: [
          { t: "Antes de escolher pelo tamanho, vale olhar o que cada uma rende daqui para frente e qual delas o senhor precisaria manter para os próximos anos.", grau: 3, nota: "Recoloca a decisão no critério certo: o objetivo futuro, e não qual aplicação é maior." },
          { t: "Podemos resgatar da maior, sim. Só quero conferir antes se ela já cumpriu a carência.", grau: 2, nota: "Cuidado correto com a carência, mas aceita o critério do cliente sem discuti-lo." },
          { t: "Tanto faz, o senhor decide. Qualquer uma dá para tirar os 80 mil.", grau: 0, nota: "Devolve a decisão sem orientação, justamente o oposto do que o cliente pediu." },
          { t: "Melhor tirar da maior mesmo, assim o senhor não zera nenhuma aplicação.", grau: 1, nota: "Regra de bolso que ignora rentabilidade e prazo de cada papel." },
        ],
      },
      {
        fala: "Você me ajudou bastante. Sobre o que sobrar aplicado, precisa eu fazer alguma coisa agora?",
        alts: [
          { t: "Não precisa. Eu acompanho e aviso se aparecer algo relevante para o senhor.", grau: 2, nota: "Compromisso bom, sem critério do que seria relevante." },
          { t: "Agora não. Combino de revisar com o senhor quando a Selic mudar de patamar ou quando a carência da outra LCA vencer, o que vier primeiro.", grau: 3, nota: "Transforma o pós-venda em acompanhamento com gatilho definido, em vez de promessa vaga." },
          { t: "Já aproveito e deixo agendada a aplicação do que sobrar em um fundo mais rentável.", grau: 0, nota: "Decide por conta própria uma nova aplicação sem diagnóstico nem autorização." },
          { t: "Qualquer coisa o senhor passa aqui na agência que a gente conversa.", grau: 1, nota: "Transfere ao cliente a responsabilidade de acompanhar." },
        ],
      },
    ],
  },
  {
    id: "A.1",
    titulo: "O cliente que viu um vídeo sobre cripto",
    tema: "Suitability, dever de informar e registro da decisão",
    cliente: "Rogério",
    contexto: "Você atende no varejo de um banco. Rogério, 58 anos, perfil conservador na API, tem R$ 90 mil aplicados em CDB e Tesouro Selic — é a reserva que ele guarda para a aposentadoria, prevista para daqui a sete anos. Ele chega à agência dizendo que viu um vídeo sobre criptomoedas e quer aplicar metade do dinheiro.",
    prompts: [
      {
        fala: "Vi um vídeo de um cara que ganhou três vezes o dinheiro em cripto em oito meses. Quero colocar uns R$ 45 mil. Como faço?",
        alts: [
          { t: "Posso te explicar como funciona esse tipo de ativo e quais riscos ele carrega, se você quiser.", grau: 2, nota: "Informar é dever seu, mas vem antes de entender o objetivo e o prazo do dinheiro." },
          { t: "Sem problema, faço a aplicação. O dinheiro é seu e você decide onde colocar.", grau: 0, nota: "Executar sem diagnóstico e sem alerta abandona o dever de adequação." },
          { t: "Antes de falar de produto, me conta: o que te chamou atenção no vídeo e para quando é esse dinheiro?", grau: 3, nota: "Abre o diagnóstico e devolve a conversa ao objetivo do cliente, sem julgar nem embarcar." },
          { t: "Cripto é muito arriscado para o seu perfil. Não recomendo de jeito nenhum.", grau: 1, nota: "A conclusão até é defensável, mas fechar a porta assim encerra o diálogo e empurra o cliente para outro canal." },
        ],
      },
      {
        fala: "É o dinheiro da minha aposentadoria mesmo. Mas faltam sete anos, dá tempo de recuperar se cair, não dá?",
        alts: [
          { t: "Dá tempo, sim, mas o tamanho da posição preocupa: metade é muito.", grau: 2, nota: "Aponta o ponto certo, ainda que sem ligar ao objetivo da aposentadoria." },
          { t: "Dá tempo tranquilo. Em sete anos o mercado sempre se recupera.", grau: 0, nota: "'Sempre se recupera' é promessa disfarçada e não se sustenta." },
          { t: "Depende do mercado. Ninguém consegue prever se vai cair ou subir nesse prazo.", grau: 1, nota: "É verdade, mas responder só isso deixa o cliente sem base para decidir." },
          { t: "Sete anos ajudam, mas metade da reserva num ativo muito volátil pode comprometer o plano se a queda vier perto do fim.", grau: 3, nota: "Conecta o risco ao objetivo concreto dele, que é o que a prova espera." },
        ],
      },
      {
        fala: "E se eu colocar menos? Uns R$ 10 mil, digamos. Aí você me libera?",
        alts: [
          { t: "Reduzir a exposição muda bastante o quadro. Vamos ver quanto você pode arriscar sem afetar a aposentadoria.", grau: 3, nota: "Trabalha com o cliente a capacidade de risco em vez de simplesmente liberar ou barrar." },
          { t: "Qualquer valor em cripto continua desenquadrado do seu perfil conservador.", grau: 1, nota: "Tecnicamente coerente, porém ignora que a decisão final é do cliente informado." },
          { t: "Se é pouco, tanto faz. Nem precisamos registrar nada.", grau: 0, nota: "Valor menor não dispensa alerta nem registro. Isso é falha de conduta." },
          { t: "R$ 10 mil é bem mais razoável. Podemos avaliar dessa forma.", grau: 2, nota: "Direção correta, mas aceita o número do cliente sem checar de onde ele sai." },
        ],
      },
      {
        fala: "Sinceramente, achei que você fosse me empurrar um fundo do banco. Por que está me segurando?",
        alts: [
          { t: "Na verdade eu tenho um fundo que bate meta e serve para você. Quer ver?", grau: 0, nota: "Aproveitar a brecha para empurrar produto por meta é exatamente o conflito de interesses vedado." },
          { t: "Meu dever é oferecer o que combina com o seu objetivo. Se eu empurrasse qualquer coisa, estaria falhando com você.", grau: 3, nota: "Explica o dever de adequação em linguagem simples e reforça a confiança." },
          { t: "Porque a regra exige verificar se o produto é adequado ao seu perfil antes de recomendar.", grau: 2, nota: "Correto, mas soa burocrático; o cliente entende melhor pelo interesse dele." },
          { t: "Tenho metas, sim, mas nesse caso elas não mudam a minha recomendação.", grau: 1, nota: "Sinceridade é boa, porém trazer a meta para a conversa desvia o foco do cliente." },
        ],
      },
      {
        fala: "Entendi. Mas eu quero mesmo assim. Vamos com os R$ 10 mil, é decisão minha.",
        alts: [
          { t: "Tudo bem, mas quero que você assine o termo de ciência de risco antes.", grau: 2, nota: "O termo é parte do processo, embora o essencial seja a compreensão, não só a assinatura." },
          { t: "Prefiro que você pense mais uns dias antes de a gente fechar.", grau: 1, nota: "Prudente, mas adiar sem motivo novo pode virar obstrução à vontade do cliente." },
          { t: "Respeito a decisão. Vou registrar o alerta de que o produto está fora do seu perfil e seguimos.", grau: 3, nota: "Cliente informado decide; o registro do desenquadramento protege os dois lados." },
          { t: "Não posso permitir. Vou recusar a operação.", grau: 0, nota: "Alertado e ciente, o cliente tem o direito de decidir. Recusar sem base é extrapolar." },
        ],
      },
      {
        fala: "Fechado. E se daqui a três meses despencar, o que a gente faz?",
        alts: [
          { t: "Aí é esperar. Vender na baixa costuma ser o pior negócio.", grau: 1, nota: "Máxima genérica que não considera o objetivo nem o prazo dele." },
          { t: "Não se preocupe, eu te aviso antes de qualquer queda grande.", grau: 0, nota: "Promessa impossível de cumprir: ninguém antecipa quedas." },
          { t: "Se cair, a gente conversa e reavalia a posição com calma.", grau: 2, nota: "Acolhe, mas deixa a decisão para o pior momento possível: o do prejuízo." },
          { t: "A gente combina agora quanto de queda você tolera e o que faremos se chegar lá. Assim ninguém decide no susto.", grau: 3, nota: "Antecipa o cenário ruim e transforma o pós-venda em plano, não em reação." },
        ],
      },
    ],
  },
  {
    id: "A.2",
    titulo: "A carteira caiu e o telefone tocou",
    tema: "Comunicação de má notícia, pós-venda e expectativa",
    cliente: "Dona Neusa",
    contexto: "Você é gerente de relacionamento. Dona Neusa, 66 anos, aplicou R$ 200 mil num fundo multimercado moderado há cinco meses, com objetivo de complementar a renda em três anos. O extrato do mês fechou com queda de 7%. Ela liga logo cedo, visivelmente nervosa, dizendo que vai tirar tudo hoje.",
    prompts: [
      {
        fala: "Eu vi o extrato e perdi quatorze mil reais! Isso é um absurdo. Tira tudo hoje e põe na poupança.",
        alts: [
          { t: "Entendo o susto, dona Neusa. Antes de tirar, posso te explicar em dois minutos o que causou essa queda?", grau: 3, nota: "Acolhe a emoção e pede espaço para informar antes da decisão no impulso." },
          { t: "Posso fazer o resgate, sim. Só queria te contar antes o que aconteceu no mês.", grau: 2, nota: "Respeita a vontade dela, mas colocar o resgate na frente reforça a decisão no susto." },
          { t: "Se você resgatar agora, vai perder dinheiro. Não faça isso.", grau: 0, nota: "Ordem seca, sem explicação e sem acolhimento: fecha o diálogo." },
          { t: "Calma, isso é normal em fundo multimercado. Não precisa se preocupar.", grau: 1, nota: "Minimizar o sentimento dela costuma aumentar a desconfiança, não reduzir." },
        ],
      },
      {
        fala: "Explica então. Mas eu não entendo esses nomes complicados, viu?",
        alts: [
          { t: "É a marcação a mercado: os ativos são reprecificados diariamente conforme a curva de juros.", grau: 2, nota: "Tecnicamente certo, mas usa justamente os termos que ela disse não entender." },
          { t: "O fundo tem títulos que variam de preço todo dia. Quando os juros sobem, esses títulos valem menos hoje, mesmo sem ninguém ter errado.", grau: 3, nota: "Traduz marcação a mercado em linguagem cotidiana, sem infantilizar." },
          { t: "É complicado mesmo, mas confie em mim: isso passa.", grau: 0, nota: "Pedir confiança no lugar de explicar é o oposto do dever de transparência." },
          { t: "O mercado oscilou bastante esse mês por causa do cenário macroeconômico.", grau: 1, nota: "Vago demais: não explica nada de fato." },
        ],
      },
      {
        fala: "Mas quando você me vendeu esse fundo, disse que era seguro. Eu me lembro bem.",
        alts: [
          { t: "Registramos o seu perfil moderado e o produto está dentro dele, dona Neusa.", grau: 2, nota: "Correto e documentado, mas responde com processo a uma queixa emocional." },
          { t: "Eu nunca disse que era seguro. A senhora deve estar confundindo.", grau: 0, nota: "Confrontar a memória do cliente destrói a relação e não resolve nada." },
          { t: "Falamos que era moderado, com oscilação no caminho. Se ficou a impressão de que não cairia, foi falha minha em explicar.", grau: 3, nota: "Assume a parte que lhe cabe sem negar a memória da cliente. Recupera confiança." },
          { t: "Acho que houve um mal-entendido na nossa conversa.", grau: 1, nota: "Empurra a falha para o meio-termo, sem assumir nem esclarecer." },
        ],
      },
      {
        fala: "E agora? Eu preciso desse dinheiro daqui a três anos para complementar minha renda.",
        alts: [
          { t: "Nesse prazo, historicamente esse tipo de fundo se recupera de quedas assim.", grau: 2, nota: "Contextualiza, mas apoiar-se no histórico chega perto de prometer resultado." },
          { t: "Deixa quieto que até lá recupera com folga.", grau: 0, nota: "Garantia de recuperação: promessa que você não pode fazer." },
          { t: "Se você precisa em três anos, talvez seja melhor migrar para algo mais previsível.", grau: 1, nota: "Pode fazer sentido, mas sugerir migração antes de reavaliar o plano é apressado." },
          { t: "Três anos é justamente o horizonte que combinamos. Vamos olhar se a queda muda o plano ou se ela cabe nele.", grau: 3, nota: "Devolve a decisão ao objetivo e ao prazo, que é a régua certa." },
        ],
      },
      {
        fala: "Se eu tirar metade agora e deixar metade, resolve? Pelo menos eu durmo à noite.",
        alts: [
          { t: "Reduzir a posição para você dormir tranquila é um motivo legítimo. Vamos calcular quanto resgatar sem furar o plano dos três anos.", grau: 3, nota: "Trata a tolerância emocional como dado real e ajusta com técnica." },
          { t: "Metade ainda mantém a exposição ao risco que te incomodou.", grau: 1, nota: "Observação técnica correta que não avança para uma solução." },
          { t: "Não vale a pena mexer. Mantém tudo como está.", grau: 0, nota: "Ignora o desconforto declarado da cliente, que é informação relevante de perfil." },
          { t: "Podemos fazer isso, sim. É uma forma de diminuir o desconforto.", grau: 2, nota: "Acolhe, mas sem quantificar o efeito no objetivo dela." },
        ],
      },
      {
        fala: "Está bem, vamos fazer assim. E me avisa se piorar, tá?",
        alts: [
          { t: "Não vai piorar, fique tranquila.", grau: 0, nota: "Previsão que ninguém pode dar, e que destrói a confiança se falhar." },
          { t: "Combinado. Vou te ligar no fim de cada mês, e também se a queda passar do limite que definirmos hoje.", grau: 3, nota: "Transforma o pedido vago num acompanhamento com critério e periodicidade." },
          { t: "Pode deixar, eu acompanho e te aviso quando houver movimento relevante.", grau: 2, nota: "Compromisso bom, porém sem critério definido do que é 'relevante'." },
          { t: "Qualquer coisa a senhora me liga que a gente conversa.", grau: 1, nota: "Transfere para a cliente a responsabilidade do acompanhamento." },
        ],
      },
    ],
  },
  {
    id: "A.3",
    titulo: "A remessa que acendeu o alerta",
    tema: "PLDFT, LGPD e sigilo na prática",
    cliente: "Auditoria interna",
    contexto: "Você trabalha na área de atendimento de um banco digital. Um cliente que movimentava pouco fez ontem uma remessa internacional de R$ 180 mil para um país classificado como de alto risco. O sistema marcou a operação como potencialmente suspeita e a auditoria interna pede que você compartilhe os dados cadastrais dele para análise.",
    prompts: [
      {
        fala: "Auditoria: preciso dos dados cadastrais e do histórico desse cliente hoje ainda. Pode me mandar por e-mail?",
        alts: [
          { t: "Compartilho pelos sistemas internos, mas prefiro não usar e-mail comum para esse tipo de dado.", grau: 2, nota: "Cuidado certo com o meio; falta apenas nomear a base legal que autoriza." },
          { t: "Preciso confirmar com o meu gestor antes de encaminhar qualquer dado.", grau: 1, nota: "Prudente, mas atrasa uma apuração que a norma já autoriza." },
          { t: "Posso, sim, pelo canal interno próprio: a apuração de suspeita é hipótese legal de tratamento dos dados.", grau: 3, nota: "A LGPD permite o compartilhamento quando há obrigação legal, e o canal correto preserva o sigilo." },
          { t: "Não posso: a LGPD proíbe compartilhar dados do cliente sem o consentimento dele.", grau: 0, nota: "Erro clássico. Consentimento não é a única base legal, e a prevenção à lavagem é obrigação." },
        ],
      },
      {
        fala: "Auditoria: e o cliente? Alguém avisa que ele está sendo analisado?",
        alts: [
          { t: "Acho melhor não avisar, para não atrapalhar a apuração.", grau: 1, nota: "Chega ao resultado certo por intuição, não pela norma." },
          { t: "Vou ligar para ele confirmar a origem do dinheiro antes de reportarmos.", grau: 0, nota: "Alertar o cliente sobre a suspeita é justamente o que a lei proíbe." },
          { t: "Não avisamos. O procedimento corre sem comunicação ao cliente.", grau: 2, nota: "Conduta correta, sem explicitar por que a vedação existe." },
          { t: "Não. Avisar o cliente sobre a análise ou a comunicação caracteriza tipping off e é vedado.", grau: 3, nota: "A vedação de dar ciência ao investigado é ponto central do PLDFT." },
        ],
      },
      {
        fala: "Auditoria: o valor está alto, mas ele explicou na abertura que recebe do exterior. Isso derruba a suspeita?",
        alts: [
          { t: "Ajuda a avaliar, mas não elimina: o que pesa é a incompatibilidade com o histórico e o destino de alto risco.", grau: 3, nota: "Mantém a análise ancorada no conjunto de indícios, não numa justificativa isolada." },
          { t: "É um elemento a considerar na análise, junto com os demais indícios.", grau: 2, nota: "Equilibrado, embora não aponte o que de fato pesa no caso." },
          { t: "Sim, com a explicação no cadastro podemos arquivar o alerta.", grau: 0, nota: "Arquivar por causa de uma declaração antiga esvazia o monitoramento." },
          { t: "Se ele declarou na abertura, o cadastro está em ordem.", grau: 1, nota: "Confunde cadastro regular com ausência de suspeita." },
        ],
      },
      {
        fala: "Auditoria: e se a análise concluir que é suspeita mesmo? Qual valor mínimo para comunicar ao COAF?",
        alts: [
          { t: "Suspeita se comunica independentemente do valor envolvido.", grau: 2, nota: "Correto e direto, sem separar registro de comunicação." },
          { t: "Não existe piso: suspeita de qualquer valor deve ser comunicada, e sem dar ciência ao cliente.", grau: 3, nota: "Valores acionam registro; suspeita aciona comunicação. É a pegadinha mais cobrada." },
          { t: "Só a partir de R$ 2 mil em espécie é que nasce a obrigação.", grau: 0, nota: "Esse valor é de registro de operação em espécie, não de comunicação de suspeita." },
          { t: "Acima de R$ 50 mil, que é o limite de registro reforçado.", grau: 1, nota: "Confunde o gatilho de registro com o de comunicação." },
        ],
      },
      {
        fala: "Auditoria: aproveitando, um colega de outra instituição me perguntou sobre esse mesmo cliente. Posso repassar?",
        alts: [
          { t: "Não podemos compartilhar dados de cliente com outra instituição desse jeito.", grau: 2, nota: "Conduta certa, sem explicar o fundamento." },
          { t: "Se for para ajudar numa investigação, acho que sim.", grau: 0, nota: "Compartilhar com terceiro sem base legal viola sigilo e LGPD de uma vez." },
          { t: "Não. O sigilo bancário só cede nas hipóteses legais, e curiosidade de terceiro não é uma delas.", grau: 3, nota: "Protege o sigilo e nomeia o critério: a hipótese precisa estar em lei." },
          { t: "Só se ele formalizar o pedido por escrito.", grau: 1, nota: "Formalizar não cria base legal onde ela não existe." },
        ],
      },
      {
        fala: "Auditoria: por fim, quanto tempo guardamos os registros dessa operação?",
        alts: [
          { t: "Mantemos os registros arquivados pelo prazo previsto na regulamentação.", grau: 2, nota: "Correto, ainda que genérico sobre a contagem do prazo." },
          { t: "Depois de comunicar ao COAF, podemos descartar o material.", grau: 0, nota: "Descartar registro de operação comunicada contraria o dever de guarda." },
          { t: "Guardamos enquanto o cliente tiver conta conosco.", grau: 1, nota: "A obrigação costuma se estender além do fim do relacionamento." },
          { t: "Pelo prazo mínimo que a norma exige, contado do encerramento da relação ou da operação, com o caso documentado ponta a ponta.", grau: 3, nota: "Guarda de registros e trilha documental são parte do dever, não formalidade." },
        ],
      },
    ],
  },
  {
    id: "A.4",
    titulo: "Última semana do trimestre",
    tema: "Conflito de interesses, meta comercial e adequação",
    cliente: "Seu gerente e o cliente Marcelo",
    contexto: "Você é assessor numa agência. Faltam quatro dias para fechar o trimestre e sua meta de previdência está em 55%. Seu gerente pediu empenho no PGBL da campanha. Nisso chega Marcelo, 29 anos, autônomo, sem contribuição ao INSS, declarando IR pelo modelo simplificado. Ele tem R$ 30 mil, que são a reserva de emergência dele.",
    prompts: [
      {
        fala: "Gerente: aproveita esse cliente que chegou e encaixa o PGBL da campanha, que a gente fecha a meta hoje.",
        alts: [
          { t: "Vou atender e ver o que serve para ele. Se o PGBL couber, ótimo; se não, ofereço o adequado.", grau: 3, nota: "Não confronta o gerente nem abre mão da adequação. É a saída profissional." },
          { t: "Vou tentar, mas não prometo nada.", grau: 1, nota: "Ambíguo: deixa no ar que a meta pode pesar na recomendação." },
          { t: "Pode deixar, encaixo o PGBL nele.", grau: 0, nota: "Decidir o produto antes de conhecer o cliente inverte toda a lógica do atendimento." },
          { t: "Só consigo oferecer se o produto for adequado ao perfil e à situação dele.", grau: 2, nota: "Correto, embora coloque a conversa em tom de recusa logo de início." },
        ],
      },
      {
        fala: "Marcelo: tenho trinta mil guardados. É o que me segura se ficar sem trabalho por uns meses. Queria que rendesse mais.",
        alts: [
          { t: "Nesse caso a previdência é ótima, porque força você a não mexer.", grau: 0, nota: "Trancar a reserva de emergência em produto de longo prazo é o oposto do adequado." },
          { t: "Como esse dinheiro é a sua segurança, ele precisa render bem mas continuar disponível a qualquer momento.", grau: 3, nota: "Identifica a função do dinheiro e fixa liquidez como requisito antes de falar de produto." },
          { t: "Entendi. Você pensa em usar em quanto tempo, se precisar?", grau: 2, nota: "Boa pergunta de diagnóstico, mas ele já disse que é reserva de emergência." },
          { t: "Temos opções que rendem mais que a poupança, sim. Quer ver?", grau: 1, nota: "Pula para produto sem amarrar a necessidade de liquidez." },
        ],
      },
      {
        fala: "Marcelo: um amigo falou que previdência dá desconto no imposto. Isso vale para mim?",
        alts: [
          { t: "Esse benefício vale para quem declara no modelo completo, que não é o seu caso.", grau: 2, nota: "Correto e claro, faltando a condição de contribuir ao regime oficial." },
          { t: "Depende do plano e da sua situação. Podemos simular.", grau: 1, nota: "Evasivo diante de uma pergunta que tem resposta objetiva aqui." },
          { t: "O desconto do PGBL exige declaração completa e contribuição ao INSS. No seu caso, simplificada e autônomo, ele não se aplica.", grau: 3, nota: "Responde exatamente à situação dele, com as duas condições que a prova cobra." },
          { t: "Vale sim, todo mundo que aplica em PGBL abate até 12%.", grau: 0, nota: "Informação errada que ainda induz o cliente ao produto da campanha." },
        ],
      },
      {
        fala: "Marcelo: então o que você me indica para essa reserva?",
        alts: [
          { t: "Podemos dividir: uma parte em renda fixa e outra em previdência para o futuro.", grau: 1, nota: "Misturar a reserva com longo prazo compromete justamente a emergência." },
          { t: "Um VGBL resolve, já que o PGBL não serve para você.", grau: 0, nota: "Trocar de sigla mantém o erro: previdência não é lugar de reserva de emergência." },
          { t: "Aplicações conservadoras com resgate rápido são o caminho para reserva de emergência.", grau: 2, nota: "Direção certa, sem chegar ao produto concreto que o cliente pediu." },
          { t: "Algo de liquidez diária e risco baixo, como Tesouro Selic ou um CDB com resgate a qualquer momento e FGC.", grau: 3, nota: "Recomendação coerente com a função do dinheiro e com o perfil." },
        ],
      },
      {
        fala: "Gerente: e aí, fechou a previdência? Preciso desse número até sexta.",
        alts: [
          { t: "Não fechou: o dinheiro dele é reserva de emergência e ele declara no simplificado. Vou buscar a meta em quem tem perfil.", grau: 3, nota: "Sustenta a decisão com o motivo técnico e mantém o compromisso com a meta." },
          { t: "Esse cliente não tinha perfil para o produto da campanha.", grau: 2, nota: "Correto, mas sem apresentar o caminho para a meta." },
          { t: "Fechei um valor menor para não ficar sem nada.", grau: 0, nota: "Vender inadequado 'só um pouco' continua sendo vender inadequado." },
          { t: "Ainda não consegui. Vou continuar tentando com ele.", grau: 1, nota: "Deixa aberta a porta de insistir num produto já identificado como inadequado." },
        ],
      },
      {
        fala: "Marcelo: gostei do atendimento. Quando eu tiver mais dinheiro, previdência passa a fazer sentido para mim?",
        alts: [
          { t: "Sim, quando você já tiver a reserva pronta e pensar no longo prazo.", grau: 2, nota: "Boa condição, sem indicar qual modalidade serviria a ele." },
          { t: "Passa a fazer sentido quando você tiver reserva formada e objetivo de longo prazo. E o VGBL costuma encaixar melhor em quem declara no simplificado.", grau: 3, nota: "Abre a porta futura com o critério certo e já orienta a modalidade adequada." },
          { t: "Sim, e aí você já aproveita o desconto de 12% no imposto.", grau: 0, nota: "Repete a informação errada: no simplificado, esse desconto não existe." },
          { t: "Com certeza, é só me procurar quando quiser.", grau: 1, nota: "Simpático, porém sem conteúdo que ajude o cliente a decidir." },
        ],
      },
    ],
  },

  // ===================================================================
  // LOTE 2 — MÓDULO 1: economia, sistema financeiro e risco
  //
  // Por que estas quatro existem: com 5 árvores, a prova consumia 10 dos 30
  // passos e só havia 20 combinações possíveis de atendimento. O Paulo
  // reencontrava os mesmos clientes. O pool precisa crescer.
  // ===================================================================

  {
    id: "A.6",
    titulo: "A poupança que ele acha que nunca perde",
    tema: "Inflação, juro real e o custo de ficar parado",
    cliente: "Dona Neusa",
    contexto: "Você atende no varejo. O painel da manhã traz Selic a 15% ao ano e IPCA acumulado de 4,5% em doze meses. Dona Neusa, 68 anos, aposentada, mantém R$ 180.000 na poupança há oito anos e diz que nunca perdeu dinheiro com ela. Ela vem pedir um extrato para mostrar ao filho, que anda insistindo para tirar tudo de lá.",
    prompts: [
      {
        fala: "Meu filho vive dizendo que poupança é coisa de quem não entende nada. Mas eu nunca vi meu saldo cair, nunca. Como é que eu estou perdendo dinheiro?",
        alts: [
          { t: "Depende do período. Teve ano em que a poupança foi bem.", grau: 1, nota: "Correto em tese, mas não responde à dúvida e não avança para o caso dela." },
          { t: "Ele tem razão, a senhora está deixando dinheiro na mesa faz oito anos.", grau: 0, nota: "Dá razão ao filho contra a cliente e começa o atendimento por uma repreensão." },
          { t: "A senhora tem razão: o saldo em reais nunca cai mesmo. O que muda é quanto esse saldo compra. É isso que vale a pena olharmos juntos.", grau: 3, nota: "Valida a observação correta da cliente e desloca a conversa para poder de compra, que é o conceito em jogo." },
          { t: "O saldo não cai, mas o rendimento da poupança costuma ficar abaixo de outras aplicações.", grau: 2, nota: "Verdadeiro e relevante, porém troca o tema de poder de compra por comparação de produtos." },
        ],
      },
      {
        fala: "Compra menos como assim? Se estão lá os mesmos 180 mil, eu compro as mesmas coisas, não é?",
        alts: [
          { t: "É a inflação corroendo o poder aquisitivo do capital ao longo do tempo.", grau: 1, nota: "Correto, mas dito em vocabulário técnico para uma cliente que acabou de dizer que não entendeu." },
          { t: "Os preços sobem todo ano, então o dinheiro parado vale menos.", grau: 2, nota: "Simples e correto, embora não mostre a conta que faria a cliente enxergar o tamanho da perda." },
          { t: "Isso é o que chamamos de ilusão monetária, um viés muito comum.", grau: 0, nota: "Rotula o comportamento da cliente em vez de esclarecer a dúvida que ela fez." },
          { t: "Não. Se os preços sobem 4,5% no ano e o dinheiro rende menos que isso, os mesmos 180 mil compram menos no fim do ano.", grau: 3, nota: "Explica a inflação pelo efeito concreto sobre a compra, sem jargão, e amarra ao número do dia." },
        ],
      },
      {
        fala: "Então me diz uma coisa: quanto a poupança rendeu de verdade no último ano?",
        alts: [
          { t: "Perto de 6,2% no ano. Descontando a inflação de 4,5%, o ganho real ficou em torno de 1,6% — foi isso que a senhora ganhou de verdade.", grau: 3, nota: "Responde com o número, faz o desconto da inflação e nomeia o que é ganho real, que é a resposta à pergunta original." },
          { t: "Rendeu cerca de 6,17% no ano, que é a regra da poupança com a Selic acima de 8,5%.", grau: 2, nota: "Traz o número nominal correto, mas para justamente antes do que a cliente precisa saber." },
          { t: "Não sei precisar de cabeça, prefiro conferir no sistema antes de falar.", grau: 1, nota: "Prudente, porém a regra da poupança é conhecida e a hesitação passa insegurança." },
          { t: "Rendeu pouco. O importante é que existem opções melhores hoje.", grau: 0, nota: "Empurra produto sem responder e sem dar à cliente o critério para julgar sozinha." },
        ],
      },
      {
        fala: "E se eu tirasse da poupança, para onde iria? Não quero nada arriscado, tenho medo dessas coisas de bolsa.",
        alts: [
          { t: "A senhora pode aplicar em fundos multimercado, que diversificam o risco entre vários ativos.", grau: 0, nota: "Ignora a restrição de risco que a cliente acabou de declarar." },
          { t: "Existem aplicações conservadoras que acompanham a Selic e ficam acima da poupança. Antes disso, precisamos separar quanto a senhora pode precisar de uma hora para outra.", grau: 3, nota: "Responde no nível de risco pedido e coloca a liquidez antes do produto, que é a ordem correta." },
          { t: "Há títulos públicos pós-fixados e CDBs de liquidez diária que rendem mais que a poupança.", grau: 2, nota: "Alternativa adequada ao perfil, mas pula a conversa sobre reserva e prazo." },
          { t: "Não precisa mexer em nada se a senhora não estiver confortável.", grau: 1, nota: "Respeita o medo, porém abandona a cliente exatamente onde ela pediu orientação." },
        ],
      },
      {
        fala: "Meu filho falou que na poupança o governo garante tudo. Isso é verdade? Porque aí eu prefiro ficar.",
        alts: [
          { t: "A poupança tem cobertura do FGC, como vários outros produtos bancários.", grau: 2, nota: "Corrige a ideia de garantia estatal e amplia o leque, mas sem o limite nem o alcance." },
          { t: "Existe uma garantia, sim, com limite por pessoa. Posso levantar os detalhes.", grau: 1, nota: "Aponta a direção certa e deixa a cliente esperando o essencial." },
          { t: "Não é o governo: quem garante é o FGC, um fundo mantido pelas próprias instituições, até R$ 250 mil por CPF em cada conglomerado. E ele cobre também CDB, LCI e LCA.", grau: 3, nota: "Corrige a informação errada, nomeia quem de fato garante e mostra que a garantia não é exclusividade da poupança — que era o ponto que travava a decisão." },
          { t: "É verdade sim, a poupança é a aplicação mais segura que existe no país.", grau: 0, nota: "Confirma uma informação incorreta e ainda usa um superlativo que não se sustenta." },
        ],
      },
      {
        fala: "Entendi. Mas confesso que vou pensar. Faz tanto tempo que está lá que dá até um aperto de mexer.",
        alts: [
          { t: "Pense com calma. Quando quiser, é só voltar.", grau: 1, nota: "Educado, mas encerra sem oferecer nenhum caminho para a cliente sair da inércia." },
          { t: "É natural. Podemos combinar de conversar de novo depois que a senhora falar com seu filho.", grau: 2, nota: "Respeita o tempo dela e mantém a porta aberta, ainda que devolva a decisão a um terceiro." },
          { t: "Se demorar, a senhora vai continuar perdendo para a inflação todo mês.", grau: 0, nota: "Usa a urgência como pressão sobre uma cliente que acabou de pedir tempo." },
          { t: "Compreendo. Se quiser, começamos por uma parte só, mantendo o resto onde está, e a senhora acompanha o resultado antes de decidir o restante.", grau: 3, nota: "Acolhe a resistência e propõe um passo reversível e proporcional, sem pressionar a decisão inteira." },
        ],
      },
    ],
  },

  {
    id: "A.7",
    titulo: "Ele quer denunciar ao Banco Central",
    tema: "Quem regula o quê: CMN, BACEN, CVM, SUSEP e PREVIC",
    cliente: "Wagner",
    contexto: "Você atende pessoa física em uma agência. Wagner, 44 anos, chega irritado com três reclamações no mesmo dia: uma tarifa de manutenção que ele não reconhece, um fundo de ações que caiu 12% no trimestre e um seguro de vida cuja indenização a seguradora negou ao seu irmão. Ele diz que vai reclamar de tudo no Banco Central, porque 'o Banco Central manda em tudo que é dinheiro'.",
    prompts: [
      {
        fala: "Vou abrir reclamação no Banco Central das três coisas de uma vez. Eles resolvem tudo isso, certo?",
        alts: [
          { t: "Cada uma dessas três tem um supervisor diferente. Vamos separar uma a uma para o senhor reclamar no lugar certo e não perder o prazo.", grau: 3, nota: "Corrige a premissa, explica o porquê da separação e transforma a irritação em um plano de ação." },
          { t: "Não exatamente. Seguros, por exemplo, ficam com a SUSEP.", grau: 2, nota: "Corrige com um exemplo certo, mas trata só um dos três casos." },
          { t: "O senhor pode registrar tudo lá e eles encaminham para quem for competente.", grau: 1, nota: "Não é falso que haja encaminhamento, porém deixa o cliente sem entender a divisão e sem saber o que esperar." },
          { t: "Certo. O Banco Central é o supervisor do sistema financeiro e cuida de tudo isso.", grau: 0, nota: "Confirma um erro que vai fazer o cliente perder tempo em três canais errados." },
        ],
      },
      {
        fala: "Começa pela tarifa então. Cobraram manutenção de conta e eu nem uso essa conta.",
        alts: [
          { t: "Se o senhor não usa a conta, é só encerrar e o problema acaba.", grau: 0, nota: "Resolve o futuro e ignora a cobrança que o cliente contesta." },
          { t: "Essa é a que de fato fica com o Banco Central, que supervisiona as instituições financeiras. Antes disso, vamos ao nosso canal interno: a maioria dos casos de tarifa se resolve aqui, e é o passo anterior.", grau: 3, nota: "Confirma o supervisor correto e ainda coloca a ordem certa dos canais, poupando o cliente de um caminho mais longo." },
          { t: "Tarifa é assunto do Banco Central, o senhor pode registrar por lá.", grau: 2, nota: "Aponta o supervisor certo, sem mencionar que o canal interno vem primeiro." },
          { t: "Tarifa quem regula é o CMN, que edita as normas sobre cobrança.", grau: 1, nota: "O CMN de fato normatiza, mas quem supervisiona e recebe a reclamação é o Banco Central; a informação confunde o cliente." },
        ],
      },
      {
        fala: "Agora o fundo. Caiu 12% em três meses. Isso não é irregularidade?",
        alts: [
          { t: "Fundos de investimento são regulados pela CVM, é para lá que vai essa.", grau: 2, nota: "Acerta o supervisor, mas deixa o cliente achando que a queda em si é o problema." },
          { t: "Oscilação faz parte de renda variável, senhor Wagner.", grau: 1, nota: "Verdadeiro e importante, porém soa como encerramento do assunto e não indica caminho nenhum." },
          { t: "Queda não é irregularidade por si só: fundo de ações oscila. O que a CVM supervisiona é se o fundo seguiu a política do regulamento e se a informação chegou ao senhor.", grau: 3, nota: "Separa prejuízo de irregularidade, nomeia o supervisor correto e diz exatamente o que é passível de reclamação." },
          { t: "Se caiu tanto assim, alguma coisa errada o gestor fez. Vale reclamar na CVM.", grau: 0, nota: "Sugere irregularidade sem qualquer elemento e ainda estimula uma reclamação infundada." },
        ],
      },
      {
        fala: "E o seguro do meu irmão? Negaram a indenização dizendo que era doença preexistente.",
        alts: [
          { t: "Seguro é com a SUSEP.", grau: 2, nota: "Correto e direto, mas curto demais para um cliente que chegou confundindo os três órgãos." },
          { t: "Se foi doença preexistente e não foi declarada, infelizmente a negativa costuma proceder.", grau: 1, nota: "Pode até ser verdade, porém julga o mérito sem os documentos e não informa onde recorrer." },
          { t: "Isso é caso de PREVIC, que cuida de previdência e seguros.", grau: 0, nota: "Erro: a PREVIC supervisiona os fundos de pensão fechados, não seguradoras." },
          { t: "Esse é o único dos três que não passa nem pelo Banco Central nem pela CVM: seguros são supervisionados pela SUSEP, e é lá que a reclamação do seu irmão precisa entrar.", grau: 3, nota: "Fecha a separação dos três casos com o supervisor correto e devolve ao cliente o mapa completo que ele veio buscar." },
        ],
      },
      {
        fala: "Puxa, achei que fosse tudo o mesmo órgão. E o CMN, que o senhor citou, faz o quê?",
        alts: [
          { t: "O CMN não atende cliente: ele é o órgão normativo, define as diretrizes e fixa a meta de inflação. Quem executa e fiscaliza no dia a dia são o Banco Central, a CVM, a SUSEP e a PREVIC.", grau: 3, nota: "Dá a chave da estrutura inteira — normatizar contra supervisionar — que é o que faltava para o cliente parar de se perder." },
          { t: "O CMN é o conselho que fica acima de todos os outros no sistema financeiro.", grau: 1, nota: "Hierarquia vaga que não explica a diferença de função nem ajuda o cliente a se orientar." },
          { t: "Ele edita as normas do sistema financeiro; a fiscalização fica com os supervisores.", grau: 2, nota: "Correto e enxuto, embora sem exemplos que fixem a distinção." },
          { t: "É o órgão que o senhor pode acionar se os outros não resolverem.", grau: 0, nota: "Informação incorreta: o CMN não é instância de recurso do consumidor." },
        ],
      },
      {
        fala: "Beleza. Anota tudo isso num papel para mim? Não quero errar de novo.",
        alts: [
          { t: "Não precisa anotar, é só o senhor lembrar que cada assunto tem um órgão.", grau: 0, nota: "Recusa um pedido simples e razoável de um cliente que já se confundiu uma vez." },
          { t: "Anoto agora e coloco o canal de cada uma na ordem: primeiro o nosso atendimento e a ouvidoria, depois o supervisor. É essa ordem que costuma resolver mais rápido.", grau: 3, nota: "Entrega o registro pedido e agrega a sequência de canais, que é a informação que muda o resultado prático." },
          { t: "Claro, escrevo os três órgãos para o senhor levar.", grau: 2, nota: "Atende ao pedido, sem a orientação de ordem que evitaria um novo caminho errado." },
          { t: "Posso mandar por e-mail depois, fica mais organizado.", grau: 1, nota: "Adia a entrega de algo que o cliente pediu para levar agora." },
        ],
      },
    ],
  },

  {
    id: "A.8",
    titulo: "Quatrocentos mil no banco que paga mais",
    tema: "FGC: limite, alcance e o que ele não cobre",
    cliente: "Rosângela",
    contexto: "Você atende no segmento de alta renda. Rosângela, 51 anos, empresária, recebeu R$ 400.000 da venda de um imóvel e chega decidida: quer colocar tudo em CDB de um banco pequeno que anunciou 125% do CDI. Ela diz que leu na internet que 'CDB tem garantia do FGC, então não tem risco nenhum'. O prazo do papel é de três anos, sem liquidez antes do vencimento.",
    prompts: [
      {
        fala: "Achei um CDB pagando 125% do CDI. Como tem FGC, é dinheiro garantido, certo? Quero colocar os 400 mil.",
        alts: [
          { t: "Taxa alta assim costuma indicar banco com dificuldade de captação.", grau: 1, nota: "Observação pertinente, mas responde outra pergunta e soa como alarme antes de qualquer explicação." },
          { t: "Certo. Com FGC o senhor pode aplicar à vontade que não há risco.", grau: 0, nota: "Confirma a premissa errada e ainda desfaz o limite, que é justamente o ponto crítico dos R$ 400 mil." },
          { t: "O FGC existe mesmo, mas ele tem limite por CPF e por instituição. Com 400 mil num banco só, uma parte ficaria fora da cobertura. Vale olharmos isso antes.", grau: 3, nota: "Reconhece a informação correta da cliente, introduz o limite e liga direto ao valor que ela trouxe." },
          { t: "O FGC cobre CDB até um certo valor por CPF em cada conglomerado.", grau: 2, nota: "Correto, porém não faz a ponte com os R$ 400 mil que estão sobre a mesa." },
        ],
      },
      {
        fala: "Limite? Não sabia. Qual é o limite então?",
        alts: [
          { t: "R$ 250 mil por CPF e por instituição.", grau: 2, nota: "Número certo, sem o teto global e sem aplicar ao valor da cliente." },
          { t: "É um valor por pessoa. Posso confirmar o número exato no material do FGC.", grau: 1, nota: "Aponta a existência do limite e adia justamente o dado que decide a alocação." },
          { t: "São R$ 250 mil por aplicação, então basta dividir em duas aplicações no mesmo banco.", grau: 0, nota: "Erro relevante: o limite é por CPF no conglomerado, não por aplicação; dividir no mesmo banco não amplia cobertura." },
          { t: "São R$ 250 mil por CPF em cada conglomerado financeiro, com um teto global de R$ 1 milhão a cada quatro anos. Nos seus 400 mil, 150 mil ficariam descobertos.", grau: 3, nota: "Dá os dois limites e aplica ao caso concreto, mostrando exatamente quanto ficaria exposto." },
        ],
      },
      {
        fala: "Então eu divido entre bancos diferentes e resolvo?",
        alts: [
          { t: "É um caminho, sim, desde que sejam conglomerados diferentes — duas marcas do mesmo grupo contam como uma só. E ainda restaria olhar o prazo de três anos.", grau: 3, nota: "Confirma a estratégia, corrige a armadilha do conglomerado e já sinaliza o segundo risco, que a cliente ainda não viu." },
          { t: "Resolve. Pode dividir em dois bancos e fica tudo coberto.", grau: 1, nota: "Simplifica demais: sem a ressalva do conglomerado, a cliente pode dividir entre duas marcas do mesmo grupo." },
          { t: "Sim, e é importante que sejam instituições de conglomerados distintos.", grau: 2, nota: "Correto e com a ressalva certa, mas sem avançar para o prazo, que é o outro problema da operação." },
          { t: "Dividir não adianta muito, o risco continua o mesmo.", grau: 0, nota: "Informação incorreta: a divisão entre conglomerados amplia a cobertura de fato." },
        ],
      },
      {
        fala: "Que prazo? Ah, é. São três anos. Mas eu não pretendo mexer mesmo.",
        alts: [
          { t: "Então tudo bem, se a senhora não vai mexer o prazo não atrapalha.", grau: 1, nota: "Aceita a intenção declarada como se fosse garantia de que nada vai mudar em três anos." },
          { t: "Só que sem liquidez antes do vencimento a senhora não consegue sacar nem em emergência, e o FGC não cobre esse tipo de aperto. Antes de travar tudo, quanto a senhora precisa manter acessível?", grau: 3, nota: "Explica que garantia e liquidez são coisas diferentes e faz a pergunta que estrutura a decisão." },
          { t: "Três anos é bastante tempo, vale confirmar se não vai precisar do dinheiro.", grau: 2, nota: "Levanta o ponto certo, sem separar o conceito de garantia do de liquidez." },
          { t: "Se precisar antes, dá para vender no mercado secundário.", grau: 0, nota: "Promessa sem lastro: CDB de banco pequeno costuma não ter mercado secundário líquido." },
        ],
      },
      {
        fala: "E se o banco quebrar mesmo, quanto tempo demora para eu receber do FGC?",
        alts: [
          { t: "Depende do processo de liquidação da instituição.", grau: 2, nota: "Correto, mas genérico demais para uma cliente prestes a concentrar R$ 400 mil." },
          { t: "Nunca acompanhei um caso desses de perto, então prefiro não estimar.", grau: 1, nota: "Sinceridade sem conteúdo: o funcionamento do FGC é informação pública e esperada do profissional." },
          { t: "Não é imediato: o pagamento vem depois da liquidação e do levantamento dos credores, e esse período pode se estender. É mais um motivo para não concentrar tudo num emissor só.", grau: 3, nota: "Responde com honestidade sobre o prazo e converte a resposta em critério de alocação." },
          { t: "É rápido, o FGC costuma pagar em poucos dias.", grau: 0, nota: "Promessa de prazo que não se sustenta e cria expectativa errada sobre a garantia." },
        ],
      },
      {
        fala: "Certo, mudei de ideia sobre colocar tudo num lugar só. Como a senhora faria?",
        alts: [
          { t: "Dividiria entre três bancos diferentes para ficar tudo dentro do limite.", grau: 2, nota: "Resolve a cobertura, mas ignora a reserva de liquidez discutida há pouco." },
          { t: "Eu manteria o CDB de 125% do CDI, que é uma taxa muito boa.", grau: 0, nota: "Volta ao ponto de partida e coloca a taxa acima de tudo que foi levantado." },
          { t: "Depende dos seus objetivos, precisaríamos mapear com calma.", grau: 1, nota: "Evasivo diante de uma cliente que pediu uma recomendação direta depois de todo o diagnóstico." },
          { t: "Eu separaria uma reserva com liquidez diária, distribuiria o restante em emissores de conglomerados diferentes respeitando os R$ 250 mil, e só depois olharia a taxa. A taxa é o último critério, não o primeiro.", grau: 3, nota: "Fecha com uma ordem de decisão defensável — liquidez, risco de crédito, depois retorno — e explicita por que a taxa não vem primeiro." },
        ],
      },
    ],
  },

  {
    id: "A.9",
    titulo: "Três por cento ao mês, garantido",
    tema: "Risco e retorno, promessa de rentabilidade e o que a CVM autoriza",
    cliente: "Sandro",
    contexto: "Você é assessor em uma corretora. Sandro, 36 anos, motorista de aplicativo, guardou R$ 60.000 para a entrada de um apartamento em dois anos. Ele viu uma live em que um perfil com muitos seguidores oferece uma 'operação estruturada' que pagaria 3% ao mês garantidos, sem risco, e pede que você compare com o que a corretora oferece. A Selic está em 15% ao ano.",
    prompts: [
      {
        fala: "Vi uma operação que paga 3% ao mês garantido. Aqui na corretora tem algo assim?",
        alts: [
          { t: "Não temos, e vale a gente olhar esse número com calma: 3% ao mês dá mais de 42% ao ano, quase o triplo da Selic. Esse tamanho de retorno não convive com a palavra garantido.", grau: 3, nota: "Recusa sem desdém, converte a taxa mensal em anual e ancora a comparação na Selic, dando ao cliente o critério para julgar sozinho." },
          { t: "Não trabalhamos com isso. É golpe na certa.", grau: 1, nota: "A conclusão pode até estar certa, mas afirmada sem elemento nenhum ela não ensina o cliente a se defender da próxima." },
          { t: "Aqui não temos produto com rentabilidade garantida nesse patamar.", grau: 2, nota: "Correto e honesto, porém não mostra ao cliente por que o patamar é implausível." },
          { t: "Se a rentabilidade é essa, talvez valha a pena o senhor diversificar e colocar uma parte lá.", grau: 0, nota: "Endossa uma promessa implausível e ainda sugere expor o dinheiro do cliente a ela." },
        ],
      },
      {
        fala: "Mas o cara mostrou print de rendimento. Tinha gente comentando que recebeu.",
        alts: [
          { t: "Se tem gente recebendo, é sinal de que a operação está funcionando.", grau: 0, nota: "Confunde pagamento inicial com solidez e é exatamente o raciocínio que sustenta esse tipo de esquema." },
          { t: "Print e comentário não são prova, porque quem paga os primeiros com o dinheiro dos últimos também consegue mostrar print. O que dá para verificar é se a pessoa e o produto têm registro na CVM.", grau: 3, nota: "Explica por que a evidência apresentada não vale e substitui por um critério verificável e público." },
          { t: "Sempre tem gente que recebe no começo. Depois para.", grau: 2, nota: "Descreve o padrão corretamente, mas sem dar ao cliente o que fazer com essa informação." },
          { t: "Não dá para confiar em nada que se vê na internet.", grau: 1, nota: "Generalização que não distingue fonte verificável de propaganda." },
        ],
      },
      {
        fala: "Como eu vejo esse registro? Nem saberia por onde começar.",
        alts: [
          { t: "Posso verificar para o senhor e trago a resposta depois.", grau: 1, nota: "Prestativo, mas deixa o cliente dependente em vez de ensiná-lo a conferir sozinho." },
          { t: "Registro não quer dizer muita coisa, tem gente registrada que também dá prejuízo.", grau: 0, nota: "Desqualifica a única verificação objetiva disponível ao cliente." },
          { t: "Dá para consultar no site da CVM se a pessoa é autorizada a recomendar investimento e se a oferta está registrada. Se não estiver em nenhum dos dois, é oferta irregular, independentemente do que ela promete.", grau: 3, nota: "Dá o caminho concreto da consulta e a regra de decisão que vale mesmo sem entender o produto." },
          { t: "A CVM tem uma consulta pública de profissionais e ofertas.", grau: 2, nota: "Aponta a ferramenta certa, sem dizer o que concluir a partir do resultado." },
        ],
      },
      {
        fala: "Entendi. E o dinheiro é para a entrada do apartamento daqui a dois anos. Isso muda alguma coisa?",
        alts: [
          { t: "Com prazo definido, o ideal é buscar aplicações com vencimento próximo à data.", grau: 2, nota: "Recomendação tecnicamente adequada, sem explicitar por que o risco muda quando há data e finalidade." },
          { t: "Dois anos dá tempo de recuperar se algo der errado no meio.", grau: 0, nota: "Trata prazo curto e objetivo essencial como margem para especular." },
          { t: "Sim, precisamos considerar seu horizonte de investimento na recomendação.", grau: 1, nota: "Frase correta, mas genérica: não diz o que o horizonte de dois anos implica na prática." },
          { t: "Muda tudo. Dinheiro com data marcada e finalidade definida não pode depender de sorte: aqui o objetivo é chegar aos dois anos com o valor, não maximizar retorno.", grau: 3, nota: "Liga o horizonte e a finalidade ao nível de risco aceitável, que é o coração da adequação." },
        ],
      },
      {
        fala: "Então o que eu faço com os 60 mil? Deixo na conta?",
        alts: [
          { t: "Na conta parada, não. Para dois anos com data certa, aplicações pós-fixadas de baixo risco cobrem o objetivo. Antes de escolher, preciso atualizar seu perfil de investidor — é o que sustenta a recomendação.", grau: 3, nota: "Responde à pergunta, indica a classe compatível com o objetivo e coloca a análise de perfil onde ela pertence." },
          { t: "Aplicações conservadoras pós-fixadas atendem bem esse prazo.", grau: 2, nota: "Direção correta, sem a etapa de perfil que precede a recomendação." },
          { t: "Deixar na conta é mais seguro do que arriscar com o dinheiro do apartamento.", grau: 1, nota: "Protege do golpe, mas entrega o cliente à inflação por dois anos como se fosse prudência." },
          { t: "Posso montar uma carteira com uma parte em ações para melhorar o retorno.", grau: 0, nota: "Expõe a renda variável um capital com data marcada e finalidade única." },
        ],
      },
      {
        fala: "Última coisa: se eu tivesse colocado lá e desse errado, eu teria alguma proteção?",
        alts: [
          { t: "O FGC acaba cobrindo boa parte dos casos de perda no mercado.", grau: 0, nota: "Erro grave: o FGC cobre depósitos e alguns títulos bancários, não perdas em investimento nem operações irregulares." },
          { t: "Nenhuma. Fora do mercado regulado não há FGC, não há supervisão e não há a quem recorrer — a perda seria integral. É essa a diferença que a taxa alta estava tentando esconder.", grau: 3, nota: "Fecha o atendimento nomeando a ausência de qualquer rede de proteção e amarra de volta à promessa inicial." },
          { t: "Fora do mercado regulado o senhor não teria a proteção do FGC.", grau: 2, nota: "Correto e específico, mas deixa de fora a ausência de supervisão e de recurso." },
          { t: "Teria que recorrer à Justiça, o que costuma demorar bastante.", grau: 1, nota: "Verdadeiro, porém sugere que existe um caminho prático de recuperação que raramente existe." },
        ],
      },
    ],
  },

  // ===================================================================
  // LOTE 3 — MÓDULO 2: produtos de investimento
  // O módulo de maior peso na prova (40%), e o que mais aparece no balcão.
  // ===================================================================

  {
    id: "A.10",
    titulo: "Resgatou no dia 170 e levou um susto",
    tema: "Tabela regressiva, IOF e o custo de resgatar cedo",
    cliente: "Fabiana",
    contexto: "Você atende no varejo digital. Fabiana, 34 anos, aplicou R$ 50.000 num CDB pós-fixado há 170 dias e resgatou tudo ontem para cobrir uma reforma que estourou o orçamento. Ela abriu o extrato, viu o desconto de imposto e mandou mensagem dizendo que foi 'roubada'. O CDB tinha liquidez diária e ela não consultou ninguém antes de resgatar.",
    prompts: [
      {
        fala: "Descontaram 22,5% do meu rendimento! Isso é legal? Ninguém me avisou que ia ter esse tanto de imposto.",
        alts: [
          { t: "Realmente foi muito imposto. Vou verificar se houve erro no cálculo.", grau: 0, nota: "Sugere erro onde a cobrança está correta e cria uma expectativa de estorno que não vai acontecer." },
          { t: "É legal sim, está tudo previsto na tabela do imposto de renda.", grau: 1, nota: "Responde à legalidade e ignora completamente a frustração e a falta de informação prévia." },
          { t: "É a tabela regressiva do imposto de renda, e ela é maior justamente em resgates até 180 dias. Você resgatou no dia 170 — faltaram dez dias para cair de faixa. Deixa eu te mostrar.", grau: 3, nota: "Nomeia a regra, explica por que caiu na faixa mais alta e traz o detalhe do caso dela, que é o que transforma revolta em entendimento." },
          { t: "Todo CDB tem imposto de renda na fonte, isso é padrão do produto.", grau: 2, nota: "Correto, mas não explica por que a alíquota foi a maior possível." },
        ],
      },
      {
        fala: "Como assim faltaram dez dias? Explica isso direito.",
        alts: [
          { t: "Quanto mais tempo aplicado, menor a alíquota. É por isso que resgatar cedo custa mais.", grau: 2, nota: "Explica o princípio corretamente, sem dar os números que permitiriam planejar o próximo resgate." },
          { t: "A tabela é regressiva e vai de 22,5% a 15% conforme o prazo.", grau: 1, nota: "Correto e curto demais: não diz onde ficam as fronteiras, que é justamente o que doeu." },
          { t: "É uma regra do banco para aplicações de curto prazo.", grau: 0, nota: "Informação incorreta: a tabela é da legislação tributária, não do banco." },
          { t: "A alíquota cai conforme o tempo: 22,5% até 180 dias, 20% de 181 a 360, 17,5% de 361 a 720 e 15% acima disso. Você estava no dia 170, dentro da primeira faixa.", grau: 3, nota: "Entrega a tabela inteira, que é o instrumento que ela vai usar em todas as aplicações futuras, e localiza o caso dela nela." },
        ],
      },
      {
        fala: "E se eu tivesse resgatado no dia 30, tinha sido pior ainda?",
        alts: [
          { t: "Bem pior: além dos 22,5%, existe o IOF, que morde o rendimento nos primeiros 30 dias e chega a levar quase tudo nos primeiros dias.", grau: 3, nota: "Introduz o segundo tributo, que é o mais brutal no curtíssimo prazo, e responde exatamente ao cenário que ela imaginou." },
          { t: "Sim, no primeiro mês ainda incide IOF sobre o rendimento.", grau: 2, nota: "Traz o IOF corretamente, sem transmitir o tamanho do impacto nos primeiros dias." },
          { t: "A alíquota do imposto de renda seria a mesma, 22,5%.", grau: 1, nota: "Verdadeiro quanto ao IR, mas omite o IOF, que é o que dominaria o resultado no dia 30." },
          { t: "Não, no primeiro mês costuma não ter imposto nenhum.", grau: 0, nota: "Erro grave: é justamente no primeiro mês que a tributação é mais pesada, por causa do IOF." },
        ],
      },
      {
        fala: "Poxa. E tem alguma aplicação que não tem esse imposto todo?",
        alts: [
          { t: "Fundos de investimento não têm essa tabela, então saem melhor.", grau: 0, nota: "Falso: fundos de renda fixa seguem a mesma tabela regressiva e ainda têm come-cotas." },
          { t: "Tem: LCI e LCA são isentas de imposto de renda para pessoa física. A contrapartida é a carência — nelas você não resgata quando quer, e foi exatamente disso que você precisou.", grau: 3, nota: "Apresenta a alternativa isenta e imediatamente a condição que a torna inadequada ao problema real da cliente, sem vender ilusão." },
          { t: "LCI e LCA são isentas de imposto de renda para pessoa física.", grau: 2, nota: "Informação correta, mas oferecida sem a carência a uma cliente que acabou de precisar de dinheiro às pressas." },
          { t: "A poupança é isenta e tem liquidez, seria uma opção.", grau: 1, nota: "É verdade, porém devolve a cliente a um rendimento muito inferior sem discutir o custo dessa escolha." },
        ],
      },
      {
        fala: "Entendi. O problema é que eu nunca sei quando vou precisar do dinheiro.",
        alts: [
          { t: "Vale dividir o dinheiro entre prazos diferentes, conforme a necessidade.", grau: 2, nota: "Direção correta, sem explicitar o critério que separa um bloco do outro." },
          { t: "Aí não tem jeito, você vai sempre pagar 22,5%.", grau: 0, nota: "Conclusão derrotista e incorreta: parte do capital dela pode perfeitamente esperar." },
          { t: "Então o caminho não é fugir do imposto, é separar em dois blocos: uma reserva com liquidez, onde o imposto é o preço da tranquilidade, e o restante em prazos mais longos, onde a alíquota cai.", grau: 3, nota: "Reenquadra o problema: em vez de perseguir isenção, estrutura a carteira pelo uso do dinheiro." },
          { t: "Nesse caso o melhor é manter tudo com liquidez diária mesmo.", grau: 1, nota: "Seguro, mas condena todo o capital à alíquota máxima para sempre." },
        ],
      },
      {
        fala: "Faz sentido. Você consegue me ajudar a montar isso?",
        alts: [
          { t: "Claro. Posso já deixar uma sugestão de carteira pronta para você aprovar.", grau: 1, nota: "Pula o diagnóstico e apresenta produto antes de conhecer as necessidades da cliente." },
          { t: "Consigo sim, vamos marcar uma conversa para levantar seus objetivos.", grau: 2, nota: "Aceita e propõe o levantamento, embora sem indicar por onde vai começar." },
          { t: "Nesse caso o ideal é você procurar um planejador financeiro.", grau: 0, nota: "Encaminha para fora um pedido que está exatamente dentro da sua atribuição." },
          { t: "Consigo. Vamos começar pelo valor que precisa ficar acessível para emergências e só depois olhar prazos e produtos.", grau: 3, nota: "Aceita e estabelece a ordem correta: dimensionar a reserva antes de escolher qualquer produto." },
        ],
      },
    ],
  },

  {
    id: "A.11",
    titulo: "O fundo rendeu menos que o CDI",
    tema: "Taxa de administração, índice de referência e come-cotas",
    cliente: "Otávio",
    contexto: "Você atende clientes de varejo alta renda. Otávio, 47 anos, dentista, aplicou R$ 300.000 num fundo de renda fixa há catorze meses. Ele comparou o extrato com o CDI do período e viu que o fundo entregou menos. Chega para pedir o resgate imediato e diz que 'fundo é sempre ruim, o banco fica com tudo'. O fundo cobra 1,2% de taxa de administração ao ano e não cobra performance.",
    prompts: [
      {
        fala: "O CDI rendeu mais que o meu fundo. Quero resgatar tudo hoje. Para que eu pago taxa se rende menos?",
        alts: [
          { t: "A taxa explica parte da diferença, mas não toda. Antes de resgatar, deixa eu abrir com você de onde saiu cada pedaço — porque uma parte não voltou nunca e outra você recupera.", grau: 3, nota: "Reconhece a taxa, recusa a explicação única e segura a decisão para depois do diagnóstico, que é o dever aqui." },
          { t: "A taxa de administração de 1,2% ao ano reduz a rentabilidade líquida do fundo.", grau: 2, nota: "Verdadeiro e específico, mas apresenta a taxa como se fosse a explicação inteira." },
          { t: "O CDI é uma referência, o fundo não é obrigado a superá-la.", grau: 1, nota: "Tecnicamente correto e completamente indiferente à insatisfação legítima do cliente." },
          { t: "Concordo, fundo de renda fixa raramente compensa. Faço o resgate agora.", grau: 0, nota: "Endossa uma generalização falsa e executa uma decisão relevante sem nenhum diagnóstico." },
        ],
      },
      {
        fala: "Como assim uma parte eu recupero? Imposto não volta.",
        alts: [
          { t: "Isso mesmo, no fundo você acaba pagando imposto duas vezes.", grau: 0, nota: "Erro que confirma a suspeita do cliente e ainda destrói a confiança no produto e no banco." },
          { t: "O come-cotas não é imposto a mais: em maio e novembro o fundo antecipa parte do IR e, no resgate, você só paga a diferença até a alíquota final. O total não muda, só a data.", grau: 3, nota: "Desfaz o mal-entendido central com precisão: antecipação não é acréscimo, e é isso que faz o extrato parecer pior do que é." },
          { t: "Existe o come-cotas, uma antecipação semestral do imposto de renda.", grau: 2, nota: "Nomeia o mecanismo corretamente, sem explicar que ele é abatido no resgate." },
          { t: "Nos fundos o imposto é recolhido de forma diferente, em duas datas do ano.", grau: 1, nota: "Descreve o calendário e deixa de fora o que o cliente precisa entender: que não é cobrança dupla." },
        ],
      },
      {
        fala: "Tá. E a taxa de 1,2%? Isso é caro ou barato?",
        alts: [
          { t: "É uma taxa acima da média para fundos que seguem o CDI.", grau: 2, nota: "Dá um julgamento comparativo honesto, sem explicar o raciocínio por trás dele." },
          { t: "É a taxa padrão da indústria, todos os fundos cobram por aí.", grau: 0, nota: "Falso e cômodo: existem fundos equivalentes com taxa bem inferior, e o cliente merece saber." },
          { t: "Para um fundo de renda fixa que só acompanha o CDI, 1,2% é caro: a taxa consome uma fatia grande de um retorno que já é conhecido. Faz mais sentido em estratégias onde o gestor tem espaço para acrescentar algo.", grau: 3, nota: "Responde a pergunta com um critério — quanto mais previsível o retorno, menos taxa se justifica — em vez de defender o produto da casa." },
          { t: "Depende da estratégia do fundo e do trabalho de gestão envolvido.", grau: 1, nota: "Evasiva educada que devolve a pergunta ao cliente sem nenhum parâmetro." },
        ],
      },
      {
        fala: "Então o fundo é ruim mesmo. Por que vocês vendem isso?",
        alts: [
          { t: "Fundos servem para quem quer diversificação e gestão profissional.", grau: 1, nota: "Discurso de folheto que não responde à acusação nem reconhece o desconforto real." },
          { t: "Esse produto não se encaixa bem no seu objetivo, e isso deveria ter sido visto antes.", grau: 2, nota: "Assume a falha de adequação com honestidade, mas deixa passar a generalização do cliente." },
          { t: "Cada cliente escolhe o que quiser, nós só oferecemos as opções.", grau: 0, nota: "Transfere ao cliente a responsabilidade por uma recomendação que partiu da instituição." },
          { t: "Nesse seu caso específico, com esse objetivo, esse fundo não é a melhor escolha — e é justo você cobrar isso. O que não é verdade é que fundo seja ruim por definição: o problema aqui é o encaixe.", grau: 3, nota: "Admite o erro de adequação sem se esconder e ao mesmo tempo impede que o cliente saia com uma conclusão errada que vai custar caro depois." },
        ],
      },
      {
        fala: "Certo. Se eu resgatar tudo agora, perco alguma coisa?",
        alts: [
          { t: "Você paga a diferença de imposto até a alíquota do prazo e some com o que já foi antecipado — não há multa. O ponto é decidir para onde vai, senão o dinheiro fica parado rendendo nada.", grau: 3, nota: "Responde ao custo concreto do resgate e já aponta o risco maior, que é resgatar sem destino." },
          { t: "Não há carência nem multa, o resgate é livre.", grau: 2, nota: "Correto quanto ao produto, sem tratar do imposto nem do destino do dinheiro." },
          { t: "Perde a rentabilidade que o fundo faria daqui para frente.", grau: 1, nota: "Argumento de retenção que ignora que o cliente já concluiu que o fundo não serve." },
          { t: "Sim, resgatar antes de dois anos gera penalidade tributária no fundo.", grau: 0, nota: "Informação incorreta: não existe penalidade, apenas a alíquota conforme o prazo." },
        ],
      },
      {
        fala: "Então me sugere: para onde eu levo esses 300 mil?",
        alts: [
          { t: "Com esse valor eu diversificaria em multimercados e um pouco de ações.", grau: 0, nota: "Sobe o risco de um cliente que veio reclamar de um fundo conservador, sem qualquer análise de perfil." },
          { t: "Depende de quando você vai precisar deles, e isso eu ainda não sei. Me diz o horizonte e eu te trago duas ou três opções com o custo total de cada uma na mesa.", grau: 3, nota: "Recusa recomendar sem a informação que fundamenta a recomendação e se compromete a mostrar custo, que foi a queixa de origem." },
          { t: "Um título público pós-fixado resolveria, com custo muito menor.", grau: 2, nota: "Alternativa coerente com a queixa, apresentada antes de conhecer o prazo do cliente." },
          { t: "Tenho um fundo da casa com taxa menor que eu posso te mostrar.", grau: 1, nota: "Pode até ser adequado, mas oferecer produto da casa logo depois dessa conversa exige mais cuidado." },
        ],
      },
    ],
  },

  {
    id: "A.12",
    titulo: "A previdência que o pai indicou",
    tema: "PGBL e VGBL, modelo de declaração e portabilidade",
    cliente: "Simone",
    contexto: "Você atende no segmento de investimentos. Simone, 39 anos, autônoma sem vínculo com o INSS há três anos, contratou um PGBL há dois anos por indicação do pai, que sempre usou esse tipo de plano. Ela declara pelo modelo simplificado e nunca deduziu nada. Aporta R$ 1.200 por mês e chega perguntando por que 'esse desconto de 12% que meu pai fala' nunca apareceu na declaração dela.",
    prompts: [
      {
        fala: "Meu pai disse que a previdência abate 12% do imposto. Faz dois anos que eu aporto e nunca vi esse abatimento. O que está errado?",
        alts: [
          { t: "Seu pai deve ter se confundido, esse benefício não é bem assim.", grau: 1, nota: "Desautoriza a fonte da cliente sem explicar a regra, e ela sai sem entender nada." },
          { t: "Provavelmente sua contadora não informou o plano na declaração. Vale conferir com ela.", grau: 0, nota: "Atribui o problema a um terceiro quando a causa é a incompatibilidade do produto com a situação da cliente." },
          { t: "Nada está errado com o plano, mas ele não é o certo para você: a dedução do PGBL só existe para quem declara no completo e contribui ao regime oficial. Você está nos dois casos de fora.", grau: 3, nota: "Localiza o problema exatamente onde ele está — a adequação, não o produto — e nomeia as duas condições que a cliente não cumpre." },
          { t: "A dedução do PGBL vale para quem declara pelo modelo completo.", grau: 2, nota: "Aponta uma das condições corretamente, deixando de fora a contribuição ao regime oficial, que também falha no caso dela." },
        ],
      },
      {
        fala: "Como assim regime oficial? Eu sou autônoma, não contribuo com nada há três anos.",
        alts: [
          { t: "Sem contribuição ao INSS, a dedução do PGBL não se aplica.", grau: 2, nota: "Correto e direto, sem mencionar a tributação sobre o total no resgate." },
          { t: "Então realmente não faz sentido você manter esse plano.", grau: 1, nota: "Conclusão provavelmente certa, tirada antes de a cliente entender o porquê." },
          { t: "Mesmo sem contribuir, você pode deduzir no ano em que voltar a contribuir.", grau: 0, nota: "Erro: a dedução é apurada no próprio exercício e não retroage a aportes de anos anteriores." },
          { t: "É esse o ponto: a dedução exige contribuição ao INSS ou a regime próprio. Sem ela, o PGBL não devolve nada em imposto — e ainda vai tributar o valor total no resgate, não só o rendimento.", grau: 3, nota: "Confirma a incompatibilidade e revela a consequência mais cara, que é a base de cálculo do resgate, algo que a cliente ainda não sabia." },
        ],
      },
      {
        fala: "Tributar o valor total? Achei que imposto fosse só sobre o que rendeu.",
        alts: [
          { t: "No VGBL é assim, só sobre o rendimento. No PGBL o imposto incide sobre tudo que sair, aporte e rendimento juntos — é a contrapartida da dedução que você não está usando.", grau: 3, nota: "Contrasta as duas bases de cálculo e mostra que a regra do PGBL é o outro lado de um benefício que ela não recebe." },
          { t: "No PGBL o imposto incide sobre o valor total do resgate.", grau: 2, nota: "Fato correto, sem a comparação com o VGBL que faria a cliente entender a lógica." },
          { t: "Depende da tabela que você escolheu no momento da contratação.", grau: 0, nota: "Confunde base de cálculo com tabela de alíquota; são coisas independentes." },
          { t: "Sim, essa é uma característica do PGBL que costuma surpreender.", grau: 1, nota: "Confirma sem explicar, e a cliente continua sem entender por que a regra é essa." },
        ],
      },
      {
        fala: "Então eu tenho que cancelar e perder tudo que já coloquei?",
        alts: [
          { t: "Infelizmente, para trocar de plano é preciso resgatar e recolher o imposto.", grau: 0, nota: "Informação incorreta que custaria caro à cliente e a faria desistir da solução adequada." },
          { t: "Não precisa cancelar. Existe portabilidade: o saldo migra de um plano para outro sem passar pelo seu bolso e sem incidir imposto na transferência.", grau: 3, nota: "Resolve o medo central da cliente com o instrumento correto e destaca justamente o que faz a portabilidade valer a pena: não há tributação no caminho." },
          { t: "Dá para fazer portabilidade do saldo para outro plano.", grau: 2, nota: "Aponta o caminho certo, sem esclarecer que a operação não é tributada." },
          { t: "Resgatar agora seria ruim pela alíquota. Melhor deixar como está e parar de aportar.", grau: 1, nota: "Evita a perda imediata, mas mantém a cliente presa a um produto inadequado sem oferecer a saída que existe." },
        ],
      },
      {
        fala: "Portabilidade eu posso fazer para qualquer plano? Inclusive de outra seguradora?",
        alts: [
          { t: "Pode portar para qualquer plano, inclusive mudando de PGBL para VGBL.", grau: 0, nota: "Erro relevante: a portabilidade entre tipos diferentes não é permitida, por causa do tratamento fiscal distinto." },
          { t: "Sim, a portabilidade entre seguradoras é livre no mercado.", grau: 1, nota: "Metade certa: livre entre seguradoras, mas não entre tipos de plano." },
          { t: "Para outra seguradora, sim. O que não dá é trocar de tipo: PGBL vai para PGBL, VGBL para VGBL. Como o seu caso pede VGBL, o caminho é diferente e a gente precisa avaliar juntos.", grau: 3, nota: "Dá a regra completa, incluindo a restrição que atinge exatamente o caso dela, e não esconde que a solução ideal exige uma decisão a mais." },
          { t: "Pode ser para outra instituição, desde que entre planos do mesmo tipo.", grau: 2, nota: "Enuncia a regra corretamente, sem aplicá-la ao caso concreto da cliente." },
        ],
      },
      {
        fala: "Que confusão. Se eu tivesse perguntado antes de assinar, teria evitado tudo isso?",
        alts: [
          { t: "Sim, uma análise de perfil e da sua situação fiscal teria apontado isso.", grau: 2, nota: "Correto, mas devolve o processo em vez do critério que ela pode usar sozinha." },
          { t: "Infelizmente muita gente contrata por indicação de família e depois descobre.", grau: 1, nota: "Solidariza sem entregar nada que a impeça de repetir o erro." },
          { t: "Não se culpe, esses produtos são complicados mesmo.", grau: 0, nota: "Conforta e encerra sem informação, deixando a cliente igualmente exposta na próxima decisão." },
          { t: "Teria. Uma pergunta resolve: você declara no completo e contribui ao regime oficial? Se as duas respostas não forem sim, o PGBL não se justifica. Anota essa, vale para a vida inteira.", grau: 3, nota: "Devolve à cliente um critério simples e reutilizável, transformando o prejuízo em aprendizado concreto." },
        ],
      },
    ],
  },
  // ===================================================================
  // LOTE 4 — renda variável, câmbio, seguros e conduta
  // ===================================================================

  {
    id: "A.13",
    titulo: "Vendeu quinze mil e achou que devia imposto",
    tema: "Renda variável: isenção mensal, day trade, dividendos e JCP",
    cliente: "Murilo",
    contexto: "Você atende na mesa de renda variável. Murilo, 29 anos, analista de sistemas, começou a operar há seis meses. No mês passado vendeu R$ 15.000 em ações com lucro de R$ 1.800 em operações comuns, recebeu R$ 900 de dividendos e R$ 400 de juros sobre capital próprio, e ainda fez duas operações de day trade que somaram R$ 300 de lucro. Ele chega com a planilha aberta, sem saber o que declarar nem o que recolher.",
    prompts: [
      {
        fala: "Vendi 15 mil em açoes e lucrei 1.800. Quanto de imposto eu tenho que pagar sobre isso?",
        alts: [
          { t: "Nessa parte, nada: vendas em operações comuns até R$ 20.000 no mês são isentas para pessoa física, e você ficou abaixo. Mas isso vale só para essa fatia — as outras três têm regras próprias.", grau: 3, nota: "Responde com a regra e o limite exatos, aplica ao caso e já avisa que a isenção não contamina o resto da planilha." },
          { t: "São 15% sobre o lucro apurado, com recolhimento por DARF até o mês seguinte.", grau: 0, nota: "Ignora a isenção mensal e faria o cliente recolher imposto indevido." },
          { t: "Vendas de até R$ 20.000 no mês em operações comuns são isentas de imposto de renda.", grau: 2, nota: "Regra correta, mas sem aplicar ao valor dele e sem separar do restante da planilha." },
          { t: "Existe uma isenção para vendas de pequeno valor no mês. Vou confirmar o limite.", grau: 1, nota: "Aponta a direção e adia justamente o número que decide se ele paga ou não." },
        ],
      },
      {
        fala: "E o day trade? Foram só 300 reais de lucro, deve estar dentro da isenção também.",
        alts: [
          { t: "Melhor você conferir com um contador, day trade é complicado.", grau: 1, nota: "Empurra para fora uma dúvida básica que o profissional deveria responder." },
          { t: "Aí não: a isenção dos R$ 20 mil não alcança day trade. Qualquer lucro em day trade é tributado, mesmo que seja um real, e ainda tem retenção na fonte.", grau: 3, nota: "Corrige a extensão indevida da isenção e explicita que o valor pequeno não muda a regra, que é o erro mais comum aqui." },
          { t: "Day trade tem tratamento tributário próprio, diferente das operações comuns.", grau: 2, nota: "Correto e cuidadoso, sem dizer claramente que não há isenção nenhuma." },
          { t: "Com 300 reais não vale nem a pena se preocupar com isso.", grau: 0, nota: "Orienta o cliente a ignorar uma obrigação tributária por causa do valor." },
        ],
      },
      {
        fala: "Tá. E os 900 de dividendos e os 400 de JCP? Isso conta como lucro também?",
        alts: [
          { t: "Os dois são rendimentos e precisam ser somados ao lucro das vendas.", grau: 0, nota: "Erro que inflaria a base de cálculo e poderia jogar o cliente para fora da isenção indevidamente." },
          { t: "Proventos têm regras específicas na declaração anual.", grau: 1, nota: "Verdadeiro e vago: não diz quais são as regras nem o que o cliente faz com elas." },
          { t: "São coisas diferentes: dividendo chega isento na sua mão, e o JCP já vem com 15% retidos na fonte pela empresa. Nenhum dos dois entra na conta dos R$ 20 mil.", grau: 3, nota: "Separa os dois proventos com o tratamento correto de cada um e ainda esclarece que não afetam o limite de isenção, que era a dúvida implícita." },
          { t: "Dividendos são isentos e o JCP é tributado na fonte.", grau: 2, nota: "Distinção correta, sem a alíquota e sem esclarecer o efeito sobre o limite mensal." },
        ],
      },
      {
        fala: "Então, resumindo, eu só devo imposto sobre os 300 do day trade?",
        alts: [
          { t: "Correto, o day trade é a única fatia tributável do seu mês.", grau: 2, nota: "Confirma com clareza, sem indicar prazo nem procedimento de recolhimento." },
          { t: "Isso, e o valor é tão pequeno que provavelmente nem vai gerar DARF.", grau: 1, nota: "Semeia a ideia de que talvez não precise recolher, que é justamente o risco." },
          { t: "Sim, e o recolhimento acontece automaticamente pela corretora.", grau: 0, nota: "Falso: a retenção na fonte é parcial e a apuração e o recolhimento são responsabilidade do investidor." },
          { t: "É isso. E como já houve retenção na fonte, o que sobrar você apura e recolhe até o último dia útil do mês seguinte. Vale guardar as notas de corretagem de tudo, inclusive do que é isento.", grau: 3, nota: "Confirma a conclusão do cliente, fecha o procedimento e acrescenta a guarda de documentos, que é o que o protege numa fiscalização." },
        ],
      },
      {
        fala: "E se num mês eu vender 25 mil? Perco a isenção só do que passar de 20?",
        alts: [
          { t: "Não é assim: passou de R$ 20.000 no mês, o lucro inteiro daquelas vendas comuns vira tributável, e não só a parte excedente. O limite é uma porteira, não um desconto.", grau: 3, nota: "Desfaz a leitura de faixa progressiva, que é o erro clássico, com uma imagem que fixa a regra." },
          { t: "O limite é sobre o valor vendido no mês; ultrapassando, o lucro passa a ser tributado.", grau: 2, nota: "Correto, embora não deixe explícito que a tributação alcança o lucro todo." },
          { t: "Sim, só a parte que exceder os R$ 20.000 é tributada.", grau: 0, nota: "Erro de leitura da regra que levaria o cliente a recolher menos do que deve." },
          { t: "Nesse caso vale planejar as vendas para não estourar o mês.", grau: 1, nota: "Dica prática útil, mas não responde à pergunta sobre como a regra funciona." },
        ],
      },
      {
        fala: "Nossa, quase paguei errado. Tem como você me mandar isso organizado?",
        alts: [
          { t: "Não precisa, é só você lembrar dos 20 mil que o resto é detalhe.", grau: 0, nota: "Reduz a regra a um único número e ignora day trade e proventos, que foram metade da conversa." },
          { t: "Mando: uma linha para cada tipo de operação, com o que é isento, o que é tributado e o prazo de recolhimento. Assim você repete a conta sozinho todo mês.", grau: 3, nota: "Entrega o pedido em formato que serve para os próximos meses, não só para este." },
          { t: "Claro, preparo um resumo dessa conversa e te envio ainda hoje.", grau: 2, nota: "Atende ao pedido no prazo, sem definir o formato que tornaria o material reutilizável." },
          { t: "Posso indicar o material da corretora sobre tributação em renda variável.", grau: 1, nota: "Encaminha para conteúdo genérico em vez de organizar o caso concreto que acabaram de discutir." },
        ],
      },
    ],
  },

  {
    id: "A.14",
    titulo: "O dólar da viagem e a cotação do aeroporto",
    tema: "Câmbio: VET, modalidades e transparência de custo",
    cliente: "Kelly",
    contexto: "Você atende no varejo. Kelly, 31 anos, viaja para os Estados Unidos em três semanas e quer levar US$ 4.000. Ela pesquisou em três lugares, anotou as cotações e ficou com a menor, de uma casa de câmbio que anunciava a taxa mais baixa da cidade. Ela chega para conferir se fez bom negócio e comenta que 'a cotação é a mesma em todo lugar, o que muda é a boa vontade de cada um'.",
    prompts: [
      {
        fala: "Achei a 5,40 numa casa de câmbio, e aqui vocês estão 5,52. Vou fechar lá. A cotação não é a mesma em todo lugar?",
        alts: [
          { t: "Existe o VET, Valor Efetivo Total, que reúne cotação, tarifas e tributos.", grau: 2, nota: "Nomeia o indicador correto, sem explicar por que a cotação isolada engana." },
          { t: "Se está mais barato lá, feche lá mesmo. Não temos como cobrir.", grau: 0, nota: "Aceita uma comparação que o profissional sabe ser incompleta e deixa a cliente decidir errado." },
          { t: "A cotação de referência é a mesma, mas o que você paga não é só ela: tem tarifa e imposto por cima. É por isso que existe o VET, que junta tudo — e é ele que dá para comparar, não a cotação anunciada.", grau: 3, nota: "Corrige a premissa e entrega o instrumento certo de comparação, que é exatamente o que a decisão dela exige." },
          { t: "Cada instituição pratica a sua taxa, isso varia de acordo com a política comercial.", grau: 1, nota: "Verdadeiro e inútil: não dá à cliente nenhuma forma de comparar as três opções." },
        ],
      },
      {
        fala: "VET? Nunca ouvi falar. Eles são obrigados a me informar isso?",
        alts: [
          { t: "Sim, a informação do VET é obrigatória nas operações de câmbio.", grau: 2, nota: "Correto e direto, sem dizer de onde vem a obrigação nem como usá-la." },
          { t: "Normalmente eles informam, mas nem sempre fica em destaque no contrato.", grau: 1, nota: "Descreve a prática e deixa a cliente sem saber que tem direito de exigir." },
          { t: "É mais uma boa prática do mercado do que uma obrigação formal.", grau: 0, nota: "Informação incorreta que enfraquece um direito que a cliente tem." },
          { t: "São, e por norma do Banco Central: em qualquer operação de câmbio a instituição precisa informar o VET antes de você fechar. Se não informarem, já é um sinal.", grau: 3, nota: "Confirma a obrigatoriedade, nomeia a origem da regra e converte a informação num teste prático que a cliente pode aplicar na hora." },
        ],
      },
      {
        fala: "Entendi. E eu levo em espécie mesmo ou é melhor cartão pré-pago?",
        alts: [
          { t: "Depende do uso: espécie resolve gorjeta e lugar pequeno, mas você carrega risco de perda e roubo. O cartão dá rastreio e recarga, e o custo muda conforme a modalidade — vale comparar o VET de cada uma.", grau: 3, nota: "Trata a escolha pelos critérios que importam para a viagem e aplica o VET que acabou de explicar, em vez de decidir pela cliente." },
          { t: "Cartão pré-pago é sempre melhor, mais seguro e mais prático.", grau: 1, nota: "Recomendação categórica que ignora as situações em que dinheiro em espécie é necessário." },
          { t: "As duas modalidades têm custos diferentes; vale comparar o VET de cada uma.", grau: 2, nota: "Aplica o conceito corretamente, mas sem discutir segurança e uso, que pesam nessa decisão." },
          { t: "Leve tudo em espécie, sai bem mais barato no fim das contas.", grau: 0, nota: "Afirmação sem base e que ainda expõe a cliente a carregar quatro mil dólares em papel." },
        ],
      },
      {
        fala: "E aquela casa de câmbio, é confiável? Fica numa galeria e o rapaz falou que aceita PIX.",
        alts: [
          { t: "Se aceita PIX e emite comprovante, está tudo certo.", grau: 0, nota: "Critério irrelevante: aceitar PIX não diz nada sobre autorização para operar câmbio." },
          { t: "Aí tem uma checagem antes do preço: só instituição autorizada pelo Banco Central pode operar câmbio, e dá para consultar isso no site do Bacen. Se não estiver na lista, o preço não importa.", grau: 3, nota: "Coloca a autorização antes do preço, dá o caminho da consulta e a regra de decisão." },
          { t: "Vale conferir se a casa é autorizada a operar câmbio pelo Banco Central.", grau: 2, nota: "Aponta a verificação certa, sem indicar como fazê-la nem o que concluir." },
          { t: "Casa de câmbio de galeria costuma ser arriscada, eu não faria.", grau: 1, nota: "Julga pelo endereço em vez do critério objetivo, que é a autorização." },
        ],
      },
      {
        fala: "Nossa, nem pensei nisso. E se der problema depois de eu já ter pago?",
        alts: [
          { t: "Aí infelizmente o caminho seria procurar a Justiça.", grau: 1, nota: "Descreve o pior cenário sem apontar o que evitaria chegar até ele." },
          { t: "Dificilmente dá problema, esse tipo de operação é bem simples.", grau: 0, nota: "Minimiza um risco real e desestimula a verificação que acabou de ser recomendada." },
          { t: "Com instituição autorizada você tem contrato de câmbio, comprovante e canal de reclamação no Banco Central. Fora disso, não há nada disso — e é essa a diferença que os doze centavos escondiam.", grau: 3, nota: "Mostra o que se compra além da cotação e fecha o raciocínio ligando de volta à diferença de preço que abriu a conversa." },
          { t: "Numa instituição autorizada existe contrato formal e canal de reclamação.", grau: 2, nota: "Correto e específico, sem amarrar de volta à comparação de preço que motivou tudo." },
        ],
      },
      {
        fala: "Beleza, vou pedir o VET dos três antes de decidir. Faz sentido comprar tudo de uma vez?",
        alts: [
          { t: "Pode dividir a compra em algumas datas para diluir a variação da cotação.", grau: 2, nota: "Recomendação adequada, sem explicar o objetivo e o limite dela." },
          { t: "Compre tudo agora, o dólar tende a subir nas próximas semanas.", grau: 0, nota: "Faz previsão de câmbio, que ninguém tem como sustentar, e a transforma em recomendação." },
          { t: "Tanto faz, o importante é você ter o dinheiro antes de embarcar.", grau: 1, nota: "Não é falso, mas descarta uma decisão em que havia orientação útil a dar." },
          { t: "Como sua viagem é em três semanas, dá para dividir a compra em duas ou três datas e reduzir o efeito de pegar um dia ruim de cotação. Não é para acertar o câmbio, é para não depender de um dia só.", grau: 3, nota: "Responde com uma estratégia proporcional ao prazo e deixa claro que o objetivo é reduzir dependência de uma data, não prever o dólar." },
        ],
      },
    ],
  },

  {
    id: "A.15",
    titulo: "Ele achava que tinha seguro de vida",
    tema: "Seguro, capitalização e previdência: três produtos diferentes",
    cliente: "Seu Genésio",
    contexto: "Você atende no varejo. Seu Genésio, 58 anos, motorista, vem há sete anos debitando R$ 200 por mês em um título de capitalização que contratou achando que era seguro de vida. Ele tem dois filhos menores e a esposa não trabalha fora. Chega hoje porque um colega faleceu e a família não recebeu nada, e ele quer confirmar se a dele 'está protegida'.",
    prompts: [
      {
        fala: "Faz sete anos que eu pago esse seguro de vida de 200 reais. Se acontecer alguma coisa comigo, minha família recebe, né?",
        alts: [
          { t: "Preciso te dizer uma coisa antes de tudo: o que está no seu débito é um título de capitalização, não um seguro de vida. Ele não paga indenização por falecimento.", grau: 3, nota: "Não adia a informação que muda a vida do cliente e nomeia com precisão o que ele tem e o que ele não tem." },
          { t: "Vamos conferir no sistema qual é exatamente o produto contratado.", grau: 2, nota: "Procedimento correto, embora adie uma resposta que o profissional já pode antecipar pelo débito." },
          { t: "Se o senhor está pagando há sete anos, a cobertura deve estar ativa sim.", grau: 0, nota: "Confirma uma proteção inexistente e deixa uma família com dois menores exposta." },
          { t: "Depende das condições gerais da apólice, que variam bastante.", grau: 1, nota: "Resposta genérica que não trata do caso e ainda sugere que existe apólice onde não existe." },
        ],
      },
      {
        fala: "Como assim não é seguro? Eu pago todo mês! Então o que é isso que eu tenho?",
        alts: [
          { t: "Alguns títulos de capitalização também têm cobertura por morte.", grau: 0, nota: "Confunde o cliente misturando produtos e enfraquece o alerta que ele precisa ouvir." },
          { t: "Capitalização é uma poupança programada com sorteios: você resgata o valor ao final do prazo, e nada é pago aos seus filhos em caso de falecimento. Seguro de vida é outro produto, com outra finalidade.", grau: 3, nota: "Define o que ele tem, o que ele não tem e coloca os dois lado a lado, que é a única forma de o cliente entender o tamanho do problema." },
          { t: "É um título de capitalização, um produto de poupança com sorteio.", grau: 2, nota: "Define corretamente, sem contrastar com o seguro que ele acreditava ter." },
          { t: "É um produto financeiro que devolve o valor no fim do prazo.", grau: 1, nota: "Descrição vaga que não menciona a ausência de cobertura, que é o que importa aqui." },
        ],
      },
      {
        fala: "Sete anos jogados fora, então. Perdi tudo que paguei?",
        alts: [
          { t: "Infelizmente em capitalização o resgate costuma ser bem abaixo do que se pagou.", grau: 1, nota: "Verdadeiro, porém entrega só a má notícia e não abre caminho nenhum." },
          { t: "Não perdeu nada, o senhor recebe tudo de volta corrigido no fim do prazo.", grau: 0, nota: "Promessa incorreta sobre o resgate da capitalização." },
          { t: "Perdido não está: o título tem valor de resgate, que costuma ser menor que a soma paga, mas existe. Vou levantar quanto é e a partir dali decidimos o que fazer com esse dinheiro.", grau: 3, nota: "Corrige a ideia de perda total, é honesto sobre o resgate ser menor e transforma a constatação em próximo passo." },
          { t: "O título tem valor de resgate, que pode ser inferior ao total pago.", grau: 2, nota: "Informação correta, sem o compromisso de levantar o número e usá-lo na decisão." },
        ],
      },
      {
        fala: "E agora? Com dois filhos pequenos e a mulher sem trabalhar, eu preciso de proteção mesmo.",
        alts: [
          { t: "Nesse perfil, um seguro de vida temporário costuma ser a solução adequada.", grau: 2, nota: "Recomendação coerente com o caso, oferecida antes de dimensionar a necessidade." },
          { t: "Tenho um plano de vida aqui que já posso contratar hoje para o senhor.", grau: 0, nota: "Vende no momento de maior fragilidade do cliente, sem qualquer análise." },
          { t: "O senhor deveria procurar um corretor de seguros especializado.", grau: 1, nota: "Encaminha para fora uma necessidade que o profissional pode ao menos ajudar a dimensionar." },
          { t: "Precisa, e é o caso mais claro que existe. O ponto de partida é uma pergunta: se o senhor faltar amanhã, de quanto sua família precisaria para se manter até os meninos se formarem? É esse número que define a importância segurada.", grau: 3, nota: "Confirma a necessidade e ensina o método de dimensionar a cobertura, em vez de já apresentar um produto." },
        ],
      },
      {
        fala: "Nunca pensei nisso como conta. E esse dinheiro do seguro, minha família paga imposto?",
        alts: [
          { t: "Não: a indenização do seguro de vida é isenta de imposto de renda e não entra em inventário, então chega rápido a quem o senhor indicar como beneficiário. É justamente por isso que ele resolve o aperto imediato.", grau: 3, nota: "Traz as duas características que fazem o seguro funcionar no momento crítico e explica por que elas importam." },
          { t: "A indenização por morte em seguro de vida é isenta de imposto de renda.", grau: 2, nota: "Correto, sem mencionar que o valor não passa pelo inventário, que é metade do benefício." },
          { t: "Seguro tem tratamento tributário favorecido nesses casos.", grau: 1, nota: "Vago demais para um cliente que precisa entender o que a família de fato recebe." },
          { t: "Paga sim, entra no espólio e é tributado como os demais bens.", grau: 0, nota: "Erro grave que poderia levar o cliente a descartar exatamente o produto de que precisa." },
        ],
      },
      {
        fala: "Quero resolver isso ainda esta semana. Por onde começamos?",
        alts: [
          { t: "Deixa comigo, eu resolvo tudo e o senhor só assina.", grau: 0, nota: "Retira o cliente de uma decisão que é dele e sobre a qual ele acabou de ser mal informado uma vez." },
          { t: "Começamos pelo número: eu levanto o valor de resgate da capitalização e o senhor pensa em quanto sua família precisaria por mês. Com os dois na mão, montamos a cobertura e decidimos o que fazer com o resgate.", grau: 3, nota: "Define tarefas concretas para os dois lados e amarra o resgate ao novo produto, fechando o atendimento com um plano executável." },
          { t: "Podemos agendar para amanhã e eu já trago as opções de seguro de vida.", grau: 2, nota: "Dá agilidade, sem definir o que o cliente precisa levantar até lá." },
          { t: "Primeiro cancele a capitalização, depois vemos o seguro com calma.", grau: 1, nota: "Inverte a ordem: cancelar antes de ter a proteção contratada deixa a família descoberta no intervalo." },
        ],
      },
    ],
  },
  // ===================================================================
  // LOTE 5 — MÓDULO 3 e MÓDULO 4: conduta, adequação, prevenção e dados
  // ===================================================================

  {
    id: "A.16",
    titulo: "A filha que decide por ele",
    tema: "Dever fiduciário, capacidade de decisão e abuso financeiro",
    cliente: "Seu Aparício",
    contexto: "Você atende no varejo. Seu Aparício, 81 anos, é cliente há trinta anos e sempre decidiu sozinho. Nos últimos meses passou a vir acompanhado da filha Regina, que fala por ele o tempo todo. Hoje ela pede o resgate de R$ 250.000 de uma aplicação do pai para 'aplicar num negócio da família', e apresenta uma procuração. Seu Aparício está calado, olhando para o balcão.",
    prompts: [
      {
        fala: "Regina: pode resgatar os 250 mil do meu pai, eu tenho procuração. Ele já sabe de tudo, não precisa explicar de novo.",
        alts: [
          { t: "A senhora pode aguardar um momento? Preciso verificar alguns pontos internos.", grau: 1, nota: "Ganha tempo sem estabelecer o procedimento nem falar com o cliente." },
          { t: "Com procuração está tudo certo, faço o resgate agora.", grau: 0, nota: "Executa uma operação relevante sem conferir o documento nem dirigir uma única palavra ao titular presente." },
          { t: "Preciso conferir a procuração e, como o senhor Aparício está aqui, vou tratar diretamente com ele. É o procedimento sempre que o titular está presente.", grau: 3, nota: "Devolve a palavra ao titular sem acusar ninguém, apoiando-se num procedimento, o que evita constranger a filha e protege o cliente." },
          { t: "Vou precisar analisar a procuração antes de executar qualquer operação.", grau: 2, nota: "Cuidado documental correto, mas não recoloca o titular na conversa." },
        ],
      },
      {
        fala: "Regina: ele está cansado, veio só para assinar. Fala comigo que é mais rápido.",
        alts: [
          { t: "Sem problema, a senhora me passa os dados e eu adianto o preenchimento.", grau: 0, nota: "Cede à pressão e afasta definitivamente o titular de uma decisão sobre o próprio patrimônio." },
          { t: "Seu Aparício, o senhor confirma que autoriza esse resgate?", grau: 2, nota: "Fala com o titular, mas uma pergunta fechada diante da filha convida a um sim automático." },
          { t: "É rápido, senhora Regina, só preciso da confirmação verbal dele.", grau: 1, nota: "Envolve o titular de forma protocolar, sem verificar se ele entende a operação." },
          { t: "Entendo a pressa, mas com o titular presente eu preciso ouvir dele. Seu Aparício, o senhor me acompanha aqui um minuto? Quero explicar o que essa operação faz com o seu dinheiro.", grau: 3, nota: "Mantém o procedimento com firmeza e cortesia e cria um espaço direto com o cliente, que é o que a situação exige." },
        ],
      },
      {
        fala: "Seu Aparício, em voz baixa: ah, se a Regina falou, deve estar certo. Ela cuida das minhas coisas agora.",
        alts: [
          { t: "O senhor confia nela e isso é bonito. Mesmo assim, o dinheiro é seu e eu preciso que o senhor entenda: são 250 mil saindo de uma aplicação que rende hoje. O senhor sabia desse negócio da família?", grau: 3, nota: "Respeita o vínculo, reafirma a titularidade e faz uma pergunta aberta que revela se há entendimento real, sem sugerir má-fé." },
          { t: "Tudo bem, então vamos seguir com o pedido da sua filha.", grau: 0, nota: "Aceita a delegação informal justamente onde o dever de cuidado deveria aumentar." },
          { t: "Mesmo assim preciso que o senhor confirme, é a regra da casa.", grau: 1, nota: "Cumpre a formalidade e não verifica se o cliente compreende o que está autorizando." },
          { t: "O dinheiro é do senhor, então a decisão precisa ser sua. Vou explicar a operação.", grau: 2, nota: "Reafirma corretamente a titularidade, mas segue para a explicação sem sondar o que ele já sabe." },
        ],
      },
      {
        fala: "Seu Aparício: negócio? Ela falou de uma reforma na casa dela, acho. Não lembro de 250 mil, não.",
        alts: [
          { t: "Talvez ele tenha esquecido. Com a procuração eu consigo prosseguir mesmo assim.", grau: 0, nota: "Usa a possível fragilidade cognitiva do cliente como razão para ignorá-lo, que é exatamente o padrão do abuso financeiro." },
          { t: "Então vamos parar por aqui. Não é desconfiança de ninguém: é que eu não posso executar um resgate desse tamanho sem o senhor saber para onde vai. Prefiro que os dois conversem e voltem juntos.", grau: 3, nota: "Interrompe a operação com o fundamento correto e sem acusação, e deixa uma porta aberta para que a família resolva." },
          { t: "Vou registrar a divergência e encaminhar ao compliance antes de qualquer coisa.", grau: 2, nota: "Acionar o controle interno é correto, mas fazer isso sem interromper e explicar deixa o cliente perdido no balcão." },
          { t: "Senhora Regina, o seu pai não parece estar de acordo. Eu não vou fazer isso.", grau: 1, nota: "A decisão de não executar está certa, mas o enfrentamento direto expõe o idoso a um conflito familiar ali mesmo." },
        ],
      },
      {
        fala: "Regina, irritada: você está me chamando de quê? É meu pai, eu cuido dele!",
        alts: [
          { t: "Não estou acusando ninguém, mas o titular precisa entender a operação para eu executá-la.", grau: 2, nota: "Explica o fundamento com clareza, sem indicar como a família pode resolver." },
          { t: "A senhora tem razão, desculpe. Vou seguir com o resgate.", grau: 0, nota: "Recua diante da reação emocional e abandona a proteção do cliente." },
          { t: "Não estou questionando a senhora, e não é pessoal: qualquer resgate desse valor exige que eu confirme o entendimento do titular. Se ele voltar amanhã sabendo do negócio, eu executo sem problema.", grau: 3, nota: "Despersonaliza o conflito, mantém a decisão e mostra o caminho legítimo, o que reduz a chance de retaliação contra o idoso." },
          { t: "Não é isso, senhora. É só um procedimento interno.", grau: 1, nota: "Ameniza a ponto de esvaziar a razão da recusa e enfraquecer a proteção ao cliente." },
        ],
      },
      {
        fala: "Eles saem, e o gerente pergunta: precisava criar caso? A filha é procuradora, estava tudo formalmente certo.",
        alts: [
          { t: "O cliente demonstrou não conhecer a operação, então não executei.", grau: 2, nota: "Fundamento correto, sem mencionar o registro nem a comunicação interna." },
          { t: "Achei melhor não arriscar, o valor era alto demais.", grau: 1, nota: "Justifica pelo valor e não pelo dever, o que enfraquece a decisão numa eventual revisão." },
          { t: "Você tem razão, exagerei. Da próxima executo direto.", grau: 0, nota: "Abandona uma decisão correta sob pressão hierárquica e promete repetir o erro." },
          { t: "Formalmente sim, mas o titular estava presente e não sabia da destinação. Registrei o atendimento e comuniquei internamente. Se eu tivesse executado, teria cumprido a formalidade e falhado com o cliente.", grau: 3, nota: "Sustenta a decisão diante do superior separando validade formal de dever de cuidado, e mostra o registro que documenta a conduta." },
        ],
      },
    ],
  },

  {
    id: "A.17",
    titulo: "Conservador que quer o fundo de ações",
    tema: "Adequação: o que fazer quando o cliente insiste",
    cliente: "Débora",
    contexto: "Você é assessor. Débora, 43 anos, tem perfil conservador no questionário que respondeu há dois meses e uma carteira toda em pós-fixados. Um colega de trabalho ganhou dinheiro num fundo de ações e ela chega decidida a colocar R$ 120.000 — metade do que tem — nesse mesmo fundo. Ela diz que já sabe que pode perder e que não quer 'papo de perfil'.",
    prompts: [
      {
        fala: "Já sei que pode cair, não precisa me explicar risco. Só coloca os 120 mil no fundo e pronto.",
        alts: [
          { t: "Posso executar, mas não posso recomendar: esse fundo está acima do seu perfil, e a regra me obriga a te alertar formalmente antes. Deixa eu te mostrar o que muda e aí a senhora decide.", grau: 3, nota: "Separa recomendar de executar, informa a obrigação legal e mantém a decisão com a cliente sem ceder nem bloquear." },
          { t: "Seu perfil é conservador, então esse fundo não é indicado para a senhora.", grau: 2, nota: "Cumpre o alerta, mas encerra como se fosse proibição e não abre o caminho legítimo." },
          { t: "Antes disso, vamos refazer seu questionário de perfil.", grau: 1, nota: "Refazer o questionário para acomodar a operação é justamente o atalho que a regra quer evitar." },
          { t: "Se a senhora já decidiu, eu executo. É o seu dinheiro.", grau: 0, nota: "Executa operação inadequada ao perfil sem cumprir nenhuma das obrigações de adequação." },
        ],
      },
      {
        fala: "Que alerta formal? Isso é para vocês se protegerem, não é?",
        alts: [
          { t: "É, basicamente é para nos resguardar mesmo.", grau: 0, nota: "Confirma a leitura cínica da cliente e reduz uma proteção dela a burocracia interna." },
          { t: "Protege os dois. Ele existe para eu não te empurrar produto que não combina com o que você me disse, e para você decidir sabendo exatamente o que está aceitando. Sem isso eu não posso seguir.", grau: 3, nota: "Reconhece a desconfiança e responde com a finalidade real da regra, que é limitar o profissional antes de limitar o cliente." },
          { t: "É uma exigência da regulação, previsto na norma de adequação da CVM.", grau: 2, nota: "Correto quanto à origem, mas responde citando norma a quem está questionando a intenção." },
          { t: "É praxe do mercado nesse tipo de operação.", grau: 1, nota: "Trata como costume algo que é obrigação, o que enfraquece a conversa." },
        ],
      },
      {
        fala: "Tá. Então me diz: quanto eu posso perder nesse fundo?",
        alts: [
          { t: "Historicamente esse fundo nunca caiu mais de 20%.", grau: 0, nota: "Transforma histórico em garantia implícita, que é o oposto do que renda variável permite afirmar." },
          { t: "Depende do mercado, é impossível prever.", grau: 1, nota: "Encerra sem dar à cliente nenhum parâmetro, mesmo havendo dados disponíveis." },
          { t: "Não dá para prometer um limite: é renda variável e a queda não tem piso contratual. O que eu posso mostrar é como esse fundo se comportou nas piores janelas dos últimos anos, para a senhora ver o tamanho da oscilação.", grau: 3, nota: "Recusa dar um número que não existe e substitui por evidência histórica, que é a informação honesta disponível." },
          { t: "Fundos de ações podem ter quedas relevantes em períodos de estresse.", grau: 2, nota: "Verdadeiro e genérico: não dimensiona nada para a decisão dela." },
        ],
      },
      {
        fala: "E se eu precisar do dinheiro no meio? Meu carro está velho, posso trocar ano que vem.",
        alts: [
          { t: "O fundo tem resgate em D+30, então precisaria programar com antecedência.", grau: 2, nota: "Informação operacional relevante, sem discutir o conflito entre o objetivo e o produto." },
          { t: "Se precisar, é só resgatar. O fundo tem liquidez.", grau: 1, nota: "Trata liquidez como se resolvesse o problema, ignorando que resgatar na baixa realiza a perda." },
          { t: "Um ano dá tempo de recuperar qualquer queda.", grau: 0, nota: "Afirmação sem base sobre horizonte de recuperação em renda variável." },
          { t: "Esse é o ponto mais delicado: se o carro entra na conta, esse dinheiro tem prazo, e prazo curto com renda variável é o que costuma transformar oscilação em prejuízo realizado. Vale separar antes o valor do carro.", grau: 3, nota: "Descobre uma necessidade que muda a análise e propõe a segregação, em vez de simplesmente registrar a insistência." },
        ],
      },
      {
        fala: "Faz sentido. E se eu colocar 40 mil em vez de 120?",
        alts: [
          { t: "Muda bastante: 40 mil é um terço do que a senhora ia expor e ainda deixa o carro e a reserva fora do risco. Continua acima do seu perfil, então o alerta permanece, mas agora a conta fecha.", grau: 3, nota: "Valida o ajuste, quantifica o efeito e mantém a obrigação de alerta, sem tratar a redução como se resolvesse tudo." },
          { t: "É uma exposição bem mais compatível com a sua situação.", grau: 2, nota: "Aprova o ajuste, sem lembrar que o alerta de adequação continua necessário." },
          { t: "Com 40 mil já não precisa nem do termo de ciência.", grau: 0, nota: "Erro: a inadequação ao perfil não desaparece porque o valor diminuiu." },
          { t: "Se a senhora se sentir mais confortável assim, tudo bem.", grau: 1, nota: "Decide pelo conforto emocional e não pela adequação entre objetivo, prazo e risco." },
        ],
      },
      {
        fala: "Fechado, 40 mil. Depois eu aumento se gostar. Você anota tudo isso?",
        alts: [
          { t: "Não precisa formalizar, ficou tudo combinado entre nós.", grau: 0, nota: "Dispensa o registro justamente na operação em que ele é obrigatório." },
          { t: "Anoto: o alerta de inadequação, a sua ciência e o motivo da redução. E combino de revisar seu perfil quando o carro sair da frente, porque aí a conversa muda de verdade.", grau: 3, nota: "Documenta os três elementos que sustentam a operação e agenda a revisão pelo evento certo, não por prazo arbitrário." },
          { t: "Registro o termo de ciência de risco e sigo com a aplicação.", grau: 2, nota: "Cumpre a formalidade essencial, sem registrar o raciocínio que a fundamentou." },
          { t: "Anoto sim, deixo tudo no seu cadastro.", grau: 1, nota: "Promessa vaga de registro, sem dizer o que exatamente ficará documentado." },
        ],
      },
    ],
  },

  {
    id: "A.18",
    titulo: "Os depósitos em espécie do salão",
    tema: "Prevenção à lavagem: o que comunicar e o que não dizer",
    cliente: "Vânia",
    contexto: "Você é gerente de relacionamento. Vânia, 46 anos, é dona de um salão de beleza e cliente há cinco anos, com movimento estável de cerca de R$ 30.000 por mês. Nos últimos sessenta dias ela passou a depositar em espécie valores fracionados que somam R$ 340.000, sempre logo abaixo de R$ 50.000, e transferiu quase tudo para a conta de um terceiro no dia seguinte. Ela chega para depositar mais R$ 45.000 em notas.",
    prompts: [
      {
        fala: "Trouxe mais 45 mil. Pode ir contando que eu já preencho o depósito.",
        alts: [
          { t: "Preciso registrar a origem dos recursos antes de processar o depósito.", grau: 2, nota: "Faz a pergunta certa, sem enquadrá-la como procedimento geral, o que soa como abordagem pessoal." },
          { t: "A senhora tem depositado bastante ultimamente, aconteceu alguma coisa?", grau: 1, nota: "Comenta o padrão de movimentação com o cliente, o que se aproxima de dar ciência do monitoramento." },
          { t: "Claro, dona Vânia. Antes de registrar, preciso confirmar a origem desses recursos — é um procedimento obrigatório em depósitos em espécie, vale para todo mundo.", grau: 3, nota: "Cumpre o dever de identificar a origem, normaliza o procedimento e não denuncia nenhuma suspeita, que é exatamente o equilíbrio exigido aqui." },
          { t: "Posso sim, é só preencher a ficha ali.", grau: 0, nota: "Processa depósito em espécie relevante sem qualquer verificação de origem, num cliente com padrão alterado." },
        ],
      },
      {
        fala: "É do salão, ué. Faturamento normal. Por que tanta pergunta agora?",
        alts: [
          { t: "Porque o valor está muito acima do seu histórico e isso chama atenção.", grau: 1, nota: "Revela ao cliente que a movimentação foi sinalizada, o que é justamente o que não se deve fazer." },
          { t: "É uma exigência das normas de prevenção à lavagem de dinheiro.", grau: 2, nota: "Verdadeiro e legítimo, mas mencionar a norma pelo nome já sinaliza suspeita." },
          { t: "Desculpe, a senhora tem razão. Vou processar assim mesmo.", grau: 0, nota: "Desiste da verificação obrigatória diante do desconforto do cliente." },
          { t: "É rotina em espécie, dona Vânia. Como o salão faturava por volta de 30 mil por mês, preciso registrar a que se refere esse volume maior — pode ser venda de equipamento, sócio novo, o que for.", grau: 3, nota: "Mantém o tom de rotina, fundamenta a pergunta num dado objetivo e ainda oferece hipóteses legítimas, o que colhe informação sem acusar." },
        ],
      },
      {
        fala: "É de uma sociedade nova. O dinheiro é de um sócio que prefere não aparecer, mas é tudo legal.",
        alts: [
          { t: "Entendi. Para eu registrar corretamente, vou precisar dos dados desse sócio e do contrato — recurso de terceiro depositado na sua conta exige identificação de quem é o dono do dinheiro.", grau: 3, nota: "Trata a informação sem alarde, pede o que a identificação do beneficiário final exige e não antecipa nenhuma conclusão." },
          { t: "Sem problema, então registro como recurso de sociedade.", grau: 0, nota: "Aceita e formaliza uma declaração que descreve exatamente o uso de conta de terceiro para ocultar titularidade." },
          { t: "Nesse caso preciso dos dados do sócio para a identificação.", grau: 2, nota: "Pede o essencial, sem explicar por que a identificação é obrigatória." },
          { t: "Um sócio que não quer aparecer costuma ser um problema, dona Vânia.", grau: 1, nota: "Emite juízo sobre a situação diante da cliente, o que atrapalha a coleta e sinaliza suspeita." },
        ],
      },
      {
        fala: "Ah, deixa isso para lá. Eu deposito em outro banco então. Você não vai comentar isso com ninguém, né?",
        alts: [
          { t: "Vou ter que comunicar isso ao COAF, é obrigação minha.", grau: 1, nota: "A obrigação existe, mas informar o cliente sobre a comunicação é vedado e compromete a investigação." },
          { t: "Não posso comentar nada com terceiros, isso eu garanto. O que eu preciso fazer, e vou fazer, é registrar internamente o atendimento — como faço com qualquer operação em espécie.", grau: 3, nota: "Assegura o sigilo bancário, que é verdade, sem prometer omissão dos registros internos que a lei obriga, e sem revelar a comunicação." },
          { t: "Fique tranquila, isso fica só entre nós.", grau: 0, nota: "Promete o que não pode cumprir e, ao dar essa garantia, obstrui o dever de comunicar." },
          { t: "Não posso comentar com terceiros, mas registro interno é obrigatório.", grau: 2, nota: "Correto nos dois pontos, embora um pouco seco para uma cliente já desconfortável." },
        ],
      },
      {
        fala: "Ela vai embora sem depositar. O que você faz agora?",
        alts: [
          { t: "Como ela desistiu, não houve operação. Só anoto no cadastro.", grau: 0, nota: "Erro central: operações não realizadas e tentativas suspeitas também devem ser comunicadas." },
          { t: "Aviso o gerente da agência e aguardo orientação dele.", grau: 1, nota: "Escalar é razoável, mas a comunicação ao compliance não depende de autorização da chefia." },
          { t: "Comunico ao compliance com todo o histórico dos sessenta dias, e não só o de hoje. A operação não ter sido concluída não afasta o dever: a tentativa e o padrão anterior também são comunicáveis.", grau: 3, nota: "Acerta o ponto que mais se erra na prática — a desistência não encerra a obrigação — e comunica o padrão, não o episódio isolado." },
          { t: "Registro o atendimento e comunico ao compliance da instituição.", grau: 2, nota: "Faz o certo, sem explicitar que o histórico e a tentativa também entram na comunicação." },
        ],
      },
      {
        fala: "O gerente pergunta: e se ela reclamar que perdemos uma cliente de cinco anos?",
        alts: [
          { t: "O dever de comunicar não depende do tempo de relacionamento.", grau: 2, nota: "Princípio correto, sem tratar da conduta esperada se a cliente perguntar." },
          { t: "Se ela reclamar, explico com calma o que aconteceu e por quê.", grau: 0, nota: "Explicar ao cliente o que aconteceu é exatamente dar ciência da comunicação, o que é vedado." },
          { t: "Podemos tentar reconquistá-la depois que a situação se esclarecer.", grau: 1, nota: "Coloca a recuperação comercial à frente e ignora a pergunta sobre conduta." },
          { t: "A relação de cinco anos é o motivo de eu ter notado a mudança, não de ignorá-la. E se ela perguntar, eu não confirmo nem nego comunicação — isso não se conta ao cliente, em nenhuma hipótese.", grau: 3, nota: "Sustenta a decisão diante da pressão comercial e reafirma a vedação de dar ciência, que é a regra mais fácil de quebrar por gentileza." },
        ],
      },
    ],
  },

  {
    id: "A.19",
    titulo: "O consórcio que veio junto com o crédito",
    tema: "Venda casada, conflito de interesse e pressão de meta",
    cliente: "Edmilson",
    contexto: "Você assumiu uma carteira nesta semana. Edmilson, 52 anos, dono de uma transportadora, precisa de R$ 300.000 de capital de giro com urgência para pagar fornecedores. Ao abrir o processo, você vê no sistema uma anotação do assessor anterior: 'liberar crédito somente com adesão a consórcio + seguro prestamista'. O gerente reforça que a meta do trimestre depende dessas duas vendas.",
    prompts: [
      {
        fala: "Edmilson: preciso dos 300 mil até sexta. O rapaz anterior disse que sai, mas que eu teria que levar um consórcio junto. É assim mesmo?",
        alts: [
          { t: "Não é, e é bom o senhor saber: condicionar a liberação do crédito à compra de outro produto é venda casada, que é vedada. Vamos analisar o crédito pelo que ele é.", grau: 3, nota: "Nomeia a prática, informa que é proibida e recoloca a operação nos trilhos, protegendo o cliente de uma imposição ilegal." },
          { t: "O consórcio ajuda na análise, mas não é obrigatório. Fica a seu critério.", grau: 1, nota: "Sugere que a compra melhora a análise, o que mantém a coação em forma disfarçada." },
          { t: "Não é obrigatório. Nenhum produto pode ser condição para a liberação do crédito.", grau: 2, nota: "Corrige a informação com precisão, sem nomear a prática nem tratar do que foi dito ao cliente." },
          { t: "É prática comum nesse tipo de operação, sim.", grau: 0, nota: "Normaliza uma conduta vedada e a apresenta ao cliente como se fosse regra de mercado." },
        ],
      },
      {
        fala: "Edmilson: e o seguro? Ele falou que sem seguro o banco não aprova quem tem empresa.",
        alts: [
          { t: "Nesse valor, o seguro costuma ser exigido pela política interna.", grau: 0, nota: "Inventa uma exigência para viabilizar a venda e repete a conduta do assessor anterior." },
          { t: "Também não procede. O seguro prestamista pode fazer sentido no seu caso — se o senhor faltar, a dívida não passa para a família —, mas isso é uma escolha sua, avaliada à parte, nunca uma condição.", grau: 3, nota: "Desfaz a imposição e ainda apresenta o mérito real do produto, separando informar de condicionar, que é a distinção que importa." },
          { t: "Seguro prestamista é opcional. Se o senhor quiser, avaliamos depois da liberação.", grau: 2, nota: "Corrige e separa as decisões, sem explicar para que o produto serve." },
          { t: "O seguro pesa positivamente na análise de risco da operação.", grau: 1, nota: "Insinua vantagem na aprovação e reintroduz a pressão pela porta dos fundos." },
        ],
      },
      {
        fala: "Edmilson: então o rapaz mentiu para mim? Eu quase assinei.",
        alts: [
          { t: "Cada profissional tem seu jeito de trabalhar, senhor Edmilson.", grau: 0, nota: "Relativiza uma conduta vedada e deixa o cliente sem saber em que acreditar." },
          { t: "Prefiro não comentar sobre o trabalho do colega.", grau: 1, nota: "Discrição compreensível, porém deixa o cliente sem a confirmação de que foi mal informado." },
          { t: "Não vou julgar a intenção dele, mas a informação que o senhor recebeu estava errada e eu vou registrar isso. O senhor tem direito ao crédito analisado sozinho, e é assim que vou tocar.", grau: 3, nota: "Assume a correção sem julgar o colega, registra a ocorrência como manda o controle interno e devolve a segurança ao cliente." },
          { t: "A informação estava incorreta e eu vou reportar internamente.", grau: 2, nota: "Faz o essencial, um pouco seco diante de um cliente que quase assinou algo indevido." },
        ],
      },
      {
        fala: "O gerente te chama de lado: você acabou de jogar fora duas vendas. A meta do trimestre é minha também.",
        alts: [
          { t: "Venda casada é vedada, não posso condicionar o crédito a outro produto.", grau: 2, nota: "Fundamento correto, apresentado sem nenhuma alternativa para a pressão real que o gerente tem." },
          { t: "Eu sei, mas o cliente estava desconfiado e ia dar problema.", grau: 1, nota: "Justifica pela reação do cliente e não pela regra, o que sugere que faria diferente se ele não tivesse notado." },
          { t: "Você tem razão, vou tentar reverter com ele antes de sexta.", grau: 0, nota: "Cede à pressão hierárquica e retoma uma prática que acabou de identificar como proibida." },
          { t: "A meta eu busco, mas não com venda casada — isso é vedado e expõe o banco a sanção. Prefiro trazer o consórcio de novo depois, para quem quiser, do que fechar assim.", grau: 3, nota: "Recusa com fundamento regulatório e risco institucional, e ainda oferece um caminho legítimo para a meta, o que sustenta a posição sem virar confronto." },
        ],
      },
      {
        fala: "O gerente: e aquela anotação no sistema, você vai deixar lá?",
        alts: [
          { t: "Não vou apagar. Vou comunicar ao compliance com a anotação anexada, porque ela é a prova de que a orientação existiu — e se outros clientes receberam a mesma, isso precisa aparecer.", grau: 3, nota: "Preserva a evidência em vez de eliminá-la e transforma um caso isolado em verificação sistêmica, que é o que o controle interno exige." },
          { t: "Vou reportar ao compliance junto com o registro do atendimento.", grau: 2, nota: "Encaminha corretamente, sem explicitar a preservação da evidência nem a possibilidade de haver outros casos." },
          { t: "Vou apagar para não prejudicar ninguém e sigo com o processo.", grau: 0, nota: "Elimina evidência de conduta vedada, o que agrava a falha original." },
          { t: "Prefiro só editar a observação para o cliente não ver aquilo.", grau: 1, nota: "Cuida da aparência do registro em vez de tratar a conduta que ele documenta." },
        ],
      },
      {
        fala: "Edmilson volta: e aí, sai o crédito? Se sair, eu até olho o seguro depois, achei que fazia sentido.",
        alts: [
          { t: "Perfeito, assim fica bem melhor para a análise do seu processo.", grau: 0, nota: "Volta a vincular o seguro à aprovação, retomando a venda casada que ele mesmo denunciou." },
          { t: "O crédito segue pela análise normal e eu te dou retorno até quinta. O seguro fica para depois da liberação, sem qualquer vínculo com ela — se fizer sentido para o senhor, a gente conversa com calma.", grau: 3, nota: "Cumpre o prazo do cliente e mantém a separação absoluta entre as duas decisões, inclusive quando é o próprio cliente quem as aproxima." },
          { t: "Vamos tratar as duas coisas separadamente, primeiro o crédito.", grau: 2, nota: "Mantém a separação correta, sem confirmar prazo ao cliente que tem urgência." },
          { t: "Ótimo, então já aproveito e deixo a proposta do seguro preparada.", grau: 1, nota: "Reaproxima as duas operações justamente onde acabou de estabelecer a separação." },
        ],
      },
    ],
  },

  {
    id: "A.20",
    titulo: "Ele compartilhou os dados sem ler",
    tema: "Open Finance: consentimento, prazo e revogação",
    cliente: "Juninho",
    contexto: "Você atende no canal digital. Juninho, 24 anos, entregador, autorizou o compartilhamento dos seus dados bancários em um aplicativo de crédito que prometia 'taxa personalizada em dois minutos'. Uma semana depois começou a receber ofertas de empréstimo de três empresas diferentes e um limite pré-aprovado que ele não pediu. Ele escreve no chat achando que a conta foi invadida.",
    prompts: [
      {
        fala: "Invadiram minha conta! Tem gente que sabe quanto eu ganho e está me oferecendo empréstimo. Como conseguiram isso?",
        alts: [
          { t: "Não houve invasão. Provavelmente foi um compartilhamento de dados via Open Finance.", grau: 2, nota: "Provavelmente correto, mas afirma antes de confirmar com o cliente." },
          { t: "Vou bloquear sua conta imediatamente por segurança.", grau: 0, nota: "Medida drástica e desproporcional, tomada sem apurar nada, que deixa o cliente sem acesso ao próprio dinheiro." },
          { t: "Vamos verificar juntos, mas antes de falar em invasão: você chegou a autorizar algum aplicativo a acessar seus dados bancários nos últimos dias? No Open Finance esse acesso só existe com o seu consentimento.", grau: 3, nota: "Não descarta a hipótese do cliente nem entra em pânico, e faz a pergunta que separa fraude de compartilhamento autorizado." },
          { t: "Fique tranquilo, isso é normal, deve ser o Open Finance.", grau: 1, nota: "Conclui sem verificar e trata como normal algo que o cliente vive como violação." },
        ],
      },
      {
        fala: "Autorizei um app de empréstimo semana passada. Mas era só para ver a taxa, não para espalhar meus dados!",
        alts: [
          { t: "O consentimento que você deu autoriza o acesso aos dados pela instituição receptora.", grau: 2, nota: "Correto, sem detalhar finalidade, prazo e escopo, que é o que o cliente precisa entender." },
          { t: "É por isso que sempre é preciso ler os termos antes de aceitar.", grau: 0, nota: "Repreende o cliente e não resolve nada do problema que ele trouxe." },
          { t: "Infelizmente, uma vez autorizado não há muito o que fazer.", grau: 1, nota: "Informação incorreta que faz o cliente desistir de um direito que ele tem." },
          { t: "Foi esse o ponto. O consentimento no Open Finance tem finalidade, prazo e escopo definidos, e você aceitou tudo isso numa tela só. Vamos ver exatamente o que você autorizou.", grau: 3, nota: "Explica os três elementos do consentimento e conduz para a verificação concreta, em vez de culpar o cliente por não ter lido." },
        ],
      },
      {
        fala: "Mas eu autorizei UM app. Por que três empresas diferentes estão me ligando?",
        alts: [
          { t: "Aí são duas coisas separadas: o Open Finance compartilha com quem você autorizou, e só. Se outras empresas apareceram, ou houve consentimento adicional que passou despercebido, ou vieram por outro caminho, que a gente precisa apurar.", grau: 3, nota: "Delimita o que o Open Finance faz e o que não faz, e trata o excedente como algo a investigar em vez de aceitar." },
          { t: "O compartilhamento vale apenas para a instituição que você autorizou.", grau: 2, nota: "Regra correta, sem encaminhar o que fazer com as ligações que não se explicam por ela." },
          { t: "Provavelmente elas compraram seus dados de alguma lista.", grau: 1, nota: "Especula sobre a origem sem elemento nenhum e não propõe verificação." },
          { t: "No Open Finance seus dados circulam entre as instituições participantes.", grau: 0, nota: "Erro grave: o compartilhamento é ponto a ponto e vinculado ao consentimento específico." },
        ],
      },
      {
        fala: "Quero cancelar isso agora. Dá para voltar atrás?",
        alts: [
          { t: "Só é possível cancelar quando o prazo do consentimento vencer.", grau: 0, nota: "Nega um direito que existe e prolonga desnecessariamente a exposição do cliente." },
          { t: "Dá, e a qualquer momento: a revogação do consentimento é um direito seu e pode ser feita tanto aqui no nosso aplicativo quanto no do app que você autorizou. Te mostro o caminho agora.", grau: 3, nota: "Confirma o direito, informa os dois canais possíveis e se oferece para conduzir, que é o que resolve o problema hoje." },
          { t: "Sim, o consentimento pode ser revogado a qualquer momento.", grau: 2, nota: "Correto, mas deixa o cliente procurar sozinho onde fazer isso." },
          { t: "Você precisa entrar em contato com o aplicativo que recebeu os dados.", grau: 1, nota: "Encaminha para fora quando a revogação também pode ser feita pela instituição transmissora." },
        ],
      },
      {
        fala: "E os dados que já pegaram? Somem?",
        alts: [
          { t: "Sim, ao revogar todos os dados são apagados automaticamente.", grau: 0, nota: "Promessa falsa que faz o cliente deixar de exercer o direito de exclusão perante a empresa." },
          { t: "Isso já foge um pouco do que eu consigo te informar aqui.", grau: 1, nota: "Desiste de uma pergunta legítima sobre um direito básico do cliente." },
          { t: "Não somem por mágica: a revogação interrompe novos compartilhamentos daqui para frente. O que já foi recebido segue as regras de tratamento e descarte da LGPD, e você pode exigir a exclusão diretamente da empresa.", grau: 3, nota: "É honesto sobre o alcance limitado da revogação e aponta o instrumento correto para o passado, sem prometer o impossível." },
          { t: "A revogação impede novos compartilhamentos daquele consentimento.", grau: 2, nota: "Preciso quanto ao efeito, sem indicar o que fazer com os dados já entregues." },
        ],
      },
      {
        fala: "Achei que Open Finance fosse coisa ruim. É melhor eu nunca mais usar?",
        alts: [
          { t: "O Open Finance é seguro e regulado; o cuidado está em ler o que se autoriza.", grau: 2, nota: "Equilibrado e correto, sem dizer o que exatamente conferir na tela de consentimento." },
          { t: "Se você não se sente confortável, o melhor é não usar mesmo.", grau: 1, nota: "Respeita o desconforto e abre mão de corrigir um entendimento que vai custar oportunidades ao cliente." },
          { t: "É, para quem não lê os termos, melhor ficar longe disso.", grau: 0, nota: "Culpa o cliente e reforça uma conclusão equivocada sobre a ferramenta." },
          { t: "Não precisa. O que te pegou foi aceitar sem olhar finalidade e prazo, não a tecnologia — ela é justamente o que te permite levar seu histórico e conseguir taxa melhor. Antes de aceitar, confira sempre esses dois campos.", grau: 3, nota: "Impede que o cliente saia com uma conclusão que o prejudicaria e entrega uma regra prática de duas verificações." },
        ],
      },
    ],
  },
];
