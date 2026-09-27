import assert from 'assert';
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('=== STARTING CLI ROUTING TESTS ===');

function testDisabledCommand() {
  console.log('Testing disabled command outputs...');
  const featuresPath = path.join(root, 'features.json');
  const originalFeatures = fs.readFileSync(featuresPath, 'utf8');
  const tempFeatures = JSON.parse(originalFeatures);
  tempFeatures.githubAnalyzer = false;
  fs.writeFileSync(featuresPath, JSON.stringify(tempFeatures, null, 2));

  try {
    const res = spawnSync('node', [path.join(root, 'scripts', 'cli.js'), 'github', 'karthikrshet'], { encoding: 'utf8' });
    assert.ok(res.stdout.includes('Feature Disabled'));
    assert.ok(res.stdout.includes('disabled behind a feature flag'));
    console.log('[PASS] Disabled command blocked with warnings.');
  } finally {
    fs.writeFileSync(featuresPath, originalFeatures);
  }
}

function testEnabledCommandHelp() {
  console.log('Testing CLI printHelp layout...');
  const featuresPath = path.join(root, 'features.json');
  const originalFeatures = fs.readFileSync(featuresPath, 'utf8');
  const tempFeatures = JSON.parse(originalFeatures);
  tempFeatures.resumeStudio = true;
  tempFeatures.githubAnalyzer = false;
  tempFeatures.mockInterview = false;
  fs.writeFileSync(featuresPath, JSON.stringify(tempFeatures, null, 2));

  try {
    const res = spawnSync('node', [path.join(root, 'scripts', 'cli.js'), 'help'], { encoding: 'utf8' });
    assert.ok(res.stdout.includes('-- AI Resume Studio --'));
    assert.ok(res.stdout.includes('-- Application Pipeline & Job Search --'));
    assert.ok(res.stdout.includes('pipeline tracker'));
    assert.ok(res.stdout.includes('resume <subcommand>'));
    // Verify disabled commands are hidden
    assert.ok(!res.stdout.includes('-- Profile & Fit Analyzers --'));
    assert.ok(!res.stdout.includes('-- Prep & Interactive Coaching --'));
    console.log('[PASS] Help screens match feature flag configurations.');
  } finally {
    fs.writeFileSync(featuresPath, originalFeatures);
  }
}

function testResumeScoreCommand() {
  console.log('Testing resume score command execution...');
  const templatePath = path.join(root, 'templates', 'fresher', 'basic-fresher', 'template.json');
  const res = spawnSync('node', [path.join(root, 'scripts', 'cli.js'), 'resume', 'score', templatePath], { encoding: 'utf8' });
  assert.strictEqual(res.status, 0, 'resume score command should exit with code 0');
  assert.ok(res.stdout.includes('ATS RESUME COMPLIANCE AUDIT'), 'output should contain audit header');
  assert.ok(res.stdout.includes('OVERALL ATS SCORE:'), 'output should contain overall score');
  assert.ok(res.stdout.includes('Formatting & Completeness'), 'output should contain formatting subscore');

  const noArgRes = spawnSync('node', [path.join(root, 'scripts', 'cli.js'), 'resume', 'score'], { encoding: 'utf8' });
  assert.strictEqual(noArgRes.status, 0);
  assert.ok(noArgRes.stderr.includes('Usage: career-agents resume score'), 'should display usage on missing file argument');
  console.log('[PASS] Resume score command executes and handles arguments cleanly.');
}

function testPipelineStatusRole() {
  console.log('Testing pipeline status with several roles at one company...');
  const trackerPath = path.join(root, 'pipeline-tracker.md');
  let originalTracker = null;
  try {
    originalTracker = fs.readFileSync(trackerPath, 'utf8');
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  const readStatuses = () => fs.readFileSync(trackerPath, 'utf8').split('\n')
    .filter(l => l.startsWith('| Google'))
    .map(l => l.split('|').slice(1, 4).map(c => c.trim()).join(' / '));

  try {
    fs.writeFileSync(trackerPath, [
      '# Job Application Pipeline Tracker',
      '',
      '| Company | Role | Status | Applied Date | Fit Score | Link | Notes |',
      '|---------|------|--------|--------------|-----------|------|-------|',
      '| Google | Software Engineer | applied | 2026-09-01 | - | - |  |',
      '| Google | Data Engineer | applied | 2026-09-03 | - | - |  |',
      ''
    ].join('\n'), 'utf8');
    const cli = path.join(root, 'scripts', 'cli.js');

    const res = spawnSync('node', [cli, 'pipeline', 'status', 'Google', 'interviewing', 'Onsite scheduled', '--role', 'Data Engineer'], { encoding: 'utf8' });
    assert.strictEqual(res.status, 0);
    assert.deepStrictEqual(readStatuses(), ['Google / Software Engineer / applied', 'Google / Data Engineer / interviewing']);
    assert.ok(fs.readFileSync(trackerPath, 'utf8').includes('| Google | Data Engineer | interviewing | 2026-09-03 | - | - | Onsite scheduled |'), 'Note should be on the Data Engineer row');

    const ambiguous = spawnSync('node', [cli, 'pipeline', 'status', 'Google', 'offer'], { encoding: 'utf8' });
    assert.ok(ambiguous.stdout.includes('--role'), 'Ambiguous update should ask for --role');
    assert.deepStrictEqual(readStatuses(), ['Google / Software Engineer / applied', 'Google / Data Engineer / interviewing'], 'Ambiguous update must not change the tracker');
  } finally {
    if (originalTracker === null) {
      fs.rmSync(trackerPath, { force: true });
    } else {
      fs.writeFileSync(trackerPath, originalTracker, 'utf8');
    }
  }
  console.log('[PASS] pipeline status updates only the requested role.');
}

function run() {
  try {
    testDisabledCommand();
    testEnabledCommandHelp();
    testResumeScoreCommand();
    testPipelineStatusRole();
    console.log('=== ALL CLI ROUTING TESTS PASSED ===\n');
    process.exit(0);
  } catch (e) {
    console.error('TEST FAILED:', e);
    process.exit(1);
  }
}

run();
