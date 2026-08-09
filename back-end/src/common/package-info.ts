import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function readPackageVersion(): string {
  const raw = readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8');

  return (JSON.parse(raw) as { version: string }).version;
}
