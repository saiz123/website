# saitejakavuri.com — stk://console

Personal portfolio of **Sai Teja Kavuri**, themed as a security triage console — a nod to
[Sift](https://github.com/saiz123/Sift), the alert-triage system I built. Visitors get
"triaged" on arrival, projects are presented as case files with severity badges, and there's
a working terminal easter egg (press `` ` `` or click **terminal** — try `sudo hire-me`).

## Stack

Hand-written **HTML + CSS + vanilla JS**. No framework, no build step, no dependencies.
Loads instantly, deploys anywhere, never breaks from an `npm audit`.

```
index.html      — all content and structure
css/style.css   — design system (SIEM-product dark UI)
js/main.js      — hero triage animation, ticker, reveals, terminal
```

## Run locally

Any static server works:

```sh
python -m http.server 4173
# then open http://localhost:4173
```

## Deploy

**GitHub Pages (recommended — free, works with saitejakavuri.com):**

1. Push this folder to a repo (e.g. replace the contents of `Sai-Teja-Kavuri` or create `portfolio`).
2. Repo → Settings → Pages → Deploy from branch → `main`, root.
3. Under "Custom domain" enter `saitejakavuri.com` and enable "Enforce HTTPS".
4. At your DNS provider, point the apex `A` records to GitHub Pages IPs
   (185.199.108.153 / .109 / .110 / .111) and `www` CNAME to `saiz123.github.io`.

**Cloudflare Pages** also works: create a project, connect the repo, no build command,
output directory `/`.

## Content to verify / update

- **CASE-003** links the healthcare risk prediction project to the `MRP_PROJECT` repo —
  confirm that's the right repo, and consider adding a README to it.
- Add your **university name** to the Analyst Profile facts if you want it shown.
- If you earn certifications (Security+, etc.), add them as chips in the hero and a row
  in the "quick enrichment" panel.
- Consider adding a `resume.pdf` at the root and a "résumé" button next to "Open case files".
