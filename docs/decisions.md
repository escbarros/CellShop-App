# Decisões

---

## Dados em memória

Banco de dados em memória, em vez de usar MySQL ou Postgres. Segundo as instruções, não é necessário um banco de dados real, sem ele, o projeto fica mais simples de executar: basta instalar as dependências e rodar.

A principal desvantagem é que algumas responsabilidades que normalmente ficariam no banco precisam ser tratadas pelo código, como evitar estoque negativo e garantir que um pedido não seja processado duas vezes. Essas situações são cobertas pelos testes.

## Trocar por um banco de dados real é fácil

Os serviços não dependem diretamente da forma como os dados são armazenados. Eles recebem um repositório, e o módulo define qual implementação usar. Assim, para trocar a memória por MySQL ou Postgres, é só criar os novos repositórios e alterar essa configuração. As regras de negócio e os testes vão continuar os mesmos.

O modelo do banco já está definido em [`database-model.md`](./database-model.md).

## NestJS no back-end

Escolhi NestJS porque, mesmo sendo um desafio pequeno, ele já traz uma estrutura clara para separar controllers, serviços e repositórios.

Isso também facilita a troca do armazenamento em memória por um banco no futuro, já que os serviços dependem das abstrações de repositório, e não da implementação em si.

Além disso, o projeto ganha validação e documentação da API a partir dos DTOs, além de uma boa estrutura para testes.

Para este desafio, o Nest acaba trazendo um pouco mais de estrutura do que o Express, mas considero que esse custo vale pela organização e facilidade de evolução do projeto.

## Uma configuração de Jest só, sem `test:e2e` separado

O `nest new` cria duas configurações: a do `package.json`, para os testes de unidade, e
`test/jest-e2e.json`, para os de ponta a ponta. Aqui os testes de HTTP sobem a aplicação
pelo `createTestApp()` e falam com ela por Supertest via `app.getHttpServer()` — sem
servidor escutando porta, sem processo separado. Nada nesses testes precisa da segunda
configuração, e manter duas obrigaria a lembrar de mudar as duas toda vez.

Ficou uma configuração só, com `roots` em `src/` e `test/`. `npm test` roda a suíte
inteira; não existe um subconjunto que só o `test:e2e` alcançava.
