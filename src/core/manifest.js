import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

export async function createManifest({ config, matches, inlineContent = false }) {
  const warnings = [];
  const tagsByModule = groupTagsByModule(matches.tags);
  const modules = [];
  for (const [moduleName, tagList] of Object.entries(tagsByModule)) {
    const definition = config.modules[moduleName];
    if (!definition) {
      warnings.push(`Modulo ${moduleName} non definito nella configurazione.`);
      continue;
    }
    const attachments = [];
    for (const attachment of definition.attachments) {
      const absolutePath = path.resolve(config.root, attachment.path);
      try {
        await fs.access(absolutePath);
      } catch {
        warnings.push(`Attachment mancante per ${moduleName}: ${attachment.path}`);
        continue;
      }
      const sourceBuffer = await fs.readFile(absolutePath);
      const hash = crypto.createHash('sha1').update(sourceBuffer).digest('hex').slice(0, 10);
      const ext = path.extname(absolutePath);
      const baseName = path.basename(absolutePath, ext);
      const fileName = `${baseName}.${hash}${ext}`;
      attachments.push({
        type: attachment.type,
        inline: attachment.inline,
        target: attachment.target,
        bundle: attachment.bundle,
        sourcePath: attachment.path,
        outputFile: attachment.inline ? null : fileName,
        hash,
        rawHash: hash,
        integrity: attachment.integrity,
        content: attachment.inline && inlineContent ? sourceBuffer.toString('utf8') : undefined
      });
    }
    if (attachments.length > 0) {
      modules.push({
        name: moduleName,
        description: definition.description,
        tags: tagList,
        attachments
      });
    }
  }
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    config: {
      path: config.meta.configPath,
      sources: config.sources,
      output: config.output
    },
    modules,
    warnings
  };
}

function groupTagsByModule(tags) {
  return tags.reduce((acc, tag) => {
    if (!acc[tag.module]) {
      acc[tag.module] = [];
    }
    acc[tag.module].push(tag);
    return acc;
  }, {});
}
