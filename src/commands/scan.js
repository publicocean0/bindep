import { loadConfig } from '../core/config.js';
import { scanSources } from '../core/scan.js';
import { formatScanTable } from '../utils/formatters.js';

export async function runScan({ configPath, format = 'table' }) {
  const config = await loadConfig({ configPath });
  const matches = await scanSources({ config });
  if (format === 'json') {
    return {
      format: 'json',
      payload: {
        configPath: config.meta.configPath,
        filesScanned: matches.stats.filesScanned,
        tagsFound: matches.tags
      }
    };
  }
  return {
    format: 'table',
    payload: formatScanTable(matches)
  };
}
