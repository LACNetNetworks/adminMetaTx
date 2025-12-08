# 🚀 Guía de Inicio Rápido - MetaTxForwarder Admin

## 📋 Requisitos Previos

- ✅ Node.js v16+ instalado
- ✅ Contrato MetaTxForwarder desplegado
- ✅ API Key generada

## 🎯 Inicio Rápido (5 minutos)

### Paso 1: Configurar el Backend (API)

```bash
# 1. Navega a la carpeta de la API
cd api-metatx

# 2. Instala dependencias
npm install

# 3. Configura el .env
cp .env.example .env
nano .env  # Edita con tus valores

# 4. Inicia el servidor API
npm start
```

Tu API estará en: `http://localhost:3000`

### Paso 2: Configurar la Interfaz Web

```bash
# En otra terminal, navega a la carpeta web
cd web-interface

# Inicia el servidor web
node web-server.js
```

Tu interfaz estará en: `http://localhost:8080`

### Paso 3: Configurar la Interfaz

1. Abre `http://localhost:8080` en tu navegador
2. Click en el botón ⚙️ (abajo a la derecha)
3. Configura:
   - **API URL**: `http://localhost:3000`
   - **API Key**: Tu API key del archivo `.env`
4. Click en **💾 Guardar Configuración**

¡Listo! Ya puedes administrar tu contrato.

## 📁 Estructura del Proyecto

```
metatx-admin/
├── api/                          # Backend API
│   ├── server.js                 # Servidor Express
│   ├── package.json              # Dependencias API
│   ├── .env.example              # Ejemplo de configuración
│   └── .env                      # Tu configuración (no subir a git)
│
├── web/                          # Frontend Web
│   ├── index.html                # Interfaz principal
│   ├── app.js                    # Lógica de la aplicación
│   ├── web-server.js             # Servidor web simple
│   └── package-web.json          # Info del paquete web
│
└── README.md                     # Esta guía
```

## ⚙️ Configuración Detallada

### Configurar .env (API)

```env
# Puerto del servidor API
PORT=3000

# API Key (genera una con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
API_KEY=tu_api_key_super_secreta_aqui

# RPC URL de tu red blockchain
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/TU_API_KEY

# Nombre de la red
NETWORK=ethereum-mainnet

# Private key del owner del contrato
PRIVATE_KEY=0xtu_private_key_aqui

# Dirección del contrato desplegado
CONTRACT_ADDRESS=0xtu_contrato_aqui
```

### Generar API Key Segura

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🎨 Uso de la Interfaz Web

### Dashboard (Header)

Muestra información en tiempo real:
- ✅ Status de la API
- 📄 Dirección del contrato
- 👤 Owner del contrato
- 🌐 Red blockchain
- 🔢 Número de bloque actual

### Tab: Callers 📞

**Para permitir un caller:**
1. Ingresa la dirección del caller
2. Click en "✅ Permitir Caller"
3. Espera la confirmación de la tx

**Para configurar gas limit:**
1. Ingresa la dirección
2. Ingresa el límite (ej: 5000000)
3. Click en "💨 Establecer Límite"

### Tab: Deployers 🚀

**Para permitir un deployer:**
1. Ingresa la dirección
2. Click en "✅ Permitir Deployer"

**Para configurar bucket personalizado:**
1. Ingresa la dirección del deployer
2. Límite de gas (ej: 20000000)
3. Duración en segundos (ej: 1200)
4. Marca "Usar configuración personalizada"
5. Click en "🪣 Configurar Bucket"

### Tab: Configuración ⚙️

**ERC-2771:**
- Click en "✅ Habilitar" o "❌ Deshabilitar"

**Gas Overhead:**
1. Ingresa el valor (ej: 15000)
2. Click en "💨 Actualizar Overhead"

**Bucket Default:**
1. Límite de gas (ej: 10000000)
2. Duración (ej: 600)
3. Click en "🪣 Actualizar Bucket Default"

### Tab: Monitor 📊

1. Click en "▶️ Iniciar Monitoreo"
2. Se actualiza automáticamente cada 5 segundos
3. Click en "⏸️ Detener Monitoreo" para parar

## 🔧 Comandos Útiles

### API (Backend)

```bash
# Iniciar servidor
npm start

# Desarrollo con auto-reload
npm run dev

# Ver logs
# Los logs se muestran en la consola
```

### Web (Frontend)

```bash
# Iniciar servidor web
node web-server.js

# Cambiar puerto
WEB_PORT=9000 node web-server.js

# Servir con Python (alternativa)
python3 -m http.server 8080
```

## 🐛 Solución de Problemas

### API no inicia

**Error: "PRIVATE_KEY no está definida"**
```bash
# Verifica que el .env tenga todos los valores
cat .env
```

**Error: "invalid BytesLike value"**
```bash
# Tu PRIVATE_KEY debe tener exactamente 66 caracteres (0x + 64 hex)
# Verifica que no tenga espacios o caracteres extra
```

### Interfaz Web no carga

**Error: "API key inválida"**
- Verifica que la API key en la interfaz sea la misma que en `.env`
- Abre el modal de configuración (⚙️) y verifica

**Error: "Error al verificar estado"**
```bash
# Verifica que la API esté corriendo
curl http://localhost:3000/health?apikey=tu_api_key

# Deberías ver un JSON con status: "ok"
```

### Transacciones no se envían

**Error: "Tu wallet no es el owner"**
- Solo el owner del contrato puede hacer cambios
- Verifica que tu `PRIVATE_KEY` corresponda al owner

**Transacciones pendientes:**
- Verifica el gas price de tu red
- Revisa el explorador de bloques con el hash de la tx

## 📊 Endpoints de la API

### Lectura (GET)

```bash
# Health check
curl "http://localhost:3000/health?apikey=YOUR_KEY"

# Ver configuración
curl "http://localhost:3000/config?apikey=YOUR_KEY"

# Ver callers
curl "http://localhost:3000/callers?apikey=YOUR_KEY"

# Ver deployers
curl "http://localhost:3000/deployers?apikey=YOUR_KEY"

# Info de un caller
curl "http://localhost:3000/caller/0xADDRESS/allowed?apikey=YOUR_KEY"

# Info de un deployer
curl "http://localhost:3000/deployer/0xADDRESS/info?apikey=YOUR_KEY"
```

### Escritura (POST)

```bash
# Permitir caller
curl -X POST "http://localhost:3000/caller/set-allowed?apikey=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"caller": "0xADDRESS", "allowed": true}'

# Permitir deployer
curl -X POST "http://localhost:3000/deployer/set-allowed?apikey=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"deployer": "0xADDRESS", "allowed": true}'

# Configurar gas limit
curl -X POST "http://localhost:3000/caller/set-gas-limit?apikey=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"caller": "0xADDRESS", "limit": "5000000"}'
```

## 🚀 Deploy en Producción

### Opción 1: Mismo Servidor

```bash
# Usar PM2 para mantener procesos activos
npm install -g pm2

# Iniciar API
pm2 start server.js --name metatx-api

# Iniciar Web
pm2 start web-server.js --name metatx-web

# Ver estado
pm2 status

# Ver logs
pm2 logs
```

### Opción 2: Servidores Separados

**API en Railway/Heroku:**
```bash
# Railway
railway up

# Heroku
git push heroku main
```

**Web en Netlify/Vercel:**
```bash
# Netlify
netlify deploy --prod

# Vercel
vercel --prod
```

### Opción 3: Docker

```bash
# Build
docker build -t metatx-api -f Dockerfile.api .
docker build -t metatx-web -f Dockerfile.web .

# Run
docker run -d -p 3000:3000 --env-file .env metatx-api
docker run -d -p 8080:8080 metatx-web
```

## 🔒 Seguridad en Producción

1. **Usa HTTPS** siempre
2. **Nunca expongas** tu PRIVATE_KEY
3. **Rota la API_KEY** periódicamente
4. **Usa un gestor de secretos** (AWS Secrets, Vault)
5. **Implementa rate limiting** adicional
6. **Monitorea** los logs regularmente
7. **Usa un firewall** (UFW, iptables)

## 📝 Checklist Pre-Producción

- [ ] API_KEY generada con crypto.randomBytes
- [ ] PRIVATE_KEY en gestor de secretos (no en .env)
- [ ] HTTPS configurado
- [ ] CORS configurado correctamente
- [ ] Rate limiting activado
- [ ] Logs configurados
- [ ] Backup de configuración
- [ ] Monitoreo activo
- [ ] Dominio configurado
- [ ] Certificado SSL válido

## 🎓 Recursos Adicionales

- [Documentación de Ethers.js](https://docs.ethers.org/)
- [Estándar ERC-2771](https://eips.ethereum.org/EIPS/eip-2771)
- [Express.js Docs](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 💬 Soporte

¿Problemas? ¿Preguntas?
- Revisa la [documentación completa](./README.md)
- Revisa los [issues en GitHub](tu-repo/issues)
- Abre un nuevo issue

---

**¡Listo para administrar tu MetaTxForwarder! 🚀**
