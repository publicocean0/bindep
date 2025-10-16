import path from 'node:path';
import fs from 'node:fs/promises';

export async function writeManifest({ manifest, config, manifestPath }) {
  const target = manifestPath ? path.resolve(config.root, manifestPath) : config.output.manifest;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(manifest, null, 2));
  return target;
}

export async function materializeAssets({ manifest, config }) {
  const warnings = [];
  const assets = [];
  for (const module of manifest.modules) {
    for (const attachment of module.attachments) {
      if (attachment.inline) {
        assets.push({
          module: module.name,
          type: attachment.type,
          mode: 'inline',
          target: null,
          url: null
        });
        continue;
      }
      const source = path.resolve(config.root, attachment.sourcePath);
      const targetDirectory = path.join(config.output.assets, attachment.target ?? attachment.type ?? 'asset');
      const targetPath = path.join(targetDirectory, attachment.outputFile);
      await fs.mkdir(targetDirectory, { recursive: true });
      try {
        await fs.copyFile(source, targetPath);
        const relativeTarget = path.relative(config.root, targetPath);
        const url = joinUrl(config.output.publicPath, path.relative(config.output.assets, targetPath));
        assets.push({
          module: module.name,
          type: attachment.type,
          mode: 'file',
          target: relativeTarget,
          url
        });
      } catch (error) {
        warnings.push(`Impossibile copiare ${attachment.sourcePath}: ${error.message}`);
      }
    }
  }
  return {
    manifest: {
      ...manifest,
      assets,
      builtAt: new Date().toISOString()
    },
    assets,
    warnings
  };
}

function joinUrl(base, segment) {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return normalizedBase + segment.replace(/\\/g, '/');
}
