/* config.js - Simplified
   - Solo obtiene datos desde el endpoint /config del servidor
   - No usa localStorage
   - Mantiene compatibilidad con app.js (expone window.APP_CONFIG)
*/

(function () {
  let currentNetwork = 'testnet'; // Red por defecto
  let networksConfig = null;

  // Cargar configuración desde el servidor
  async function loadConfigFromServer() {
    try {
      const response = await fetch('/config', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('No se pudo cargar la configuración del servidor');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cargando configuración:', error);
      return null;
    }
  }

  // Aplicar configuración de la red activa
  function applyNetworkConfig(networks, activeKey) {
    const cfg = networks[activeKey];
    if (!cfg) {
      console.error('Configuración no encontrada para la red:', activeKey);
      return;
    }

    // Exponer configuración global para app.js
    window.APP_CONFIG = {
      network: activeKey,
      apiUrl: cfg.apiUrl || '',
      apiKey: networks.apiKey || '', // API Key global
      contractAddress: cfg.contractAddress || ''
    };

    // Disparar evento para que otros componentes reaccionen
    window.dispatchEvent(new CustomEvent('networkChanged', { detail: window.APP_CONFIG }));
  }

  // Actualizar UI con la configuración actual
  function updateUI() {
    if (!networksConfig || !currentNetwork) return;

    const cfg = networksConfig[currentNetwork];
    if (!cfg) return;

    // Actualizar selectores
    const headerSelect = document.getElementById('networkSelectHeader');
    const modalSelect = document.getElementById('networkSelect');
    if (headerSelect) headerSelect.value = currentNetwork;
    if (modalSelect) modalSelect.value = currentNetwork;

    // Actualizar campos del modal (solo lectura)
    const apiUrlInput = document.getElementById('apiUrl');
    const contractInput = document.getElementById('contractAddressInput');
    if (apiUrlInput) apiUrlInput.value = cfg.apiUrl || '';
    if (contractInput) contractInput.value = cfg.contractAddress || '';

    // Actualizar header "Network"
    const networkNameEl = document.getElementById('networkName');
    if (networkNameEl) {
      networkNameEl.textContent = currentNetwork.toUpperCase();
    }

    // Actualizar Contract en header
    const contractEl = document.getElementById('contractAddress');
    if (contractEl && cfg.contractAddress) {
      // Usar función shortenAddress si existe (definida en app.js)
      if (typeof window.shortenAddress === 'function') {
        contractEl.innerHTML = window.shortenAddress(cfg.contractAddress);
      } else {
        contractEl.textContent = cfg.contractAddress;
      }
    }
  }

  // Cambiar de red
  function changeNetwork(newKey) {
    if (!networksConfig || !networksConfig[newKey]) {
      console.error('Red no válida:', newKey);
      return;
    }

    currentNetwork = newKey;
    applyNetworkConfig(networksConfig, currentNetwork);
    updateUI();
  }

  // Inicialización
  async function init() {
    // Cargar configuración del servidor
    networksConfig = await loadConfigFromServer();
    
    if (!networksConfig) {
      console.error('No se pudo cargar la configuración del servidor');
      return;
    }

    // Aplicar configuración inicial
    applyNetworkConfig(networksConfig, currentNetwork);
    updateUI();

    // Listeners para cambio de red
    const headerSelect = document.getElementById('networkSelectHeader');
    const modalSelect = document.getElementById('networkSelect');

    if (headerSelect) {
      headerSelect.addEventListener('change', (e) => changeNetwork(e.target.value));
    }
    if (modalSelect) {
      modalSelect.addEventListener('change', (e) => changeNetwork(e.target.value));
    }

    console.log('✅ Configuración cargada desde servidor:', networksConfig);
    console.log('🌐 Red inicial:', currentNetwork);
  }

  // Exponer función para cambiar red desde el modal
  window.saveNetworkConfigUI = function () {
    const modalSelect = document.getElementById('networkSelect');
    if (modalSelect) {
      changeNetwork(modalSelect.value);
      
      // Cerrar modal si existe
      const modal = document.getElementById('configModal');
      if (modal) modal.classList.remove('show');
      
      // Mostrar notificación si la función existe
      if (typeof window.showAlert === 'function') {
        window.showAlert(`✅ Red cambiada a ${currentNetwork}`, 'success');
      }
    }
  };

  // Exponer función para obtener configuración actual
  window.getCurrentNetworkConfig = function () {
    return {
      network: currentNetwork,
      config: networksConfig ? networksConfig[currentNetwork] : null
    };
  };

  // Arranque cuando el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();