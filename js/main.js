/* ============================================================
   stk://console v3 — boot sequence, personalized triage,
   marquee feed, stats, spotlight, GitHub freshness, themes,
   command palette, and the interactive terminal.
   ============================================================ */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function ok(s) { return '<span class="t-ok">' + s + "</span>"; }
  function accent(s) { return '<span class="t-accent">' + s + "</span>"; }
  function crit(s) { return '<span class="t-crit">' + s + "</span>"; }

  /* ---------- console themes ---------- */
  var THEMES = ["viridian", "amber", "redteam"];
  var themeBtn = document.getElementById("themeBtn");
  var themeName = document.getElementById("themeName");

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "viridian";
  }
  function applyTheme(name) {
    if (THEMES.indexOf(name) === -1) name = "viridian";
    if (name === "viridian") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", name);
    }
    themeName.textContent = name;
    try { localStorage.setItem("stk-theme", name); } catch (err) { /* private mode */ }
  }
  function cycleTheme() {
    var next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
    applyTheme(next);
  }
  try {
    var savedTheme = localStorage.getItem("stk-theme");
    if (savedTheme && savedTheme !== "viridian") applyTheme(savedTheme);
  } catch (err) { /* ignore */ }
  themeBtn.addEventListener("click", cycleTheme);

  /* ---------- boot sequence (once per session) ---------- */
  var boot = document.getElementById("boot");
  var bootLines = document.getElementById("bootLines");
  var bootSeen = false;
  try { bootSeen = sessionStorage.getItem("stk-boot") === "1"; } catch (err) { /* ignore */ }

  if (!reducedMotion && !bootSeen && boot) {
    try { sessionStorage.setItem("stk-boot", "1"); } catch (err) { /* ignore */ }
    boot.hidden = false;
    var bootScript = [
      accent("stk-console v3.0"),
      "loading modules............ " + ok("[ok]"),
      "theme: " + currentTheme() + "............. " + ok("[ok]"),
      "visitor cleared — " + ok("access granted")
    ];
    var bi = 0;
    (function bootNext() {
      if (bi < bootScript.length) {
        bootLines.innerHTML += bootScript[bi] + "\n";
        bi++;
        setTimeout(bootNext, 130);
      } else {
        setTimeout(function () {
          boot.classList.add("done");
          setTimeout(function () { boot.hidden = true; }, 450);
        }, 300);
      }
    })();
  } else if (boot) {
    boot.hidden = true;
  }

  /* ---------- footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- scroll progress bar ---------- */
  var progress = document.getElementById("progress");
  var progressTick = false;
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    progressTick = false;
  }
  window.addEventListener("scroll", function () {
    if (!progressTick) {
      progressTick = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- hero name decode ---------- */
  var heroName = document.getElementById("heroName");
  if (heroName && !reducedMotion) {
    var GLYPHS = "!<>-_\\/[]{}—=+*^?#01";
    var nodes = [];
    (function collect(el) {
      Array.prototype.forEach.call(el.childNodes, function (n) {
        if (n.nodeType === 3) nodes.push({ node: n, final: n.textContent });
        else if (n.nodeType === 1) collect(n);
      });
    })(heroName);
    var frame = 0, totalFrames = 26;
    (function decode() {
      frame++;
      nodes.forEach(function (item) {
        var out = "";
        for (var c = 0; c < item.final.length; c++) {
          var ch = item.final[c];
          if (ch === " " || (c / item.final.length) * totalFrames < frame) {
            out += ch;
          } else {
            out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }
        item.node.textContent = out;
      });
      if (frame < totalFrames) requestAnimationFrame(decode);
    })();
  }

  /* ---------- personalized hero triage ---------- */
  var heroTerm = document.getElementById("heroTerm");

  function visitorFacts() {
    var ua = navigator.userAgent;
    var browser =
      /edg\//i.test(ua) ? "edge" :
      /firefox/i.test(ua) ? "firefox" :
      /chrome|crios/i.test(ua) ? "chrome" :
      /safari/i.test(ua) ? "safari" : "unknown";
    var os =
      /windows/i.test(ua) ? "windows" :
      /iphone|ipad/i.test(ua) ? "ios" :
      /mac/i.test(ua) ? "macos" :
      /android/i.test(ua) ? "android" :
      /linux/i.test(ua) ? "linux" : "unknown";
    var now = new Date();
    var referrer = "direct";
    try {
      if (document.referrer) referrer = new URL(document.referrer).hostname;
    } catch (err) { /* keep direct */ }
    return {
      browser: browser,
      os: os,
      time: pad(now.getHours()) + ":" + pad(now.getMinutes()),
      hour: now.getHours(),
      vw: window.innerWidth + "x" + window.innerHeight,
      ref: referrer
    };
  }

  function buildHeroScript() {
    var f = visitorFacts();
    var hoursSignal = (f.hour >= 9 && f.hour < 18)
      ? "[+] signal: recruiting-hours-activity    +15"
      : "[+] signal: after-hours-threat-hunting   +15";
    return [
      { t: "$ sift triage --source visitor", c: "t-accent", d: 300 },
      { t: "[+] new event: inbound connection from your browser", c: "", d: 480 },
      { t: "[+] enriching... os=" + f.os + "  browser=" + f.browser + "  local_time=" + f.time, c: "", d: 520 },
      { t: "[+] context: viewport=" + f.vw + "  referrer=" + f.ref, c: "t-dim", d: 420 },
      { t: "[+] signal: interested-in-security       +40", c: "t-dim", d: 300 },
      { t: "[+] signal: reviewing-portfolio          +25", c: "t-dim", d: 300 },
      { t: hoursSignal, c: "t-dim", d: 300 },
      { t: "[+] signal: excellent-taste              +10", c: "t-dim", d: 300 },
      { t: "[✓] score: 90/100 — verdict: ESCALATE TO HUMAN", c: "t-warn", d: 620 },
      { t: "[✓] routing to: Sai Teja Kavuri", c: "t-ok", d: 480 },
      { t: "", c: "", d: 180 },
      { t: "> hi, I’m Sai. welcome to the console.", c: "t-ok", d: 0 }
    ];
  }

  (function runHeroScript() {
    var heroScript = buildHeroScript();
    if (reducedMotion) {
      heroTerm.innerHTML = heroScript.map(function (l) {
        return '<span class="' + l.c + '">' + escapeHtml(l.t) + "</span>";
      }).join("\n");
      return;
    }
    var i = 0;
    heroTerm.innerHTML = "";
    function next() {
      if (i >= heroScript.length) {
        heroTerm.innerHTML += '<span class="cursor"></span>';
        return;
      }
      var line = heroScript[i];
      var span = document.createElement("span");
      if (line.c) span.className = line.c;
      span.textContent = line.t;
      heroTerm.appendChild(span);
      heroTerm.appendChild(document.createTextNode("\n"));
      i++;
      setTimeout(next, line.d);
    }
    setTimeout(next, reducedMotion ? 0 : 500);
  })();

  /* ---------- marquee event feed ---------- */
  var tickerTrack = document.getElementById("tickerTrack");
  var tickerItems = [
    "INFO  homelab: wazuh manager healthy · all agents reporting",
    "INFO  sift: 0 false positives escalated today · receipts available",
    "NOTICE  career: open to SOC Analyst / Security Engineer roles · St. Louis or remote",
    "INFO  suricata: eve.json flowing · rules updated from free feeds",
    "INFO  github: latest pushes — Sift, RefractIQ · github.com/saiz123",
    "NOTICE  education: M.S. Information Systems · secure SDLC in practice",
    "INFO  threat-intel: abuse.ch + tor exit feeds synced · no API keys harmed",
    "HINT  press ` for the terminal · ctrl+K to search"
  ];
  (function buildTicker() {
    var half = tickerItems.map(function (t) {
      var sp = t.indexOf("  ");
      return "<span><b>" + escapeHtml(t.slice(0, sp)) + "</b>" + escapeHtml(t.slice(sp)) + "</span>";
    }).join("");
    if (reducedMotion) {
      tickerTrack.innerHTML = half;
    } else {
      tickerTrack.innerHTML = half + half; /* duplicate for seamless loop */
    }
  })();

  /* ---------- stats count-up ---------- */
  var statNums = document.querySelectorAll(".stat-num [data-count]");
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reducedMotion) { el.textContent = target; return; }
    var t0 = null, dur = 1300;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          countUp(e.target);
          statIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    statNums.forEach(function (el) { statIo.observe(el); });
  } else {
    statNums.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ---------- cursor spotlight ---------- */
  if (finePointer && !reducedMotion) {
    var glowCards = document.querySelectorAll(".case, .cov-card, .pipe-node, .about-facts, .stat");
    glowCards.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- live GitHub freshness ---------- */
  (function githubMeta() {
    var slots = document.querySelectorAll(".case[data-repo] .gh-meta");
    if (!slots.length || !window.fetch) return;

    function relTime(iso) {
      var days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
      if (days <= 0) return "today";
      if (days === 1) return "1d ago";
      if (days < 30) return days + "d ago";
      if (days < 365) return Math.floor(days / 30) + "mo ago";
      return Math.floor(days / 365) + "y ago";
    }
    function render(repos) {
      var byName = {};
      repos.forEach(function (r) { byName[r.full_name.toLowerCase()] = r; });
      document.querySelectorAll(".case[data-repo]").forEach(function (card) {
        var repo = byName[card.getAttribute("data-repo").toLowerCase()];
        var slot = card.querySelector(".gh-meta");
        if (!repo || !slot) return;
        slot.innerHTML =
          '<span class="gh-star">★ ' + (repo.stargazers_count || 0) + "</span> · pushed " +
          escapeHtml(relTime(repo.pushed_at));
      });
    }

    var CACHE_KEY = "stk-gh-repos";
    try {
      var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && Date.now() - cached.t < 3600000) {
        render(cached.data);
        return;
      }
    } catch (err) { /* ignore */ }

    fetch("https://api.github.com/users/saiz123/repos?per_page=100")
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
      .then(function (data) {
        var slim = data.map(function (r) {
          return { full_name: r.full_name, stargazers_count: r.stargazers_count, pushed_at: r.pushed_at };
        });
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: slim })); } catch (err) { /* ignore */ }
        render(slim);
      })
      .catch(function () { /* static content is the fallback */ });
  })();

  /* ---------- scrollspy nav highlighting ---------- */
  var navAnchors = document.querySelectorAll(".nav-links a");
  var spySections = [];
  navAnchors.forEach(function (a) {
    var sec = document.querySelector(a.getAttribute("href"));
    if (sec) spySections.push({ a: a, sec: sec });
  });
  if ("IntersectionObserver" in window && spySections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navAnchors.forEach(function (a) { a.classList.remove("active"); });
          var hit = spySections.filter(function (s) { return s.sec === e.target; })[0];
          if (hit) hit.a.classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    spySections.forEach(function (s) { spy.observe(s.sec); });
    window.addEventListener("scroll", function () {
      if (window.scrollY < 200) {
        navAnchors.forEach(function (a) { a.classList.remove("active"); });
      }
    }, { passive: true });
  }

  /* ---------- mobile menu ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  navToggle.addEventListener("click", function () {
    var open = mobileMenu.hidden;
    mobileMenu.hidden = !open;
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      mobileMenu.hidden = true;
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- copy email ---------- */
  var copyBtn = document.getElementById("copyEmail");
  var EMAIL = "saitejakavuri39@gmail.com";
  function copyEmail(onDone) {
    var settled = false;
    function done() {
      if (settled) return;
      settled = true;
      if (onDone) onDone();
    }
    function fallback() {
      if (settled) return;
      var ta = document.createElement("textarea");
      ta.value = EMAIL;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (err) { /* ignore */ }
      document.body.removeChild(ta);
      done();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(done, fallback);
      setTimeout(fallback, 600); // clipboard API can stall without a permission grant
    } else {
      fallback();
    }
  }
  copyBtn.addEventListener("click", function () {
    copyEmail(function () {
      copyBtn.textContent = "copied ✓";
      setTimeout(function () { copyBtn.textContent = "copy email"; }, 1800);
    });
  });

  /* ---------- session uptime ---------- */
  var uptimeEl = document.getElementById("uptime");
  var t0 = Date.now();
  setInterval(function () {
    var s = Math.floor((Date.now() - t0) / 1000);
    var m = Math.floor(s / 60);
    uptimeEl.textContent = pad(m) + ":" + pad(s % 60);
  }, 1000);

  /* ---------- command palette ---------- */
  var palOverlay = document.getElementById("palOverlay");
  var palInput = document.getElementById("palInput");
  var palList = document.getElementById("palList");
  var palSel = 0;
  var palResults = [];

  function goSection(hash) {
    return function () {
      var el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    };
  }
  function goUrl(url) {
    return function () { window.open(url, "_blank", "noopener"); };
  }

  var PAL_ITEMS = [
    { label: "Analyst Profile", hint: "section", run: goSection("#about") },
    { label: "Case Files", hint: "section", run: goSection("#cases") },
    { label: "The Lab", hint: "section", run: goSection("#lab") },
    { label: "Detection Coverage", hint: "section", run: goSection("#coverage") },
    { label: "Contact", hint: "section", run: goSection("#contact") },
    { label: "Sift — alert triage & learning system", hint: "github ↗", run: goUrl("https://github.com/saiz123/Sift") },
    { label: "RefractIQ — live demo", hint: "demo ↗", run: goUrl("https://saiz123.github.io/RefractIQ/") },
    { label: "RefractIQ — source", hint: "github ↗", run: goUrl("https://github.com/saiz123/RefractIQ") },
    { label: "Healthcare Risk Prediction", hint: "github ↗", run: goUrl("https://github.com/saiz123/MRP_PROJECT") },
    { label: "Splunk Log Analysis Labs", hint: "github ↗", run: goUrl("https://github.com/saiz123/Splunk-Projects-For-Beginners") },
    { label: "JobScraperApp", hint: "github ↗", run: goUrl("https://github.com/saiz123/JobScraperApp") },
    { label: "All repositories", hint: "github ↗", run: goUrl("https://github.com/saiz123?tab=repositories") },
    { label: "LinkedIn", hint: "profile ↗", run: goUrl("https://www.linkedin.com/in/sai-teja-kavuri-cyber/") },
    { label: "Email Sai", hint: "action", run: function () { window.location.href = "mailto:" + EMAIL; } },
    { label: "Copy email address", hint: "action", run: function () { copyEmail(); } },
    { label: "Open terminal", hint: "action", run: function () { setTimeout(openTerminal, 50); } },
    { label: "Cycle console theme", hint: "action", run: cycleTheme }
  ];

  function fuzzyScore(query, label) {
    var q = query.toLowerCase(), l = label.toLowerCase();
    if (!q) return 0;
    var qi = 0, score = 0;
    for (var li = 0; li < l.length && qi < q.length; li++) {
      if (l[li] === q[qi]) { score += li; qi++; }
    }
    return qi === q.length ? score : -1;
  }

  function palRender() {
    var q = palInput.value.trim();
    palResults = PAL_ITEMS
      .map(function (item) { return { item: item, s: fuzzyScore(q, item.label) }; })
      .filter(function (r) { return r.s >= 0; })
      .sort(function (a, b) { return a.s - b.s; })
      .map(function (r) { return r.item; });
    palSel = 0;
    if (!palResults.length) {
      palList.innerHTML = '<li class="pal-empty">no matches — try "sift" or "contact"</li>';
      return;
    }
    palList.innerHTML = palResults.map(function (item, i) {
      return '<li role="option"' + (i === palSel ? ' class="sel" aria-selected="true"' : "") + ">" +
        "<span>" + escapeHtml(item.label) + "</span>" +
        '<span class="pal-hint">' + escapeHtml(item.hint) + "</span></li>";
    }).join("");
    Array.prototype.forEach.call(palList.children, function (li, i) {
      li.addEventListener("click", function () { palRun(i); });
      li.addEventListener("pointermove", function () { palSelect(i); });
    });
  }
  function palSelect(i) {
    if (!palResults.length) return;
    palSel = (i + palResults.length) % palResults.length;
    Array.prototype.forEach.call(palList.children, function (li, idx) {
      li.classList.toggle("sel", idx === palSel);
      li.setAttribute("aria-selected", String(idx === palSel));
    });
    var el = palList.children[palSel];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }
  function palRun(i) {
    var item = palResults[i];
    closePalette();
    if (item) item.run();
  }
  function openPalette() {
    closeTerminal();
    palOverlay.hidden = false;
    palInput.value = "";
    palRender();
    palInput.focus();
  }
  function closePalette() {
    palOverlay.hidden = true;
  }

  document.getElementById("openPalette").addEventListener("click", openPalette);
  palOverlay.addEventListener("click", function (e) {
    if (e.target === palOverlay) closePalette();
  });
  palInput.addEventListener("input", palRender);
  palInput.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); palSelect(palSel + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); palSelect(palSel - 1); }
    else if (e.key === "Enter") { e.preventDefault(); palRun(palSel); }
  });

  /* ---------- interactive terminal ---------- */
  var overlay = document.getElementById("termOverlay");
  var termOut = document.getElementById("termOut");
  var termInput = document.getElementById("termInput");
  var termScroll = document.getElementById("termScroll");
  var history = [];
  var histIdx = -1;
  try {
    history = JSON.parse(sessionStorage.getItem("stk-hist") || "[]");
    histIdx = history.length;
  } catch (err) { /* ignore */ }

  var FILES = {
    "about.txt":
      "Sai Teja Kavuri — security engineer, St. Louis, MO.\n" +
      "Met security through a homelab that wouldn’t stop paging me.\n" +
      "Built Sift so it would page me less — and smarter.\n" +
      "M.S. Information Systems. Pen-testing on offense, detection on defense.",
    "flag.txt": "CTF{n1c3_try_but_th3_r34l_fl4g_1s_4_j0b_0ff3r}"
  };

  var COMMANDS = {
    help: function () {
      return [
        "available commands:",
        "  whoami        who is this guy",
        "  projects      list case files",
        "  skills        detection coverage summary",
        "  lab           homelab pipeline",
        "  contact       open a channel",
        "  scan          port-scan this site",
        "  neofetch      profile card",
        "  theme <name>  viridian · amber · redteam",
        "  ls            list files",
        "  cat <file>    read a file",
        "  sift          about the flagship project",
        "  sudo hire-me  escalate privileges",
        "  history       command history",
        "  clear         clear screen",
        "  exit          close terminal",
        "",
        "tip: tab completes commands"
      ].join("\n");
    },
    whoami: function () {
      return ok("sai teja kavuri") + " — security engineer · builder of Sift · M.S. Information Systems · St. Louis, MO.\nRuns a self-hosted SOC for fun. Yes, for fun.";
    },
    projects: function () {
      return [
        ok("CASE-001") + "  Sift        — explainable alert triage that learns from analysts",
        ok("CASE-002") + "  RefractIQ   — multi-model AI build orchestrator (TypeScript)",
        ok("CASE-003") + "  MRP         — healthcare risk prediction, HIPAA-aware",
        ok("CASE-004") + "  Splunk labs — SIEM reps: parsing, hunting, dashboards",
        ok("CASE-005") + "  JobScraper  — automation for the job hunt",
        "",
        "full locker: " + accent("https://github.com/saiz123")
      ].join("\n");
    },
    skills: function () {
      return [
        "ops      : splunk · wazuh · suricata · alert triage · threat intel",
        "offense  : penetration testing · kali linux",
        "code     : python · typescript · react · sqlite",
        "infra    : docker · terraform · gcp · linux · self-hosting",
        "gov      : nist csf · hipaa · secure sdlc"
      ].join("\n");
    },
    lab: function () {
      return "sensors (suricata/osquery) ⟶ wazuh SIEM ⟶ " + ok("sift") + " ⟶ slack/discord\nself-hosted · dockerized · fed by free threat-intel · pages me only when it matters";
    },
    contact: function () {
      return [
        "email    : " + accent("saitejakavuri39@gmail.com"),
        "github   : " + accent("https://github.com/saiz123"),
        "linkedin : " + accent("https://www.linkedin.com/in/sai-teja-kavuri-cyber/")
      ].join("\n");
    },
    scan: function () {
      return [
        "Starting stk-map 3.0 ( https://saitejakavuri.com )",
        "PORT      STATE     SERVICE",
        "22/tcp    filtered  ssh          " + '<span class="t-dim">(nice try)</span>',
        "443/tcp   " + ok("open") + "      https        portfolio v3",
        "8080/tcp  " + ok("open") + "      sift-api     triage receipts available",
        "9200/tcp  filtered  wazuh        agents reporting privately",
        "",
        ok("1 open role detected:") + " SOC Analyst / Security Engineer",
        "exploit available: " + accent("mailto:saitejakavuri39@gmail.com")
      ].join("\n");
    },
    neofetch: function () {
      return [
        accent("        ▲          ") + ok("sai") + "@" + ok("stk-console"),
        accent("       ▲ ▲         ") + "----------------",
        accent("      ▲   ▲        ") + "role     : security engineer",
        accent("     ▲ ▲ ▲ ▲       ") + "degree   : M.S. Information Systems",
        accent("    ▲       ▲      ") + "flagship : Sift — explainable alert triage",
        accent("   ▲ ▲     ▲ ▲     ") + "stack    : python · typescript · docker",
        accent("  ▲   ▲   ▲   ▲    ") + "siem     : splunk · wazuh · suricata",
        accent(" ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲   ") + "theme    : " + currentTheme(),
        "                   " + "status   : " + ok("open to work") + " · St. Louis / remote"
      ].join("\n");
    },
    theme: function (args) {
      var name = (args[0] || "").toLowerCase();
      if (!name) return "themes: viridian · amber · redteam\nusage: theme <name>";
      if (THEMES.indexOf(name) === -1) return crit("unknown theme: " + escapeHtml(name));
      applyTheme(name);
      return ok("theme set: " + name);
    },
    history: function () {
      if (!history.length) return "no history yet.";
      return history.map(function (h, i) {
        return "  " + (i + 1) + "  " + escapeHtml(h);
      }).join("\n");
    },
    ls: function () {
      return "about.txt   flag.txt   projects/   lab/";
    },
    clear: function () { termOut.innerHTML = ""; return null; },
    exit: function () { closeTerminal(); return null; },
    sudo: function (args) {
      if (args.join(" ").indexOf("hire-me") !== -1) {
        return [
          "[sudo] password for visitor: ********",
          ok("privilege escalation successful."),
          "",
          "  drafting offer letter...          " + ok("[OK]"),
          "  candidate: Sai Teja Kavuri        " + ok("[VERIFIED]"),
          "  ships tools, not just tickets     " + ok("[CONFIRMED]"),
          "",
          "next step: " + accent("mailto:saitejakavuri39@gmail.com")
        ].join("\n");
      }
      return crit("visitor is not in the sudoers file. this incident will be reported.\n(to sai. who will be delighted.)");
    },
    cat: function (args) {
      var f = args[0];
      if (!f) return "usage: cat <file>";
      if (FILES[f]) return escapeHtml(FILES[f]);
      return crit("cat: " + escapeHtml(f) + ": no such file (nice hunting though)");
    },
    sift: function () {
      return "Sift is a self-hosted alert triage engine: every alert gets an itemized\nreceipt — signals, points, plain-English reasoning — and the system\nrecalibrates noisy rules from analyst verdicts. Pure Python, zero\ndependencies, runs air-gapped. " + accent("github.com/saiz123/Sift");
    }
  };

  function print(html) {
    termOut.innerHTML += html + "\n";
    termScroll.scrollTop = termScroll.scrollHeight;
  }

  function greet() {
    if (termOut.innerHTML !== "") return;
    print(ok("stk-console v3.0") + " — unauthorized access is... encouraged, actually.");
    print('type <span class="t-accent">help</span> to get started.\n');
  }

  function runCommand(raw) {
    var input = raw.trim();
    print('<span class="t-ok">visitor@stk:~$</span> ' + escapeHtml(input));
    if (!input) return;
    var parts = input.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var args = parts.slice(1);
    var fn = COMMANDS[cmd];
    if (fn) {
      var out = fn(args);
      if (out !== null && out !== undefined) print(out + "\n");
    } else {
      print(crit("command not found: " + escapeHtml(cmd)) + ' — try <span class="t-accent">help</span>\n');
    }
  }

  function openTerminal() {
    closePalette();
    overlay.hidden = false;
    greet();
    termInput.focus();
  }
  function closeTerminal() {
    overlay.hidden = true;
  }

  document.getElementById("openTerm").addEventListener("click", openTerminal);
  document.getElementById("closeTerm").addEventListener("click", closeTerminal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeTerminal();
  });

  /* ---------- global keys ---------- */
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (palOverlay.hidden) openPalette(); else closePalette();
      return;
    }
    if (e.key === "`" && overlay.hidden && palOverlay.hidden) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      openTerminal();
    } else if (e.key === "Escape") {
      if (!overlay.hidden) closeTerminal();
      if (!palOverlay.hidden) closePalette();
    }
  });

  termInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var val = termInput.value;
      if (val.trim()) {
        history.push(val);
        histIdx = history.length;
        try { sessionStorage.setItem("stk-hist", JSON.stringify(history.slice(-50))); } catch (err) { /* ignore */ }
      }
      termInput.value = "";
      runCommand(val);
    } else if (e.key === "Tab") {
      e.preventDefault();
      var cur = termInput.value.trim().toLowerCase();
      if (!cur) return;
      var matches = Object.keys(COMMANDS).filter(function (c) { return c.indexOf(cur) === 0; });
      if (matches.length === 1) {
        termInput.value = matches[0] + " ";
      } else if (matches.length > 1) {
        print('<span class="t-dim">' + matches.join("   ") + "</span>");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        termInput.value = history[histIdx];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        termInput.value = history[histIdx];
      } else {
        histIdx = history.length;
        termInput.value = "";
      }
    }
  });
})();
