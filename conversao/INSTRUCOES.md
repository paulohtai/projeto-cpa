# Como converter questões ao formato oficial da prova CPA

Você vai reescrever questões de um banco de estudo para o formato usado pela
ANBIMA na prova CPA. **O conteúdo testado não muda — muda a roupagem.**

## O formato, medido nas 40 questões reais do caderno oficial

| | Alvo | Faixa aceitável |
|---|---|---|
| contexto + comando, caracteres SEM espaços | **~490** | 350 a 800 |
| as 4 alternativas somadas, SEM espaços | **~420** | 300 a 620 |

Ou seja: cada alternativa fica por volta de 105 caracteres sem espaços
(aproximadamente 125 com espaços). Nada de alternativa de três palavras.

## Anatomia de cada questão

1. **Contexto**: uma cena real de trabalho, com pessoa nomeada, papel
   profissional e os números necessários. Traga só o que é preciso para
   resolver — nada de detalhe decorativo.
2. **Comando**: a ÚLTIMA frase do enunciado, indicando exatamente o que
   responder. Exemplos: "…, o profissional deve explicar que:", "Nessas
   condições, o IOF devido na operação é de:", "A subdivisão correta é:".
3. **4 alternativas**: a correta e três distratores. Cada alternativa traz a
   resposta **e o motivo**, no mesmo universo semântico.

## ⚠ REGRA MAIS IMPORTANTE: o contexto NÃO pode entregar a resposta

O erro mais comum ao converter é escrever o contexto **a partir da resposta**.
O resultado é um contexto que repete a definição do gabarito, e a questão deixa
de medir conhecimento: o aluno só precisa casar as palavras.

**ERRADO** (o contexto define a resposta):
> "…Essas operações de altíssimo giro, de **liquidez de curtíssimo prazo**,
> feitas **entre instituições financeiras e com a participação do Banco
> Central**, formam uma das subdivisões do mercado. A subdivisão é o mercado:"
> · gabarito: "monetário, em que se negocia **liquidez de curtíssimo prazo
> entre as instituições e o Banco Central**."

**CERTO** (o contexto descreve a CENA; a definição fica só nas alternativas):
> "…Ao final do expediente, a tesouraria do banco fica com sobra de caixa e
> precisa aplicá-la até a manhã seguinte, enquanto outra instituição corre para
> cobrir um déficit de reservas no mesmo prazo. Um analista recém-contratado
> pergunta em qual subdivisão do mercado financeiro essas operações se
> enquadram. A resposta correta é o mercado:"
> · gabarito: "monetário, em que se negocia liquidez de curtíssimo prazo entre
> as instituições e o Banco Central."

Note a diferença: a versão certa mostra o que ACONTECE (sobra de caixa,
déficit de reservas, prazo de um dia) sem usar os termos técnicos que definem
a resposta. O aluno precisa saber que isso se chama mercado monetário.

**Teste antes de fechar cada questão:** cubra as alternativas e leia só o
enunciado. Se dá para deduzir a resposta apenas repetindo palavras do texto,
reescreva o contexto. As palavras-chave que definem o gabarito devem aparecer
NAS ALTERNATIVAS, não no enunciado.

**Cuidado com o efeito colateral:** não basta tirar as palavras do gabarito do
enunciado — o contexto também não pode ter vocabulário que só combine com um
distrator. O ideal é um contexto neutro, que descreva a situação sem espelhar
nenhuma das quatro opções.

## Regras absolutas da banca

- **Proibido enunciado negativo**: nada de "EXCETO", "INCORRETA", "NÃO é".
  Se a questão original for negativa, reescreva em forma positiva (peça para
  identificar o item que pertence à OUTRA categoria).
- **Proibidos termos absolutos em qualquer alternativa**: "sempre", "nunca",
  "tudo", "todo", "completamente", "totalmente". Nem no gabarito, nem nos
  distratores.
- **Proibido** "todas as anteriores" ou referência a outras alternativas.
- **Distratores plausíveis**: não podem ser obviamente errados nem diferir do
  gabarito por um detalhe mínimo. Devem ser o erro que um aluno realmente
  cometeria — troca de conceito, inversão de regra, confusão de faixa.
- **Comprimento equilibrado**: o gabarito NÃO pode ser a alternativa mais
  longa. Mantenha as quatro com tamanho parecido. Isso é eliminatório.
- Se o enunciado original começa com "REDENÇÃO:", mantenha esse prefixo no
  começo do novo enunciado (é uma marcação do app).

## Exemplo de conversão bem feita

ANTES:
> "Um CDB é resgatado 400 dias após a aplicação. A alíquota de IR sobre o
> rendimento é:" · alternativas: "22,5%" / "20%" / "17,5%" / "15%"

DEPOIS:
> "Sandra aplicou em um CDB prefixado e programou o resgate para quando fosse
> trocar de carro. O resgate acabou acontecendo 400 dias depois da aplicação.
> Ao conferir o extrato, ela comentou com o profissional CPA que a atende que
> esperava a alíquota mínima de imposto, porque tinha ouvido de um colega que,
> passando de um ano, o investidor já paga a menor faixa da tabela. O
> profissional explicou que a tabela regressiva da renda fixa tem quatro
> faixas, contadas em dias corridos, e que a menor delas exige um prazo bem
> mais longo do que doze meses. Diante do prazo efetivamente cumprido por
> Sandra, a alíquota de imposto de renda sobre o rendimento é de:"
>
> - "17,5%, faixa aplicável às aplicações mantidas entre 361 e 720 dias contados da data da aplicação."
> - "15%, faixa aplicável às aplicações mantidas por mais de 720 dias contados da data da aplicação."
> - "20%, faixa aplicável às aplicações mantidas entre 181 e 360 dias contados da data da aplicação."
> - "22,5%, faixa aplicável às aplicações resgatadas em até 180 dias contados da data da aplicação."

Repare: a resposta certa continua sendo 17,5%; o que mudou foi a cena e o
fato de cada alternativa explicar a que faixa se refere.

## O que você recebe e o que devolve

Você recebe um arquivo `PENDENTE-<bloco>.json` com uma lista de questões, cada
uma com: `onde` (nível de origem), `q` (enunciado antigo), `alts` (as quatro
alternativas antigas), `c` (índice da correta, base zero) e `exp` (explicação).

Você devolve um arquivo `PRONTO-<bloco>.js` neste formato exato:

```js
module.exports = {
  "<enunciado ANTIGO, copiado byte a byte do campo q>": {
    q: "<novo enunciado com contexto e comando>",
    alts: ["<nova alternativa 1>", "<2>", "<3>", "<4>"],
    c: 0,
    exp: "<explicação, pode manter ou melhorar a original>"
  },
  ...
};
```

**Pontos críticos:**
- A chave DEVE ser o enunciado antigo idêntico, sem alterar um caractere — é
  por ela que a integração encontra a questão.
- `c` é o índice da alternativa CORRETA no seu novo array. A resposta correta
  precisa ser semanticamente a mesma da original (confira em `alts[c]` do
  arquivo de entrada antes de escrever).
- Converta TODAS as questões do arquivo. Não pule nenhuma.
- Não edite nenhum outro arquivo do projeto.
