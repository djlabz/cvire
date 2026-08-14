# fix/ats-safe-export-and-audit — ATS-safe export + auditoria completa

## Resumo executivo

O cvire é um resume builder focado em ATS cujo **próprio export de PDF falhava em ATS**: o arquivo era um JPEG rasterizado com uma camada de texto **invisível branca** por cima — zero anotações de link, ordem de leitura intercalada em parsers posicionais, ~600KB, e exatamente o padrão que detectores de "white fonting" marcam como fraude.

Esta branch resolve essa ironia central e todo o restante da auditoria:

- **Novo export ATS-safe text-native** (`@react-pdf/renderer`, que já estava no package.json e nunca fora importado): texto real, links `/URI` reais, ordem de leitura garantida, metadados, ~**7KB**.
- **Modo Visual honesto**: o pipeline raster continua disponível, mas **sem** a camada invisível.
- **Bug crítico do cofre de chaves corrigido**: a master key AES-GCM agora persiste (não-extraível) — antes, toda API key salva ficava indecifrável após reload.
- **Engine honesto**: score de keywords contínuo de verdade e TF-IDF real no job matcher (como o README sempre prometeu).
- **Verificação automatizada** (`npm run verify:ats`) + **CI** com lint, 33 testes unitários e build — antes o CI só fazia deploy.
- Higiene: LICENSE (MIT), refs `Jownao/cvire` → `djlabz/cvire`, refactor do `SectionsList`, v0.2.0 + CHANGELOG, e uma caça livre que encontrou 3 bugs reais de runtime.

**Sem breaking changes** para o usuário final. Detalhe de migração: Dexie sobe para v2 (nova tabela `cryptoKeys`); ciphertexts órfãos do build antigo são detectados, purgados e o usuário é avisado (nos dois idiomas) para reinserir a chave.

---

## Mudanças por fase

### Fase 1 — Export PDF text-native
- `src/services/atsPdfDocument.tsx`: builder puro `CVProfile → Document` react-pdf (funciona no browser e em Node, o que viabiliza a verificação headless). Links reais (`mailto:`, LinkedIn, GitHub, portfolio, links de projetos) com a URL também escrita por extenso; coluna única linearizada (main → sidebar) por construção; keep-together via `minPresenceAhead`/`wrap={false}` no espírito do `pdfPageCut`; metadados title/author/subject/keywords/language a partir do perfil.
- `src/components/preview/ExportModal.tsx`: modal com **"ATS-safe (recomendado)"** e **"Visual (print-fidelity)"**, explicações localizadas (en-US, pt-BR).
- `exportService.ts` (visual): camada de texto invisível **removida** (~350 linhas); deps pesadas agora lazy.
- Deletados: `pdfTextLayer.ts` (morto), dependência duplicada `html2canvas` v1.

### Fase 2 — cryptoVault
- Master key gerada **uma vez**, `extractable: false`, persistida via structured clone no IndexedDB (tabela `cryptoKeys`, Dexie v2).
- Ciphertext órfão (era o estado de *todo* usuário do build anterior): detectado no decrypt, purgado, aviso localizado no modal BYOK.
- Core injetável (`cryptoVaultCore.ts`) com 6 testes: encrypt → "reload" → decrypt, geração única, não-extraibilidade, purge + notice de órfão, unicode.

### Fase 3 — Honestidade do engine
- `atsEngine`: métrica "Technical Keywords" (25% do score) deixou de ser stub (`includes('react'|'typescript'|'management') ? 90 : 70`) e agora mede **diversidade + densidade** de tecnologias de um dicionário compartilhado (`techKeywords.ts`, ~120 termos) sobre o texto real do perfil (`profileText.ts` substitui `JSON.stringify`). Diagnóstico de linter quando a cobertura é baixa. Testes: CV vazio, genérico, denso, monotonicidade, e as palavras-gatilho antigas não pontuam mais sozinhas.
- `jobMatcher`: **TF-IDF de verdade** — TF log-normalizado × IDF suavizado sobre corpus embutido de 24 descrições sintéticas (en + pt-BR, `src/data/jobCorpus.json`, offline), **similaridade de cosseno** CV × vaga para o percentual, keywords rankeadas por peso TF-IDF. Frases multi-palavra ("machine learning", "power bi") tokenizam como um termo. 13 testes.

### Fase 4 — Verificação automatizada
- `scripts/verify-ats-pdf.mjs`: falha com 0 anotações `/URI` (ou faltando link esperado), marcadores de seção fora de ordem/intercalados sob extração posicional (Y, depois X), qualquer objeto `DCTDecode`, qualquer op de texto invisível (`Tr 3` via operator list do pdfjs), arquivo > 100KB.
- `scripts/verify-ats-pagination.tsx`: perfil inflado para 3+ páginas, sem browser; falha se título de seção ficar órfão ou frase for fatiada entre páginas.
- `npm run verify:ats` integra geração + os dois verificadores; **CI novo** (`.github/workflows/ci.yml`): lint → testes → verify:ats → build.
- Scripts Playwright atualizados para o fluxo do modal; o smoke agora valida **os dois modos** (incl. que o visual tem zero texto extraível — a camada invisível não pode voltar).

### Fase 5 — Higiene
- **LICENSE** MIT criado (o badge sempre apontou para ele).
- Todas as refs `Jownao/cvire` → **`github.com/djlabz/cvire`** (README, ISSUES.md, plano, perfil demo). README ganhou: link do demo (GitHub Pages), badges de CI/deploy, seção de screenshots (placeholders com TODO), documentação dos dois modos de export e por que o ATS-safe existe, seção de quality gates; stack corrigida (a claim `html2pdf.js` era falsa).
- `SectionsList.tsx` (786 linhas) → subcomponentes em `src/components/editor/sections/` (AddSectionPanel, SectionCard, SectionItemCard, ItemForms, BulletItemRow), sem mudança de comportamento; `npm run lint` agora zera warnings.
- `package.json` → **0.2.0** + `repository`/`homepage`/`bugs`/`license`; `CHANGELOG.md` criado.
- Removidos ~1.5MB de build output commitado por acidente em `assets/` (nada referenciava).

### Fase 6 — Caça livre (bugs reais encontrados e corrigidos)
1. **Restore de versão silenciosamente quebrado**: `restoreVersionSnapshot` gravava no IndexedDB mas `selectProfile` relia o array **em memória** (stale) — o editor nunca mostrava o snapshot restaurado. Novo `refreshProfiles()` no store.
2. **Race no seed do banco**: `seedDatabaseIfEmpty` (count → bulkAdd) corria duas vezes sob StrictMode e estourava `BulkError: Key already exists` sem tratamento (reproduzido no browser durante a verificação). Agora transacional + `bulkPut` idempotente.
3. **Exclusão permanente sem confirmação** no dashboard (1 clique = perda de dados) + tooltip usando chave i18n inexistente (`dashboard.delete`). Confirm localizado adicionado.
4. Promises sem catch (clipboard do Job Matcher, export de backup), `catch (err: any)` eliminado, `batchExportService.ts` morto removido, erro do aiService localizado, paridade de locales verificada por script (0 divergências), `@google/genai` lazy.

---

## Evidências dos checks de aceite

`npm run verify:ats` (saída real, perfil demo):

```json
{
  "ok": true,
  "stats": {
    "sizeBytes": 7177,
    "numPages": 2,
    "uriAnnotations": 5,
    "uris": [
      "mailto:alex.morgan@devmail.com",
      "https://linkedin.com/in/alexmorgan-dev",
      "https://github.com/alexmorgan-dev",
      "https://alexmorgan.dev/",
      "https://github.com/djlabz/cvire"
    ],
    "dctDecodeObjects": 0,
    "invisibleTextOps": 0
  }
}
```

Critérios da Fase 1: ≥1 `/URI` por link do perfil ✅ (5/5) · zero `DCTDecode` ✅ · zero texto invisível ✅ · ordem posicional correta sem intercalação ✅ · arquivo < 100KB ✅ (7,2KB).

Paginação (perfil inflado): `{"ok":true,"numPages":3,"sizeBytes":9794}` — sem títulos órfãos, frases intactas.

Smoke no browser real (Playwright, ambos os modos): `ats-safe: ok=true` · `visual: ok=true` (2 páginas raster, **zero** texto extraível). `verify:pdf-cut` visual multipágina: `ok=true` (4 páginas, 4 imagens).

Gates finais: `npm run lint` **0 warnings** · `npm test` **33/33** · `npm run verify:ats` ✅ · `npm run build` ✅.

Bundle: chunk inicial 492KB (143KB gzip); react-pdf (1.4MB), html2canvas-pro, jspdf e o SDK Gemini só carregam sob demanda.

## Breaking changes

Nenhum para o usuário. Interno: Dexie v2 (upgrade automático); quem salvou API key no build anterior verá o aviso pedindo para reinseri-la (o dado já era irrecuperável — agora o app é honesto sobre isso e o problema não se repete).

## Apontado sem corrigir (sugestões de follow-up)

- Screenshots/GIF reais para o README (placeholders com TODO commitados).
- `index.html` mantém o título "cvire -- by Johnny Costa" — decisão de branding dos maintainers.
- O preview A4 re-renderiza o template inteiro a cada tecla; aceitável hoje, mas um `useDeferredValue` no perfil seria a próxima otimização de perf.
- O modo Visual poderia futuramente embutir o **mesmo conteúdo do ATS-safe como anexo** (PDF híbrido), se os maintainers quiserem um arquivo único.

## Screenshots/GIFs sugeridos para o PR

1. Modal de export com os dois modos (dark UI).
2. PDF ATS-safe aberto com links clicáveis + painel de seleção de texto.
3. Antes/depois do `pdftotext` (intercalado vs linear).
4. CI verde com o job `verify:ats`.
