import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:8000";
const user = {
  login: "test-user",
  name: "Test User",
  bio: "A demo developer",
  public_repos: 2,
  followers: 7,
  avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
  html_url: "https://github.com/test-user",
  created_at: "2020-01-01T00:00:00Z",
  location: "Sydney"
};
const repos = [
  { name: "alpha", description: "First project", html_url: "https://github.com/test-user/alpha", language: "JavaScript", size: 30, stargazers_count: 5, forks_count: 2, fork: false },
  { name: "beta", description: "Second project", html_url: "https://github.com/test-user/beta", language: "HTML", size: 10, stargazers_count: 3, forks_count: 1, fork: false }
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let userStatus = 200;
  let reposStatus = 200;
  let repoPayload = repos;

  await page.route("https://api.github.com/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/users/test-user") {
      return route.fulfill({ status: userStatus, headers: { "content-type": "application/json" }, body: JSON.stringify(userStatus === 200 ? user : { message: "Not Found" }) });
    }
    if (url.pathname === "/users/test-user/repos") {
      return route.fulfill({ status: reposStatus, headers: { "content-type": "application/json" }, body: JSON.stringify(reposStatus === 200 ? repoPayload : { message: "API error" }) });
    }
    return route.fulfill({ status: 404, headers: { "content-type": "application/json" }, body: JSON.stringify({ message: "Not Found" }) });
  });

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /Turn your GitHub into/ }).waitFor();
    await page.getByLabel("GitHub username").fill("invalid/name");
    await page.getByRole("button", { name: /Analyse profile/ }).click();
    await page.getByRole("alert").getByText(/Enter a valid GitHub username/).waitFor();
    assert.equal(page.url().includes("api.github.com"), false);
    console.log("PASS: invalid usernames are rejected before API calls");

    await page.getByLabel("GitHub username").fill("test-user");
    await page.getByRole("button", { name: /Analyse profile/ }).click();
    await page.getByRole("heading", { name: "Test User" }).waitFor();
    assert.equal(await page.locator("#reposCount").textContent(), "2");
    assert.equal(await page.locator("#starsCount").textContent(), "8");
    assert.equal(await page.locator("#forksCount").textContent(), "3");
    await page.getByRole("link", { name: "alpha" }).waitFor();
    await page.getByText("JavaScript").waitFor();
    console.log("PASS: profile metrics, language summary and repository links render");

    userStatus = 404;
    await page.getByLabel("GitHub username").fill("test-user");
    await page.getByRole("button", { name: /Analyse profile/ }).click();
    await page.getByRole("alert").getByText(/username not found/i).waitFor();
    console.log("PASS: missing usernames show a clear error");

    userStatus = 200;
    reposStatus = 200;
    user.public_repos = 120;
    repoPayload = Array.from({ length: 100 }, (_, index) => ({ ...repos[0], name: `repo-${index}`, html_url: `https://github.com/test-user/repo-${index}` }));
    await page.getByRole("button", { name: /Analyse profile/ }).click();
    await page.getByText(/capped at 100 repositories/i).waitFor();
    await page.getByText(/Showing 100 repositories out of 120 public repositories/i).waitFor();
    console.log("PASS: incomplete repository data is disclosed");

    reposStatus = 403;
    await page.getByRole("button", { name: /Analyse profile/ }).click();
    await page.getByRole("alert").getByText(/rate limit reached/i).waitFor();
    console.log("PASS: GitHub rate-limit responses show a useful message");

    console.log("\nAll DevPulse browser checks passed.");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
