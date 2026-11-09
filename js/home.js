/* petcoin.fun — homepage: live explore/new/communities/stats, $PET panel, fees, roadmap. */
(function () {
  const CFG = window.PET_CONFIG;
  const { $, esc, short, usd, price, ago } = UI;

  const H = {
    sort: "trending", chain: "all", cat: "all", q: "", limit: 12,

    logo(t, cls = "t-logo") {
      const init = esc((t.symbol || "?").slice(0, 2).toUpperCase());
      return t.image
        ? `<img class="${cls}" src="${esc(t.image)}" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;${cls}&quot;>${init}</span>'">`
        : `<span class="${cls}">${init}</span>`;
    },
    chg(v) { return v === null ? "" : `<span class="chg ${v >= 0 ? "up" : "down"}">${v >= 0 ? "▲" : "▼"} ${Math.abs(v).toFixed(1)}%</span>`; },

    card(t, i) {
      const n = Chain.get(t.net), done = t.progress >= 1, pct = Math.round(t.progress * 100);
      return `<div class="tcard">
        ${H.sort === "trending" && i < 3 ? `<span class="rank">#${i + 1} 🔥</span>` : ""}
        <div class="t-top">${H.logo(t)}<div class="t-name"><b title="${esc(t.name)}">${esc(t.name)}</b><span class="tk">$${esc(t.symbol)}</span></div><img class="t-chain" src="${n.icon}" alt="${esc(n.name)}" title="${esc(n.name)}"></div>
        <div class="t-price"><b>${price(t.price)}</b>${H.chg(t.chg24)}</div>
        <div class="t-kv"><div><span>MCap</span><b>${usd(t.mcap)}</b></div><div><span>Vol 24h</span><b>${usd(t.vol24)}</b></div><div><span>Liq</span><b>${usd(t.liq)}</b></div></div>
        <div class="curve"><div class="curve-top"><span>${done ? "🎓 Graduated" : "Bonding curve"}</span><span>${done ? "100%" : pct + "%"}</span></div><div class="curve-bar ${done ? "done" : ""}"><i style="width:${Math.max(3, pct)}%"></i></div></div>
        <div class="t-actions">
          <button class="btn btn-primary btn-sm" data-action="copy" data-text="${esc(t.address)}">📋 Copy CA</button>
          <a class="btn btn-sm" href="${esc(t.url)}" target="_blank" rel="noopener">Trade chart ↗</a>
        </div>
      </div>`;
    },

    filtered() {
      let list = Market.tokens;
      if (H.chain !== "all") list = list.filter((t) => t.net === H.chain);
      if (H.cat !== "all") list = list.filter((t) => t.cat === H.cat);
      if (H.q) { const q = H.q.toLowerCase(); list = list.filter((t) => (t.name + " " + t.symbol + " " + t.address).toLowerCase().includes(q)); }
      return Market[H.sort](list);
    },

    renderGrid() {
      const list = H.filtered();
      $("#tokenGrid").innerHTML = list.length
        ? list.slice(0, H.limit).map(H.card).join("")
        : `<div class="empty-state">No pet coins match this filter yet 🐾</div>`;
      $("#moreBtn").hidden = list.length <= H.limit;
    },

    renderChips() {
      const nets = Chain.list();
      $("#chainChips").innerHTML = nets.length > 1
        ? [`<button class="chip ${H.chain === "all" ? "active" : ""}" data-action="chain" data-net="all">All chains</button>`,
           ...nets.map((n) => `<button class="chip ${H.chain === n.id ? "active" : ""}" data-action="chain" data-net="${n.id}"><img src="${n.icon}" alt="">${esc(n.short)} <span class="muted">${Market.tokens.filter((t) => t.net === n.id).length}</span></button>`)].join("")
        : "";
      const cats = CFG.market.categories.filter((c) => Market.tokens.some((t) => t.cat === c.id));
      $("#catChips").innerHTML = [`<button class="chip ${H.cat === "all" ? "active" : ""}" data-action="cat" data-cat="all">All pets</button>`,
        ...cats.map((c) => `<button class="chip ${H.cat === c.id ? "active" : ""}" data-action="cat" data-cat="${c.id}">${c.emoji} ${esc(c.label)}</button>`)].join("");
    },

    renderNew() {
      const list = Market.newest(Market.tokens).slice(0, 8);
      $("#newList").innerHTML = list.length ? list.map((t) => {
        const n = Chain.get(t.net);
        return `<div class="nrow">
          ${H.logo(t)}
          <div class="nm"><b>${esc(t.name)} <img src="${n.icon}" alt="${esc(n.short)}" title="${esc(n.name)}"></b><span class="mono small muted">$${esc(t.symbol)} · ${esc(short(t.address, 5, 4))}</span></div>
          <div class="hide-sm"><span class="lbl">Age</span><span class="age">${ago(t.created)}</span></div>
          <div class="hide-sm"><span class="lbl">MCap</span><b>${usd(t.mcap)}</b></div>
          <div class="hide-md"><span class="lbl">Vol 24h</span><b>${usd(t.vol24)}</b></div>
          <div class="hide-md"><span class="lbl">24h</span>${H.chg(t.chg24) || "—"}</div>
          <button class="btn btn-primary btn-sm" data-action="copy" data-text="${esc(t.address)}">Copy CA</button>
        </div>`;
      }).join("") : `<div class="empty-state" style="color:var(--ink)">No new pet coins found right now.</div>`;
    },

    renderComm() {
      const list = Market.communities(Market.tokens);
      const max = Math.max(1, ...list.map((c) => c.mcap));
      $("#commGrid").innerHTML = list.length ? list.map((c, i) => `<div class="comm ${i === 0 ? "lead" : ""}">
        <div class="emo">${c.emoji}</div><h3>${esc(c.label)}${i === 0 ? " 👑" : ""}</h3>
        <div class="bar"><i style="width:${(c.mcap / max) * 100}%"></i></div>
        <div class="kv"><span>Coins</span><b>${c.count}</b></div>
        <div class="kv"><span>Market cap</span><b>${usd(c.mcap)}</b></div>
        <div class="kv"><span>Vol 24h</span><b>${usd(c.vol)}</b></div>
        ${c.top ? `<div class="kv"><span>Top dog</span><b>$${esc(c.top.symbol)}</b></div>` : ""}
      </div>`).join("") : `<div class="empty-state">Loading communities…</div>`;
    },

    renderStats() {
      const s = Market.stats(Market.tokens);
      const set = (k, v) => { const el = document.querySelector(`[data-stat="${k}"]`); if (el) el.textContent = v; };
      set("count", s.count.toLocaleString("en-US")); set("vol", usd(s.vol)); set("mcap", usd(s.mcap));
      set("tx", s.tx.toLocaleString("en-US")); set("new24", s.new24.toLocaleString("en-US"));
      $("#statsNote").innerHTML = `Live pet-coin market on ${esc(UI.vars().netName)} · DexScreener data · updated ${new Date(Market.updatedAt).toLocaleTimeString()}`;
    },

    renderAll() { H.renderChips(); H.renderGrid(); H.renderNew(); H.renderComm(); H.renderStats(); },

    async refresh() {
      try { await Market.load(); H.renderAll(); }
      catch {
        if (!Market.tokens.length) {
          $("#tokenGrid").innerHTML = `<div class="empty-state">Market data is temporarily unavailable. Retrying… 🐾</div>`;
          $("#newList").innerHTML = `<div class="empty-state" style="color:var(--ink)">Market data unavailable.</div>`;
          document.querySelectorAll("[data-stat]").forEach((el) => (el.textContent = "—"));
        }
      }
    },

    /* ---------- Static sections from config ---------- */
    renderUtility() {
      $("#utilGrid").innerHTML = CFG.utility.map((u) => `<div class="util"><div class="ic">${u.icon}</div><h4>${esc(u.title)}</h4><p>${esc(u.text)}</p></div>`).join("");
    },
    renderFees() {
      const nets = Chain.list();
      $("#feeBody").innerHTML = CFG.fees.map((f) => {
        let val;
        if (String(f.value).startsWith("net:")) {
          const k = f.value.slice(4);
          val = nets.length === 1 ? esc(nets[0].fees[k]) : nets.map((n) => `<span class="per"><img src="${n.icon}" alt="">${esc(n.fees[k])}</span>`).join("");
        } else val = esc(f.value);
        return `<tr><td>${esc(f.name)}</td><td class="fee-val">${val}</td><td>${esc(f.note)}</td></tr>`;
      }).join("");
    },
    renderRoadmap() {
      $("#roadGrid").innerHTML = CFG.roadmap.map((p) => `<div class="phase"><span class="ph">${esc(p.phase)}</span><h3>${esc(p.title)}</h3><ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("");
    },

    async renderPet() {
      const nets = Chain.list();
      $("#chainRows").innerHTML = nets.map((n) => {
        const ca = Chain.ca(n.id);
        return `<div class="chain-row"><img src="${n.icon}" alt=""><div class="nm"><b>${esc(n.name)}</b><code>${ca ? esc(short(ca, 8, 6)) : "Coming soon"}</code></div>
          ${ca ? `<button class="btn btn-sm btn-primary" data-action="copy" data-text="${esc(ca)}">Copy</button>` : ""}</div>`;
      }).join("");
      const base = [["Ticker", CFG.project.ticker], ["Network" + (nets.length > 1 ? "s" : ""), nets.length > 1 ? nets.length + " chains" : nets[0].name]];
      CFG.tokenomics.filter((t) => t.value).forEach((t) => base.push([t.label, t.value]));
      const draw = (extra = []) => ($("#petStats").innerHTML = [...extra, ...base].map(([k, v]) => `<div class="param"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join(""));
      draw();
      if (!nets.some((n) => Chain.ca(n.id))) return;

      const [mk, supplies] = await Promise.all([
        Market.petMarket(),
        Promise.all(nets.map(async (n) => [n.id, Chain.ca(n.id) ? await Chain.totalSupply(n.id) : null])),
      ]);
      const extra = [];
      const sup = supplies.find(([id, v]) => v !== null && id === Chain.primary()) || supplies.find(([, v]) => v !== null);
      if (sup) extra.push(["Total supply", Number(sup[1]).toLocaleString("en-US", { maximumFractionDigits: 0 })]);
      const m = mk[Chain.primary()] || Object.values(mk)[0];
      if (m) {
        extra.push(["Price", price(m.price)], ["Market cap", usd(m.mcap)]);
        const liq = Object.values(mk).reduce((s, x) => s + x.liqTotal, 0), vol = Object.values(mk).reduce((s, x) => s + x.volTotal, 0);
        extra.push(["Liquidity (all chains)", usd(liq)], ["Volume 24h (all chains)", usd(vol)]);
      }
      draw(extra);
    },

    init() {
      UI.handlers.sort = (el) => { H.sort = el.dataset.sort; H.limit = 12; document.querySelectorAll("#sortChips .chip").forEach((c) => c.classList.toggle("active", c === el)); H.renderGrid(); };
      UI.handlers.chain = (el) => { H.chain = el.dataset.net; H.limit = 12; H.renderChips(); H.renderGrid(); };
      UI.handlers.cat = (el) => { H.cat = el.dataset.cat; H.limit = 12; H.renderChips(); H.renderGrid(); };
      UI.handlers.more = () => { H.limit += 12; H.renderGrid(); };
      $("#search").addEventListener("input", (e) => { H.q = e.target.value.trim(); H.renderGrid(); });

      H.renderUtility(); H.renderFees(); H.renderRoadmap(); H.renderPet();
      H.refresh();
      setInterval(() => { if (!document.hidden) H.refresh(); }, CFG.market.refreshSec * 1000);
    },
  };

  UI.init();
  H.init();
})();
