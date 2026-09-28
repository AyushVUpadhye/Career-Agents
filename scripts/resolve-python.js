import { spawnSync } from 'child_process';

// Python 3 may be installed as `python3` (most Linux/macOS systems) or only as
// `python` (python.org installer on Windows, where `python3` is often the
// Microsoft Store alias that just prints an error). Try each name and keep the
// first one that actually runs Python 3.
const CANDIDATES = ['python3', 'python'];

let resolved;

export function resolvePython() {
  if (resolved === undefined) {
    resolved = CANDIDATES.find((cmd) => {
      const res = spawnSync(cmd, ['--version'], { encoding: 'utf8' });
      return res.status === 0 && /^Python 3\./.test(`${res.stdout || ''}${res.stderr || ''}`.trim());
    }) || null;
  }
  return resolved;
}
