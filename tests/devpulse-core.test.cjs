const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../devpulse-core.js');

test('validates ordinary GitHub usernames and trims whitespace', () => {
  assert.deepEqual(core.validateUsername(' khare-pratham '), { valid: true, username: 'khare-pratham' });
  assert.equal(core.validateUsername('a').valid, true);
  assert.equal(core.validateUsername('a'.repeat(39)).valid, true);
});

test('rejects empty, too-long, leading/trailing hyphen and invalid usernames', () => {
  for (const value of ['', ' ', '-name', 'name-', 'has space', 'name/name', 'a'.repeat(40)]) {
    assert.equal(core.validateUsername(value).valid, false, `expected invalid username: ${value}`);
  }
});

test('summarises stars and forks without mutating repository input', () => {
  const repos = [
    { name: 'one', stargazers_count: 4, forks_count: 2, language: 'JavaScript', size: 20 },
    { name: 'two', stargazers_count: 6, forks_count: 3, language: 'HTML', size: 10 }
  ];
  const before = structuredClone(repos);
  const summary = core.summariseRepositories(repos);
  assert.equal(summary.repositoryCount, 2);
  assert.equal(summary.stars, 10);
  assert.equal(summary.forks, 5);
  assert.deepEqual(repos, before);
});

test('handles missing and malformed numeric repository fields safely', () => {
  const summary = core.summariseRepositories([{}, { stargazers_count: -2, forks_count: 'bad', size: Infinity }]);
  assert.equal(summary.stars, 0);
  assert.equal(summary.forks, 0);
  assert.deepEqual(summary.languageDistribution, []);
});

test('language distribution uses repository size, skips unknown languages and is deterministic', () => {
  const summary = core.summariseRepositories([
    { name: 'a', language: 'JavaScript', size: 30 },
    { name: 'b', language: 'HTML', size: 10 },
    { name: 'c', language: null, size: 100 },
    { name: 'd', language: 'JavaScript', size: 10 }
  ]);
  assert.deepEqual(summary.languageDistribution.map(x => x.name), ['JavaScript', 'HTML']);
  assert.equal(summary.languageDistribution[0].percentage, 80);
  assert.equal(summary.languageDistribution[1].percentage, 20);
});

test('top repositories sort by stars and cap at eight', () => {
  const repos = Array.from({ length: 10 }, (_, i) => ({ name: `repo-${i}`, stargazers_count: i, forks_count: 0 }));
  const summary = core.summariseRepositories(repos);
  assert.equal(summary.topRepositories.length, 8);
  assert.equal(summary.topRepositories[0].name, 'repo-9');
  assert.equal(summary.topRepositories[7].name, 'repo-2');
});

test('compact number formatting handles zero and large values', () => {
  assert.equal(core.formatCompact(0), '0');
  assert.equal(core.formatCompact(1200), '1.2K');
  assert.equal(core.formatCompact(-10), '0');
});

test('maps GitHub not-found, rate-limit, server and generic errors to useful messages', () => {
  assert.equal(core.classifyApiError(404).kind, 'not-found');
  assert.equal(core.classifyApiError(403).kind, 'rate-limit');
  assert.equal(core.classifyApiError(429).kind, 'rate-limit');
  assert.equal(core.classifyApiError(503).kind, 'server');
  assert.equal(core.classifyApiError(422).kind, 'http');
});
