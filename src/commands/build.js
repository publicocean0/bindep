import pc from 'picocolors';
import { loadConfig } from '../core/config.js';
import { scanSources } from '../core/scan.js';
import { createManifest } from '../core/manifest.js';
import { materializeAssets, writeManifest } from '../core/output.js';

export async function runBuild({ configPath, skipManifest = false }) {
  const start = Date.now();
  const config = await loadConfig({ configPath });
  const matches = await scanSources({ config });
  const manifest = await createManifest({ config, matches, inlineContent: true });
  const materialization = await materializeAssets({ manifest, config });
  const warnings = [...manifest.warnings, ...materialization.warnings];
  if (!skipManifest) {
    await writeManifest({ manifest: materialization.manifest, config });
  }
  for (const warning of warnings) {
    process.stdout.write(`${pc.yellow('⚠')} ${warning}\n`);
  }
  return {
    elapsedMs: Date.now() - start,
    warnings,
    output: materialization
  };
}
