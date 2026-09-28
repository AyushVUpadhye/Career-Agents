/**
 * Career-Agents Interview Intelligence · STAR Scenario Generator & Matrix Builder
 * Generates tailored Situation-Task-Action-Result scenarios for target engineering and PM roles.
 * Copyright (c) 2026 Karthik Rajesh Shet · MIT License
 */

import fs from 'fs';
import path from 'path';

const COMPANY_PRINCPLES = {
  amazon: [
    { principle: 'Customer Obsession', focus: 'Working backwards from customer friction to architectural design' },
    { principle: 'Ownership', focus: 'Taking responsibility for cross-team legacy code debt and outages' },
    { principle: 'Bias for Action', focus: 'Executing calculated architectural changes under high ambiguity' },
    { principle: 'Dive Deep', focus: 'Root cause analysis of p99 latency spikes in production clusters' }
  ],
  google: [
    { principle: 'Googliness & Ambiguity', focus: 'Navigating undefined technical constraints and cross-team consensus' },
    { principle: 'Scale & Optimization', focus: 'Designing algorithms and data structures for 10M+ RPS workloads' },
    { principle: 'Technical Leadership', focus: 'Mentoring engineers and driving RFC design doc standards' }
  ],
  meta: [
    { principle: 'Move Fast', focus: 'Shipping high-impact features quickly while maintaining SLO stability' },
    { principle: 'Focus on Impact', focus: 'Prioritizing highest-leverage engineering bottlenecks first' },
    { principle: 'Be Open', focus: 'Conducting transparent postmortems and sharing architectural learnings' }
  ],
  stripe: [
    { principle: 'Users First', focus: 'Ensuring zero downtime for payment processing microservices' },
    { principle: 'Meticulous Craft', focus: 'Designing resilient API contracts with backwards compatibility' },
    { principle: 'Think Rigorously', focus: 'Benchmarking latency and network throughput before refactoring' }
  ]
};

/**
 * Generate structured STAR scenario prep matrix for a given target company and role.
 */
export function generateStarMatrix(companySlug = 'google', role = 'Software Engineer') {
  const cleanCo = (companySlug || 'google').toLowerCase().replace(/[^a-z0-9]/g, '');
  const principles = COMPANY_PRINCPLES[cleanCo] || COMPANY_PRINCPLES.google;

  const scenarios = principles.map((item, idx) => {
    return {
      id: `star-${cleanCo}-${idx + 1}`,
      principle: item.principle,
      focusArea: item.focus,
      situation: `During a high-throughput milestone deployment for ${role} workloads at ${companySlug.toUpperCase()}, production telemetry alerted on critical performance bottlenecks.`,
      task: `Lead the technical resolution, establish metrics-driven SLO benchmarks, and prevent customer impact without causing system downtime.`,
      action: `Executed deep query profiling, built distributed caching layers, decoupled asynchronous event processing pipelines, and established canary validation hooks.`,
      result: `Reduced p99 latency by 45%, eliminated downtime risk, and established reusable architectural patterns adopted across 3 engineering teams.`
    };
  });

  return {
    company: companySlug,
    role,
    totalScenarios: scenarios.length,
    scenarios,
    prepChecklist: [
      'Quantify results with exact percentage reductions, RPS metrics, or dollar savings.',
      'Emphasize personal technical ownership ("I built", "I benchmarked") rather than passive team action.',
      'Prepare a 2-minute elevator summary and a 5-minute deep-dive for each STAR story.'
    ]
  };
}

export default {
  generateStarMatrix
};
