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
          { t: "A diferença é o indexador: uma segue o CDI, a outra o IPCA somado a uma taxa fixa contratada.", grau: 2, nota: "Correto e claro, mas para em definição: não avança para o caso concreto do cliente." },
          { t: "Claro. Uma acompanha os juros do mercado e a outra paga a inflação mais uma taxa fixa. Vamos ver o que isso significou no seu caso.", grau: 3, nota: "Explica os dois indexadores em linguagem simples e já sinaliza que vai olhar os números dele, que é o que a decisão exige." },
          { t: "Posso consultar os valores no sistema e ver qual rendeu mais até agora, para você decidir.", grau: 1, nota: "Consultar é útil, porém entregar só o número sem explicar o mecanismo deixa o cliente sem entender a escolha." },
          { t: "As duas são LCAs, então são bem parecidas. A diferença fica só na forma de calcular o rendimento.", grau: 0, nota: "Minimiza uma diferença que é justamente o ponto da decisão." },
        ],
      },
      {
        fala: "Tá, mas não entendi direito. Sempre preferi coisa atrelada à inflação, por causa dos anos 80. Só que minha filha falou que a do CDI está rendendo mais.",
        alts: [
          { t: "As duas rendem parecido no longo prazo. A diferença aparece mais no curto prazo.", grau: 1, nota: "Afirmação genérica que não se sustenta com esses números e não ajuda a decidir." },
          { t: "Como o senhor prefere inflação, o melhor é manter a do IPCA e resgatar a outra.", grau: 0, nota: "Recomenda pela preferência declarada sem checar rentabilidade, prazo ou isenção. É atalho, não diagnóstico." },
          { t: "Sua filha tem razão neste momento: com o CDI a 15% e a inflação em 4%, a do CDI está entregando bem mais. Mas isso muda quando os juros caem.", grau: 3, nota: "Usa os números que estão na mesa e ainda mostra que a vantagem é do cenário, não permanente." },
          { t: "A do CDI acompanha os juros, hoje em 15%. A do IPCA paga a inflação, hoje em 4%, mais 5,5% ao ano.", grau: 2, nota: "Traz os dados corretos, mas deixa a comparação por conta do cliente." },
        ],
      },
      {
        fala: "Deixa eu ver se entendi: a do IPCA me garante a inflação e a do CDI depende de como o Banco Central mexer nos juros?",
        alts: [
          { t: "Na prática o CDI acompanha a inflação, então dá no mesmo escolher qualquer uma.", grau: 0, nota: "Informação incorreta: CDI e IPCA são indicadores distintos e podem divergir bastante." },
          { t: "Exato. A do IPCA garante a inflação e a do CDI depende da política monetária do Banco Central.", grau: 2, nota: "Correto, embora deixe de fora a taxa fixa de 5,5%, que é parte relevante do retorno." },
          { t: "Mais ou menos. As duas protegem da inflação, só que de jeitos diferentes.", grau: 1, nota: "Impreciso: a do CDI pode ficar abaixo da inflação em certos cenários, então proteção não é garantida." },
          { t: "É isso. A do IPCA repõe a inflação e ainda soma uma taxa fixa. A do CDI acompanha a taxa básica, que sobe e desce conforme a política monetária.", grau: 3, nota: "Confirma o entendimento do cliente e completa o que faltava: a parte fixa do IPCA e a origem da variação do CDI." },
        ],
      },
      {
        fala: "E se eu resgatar a do CDI? Ela tem 13 meses. Vou pagar imposto sobre esse rendimento?",
        alts: [
          { t: "Nesse caso não: LCA é isenta de imposto de renda para pessoa física, independentemente do prazo. O que é bom conferir é a carência mínima.", grau: 3, nota: "Responde com precisão e traz o ponto que de fato limita o resgate numa LCA: a carência." },
          { t: "Com 13 meses o senhor já saiu da faixa mais alta da tabela, então o imposto fica menor.", grau: 0, nota: "Erro grave: aplica a tabela regressiva a um produto isento." },
          { t: "Vou verificar no sistema como fica a tributação nesse resgate específico.", grau: 1, nota: "Prudente, mas a isenção da LCA é regra conhecida; adiar aqui passa insegurança." },
          { t: "Não paga imposto de renda. A LCA é isenta para pessoa física.", grau: 2, nota: "Correto, mas perde a oportunidade de alertar sobre a carência." },
        ],
      },
      {
        fala: "Entendi. Mas e se eu resgatar a do IPCA, que é maior? Assim sobra mais dinheiro aplicado depois.",
        alts: [
          { t: "Melhor tirar da maior mesmo, assim o senhor não zera nenhuma aplicação.", grau: 1, nota: "Regra de bolso que ignora rentabilidade e prazo de cada papel." },
          { t: "Antes de escolher pelo tamanho, vale olhar o que cada uma rende daqui para frente e qual delas o senhor precisaria manter para os próximos anos.", grau: 3, nota: "Recoloca a decisão no critério certo: o objetivo futuro, e não qual aplicação é maior." },
          { t: "Podemos resgatar da maior, sim. Só quero conferir antes se ela já cumpriu a carência.", grau: 2, nota: "Cuidado correto com a carência, mas aceita o critério do cliente sem discuti-lo." },
          { t: "Tanto faz, o senhor decide. Qualquer uma dá para tirar os 80 mil.", grau: 0, nota: "Devolve a decisão sem orientação, justamente o oposto do que o cliente pediu." },
        ],
      },
      {
        fala: "Você me ajudou bastante. Sobre o que sobrar aplicado, precisa eu fazer alguma coisa agora?",
        alts: [
          { t: "Já aproveito e deixo agendada a aplicação do que sobrar em um fundo mais rentável.", grau: 0, nota: "Decide por conta própria uma nova aplicação sem diagnóstico nem autorização." },
          { t: "Qualquer coisa o senhor passa aqui na agência que a gente conversa.", grau: 1, nota: "Transfere ao cliente a responsabilidade de acompanhar." },
          { t: "Não precisa. Eu acompanho e aviso se aparecer algo relevante para o senhor.", grau: 2, nota: "Compromisso bom, sem critério do que seria relevante." },
          { t: "Agora não. Combino de revisar com o senhor quando a Selic mudar de patamar ou quando a carência da outra LCA vencer, o que vier primeiro.", grau: 3, nota: "Transforma o pós-venda em acompanhamento com gatilho definido, em vez de promessa vaga." },
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
          { t: "Sete anos ajudam, mas metade da reserva num ativo muito volátil pode comprometer o plano se a queda vier perto do fim.", grau: 3, nota: "Conecta o risco ao objetivo concreto dele, que é o que a prova espera." },
          { t: "Dá tempo, sim, mas o tamanho da posição preocupa: metade é muito.", grau: 2, nota: "Aponta o ponto certo, ainda que sem ligar ao objetivo da aposentadoria." },
          { t: "Dá tempo tranquilo. Em sete anos o mercado sempre se recupera.", grau: 0, nota: "'Sempre se recupera' é promessa disfarçada e não se sustenta." },
          { t: "Depende do mercado. Ninguém consegue prever se vai cair ou subir nesse prazo.", grau: 1, nota: "É verdade, mas responder só isso deixa o cliente sem base para decidir." },
        ],
      },
      {
        fala: "E se eu colocar menos? Uns R$ 10 mil, digamos. Aí você me libera?",
        alts: [
          { t: "R$ 10 mil é bem mais razoável. Podemos avaliar dessa forma.", grau: 2, nota: "Direção correta, mas aceita o número do cliente sem checar de onde ele sai." },
          { t: "Reduzir a exposição muda bastante o quadro. Vamos ver quanto você pode arriscar sem afetar a aposentadoria.", grau: 3, nota: "Trabalha com o cliente a capacidade de risco em vez de simplesmente liberar ou barrar." },
          { t: "Qualquer valor em cripto continua desenquadrado do seu perfil conservador.", grau: 1, nota: "Tecnicamente coerente, porém ignora que a decisão final é do cliente informado." },
          { t: "Se é pouco, tanto faz. Nem precisamos registrar nada.", grau: 0, nota: "Valor menor não dispensa alerta nem registro. Isso é falha de conduta." },
        ],
      },
      {
        fala: "Sinceramente, achei que você fosse me empurrar um fundo do banco. Por que está me segurando?",
        alts: [
          { t: "Tenho metas, sim, mas nesse caso elas não mudam a minha recomendação.", grau: 1, nota: "Sinceridade é boa, porém trazer a meta para a conversa desvia o foco do cliente." },
          { t: "Na verdade eu tenho um fundo que bate meta e serve para você. Quer ver?", grau: 0, nota: "Aproveitar a brecha para empurrar produto por meta é exatamente o conflito de interesses vedado." },
          { t: "Meu dever é oferecer o que combina com o seu objetivo. Se eu empurrasse qualquer coisa, estaria falhando com você.", grau: 3, nota: "Explica o dever de adequação em linguagem simples e reforça a confiança." },
          { t: "Porque a regra exige verificar se o produto é adequado ao seu perfil antes de recomendar.", grau: 2, nota: "Correto, mas soa burocrático; o cliente entende melhor pelo interesse dele." },
        ],
      },
      {
        fala: "Entendi. Mas eu quero mesmo assim. Vamos com os R$ 10 mil, é decisão minha.",
        alts: [
          { t: "Não posso permitir. Vou recusar a operação.", grau: 0, nota: "Alertado e ciente, o cliente tem o direito de decidir. Recusar sem base é extrapolar." },
          { t: "Tudo bem, mas quero que você assine o termo de ciência de risco antes.", grau: 2, nota: "O termo é parte do processo, embora o essencial seja a compreensão, não só a assinatura." },
          { t: "Prefiro que você pense mais uns dias antes de a gente fechar.", grau: 1, nota: "Prudente, mas adiar sem motivo novo pode virar obstrução à vontade do cliente." },
          { t: "Respeito a decisão. Vou registrar o alerta de que o produto está fora do seu perfil e seguimos.", grau: 3, nota: "Cliente informado decide; o registro do desenquadramento protege os dois lados." },
        ],
      },
      {
        fala: "Fechado. E se daqui a três meses despencar, o que a gente faz?",
        alts: [
          { t: "A gente combina agora quanto de queda você tolera e o que faremos se chegar lá. Assim ninguém decide no susto.", grau: 3, nota: "Antecipa o cenário ruim e transforma o pós-venda em plano, não em reação." },
          { t: "Aí é esperar. Vender na baixa costuma ser o pior negócio.", grau: 1, nota: "Máxima genérica que não considera o objetivo nem o prazo dele." },
          { t: "Não se preocupe, eu te aviso antes de qualquer queda grande.", grau: 0, nota: "Promessa impossível de cumprir: ninguém antecipa quedas." },
          { t: "Se cair, a gente conversa e reavalia a posição com calma.", grau: 2, nota: "Acolhe, mas deixa a decisão para o pior momento possível: o do prejuízo." },
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
          { t: "Calma, isso é normal em fundo multimercado. Não precisa se preocupar.", grau: 1, nota: "Minimizar o sentimento dela costuma aumentar a desconfiança, não reduzir." },
          { t: "Entendo o susto, dona Neusa. Antes de tirar, posso te explicar em dois minutos o que causou essa queda?", grau: 3, nota: "Acolhe a emoção e pede espaço para informar antes da decisão no impulso." },
          { t: "Posso fazer o resgate, sim. Só queria te contar antes o que aconteceu no mês.", grau: 2, nota: "Respeita a vontade dela, mas colocar o resgate na frente reforça a decisão no susto." },
          { t: "Se você resgatar agora, vai perder dinheiro. Não faça isso.", grau: 0, nota: "Ordem seca, sem explicação e sem acolhimento: fecha o diálogo." },
        ],
      },
      {
        fala: "Explica então. Mas eu não entendo esses nomes complicados, viu?",
        alts: [
          { t: "É complicado mesmo, mas confie em mim: isso passa.", grau: 0, nota: "Pedir confiança no lugar de explicar é o oposto do dever de transparência." },
          { t: "O mercado oscilou bastante esse mês por causa do cenário macroeconômico.", grau: 1, nota: "Vago demais: não explica nada de fato." },
          { t: "É a marcação a mercado: os ativos são reprecificados diariamente conforme a curva de juros.", grau: 2, nota: "Tecnicamente certo, mas usa justamente os termos que ela disse não entender." },
          { t: "O fundo tem títulos que variam de preço todo dia. Quando os juros sobem, esses títulos valem menos hoje, mesmo sem ninguém ter errado.", grau: 3, nota: "Traduz marcação a mercado em linguagem cotidiana, sem infantilizar." },
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
          { t: "Três anos é justamente o horizonte que combinamos. Vamos olhar se a queda muda o plano ou se ela cabe nele.", grau: 3, nota: "Devolve a decisão ao objetivo e ao prazo, que é a régua certa." },
          { t: "Nesse prazo, historicamente esse tipo de fundo se recupera de quedas assim.", grau: 2, nota: "Contextualiza, mas apoiar-se no histórico chega perto de prometer resultado." },
          { t: "Deixa quieto que até lá recupera com folga.", grau: 0, nota: "Garantia de recuperação: promessa que você não pode fazer." },
          { t: "Se você precisa em três anos, talvez seja melhor migrar para algo mais previsível.", grau: 1, nota: "Pode fazer sentido, mas sugerir migração antes de reavaliar o plano é apressado." },
        ],
      },
      {
        fala: "Se eu tirar metade agora e deixar metade, resolve? Pelo menos eu durmo à noite.",
        alts: [
          { t: "Podemos fazer isso, sim. É uma forma de diminuir o desconforto.", grau: 2, nota: "Acolhe, mas sem quantificar o efeito no objetivo dela." },
          { t: "Reduzir a posição para você dormir tranquila é um motivo legítimo. Vamos calcular quanto resgatar sem furar o plano dos três anos.", grau: 3, nota: "Trata a tolerância emocional como dado real e ajusta com técnica." },
          { t: "Metade ainda mantém a exposição ao risco que te incomodou.", grau: 1, nota: "Observação técnica correta que não avança para uma solução." },
          { t: "Não vale a pena mexer. Mantém tudo como está.", grau: 0, nota: "Ignora o desconforto declarado da cliente, que é informação relevante de perfil." },
        ],
      },
      {
        fala: "Está bem, vamos fazer assim. E me avisa se piorar, tá?",
        alts: [
          { t: "Qualquer coisa a senhora me liga que a gente conversa.", grau: 1, nota: "Transfere para a cliente a responsabilidade do acompanhamento." },
          { t: "Não vai piorar, fique tranquila.", grau: 0, nota: "Previsão que ninguém pode dar, e que destrói a confiança se falhar." },
          { t: "Combinado. Vou te ligar no fim de cada mês, e também se a queda passar do limite que definirmos hoje.", grau: 3, nota: "Transforma o pedido vago num acompanhamento com critério e periodicidade." },
          { t: "Pode deixar, eu acompanho e te aviso quando houver movimento relevante.", grau: 2, nota: "Compromisso bom, porém sem critério definido do que é 'relevante'." },
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
          { t: "Não posso: a LGPD proíbe compartilhar dados do cliente sem o consentimento dele.", grau: 0, nota: "Erro clássico. Consentimento não é a única base legal, e a prevenção à lavagem é obrigação." },
          { t: "Compartilho pelos sistemas internos, mas prefiro não usar e-mail comum para esse tipo de dado.", grau: 2, nota: "Cuidado certo com o meio; falta apenas nomear a base legal que autoriza." },
          { t: "Preciso confirmar com o meu gestor antes de encaminhar qualquer dado.", grau: 1, nota: "Prudente, mas atrasa uma apuração que a norma já autoriza." },
          { t: "Posso, sim, pelo canal interno próprio: a apuração de suspeita é hipótese legal de tratamento dos dados.", grau: 3, nota: "A LGPD permite o compartilhamento quando há obrigação legal, e o canal correto preserva o sigilo." },
        ],
      },
      {
        fala: "Auditoria: e o cliente? Alguém avisa que ele está sendo analisado?",
        alts: [
          { t: "Não. Avisar o cliente sobre a análise ou a comunicação caracteriza tipping off e é vedado.", grau: 3, nota: "A vedação de dar ciência ao investigado é ponto central do PLDFT." },
          { t: "Acho melhor não avisar, para não atrapalhar a apuração.", grau: 1, nota: "Chega ao resultado certo por intuição, não pela norma." },
          { t: "Vou ligar para ele confirmar a origem do dinheiro antes de reportarmos.", grau: 0, nota: "Alertar o cliente sobre a suspeita é justamente o que a lei proíbe." },
          { t: "Não avisamos. O procedimento corre sem comunicação ao cliente.", grau: 2, nota: "Conduta correta, sem explicitar por que a vedação existe." },
        ],
      },
      {
        fala: "Auditoria: o valor está alto, mas ele explicou na abertura que recebe do exterior. Isso derruba a suspeita?",
        alts: [
          { t: "Se ele declarou na abertura, o cadastro está em ordem.", grau: 1, nota: "Confunde cadastro regular com ausência de suspeita." },
          { t: "Ajuda a avaliar, mas não elimina: o que pesa é a incompatibilidade com o histórico e o destino de alto risco.", grau: 3, nota: "Mantém a análise ancorada no conjunto de indícios, não numa justificativa isolada." },
          { t: "É um elemento a considerar na análise, junto com os demais indícios.", grau: 2, nota: "Equilibrado, embora não aponte o que de fato pesa no caso." },
          { t: "Sim, com a explicação no cadastro podemos arquivar o alerta.", grau: 0, nota: "Arquivar por causa de uma declaração antiga esvazia o monitoramento." },
        ],
      },
      {
        fala: "Auditoria: e se a análise concluir que é suspeita mesmo? Qual valor mínimo para comunicar ao COAF?",
        alts: [
          { t: "Só a partir de R$ 2 mil em espécie é que nasce a obrigação.", grau: 0, nota: "Esse valor é de registro de operação em espécie, não de comunicação de suspeita." },
          { t: "Acima de R$ 50 mil, que é o limite de registro reforçado.", grau: 1, nota: "Confunde o gatilho de registro com o de comunicação." },
          { t: "Suspeita se comunica independentemente do valor envolvido.", grau: 2, nota: "Correto e direto, sem separar registro de comunicação." },
          { t: "Não existe piso: suspeita de qualquer valor deve ser comunicada, e sem dar ciência ao cliente.", grau: 3, nota: "Valores acionam registro; suspeita aciona comunicação. É a pegadinha mais cobrada." },
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
          { t: "Pelo prazo mínimo que a norma exige, contado do encerramento da relação ou da operação, com o caso documentado ponta a ponta.", grau: 3, nota: "Guarda de registros e trilha documental são parte do dever, não formalidade." },
          { t: "Mantemos os registros arquivados pelo prazo previsto na regulamentação.", grau: 2, nota: "Correto, ainda que genérico sobre a contagem do prazo." },
          { t: "Depois de comunicar ao COAF, podemos descartar o material.", grau: 0, nota: "Descartar registro de operação comunicada contraria o dever de guarda." },
          { t: "Guardamos enquanto o cliente tiver conta conosco.", grau: 1, nota: "A obrigação costuma se estender além do fim do relacionamento." },
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
          { t: "Só consigo oferecer se o produto for adequado ao perfil e à situação dele.", grau: 2, nota: "Correto, embora coloque a conversa em tom de recusa logo de início." },
          { t: "Vou atender e ver o que serve para ele. Se o PGBL couber, ótimo; se não, ofereço o adequado.", grau: 3, nota: "Não confronta o gerente nem abre mão da adequação. É a saída profissional." },
          { t: "Vou tentar, mas não prometo nada.", grau: 1, nota: "Ambíguo: deixa no ar que a meta pode pesar na recomendação." },
          { t: "Pode deixar, encaixo o PGBL nele.", grau: 0, nota: "Decidir o produto antes de conhecer o cliente inverte toda a lógica do atendimento." },
        ],
      },
      {
        fala: "Marcelo: tenho trinta mil guardados. É o que me segura se ficar sem trabalho por uns meses. Queria que rendesse mais.",
        alts: [
          { t: "Temos opções que rendem mais que a poupança, sim. Quer ver?", grau: 1, nota: "Pula para produto sem amarrar a necessidade de liquidez." },
          { t: "Nesse caso a previdência é ótima, porque força você a não mexer.", grau: 0, nota: "Trancar a reserva de emergência em produto de longo prazo é o oposto do adequado." },
          { t: "Como esse dinheiro é a sua segurança, ele precisa render bem mas continuar disponível a qualquer momento.", grau: 3, nota: "Identifica a função do dinheiro e fixa liquidez como requisito antes de falar de produto." },
          { t: "Entendi. Você pensa em usar em quanto tempo, se precisar?", grau: 2, nota: "Boa pergunta de diagnóstico, mas ele já disse que é reserva de emergência." },
        ],
      },
      {
        fala: "Marcelo: um amigo falou que previdência dá desconto no imposto. Isso vale para mim?",
        alts: [
          { t: "Vale sim, todo mundo que aplica em PGBL abate até 12%.", grau: 0, nota: "Informação errada que ainda induz o cliente ao produto da campanha." },
          { t: "Esse benefício vale para quem declara no modelo completo, que não é o seu caso.", grau: 2, nota: "Correto e claro, faltando a condição de contribuir ao regime oficial." },
          { t: "Depende do plano e da sua situação. Podemos simular.", grau: 1, nota: "Evasivo diante de uma pergunta que tem resposta objetiva aqui." },
          { t: "O desconto do PGBL exige declaração completa e contribuição ao INSS. No seu caso, simplificada e autônomo, ele não se aplica.", grau: 3, nota: "Responde exatamente à situação dele, com as duas condições que a prova cobra." },
        ],
      },
      {
        fala: "Marcelo: então o que você me indica para essa reserva?",
        alts: [
          { t: "Algo de liquidez diária e risco baixo, como Tesouro Selic ou um CDB com resgate a qualquer momento e FGC.", grau: 3, nota: "Recomendação coerente com a função do dinheiro e com o perfil." },
          { t: "Podemos dividir: uma parte em renda fixa e outra em previdência para o futuro.", grau: 1, nota: "Misturar a reserva com longo prazo compromete justamente a emergência." },
          { t: "Um VGBL resolve, já que o PGBL não serve para você.", grau: 0, nota: "Trocar de sigla mantém o erro: previdência não é lugar de reserva de emergência." },
          { t: "Aplicações conservadoras com resgate rápido são o caminho para reserva de emergência.", grau: 2, nota: "Direção certa, sem chegar ao produto concreto que o cliente pediu." },
        ],
      },
      {
        fala: "Gerente: e aí, fechou a previdência? Preciso desse número até sexta.",
        alts: [
          { t: "Ainda não consegui. Vou continuar tentando com ele.", grau: 1, nota: "Deixa aberta a porta de insistir num produto já identificado como inadequado." },
          { t: "Não fechou: o dinheiro dele é reserva de emergência e ele declara no simplificado. Vou buscar a meta em quem tem perfil.", grau: 3, nota: "Sustenta a decisão com o motivo técnico e mantém o compromisso com a meta." },
          { t: "Esse cliente não tinha perfil para o produto da campanha.", grau: 2, nota: "Correto, mas sem apresentar o caminho para a meta." },
          { t: "Fechei um valor menor para não ficar sem nada.", grau: 0, nota: "Vender inadequado 'só um pouco' continua sendo vender inadequado." },
        ],
      },
      {
        fala: "Marcelo: gostei do atendimento. Quando eu tiver mais dinheiro, previdência passa a fazer sentido para mim?",
        alts: [
          { t: "Sim, e aí você já aproveita o desconto de 12% no imposto.", grau: 0, nota: "Repete a informação errada: no simplificado, esse desconto não existe." },
          { t: "Com certeza, é só me procurar quando quiser.", grau: 1, nota: "Simpático, porém sem conteúdo que ajude o cliente a decidir." },
          { t: "Sim, quando você já tiver a reserva pronta e pensar no longo prazo.", grau: 2, nota: "Boa condição, sem indicar qual modalidade serviria a ele." },
          { t: "Passa a fazer sentido quando você tiver reserva formada e objetivo de longo prazo. E o VGBL costuma encaixar melhor em quem declara no simplificado.", grau: 3, nota: "Abre a porta futura com o critério certo e já orienta a modalidade adequada." },
        ],
      },
    ],
  },
];
