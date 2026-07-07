# UI Upgrade Plan — stk://console v3

STATUS (2026-07-07): v3 shipped. Built: 1.1 personalized receipt, 1.2 cursor
spotlight, 1.3 command palette, 1.4 boot sequence, 2.2 live GitHub freshness,
2.3 stats strip, 3.1 terminal upgrades (scan/neofetch/theme/history/tab-complete),
3.2 console themes (viridian/amber/redteam), 4.2 JSON-LD, plus radar sweep,
marquee event feed, scroll progress bar, and name-decode effect.
Remaining: 2.1 dossiers, 2.4 timeline (needs dates), 4.1 OG image, 4.3 résumé PDF,
4.4 font self-hosting/audit.

Ordered by impact-per-effort; each phase ships independently so the site never
sits half-finished.

Current stack stays: hand-written HTML/CSS/vanilla JS, no build step.
Files referenced: `index.html`, `css/style.css`, `js/main.js`.

---

## Phase 1 — Signature moments (highest impact)

**1.1 Personalized triage receipt** — S/M
The hero receipt currently plays a fixed script. Make it triage the *actual* visitor:
pull browser name, OS, local time, viewport, and referrer from JS (no tracking, nothing
leaves the page) and weave them into the receipt lines — e.g.
`[+] enriching... os=windows browser=chrome local_time=09:42` and a business-hours
signal that changes the score. Every visitor sees a slightly different verdict.
- Touch: `js/main.js` (heroScript becomes a template fn)
- Accept: two different browsers/times produce visibly different receipts; reduced-motion still gets instant text.

**1.2 Cursor spotlight on cards** — S
Linear/Vercel-style radial glow that follows the mouse across case/coverage cards
(CSS custom props `--mx/--my` set from one `mousemove` listener, `radial-gradient` in
a `::after`). Desktop only; disabled for touch + reduced-motion.
- Touch: `css/style.css`, `js/main.js`
- Accept: 60fps (transform/opacity only), no effect on mobile.

**1.3 Command palette (Ctrl+K / ⌘K)** — M
A SIEM-style "search events" palette: fuzzy-jump to sections, projects, and actions
(copy email, open GitHub, open terminal). Complements the backtick terminal — palette
is for navigation, terminal is for play. Shared overlay styling with the terminal.
- Touch: all three files
- Accept: keyboard-only operation works (arrows/enter/esc), focus is trapped and restored.

**1.4 Boot sequence intro** — S
150–400ms max: brief `stk-console v3 — modules loaded` flash before hero reveal,
session-storage guarded so it plays once per visit, skipped entirely on reduced-motion.
Must never make the site feel slow — hard cap, content visible underneath.
- Touch: `index.html`, `css/style.css`, `js/main.js`
- Accept: repeat visits and reduced-motion skip it; LCP unaffected (text renders behind it).

## Phase 2 — Case files, level 2

**2.1 Expandable case dossiers** — M/L
Clicking a case card opens a full-screen dossier (dialog element): problem → approach →
architecture sketch (inline SVG) → outcome, plus the full Sift-style receipt with more
signals. Card grid stays scannable; depth lives one click away.
- Touch: `index.html` (dossier markup per project), `css/style.css`, `js/main.js`
- Accept: `<dialog>` semantics, esc/backdrop close, deep-linkable via `#case-sift` style hashes.

**2.2 Live GitHub freshness** — S/M
Fetch `api.github.com/users/saiz123/repos` client-side (60 req/hr unauthenticated is
plenty); show stars + "last activity: 3d ago" on each case card. Cache in
localStorage (1h TTL); on any failure render nothing — static content is the fallback.
- Touch: `js/main.js`, small CSS
- Accept: site looks identical if the API is blocked/rate-limited.

**2.3 Stats strip** — S
Animated counters under the hero: repos shipped, alert formats Sift ingests (8),
RefractIQ tests passing (243), homelab services running. Count-up on scroll into view.
- Touch: `index.html`, `css/style.css`, `js/main.js`

**2.4 Incident History timeline** — M
Education + career as resolved incidents: vertical timeline styled like a case log
(`2024-xx RESOLVED — M.S. Information Systems`, severity badges, duration chips).
Needs real dates from Sai before build.
- Touch: `index.html`, `css/style.css`
- Blocked on: degree dates, work history details.

## Phase 3 — Terminal 2.0 + theming

**3.1 Terminal upgrades** — M
Tab-completion, persistent history (sessionStorage), typed-output effect, new commands:
`open <case>` (launches dossier), `theme <name>`, `scan` (fake port-scan of the page,
finds only open roles), `history`, `neofetch`-style profile card in ASCII.
- Touch: `js/main.js`
- Accept: all commands listed in `help`; unknown input still fails gracefully.

**3.2 Console themes** — S/M
2–3 accent themes as CSS custom-prop swaps: `viridian` (current cyan/green),
`amber-alert` (SOC night-shift amber), `redteam` (crimson). Switch via terminal
command + a small toggle in the footer; persisted in localStorage. Dark-only — light
mode doesn't fit the concept and doubles the QA surface.
- Touch: `css/style.css` (theme classes on `<html>`), `js/main.js`
- Accept: every component passes contrast in every theme; choice survives reload.

## Phase 4 — Ship-quality pass

**4.1 Social/OG image** — S
Static 1200×630 `og.png` designed as a triage receipt (name, verdict: HIRE).
This is what recruiters see when the link is pasted into Slack/LinkedIn — outsized ROI.
- Touch: new asset + meta tags in `index.html`

**4.2 SEO + structured data** — S
JSON-LD `Person` (name, jobTitle, sameAs → GitHub/LinkedIn), `robots.txt`,
`sitemap.xml`, meta description tune-up.

**4.3 Résumé integration** — S
`resume.pdf` at root, "résumé ↗" button in hero + nav, `resume` terminal command.
- Blocked on: Sai supplying the PDF.

**4.4 Performance & a11y audit** — S/M
Target Lighthouse ≥95 across the board: self-host the two fonts (drop Google Fonts
round-trip), `font-display: swap`, explicit dimensions on everything, `aria-live` on
terminal output, full keyboard walk-through, axe scan, bump `?v=` on every deploy.

---

## Sequencing & risk notes

- Build order: 1.1 → 1.2 → 2.3 → 1.3 → 2.1 → 3.1 → 3.2 → 2.2 → 1.4 → 2.4 → Phase 4 last (except 4.1, do anytime).
- Everything degrades gracefully: no item may break the no-JS content or reduced-motion experience.
- Still no framework, no build step. If total JS passes ~30KB, split `main.js` into modules loaded with `defer` — nothing more.
- Items needing input from Sai before build: 2.4 (dates), 4.3 (PDF), 4.1 (photo optional).
