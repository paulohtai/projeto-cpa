# Avaliação — 07/09/2026

Revisão profunda do Projeto CPA. Cada nota abaixo é justificada por medição ou
teste executado, não por impressão. Onde não houve medição, está escrito.

---

## Alcance declarado da auditoria

Sem isto as notas não significam nada.

| Frente | Existente | Auditado automaticamente | Revisado conceitualmente à mão |
|---|---|---|---|
| Questões | 872 | **872 (100%)** | **~35 itens** dos temas prioritários |
| Árvores de decisão | 5 (30 decisões) | 30 (100%) | 30 (100%) |
| Fichas / pílulas | 170 | 170 (estrutura) | 3 (LCI/LCA/LCD, COE, tributação) |
| Glossário | 178 verbetes | 178 (estrutura) | 0 nesta rodada |
| Confrontos / tabelão | 15 / 105 números | 100% (estrutura) | 0 nesta rodada |

**Não é verdade que "todo o conteúdo foi validado".** A validação estrutural
cobre 100% do banco; a conferência conceitual contra fonte primária cobriu os
temas que a revisão pediu para priorizar. O resto permanece como estava.

---

## 1. Precisão e rastreabilidade do conteúdo — peso 30% — **nota 7,5**

**O que sustenta:**
- 872 questões, 0 IDs duplicados, 0 enunciados repetidos, 0 alternativas
  duplicadas ou vazias, 0 gabaritos inválidos, 0 explicações ausentes.
- Viés de comprimento: gabarito estritamente mais longo em **4%** do banco
  (teto que nos impusemos: 35%; no caderno oficial da ANBIMA fica bem acima).
- Vazamento por repetição de palavras: gabarito lidera em **9%** contra **34%**
  no caderno oficial; diferença média **−0,012** contra **+0,038** deles.
- Eliminação por exaustão: **0%** contra 2% do caderno oficial.
- Termos absolutos em gabarito: 2 encontrados, 2 corrigidos. Em distrator: 0.
- Consistência numérica cruzada em FGC, tabela regressiva, PGBL, come-cotas,
  IOF e previdência: **nenhuma contradição** entre gabaritos.
- Duas correções de conteúdo com fonte primária e data nesta rodada:
  carência de LCI/LCA (Res. CMN 5.215/2025 — os 6 meses valem para papel **sem**
  atualização por índice de preços) e proteção do COE (é do emissor, sem FGC).

**O que segura a nota:**
- A revisão conceitual manual cobriu ~4% do banco. Um gabarito errado em tema
  não priorizado passaria despercebido.
- As questões **não carregam metadado de origem por item** (qual trecho da
  apostila, qual item do PD, data da última revisão). O rastro existe no README
  e nos commits, não no dado. Isso é uma lacuna real de rastreabilidade.
- **DAO** continua no banco sem lastro na apostila nem no caderno oficial.
  Reportado, não removido: falta o Programa Detalhado completo para decidir.
- Alternativas somam 322 caracteres contra 508 do caderno oficial — ainda
  abaixo do padrão de redação da banca.

---

## 2. Integridade da avaliação e fidelidade ao exame — peso 30% — **nota 8,5**

**O que sustenta (tudo verificado no site publicado):**
- Estrutura conferida em **fonte primária** (página oficial da CPA, 07/09/2026):
  2h30, 40 múltipla escolha contextualizada, 10 questões de árvore. Implementado
  exatamente assim: 25 montagens conferidas, sempre 40 + 10, pesos 8/16/12/4.
- **Nenhuma correção antes da entrega.** Medido na página: sem classe `ok`/`no`,
  sem bloco de explicação, sem som, sem grau, sem placar, sem as palavras
  "Acertou/Errou/Gabarito". O `verificar.js` recorta o bloco da tela e reprova
  o build se qualquer um desses voltar.
- **A nota inclui as pendências.** Teste canônico rodado no site: 10 acertos e
  40 em branco → **20%**, com a conta explicada na tela ("10 ÷ 50 = 20%") e a
  frase "o denominador continuou sendo 50". Antes: 100%.
- **Cronômetro por prazo absoluto.** Recarga no meio da prova: `fimEm` idêntico,
  posição e respostas preservadas, relógio de 150:00 para 149:36 — o tempo
  correu. Voltar 2 min depois do prazo: encerrou sozinha com motivo `"tempo"`,
  nota 5/50 = 10%, 43 em branco no denominador.
- **Tentativa encerrada é imutável:** some do disco como "em andamento", entra
  no histórico com a `versaoGabarito`, e reabrir mostra "Somente leitura" sem
  nenhum botão de resposta.
- Revisão livre, mapa dos 50 itens, marcação para revisar, confirmação de
  entrega que **conta as pendências antes**, e saída sem entregar.
- Encerrar não depende de responder tudo — o prazo pode acabar com itens em aberto.
- Toque repetido na mesma alternativa não altera nada (verificado no site).

**O que segura a nota:**
- O **corte de 70% não foi reconfirmado** em fonte primária. Está marcado
  `naoConfirmado` no código e aparece assim na tela — mas é o número que decide
  aprovado/reprovado, e ele está sem fonte atual.
- A conversão dos 4 graus da árvore em nota é **nossa**, não da banca. Declarada
  na tela, mas é uma diferença real em relação ao exame.
- O banco **não tem rótulo de dificuldade**, então o sorteio não reproduz o
  25/50/25 que a ANBIMA publica. É uma regra oficial que ainda não cumprimos.
- Sendo tudo no navegador, **não há proteção contra manipulação**: quem abrir o
  console consegue mexer no `localStorage` e alterar tempo, respostas e
  histórico. Foi exatamente assim que testei. Não prometemos o contrário.

---

## 3. Experiência no celular e acessibilidade — peso 20% — **nota 7,0**

**O que sustenta (medido a 375×812, emulação de iPhone):**
- **Zero rolagem horizontal** (`scrollWidth` 375 = `innerWidth` 375).
- **Nenhum alvo de toque abaixo de 40px** na tela do exame.
- Relógio legível acima de uma hora ("2:29:45", não "149:45") — corrigido nesta
  rodada, era um defeito real de acabamento.
- Progresso visível **sem antecipar resultado**: barra cheia = respondido,
  contorno = em branco, e nada de verde/vermelho. Marcada com `aria-hidden`
  para não ser lida como placar.
- Retomada correta: sai e volta no mesmo item, com as mesmas respostas e ordem.
- Modais com `role="dialog"` e `aria-modal`, cronômetro com `role="timer"`,
  alternativas com `aria-pressed`, itens do mapa com rótulo descritivo.
- `prefers-reduced-motion` já respeitado; áudio com controle e desligado no
  exame por construção.
- `overflow-wrap:anywhere` no enunciado e quebra da navegação em coluna abaixo
  de 400px.

**O que segura a nota:**
- **Não testei em aparelho físico.** O que fiz foi emulação de viewport no
  navegador — não é a mesma coisa e não vou apresentar como se fosse.
- Não testei com **ampliação de texto** do sistema nem com leitor de tela real.
  Os atributos ARIA estão lá; que funcionem bem no VoiceOver é hipótese.
- Contraste não foi medido com ferramenta: `--mut` (#8E8FA3) sobre papel claro
  provavelmente fica perto do limite de 4.5:1 em texto pequeno.
- Foco de teclado usa o padrão do navegador; não há estilo de foco próprio.

---

## 4. Confiabilidade e preservação dos dados — peso 15% — **nota 8,0**

**O que sustenta:**
- **Três chaves separadas**: progresso de estudo, tentativa em andamento,
  histórico encerrado. Um erro em uma não derruba as outras.
- Migração versionada (`ESQUEMA = 2`) que **só acrescenta**: testado que um save
  v1 sobe preservando XP, precisão, pílulas, favoritas e fila de erros, é
  idempotente e aguenta nulo e lixo.
- Dado ilegível **não é apagado**: o app avisa na home e mantém o arquivo, para
  o backup poder ser restaurado por cima.
- Backup passou a validar de verdade (9 testes: sem xp, xp texto, xp negativo,
  NaN, Infinity, listas trocadas, nulo, string solta) — antes aceitava qualquer
  base64 e gravava lixo por cima.
- Nota antiga **não é recalculada**: cada tentativa guarda a `versaoGabarito`.
- Interface diz explicitamente o que sincroniza e o que fica só no aparelho.
- Sem backend novo, sem dependência nova, sem serviço pago: continua um único
  HTML no GitHub Pages.

**O que segura a nota:**
- Histórico e prova em andamento **não sincronizam** entre aparelhos (limite de
  300 KB do Worker). É honesto e está escrito na tela, mas é uma limitação real:
  quem faz a prova no celular não vê o histórico no computador sem exportar.
- O histórico é cortado em 30 tentativas, sem aviso ao usuário quando corta.
- Não há exportação em arquivo — só o código base64 para copiar e colar.

---

## 5. Desempenho e manutenção — peso 5% — **nota 7,5**

- `index.html` de 1,4 MB com todo o banco embutido: carrega em ~2s e funciona
  offline depois, mas é pesado para a primeira visita em rede móvel.
- Build determinístico por concatenação; dois portões (`verificar.js` com ~60
  checagens e `testar.js` com 75 testes) que precisam passar antes de publicar.
- As regras do exame estão numa constante única com fonte e data — mudar o
  formato da prova é mexer em um lugar.
- Contra: `99-motor.jsx` passou de 2.400 linhas num arquivo só. Ainda navegável
  pelos marcadores de tela, mas está no limite.

---

## Nota final ponderada

| Frente | Peso | Nota | Contribuição |
|---|---|---|---|
| Precisão e rastreabilidade do conteúdo | 30% | 7,5 | 2,25 |
| Integridade da avaliação e fidelidade ao exame | 30% | 8,5 | 2,55 |
| Experiência no celular e acessibilidade | 20% | 7,0 | 1,40 |
| Confiabilidade e preservação dos dados | 15% | 8,0 | 1,20 |
| Desempenho e manutenção | 5% | 7,5 | 0,38 |
| **Total** | 100% | | **7,8** |

### Por que não é 10

A meta era "10/10 significa qualidade demonstrada por critérios e testes".
Pelos critérios da própria revisão, **não está lá** — e dizer que está seria
justamente o tipo de nota por entusiasmo que o pedido proibiu. Falta:

1. revisão conceitual do banco além dos temas prioritários (hoje ~4%);
2. rastro de origem **por questão**, não só no README;
3. o corte de 70% confirmado em fonte primária;
4. rótulo de dificuldade para reproduzir o 25/50/25 oficial;
5. teste em aparelho físico e com leitor de tela.

### O que a matriz NÃO deixa passar

Nenhum dos bloqueadores declarados está presente:

- **gabarito incorreto conhecido:** nenhum. Os dois problemas de conteúdo
  encontrados (carência de LCI/LCA e proteção do COE) eram simplificações
  excessivas, ambas corrigidas com fonte e data.
- **vazamento antecipado no modo de exame:** eliminado e com gate no build.
- **nota inflada:** eliminada; 10 de 50 dá 20%, verificado no site.
- **risco conhecido de perda de histórico:** as três chaves são independentes,
  dado ilegível não é apagado e o backup valida antes de gravar.

O que sobra são lacunas de alcance e de confirmação — reais, mas nomeadas.
