/* petcoin.fun — Explore page (live DexScreener data). */
(function () {
  const CFG = window.PET_CONFIG;
  const { $, $$, esc } = UI;
  const S = { tab: "trending", chain: "all", cat: "all", q: "", sort: "", order: "desc", limit: 16 };

  function list() {
    let l = Market.tokens;
    if (S.chain !== "all") l = l.filter((t) => t.net === S.chain);
    if (S.cat !== "all") l = l.filter((t) => t.cat === S.cat);
    if (S.q) { const q = S.q.toLowerCase(); l = l.filter((t) => (t.name + " " + t.symbol + " " + t.address).toLowerCase().includes(q)); }
    l = Market[S.tab](l);
    if (S.sort) l = [...l].sort((a, b) => (b[S.sort] ?? -Infinity) - (a[S.sort] ?? -Infinity));
    if (S.order === "asc") l = l.reverse();
    return l;
  }

  function renderGrid() {
    const l = list();
    $("#tokenGrid").innerHTML = l.length ? l.slice(0, S.limit).map((t, i) => Cards.card(t, i, S.tab === "trending" && !S.sort && S.order === "desc")).join("") : `<div class="empty-state">No pet coins match this filter yet 🐾</div>`;
    $("#moreBtn").hidden = l.length <= S.limit;
  }

  function renderChips() {
    const nets = Chain.list();
    $("#chainChips").innerHTML = nets.length > 1
      ? [`<button class="chip ${S.chain === "all" ? "active" : ""}" data-action="chain" data-net="all">All chains</button>`,
         ...nets.map((n) => `<button class="chip ${S.chain === n.id ? "active" : ""}" data-action="chain" data-net="${n.id}"><img src="${n.icon}" alt="">${esc(n.short)} <span class="muted">${Market.tokens.filter((t) => t.net === n.id).length}</span></button>`)].join("")
      : `<span class="chip active"><img src="${nets[0].icon}" alt="">${esc(nets[0].name)}</span>`;
    const cats = CFG.market.categories.filter((c) => Market.tokens.some((t) => t.cat === c.id));
    $("#catChips").innerHTML = [`<button class="chip ${S.cat === "all" ? "active" : ""}" data-action="cat" data-cat="all">All pets</button>`,
      ...cats.map((c) => `<button class="chip ${S.cat === c.id ? "active" : ""}" data-action="cat" data-cat="${c.id}">${c.emoji} ${esc(c.label)}</button>`)].join("");
  }

  function renderAll() {
    renderChips(); renderGrid();
    const nw = Market.newest(Market.tokens).slice(0, 10);
    $("#newList").innerHTML = nw.length ? nw.map(Cards.row).join("") : `<div class="empty-state">No new pet coins found right now.</div>`;
    const c = Market.communities(Market.tokens);
    $("#commGrid").innerHTML = c.length ? Cards.comm(c) : `<div class="empty-state">No communities yet.</div>`;
    Cards.stats(Market.stats(Market.tokens));
    UI.setTicker(Market.trending(Market.tokens));
  }

  async function refresh() {
    try { await Market.load(); renderAll(); }
    catch {
      if (Market.tokens.length) return;
      $("#tokenGrid").innerHTML = `<div class="empty-state">Market data temporarily unavailable. Retrying… 🐾</div>`;
      $("#newList").innerHTML = $("#commGrid").innerHTML = `<div class="empty-state">Market data unavailable.</div>`;
      $$("[data-stat]").forEach((el) => (el.textContent = "—"));
    }
  }

  UI.init();
  UI.handlers.tab = (el) => { S.tab = el.dataset.tab; S.limit = 16; $$("#tabs button").forEach((b) => b.classList.toggle("active", b === el)); renderGrid(); };
  UI.handlers.chain = (el) => { S.chain = el.dataset.net; S.limit = 16; renderChips(); renderGrid(); };
  UI.handlers.cat = (el) => { S.cat = el.dataset.cat; S.limit = 16; renderChips(); renderGrid(); };
  UI.handlers.more = () => { S.limit += 16; renderGrid(); };
  $("#search").addEventListener("input", (e) => { S.q = e.target.value.trim(); renderGrid(); });
  $("#sortSel").addEventListener("change", (e) => { S.sort = e.target.value; renderGrid(); });
  $("#orderSel").addEventListener("change", (e) => { S.order = e.target.value; renderGrid(); });
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, CFG.market.refreshSec * 1000);
})();
