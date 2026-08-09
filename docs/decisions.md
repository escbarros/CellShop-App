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

## Toda resposta sai no mesmo envelope

Sucesso e erro usam a mesma forma: `{ data, error, meta }`. Em sucesso, `error` é `null`;
em erro, `data` é `null`. Assim, o front sempre sabe que a estrutura vai ser a mesma.

## Dinheiro em centavos

Valores monetários são armazenados como BIGINT em centavos. Por exemplo, R$ 79,90 fica como 7990. Isso evita problemas de precisão comuns em números decimais e torna as operações com dinheiro simples e exatas, sem depender de arredondamentos.

## Imagens dos produtos

As imagens ficam no `back-end/public/images/`, organizadas por SKU. O back-end as disponibiliza como arquivos estáticos e a API retorna apenas as URLs.

A URL base das imagens é configurável por `IMAGES_BASE_URL`. Assim, no futuro, é possível trocar os arquivos locais por um bucket ou CDN sem precisar alterar o restante da aplicação.

## Catálogo de demonstração

O catálogo usa produtos e imagens reais da Gocase para deixar a vitrine mais próxima de um cenário real. As informações que não são disponibilizadas pela loja, como estoque e status, foram inventadas. Cada produto possui uma imagem maior e uma miniatura, evitando carregar imagens desnecessariamente grandes na vitrine.


## Repositórios

Os repositórios foram separados por responsabilidade: catálogo, estoque e pedidos. Cada método tem uma operação equivalente no banco, o que facilita trocar a implementação em memória por MySQL ou Postgres no futuro. O `decrementIfAvailable` também foi pensado para evitar problemas de concorrência. Ele tenta descontar o estoque apenas quando há quantidade suficiente e retorna true ou false conforme o resultado, sem precisar consultar o estoque antes. As abstrações também deixam os testes mais simples, já que cada teste pode usar apenas o repositório que precisa.


## Tailwind CSS no front

O Tailwind foi escolhido para manter os estilos próximos dos componentes, sem precisar criar uma estrutura de CSS separada para uma tela relativamente pequena. Também não foi usada uma biblioteca de componentes, porque o projeto não tem tamanho suficiente para justificar essa dependência.

## TanStack Query

O TanStack Query cuida do cache e das consultas da vitrine e do detalhe dos produtos, evitando requisições desnecessárias ao navegar entre as telas.
