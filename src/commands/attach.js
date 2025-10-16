import pc from 'picocolors';
import { loadConfig } from '../core/config.js';
import { scanSources } from '../core/scan.js';
import { createManifest } from '../core/manifest.js';
import { writeManifest } from '../core/output.js';

export async function runAttach({ configPath, manifestPath }) {
  const config = await loadConfig({ configPath });
  const matches = await scanSources({ config });
  const manifest = await createManifest({ config, matches });
  const targetPath = await writeManifest({ manifest, config, manifestPath });
  for (const warning of manifest.warnings) {
    process.stdout.write(`${pc.yellow('⚠')} ${warning}\n`);
  }
  return targetPath;
}
