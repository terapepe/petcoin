/* PetCoin — wallet login. EVM (EIP-6963/EIP-1193) for Robinhood/Base/BSC, injected Solana wallets for Solana. */
(function () {
  const evmProviders = new Map(); // rdns -> { info, provider }
  const KEY = "pet.wallet";
  const EMPTY = { connected: false, type: null, network: null, address: null, provider: null, walletName: null, key: null, balance: null };

  const SOL_WALLETS = [
    { key: "phantom", name: "Phantom", url: "https://phantom.app", get: () => window.phantom?.solana?.isPhantom ? window.phantom.solana : (window.solana?.isPhantom ? window.solana : null) },
    { key: "solflare", name: "Solflare", url: "https://solflare.com", get: () => window.solflare?.isSolflare ? window.solflare : null },
    { key: "backpack", name: "Backpack", url: "https://backpack.app", get: () => window.backpack?.solana || window.backpack || null },
  ];

  const W = {
    state: { ...EMPTY },

    init() {
      window.addEventListener("eip6963:announceProvider", (e) => {
        const { info, provider } = e.detail || {};
        if (info && provider) evmProviders.set(info.rdns || info.uuid, { info, provider });
      });
      window.dispatchEvent(new Event("eip6963:requestProvider"));
      W.restore();
    },

    /** Wallets available for a network type. */
    wallets(type) {
      if (type === "solana") {
        return SOL_WALLETS.map((w) => ({ key: w.key, name: w.name, icon: w.get()?.icon || "", installed: !!w.get(), url: w.url }));
      }
      const list = [...evmProviders.values()].map(({ info }) => ({ key: info.rdns || info.uuid, name: info.name, icon: info.icon, installed: true }));
      if (!list.length && window.ethereum) list.push({ key: "injected", name: window.ethereum.isMetaMask ? "MetaMask" : "Browser Wallet", icon: "", installed: true });
      if (!list.length) {
        list.push({ key: "metamask", name: "MetaMask", url: "https://metamask.io", installed: false },
                  { key: "rabby", name: "Rabby", url: "https://rabby.io", installed: false });
      }
      return list;
    },

    evmProvider(key) {
      const e = evmProviders.get(key);
      if (e) return { provider: e.provider, name: e.info.name };
      const first = [...evmProviders.values()][0];
      if (first) return { provider: first.provider, name: first.info.name };
      if (window.ethereum) return { provider: window.ethereum, name: window.ethereum.isMetaMask ? "MetaMask" : "Browser Wallet" };
      return null;
    },

    async connect(netId, key) {
      const net = Chain.get(netId);
      if (!net) throw new Error("Unknown network");
      if (net.type === "solana") {
        const def = SOL_WALLETS.find((w) => w.key === key);
        const p = def && def.get();
        if (!p) throw new Error(`${def ? def.name : "Solana wallet"} not detected.`);
        const r = await p.connect();
        const pk = (r && r.publicKey) || p.publicKey;
        W.set({ connected: true, type: "solana", network: netId, address: pk.toString(), provider: p, walletName: def.name, key });
        W.bindSol(p);
        return;
      }
      const ep = W.evmProvider(key);
      if (!ep) throw new Error("No EVM wallet detected. Install MetaMask, Rabby, Coinbase Wallet or similar.");
      const accounts = await ep.provider.request({ method: "eth_requestAccounts" });
      await W.switchEvm(ep.provider, net);
      W.set({ connected: true, type: "evm", network: netId, address: accounts[0], provider: ep.provider, walletName: ep.name, key });
      W.bindEvm(ep.provider);
    },

    async switchEvm(p, net) {
      const chainId = Chain.hex(net.chainId);
      try {
        await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId }] });
      } catch (e) {
        if (e.code === 4902 || /unrecognized|not added|unknown chain/i.test(e.message || "")) {
          await p.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId, chainName: net.name, nativeCurrency: net.nativeCurrency, rpcUrls: net.rpcUrls, blockExplorerUrls: [net.explorerAddr.replace(/\/address\/$/, "")] }],
          });
        } else throw e;
      }
    },

    /** Switch an EVM session to another EVM network. */
    async switchNetwork(netId) {
      const net = Chain.get(netId);
      if (W.state.type !== "evm" || net.type !== "evm") throw new Error("Reconnect with a wallet for this network.");
      await W.switchEvm(W.state.provider, net);
      W.set({ network: netId });
    },

    bindEvm(p) {
      if (p._petBound || !p.on) return;
      p._petBound = true;
      p.on("accountsChanged", (a) => { if (W.state.type !== "evm") return; a.length ? W.set({ address: a[0] }) : W.disconnect(); });
      p.on("chainChanged", (cid) => {
        if (W.state.type !== "evm") return;
        const n = Chain.byChainId(parseInt(cid, 16));
        W.set({ network: n ? n.id : null });
      });
    },

    bindSol(p) {
      if (p._petBound || !p.on) return;
      p._petBound = true;
      p.on("accountChanged", (pk) => { if (W.state.type !== "solana") return; pk ? W.set({ address: pk.toString() }) : W.disconnect(); });
      p.on("disconnect", () => { if (W.state.type === "solana") W.disconnect(); });
    },

    async disconnect() {
      const s = W.state;
      if (s.type === "solana" && s.provider?.disconnect) { try { await s.provider.disconnect(); } catch {} }
      W.state = { ...EMPTY };
      try { localStorage.removeItem(KEY); } catch {}
      W.emit();
    },

    set(patch) {
      Object.assign(W.state, patch);
      if (W.state.connected) {
        try { localStorage.setItem(KEY, JSON.stringify({ type: W.state.type, network: W.state.network, key: W.state.key })); } catch {}
      }
      W.emit();
      if ("address" in patch || "network" in patch) W.refreshBalance();
    },

    async refreshBalance() {
      const s = W.state;
      s.balance = null;
      if (!s.connected || !s.network) return W.emit();
      s.balance = await Chain.balanceOf(s.network, s.address);
      W.emit();
    },

    /** Silent reconnect if the wallet already authorised this site. */
    restore() {
      let saved; try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}
      if (!saved) return;
      setTimeout(async () => {
        try {
          if (saved.type === "solana") {
            const def = SOL_WALLETS.find((w) => w.key === saved.key), p = def && def.get();
            if (!p) return;
            const r = await p.connect({ onlyIfTrusted: true });
            const pk = (r && r.publicKey) || p.publicKey;
            if (!pk) return;
            W.set({ connected: true, type: "solana", network: "solana", address: pk.toString(), provider: p, walletName: def.name, key: saved.key });
            W.bindSol(p);
          } else if (saved.type === "evm") {
            const ep = W.evmProvider(saved.key);
            if (!ep) return;
            const acc = await ep.provider.request({ method: "eth_accounts" });
            if (!acc.length) return;
            const n = Chain.byChainId(parseInt(await ep.provider.request({ method: "eth_chainId" }), 16));
            W.set({ connected: true, type: "evm", network: n ? n.id : null, address: acc[0], provider: ep.provider, walletName: ep.name, key: saved.key });
            W.bindEvm(ep.provider);
          }
        } catch {}
      }, 400);
    },

    /** Sign a login message (for backend verification later). */
    async signMessage(message) {
      const s = W.state;
      if (!s.connected) throw new Error("Wallet not connected");
      if (s.type === "solana") {
        const r = await s.provider.signMessage(new TextEncoder().encode(message), "utf8");
        const sig = r.signature || r;
        return btoa(String.fromCharCode(...sig));
      }
      return s.provider.request({ method: "personal_sign", params: [message, s.address] });
    },

    emit() { window.dispatchEvent(new CustomEvent("wallet:change", { detail: W.state })); },
  };

  window.Wallet = W;
})();
