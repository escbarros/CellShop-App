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

## Estoque pertence à variante, não ao produto

`Product` é a estampa; `ProductVariant` é o SKU que se vende. Só a variante tem estoque —
`Product` não tem nenhum campo de quantidade. Assim, ninguém desconta do lugar errado:
vender a capinha da estampa Alice para iPhone 15 Pro não pode tirar do estoque da mesma
estampa para Galaxy S24.

## `device`, `material` e `color` são campos da variante

Poderiam ser tabelas próprias, com chave estrangeira em cada uma. Neste escopo, não são:
o catálogo é fixo, vem do seed, e não existe área administrativa para cadastrar aparelho
ou material novo. Tabela separada só pagaria seu custo se algum desses valores tivesse
atributo próprio — imagem do aparelho, ordem de exibição, data de lançamento — ou se
fosse editável pelo lojista. Nenhum dos dois é o caso aqui.

O que segura a consistência no lugar delas é o `UNIQUE (product_id, device, material,
color)`: duas variantes iguais da mesma estampa não entram.

Se o catálogo crescer, a migração é aditiva — cria a tabela, popula a partir dos valores
distintos, troca a coluna por FK. Nenhuma regra de negócio muda, porque nada além da
própria variante lê esses campos.

