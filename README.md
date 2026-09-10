# Projeto CPA — pasta de trabalho

App de estudo gamificado para a certificação **CPA da ANBIMA**. Esta pasta é a
versão editável do projeto. O arquivo final, que roda no chat do Claude e no
iPhone, é gerado por um comando.

---

## Estado atual

| | |
|---|---|
| Módulos | 4 (pesos oficiais 20% / 40% / 30% / 10%) |
| Blocos | 22 |
| Níveis (pílulas) | 170 |
| Questões | 872 |
| Fichas de memorização | 170, com macete, pegadinha e exemplo aplicado |
| Glossário | 178 verbetes, clicáveis dentro do conteúdo |
| Fichas de confronto | 15 comparativos, com a armadilha da banca |
| Tabelão | 105 números decorados, em 20 temas |
| Cantigas | 7 melodias mnemônicas, com letra sincronizada |
| Árvores de decisão | **20 atendimentos interativos, 120 decisões graduadas** |
| Tamanho do arquivo final | ~1,4 MB (`app/index.html`) |
| Modo de exame | 40 múltipla escolha + 10 itens de árvore, 2h30, lacrado, **com memória entre provas** |

Distribuição: M1 com 43 níveis e 202 questões · M2 com 71 e 345 · M3 com 40 e
221 (inclui o bloco R de reforço e o bloco S situacional) · M4 com 16 e 104.

---

## Modo de exame (lacrado) — leia antes de mexer

O app tem **dois modos separados de propósito**. Misturá-los foi o defeito mais
grave que já corrigimos aqui: o "formato prova" antigo reaproveitava a tela de
estudo e, por isso, corrigia cada questão na hora — cor, som, explicação e
placar. Não era avaliação, era estudo cronometrado.

| | Estudo | Exame |
|---|---|---|
| telas | `quiz`, `resultado` | `provaHome`, `prova`, `provaFim` |
| correção | imediata, com explicação | só depois de entregar |
| som | sim | **nenhum** |
| placar durante | sim | **nenhum** |
| voltar e trocar resposta | não | sim, até entregar |
| anular resposta | sim (foi toque sem querer) | **não** |
| cronômetro | contador em memória | prazo absoluto no disco |
| onde salva | `projeto-cpa-completo-v1` | `projeto-cpa-prova-v1` e `-historico-v1` |

### As três invariantes do exame

1. **Nada corrige antes da entrega.** Sem classe `ok`/`no`, sem `q.exp`, sem
   `Som.*`, sem `GRAUS[...]`, sem contagem de acertos. O `verificar.js` recorta
   o bloco da tela e reprova o build se qualquer um desses aparecer lá dentro.
2. **A nota sai de `corrigir()` e de mais lugar nenhum.** Pendência conta zero e
   **continua no denominador**; item anulado sai do denominador levando o motivo
   junto; a aprovação compara a fração exata com o corte, nunca o arredondado.
   Teste canônico: 10 acertos e 40 em branco = **20%**, não 100%.
3. **O prazo é um instante absoluto (`fimEm`) gravado no disco.** Recarregar,
   bloquear o celular ou trocar de app não devolve tempo; voltar depois do
   prazo cai direto no encerramento automático, com motivo `"tempo"`.

Uma tentativa encerrada entra no histórico com a `versaoGabarito` usada e
**nunca é recalculada** — corrigir o banco depois não reescreve nota antiga.

### `REGRAS_EXAME` — a fonte da verdade

Todo número do exame mora nessa constante, e **cada um carrega a sua origem**:

- `oficial` — publicado pela ANBIMA e conferido na data em `verificadoEm`;
- `pedagogica` — escolha nossa, declarada como tal na tela;
- `naoConfirmado` — consta em fonte secundária e ainda não foi reconferido.

Confirmado em **08/09/2026** no **Edital dos Exames de Certificação Anbima
v1.4 (28/05/2026)** e na página oficial da CPA:

| Regra | Valor | Onde está |
|---|---|---|
| Duração | 2h30 | edital 13.5.a |
| Total de questões | 50 | edital 3.2 e 13.5.a |
| Múltipla escolha contextualizada | 40 | página oficial da CPA |
| Árvore de decisão | 10 | página oficial da CPA (edital 13.4: "árvore de diálogo") |
| **Aprovação** | **35 acertos** | edital 3.2, tabela "Mínimo de acertos para aprovação" |
| Dificuldade | 25% / 50% / 25% | página oficial da CPA |
| Questão anulada | creditada a todos | edital 16.1 |
| Fecha sozinha no prazo | sim | edital 13.6 |

Dois pontos que a rodada anterior tinha errado, e o edital corrigiu:

1. **O corte é um NÚMERO, não um percentual.** O edital diz 35 acertos em 50.
   Dá 70%, mas quem decide é o 35 — por isso `corrigir()` compara acertos,
   não porcentagem. Antes estava `naoConfirmado`; agora é `oficial`.
2. **Questão anulada NÃO sai do denominador.** O edital 16.1 diz que ela é
   "atribuída a todas as pessoas candidatas": vira acerto para todo mundo e
   a prova continua valendo 50. Tirar do total, como estava, facilitaria a
   aprovação e não é o que a banca faz.

Nunca troque um número aqui sem trocar a fonte e a data junto.

Atenção ao que a ANBIMA de fato diz: são **10 questões relacionadas a árvore**,
não 10 árvores. O sorteio pega atendimentos inteiros desde a primeira fala e
corta no décimo item — a conversa nunca começa no meio.

### Dificuldade: a proporção é da ANBIMA, a classificação é nossa

A página oficial publica **25% fácil / 50% médio / 25% difícil**. Para o
sorteio respeitar isso, cada questão precisa de um rótulo. A tentação é
treinar um classificador nos 39 exemplos rotulados do caderno oficial.
**Medimos antes de fazer** — correlação entre o rótulo da banca e as features
de texto:

```
comprimento do contexto        r = 0,067
comprimento das alternativas   r = 0,071
quantidade de números          r = 0,014
números nas alternativas       r = 0,044
exige cálculo                  r = 0,186   <- a mais forte, e ainda é ruído
```

O rótulo da ANBIMA **não é previsível pelo texto**. Um classificador ajustado
ali seria adivinhação com aparência de método, então não foi feito.

O que `scripts/rotular-dificuldade.js` faz: ordena por uma **régua declarada**
(o quanto as quatro alternativas se parecem entre si — a mais pesada —, mais
densidade de siglas, carga de leitura, presença de cálculo, condição no
gabarito) e corta nos percentis 25/75 **dentro de cada módulo**. Corte global
não serviria: o M2 levaria quase todos os "difícil" e o sorteio ponderado não
fecharia a distribuição.

Resultado: 25/50/25 exatos em todos os quatro módulos, com 611 valores de
carga distintos (sem empate arbitrário na fronteira). O app diz na tela que a
ordenação é nossa e a proporção é da banca.

### Fora do sorteio do exame

Questão cujo conteúdo não tem lastro em nenhuma fonte declarada recebe
`foraDoExame: true` e um `motivoFora`. Ela **continua no estudo**, com o aviso
na tela, e **não entra no exame** — avaliação não cobra o que não dá para
justificar. Hoje são 2 (as de DAO). `scripts/marcar-fora-do-exame.js` mantém
a lista; a tela do exame mostra quantas ficaram de fora e por quê.

Apagar seria pior: esconde o problema e some com conteúdo que talvez esteja
certo.

### Árvores: a posição não pode entregar a resposta

Havia um defeito silencioso: a "Melhor escolha" estava na **1ª posição em 30 de
30 decisões**. Clicar sempre em A dava 100%. A correção tem duas camadas, e
mexer em uma sem a outra reabre o buraco:

1. a ordem na **fonte** é rebalanceada por `scripts/equilibrar-arvores.js`,
   que rotaciona as alternativas de cada decisão — hoje 30/30/30/30 nas 120;
2. a apresentação é **sorteada por tentativa** (`ordensDaArvore`), e a escolha é
   gravada pelo **índice original** — nunca pela posição na tela, senão o
   embaralhamento descolaria a nota do comentário.

Medido no site em 20 aberturas da mesma árvore: a posição A trouxe a melhor
escolha 3 vezes, e os quatro graus apareceram.

---

## Auditoria: dois scripts, propósitos diferentes

```
node build.js                      # monta o .jsx e gera o app/index.html
node scripts/verificar.js          # ESTRUTURA e DADOS (~70 checagens)
node scripts/testar.js             # EXECUTA o código (302 testes)
node scripts/conferir-contraste.js # ACESSIBILIDADE (WCAG 2.1)
node scripts/conferir-numeros.js   # CONTEÚDO contra fonte primária
node scripts/conferir-vazamento.js # a questão entrega a própria resposta?
node scripts/testar-tvm.js         # matemática financeira das ferramentas
```

Os seis têm de passar antes de publicar.

**`verificar.js`** olha o dado parado: contagens, IDs, gabaritos válidos,
viés de comprimento, vazamento, eliminação por exaustão, distribuição de
dificuldade, lacre do exame.

**`testar.js`** roda o código com entradas escolhidas para quebrá-lo.
Começa por um **teste de fumaça**: as constantes de topo são de fato
avaliadas numa VM. Isso existe por causa de um bug real — `ELEGIVEIS_EXAME`
usava `TODAS_CHAVES` uma linha antes da declaração. A sintaxe estava perfeita,
`verificar.js` disse "TUDO CERTO", o build passou, e o app abria em tela
branca, porque `const` não sobe. **Analisar sintaxe não é executar.**
Depois vêm embaralhamento (4.000 sorteios), correção (15 casos), cronômetro,
migração, backup, sincronia e sorteio.

**`conferir-contraste.js`** lê a paleta do arquivo montado e mede as 21
combinações de texto pela fórmula da WCAG. Reprova abaixo de 4,5:1.
Na primeira medição, 11 pares estavam abaixo — o pior era o dourado do
cronômetro, em 2,15:1.

**`conferir-numeros.js`** é a auditoria conceitual em escala. Confere os
gabaritos contra uma tabela de fatos verificados em fonte primária (FGC,
tabelas regressivas, PGBL, come-cotas, IOF, LCI/LCA/LCD, debênture
incentivada, COE, Selic Over, suitability) e checa se todo número afirmado
tem lastro na apostila — descontando resultado de conta, número de lei e
dado fornecido pelo próprio enunciado.

**`conferir-vazamento.js`** pergunta, questão por questão, se dá para acertar
sem saber a matéria. Ver a seção abaixo: ele existe porque a versão anterior
desta checagem deu o banco por limpo e o Paulo achou o contra-exemplo em dois
minutos.

---

## O simulado do concorrente, medido com as nossas réguas

O Paulo trouxe um simulado de 49 questões de um preparatório concorrente e
pediu para comparar. Rodei nele exatamente os mesmos scripts que rodam no
nosso banco e nas 41 questões do caderno oficial da ANBIMA. As três colunas
que importam:

| | gabarito é a + LONGA | gabarito é a + CURTA | gabarito é o que mais repete o enunciado | acima do corte de vazamento |
|---|---|---|---|---|
| Caderno oficial ANBIMA | 30% | 21% | 32% | 9,8% |
| Simulado do concorrente | **66%** | 16% | 32% | **16,3%** |
| Nosso banco (depois desta rodada) | 25% | 35% | 20% | **0,5%** |

Acaso = 25%. Corte de aprovação da CPA = 70%.

O número que salta é o 66%. **Quem não estudasse nada e marcasse sempre a
alternativa mais comprida acertaria 66% daquele simulado** — a quatro pontos
da aprovação. Não é uma prova de conhecimento; é uma prova de datilografia do
elaborador. O vazamento de resposta também está em 16,3%, quase o dobro do
que a própria banca pratica.

O simulado tem outras lacunas: 49 questões em vez de 50, nenhuma questão de
árvore de decisão (que são 10 dos 50 itens da prova real), e nenhum
comentário — só uma grade de gabarito no fim, que não ensina nada a quem
errou.

### O mesmo espelho apontado para nós

A comparação não serviu só para apontar o dedo. Rodando a régua no nosso
banco, apareceu o defeito espelhado: **o gabarito era a alternativa mais
CURTA em 63% das questões.** Chutar sempre a menor acertava 63%.

O `verificar.js` não pegou porque a checagem de viés de comprimento só olhava
um lado: "a correta é a mais longa?". A origem é conhecida e está registrada:
numa rodada anterior nós tínhamos o viés clássico e a correção enxugou os
gabaritos. Passou do ponto e parou do outro lado.

**Correção, em `scripts/engordar-gabaritos.js` (271 gabaritos reescritos):**
o gabarito passou a ter a mesma densidade de informação dos distratores.
Nenhum índice `c` foi tocado — o gabarito continua sendo a mesma alternativa.
A regra que me impus: nenhum acréscimo pode trazer fato que não esteja na
explicação já auditada daquela questão.

Isso deu errado uma vez, e o erro está registrado porque foi instrutivo: as
explicações muitas vezes parafraseiam o enunciado, então enriquecer o
gabarito com elas fez **16 questões voltarem a entregar a resposta**. O
`conferir-vazamento.js` acusou, e o lote 8 reescreveu as 16 com informação
que o enunciado não tem — efeito, alcance, consequência. Dois portões
puxando em direções opostas é exatamente o que impede uma correção de virar
um defeito novo.

O portão agora mede as duas pontas e exige 15%–35% em cada uma:

```
info PLACAR DO ESPERTALHÃO: chutar sempre a mais longa acerta 25% ·
     sempre a mais curta acerta 35%
     (acaso 25% · caderno oficial 30% e 21% · corte de aprovação 70%)
ok   tamanho da alternativa não denuncia o gabarito em nenhuma das duas direções
```

Fica declarado o que ainda não fechamos: nossas alternativas têm 82
caracteres contra 106 do caderno oficial. O tamanho não denuncia mais nada,
mas ainda escrevemos mais enxuto que a banca.

---

## Por que a prova repetia as mesmas questões

O Paulo relatou que no modo prova reencontrava sempre os mesmos atendimentos.
A causa não era a múltipla escolha — dos 870 itens elegíveis, cada prova sorteia
4% a 5% de cada balde de módulo e dificuldade. Era a árvore:

- 5 árvores × 6 falas = 30 passos;
- a prova consome 10 passos, ou seja, **duas árvores inteiras**;
- restavam **20 combinações possíveis**. Medido em simulação: sem memória,
  a segunda prova reencontrava um atendimento da primeira em **67% das vezes**.

**Duas correções.**

**1. Mais material.** De 5 para **20 árvores** (120 decisões), cobrindo os
quatro módulos: economia e SFN, produtos, relacionamento e conduta,
inovação. São **380 pares de atendimento possíveis** em vez de 20.

**2. Memória entre provas**, em `montarProva()`. O sorteio passou a ler o
próprio histórico — que já existe e já sincroniza entre aparelhos, sem chave
de disco nova — e a ordenar os candidatos por frescor: primeiro o que nunca
saiu, depois o mais antigo.

Ele **ordena, não proíbe**. Proibir repetição esvaziaria um balde pequeno e a
prova sairia fora da distribuição por módulo e dificuldade, que é regra da
banca. O embaralho vem antes do `sort` (estável no JS), então o acaso decide
a ordem dentro de cada faixa de recência e a recência só separa as faixas.

Testes que provam o comportamento, e não só a presença do código:

```
ok  200 ordenações põem as inéditas na frente e a mais antiga antes da recente
ok  entre iguais o sorteio continua aleatório
ok  com 5 árvores e sem memória, a 2ª prova repete em 67% das vezes
ok  com 20 árvores e memória, a 2ª prova nunca repete
```

### O equilibrador de posição

Escrever árvore tem um viés próprio: quem redige põe a resposta certa
primeiro e inventa as erradas depois. Nas 15 novas, a melhor escolha caiu na
primeira posição 26 vezes em 54. O `scripts/equilibrar-arvores.js`
**rotaciona** as quatro alternativas de cada decisão — as mesmas quatro, com
os mesmos graus e as mesmas justificativas, em outra ordem — e a
distribuição fechou em **30 / 30 / 30 / 30** nas 120 decisões. O script
aborta se o conjunto de alternativas mudar, o que garante que rotação é
rotação e não reescrita.

---

## O detector de vazamento, e por que o primeiro não servia

`verificar.js` já trazia uma checagem de vazamento desde o começo. Ela mede a
**média do banco**: em quantos por cento das questões o gabarito é a
alternativa que mais repete palavras do enunciado. Nas 872, deu 9% contra 34%
do caderno oficial, e o veredito impresso era *"vazamento de resposta dentro
da régua do caderno oficial"*.

Em 09/09/2026 o Paulo abriu uma questão e escreveu: *"está muito fácil, a
resposta está literalmente na pergunta"*. Era esta:

> …existe um mecanismo mantido pela bolsa que **ressarce**, em até **R$ 200
> mil**, o cliente **prejudicado** por ação ou omissão de um participante.
> O mecanismo que protege o investidor individual é:
>
> ✔ o Mecanismo de **Ressarcimento** de **Prejuízos**, que cobre até **R$ 200
> mil** por investidor lesado.

Ele estava certo, e a auditoria automática de 872 questões tinha chamado isso
de limpo. Três motivos concretos:

1. **O regex de token era `/[a-z]{4,}/`.** Não casa dígito. O `200` — o dado
   mais entregador da questão inteira — não existia para o detector. E `mil`
   tem três letras, abaixo do corte.
2. **Não havia radical.** `ressarce` e `Ressarcimento` eram palavras
   diferentes. `prejudicado` e `Prejuízos` também.
3. **Ele só olhava a média.** Uma questão podre entre 872 boas não move média
   nenhuma. Média serve para achar viés sistemático e é péssima para achar a
   questão individual quebrada. Eram duas perguntas diferentes, e eu só tinha
   respondido uma.

### O que o v2 faz

Três regras, aplicadas **uma questão por vez**:

| | regra | por quê |
|---|---|---|
| R1 | **palavra distintiva** — radical que aparece no enunciado, no gabarito e em **nenhum** distrator | é o que o aluno usa: procura a palavra rara e marca quem a repete. Se o radical também está nos distratores, ele não distingue nada |
| R2 | **número distintivo** — mesmo teste, com valores de qualquer tamanho (peso 2) | pior que a palavra: não exige nem ler a frase, só bater o algarismo |
| R3 | **sobreposição relativa** — fração do gabarito que veio do enunciado, menos a média dos distratores | pega o caso difuso, em que nenhum termo é exclusivo mas o gabarito inteiro é paráfrase da cena |

O radical é o prefixo de 5 letras (`preju` = `preju`, `ressa` = `ressa`).
É grosseiro e produz falso positivo — `constituição` e `constante` viram
`const`. Isso é aceitável porque o erro é **simétrico**: infla gabarito e
distratores igualmente, e as três regras são comparativas.

### O corte não foi escolhido, foi medido

O script parseia as **41 questões do caderno oficial da ANBIMA** e roda nelas
exatamente as mesmas três regras. O corte é o **percentil 90 do oficial**:
o que reprova é o que entrega mais resposta do que a própria banca entrega
nos seus 10% piores. Sem isso, qualquer corte seria chute — toda questão bem
escrita repete algum termo do enunciado no gabarito.

Vale registrar o que a medição do oficial mostrou, porque é a resposta à
pergunta que o Paulo fez (*"há questões desse nível no exame?"*): **sim, a
banca também faz isso.** Quatro das 41 ficam acima do próprio p90. A pior
(carga 10,57) descreve as parcelas e o CET das propostas e o gabarito
devolve os mesmos números. Duas outras são paráfrase quase literal da cena.
Ou seja: existe questão fácil no exame — o edital prevê 25% de fáceis — e
existe questão da banca com o defeito. O que não dá é usar isso como teto.

### Resultado

| | antes | depois |
|---|---|---|
| acima do corte | 39 de 872 (4,5%) | 4 de 872 (0,5%) |
| dessas, vazamento real | 36 | **0** |
| dessas, questão de cálculo | 3 | 4 |
| carga média | 1,17 | 1,02 |
| carga máxima | 8,19 | 7,03 |

As "questões de cálculo" não são varridas para debaixo do tapete: são as em
que o enunciado **precisa** dar os números e o gabarito **precisa** usá-los
(payback, juros simples, PIB pela ótica da demanda). O script as separa e as
conta em linha própria, em vez de escondê-las do relatório.

### Como as 36 foram corrigidas

`scripts/corrigir-vazamento-v2.js`, com **48 trocas de texto**, todas
declaradas no próprio arquivo com o motivo. **Nenhuma muda qual alternativa é
a correta** — o índice `c` não é tocado em nenhuma questão, porque o Paulo já
tem tentativas de exame gravadas e mexer no gabarito reescreveria prova
antiga. Dois padrões:

- **P1 · o enunciado explicava demais.** O personagem "lembrava" a definição
  do conceito que a pergunta pedia em seguida. Cortada a definição, mantida a
  cena. Foi o caso da maioria.
- **P2 · o gabarito ecoava o enunciado.** A justificativa depois da vírgula
  era paráfrase da última frase da cena. Reescrita para **acrescentar**
  informação — um limite, uma norma, uma consequência — em vez de repetir.

Em oito questões apareceu junto o defeito de **eliminação por exaustão**: o
enunciado descartava explicitamente um ou dois distratores (*"um diretor
citou o teto de R$ 20 milhões, que pertence às sanções de lavagem"*). Esses
trechos saíram também.

O `verificar.js` ganhou um comentário no bloco antigo dizendo o que ele mede
e o que ele **não** mede, para que ninguém volte a ler "dentro da régua" como
"o banco está limpo".

---

## Publicar

O sandbox **não alcança api.github.com**, mas alcança github.com. Então o
caminho é git, não API:

```
git clone https://x-access-token:$TOKEN@github.com/paulohtai/projeto-cpa.git
cp app/index.html .   &&   git commit -am "..."   &&   git push
```

O token fica em `scripts/.token` e **nunca** vai para o repositório. O repo
público recebe **somente o `index.html` compilado** — jamais a apostila (material
com direitos autorais da T2 Educação) nem as fontes.

O GitHub Pages serve com cache: para conferir a versão nova no navegador, use
`index.html?nc=<qualquer coisa>`.


---

## Como trabalhar aqui

```bash
node build.js               # remonta app/projeto-cpa-completo.jsx
node scripts/verificar.js   # auditoria completa (rode SEMPRE antes de entregar)
```

O build é concatenação textual pura, então o arquivo gerado é **byte a byte
idêntico** ao que já está rodando, desde que as partes não mudem. Nunca edite
`app/projeto-cpa-completo.jsx` à mão: edite as partes e reconstrua.

### Estrutura

```
src/00-header.jsx            import do React e cabeçalho
src/dados/modulo-1.part.js   dados do Módulo 1  (fragmento JSON dentro do array)
src/dados/modulo-2.part.js   dados do Módulo 2
src/dados/modulo-3.part.js   dados do Módulo 3 (blocos 3.1 a 3.4 + blocos R e S)
src/dados/modulo-4.part.js   dados do Módulo 4
src/dados/exemplos.part.js   mapa EXEMPLOS: casos aplicados das fichas
src/dados/glossario.part.js  mapa GLOSSARIO: verbetes dos termos técnicos
src/dados/confrontos.part.js CONFRONTOS (comparativos) e TABELAO (números)
src/dados/musicas.part.js    MUSICAS: cantigas mnemônicas com melodia
src/dados/arvores.part.js    ARVORES: questões interativas (árvore de decisão)
src/99-motor.jsx             motor: índices, estilo (tema claro), áudio e telas
build.js                     remonta o arquivo único
scripts/verificar.js         auditoria de integridade e qualidade
scripts/aplicar-patch.js     aplica patches JSON em lote nas alternativas
referencia/                  apostila e programa oficial em texto
sync/                        serviço de sincronia entre aparelhos + guia
```

### Formato dos dados

```js
{
  id: "1",  nome: "...",  subtitulo: "...",  peso: 20,
  blocos: [{
    id: "1.1", titulo: "...", subtitulo: "...",
    niveis: [{
      id: "1.1.1", titulo: "...",
      resumo: ["parágrafo", "..."],   // aparece na tela da pílula
      macete: "...",                  // aparece só na ficha
      pegadinha: "...",               // aparece só na ficha
      questoes: [{ q, alts: [4], c, exp }]  // a ÚLTIMA é a de redenção
    }],
    boss: [{ q, alts: [4], c, exp }]  // chefão do bloco, corte em 70%
  }]
}
```

O mapa `EXEMPLOS` é separado: `"1.1.1": ["situação concreta", "como a regra resolve"]`.

---

## Regras do projeto (aprendidas na prática, não negociáveis)

1. **Regra Zero.** O conteúdo vem da apostila T2 Educação (edição 2026),
   cruzada com o Programa Detalhado oficial da ANBIMA. Nada de conhecimento
   solto: se não está numa das duas fontes, não entra. Os blocos **R** e **S**
   do Módulo 3 são as exceções declaradas: cobrem itens que o programa exige e
   a apostila não traz (R: lacunas técnicas; S: questões situacionais de
   prospecção, atendimento e habilidades comportamentais), redigidos a partir
   do programa oficial.

2. **Alternativas equilibradas.** O gabarito NÃO pode ser a alternativa mais
   longa. Já corrigimos 237 questões por causa disso. Mantenha as 4 alternativas
   com comprimento parecido e faça dos distratores quase-acertos, que erram por
   um detalhe só. O `verificar.js` reprova qualquer questão cujo gabarito seja
   30% mais longo que o maior distrator, e monitora o viés ESTRITO (correta
   maior que todos os distratores) com teto de 35% do banco — empate de
   comprimento não entrega gabarito e é contado à parte.

3. **Posição sorteada.** A função `embaralhar()` reordena as alternativas a cada
   exibição. Não remova: sem ela, o gabarito caía na letra B em ~75% dos casos.

4. **A ficha não entrega gabarito.** O exemplo de cada ficha é escrito só para
   ela. Jamais derive o exemplo de uma questão do banco: já tentamos e o usuário
   corretamente rejeitou, porque estudar a ficha revelava a resposta do
   exercício. O `verificar.js` checa essa colisão.

5. **Restrições do artifact.** Sem `localStorage` nem `sessionStorage` (o
   progresso usa `window.storage`). Precisa de `export default`. Só Tailwind e
   as bibliotecas permitidas, e neste projeto o estilo é CSS puro embutido.

6. **Som 100% sintetizado.** O artifact não carrega arquivos de áudio, então
   tudo é WebAudio puro, gerado em código no módulo `Som` do motor: trilha
   ambiente calma (pads senoidais em Am7·Fmaj7·Cmaj7·G6, um acorde a cada 4 s,
   sem bateria — a primeira versão chiptune foi rejeitada por ser irritante) e
   efeitos de acerto, erro, combo, nível vencido, chefão e favoritar ficha. No iPhone o áudio só destrava no
   primeiro toque (listener de `pointerdown`). O botão 🔊/🔇 fica no cabeçalho
   e a preferência é salva no progresso (chave `som`; códigos antigos de backup
   sem essa chave continuam válidos — ela assume `true`).

7. **Glossário só no conteúdo.** Os termos técnicos viram links no resumo das
   pílulas e abrem uma caixinha com o significado. NUNCA em questões,
   alternativas ou explicações — ali a definição entregaria gabarito, e o
   `verificar.js` reprova se `marcarTermos` for chamado em mais de um lugar.
   A marcação é automática (plural incluído), mas palavras ambíguas ficam na
   lista `NAO_MARCAR`: no conteúdo elas aparecem em outro sentido — "termo de
   adesão", "opção de compra", "os juros são o prêmio por esperar" — e por isso
   só existem na tela do Glossário. Ao criar verbete novo, cheque se a palavra
   tem outro uso corrente antes de deixá-la marcável.

8. **Memorização é recuperação, não releitura.** Nos maços de Revisão e de
   Pontos fracos a ficha nasce fechada (🔒) e o cabeçalho não abre: só o botão
   "Tentei — revelar" libera. É proposital — puxar da memória fixa muito mais
   que reler, e por isso o gatilho não pode virar um clique automático. Nos
   demais filtros a ficha abre direto, para consulta.

9. **Cantiga não inventa número.** As melodias são ORIGINAIS (nada de letra
   sobre canção de terceiros) e todo valor cantado precisa existir no conteúdo
   já validado — o `verificar.js` cruza os números por extenso da letra com os
   resumos e reprova o que não tiver lastro. A notação é `"C4"` para colcheia,
   `"C4*2"` para o dobro e `"-"` para pausa; a faixa fica entre C4 e D5 para
   caber em qualquer voz, e isso também é verificado. Ao criar cantiga nova,
   escreva um verso por ideia: o destaque da letra acompanha a LINHA, não a
   sílaba.

10. **O formato é o da banca, não o nosso.** As fontes oficiais estão em
    `referencia/LEIA-ANBIMA-OFICIAL.md` (caderno com 40 questões reais do
    exame-piloto + guia de elaboração da ANBIMA). Regras que o `verificar.js`
    passa a exigir: nada de enunciado negativo (EXCETO, INCORRETA) e nenhum
    termo absoluto no gabarito. Termos absolutos em distrator são tolerados
    por ora, com contagem informativa. A prova são 50 questões em 2h30:
    40 de múltipla escolha contextualizada (~800 caracteres de contexto) e
    10 interativas — por isso o simulado formato prova roda 40, e as
    interativas vivem na tela de Atendimento.

11. **Árvore de decisão é conversa graduada, não certo/errado.** Cada árvore
    tem ~6 prompts e 4 escolhas por prompt, com graus 3/2/1/0 (melhor, boa,
    razoável, abaixo do ideal) e uma justificativa em cada uma. TODAS levam ao
    prompt seguinte, como no exame. O `verificar.js` reprova árvore que não
    tenha exatamente os quatro graus distintos por prompt.

12. **Fora do programa, fora do app.** Já foram removidos: programação da HP12C,
   cálculo detalhado da duration, ETF em profundidade, cold wallet como aula e
   tributação de criptoativos. Não reintroduza sem checar o programa oficial.

---

## Anular resposta dada sem querer

Toque errado na tela acontece, e o custo era real: −5 XP, combo zerado, a
questão entrando na fila de revisão e o nível marcado como erro na precisão.
Por isso o painel de feedback traz **"↩ Toquei sem querer · anular esta
resposta"**. Ele restaura XP, combo, precisão do nível, fila de erros e o
placar da sessão ao estado anterior, e reabre a questão.

Como funciona: `responder()` guarda em `desfazer` o retrato do que aquela
resposta mudou (XP e combo anteriores, estatística do nível antes, e se a
questão já estava na fila de erros). `anularResposta()` reverte item a item.
O estado é limpo ao avançar de questão e ao abrir nova sessão — ou seja, só dá
para anular a resposta que está na tela, nunca uma anterior.

## Progresso do usuário

**Cada aparelho tem o seu.** O progresso vive no armazenamento do navegador,
então iPhone e computador são cofres separados por natureza — inclusive
navegadores diferentes no mesmo aparelho, e, no iOS, a aba do Safari e o ícone
da Tela de Início podem ser contextos distintos. Há três pontes:

1. **Sincronia automática** (recomendada, JÁ CONFIGURADA): endereço
   `https://noisy-forest-23fd.paulohta.workers.dev`, código em
   `sync/COMO-CONFIGURAR.md`. O serviço roda na conta Cloudflare do Paulo
   (worker `noisy-forest-23fd` + KV `progresso-cpa` ligado como `PROGRESSO`);
   o código-fonte está em `sync/worker.js`. Ao abrir, o app compara as datas e
   resolve nos DOIS sentidos: nuvem mais nova, ele puxa; aparelho mais novo
   (quem estudou offline), ele empurra. O mesmo ocorre quando a internet volta,
   pelo evento `online`. Durante o uso, envia 4 s depois da última mexida. A
   decisão mora na função pura `decidirSync`, coberta por 7 cenários no
   `verificar.js`. Sem endereço configurado, NADA sai do aparelho.
2. **Substituir tudo**: cole o código de backup do outro aparelho e use
   *Substituir* — é o que copia o progresso sem inflar nada.
3. **Somar**: mantém o comportamento antigo, para fundir os apps legados.

Fica em `window.storage`, na chave `projeto-cpa-completo-v1`. Guarda XP, combo,
níveis feitos, melhores placares dos chefões, precisão por nível, fila de erros,
fichas favoritas, a agenda de revisão espaçada (chave `rev`: favoritar uma ficha
agenda revisões em 1, 3, 7, 15 e 30 dias, conforme "lembrei/esqueci") e a
preferência de som.

O app exporta e importa esse estado como um código de texto. A importação
**soma** vários códigos colados um por linha, o que permitiu migrar os quatro
apps antigos (por isso os IDs de nível e bloco precisam continuar únicos).

**Fluxo entre ambientes:** o app oficial de estudo agora é o site
**https://paulohtai.github.io/projeto-cpa/** — no iPhone, abra no Safari e use
"Adicionar à Tela de Início" para ele virar um app de tela cheia. O progresso
do site fica no localStorage do Safari (via shim do `gerar-site.js`); os
códigos de backup migram progresso entre o site e o chat nos dois sentidos.
O `.jsx` continua funcionando como artifact no chat, se precisar.

**Publicação (a cada alteração):**

```bash
node build.js               # gera o .jsx E o app/index.html (versão web)
node scripts/verificar.js   # auditoria — só publique com TUDO CERTO
node scripts/publicar.js    # sobe para o GitHub Pages (precisa de rede ao GitHub)
```

**Caminho de publicação que funciona (descoberto na prática):** o sandbox
alcança `github.com`, mas NÃO alcança `api.github.com` nem `github.io`. Ou
seja, a API REST está bloqueada, mas **git push funciona**:

```bash
cd /tmp && git clone https://USUARIO:TOKEN@github.com/USUARIO/projeto-cpa.git pub
cp app/index.html pub/ && cd pub && git commit -am "..." && git push origin main
```

É o método preferido: não depende do navegador. O token fica em
`scripts/.token`, arquivo local que NUNCA vai para o repositório — o repo
público recebe somente o `index.html` compilado, jamais a apostila ou as
fontes. Como o sandbox não enxerga `github.io`, a confirmação de que o site
subiu precisa ser feita pelo navegador (ou por você, abrindo a URL).

Alternativa, se o git falhar: publicar pela API do GitHub via Claude no
Chrome. Na prática, peça "publica" ao fim de uma sessão de edição. A URL não
muda, então o iPhone sempre vê a versão mais nova ao abrir.

---

## O que falta / próximos passos possíveis

- ~~CONVERSÃO DO BANCO PARA O FORMATO OFICIAL~~ **CONCLUÍDA em 07/08/2026:
  as 872 questões estão no formato da prova.** O que segue é o registro de
  como foi feito, útil se um dia precisar reescrever em massa de novo.

- **CONVERSÃO DO BANCO PARA O FORMATO OFICIAL (concluída — 872 de 872).**
  Ordem por retorno: M2 (40% da prova) → M3 (30%) → M1 (20%) → M4 (10%).
  O `verificar.js` mostra o placar a cada build e reprova conversão fora do
  tamanho da banca. **Alvo aferido no caderno oficial: 493 caracteres sem
  espaços no contexto+comando e 418 nas quatro alternativas somadas** — e não
  os 800 nominais do guia, que nenhuma questão real alcança na média.

  **ARMADILHA DA CONVERSÃO — leia antes de converter qualquer coisa.** O erro
  mais fácil de cometer é escrever o contexto PARTINDO da resposta: o enunciado
  acaba repetindo a definição do gabarito e o aluno acerta só casando palavras.
  Aconteceu em 269 das 768 primeiras convertidas. A régua está medida no
  caderno oficial: lá o gabarito é a alternativa que mais repete palavras do
  enunciado em 34% dos casos, com diferença média de sobreposição de +0,038.
  O `verificar.js` mede isso a cada build e REPROVA acima de 40% / +0,07.
  Reparo concluído em 07/08/2026: as 269 questões afetadas tiveram o enunciado
  reescrito, e o índice caiu de 41% / +0,118 para 9% / −0,038. Ficou um pouco
  ABAIXO da régua oficial (+0,038), ou seja, hoje o gabarito compartilha um
  pouco menos vocabulário com o enunciado do que na prova real — folga segura,
  mas se um dia for reescrever em massa, mire em zero em vez de negativo.
  Detalhe do medidor: empate não conta como vazamento. Quando dois distratores
  têm as mesmas palavras e diferem só nos números, casar vocabulário não ajuda.

  **O VAZAMENTO AO CONTRÁRIO — eliminação por exaustão.** Existe um segundo
  defeito, que só medir o gabarito não pega: o enunciado descreve os TRÊS
  distratores e deixa a resposta por sobra. O aluno acerta escolhendo a única
  opção que o texto ainda não mencionou. Exemplo real que passou meses no app:
  o enunciado dizia o que são a Lei 13.709/2018, a 9.613/1998 e a 6.385/1976,
  "cabendo à outra norma o dever de sigilo" — as três leis eram três das quatro
  alternativas. Régua do caderno oficial: só 1 questão em 41 tem folga acima de
  0,15 (distratores menos gabarito). Tínhamos 62. Todas reescritas, e o
  `verificar.js` agora reprova acima de 2%.

  **Ao criar ou reescrever, mire no MEIO.** Enunciado que ecoa o gabarito
  entrega a resposta; enunciado que ecoa os distratores entrega por eliminação.
  A faixa saudável de (gabarito − média dos distratores) é de −0,12 a +0,08.
  A receita de contexto sem vazamento está em `conversao/INSTRUCOES.md`, e o
  procedimento de reparo em `conversao/vazamento/COMO-REPARAR.md`.

  Resultado final: M1 202/202 · M2 345/345 · M3 221/221 · M4 104/104.
  Enunciado médio 433 caracteres sem espaços (caderno oficial: 493);
  alternativas somadas 322 (oficial: 418). Vazamento em 8% (oficial 34%).

  **Como o M2 foi feito em uma sessão:** com agentes em paralelo, um por bloco.
  O fluxo que funcionou está pronto para repetir nos outros módulos:
  1. `conversao/INSTRUCOES.md` — o brief do formato, com regras e exemplo.
  2. Gerar `conversao/PENDENTE-<bloco>.json` com as questões ainda curtas
     (níveis + chefão), via script que filtra por tamanho do enunciado.
  3. Um agente por bloco, cada um lendo INSTRUCOES + um PRONTO já aprovado
     (para calibrar tom) e escrevendo `conversao/PRONTO-<bloco>.js`.
     Peça ao agente que escreva o arquivo EM PARTES — se a sessão cair no meio,
     o trabalho não se perde (aconteceu na primeira rodada).
  4. Validar tudo antes de integrar: cobertura, 4 alternativas, índice do
     gabarito, faixas de tamanho, ausência de absolutos e de enunciado
     negativo, gabarito não ser o mais longo, e sobreposição de termos entre o
     gabarito novo e o antigo (pega troca acidental de resposta).
  5. Integrar casando pelo enunciado ANTIGO e reserializar o part file.

  Sozinho, sem agentes, o ritmo é de 15 a 17 questões por sessão.

  Receita da conversão, que funcionou bem: pegar a questão antiga, identificar
  o fato que ela testa, criar uma cena com persona e números, deixar o COMANDO
  na última frase e reescrever os distratores explicando por que cada um erra
  (sem "sempre/nunca", sem enunciado negativo). O script `/tmp/conv-*.js` usado
  no lote casa pelo enunciado ANTIGO e reserializa o part file inteiro.
  Modelo a seguir: `referencia/anbima-caderno-questoes-cpa.txt`.
- Escrever mais árvores de decisão (hoje 4; a prova traz 10 questões do tipo).
- Reescrever os 22 distratores que ainda usam "sempre/nunca/tudo".
- Enxugar o tamanho, se pesar no iPhone (o CSS e as listas longas são os alvos).
- Reforçar os 47 níveis que têm só 2 questões principais + redenção (prioridade
  para R, M3 e M4), sempre com base na apostila.
- Importar o banco de questões (já em JSON) para a plataforma COTA.

Já entregues: simulado formato prova (60 questões, 2h30 corridos, extra ao
simulado normal), revisão espaçada das fichas favoritas, glossário clicável no
conteúdo, fichas de confronto, tabelão de números, recuperação ativa e maço
automático dos pontos fracos (níveis abaixo de 70% de precisão).

---

## Revisão profunda de 07/09/2026 — o que mudou e o que ficou pendente

### Corrigido nesta rodada

| # | Defeito | Evidência antes | Estado |
|---|---|---|---|
| 1 | Melhor alternativa sempre na 1ª posição do atendimento | 30 de 30 decisões | corrigido em duas camadas |
| 2 | Exame vazava a correção item a item | som, cor, explicação e `{sessao.acertos} ✓` | tela nova, lacrada e com gate no build |
| 3 | Nota só sobre as respondidas | `acertos / sessao.marcas.length` | `corrigir()` única; pendência no denominador |
| 4 | Cronômetro em memória, reiniciava ao recarregar | `setRelogio(0)` em `abrir()` | prazo absoluto `fimEm` no disco |
| 5 | Exame tinha 40 itens, sem árvore | `QUESTOES_PROVA = 40` | 40 + 10, como a banca |
| 6 | "Simulado oficial" para material autoral | 2 ocorrências | "Simulado autoral" + aviso na tela |
| 7 | Dava para anular depois de ver o gabarito | botão no feedback | só existe no estudo |
| 8 | Sem revisão, sem confirmação, sem histórico | — | mapa, marcação, confirmação e histórico imutável |
| 9 | Carência de LCI/LCA dada como incondicional | "6 meses" seco | condicionada a papel sem índice de preços (Res. CMN 5.215/2025) |
| 10 | COE "protegido" apresentado como sem risco | "não corre risco de perder" | risco de crédito do emissor e ausência de FGC explicitados |
| 11 | `pop()` dentro do `find()` esvaziava o baralho | prova quebrava ao montar | achado pelo teste de interface, corrigido |
| 12 | Relógio ilegível acima de 1h | "149:36" | `fmtRelogio` → "2:29:36" |
| 13 | Tela do exame sem saída | só dava para sair entregando | "Sair sem entregar" |
| 14 | Backup aceitava qualquer base64 | `d.xp === undefined` | `backupValido()` com 9 testes |

### Investigado e NÃO confirmado como defeito

- **Comando negativo** — 9 ocorrências apontadas pelo detector, todas falso
  positivo: termos técnicos ("investidor não residente", "bem de não uso",
  "prática não equitativa") e contrastes legítimos ("exigência, e não dever").
- **Distribuição do gabarito na fonte** (212/308/201/151, com B em 35%) —
  neutralizada em tempo de execução por `embaralhar()`, que sorteia a ordem ao
  abrir a sessão e remapeia `c`. Verificado com 4.000 sorteios.

### Pendências reais

- **Corte de 70%** — não está na página oficial da CPA. Está marcado
  `naoConfirmado` no código e na interface. Confirmar no edital.
- **Pesos por módulo (20/40/30/10)** — vêm do programa detalhado anterior;
  a página nova lista os 4 módulos sem publicar peso. Também `naoConfirmado`.
- **Conversão dos graus da árvore em nota** — a ANBIMA não publica a regra.
  Adotamos "só a Melhor escolha pontua", declarado na tela como leitura nossa.
- **Dificuldade 25/50/25** — é regra oficial e o banco ainda não está calibrado
  por dificuldade (não temos rótulo de dificuldade por questão). O sorteio é
  ponderado por módulo, não por dificuldade.
- **Revisão conceitual do banco** — a auditoria automática cobre as 872; a
  revisão conceitual manual desta rodada cobriu os temas prioritários, não o
  banco inteiro. Ver AVALIACAO.md para o alcance exato.
- **Comprimento das alternativas** — 322 caracteres somados contra 508 do
  caderno oficial. Ainda abaixo do padrão da banca.
- **DAO** — sem lastro na apostila nem no caderno oficial. Continua no banco,
  aguardando conferência contra o Programa Detalhado completo.

---

## Rodada de 08/09/2026 — fechando as lacunas da revisão anterior

A revisão de 07/09 terminou em 7,8 com cinco lacunas nomeadas. Esta rodada
atacou as cinco.

| Lacuna de 07/09 | O que foi feito |
|---|---|
| Corte de 70% sem fonte primária | Confirmado no **edital 3.2**: 35 acertos de 50. Passou a `oficial`, e a correção agora decide por número de acertos |
| Sem rótulo de dificuldade | 872 questões rotuladas por régua declarada, 25/50/25 exato em cada módulo, sorteio do exame respeitando a distribuição |
| Rastro de origem só no README | `fonte`, `auditadoEm` e `revisadoEm` gravados em cada um dos 170 níveis |
| Revisão conceitual em ~4% do banco | `conferir-numeros.js` cobre 100% do banco contra 15 fatos de fonte primária e checa lastro de todo número afirmado |
| Contraste não medido | 21 pares medidos pela WCAG; 11 estavam abaixo de 4,5:1 e foram corrigidos |

Achados novos desta rodada:

- **Regra de anulação estava errada.** Eu tirava a questão anulada do
  denominador. O edital 16.1 diz que ela é atribuída a todas as pessoas
  candidatas — vira acerto e o total continua 50. Corrigido, com 3 testes.
- **Zona morta temporal em `ELEGIVEIS_EXAME`.** App em tela branca em
  produção, com todos os portões verdes. Fechado com o teste de fumaça,
  e a demonstração está no README: com o bug reintroduzido, `verificar.js`
  diz "TUDO CERTO" e `testar.js` reprova.
- **Contraste do cronômetro em 2,15:1.** O elemento mais importante da tela
  do exame era o menos legível.
- **Backup só existia como texto para copiar.** Agora baixa arquivo.
- **O histórico cortava a 30ª prova em silêncio.** Agora avisa qual saiu.

### O projeto saiu do computador

O repositório passou a receber as **fontes**, não só o app compilado:
`src/`, `scripts/`, `build.js`, `sync/`, os guias e a documentação.
Qualquer máquina clona e continua:

```
git clone https://github.com/paulohtai/projeto-cpa.git
cd projeto-cpa && npm install
node build.js && node scripts/verificar.js && node scripts/testar.js
```

Continuam **fora** do repositório, pelo `.gitignore`:

- `referencia/` — apostila da T2 Educação e cadernos. Material de terceiros
  com direitos autorais; republicar seria errado. Os scripts que dependem
  dela avisam e seguem sem ela.
- `scripts/.token` — o token de publicação.
- `app/projeto-cpa-completo.jsx` — 1,5 MB que o build reconstrói.

O raciocínio que mudou em relação à regra antiga ("o repo recebe só o
index.html"): as 872 questões **já eram públicas**, porque o `index.html`
compilado as contém em texto puro e sempre esteve no ar. Subir `src/` não
expõe nada de novo. O que precisa continuar fora é o material de terceiros
e o token — e continua.

---

## O defeito da sincronia (diagnosticado em 08/09/2026)

Sintoma relatado: o progresso do computador não batia com o do celular, e o
do celular era o correto.

### O que foi medido

Lendo o `localStorage` do Chrome do usuário e a chave do Worker no mesmo
instante:

| | Computador | Nuvem |
|---|---|---|
| XP | 9.720 | 9.720 |
| Tópicos com precisão | 165 | 165 |
| Pílulas vencidas | 143 | 143 |
| Fila de erros | 68 | 68 |
| `quando` | 08/09 18:39:09 | 08/09 18:39:09 |

**Idênticos, ao milissegundo.** Então a sincronia não estava falhando em
enviar — o que estava na nuvem era exatamente o computador. O que faltava era
o celular ter chegado lá.

### As duas causas

**1. O envio era um `setTimeout` de 4 segundos, sem despejo ao sair.**

```js
temporizadorNuvem = setTimeout(() => nuvemEnviar(...), 4000);
```

No iPhone basta **bloquear a tela ou trocar de app** para o Safari congelar
ou encerrar a página. O timer nunca dispara. O `localStorage` já gravou — por
isso o celular mostrava o progresso certo — mas a nuvem nunca soube. Não
havia nenhum `pagehide` nem `visibilitychange` no código: confirmado por
busca antes de mexer.

**2. A regra de conflito era cega.** `decidirSync` compara um carimbo de
tempo e substitui o estado inteiro. Quem gravou por último leva tudo. Com o
celular preso na causa 1, qualquer gravação posterior no computador virava
"a verdade", e na próxima abertura o celular **puxaria e apagaria o próprio
progresso**.

### As correções

**Despejo ao esconder e ao fechar.** `pendenteNuvem` guarda o que ainda não
subiu; `pagehide` e `visibilitychange → hidden` mandam na hora, com
`fetch(..., { keepalive: true })`, que o navegador conclui mesmo depois de a
aba morrer. O estado tem ~10 KB, bem abaixo do limite de 64 KB do keepalive.
`sendBeacon` não serve: só faz POST, e o Worker só aceita PUT. O atraso do
envio normal caiu de 4 s para 1,5 s. Se o despejo falhar, o pendente volta
para a fila em vez de sumir.

**Puxar deixou de ser silencioso.** `conflitoDeSync(local, nuvem)` mede
respostas dadas, pílulas vencidas e XP dos dois lados. Se este aparelho tem
alguma coisa que a nuvem não tem, o app **para e pergunta**, dizendo
exatamente o que se perderia, e não grava nada até a escolha. Continua
last-write-wins no caso comum; o que mudou é que o caso perigoso virou
decisão do usuário, não do relógio.

11 testes cobrem `conflitoDeSync` e 8 cobrem o despejo.

### O histórico passou a sincronizar (08/09/2026)

A versão anterior deixava as provas encerradas presas em cada aparelho, com o
argumento do limite de 300 KB do Worker. **O argumento estava certo, a
conclusão não.** Medindo: uma tentativa crua ocupa 6,6 KB, e trinta dariam
199 KB — folga pequena demais. Mas a gordura era o nome dos campos repetido
50 vezes por prova.

**Compactar em vez de truncar.** Cada item virou uma linha
`chave;ordem;gabarito;resposta;marcada`. A tentativa caiu para **1,3 KB**
(5× menor) e trinta cabem em **40 KB**. O que trafega é a prova inteira, então
a **revisão item a item funciona em qualquer aparelho** — não só naquele em
que a prova foi feita.

Três decisões que sustentam isso:

1. **O `gabarito` viaja junto; o rótulo do módulo, não.** Uma correção feita
   no banco depois não pode reescrever o que aquela prova mostrou na tela.
   Já `mId`/`nId` são só rótulos e se rederivam do banco atual. (Eu tinha
   removido os dois no primeiro corte, e a revisão de uma prova vinda de
   outro aparelho apareceu como `Mundefined · undefined`. Pego no teste de
   interface.)

2. **O histórico é UNIDO por id, nunca substituído.** XP e precisão seguem a
   regra do carimbo mais recente, porque são o mesmo dado evoluindo. Provas
   encerradas não: cada uma é um fato próprio, e uma feita no celular não
   pode apagar a que foi feita no computador. Por isso a união roda **sempre**,
   inclusive quando a decisão de sincronia foi "nada".

3. **Apagar precisa de lápide.** Sem registrar o id apagado, a próxima união
   traria a prova de volta — o outro aparelho ainda a tem e não teria como
   saber. `apagados` viaja junto e a exclusão vale em todos os aparelhos.

Cada tentativa também grava **em que aparelho foi feita** (iPhone, Computador,
Mac…), e a lista mostra isso.

30 testes cobrem o codec, a união e as lápides. Verificado no ar: prova
plantada na nuvem apareceu no computador com a revisão correta; prova apagada
reinjetada no disco **não** ressuscitou.

### Pausar e retomar (08/09/2026)

A frase acima dizia que a prova em andamento não sincronizava, "porque um
cronômetro só não faria sentido entre aparelhos". Estava errado pelo motivo
certo: o problema não é o cronômetro, é **não haver como parar o cronômetro**.
Com pausa explícita, os dois aparelhos passam a fazer sentido.

**O contrato, e ele está escrito na tela:**

| | Rodando | Pausada |
|---|---|---|
| relógio | `fimEm` absoluto — recarregar não devolve tempo | parado em `restanteSeg` |
| encerra sozinha no prazo | sim | **não** — o relógio não corre |
| aceita resposta | sim | não |
| vai para a nuvem | fica no aparelho | **sobe na hora** |

**As respostas sobem AO PAUSAR, não a cada questão.** Retomar em outro
aparelho retoma do ponto em que foi pausado. Sincronizar a cada toque seria
conversa constante com o servidor por um ganho que ninguém pediu — e a
semântica ficaria confusa ("de que momento eu retomo?").

Ao retomar, o prazo renasce: `fimEm = agora + restanteSeg × 1000`. Testado
com um dia de pausa: devolve exatamente o tempo que sobrou, nem um segundo a
mais.

**Qual prova vale** quando os dois lados têm uma: `escolherProva` fica com a
mexida mais recentemente (`atualizadoEm`), e descarta qualquer uma cujo id já
esteja no histórico — prova encerrada não ressuscita.

**Honestidade no resultado.** Cada pausa incrementa `pausas` e soma em
`tempoPausadoMs`. O resultado e a lista do histórico mostram
"pausada N× · M min fora do relógio", com a frase: *a nota vale; a condição
de prova, não — no exame de verdade não existe pausa*. Sem isso, dava para
pausar antes de cada questão difícil e o histórico não contaria a diferença.

38 testes cobrem o relógio, o codec, a escolha entre aparelhos e os avisos.
Verificado no ar: pausa congelou o relógio por 12 s reais e subiu as 50
questões com 36 respostas (12,8 KB); retomada devolveu 8.998 s de 8.998 s, no
mesmo item, com as respostas intactas.

### O que continua sendo por aparelho

Nada, no exame. Progresso de estudo, histórico de provas e prova pausada
sincronizam. Só a **prova rodando** fica no aparelho até você pausar.

---

## Camada visual (09/09/2026) — `src/55-visual.jsx`

Profundidade, revelação por scroll, luz que segue o cursor, cabeçalho que
condensa, aurora de fundo e contador de XP. Só `transform` e `opacity`
animam; um único listener de ponteiro e um de scroll para o app inteiro,
ambos passivos.

### A regra que nasceu de um erro

**Decoração nunca esconde conteúdo.**

A primeira versão fazia o óbvio: `.rv { opacity: 0 }` e o JS revelava. A home
abriu **em branco** em produção. Duas causas somadas:

1. `useRef` não estava importado — o app quebrava na renderização. O teste
   de fumaça não pegou porque ele executa o TOPO do módulo, não o render.
2. Mesmo com isso corrigido, o efeito de revelação rodava **antes de o
   conteúdo existir** (o app ainda lia o disco), encontrava zero alvos,
   **desarmava** e nunca mais voltava — a dependência era só a tela.

Agora o estado escondido só existe sob `<html data-rv="1">`, e o JS só liga
essa marca **depois** de confirmar que consegue revelar. Sem
IntersectionObserver, com `prefers-reduced-motion`, com o script falhando ou
com o conteúdo ainda não montado: o app fica sem animação, e **legível**.
Há ainda uma rede que revela tudo em 1,2 s de qualquer jeito.

A revelação usa `data-on`, não classe: o React reescreve `className` num
re-render e apagaria o efeito. Atributo que ele não gerencia, ele não toca.

### Dois portões novos

- **Hooks importados.** Varre `use[A-Z]` no arquivo montado e confere contra
  a linha de importação do React. Comprovado: revertendo o `useRef`, o teste
  reprova com "faltando: useRef".
- **Orçamento de movimento.** Nenhum `@keyframes` pode animar `width`,
  `height`, `top`, `left`, `margin` ou `padding` — só o que a GPU resolve
  sem recalcular layout.

Mais 16 testes cobrem o desligamento no exame, o `prefers-reduced-motion`,
os listeners passivos e a rede de segurança. 295 no total.

### O que NÃO brilha, de propósito

A tela da prova (`.cx-lacrado`) desliga a camada inteira: sem aurora, sem
luz de cursor, sem revelação, sem lift, sem varredura no título. Efeito ali
disputa atenção com a questão e pode sugerir estado que não existe. As
outras 16 telas recebem `<Aurora />`; a da prova, não.
