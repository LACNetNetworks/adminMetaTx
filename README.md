# MetaTxForwarder API

API REST para administrar el contrato inteligente MetaTxForwarder en Ethereum.

## 🚀 Características

- ✅ Autenticación por API Key
- ✅ Rate limiting (100 requests por 15 minutos)
- ✅ Helmet.js para seguridad
- ✅ CORS habilitado
- ✅ Endpoints para todas las funciones administrativas del contrato
- ✅ Soporte para múltiples redes (Ethereum, Polygon, Arbitrum, Base, etc.)

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd metatxforwarder-api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores
```

## ⚙️ Configuración

### 1. Generar API Key segura

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configurar .env

Edita el archivo `.env` con tus valores:

```env
PORT=3000
API_KEY=tu_api_key_super_secreta
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/TU_API_KEY
NETWORK=ethereum-mainnet
PRIVATE_KEY=0xtu_private_key_aqui
CONTRACT_ADDRESS=0xtu_contrato_aqui
```

**⚠️ IMPORTANTE:** Nunca compartas tu `PRIVATE_KEY` ni la subas a repositorios públicos.

## 🏃 Ejecutar

### Desarrollo (con auto-reload)
```bash
npm run dev
```

### Producción
```bash
npm start
```

La API estará disponible en `http://localhost:3000`

## 🔐 Autenticación

Todas las peticiones requieren autenticación por API Key. Puedes enviarla de dos formas:

### 1. Como query parameter:
```
GET http://localhost:3000/health?apikey=tu_api_key
```

### 2. Como header:
```
GET http://localhost:3000/health
Headers:
  x-api-key: tu_api_key
```

## 📚 Documentación de Endpoints

### 🔍 Endpoints de Lectura (GET)

#### Health Check
```http
GET /health?apikey=YOUR_API_KEY
```

Respuesta:
```json
{
  "status": "ok",
  "contract": "0x...",
  "owner": "0x...",
  "network": "ethereum-mainnet",
  "blockNumber": 18500000
}
```

#### Obtener Configuración General
```http
GET /config?apikey=YOUR_API_KEY
```

Respuesta:
```json
{
  "owner": "0x...",
  "erc2771AppendSender": true,
  "gasAccountingOverhead": "15000",
  "defaultDeployGasBucketLimit": "10000000",
  "defaultDeployGasBucketDuration": "600"
}
```

#### Verificar Caller Permitido
```http
GET /caller/0xADDRESS/allowed?apikey=YOUR_API_KEY
```

Respuesta:
```json
{
  "address": "0x...",
  "isAllowed": true,
  "gasLimitPerBlock": "5000000",
  "gasUsedThisBlock": {
    "used": "120000",
    "limit": "5000000",
    "blockNumber": "18500000"
  }
}
```

#### Listar Todos los Callers Permitidos
```http
GET /callers?apikey=YOUR_API_KEY
```

Respuesta:
```json
{
  "count": 3,
  "callers": ["0x...", "0x...", "0x..."]
}
```

#### Verificar Deployer Permitido
```http
GET /deployer/0xADDRESS/allowed?apikey=YOUR_API_KEY
```

Respuesta:
```json
{
  "address": "0x...",
  "isAllowed": true
}
```

#### Información Detallada del Deployer
```http
GET /deployer/0xADDRESS/info?apikey=YOUR_API_KEY
```

Respuesta:
```json
{
  "deployer": "0x...",
  "allowed": true,
  "gasUsedInWindow": "3000000",
  "windowStartedAt": "1700000000",
  "lastDeployBlock": "18499999",
  "gasBucketLimit": "10000000",
  "gasBucketDuration": "600",
  "useCustomConfig": false,
  "currentState": {
    "used": "3000000",
    "limit": "10000000",
    "startedAt": "1700000000",
    "duration": "600",
    "currentTimestamp": "1700000500"
  }
}
```

#### Listar Todos los Deployers Permitidos
```http
GET /deployers?apikey=YOUR_API_KEY
```

Respuesta:
```json
{
  "count": 5,
  "deployers": ["0x...", "0x...", "0x..."]
}
```

### ✍️ Endpoints de Escritura (POST)

#### Establecer Caller Permitido
```http
POST /caller/set-allowed?apikey=YOUR_API_KEY
Content-Type: application/json

{
  "caller": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "allowed": true
}
```

Respuesta:
```json
{
  "success": true,
  "caller": "0x...",
  "allowed": true,
  "txHash": "0x...",
  "blockNumber": 18500001
}
```

#### Establecer Límite de Gas por Bloque
```http
POST /caller/set-gas-limit?apikey=YOUR_API_KEY
Content-Type: application/json

{
  "caller": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "limit": "5000000"
}
```

#### Establecer Overhead de Gas
```http
POST /config/set-gas-overhead?apikey=YOUR_API_KEY
Content-Type: application/json

{
  "overhead": "15000"
}
```

#### Habilitar/Deshabilitar ERC-2771
```http
POST /config/set-erc2771?apikey=YOUR_API_KEY
Content-Type: application/json

{
  "enabled": true
}
```

#### Establecer Bucket de Deploy por Defecto
```http
POST /config/set-default-deploy-bucket?apikey=YOUR_API_KEY
Content-Type: application/json

{
  "limit": "10000000",
  "durationSeconds": "600"
}
```

#### Establecer Bucket Personalizado para Deployer
```http
POST /deployer/set-bucket-config?apikey=YOUR_API_KEY
Content-Type: application/json

{
  "deployer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "limit": "20000000",
  "durationSeconds": "1200",
  "useCustom": true
}
```

#### Establecer Deployer Permitido
```http
POST /deployer/set-allowed?apikey=YOUR_API_KEY
Content-Type: application/json

{
  "deployer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "allowed": true
}
```

#### Establecer Múltiples Deployers (Batch)
```http
POST /deployers/set-allowed-batch?apikey=YOUR_API_KEY
Content-Type: application/json

{
  "deployers": [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
  ],
  "allowed": [true, true]
}
```

## 🧪 Ejemplos de Uso

### Con cURL

```bash
# Health check
curl "http://localhost:3000/health?apikey=tu_api_key"

# Obtener configuración
curl "http://localhost:3000/config?apikey=tu_api_key"

# Establecer caller permitido
curl -X POST "http://localhost:3000/caller/set-allowed?apikey=tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "caller": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "allowed": true
  }'
```

### Con JavaScript/Node.js

```javascript
const API_URL = 'http://localhost:3000';
const API_KEY = 'tu_api_key';

// Función auxiliar
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
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  return response.json();
}

// Health check
const health = await apiRequest('/health');
console.log(health);

// Establecer caller
const result = await apiRequest('/caller/set-allowed', 'POST', {
  caller: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
  allowed: true
});
console.log(result);
```

### Con Python

```python
import requests

API_URL = 'http://localhost:3000'
API_KEY = 'tu_api_key'

# Health check
response = requests.get(
    f'{API_URL}/health',
    params={'apikey': API_KEY}
)
print(response.json())

# Establecer caller
response = requests.post(
    f'{API_URL}/caller/set-allowed',
    params={'apikey': API_KEY},
    json={
        'caller': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        'allowed': True
    }
)
print(response.json())
```

## 🔒 Seguridad

1. **API Key**: Todas las peticiones requieren autenticación
2. **Rate Limiting**: Máximo 100 requests por 15 minutos
3. **Helmet.js**: Headers de seguridad HTTP
4. **CORS**: Configurado para permitir orígenes específicos
5. **Variables de entorno**: Credenciales nunca en código

### Mejores Prácticas:

- ✅ Usa HTTPS en producción
- ✅ Regenera el API_KEY periódicamente
- ✅ Usa un servicio de gestión de secretos (AWS Secrets Manager, Railway, etc.)
- ✅ Implementa logging y monitoreo
- ✅ Considera usar un reverse proxy (nginx)
- ✅ Implementa autenticación por token JWT para usuarios específicos

## 📊 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | Éxito |
| 400 | Petición inválida (parámetros incorrectos) |
| 401 | No autorizado (API key inválida) |
| 404 | Endpoint no encontrado |
| 429 | Demasiadas peticiones (rate limit) |
| 500 | Error interno del servidor |

## 🚀 Deploy en Producción

### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway init
railway up
```

### Heroku

```bash
# Login
heroku login

# Crear app
heroku create tu-app-name

# Configurar variables
heroku config:set API_KEY=tu_api_key
heroku config:set RPC_URL=tu_rpc_url
heroku config:set PRIVATE_KEY=tu_private_key
heroku config:set CONTRACT_ADDRESS=tu_contrato

# Deploy
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

```bash
# Build
docker build -t metatxforwarder-api .

# Run
docker run -p 3000:3000 --env-file .env metatxforwarder-api
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

MIT

## 👤 Autor

Luis - MetaTxForwarder Contract

## 📧 Soporte

Para reportar bugs o solicitar features, por favor abre un issue en GitHub.
