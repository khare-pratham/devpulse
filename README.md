# DevPulse — GitHub Analytics

A responsive dashboard that fetches public GitHub profile and repository data from GitHub's REST API.

## Run locally
Open `index.html` in a browser. If fetch requests are blocked by local file restrictions, run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000`.

## Features
- Search any public GitHub username
- Profile summary, public repo count, followers, stars and forks
- Language distribution based on repository size metadata
- Top repositories by stars, with links to source repositories
- Handles missing users and common API errors

## Limitations / next steps
- Public unauthenticated API rate limits apply
- Fetches up to 100 repositories; large profiles may be incomplete
- Language percentage is an approximation based on repository size, not line-of-code totals
- No commit-frequency or contributor-history analysis yet
- Next: pagination, API caching, tests, keyboard/accessibility review, and optionally a backend for authenticated requests

## Stack
HTML, CSS, JavaScript, GitHub REST API.
