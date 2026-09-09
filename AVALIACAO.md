# Avaliação — 08/09/2026

Segunda rodada da revisão profunda. Cada nota é justificada por medição ou
teste executado. Onde não houve medição, está escrito.

A rodada de 07/09 fechou em **7,8** com cinco lacunas nomeadas. Esta rodada
atacou as cinco.

---

## Alcance declarado da auditoria

Sem isto as notas não significam nada.

| Frente | Existente | Auditado por script | Conferido contra fonte primária | Lido por humano |
|---|---|---|---|---|
| Questões | 872 | **872 (100%)** estrutura, viés, vazamento, dificuldade | **872 (100%)** contra 15 fatos de norma + lastro de todo número afirmado | ~45 |
| Níveis (pílulas) | 170 | 170 (100%) | — | 9 (5%) marcados com `revisadoEm` |
| Árvores | 5 · 30 decisões | 30 (100%) | 30 (100%) | 30 (100%) |
| Glossário | 178 verbetes | 178 (estrutura) | — | 2 (JCP e dividendos, rodadas anteriores) |
| Confrontos / tabelão | 15 / 105 números | 100% (estrutura) | parcial (os que entram na tabela de fatos) | — |
| Paleta de cores | 21 pares de texto | **21 (100%)** WCAG 2.1 | — | — |

**Continua não sendo verdade que "todo o conteúdo foi validado".** O que mudou
é o significado de "auditado": antes era só estrutura; agora inclui checagem
conceitual dos números em 100% do banco. A leitura humana integral do banco
segue sem acontecer, e está dito.

---

## 1. Precisão e rastreabilidade do conteúdo — peso 30% — **nota 8,8**

**O que sustenta:**

*Integridade estrutural (872 questões, 100%):* 0 IDs duplicados, 0 enunciados
repetidos, 0 alternativas duplicadas ou vazias, 0 gabaritos inválidos, 0
explicações ausentes.

*Qualidade de redação, medida contra o caderno oficial da ANBIMA:*

| Métrica | Nosso banco | Caderno oficial |
|---|---|---|
| Gabarito estritamente mais longo | **4%** | acima de 30% |
| Gabarito lidera repetição de palavras | **9%** | **34%** |
| Diferença média de sobreposição | **−0,012** | **+0,038** |
| Respondível por eliminação | **0%** | 2% |
| Termo absoluto em distrator | **0** | — |

*Conferência conceitual (novo nesta rodada, 100% do banco):* nenhum gabarito
contradiz os 15 fatos verificados em fonte primária — FGC (teto por CPF e
global), tabelas regressivas de renda fixa e previdência, PGBL, come-cotas,
IOF, prazos de LCI/LCA/LCD, debênture incentivada, tributação e FGC do COE,
Selic Over, prazo de suitability. Dos 46 gabaritos que afirmam número de
regra, **45 têm lastro na apostila**; o único fora é um resultado de conta
que o filtro não pegou.

*Rastreabilidade (novo):* cada um dos 170 níveis grava `fonte` ("apostila"
ou "pd"), `auditadoEm` e — só onde houve leitura humana contra fonte
primária — `revisadoEm` com a norma citada. A distinção entre "auditado por
script" e "revisado por humano" está no dado, não numa nota de rodapé.

*Correções de conteúdo desta rodada e da anterior, todas com fonte e data:*
carência de LCI/LCA condicionada a papel sem índice de preços (Res. CMN
5.215/2025); proteção do COE explicitada como obrigação do emissor sem FGC;
dois termos absolutos removidos de gabaritos.

*DAO:* as 2 questões que dependem do termo saíram do sorteio do exame com
motivo declarado, e continuam no estudo com o aviso na tela. Não foram
apagadas.

**O que segura a nota:**
- A leitura humana integral do banco não aconteceu (~5% dos níveis com
  `revisadoEm`). A checagem automática cobre **números**; um erro conceitual
  sem número — uma atribuição de competência trocada entre CVM e BACEN, por
  exemplo — passaria.
- A tabela de fatos tem 15 linhas e toca 39 questões. Cobre os temas de maior
  risco, não o programa inteiro.
- Alternativas somam 322 caracteres contra 508 do caderno oficial. Continua
  abaixo do padrão de redação da banca.
- 7 siglas (SFH, SCD, SCMEPP, TJLP, SWIFT, CMPC, CEA) não aparecem na
  apostila nem nos cadernos. São termos financeiros correntes, mas o rastro
  não fecha. Ficaram no exame; estão listadas.

---

## 2. Integridade da avaliação e fidelidade ao exame — peso 30% — **nota 9,3**

**O que sustenta (verificado no site publicado):**

*Estrutura, agora confirmada no edital oficial e não em fonte secundária:*
2h30, 50 questões, 40 múltipla escolha + 10 de árvore, **35 acertos para
aprovar**, dificuldade 25/50/25, fechamento automático no prazo. Cada número
carrega a citação do item do edital dentro do app.

*Duas regras que esta rodada corrigiu contra o edital:*
- **O corte é um número, não um percentual.** Edital 3.2: 35 acertos em 50.
  `corrigir()` compara acertos, não porcentagem.
- **Anulada não sai do denominador.** Edital 16.1: é "atribuída a todas as
  pessoas candidatas" — vira acerto e a prova continua valendo 50. Eu tinha
  implementado o contrário, o que facilitava a aprovação.

*Medido no site:* sorteio com 10 fácil / 20 médio / 10 difícil (25/50/25
exato) e 8/16/12/4 por módulo (20/40/30/10), sem repetição, sem as 2
questões excluídas.

*Lacre do exame:* nenhuma classe `ok`/`no`, nenhum bloco de explicação,
nenhum som, nenhum grau, nenhum placar, nenhuma das palavras
"Acertou/Errou/Gabarito". O `verificar.js` recorta o bloco da tela e reprova
o build se qualquer um voltar.

*Nota:* 10 acertos e 40 em branco → **20%**, com a conta na tela. Antes: 100%.

*Cronômetro:* recarga no meio preserva `fimEm`, posição e respostas, e o
tempo correu. Voltar 2 min depois do prazo encerra sozinha com motivo
"tempo", nota 5/50 = 10%, 43 em branco no denominador.

*Tentativa encerrada:* sai do disco como "em andamento", entra no histórico
com a `versaoGabarito`, e reabrir mostra "Somente leitura" sem botão de
resposta.

*Revisão livre, mapa dos 50, marcação, confirmação que conta as pendências
antes, saída sem entregar, e encerramento que não depende de responder tudo.*

**O que segura a nota:**
- A conversão dos quatro graus da árvore em nota é **nossa**. O edital não
  publica como a banca pontua a árvore de diálogo. Declarado na tela, mas é
  uma diferença real.
- O edital 13.4 diz que a CPA também tem **cases**. Tratamos como múltiplas
  escolhas encadeadas dentro das 40 — é a leitura mais provável, não uma
  certeza.
- Os pesos por módulo (20/40/30/10) seguem `naoConfirmado`: o edital remete
  ao ANBIMA Edu e não publica peso por módulo.
- Rodando no navegador, **não há proteção contra manipulação**: quem abrir o
  console mexe em tempo, respostas e histórico. Foi assim que testei.

---

## 3. Experiência no celular e acessibilidade — peso 20% — **nota 8,5**

**O que sustenta (medido, não observado a olho):**

*Contraste — 21 pares pela fórmula WCAG 2.1, todos ≥ 4,5:1.* Antes, 11
estavam abaixo. Os piores:

| Elemento | Antes | Agora |
|---|---|---|
| Dourado do cronômetro | **2,15:1** | 4,73:1 |
| Texto apagado de 12px | 3,12:1 | 4,53:1 |
| Verde de acerto | 3,39:1 | 5,14:1 |
| Vermelho de erro | 3,91:1 | 5,34:1 |

Os matizes são os mesmos; só ficaram mais escuros. `conferir-contraste.js`
lê a paleta do arquivo montado, então mexer nas cores sem medir reprova o
build.

*Texto ampliado a 375×812 — testado a 100%, 150% e 200%:* nenhuma rolagem
horizontal, nenhuma alternativa cortada, nenhum botão estourando a largura,
alvo de toque mínimo de 40px nos três tamanhos.

*Relógio legível acima de uma hora* ("2:30:00", não "150:00").

*Progresso sem antecipar resultado:* barra cheia = respondido, contorno = em
branco, `aria-hidden` para não virar placar.

*Retomada correta,* `role="dialog"`/`aria-modal` nos modais, `role="timer"`
no cronômetro, `aria-pressed` nas alternativas, rótulo descritivo no mapa,
`prefers-reduced-motion` respeitado, áudio controlável e desligado no exame
por construção.

*Saída explícita da tela do exame* — antes só dava para sair entregando.

**O que segura a nota:**
- **Não testei em aparelho físico.** Emulação de viewport não é a mesma
  coisa e não vou apresentar como se fosse.
- **Foco de teclado: regra verificada, renderização não.** A regra
  `.cx button:focus-visible { outline: 3px solid var(--azul) }` está na folha
  de estilo e mira os elementos certos — confirmei lendo o CSSOM da página no
  ar. Mas `:focus-visible` só casa com input de teclado real, e o painel do
  navegador que eu dirijo não recebe teclado real. Então: regra presente e
  correta, comportamento visual **não observado**.
- Não testei com leitor de tela. Os atributos ARIA estão lá; que funcionem
  bem no VoiceOver segue sendo hipótese.

---

## 4. Confiabilidade e preservação dos dados — peso 15% — **nota 8,8**

**O que sustenta:**
- **Três chaves independentes:** progresso de estudo, tentativa em andamento,
  histórico encerrado. Erro em uma não derruba as outras.
- **Migração versionada** (`ESQUEMA = 2`) que só acrescenta: save v1 sobe
  preservando XP, precisão, pílulas, favoritas e fila de erros; é idempotente
  e aguenta nulo e lixo.
- **Dado ilegível não é apagado:** o app avisa na home e mantém o arquivo.
- **Backup valida antes de gravar** (9 testes) e agora **baixa como arquivo**,
  com instruções de restauração no cabeçalho — o código para copiar some com
  o histórico do navegador; um arquivo o usuário guarda onde quiser.
- **Corte do histórico em 30 avisa qual prova saiu** e sugere baixar o backup.
- **Nota antiga não é recalculada:** cada tentativa guarda a `versaoGabarito`.
- Interface diz o que sincroniza e o que fica só no aparelho.
- **O projeto saiu do computador:** fontes no GitHub, com a apostila da T2 e
  o token fora pelo `.gitignore` (verificado: o valor do token não aparece em
  arquivo nenhum do repositório).

**O que segura a nota:**
- Histórico e prova em andamento **não sincronizam** entre aparelhos (limite
  de 300 KB do Worker). Está escrito na tela, mas é limitação real.
- A restauração de backup por arquivo ainda exige abrir o .txt e colar o
  código — não há seletor de arquivo.

---

## 5. Desempenho e manutenção — peso 5% — **nota 8,0**

- `index.html` de 1,4 MB com todo o banco embutido: ~2s na primeira visita,
  offline depois. Pesado para rede móvel na estreia.
- Seis portões antes de publicar, cada um com um alvo diferente: estrutura,
  execução, acessibilidade, conteúdo, vazamento de resposta e matemática
  financeira.
- **O portão de vazamento nasceu de um erro meu, e o registro fica.** A
  checagem antiga media a MÉDIA do banco e imprimia "dentro da régua do
  caderno oficial" — com 36 questões entregando a resposta, uma delas com
  "R$ 200 mil" no enunciado e no gabarito. O Paulo achou em dois minutos o
  que a auditoria de 872 questões chamou de limpo. O `conferir-vazamento.js`
  julga questão por questão, conta números de qualquer tamanho, casa por
  radical, e calibra o corte nas 41 questões oficiais da ANBIMA. A lição de
  método é a mesma do teste de fumaça: **medir a média não é inspecionar o
  caso.** Quem responde uma questão por vez não responde a média.
- **O teste de fumaça fechou um buraco de método**, com demonstração: com o
  bug de zona morta reintroduzido, `verificar.js` imprime "TUDO CERTO" e o
  app abre em branco; `testar.js` reprova com a mensagem exata. Analisar
  sintaxe não é executar.
- As regras do exame vivem numa constante única com fonte e data por número.
- Contra: `99-motor.jsx` passou de 2.500 linhas. Ainda navegável pelos
  marcadores de tela, mas está no limite.

---

## Nota final ponderada

| Frente | Peso | 07/09 | 08/09 | Contribuição |
|---|---|---|---|---|
| Precisão e rastreabilidade do conteúdo | 30% | 7,5 | **8,8** | 2,64 |
| Integridade da avaliação e fidelidade ao exame | 30% | 8,5 | **9,3** | 2,79 |
| Experiência no celular e acessibilidade | 20% | 7,0 | **8,5** | 1,70 |
| Confiabilidade e preservação dos dados | 15% | 8,0 | **8,8** | 1,32 |
| Desempenho e manutenção | 5% | 7,5 | **8,0** | 0,40 |
| **Total** | 100% | **7,8** | | **8,85** |

### Por que ainda não é 10

Pelos critérios que a própria revisão fixou, não está. Falta:

1. **Leitura humana do banco além dos números.** A checagem automática pega
   número errado; não pega competência trocada entre reguladores nem nuance
   de conduta. Só leitura resolve, e ela cobriu ~5% dos níveis.
2. **Teste em aparelho físico e com leitor de tela.** Emulação e CSSOM não
   substituem.
3. **Comprimento das alternativas** ainda 37% abaixo do padrão da banca.
4. **Cases** — o edital cita, e nós tratamos como múltipla escolha encadeada
   sem confirmar.
5. **Pontuação da árvore** — a banca não publica a regra; a nossa é
   declarada, mas é nossa.
6. **Pesos por módulo** ainda não confirmados em fonte oficial.

Chamar isso de 10 seria a nota por entusiasmo que o pedido proibiu.

### O que a matriz não deixa passar

Nenhum bloqueador presente:

- **gabarito incorreto conhecido:** nenhum. Os três problemas de conteúdo
  encontrados nas duas rodadas (carência de LCI/LCA, proteção do COE, regra
  de anulação) foram corrigidos com fonte e data.
- **vazamento antecipado no exame:** eliminado, com gate no build.
- **nota inflada:** eliminada. 10 de 50 dá 20%; anulada não infla mais o
  resultado.
- **risco conhecido de perda de histórico:** chaves independentes, dado
  ilegível preservado, backup validado e exportável, corte avisado.

O que sobra são lacunas de alcance e de confirmação — reais, e nomeadas.
