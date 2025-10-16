import pc from 'picocolors';

export function formatScanTable(matches) {
  if (matches.tags.length === 0) {
    return [pc.dim('Nessun tag @bind trovato.')];
  }
  const header = `${pc.bold('File'.padEnd(40))}  ${pc.bold('Linea')}  ${pc.bold('Modulo')}  ${pc.bold('Modalità')}  ${pc.bold('Aggregazione')}`;
  const rows = matches.tags.map((tag) => {
    const file = tag.file.length > 40 ? `…${tag.file.slice(-39)}` : tag.file.padEnd(40);
    const line = String(tag.line).padStart(5);
    const mode = tag.mode ?? '-';
    const aggregation = tag.aggregation ?? '-';
    return `${file}  ${line}  ${tag.module.padEnd(12)}  ${mode.padEnd(10)}  ${aggregation.padEnd(12)}`;
  });
  return [header, ...rows];
}
