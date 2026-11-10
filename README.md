# 0315jaewon.github.io
Personal Website (Design inspired by the Minimal Light theme)

Live website: https://0315jaewon.github.io/

## GitHub Pages

Every push to `main` runs `.github/workflows/pages.yml`. It builds the Research
Planner as static HTML and publishes the complete website from `_site/` using
GitHub Actions. Repository **Settings → Pages → Source** must be **GitHub Actions**.
No custom domain or domain renewal is required for the `github.io` address.

Published pages include the homepage, Algorithm Visualizer, Gomoku, Calendar,
the to-do demo under `/testing/`, and all Research Planner routes under
`/research-planner/`. PHP and planner source files are not published. The to-do
demo now saves tasks in browser storage instead of requiring a PHP server.

To build and check locally with Node.js 22 and Python 3:

```sh
npm ci --prefix research-planner
node scripts/build-pages.mjs
python3 scripts/check-pages.py
python3 -m http.server 8000 --directory _site
```

Open `http://localhost:8000/` after starting the preview server.

The existing Vercel deployment can still be used. Vercel Analytics loads there,
but is skipped on GitHub Pages, which does not provide Vercel's analytics endpoint.

## Moving planner data

Planner data is stored in `localStorage`, separately for each domain and browser.
On the old site, use **Export / Import → Download JSON**. On the new GitHub Pages
site, open **Export / Import**, paste the saved JSON, and choose **Replace Data**.
This replaces data on the new site; it does not delete the copy on the old domain.
Data from an unavailable old domain remains in that browser until its storage is
cleared, but cannot be read automatically from the new domain.

Incoming updates:
- Add resume icon and hyperlink resume/CV
- Add course notes as hyperlink to technical coursework section
