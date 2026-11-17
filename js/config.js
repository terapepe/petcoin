window.PET_CONFIG = {
  project: {
    brand: "petcoin.fun",
    name: "petcoindotfun",
    ticker: "$PET",
    symbol: "PET",
    tagline: "Turn your pet into a meme. Turn the meme into a coin.",
    decimalsFallback: 18,
  },

  social: {
    x: "https://x.com/petcoindotfun",
    xHandle: "@petcoindotfun",
    telegram: "",
  },

  mode: "single",
  singleNetwork: "base",
  primaryNetwork: "robinhood",

  token: {
    evm: "0x4906c461Cd8E395E379859434a573Ba2dBE14801",
    sol: "",
  },

  launchpad: {
    appUrl: "",
    /** Trading fee options the creator can pick (buy = sell, %) */
    feeTiers: [0.5, 1, 2, 3, 5],
    defaultFee: 1,
    /** Trading fee split (% of the fee). e.g. 1% fee → 0.8% creator, 0.2% platform */
    feeSplit: { creator: 80, platform: 20 },
    /** Market cap (USD) at which a coin graduates from the bonding curve to a DEX. Used for progress bars. */
    graduationMcapUsd: 69000,
  },

  market: {
    api: "https://api.dexscreener.com",
    keywords: ["dog", "cat", "inu", "puppy", "kitty", "shiba", "doge", "pup", "meow", "hamster", "bunny", "pet"],
    minLiquidityUsd: 3000,
    refreshSec: 60,
    categories: [
      { id: "dogs", label: "Dog Pack", emoji: "🐶", match: ["dog", "inu", "pup", "shib", "doge", "woof", "bark", "corgi", "pug", "husky", "akita"] },
      { id: "cats", label: "Cat Club", emoji: "🐱", match: ["cat", "kitty", "kitten", "meow", "neko", "purr", "popcat", "mew"] },
      { id: "small", label: "Tiny Paws", emoji: "🐹", match: ["hamster", "bunny", "rabbit", "hamst", "mouse", "guinea", "ferret"] },
      { id: "birds", label: "Bird Gang", emoji: "🦜", match: ["bird", "parrot", "duck", "chick", "owl"] },
      { id: "other", label: "Wild Pets", emoji: "🐾", match: [] },
    ],
  },

  /** Default color mode ("dark" | "light"). Users can toggle it; their choice is saved in the browser. */
  defaultColorMode: "dark",

  /** Multi-mode colors: primary = main color, accent = gradient color, warm = highlight, onPrimary = text on primary buttons */
  theme: { primary: "#8b5cf6", accent: "#2dd4bf", warm: "#ffb547", onPrimary: "#ffffff" },

  networks: {
    solana: {
      name: "Solana",
      short: "Solana",
      type: "solana",
      native: "SOL",
      rpcUrls: ["https://api.mainnet-beta.solana.com"],
      explorer: "https://solscan.io/token/",
      explorerAddr: "https://solscan.io/account/",
      dex: "Raydium",
      aggregator: "Jupiter",
      dexscreener: "solana",
      wallets: "Phantom, Solflare or Backpack",
      walletNote: "",
      pitch: "sub-second blocks, sub-cent fees",
      tokenStd: "SPL token",
      color: "#9945FF",
      icon: "assets/networks/solana.svg",
      theme: { primary: "#9945ff", accent: "#14f195", warm: "#ffb547", onPrimary: "#ffffff" },
      fees: { launch: "0.02 SOL", campaign: "0.01 SOL", graduation: "1.5 SOL" },
    },
    robinhood: {
      name: "Robinhood Chain",
      short: "Robinhood",
      type: "evm",
      chainId: 4663,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      native: "ETH",
      rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
      explorer: "https://robinhoodchain.blockscout.com/token/",
      explorerAddr: "https://robinhoodchain.blockscout.com/address/",
      dex: "Uniswap",
      aggregator: "Uniswap",
      dexscreener: "robinhood",
      wallets: "MetaMask, Rabby or Coinbase Wallet",
      walletNote: " Robinhood Chain is added to your wallet automatically when you connect.",
      pitch: "retail-ready EVM with Robinhood's reach",
      tokenStd: "ERC-20",
      color: "#CCFF00",
      icon: "assets/networks/robinhood.svg",
      theme: { primary: "#a3e635", accent: "#ccff00", warm: "#ffb547", onPrimary: "#0b1400" },
      fees: { launch: "0.001 ETH", campaign: "0.0005 ETH", graduation: "0.08 ETH" },
    },
    base: {
      name: "Base",
      short: "Base",
      type: "evm",
      chainId: 8453,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      native: "ETH",
      rpcUrls: ["https://mainnet.base.org"],
      explorer: "https://basescan.org/token/",
      explorerAddr: "https://basescan.org/address/",
      dex: "Uniswap",
      aggregator: "Aerodrome / Uniswap",
      dexscreener: "base",
      wallets: "Coinbase Wallet, MetaMask or Rabby",
      walletNote: " Base is added to your wallet automatically when you connect.",
      pitch: "onchain for everyone",
      tokenStd: "ERC-20",
      color: "#0052FF",
      icon: "assets/networks/base.svg",
      theme: { primary: "#0052ff", accent: "#5b9bff", warm: "#ffb547", onPrimary: "#ffffff" },
      fees: { launch: "0.001 ETH", campaign: "0.0005 ETH", graduation: "0.08 ETH" },
    },
    bsc: {
      name: "BNB Smart Chain",
      short: "BSC",
      type: "evm",
      chainId: 56,
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      native: "BNB",
      rpcUrls: ["https://bsc-dataseed.bnbchain.org"],
      explorer: "https://bscscan.com/token/",
      explorerAddr: "https://bscscan.com/address/",
      dex: "PancakeSwap",
      aggregator: "PancakeSwap",
      dexscreener: "bsc",
      wallets: "MetaMask, Trust Wallet or Rabby",
      walletNote: " BSC is added to your wallet automatically when you connect.",
      pitch: "deep liquidity, tiny fees",
      tokenStd: "BEP-20",
      color: "#F0B90B",
      icon: "assets/networks/bsc.svg",
      theme: { primary: "#f0b90b", accent: "#ffd84d", warm: "#ff8a3d", onPrimary: "#1e1600" },
      fees: { launch: "0.005 BNB", campaign: "0.003 BNB", graduation: "0.3 BNB" },
    },
  },

  fees: [
    { name: "Pet coin creation", value: "net:launch", note: "One-time fee to deploy a pet coin on the bonding curve. Pay in $PET for 50% off." },
    { name: "Trading fee (buy = sell)", value: "tiers", note: "Chosen by the creator at launch: 0.5%, 1%, 2%, 3% or 5%, same rate for buys and sells. Split: 80% creator · 20% platform (e.g. 1% fee → 0.8% creator, 0.2% platform)." },
    { name: "Memeify campaign", value: "net:campaign", note: "Opens a 72h voting campaign for your pet's moment. Refunded in $PET if your pet makes the Top 10." },
    { name: "Graduation (DEX listing)", value: "net:graduation", note: "Taken from curve liquidity when a coin hits the graduation cap. Remaining liquidity is locked & LP burned." },
    { name: "Vote stake", value: "Min 100 $PET", note: "Staked, not spent. Unlocks when the campaign ends. Winning voters share the Paw Pool." },
    { name: "NFT Meme mint royalty", value: "5%", note: "On secondary sales: 3% pet owner · 2% Paw Pool." },
  ],

  /** $PET tokenomics cards. Empty value "" = hidden */
  tokenomics: [
    { label: "Fair launch", value: "100%", note: "No presale, no team allocation" },
    { label: "Buy / Sell tax", value: "0 / 0", note: "Fees come from the launchpad, not the token" },
    { label: "Liquidity", value: "LP burned", note: "After graduation" },
  ],

  /** $PET utility cards */
  utility: [
    { icon: "🗳️", title: "Vote & stake", text: "Stake $PET to vote in Memeify campaigns. Pick the winner, share the Paw Pool." },
    { icon: "🚀", title: "Pay launch fees", text: "Pay creation and campaign fees in $PET and get 50% off on every network." },
    { icon: "🏆", title: "Reward viral pets", text: "Pet owners of viral memes earn $PET from the Paw Pool every season." },
    { icon: "🔥", title: "Buyback & burn", text: "Part of every curve trade fee buys back $PET from the market and burns it." },
    { icon: "🖼️", title: "NFT Meme drops", text: "$PET holders get early mint access to Hall-of-Fame NFT Meme collections." },
    { icon: "🦴", title: "Boost your pet", text: "Spend $PET to boost a campaign to the front page Trending row." },
  ],

  roadmap: [
    { phase: "Phase 1", title: "Sniff", items: ["$PET fair launch", "petcoin.fun website & docs", "Community on X", "CA on all supported chains"] },
    { phase: "Phase 2", title: "Fetch", items: ["Memeify campaigns beta", "Vote-to-earn with $PET", "Pet owner verification", "First Paw Pool season"] },
    { phase: "Phase 3", title: "Zoomies", items: ["Pet coin launchpad (bonding curve)", "Auto-graduation to DEX", "Creator & owner fee share", "Pay fees in $PET"] },
    { phase: "Phase 4", title: "Best in Show", items: ["NFT Meme collections", "Shelter donation pool", "Mobile Memeify app", "Pet brand partnerships"] },
  ],
};

/* ---- hybot sync: CA, token name, symbol, X and Telegram follow the newest token hybot launched for this site ----
   https://hybot.xyz/api/site-token?site=<domain> · values above are the fallback when hybot has none / is unreachable.
   Links in the page that point to the old X / Telegram are updated, or hidden when the launched token has none. */
(function (C) {
  if (!C || typeof window === "undefined") return;
  var DOMAIN = "petcoin.fun";
  var host = String(location.hostname || "").replace(/^www\./, "");
  var site = /\./.test(host) && !/(^|\.)(vercel\.app|localhost|127\.0\.0\.1)$/.test(host) ? host : DOMAIN;
  if (!site) return;
  var d = null, key = "hybot:" + site;
  try { var c = JSON.parse(localStorage.getItem(key) || "null"); if (c && Date.now() - c.t < 60000) d = c.d; } catch (e) {}
  if (!d) {
    try {
      var x = new XMLHttpRequest();
      x.open("GET", "https://hybot.xyz/api/site-token?site=" + encodeURIComponent(site), false); // sync: config must be ready before the app scripts run
      x.send();
      if (x.status === 200) { d = JSON.parse(x.responseText); try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} }
    } catch (e) {}
  }
  if (!d || !d.found || !/^0x[0-9a-fA-F]{40}$/.test(d.ca || "")) return;
  var handle = function (u) { var m = String(u || "").match(/(?:x|twitter)\.com\/@?([A-Za-z0-9_]{1,15})|^@?([A-Za-z0-9_]{1,15})$/); return m ? (m[1] || m[2]) : ""; };
  var tgName = function (u) { var m = String(u || "").match(/t\.me\/([\w+/-]+)/); return m ? m[1].replace(/\/+$/, "") : String(u || "").replace(/^@/, ""); };
  var X0 = C.social && C.social.x || "", TG0 = C.social && C.social.telegram || "";
  var oldX = handle(X0), oldTg = tgName(TG0);
  var X = d.x || "", TG = d.telegram || "", SYM = d.symbol, NAME = d.name, CA = d.ca;
  // no X / Telegram on the launched token → config keeps the old link so the app renders as usual, and the link fixer below hides it
  var XV = X || X0, TGV = TG || TG0, XH = handle(XV);
  // single-network per-chain CA overrides would win over the shared address → clear them
  var net = C.singleNetwork || C.singleChain || (C.token && C.token.singleNetwork);
  [C.networks, C.chains, C.token && C.token.chains].forEach(function (m) { if (m && net && m[net] && "ca" in m[net]) m[net].ca = ""; });
  C.project.name = NAME; C.project.ticker = "$" + SYM; C.project.symbol = SYM;
  C.social.x = XV; C.social.xHandle = XH ? "@" + XH : ""; C.social.telegram = TGV;
  C.token.evm = CA;
  // page links still pointing to the old X / Telegram (hard-coded or rendered later)
  var fix = function (root) {
    var as = root.querySelectorAll ? root.querySelectorAll("a[href]") : [];
    for (var i = 0; i < as.length; i++) {
      var a = as[i], h = a.getAttribute("href") || "";
      if (oldX && new RegExp("(x|twitter)\\.com/@?" + oldX + "(?![A-Za-z0-9_])", "i").test(h) && !/intent|share/i.test(h)) {
        if (X) { if (h !== X) { a.href = X; if (XH && oldX !== XH) a.innerHTML = a.innerHTML.split("@" + oldX).join("@" + XH); } }
        else a.style.display = "none";
      } else if (oldTg && /t\.me\//i.test(h) && tgName(h).toLowerCase() === oldTg.toLowerCase()) {
        if (TG) { if (h !== TG) a.href = TG; } else a.style.display = "none";
      }
    }
  };
  var start = function () { fix(document); new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { fix(n); if (n.matches && n.matches("a[href]")) fix(n.parentNode || n); } }); }); }).observe(document.documentElement, { childList: true, subtree: true }); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})(window.PET_CONFIG);
