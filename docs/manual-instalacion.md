# MANUAL DE INSTALACIÓN - SkillBay

## 1. REQUISITOS DEL SISTEMA

### 1.1 Requisitos de Software

| Componente | Versión Mínima | Versión Recomendada |
|------------|----------------|---------------------|
| **PHP** | 8.2 | 8.3+ |
| **Node.js** | 18.x | 20.x+ |
| **MySQL** | 8.0 | 8.0+ |
| **Composer** | 2.x | Latest |
| **NPM** | 9.x | Latest |

### 1.2 Extensiones PHP Requeridas

- OpenSSL
- PDO
- Mbstring
- Tokenizer
- XML
- Ctype
- JSON
- BCMath

### 1.3 Sistemas Operativos Compatibles

- Windows 10/11 (con WAMP, XAMPP o similar)
- macOS (con Homebrew, MAMP)
- Linux (Ubuntu, Debian, CentOS)

### 1.4 Requisitos de Hardware

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| **Procesador** | Dual-core 2.0 GHz | Quad-core 3.0 GHz+ |
| **RAM** | 4 GB | 8 GB+ |
| **Espacio en disco** | 10 GB | 20 GB+ SSD |
| **Conexión a internet** | 10 Mbps | 50 Mbps+ |

---

## 2. ESTRUCTURA DEL PROYECTO

```
SkillBay/
├── skillbay-backend/      # Aplicación Laravel (API)
├── skillbay-frontend/     # Aplicación React (Frontend)
└── docs/                 # Documentación
```

---

## 3. INSTALACIÓN DEL BACKEND (LARAVEL)

### 3.1 Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/SkillBay.git
cd SkillBay
```

### 3.2 Instalar Dependencias PHP

```bash
cd skillbay-backend
composer install
```

### 3.3 Configurar Archivo de Entorno

```bash
# Copiar el archivo de ejemplo
copy .env.example .env
# En Linux/Mac: cp .env.example .env
```

### 3.4 Generar Clave de Aplicación

```bash
php artisan key:generate
```

### 3.5 Configurar Base de Datos

Editar el archivo `.env` con las credenciales de MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=SkillBay
DB_USERNAME=root
DB_PASSWORD=tu_contraseña
```

**Nota:** Crear la base de datos antes de ejecutar las migraciones:

```sql
CREATE DATABASE SkillBay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3.6 Ejecutar Migraciones

```bash
php artisan migrate
```

### 3.7 Poblar Base de Datos (Opcional)

```bash
php artisan db:seed
```

### 3.8 Configurar MercadoPago (Opcional)

El sistema incluye un simulador de pagos para desarrollo. Para usar pagos reales:

```env
# Modo producción
MERCADO_PAGO_ACCESS_TOKEN=tu_token_de_produccion
MERCADO_PAGO_MODE=production

# Modo sandbox (pruebas)
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADO_PAGO_MODE=sandbox
```

### 3.9 Crear Enlace Simbólico de Storage

```bash
php artisan storage:link
```

---

## 4. INSTALACIÓN DEL FRONTEND (REACT)

### 4.1 Instalar Dependencias NPM

```bash
cd skillbay-frontend
npm install
```

### 4.2 Configurar Variables de Entorno

El archivo `.env.local` debe contener:

```env
VITE_API_URL=http://localhost:8000/api
```

Para producción:

```env
VITE_API_URL=https://tu-dominio.com/api
```

---

## 5. EJECUCIÓN DEL PROYECTO

### 5.1 Opción 1: Ejecución Individual

**Terminal 1 - Backend:**

```bash
cd skillbay-backend
php artisan serve
# Servidor disponible en http://localhost:8000
```

**Terminal 2 - Frontend:**

```bash
cd skillbay-frontend
npm run dev
# Aplicación disponible en http://localhost:5173
```

### 5.2 Opción 2: Ejecución Automática (Recomendada)

Ejecuta todos los servicios simultáneamente:

```bash
cd skillbay-backend
composer run dev
```

Esto inicia:
- Servidor API (php artisan serve)
- Queue worker (php artisan queue:listen)
- Log viewer (php artisan pail)
- Vite dev server

### 5.3 Verificar Instalación

1. Acceder a `http://localhost:5173` en el navegador
2. La página de inicio debe cargar correctamente
3. Probar el registro de usuario
4. Probar el login

---

## 6. CONFIGURACIÓN ADICIONAL

### 6.1 Configuración de Sesión

```env
SESSION_DRIVER=database
SESSION_LIFETIME=120
```

### 6.2 Configuración de Colas

```env
QUEUE_CONNECTION=database
```

### 6.3 Configuración de Correo (Opcional)

Para habilitar recuperación de contraseñas:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=skillbay@app.com
MAIL_FROM_NAME="${APP_NAME}"
```

### 6.4 Configuración de CORS

El backend ya está configurado para permitir requests del frontend en `http://localhost:5173`. Para producción, editar `config/cors.php`:

```php
'allowed_origins' => ['https://tu-dominio.com'],
```

---

## 7. COMANDOS ÚTILES

### 7.1 Comandos Laravel

| Comando | Descripción |
|---------|-------------|
| `php artisan serve` | Iniciar servidor de desarrollo |
| `php artisan migrate` | Ejecutar migraciones |
| `php artisan migrate:rollback` | Revertir última migración |
| `php artisan migrate:fresh` | Recrear base de datos |
| `php artisan db:seed` | Poblar base de datos |
| `php artisan storage:link` | Crear enlace simbólico |
| `php artisan config:clear` | Limpiar configuración |
| `php artisan cache:clear` | Limpiar caché |
| `php artisan route:list` | Listar rutas |

### 7.2 Comandos NPM

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Construir para producción |
| `npm run preview` | Previsualizar build |
| `npm run lint` | Verificar código |

### 7.3 Comandos Composer's Scripts

| Comando | Descripción |
|---------|-------------|
| `composer run dev` | Iniciar todos los servicios |
| `composer run test` | Ejecutar pruebas |
| `composer run lint` | Verificar código PHP |
| `composer run format` | Formatear código PHP |

---

## 8. PRUEBAS

### 8.1 Ejecutar Pruebas del Backend

```bash
cd skillbay-backend
composer run test
# o
php artisan test
```

**Ejecutar prueba específica:**

```bash
php artisan test --filter=TestClassName::testMethodName
```

**Ejecutar grupo de pruebas:**

```bash
php artisan test --group=feature
```

### 8.2 Verificar Código Frontend

```bash
cd skillbay-frontend
npm run lint
```

---

## 9. CONSTRUCCIÓN PARA PRODUCCIÓN

### 9.1 Backend

```bash
cd skillbay-backend
composer install --optimize-autoloader --no-dev
```

### 9.2 Frontend

```bash
cd skillbay-frontend
npm run build
```

El build se generará en `skillbay-frontend/dist/`

### 9.3 Configuración de Producción (.env)

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=SkillBay
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña

SESSION_DRIVER=file
QUEUE_CONNECTION=redis

MERCADO_PAGO_ACCESS_TOKEN=tu_token_produccion
MERCADO_PAGO_MODE=production
```

---

## 10. SOLUCIÓN DE PROBLEMAS

### 10.1 Error: "Class not found"

```bash
composer dump-autoload
```

### 10.2 Error de Conexión a Base de Datos

Verificar que MySQL esté ejecutándose y las credenciales sean correctas en `.env`.

### 10.3 Error de Permisos (Linux/Mac)

```bash
chmod -R 775 storage bootstrap/cache
```

### 10.4 Error de CORS

Verificar que el origen esté configurado en `config/cors.php`.

### 10.5 Error de Node Modules

```bash
cd skillbay-frontend
rm -rf node_modules
npm install
```

---

## 11. NOTAS ADICIONALES

### 11.1 Modo Simulador de Pagos

El sistema incluye un simulador de MercadoPago para desarrollo. Los pagos no serán reales pero el flujo completo funciona.

### 11.2 Usuarios de Prueba

Después de ejecutar `php artisan db:seed`, se creará un usuario administrador:

- **Email:** admin@skillbay.com
- **Contraseña:** password

### 11.3 Documentación Adicional

- [README.md](../README.md) - Documentación general
- [PRD.md](../PRD.md) - Requisitos del producto
- [AGENTS.md](../AGENTS.md) - Guías para agentes IA
- [manual-tecnico.md](manual-tecnico.md) - Manual técnico

---

*Manual de Instalación generado para SkillBay v1.0*
*Fecha: Marzo 2026*
