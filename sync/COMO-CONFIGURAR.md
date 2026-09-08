# Sincronia entre iPhone e computador — configuração

> ## ✅ JÁ ESTÁ CONFIGURADO (07/08/2026)
>
> O serviço foi criado e testado na conta Cloudflare do Paulo. Os passos 1 a 6
> abaixo ficam só como referência, caso algum dia seja preciso refazer.
>
> | | |
> |---|---|
> | **Endereço** | `https://noisy-forest-23fd.paulohta.workers.dev` |
> | **Código** | `g884j-psj22-v6c49-53cra` |
> | Worker | `noisy-forest-23fd` (o nome saiu aleatório na criação) |
> | KV | `progresso-cpa`, ligado como variável `PROGRESSO` |
>
> Testado: grava, lê, recusa código com menos de 12 caracteres e isola
> cofres de códigos diferentes. O computador já está configurado; falta só
> repetir endereço e código no iPhone.

O app não tem servidor: cada navegador guarda o progresso no próprio
aparelho. Para os dois enxergarem o mesmo estado, é preciso um endereço na
internet que guarde o progresso. Este guia cria esse endereço em ~3 minutos,
de graça e sem cartão de crédito.

Você faz os passos 1 a 5. Depois é só colar o endereço no app — não precisa
reconstruir nem republicar nada.

---

## 1. Criar a conta

Acesse **dash.cloudflare.com/sign-up** e crie uma conta gratuita (e-mail e
senha). Confirme o e-mail.

## 2. Criar o depósito (KV)

No menu à esquerda: **Storage & Databases → KV → Create instance**.

- **Namespace Name:** `progresso-cpa`
- Clique em **Create**.

## 3. Criar o worker

No menu à esquerda: **Compute (Workers) → Workers & Pages → Create → Start
with Hello World! → Get started**.

- **Name:** `sync-cpa`
- Clique em **Deploy** (ele publica um exemplo; já já trocamos o código).

## 4. Colar o código

Ainda na página do worker, clique em **Edit code** (ou **Continue to
project → Edit code**).

- Apague TUDO o que estiver no editor.
- Cole o conteúdo do arquivo `sync/worker.js` deste projeto.
- Clique em **Deploy**.

## 5. Ligar o depósito ao worker

Na página do worker: **Settings → Bindings → Add → KV Namespace**.

- **Variable name:** `PROGRESSO`  ← precisa ser exatamente isso, em maiúsculas
- **KV namespace:** `progresso-cpa`
- **Deploy** para salvar.

## 6. Copiar o endereço

No topo da página do worker aparece a URL, algo como:

```
https://sync-cpa.SEU-NOME.workers.dev
```

**Esse é o endereço.** Copie e cole no app, em *Sincronizar entre aparelhos*.

---

## Como usar no app

1. **No aparelho que tem o progresso bom** (no seu caso, o iPhone): abra o app,
   role até **Sincronizar entre aparelhos**, cole o endereço, toque em
   **Gerar código** e depois em **Enviar para a nuvem**.
2. **Anote o código** que apareceu. Ele é a chave do seu cofre: quem tiver o
   endereço e o código consegue ler e gravar o seu progresso.
3. **No outro aparelho**: cole o mesmo endereço, digite o mesmo código e toque
   em **Buscar da nuvem**.

Daí em diante é automático: ao abrir, o app puxa o que estiver na nuvem se for
mais recente; ao estudar, ele envia sozinho alguns segundos depois.

## Regras e limites

- **Quem ganha em caso de conflito:** a versão com data mais recente. Se você
  estudou no celular sem internet e depois abriu no computador, sincronize o
  celular assim que ele voltar à rede, antes de estudar no computador.
- **Custo:** o plano gratuito da Cloudflare dá 100 mil leituras e 1.000
  escritas por dia. Um estudante sozinho usa uma fração ínfima disso.
- **Privacidade:** o que trafega é só o progresso de estudo (XP, acertos,
  fichas favoritas). Ainda assim, trate o código como senha: ele é a única
  coisa que separa o seu cofre do de outra pessoa. Por isso o worker recusa
  códigos com menos de 12 caracteres.
- **Se um dia quiser desligar:** basta apagar o endereço no app. O progresso
  local continua funcionando normalmente, como sempre funcionou.
