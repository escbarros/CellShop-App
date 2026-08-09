# CellShop — back-end

API de checkout em NestJS + TypeScript, com os dados em memória.

```bash
npm run start:dev    # API em :3333
npm test             # suíte inteira
npm run test:watch   # suíte em modo observador
npm run test:cov     # suíte + relatório de cobertura em coverage/
```

## Testes

Jest para rodar, Supertest para falar HTTP com a aplicação. Uma configuração só, no
`package.json`, cobrindo `src/` e `test/`.

Cada spec fica ao lado do arquivo que testa, com sufixo `.spec.ts`. Os testes que passam
por HTTP sobem a aplicação com o helper `test/create-test-app.ts`:

```ts
const app = await createTestApp();

await request(app.getHttpServer()).post('/checkout').send(body).expect(201);
```

`createTestApp()` compila um módulo de teste novo a cada chamada. Os repositórios em
memória nascem zerados junto com ele, então dois testes seguidos nunca compartilham
estoque — um teste que herdasse estoque do anterior passaria sozinho e falharia em
suíte, que é o pior tipo de teste para se ter.

Feche a aplicação no `afterEach`.

## A disciplina de TDD

Todo card de comportamento produz dois commits, nesta ordem:

1. Escreva o teste do comportamento. Rode. **Veja falhar** — e pelo motivo certo: rota
   ausente, função inexistente, asserção não satisfeita. Falhar por erro de import não
   prova nada; conserte o import e rode de novo.
2. Commit `test(back-end): <comportamento>`. Ele entra vermelho de propósito.
3. Escreva a implementação mínima que faz passar.
4. Commit `feat(back-end): <comportamento>`.

O commit vermelho é o que torna o ciclo auditável no `git log`. É também o motivo de o
hook de `pre-commit` rodar só lint, com a suíte no `pre-push`: se o `pre-commit`
rodasse os testes, o commit vermelho seria impossível e a disciplina se anularia.

Se um dia entrar CI, ela deve exigir verde no topo da branch, não em cada commit.

## Nome de teste

O projeto não usa comentários no código, então o nome do teste é onde a intenção mora.
Frase declarativa em inglês, descrevendo o comportamento — não o método:

```
sells exactly one unit under ten concurrent requests
returns 404 for an inactive sku instead of exposing it
does not yield the event loop between check and decrement
```

Não: `test decrementIfAvailable`, `should work`, `case 3`.

A diferença é concreta. Como comentário, a invariante do estoque seria
`// não colocar await aqui` — e envelheceria calada. Como nome de teste, ela quebra a
suíte no dia em que alguém colocar o `await`.

## Cobertura

`npm run test:cov` gera o relatório em `coverage/`. Os limiares no `package.json`
começam modestos e sobem conforme a suíte cresce; eles existem para impedir queda, não
para virar meta.
