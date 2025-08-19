import fs from 'fs';
import path from 'path';

let cachedVersion: string | null = null;

export function getAppVersion(): string {
  if (cachedVersion) return cachedVersion as string;
  try {
    const pkgPath = path.resolve(process.cwd(), 'packages/backend/package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    cachedVersion = (pkg.version as string) || '0.0.0';
    return cachedVersion;
  } catch {
    return '0.0.0';
  }
}
