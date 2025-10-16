import pc from 'picocolors';

export function handleCliError(error) {
  if (error instanceof Error) {
    process.stderr.write(`${pc.red('✖')} ${error.message}\n`);
  } else {
    process.stderr.write(`${pc.red('✖')} Errore sconosciuto: ${String(error)}\n`);
  }
}
