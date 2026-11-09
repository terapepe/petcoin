# petcoin.fun — $PET

Pet meme coin launchpad website. Static (HTML/CSS/vanilla JS, no build). Networks: **Solana, Robinhood Chain, Base, BSC**.

- **Home** (`index.html`): hero with mascots, CA box (per-chain tabs + network SVG + **Copy CA**, no Buy button), live stats, Trending / Top gainers / About to graduate, Recently launched, Top pet communities, How it works, Memeify, Meme-to-Earn, $PET, Fees, Roadmap, FAQ.
- **Docs** (`docs.html`): intro, getting started, networks & CA, Memeify, voting, launching, bonding curve, NFT Meme, $PET, fees, Meme-to-Earn, safety, market data, FAQ, glossary.
- **Real data only**: pet-coin market from the DexScreener public API; $PET price/liquidity from DexScreener; supply & wallet balance read on-chain via RPC. Nothing configured → "Coming soon" / "—".
- Wallets: EIP-6963 EVM wallets (auto add/switch Robinhood/Base/BSC) + Phantom / Solflare / Backpack.

## Run
`python3 -m http.server` → http://localhost:8000 (works on GitHub Pages / any static host).

## Configure — `js/config.js`
| Key | Purpose |
|---|---|
| `mode` | `"multi"` = always all 4 networks · `"single"` = only `singleNetwork` |
| `singleNetwork` | `solana` \| `robinhood` \| `base` \| `bsc` — colors, texts, docs, fees follow that network |
| `token.evm` | $PET CA shared by Robinhood, Base, BSC |
| `token.sol` | $PET mint on Solana |
| `primaryNetwork` | First CA tab in multi mode |
| `launchpad.appUrl` | Launch app URL ("" → "opening soon" modal) |
| `launchpad.graduationMcapUsd` | Graduation cap used for bonding-curve bars |
| `market.*` | DexScreener keywords, min liquidity, refresh, pet categories |
| `theme`, `networks.<id>.theme` | Colors (multi / per network) |
| `networks.<id>.fees` | Per-network launch / campaign / graduation fees |
| `fees[]`, `tokenomics[]`, `utility[]`, `roadmap[]` | Content blocks |
| `social.x / xHandle / telegram` | Social links (Telegram hidden when empty) |

## Assets
- `assets/art/*.svg` — original pet mascots (dog, cat, hamster, bunny, parrot) + logo.
- `assets/networks/*.svg` — network icons.
