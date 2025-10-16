# Bindep

Bindep è una CLI moderna per orchestrare asset front-end a partire dai tag `@bind`
presenti nel codice sorgente. L'obiettivo è fornire un'alternativa aggiornata al
vecchio workflow basato su Grunt e Bower, integrandosi nativamente con gli
ecosistemi Node.js contemporanei.

## Caratteristiche principali

- **Scanner veloce**: individua i tag `@bind` in file HTML, JavaScript, TypeScript e
  template comuni tramite glob configurabili.
- **Manifest tipizzato**: genera un file JSON che descrive in modo dichiarativo gli
  attachment associati a ciascun modulo.
- **Build modulare**: copia gli asset necessari in una cartella di destinazione,
  mantenendo compatibilità con bundler come Vite, esbuild o webpack.
- **Configurazione ESM**: utilizza `bindep.config.js|mjs` per descrivere moduli,
  preset e cartelle di output.

## Installazione

```bash
npm install bindep --save-dev
```

> Richiede Node.js 18 o superiore.

## Utilizzo rapido

1. Crea un file `bindep.config.js` nella root del progetto:

   ```js
   export default {
     sources: ['src/**/*.{html,js,ts,tsx,jsx}'],
     modules: {
       button: {
         attachments: [
           { type: 'js', path: 'src/components/button.js', target: 'components' },
           { type: 'css', path: 'src/components/button.css', target: 'components' }
         ]
       }
     },
     output: {
       directory: 'dist/bindep',
       publicPath: '/static/bindep/'
     }
   };
   ```

2. Aggiungi i tag nel tuo markup:

   ```html
   <!-- @bind button linked aggregated -->
   <div class="btn-primary"></div>
   ```

3. Lancia la CLI:

   ```bash
   npx bindep scan
   npx bindep attach
   npx bindep build
   ```

## Comandi disponibili

| Comando            | Descrizione                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `bindep scan`      | Analizza i file sorgente e restituisce l'elenco dei tag `@bind` individuati.                 |
| `bindep attach`    | Genera il manifest (`dist/bindep/manifest.json` di default) con gli attachment richiesti.    |
| `bindep build`     | Copia gli asset dichiarati nel manifest nella cartella di output e aggiorna il manifest.     |

Tutti i comandi accettano `--config <file>` per indicare un percorso alternativo
al file di configurazione.

## Struttura del manifest

Esecuzione di `bindep attach` produce un JSON simile a questo:

```json
{
  "version": 1,
  "generatedAt": "2024-05-01T12:00:00.000Z",
  "config": {
    "path": "bindep.config.js",
    "sources": ["examples/modern/src/**/*.{html,js,ts,tsx,jsx,vue,svelte}"],
    "output": {
      "directory": "dist/bindep",
      "manifest": "dist/bindep/manifest.json",
      "assets": "dist/bindep/assets",
      "publicPath": "/static/bindep/"
    }
  },
  "modules": [
    {
      "name": "button",
      "attachments": [
        {
          "type": "js",
          "sourcePath": "examples/modern/src/components/button.js",
          "outputFile": "button.<hash>.js"
        }
      ],
      "tags": [
        {
          "file": "examples/modern/src/pages/home.html",
          "line": 8,
          "mode": "inline"
        }
      ]
    }
  ]
}
```

Questo manifest può essere consumato da script personalizzati o da plugin di
bundler per iniettare dinamicamente gli asset necessari nelle tue pagine.

## Esempio incluso

La cartella `examples/modern` mostra un caso d'uso minimale:

```bash
# Individua i tag presenti nell'esempio
npx bindep scan --config bindep.config.js

# Genera manifest e asset
npx bindep build --config bindep.config.js
```

I file risultanti vengono copiati in `dist/bindep/assets` con hash nel nome
per una cache strategy semplice.

## Roadmap

- Integrazione con bundler (plugin ufficiali per Vite ed esbuild).
- Preset configurabili (`bindep.config.ts`) con tipizzazione e schema JSON.
- Estensione VS Code per autocompletamento e anteprima degli attachment.
- Automazione CI/CD con linting, testing e release semantiche.

Contributi e feedback sono benvenuti tramite issue o pull request.
