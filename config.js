/* config.js
   - Maneja selector Testnet/Mainnet
   - Persiste configuración por red en localStorage
   - Mantiene compatibilidad con el app.js actual (apiUrl, apiKey, contractAddress)
*/

(function () {
  const LS_ACTIVE = "activeNetwork";
  const LS_NETWORKS = "networksConfig";
  const LS_API_URL = "apiUrl";              // compat
  const LS_API_KEY = "apiKey";              // compat
  const LS_CONTRACT = "contractAddress";    // compat

  const DEFAULTS = {
    testnet: {
      label: "Testnet",
      apiUrl: "https://admin-metatx-test-production.up.railway.app/",
      contractAddress: "0x4053cA6bcdEc6638d9Ad83a5c74d0246C7670ACd"
    },
    mainnet: {
      label: "Mainnet",
      apiUrl: "https://admin-metatx-production.up.railway.app/",
      contractAddress: "0x1B5c82C4093D2422699255f59f3B8A33c4a37773"
    }
  };

  function safeJsonParse(s, fallback) {
    try { return JSON.parse(s); } catch { return fallback; }
  }

  function loadNetworks() {
    const stored = safeJsonParse(localStorage.getItem(LS_NETWORKS), null);
    return stored && typeof stored === "object" ? { ...DEFAULTS, ...stored } : { ...DEFAULTS };
  }

  function saveNetworks(networks) {
    localStorage.setItem(LS_NETWORKS, JSON.stringify(networks));
  }

  function getActiveKey() {
    return localStorage.getItem(LS_ACTIVE) || "testnet";
  }

  function setActiveKey(key) {
    localStorage.setItem(LS_ACTIVE, key);
  }

  function applyCompatibilityKeys(networks, activeKey) {
    const cfg = networks[activeKey] || DEFAULTS.testnet;
    localStorage.setItem(LS_API_URL, cfg.apiUrl || "");
    localStorage.setItem(LS_CONTRACT, cfg.contractAddress || "");
    // apiKey es global y se guarda separado (compat), no se toca acá.
    window.APP_CONFIG = {
      network: activeKey,
      apiUrl: cfg.apiUrl || "",
      apiKey: localStorage.getItem(LS_API_KEY) || "",
      contractAddress: cfg.contractAddress || ""
    };
    window.dispatchEvent(new CustomEvent("networkChanged", { detail: window.APP_CONFIG }));
  }

  async function hydrateFromServerIfNeeded(networks) {
    // Opcional: si web-server.js expone /config, usarlo como defaults.
    try {
      const res = await fetch("/config", { cache: "no-store" });
      if (!res.ok) return networks;
      const data = await res.json();
      // data = { testnet: {apiUrl, contractAddress}, mainnet: {...} }
      ["testnet", "mainnet"].forEach((k) => {
        if (data?.[k]) {
          networks[k] = { ...networks[k], ...data[k] };
        }
      });
      return networks;
    } catch {
      return networks;
    }
  }

  function setUIFromState() {
    const networks = loadNetworks();
    const activeKey = getActiveKey();

    const headerSelect = document.getElementById("networkSelectHeader");
    const modalSelect = document.getElementById("networkSelect");
    const apiUrlInput = document.getElementById("apiUrl");
    const apiKeyInput = document.getElementById("apiKey");
    const contractInput = document.getElementById("contractAddressInput");

    if (headerSelect) headerSelect.value = activeKey;
    if (modalSelect) modalSelect.value = activeKey;

    const cfg = networks[activeKey] || DEFAULTS.testnet;
    if (apiUrlInput) apiUrlInput.value = cfg.apiUrl || "";
    if (contractInput) contractInput.value = cfg.contractAddress || "";
    if (apiKeyInput) apiKeyInput.value = localStorage.getItem(LS_API_KEY) || "";

    // Reflejar en header "Network" si existe
    const networkNameEl = document.getElementById("networkName");
    if (networkNameEl) networkNameEl.textContent = (DEFAULTS[activeKey]?.label || activeKey);

    // Reflejar Contract si existe (solo UI; app.js puede refrescar luego)
    const contractEl = document.getElementById("contractAddress");
    const compatContract = localStorage.getItem(LS_CONTRACT) || cfg.contractAddress || "";
    if (contractEl && compatContract) contractEl.textContent = compatContract;
  }

  async function init() {
    let networks = loadNetworks();
    networks = await hydrateFromServerIfNeeded(networks);
    saveNetworks(networks);

    const activeKey = getActiveKey();
    applyCompatibilityKeys(networks, activeKey);

    // Listeners
    const headerSelect = document.getElementById("networkSelectHeader");
    const modalSelect = document.getElementById("networkSelect");

    function onChangeNetwork(newKey) {
      const nets = loadNetworks();
      setActiveKey(newKey);
      applyCompatibilityKeys(nets, newKey);
      setUIFromState();
    }

    if (headerSelect) {
      headerSelect.addEventListener("change", (e) => onChangeNetwork(e.target.value));
    }
    if (modalSelect) {
      modalSelect.addEventListener("change", (e) => onChangeNetwork(e.target.value));
    }

    setUIFromState();
  }

  // Exponer función usada por el botón del modal
  window.saveNetworkConfigUI = function () {
    const networks = loadNetworks();
    const key = (document.getElementById("networkSelect")?.value) || getActiveKey();

    const apiUrl = document.getElementById("apiUrl")?.value?.trim() || "";
    const apiKey = document.getElementById("apiKey")?.value || "";
    const contractAddress = document.getElementById("contractAddressInput")?.value?.trim() || "";

    networks[key] = { ...(networks[key] || {}), apiUrl, contractAddress };

    saveNetworks(networks);
    localStorage.setItem(LS_API_KEY, apiKey);          // global
    setActiveKey(key);
    applyCompatibilityKeys(networks, key);
    setUIFromState();

    // Si existe el modal, cerrarlo (compat con tu UI)
    const modal = document.getElementById("configModal");
    if (modal) modal.classList.remove("show");
  };

  // Arranque cuando el DOM está listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
