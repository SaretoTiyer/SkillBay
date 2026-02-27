# Documentación de Diagramas UML - SkillBay

## Índice

1. [Introducción](#introducción)
2. [Diagrama de Clases](#diagrama-de-clases)
3. [Diagrama de Casos de Uso](#diagrama-de-casos-de-uso)
4. [Diagramas de Secuencia](#diagramas-de-secuencia)
5. [Diagrama de Componentes](#diagrama-de-componentes)
6. [Diagramas de Estado](#diagramas-de-estado)
7. [Cómo Visualizar los Diagramas](#cómo-visualizar-los-diagramas)

---

## Introducción

Este documento presenta los diagramas UML generados para el proyecto **SkillBay**, un marketplace de servicios profesionales desarrollado con Laravel (backend) y React (frontend).

### Objetivos del Análisis

- Visualizar la estructura del sistema
- Comprender las relaciones entre entidades
- Documentar los flujos principales de negocio
- Facilitar el mantenimiento y evolución del código

### Tecnologías Utilizadas

- **Backend**: Laravel 11 con Eloquent ORM
- **Frontend**: React con Vite
- **Base de Datos**: MySQL
- **Pagos**: MercadoPago API

---

## Diagrama de Clases

**Archivo**: [`01-class-diagram.puml`](diagrams/01-class-diagram.puml)

### Entidades Principales

| Entidad | Descripción |
|---------|-------------|
| **Usuario** | Representa los usuarios del sistema (clientes y contratistas). Extiende de `Authenticatable` de Laravel. |
| **Plan** | Define los planes de suscripción (Free, Plus, Ultra) con límites de servicios. |
| **Categoria** | Organiza los servicios en categorías (Diseño, Programación, etc.). |
| **Servicio** | Representa un servicio u oportunidad publicada por un cliente. |
| **Postulacion** | Gestión depostulaciones de contratistas a servicios. |
| **PagoPlan** | Registro de pagos de suscripción a planes. |
| **PagoServicio** | Registro de pagos por servicios completados. |
| **Resena** | Calificaciones y comentarios de servicios. |
| **Notificacion** | Sistema de notificaciones a usuarios. |
| **Reporte** | Gestión de reportes de usuarios o servicios. |
| **Mensaje** | Mensajería entre usuarios relacionada a postulaciones. |

### Relaciones Entre Entidades

```
Usuario "1" -- "*" Plan : tiene >
Usuario "*" -- "1" Plan : pertenece a >
Categoria "1" -- "*" Servicio : agrupa >
Usuario "1" -- "*" Servicio : ofrece >
Servicio "1" -- "*" Postulacion : recibe >
Usuario "1" -- "*" Postulacion : realiza >
Postulacion "1" -- "*" PagoServicio : genera >
PagoPlan "1" -- "1" Plan : corresponde >
Usuario "1" -- "*" Notificacion : recibe >
```

### Enumeraciones

- **RolUsuario**: CLIENTE, CONTRATISTA, ADMIN
- **EstadoServicio**: ACTIVO, INACTIVO, COMPLETADO, CANCELADO
- **EstadoPostulacion**: PENDIENTE, ACEPTADA, RECHAZADA, EN_PROGRESO, COMPLETADA, CANCELADA
- **EstadoPago**: PENDIENTE, APROBADO, RECHAZADO, CANCELADO
- **TipoServicio**: SERVICIO, OPORTUNIDAD

---

## Diagrama de Casos de Uso

**Archivo**: [`02-use-case-diagram.puml`](diagrams/02-use-case-diagram.puml)

### Actores

| Actor | Descripción |
|-------|-------------|
| **Usuario (Cliente)** | Busca y contrata servicios |
| **Usuario (Contratista)** | Ofrece servicios y acepta trabajos |
| **Administrador** | Gestiona categorías, planes, usuarios y reportes |
| **Sistema de Pago** | MercadoPago para procesamiento de pagos |

### Módulos de Casos de Uso

#### 1. Autenticación
- UC01: Registrarse
- UC02: Iniciar Sesión
- UC03: Cerrar Sesión
- UC04: Recuperar Contraseña
- UC05: Actualizar Perfil

#### 2. Gestión de Servicios
- UC06: Crear Servicio
- UC07: Editar Servicio
- UC08: Eliminar Servicio
- UC09: Explorar Servicios
- UC10: Buscar por Categoría

#### 3. Postulaciones
- UC11: Postular a Servicio
- UC12: Ver Mis Postulaciones
- UC13: Ver Solicitudes Recibidas
- UC14: Aceptar Postulación
- UC15: Rechazar Postulación
- UC16: Iniciar Trabajo
- UC17: Completar Trabajo
- UC18: Cancelar Postulación

#### 4. Pagos
- UC19: Pagar Plan de Suscripción
- UC20: Pagar Servicio Completado
- UC21: Ver Historial de Pagos
- UC22: Consultar Estado de Pago

#### 5. Suscripciones
- UC23: Ver Planes Disponibles
- UC24: Seleccionar Plan
- UC25: Actualizar Plan

#### 6. Comunicación
- UC26: Enviar Mensaje
- UC27: Ver Conversaciones
- UC28: Recibir Notificaciones
- UC29: Marcar Notificación Leída
- UC30: Escribir Reseña
- UC31: Ver Reseñas de Servicio

#### 7. Moderación
- UC32: Reportar Usuario
- UC33: Reportar Servicio
- UC34: Bloquear/Desbloquear Usuario

#### 8. Administración
- UC35: Gestionar Categorías
- UC36: Gestionar Planes
- UC37: Ver Dashboard Admin
- UC38: Ver Métricas del Sistema
- UC39: Gestionar Reportes
- UC40: Gestionar Usuarios

---

## Diagramas de Secuencia

### 1. Flujo de Autenticación

**Archivo**: [`03-sequence-auth.puml`](diagrams/03-sequence-auth.puml)

#### Descripción
Este diagrama muestra el flujo completo de registro, login y recuperación de contraseña.

#### Flujo Principal: Registro

1. Usuario accede al formulario de registro
2. Frontend envía datos a `/api/register`
3. Controller valida y crea usuario
4. Laravel Sanctum genera token de acceso
5. Retorna usuario y token al frontend

#### Flujo Principal: Login

1. Usuario ingresa credenciales
2. Frontend envía a `/api/login`
3. Controller verifica email y password
4. Genera token si es válido
5. Retorna usuario y token

#### Flujo Principal: Recuperación

1. Usuario solicita recuperación
2. Sistema genera código y lo guarda
3. Usuario recibe código por email
4. Ingresa código y nueva contraseña
5. Sistema actualiza password

---

### 2. Flujo de Servicios y Postulaciones

**Archivo**: [`04-sequence-service-postulation.puml`](diagrams/04-sequence-service-postulation.puml)

#### Descripción
Muestra el ciclo completo desde la creación de un servicio hasta la completación del trabajo.

#### Etapa 1: Crear Servicio

1. Cliente accede a crear servicio
2. Frontend carga categorías disponibles
3. Cliente completa formulario
4. Controller crea servicio en BD
5. Sistema notifica al cliente

#### Etapa 2: Explorar y Postularse

1. Contratista explora servicios
2. Selecciona servicio de interés
3. Ve detalles del servicio
4. Envía postulación con propuesta
5. Sistema notifica al cliente

#### Etapa 3: Aceptar y Completar

1. Cliente ve solicitudes recibidas
2. Acepta una postulación
3. Sistema notifica al contratista
4. Cliente marca trabajo completado
5. Sistema notifica nuevamente

---

### 3. Flujo de Pagos con MercadoPago

**Archivo**: [`05-sequence-payment.puml`](diagrams/05-sequence-payment.puml)

#### Descripción
Documenta la integración con MercadoPago para pagos de planes y servicios.

#### Flujo: Suscripción a Plan

1. Usuario selecciona plan
2. Controller crea preferencia de pago
3. Frontend redirige a MercadoPago
4. Usuario completa pago
5. MercadoPago envía webhook
6. Sistema actualiza estado y plan
7. Usuario retorna a la aplicación

#### Flujo: Pago de Servicio

1. Cliente confirma pago (trabajo completado)
2. Sistema registra pago como pendiente
3. Cliente confirma recepción
4. Sistema marca como aprobado

---

## Diagrama de Componentes

**Archivo**: [`06-component-diagram.puml`](diagrams/06-component-diagram.puml)

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌─────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ App.jsx │  │ Navbar       │  │ Pages (Login, Services)│  │
│  └────┬────┘  └──────┬───────┘  └───────────┬────────────┘  │
│       │              │                      │               │
│       └──────────────┴──────────────────────┘               │
│                         │ API Client (axios)                │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    API Layer (Laravel)                      │
│       ┌─────────────────┴──────────────────┐                │
│       │          API Routes (api.php)       │               │
│       └─────────────────┬──────────────────┘                │
│                         │                                   │
│    ┌────────────────────┼────────────────────┐              │
│    │           Middleware (Auth, CORS)       │              │
│    └────────────────────┼────────────────────┘              │
│                         │                                   │
│    ┌────────────────────┼────────────────────┐              │ 
│    │              Controllers                │              │
│    │  ┌────────┐ ┌────────┐ ┌────────────┐   │              │
│    │  │Usuario │ │Servicio│ │MercadoPago │   │              │
│    │  └────────┘ └────────┘ └────────────┘   │              │
│    └────────────────────┬────────────────────┘              │
│                         │                                   │
│    ┌────────────────────┼────────────────────┐              │
│    │              Models (Eloquent)          │              │
│    │  ┌────────┐ ┌────────┐ ┌────────────┐   │              │
│    │  │Usuario │ │Servicio│ │PagoPlan    │   │              │
│    │  └────────┘ └────────┘ └────────────┘   │              │
│    └────────────────────┬────────────────────┘              │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│              Base de Datos (MySQL)                          │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────────┐     │
│   │usuarios│ │planes  │ │servicios│ │pago_plans       │     │
│   └────────┘ └────────┘ └────────┘ └──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principales

| Componente | Descripción |
|------------|-------------|
| **Frontend (React)** | Interfaz de usuario con componentes React y Axios |
| **API Routes** | Rutas Laravel que dirigen a controladores |
| **Middleware** | Verificación de autenticación y CORS |
| **Controllers** | Lógica de negocio para cada recurso |
| **Models** | Modelos Eloquent con relaciones |
| **Services** | Integración con MercadoPago |
| **Database** | MySQL con tablas normalizadas |

---

## Diagramas de Estado

**Archivo**: [`07-state-diagram.puml`](diagrams/07-state-diagram.puml)

### 1. Estado de Postulación

```
[*] --> PENDIENTE
PENDIENTE --> ACEPTADA
PENDIENTE --> RECHAZADA
PENDIENTE --> CANCELADA
ACEPTADA --> EN_PROGRESO
EN_PROGRESO --> COMPLETADA
COMPLETADA --> [*]
```

### 2. Estado de Servicio

```
[*] --> ACTIVO
ACTIVO --> INACTIVO
ACTIVO --> COMPLETADO
INACTIVO --> ACTIVO
COMPLETADO --> [*]
```

### 3. Estado de Pago (Plan/Servicio)

```
[*] --> PENDIENTE
PENDIENTE --> APROBADO
PENDIENTE --> RECHAZADO
PENDIENTE --> CANCELADO
APROBADO --> [*]
```

### 4. Estado de Reporte

```
[*] --> PENDIENTE
PENDIENTE --> EN_REVISION
EN_REVISION --> RESUELTO
EN_REVISION --> DESCARTADO
RESUELTO --> [*]
```

---

## Cómo Visualizar los Diagramas

### Opción 1: PlantUML Online Server

1. Copia el contenido de cualquier archivo `.puml`
2. Ve a [PlantUML Online Server](https://www.plantuml.com/plantuml/)
3. Pega el código en el editor
4. El diagrama se renderiza automáticamente

### Opción 2: VS Code con Extensión

1. Instala la extensión "PlantUML" en VS Code
2. Abre cualquier archivo `.puml`
3. Presiona `Alt + D` para previsualizar

### Opción 3: Docker

```bash
# Ejecutar PlantUML en Docker
docker run -d -p 8080:8080 plantuml/plantuml-server:jetty
# Accede a http://localhost:8080
```

---

## Conclusiones

Los diagramas UML generados proporcionan una visión completa del sistema SkillBay:

1. **Modelo de Datos**: 11 entidades con relaciones bien definidas
2. **Casos de Uso**: 40 funcionalidades documentadas
3. **Flujos Principales**: Autenticación, Servicios, Postulaciones, Pagos
4. **Arquitectura**: Separación clara entre frontend, API y base de datos
5. **Estados**: Transiciones bien definidas para entidades dinámicas

Estos diagramas son útiles para:
- Onboarding de nuevos desarrolladores
- Planificación de nuevas funcionalidades
- Documentación técnica del sistema
- Análisis de impacto de cambios
