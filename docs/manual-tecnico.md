# MANUAL TÉCNICO - SkillBay

## 1. INFORMACIÓN GENERAL DEL PROYECTO

### 1.1 Descripción
**SkillBay** es una plataforma digital integral de servicios freelance diseñada específicamente para el mercado colombiano. Conecta de manera segura y eficiente a ofertantes y solicitantes de servicios diversos en Colombia.

### 1.2 Tipo de Producto
- **SaaS B2C/C2C** (Mercado de servicios)
- **Mercado objetivo:** Colombia, usuarios mayores de 18 años

### 1.3 Tecnologías

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Backend** | Laravel | 12.x |
| **Backend** | PHP | 8.2+ |
| **Frontend** | React | 19.x |
| **Frontend** | Vite | 7.x |
| **Frontend** | Tailwind CSS | 4.x |
| **Base de datos** | MySQL | 8.0+ |
| **Autenticación** | Laravel Sanctum | 4.x |
| **Pagos** | PagoSimulado | Integrado |
| **Icons** | Lucide React | 0.552+ |
| **UI Components** | Radix UI | - |
| **Alertas** | SweetAlert2 | 11.x |

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Visión General
SkillBay sigue una arquitectura cliente-servidor con una API RESTful en el backend y una aplicación SPA (Single Page Application) en el frontend.

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                      (React + Vite)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Pages   │ │Components│ │Dashboard │ │  Hooks   │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
└───────┼────────────┼────────────┼────────────┼────────────┘
        │            │            │            │
        └────────────┴─────┬──────┴────────────┘
                           │ HTTP/API
        ┌──────────────────┴──────────────────┐
        │              BACKEND                 │
        │            (Laravel 12)              │
        │  ┌────────────────────────────────┐ │
        │  │       API Routes               │ │
        │  │   (api.php)                    │ │
        │  └─────────────┬────────────────┘ │
        │                │                    │
        │  ┌─────────────▼────────────────┐ │
        │  │     Controllers                │ │
        │  │  (API/Controllers)            │ │
        │  └─────────────┬────────────────┘ │
        │                │                    │
        │  ┌─────────────▼────────────────┐ │
        │  │      Services                  │ │
        │  │  (Business Logic)             │ │
        │  └─────────────┬────────────────┘ │
        │                │                    │
        │  ┌─────────────▼────────────────┐ │
        │  │       Models                  │ │
        │  │   (Eloquent ORM)             │ │
        │  └─────────────┬────────────────┘ │
        │                │                    │
        │  ┌─────────────▼────────────────┐ │
        │  │     Database                  │ │
        │  │   (MySQL)                    │ │
        │  └─────────────────────────────┘ │
        └─────────────────────────────────────┘
```

### 2.2 Flujo de Datos
1. Usuario interactúa con el frontend (React)
2. Frontend envía request HTTP al backend (Laravel)
3. Middleware verifica autenticación (si aplica)
4. Controller recibe la petición
5. Service procesa la lógica de negocio
6. Model interactúa con la base de datos
7. Response vuelve al frontend
8. Frontend actualiza la interfaz

---

## 3. ESTRUCTURA DE DIRECTORIOS

### 3.1 Proyecto Principal
```
SkillBay/
├── skillbay-backend/          # Laravel 12 API
├── skillbay-frontend/         # React + Vite SPA
├── docs/                     # Documentación
├── .agents/                  # Configuración de agentes
├── AGENTS.md                 # Guías para agentes
├── README.md                 # Documentación general
└── PRD.md                    # Requisitos del producto
```

### 3.2 Backend (skillbay-backend/)
```
skillbay-backend/
├── app/
│   ├── Console/              # Comandos Artisan
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/         # Controladores API
│   ├── Mail/                # Clases de email
│   ├── Models/              # Modelos Eloquent
│   ├── Providers/           # Proveedores de servicios
│   └── Services/            # Lógica de negocio
├── bootstrap/               # Archivos de bootstrap
├── config/                  # Archivos de configuración
├── database/
│   ├── migrations/          # Migraciones de BD
│   ├── factories/          # Factorías
│   └── seeders/            # Semillas de BD
├── documentation/           # Diagramas UML
├── public/                  # Archivos públicos
├── resources/               # Recursos (views, assets)
├── routes/                  # Definición de rutas
│   ├── api.php             # Rutas API
│   └── web.php             # Rutas web
├── storage/                 # Archivos storage
├── tests/                   # Pruebas PHPUnit
├── vendor/                  # Dependencias Composer
├── artisan                  # CLI de Laravel
├── composer.json            # Dependencias PHP
├── package.json             # Dependencias NPM
├── phpunit.xml              # Configuración PHPUnit
└── vite.config.js           # Configuración Vite
```

### 3.3 Frontend (skillbay-frontend/)
```
skillbay-frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes UI base
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Label.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Dialog.jsx
│   │   │   └── utils.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── AdminDashboardLayout.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── NotificationCenter.jsx
│   │   ├── Loader.jsx
│   │   └── figma/
│   │       └── ImageWithFallback.jsx
│   ├── pages/               # Páginas públicas
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Services.jsx
│   │   ├── Contact.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── PaymentSuccess.jsx
│   │   ├── PaymentFailure.jsx
│   │   ├── PaymentPending.jsx
│   │   └── TermsAndConditions.jsx
│   ├── dashboard-users/     # Dashboard de usuarios
│   │   ├── ExploreOpportunities.jsx
│   │   ├── ExploreServices.jsx
│   │   ├── UserProfile.jsx
│   │   ├── UserPublicProfile.jsx
│   │   ├── UserServices.jsx
│   │   ├── UserPayments.jsx
│   │   ├── UserMessages.jsx
│   │   ├── MyApplications/
│   │   ├── Notifications/
│   │   ├── PlanesUser/
│   │   └── MyServices/
│   ├── dashboard-admin/      # Dashboard de admin
│   │   ├── AdminOverview.jsx
│   │   ├── UserManagement.jsx
│   │   ├── PlanManagement.jsx
│   │   ├── ApplicationManagement.jsx
│   │   ├── CategoryManagement.jsx
│   │   └── ReportManagement.jsx
│   ├── hooks/               # Custom hooks
│   │   └── useNotifications.js
│   ├── utils/               # Utilidades
│   │   └── image.js
│   ├── config/              # Configuración
│   │   └── api.js
│   ├── assets/              # Imágenes, iconos
│   ├── App.jsx              # Componente principal
│   ├── App.css              # Estilos globales
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos Tailwind
├── public/                  # Archivos públicos
├── node_modules/            # Dependencias NPM
├── package.json             # Dependencias
├── vite.config.js           # Config Vite
├── eslint.config.js         # Config ESLint
├── .prettierrc.json         # Config Prettier
├── .env.local               # Variables entorno
└── index.html               # HTML entry
```

---

## 4. MODELO DE DATOS

### 4.1 Entidades Principales

#### Usuario
- **Primary Key:** `id_CorreoUsuario` (email)
- **Roles:** `cliente`, `ofertante`, `admin`
- **Campos:** nombre, apellido, telefono, ciudad, departamento, fechaNacimiento, genero, rol, imagen_perfil, bloqueado, id_Plan (FK)
- **Relaciones:**
  - belongsTo Plan
  - hasMany Servicio
  - hasMany Postulacion
  - hasMany PagoPlan
  - hasMany PagoServicio (como pagador y receptor)
  - hasMany Notificacion
  - hasMany Resena
  - hasMany Mensaje
  - hasMany Reporte

#### Servicio
- **Tipos:** `servicio` (ofrecido por ofertante) o `oportunidad` (buscada por cliente)
- **Estados:** activo, en_proceso, completado, cancelado
- **Campos:** titulo, descripcion, precio, tiempo_entrega, id_Categoria (FK), id_CorreoUsuario (FK), tipo, ubicacion, urgencia
- **Relaciones:**
  - belongsTo Usuario
  - belongsTo Categoria
  - hasMany Postulacion
  - hasMany PagoServicio
  - hasMany Resena

#### Categoria
- **Primary Key:** `id_Categoria` (string)
- **Campos:** nombre, descripcion, grupo, imagen
- **Relaciones:**
  - hasMany Servicio

#### Postulacion
- **Tipos:** `postulant` (aplica a oportunidad) o `solicitante` (solicita servicio)
- **Estados:** pendiente, aceptada, rechazada, cancelada, en_progreso, completada, pagada
- **Campos:** id_Servicio (FK), id_CorreoUsuario (FK), mensaje, presupuesto, tiempo_estimado, estado, tipo_postulacion
- **Relaciones:**
  - belongsTo Servicio
  - belongsTo Usuario
  - hasMany PagoServicio
  - hasMany Resena
  - hasMany Mensaje

#### Plan
- **Campos:** id_Plan, nombre, precio, limite_servicios, descripcion
- **Tipos:** Free, Plus, Ultra
- **Relaciones:**
  - hasMany Usuario
  - hasMany PagoPlan

#### PagoPlan
- **Estados:** Pendiente, Completado, Rechazado
- **Campos:** id_CorreoUsuario (FK), id_Plan (FK), monto, estado, metodoPago, referenciaPago
- **Relaciones:**
  - belongsTo Usuario
  - belongsTo Plan

#### PagoServicio
- **Campos:** id_Postulacion (FK), id_Pagador (FK), id_Receptor (FK), monto, estado, metodoPago
- **Relaciones:**
  - belongsTo Postulacion
  - belongsTo Usuario (como pagador)
  - belongsTo Usuario (como receptor)

#### Resena
- **Direcciones:** `cliente_a_ofertante`, `ofertante_a_cliente`
- **Campos:** id_Postulacion (FK), id_CorreoUsuario (FK), calificacion, comentario, direccion
- **Relaciones:**
  - belongsTo Postulacion
  - belongsTo Usuario
  - belongsTo Servicio

#### Notificacion
- **Tipos:** sistema, postulacion, reporte, servicio, pago, plan, cuenta
- **Estados:** leido, no_leido
- **Campos:** id_CorreoUsuario (FK), tipo, titulo, mensaje, leido
- **Relaciones:**
  - belongsTo Usuario

#### Mensaje
- **Caducidad:** 15 días después de trabajo completado
- **Campos:** id_Postulacion (FK), emisor (FK), contenido, leido
- **Relaciones:**
  - belongsTo Postulacion
  - belongsTo Usuario

#### Reporte
- **Estados:** pendiente, en_revision, resuelto, descartado
- **Campos:** id_Reportador (FK), id_Reportado (FK), tipo, descripcion, estado
- **Relaciones:**
  - belongsTo Usuario (como reportador)
  - belongsTo Usuario (como reportado)

### 4.2 Diagrama de Relaciones
```
Usuario (1) ─────< Plan (many)
Usuario (1) ─────< Servicio (many)
Usuario (1) ─────< Postulacion (many)
Usuario (1) ─────< PagoPlan (many)
Usuario (1) ─────< PagoServicio (many as pagador)
Usuario (1) ─────< PagoServicio (many as receptor)
Usuario (1) ─────< Notificacion (many)
Usuario (1) ─────< Resena (many)
Usuario (1) ─────< Mensaje (many as emisor)
Usuario (1) ─────< Reporte (many as reportador)
Usuario (1) ─────< Reporte (many as reportado)

Categoria (1) ─────< Servicio (many)
Servicio (1) ─────< Postulacion (many)
Servicio (1) ─────< PagoServicio (many)
Servicio (1) ─────< Resena (many)
Postulacion (1) ─────< PagoServicio (many)
Postulacion (1) ─────< Resena (many)
Postulacion (1) ─────< Mensaje (many)
Plan (1) ─────< PagoPlan (many)
```

---

## 5. API REST

### 5.1 Rutas Públicas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/register` | Registro de usuario |
| POST | `/api/login` | Inicio de sesión |
| POST | `/api/password/forgot` | Solicitar recuperación de contraseña |
| POST | `/api/password/reset` | Restablecer contraseña |
| GET | `/api/usuarios` | Listar usuarios (público) |
| GET | `/api/planes` | Listar planes |
| GET | `/api/planes/{id}` | Obtener plan específico |
| GET | `/api/servicios/public` | Explorar servicios públicos |
| GET | `/api/categorias/publicas` | Listar categorías públicas |
| GET | `/api/login` | Verificar autenticación |

### 5.2 Rutas Autenticadas (auth:sanctum)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/user` | Obtener usuario actual |
| PUT | `/api/user` | Actualizar perfil |
| POST | `/api/user/imagen-perfil` | Subir imagen de perfil |
| GET | `/api/usuarios/{id}/perfil` | Obtener perfil público |
| GET | `/api/servicios/explore` | Explorar servicios |

#### Servicios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/servicios` | Listar servicios del usuario |
| POST | `/api/servicios` | Crear servicio |
| GET | `/api/servicios/{id}` | Ver servicio |
| PUT | `/api/servicios/{id}` | Actualizar servicio |
| DELETE | `/api/servicios/{id}` | Eliminar servicio |

#### Postulaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/postulaciones` | Listar postulaciones |
| POST | `/api/postulaciones` | Crear postulación |
| PATCH | `/api/postulaciones/{id}` | Actualizar postulación |
| DELETE | `/api/postulaciones/{id}` | Cancelar postulación |
| GET | `/api/servicios/solicitudes` | Solicitudes recibidas |
| PATCH | `/api/servicios/solicitudes/{id}/estado` | Actualizar estado |
| PATCH | `/api/postulaciones/{id}/completar` | Marcar como completado |
| POST | `/api/postulaciones/{id}/cobrar` | Reclamar pago |
| GET | `/api/postulaciones/{id}/listo-pago` | Verificar listo para pago |

#### Pagos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/pagos/plan` | Pagar plan |
| POST | `/api/pagos/servicio` | Pagar servicio |
| GET | `/api/pagos/historial` | Historial de pagos |
| GET | `/api/pagos/metodos` | Listar métodos de pago |
| POST | `/api/pagos/plan/simulado` | Iniciar pago de plan (simulado) |
| POST | `/api/pagos/servicio/simulado` | Iniciar pago de servicio (simulado) |
| POST | `/api/pagos/procesar` | Procesar pago simulado |
| POST | `/api/pagos/aprobar-auto` | Aprobar pago automáticamente |
| GET | `/api/pagos/estado` | Consultar estado de pago |
| POST | `/api/pagos/comprobante` | Subir comprobante |

#### Notificaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notificaciones` | Listar notificaciones |
| GET | `/api/notificaciones/resumen` | Resumen de notificaciones |
| PATCH | `/api/notificaciones/{id}/leer` | Marcar como leído |
| PATCH | `/api/notificaciones/marcar-todas-leidas` | Marcar todas como leídas |
| DELETE | `/api/notificaciones/{id}` | Eliminar notificación |
| DELETE | `/api/notificaciones` | Eliminar todas |

#### Reseñas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/resenas` | Crear reseña |
| GET | `/api/resenas/servicio/{id}` | Reseñas de servicio |
| GET | `/api/resenas/usuario/{id}` | Reseñas de usuario |
| GET | `/api/resenas/usuario/{id}/hechas` | Reseñas realizadas |
| GET | `/api/resenas/usuario/{id}/promedio` | Calificación promedio |

#### Mensajes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/mensajes/conversaciones` | Listar conversaciones |
| GET | `/api/postulaciones/{id}/mensajes` | Mensajes de postulación |
| POST | `/api/postulaciones/{id}/mensajes` | Enviar mensaje |
| DELETE | `/api/mensajes/{id}` | Eliminar mensaje |

#### Reportes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/reportes` | Crear reporte |

### 5.3 Rutas de Administrador

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/resumen` | Resumen del dashboard |
| GET | `/api/admin/metricas` | Métricas mensuales |
| GET | `/api/admin/usuarios` | Listar usuarios |
| PATCH | `/api/admin/usuarios/{id}/bloqueo` | Bloquear usuario |
| GET/POST | `/api/admin/planes` | Listar/Crear planes |
| PUT/DELETE | `/api/admin/planes/{id}` | Actualizar/Eliminar plan |
| GET | `/api/admin/postulaciones` | Todas las postulaciones |
| PATCH | `/api/admin/postulaciones/{id}/estado` | Cambiar estado |
| GET | `/api/admin/reportes` | Todos los reportes |
| PATCH | `/api/admin/reportes/{id}/estado` | Actualizar estado |
| GET/POST | `/api/admin/categorias` | Listar/Crear categorías |
| PUT/DELETE | `/api/admin/categorias/{id}` | Actualizar/Eliminar |
| GET | `/api/admin/notificaciones` | Notificaciones admin |
| POST | `/api/admin/notificaciones/global` | Broadcast a todos |

---

## 6. COMPONENTES DEL FRONTEND

### 6.1 Páginas Públicas

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| Home | `Home.jsx` | Landing page con hero, features, CTA |
| About | `About.jsx` | Acerca de la plataforma |
| Services | `Services.jsx` | Listado público de servicios |
| Contact | `Contact.jsx` | Formulario de contacto |
| Login | `Login.jsx` | Autenticación de usuarios |
| Register | `Register.jsx` | Registro con validación |
| ForgotPassword | `ForgotPassword.jsx` | Recuperación de contraseña |
| PaymentSuccess | `PaymentSuccess.jsx` | Pago exitoso |
| PaymentFailure | `PaymentFailure.jsx` | Pago fallido |
| PaymentPending | `PaymentPending.jsx` | Pago pendiente |
| TermsAndConditions | `TermsAndConditions.jsx` | Términos legales |

### 6.2 Dashboard de Usuarios

| Sección | Archivo | Descripción |
|---------|---------|-------------|
| ExploreOpportunities | `ExploreOpportunities.jsx` | Explorar oportunidades de trabajo |
| ExploreServices | `ExploreServices.jsx` | Explorar servicios ofrecidos |
| UserProfile | `UserProfile.jsx` | Edición de perfil |
| UserPublicProfile | `UserPublicProfile.jsx` | Vista pública de perfil |
| UserServices | `UserServices.jsx` | Mis servicios publicados |
| UserPayments | `UserPayments.jsx` | Historial de pagos |
| UserMessages | `UserMessages.jsx` | Interfaz de mensajería |
| MyApplications | `MyApplications.jsx` | Mis postulaciones |
| NotificationsPage | `NotificationsPage.jsx` | Todas las notificaciones |
| PlanesUser | `PlanesUser.jsx` | Planes de suscripción |

#### Subdirectorio MyServices
- `CreateService.jsx` - Crear nuevo servicio
- `CreateOpportunity.jsx` - Crear nueva oportunidad
- `FormService.jsx` - Formulario de servicio
- `FormOpportunity.jsx` - Formulario de oportunidad
- `MyServices.jsx` - Listado de servicios
- `ReceivedRequests.jsx` - Solicitudes recibidas

#### Subdirectorio MyApplications
- `MyApplications.jsx` - Todas las postulaciones
- `SentApplications.jsx` - Postulaciones enviadas
- `ReceivedApplications.jsx` - Postulaciones recibidas

### 6.3 Dashboard de Administrador

| Sección | Archivo | Descripción |
|---------|---------|-------------|
| AdminOverview | `AdminOverview.jsx` | Dashboard con estadísticas |
| UserManagement | `UserManagement.jsx` | Listado y bloqueo de usuarios |
| PlanManagement | `PlanManagement.jsx` | CRUD de planes |
| ApplicationManagement | `ApplicationManagement.jsx` | Gestión de postulaciones |
| CategoryManagement | `CategoryManagement.jsx` | CRUD de categorías |
| ReportManagement | `ReportManagement.jsx` | Gestión de reportes |

### 6.4 Componentes UI

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| Button | `Button.jsx` | Botón reutilizable |
| Input | `Input.jsx` | Campo de formulario |
| Label | `Label.jsx` | Etiqueta de formulario |
| Textarea | `Textarea.jsx` | Área de texto multilínea |
| Select | `Select.jsx` | Dropdown de selección |
| Badge | `Badge.jsx` | Insignia de estado |
| Tabs | `Tabs.jsx` | Navegación por pestañas |
| Dialog | `Dialog.jsx` | Modal de diálogo |
| Loader | `Loader.jsx` | Spinner de carga |
| ImageWithFallback | `ImageWithFallback.jsx` | Imagen con fallback |

### 6.5 Hooks Personalizados

| Hook | Archivo | Descripción |
|------|---------|-------------|
| useNotifications | `useNotifications.js` | Gestión de notificaciones: obtener, marcar leído, eliminar, conteos |

### 6.6 Utilidades

| Utilidad | Archivo | Descripción |
|----------|---------|-------------|
| resolveImageUrl | `image.js` | Resuelve rutas de imágenes a URLs completas usando la base de la API |

---

## 7. CONFIGURACIÓN

### 7.1 Variables de Entorno del Backend (.env)

```env
APP_NAME=SkillBay
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=SkillBay
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
QUEUE_CONNECTION=database

MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADO_PAGO_MODE=sandbox
```

### 7.2 Variables de Entorno del Frontend

```env
VITE_API_URL=http://localhost:8000/api
```

### 7.3 Configuración de Vite (Frontend)

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 8. INSTALACIÓN Y EJECUCIÓN

### 8.1 Requisitos del Sistema

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| PHP | 8.2 | 8.3+ |
| Node.js | 18.x | 20.x+ |
| MySQL | 8.0 | 8.0+ |
| Composer | 2.x | Latest |
| NPM | 9.x | Latest |

### 8.2 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `composer run dev` | Iniciar todos los servicios |
| `composer run test` | Ejecutar pruebas |
| `composer run lint` | Verificar código PHP |
| `composer run format` | Formatear código PHP |
| `npm run lint` | Verificar código React |
| `npm run build` | Construir para producción |

---

## 9. SEGURIDAD

### 9.1 Autenticación
- Laravel Sanctum para tokens API stateless
- Middleware de autenticación en rutas protegidas
- Tokens con expiración configurable

### 9.2 Autorización
- Middleware `es.admin` para rutas administrativas
- Verificación de roles en controladores

### 9.3 Validación
- Validación de requests en controladores
- Protección contra CSRF (Laravel built-in)
- Sanitización de entrada de datos

### 9.4 Pagos
- Pasarela de pago simulada con múltiples métodos (tarjeta, efectivo, Nequi, QR)
- Simulación de aprobación/rechazo basada en número de tarjeta
- Verificación de estado de pago antes de completar
- Subida de comprobantes para pagos con Nequi/Bancolombia

---

## 10. INTEGRACIONES

### 10.1 Pasarela de Pago Simulada

**Servicios:**
- `PagoSimuladoService` - Servicio principal de pago simulado
- `PagoSimuladoController` - Controlador de endpoints de pago

**Funcionalidades:**
- Inicio de pago de planes y servicios
- Procesamiento simulado con aprobación/rechazo
- Aprobación automática para pruebas
- Consulta de estado de pago
- Subida de comprobantes
- Múltiples métodos: tarjeta, efectivo, Nequi, QR Bancolombia

### 10.2 Librerías Externas

| Librería | Versión | Uso |
|----------|---------|-----|
| @radix-ui/react-dialog | 1.1.15 | Componentes Dialog |
| @radix-ui/react-select | 2.2.6 | Componentes Select |
| @radix-ui/react-tabs | 1.1.13 | Componentes Tabs |
| lucide-react | 0.552.0 | Iconos |
| sweetalert2 | 11.26.3 | Alertas |
| tailwind-merge | 3.3.1 | Utilidades CSS |
| class-variance-authority | 0.7.1 | Variantes de componentes |

---

## 11. PRUEBAS

### 11.1 Backend (PHPUnit)
```bash
composer run test
php artisan test
php artisan test --filter=TestClassName::testMethodName
php artisan test --group=feature
```

### 11.2 Frontend (ESLint)
```bash
npm run lint --prefix skillbay-frontend
```

---

## 12. LÍMITES Y RESTRICCIONES CONOCIDAS

- El sistema de mensajería no soporta adjuntos de archivos
- Las notificaciones en tiempo real requieren configuración adicional de WebSockets
- La pasarela de pago es simulada y no procesa pagos reales
- No hay sistema de facturación automática integrada
- La verificación de identidad de usuarios es manual

---

## 13. GLOSARIO

| Término | Definición |
|---------|------------|
| **Ofertante** | Usuario que ofrece servicios en la plataforma |
| **Cliente** | Usuario que busca y contrata servicios |
| **Servicio** | Publicación de un servicio ofrecido por un ofertante |
| **Oportunidad** | Publicación de una necesidad buscada por un cliente |
| **Postulación** | Solicitud de un ofertante para realizar un servicio |
| **Plan** | Suscripción mensual con límites de servicios |
| **PagoSimulado** | Pasarela de pago simulada integrada |
| **Sanctum** | Sistema de autenticación API de Laravel |

---

*Manual Técnico generado para SkillBay v1.0*
*Fecha: Marzo 2026*
