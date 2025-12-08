# 🎨 MetaTxForwarder Web Interface

Interfaz web moderna y completa para administrar tu contrato MetaTxForwarder.

## 🚀 Características

- ✅ **Dashboard en Tiempo Real** - Monitorea el estado del contrato
- 📞 **Gestión de Callers** - Permite/bloquea relayers y configura límites de gas
- 🚀 **Gestión de Deployers** - Administra quién puede deployar contratos
- ⚙️ **Configuración Global** - Ajusta parámetros del contrato
- 📊 **Monitor en Vivo** - Actualización automática del estado
- 🎨 **Diseño Moderno** - Interfaz oscura y responsive
- 💾 **Configuración Persistente** - Guarda API URL y API Key en localStorage

## 📦 Archivos

```
interface/
├── index.html    # Interfaz principal
├── app.js        # Lógica de la aplicación
└── README.md     # Este archivo
```

## 🏃 Cómo Usar

### Opción 1: Servir con Python (Recomendado)

```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Luego abre: `http://localhost:8080`

### Opción 2: Servir con Node.js

```bash
# Instalar servidor simple
npm install -g http-server

# Ejecutar
http-server -p 8080
```

### Opción 3: Abrir directamente

Simplemente abre `index.html` en tu navegador (puede tener limitaciones de CORS).

## ⚙️ Configuración Inicial

1. **Abre la interfaz web** en tu navegador
2. **Click en el botón de configuración** (⚙️) en la esquina inferior derecha
3. **Configura:**
   - **API URL**: `http://localhost:3000` (o tu URL de API)
   - **API Key**: Tu API key configurada en el servidor
4. **Guarda la configuración**

## 📱 Secciones de la Interfaz

### 🏠 Header - Dashboard

Muestra información general en tiempo real:
- **Status**: Estado de la API
- **Contract**: Dirección del contrato
- **Owner**: Dirección del owner
- **Network**: Red blockchain
- **Block Number**: Bloque actual

### 📞 Tab: Callers

**Administrar Callers**
- Permite o bloquea direcciones de callers (relayers)
- Configura límites de gas por bloque

**Ver Callers Permitidos**
- Lista de todos los callers activos
- Información de gas usado/límite
- Eliminar callers

### 🚀 Tab: Deployers

**Administrar Deployers**
- Permite o bloquea direcciones que pueden deployar

**Configurar Bucket de Gas**
- Límite de gas personalizado por deployer
- Duración del bucket en segundos
- Toggle para usar configuración custom

**Ver Deployers Permitidos**
- Lista de deployers activos
- Estado y uso de gas
- Límites configurados

### ⚙️ Tab: Configuración

**Configuración General**
- Ver parámetros actuales del contrato
- ERC-2771 status
- Gas overhead
- Bucket default

**ERC-2771 (Append Sender)**
- Habilitar/deshabilitar compatibilidad ERC-2771
- Controla si se añade el sender al calldata

**Gas Accounting Overhead**
- Ajustar el overhead de contabilidad de gas

**Bucket de Deploy por Defecto**
- Configurar límites globales de deploy

### 📊 Tab: Monitor

**Monitor en Tiempo Real**
- Actualización automática cada 5 segundos
- Bloque actual
- Callers activos
- Deployers activos
- Estado ERC-2771

## 🎨 Diseño

### Tema

- **Tema Oscuro** moderno y profesional
- **Colores personalizables** vía CSS variables
- **Responsive** - funciona en desktop, tablet y móvil

### Paleta de Colores

```css
--primary: #6366f1      /* Índigo */
--success: #10b981      /* Verde */
--danger: #ef4444       /* Rojo */
--warning: #f59e0b      /* Ámbar */
--bg: #0f172a           /* Fondo oscuro */
```

## 🔐 Seguridad

- ✅ API Key almacenada en `localStorage` (solo en tu navegador)
- ✅ Todas las peticiones usan autenticación
- ✅ Validación de direcciones Ethereum
- ⚠️ **Importante**: No compartas tu API Key

## 💡 Ejemplos de Uso

### Agregar un Caller

1. Ve a la tab **Callers**
2. Ingresa la dirección del caller
3. Click en **✅ Permitir Caller**
4. Espera la confirmación de la transacción

### Configurar Gas Limit

1. En la tab **Callers**
2. Sección "Configurar Límite de Gas"
3. Ingresa dirección y límite (ej: 5000000)
4. Click en **💨 Establecer Límite**

### Habilitar un Deployer

1. Ve a la tab **Deployers**
2. Ingresa la dirección
3. Click en **✅ Permitir Deployer**

### Configurar Bucket Personalizado

1. En la tab **Deployers**
2. Sección "Configurar Bucket de Gas Personalizado"
3. Ingresa:
   - Dirección del deployer
   - Límite de gas (ej: 20000000)
   - Duración en segundos (ej: 1200)
   - Marca "Usar configuración personalizada"
4. Click en **🪣 Configurar Bucket**

## 🛠️ Personalización

### Cambiar Colores

Edita las CSS variables en `index.html`:

```css
:root {
    --primary: #tu-color;
    --success: #tu-color;
    /* etc */
}
```

### Añadir Funcionalidades

1. Agrega el HTML en `index.html`
2. Agrega la función en `app.js`
3. Usa `apiRequest()` para llamar a la API

## 🐛 Troubleshooting

### Error: "API key inválida"
- Verifica que la API key sea correcta
- Abre el modal de configuración (⚙️) y verifica

### Error: "Error al verificar estado"
- Verifica que el servidor API esté corriendo
- Verifica que la URL sea correcta
- Revisa CORS si estás en un dominio diferente

### No carga los datos
- Abre la consola del navegador (F12)
- Verifica errores de red
- Verifica que la API esté respondiendo

### Problemas de CORS
Si tienes errores de CORS, tienes estas opciones:

1. **Usar el mismo origen** (recomendado)
2. **Configurar CORS en el servidor** (ya está configurado)
3. **Usar un proxy** para desarrollo

## 📊 Estructura de Datos

### Health Response
```json
{
  "status": "ok",
  "contract": "0x...",
  "owner": "0x...",
  "network": "ethereum-mainnet",
  "blockNumber": 18500000
}
```

### Config Response
```json
{
  "owner": "0x...",
  "erc2771AppendSender": true,
  "gasAccountingOverhead": "15000",
  "defaultDeployGasBucketLimit": "10000000",
  "defaultDeployGasBucketDuration": "600"
}
```

## 🚀 Desplegar en Producción

### Netlify

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Deploy
netlify deploy --prod --dir .
```

### Vercel

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod
```

### GitHub Pages

1. Sube los archivos a un repositorio
2. Ve a Settings → Pages
3. Selecciona la rama y carpeta
4. Guarda

### Servidor Propio

```bash
# Nginx
sudo cp index.html app.js /var/www/html/metatx-admin/

# Apache
sudo cp index.html app.js /var/www/html/metatx-admin/
```

## 🔒 Mejores Prácticas

1. **Nunca expongas tu API Key** en código público
2. **Usa HTTPS** en producción
3. **Implementa autenticación adicional** para usuarios múltiples
4. **Realiza backups** de tu configuración
5. **Monitorea** el uso de gas y límites

## 📝 Licencia

MIT

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -m 'Añade mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📧 Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub.

---

**Hecho con ❤️ para MetaTxForwarder**
