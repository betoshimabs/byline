# Mocks — Calendários API-Football

Este diretório contém os calendários de temporada do Brasileirão Série A
como arquivos JSON estáticos. São gerados e commitados automaticamente pelo
fluxo de orquestração do BYLINE.

## Como são gerados

1. O app detecta que uma temporada não tem mock local
2. Busca os dados da API-Football (1 request por temporada)
3. Salva no localStorage e envia via `POST /__save_mock` ao dev server
4. O plugin Vite salva o arquivo aqui e faz `git commit` automaticamente
5. O próximo `git push` inclui o mock → Pages rebuilda → sem API calls em produção

## Arquivos

| Arquivo | Temporada | Partidas | Status |
|---|---|---|---|
| _(nenhum ainda — aguardando primeira execução)_ | | | |

## Vantagens

- **Zero custo de API** em produção (GitHub Pages usa este arquivo)
- **Disponível em qualquer máquina** após `git pull`
- **Versionado** — histórico completo no Git
- **Instantâneo** — arquivo local vs. request de rede
