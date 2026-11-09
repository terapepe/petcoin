/* petcoin.fun — shared token renderers (cards, rows, communities, featured). */
(function () {
  const { esc, short, usd, price, ago } = UI;

  const Cards = {
    initials(t) { return esc((t.symbol || "?").replace(/^\$/, "").slice(0, 3).toUpperCase()); },
    img(t, cls = "t-img") {
      const ph = `<span class="${cls} ph">${Cards.initials(t)}</span>`;
      return t.image ? `<img class="${cls}" src="${esc(t.image)}" alt="" loading="lazy" onerror="this.outerHTML=this.dataset.ph" data-ph="${esc(ph)}">` : ph;
    },
    chg(v) { return v === null || v === undefined ? "—" : `<span class="chg ${v >= 0 ? "up" : "down"}">${v >= 0 ? "▲" : "▼"} ${Math.abs(v).toFixed(1)}%</span>`; },
    curve(t) {
      const done = t.progress >= 1, pct = Math.round(t.progress * 100);
      return `<div><div class="curve-top"><span>${done ? "🎓 Graduated" : "Progress"}</span><b>${pct}%</b></div><div class="curve-bar ${done ? "done" : ""}"><i style="width:${Math.max(3, pct)}%"></i></div></div>`;
    },

    card(t, i, rank) {
      const n = Chain.get(t.net);
      return `<div class="tcard">
        <div class="t-imgwrap">${Cards.img(t)}<img class="t-chain" src="${n.icon}" alt="${esc(n.name)}" title="${esc(n.name)}">${rank && i < 3 ? `<span class="rank">#${i + 1} 🔥</span>` : ""}</div>
        <div class="t-title" title="${esc(t.name)}">${esc(t.name)} <span class="tk">($${esc(t.symbol)})</span></div>
        <div class="kvr"><span>Price</span><b>${price(t.price)}</b></div>
        <div class="kvr"><span>Marketcap</span><b class="pos">${usd(t.mcap)}</b></div>
        <div class="kvr"><span>Vol 24h · Change</span><span><b>${usd(t.vol24)}</b> · ${Cards.chg(t.chg24)}</span></div>
        ${Cards.curve(t)}
        <div class="t-actions">
          <button class="btn btn-primary btn-sm" data-action="copy" data-text="${esc(t.address)}">Copy CA</button>
          <a class="btn btn-sm" href="${esc(t.url)}" target="_blank" rel="noopener">Trade ↗</a>
        </div>
      </div>`;
    },

    row(t) {
      const n = Chain.get(t.net);
      return `<div class="nrow">
        ${Cards.img(t, "t-logo")}
        <div class="nm"><b>${esc(t.name)} <img src="${n.icon}" alt="${esc(n.short)}" title="${esc(n.name)}"></b><span class="mono small muted">$${esc(t.symbol)} · ${esc(short(t.address, 5, 4))}</span></div>
        <div class="hide-sm"><span class="lbl">Age</span><span class="age">${ago(t.created)}</span></div>
        <div class="hide-sm"><span class="lbl">MCap</span><b>${usd(t.mcap)}</b></div>
        <div class="hide-md"><span class="lbl">Vol 24h</span><b>${usd(t.vol24)}</b></div>
        <div class="hide-md"><span class="lbl">24h</span>${Cards.chg(t.chg24)}</div>
        <button class="btn btn-primary btn-sm" data-action="copy" data-text="${esc(t.address)}">Copy CA</button>
      </div>`;
    },

    comm(list) {
      const max = Math.max(1, ...list.map((c) => c.mcap));
      return list.map((c, i) => `<div class="comm ${i === 0 ? "lead" : ""}">
        <div class="emo">${c.emoji}</div><h3>${esc(c.label)}${i === 0 ? " 👑" : ""}</h3>
        <div class="bar"><i style="width:${(c.mcap / max) * 100}%"></i></div>
        <div class="kv"><span>Coins</span><b>${c.count}</b></div>
        <div class="kv"><span>Market cap</span><b>${usd(c.mcap)}</b></div>
        <div class="kv"><span>Vol 24h</span><b>${usd(c.vol)}</b></div>
        ${c.top ? `<div class="kv"><span>Top dog</span><b>$${esc(c.top.symbol)}</b></div>` : ""}
      </div>`).join("");
    },

    featured(t) {
      const n = Chain.get(t.net);
      return `<div class="feat">
        ${Cards.img(t)}
        <div>
          <span class="feat-badge">🔥 Trending now</span>
          <h3>${esc(t.name)} ($${esc(t.symbol)})</h3>
          <div class="desc"><img src="${n.icon}" alt="" style="width:16px;display:inline;vertical-align:-3px"> ${esc(n.name)} · ${esc(short(t.address, 6, 4))}</div>
          <div class="kv"><span>Price</span><b>${price(t.price)}</b></div>
          <div class="kv"><span>Marketcap</span><b>${usd(t.mcap)}</b></div>
          <div class="kv"><span>Vol 24h</span><b>${usd(t.vol24)}</b></div>
          ${Cards.curve(t)}
          <div class="t-actions" style="margin-top:12px"><button class="btn btn-primary btn-sm" data-action="copy" data-text="${esc(t.address)}">Copy CA</button><a class="btn btn-sm" href="${esc(t.url)}" target="_blank" rel="noopener">Trade ↗</a></div>
        </div>
      </div>`;
    },

    stats(s) {
      const set = (k, v) => document.querySelectorAll(`[data-stat="${k}"]`).forEach((el) => (el.textContent = v));
      set("count", s.count.toLocaleString("en-US")); set("vol", usd(s.vol)); set("mcap", usd(s.mcap));
      set("tx", s.tx.toLocaleString("en-US")); set("new24", s.new24.toLocaleString("en-US"));
    },
  };

  window.Cards = Cards;
})();
