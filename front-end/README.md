# CellShop — front-end

Tela de compra em React + TypeScript, com Vite. Vitrine, carrinho, checkout e consulta de pedido.

**A API precisa estar de pé.** Rodando local, o front não tem dados próprios: tudo vem do back-end em `http://localhost:3333`. Suba a API antes (`npm run start:dev` dentro de `back-end/`), ou use o `docker compose up --build` da raiz, que sobe os dois de uma vez.

---

## Pré-requisitos

Node 22 ou mais novo e npm.

## Rodando

```bash
npm install
cp .env.example .env
npm run dev
```

A tela abre em `http://localhost:5173`.

```bash
npm run build       # gera dist/
npm run preview     # serve o build local
npm test            # a suíte inteira
npm run test:watch  # em modo interativo
npm run typecheck   # tsc sem emitir
npm run lint        # eslint
```

Da raiz do repositório, `npm run dev` sobe o back e o front juntos, com os logs dos dois no mesmo terminal.

## `VITE_API_URL`

É a única variável, e ela guarda o prefixo de toda chamada à API:

```
VITE_API_URL=http://localhost:3333
```

Para apontar para outra porta ou outra máquina, é só trocar o valor e reiniciar o `npm run dev` — o Vite lê o `.env` na inicialização.


## Tipos gerados do contrato

Os tipos da API não são escritos à mão. Eles saem do `docs/openapi.json`, que por sua vez sai dos DTOs do back-end:

```bash
npm run api:types
```

O comando reescreve `src/api/types.generated.ts`. Rode ele sempre que o contrato mudar — campo novo, rota nova, status novo. Se o back mudou e você não regenerou, o `npm run typecheck` acusa nos pontos onde o código usa um formato que não existe mais. Esse é o objetivo: a mudança de contrato aparece como erro de compilação, não como bug em produção.

## Estrutura

```
front-end/src/
  api/          cliente HTTP, tipos gerados, envelope, dinheiro, tradução de erro
  components/   componentes de tela
  hooks/        consultas e mutações do TanStack Query
  pages/        uma por rota
  store/        carrinho e drawer, em Zustand
  tests/        utilitários, mocks e fixtures dos testes
  types/        tipos compartilhados
```

As rotas são `/` para a vitrine, `/produtos/:sku` para o detalhe, `/checkout`, `/orders` para o histórico e `/orders/:number` para um pedido.

O estado se divide em dois: o que vem do servidor fica no TanStack Query, que cuida de cache e revalidação; o que é só do navegador, o conteúdo do carrinho, fica no Zustand. 


## Roteiro de demonstração

O seed foi montado para que cada estado da tela seja alcançável sem preparar nada.

**Compra concluída.** Abra a vitrine, entre em qualquer capinha com estoque, adicione ao carrinho e finalize. A tela mostra o pedido com número, itens, totais e a trilha de eventos. Ele passa a aparecer em `/orders`.

O destinatário ainda não é digitado: enquanto o formulário de entrega não existe, o checkout envia um destinatário fixo, definido em `src/api/recipient.ts`. O contrato da API já é o definitivo, então o formulário entra no lugar dessa constante sem mexer no resto.

**Erro de validação.** Como não há formulário, o caminho para ver o `422` é chamar a API direto, com um CPF curto ou um e-mail sem `@` — o exemplo está no [README do back-end](../back-end/README.md). A resposta traz uma mensagem por campo, em português, no formato que a tela já sabe exibir: `spells out what the api rejected instead of only the generic message` cobre esse caminho nos testes.

**Produto esgotado.** `Rosa Magnólia · Galaxy S24` está com estoque zero. Ele aparece na vitrine — o cliente vê que existe — mas sem permitir a compra.

**Estoque insuficiente durante o checkout.** `Rose Butterfly Line · iPhone 14` começa com uma unidade. O passo a passo:

1. Abra o produto, adicione a única unidade ao carrinho e vá até o checkout.
2. Antes de finalizar, num terminal, compre essa mesma unidade pela API:

   ```bash
   curl -X POST http://localhost:3333/checkout \
     -H 'Content-Type: application/json' \
     -H 'Idempotency-Key: 7a2d1e3f-0b4c-4d6e-9f80-1b2c3d4e5f60' \
     -d '{
       "items": [{ "sku": "CAP-BUTTERFLY-IP14-AIS-TRA", "quantity": 1 }],
       "recipient": {
         "name": "Ana Beatriz Nogueira",
         "taxId": "39053344705",
         "email": "ana.nogueira@example.com",
         "zipCode": "01310930",
         "street": "Avenida Paulista",
         "number": "1578",
         "district": "Bela Vista",
         "city": "Sao Paulo",
         "state": "SP"
       }
     }'
   ```

3. Volte ao navegador e finalize. A resposta é `409` e a tela explica que o produto acabou.

É a demonstração do porquê de a checagem morar no servidor: a tela tinha a informação certa quando carregou, e mesmo assim ela ficou velha antes do clique.

**Clique duplo.** Clique em finalizar e clique de novo enquanto o botão está em andamento. O botão se bloqueia durante o envio, mas a garantia de verdade é a chave de idempotência que a sessão de checkout gera e manda no header: se as duas requisições chegarem, a segunda devolve o mesmo pedido em vez de criar outro. 

**API fora do ar.** Derrube o back-end e tente carregar a vitrine ou finalizar uma compra. A tela mostra falha de conexão com opção de tentar de novo, em vez de ficar carregando para sempre.
