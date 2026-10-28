/* DevPulse core logic. Works in browsers and Node.js tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DevPulseCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const USERNAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

  function validateUsername(value) {
    const username = String(value ?? '').trim();
    return { valid: USERNAME_RE.test(username), username };
  }

  function asNonNegativeNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function summariseRepositories(repositories) {
    const repos = Array.isArray(repositories) ? repositories : [];
    const stars = repos.reduce((sum, repo) => sum + asNonNegativeNumber(repo && repo.stargazers_count), 0);
    const forks = repos.reduce((sum, repo) => sum + asNonNegativeNumber(repo && repo.forks_count), 0);
    const languages = Object.create(null);
    for (const repo of repos) {
      const language = typeof (repo && repo.language) === 'string' ? repo.language.trim() : '';
      if (!language) continue;
      const size = Math.max(asNonNegativeNumber(repo.size), 1);
      languages[language] = (languages[language] || 0) + size;
    }
    const languageEntries = Object.entries(languages)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const totalLanguageSize = languageEntries.reduce((sum, [, size]) => sum + size, 0);
    const languageDistribution = languageEntries.slice(0, 8).map(([name, size]) => ({
      name,
      size,
      percentage: totalLanguageSize ? Math.round((size / totalLanguageSize) * 100) : 0
    }));
    const topRepositories = [...repos]
      .sort((a, b) => asNonNegativeNumber(b && b.stargazers_count) - asNonNegativeNumber(a && a.stargazers_count)
        || String(a && a.name || '').localeCompare(String(b && b.name || '')))
      .slice(0, 8);
    return { repositoryCount: repos.length, stars, forks, languageDistribution, topRepositories };
  }

  function formatCompact(value) {
    const n = asNonNegativeNumber(value);
    return new Intl.NumberFormat('en', {
      notation: n >= 1000 ? 'compact' : 'standard',
      maximumFractionDigits: 1
    }).format(n);
  }

  function classifyApiError(status, rateLimitReset) {
    if (status === 404) return { kind: 'not-found', message: 'GitHub username not found. Check the spelling.' };
    if (status === 401) return { kind: 'unauthorized', message: 'GitHub did not authorise this request. Please try again later.' };
    if (status === 403 || status === 429) {
      let retryMessage = 'Wait a little and try again.';
      const resetSeconds = Number(rateLimitReset);
      if (Number.isFinite(resetSeconds) && resetSeconds > 0) {
        const seconds = Math.max(0, Math.ceil(resetSeconds - Date.now() / 1000));
        if (seconds > 0 && seconds <= 3600) retryMessage = `Try again in about ${Math.ceil(seconds / 60)} minute(s).`;
      }
      return { kind: 'rate-limit', message: `GitHub API rate limit reached. ${retryMessage}` };
    }
    if (status >= 500) return { kind: 'server', message: 'GitHub is temporarily unavailable. Please try again shortly.' };
    return { kind: 'http', message: `GitHub API returned HTTP ${status}. Please try again.` };
  }

  return { validateUsername, summariseRepositories, formatCompact, classifyApiError };
});
