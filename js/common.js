/* petcoin.fun — shared: mode/theme, template vars, header, CA box, modal, wallet button. */
(function () {
  const CFG = window.PET_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const short = (a, l = 6, r = 4) => (a && a.length > l + r + 3 ? a.slice(0, l) + "…" + a.slice(-r) : a || "");
  const joinList = (arr) => (arr.length < 2 ? arr.join("") : arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1]);
  const uniq = (arr) => [...new Set(arr)];

  /** Compact number: 1234567 → 1.23M */
  function num(v, d = 2) {
    if (v === null || v === undefined || isNaN(v)) return "—";
    const a = Math.abs(v);
    if (a >= 1e9) return (v / 1e9).toFixed(d) + "B";
    if (a >= 1e6) return (v / 1e6).toFixed(d) + "M";
    if (a >= 1e3) return (v / 1e3).toFixed(d === 2 ? 1 : d) + "K";
    return Number(v).toFixed(a < 10 ? d : 0);
  }
  const usd = (v, d) => (v === null || v === undefined || isNaN(v) ? "—" : "$" + num(v, d));
  /** Price with subscript-like zero compression: 0.00000123 → $0.0₅123 */
  function price(p) {
    p = Number(p);
    if (!p || isNaN(p)) return "—";
    if (p >= 1) return "$" + p.toLocaleString("en-US", { maximumFractionDigits: 4 });
    const s = p.toFixed(20).split(".")[1];
    const z = s.match(/^0*/)[0].length;
    if (z >= 4) { const sub = String(z).split("").map((c) => "₀₁₂₃₄₅₆₇₈₉"[c]).join(""); return "$0.0" + sub + s.slice(z, z + 4); }
    return "$" + p.toPrecision(4).replace(/0+$/, "");
  }
  function ago(ts) {
    if (!ts) return "—";
    const s = Math.max(1, (Date.now() - ts) / 1000);
    if (s < 3600) return Math.floor(s / 60) + "m";
    if (s < 86400) return Math.floor(s / 3600) + "h";
    if (s < 86400 * 30) return Math.floor(s / 86400) + "d";
    if (s < 86400 * 365) return Math.floor(s / 86400 / 30) + "mo";
    return Math.floor(s / 86400 / 365) + "y";
  }

  const UI = {
    $, $$, esc, short, num, usd, price, ago, joinList,

    /** Template variables (single → that network, multi → combined). */
    vars() {
      const nets = Chain.list(), single = Chain.isSingle(), n = nets[0];
      const P = CFG.project;
      const pick = (k) => (single ? n[k] : joinList(uniq(nets.map((x) => x[k]))));
      return {
        brand: P.brand, name: P.name, ticker: P.ticker, symbol: P.symbol, tagline: P.tagline,
        xHandle: CFG.social.xHandle,
        x: `<a href="${esc(CFG.social.x)}" target="_blank" rel="noopener">${esc(CFG.social.xHandle)}</a>`,
        netName: single ? n.name : joinList(nets.map((x) => x.name)),
        netShort: single ? n.short : nets.map((x) => x.short).join(" · "),
        netCount: single ? "1 chain" : nets.length + " chains",
        native: pick("native"), dex: pick("dex"), aggregator: pick("aggregator"),
        wallets: single ? n.wallets : "Phantom, Solflare or Backpack (Solana) · MetaMask, Rabby, Coinbase Wallet or Trust Wallet (EVM)",
        walletNote: single ? n.walletNote || "" : " EVM networks are added to your wallet automatically when you connect.",
        pitch: single ? n.pitch : "pick the chain you already use",
        tokenStd: pick("tokenStd"),
        launchFee: single ? n.fees.launch : nets.map((x) => x.fees.launch).join(" / "),
        campaignFee: single ? n.fees.campaign : nets.map((x) => x.fees.campaign).join(" / "),
        gradFee: single ? n.fees.graduation : nets.map((x) => x.fees.graduation).join(" / "),
        gradCap: "$" + Number(CFG.launchpad.graduationMcapUsd).toLocaleString("en-US"),
        caInfo: single ? (n.type === "evm" ? `EVM · Chain ID ${n.chainId}` : "SPL token on Solana")
          : "Robinhood, Base and BSC share the same CA · Solana has its own mint",
      };
    },

    applyMode() {
      const single = Chain.isSingle(), n = Chain.get(Chain.primary()), body = document.body;
      body.dataset.mode = single ? "single" : "multi";
      body.dataset.net = single ? n.id : "";
      const th = { ...CFG.theme, ...(single ? n.theme : {}) };
      [["--primary", th.primary], ["--accent", th.accent], ["--warm", th.warm], ["--on-primary", th.onPrimary]]
        .forEach(([k, v]) => v && body.style.setProperty(k, v));
      $$("[data-show]").forEach((el) => (el.hidden = el.dataset.show !== (single ? "single" : "multi")));
      const v = UI.vars();
      const fill = (s) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
      $$("[data-v]").forEach((el) => (el.textContent = (v[el.dataset.v] ?? "").replace(/<[^>]+>/g, "")));
      $$("[data-vh]").forEach((el) => (el.innerHTML = v[el.dataset.vh] ?? ""));
      $$("[data-tpl]").forEach((el) => (el.innerHTML = fill(el.innerHTML)));
    },

    /** Shared header / footer / modal markup for every page. */
    renderShell() {
      const page = document.body.dataset.page || "home";
      const nav = [["./", "Home", "home"], ["explore", "Explore", "explore"], ["launch", "Launch", "launch"], ["./#token", "$PET", "token"], ["./#fees", "Fees", "fees"], ["docs", "Docs", "docs"]];
      const head = $("#siteHeader");
      if (head) head.outerHTML = `<div class="topbar"><div class="marquee" id="marquee"></div></div>
        <header class="header"><div class="wrap">
          <a class="brand" href="./"><img src="assets/art/logo.svg" alt=""><span>petcoin<em>.fun</em></span></a>
          <nav class="nav" id="nav">${nav.map(([h, t, id]) => `<a href="${h}" class="${id === page ? "active" : ""}">${t}</a>`).join("")}</nav>
          <div class="head-actions">
            <span class="net-badge" id="netBadge"></span>
            <button class="icon-btn" id="themeBtn" data-action="toggle-theme" aria-label="Toggle light / dark mode"></button>
            <button class="btn btn-primary btn-sm" id="walletBtn" data-action="open-connect">Connect Wallet</button>
            <button class="icon-btn menu-btn" data-action="toggle-nav" aria-label="Menu">☰</button>
          </div>
        </div></header>`;
      const foot = $("#siteFooter");
      if (foot) foot.outerHTML = `<footer class="footer"><div class="wrap">
          <div><a class="brand" href="./"><img src="assets/art/logo.svg" alt=""><span>petcoin<em>.fun</em></span></a>
            <p class="muted" style="margin-top:12px">The pet meme coin launchpad. Vote · Launch · Earn with ${esc(CFG.project.ticker)} on <span data-v="netName"></span>.</p></div>
          <div><h4>Platform</h4><a href="explore">Explore</a><a href="launch">Launch a pet coin</a><a href="./#memeify">Memeify</a><a href="./#fees">Fees</a></div>
          <div><h4>Learn</h4><a href="docs">Docs</a><a href="docs#start">Getting started</a><a href="docs#token">${esc(CFG.project.ticker)} token</a><a href="docs#safety">Safety</a></div>
          <div><h4>Community</h4><a href="#" data-x-link target="_blank" rel="noopener">X <span data-x-handle></span></a><a href="#" data-tg-link target="_blank" rel="noopener" hidden>Telegram</a><a href="#" data-action="open-copy">Copy ${esc(CFG.project.ticker)} CA</a></div>
          <div class="disc">© <span data-year></span> petcoin.fun · ${esc(CFG.project.ticker)} is a community meme token with no intrinsic value or expectation of financial return. Pet coins shown on this site are third-party tokens from public market data, not endorsements. Crypto is risky — DYOR.</div>
        </div></footer>
        <div class="modal" id="modal" hidden><div class="modal-card"><button class="modal-x" data-action="close-modal" aria-label="Close">×</button><div id="modalBody"></div></div></div>
        <div class="toast" id="toast" hidden></div>`;
    },

    /* ---------- Light / dark ---------- */
    colorMode() {
      let m; try { m = localStorage.getItem("pet.color"); } catch {}
      return m === "light" || m === "dark" ? m : (CFG.defaultColorMode || "dark");
    },
    setColorMode(m, save) {
      document.documentElement.dataset.theme = m;
      if (save) { try { localStorage.setItem("pet.color", m); } catch {} }
      const b = $("#themeBtn"); if (b) { b.textContent = m === "dark" ? "☀" : "☾"; b.title = m === "dark" ? "Light mode" : "Dark mode"; }
    },

    renderChrome() {
      const nets = Chain.list();
      const badge = $("#netBadge");
      if (badge) badge.innerHTML = nets.length === 1
        ? `<img src="${nets[0].icon}" alt="">${esc(nets[0].short)}`
        : `<span class="stack">${nets.map((n) => `<img src="${n.icon}" alt="${esc(n.short)}">`).join("")}</span>${nets.length} chains`;
      UI.setTicker(null);
      $$("[data-x-link]").forEach((a) => (a.href = CFG.social.x));
      $$("[data-x-handle]").forEach((s) => (s.textContent = CFG.social.xHandle));
      if (CFG.social.telegram) $$("[data-tg-link]").forEach((a) => { a.href = CFG.social.telegram; a.hidden = false; });
      $$("[data-year]").forEach((s) => (s.textContent = new Date().getFullYear()));
      if (CFG.launchpad.appUrl) $$("[data-launch]").forEach((a) => { a.href = CFG.launchpad.appUrl; a.target = "_blank"; });
    },

    /** Top ticker: live pet coins (real data) or brand words while loading. */
    setTicker(tokens) {
      const mq = $("#marquee"); if (!mq) return;
      let items;
      if (tokens && tokens.length) {
        items = tokens.slice(0, 16).map((t) => {
          const n = Chain.get(t.net), c = t.chg24;
          return `<span><img src="${esc(t.image || n.icon)}" alt="" onerror="this.src='${n.icon}'"><b>$${esc(t.symbol)}</b> ${price(t.price)}${c !== null ? ` <i class="${c >= 0 ? "up" : "down"}">${c >= 0 ? "▲" : "▼"}${Math.abs(c).toFixed(1)}%</i>` : ""} <span class="muted">· vol ${usd(t.vol24)}</span></span>`;
        });
      } else {
        items = [CFG.project.ticker, "Memeify your pet", ...Chain.list().map((n) => n.name), "Vote · Launch · Earn", "Paw Pool", "Dog Pack vs Cat Club"]
          .map((w) => `<span><img src="assets/art/logo.svg" alt="">${esc(w)}</span>`);
      }
      mq.innerHTML = items.join("") + items.join("");
    },

    /* ---------- CA box (hero) ---------- */
    caNet: null,
    renderCA() {
      const box = $("#caBox"); if (!box) return;
      const nets = Chain.list();
      UI.caNet = UI.caNet || Chain.primary();
      const n = Chain.get(UI.caNet), ca = Chain.ca(n.id);
      $("#caTabs").hidden = nets.length < 2;
      $("#caTabs").innerHTML = nets.map((x) => `<button class="ca-tab ${x.id === n.id ? "active" : ""}" style="--net:${x.color}" data-action="ca-tab" data-net="${x.id}"><img src="${x.icon}" alt="">${esc(x.short)}</button>`).join("");
      $("#caIcon").src = n.icon; $("#caIcon").alt = n.name;
      $("#caValue").innerHTML = ca ? `<small>${esc(n.name)} · ${esc(n.tokenStd)}</small>${esc(ca)}` : `<small>${esc(n.name)} · ${esc(n.tokenStd)}</small>Coming soon`;
      $("#caValue").classList.toggle("empty", !ca);
      $("#caCopy").disabled = !ca;
      const links = ca ? [[Chain.chartUrl(n.id), "Chart"], [Chain.explorerToken(n.id), "Explorer"]].filter((l) => l[0]) : [];
      $("#caLinks").innerHTML = links.length
        ? links.map(([u, t]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${t} ↗</a>`).join("") + (nets.length > 1 && n.type === "evm" ? `<span class="muted">Same CA on Robinhood, Base &amp; BSC</span>` : "")
        : `<span class="muted">Official CA will be announced on <a href="${esc(CFG.social.x)}" target="_blank" rel="noopener">${esc(CFG.social.xHandle)}</a>. Never trust DMs.</span>`;
    },

    /* ---------- Toast / copy / modal ---------- */
    toast(msg) {
      const t = $("#toast"); t.textContent = msg; t.hidden = false;
      clearTimeout(UI._tt); UI._tt = setTimeout(() => (t.hidden = true), 2000);
    },
    async copy(text) {
      try { await navigator.clipboard.writeText(text); }
      catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
      UI.toast("Copied! 🐾");
    },
    openModal(html, wide) {
      $("#modalBody").innerHTML = html;
      $(".modal-card").classList.toggle("wide", !!wide);
      $("#modal").hidden = false; document.body.style.overflow = "hidden";
    },
    closeModal() { $("#modal").hidden = true; document.body.style.overflow = ""; },

    copyModal() {
      return `<h3>Copy ${esc(CFG.project.ticker)} CA</h3>
        <p class="sub">Pick your chain. Robinhood, Base and BSC share the same contract address.</p>
        <div class="net-list">${Chain.list().map((n) => {
          const ca = Chain.ca(n.id);
          return ca ? `<button class="net-opt" data-action="copy" data-text="${esc(ca)}"><img src="${n.icon}" alt=""><div><div class="n">${esc(n.name)}</div><div class="d mono">${esc(short(ca, 8, 6))}</div></div><span class="go">Copy</span></button>`
            : `<div class="net-opt off"><img src="${n.icon}" alt=""><div><div class="n">${esc(n.name)}</div><div class="d">Coming soon</div></div></div>`;
        }).join("")}</div>
        <div class="notice">Only trust the CA shown here and on ${esc(CFG.social.xHandle)}.</div>`;
    },

    /** Shown after a connected wallet presses Launch. `d` = form summary. */
    launchModal(d = {}) {
      const v = UI.vars();
      return `<div class="modal-hero"><div class="big">🚀</div><h3>Launchpad opening soon</h3>
        <p class="sub">Your pet coin ${d.name ? `<b>${esc(d.name)} ($${esc(d.ticker)})</b> ` : ""}is ready to go — the petcoin.fun launchpad contracts are not live yet.</p></div>
        ${d.name ? `<div class="param"><span>Network</span><b>${esc(d.net)}</b></div><div class="param"><span>Trading fee (buy = sell)</span><b>${esc(d.fee)}%</b></div><div class="param"><span>Creation fee</span><b>${esc(d.cost)}</b></div>` : ""}
        <div class="notice">Nothing was sent and no transaction was signed. Follow ${esc(CFG.social.xHandle)} to launch on day one on ${esc(v.netName)}.</div>
        <div class="row-actions"><a class="btn btn-primary" href="${esc(CFG.social.x)}" target="_blank" rel="noopener">Follow ${esc(CFG.social.xHandle)}</a><button class="btn" data-action="close-modal">Keep editing</button></div>`;
    },

    /* ---------- Wallet ---------- */
    connectModal(netId) {
      const n = Chain.get(netId), multi = Chain.list().length > 1;
      const wallets = Wallet.wallets(n.type);
      return `<h3>Connect wallet</h3>
        <p class="sub">${multi ? "Choose a network, then your wallet." : "Choose your wallet."}</p>
        <div class="net-tabs" ${multi ? "" : "hidden"}>${Chain.list().map((x) => `<button class="ca-tab ${x.id === netId ? "active" : ""}" style="--net:${x.color}" data-action="pick-net" data-net="${x.id}"><img src="${x.icon}" alt="">${esc(x.short)}</button>`).join("")}</div>
        <p class="muted small" style="margin:12px 0 0">${esc(n.name)} · ${n.type === "solana" ? "Solana wallets" : "EVM · Chain ID " + n.chainId + " · added/switched automatically"}</p>
        <div class="wallet-list">${wallets.map((w) => w.installed
          ? `<button class="wallet-opt" data-action="connect-wallet" data-net="${netId}" data-key="${esc(w.key)}"><img src="${esc(w.icon || n.icon)}" alt=""><b>${esc(w.name)}</b><span class="muted small">Detected</span></button>`
          : `<a class="wallet-opt" href="${esc(w.url)}" target="_blank" rel="noopener"><img src="${n.icon}" alt=""><b>${esc(w.name)}</b><span class="muted small">Install ↗</span></a>`).join("")}</div>
        <div id="connMsg"></div>`;
    },
    accountModal() {
      const w = Wallet.state, n = Chain.get(w.network), T = CFG.project.ticker;
      const others = Chain.list().filter((x) => x.type === "evm" && x.id !== w.network);
      return `<h3>Your wallet</h3>
        <p class="sub">${esc(w.walletName)} · ${n ? esc(n.name) : "Unsupported network"}</p>
        <div class="param"><span>Address</span><code>${esc(short(w.address, 10, 8))}</code></div>
        <div class="param"><span>${T} balance</span><b>${w.balance !== null ? Number(w.balance).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " " + T : (n && Chain.ca(n.id) ? "—" : "CA not set yet")}</b></div>
        ${w.type === "evm" && others.length ? `<p class="muted small" style="margin:16px 0 8px">Switch network</p><div class="net-tabs">${others.map((x) => `<button class="ca-tab" data-action="switch-net" data-net="${x.id}"><img src="${x.icon}" alt="">${esc(x.short)}</button>`).join("")}</div>` : ""}
        <div class="row-actions">
          <button class="btn btn-sm" data-action="copy" data-text="${esc(w.address)}">Copy address</button>
          ${n ? `<a class="btn btn-sm" href="${esc(Chain.explorerAddr(n.id, w.address))}" target="_blank" rel="noopener">Explorer</a>` : ""}
          <button class="btn btn-sm btn-hot" data-action="disconnect" style="margin-left:auto">Disconnect</button>
        </div>`;
    },
    updateWalletBtn() {
      const w = Wallet.state, btn = $("#walletBtn"); if (!btn) return;
      if (!w.connected) { btn.textContent = "Connect Wallet"; btn.dataset.action = "open-connect"; return; }
      const n = Chain.get(w.network);
      btn.dataset.action = "open-account";
      btn.innerHTML = `<span class="wallet-chip">${n ? `<img src="${n.icon}" alt="">` : "⚠"}${esc(short(w.address, 4, 4))}</span>`;
    },

    /** Page-specific handlers can be registered here. */
    handlers: {},
    async handle(action, el) {
      if (UI.handlers[action]) return UI.handlers[action](el);
      switch (action) {
        case "toggle-nav": return $("#nav").classList.toggle("open");
        case "ca-tab": UI.caNet = el.dataset.net; return UI.renderCA();
        case "copy-ca": { const ca = Chain.ca(UI.caNet || Chain.primary()); return ca ? UI.copy(ca) : UI.toast("CA coming soon"); }
        case "copy": return UI.copy(el.dataset.text);
        case "open-copy": {
          if (Chain.isSingle()) { const ca = Chain.ca(Chain.primary()); return ca ? UI.copy(ca) : UI.toast("CA coming soon"); }
          return UI.openModal(UI.copyModal());
        }
        case "toggle-theme": return UI.setColorMode(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
        case "open-connect": return UI.openModal(UI.connectModal(Wallet.state.network || Chain.primary()));
        case "pick-net": return ($("#modalBody").innerHTML = UI.connectModal(el.dataset.net));
        case "open-account": return UI.openModal(UI.accountModal());
        case "close-modal": return UI.closeModal();
        case "disconnect": await Wallet.disconnect(); return UI.closeModal();
        case "connect-wallet": {
          el.disabled = true;
          try { await Wallet.connect(el.dataset.net, el.dataset.key); UI.closeModal(); UI.toast("Wallet connected"); }
          catch (e) { el.disabled = false; $("#connMsg").innerHTML = `<div class="notice err">${esc(e.message || "Connection rejected")}</div>`; }
          return;
        }
        case "switch-net": {
          try { await Wallet.switchNetwork(el.dataset.net); UI.closeModal(); }
          catch (e) { UI.toast(e.message || "Switch rejected"); }
        }
      }
    },

    init() {
      UI.renderShell();
      UI.setColorMode(UI.colorMode());
      UI.applyMode();
      UI.renderChrome();
      UI.renderCA();
      document.addEventListener("click", (e) => {
        const el = e.target.closest("[data-action]");
        if (el) { e.preventDefault(); UI.handle(el.dataset.action, el); }
        else if (e.target.closest(".nav a")) $("#nav").classList.remove("open");
        if (e.target.id === "modal") UI.closeModal();
      });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") UI.closeModal(); });
      window.addEventListener("wallet:change", () => {
        UI.updateWalletBtn();
        if (!$("#modal").hidden && $("#modalBody [data-action='disconnect']")) $("#modalBody").innerHTML = UI.accountModal();
      });
      Wallet.init();
      UI.updateWalletBtn();
    },
  };

  window.UI = UI;
})();
