#!/usr/bin/env node

require('dotenv').config();

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.WEB_PORT || 3001;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Helper para hacer requests HTTPS
function httpsRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

// Determinar la URL de la API según la red
function getApiUrl(network = 'testnet') {
    return network === 'mainnet' 
        ? process.env.MAINNET_API_URL 
        : process.env.TESTNET_API_URL;
}

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // CORS + preflight
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Network'
    };

    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        return res.end();
    }

    // Config por red (para prefill del front)
    if (req.url === '/config') {
        const payload = {
            apiKey: process.env.API_KEY || '',
            testnet: {
                apiUrl: process.env.TESTNET_API_URL,
                contractAddress: process.env.TESTNET_CONTRACT_ADDRESS || ''
            },
            mainnet: {
                apiUrl: process.env.MAINNET_API_URL,
                contractAddress: process.env.MAINNET_CONTRACT_ADDRESS || ''
            }
        };
        res.writeHead(200, {
            'Content-Type': 'application/json',
            ...corsHeaders
        });
        return res.end(JSON.stringify(payload, null, 2), 'utf-8');
    }

    // ==================== SERVIR ARCHIVOS ESTÁTICOS ====================
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Archivo no encontrado</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Error del servidor: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                ...corsHeaders
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🎨 Web UI en http://localhost:${PORT}`);
    console.log(`🔄 Proxy activo con endpoints inteligentes:`);
    console.log(`   ✅ GET /callers  → consulta /caller/:address/info`);
    console.log(`   ✅ GET /deployers → consulta /deployer/:address/info`);
    console.log(`📡 Backend APIs configurados:`);
    console.log(`   - Testnet: ${process.env.TESTNET_API_URL}`);
    console.log(`   - Mainnet: ${process.env.MAINNET_API_URL}`);
});