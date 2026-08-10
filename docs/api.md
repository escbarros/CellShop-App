# Contrato da API

O contrato da API é gerado a partir do próprio código e pode ser consultado pelo Swagger ou pelo arquivo `openapi.json`.

As principais rotas são:

| Método | Rota               | Função                             |
| ------ | ------------------ | ---------------------------------- |
| GET    | `/products`        | Lista produtos ativos              |
| GET    | `/products/{sku}`  | Consulta um produto                |
| POST   | `/checkout`        | Cria um pedido e baixa o estoque   |
| GET    | `/orders`          | Lista os pedidos já feitos         |
| GET    | `/orders/{number}` | Consulta um pedido                 |
| GET    | `/health`          | Verifica se a API está funcionando |

Todas as respostas seguem o mesmo formato `{ data, error, meta }`.

O `openapi.json` é gerado a partir dos DTOs e controllers, evitando manter uma documentação separada do código. O arquivo também é verificado no `pre-push` para evitar que fique desatualizado.

Definir o contrato antes da implementação também permitiu desenvolver front-end, back-end e testes em paralelo, além de deixar os status e formatos de erro definidos desde o início.
