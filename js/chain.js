/* PetCoin — network helpers + live on-chain reads (JSON-RPC, no libraries). */
(function () {
  const CFG = window.PET_CONFIG;

  const Chain = {
    isSingle() { return CFG.mode === "single" && !!CFG.networks[CFG.singleNetwork]; },
    primary() { return Chain.isSingle() ? CFG.singleNetwork : CFG.primaryNetwork; },
    /** Active networks for the current mode (single → 1, multi → all 4). */
    list() {
      const p = Chain.primary();
      return Object.entries(CFG.networks).map(([id, n]) => ({ id, ...n }))
        .filter((n) => !Chain.isSingle() || n.id === p)
        .sort((a, b) => (b.id === p) - (a.id === p));
    },
    get(id) { const n = CFG.networks[id]; return n ? { id, ...n } : null; },
    byChainId(cid) { return Chain.list().find((n) => n.type === "evm" && n.chainId === Number(cid)) || null; },
    hex(cid) { return "0x" + Number(cid).toString(16); },
    /** EVM networks share token.evm, Solana uses token.sol. */
    ca(id) { const n = CFG.networks[id]; return n ? ((n.type === "solana" ? CFG.token.sol : CFG.token.evm) || "").trim() : ""; },

    explorerToken(id) { const n = CFG.networks[id], a = Chain.ca(id); return n && a ? n.explorer + a : ""; },
    explorerAddr(id, addr) { const n = CFG.networks[id]; return n && addr ? n.explorerAddr + addr : ""; },
    chartUrl(id) { const n = CFG.networks[id], a = Chain.ca(id); return n && a && n.dexscreener ? `https://dexscreener.com/${n.dexscreener}/${a}` : ""; },

    async rpc(id, method, params) {
      const n = CFG.networks[id];
      const res = await fetch(n.rpcUrls[0], {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
      const j = await res.json();
      if (j.error) throw new Error(j.error.message || "RPC error");
      return j.result;
    },

    format(raw, dec) {
      const b = BigInt(raw), d = 10n ** BigInt(dec);
      const i = b / d; const f = (b % d).toString().padStart(dec, "0").replace(/0+$/, "");
      return i.toString() + (f ? "." + f : "");
    },

    async evmCall(id, to, data, provider) {
      const params = [{ to, data }, "latest"];
      return provider ? provider.request({ method: "eth_call", params }) : Chain.rpc(id, "eth_call", params);
    },
    async evmDecimals(id, ca, provider) {
      try { return Number(BigInt(await Chain.evmCall(id, ca, "0x313ce567", provider))); }
      catch { return CFG.project.decimalsFallback; }
    },

    /** Live total supply (decimal string) or null if CA not set / unreachable. */
    async totalSupply(id) {
      const n = CFG.networks[id], ca = Chain.ca(id);
      if (!n || !ca) return null;
      try {
        if (n.type === "solana") {
          const r = await Chain.rpc(id, "getTokenSupply", [ca]);
          return Chain.format(r.value.amount, r.value.decimals);
        }
        const dec = await Chain.evmDecimals(id, ca);
        return Chain.format(await Chain.evmCall(id, ca, "0x18160ddd"), dec);
      } catch { return null; }
    },

    /** $PET balance of a wallet on a network, or null. */
    async balanceOf(id, owner, provider) {
      const n = CFG.networks[id], ca = Chain.ca(id);
      if (!n || !ca || !owner) return null;
      try {
        if (n.type === "solana") {
          const r = await Chain.rpc(id, "getTokenAccountsByOwner", [owner, { mint: ca }, { encoding: "jsonParsed" }]);
          let raw = 0n, dec = 0;
          for (const acc of r.value || []) {
            const t = acc.account.data.parsed.info.tokenAmount;
            raw += BigInt(t.amount); dec = t.decimals;
          }
          return Chain.format(raw, dec);
        }
        const data = "0x70a08231" + owner.toLowerCase().replace(/^0x/, "").padStart(64, "0");
        const dec = await Chain.evmDecimals(id, ca, provider);
        return Chain.format(await Chain.evmCall(id, ca, data, provider), dec);
      } catch { return null; }
    },
  };

  window.Chain = Chain;
})();
