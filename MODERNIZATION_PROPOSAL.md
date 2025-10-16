# Proposta di Modernizzazione di Bindep

## Visione generale
Bindep nasce in un contesto dominato da Bower e da pipeline front-end basate su Grunt. Per renderlo rilevante in ecosistemi contemporanei è opportuno ripensarne l'architettura adottando strumenti mainstream, mantenendo al contempo l'idea chiave di orchestrare asset e dipendenze direttamente dai tag presenti nel codice sorgente.

## Obiettivi principali
1. **Abbandonare Bower e supportare npm/Yarn/PNPM**
   - Allineare la risoluzione delle dipendenze agli standard attuali.
   - Offrire integrazione con `package.json` e lockfile moderni.
2. **Sostituire Grunt con una toolchain modulare**
   - Introdurre CLI standalone basata su Node.js (ESM) con API programmatica.
   - Fornire adattatori per task runner diffusi (npm scripts, Gulp, Nx).
3. **Pipeline di build moderna**
   - Integrare sistemi come Vite, esbuild o webpack per il bundling e la trasformazione degli asset.
   - Supportare TypeScript e moduli ECMAScript nativamente.
4. **DX (Developer Experience) e configurazione**
   - Passare a file di configurazione in formato `bindep.config.ts|js` con autocompletamento tramite schema JSON.
   - Introdurre preset ufficiali per scenari comuni (SPA, design system, microfrontend).
5. **Automazione e qualità**
   - Integrare linting e formattazione (ESLint, Prettier) nei workflow.
   - Aggiungere test automatizzati (unit/integration) con Vitest o Jest.

## Piano d'azione proposto
### Fase 1 – Fondamenta
- Convertire il progetto in un pacchetto Node.js moderno (ESM) rimuovendo il vincolo Grunt.
- Reingegnerizzare il core per consumare metadati da `package.json` e `node_modules`.
- Rilasciare una CLI minima che supporti i comandi `bindep scan`, `bindep attach` e `bindep build`.

### Fase 2 – Integrazione con toolchain
- Creare plugin per Vite/esbuild per orchestrare l'inclusione dinamica degli asset basata sui tag-block.
- Pubblicare esempi ufficiali con React, Vue e Svelte.
- Fornire un adapter per npm scripts e un plugin Gulp 4 come ponte per pipeline legacy.

### Fase 3 – Esperienza sviluppatore
- Implementare un sistema di template e preset in `bindep.config.ts` con validazione tramite schema.
- Offrire un'estensione VS Code per l'autocompletamento dei tag `@bind` e la preview degli attachment.
- Documentare le best practice per strutturare asset modulari e opzionali.

### Fase 4 – Ecosistema e governance
- Impostare CI/CD (GitHub Actions) per lint, test e release automatizzate (semantic-release).
- Creare una roadmap pubblica e linee guida per contributori, includendo `CODE_OF_CONDUCT.md` e `CONTRIBUTING.md`.
- Valutare l'adozione di una licenza più aperta (MIT) o confermare l'attuale, esplicitando eventuali clausole.

## Benefici attesi
- **Rilevanza tecnologica:** adozione di standard attuali rende Bindep appetibile per progetti moderni.
- **Scalabilità:** la CLI modulare permette di integrarsi con qualsiasi pipeline, legacy o moderna.
- **Esperienza d'uso migliorata:** configurazione tipizzata, preset e tooling integrato riducono il tempo di adozione.
- **Community engagement:** documentazione aggiornata e governance trasparente favoriscono contributi esterni.

## Considerazioni finali
Il percorso proposto mantiene l'identità di Bindep come orchestratore di dipendenze dichiarative, ma la aggiorna per funzionare in ambienti basati su Node.js contemporanei. L'investimento iniziale consente di costruire un ecosistema solido, capace di supportare flussi front-end moderni e di aprirsi a future evoluzioni (es. integrazione con monorepo gestiti da Turborepo o Nx, supporto a asset serverless, ecc.).


## Stato di avanzamento
- ✅ **Fase 1 – Fondamenta:** implementata una nuova CLI ESM con comandi `scan`, `attach` e `build`, caricamento da `bindep.config.js` e generazione manifest.
- 🚧 **Fasi successive:** restano da sviluppare gli adapter per toolchain moderne, i preset tipizzati e l'ecosistema di plugin/estensioni.
