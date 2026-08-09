# Decisões

---

## Dados em memória

Banco de dados em memória, em vez de usar MySQL ou Postgres. Segundo as instruções, não é necessário um banco de dados real, sem ele, o projeto fica mais simples de executar: basta instalar as dependências e rodar.

A principal desvantagem é que algumas responsabilidades que normalmente ficariam no banco precisam ser tratadas pelo código, como evitar estoque negativo e garantir que um pedido não seja processado duas vezes. Essas situações são cobertas pelos testes.

## Trocar por um banco de dados real é fácil

Os serviços não dependem diretamente da forma como os dados são armazenados. Eles recebem um repositório, e o módulo define qual implementação usar. Assim, para trocar a memória por MySQL ou Postgres, é só criar os novos repositórios e alterar essa configuração. As regras de negócio e os testes vão continuar os mesmos.

O modelo do banco já está definido em [`database-model.md`](./database-model.md).
