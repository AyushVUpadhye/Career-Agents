/**
 * Career-Agents Pipeline · GitHub Direct Integration Engine
 * Provides authenticated REST API operations: push files, create repos, sync portfolio, manage issues & PRs.
 * Copyright (c) 2026 Karthik Rajesh Shet · MIT License
 */

import fs from 'fs';
import path from 'path';

/**
 * Safely retrieve GitHub Token from environment
 */
export function getGithubToken() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_PAT || null;
}

/**
 * Construct standard headers for GitHub REST API v3
 */
export function getGithubHeaders(token = getGithubToken()) {
  const headers = {
    'User-Agent': 'CareerAgentsOS-API/18.1.0',
    'Accept': 'application/vnd.github.v3+json'
  };
  if (token) {
    const cleanToken = token.startsWith('bearer ') || token.startsWith('token ') ? token.split(' ')[1] : token;
    headers['Authorization'] = `token ${cleanToken}`;
  }
  return headers;
}

/**
 * Fetch authenticated GitHub User Profile
 */
export async function getAuthenticatedUser(token = getGithubToken()) {
  const headers = getGithubHeaders(token);
  const res = await fetch('https://api.github.com/user', { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub API user authentication failed (${res.status}): ${err.message || res.statusText}`);
  }
  return res.json();
}

/**
 * Push a file directly to a GitHub repository branch.
 */
export async function pushFileToRepo({ owner, repo, filePath, content, commitMessage, branch = 'main', token = getGithubToken() }) {
  if (!token) {
    throw new Error('GitHub token missing. Set GITHUB_TOKEN environment variable to execute direct repository commits.');
  }
  if (!owner || !repo || !filePath || content === undefined) {
    throw new Error('Missing required arguments: owner, repo, filePath, and content are required.');
  }

  const cleanPath = filePath.replace(/^\/+/, '');
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${branch}`;
  const headers = getGithubHeaders(token);

  // 1. Check if file already exists to get its sha
  let existingSha = null;
  try {
    const getRes = await fetch(url, { headers });
    if (getRes.ok) {
      const existingFile = await getRes.json();
      existingSha = existingFile.sha;
    }
  } catch {}

  // 2. Base64 encode content
  const base64Content = Buffer.from(String(content), 'utf8').toString('base64');
  const payload = {
    message: commitMessage || `feat(career-agents): update ${cleanPath}`,
    content: base64Content,
    branch
  };
  if (existingSha) {
    payload.sha = existingSha;
  }

  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;
  const putRes = await fetch(putUrl, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!putRes.ok) {
    const errData = await putRes.json().catch(() => ({}));
    throw new Error(`Failed to push ${cleanPath} to ${owner}/${repo} (${putRes.status}): ${errData.message || putRes.statusText}`);
  }

  const result = await putRes.json();
  return {
    success: true,
    commitSha: result.commit ? result.commit.sha : '',
    contentUrl: result.content ? result.content.html_url : '',
    path: cleanPath,
    action: existingSha ? 'updated' : 'created'
  };
}

/**
 * Create a new repository on GitHub.
 */
export async function createRepository({ name, description = '', isPrivate = false, autoInit = true, token = getGithubToken() }) {
  if (!token) {
    throw new Error('GitHub token missing. Set GITHUB_TOKEN environment variable to create repositories.');
  }
  if (!name) {
    throw new Error('Repository name is required.');
  }

  const headers = getGithubHeaders(token);
  const payload = {
    name,
    description: description || 'Career-Agents Portfolio & Career Intelligence Repository',
    private: isPrivate,
    auto_init: autoInit
  };

  const res = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Failed to create repository ${name} (${res.status}): ${errData.message || res.statusText}`);
  }

  const data = await res.json();
  return {
    success: true,
    repoName: data.name,
    fullName: data.full_name,
    htmlUrl: data.html_url,
    cloneUrl: data.clone_url,
    defaultBranch: data.default_branch || 'main'
  };
}

/**
 * Sync entire career portfolio (Resume, Cover Letter, Project Summaries) to a GitHub repository.
 */
export async function syncPortfolioToGithub({ owner, repo = 'career-portfolio', resumeMarkdown = '', coverLetterMarkdown = '', projectMarkdown = '', token = getGithubToken() }) {
  if (!token) {
    throw new Error('GitHub token missing. Set GITHUB_TOKEN environment variable to sync portfolio.');
  }

  let targetOwner = owner;
  if (!targetOwner) {
    const user = await getAuthenticatedUser(token);
    targetOwner = user.login;
  }

  // Ensure repo exists or create it
  try {
    const checkRes = await fetch(`https://api.github.com/repos/${targetOwner}/${repo}`, { headers: getGithubHeaders(token) });
    if (checkRes.status === 404) {
      await createRepository({ name: repo, description: 'Personal Career Portfolio & ATS Resume Hub', isPrivate: false, autoInit: true, token });
    }
  } catch {}

  const pushedFiles = [];

  if (resumeMarkdown) {
    const res = await pushFileToRepo({
      owner: targetOwner,
      repo,
      filePath: 'RESUME.md',
      content: resumeMarkdown,
      commitMessage: 'docs(career-agents): sync ATS resume',
      token
    });
    pushedFiles.push(res);
  }

  if (coverLetterMarkdown) {
    const res = await pushFileToRepo({
      owner: targetOwner,
      repo,
      filePath: 'COVER_LETTER.md',
      content: coverLetterMarkdown,
      commitMessage: 'docs(career-agents): sync executive cover letter',
      token
    });
    pushedFiles.push(res);
  }

  if (projectMarkdown) {
    const res = await pushFileToRepo({
      owner: targetOwner,
      repo,
      filePath: 'PORTFOLIO_PROJECTS.md',
      content: projectMarkdown,
      commitMessage: 'docs(career-agents): sync verified portfolio projects',
      token
    });
    pushedFiles.push(res);
  }

  return {
    success: true,
    repository: `${targetOwner}/${repo}`,
    repoUrl: `https://github.com/${targetOwner}/${repo}`,
    pushedCount: pushedFiles.length,
    files: pushedFiles
  };
}

/**
 * Create an issue on a GitHub repository.
 */
export async function createIssue({ owner, repo, title, body = '', labels = [], token = getGithubToken() }) {
  if (!token) {
    throw new Error('GitHub token missing. Set GITHUB_TOKEN environment variable.');
  }
  const headers = getGithubHeaders(token);
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, labels })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to create issue in ${owner}/${repo}: ${err.message || res.statusText}`);
  }
  const data = await res.json();
  return { success: true, issueNumber: data.number, htmlUrl: data.html_url };
}

/**
 * Create a Pull Request on a GitHub repository.
 */
export async function createPullRequest({ owner, repo, title, head, base = 'main', body = '', token = getGithubToken() }) {
  if (!token) {
    throw new Error('GitHub token missing. Set GITHUB_TOKEN environment variable.');
  }
  const headers = getGithubHeaders(token);
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, head, base, body })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to create PR in ${owner}/${repo}: ${err.message || res.statusText}`);
  }
  const data = await res.json();
  return { success: true, prNumber: data.number, htmlUrl: data.html_url };
}

export default {
  getGithubToken,
  getGithubHeaders,
  getAuthenticatedUser,
  pushFileToRepo,
  createRepository,
  syncPortfolioToGithub,
  createIssue,
  createPullRequest
};
