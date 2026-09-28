import assert from 'assert';
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';

console.log('=== STARTING PYTHON RESOLUTION TESTS ===');

// Locate a working Python 3 interpreter on the current PATH to build the fixtures from.
function findPython() {
  for (const cmd of ['python3', 'python']) {
    const res = spawnSync(cmd, ['-c', 'import sys; print(sys.executable); print(sys.base_prefix); print(sys.version_info[0])'], { encoding: 'utf8' });
    const [exe, prefix, major] = (res.stdout || '').trim().split(/\r?\n/);
    if (res.status === 0 && major === '3') return { exe, prefix };
  }
  throw new Error('A Python 3 interpreter is required to run these tests');
}

// Create a directory that exposes the interpreter under the given command name only.
function makeBinDir(python, name) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `python-resolution-${name}-`));
  if (isWindows) {
    try {
      fs.copyFileSync(python.exe, path.join(dir, `${name}.exe`));
      const exeDir = path.dirname(python.exe);
      for (const file of fs.readdirSync(exeDir).filter(f => f.toLowerCase().endsWith('.dll'))) {
        try { fs.copyFileSync(path.join(exeDir, file), path.join(dir, file)); } catch (_) {}
      }
    } catch (_) {
      // Fallback for Windows Store Execution Aliases (EACCES on copyfile)
      fs.writeFileSync(path.join(dir, `${name}.cmd`), `@echo off\r\n"${python.exe}" %*\r\n`);
      fs.writeFileSync(path.join(dir, `${name}.bat`), `@echo off\r\n"${python.exe}" %*\r\n`);
    }
  } else {
    fs.symlinkSync(python.exe, path.join(dir, name));
  }
  return dir;
}

// Environment whose PATH contains only the given directory.
function envWithPath(dir, python) {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.toLowerCase() !== 'path') env[key] = value;
  }
  if (isWindows) {
    const sysRoot = process.env.SystemRoot || 'C:\\Windows';
    const sys32 = path.join(sysRoot, 'System32');
    env.PATH = `${dir}${path.delimiter}${sys32}${path.delimiter}${sysRoot}`;
    env.PYTHONHOME = python.prefix;
    env.PATHEXT = process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD';
    env.SystemRoot = sysRoot;
    env.ComSpec = process.env.ComSpec || path.join(sys32, 'cmd.exe');
  } else {
    env.PATH = dir;
  }
  return env;
}

function runValidate(env) {
  return spawnSync(process.execPath, [path.join(root, 'scripts', 'cli.js'), 'validate'], { cwd: root, env, encoding: 'utf8' });
}

function assertValidatePasses(res, label) {
  assert.strictEqual(res.status, 0, `${label}: expected exit 0, got ${res.status}\n${res.stdout}${res.stderr}`);
  assert.ok(res.stdout.includes('validate.py checks pass'), `${label}: validate.py did not run\n${res.stdout}`);
}

const python = findPython();
const tempDirs = [];

try {
  console.log('Testing doctor with only python3 on PATH...');
  const python3Only = makeBinDir(python, 'python3');
  tempDirs.push(python3Only);
  assertValidatePasses(runValidate(envWithPath(python3Only, python)), 'python3 only');
  console.log('[PASS] validate.py runs when Python is only available as python3');

  console.log('Testing doctor with only python on PATH...');
  const pythonOnly = makeBinDir(python, 'python');
  tempDirs.push(pythonOnly);
  assertValidatePasses(runValidate(envWithPath(pythonOnly, python)), 'python only');
  console.log('[PASS] validate.py runs when Python is only available as python');

  if (!isWindows) {
    console.log('Testing doctor with a non-working python3 and a working python...');
    const brokenPython3 = makeBinDir(python, 'python');
    tempDirs.push(brokenPython3);
    const stub = path.join(brokenPython3, 'python3');
    fs.writeFileSync(stub, '#!/bin/sh\necho "Python was not found" >&2\nexit 49\n');
    fs.chmodSync(stub, 0o755);
    assertValidatePasses(runValidate(envWithPath(brokenPython3, python)), 'broken python3');
    console.log('[PASS] A python3 command that fails to run is skipped');
  }

  console.log('=== ALL PYTHON RESOLUTION TESTS PASSED ===\n');
  process.exitCode = 0;
} catch (e) {
  console.error('PYTHON RESOLUTION TEST FAILED:', e.message);
  process.exitCode = 1;
} finally {
  for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true });
}
