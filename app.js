// Configuración - Se inicializa desde config.js
let API_URL = '';
let API_KEY = '';

let monitoringInterval = null;
let showFullAddresses = false;

// Escuchar cambios de red desde config.js
window.addEventListener('networkChanged', (event) => {
    const config = event.detail;
    API_URL = config.apiUrl;
    API_KEY = config.apiKey;
    console.log('🔄 Red cambiada:', config.network, '| API URL:', API_URL);
    
    loadHealth();
    loadConfig();
    
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        if (tabId === 'callers') loadCallers();
        if (tabId === 'deployers') loadDeployers();
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    
    setTimeout(() => {
        if (window.APP_CONFIG) {
            API_URL = window.APP_CONFIG.apiUrl;
            API_KEY = window.APP_CONFIG.apiKey;
            console.log('✅  API URL inicial:', API_URL);
            console.log('✅  API KEY cargado:', API_KEY ? '***' + API_KEY.slice(-4) : 'NO CONFIGURADO');
            loadHealth();
            loadConfig();
        } else {
            console.error('❌ No se pudo cargar la configuración inicial');
        }
    }, 100);
    
    updateAddressModeUI();
});

function openConfigModal() {
    document.getElementById('configModal').classList.add('show');
    if (window.APP_CONFIG) {
        document.getElementById('apiUrl').value = window.APP_CONFIG.apiUrl || '';
        const contractInput = document.getElementById('contractAddressInput');
        if (contractInput) contractInput.value = window.APP_CONFIG.contractAddress || '';
    }
}

function closeConfigModal() {
    document.getElementById('configModal').classList.remove('show');
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            if (tabId === 'callers') loadCallers();
            if (tabId === 'deployers') loadDeployers();
            if (tabId === 'config') loadConfig();
        });
    });
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    };
    
    if (body) options.body = JSON.stringify(body);
    
    try {
        const url = `${API_URL}${endpoint}`;
        console.log(`📡 ${method} ${url}`);
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.details || data.error || 'Error en la petición');
        }
        
        return data;
    } catch (error) {
        showAlert(`Error: ${error.message}`, 'error');
        throw error;
    }
}

function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;
    container.appendChild(alert);
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

function showLoader(text = 'Procesando transacción...', subtext = 'Por favor espera') {
    const overlay = document.getElementById('loaderOverlay');
    document.getElementById('loaderText').textContent = text;
    document.getElementById('loaderSubtext').textContent = subtext;
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideLoader() {
    document.getElementById('loaderOverlay').classList.remove('show');
    document.body.style.overflow = 'auto';
}

function updateLoader(text, subtext) {
    const loaderText = document.getElementById('loaderText');
    const loaderSubtext = document.getElementById('loaderSubtext');
    if (loaderText) loaderText.textContent = text;
    if (loaderSubtext) loaderSubtext.textContent = subtext;
}

async function loadHealth() {
    try {
        const data = await apiRequest('/health');
        document.getElementById('statusValue').textContent = data.status === 'ok' ? '✅ Online' : '❌ Offline';
        document.getElementById('contractAddress').innerHTML = shortenAddress(data.contract);
        document.getElementById('ownerAddress').innerHTML = shortenAddress(data.owner);
        document.getElementById('blockNumber').textContent = data.blockNumber;
        
        const networkNameEl = document.getElementById('networkName');
        if (networkNameEl && !networkNameEl.textContent) {
            networkNameEl.textContent = "LNET";
        }
    } catch (error) {
        document.getElementById('statusValue').textContent = '❌ Error';
        console.error('Error loading health:', error);
    }
}

async function loadConfig() {
    try {
        const data = await apiRequest('/config');
        document.getElementById('erc2771Status').textContent = data.erc2771AppendSender ? '✅ Habilitado' : '❌ Deshabilitado';
        document.getElementById('gasOverhead').textContent = data.gasAccountingOverhead;
        document.getElementById('defaultBucketLimit').textContent = formatNumber(data.defaultDeployGasBucketLimit);
        document.getElementById('defaultBucketDuration').textContent = `${data.defaultDeployGasBucketDuration}s`;
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

async function setCallerAllowed(address,allowed) {
    if (!address || !isValidAddress(address)) {
        showAlert('Dirección inválida '+allowed , 'error');
        return;
    }
    showAlert('setCallerAllowed called with:', address, allowed);
    try {
        showLoader(allowed ? 'Permitiendo caller...' : 'Bloqueando caller...', `Procesando: ${shortenAddressPlain(address)}`);
        const data = await apiRequest('/caller/set-allowed', 'POST', { caller: address, allowed: allowed });
        hideLoader();
        showAlert(`Caller ${allowed ? 'permitido' : 'bloqueado'} correctamente. TX: ${shortenHash(data.txHash)}`, 'success');
        document.getElementById('callerAddress').value = '';
        loadCallers();
    } catch (error) {
        hideLoader();
        console.error('Error setting caller:', error);
    }
}

async function setGasLimit() {
    const address = document.getElementById('gasLimitCallerAddress').value;
    const limit = document.getElementById('gasLimitValue').value;
    
    if (!address || !isValidAddress(address)) {
        showAlert('Dirección inválida', 'error');
        return;
    }
    if (!limit || limit <= 0) {
        showAlert('Límite de gas inválido', 'error');
        return;
    }
    
    try {
        showLoader('Configurando límite de gas...', `${formatNumber(limit)} gas para ${shortenAddressPlain(address)}`);
        const data = await apiRequest('/caller/set-gas-limit', 'POST', { caller: address, limit: limit });
        hideLoader();
        showAlert(`Gas limit establecido correctamente. TX: ${shortenHash(data.txHash)}`, 'success');
        document.getElementById('gasLimitCallerAddress').value = '';
        document.getElementById('gasLimitValue').value = '';
        loadCallers();
    } catch (error) {
        hideLoader();
        console.error('Error setting gas limit:', error);
    }
}

async function loadCallers() {
    try {
        console.log('🔄 Iniciando loadCallers...');
        
        // 1. Obtener lista de addresses del backend
        const listData = await apiRequest('/callers');
        console.log('📋 Lista de callers recibida:', listData);
        
        const tbody = document.getElementById('callersTable');
        if (!tbody) {
            console.error('❌ No se encontró el elemento callersTable');
            return;
        }
        
        if (listData.callers && listData.callers.length > 0) {
            const addresses = listData.callers;
            console.log(`📦 Procesando ${addresses.length} callers...`);
            
            // 2. Para cada address, obtener info completa
            const callersWithDetails = await Promise.all(
                addresses.map(async (address) => {
                    try {
                        console.log(`  🔍 Consultando info de: ${address}`);
                        
                        // Llamar a /caller/:address/allowed que devuelve todo
                        const data = await apiRequest(`/caller/${address}/allowed`);
                        console.log(`  ✅ Datos recibidos:`, data);
                        
                        return {
                            address: address,
                            allowed: data.isAllowed !== undefined ? data.isAllowed : true,
                            gasLimit: data.gasLimitPerBlock !== undefined ? String(data.gasLimitPerBlock) : '0',
                            gasUsed: data.gasUsedThisBlock?.used !== undefined ? String(data.gasUsedThisBlock.used) : '0'
                        };
                    } catch (error) {
                        console.error(`  ❌ Error obteniendo info de ${address}:`, error);
                        return {
                            address: address,
                            allowed: true,
                            gasLimit: '0',
                            gasUsed: '0'
                        };
                    }
                })
            );
            
            console.log('📊 Callers con detalles:', callersWithDetails);
            
            // 3. Renderizar tabla
            const rows = callersWithDetails.map((caller) => {
                const addressHTML = shortenAddress(caller.address);
                const statusBadge = caller.allowed ? 'badge-success' : 'badge-danger';
                const statusText = caller.allowed ? 'Permitido' : 'Bloqueado';
                
                return `
                <tr>
                    <td>${addressHTML}</td>
                    <td><span class="badge ${statusBadge}">${statusText}</span></td>
                    <td>${formatNumber(caller.gasLimit)}</td>
                    <td>${formatNumber(caller.gasUsed)}</td>
                    <td>
                        <button class="btn-action btn-danger" onclick="setCallerAllowed('${caller.address}',false)" title="Bloquear">🚫</button>
                    </td>
                </tr>`;
            });
            
            tbody.innerHTML = rows.join('');
            console.log(`✅ ${callersWithDetails.length} callers cargados en la tabla`);
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No hay callers registrados</td></tr>';
        }
    } catch (error) {
        console.error('❌ Error loading callers:', error);
        const tbody = document.getElementById('callersTable');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">Error cargando callers</td></tr>';
    }
}

async function setDeployerAllowed(allowed) {
    const address = document.getElementById('deployerAddress').value;
    if (!address || !isValidAddress(address)) {
        showAlert('Dirección inválida', 'error');
        return;
    }

    try {
        showLoader(allowed ? 'Permitiendo deployer...' : 'Bloqueando deployer...', `Procesando: ${shortenAddressPlain(address)}`);
        const data = await apiRequest('/deployer/set-allowed', 'POST', { deployer: address, allowed: allowed });
        hideLoader();
        showAlert(`Deployer ${allowed ? 'permitido' : 'bloqueado'} correctamente. TX: ${shortenHash(data.txHash)}`, 'success');
        document.getElementById('deployerAddress').value = '';
        loadDeployers();
    } catch (error) {
        hideLoader();
        console.error('Error setting deployer:', error);
    }
}

async function addDeployer() {
    const address = document.getElementById('deployerAddress').value;
    if (!address || !isValidAddress(address)) {
        showAlert('Dirección inválida', 'error');
        return;
    }

    try {
        showLoader('Agregando deployer...', `Procesando: ${shortenAddressPlain(address)}`);
        const data = await apiRequest('/deployer/set-allowed', 'POST', { deployer: address, allowed: true });
        hideLoader();
        showAlert(`Deployer agregado correctamente. TX: ${shortenHash(data.txHash)}`, 'success');
        document.getElementById('deployerAddress').value = '';
        loadDeployers();
    } catch (error) {
        hideLoader();
        console.error('Error adding deployer:', error);
    }
}

async function setDeployerBucket() {
    const address = document.getElementById('bucketDeployerAddress').value;
    const limit = document.getElementById('bucketLimit').value;
    const duration = document.getElementById('bucketDuration').value;

    if (!address || !isValidAddress(address)) {
        showAlert('Dirección inválida', 'error');
        return;
    }
    if (!limit || limit <= 0) {
        showAlert('Límite de gas inválido', 'error');
        return;
    }
    if (!duration || duration <= 0) {
        showAlert('Duración inválida', 'error');
        return;
    }

    try {
        showLoader('Configurando gas bucket...', `${formatNumber(limit)} gas por ${duration}s`);
        const data = await apiRequest('/deployer/set-bucket-config', 'POST', {
            deployer: address,
            limit: limit,
            durationSeconds: duration,
            useCustom: true
        });
        hideLoader();
        showAlert(`Gas bucket configurado correctamente. TX: ${shortenHash(data.txHash)}`, 'success');
        document.getElementById('bucketDeployerAddress').value = '';
        document.getElementById('bucketLimit').value = '';
        document.getElementById('bucketDuration').value = '';
        loadDeployers();
    } catch (error) {
        hideLoader();
        console.error('Error setting deploy bucket:', error);
    }
}

async function loadDeployers() {
    try {
        console.log('🔄 Iniciando loadDeployers...');
        
        // 1. Obtener lista de addresses del backend
        const listData = await apiRequest('/deployers');
        console.log('📋 Lista de deployers recibida:', listData);
        
        const tbody = document.getElementById('deployersTable');
        if (!tbody) {
            console.error('❌ No se encontró el elemento deployersTable');
            return;
        }
        
        if (listData.deployers && listData.deployers.length > 0) {
            const addresses = listData.deployers;
            console.log(`📦 Procesando ${addresses.length} deployers...`);
            
            // 2. Para cada address, obtener info completa
            const deployersWithDetails = await Promise.all(
                addresses.map(async (address) => {
                    try {
                        console.log(`  🔍 Consultando info de: ${address}`);
                        
                        // Llamar a /deployer/:address/info que devuelve todo
                        const data = await apiRequest(`/deployer/${address}/info`);
                        console.log(`  ✅ Datos recibidos:`, data);
                        
                        return {
                            address: address,
                            allowed: data.allowed !== undefined ? data.allowed : true,
                            gasLimit: data.gasBucketLimit !== undefined ? String(data.gasBucketLimit) : '0',
                            duration: data.gasBucketDuration !== undefined ? String(data.gasBucketDuration) : '0',
                            gasUsed: data.gasUsedInWindow !== undefined ? String(data.gasUsedInWindow) : '0'
                        };
                    } catch (error) {
                        console.error(`  ❌ Error obteniendo info de ${address}:`, error);
                        return {
                            address: address,
                            allowed: true,
                            gasLimit: '0',
                            duration: '0',
                            gasUsed: '0'
                        };
                    }
                })
            );
            
            console.log('📊 Deployers con detalles:', deployersWithDetails);
            
            // 3. Renderizar tabla
            const rows = deployersWithDetails.map((deployer) => {
                const addressHTML = shortenAddress(deployer.address);
                const statusBadge = deployer.allowed ? 'badge-success' : 'badge-danger';
                const statusText = deployer.allowed ? 'Permitido' : 'Bloqueado';
                
                return `
                <tr>
                    <td>${addressHTML}</td>
                    <td><span class="badge ${statusBadge}">${statusText}</span></td>
                    <td>${formatNumber(deployer.gasUsed)}</td>
                    <td>${formatNumber(deployer.gasLimit)}</td>
                    <td>
                        <button class="btn-action btn-danger" onclick="removeDeployer('${deployer.address}')" title="Eliminar">🗑️</button>
                    </td>
                </tr>`;
            });
            
            tbody.innerHTML = rows.join('');
            console.log(`✅ ${deployersWithDetails.length} deployers cargados en la tabla`);
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No hay deployers registrados</td></tr>';
        }
    } catch (error) {
        console.error('❌ Error loading deployers:', error);
        const tbody = document.getElementById('deployersTable');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">Error cargando deployers</td></tr>';
    }
}

async function removeDeployer(address) {
    if (!confirm(`¿Estás seguro de eliminar el deployer ${shortenAddressPlain(address)}?`)) return;
    
    try {
        showLoader('Eliminando deployer...', `Procesando: ${shortenAddressPlain(address)}`);
        const data = await apiRequest('/deployer/set-allowed', 'POST', { deployer: address, allowed: false });
        hideLoader();
        showAlert(`Deployer eliminado correctamente. TX: ${shortenHash(data.txHash)}`, 'success');
        loadDeployers();
    } catch (error) {
        hideLoader();
        console.error('Error removing deployer:', error);
    }
}

async function setErc2771(enabled) {
    try {
        showLoader(enabled ? 'Habilitando ERC-2771...' : 'Deshabilitando ERC-2771...', 'Append sender al calldata');
        const data = await apiRequest('/config/set-erc2771', 'POST', { enabled: enabled });
        hideLoader();
        showAlert(`ERC-2771 ${enabled ? 'habilitado' : 'deshabilitado'} correctamente. TX: ${shortenHash(data.txHash)}`, 'success');
        loadConfig();
    } catch (error) {
        hideLoader();
        console.error('Error setting ERC-2771:', error);
    }
}

async function setGasOverhead() {
    const overhead = document.getElementById('overheadValue').value;
    if (!overhead || overhead <= 0) {
        showAlert('Overhead inválido', 'error');
        return;
    }
    
    try {
        showLoader('Configurando gas overhead...', `Nuevo valor: ${formatNumber(overhead)}`);
        const data = await apiRequest('/config/set-gas-overhead', 'POST', { overhead: overhead });
        hideLoader();
        showAlert(`Gas overhead actualizado correctamente. TX: ${shortenHash(data.txHash)}`, 'success');
        document.getElementById('overheadValue').value = '';
        loadConfig();
    } catch (error) {
        hideLoader();
        console.error('Error setting overhead:', error);
    }
}

async function setDefaultBucket() {
    const limit = document.getElementById('defaultBucketLimitInput').value;
    const duration = document.getElementById('defaultBucketDurationInput').value;
    
    if (!limit || limit <= 0) {
        showAlert('Límite inválido', 'error');
        return;
    }
    if (!duration || duration <= 0) {
        showAlert('Duración inválida', 'error');
        return;
    }
    
    try {
        showLoader('Configurando bucket por defecto...', `Límite: ${formatNumber(limit)} | Duración: ${duration}s`);
        const data = await apiRequest('/config/set-default-deploy-bucket', 'POST', { limit: limit, durationSeconds: duration });
        hideLoader();
        showAlert(`Bucket default actualizado correctamente. TX: ${shortenHash(data.txHash)}`, 'success');
        document.getElementById('defaultBucketLimitInput').value = '';
        document.getElementById('defaultBucketDurationInput').value = '';
        loadConfig();
    } catch (error) {
        hideLoader();
        console.error('Error setting default bucket:', error);
    }
}

function startMonitoring() {
    if (monitoringInterval) {
        showAlert('El monitoreo ya está activo', 'info');
        return;
    }
    showAlert('Monitoreo iniciado', 'success');
    updateMonitor();
    monitoringInterval = setInterval(updateMonitor, 5000);
}

function stopMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
        showAlert('Monitoreo detenido', 'info');
    }
}

async function updateMonitor() {
    try {
        const health = await apiRequest('/health');
        const config = await apiRequest('/config');
        const callers = await apiRequest('/callers');
        const deployers = await apiRequest('/deployers');
        
        document.getElementById('monitorData').innerHTML = `
            <div class="status-grid">
                <div class="status-item">
                    <div class="status-label">Bloque Actual</div>
                    <div class="status-value">${health.blockNumber}</div>
                </div>
                <div class="status-item">
                    <div class="status-label">Callers Activos</div>
                    <div class="status-value">${callers.count}</div>
                </div>
                <div class="status-item">
                    <div class="status-label">Deployers Activos</div>
                    <div class="status-value">${deployers.count}</div>
                </div>
                <div class="status-item">
                    <div class="status-label">ERC-2771</div>
                    <div class="status-value">${config.erc2771AppendSender ? '✅' : '❌'}</div>
                </div>
            </div>
            <p style="color: var(--text-secondary); margin-top: 15px; font-size: 12px;">
                Última actualización: ${new Date().toLocaleTimeString()}
            </p>
        `;
    } catch (error) {
        console.error('Error updating monitor:', error);
    }
}

function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function shortenAddressPlain(address) {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function shortenAddress(address) {
    if (!address) return '-';
    return createAddressElement(address, showFullAddresses);
}

window.shortenAddress = shortenAddress;

function createAddressElement(address, isFull) {
    const displayText = isFull ? address : `${address.slice(0, 6)}...${address.slice(-4)}`;
    return `<span class="address ${isFull ? 'full' : ''}" onclick="copyToClipboard('${address}', event)" title="Click para copiar: ${address}">${displayText}</span>`;
}

function shortenHash(hash) {
    if (!hash) return '-';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function formatNumber(num) {
    const numStr = String(num);
    if (!num && num !== 0) return '0';
    if (numStr === '0' || num === 0) return '0';
    try {
        const parsed = parseInt(numStr);
        if (isNaN(parsed)) return '0';
        return parsed.toLocaleString();
    } catch (e) {
        console.warn('Error formateando número:', num, e);
        return String(num);
    }
}

function copyToClipboard(text, event) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyTooltip(event.target);
        showAlert('Dirección copiada al portapapeles', 'success');
    }).catch(err => {
        showAlert('Error al copiar: ' + err, 'error');
    });
}

function showCopyTooltip(element) {
    let tooltip = element.querySelector('.copy-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = '¡Copiado!';
        element.style.position = 'relative';
        element.appendChild(tooltip);
    }
    tooltip.classList.add('show');
    setTimeout(() => tooltip.classList.remove('show'), 2000);
}

function toggleAddressDisplay() {
    showFullAddresses = !showFullAddresses;
    updateAddressModeUI();
    loadHealth();
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        if (tabId === 'callers') loadCallers();
        if (tabId === 'deployers') loadDeployers();
    }
    showAlert(showFullAddresses ? 'Mostrando direcciones completas' : 'Mostrando direcciones cortas', 'info');
}

function updateAddressModeUI() {
    const modeText = document.getElementById('addressModeText');
    const toggleBtn = document.getElementById('addressToggleBtn');
    if (modeText) modeText.textContent = showFullAddresses ? 'Direcciones completas' : 'Direcciones cortas';
    if (toggleBtn) {
        toggleBtn.textContent = showFullAddresses ? '👁️' : '👁️‍🗨️';
        toggleBtn.title = showFullAddresses ? 'Mostrar direcciones cortas' : 'Mostrar direcciones completas';
    }
}

setInterval(loadHealth, 30000);
