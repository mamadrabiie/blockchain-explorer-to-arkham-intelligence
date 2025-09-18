// Helper to find an <a> even through shadow DOM
function getAnchorFromEvent(e) {
    if (e.composedPath) {
      for (const el of e.composedPath()) {
        if (el && el.tagName === "A") return el;
      }
    }
    return e.target && e.target.closest ? e.target.closest("a") : null;
  }
  
  function handleMiddleClick(e) {
    if (e.button !== 1) return; // only middle button
  
    const link = getAnchorFromEvent(e);
    if (!link) return;
  
    // Check if link matches mempool, etherscan or other explorers
    if (!(/https?:\/\/(?:www\.)?mempool\.space\/tx\//.test(link.href) || 
          /https?:\/\/(?:www\.)?etherscan\.io\/tx\//.test(link.href) ||
          /https?:\/\/(?:www\.)?polygonscan\.com\/tx\//.test(link.href) ||
          /https?:\/\/(?:www\.)?optimistic\.etherscan\.io\/address\//.test(link.href) ||
          /https?:\/\/(?:www\.)?snowscan\.xyz\/address\//.test(link.href) ||
          /https?:\/\/(?:www\.)?basescan\.org\/address\//.test(link.href) ||
          /https?:\/\/(?:www\.)?dogechain\.info\/tx\//.test(link.href))) {
      return;
    }
    
    // Stop the site and the browser default from opening a tab
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
  
    // Extract tx hash robustly
    const u = new URL(link.href);
    const parts = u.pathname.split("/"); // ["", "tx", "<hash>"]
    const idx = parts.indexOf("tx") >= 0 ? parts.indexOf("tx") : parts.indexOf("address");
    const txHash = idx >= 0 ? parts[idx + 1] : null;
    if (!txHash) return;
  
    // Build your replacement URL
    const newUrl = "https://intel.arkm.com/explorer/tx/" + txHash;
  
    // Middle click normally opens a new tab, so do the same
    window.open(newUrl, "_blank", "noopener");
  }
  
  // Some sites open a tab on mousedown already. Prevent it early.
  function blockMiddleMouseDown(e) {
    if (e.button === 1) {
      const link = getAnchorFromEvent(e);
      if (link && (/mempool\.space\/tx\//.test(link.href) || 
                   /etherscan\.io\/tx\//.test(link.href) ||
                   /polygonscan\.com\/tx\//.test(link.href) ||
                   /optimistic\.etherscan\.io\/address\//.test(link.href) ||
                   /snowscan\.xyz\/address\//.test(link.href) ||
                   /basescan\.org\/address\//.test(link.href) ||
                   /dogechain\.info\/tx\//.test(link.href))) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
      }
    }
  }
  
  // Listen early and non-passive so preventDefault works
  document.addEventListener("mousedown", blockMiddleMouseDown, { capture: true, passive: false });
  document.addEventListener("auxclick", handleMiddleClick, { capture: true, passive: false });