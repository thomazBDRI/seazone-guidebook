# Guia Digital do Hóspede — Seazone

Aplicação web que entrega, para cada imóvel de temporada, um guia digital
completo da hospedagem: como chegar e entrar, Wi-Fi com QR code, regras da
estadia, comodidades, contato do anfitrião, um guia de experiências da região
gerado por IA a partir do endereço real e um assistente de chat que responde
dúvidas em tempo real — sempre com base nos dados daquele imóvel, em português,
inglês ou espanhol. Nada é escrito no frontend: cada página renderiza
exclusivamente o que está no banco.

**Produção:** https://seazone-guidebook.vercel.app

| Link | O que é |
|---|---|
| [`/FLN001`](https://seazone-guidebook.vercel.app/FLN001) | Apartamento Beira-Mar, Florianópolis — SC |
| [`/GRM001`](https://seazone-guidebook.vercel.app/GRM001) | Chalé Serra, Gramado — RS |
| [`/BBN001`](https://seazone-guidebook.vercel.app/BBN001) | Casa pé na areia, Bombinhas — SC (pets e eventos liberados) |
| [`/BCB001`](https://seazone-guidebook.vercel.app/BCB001) | Studio, Balneário Camboriú — SC (sem vaga, não indicado para crianças) |
| [`/ROS001`](https://seazone-guidebook.vercel.app/ROS001) | Cabana, Praia do Rosa — SC (lareira, cofre de chaves) |
| [`/JUR001`](https://seazone-guidebook.vercel.app/JUR001) | Apartamento, Jurerê Internacional — SC (acesso via portaria) |
| [`/`](https://seazone-guidebook.vercel.app/) | Índice dos imóveis — página que existe **só** para a avaliação técnica |

Cada imóvel também declara **serviços sob demanda** (early check-in, late
check-out, extensão de estadia com o time Seazone, limpeza extra, guarda de
bagagem, transfer) — renderizados na seção "Precisa de algo?" e respondidos
pelo assistente, inclusive quando o serviço **não** é oferecido.

O hóspede real nunca vê uma listagem: ele recebe na confirmação da reserva um
link direto para o guia da sua hospedagem (`/FLN001`). A home existe para quem
avalia este teste poder abrir qualquer imóvel rapidamente, e diz isso na
própria página. Códigos são case-insensitive (`/fln001` funciona) e um código
inexistente cai em uma página 404 própria.

O plano de trabalho que guiou a implementação, commit a commit, está em
[`docs/PLAN.md`](docs/PLAN.md).

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Next.js 16 (App Router, RSC) + Turbopack | Renderização no servidor por padrão: os dados do imóvel nunca precisam ir ao browser para virar tela |
| Linguagem | TypeScript estrito | |
| Runtime e gerenciador | Bun | Instalação e execução de scripts rápidas; `bun.lock` versionado |
| Estilos | Tailwind CSS | Tokens do design system portados do mockup aprovado (`mockup/`) |
| Lint e format | Biome | Substitui ESLint + Prettier em uma ferramenta só |
| Validação | Zod | Ambiente, linhas do banco, payloads de API e **saída do LLM** |
| Banco | Supabase (Postgres) | Acesso apenas server-side, com RLS negando tudo |
| ORM e migrations | Drizzle (drizzle-kit) | Schema em TypeScript, migrations SQL versionadas; leituras em runtime via `supabase-js` (HTTPS, seguro em serverless) |
| IA | OpenRouter (modelos gratuitos) | Geração do guia, chat e revisor de CI, todos trocáveis por variável de ambiente |
| Testes unitários | Vitest | Domínio, prompts, pipeline, repositórios e componentes |
| Testes E2E | Playwright | Roda contra o build de produção e o banco real, com o LLM substituído por um stub local |
| CI | GitHub Actions | qualidade → e2e (com artefatos) → revisor de IA |
| Deploy | Vercel (integração Git) | Preview por branch e produção no `main` |

## Arquitetura

```
Browser ── página RSC /[code] ─────────► Supabase (imóvel + guia persistido)
   │
   ├── POST /api/guides/[code] ──────► pipeline de geração (uma vez por imóvel/idioma)
   │        (skeleton de loading)       ├─ Nominatim: geocodifica o endereço
   │                                    ├─ Overpass: POIs reais num raio de 2,5 km
   │                                    ├─ LLM compõe o guia (JSON validado por Zod)
   │                                    └─ persiste no Supabase (lock, idempotente)
   │
   └── POST /api/chat (stream SSE) ──► LLM
            fundamentado nos dados do imóvel + guia persistido (contexto montado no servidor)
```

### Decisões que valem explicar

**Acesso a dados só no servidor.** O RLS do Supabase está habilitado sem
nenhuma policy — ou seja, nega tudo. Todo acesso acontece em Server Components
e route handlers usando a chave secreta, que nunca é exposta (não existe
nenhuma variável `NEXT_PUBLIC_*` no projeto). Um link ou uma URL vazada não dá
acesso a nada. Senha de Wi-Fi e código de acesso chegam ao browser apenas como
HTML já renderizado do imóvel que o hóspede está vendo — o QR code do Wi-Fi,
por exemplo, é gerado no servidor para a senha não trafegar duas vezes.

**O guia de experiências é gerado uma vez e nunca regenerado.** O requisito é
conteúdo contextualizado ao endereço real, persistido, com feedback visual de
carregamento — o que implica geração no primeiro acesso, não no build. Na
primeira visita a página renderiza o skeleton e chama
`POST /api/guides/[code]`; o handler tenta inserir a linha `pending` em
`experience_guides` (`on conflict do nothing`), e só quem ganhou essa corrida
gera — os acessos concorrentes fazem polling até a linha virar `ready`. A
chave primária é `(property_id, locale)`, então cada idioma é gerado uma vez e
guardado por conta própria.

**O pipeline é fundamentado em dados reais (grounding), não na memória do
modelo.** O endereço é geocodificado no Nominatim e os pontos de interesse
vizinhos vêm do Overpass (ambos OpenStreetMap, gratuitos e sem chave); o LLM
recebe essa lista com nome, categoria e distância e faz o que modelo faz bem:
curar e escrever. A saída é JSON validado por Zod, com **uma** tentativa de
correção quando o schema reprova (o erro do Zod volta para o modelo). Se o OSM
estiver fora do ar, o guia é gerado só com o conhecimento do modelo; se o LLM
falhar, a linha vira `failed`, a página mostra um estado amigável com botão de
tentar novamente e o resto do guia continua no ar. Falha de IA é um cenário
tratado, não uma exceção não capturada.

**O chat é fundamentado e resistente a prompt injection.** As instruções e os
dados do imóvel vivem na mensagem `system`; o texto do hóspede vai na mensagem
`user`, intocado — nunca concatenado dentro das instruções, que é justamente o
que abre a porta para injeção. O system prompt proíbe inventar dados, manda
encaminhar o que não estiver no contexto para o WhatsApp do anfitrião e declara
explicitamente que mensagens do usuário não mudam regras nem papel. Somando a
isso: corpo da requisição validado por Zod, teto de tamanho por mensagem e de
histórico, e o contexto montado no servidor (o cliente só envia
`{ code, messages }`). A resposta é **streaming real** via SSE, token a token.

**i18n com catálogos tipados.** Todo texto de interface vive em
`lib/i18n/messages/` — pt-BR é a referência e o tipo `Messages` é inferido
dele, então uma chave faltando em `en`/`es` é erro de compilação, não um furo
na tela. O idioma vem de um cookie (não da URL: o hóspede recebe um único
link, e trocar de idioma não pode mudar o endereço dele) e vale para tudo,
incluindo os dicionários de domínio — regras, comodidades, tipos de acesso — e
o conteúdo de IA, que é gerado e persistido por idioma.

**404 honesto.** `cacheComponents` está desligado de propósito: o shell
pré-renderizado responde 200 antes de o `notFound()` decidir, e um código de
imóvel inexistente precisa devolver 404 de verdade, não uma página de erro com
status 200. Como toda rota renderiza a partir dos dados de um imóvel
específico, não havia nada a ganhar com cache de shell.

## Inteligência artificial

### Modelos

Todos gratuitos no OpenRouter e trocáveis por variável de ambiente — modelo
gratuito é limitado por rate sem aviso, e trocar não deveria exigir um deploy.

| Uso | Padrão | Por quê |
|---|---|---|
| Guia de experiências | `nvidia/nemotron-3-ultra-550b-a55b:free` (`OPENROUTER_GUIDE_MODEL`) | Compõe JSON longo e estruturado; roda uma vez por imóvel/idioma, então latência importa pouco |
| Chat | `nvidia/nemotron-3-nano-30b-a3b:free` (`OPENROUTER_CHAT_MODEL`) | Perfil oposto: primeiro token em menos de um segundo e sem preâmbulo de raciocínio, porque o hóspede assiste à resposta sendo digitada |
| Revisor de CI | `z-ai/glm-5.2:free` (`OPENROUTER_REVIEW_MODEL`), com fallback para `poolside/laguna-s-2.1:free` e `nvidia/nemotron-3-super-120b-a12b:free` | Escolhido testando quatro modelos com um diff que continha um `await` esquecido e uma chave secreta vazada: pegou os dois, de forma concisa, em ~5s |

### Notas de prompt engineering

- **Grounding acima de tudo.** O prompt do guia entrega os POIs reais do
  OpenStreetMap e proíbe inventar lugares; distâncias devem ser copiadas
  literalmente dos dados, nunca estimadas.
- **Saída estruturada e validada.** O guia é pedido como JSON com formato
  descrito no prompt e conferido por Zod ao chegar; uma falha de schema gera
  uma única tentativa de correção com o erro real anexado.
- **Separação de papéis.** Instruções e dados no `system`, hóspede no `user`.
  O que o hóspede escreve nunca é interpolado em instrução.
- **Proibição explícita de invenção.** Quando a resposta não está no contexto,
  o modelo diz isso em uma frase e encaminha para o anfitrião — comportamento
  coberto por teste.
- **Prompts escritos em português, com o idioma-alvo parametrizado.** Um único
  conjunto de guardrails para revisar, em vez de três traduções que divergem
  com o tempo.

## Como rodar localmente

Pré-requisitos: [Bun](https://bun.sh) (versão em `.tool-versions`) e um projeto
Supabase.

```sh
bun install
cp .env.example .env.local   # preencha os valores
```

| Variável | Obrigatória | Para quê |
|---|---|---|
| `SUPABASE_URL` | sim | URL do projeto Supabase (uso server-side) |
| `SUPABASE_SECRET_KEY` | sim | Chave secreta; único caminho de acesso aos dados (RLS nega tudo) |
| `OPENROUTER_API_KEY` | sim | Geração do guia, chat e revisor de CI |
| `SUPABASE_DB_URL` | migrations/seed | Conexão Postgres direta, usada só por scripts |
| `OPENROUTER_GUIDE_MODEL` | não | Troca o modelo do guia |
| `OPENROUTER_CHAT_MODEL` | não | Troca o modelo do chat |
| `OPENROUTER_BASE_URL` | não | Qualquer host compatível com a API da OpenAI; é o que aponta a suíte E2E para o stub |

Banco e dados de referência:

```sh
bun run db:generate   # gera SQL a partir de db/schema.ts (só ao mudar o schema)
bun run db:migrate    # aplica as migrations
bun run db:seed       # faz upsert dos seis imóveis de exemplo (idempotente)
```

Desenvolvimento e verificação:

```sh
bun run dev           # http://localhost:3000
bun run lint          # Biome (lint + format)
bun run typecheck     # tsc --noEmit
bun run test          # Vitest
bun run build && bun run test:e2e   # Playwright contra o build de produção
```

O `bun run test:e2e` **não precisa de chave da OpenRouter**: a configuração do
Playwright sobe um stub local compatível com a API
(`test/e2e/stub-openrouter.ts`) e aponta o app para ele com
`OPENROUTER_BASE_URL`, então o streaming é determinístico e nenhum teste
depende de um modelo gratuito estar disponível. O banco, esse sim, é o real —
os testes só leem, nunca escrevem.

## CI

```
push (main) + pull_request
  quality:   bun install → biome ci → tsc --noEmit → vitest → next build
  e2e:       precisa de quality → Playwright (LLM stubado) → sobe report e traces como artefato
  ai-review: precisa de e2e → diff do push + resultado dos testes → OpenRouter → comentário no commit
```

O revisor de IA roda só em `push`, é consultivo e nunca bloqueia: ele comenta
no commit (inclusive em build vermelho, quando uma segunda opinião vale mais) e
está marcado como `continue-on-error`, com cadeia de fallback de modelos — um
modelo gratuito no limite de rate não pode travar o CI. Deploy é a integração
Git da Vercel, não um job do Actions.

## Estrutura de pastas

```
app/
  page.tsx                   # índice dos imóveis (só para avaliação)
  [code]/page.tsx            # guia do hóspede (RSC): busca os dados e compõe as seções
  [code]/not-found.tsx       # 404 próprio para código inexistente
  api/guides/[code]/route.ts # geração idempotente do guia (lock pending)
  api/chat/route.ts          # chat com streaming SSE
  api/locale/route.ts        # troca de idioma (cookie)
components/
  ui/                        # átomos: Button, Card, Badge, CopyField, SectionHeading…
  guide/                     # seções do guia: Hero, Arrival, Rules, Amenities,
                             # Experience (+ skeleton), Host, ChatWidget, TocNav
  home/                      # cartão de imóvel do índice
lib/
  env.ts                     # ambiente validado por Zod (falha no boot)
  domain/                    # schemas Zod + dicionários de exibição (regras, comodidades)
  repositories/              # acesso a properties e experience_guides
  supabase/server.ts         # client server-side com a chave secreta
  ai/                        # client OpenRouter, prompts, pipeline do guia, grounding OSM
  i18n/                      # catálogos pt-BR/en/es + resolução do idioma
db/
  schema.ts, migrations/, seed.ts
test/
  e2e/                       # Playwright + stub da OpenRouter
  fixtures/                  # dados de imóvel para os testes unitários
scripts/ai-review.ts         # revisor de IA do CI
docs/PLAN.md                 # plano de trabalho
mockup/                      # design system aprovado que originou os tokens
```

## Deploy

A Vercel detecta o Bun pelo `bun.lock` e o Next 16 sem configuração extra —
não há `vercel.json` no projeto de propósito. Os dois handlers que chamam o LLM
declaram `export const maxDuration = 60` no próprio arquivo, que é o teto do
plano Hobby, então não há nada para configurar fora do código. Basta apontar o
repositório e definir `SUPABASE_URL`, `SUPABASE_SECRET_KEY` e
`OPENROUTER_API_KEY` nas variáveis de ambiente do projeto.

