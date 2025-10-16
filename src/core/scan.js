import path from 'node:path';
import fs from 'node:fs/promises';
import globby from 'globby';

const TAG_PATTERN = /@bind(?::(?<namespace>[\w\-/]+))?\s+(?<rest>[^\n\r]+)/i;

export async function scanSources({ config }) {
  const cwd = config.root;
  const files = await globby(config.sources, { cwd, absolute: true, suppressErrors: true });
  const tags = [];
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      const match = TAG_PATTERN.exec(line);
      if (match) {
        const tokens = match.groups.rest.trim().split(/\s+/);
        const module = tokens.shift();
        const mode = tokens.shift() ?? null;
        const aggregation = tokens.shift() ?? null;
        tags.push({
          file: path.relative(cwd, file),
          line: index + 1,
          namespace: match.groups.namespace ?? null,
          module,
          mode,
          aggregation,
          flags: tokens,
          raw: line.trim()
        });
      }
    });
  }
  return {
    stats: {
      filesScanned: files.length
    },
    tags
  };
}
