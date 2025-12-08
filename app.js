// Configuración
let API_URL = localStorage.getItem('apiUrl') || 'http://localhost:3000';
let API_KEY = localStorage.getItem('apiKey') || '';

let monitoringInterval = null;
let showFullAddresses = localStorage.getItem('showFullAddresses') === 'true' || false;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadHealth();
    loadConfig();
    updateAddressModeUI();
    
    // Si no hay API key configurada, abrir modal
    if (!API_KEY) {
        openConfigModal();
    }
});

// ==================== CONFIGURACIÓN ====================

function openConfigModal() {
    document.getElementById('configModal').classList.add('show');
    document.getElementById('apiUrl').value = API_URL;
    document.getElementById('apiKey').value = API_KEY;
}

function closeConfigModal() {
    document.getElementById('configModal').classList.remove('show');
}

function saveConfig() {
    API_URL = document.getElementById('apiUrl').value;
    API_KEY = document.getElementById('apiKey').value;
    
    localStorage.setItem('apiUrl', API_URL);
    localStorage.setItem('apiKey', API_KEY);
    
    showAlert('Configuración guardada correctamente', 'success');
    closeConfigModal();
    loadHealth();
}

// ==================== TABS ====================

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover active de todos los tabs
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Activar tab clickeado
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // Cargar datos según tab
            if (tabId === 'callers') loadCallers();
            if (tabId === 'deployers') loadDeployers();
            if (tabId === 'config') loadConfig();
        });
    });
}

// ==================== API HELPERS ====================

async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
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

// ==================== ALERTS ====================

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

// ==================== LOADER ====================

function showLoader(text = 'Procesando transacción...', subtext = 'Por favor espera') {
    const overlay = document.getElementById('loaderOverlay');
    const loaderText = document.getElementById('loaderText');
    const loaderSubtext = document.getElementById('loaderSubtext');
    
    loaderText.textContent = text;
    loaderSubtext.textContent = subtext;
    overlay.classList.add('show');
    
    // Deshabilitar scroll
    document.body.style.overflow = 'hidden';
}

function hideLoader() {
    const overlay = document.getElementById('loaderOverlay');
    overlay.classList.remove('show');
    
    // Habilitar scroll
    document.body.style.overflow = 'auto';
}

function updateLoader(text, subtext) {
    const loaderText = document.getElementById('loaderText');
    const loaderSubtext = document.getElementById('loaderSubtext');
    
    if (loaderText) loaderText.textContent = text;
    if (loaderSubtext) loaderSubtext.textContent = subtext;
}

// ==================== HEALTH & STATUS ====================

async function loadHealth() {
    try {
        const data = await apiRequest('/health');
        
        document.getElementById('statusValue').textContent = data.status === 'ok' ? '✅ Online' : '❌ Offline';
        document.getElementById('contractAddress').innerHTML = shortenAddress(data.contract);
        document.getElementById('ownerAddress').innerHTML = shortenAddress(data.owner);
        document.getElementById('networkName').textContent = data.network;
        document.getElementById('blockNumber').textContent = data.blockNumber;
    } catch (error) {
        document.getElementById('statusValue').textContent = '❌ Error';
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

// ==================== CALLERS ====================

async function setCallerAllowed(allowed) {
    const address = document.getElementById('callerAddress').value;
    
    if (!address || !isValidAddress(address)) {
        showAlert('Dirección inválida', 'error');
        return;
    }
    
    try {
        showLoader(
            allowed ? 'Permitiendo caller...' : 'Bloqueando caller...',
            `Procesando: ${shortenAddressPlain(address)}`
        );
        
        const data = await apiRequest('/caller/set-allowed', 'POST', {
            caller: address,
            allowed: allowed
        });
        
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
        showLoader(
            'Configurando límite de gas...',
            `${formatNumber(limit)} gas para ${shortenAddressPlain(address)}`
        );
        
        const data = await apiRequest('/caller/set-gas-limit', 'POST', {
            caller: address,
            limit: limit
        });
        
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
        const data = await apiRequest('/callers');
        const tbody = document.getElementById('callersTable');
        
        if (data.callers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <div class="empty-state-icon">📭</div>
                        <p>No hay callers permitidos</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        for (const caller of data.callers) {
            const info = await apiRequest(`/caller/${caller}/allowed`);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${shortenAddress(caller)}</td>
                <td>${formatNumber(info.gasLimitPerBlock)}</td>
                <td>${formatNumber(info.gasUsedThisBlock.used)} / ${formatNumber(info.gasUsedThisBlock.limit)}</td>
                <td>
                    <button class="btn btn-danger" onclick="removeCallerConfirm('${caller}')" style="padding: 6px 12px; font-size: 12px;">
                        🗑️ Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        }
    } catch (error) {
        console.error('Error loading callers:', error);
    }
}

async function removeCallerConfirm(address) {
    if (confirm(`¿Seguro que quieres eliminar el caller ${shortenAddressPlain(address)}?`)) {
        try {
            showLoader(
                'Eliminando caller...',
                shortenAddressPlain(address)
            );
            
            await apiRequest('/caller/set-allowed', 'POST', {
                caller: address,
                allowed: false
            });
            
            hideLoader();
            showAlert('Caller eliminado correctamente', 'success');
            loadCallers();
        } catch (error) {
            hideLoader();
            console.error('Error removing caller:', error);
        }
    }
}

// ==================== DEPLOYERS ====================

async function setDeployerAllowed(allowed) {
    const address = document.getElementById('deployerAddress').value;
    
    if (!address || !isValidAddress(address)) {
        showAlert('Dirección inválida', 'error');
        return;
    }
    
    try {
        showLoader(
            allowed ? 'Permitiendo deployer...' : 'Bloqueando deployer...',
            `Procesando: ${shortenAddressPlain(address)}`
        );
        
        const data = await apiRequest('/deployer/set-allowed', 'POST', {
            deployer: address,
            allowed: allowed
        });
        
        hideLoader();
        showAlert(`Deployer ${allowed ? 'permitido' : 'bloqueado'} correctamente. TX: ${shortenHash(data.txHash)}`, 'success');
        document.getElementById('deployerAddress').value = '';
        loadDeployers();
    } catch (error) {
        hideLoader();
        console.error('Error setting deployer:', error);
    }
}

async function setDeployerBucket() {
    const address = document.getElementById('bucketDeployerAddress').value;
    const limit = document.getElementById('bucketLimit').value;
    const duration = document.getElementById('bucketDuration').value;
    const useCustom = document.getElementById('useCustomBucket').checked;
    
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
        showLoader(
            'Configurando bucket de gas...',
            `Límite: ${formatNumber(limit)} | Duración: ${duration}s`
        );
        
        const data = await apiRequest('/deployer/set-bucket-config', 'POST', {
            deployer: address,
            limit: limit,
            durationSeconds: duration,
            useCustom: useCustom
        });
        
        hideLoader();
        showAlert(`Bucket configurado correctamente. TX: ${shortenHash(data.txHash)}`, 'success');
        document.getElementById('bucketDeployerAddress').value = '';
        document.getElementById('bucketLimit').value = '';
        document.getElementById('bucketDuration').value = '';
        loadDeployers();
    } catch (error) {
        hideLoader();
        console.error('Error setting bucket:', error);
    }
}

async function loadDeployers() {
    try {
        const data = await apiRequest('/deployers');
        const tbody = document.getElementById('deployersTable');
        
        if (data.deployers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <div class="empty-state-icon">📭</div>
                        <p>No hay deployers permitidos</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        for (const deployer of data.deployers) {
            const info = await apiRequest(`/deployer/${deployer}/info`);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${shortenAddress(deployer)}</td>
                <td>
                    <span class="badge ${info.allowed ? 'badge-success' : 'badge-danger'}">
                        ${info.allowed ? '✅ Permitido' : '❌ Bloqueado'}
                    </span>
                </td>
                <td>${formatNumber(info.currentState.used)} / ${formatNumber(info.currentState.limit)}</td>
                <td>${formatNumber(info.gasBucketLimit)}</td>
                <td>
                    <button class="btn btn-danger" onclick="removeDeployerConfirm('${deployer}')" style="padding: 6px 12px; font-size: 12px;">
                        🗑️ Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        }
    } catch (error) {
        console.error('Error loading deployers:', error);
    }
}

async function removeDeployerConfirm(address) {
    if (confirm(`¿Seguro que quieres eliminar el deployer ${shortenAddressPlain(address)}?`)) {
        try {
            showLoader(
                'Eliminando deployer...',
                shortenAddressPlain(address)
            );
            
            await apiRequest('/deployer/set-allowed', 'POST', {
                deployer: address,
                allowed: false
            });
            
            hideLoader();
            showAlert('Deployer eliminado correctamente', 'success');
            loadDeployers();
        } catch (error) {
            hideLoader();
            console.error('Error removing deployer:', error);
        }
    }
}

// ==================== CONFIGURATION ====================

async function setErc2771(enabled) {
    try {
        showLoader(
            enabled ? 'Habilitando ERC-2771...' : 'Deshabilitando ERC-2771...',
            'Append sender al calldata'
        );
        
        const data = await apiRequest('/config/set-erc2771', 'POST', {
            enabled: enabled
        });
        
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
        showLoader(
            'Configurando gas overhead...',
            `Nuevo valor: ${formatNumber(overhead)}`
        );
        
        const data = await apiRequest('/config/set-gas-overhead', 'POST', {
            overhead: overhead
        });
        
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
        showLoader(
            'Configurando bucket por defecto...',
            `Límite: ${formatNumber(limit)} | Duración: ${duration}s`
        );
        
        const data = await apiRequest('/config/set-default-deploy-bucket', 'POST', {
            limit: limit,
            durationSeconds: duration
        });
        
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

// ==================== MONITORING ====================

function startMonitoring() {
    if (monitoringInterval) {
        showAlert('El monitoreo ya está activo', 'info');
        return;
    }
    
    showAlert('Monitoreo iniciado', 'success');
    updateMonitor();
    monitoringInterval = setInterval(updateMonitor, 5000); // Actualizar cada 5 segundos
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
        
        const monitorData = document.getElementById('monitorData');
        monitorData.innerHTML = `
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

// ==================== UTILS ====================

function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function shortenAddressPlain(address) {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function shortenAddress(address) {
    if (!address) return '-';
    if (showFullAddresses) {
        return createAddressElement(address, true);
    }
    return createAddressElement(address, false);
}

function createAddressElement(address, isFull) {
    const displayText = isFull ? address : `${address.slice(0, 6)}...${address.slice(-4)}`;
    return `<span class="address ${isFull ? 'full' : ''}" onclick="copyToClipboard('${address}', event)" title="Click para copiar: ${address}">${displayText}</span>`;
}

function shortenHash(hash) {
    if (!hash) return '-';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function formatNumber(num) {
    if (!num || num === '0') return '0';
    return parseInt(num).toLocaleString();
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
    // Crear tooltip si no existe
    let tooltip = element.querySelector('.copy-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = '¡Copiado!';
        element.style.position = 'relative';
        element.appendChild(tooltip);
    }
    
    // Mostrar tooltip
    tooltip.classList.add('show');
    
    // Ocultar después de 2 segundos
    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 2000);
}

function toggleAddressDisplay() {
    showFullAddresses = !showFullAddresses;
    localStorage.setItem('showFullAddresses', showFullAddresses);
    updateAddressModeUI();
    
    // Recargar las vistas actuales
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
    
    if (modeText) {
        modeText.textContent = showFullAddresses ? 'Direcciones completas' : 'Direcciones cortas';
    }
    
    if (toggleBtn) {
        toggleBtn.textContent = showFullAddresses ? '👁️' : '👁️‍🗨️';
        toggleBtn.title = showFullAddresses ? 'Mostrar direcciones cortas' : 'Mostrar direcciones completas';
    }
}

// Auto-actualizar health cada 30 segundos
setInterval(loadHealth, 30000);
