/**
 * Career-Agents Resume Studio · ATS Keyword Gap & Density Heatmap Engine
 * Calculates keyword coverage, density percentages, and visual gap distributions against target JDs.
 * Copyright (c) 2026 Karthik Rajesh Shet · MIT License
 */

import fs from 'fs';
import path from 'path';

/**
 * Generate ATS keyword density heatmap analysis between a resume text and target JD.
 */
export function generateKeywordHeatmap(resumeText = '', jobDescriptionText = '') {
  const cleanResume = (resumeText || '').toLowerCase();
  const cleanJD = (jobDescriptionText || '').toLowerCase();

  // Extract candidate technical tokens from JD
  const defaultTokens = [
    'python', 'pytorch', 'tensorflow', 'react', 'next.js', 'node.js', 'typescript',
    'javascript', 'docker', 'kubernetes', 'aws', 'sql', 'postgresql', 'graphql',
    'system design', 'distributed systems', 'microservices', 'algorithms',
    'scalability', 'ci/cd', 'git', 'rag', 'llm', 'prompt engineering'
  ];

  const jdTokens = defaultTokens.filter(token => cleanJD.includes(token));
  const activeTokens = jdTokens.length > 0 ? jdTokens : defaultTokens.slice(0, 10);

  const matchedKeywords = [];
  const missingKeywords = [];
  const densityMap = {};

  for (const token of activeTokens) {
    const regex = new RegExp(`\\b${token.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const count = (cleanResume.match(regex) || []).length;
    densityMap[token] = count;

    if (count > 0) {
      matchedKeywords.push({ keyword: token, occurrences: count, status: count >= 2 ? 'optimal' : 'low-density' });
    } else {
      missingKeywords.push(token);
    }
  }

  const coveragePercent = activeTokens.length > 0 ? Math.round((matchedKeywords.length / activeTokens.length) * 100) : 0;

  return {
    coveragePercent,
    totalTargetKeywords: activeTokens.length,
    matchedCount: matchedKeywords.length,
    missingCount: missingKeywords.length,
    matchedKeywords,
    missingKeywords,
    heatmapGrade: coveragePercent >= 85 ? 'Optimal ATS Signaling' : coveragePercent >= 65 ? 'Moderate Match' : 'Critical Keyword Gaps',
    suggestions: missingKeywords.map(kw => `Integrate term "${kw}" into bullet experience section to improve ATS parser indexing.`)
  };
}

export default {
  generateKeywordHeatmap
};
