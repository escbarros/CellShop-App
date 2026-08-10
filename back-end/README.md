# CellShop — back-end

API de checkout em NestJS + TypeScript, com os dados em memória. Recebe uma tentativa de compra, valida, dá baixa no estoque e responde.

As decisões de arquitetura estão no [README da raiz](../README.md) e em [`docs/decisions.md`](../docs/decisions.md). Aqui é só como rodar e como usar.

---

## Pré-requisitos

Node 22 ou mais novo e npm. Nada além disso: não há banco para subir nem serviço externo para configurar.

## Rodando

```bash
npm install
cp .env.example .env
npm run start:dev
```

A API sobe em `http://localhost:3333` e o Swagger fica em `http://localhost:3333/docs`.

Os outros comandos:

```bash
npm run build          # compila para dist/
npm run start:prod     # roda o build compilado
npm test               # a suíte inteira
npm run test:watch     # em modo interativo
npm run test:cov       # com relatório de cobertura
npm run lint           # eslint
npm run openapi        # regenera docs/openapi.json a partir do código
npm run openapi:check  # falha se o openapi.json estiver desatualizado
```

## Variáveis de ambiente

Todas são obrigatórias. A aplicação valida o ambiente na inicialização e recusa subir se faltar alguma, em vez de quebrar depois no meio de uma requisição.

| Variável | Exemplo | Para que serve |
|---|---|---|
| `PORT` | `3333` | Porta em que a API escuta |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem autorizada a chamar a API pelo navegador |
| `IMAGES_BASE_URL` | `http://localhost:3333/images` | Prefixo das URLs de imagem que a API devolve |

`IMAGES_BASE_URL` existe porque a API nunca devolve bytes de imagem, só a URL. Rodando local, o valor aponta para os arquivos estáticos servidos pela própria API. No `docker compose` da raiz, ele vira `/api/images` e quem entrega os arquivos é o nginx. Trocar por um bucket ou CDN é mudar essa variável, e nada mais.

## Contrato

O Swagger em [`/docs`](http://localhost:3333/docs) é gerado a partir dos DTOs e controllers, então ele não tem como divergir do que o código faz. A versão em arquivo fica em [`docs/openapi.json`](../docs/openapi.json), e o hook de `pre-push` roda `openapi:check` para não deixar ela envelhecer.

| Método | Rota | O que faz |
|---|---|---|
| GET | `/health` | Responde se a API está de pé |
| GET | `/products` | Lista as variantes vendáveis |
| GET | `/products/{sku}` | Detalhe de uma variante |
| POST | `/checkout` | Cria o pedido e dá baixa no estoque |
| GET | `/orders` | Lista os pedidos já feitos |
| GET | `/orders/{number}` | Consulta um pedido pelo número |

Toda resposta sai no mesmo envelope `{ data, error, meta }`. Em sucesso, `error` é `null`; em erro, `data` é `null`. O `meta.requestId` acompanha as duas e é por ele que se acha a requisição no log.

## Estrutura

```
back-end/
  public/images/       arquivos das imagens, servidos como estáticos em /images
  scripts/             geração do openapi.json
  src/
    catalog/           vitrine: controller, service, model e DTOs
    orders/            checkout e consulta de pedidos, máquina de estados
    stock/             modelo de estoque
    repositories/      contratos dos repositórios
      in-memory/       implementação atual, com o seed do catálogo
    common/            dinheiro, envelope, erros, filtro, guard, pipes, config
    health/            GET /health
  test/                testes de ponta a ponta e utilitários compartilhados
```

Organizado por domínio, não por tipo de arquivo: quem mexe em catálogo abre uma pasta, não quatro. Os serviços recebem a classe abstrata do repositório e o módulo escolhe a implementação, então trocar memória por MySQL é mexer em `repositories/` e numa linha de cada módulo.

## Experimentando pelo terminal

Todos os exemplos abaixo funcionam copiados e colados com a API rodando em `localhost:3333` e o estoque no estado inicial.

**O caminho feliz.** O `Idempotency-Key` é obrigatório: sem ele a requisição é recusada com `400`.

```bash
curl -X POST http://localhost:3333/checkout \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: 6f1c0d2e-9a3b-4c5d-8e7f-0a1b2c3d4e5f' \
  -d '{
    "items": [{ "sku": "CAP-SCRAPBOOK-IP16-AIS-TRA", "quantity": 2 }],
    "recipient": {
      "name": "Ana Beatriz Nogueira",
      "taxId": "39053344705",
      "email": "ana.nogueira@example.com",
      "zipCode": "01310930",
      "street": "Avenida Paulista",
      "number": "1578",
      "complement": "Apto 82",
      "district": "Bela Vista",
      "city": "Sao Paulo",
      "state": "SP"
    }
  }'
```

Responde `201` com o número do pedido e os totais em centavos. O frete é `1990`, ou zero quando o subtotal chega a `19900`.

**A mesma chave de novo.** Repita o comando acima sem mudar nada. A resposta agora é `200`, com exatamente o mesmo pedido, e o estoque não baixa uma segunda vez. É essa a garantia contra a compra duplicada: ela vive no servidor, não no botão da tela.

**Estoque insuficiente.** O SKU `CAP-BUTTERFLY-IP14-AIS-TRA` começa com uma unidade só. Pedir duas devolve `409`:

```bash
curl -X POST http://localhost:3333/checkout \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: 7a2d1e3f-0b4c-4d6e-9f80-1b2c3d4e5f60' \
  -d '{
    "items": [{ "sku": "CAP-BUTTERFLY-IP14-AIS-TRA", "quantity": 2 }],
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

```json
{
  "data": null,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Não temos essa quantidade em estoque.",
    "details": [
      {
        "field": "items.0.quantity",
        "message": "Restam apenas 1 unidade de Rose Butterfly Line · iPhone 14.",
        "sku": "CAP-BUTTERFLY-IP14-AIS-TRA",
        "available": 1
      }
    ]
  }
}
```

O `details` diz qual linha do pedido falhou e quanto ainda tem, para a tela conseguir explicar o problema em vez de só dizer que deu erro.

**Dados inválidos.** Campos fora do formato devolvem `422` com um item de `details` por campo, cada um com a mensagem em português que a tela mostra:

```bash
curl -X POST http://localhost:3333/checkout \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: 8b3e2f40-1c5d-4e7f-a091-2c3d4e5f6071' \
  -d '{
    "items": [{ "sku": "CAP-SCRAPBOOK-IP16-AIS-TRA", "quantity": 0 }],
    "recipient": {
      "name": "An",
      "taxId": "123",
      "email": "nao-e-email",
      "zipCode": "1",
      "street": "Rua",
      "number": "1",
      "district": "Centro",
      "city": "Sao Paulo",
      "state": "SP"
    }
  }'
```

**Consultas.** O SKU `CAP-MAGNOLIA-S24-AIS-TRA` está esgotado e aparece no catálogo com `available: false`; o `CAP-SUNRISE-S24-AIS-TRA` está inativo e devolve `404`.

```bash
curl http://localhost:3333/products
curl http://localhost:3333/products/CAP-MAGNOLIA-S24-AIS-TRA
curl http://localhost:3333/products/CAP-SUNRISE-S24-AIS-TRA
curl http://localhost:3333/orders
curl http://localhost:3333/orders/CCS-2026-000001
```

Os dados são em memória: reiniciar a API devolve o estoque ao estado do seed e apaga os pedidos.
