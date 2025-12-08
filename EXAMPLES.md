# Ejemplos de Uso de la API

## JavaScript/Node.js

### Configuración Básica

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000';
const API_KEY = 'tu_api_key_aqui';

// Cliente configurado
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json'
  }
});
```

### Ejemplos de Peticiones

```javascript
// 1. Health Check
async function checkHealth() {
  try {
    const response = await apiClient.get('/health');
    console.log('Estado:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// 2. Obtener configuración del contrato
async function getConfig() {
  try {
    const response = await apiClient.get('/config');
    console.log('Configuración:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// 3. Habilitar un caller
async function enableCaller(callerAddress) {
  try {
    const response = await apiClient.post('/caller/set-allowed', {
      caller: callerAddress,
      allowed: true
    });
    console.log('Caller habilitado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// 4. Establecer límite de gas
async function setGasLimit(callerAddress, limit) {
  try {
    const response = await apiClient.post('/caller/set-gas-limit', {
      caller: callerAddress,
      limit: limit.toString()
    });
    console.log('Gas limit establecido:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// 5. Habilitar un deployer
async function enableDeployer(deployerAddress) {
  try {
    const response = await apiClient.post('/deployer/set-allowed', {
      deployer: deployerAddress,
      allowed: true
    });
    console.log('Deployer habilitado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// 6. Configurar bucket personalizado para deployer
async function setCustomBucket(deployerAddress) {
  try {
    const response = await apiClient.post('/deployer/set-bucket-config', {
      deployer: deployerAddress,
      limit: "20000000",
      durationSeconds: "1200",
      useCustom: true
    });
    console.log('Bucket configurado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// 7. Obtener información de un deployer
async function getDeployerInfo(deployerAddress) {
  try {
    const response = await apiClient.get(`/deployer/${deployerAddress}/info`);
    console.log('Info del deployer:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// 8. Listar todos los callers permitidos
async function listCallers() {
  try {
    const response = await apiClient.get('/callers');
    console.log('Callers permitidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// 9. Habilitar múltiples deployers
async function enableMultipleDeployers(addresses) {
  try {
    const response = await apiClient.post('/deployers/set-allowed-batch', {
      deployers: addresses,
      allowed: addresses.map(() => true)
    });
    console.log('Deployers habilitados:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Ejemplo de uso
(async () => {
  await checkHealth();
  await getConfig();
  
  const callerAddr = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';
  await enableCaller(callerAddr);
  await setGasLimit(callerAddr, 5000000);
  
  const deployerAddr = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
  await enableDeployer(deployerAddr);
  await setCustomBucket(deployerAddr);
  await getDeployerInfo(deployerAddr);
  
  await listCallers();
})();
```

## Python

### Configuración Básica

```python
import requests
from typing import Optional, Dict, Any

class MetaTxForwarderAPI:
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url
        self.api_key = api_key
        self.headers = {
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        }
    
    def _get(self, endpoint: str) -> Dict[Any, Any]:
        """Realiza una petición GET"""
        response = requests.get(
            f'{self.api_url}{endpoint}',
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def _post(self, endpoint: str, data: Dict[Any, Any]) -> Dict[Any, Any]:
        """Realiza una petición POST"""
        response = requests.post(
            f'{self.api_url}{endpoint}',
            headers=self.headers,
            json=data
        )
        response.raise_for_status()
        return response.json()
    
    def health_check(self) -> Dict[Any, Any]:
        """Verifica el estado de la API"""
        return self._get('/health')
    
    def get_config(self) -> Dict[Any, Any]:
        """Obtiene la configuración del contrato"""
        return self._get('/config')
    
    def set_caller_allowed(self, caller: str, allowed: bool) -> Dict[Any, Any]:
        """Habilita o deshabilita un caller"""
        return self._post('/caller/set-allowed', {
            'caller': caller,
            'allowed': allowed
        })
    
    def set_gas_limit(self, caller: str, limit: int) -> Dict[Any, Any]:
        """Establece el límite de gas para un caller"""
        return self._post('/caller/set-gas-limit', {
            'caller': caller,
            'limit': str(limit)
        })
    
    def get_caller_info(self, address: str) -> Dict[Any, Any]:
        """Obtiene información de un caller"""
        return self._get(f'/caller/{address}/allowed')
    
    def set_deployer_allowed(self, deployer: str, allowed: bool) -> Dict[Any, Any]:
        """Habilita o deshabilita un deployer"""
        return self._post('/deployer/set-allowed', {
            'deployer': deployer,
            'allowed': allowed
        })
    
    def set_deployer_bucket(
        self, 
        deployer: str, 
        limit: int, 
        duration: int, 
        use_custom: bool
    ) -> Dict[Any, Any]:
        """Configura el bucket de gas para un deployer"""
        return self._post('/deployer/set-bucket-config', {
            'deployer': deployer,
            'limit': str(limit),
            'durationSeconds': str(duration),
            'useCustom': use_custom
        })
    
    def get_deployer_info(self, address: str) -> Dict[Any, Any]:
        """Obtiene información detallada de un deployer"""
        return self._get(f'/deployer/{address}/info')
    
    def list_callers(self) -> Dict[Any, Any]:
        """Lista todos los callers permitidos"""
        return self._get('/callers')
    
    def list_deployers(self) -> Dict[Any, Any]:
        """Lista todos los deployers permitidos"""
        return self._get('/deployers')
    
    def set_multiple_deployers(
        self, 
        deployers: list, 
        allowed: list
    ) -> Dict[Any, Any]:
        """Habilita múltiples deployers en batch"""
        return self._post('/deployers/set-allowed-batch', {
            'deployers': deployers,
            'allowed': allowed
        })

# Ejemplo de uso
if __name__ == '__main__':
    # Inicializar cliente
    api = MetaTxForwarderAPI(
        api_url='http://localhost:3000',
        api_key='tu_api_key_aqui'
    )
    
    try:
        # Health check
        health = api.health_check()
        print('Estado:', health)
        
        # Obtener configuración
        config = api.get_config()
        print('Configuración:', config)
        
        # Habilitar un caller
        caller_addr = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1'
        result = api.set_caller_allowed(caller_addr, True)
        print('Caller habilitado:', result)
        
        # Establecer límite de gas
        result = api.set_gas_limit(caller_addr, 5000000)
        print('Gas limit establecido:', result)
        
        # Habilitar un deployer
        deployer_addr = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'
        result = api.set_deployer_allowed(deployer_addr, True)
        print('Deployer habilitado:', result)
        
        # Configurar bucket personalizado
        result = api.set_deployer_bucket(
            deployer=deployer_addr,
            limit=20000000,
            duration=1200,
            use_custom=True
        )
        print('Bucket configurado:', result)
        
        # Obtener info del deployer
        info = api.get_deployer_info(deployer_addr)
        print('Info del deployer:', info)
        
        # Listar callers
        callers = api.list_callers()
        print('Callers permitidos:', callers)
        
    except requests.exceptions.RequestException as e:
        print(f'Error: {e}')
```

## cURL

```bash
#!/bin/bash

API_URL="http://localhost:3000"
API_KEY="tu_api_key_aqui"

# 1. Health Check
echo "=== Health Check ==="
curl -X GET "${API_URL}/health?apikey=${API_KEY}"
echo -e "\n"

# 2. Obtener configuración
echo "=== Configuración ==="
curl -X GET "${API_URL}/config?apikey=${API_KEY}"
echo -e "\n"

# 3. Habilitar caller
echo "=== Habilitar Caller ==="
curl -X POST "${API_URL}/caller/set-allowed?apikey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "caller": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "allowed": true
  }'
echo -e "\n"

# 4. Establecer límite de gas
echo "=== Gas Limit ==="
curl -X POST "${API_URL}/caller/set-gas-limit?apikey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "caller": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "limit": "5000000"
  }'
echo -e "\n"

# 5. Obtener info de caller
echo "=== Info Caller ==="
curl -X GET "${API_URL}/caller/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1/allowed?apikey=${API_KEY}"
echo -e "\n"

# 6. Habilitar deployer
echo "=== Habilitar Deployer ==="
curl -X POST "${API_URL}/deployer/set-allowed?apikey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deployer": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    "allowed": true
  }'
echo -e "\n"

# 7. Configurar bucket personalizado
echo "=== Bucket Personalizado ==="
curl -X POST "${API_URL}/deployer/set-bucket-config?apikey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deployer": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    "limit": "20000000",
    "durationSeconds": "1200",
    "useCustom": true
  }'
echo -e "\n"

# 8. Obtener info del deployer
echo "=== Info Deployer ==="
curl -X GET "${API_URL}/deployer/0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199/info?apikey=${API_KEY}"
echo -e "\n"

# 9. Listar callers
echo "=== Listar Callers ==="
curl -X GET "${API_URL}/callers?apikey=${API_KEY}"
echo -e "\n"

# 10. Listar deployers
echo "=== Listar Deployers ==="
curl -X GET "${API_URL}/deployers?apikey=${API_KEY}"
echo -e "\n"

# 11. Habilitar múltiples deployers
echo "=== Habilitar Múltiples Deployers ==="
curl -X POST "${API_URL}/deployers/set-allowed-batch?apikey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deployers": [
      "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
      "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
    ],
    "allowed": [true, true]
  }'
echo -e "\n"
```

## Postman Collection

```json
{
  "info": {
    "name": "MetaTxForwarder API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "apiKey",
      "value": "tu_api_key_aqui"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "x-api-key",
            "value": "{{apiKey}}"
          }
        ],
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "Get Config",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "x-api-key",
            "value": "{{apiKey}}"
          }
        ],
        "url": "{{baseUrl}}/config"
      }
    },
    {
      "name": "Set Caller Allowed",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "x-api-key",
            "value": "{{apiKey}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"caller\": \"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1\",\n  \"allowed\": true\n}"
        },
        "url": "{{baseUrl}}/caller/set-allowed"
      }
    }
  ]
}
```

Guarda esto en un archivo `.json` e impórtalo en Postman.
