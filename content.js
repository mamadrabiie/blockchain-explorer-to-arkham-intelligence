// Helper to find an <a> even through shadow DOM
function getAnchorFromEvent(e) {
    if (e.composedPath) {
      for (const el of e.composedPath()) {
        if (el && el.tagName === "A") return el;
      }
    }
    return e.target && e.target.closest ? e.target.closest("a") : null;
  }

  // Check if URL matches any of our supported explorers
  function matchExplorerUrl(url) {
    const patterns = [
      /https?:\/\/(?:www\.)?mempool\.space\/(tx|address)\//,
      /https?:\/\/(?:www\.)?etherscan\.io\/(tx|address)\//,
      /https?:\/\/(?:www\.)?polygonscan\.com\/(tx|address)\//,
      /https?:\/\/(?:www\.)?optimistic\.etherscan\.io\/(tx|address)\//,
      /https?:\/\/(?:www\.)?snowscan\.xyz\/(tx|address)\//,
      /https?:\/\/(?:www\.)?basescan\.org\/(tx|address)\//,
      /https?:\/\/(?:www\.)?dogechain\.info\/(tx|address)\//,
      /https?:\/\/(?:www\.)?bscscan\.com\/(tx|address)\//,
      /https?:\/\/(?:www\.)?tronscan\.org\/#\/(transaction|address)\//,
      /https?:\/\/(?:www\.)?blockstream\.info\/(tx|address)\//,
      /https?:\/\/(?:www\.)?arbiscan\.io\/(tx|address)\//
    ];
    return patterns.some(pattern => pattern.test(url));
  }
  
  function handleMiddleClick(e) {
    if (e.button !== 1) return; // only middle button
  
    const link = getAnchorFromEvent(e);
    if (!link || !matchExplorerUrl(link.href)) return;
    
    // Stop the site and the browser default from opening a tab
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
  
    // Extract hash/address robustly
    const u = new URL(link.href);
    const parts = u.pathname.split("/");
    
    // Handle Tronscan's special format
    if (link.href.includes('tronscan.org')) {
      const type = u.hash.split('/')[1];
      const value = u.hash.split('/')[2];
      if (value) {
        const newType = type === 'transaction' ? 'tx' : type;
        return window.open(`https://intel.arkm.com/explorer/${newType}/${value}`, "_blank", "noopener");
      }
      return;
    }

    // For all other explorers (including Blockstream)
    const typeIdx = parts.findIndex(p => p === 'tx' || p === 'address');
    if (typeIdx >= 0 && parts[typeIdx + 1]) {
      const type = parts[typeIdx];
      const value = parts[typeIdx + 1];
      return window.open(`https://intel.arkm.com/explorer/${type}/${value}`, "_blank", "noopener");
    }
  }
  
  // Some sites open a tab on mousedown already. Prevent it early.
  function blockMiddleMouseDown(e) {
    if (e.button === 1) {
      const link = getAnchorFromEvent(e);
      if (link && matchExplorerUrl(link.href)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
      }
    }
  }
  
  // Listen early and non-passive so preventDefault works
  document.addEventListener("mousedown", blockMiddleMouseDown, { capture: true, passive: false });
  document.addEventListener("auxclick", handleMiddleClick, { capture: true, passive: false });