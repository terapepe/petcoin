/* petcoin.fun — live pet-coin market data from DexScreener (no demo data). */
(function () {
  const CFG = window.PET_CONFIG, M = CFG.market;

  const Market = {
    tokens: [],
    updatedAt: 0,

    /** DexScreener chain slugs for active networks → network id */
    slugs() {
      const map = {};
      Chain.list().forEach((n) => { if (n.dexscreener) map[n.dexscreener] = n.id; });
      return map;
    },

    isPet(t) {
      const s = (t.name + " " + t.symbol).toLowerCase();
      return M.keywords.some((k) => s.includes(k)) || M.categories.some((c) => c.match.some((k) => s.includes(k)));
    },
    category(t) {
      const s = (t.name + " " + t.symbol).toLowerCase();
      return (M.categories.find((c) => c.match.some((k) => s.includes(k))) || M.categories[M.categories.length - 1]).id;
    },

    async get(path) {
      const r = await fetch(M.api + path, { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    },

    /** Normalise a DexScreener pair into a token row. */
    row(p, netId) {
      const mcap = p.marketCap || p.fdv || 0;
      const tx = p.txns?.h24 || {};
      const t = {
        net: netId, chain: p.chainId, address: p.baseToken.address, name: p.baseToken.name, symbol: p.baseToken.symbol,
        image: p.info?.imageUrl || "", url: p.url, dexId: p.dexId,
        price: Number(p.priceUsd) || 0, mcap, liq: p.liquidity?.usd || 0,
        vol24: p.volume?.h24 || 0, chg24: p.priceChange?.h24 ?? null, chg1: p.priceChange?.h1 ?? null,
        tx24: (tx.buys || 0) + (tx.sells || 0), buys: tx.buys || 0, sells: tx.sells || 0,
        created: p.pairCreatedAt || 0,
        socials: (p.info?.socials || []).length,
      };
      t.progress = Math.min(1, mcap / CFG.launchpad.graduationMcapUsd);
      t.cat = Market.category(t);
      return t;
    },

    async load() {
      const slugs = Market.slugs();
      const res = await Promise.allSettled(M.keywords.map((k) => Market.get("/latest/dex/search?q=" + encodeURIComponent(k))));
      const best = new Map();
      for (const r of res) {
        if (r.status !== "fulfilled") continue;
        for (const p of r.value.pairs || []) {
          const netId = slugs[p.chainId];
          if (!netId || !p.baseToken) continue;
          if ((p.liquidity?.usd || 0) < M.minLiquidityUsd) continue;
          if (!Market.isPet(p.baseToken)) continue;
          const key = p.chainId + ":" + p.baseToken.address.toLowerCase();
          const prev = best.get(key);
          if (!prev || (p.liquidity?.usd || 0) > prev.liq) best.set(key, Market.row(p, netId));
        }
      }
      if (!best.size && res.every((r) => r.status === "rejected")) throw new Error("Market data unavailable");
      Market.tokens = [...best.values()];
      Market.updatedAt = Date.now();
      return Market.tokens;
    },

    trending(list) { return [...list].sort((a, b) => b.vol24 - a.vol24); },
    gainers(list) { return [...list].filter((t) => t.chg24 !== null && t.vol24 > 1000).sort((a, b) => b.chg24 - a.chg24); },
    graduating(list) { return [...list].filter((t) => t.progress < 1).sort((a, b) => b.progress - a.progress); },
    newest(list) { return [...list].filter((t) => t.created).sort((a, b) => b.created - a.created); },

    stats(list) {
      const day = Date.now() - 86400000;
      return {
        count: list.length,
        vol: list.reduce((s, t) => s + t.vol24, 0),
        mcap: list.reduce((s, t) => s + t.mcap, 0),
        tx: list.reduce((s, t) => s + t.tx24, 0),
        new24: list.filter((t) => t.created > day).length,
      };
    },

    communities(list) {
      return M.categories.map((c) => {
        const items = list.filter((t) => t.cat === c.id);
        const top = [...items].sort((a, b) => b.mcap - a.mcap)[0] || null;
        return { ...c, count: items.length, mcap: items.reduce((s, t) => s + t.mcap, 0), vol: items.reduce((s, t) => s + t.vol24, 0), top };
      }).filter((c) => c.count).sort((a, b) => b.mcap - a.mcap);
    },

    /** $PET market data for each active network that has a CA. */
    async petMarket() {
      const out = {};
      await Promise.all(Chain.list().map(async (n) => {
        const ca = Chain.ca(n.id);
        if (!ca || !n.dexscreener) return;
        try {
          const pairs = await Market.get(`/tokens/v1/${n.dexscreener}/${ca}`);
          const list = (Array.isArray(pairs) ? pairs : pairs.pairs || []).filter((p) => p.baseToken?.address?.toLowerCase() === ca.toLowerCase());
          if (!list.length) return;
          const top = list.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
          out[n.id] = { ...Market.row(top, n.id), liqTotal: list.reduce((s, p) => s + (p.liquidity?.usd || 0), 0), volTotal: list.reduce((s, p) => s + (p.volume?.h24 || 0), 0) };
        } catch {}
      }));
      return out;
    },
  };

  window.Market = Market;
})();
