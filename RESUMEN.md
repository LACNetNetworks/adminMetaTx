# 📦 MetaTxForwarder Admin - Paquete Completo

## 🎉 ¡Todo Listo!

Has recibido un sistema completo para administrar tu contrato MetaTxForwarder:

### ✅ Backend API (Node.js + Express)
- API REST completa con todos los endpoints
- Autenticación por API Key
- Rate limiting y seguridad
- Soporte para todas las funciones del contrato

### ✅ Interfaz Web (HTML + JavaScript)
- Dashboard en tiempo real
- Gestión de Callers y Deployers
- Configuración del contrato
- Monitor en vivo
- Diseño moderno y responsive

### ✅ Documentación Completa
- Guías de inicio rápido
- Ejemplos en múltiples lenguajes
- Troubleshooting
- Mejores prácticas

---

## 📁 Archivos Incluidos

### 🔧 API (Backend)

| Archivo | Descripción |
|---------|-------------|
| `server.js` | Servidor API principal con Express |
| `package.json` | Dependencias del proyecto |
| `.env.example` | Ejemplo de configuración (renombrar a `.env`) |
| `README.md` | Documentación completa de la API |
| `EXAMPLES.md` | Ejemplos de uso en JS, Python, cURL |

### 🎨 Web (Frontend)

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Interfaz web principal |
| `app.js` | Lógica de la aplicación |
| `web-server.js` | Servidor web simple |
| `package-web.json` | Info del paquete web |
| `WEB_README.md` | Documentación de la interfaz |

### 📚 Documentación

| Archivo | Descripción |
|---------|-------------|
| `QUICKSTART.md` | Guía de inicio rápido (5 min) |
| `README.md` | Documentación completa de la API |
| `WEB_README.md` | Documentación de la interfaz web |
| `EXAMPLES.md` | Ejemplos en múltiples lenguajes |

### 🧪 Testing & Tools

| Archivo | Descripción |
|---------|-------------|
| `insomnia-collection.json` | Colección de Insomnia para probar la API |
| `metatxforwarder-api.har` | Archivo HAR para importar en otras herramientas |

---

## 🚀 Inicio Rápido (3 Pasos)

### 1️⃣ Configurar Backend

```bash
# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
nano .env  # Edita con tus valores

# Generar API Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Iniciar servidor
npm start
```

### 2️⃣ Iniciar Interfaz Web

```bash
# En otra terminal
node web-server.js
```

### 3️⃣ Configurar Web

1. Abre `http://localhost:8080`
2. Click en ⚙️ (abajo derecha)
3. Configura API URL y API Key
4. ¡Listo!

---

## 📋 Configuración del .env

```env
# Puerto del servidor
PORT=3000

# API Key (genera con el comando de arriba)
API_KEY=tu_api_key_super_secreta

# RPC URL (Alchemy, Infura, etc)
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/TU_API_KEY

# Red
NETWORK=ethereum-mainnet

# Private key del owner (debe empezar con 0x y tener 66 caracteres)
PRIVATE_KEY=0xtu_private_key_de_64_caracteres_hex

# Dirección del contrato
CONTRACT_ADDRESS=0xtu_contrato_desplegado
```

---

## 🎯 Funcionalidades Principales

### 📞 Gestión de Callers

- ✅ Permitir/bloquear callers (relayers)
- 💨 Configurar límites de gas por bloque
- 📊 Ver callers activos y su uso de gas
- 🗑️ Eliminar callers

### 🚀 Gestión de Deployers

- ✅ Permitir/bloquear deployers
- 🪣 Configurar buckets de gas personalizados
- 📊 Ver deployers activos
- ⏱️ Configurar duraciones de buckets

### ⚙️ Configuración Global

- 🔄 Habilitar/deshabilitar ERC-2771
- 💨 Ajustar gas accounting overhead
- 🪣 Configurar bucket de deploy por defecto
- 📊 Ver configuración actual

### 📊 Monitoreo

- 🔴 Monitor en tiempo real
- 📈 Actualización automática cada 5s
- 📊 Estadísticas del contrato
- 🔢 Número de bloque actual

---

## 🔌 Endpoints de la API

### Lectura (GET)

```
GET /health                           # Estado de la API
GET /config                           # Configuración del contrato
GET /callers                          # Lista de callers
GET /caller/:address/allowed          # Info de un caller
GET /deployers                        # Lista de deployers
GET /deployer/:address/allowed        # Info de un deployer
GET /deployer/:address/info           # Info detallada de deployer
```

### Escritura (POST)

```
POST /caller/set-allowed              # Permitir/bloquear caller
POST /caller/set-gas-limit            # Configurar gas limit
POST /deployer/set-allowed            # Permitir/bloquear deployer
POST /deployer/set-bucket-config      # Configurar bucket personalizado
POST /deployers/set-allowed-batch     # Batch de deployers
POST /config/set-erc2771              # Habilitar/deshabilitar ERC-2771
POST /config/set-gas-overhead         # Configurar overhead
POST /config/set-default-deploy-bucket # Configurar bucket default
```

---

## 🛠️ Herramientas de Testing

### Insomnia

1. Abre Insomnia
2. Import → From File
3. Selecciona `insomnia-collection.json`
4. Edita las variables de entorno con tu API key
5. ¡Listo para probar!

### cURL

Ver ejemplos completos en `EXAMPLES.md`

```bash
# Health check
curl "http://localhost:3000/health?apikey=YOUR_KEY"

# Permitir caller
curl -X POST "http://localhost:3000/caller/set-allowed?apikey=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"caller": "0xADDRESS", "allowed": true}'
```

---

## 🎨 Capturas de la Interfaz

### Dashboard
- Estado en tiempo real del contrato
- Información del owner y red
- Número de bloque actual

### Tabs
- **Callers**: Gestión completa de relayers
- **Deployers**: Administración de deployers
- **Configuración**: Parámetros globales
- **Monitor**: Estado en vivo

---

## 📊 Arquitectura

```
┌─────────────────┐
│   Navegador     │
│  (localhost:80) │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Interfaz Web   │
│   (HTML + JS)   │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│   API Server    │
│  (Express.js)   │
└────────┬────────┘
         │ ethers.js
         ▼
┌─────────────────┐
│   Blockchain    │
│    (RPC Node)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ MetaTxForwarder │
│    (Contract)   │
└─────────────────┘
```

---

## 🔒 Seguridad

### ✅ Implementado

- API Key authentication
- Rate limiting (100 req/15min)
- Helmet.js security headers
- CORS configurado
- Input validation
- Error handling

### 🔐 Recomendaciones

1. **Nunca expongas tu PRIVATE_KEY**
2. **Usa HTTPS en producción**
3. **Rota la API_KEY regularmente**
4. **Usa gestor de secretos** (AWS Secrets, Vault)
5. **Monitorea logs** constantemente
6. **Implementa 2FA** para acceso crítico

---

## 🐛 Solución de Problemas

### API no inicia

**Problema**: Error con PRIVATE_KEY
```bash
# Verifica longitud (debe ser 66 caracteres: 0x + 64 hex)
echo $PRIVATE_KEY | wc -c  # Debe ser 66
```

**Problema**: Puerto ocupado
```bash
# Cambiar puerto en .env
PORT=3001 npm start
```

### Web no conecta

**Problema**: CORS error
- Verifica que CORS esté habilitado en el servidor
- Usa el mismo origen (localhost)

**Problema**: API key inválida
- Verifica que la key sea la misma en .env y en la web
- No debe tener espacios ni caracteres extra

### Transacciones fallan

**Problema**: "Caller not allowed"
- Solo el owner puede hacer cambios administrativos
- Verifica que tu PRIVATE_KEY sea del owner

**Problema**: Gas price
- Tu red puede requerir gas price específico
- Revisa la configuración de la red

---

## 📚 Recursos Adicionales

- [Documentación Ethers.js](https://docs.ethers.org/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [ERC-2771 Standard](https://eips.ethereum.org/EIPS/eip-2771)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🚀 Deploy en Producción

### Railway

```bash
railway init
railway up
```

### Heroku

```bash
heroku create
git push heroku main
```

### VPS (Digital Ocean, AWS, etc)

```bash
# PM2 para mantener procesos
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

---

## 📝 Checklist Final

Antes de usar en producción:

- [ ] ✅ API_KEY generada de forma segura
- [ ] ✅ PRIVATE_KEY en gestor de secretos
- [ ] ✅ HTTPS configurado
- [ ] ✅ Dominio configurado
- [ ] ✅ Firewall configurado
- [ ] ✅ Logs monitoreados
- [ ] ✅ Backup configurado
- [ ] ✅ Rate limiting ajustado
- [ ] ✅ Documentación revisada
- [ ] ✅ Testing completo realizado

---

## 🎓 Próximos Pasos

1. **Configura tu entorno** siguiendo QUICKSTART.md
2. **Prueba la API** con Insomnia
3. **Usa la interfaz web** para administrar
4. **Lee la documentación** completa
5. **Deploy en producción** cuando estés listo

---

## 💬 Soporte

¿Preguntas? ¿Problemas?

1. Revisa la documentación completa
2. Consulta QUICKSTART.md
3. Revisa EXAMPLES.md
4. Abre un issue en GitHub

---

## 📄 Licencia

MIT License - Úsalo libremente

---

**¡Tu sistema de administración está listo! 🎉**

Comienza con:
```bash
npm install
npm start
```

Y en otra terminal:
```bash
node web-server.js
```

Luego abre `http://localhost:8080` y configura tu API key.

**¡Éxito administrando tu MetaTxForwarder! 🚀**
