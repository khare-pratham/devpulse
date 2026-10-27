# DevPulse — GitHub Analytics Dashboard

> Explore public GitHub profile and repository data through a responsive analytics dashboard.

**Live demo:** [https://khare-pratham.github.io/devpulse/](https://khare-pratham.github.io/devpulse/)

## Overview

DevPulse retrieves public profile and repository information from the GitHub REST API. It summarises public repositories, followers, stars and forks, displays a language distribution estimate, and lists repositories ordered by star count.

## Features

- Search by public GitHub username
- Display profile name, avatar, bio, location and public profile link when available
- Summarise public repository count, followers, stars and forks
- List top repositories by stars with links to GitHub
- Show language distribution estimated from repository size metadata
- Handle invalid usernames, network errors and common API failures
- Responsive desktop and mobile layout

## Tech stack

`HTML5` · `CSS3` · `Vanilla JavaScript` · `GitHub REST API` · `Fetch API`

## How it works

The app runs in the browser and uses fetch to call GitHub's public user and repository endpoints. JavaScript combines profile and repository data, calculates summary metrics, estimates language distribution from repository size metadata, and renders the dashboard. No API token or backend is included.

## Run locally

1. Clone or download this repository.
2. Open `index.html` in a browser.

If local-file restrictions interfere, run this from the project folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Test checklist

- [ ] Search for an existing public username and verify profile details load
- [ ] Compare repository count, followers, stars and forks with public GitHub data
- [ ] Open a repository link and confirm it points to the correct repository
- [ ] Search for a non-existent username and confirm a clear error appears
- [ ] Test API rate-limit and network-error messaging
- [ ] Test a profile with missing bio or language metadata

## Known limitations

- Unauthenticated GitHub API rate limits apply
- Up to 100 repositories are fetched; larger accounts may be incomplete
- Language distribution is an estimate based on repository size metadata, not exact lines of code
- No pagination, caching, historical contribution trends or commit-frequency analysis yet
- Public profile data only; no private repository access

## Potential improvements

- Add pagination and clear handling of incomplete repository lists
- Add automated tests for API parsing and metrics
- Improve accessibility for loading, errors and charts
- Add caching to reduce repeat API calls

## Screenshots

Add screenshots captured from your running application. Suggested paths: `docs/screenshots/desktop.png` and `docs/screenshots/mobile.png`.
After uploading a screenshot, embed it with Markdown, for example:

```markdown
![Desktop dashboard](docs/screenshots/desktop.png)
```

## Project status

Portfolio prototype. This README distinguishes implemented features from potential future improvements.
