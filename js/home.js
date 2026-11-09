/* petcoin.fun — homepage. */
(function () {
  const CFG = window.PET_CONFIG;
  const { $, esc, short, usd, price } = UI;

  const H = {
    feat: [], fi: 0,

    renderFeatured() {
      if (!H.feat.length) { $("#featured").innerHTML = `<div class="empty-state">Live market data loading…</div>`; return; }
      $("#featured").innerHTML = Cards.featured(H.feat[H.fi]);
      $("#featDots").innerHTML = H.feat.map((_, i) => `<button class="${i === H.fi ? "active" : ""}" data-action="feat" data-i="${i}" aria-label="Show ${i + 1}"></button>`).join("");
    },

    renderMarket() {
      const all = Market.tokens, trend = Market.trending(all);
      H.feat = trend.slice(0, 3); H.fi = Math.min(H.fi, Math.max(0, H.feat.length - 1));
      H.renderFeatured();
      $("#tokenGrid").innerHTML = trend.length ? trend.slice(0, 8).map((t, i) => Cards.card(t, i, true)).join("") : `<div class="empty-state">No pet coins found right now 🐾</div>`;
      const nw = Market.newest(all).slice(0, 5);
      $("#newList").innerHTML = nw.length ? nw.map(Cards.row).join("") : `<div class="empty-state">No new pet coins found right now.</div>`;
      Cards.stats(Market.stats(all));
      UI.setTicker(trend);
      $("#statsNote").textContent = `Live pet-coin market on ${UI.vars().netName.replace(/<[^>]+>/g, "")} · DexScreener · updated ${new Date(Market.updatedAt).toLocaleTimeString()}`;
    },

    async refresh() {
      try { await Market.load(); H.renderMarket(); }
      catch {
        if (Market.tokens.length) return;
        $("#featured").innerHTML = `<div class="empty-state">Market data temporarily unavailable. Retrying…</div>`;
        $("#tokenGrid").innerHTML = `<div class="empty-state">Market data temporarily unavailable. Retrying… 🐾</div>`;
        $("#newList").innerHTML = `<div class="empty-state">Market data unavailable.</div>`;
        document.querySelectorAll("[data-stat]").forEach((el) => (el.textContent = "—"));
      }
    },

    renderUtility() {
      $("#utilGrid").innerHTML = CFG.utility.map((u) => `<div class="util"><div class="ic">${u.icon}</div><h4>${esc(u.title)}</h4><p>${esc(u.text)}</p></div>`).join("");
    },
    renderFees() {
      const nets = Chain.list(), L = CFG.launchpad;
      $("#feeBody").innerHTML = CFG.fees.map((f) => {
        let val;
        if (f.value === "tiers") val = `<div class="tiers">${L.feeTiers.map((x) => `<span>${x}%</span>`).join("")}</div>`;
        else if (String(f.value).startsWith("net:")) {
          const k = f.value.slice(4);
          val = nets.length === 1 ? esc(nets[0].fees[k]) : nets.map((n) => `<span class="per"><img src="${n.icon}" alt="">${esc(n.fees[k])}</span>`).join("");
        } else val = esc(f.value);
        return `<tr><td>${esc(f.name)}</td><td class="fee-val">${val}</td><td>${esc(f.note)}</td></tr>`;
      }).join("");
      const sp = L.feeSplit;
      $("#feeSplit").innerHTML = `<div style="flex:${sp.creator};background:var(--primary);color:var(--on-primary)">${sp.creator}% Creator (pet owner)</div>
        <div style="flex:${sp.platform};background:color-mix(in srgb,var(--accent) 80%,#000)">${sp.platform}% Platform</div>`;
      const r = (x, p) => +(x * p / 100).toFixed(3);
      $("#feeTiers").innerHTML = L.feeTiers.map((x) => `<span>${x}% fee → <b>${r(x, sp.creator)}%</b> creator · <b>${r(x, sp.platform)}%</b> platform</span>`).join("");
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
        extra.push(["Liquidity (all chains)", usd(Object.values(mk).reduce((s, x) => s + x.liqTotal, 0))], ["Volume 24h (all chains)", usd(Object.values(mk).reduce((s, x) => s + x.volTotal, 0))]);
      }
      draw(extra);
    },

    init() {
      UI.handlers.feat = (el) => { H.fi = +el.dataset.i; H.renderFeatured(); };
      setInterval(() => { if (H.feat.length > 1 && !document.hidden) { H.fi = (H.fi + 1) % H.feat.length; H.renderFeatured(); } }, 6000);
      H.renderUtility(); H.renderFees(); H.renderRoadmap(); H.renderPet();
      H.refresh();
      setInterval(() => { if (!document.hidden) H.refresh(); }, CFG.market.refreshSec * 1000);
    },
  };

  UI.init();
  H.init();
})();
