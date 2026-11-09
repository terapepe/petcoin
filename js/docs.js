/* petcoin.fun — docs page: config-driven tables + scroll-spy. */
(function () {
  const CFG = window.PET_CONFIG;
  const { $, $$, esc } = UI;

  UI.init();
  const nets = Chain.list();

  $("#netTable").innerHTML = nets.map((n) => {
    const ca = Chain.ca(n.id);
    return `<tr><td><img src="${n.icon}" alt="" style="width:20px;display:inline;vertical-align:-4px;margin-right:6px">${esc(n.name)}</td>
      <td>${n.type === "evm" ? "EVM · Chain ID " + n.chainId : "Solana · SPL"}</td>
      <td>${ca ? `<code>${esc(ca)}</code> <button class="link-btn" data-action="copy" data-text="${esc(ca)}">copy</button>` : "Coming soon"}</td>
      <td>${esc(n.dex)}</td></tr>`;
  }).join("");

  const toko = [["Name", CFG.project.name], ["Ticker", CFG.project.ticker], ["Network" + (nets.length > 1 ? "s" : ""), nets.map((n) => n.name).join(", ")]];
  CFG.tokenomics.filter((t) => t.value).forEach((t) => toko.push([t.label, t.value + (t.note ? " — " + t.note : "")]));
  $("#tokoTable").innerHTML = toko.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("");
  $("#utilList").innerHTML = CFG.utility.map((u) => `<li>${u.icon} <b>${esc(u.title)}</b> — ${esc(u.text)}</li>`).join("");

  $("#feeTable").innerHTML = CFG.fees.map((f) => {
    let v = f.value;
    if (v === "tiers") v = CFG.launchpad.feeTiers.map((x) => x + "%").join(" · ");
    else if (String(v).startsWith("net:")) { const k = v.slice(4); v = nets.map((n) => (nets.length > 1 ? n.short + ": " : "") + n.fees[k]).join(" · "); }
    return `<tr><td><b>${esc(f.name)}</b></td><td>${esc(v)}</td><td>${esc(f.note)}</td></tr>`;
  }).join("");

  const sp = CFG.launchpad.feeSplit, r = (x, p) => +(x * p / 100).toFixed(3);
  $("#thCreator").textContent = `Creator (${sp.creator}%)`; $("#thPlatform").textContent = `Platform (${sp.platform}%)`;
  $("#splitTable").innerHTML = CFG.launchpad.feeTiers.map((x) => `<tr><td>${x}%</td><td>${r(x, sp.creator)}%</td><td>${r(x, sp.platform)}%</td></tr>`).join("");

  // Scroll-spy
  const links = $$("#docsNav a");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); });
  }, { rootMargin: "-30% 0px -60% 0px" });
  $$(".doc-body article").forEach((a) => io.observe(a));
})();
