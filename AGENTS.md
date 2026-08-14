# AGENTS.md — cvire

Instruções canônicas para agentes de IA (Cursor, Antigravity, Codex, DeepSeek, Claude Code, etc.).
Ferramentas com harness próprio devem ler também `CLAUDE.md` (Claude) ou `.cursor/rules/` (Cursor).

## Projeto

`cvire` é um CV builder **100% client-side**, offline-first: criação, templates A4, score ATS, match de vaga e exportação PDF. Sem backend proprietário.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + variáveis CSS
- Dexie.js (IndexedDB) + Zustand
- `@dnd-kit` (drag & drop)
- PDF: dois modos — **ATS-safe** text-native (`@react-pdf/renderer`, `src/services/atsPdfDocument.tsx`) e **Visual** raster (`html2canvas-pro` + `jspdf`, sem camada de texto)
- i18next (`en-US`, `pt-BR`)
- IA opcional: `@google/genai` (BYOK, chaves criptografadas com Web Crypto AES-GCM)

## Comandos

| Ação | Comando |
|------|---------|
| Dev | `npm run dev` → `http://127.0.0.1:5173` |
| Build (gate) | `npm run build` (`tsc -b && vite build`) |
| Lint | `npm run lint` |
| Preview | `npm run preview` |
| Testes unitários | `npm test` (page cut, crypto vault, ATS engine, job matcher) |
| Verify ATS PDF (gate) | `npm run verify:ats` (headless: links /URI, ordem, raster/invisível, paginação) |
| Teste corte PDF | `npm run test:pdf-cut` |
| Smoke PDF | `npm run smoke:pdf` (app rodando; testa os dois modos de export) |
| Verify PDF cut | `npm run verify:pdf-cut` (app em `CVIRE_URL` ou `5173`) |
| Servir board HTML | `npm run serve:cv-board` → `http://127.0.0.1:8765/` |

## Invariantes

1. **Client-side / offline-first** — não introduzir dependência de servidor próprio.
2. **BYOK seguro** — chaves de API só criptografadas localmente (Web Crypto); nunca em texto puro nem em git.
3. **Tipos** — manter `src/types/cv.ts` (`CVProfile`, `CVSection`, `SectionItem`, `BulletItem`, `ThemeSettings`) coerentes com o código.
4. **Inputs isolados** — em formulários (ex. `SectionsList`), estado local em filhos (`BulletItemRow`) para o cursor não saltar.
5. **IDs únicos** — novos itens/bullets com ID único (`b-${Date.now()}-…`).
6. **Causa raiz** — sem `try/catch` vazios nem dados falsos para esconder erro.
7. **PDF multipágina** — cortes em banda Y livre global (`pdfPageCut` / `findCleanPageCut`); keep-together mínimo para não órfão de `h2` / `.resume-item-header`; não “corrigir” com offsets mágicos.
8. **Integridade de conteúdo de CV** — zero alucinação; ver [`cv-content/rules/content-integrity.md`](cv-content/rules/content-integrity.md).
9. **Intake ao anexar CV** — se o usuário anexar/apontar um currículo, **sempre** começar por [`cv-content/prompts/cv-intake.md`](cv-content/prompts/cv-intake.md); não pular direto para traduzir/adaptar.
10. **Board ao fechar** — ao terminar o fluxo, gerar board via [`cv-content/prompts/cv-report-board.md`](cv-content/prompts/cv-report-board.md) (MD + HTML), salvo o usuário pedir para pular.
11. **Apresentação do board** — após gerar, **sempre perguntar** se o usuário quer ver em **HTML** ou **Canvas** (MD em `outputs/md/`) e **abrir imediatamente** a opção escolhida.
12. **Despejo ao regenerar** — antes de sobrescrever board/artefato, arquivar com [`cv-content/scripts/archive-output.sh`](cv-content/scripts/archive-output.sh) → `outputs/dump/` (gitignored). Currículos anexados (`inbox/`) e gerados do usuário em `outputs/` também são gitignored.
13. **Build** — antes de dar tarefa por concluída, `npm run build` (ou o teste/smoke relevante) deve passar.

## Conteúdo de CV (`cv-content/`)

Prompts, regras de integridade e artefatos de saída ficam em **[`cv-content/`](cv-content/)** — fora de [`.agents/skills/`](.agents/skills/) (skills de engenharia/processo).

Índice: [`cv-content/README.md`](cv-content/README.md).

### Fluxo obrigatório

1. Anexo de currículo → **intake** ([`cv-intake.md`](cv-content/prompts/cv-intake.md))
2. Trabalho → analyzer / adapter / translate / novo perfil factual
3. Fechamento → **board** ([`cv-report-board.md`](cv-content/prompts/cv-report-board.md)) em `outputs/md` + `outputs/html` (arquivar versão antiga em `outputs/dump/` se existir)
4. **Perguntar HTML vs Canvas** e abrir a escolha na hora
5. PDF final → import no app → `exportService` (opcional `outputs/pdf/`)

### Workflows (analisar / adaptar / traduzir)

Use os prompts em `cv-content/prompts/` — não invente outro fluxo.

| Pedido do usuário | Prompt | Entrada | Saída |
|-------------------|--------|---------|-------|
| Anexou um CV (qualquer objetivo) | [`cv-intake.md`](cv-content/prompts/cv-intake.md) | Arquivo + respostas | Plano confirmado → despacha (A–E) |
| Analisar vs vaga | [`cv-analyzer.md`](cv-content/prompts/cv-analyzer.md) | JD + `CVProfile` | Relatório MD (não altera o CV) |
| Adaptar / reescrever | [`cv-adapter.md`](cv-content/prompts/cv-adapter.md) | JD + `CVProfile` | Recomendações + JSON opcional só com fatos existentes |
| Traduzir | [`cv-translate.md`](cv-content/prompts/cv-translate.md) | `CVProfile` + idioma | JSON com as mesmas chaves; techs intactas |
| Metrificar / estatísticas (opção E) | [`cv-report-board.md`](cv-content/prompts/cv-report-board.md) | CV (+ JD/nível opcionais) | Board só análise: scores, gaps, plano; HTML + Canvas |
| Board de métricas (fim) | [`cv-report-board.md`](cv-content/prompts/cv-report-board.md) | Antes/depois (+ JD opcional) | `outputs/md/*-board.md` + `outputs/html/*-board.html` |
| PDF final | — (app) | Import JSON → UI | `exportService` → opcional `outputs/pdf/` |

Saídas versionáveis:

| Tipo | Pasta |
|------|--------|
| JSON | [`cv-content/outputs/json/`](cv-content/outputs/json/) |
| MD | [`cv-content/outputs/md/`](cv-content/outputs/md/) |
| HTML | [`cv-content/outputs/html/`](cv-content/outputs/html/) |
| PDF | [`cv-content/outputs/pdf/`](cv-content/outputs/pdf/) |
| DOCX | [`cv-content/outputs/docx/`](cv-content/outputs/docx/) (reservada; sem gerador no app nesta fase) |

## Onde está o quê

| Área | Caminho |
|------|---------|
| App / UI | `src/` |
| Tipos | `src/types/` |
| Estado | `src/store/` |
| Persistência | Dexie + serviços em `src/services/` |
| Templates | `src/components/templates/` |
| Export PDF (ATS-safe) | `src/services/atsPdfDocument.tsx`, `src/services/atsPdfExport.ts` |
| Export PDF (visual) | `src/services/exportService.ts`, `src/services/pdfPageCut.ts` |
| Import/export JSON | `src/services/backupService.ts` |
| Conteúdo CV (prompts + saídas) | `cv-content/` |
| Prompts CV | `cv-content/prompts/` |
| Outputs JSON / MD / HTML / PDF / DOCX | `cv-content/outputs/{json,md,html,pdf,docx}/` |
| Regras de engenharia (UI/estado/ATS app) | `.agents/rules/` |
| Skills de processo | `.agents/skills/` |
| Specs / planos | `docs/superpowers/` |

## Regras de domínio (ler sob demanda)

- [`cv-content/rules/content-integrity.md`](cv-content/rules/content-integrity.md) — zero alucinação / ATS factual / techs não traduzidas
- [`.agents/rules/frontend-templates.md`](.agents/rules/frontend-templates.md) — UI, A4, templates, PDF
- [`.agents/rules/state-storage.md`](.agents/rules/state-storage.md) — Zustand + Dexie
- [`.agents/rules/ats-jobmatcher.md`](.agents/rules/ats-jobmatcher.md) — ATS e job matcher

## Estilo de trabalho

- Mudanças mínimas e focadas; sem refatoração oportunista.
- Sem comentários no código salvo se o usuário pedir ou forem necessários para APIs externas.
- Respostas ao usuário em **português (pt-BR)** quando for chat com humanos.
- Não commitar nem dar push sem pedido explícito.
- Não editar `.env` / segredos.

## Harness por ferramenta

- **Qualquer agente**: este arquivo (`AGENTS.md`).
- **Claude Code**: ver também [`CLAUDE.md`](./CLAUDE.md) e opcionalmente `.claude/`.
- **Cursor**: ver `.cursor/rules/` (aponta para este guia).
- **Antigravity / skills locais**: `.agents/skills/` e `.agents/rules/` (engenharia); conteúdo de CV em `cv-content/`.
