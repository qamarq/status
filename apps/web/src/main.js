import "./style.css";

/* ───────────── helpers ───────────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const nowS = () => Date.now() / 1000;
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const median = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y),
    m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const plPlural = (n, one, few, many) =>
  n === 1
    ? one
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)
      ? few
      : many;
const isHost = (s) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(s);

const store = (() => {
  try {
    const s = window.localStorage,
      k = "__beacon";
    s.setItem(k, "1");
    s.removeItem(k);
    return s;
  } catch {
    return null;
  }
})();
const load = (k, d) => {
  try {
    const v = store && store.getItem("beacon." + k);
    return v == null ? d : JSON.parse(v);
  } catch {
    return d;
  }
};
const save = (k, v) => {
  try {
    store && store.setItem("beacon." + k, JSON.stringify(v));
  } catch {
    /* ignore */
  }
};

/* ───────────── config ───────────── */
const WINDOWS = {
  hour: { secs: 3600, buckets: 60, mbuckets: 60, refresh: 30 },
  day: { secs: 86400, buckets: 96, mbuckets: 48, refresh: 300 },
  month: { secs: 2592000, buckets: 90, mbuckets: 45, refresh: 1800 },
};
const CURRENT_EVERY = 30;
const mqMobile = matchMedia("(max-width: 640px)");
const mqLight = matchMedia("(prefers-color-scheme: light)");
const nBuckets = (w) =>
  mqMobile.matches ? WINDOWS[w].mbuckets : WINDOWS[w].buckets;
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/* ───────────── i18n ───────────── */
const I18N = {
  pl: {
    refreshIn: (s) => `odświeżenie za ${s} s`,
    refreshing: "odświeżam…",
    paused: "wstrzymane w tle",
    refresh: "Odśwież teraz (R)",
    theme: "Zmień motyw (T)",
    langOther: "EN",
    h_noconfig: "Nie udało się wczytać konfiguracji",
    d_noconfig: "Brak pliku locations.json. Odśwież stronę za chwilę.",
    h_loading: "Sprawdzam źródła…",
    h_unavail: "Brak danych ze źródeł",
    h_ok: "Wszystko działa",
    h_down: (d) =>
      `${d} ${plPlural(d, "usługa nie działa", "usługi nie działają", "usług nie działa")}`,
    h_mixed: "Część źródeł widzi błędy",
    h_incomplete: "Część danych jest nieaktualna",
    d_ok: (n) =>
      `${n} ${plPlural(n, "usługa odpowiada", "usługi odpowiadają", "usług odpowiada")} w każdym źródle, które ${n === 1 ? "ją" : "je"} sprawdza.`,
    d_down: (l) => `Nie odpowiada w żadnym źródle: <b>${l}</b>.`,
    d_partial: (l) => `Błędy tylko w części źródeł: <b>${l}</b>.`,
    d_unknown: (l) => `Brak świeżych danych: ${l}.`,
    d_unreach: (l) => `Brak połączenia ze źródłem ${l}.`,
    checkedAgo: "sprawdzono",
    f_online: "online",
    f_uptime: (w) => `dostępność (${I18N.pl.win[w]})`,
    f_latency: "mediana odpowiedzi",
    f_inc: "zdarzenia (24 h)",
    f_ongoing: (n) => `${n} trwa`,
    srcs: "Źródła",
    srcs_note: "każde sprawdza usługi niezależnie",
    src_ok: "osiągalne",
    src_down: "brak połączenia",
    src_conn: "łączenie…",
    src_partial: "widzi błędy",
    src_count: "usługi",
    src_median: "mediana",
    src_cov: "odebrane kontrole (24 h)",
    src_data: "dane",
    services: "Usługi",
    search: "Szukaj usług",
    f_all: "Wszystkie",
    f_issues: "Problemy",
    f_public: "Publiczne",
    f_vpn: "VPN",
    expand_all: "Rozwiń grupy",
    collapse_all: "Zwiń grupy",
    st_healthy: "Działa",
    st_degraded: "Zakłócenia",
    st_partial: "Częściowo",
    st_down: "Nie działa",
    st_unknown: "Brak danych",
    st_connecting: "Łączenie…",
    g_ok: "wszystko działa",
    g_issues: (k, n) => `${k} z ${n} z problemami`,
    g_unknown: "brak danych",
    col_src: "źródło",
    col_hist: (w) => `historia (${I18N.pl.win[w]})`,
    col_lat: "odpowiedź",
    col_ok: "skuteczność",
    col_ago: "sprawdzono",
    cov_title: (c) => `odebrane kontrole: ${c}`,
    missing: "nie sprawdza tej usługi",
    missing_vpn: "nie sprawdza tej usługi (tylko w VPN)",
    src_unreach_row: "brak połączenia ze źródłem, dane mogą być nieaktualne",
    copy: "kopiuj link",
    copied: "skopiowano",
    open_title: "Otwórz usługę",
    checks: (ok, n) => `${ok} z ${n} kontroli OK`,
    no_data: "brak danych w tym przedziale",
    http: (c) => `HTTP ${c}`,
    timeout: "brak odpowiedzi",
    inc_title: "Zdarzenia z ostatnich 24 h",
    inc_note: "na podstawie historii każdego źródła",
    inc_none: "Brak błędów w ostatnich 24 godzinach.",
    inc_ongoing: "trwa",
    inc_since: (t) => `od ${t}`,
    inc_fail: (f, n) => `${f}/${n} nieudanych`,
    inc_more: (n) => `Pokaż wszystkie (${n})`,
    inc_less: "Pokaż mniej",
    inc_loading: "Wczytuję historię…",
    results: (k, n) =>
      k === n
        ? `${n} ${plPlural(n, "usługa", "usługi", "usług")}`
        : `${k} z ${n}`,
    empty: "Żadna usługa nie pasuje do filtrów.",
    clear: "Wyczyść",
    demo: "Podgląd na danych przykładowych. Na status.kamilmarczak.pl strona czyta API Beacon na żywo.",
    demo_outage: "Pokaż awarię",
    demo_normal: "Pokaż normalny stan",
    kb: "/ szukaj · 1 2 3 okno · R odśwież",
    win: { hour: "1 h", day: "24 h", month: "30 dni" },
    ungrouped: "Pozostałe",
  },
  en: {
    refreshIn: (s) => `refresh in ${s}s`,
    refreshing: "refreshing…",
    paused: "paused in background",
    refresh: "Refresh now (R)",
    theme: "Toggle theme (T)",
    langOther: "PL",
    h_noconfig: "Could not load the configuration",
    d_noconfig: "locations.json is missing. Try again in a moment.",
    h_loading: "Checking sources…",
    h_unavail: "No data from sources",
    h_ok: "Everything is up",
    h_down: (d) => `${d} ${d === 1 ? "service is" : "services are"} down`,
    h_mixed: "Some sources see failures",
    h_incomplete: "Some data is stale",
    d_ok: (n) =>
      `${n} ${n === 1 ? "service responds" : "services respond"} from every source that checks ${n === 1 ? "it" : "them"}.`,
    d_down: (l) => `Not responding from any source: <b>${l}</b>.`,
    d_partial: (l) => `Failing from some sources only: <b>${l}</b>.`,
    d_unknown: (l) => `No fresh data: ${l}.`,
    d_unreach: (l) => `Can't reach source ${l}.`,
    checkedAgo: "checked",
    f_online: "online",
    f_uptime: (w) => `uptime (${I18N.en.win[w]})`,
    f_latency: "median response",
    f_inc: "incidents (24 h)",
    f_ongoing: (n) => `${n} ongoing`,
    srcs: "Sources",
    srcs_note: "each one checks services independently",
    src_ok: "reachable",
    src_down: "unreachable",
    src_conn: "connecting…",
    src_partial: "seeing failures",
    src_count: "services",
    src_median: "median",
    src_cov: "checks received (24 h)",
    src_data: "data",
    services: "Services",
    search: "Search services",
    f_all: "All",
    f_issues: "Issues",
    f_public: "Public",
    f_vpn: "VPN",
    expand_all: "Expand groups",
    collapse_all: "Collapse groups",
    st_healthy: "Up",
    st_degraded: "Degraded",
    st_partial: "Partial",
    st_down: "Down",
    st_unknown: "No data",
    st_connecting: "Connecting…",
    g_ok: "all up",
    g_issues: (k, n) => `${k} of ${n} with issues`,
    g_unknown: "no data",
    col_src: "source",
    col_hist: (w) => `history (${I18N.en.win[w]})`,
    col_lat: "response",
    col_ok: "success",
    col_ago: "checked",
    cov_title: (c) => `checks received: ${c}`,
    missing: "does not check this service",
    missing_vpn: "does not check this service (VPN only)",
    src_unreach_row: "source unreachable, data may be stale",
    copy: "copy link",
    copied: "copied",
    open_title: "Open service",
    checks: (ok, n) => `${ok} of ${n} checks OK`,
    no_data: "no data in this range",
    http: (c) => `HTTP ${c}`,
    timeout: "no response",
    inc_title: "Incidents in the last 24 h",
    inc_note: "from each source’s history",
    inc_none: "No failures in the last 24 hours.",
    inc_ongoing: "ongoing",
    inc_since: (t) => `since ${t}`,
    inc_fail: (f, n) => `${f}/${n} failed`,
    inc_more: (n) => `Show all (${n})`,
    inc_less: "Show less",
    inc_loading: "Loading history…",
    results: (k, n) =>
      k === n ? `${n} ${n === 1 ? "service" : "services"}` : `${k} of ${n}`,
    empty: "No services match the filters.",
    clear: "Clear",
    demo: "Preview with sample data. On status.kamilmarczak.pl the page reads the Beacon API live.",
    demo_outage: "Show an outage",
    demo_normal: "Show normal state",
    kb: "/ search · 1 2 3 window · R refresh",
    win: { hour: "1 h", day: "24 h", month: "30 d" },
    ungrouped: "Other",
  },
};
const L = (k, ...a) => {
  const d = I18N[S.lang] || I18N.pl;
  const v = d[k] ?? I18N.pl[k];
  return typeof v === "function" ? v(...a) : (v ?? k);
};

/* ───────────── state ───────────── */
const params = new URLSearchParams(location.search);
const S = {
  title: "Status",
  locations: [],
  demo: null,
  win: WINDOWS[params.get("window")]
    ? params.get("window")
    : load("win", "day"),
  filter: load("filter", "all"),
  view: load("view", "groups"),
  q: params.get("q") || "",
  collapsed: new Set(load("collapsed", [])),
  expanded: new Set(params.get("q") ? [] : []),
  lang: load(
    "lang",
    (navigator.language || "pl").toLowerCase().startsWith("pl") ? "pl" : "en",
  ),
  theme: load("theme", "auto"),
  lastRefresh: 0,
  nextRefresh: 0,
  refreshing: false,
  incAll: false,
  model: null,
  barCache: new Map(),
};
if (!WINDOWS[S.win]) S.win = "day";

/* ───────────── formatting ───────────── */
const fmtMs = (s) =>
  s == null
    ? "—"
    : s < 1
      ? `${Math.max(1, Math.round(s * 1000))} ms`
      : `${s.toFixed(s < 10 ? 2 : 1)} s`;
const fmtUp = (u) =>
  u == null
    ? "—"
    : u >= 1
      ? "100%"
      : `${(Math.floor(u * 10000) / 100).toFixed(2)}%`;
const upClass = (u) =>
  u == null ? "" : u >= 0.999 ? "" : u >= 0.98 ? "u-warn" : "u-bad";
const locale = () => (S.lang === "pl" ? "pl-PL" : "en-GB");
const fmtTime = (ts, date) =>
  new Intl.DateTimeFormat(locale(), {
    hour: "2-digit",
    minute: "2-digit",
    ...(date ? { day: "numeric", month: "short" } : {}),
  }).format(ts * 1000);
const fmtRange = (a, b, size) => {
  const sameDay =
    new Date(a * 1000).toDateString() === new Date(b * 1000).toDateString();
  const withDate = size >= 3600 || !sameDay || nowS() - a > 86400;
  return `${fmtTime(a, withDate)} – ${sameDay && withDate ? fmtTime(b, false) : fmtTime(b, withDate)}`;
};
const fmtDur = (s) => {
  s = Math.max(0, Math.round(s));
  if (s < 60) return `${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60),
    r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
};
const ago = (ts) => {
  const d = Math.max(0, nowS() - ts),
    rtf = new Intl.RelativeTimeFormat(locale(), {
      numeric: "auto",
      style: "short",
    });
  if (d < 5) return S.lang === "pl" ? "przed chwilą" : "just now";
  if (d < 60) return rtf.format(-Math.round(d), "second");
  if (d < 3600) return rtf.format(-Math.round(d / 60), "minute");
  if (d < 86400) return rtf.format(-Math.round(d / 3600), "hour");
  return rtf.format(-Math.round(d / 86400), "day");
};
const listFmt = (a) => {
  try {
    return new Intl.ListFormat(S.lang, { type: "conjunction" }).format(a);
  } catch {
    return a.join(", ");
  }
};

/* ───────────── data access ───────────── */
async function getJSON(url, timeout = 10000) {
  const ctl = new AbortController(),
    t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctl.signal, cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } catch (e) {
    throw new Error(
      e.name === "AbortError" ? "timeout" : e.message || String(e),
    );
  } finally {
    clearTimeout(t);
  }
}
const api = (loc, path) =>
  S.demo
    ? DEMO.get(loc, path)
    : getJSON(loc.url.replace(/\/+$/, "") + "/v1/" + path);

function services() {
  const map = new Map(),
    hidden = new Set();
  for (const loc of S.locations)
    for (const s of loc.current?.services || []) {
      if (s.hidden) hidden.add(s.id);
      const o = map.get(s.id);
      if (!o) map.set(s.id, { ...s, labels: { ...(s.labels || {}) } });
      else {
        if (s.requires_vpn) o.requires_vpn = true;
        if (!o.labels.group && s.labels?.group) o.labels.group = s.labels.group;
      }
    }
  return [...map.values()]
    .filter((s) => !hidden.has(s.id))
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name, S.lang) || a.id.localeCompare(b.id),
    );
}

/* same freshness rules as the original Beacon UI */
function locStatus(loc, id, t = nowS()) {
  const c = loc.current;
  if (!c) return null;
  const e = c.services.find((s) => s.id === id);
  if (!e) return null;
  if (loc.reachable === false) return { status: "unknown", entry: e };
  const stale =
    c.generated_at > t + 5 ||
    t >= c.expires_at ||
    e.observed_at == null ||
    e.observed_at > t + 5 ||
    e.expires_at == null ||
    t >= e.expires_at;
  return { status: stale ? "unknown" : e.status, entry: e };
}

function bucketsFor(loc, id, w, start, size, n) {
  const h = loc.hist[w];
  if (!h) return null;
  const s = h.services?.find((x) => x.id === id);
  if (!s) return null;
  const b = Array.from({ length: n }, () => ({ ok: 0, fail: 0 }));
  if (Array.isArray(s.probes)) {
    for (const p of s.probes) {
      const i = Math.floor((p.at - start) / size);
      if (i < 0 || i >= n) continue;
      if (p.success) b[i].ok++;
      else {
        b[i].fail++;
        (b[i].codes ||= []).push(p.http_status_code);
      }
    }
  } else {
    for (const g of s.segments || []) {
      if (!g.samples) continue;
      const fails =
        g.state === "down" && !g.failures ? g.samples : g.failures || 0;
      const oks = Math.max(0, g.samples - fails),
        len = Math.max(1, g.end - g.start);
      const i0 = Math.max(0, Math.floor((g.start - start) / size)),
        i1 = Math.min(n - 1, Math.floor((g.end - start - 1e-6) / size));
      for (let i = i0; i <= i1; i++) {
        const bs = start + i * size,
          ov = Math.min(bs + size, g.end) - Math.max(bs, g.start);
        if (ov <= 0) continue;
        const f = ov / len;
        b[i].ok += oks * f;
        b[i].fail += fails * f;
      }
    }
  }
  return b;
}
function mergeBuckets(arrs) {
  arrs = arrs.filter(Boolean);
  if (!arrs.length) return null;
  return arrs[0].map((_, i) =>
    arrs.reduce((a, b) => ({ ok: a.ok + b[i].ok, fail: a.fail + b[i].fail }), {
      ok: 0,
      fail: 0,
    }),
  );
}
function downsample(b, m) {
  if (!b || b.length <= m) return b;
  const out = Array.from({ length: m }, () => ({ ok: 0, fail: 0 }));
  b.forEach((x, i) => {
    const j = Math.floor((i * m) / b.length);
    out[j].ok += x.ok;
    out[j].fail += x.fail;
  });
  return out;
}
const bState = (b) => {
  if (!b) return "unknown";
  const n = b.ok + b.fail;
  if (n < 0.5) return "unknown";
  if (b.fail < 0.05 || b.fail / n < 0.001) return "healthy";
  return b.fail / n >= 0.5 ? "down" : "degraded";
};
const uptime = (b) => {
  if (!b) return null;
  let ok = 0,
    f = 0;
  for (const x of b) {
    ok += x.ok;
    f += x.fail;
  }
  return ok + f < 0.5 ? null : ok / (ok + f);
};

function incidents() {
  const t = nowS(),
    cut = t - 86400,
    raw = [];
  for (const loc of S.locations) {
    const h = loc.hist.day;
    if (!h) continue;
    for (const s of h.services || []) {
      if (s.hidden) continue;
      for (const g of s.segments || []) {
        const fails =
          g.state === "down" && !g.failures ? g.samples : g.failures || 0;
        if (!(fails > 0) || g.end < cut) continue;
        raw.push({
          id: s.id,
          name: s.name,
          locs: [loc.name],
          locIds: [loc.id],
          start: Math.max(g.start, cut),
          end: g.end,
          fail: Math.round(fails),
          samples: Math.round(g.samples),
          genAt: h.generated_at,
        });
      }
    }
  }
  // currently failing checks not yet in history
  for (const loc of S.locations)
    for (const e of loc.current?.services || []) {
      const ls = locStatus(loc, e.id, t);
      if (
        ls?.status === "down" &&
        !e.hidden &&
        !raw.some(
          (r) =>
            r.id === e.id && r.locIds[0] === loc.id && r.end >= r.genAt - 180,
        )
      )
        raw.push({
          id: e.id,
          name: e.name,
          locs: [loc.name],
          locIds: [loc.id],
          start: e.observed_at,
          end: t,
          fail: 1,
          samples: 1,
          genAt: t,
        });
    }
  raw.sort(
    (a, b) =>
      a.id.localeCompare(b.id) ||
      a.locIds[0].localeCompare(b.locIds[0]) ||
      a.start - b.start,
  );
  const perLoc = [];
  for (const e of raw) {
    const p = perLoc[perLoc.length - 1];
    if (
      p &&
      p.id === e.id &&
      p.locIds[0] === e.locIds[0] &&
      e.start - p.end <= 300
    ) {
      p.end = Math.max(p.end, e.end);
      p.fail += e.fail;
      p.samples += e.samples;
      p.genAt = Math.max(p.genAt, e.genAt);
    } else perLoc.push({ ...e });
  }
  for (const m of perLoc) {
    const loc = S.locations.find((l) => l.id === m.locIds[0]);
    const ls = loc && locStatus(loc, m.id, t);
    m.ongoing = !!(ls && ls.status === "down" && m.end >= m.genAt - 180);
    if (m.ongoing) m.end = t;
  }
  // merge the same service across locations when time ranges overlap
  perLoc.sort((a, b) => a.id.localeCompare(b.id) || a.start - b.start);
  const out = [];
  for (const e of perLoc) {
    const p = out[out.length - 1];
    if (p && p.id === e.id && e.start <= p.end + 300) {
      p.end = Math.max(p.end, e.end);
      p.start = Math.min(p.start, e.start);
      p.fail += e.fail;
      p.samples += e.samples;
      p.ongoing = p.ongoing || e.ongoing;
      for (const [i, l] of e.locIds.entries())
        if (!p.locIds.includes(l)) {
          p.locIds.push(l);
          p.locs.push(e.locs[i]);
        }
    } else out.push({ ...e, locs: [...e.locs], locIds: [...e.locIds] });
  }
  return out.sort((a, b) => b.ongoing - a.ongoing || b.end - a.end);
}

function buildModel() {
  const t = nowS(),
    w = S.win,
    W = WINDOWS[w],
    n = nBuckets(w),
    size = W.secs / n,
    start = t - W.secs;
  const svcs = services().map((s) => {
    const per = S.locations
      .map((loc) => {
        const ls = locStatus(loc, s.id, t);
        if (!ls) return null;
        const hs = loc.hist[w]?.services?.find((x) => x.id === s.id);
        return {
          loc,
          status: ls.status,
          entry: ls.entry,
          buckets: bucketsFor(loc, s.id, w, start, size, n),
          success: hs?.observed_success_ratio ?? null,
          coverage: hs?.coverage ?? null,
        };
      })
      .filter(Boolean);
    const known = per.filter((p) => p.status !== "unknown");
    const down = known.filter((p) => p.status === "down").length,
      ok = known.length - down;
    const state = !known.length
      ? "unknown"
      : down && ok
        ? "partial"
        : down
          ? "down"
          : "healthy";
    const merged = mergeBuckets(per.map((p) => p.buckets));
    const lat = median(
      per
        .filter(
          (p) => p.status === "healthy" && p.entry.duration_seconds != null,
        )
        .map((p) => p.entry.duration_seconds),
    );
    const missing = S.locations.filter(
      (l) => l.current && !per.some((p) => p.loc === l),
    );
    return {
      ...s,
      group: s.labels?.group || L("ungrouped"),
      per,
      state,
      merged,
      up: uptime(merged),
      lat,
      missing,
      issues:
        state !== "healthy" ||
        (merged ? uptime(merged) != null && uptime(merged) < 0.999 : false),
    };
  });
  return { svcs, t, w, n, size, start, inc: incidents() };
}

/* ───────────── rendering ───────────── */
const FAV = {
  healthy: "#5ccf8d",
  partial: "#e7b04b",
  down: "#ef5f67",
  unknown: "#7f8794",
};

function barHTML(buckets, key, n, meta) {
  if (!buckets)
    return `<div class="bar loading" aria-hidden="true">${"<i></i>".repeat(n)}</div>`;
  S.barCache.set(key, meta);
  return `<div class="bar" data-key="${esc(key)}" role="img" aria-label="${esc(fmtUp(uptime(buckets)))}">${buckets.map((b, i) => `<i class="b-${bState(b)}" data-i="${i}"></i>`).join("")}</div>`;
}

function overall(M) {
  const c = { healthy: 0, partial: 0, down: 0, unknown: 0 };
  M.svcs.forEach((s) => c[s.state]++);
  const n = M.svcs.length,
    loading = S.locations.every((l) => l.reachable === null);
  let head, st;
  if (loading) {
    head = L("h_loading");
    st = "unknown";
  } else if (!n || c.unknown === n) {
    head = L("h_unavail");
    st = "unknown";
  } else if (c.healthy === n) {
    head = L("h_ok");
    st = "healthy";
  } else if (c.down > 0) {
    head = L("h_down", c.down);
    st = "down";
  } else if (c.partial > 0) {
    head = L("h_mixed");
    st = "partial";
  } else {
    head = L("h_incomplete");
    st = "unknown";
  }
  return { c, n, loading, head, st };
}

function renderHero(M) {
  const { c, n, loading, head, st } = overall(M);
  $("#summary").className = "summary st-" + st;
  $("#headline").textContent = head;

  const parts = [];
  const downS = M.svcs
    .filter((s) => s.state === "down")
    .map((s) => esc(s.name));
  const partS = M.svcs
    .filter((s) => s.state === "partial")
    .map(
      (s) =>
        `${esc(s.name)} (${esc(
          s.per
            .filter((p) => p.status === "down")
            .map((p) => p.loc.name)
            .join(", "),
        )})`,
    );
  const unkS = M.svcs
    .filter((s) => s.state === "unknown")
    .map((s) => esc(s.name));
  const unreach = S.locations
    .filter((l) => l.reachable === false)
    .map((l) => esc(l.name));
  if (st === "healthy")
    parts.push(
      esc(L("d_ok", n, S.locations.filter((l) => l.reachable).length)),
    );
  if (downS.length) parts.push(L("d_down", listFmt(downS)));
  if (partS.length) parts.push(L("d_partial", listFmt(partS)));
  if (unkS.length && !loading && unkS.length < n)
    parts.push(L("d_unknown", listFmt(unkS)));
  if (unreach.length) parts.push(L("d_unreach", listFmt(unreach)));
  $("#lede").innerHTML = parts.join(" ");
  $("#sumWhen").innerHTML = S.lastRefresh
    ? `${esc(L("checkedAgo"))} <span data-ago="${S.lastRefresh}"></span>`
    : "";

  $("#mark").className = "dot st-" + st;
  $("#favicon").href =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="${FAV[st]}"/></svg>`,
    );
  const bad = c.down + c.partial;
  document.title = (bad && !loading ? `(${bad}) ` : "") + S.title;

  if (loading) {
    $("#facts").innerHTML = '<span class="skel" style="width:280px"></span>';
    return;
  }
  const allUp = uptime(mergeBuckets(M.svcs.map((s) => s.merged)));
  const lats = M.svcs.flatMap((s) =>
    s.per
      .filter((p) => p.status === "healthy" && p.entry.duration_seconds != null)
      .map((p) => p.entry.duration_seconds),
  );
  const ongoing = M.inc.filter((i) => i.ongoing).length;
  const dayLoaded = S.locations.some((l) => l.hist.day);
  $("#facts").innerHTML = [
    `<span><b class="${bad ? "u-warn" : ""}">${c.healthy}/${n}</b> ${esc(L("f_online"))}</span>`,
    `<span>${esc(L("f_uptime", S.win))} <b class="${upClass(allUp)}">${esc(fmtUp(allUp))}</b></span>`,
    `<span>${esc(L("f_latency"))} <b>${esc(fmtMs(median(lats)))}</b></span>`,
    `<span>${esc(L("f_inc"))} <b class="${ongoing ? "u-bad" : ""}">${dayLoaded ? M.inc.length : "—"}</b>${ongoing ? ` <span class="u-bad">(${esc(L("f_ongoing", ongoing))})</span>` : ""}</span>`,
  ].join("");
}

function renderSrcs(M) {
  const t = M.t;
  $("#srcs").innerHTML = S.locations
    .map((loc) => {
      const rep = (loc.current?.services || []).filter((s) => !s.hidden);
      let ok = 0,
        down = 0;
      const lats = [];
      for (const s of rep) {
        const ls = locStatus(loc, s.id, t);
        if (ls.status === "healthy") {
          ok++;
          if (s.duration_seconds != null) lats.push(s.duration_seconds);
        } else if (ls.status === "down") down++;
      }
      const st =
        loc.reachable === null
          ? "connecting"
          : loc.reachable === false
            ? "down"
            : down
              ? "partial"
              : ok
                ? "healthy"
                : "unknown";
      const label = {
        connecting: L("src_conn"),
        down: L("src_down"),
        partial: L("src_partial"),
        healthy: L("src_ok"),
        unknown: L("st_unknown"),
      }[st];
      const cov = loc.hist.day
        ? avg(
            loc.hist.day.services
              .filter((s) => !s.hidden)
              .map((s) => s.coverage ?? 0),
          )
        : null;
      const sk = '<span class="skel"></span>';
      return `<div class="src st-${st}">
      <div class="src-h"><span class="dot"></span><span class="src-name">${esc(loc.name)}</span><span class="src-st">${esc(label)}</span></div>
      <div class="src-l">${esc(L("src_count"))} <b>${loc.reachable === null ? sk : rep.length ? `${ok}/${rep.length}` : "—"}</b> · ${esc(L("src_median"))} <b>${esc(fmtMs(median(lats)))}</b></div>
      <div class="src-l">${esc(L("src_cov"))} <b>${cov == null ? "—" : fmtUp(cov)}</b></div>
      ${
        loc.reachable === false
          ? `<div class="src-err" title="${esc(loc.error)}">${esc(loc.error || L("src_down"))}</div>`
          : `<div class="src-l">${esc(L("src_data"))} ${loc.current ? `<span data-ago="${loc.current.generated_at}"></span>` : "—"}</div>`
      }
    </div>`;
    })
    .join("");
}

function matches(s) {
  if (S.filter === "issues" && !s.issues) return false;
  if (S.filter === "public" && s.requires_vpn) return false;
  if (S.filter === "vpn" && !s.requires_vpn) return false;
  const q = S.q.trim().toLowerCase();
  if (!q) return true;
  return q
    .split(/\s+/)
    .every((tok) =>
      `${s.name} ${s.id} ${s.group} ${s.requires_vpn ? "vpn" : ""} ${s.per.map((p) => p.loc.name).join(" ")}`
        .toLowerCase()
        .includes(tok),
    );
}

function renderChips(M) {
  const cnt = {
    all: M.svcs.length,
    issues: M.svcs.filter((s) => s.issues).length,
    public: M.svcs.filter((s) => !s.requires_vpn).length,
    vpn: M.svcs.filter((s) => s.requires_vpn).length,
  };
  $("#chips").innerHTML = ["all", "issues", "public", "vpn"]
    .filter((f) => f === "all" || f === "issues" || cnt[f] > 0)
    .map(
      (f) =>
        `<button data-act="filter" data-filter="${f}" aria-pressed="${S.filter === f}">${esc(L("f_" + f))}<span class="n${f === "issues" && cnt.issues ? " bad" : ""}">${cnt[f]}</span></button>`,
    )
    .join("");
  $$("#winSeg button").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.win === S.win)),
  );
  $("#toggleAll").textContent = L(
    S.collapsed.size ? "expand_all" : "collapse_all",
  );
  $("#cols").innerHTML =
    `<span></span><span>${esc(L("col_src"))}</span><span>${esc(L("col_hist", S.win))}</span><span class="r">${esc(L("col_lat"))}</span><span class="r">${esc(L("col_ok"))}</span><span class="r">${esc(L("col_ago"))}</span>`;
}

function sourceRow(s, loc, M) {
  const p = s.per.find((x) => x.loc === loc);
  if (!p) {
    if (!loc.current) return "";
    return `<div class="row missing st-missing"><span class="dot"></span><span class="r-name">${esc(loc.name)}</span><span class="r-note">${esc(L(s.requires_vpn ? "missing_vpn" : "missing"))}</span></div>`;
  }
  const e = p.entry,
    key = `src:${s.id}:${loc.id}`;
  const success = p.coverage ? p.success : p.buckets ? uptime(p.buckets) : null;
  const covTxt = p.coverage == null ? "—" : fmtUp(p.coverage);
  const lat =
    loc.reachable === false
      ? "—"
      : p.status === "down"
        ? L("st_down")
        : fmtMs(e.duration_seconds);
  return `<div class="row st-${p.status}"${loc.reachable === false ? ` title="${esc(L("src_unreach_row"))}"` : ""}>
    <span class="dot"></span>
    <span class="r-name">${esc(loc.name)}</span>
    ${barHTML(p.buckets, key, M.n, { buckets: p.buckets, start: M.start, size: M.size, loc: loc.name })}
    <span class="r-v r-lat strong">${esc(lat)}</span>
    <span class="r-v ${upClass(success)}" title="${esc(L("cov_title", covTxt))}">${esc(fmtUp(success))}</span>
    <span class="r-v r-ago">${e.observed_at ? `<span data-ago="${e.observed_at}"></span>` : "—"}</span>
  </div>`;
}

function cardHTML(s, M) {
  const host = isHost(s.id)
    ? `<a class="svc-host" href="https://${esc(s.id)}" target="_blank" rel="noopener noreferrer" title="${esc(L("open_title"))}">${esc(s.id)}</a>`
    : `<span class="svc-host">${esc(s.id)}</span>`;
  return `<article class="svc st-${s.state}" data-id="${esc(s.id)}">
    <div class="svc-h">
      <span class="svc-name">${esc(s.name)}</span>${s.requires_vpn ? '<span class="tag">VPN</span>' : ""}${host}
      <span class="svc-r"><span class="svc-st">${esc(L("st_" + s.state))}</span><span class="svc-up ${upClass(s.up)}">${esc(fmtUp(s.up))}</span><button class="copy" data-act="copy" data-id="${esc(s.id)}">${esc(L("copy"))}</button></span>
    </div>
    ${S.locations.map((loc) => sourceRow(s, loc, M)).join("")}
  </article>`;
}

const groupOrder = (a, b) =>
  a.vpn - b.vpn || a.name.localeCompare(b.name, S.lang);
function renderList(M = S.model) {
  if (!M) return;
  hideTip();
  S.barCache.clear();
  const items = M.svcs.filter(matches),
    list = $("#list");
  $("#resultNote").textContent = M.svcs.length
    ? L("results", items.length, M.svcs.length)
    : "";
  $("#cols").style.display = items.length ? "" : "none";
  if (!M.svcs.length) {
    const ph = `<article class="svc"><div class="svc-h"><span class="skel" style="width:140px"></span></div>${S.locations.map(() => `<div class="row"><span></span><span class="skel" style="width:40px"></span><div class="bar loading">${"<i></i>".repeat(M.n)}</div><span></span><span></span><span></span></div>`).join("")}</article>`;
    list.innerHTML = `<div class="group"><div class="group-body">${ph.repeat(3)}</div></div>`;
    return;
  }
  if (!items.length) {
    list.innerHTML = `<div class="empty">${esc(L("empty"))}<button data-act="clear">${esc(L("clear"))}</button></div>`;
    return;
  }
  const groups = new Map();
  for (const s of items) {
    if (!groups.has(s.group)) groups.set(s.group, []);
    groups.get(s.group).push(s);
  }
  const searching = !!S.q.trim();
  list.innerHTML = [...groups.entries()]
    .map(([name, arr]) => ({
      name,
      arr,
      vpn: arr.every((s) => s.requires_vpn) ? 1 : 0,
    }))
    .sort(groupOrder)
    .map(({ name, arr }) => {
      const bad = arr.filter(
        (s) => s.state === "down" || s.state === "partial",
      ).length;
      const gst = arr.some((s) => s.state === "down")
        ? "down"
        : bad
          ? "partial"
          : arr.every((s) => s.state === "unknown")
            ? "unknown"
            : "healthy";
      const collapsed = !searching && S.collapsed.has(name);
      const gu = uptime(mergeBuckets(arr.map((s) => s.merged)));
      const label =
        gst === "healthy"
          ? L("g_ok")
          : gst === "unknown"
            ? L("g_unknown")
            : L("g_issues", bad, arr.length);
      return `<section class="group st-${gst}${collapsed ? " collapsed" : ""}" data-group="${esc(name)}">
      <button class="group-head" data-act="toggle-group" aria-expanded="${!collapsed}">
        <span class="g-tog" aria-hidden="true">▼</span><span class="g-name">${esc(name)}</span><span class="g-count">${arr.length}</span>
        <span class="g-right"><span class="g-state">${esc(label)}</span><span class="g-up num ${upClass(gu)}">${esc(fmtUp(gu))}</span></span>
      </button>
      <div class="group-body">${arr.map((s) => cardHTML(s, M)).join("")}</div>
    </section>`;
    })
    .join("");
}

function renderIncidents(M) {
  const el = $("#incidents");
  if (!S.locations.some((l) => l.hist.day)) {
    el.innerHTML = `<div class="log"><div class="log-empty">${esc(S.locations.every((l) => l.reachable === false) ? L("st_unknown") : L("inc_loading"))}</div></div>`;
    return;
  }
  if (!M.inc.length) {
    el.innerHTML = `<div class="log"><div class="log-empty">${esc(L("inc_none"))}</div></div>`;
    return;
  }
  const LIMIT = 6,
    shown = S.incAll ? M.inc : M.inc.slice(0, LIMIT);
  el.innerHTML = `<div class="log">${shown
    .map(
      (i) => `
    <button class="log-row st-${i.ongoing ? "down" : "degraded"}" data-act="open-svc" data-id="${esc(i.id)}">
      <span class="dot"></span>
      <span class="log-time">${esc(i.ongoing ? L("inc_since", fmtTime(i.start, nowS() - i.start > 43200)) : fmtRange(i.start, i.end, 60))}</span>
      <span class="log-what">${esc(i.name)}<span>${esc(i.locs.join(", "))}</span></span>
      <span class="log-fail">${esc(L("inc_fail", i.fail, Math.max(i.fail, i.samples)))}</span>
      <span class="log-dur">${i.ongoing ? `<em>${esc(L("inc_ongoing"))}</em>` : esc(fmtDur(i.end - i.start))}</span>
    </button>`,
    )
    .join("")}
    ${M.inc.length > LIMIT ? `<button class="log-more" data-act="inc-more">${esc(S.incAll ? L("inc_less") : L("inc_more", M.inc.length))}</button>` : ""}
  </div>`;
}

function updateAgo() {
  $$("[data-ago]").forEach((e) => {
    e.textContent = ago(+e.dataset.ago);
  });
  $("#when").textContent = S.refreshing
    ? L("refreshing")
    : document.hidden
      ? L("paused")
      : S.nextRefresh
        ? L("refreshIn", Math.max(0, Math.ceil(S.nextRefresh - nowS())))
        : "";
}

function render() {
  const M = (S.model = buildModel());
  renderHero(M);
  renderSrcs(M);
  renderChips(M);
  renderList(M);
  renderIncidents(M);
  updateAgo();
}

function applyLang() {
  document.documentElement.lang = S.lang;
  $$("[data-i18n]").forEach((e) => {
    e.textContent = L(e.dataset.i18n);
  });
  $$("[data-i18n-ph]").forEach((e) => {
    e.placeholder = L(e.dataset.i18nPh);
  });
  $$("[data-i18n-title]").forEach((e) => {
    e.title = L(e.dataset.i18nTitle);
    e.setAttribute("aria-label", L(e.dataset.i18nTitle));
  });
  $$("#winSeg button").forEach((b) => {
    b.textContent = L("win")[b.dataset.win];
  });
  $("#langBtn").textContent = L("langOther");
  $("#kbd").textContent = isMac ? "⌘K" : "Ctrl K";
  renderDemo();
}
function renderDemo() {
  const el = $("#demo");
  if (!S.demo) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `<p class="demo">${esc(L("demo"))} <a href="#" data-act="demo-toggle">${esc(L(S.demo === "outage" ? "demo_normal" : "demo_outage"))}</a></p>`;
}
function applyTheme() {
  const t = S.theme === "auto" ? (mqLight.matches ? "light" : "dark") : S.theme;
  document.documentElement.dataset.theme = t;
  $('meta[name="theme-color"]').content = t === "light" ? "#f5f6f8" : "#0c0e12";
}

/* ───────────── refresh loop ───────────── */
async function refresh(force = false) {
  if (S.refreshing) return;
  S.refreshing = true;
  $("#refreshBtn").classList.add("spinning");
  updateAgo();
  const need = new Set(["day", S.win]);
  await Promise.allSettled(
    S.locations.map(async (loc) => {
      try {
        loc.current = await api(loc, "current");
        loc.reachable = true;
        loc.error = null;
      } catch (e) {
        loc.reachable = false;
        loc.error = e.message || String(e);
        return;
      }
      await Promise.allSettled([...need].map((w) => loadHist(loc, w, force)));
    }),
  );
  S.lastRefresh = nowS();
  S.nextRefresh = nowS() + CURRENT_EVERY;
  S.refreshing = false;
  $("#refreshBtn").classList.remove("spinning");
  render();
}
async function loadHist(loc, w, force) {
  const h = loc.hist[w],
    every = h?.refresh_seconds || WINDOWS[w].refresh;
  if (!force && h && nowS() < (loc.histAt[w] || 0) + every) return;
  try {
    loc.hist[w] = await api(loc, "history/" + w);
    loc.histAt[w] = nowS();
  } catch {
    /* keep previous */
  }
}
async function setWin(w) {
  if (!WINDOWS[w] || w === S.win) return;
  S.win = w;
  save("win", w);
  render();
  const missing = S.locations.filter((l) => l.reachable && !l.hist[w]);
  if (missing.length) {
    await Promise.allSettled(missing.map((l) => loadHist(l, w, true)));
    render();
  }
}
function tick() {
  updateAgo();
  if (
    !document.hidden &&
    !S.refreshing &&
    S.nextRefresh &&
    nowS() >= S.nextRefresh
  )
    refresh();
}

/* ───────────── interactions ───────────── */
function openSvc(id) {
  const s = S.model?.svcs.find((x) => x.id === id);
  if (!s) return;
  if (!matches(s)) {
    S.filter = "all";
    S.q = "";
    $("#q").value = "";
    save("filter", "all");
  }
  S.collapsed.delete(s.group);
  save("collapsed", [...S.collapsed]);
  renderChips(S.model);
  renderList();
  updateAgo();
  const el = $(`.svc[data-id="${CSS.escape(id)}"]`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 1500);
  }
}
function copyText(txt) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(txt);
  const ta = document.createElement("textarea");
  ta.value = txt;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    ta.remove();
  }
  return Promise.resolve();
}
function focusSearch() {
  const q = $("#q");
  q.focus();
  q.select();
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-act]");
  if (!a) return;
  const act = a.dataset.act;
  if (act === "win") setWin(a.dataset.win);
  else if (act === "filter") {
    S.filter = a.dataset.filter;
    save("filter", S.filter);
    renderChips(S.model);
    renderList();
    updateAgo();
  } else if (act === "toggle-group") {
    const g = a.closest(".group"),
      name = g.dataset.group,
      collapsed = !g.classList.contains("collapsed");
    collapsed ? S.collapsed.add(name) : S.collapsed.delete(name);
    g.classList.toggle("collapsed", collapsed);
    a.setAttribute("aria-expanded", String(!collapsed));
    save("collapsed", [...S.collapsed]);
    $("#toggleAll").textContent = L(
      S.collapsed.size ? "expand_all" : "collapse_all",
    );
  } else if (act === "toggle-all") {
    if (S.collapsed.size) S.collapsed.clear();
    else
      new Set(S.model.svcs.map((s) => s.group)).forEach((n) =>
        S.collapsed.add(n),
      );
    save("collapsed", [...S.collapsed]);
    renderChips(S.model);
    renderList();
    updateAgo();
  } else if (act === "open-svc") openSvc(a.dataset.id);
  else if (act === "refresh") refresh(true);
  else if (act === "theme") {
    S.theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    save("theme", S.theme);
    applyTheme();
  } else if (act === "lang") {
    S.lang = S.lang === "pl" ? "en" : "pl";
    save("lang", S.lang);
    applyLang();
    render();
  } else if (act === "clear") {
    S.filter = "all";
    S.q = "";
    $("#q").value = "";
    save("filter", "all");
    renderChips(S.model);
    renderList();
    updateAgo();
  } else if (act === "inc-more") {
    S.incAll = !S.incAll;
    renderIncidents(S.model);
    updateAgo();
  } else if (act === "demo-toggle") {
    e.preventDefault();
    S.demo = S.demo === "outage" ? "demo" : "outage";
    DEMO.reset();
    renderDemo();
    refresh(true);
  } else if (act === "copy") {
    const u = new URL(location.href);
    u.search = "";
    u.hash = "";
    u.searchParams.set("q", a.dataset.id);
    copyText(u.toString())
      .then(() => {
        a.textContent = L("copied");
        setTimeout(() => {
          a.textContent = L("copy");
        }, 1600);
      })
      .catch(() => {});
  }
});

let qTimer;
$("#q").addEventListener("input", (e) => {
  clearTimeout(qTimer);
  qTimer = setTimeout(() => {
    S.q = e.target.value;
    renderList();
    updateAgo();
  }, 60);
});

document.addEventListener("keydown", (e) => {
  if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    focusSearch();
    return;
  }
  const t = e.target;
  if (t.matches("input, textarea, select") || t.isContentEditable) {
    if (e.key === "Escape" && t.id === "q") {
      t.value = "";
      S.q = "";
      renderList();
      updateAgo();
      t.blur();
    }
    return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === "/") {
    e.preventDefault();
    focusSearch();
  } else if (k === "1") setWin("hour");
  else if (k === "2") setWin("day");
  else if (k === "3") setWin("month");
  else if (k === "r") refresh(true);
  else if (k === "t") $('[data-act="theme"]').click();
});

/* tooltip */
const tip = $("#tip");
let tipCell = null;
function hideTip() {
  if (tipCell) tipCell.classList.remove("hl");
  tipCell = null;
  tip.classList.remove("show");
}
function showTip(cell) {
  if (cell === tipCell) return;
  const bar = cell.parentElement,
    c = S.barCache.get(bar.dataset.key);
  if (!c || !c.buckets) return hideTip();
  if (tipCell) tipCell.classList.remove("hl");
  tipCell = cell;
  cell.classList.add("hl");
  const i = +cell.dataset.i,
    b = c.buckets[i],
    st = bState(b),
    t0 = c.start + i * c.size,
    t1 = Math.min(nowS(), t0 + c.size);
  const n = b.ok + b.fail;
  const codes =
    b.codes && b.codes.length
      ? [...new Set(b.codes)]
          .map((x) => (x == null ? L("timeout") : L("http", x)))
          .join(", ")
      : "";
  tip.innerHTML = `<div class="tt-t">${esc(c.loc ? c.loc + " · " : "")}${esc(fmtRange(t0, t1, c.size))}</div>
    <div class="tt-s st-${st}"><span class="dot"></span>${esc(L("st_" + st))}</div>
    <div class="tt-d">${n < 0.5 ? esc(L("no_data")) : `${esc(L("checks", Math.round(b.ok), Math.round(n)))} · ${esc(fmtUp(b.ok / n))}`}</div>
    ${codes ? `<div class="tt-d">${esc(codes)}</div>` : ""}`;
  const r = cell.getBoundingClientRect(),
    tw = tip.offsetWidth,
    th = tip.offsetHeight;
  let x = r.left + r.width / 2 - tw / 2;
  x = Math.max(8, Math.min(innerWidth - tw - 8, x));
  let y = r.top - th - 8;
  if (y < 8) y = r.bottom + 8;
  tip.style.left = x + "px";
  tip.style.top = y + "px";
  tip.classList.add("show");
}
document.addEventListener("pointerover", (e) => {
  const c = e.target.closest?.(".bar i[data-i]");
  c ? showTip(c) : hideTip();
});
document.addEventListener("pointerdown", (e) => {
  const c = e.target.closest?.(".bar i[data-i]");
  if (c && e.pointerType !== "mouse") {
    tipCell = null;
    showTip(c);
  }
});
addEventListener("scroll", hideTip, { passive: true });

mqMobile.addEventListener?.("change", () => render());
mqLight.addEventListener?.("change", () => {
  if (S.theme === "auto") applyTheme();
});
document.addEventListener("visibilitychange", () => {
  updateAgo();
  if (!document.hidden && S.nextRefresh && nowS() >= S.nextRefresh) refresh();
});

/* ───────────── demo data (used when locations.json is unavailable or ?demo) ───────────── */
const DEMO = (() => {
  const SV = [
    ["app.saltfish.ai", "SaltFish", "Inne strony", 0, 115],
    ["solvro.pwr.edu.pl", "Solvro", "Inne strony", 0, 33],
    ["kamilmarczak.pl", "kamilmarczak.pl", "Moje strony", 0, 165],
    ["status.kamilmarczak.pl", "Strona statusu", "Moje strony", 0, 80],
    ["matrix.kamilmarczak.pl", "Matrix", "Usługi publiczne", 0, 85],
    ["matrix-rtc.kamilmarczak.pl", "Matrix RTC", "Usługi publiczne", 0, 15],
    ["qr.kamilmarczak.pl", "Mini QR", "Usługi publiczne", 0, 11],
    ["files.kamilmarczak.pl", "Pliki", "Usługi publiczne", 0, 42],
    ["panel.kamilmarczak.pl", "Homarr", "VPN · Aplikacje", 1, 48],
    ["map.kamilmarczak.pl", "Homelable", "VPN · Aplikacje", 1, 9],
    ["my-home.kamilmarczak.pl", "My Home", "VPN · Aplikacje", 1, 12],
    ["sure.kamilmarczak.pl", "Sure", "VPN · Aplikacje", 1, 38],
    ["dns.kamilmarczak.pl", "AdGuard", "VPN · DNS", 1, 17],
    ["dns1.kamilmarczak.pl", "AdGuard dns1", "VPN · DNS", 1, 21],
    ["dns2.kamilmarczak.pl", "AdGuard dns2", "VPN · DNS", 1, 18],
    ["ha.kamilmarczak.pl", "Home Assistant", "VPN · Dom", 1, 10],
    ["grafana.kamilmarczak.pl", "Grafana", "VPN · Infrastruktura", 1, 9],
    ["proxmox.kamilmarczak.pl", "Proxmox", "VPN · Infrastruktura", 1, 12],
    ["nas.kamilmarczak.pl", "TrueNAS", "VPN · Infrastruktura", 1, 25],
    ["jellyfin.kamilmarczak.pl", "Jellyfin", "VPN · Media", 1, 10],
    ["lidarr.kamilmarczak.pl", "Lidarr", "VPN · Media", 1, 9],
    ["radarr.kamilmarczak.pl", "Radarr", "VPN · Media", 1, 9],
    ["seerr.kamilmarczak.pl", "Seerr", "VPN · Media", 1, 10],
    ["sonarr.kamilmarczak.pl", "Sonarr", "VPN · Media", 1, 10],
  ];
  const LOCS = [
    { id: "pve2", name: "pve2", url: "https://beacon-pve2.kamilmarczak.pl" },
    { id: "pve", name: "pve", url: "https://beacon-pve.kamilmarczak.pl" },
    { id: "ovh", name: "OVH", url: "https://beacon-ovh.kamilmarczak.pl" },
  ];
  const T0 = Math.floor(Date.now() / 1000);
  // [service, location|null (all), started N seconds before page load, duration, failure probability]
  const INC = [
    ["jellyfin.kamilmarczak.pl", "pve2", 5 * 3600, 22 * 60, 0.9],
    ["dns2.kamilmarczak.pl", "pve2", 2 * 3600 + 600, 4 * 60, 1],
    ["solvro.pwr.edu.pl", "ovh", 9 * 3600, 12 * 60, 0.7],
    ["dns1.kamilmarczak.pl", "pve", 40 * 60, 3 * 60, 0.6],
    ["matrix.kamilmarczak.pl", null, 3 * 86400 + 4000, 45 * 60, 1],
    ["nas.kamilmarczak.pl", null, 11 * 86400, 3 * 3600, 1],
    ["app.saltfish.ai", null, 19 * 86400, 50 * 60, 0.8],
    ["kamilmarczak.pl", "ovh", 25 * 86400, 2 * 3600, 0.5],
  ];
  const mode = () => S.demo === "outage";
  const outageInc = [
    ["sure.kamilmarczak.pl", null, 9 * 60, 1e9, 1],
    ["jellyfin.kamilmarczak.pl", "pve2", 4 * 60, 1e9, 1],
    ["matrix.kamilmarczak.pl", "ovh", 2 * 60, 1e9, 0.6],
  ];
  const incs = () => (mode() ? INC.concat(outageInc) : INC);
  const rnd = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  };
  const offs = {};
  const offset = (sid, lid) =>
    offs[sid + lid] ??
    (offs[sid + lid] = Math.floor(rnd("o" + sid + lid) * 30));
  const svcsFor = (lid) => SV.filter((s) => !(lid === "ovh" && s[3]));
  const failP = (sid, lid, t) => {
    for (const [is, il, a, d, p] of incs()) {
      if (is !== sid || (il && il !== lid)) continue;
      const st = T0 - a;
      if (t >= st && t < st + d) return p;
    }
    return 0.00002;
  };
  const probeFail = (sid, lid, t) =>
    rnd(sid + "|" + lid + "|" + t) < failP(sid, lid, t);
  const base = (s) => ({
    id: s[0],
    name: s[1],
    hidden: false,
    requires_vpn: !!s[3],
    hosting_location: null,
    labels: { group: s[2] },
  });
  const locOf = (lid) => ({
    id: lid,
    name: LOCS.find((l) => l.id === lid).name,
  });
  const head = (lid, extra) => ({
    schema_version: 2,
    location: locOf(lid),
    generated_at: nowS(),
    ...extra,
  });

  function current(lid) {
    const t = nowS();
    return {
      schema_version: 1,
      location: locOf(lid),
      generated_at: t,
      expires_at: t + 120,
      services: svcsFor(lid).map((s) => {
        const o = offset(s[0], lid),
          tp = Math.floor((t - o) / 30) * 30 + o,
          f = probeFail(s[0], lid, tp);
        const lat = f
          ? 5 + rnd("l" + tp) * 0.03
          : (s[4] * (0.85 + 0.4 * rnd("l" + s[0] + lid + tp)) +
              (lid === "ovh" ? 105 : lid === "pve2" ? 3 : 0) +
              (rnd("sp" + s[0] + lid + tp) < 0.04 ? 350 * rnd("x" + tp) : 0)) /
            1000;
        return {
          ...base(s),
          status: f ? "down" : "healthy",
          observed_at: tp,
          expires_at: tp + 120,
          duration_seconds: lat,
        };
      }),
    };
  }
  function hour(lid) {
    const t = nowS();
    return {
      ...head(lid, {
        kind: "probes",
        expires_at: t + 90,
        window_seconds: 3600,
        scrape_interval_seconds: 30,
        refresh_seconds: 30,
      }),
      services: svcsFor(lid).map((s) => {
        const o = offset(s[0], lid),
          probes = [];
        let ok = 0;
        for (
          let tp = Math.floor((t - 3600 - o) / 30) * 30 + 30 + o;
          tp <= t;
          tp += 30
        ) {
          const f = probeFail(s[0], lid, tp);
          if (!f) ok++;
          probes.push({
            at: tp,
            success: !f,
            http_status_code: f ? (rnd("c" + tp) < 0.5 ? 502 : null) : 200,
          });
        }
        return {
          ...base(s),
          observed_success_ratio: ok / probes.length,
          coverage: 1,
          probes,
        };
      }),
    };
  }
  function timeline(lid, w) {
    const t = nowS(),
      W =
        w === "day"
          ? { win: 86400, step: 60, refresh: 300 }
          : { win: 2592000, step: 1800, refresh: 1800 };
    const end = Math.floor(t / W.step) * W.step,
      start = end - W.win;
    return {
      ...head(lid, {
        kind: "timeline",
        expires_at: t + W.refresh * 3,
        window_seconds: W.win,
        scrape_interval_seconds: 30,
        refresh_seconds: W.refresh,
        step_seconds: W.step,
      }),
      services: svcsFor(lid).map((s) => {
        const segs = [];
        let tot = 0,
          totF = 0;
        const o = offset(s[0], lid),
          samples = W.step / 30;
        for (let a = start; a < end; a += W.step) {
          let fails = 0;
          if (w === "day") {
            for (let k = 0; k < samples; k++)
              if (probeFail(s[0], lid, a + o + k * 30)) fails++;
          } else {
            for (const [is, il, ag, d, p] of incs()) {
              if (is !== s[0] || (il && il !== lid)) continue;
              const st = T0 - ag,
                en = st + d,
                ov = Math.min(en, a + W.step) - Math.max(st, a);
              if (ov > 0) fails += Math.round((ov / 30) * p);
            }
            fails = Math.min(
              samples,
              fails + (rnd("m" + s[0] + lid + a) < 0.0004 ? 1 : 0),
            );
          }
          tot += samples;
          totF += fails;
          const state = fails ? "down" : "healthy",
            last = segs[segs.length - 1];
          if (last && last.state === state && last.end === a) {
            last.end = a + W.step;
            last.samples += samples;
            last.failures += fails;
          } else
            segs.push({
              start: a,
              end: a + W.step,
              state,
              samples,
              failures: fails,
              last_http_status_code: null,
            });
        }
        return {
          ...base(s),
          observed_success_ratio: (tot - totF) / tot,
          coverage: 1,
          segments: segs,
        };
      }),
    };
  }
  const cache = {};
  async function get(loc, path) {
    await new Promise((r) => setTimeout(r, 120 + Math.random() * 260));
    const k = loc.id + path;
    if (path === "current") return current(loc.id);
    if (path === "history/hour") return hour(loc.id);
    const w = path.split("/")[1];
    if (w !== "day" && w !== "month") throw new Error("HTTP 404");
    if (
      !cache[k] ||
      nowS() - cache[k].generated_at > (w === "day" ? 300 : 1800)
    )
      cache[k] = timeline(loc.id, w);
    return cache[k];
  }
  return {
    get,
    reset: () => {
      for (const k in cache) delete cache[k];
    },
    config: () => ({ title: "Kamil Marczak | Status", locations: LOCS }),
  };
})();

function showConfigError() {
  $("#summary").className = "summary st-down";
  $("#headline").textContent = L("h_noconfig");
  $("#lede").textContent = L("d_noconfig");
  $("#facts").innerHTML = "";
}

/* ───────────── boot ───────────── */
async function boot() {
  applyTheme();
  let cfg = null;
  if (params.has("demo")) {
    S.demo = params.get("demo") === "outage" ? "outage" : "demo";
    cfg = DEMO.config();
  } else {
    try {
      cfg = await getJSON("./locations.json", 8000);
    } catch (e) {
      console.warn("[status] locations.json unavailable:", e.message);
    }
  }
  if (!cfg || !Array.isArray(cfg.locations) || !cfg.locations.length) {
    applyLang();
    showConfigError();
    return;
  }
  S.title = cfg.title || "Status";
  S.locations = cfg.locations.map((l) => ({
    id: l.id,
    name: l.name || l.id,
    url: l.url,
    current: null,
    hist: {},
    histAt: {},
    reachable: null,
    error: null,
  }));
  const name = S.title.split("|")[0].trim() || S.title;
  $("#brandName").textContent = name;
  if (S.q) $("#q").value = S.q;
  applyLang();
  render();
  await refresh(true);
  if (S.q) {
    const hit = S.model.svcs.filter(matches);
    if (hit.length === 1) openSvc(hit[0].id);
  }
  setInterval(tick, 1000);
}
boot();
