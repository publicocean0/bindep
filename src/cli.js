import { Command } from 'commander';
import pc from 'picocolors';
import { createRequire } from 'module';
import { runScan } from './commands/scan.js';
import { runAttach } from './commands/attach.js';
import { runBuild } from './commands/build.js';
import { handleCliError } from './utils/errors.js';

const require = createRequire(import.meta.url);
const { version, description } = require('../package.json');

const program = new Command();

program
  .name('bindep')
  .description(description)
  .version(version);

program
  .command('scan')
  .description('Scan sorgenti alla ricerca di tag @bind')
  .option('-c, --config <file>', 'Percorso del file di configurazione bindep')
  .option('--json', 'Stampa l\'output in formato JSON')
  .action(async (options) => {
    try {
      const result = await runScan({
        configPath: options.config,
        format: options.json ? 'json' : 'table'
      });
      if (result.format === 'json') {
        process.stdout.write(`${JSON.stringify(result.payload, null, 2)}\n`);
      } else {
        for (const row of result.payload) {
          process.stdout.write(`${row}\n`);
        }
      }
    } catch (error) {
      handleCliError(error);
      process.exitCode = 1;
    }
  });

program
  .command('attach')
  .description('Genera il manifest degli attachment a partire dai tag rilevati')
  .option('-c, --config <file>', 'Percorso del file di configurazione bindep')
  .option('-o, --output <file>', 'Percorso alternativo per il manifest generato')
  .action(async (options) => {
    try {
      const manifestPath = await runAttach({
        configPath: options.config,
        manifestPath: options.output
      });
      process.stdout.write(`${pc.green('✔ Manifest generato:')} ${manifestPath}\n`);
    } catch (error) {
      handleCliError(error);
      process.exitCode = 1;
    }
  });

program
  .command('build')
  .description('Costruisce gli asset richiesti dai tag @bind e aggiorna il manifest')
  .option('-c, --config <file>', 'Percorso del file di configurazione bindep')
  .option('--skip-manifest', 'Non scrivere il manifest su disco, restituisci solo il report')
  .action(async (options) => {
    try {
      const report = await runBuild({
        configPath: options.config,
        skipManifest: Boolean(options.skipManifest)
      });
      process.stdout.write(`${pc.green('✔ Build completata')} in ${report.elapsedMs}ms\n`);
      if (report.warnings.length > 0) {
        process.stdout.write(`${pc.yellow('⚠ Avvisi:')}\n`);
        for (const warning of report.warnings) {
          process.stdout.write(`  • ${warning}\n`);
        }
      }
    } catch (error) {
      handleCliError(error);
      process.exitCode = 1;
    }
  });

program
  .command('help', { isDefault: true })
  .description('Mostra questo help')
  .action(() => {
    program.outputHelp();
  });

program.parseAsync(process.argv);
