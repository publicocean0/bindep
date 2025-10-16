import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';

const DEFAULT_CONFIG_FILES = [
  'bindep.config.js',
  'bindep.config.mjs',
  'bindep.config.cjs',
  'bindep.config.json'
];

export async function loadConfig({ configPath, cwd = process.cwd() } = {}) {
  const resolved = await resolveConfigPath({ configPath, cwd });
  const moduleUrl = pathToFileURL(resolved);
  let raw;
  if (resolved.endsWith('.json')) {
    const buffer = await fs.readFile(resolved, 'utf8');
    raw = JSON.parse(buffer);
  } else {
    const imported = await import(moduleUrl.href);
    raw = imported.default ?? imported;
  }
  const normalized = normalizeConfig(raw, resolved);
  return normalized;
}

async function resolveConfigPath({ configPath, cwd }) {
  if (configPath) {
    const candidate = path.resolve(cwd, configPath);
    await ensureFile(candidate);
    return candidate;
  }
  for (const file of DEFAULT_CONFIG_FILES) {
    const candidate = path.resolve(cwd, file);
    if (await exists(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    'Nessun file di configurazione trovato. Crea bindep.config.js o specifica --config.'
  );
}

async function ensureFile(candidate) {
  try {
    const stats = await fs.stat(candidate);
    if (!stats.isFile()) {
      throw new Error(`Il percorso ${candidate} non è un file valido.`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File di configurazione non trovato: ${candidate}`);
    }
    throw error;
  }
}

async function exists(candidate) {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

function normalizeConfig(raw, resolvedPath) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('La configurazione di Bindep deve esportare un oggetto.');
  }
  const root = raw.root ? path.resolve(path.dirname(resolvedPath), raw.root) : path.dirname(resolvedPath);
  const sources = Array.isArray(raw.sources) && raw.sources.length > 0
    ? raw.sources
    : ['src/**/*.{js,jsx,ts,tsx,html,vue,svelte}'];
  const modules = normaliseModules(raw.modules ?? {});
  const output = normaliseOutput(raw.output, root);
  return {
    root,
    sources,
    modules,
    output,
    presets: raw.presets ?? [],
    meta: {
      configPath: resolvedPath
    }
  };
}

function normaliseModules(modules) {
  if (Array.isArray(modules)) {
    const map = {};
    for (const entry of modules) {
      if (!entry || typeof entry !== 'object') continue;
      if (!entry.name) {
        throw new Error('Ogni modulo deve avere una proprietà name.');
      }
      map[entry.name] = normaliseModule(entry);
    }
    return map;
  }
  const map = {};
  for (const [name, definition] of Object.entries(modules)) {
    map[name] = normaliseModule({ ...(definition ?? {}), name });
  }
  return map;
}

function normaliseModule(module) {
  if (!Array.isArray(module.attachments) || module.attachments.length === 0) {
    throw new Error(`Il modulo ${module.name} deve dichiarare almeno un attachment.`);
  }
  return {
    name: module.name,
    description: module.description ?? '',
    attachments: module.attachments.map((attachment, index) => normaliseAttachment(attachment, module, index))
  };
}

function normaliseAttachment(attachment, module, index) {
  if (!attachment || typeof attachment !== 'object') {
    throw new Error(`Attachment non valido per il modulo ${module.name} (index ${index}).`);
  }
  if (!attachment.path) {
    throw new Error(`Attachment del modulo ${module.name} (index ${index}) privo di path.`);
  }
  const type = attachment.type ?? inferTypeFromPath(attachment.path);
  return {
    type,
    path: attachment.path,
    inline: Boolean(attachment.inline),
    target: attachment.target ?? type,
    bundle: attachment.bundle ?? null,
    transform: attachment.transform ?? null,
    integrity: attachment.integrity ?? null
  };
}

function inferTypeFromPath(targetPath) {
  const ext = path.extname(targetPath);
  if (ext === '.css' || ext === '.scss' || ext === '.sass' || ext === '.less') {
    return 'css';
  }
  if (ext === '.js' || ext === '.ts' || ext === '.mjs') {
    return 'js';
  }
  return 'asset';
}

function normaliseOutput(output = {}, root) {
  const directory = output.directory
    ? path.resolve(root, output.directory)
    : path.resolve(root, 'dist/bindep');
  const manifest = output.manifest
    ? path.resolve(root, output.manifest)
    : path.join(directory, 'manifest.json');
  const assets = output.assets
    ? path.resolve(root, output.assets)
    : path.join(directory, 'assets');
  const publicPath = typeof output.publicPath === 'string' ? output.publicPath : '/';
  return {
    directory,
    manifest,
    assets,
    publicPath
  };
}
