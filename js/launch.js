/* petcoin.fun — Launch form. Wallet required; contracts not live yet → "opening soon" modal. */
(function () {
  const CFG = window.PET_CONFIG, L = CFG.launchpad, T = CFG.project.ticker;
  const { $, $$, esc } = UI;
  const PETS = [["dog", "🐶 Dog"], ["cat", "🐱 Cat"], ["small", "🐹 Hamster / Bunny"], ["bird", "🦜 Bird"], ["other", "🐾 Other"]];
  const S = { img: "", net: Chain.primary(), fee: L.defaultFee, pay: "native", pet: "dog" };

  const net = () => Chain.get(S.net);
  /** "0.02 SOL" → { n: 0.02, u: "SOL" } */
  const parse = (s) => { const m = String(s).match(/([\d.]+)\s*(\S+)/); return m ? { n: parseFloat(m[1]), u: m[2] } : null; };
  function cost() {
    const f = net().fees.launch;
    if (S.pay !== "pet") return f;
    const p = parse(f); return p ? `${+(p.n / 2).toFixed(6)} ${p.u} in ${T} (−50%)` : f;
  }

  function opts(el, items, cur, action) {
    el.innerHTML = items.map(([v, html]) => `<button type="button" class="opt ${String(v) === String(cur) ? "active" : ""}" data-action="${action}" data-v="${v}">${html}</button>`).join("");
  }

  function renderOpts() {
    opts($("#petType"), PETS, S.pet, "pet");
    opts($("#netOpts"), Chain.list().map((n) => [n.id, `<img src="${n.icon}" alt="">${esc(n.short)}`]), S.net, "net");
    $("#feeOpts").innerHTML = L.feeTiers.map((x) => `<button type="button" class="opt fee-opt ${x === S.fee ? "active" : ""}" data-action="fee" data-v="${x}">${x}%<small>${x <= 1 ? "low" : x <= 2 ? "standard" : "high"}</small></button>`).join("");
    opts($("#payOpts"), [["native", net().native], ["pet", `${T} <small style="display:inline;color:var(--up)">−50%</small>`]], S.pay, "pay");
    $("#buyUnit").textContent = net().native;
  }

  function data() {
    return {
      name: $("#fName").value.trim(), ticker: $("#fTicker").value.trim().toUpperCase(), desc: $("#fDesc").value.trim(),
      net: net().name, fee: S.fee, cost: cost(),
    };
  }

  function renderPreview() {
    const d = data(), n = net(), sp = L.feeSplit;
    const img = S.img ? `<img class="t-img" src="${S.img}" alt="">` : `<span class="t-img ph">${esc((d.ticker || "PET").slice(0, 3))}</span>`;
    $("#preview").innerHTML = `<div class="tcard">
      <div class="t-imgwrap">${img}<img class="t-chain" src="${n.icon}" alt=""><span class="rank">New ✨</span></div>
      <div class="t-title">${esc(d.name || "Your pet coin")} <span class="tk">($${esc(d.ticker || "TICKER")})</span></div>
      <p class="muted small" style="margin:0;min-height:1.6em">${esc(d.desc || "Your pet's story shows here.")}</p>
      <div class="kvr"><span>Marketcap</span><b class="pos">—</b></div>
      <div><div class="curve-top"><span>Progress</span><b>0%</b></div><div class="curve-bar"><i style="width:3%"></i></div></div>
    </div>`;
    $("#summary").innerHTML = `<h4>Launch summary</h4>
      <div class="param"><span>Network</span><b>${esc(n.name)}</b></div>
      <div class="param"><span>Trading fee</span><b>${S.fee}% buy · ${S.fee}% sell</b></div>
      <div class="param"><span>You earn per trade</span><b>${+(S.fee * sp.creator / 100).toFixed(3)}%</b></div>
      <div class="param"><span>Platform per trade</span><b>${+(S.fee * sp.platform / 100).toFixed(3)}%</b></div>
      <div class="param"><span>Creation fee</span><b>${esc(cost())}</b></div>
      <div class="param"><span>Graduation</span><b>${esc(UI.vars().gradCap)} → ${esc(n.dex)}</b></div>
      <div class="param"><span>Supply</span><b>1,000,000,000</b></div>`;
    $("#costVal").textContent = cost();
    $("#cName").textContent = `${$("#fName").value.length}/32`;
    $("#cDesc").textContent = `${$("#fDesc").value.length}/280`;
  }

  function walletHint() {
    const w = Wallet.state;
    $("#walletHint").textContent = w.connected ? `Connected: ${UI.short(w.address, 4, 4)}` : "Connect your wallet to launch.";
    $("#launchBtn").textContent = w.connected ? "🚀 Launch" : "🔌 Connect wallet & launch";
  }

  function setImg(file) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) return UI.toast("Use PNG, JPG, GIF or WEBP");
    if (file.size > 4 * 1024 * 1024) return UI.toast("Image is larger than 4 MB");
    const r = new FileReader();
    r.onload = () => { S.img = r.result; $("#pv").innerHTML = `<img src="${S.img}" alt="">`; $("#drop").style.borderColor = ""; renderPreview(); };
    r.readAsDataURL(file);
  }

  function validate() {
    const d = data(); let ok = true;
    const mark = (el, bad) => { el.classList.toggle("bad", bad); if (bad) ok = false; };
    mark($("#fName"), d.name.length < 2);
    mark($("#fTicker"), !/^[A-Z0-9]{2,10}$/.test(d.ticker));
    if (!S.img) { $("#drop").style.borderColor = "var(--down)"; ok = false; }
    ["#fX", "#fTg", "#fWeb"].forEach((id) => { const v = $(id).value.trim(); mark($(id), !!v && !/^https?:\/\/\S+\.\S+/.test(v)); });
    if (!ok) UI.toast("Please fill in image, name and ticker");
    return ok;
  }

  UI.init();
  if (Chain.isSingle()) S.net = Chain.primary();
  UI.handlers.pet = (el) => { S.pet = el.dataset.v; renderOpts(); };
  UI.handlers.net = (el) => { S.net = el.dataset.v; renderOpts(); renderPreview(); };
  UI.handlers.fee = (el) => { S.fee = +el.dataset.v; renderOpts(); renderPreview(); };
  UI.handlers.pay = (el) => { S.pay = el.dataset.v; renderOpts(); renderPreview(); };

  $("#fTicker").addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); });
  ["#fName", "#fTicker", "#fDesc"].forEach((id) => $(id).addEventListener("input", (e) => { e.target.classList.remove("bad"); renderPreview(); }));
  $("#fImg").addEventListener("change", (e) => setImg(e.target.files[0]));
  const drop = $("#drop");
  ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("drag"); }));
  drop.addEventListener("drop", (e) => setImg(e.dataTransfer.files[0]));

  $("#launchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!Wallet.state.connected) { UI.toast("Connect your wallet first"); return UI.openModal(UI.connectModal(S.net)); }
    if (L.appUrl) return window.open(L.appUrl, "_blank", "noopener");
    UI.openModal(UI.launchModal(data()));
  });
  window.addEventListener("wallet:change", walletHint);

  renderOpts(); renderPreview(); walletHint();
})();
