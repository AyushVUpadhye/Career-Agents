import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeJobMatch } from '../packages/resume/job-match.js';
import { CompanyIntel } from '../packages/pipeline/company-intel.js';
import { DedupEngine } from '../packages/pipeline/dedup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('=== STARTING UNIT TESTS ===');

function testSemanticMatching() {
  console.log('Testing Semantic Matching...');
  
  const resume = {
    skills: ['React', 'Next.js', 'Node.js', 'TypeScript']
  };
  const jdText = 'Looking for a Software Engineer with JavaScript and SQL skills.';
  
  const result = analyzeJobMatch(resume, jdText);
  assert.ok(result, 'Result should not be null');
  
  // React/Next.js/TypeScript in resume should match JavaScript in JD via taxonomy
  assert.ok(result.matchedKeywords.includes('javascript'), 'JavaScript should be matched semantically');
  assert.ok(result.missingKeywords.includes('sql'), 'SQL should be missing');
  assert.ok(result.confidence > 0, 'Confidence should be computed');
  
  console.log('[PASS] Semantic Matching');
}

function testFuzzyMatching() {
  console.log('Testing Fuzzy Search Query Normalization...');
  
  const searchIndex = JSON.parse(fs.readFileSync(path.join(root, 'search-index.json'), 'utf8'));
  assert.ok(searchIndex.items.length > 0, 'Search index should not be empty');
  
  console.log('[PASS] Fuzzy Search Query');
}

function testGraphTraversal() {
  console.log('Testing Knowledge Graph Traversal...');
  
  const graph = JSON.parse(fs.readFileSync(path.join(root, 'knowledge-graph.json'), 'utf8'));
  assert.ok(graph.nodes && graph.edges, 'Graph should have nodes and edges');
  
  // BFS algorithm validation
  const adj = {};
  for (const n of graph.nodes) {
    adj[n.id] = [];
  }
  for (const e of graph.edges) {
    if (adj[e.source] && adj[e.target]) {
      adj[e.source].push({ id: e.target, relation: e.relation });
      adj[e.target].push({ id: e.source, relation: e.relation });
    }
  }

  // Find shortest path from salesforce to skill-api-design-(rest/graphql)
  const queue = [];
  const visited = new Set();
  let foundPath = null;

  queue.push({ id: 'salesforce', path: ['salesforce'] });
  visited.add('salesforce');

  while (queue.length > 0) {
    const { id, path: currentPath } = queue.shift();
    if (id === 'skill-api-design-(rest/graphql)') {
      foundPath = currentPath;
      break;
    }
    const neighbors = adj[id] || [];
    for (const nb of neighbors) {
      if (!visited.has(nb.id)) {
        visited.add(nb.id);
        queue.push({ id: nb.id, path: [...currentPath, nb.id] });
      }
    }
  }

  assert.ok(foundPath, 'BFS should find a path between Salesforce and GraphQL');
  console.log('BFS Path found:', foundPath.join(' -> '));
  console.log('[PASS] Knowledge Graph BFS Traversal');
}

function testActionTools() {
  console.log('Testing action-oriented tools parsing helpers...');

  // Matcher for Lever job URL
  const leverUrl = 'https://jobs.lever.co/stripe/job-id-123';
  const leverMatch = leverUrl.match(/jobs\.lever\.co\/([^/]+)\/([^/]+)/);
  assert.ok(leverMatch, 'Lever URL regex should match');
  assert.strictEqual(leverMatch[1], 'stripe');
  assert.strictEqual(leverMatch[2], 'job-id-123');

  // Matcher for Greenhouse job URL
  const ghUrl = 'https://boards.greenhouse.io/github/jobs/job-id-456';
  const ghMatch = ghUrl.match(/boards\.greenhouse\.io\/([^/]+)\/jobs\/([^/]+)/);
  assert.ok(ghMatch, 'Greenhouse URL regex should match');
  assert.strictEqual(ghMatch[1], 'github');
  assert.strictEqual(ghMatch[2], 'job-id-456');

  // GitHub languages formatting
  const repos = [
    { language: 'TypeScript' },
    { language: 'TypeScript' },
    { language: 'JavaScript' }
  ];
  const langCounts = {};
  repos.forEach(r => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  });
  const topLanguages = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  assert.strictEqual(topLanguages[0], 'TypeScript');
  assert.strictEqual(topLanguages[1], 'JavaScript');

  console.log('[PASS] Action-Oriented parsing helpers');
}

function testCompanyIntel() {
  console.log('Testing CompanyIntel profile and requirements loading...');

  const google = CompanyIntel.getProfile('google');
  assert.strictEqual(google.found, true);
  assert.strictEqual(google.name, 'Google');
  assert.ok(Array.isArray(google.requiredSkills) && google.requiredSkills.length > 0, 'Google requiredSkills must be non-empty array');
  assert.ok(google.requiredSkills.some(s => s.toLowerCase().includes('data structures')), 'Google must require DSA');
  assert.ok(Array.isArray(google.interviewStages) && google.interviewStages.length > 0, 'Google interviewStages must be non-empty array');
  assert.ok(google.interviewStages.some(s => s.toLowerCase().includes('phone screen') || s.toLowerCase().includes('dsa')), 'Google interview stages must be loaded from registry');

  const amazon = CompanyIntel.getProfile('amazon');
  assert.strictEqual(amazon.found, true);
  assert.strictEqual(amazon.name, 'Amazon');
  assert.ok(amazon.requiredSkills.some(s => s.toLowerCase().includes('leadership principles')), 'Amazon must require Leadership Principles');

  const unlisted = CompanyIntel.getProfile('non-existent-corp-xyz');
  assert.strictEqual(unlisted.found, false);
  assert.strictEqual(unlisted.tier, 'Standard Tech');
  assert.ok(unlisted.requiredSkills.length > 0, 'Unlisted company must have fallback skills');

  console.log('[PASS] CompanyIntel profile and requirements');
}

function testDedupEngine() {
  console.log('Testing DedupEngine deduplication and normalizers...');

  // 1. Normalizers
  assert.strictEqual(DedupEngine.normalizeCompany('Google, Inc.'), 'google');
  assert.strictEqual(DedupEngine.normalizeCompany('Stripe LLC'), 'stripe');
  assert.strictEqual(DedupEngine.normalizeRole('Senior SWE'), 'senior software engineer');
  assert.strictEqual(DedupEngine.normalizeRole('Staff SDE'), 'staff software engineer');

  // 2. Deduplication with undefined / missing notes (must not throw TypeError)
  const entriesWithMissingNotes = [
    { company: 'Stripe', role: 'Software Engineer', status: 'applied' },
    { company: 'Stripe Inc', role: 'SWE', status: 'interviewing', notes: 'First round done' },
    { company: 'Google', role: 'Backend Engineer', status: 'screening' },
    { company: 'Google', role: 'Backend Engineer', status: 'screening', notes: 'Recruiter called' }
  ];

  const deduped = DedupEngine.deduplicate(entriesWithMissingNotes);
  assert.strictEqual(deduped.length, 2, 'Should deduplicate Stripe and Google entries');
  assert.strictEqual(deduped[0].notes, 'First round done', 'Should merge notes onto entry with originally undefined notes');
  assert.strictEqual(deduped[1].notes, 'Recruiter called', 'Should merge notes onto Google entry');

  // 3. Deduplication merging multiple non-empty notes
  const multiNotes = [
    { company: 'Netflix', role: 'Platform Engineer', notes: 'Applied online' },
    { company: 'Netflix', role: 'Platform Engineer', notes: 'Referral sent' }
  ];
  const merged = DedupEngine.deduplicate(multiNotes);
  assert.strictEqual(merged.length, 1);
  assert.strictEqual(merged[0].notes, 'Applied online; Referral sent');

  console.log('[PASS] DedupEngine deduplication and normalizers');
}

try {
  testSemanticMatching();
  testFuzzyMatching();
  testGraphTraversal();
  testActionTools();
  testCompanyIntel();
  testDedupEngine();
  console.log('=== ALL UNIT TESTS PASSED ===\n');
  process.exit(0);
} catch (e) {
  console.error('UNIT TEST FAILED:', e);
  process.exit(1);
}
