require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(express.json());

const modifiers = {chainId: 648541,gasPrice: 0,type: 0,gasLimit: 5000000};

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 requests por ventana
});
app.use(limiter);

// Configuración del provider y wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
console.log("Using RPC URL:", process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
console.log("Using wallet address:", wallet.address);

// ABI del contrato (simplificado para las funciones principales)
const contractABI = [
    "function setCallerAllowed(address caller, bool allowed) external",
    "function setGasLimitPerBlock(address caller, uint256 limit) external",
    "function setGasAccountingOverhead(uint256 overhead) external",
    "function setErc2771AppendSender(bool enabled) external",
    "function setDefaultDeployGasBucketConfig(uint256 limit, uint64 durationSeconds) external",
    "function setDeployerBucketConfig(address deployer, uint256 limit, uint64 durationSeconds, bool useCustom) external",
    "function setAllowedDeployer(address account, bool allowed) external",
    "function setAllowedDeployers(address[] calldata accounts, bool[] calldata allowed) external",
    "function isCallerAllowed(address) view returns (bool)",
    "function gasLimitPerBlock(address) view returns (uint256)",
    "function allowedDeployers(address) view returns (bool)",
    "function getAllowedCallers() view returns (address[])",
    "function getAllowedDeployers() view returns (address[])",
    "function getDeployerInfo(address deployer) view returns (tuple(address deployer, bool allowed, uint256 gasUsedInWindow, uint64 windowStartedAt, uint256 lastDeployBlock, uint256 gasBucketLimit, uint64 gasBucketDuration, bool useCustomConfig))",
    "function gasUsedThisBlock(address caller) view returns (uint256 used, uint256 limit, uint256 blockNo)",
    "function deployGasWindowState(address from) view returns (uint256 used, uint256 limit, uint64 startedAt, uint64 duration, uint256 nowTs)",
    "function owner() view returns (address)",
    "function erc2771AppendSender() view returns (bool)",
    "function gasAccountingOverhead() view returns (uint256)",
    "function defaultDeployGasBucketLimit() view returns (uint256)",
    "function defaultDeployGasBucketDuration() view returns (uint64)"
];

// Instancia del contrato
const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI,
    wallet
);

console.log("Using contract address:", process.env.CONTRACT_ADDRESS);
console.log("Using network:", process.env.NETWORK || 'unknown');
console.log("Wallet address:", wallet.address);
console.log("Contract instance created.");

// Middleware de autenticación
const authenticate = (req, res, next) => {
    const apiKey = req.query.apikey || req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ 
            error: 'No autorizado',
            message: 'API key inválida o faltante'
        });
    }
    
    next();
};

// Aplicar autenticación a todas las rutas
app.use(authenticate);

// ============= ENDPOINTS DE LECTURA (VIEW) =============

// Health check
app.get('/health', async (req, res) => {
    try {
        const owner = await contract.owner();
        const blockNumber = await provider.getBlockNumber();
        
        res.json({
            status: 'ok',
            contract: process.env.CONTRACT_ADDRESS,
            owner: owner,
            network: process.env.NETWORK || 'unknown',
            blockNumber: blockNumber
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al verificar estado',
            details: error.message 
        });
    }
});

// Obtener información general del contrato
app.get('/config', async (req, res) => {
    try {
        const [
            owner,
            erc2771Enabled,
            gasOverhead,
            defaultDeployLimit,
            defaultDeployDuration
        ] = await Promise.all([
            contract.owner(),
            contract.erc2771AppendSender(),
            contract.gasAccountingOverhead(),
            contract.defaultDeployGasBucketLimit(),
            contract.defaultDeployGasBucketDuration()
        ]);

        res.json({
            owner,
            erc2771AppendSender: erc2771Enabled,
            gasAccountingOverhead: gasOverhead.toString(),
            defaultDeployGasBucketLimit: defaultDeployLimit.toString(),
            defaultDeployGasBucketDuration: defaultDeployDuration.toString()
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener configuración',
            details: error.message 
        });
    }
});

// Verificar si un caller está permitido
app.get('/caller/:address/allowed', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Dirección inválida' });
        }

        const isAllowed = await contract.isCallerAllowed(address);
        const gasLimit = await contract.gasLimitPerBlock(address);
        const gasUsed = await contract.gasUsedThisBlock(address);

        res.json({
            address,
            isAllowed,
            gasLimitPerBlock: gasLimit.toString(),
            gasUsedThisBlock: {
                used: gasUsed.used.toString(),
                limit: gasUsed.limit.toString(),
                blockNumber: gasUsed.blockNo.toString()
            }
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al consultar caller',
            details: error.message 
        });
    }
});

// Obtener todos los callers permitidos
app.get('/callers', async (req, res) => {
    try {
        const callers = await contract.getAllowedCallers();
        
        res.json({
            count: callers.length,
            callers: callers
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener callers',
            details: error.message 
        });
    }
});

// Verificar si un deployer está permitido
app.get('/deployer/:address/allowed', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Dirección inválida' });
        }

        const isAllowed = await contract.allowedDeployers(address);
        
        res.json({
            address,
            isAllowed
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al consultar deployer',
            details: error.message 
        });
    }
});

// Obtener información detallada de un deployer
app.get('/deployer/:address/info', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Dirección inválida' });
        }

        const info = await contract.getDeployerInfo(address);
        const gasState = await contract.deployGasWindowState(address);

        res.json({
            deployer: info.deployer,
            allowed: info.allowed,
            gasUsedInWindow: info.gasUsedInWindow.toString(),
            windowStartedAt: info.windowStartedAt.toString(),
            lastDeployBlock: info.lastDeployBlock.toString(),
            gasBucketLimit: info.gasBucketLimit.toString(),
            gasBucketDuration: info.gasBucketDuration.toString(),
            useCustomConfig: info.useCustomConfig,
            currentState: {
                used: gasState.used.toString(),
                limit: gasState.limit.toString(),
                startedAt: gasState.startedAt.toString(),
                duration: gasState.duration.toString(),
                currentTimestamp: gasState.nowTs.toString()
            }
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener información del deployer',
            details: error.message 
        });
    }
});

// Obtener todos los deployers permitidos
app.get('/deployers', async (req, res) => {
    try {
        const deployers = await contract.getAllowedDeployers();
        
        res.json({
            count: deployers.length,
            deployers: deployers
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener deployers',
            details: error.message 
        });
    }
});

// ============= ENDPOINTS DE ESCRITURA =============

// Establecer si un caller está permitido
app.post('/caller/set-allowed', async (req, res) => {
    try {
        const { caller, allowed } = req.body;
        
        if (!ethers.isAddress(caller)) {
            return res.status(400).json({ error: 'Dirección de caller inválida' });
        }

   
        const tx = await contract.setCallerAllowed(caller, allowed,modifiers);
   

        const receipt = await tx.wait();

        res.json({
            success: true,
            caller,
            allowed,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al establecer caller',
            details: error.message 
        });
    }
});

// Establecer límite de gas por bloque para un caller
app.post('/caller/set-gas-limit', async (req, res) => {
    try {
        const { caller, limit } = req.body;
        
        if (!ethers.isAddress(caller)) {
            return res.status(400).json({ error: 'Dirección de caller inválida' });
        }

        const tx = await contract.setGasLimitPerBlock(caller, limit, modifiers);
        const receipt = await tx.wait();

        res.json({
            success: true,
            caller,
            gasLimit: limit.toString(),
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al establecer límite de gas',
            details: error.message 
        });
    }
});

// Establecer overhead de contabilidad de gas
app.post('/config/set-gas-overhead', async (req, res) => {
    try {
        const { overhead } = req.body;

        const tx = await contract.setGasAccountingOverhead(overhead, modifiers);
        const receipt = await tx.wait();

        res.json({
            success: true,
            gasAccountingOverhead: overhead.toString(),
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al establecer overhead',
            details: error.message 
        });
    }
});

// Habilitar/deshabilitar ERC-2771
app.post('/config/set-erc2771', async (req, res) => {
    try {
        const { enabled } = req.body;
        console.log("Setting ERC-2771 to:", enabled);
        const tx = await contract.setErc2771AppendSender(enabled, modifiers);
        const receipt = await tx.wait();

        res.json({
            success: true,
            erc2771AppendSender: enabled,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al establecer ERC-2771',
            details: error.message 
        });
    }
});

// Establecer configuración de bucket de deploy por defecto
app.post('/config/set-default-deploy-bucket', async (req, res) => {
    try {
        const { limit, durationSeconds } = req.body;

        const tx = await contract.setDefaultDeployGasBucketConfig(limit, durationSeconds, modifiers);
        const receipt = await tx.wait();

        res.json({
            success: true,
            defaultDeployGasBucketLimit: limit.toString(),
            defaultDeployGasBucketDuration: durationSeconds.toString(),
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al establecer bucket por defecto',
            details: error.message 
        });
    }
});

// Establecer configuración de bucket personalizado para un deployer
app.post('/deployer/set-bucket-config', async (req, res) => {
    try {
        const { deployer, limit, durationSeconds, useCustom } = req.body;
        
        if (!ethers.isAddress(deployer)) {
            return res.status(400).json({ error: 'Dirección de deployer inválida' });
        }

        const tx = await contract.setDeployerBucketConfig(deployer, limit, durationSeconds, useCustom, modifiers); 
        const receipt = await tx.wait();

        res.json({
            success: true,
            deployer,
            gasBucketLimit: limit.toString(),
            gasBucketDuration: durationSeconds.toString(),
            useCustomConfig: useCustom,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al establecer bucket personalizado',
            details: error.message 
        });
    }
});

// Establecer si un deployer está permitido
app.post('/deployer/set-allowed', async (req, res) => {
    try {
        const { deployer, allowed } = req.body;
        
        if (!ethers.isAddress(deployer)) {
            return res.status(400).json({ error: 'Dirección de deployer inválida' });
        }

        const tx = await contract.setAllowedDeployer(deployer, allowed, modifiers);
        const receipt = await tx.wait();

        res.json({
            success: true,
            deployer,
            allowed,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al establecer deployer',
            details: error.message 
        });
    }
});

// Establecer múltiples deployers permitidos
app.post('/deployers/set-allowed-batch', async (req, res) => {
    try {
        const { deployers, allowed } = req.body;
        
        if (!Array.isArray(deployers) || !Array.isArray(allowed)) {
            return res.status(400).json({ error: 'Se requieren arrays de deployers y allowed' });
        }

        if (deployers.length !== allowed.length) {
            return res.status(400).json({ error: 'Los arrays deben tener la misma longitud' });
        }

        for (const addr of deployers) {
            if (!ethers.isAddress(addr)) {
                return res.status(400).json({ error: `Dirección inválida: ${addr}` });
            }
        }

        const tx = await contract.setAllowedDeployers(deployers, allowed, modifiers);
        const receipt = await tx.wait();

        res.json({
            success: true,
            count: deployers.length,
            deployers,
            allowed,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al establecer deployers en batch',
            details: error.message 
        });
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        details: err.message 
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 API MetaTxForwarder en puerto ${port}`);
    console.log(`📄 Contrato: ${process.env.CONTRACT_ADDRESS}`);
    console.log(`🌐 Network: ${process.env.NETWORK || 'unknown'}`);
});    

    
