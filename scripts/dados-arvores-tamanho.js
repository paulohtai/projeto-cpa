// Dados do equilibrar-tamanho-arvores.js — [árvore, decisão, grau, fala nova].
//
// REGRA DE ESCRITA, e ela é explícita de propósito:
//
// 1. Toda alternativa é uma FALA do profissional, de 60 a 105 caracteres. O
//    raciocínio fica no campo `nota`, que aparece depois da escolha. Foi a
//    mistura dos dois dentro do `t` que criou o vício.
//
// 2. O POSTO do tamanho da melhor escolha é decidido ANTES de escrever, e
//    roda entre as quatro posições: posto 1 = a mais longa da decisão,
//    posto 4 = a mais curta. A regra é (índice da árvore + índice da
//    decisão) módulo 4, o que dá 25% em cada posto nas 120 decisões.
//
//    Sem esta regra o resultado é sempre o mesmo: quem escreve alonga a
//    resposta certa porque é a que quer explicar. Medido antes: a melhor era
//    a mais longa em 120 de 120. Numa primeira tentativa de reescrita, sem
//    posto definido, ainda deu 90% — a mão puxa sozinha.
//
// 3. Resposta certa curta não é defeito. "Não. Isso é venda casada, e é
//    vedado" é a melhor fala possível em muitos atendimentos.
module.exports = [

  // ============ A.6 · poupança e juro real · postos 1,2,3,4,1,2 ============
  // decisão 0 — posto 1 (a melhor é a mais longa)
  ["A.6",0,3,"A senhora tem razão: o saldo em reais nunca cai. O que muda é quanto ele compra no mercado."],
  ["A.6",0,2,"O saldo não cai, mas a poupança costuma render abaixo de outras aplicações."],
  ["A.6",0,1,"Depende do período. Teve ano em que ela rendeu bem e ano em que rendeu mal."],
  ["A.6",0,0,"Ele tem razão. A senhora está deixando dinheiro na mesa faz oito anos."],
  // decisão 1 — posto 2
  ["A.6",1,3,"Se os preços sobem 4,5% e o dinheiro rende menos, os mesmos 180 mil compram menos."],
  ["A.6",1,2,"Os preços sobem todo ano, então dinheiro parado vai comprando cada vez menos coisa."],
  ["A.6",1,1,"É a inflação corroendo o poder aquisitivo do capital ao longo do tempo."],
  ["A.6",1,0,"Isso é o que a gente chama de ilusão monetária, um viés bem comum."],
  // decisão 2 — posto 3
  ["A.6",2,3,"Perto de 6,2%. Tirando a inflação de 4,5%, o ganho real foi de 1,6%."],
  ["A.6",2,2,"Rendeu cerca de 6,17% no ano, que é a regra com a Selic acima de 8,5% ao ano."],
  ["A.6",2,1,"Não sei precisar de cabeça agora, prefiro conferir no sistema antes de responder."],
  ["A.6",2,0,"Rendeu pouco. O importante é que existem opções bem melhores hoje."],
  // decisão 3 — posto 4 (a melhor é a mais curta)
  ["A.6",3,3,"Antes do produto: quanto a senhora pode precisar de uma hora para outra?"],
  ["A.6",3,2,"Há títulos públicos pós-fixados e CDBs de liquidez diária acima da poupança."],
  ["A.6",3,1,"Não precisa mexer em nada agora se a senhora não estiver confortável com isso."],
  ["A.6",3,0,"A senhora pode aplicar em multimercados, que diversificam o risco entre ativos."],
  // decisão 4 — posto 1
  ["A.6",4,3,"Não é o governo: quem garante é o FGC, até R$ 250 mil por CPF em cada conglomerado."],
  ["A.6",4,2,"A poupança tem cobertura do FGC, como vários outros produtos bancários."],
  ["A.6",4,1,"Existe uma garantia sim, com limite por pessoa. Posso levantar os detalhes."],
  ["A.6",4,0,"É verdade. A poupança é a aplicação mais segura que existe no país."],
  // decisão 5 — posto 2
  ["A.6",5,3,"Se quiser, começamos por uma parte só e a senhora acompanha o resultado."],
  ["A.6",5,2,"É natural. Podemos conversar de novo depois que a senhora falar com seu filho."],
  ["A.6",5,1,"Pense com calma, dona Neusa. Quando quiser, é só voltar aqui na agência."],
  ["A.6",5,0,"Se demorar, a senhora vai continuar perdendo para a inflação todo mês."],

  // ============ A.7 · quem regula o quê · postos 2,3,4,1,2,3 ============
  ["A.7",0,3,"Cada uma dessas três tem um supervisor diferente. Vamos separar uma a uma."],
  ["A.7",0,2,"Não é bem assim. Seguro, por exemplo, não é com o Banco Central, é com a SUSEP."],
  ["A.7",0,1,"O senhor pode registrar tudo por lá e eles encaminham a quem for competente."],
  ["A.7",0,0,"Certo. O Banco Central supervisiona o sistema e cuida de tudo isso."],

  ["A.7",1,3,"Essa fica com o Banco Central. Mas o nosso canal interno vem antes."],
  ["A.7",1,2,"Tarifa é assunto do Banco Central, o senhor pode registrar por lá mesmo."],
  ["A.7",1,1,"Tarifa quem regula é o CMN, que edita as normas sobre cobrança nas instituições."],
  ["A.7",1,0,"Se o senhor não usa a conta, é só encerrar que o problema acaba sozinho."],

  ["A.7",2,3,"Queda não é irregularidade. A CVM olha se o fundo seguiu o regulamento."],
  ["A.7",2,2,"Fundos de investimento são regulados pela CVM, é para lá que essa vai."],
  ["A.7",2,1,"Oscilação faz parte da renda variável, senhor Wagner. É o produto que o senhor tem."],
  ["A.7",2,0,"Se caiu tudo isso, alguma coisa errada o gestor fez. Vale reclamar na CVM."],

  ["A.7",3,3,"Esse é o único que não passa nem pelo Banco Central nem pela CVM: é com a SUSEP."],
  ["A.7",3,2,"Seguro é com a SUSEP, que supervisiona seguradoras e previdência aberta."],
  ["A.7",3,1,"Se foi doença preexistente não declarada, a negativa costuma proceder."],
  ["A.7",3,0,"Isso é caso de PREVIC, que cuida de previdência e de seguros no país."],

  ["A.7",4,3,"O CMN não atende cliente: ele normatiza. Quem fiscaliza são BC, CVM e SUSEP."],
  ["A.7",4,2,"Ele edita as normas do sistema; a fiscalização fica com os supervisores."],
  ["A.7",4,1,"O CMN é o conselho que fica acima de todos os outros no sistema financeiro."],
  ["A.7",4,0,"É o órgão que o senhor aciona se os outros não resolverem a reclamação."],

  ["A.7",5,3,"Anoto na ordem: primeiro o nosso atendimento e a ouvidoria, depois o supervisor."],
  ["A.7",5,2,"Claro, escrevo os três órgãos aqui para o senhor levar e não se confundir."],
  ["A.7",5,1,"Posso mandar por e-mail depois, assim fica mais organizado para guardar."],
  ["A.7",5,0,"Não precisa anotar. É só lembrar que cada assunto tem o seu órgão."],

  // ============ A.8 · FGC e risco de emissor · postos 3,4,1,2,3,4 ============
  ["A.8",0,3,"O FGC existe, mas tem limite por CPF. Com 400 mil num banco só, sobra fora."],
  ["A.8",0,2,"O FGC cobre CDB até certo valor por CPF em cada conglomerado financeiro."],
  ["A.8",0,1,"Taxa alta assim costuma indicar banco com dificuldade de captação no mercado."],
  ["A.8",0,0,"Certo, dona Rosângela. Com FGC a senhora aplica à vontade que não há risco."],

  ["A.8",1,3,"São R$ 250 mil por CPF em cada conglomerado, com teto de R$ 1 milhão."],
  ["A.8",1,2,"São R$ 250 mil por CPF e por instituição, esse é o limite que vale para todos."],
  ["A.8",1,1,"É um valor por pessoa. Posso confirmar o número exato no material do FGC."],
  ["A.8",1,0,"São R$ 250 mil por aplicação, então basta dividir em duas no mesmo banco."],

  ["A.8",2,3,"É um caminho, desde que sejam conglomerados diferentes: duas marcas do mesmo grupo contam como uma."],
  ["A.8",2,2,"Sim, e é importante que sejam instituições de conglomerados distintos."],
  ["A.8",2,1,"Resolve sim. Pode dividir em dois bancos que fica tudo coberto."],
  ["A.8",2,0,"Dividir não adianta muito, porque o risco continua exatamente o mesmo."],

  ["A.8",3,3,"Sem liquidez a senhora não saca nem em emergência. Quanto precisa acessível?"],
  ["A.8",3,2,"Três anos é bastante tempo, vale confirmar se não vai precisar do dinheiro antes."],
  ["A.8",3,1,"Então tudo bem: se a senhora não vai mexer, o prazo não atrapalha."],
  ["A.8",3,0,"Se precisar antes, dá para vender o papel no mercado secundário."],

  ["A.8",4,3,"Não é imediato: vem depois da liquidação e do levantamento dos credores."],
  ["A.8",4,2,"Depende do processo de liquidação da instituição, que tem etapas próprias."],
  ["A.8",4,1,"Nunca acompanhei um caso desses de perto, prefiro não estimar um prazo."],
  ["A.8",4,0,"É rápido. O FGC costuma pagar os valores cobertos em poucos dias."],

  ["A.8",5,3,"Reserva com liquidez, depois grupos diferentes, e a taxa por último."],
  ["A.8",5,2,"Dividiria entre três bancos diferentes para ficar tudo dentro do limite."],
  ["A.8",5,1,"Depende dos seus objetivos. Precisaríamos mapear isso com mais calma."],
  ["A.8",5,0,"Eu manteria o CDB de 125% do CDI, que é uma taxa muito boa hoje."],
  // ============ A.1 · cripto e suitability · postos 4,1,2,3,4,1 ============
  ["A.1",0,3,"Antes do produto: o que te chamou atenção e para quando é esse dinheiro?"],
  ["A.1",0,2,"Posso te explicar como funciona esse tipo de ativo e quais riscos ele carrega."],
  ["A.1",0,1,"Cripto é muito arriscado para o seu perfil. Não recomendo de jeito nenhum."],
  ["A.1",0,0,"Sem problema, faço a aplicação. O dinheiro é seu e você decide onde colocar."],

  ["A.1",1,3,"Sete anos ajudam, mas metade da reserva num ativo volátil pode comprometer o plano."],
  ["A.1",1,2,"Dá tempo sim, mas o tamanho da posição preocupa: metade é muito."],
  ["A.1",1,1,"Depende do mercado. Ninguém prevê se vai cair ou subir nesse prazo."],
  ["A.1",1,0,"Dá tempo tranquilo. Em sete anos o mercado sempre acaba se recuperando."],

  ["A.1",2,3,"Reduzir muda o quadro. Quanto você pode arriscar sem afetar a aposentadoria?"],
  ["A.1",2,2,"R$ 10 mil é bem mais razoável. Podemos avaliar a operação dessa forma."],
  ["A.1",2,1,"Qualquer valor em cripto continua desenquadrado do seu perfil conservador."],
  ["A.1",2,0,"Se é pouco, tanto faz. Nem precisamos registrar nada nesse caso."],

  ["A.1",3,3,"Meu dever é oferecer o que combina com o seu objetivo, não com a minha meta."],
  ["A.1",3,2,"Porque a regra exige verificar se o produto é adequado ao seu perfil antes."],
  ["A.1",3,1,"Tenho metas sim, mas nesse caso elas não mudam a minha recomendação."],
  ["A.1",3,0,"Na verdade eu tenho um fundo que bate meta e serve para você. Quer ver?"],

  ["A.1",4,3,"Respeito. Vou registrar o alerta de que está fora do seu perfil."],
  ["A.1",4,2,"Tudo bem, mas quero que você assine o termo de ciência de risco antes."],
  ["A.1",4,1,"Prefiro que você pense mais uns dias antes de a gente fechar isso."],
  ["A.1",4,0,"Não posso permitir uma operação dessas. Vou recusar a ordem."],

  ["A.1",5,3,"Combinamos agora quanto de queda você tolera e o que faremos se chegar lá."],
  ["A.1",5,2,"Se cair, a gente conversa e reavalia a posição com calma."],
  ["A.1",5,1,"Aí é esperar. Vender na baixa costuma ser o pior negócio possível."],
  ["A.1",5,0,"Não se preocupe, eu te aviso antes de qualquer queda mais forte."],

  // ============ A.2 · queda e conduta · postos 1,2,3,4,1,2 ============
  ["A.2",0,3,"Entendo o susto. Antes de resgatar, posso explicar em dois minutos o que causou a queda?"],
  ["A.2",0,2,"Posso fazer o resgate sim. Só queria contar antes o que aconteceu no mês."],
  ["A.2",0,1,"Calma, isso é normal em fundo multimercado. Não precisa se preocupar."],
  ["A.2",0,0,"Se a senhora resgatar agora, vai perder dinheiro. Não faça isso."],

  ["A.2",1,3,"O fundo tem títulos que variam de preço todo dia. Quando os juros sobem, valem menos."],
  ["A.2",1,2,"É a marcação a mercado: os ativos são reprecificados conforme a curva de juros."],
  ["A.2",1,1,"O mercado oscilou bastante esse mês por causa do cenário macroeconômico."],
  ["A.2",1,0,"É complicado mesmo, dona Neusa, mas confie em mim: isso passa logo."],

  ["A.2",2,3,"Falamos que era moderado, com oscilação. Se ficou outra impressão, foi falha minha."],
  ["A.2",2,2,"Registramos o seu perfil moderado e o produto está dentro dele, dona Neusa."],
  ["A.2",2,1,"Acho que houve algum mal-entendido na nossa conversa daquele dia."],
  ["A.2",2,0,"Eu nunca disse que era seguro. A senhora deve estar confundindo as coisas."],

  ["A.2",3,3,"Três anos é o horizonte que combinamos. A queda cabe nele?"],
  ["A.2",3,2,"Nesse prazo, historicamente esse tipo de fundo se recupera de quedas assim."],
  ["A.2",3,1,"Se a senhora precisa em três anos, talvez seja melhor migrar para algo previsível."],
  ["A.2",3,0,"Deixa quieto que até lá recupera com folga, dona Neusa."],

  ["A.2",4,3,"Dormir tranquila é motivo legítimo. Vamos calcular quanto sai sem furar o plano."],
  ["A.2",4,2,"Podemos fazer isso sim. É uma forma de diminuir o desconforto da senhora."],
  ["A.2",4,1,"Metade ainda mantém a exposição ao risco que incomodou a senhora."],
  ["A.2",4,0,"Não vale a pena mexer agora. Mantém tudo exatamente como está."],

  ["A.2",5,3,"Combinado. Ligo no fim de cada mês, e também se passar do limite de hoje."],
  ["A.2",5,2,"Pode deixar, eu acompanho e aviso quando houver movimento relevante."],
  ["A.2",5,1,"Qualquer coisa a senhora me liga aqui que a gente conversa de novo."],
  ["A.2",5,0,"Não vai piorar, dona Neusa. Pode ficar tranquila com isso."],

  // ============ A.3 · PLD e sigilo · postos 3,4,1,2,3,4 ============
  ["A.3",0,3,"Posso, pelo canal interno: apuração de suspeita é hipótese legal de tratamento."],
  ["A.3",0,2,"Compartilho pelos sistemas internos, mas não por e-mail comum para esse dado."],
  ["A.3",0,1,"Preciso confirmar com o meu gestor antes de encaminhar qualquer dado desses."],
  ["A.3",0,0,"Não posso: a LGPD proíbe compartilhar dados do cliente sem o consentimento."],

  ["A.3",1,3,"Não. Avisar o cliente é tipping off, e é vedado."],
  ["A.3",1,2,"Não avisamos. O procedimento corre sem nenhuma comunicação ao cliente."],
  ["A.3",1,1,"Acho melhor não avisar, para não atrapalhar o andamento da apuração."],
  ["A.3",1,0,"Vou ligar para ele confirmar a origem do dinheiro antes de reportarmos."],

  ["A.3",2,3,"Ajuda, mas não elimina: pesa a incompatibilidade com o histórico e o destino de risco."],
  ["A.3",2,2,"É um elemento a considerar na análise, junto com os demais indícios."],
  ["A.3",2,1,"Se ele declarou lá na abertura, o cadastro dele está em ordem."],
  ["A.3",2,0,"Sim, com a explicação registrada no cadastro podemos arquivar o alerta."],

  ["A.3",3,3,"Não existe piso: suspeita de qualquer valor se comunica, sem avisar o cliente."],
  ["A.3",3,2,"Suspeita se comunica independentemente do valor que estiver envolvido."],
  ["A.3",3,1,"Acima de R$ 50 mil, que é o limite de registro reforçado em espécie."],
  ["A.3",3,0,"Só a partir de R$ 2 mil em espécie é que nasce essa obrigação."],

  ["A.3",4,3,"Não. O sigilo só cede nas hipóteses legais, e curiosidade não é uma delas."],
  ["A.3",4,2,"Não podemos compartilhar dados de cliente com outra instituição desse jeito."],
  ["A.3",4,1,"Só se ele formalizar o pedido por escrito pelo canal adequado."],
  ["A.3",4,0,"Se for para ajudar numa investigação em curso, acho que podemos sim."],

  ["A.3",5,3,"Pelo prazo mínimo da norma, contado do encerramento da relação."],
  ["A.3",5,2,"Mantemos os registros arquivados pelo prazo previsto na regulamentação."],
  ["A.3",5,1,"Guardamos enquanto o cliente tiver conta aberta aqui conosco."],
  ["A.3",5,0,"Depois de comunicar ao COAF, já podemos descartar todo o material."],
  // ============ A.4 · meta contra adequação · postos 2,3,4,1,2,3 ============
  ["A.4",0,3,"Vou atender e ver o que serve. Se o PGBL couber, ótimo; se não, ofereço o adequado."],
  ["A.4",0,2,"Só consigo oferecer se o produto for adequado ao perfil e à situação dele."],
  ["A.4",0,1,"Vou tentar encaixar, mas não prometo nada até conversar com o cliente."],
  ["A.4",0,0,"Pode deixar comigo que eu encaixo o PGBL nele sem maior problema."],

  ["A.4",1,3,"Como é a sua segurança, precisa render bem e continuar disponível."],
  ["A.4",1,2,"Entendi. E você pensa em usar esse dinheiro em quanto tempo, se precisar?"],
  ["A.4",1,1,"Temos opções que rendem bem mais que a poupança hoje. Quer conhecer?"],
  ["A.4",1,0,"Nesse caso a previdência é ótima, porque força você a não mexer no dinheiro."],

  ["A.4",2,3,"O desconto exige declaração completa e INSS. Nos dois, o seu caso não fecha."],
  ["A.4",2,2,"Esse benefício vale para quem declara no modelo completo, que não é o seu caso."],
  ["A.4",2,1,"Depende do plano e da sua situação fiscal. Podemos simular juntos agora."],
  ["A.4",2,0,"Vale sim, Marcelo. Todo mundo que aplica em PGBL abate até 12% da renda."],

  ["A.4",3,3,"Liquidez diária e risco baixo: Tesouro Selic ou CDB com resgate a qualquer momento e FGC."],
  ["A.4",3,2,"Aplicações conservadoras com resgate rápido são o caminho para a reserva."],
  ["A.4",3,1,"Podemos dividir: uma parte em renda fixa e outra em previdência para o futuro."],
  ["A.4",3,0,"Um VGBL resolve, já que o PGBL não serve para o seu caso mesmo."],

  ["A.4",4,3,"Não fechou: é reserva de emergência e ele declara no simplificado."],
  ["A.4",4,2,"Esse cliente não tinha o perfil necessário para o produto da campanha."],
  ["A.4",4,1,"Ainda não consegui fechar. Vou continuar tentando com ele essa semana."],
  ["A.4",4,0,"Fechei um valor menor com ele, só para não ficar sem nada na meta."],

  ["A.4",5,3,"Quando você tiver reserva e objetivo longo. E aí o VGBL encaixa melhor."],
  ["A.4",5,2,"Sim, quando você já tiver a reserva pronta e pensar no longo prazo."],
  ["A.4",5,1,"Com certeza, Marcelo. É só me procurar aqui quando você quiser."],
  ["A.4",5,0,"Sim, e aí você já aproveita o desconto de 12% no imposto de renda."],

  // ============ A.5 · LCA e indexadores · postos 4,1,2,3,4,1 ============
  ["A.5",0,3,"Uma acompanha os juros, a outra a inflação mais uma taxa fixa."],
  ["A.5",0,2,"A diferença é o indexador: uma segue o CDI, a outra o IPCA mais taxa fixa."],
  ["A.5",0,1,"Posso consultar os valores no sistema e ver qual rendeu mais até aqui."],
  ["A.5",0,0,"As duas são LCAs, então são parecidas. Muda só a forma de calcular."],

  ["A.5",1,3,"Sua filha tem razão hoje: com CDI a 15% e inflação em 4%, a do CDI entrega mais."],
  ["A.5",1,2,"A do CDI acompanha os juros, hoje em 15%. A do IPCA paga 4% mais 5,5% ao ano."],
  ["A.5",1,1,"As duas rendem parecido no longo prazo. A diferença aparece no curto."],
  ["A.5",1,0,"Como o senhor prefere inflação, melhor manter a do IPCA e resgatar a outra."],

  ["A.5",2,3,"É isso. A do IPCA repõe a inflação e soma uma taxa fixa por cima."],
  ["A.5",2,2,"Exato. A do IPCA garante a inflação e a do CDI depende da política monetária."],
  ["A.5",2,1,"Mais ou menos. As duas protegem da inflação, só que de jeitos diferentes."],
  ["A.5",2,0,"Na prática o CDI acompanha a inflação, então dá no mesmo escolher qualquer uma."],

  ["A.5",3,3,"Não: LCA é isenta para pessoa física. O que vale conferir é a carência."],
  ["A.5",3,2,"Não paga imposto de renda nenhum. A LCA é isenta para pessoa física."],
  ["A.5",3,1,"Vou verificar no sistema como fica a tributação nesse resgate específico."],
  ["A.5",3,0,"Com 13 meses o senhor já saiu da faixa mais alta da tabela regressiva."],

  ["A.5",4,3,"Antes do tamanho: qual delas o senhor precisa manter nos próximos anos?"],
  ["A.5",4,2,"Podemos resgatar da maior sim. Só quero conferir antes se cumpriu a carência."],
  ["A.5",4,1,"Melhor tirar da maior mesmo, assim o senhor não zera nenhuma aplicação."],
  ["A.5",4,0,"Tanto faz, o senhor decide. Qualquer uma dá para tirar os 80 mil hoje."],

  ["A.5",5,3,"Combino de revisar quando a Selic mudar de patamar ou a carência vencer."],
  ["A.5",5,2,"Não precisa. Eu acompanho e aviso se aparecer algo relevante para o senhor."],
  ["A.5",5,1,"Qualquer coisa o senhor passa aqui na agência que a gente conversa."],
  ["A.5",5,0,"Já aproveito e deixo agendada a aplicação do que sobrar num fundo melhor."],
  // ============ A.11 · taxa, benchmark e come-cotas · postos 3,4,1,2,3,4 ============
  ["A.11",0,3,"A taxa explica parte, não toda. Antes de resgatar, deixa eu abrir de onde saiu cada pedaço."],
  ["A.11",0,2,"A taxa de administração de 1,2% ao ano reduz a rentabilidade líquida do fundo."],
  ["A.11",0,1,"O CDI é uma referência de mercado; o fundo não é obrigado a superá-la sempre."],
  ["A.11",0,0,"Concordo, fundo de renda fixa raramente compensa. Faço o resgate agora mesmo."],

  ["A.11",1,3,"Não é imposto a mais: o fundo antecipa em maio e novembro e você paga só a diferença."],
  ["A.11",1,2,"Existe o come-cotas, que é uma antecipação semestral do imposto de renda."],
  ["A.11",1,1,"Nos fundos o imposto é recolhido de forma diferente, em duas datas fixas do ano."],
  ["A.11",1,0,"Isso mesmo, Otávio. No fundo você acaba pagando imposto duas vezes seguidas."],

  ["A.11",2,3,"Para um fundo que só segue o CDI, 1,2% é caro: consome muito de um retorno conhecido."],
  ["A.11",2,2,"É uma taxa acima da média para fundos que apenas acompanham o CDI."],
  ["A.11",2,1,"Depende da estratégia do fundo e do trabalho de gestão que está envolvido."],
  ["A.11",2,0,"É a taxa padrão da indústria, Otávio. Todos os fundos cobram por aí mesmo."],

  ["A.11",3,3,"Nesse seu caso o fundo não é a melhor escolha, e é justo você cobrar isso."],
  ["A.11",3,2,"Esse produto não se encaixa no seu objetivo, e isso deveria ter sido visto antes."],
  ["A.11",3,1,"Fundos servem para quem quer diversificação e gestão profissional da carteira."],
  ["A.11",3,0,"Cada cliente escolhe o que quiser. Nós apenas oferecemos as opções disponíveis."],

  ["A.11",4,3,"Você paga a diferença de imposto, sem multa. O ponto é decidir para onde vai."],
  ["A.11",4,2,"Não há carência nem multa nenhuma, Otávio. O resgate desse fundo é livre."],
  ["A.11",4,1,"Perde a rentabilidade que o fundo faria daqui para frente, se ele reagir."],
  ["A.11",4,0,"Sim, resgatar antes de dois anos gera penalidade tributária dentro do fundo."],

  ["A.11",5,3,"Depende de quando você vai precisar. Me diz o horizonte e trago opções com o custo."],
  ["A.11",5,2,"Um título público pós-fixado resolveria, com custo bem menor que esse."],
  ["A.11",5,1,"Tenho um fundo da casa com taxa menor que eu posso te mostrar agora."],
  ["A.11",5,0,"Com esse valor eu diversificaria em multimercados e um pouco de ações."],

  // ============ A.12 · PGBL, VGBL e portabilidade · postos 4,1,2,3,4,1 ============
  ["A.12",0,3,"O plano não está errado, mas não é o seu: a dedução exige completo e INSS."],
  ["A.12",0,2,"A dedução do PGBL vale só para quem declara pelo modelo completo."],
  ["A.12",0,1,"Seu pai deve ter se confundido, Simone. Esse benefício não é bem assim."],
  ["A.12",0,0,"Provavelmente sua contadora não informou o plano na declaração. Confira com ela."],

  ["A.12",1,3,"A dedução exige INSS. Sem ela o PGBL não devolve nada e ainda tributa o total."],
  ["A.12",1,2,"Sem contribuição ao INSS ou a regime próprio, a dedução não se aplica."],
  ["A.12",1,1,"Então realmente não faz muito sentido você manter esse plano hoje."],
  ["A.12",1,0,"Mesmo sem contribuir, você pode deduzir no ano em que voltar a contribuir."],

  ["A.12",2,3,"No VGBL é só o rendimento. No PGBL o imposto pega tudo que sair."],
  ["A.12",2,2,"No PGBL o imposto incide sobre o valor total do resgate, e não só sobre o ganho."],
  ["A.12",2,1,"Sim, Simone, essa é uma característica do PGBL que costuma surpreender."],
  ["A.12",2,0,"Depende da tabela que você escolheu lá no momento da contratação."],

  ["A.12",3,3,"Não precisa cancelar. Existe portabilidade, e ela não é tributada."],
  ["A.12",3,2,"Dá para fazer portabilidade do saldo para outro plano de previdência."],
  ["A.12",3,1,"Resgatar agora seria ruim pela alíquota. Melhor deixar como está e parar."],
  ["A.12",3,0,"Infelizmente, para trocar de plano é preciso resgatar e recolher o imposto."],

  ["A.12",4,3,"Para outra seguradora sim; trocar de tipo não. O seu caso pede VGBL."],
  ["A.12",4,2,"Pode ser para outra instituição, desde que entre planos do mesmo tipo."],
  ["A.12",4,1,"Sim, a portabilidade entre seguradoras é livre no mercado brasileiro."],
  ["A.12",4,0,"Pode portar para qualquer plano, inclusive mudando de PGBL para VGBL."],

  ["A.12",5,3,"Uma pergunta resolve: declara no completo e contribui ao regime oficial?"],
  ["A.12",5,2,"Sim, uma análise de perfil e da sua situação fiscal teria apontado isso."],
  ["A.12",5,1,"Infelizmente muita gente contrata por indicação de família e depois descobre."],
  ["A.12",5,0,"Não se culpe, Simone. Esses produtos são complicados mesmo de entender."],
  // ============ A.13 · renda variável · postos 3,4,1,2,3,4 ============
  ["A.13",0,3,"Nessa parte nada: vendas comuns até R$ 20 mil no mês são isentas, e você ficou abaixo."],
  ["A.13",0,2,"Vendas de até R$ 20.000 no mês em operações comuns são isentas de imposto."],
  ["A.13",0,1,"Existe uma isenção para vendas de pequeno valor no mês. Vou confirmar o limite."],
  ["A.13",0,0,"São 15% sobre o lucro apurado, com recolhimento por DARF até o mês seguinte."],

  ["A.13",1,3,"Aí não: a isenção não alcança day trade. Qualquer lucro é tributado."],
  ["A.13",1,2,"Day trade tem tratamento tributário próprio, diferente das operações comuns."],
  ["A.13",1,1,"Melhor você conferir com um contador, porque day trade é complicado."],
  ["A.13",1,0,"Com 300 reais não vale nem a pena se preocupar com isso, Murilo."],

  ["A.13",2,3,"Dividendo chega isento; o JCP já vem com 15% retidos na fonte pela empresa."],
  ["A.13",2,2,"Dividendos são isentos e o JCP é tributado na fonte pela companhia."],
  ["A.13",2,1,"Proventos têm regras específicas dentro da declaração anual de ajuste."],
  ["A.13",2,0,"Os dois são rendimentos e precisam ser somados ao lucro das vendas."],

  ["A.13",3,3,"É isso. Guarde as notas de corretagem de tudo, inclusive do que é isento."],
  ["A.13",3,2,"Correto, Murilo. O day trade é a única fatia tributável do seu mês."],
  ["A.13",3,1,"Isso, e o valor é tão pequeno que provavelmente nem vai gerar DARF."],
  ["A.13",3,0,"Sim, e o recolhimento acontece automaticamente pela sua corretora."],

  ["A.13",4,3,"Passou dos R$ 20 mil, o lucro inteiro vira tributável, não só o excedente."],
  ["A.13",4,2,"O limite é sobre o valor vendido no mês; ultrapassando, o lucro é tributado."],
  ["A.13",4,1,"Nesse caso vale planejar as vendas para não estourar o mês sem querer."],
  ["A.13",4,0,"Sim, só a parte que exceder os R$ 20.000 é que passa a ser tributada."],

  ["A.13",5,3,"Mando uma linha por tipo de operação, com o isento, o tributado e o prazo."],
  ["A.13",5,2,"Claro, preparo um resumo dessa conversa e te envio ainda hoje à tarde."],
  ["A.13",5,1,"Posso indicar o material da corretora sobre tributação em renda variável."],
  ["A.13",5,0,"Não precisa, é só você lembrar dos 20 mil que o resto é detalhe."],

  // ============ A.14 · câmbio e VET · postos 1,2,3,4,1,2 ============
  ["A.14",0,3,"A cotação é a mesma, mas tem tarifa e imposto por cima. Compare o VET, não a cotação."],
  ["A.14",0,2,"Existe o VET, Valor Efetivo Total, que reúne cotação, tarifas e tributos."],
  ["A.14",0,1,"Cada instituição pratica a sua taxa, conforme a política comercial dela."],
  ["A.14",0,0,"Se está mais barato lá, feche lá mesmo. Não temos como cobrir esse preço."],

  ["A.14",1,3,"São, por norma do Banco Central: o VET tem de ser informado antes de fechar."],
  ["A.14",1,2,"Sim, a informação do VET é obrigatória nas operações de câmbio no país."],
  ["A.14",1,1,"Normalmente eles informam, mas nem sempre fica em destaque no contrato."],
  ["A.14",1,0,"É mais uma boa prática do mercado do que uma obrigação formal mesmo."],

  ["A.14",2,3,"Depende do uso. Compare o VET de cada modalidade antes de decidir."],
  ["A.14",2,2,"As duas modalidades têm custos diferentes; vale comparar o VET de cada uma."],
  ["A.14",2,1,"Cartão pré-pago é sempre melhor, mais seguro e mais prático na viagem."],
  ["A.14",2,0,"Leve tudo em espécie, Kelly. Sai bem mais barato no fim das contas."],

  ["A.14",3,3,"Antes do preço: só instituição autorizada pode operar câmbio."],
  ["A.14",3,2,"Vale conferir se a casa é autorizada a operar câmbio pelo Banco Central."],
  ["A.14",3,1,"Casa de câmbio de galeria costuma ser arriscada. Eu não faria por lá."],
  ["A.14",3,0,"Se aceita PIX e emite comprovante, então está tudo certo com ela."],

  ["A.14",4,3,"Com autorizada você tem contrato, comprovante e canal no Banco Central. Fora disso, nada."],
  ["A.14",4,2,"Numa instituição autorizada existe contrato formal e canal de reclamação."],
  ["A.14",4,1,"Aí infelizmente o caminho seria procurar a Justiça e esperar bastante."],
  ["A.14",4,0,"Dificilmente dá problema, esse tipo de operação é bem simples de fazer."],

  ["A.14",5,3,"Em três semanas dá para dividir em duas ou três datas e não depender de um dia."],
  ["A.14",5,2,"Pode dividir a compra em algumas datas para diluir a variação da cotação."],
  ["A.14",5,1,"Tanto faz, o importante é você ter o dinheiro antes de embarcar."],
  ["A.14",5,0,"Compre tudo agora, Kelly. O dólar tende a subir nas próximas semanas."],

  // ============ A.15 · seguro x capitalização · postos 3,4,1,2,3,4 ============
  ["A.15",0,3,"O que está no seu débito é capitalização, não seguro. Não paga indenização."],
  ["A.15",0,2,"Vamos conferir no sistema qual é exatamente o produto que o senhor contratou."],
  ["A.15",0,1,"Depende das condições gerais da apólice, que variam bastante entre planos."],
  ["A.15",0,0,"Se o senhor paga há sete anos, a cobertura deve estar ativa sim."],

  ["A.15",1,3,"Capitalização é poupança com sorteio. Nada vai para os seus filhos."],
  ["A.15",1,2,"É um título de capitalização, um produto de poupança programada com sorteio."],
  ["A.15",1,1,"É um produto financeiro que devolve o valor lá no fim do prazo contratado."],
  ["A.15",1,0,"Alguns títulos de capitalização também têm cobertura por morte, seu Genésio."],

  ["A.15",2,3,"Perdido não está: existe valor de resgate, menor que a soma paga. Vou levantar quanto."],
  ["A.15",2,2,"O título tem valor de resgate, que pode ser inferior ao total que foi pago."],
  ["A.15",2,1,"Infelizmente em capitalização o resgate costuma ficar bem abaixo do pago."],
  ["A.15",2,0,"Não perdeu nada, o senhor recebe tudo de volta corrigido no fim do prazo."],

  ["A.15",3,3,"De quanto sua família precisaria até os meninos se formarem?"],
  ["A.15",3,2,"Nesse perfil, um seguro de vida temporário costuma ser a solução adequada."],
  ["A.15",3,1,"O senhor deveria procurar um corretor de seguros especializado no assunto."],
  ["A.15",3,0,"Tenho um plano de vida aqui que já posso contratar hoje mesmo para o senhor."],

  ["A.15",4,3,"Não: é isenta de imposto e não entra em inventário, então chega rápido."],
  ["A.15",4,2,"A indenização por morte em seguro de vida é isenta de imposto de renda."],
  ["A.15",4,1,"Seguro tem tratamento tributário favorecido nesses casos de falecimento."],
  ["A.15",4,0,"Paga sim, entra no espólio e é tributado como os demais bens da família."],

  ["A.15",5,3,"Eu levanto o resgate e o senhor pensa em quanto a família precisa por mês."],
  ["A.15",5,2,"Podemos agendar para amanhã e eu já trago as opções de seguro de vida."],
  ["A.15",5,1,"Primeiro cancele a capitalização, depois vemos o seguro com mais calma."],
  ["A.15",5,0,"Deixa comigo, seu Genésio. Eu resolvo tudo e o senhor só assina depois."],

  // ============ A.16 · procuração e abuso financeiro · postos 4,1,2,3,4,1 ============
  ["A.16",0,3,"Vou conferir a procuração e tratar com o senhor Aparício, que está aqui."],
  ["A.16",0,2,"Vou precisar analisar a procuração antes de executar qualquer operação."],
  ["A.16",0,1,"A senhora pode aguardar um momento? Preciso verificar alguns pontos internos."],
  ["A.16",0,0,"Com procuração está tudo certo, senhora. Faço o resgate agora mesmo."],

  ["A.16",1,3,"Com o titular presente eu preciso ouvir dele. Seu Aparício, me acompanha um minuto?"],
  ["A.16",1,2,"Seu Aparício, o senhor confirma que autoriza esse resgate de 250 mil?"],
  ["A.16",1,1,"É rápido, senhora Regina. Só preciso da confirmação verbal dele aqui."],
  ["A.16",1,0,"Sem problema, a senhora me passa os dados e eu adianto o preenchimento."],

  ["A.16",2,3,"O dinheiro é seu. O senhor sabia desse negócio da família?"],
  ["A.16",2,2,"O dinheiro é do senhor, então a decisão precisa ser sua. Vou explicar tudo."],
  ["A.16",2,1,"Mesmo assim preciso que o senhor confirme, porque é a regra da casa."],
  ["A.16",2,0,"Tudo bem então, vamos seguir com o pedido que a sua filha fez."],

  ["A.16",3,3,"Vamos parar por aqui. Não posso executar sem o senhor saber para onde vai."],
  ["A.16",3,2,"Vou registrar a divergência e encaminhar ao compliance antes de qualquer coisa."],
  ["A.16",3,1,"Senhora Regina, o seu pai não parece estar de acordo. Eu não vou fazer isso."],
  ["A.16",3,0,"Talvez ele tenha esquecido. Com a procuração eu consigo prosseguir mesmo assim."],

  ["A.16",4,3,"Não é pessoal: resgate desse valor exige confirmar o entendimento do titular."],
  ["A.16",4,2,"Não estou acusando ninguém, mas o titular precisa entender a operação."],
  ["A.16",4,1,"Não é isso, senhora Regina. É só um procedimento interno da instituição."],
  ["A.16",4,0,"A senhora tem razão, me desculpe. Vou seguir com o resgate então."],

  ["A.16",5,3,"Formalmente sim, mas o titular não sabia da destinação. Registrei e comuniquei."],
  ["A.16",5,2,"O cliente demonstrou não conhecer a operação, então eu não executei."],
  ["A.16",5,1,"Achei melhor não arriscar, porque o valor era alto demais para o caso."],
  ["A.16",5,0,"Você tem razão, exagerei. Da próxima vez eu executo direto sem travar."],
  // ============ A.17 · suitability · postos 2,3,4,1,2,3 ============
  ["A.17",0,3,"Posso executar, mas não recomendar: está acima do seu perfil e preciso te alertar."],
  ["A.17",0,2,"Seu perfil é conservador, então esse fundo não é indicado para a senhora."],
  ["A.17",0,1,"Antes disso, vamos refazer o seu questionário de perfil de investidora."],
  ["A.17",0,0,"Se a senhora já decidiu, eu executo. O dinheiro é seu e a escolha também."],

  ["A.17",1,3,"Protege os dois: eu não te empurro produto errado e você decide sabendo."],
  ["A.17",1,2,"É uma exigência da regulação, prevista na norma de adequação da CVM."],
  ["A.17",1,1,"É praxe do mercado nesse tipo de operação acima do perfil declarado."],
  ["A.17",1,0,"É, dona Débora. Basicamente é para nos resguardar mesmo, não vou mentir."],

  ["A.17",2,3,"Não dá para prometer piso. Posso mostrar as piores janelas do fundo."],
  ["A.17",2,2,"Fundos de ações podem ter quedas relevantes em períodos de estresse."],
  ["A.17",2,1,"Depende do mercado, dona Débora. É impossível prever com alguma precisão."],
  ["A.17",2,0,"Historicamente esse fundo nunca caiu mais do que 20% em nenhuma janela."],

  ["A.17",3,3,"Se o carro entra na conta, esse dinheiro tem prazo — e prazo curto com renda variável cobra caro."],
  ["A.17",3,2,"O fundo tem resgate em D+30, então precisaria programar com antecedência."],
  ["A.17",3,1,"Se precisar, é só resgatar. O fundo tem liquidez razoável para isso."],
  ["A.17",3,0,"Um ano dá tempo de recuperar qualquer queda que aconteça no meio."],

  ["A.17",4,3,"Muda bastante: 40 mil deixa o carro e a reserva fora do risco. O alerta continua."],
  ["A.17",4,2,"É uma exposição bem mais compatível com a situação da senhora hoje."],
  ["A.17",4,1,"Se a senhora se sentir mais confortável assim, por mim está tudo bem."],
  ["A.17",4,0,"Com 40 mil a senhora já nem precisa do termo de ciência de risco."],

  ["A.17",5,3,"Anoto o alerta, a sua ciência e o motivo da redução do valor."],
  ["A.17",5,2,"Registro o termo de ciência de risco e sigo com a aplicação hoje."],
  ["A.17",5,1,"Anoto sim, dona Débora. Deixo tudo registrado no seu cadastro."],
  ["A.17",5,0,"Não precisa formalizar nada, ficou tudo combinado aqui entre nós dois."],

  // ============ A.18 · PLD e vedação de dar ciência · postos 4,1,2,3,4,1 ============
  ["A.18",0,3,"Antes de registrar, preciso confirmar a origem — é rotina em espécie."],
  ["A.18",0,2,"Preciso registrar a origem dos recursos antes de processar esse depósito."],
  ["A.18",0,1,"A senhora tem depositado bastante ultimamente. Aconteceu alguma coisa?"],
  ["A.18",0,0,"Posso sim, dona Vânia. É só a senhora preencher a ficha ali do lado."],

  ["A.18",1,3,"É rotina. Como o salão faturava uns 30 mil, preciso registrar a que se refere o volume maior."],
  ["A.18",1,2,"É uma exigência das normas de prevenção à lavagem de dinheiro, dona Vânia."],
  ["A.18",1,1,"Porque o valor está muito acima do seu histórico e isso acaba chamando atenção."],
  ["A.18",1,0,"Desculpe, a senhora tem razão. Vou processar assim mesmo, sem perguntar."],

  ["A.18",2,3,"Vou precisar dos dados do sócio: recurso de terceiro exige identificação."],
  ["A.18",2,2,"Nesse caso eu preciso dos dados desse sócio para fazer a identificação."],
  ["A.18",2,1,"Um sócio que não quer aparecer costuma ser um problema, dona Vânia."],
  ["A.18",2,0,"Sem problema, então eu registro tudo como recurso de sociedade nova."],

  ["A.18",3,3,"Com terceiros não comento, garanto. Mas registro internamente o atendimento."],
  ["A.18",3,2,"Não posso comentar com terceiros, mas o registro interno é obrigatório."],
  ["A.18",3,1,"Vou ter que comunicar isso ao COAF, dona Vânia. É obrigação minha."],
  ["A.18",3,0,"Fique tranquila, dona Vânia. Isso aqui fica só entre nós duas."],

  ["A.18",4,3,"Comunico com todo o histórico dos sessenta dias. Desistir não afasta o dever."],
  ["A.18",4,2,"Registro o atendimento e comunico ao compliance da própria instituição."],
  ["A.18",4,1,"Aviso o gerente da agência e aguardo a orientação dele sobre o caso."],
  ["A.18",4,0,"Como ela desistiu, não houve operação nenhuma. Só anoto no cadastro."],

  ["A.18",5,3,"Cinco anos é o motivo de eu ter notado a mudança, não de ignorá-la. E não se conta ao cliente."],
  ["A.18",5,2,"O dever de comunicar não depende do tempo de relacionamento com o cliente."],
  ["A.18",5,1,"Podemos tentar reconquistá-la depois que a situação toda se esclarecer."],
  ["A.18",5,0,"Se ela reclamar, eu explico com calma o que aconteceu e por quê."],

  // ============ A.19 · venda casada · postos 2,3,4,1,2,3 ============
  ["A.19",0,3,"Não é. Condicionar crédito à compra de outro produto é venda casada, e é vedada."],
  ["A.19",0,2,"Não é obrigatório. Nenhum produto pode ser condição para liberar o crédito."],
  ["A.19",0,1,"O consórcio ajuda na análise, mas não é obrigatório. Fica a seu critério."],
  ["A.19",0,0,"É prática comum nesse tipo de operação, senhor Edmilson. Todo mundo faz."],

  ["A.19",1,3,"Também não. O prestamista pode fazer sentido, mas é escolha sua, nunca condição."],
  ["A.19",1,2,"Seguro prestamista é opcional. Se quiser, avaliamos depois da liberação."],
  ["A.19",1,1,"O seguro pesa positivamente na análise de risco dessa operação de crédito."],
  ["A.19",1,0,"Nesse valor, o seguro costuma ser exigido pela nossa política interna."],

  ["A.19",2,3,"A informação estava errada e eu vou registrar isso."],
  ["A.19",2,2,"A informação que o senhor recebeu estava incorreta e eu vou reportar."],
  ["A.19",2,1,"Prefiro não comentar sobre o trabalho do colega que atendia o senhor."],
  ["A.19",2,0,"Cada profissional tem o seu jeito de trabalhar, senhor Edmilson."],

  ["A.19",3,3,"A meta eu busco, mas não com venda casada: é vedada e expõe o banco a sanção."],
  ["A.19",3,2,"Venda casada é vedada; não posso condicionar o crédito a outro produto."],
  ["A.19",3,1,"Eu sei da meta, mas o cliente estava desconfiado e ia dar problema."],
  ["A.19",3,0,"Você tem razão. Vou tentar reverter com ele antes de sexta-feira."],

  ["A.19",4,3,"Não vou apagar: a anotação é a prova de que a orientação existiu."],
  ["A.19",4,2,"Vou reportar ao compliance junto com o registro do atendimento de hoje."],
  ["A.19",4,1,"Prefiro só editar a observação para o cliente não ver aquilo escrito."],
  ["A.19",4,0,"Vou apagar para não prejudicar ninguém e sigo com o processo normal."],

  ["A.19",5,3,"O crédito segue pela análise normal, com retorno até quinta. O seguro fica depois."],
  ["A.19",5,2,"Vamos tratar as duas coisas separadamente: primeiro o crédito, depois o resto."],
  ["A.19",5,1,"Ótimo. Então já aproveito e deixo a proposta do seguro preparada."],
  ["A.19",5,0,"Perfeito, assim fica bem melhor para a análise do seu processo."],

  // ============ A.20 · Open Finance · postos 4,1,2,3,4,1 ============
  ["A.20",0,3,"Antes de falar em invasão: você autorizou algum aplicativo nos últimos dias?"],
  ["A.20",0,2,"Não houve invasão. Provavelmente foi compartilhamento via Open Finance."],
  ["A.20",0,1,"Fique tranquilo, Juninho. Isso é normal, deve ser coisa do Open Finance."],
  ["A.20",0,0,"Vou bloquear a sua conta imediatamente, por segurança, até apurarmos."],

  ["A.20",1,3,"É esse o ponto: o consentimento tem finalidade, prazo e escopo, e você aceitou numa tela só."],
  ["A.20",1,2,"O consentimento que você deu autoriza o acesso pela instituição receptora."],
  ["A.20",1,1,"Infelizmente, uma vez autorizado não há muito o que se possa fazer agora."],
  ["A.20",1,0,"É por isso que sempre é preciso ler os termos antes de aceitar qualquer coisa."],

  ["A.20",2,3,"O Open Finance só compartilha com quem você autorizou. O resto a gente apura."],
  ["A.20",2,2,"O compartilhamento vale apenas para a instituição que você autorizou."],
  ["A.20",2,1,"Provavelmente elas compraram os seus dados de alguma lista de contatos."],
  ["A.20",2,0,"No Open Finance os seus dados circulam entre as instituições participantes."],

  ["A.20",3,3,"Dá, a qualquer momento: revogar é direito seu, aqui ou no app que você autorizou."],
  ["A.20",3,2,"Sim, o consentimento pode ser revogado por você a qualquer momento."],
  ["A.20",3,1,"Você precisa entrar em contato com o aplicativo que recebeu os dados."],
  ["A.20",3,0,"Só é possível cancelar quando o prazo do consentimento vencer sozinho."],

  ["A.20",4,3,"A revogação corta daqui para frente. O que já foi segue a LGPD."],
  ["A.20",4,2,"A revogação impede novos compartilhamentos daquele consentimento específico."],
  ["A.20",4,1,"Isso já foge um pouco do que eu consigo te informar por aqui, Juninho."],
  ["A.20",4,0,"Sim, ao revogar todos os dados são apagados automaticamente da empresa."],

  ["A.20",5,3,"Não precisa. O que pegou foi aceitar sem olhar finalidade e prazo, não a tecnologia."],
  ["A.20",5,2,"O Open Finance é seguro e regulado; o cuidado está em ler o que se autoriza."],
  ["A.20",5,1,"Se você não se sente confortável com isso, o melhor é não usar mesmo."],
  ["A.20",5,0,"É, Juninho. Para quem não lê os termos, melhor mesmo ficar longe disso."],
  // ===== DESEMPATE FINAL =====
  // Depois de encurtar as melhores escolhas, a média ficou equilibrada (63
  // contra 60 caracteres) mas o POSTO ainda pendia: a melhor era a maior em
  // 53% das decisões, quase sempre por dois ou três caracteres. Aqui um
  // distrator de cada decisão é ampliado para assumir a maior — o que também
  // melhora a questão, porque distrator curto se elimina sozinho.
  ["A.5",1,0,"Como o senhor sempre preferiu inflação, o melhor é manter a do IPCA e resgatar a outra."],
  ["A.1",1,0,"Dá tempo tranquilo, seu Rogério. Em sete anos o mercado sempre acaba se recuperando."],
  ["A.1",2,1,"Qualquer valor aplicado em cripto continua desenquadrado do seu perfil conservador."],
  ["A.1",5,1,"Aí é esperar a recuperação. Vender na baixa costuma ser o pior negócio possível."],
  ["A.2",0,2,"Posso fazer o resgate sim, dona Neusa. Só queria contar antes o que aconteceu no mês."],
  ["A.2",1,2,"É a marcação a mercado: os ativos da carteira são reprecificados conforme a curva de juros."],
  ["A.2",2,2,"Registramos o seu perfil como moderado e o produto está dentro dele, dona Neusa."],
  ["A.2",4,2,"Podemos fazer isso sim, dona Neusa. É uma forma de diminuir o seu desconforto."],
  ["A.2",5,2,"Pode deixar comigo, eu acompanho e aviso quando houver movimento relevante."],
  ["A.3",0,2,"Compartilho pelos sistemas internos, mas prefiro não usar e-mail comum para esse dado."],
  ["A.3",2,0,"Sim, com a explicação já registrada no cadastro dele podemos arquivar o alerta."],
  ["A.3",3,2,"Suspeita se comunica independentemente do valor que estiver envolvido na operação."],
  ["A.4",0,2,"Só consigo oferecer o produto se ele for adequado ao perfil e à situação dele."],
  ["A.4",3,1,"Podemos dividir: uma parte em renda fixa e outra em previdência pensando no futuro."],
  ["A.4",5,2,"Sim, Marcelo, quando você já tiver a reserva pronta e pensar no longo prazo."],
  ["A.6",0,2,"O saldo não cai mesmo, mas a poupança costuma render abaixo de outras aplicações."],
  ["A.6",4,1,"Existe uma garantia sim, com limite por pessoa. Posso levantar os detalhes disso."],
  ["A.7",3,2,"Seguro é com a SUSEP, que supervisiona as seguradoras e a previdência aberta."],
  ["A.7",4,1,"O CMN é o conselho que fica acima de todos os outros dentro do sistema financeiro."],
  ["A.7",5,1,"Posso mandar tudo por e-mail depois, assim fica mais organizado para o senhor guardar."],
  ["A.8",2,2,"Sim, e é importante que sejam instituições de conglomerados financeiros realmente distintos."],
  ["A.9",0,0,"Se a rentabilidade é essa mesmo, talvez valha a pena diversificar e colocar uma parte lá."],
  ["A.9",1,0,"Se tem gente recebendo o combinado, é sinal de que a operação está funcionando direitinho."],
  ["A.9",3,2,"Com prazo definido assim, o ideal é buscar aplicações com vencimento próximo à data."],
  ["A.9",4,0,"Posso montar uma carteira com uma parte em ações para melhorar bastante esse retorno."],
  ["A.9",5,2,"Fora do mercado regulado o senhor não teria a proteção do FGC em caso nenhum, infelizmente."],
  ["A.10",0,2,"Todo CDB tem imposto de renda retido na fonte, isso é padrão do produto que você tinha."],
  ["A.10",1,2,"Quanto mais tempo aplicado, menor a alíquota devida. Por isso resgatar cedo custa mais."],
  ["A.10",2,1,"A alíquota do imposto de renda seria exatamente a mesma, 22,5% sobre o rendimento."],
  ["A.10",3,0,"Fundos de investimento não seguem essa tabela regressiva, então acabam saindo melhor."],
  ["A.10",4,2,"Vale dividir o dinheiro entre prazos diferentes, conforme a sua necessidade de caixa."],
  ["A.10",5,1,"Claro, Fabiana. Posso já deixar uma sugestão de carteira pronta para você aprovar."],
  ["A.11",0,0,"Concordo, fundo de renda fixa raramente compensa mesmo. Faço o resgate agora mesmo."],
  ["A.11",1,1,"Nos fundos o imposto é recolhido de forma diferente, em duas datas fixas do ano."],
  ["A.11",2,1,"Depende muito da estratégia do fundo e do trabalho de gestão que está envolvido."],
  ["A.11",5,2,"Um título público pós-fixado resolveria bem, com um custo bem menor que esse."],
  ["A.12",1,0,"Mesmo sem contribuir agora, você pode deduzir no ano em que voltar a contribuir."],
  ["A.13",0,1,"Existe uma isenção para vendas de pequeno valor no mês. Vou confirmar qual é o limite."],
  ["A.13",2,1,"Proventos têm regras específicas dentro da declaração anual de ajuste do imposto."],
  ["A.13",3,0,"Sim, e o recolhimento acontece automaticamente pela sua própria corretora."],
  ["A.14",0,2,"Existe o VET, o Valor Efetivo Total, que reúne cotação, tarifas e tributos."],
  ["A.14",1,1,"Normalmente eles informam sim, mas nem sempre fica em destaque no contrato."],
  ["A.14",4,2,"Numa instituição autorizada existe contrato formal e canal de reclamação próprio."],
  ["A.14",5,2,"Pode dividir a compra em algumas datas para diluir a variação da cotação do dólar."],
];
