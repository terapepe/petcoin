# petcoin.fun — $PET

Pet meme coin launchpad website. Static (HTML/CSS/vanilla JS, no build). Networks: **Solana, Robinhood Chain, Base, BSC**.

- **Dark / light mode** toggle (default dark, saved per browser; default in `defaultColorMode`).
- **Home** (`index.html`): hero + featured trending carousel, CA box (per-chain tabs + network SVG + **Copy CA**, no Buy button), live stats, trending preview, recently launched, How it works, Memeify, Meme-to-Earn, $PET, Fees, Roadmap, FAQ.
- **Explore** (`explore.html`): Trending / Gainers / Graduating / New tabs, search, chain & pet filters, sort + order, recently launched, top communities.
- **Launch** (`launch.html`): pet image, name, ticker, story, pet type, network, trading fee (0.5 / 1 / 2 / 3 / 5 %, buy = sell), pay with native or $PET (−50%), socials, first buy, live preview. Requires a connected wallet; until `launchpad.appUrl` is set, pressing Launch shows "Launchpad opening soon".
- **Docs** (`docs.html`): intro, getting started, networks & CA, Memeify, voting, launching, bonding curve, NFT Meme, $PET, fees, Meme-to-Earn, safety, market data, FAQ, glossary.
- **Real data only**: pet-coin market from the DexScreener public API; $PET price/liquidity from DexScreener; supply & wallet balance read on-chain via RPC. Nothing configured → "Coming soon" / "—".
- Wallets: EIP-6963 EVM wallets (auto add/switch Robinhood/Base/BSC) + Phantom / Solflare / Backpack.

## Run
`npx serve` → http://localhost:3000 (serves clean URLs: `/explore`, `/launch`, `/docs`).

Clean URLs (no `.html`): GitHub Pages and Netlify support them out of the box, Vercel via `vercel.json` (`cleanUrls`), Apache / Hostinger via `.htaccess`.

## Configure — `js/config.js`
| Key | Purpose |
|---|---|
| `mode` | `"multi"` = always all 4 networks · `"single"` = only `singleNetwork` |
| `singleNetwork` | `solana` \| `robinhood` \| `base` \| `bsc` — colors, texts, docs, fees follow that network |
| `token.evm` | $PET CA shared by Robinhood, Base, BSC |
| `token.sol` | $PET mint on Solana |
| `primaryNetwork` | First CA tab in multi mode |
| `launchpad.appUrl` | Launch app URL ("" → "opening soon" modal) |
| `launchpad.feeTiers / defaultFee / feeSplit` | Trading-fee options, default and split (creator 80 / platform 20) |
| `launchpad.graduationMcapUsd` | Graduation cap used for bonding-curve bars |
| `market.*` | DexScreener keywords, min liquidity, refresh, pet categories |
| `theme`, `networks.<id>.theme` | `primary`, `accent`, `warm`, `onPrimary` (multi / per network) |
| `defaultColorMode` | `dark` \| `light` |
| `networks.<id>.fees` | Per-network launch / campaign / graduation fees |
| `fees[]`, `tokenomics[]`, `utility[]`, `roadmap[]` | Content blocks |
| `social.x / xHandle / telegram` | Social links (Telegram hidden when empty) |

## Assets
- `assets/art/logo.svg` — minimal paw mark. `assets/art/*.svg` — original pet mascots.
- `assets/networks/*.svg` — network icons.
