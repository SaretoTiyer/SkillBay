# Informe de Especificación de Requisitos — SkillBay

**Servicio Nacional de Aprendizaje SENA**  
**Centro Tecnológico del Mobiliario — Itagüí, Antioquia**  
**Ficha:** 3145349  
**Versión:** 1.0  
**Fecha:** Abril 2026

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
   - 1.1 [Propósito del documento](#11-propósito-del-documento)
   - 1.2 [Alcance del sistema](#12-alcance-del-sistema)
   - 1.3 [Definiciones y acrónimos](#13-definiciones-y-acrónimos)
2. [Descripción General del Sistema](#2-descripción-general-del-sistema)
   - 2.1 [Perspectiva del producto](#21-perspectiva-del-producto)
   - 2.2 [Funciones principales](#22-funciones-principales)
   - 2.3 [Usuarios y roles](#23-usuarios-y-roles)
3. [Requisitos Funcionales (RF)](#3-requisitos-funcionales-rf)
4. [Requisitos No Funcionales (RNF)](#4-requisitos-no-funcionales-rnf)
5. [Reglas de Negocio (RN)](#5-reglas-de-negocio-rn)
6. [Requisitos de Interfaz (RI)](#6-requisitos-de-interfaz-ri)
7. [Restricciones y Supuestos](#7-restricciones-y-supuestos)
8. [Trazabilidad de Requisitos](#8-trazabilidad-de-requisitos)

---

## 1. Introducción

### 1.1 Propósito del documento

Este documento describe de forma completa y estructurada los requisitos del sistema **SkillBay**, una plataforma web de servicios freelance orientada al mercado colombiano. El objetivo es establecer las condiciones funcionales, no funcionales, de negocio y de interfaz que debe cumplir el software, sirviendo como base para el diseño, desarrollo y pruebas del mismo.

### 1.2 Alcance del sistema

**SkillBay** es una aplicación web SaaS de tipo B2C/C2C que permite:
- La publicación de servicios profesionales por parte de ofertantes.
- La publicación de oportunidades de trabajo por parte de clientes.
- La conexión entre ambas partes mediante un sistema de postulaciones.
- La comunicación interna mediante mensajería vinculada a postulaciones.
- La realización de pagos simulados por servicios y planes.
- La reputación y calificación bidireccional entre usuarios.
- La administración integral de la plataforma desde un panel administrativo.

El sistema está compuesto por:
- **Backend:** API REST desarrollada con Laravel 12 + PHP 8.2 + MySQL 8.0.
- **Frontend:** SPA desarrollada con React 19 + Vite 7 + Tailwind CSS 4.

### 1.3 Definiciones y acrónimos

| Término / Acrónimo | Definición |
|--------------------|------------|
| **RF** | Requisito Funcional |
| **RNF** | Requisito No Funcional |
| **RN** | Regla de Negocio |
| **RI** | Requisito de Interfaz |
| **SPA** | Single Page Application |
| **API REST** | Application Programming Interface con estilo arquitectónico REST |
| **ORM** | Object Relational Mapping |
| **CRUD** | Create, Read, Update, Delete |
| **Ofertante** | Usuario que ofrece servicios en la plataforma |
| **Cliente** | Usuario que busca y contrata servicios |
| **Postulación** | Propuesta de un usuario para realizar un servicio o contratar uno |
| **Oportunidad** | Publicación de un cliente buscando un proveedor de servicio |

---

## 2. Descripción General del Sistema

### 2.1 Perspectiva del producto

SkillBay es una plataforma independiente que no depende de sistemas preexistentes. Surge como respuesta a la necesidad de una plataforma integral de servicios freelance en Colombia que incluya mecanismos de confianza, pagos y comunicación en un mismo ecosistema digital.

El sistema se integra con:
- Servicio SMTP externo para el envío de correos electrónicos (recuperación de contraseña, bienvenida).
- Pasarela de pago simulada interna (`PagoSimuladoService`).

### 2.2 Funciones principales

El sistema debe proveer las siguientes funciones de alto nivel:

1. Registro, autenticación y gestión de perfiles de usuario.
2. Publicación, búsqueda y gestión de servicios y oportunidades.
3. Sistema de postulaciones con ciclo de vida completo.
4. Mensajería interna vinculada a postulaciones.
5. Procesamiento de pagos simulados (planes y servicios).
6. Sistema de reseñas y calificaciones bidireccionales.
7. Notificaciones del sistema por múltiples eventos.
8. Reportes de usuarios y moderación administrativa.
9. Panel de administración con métricas e indicadores.

### 2.3 Usuarios y roles

| Rol | Permisos | Panel |
|-----|----------|-------|
| **Ofertante** (defecto al registrarse) | Publicar servicios, postularse a oportunidades, recibir pagos, calificar | Dashboard de usuario |
| **Cliente** | Publicar oportunidades, solicitar servicios, pagar, calificar | Dashboard de usuario |
| **Administrador** | Gestión completa de usuarios, categorías, planes, reportes y notificaciones globales | Panel administrativo |

> Un usuario puede actuar como ofertante y cliente simultáneamente.

---

## 3. Requisitos Funcionales (RF)

### 3.1 Módulo de Autenticación y Gestión de Usuarios

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-01 | El sistema debe permitir el registro de nuevos usuarios mediante formulario con validación de datos (correo único, edad ≥ 18 años, contraseña segura). | Alta |
| RF-02 | El sistema debe autenticar usuarios mediante correo electrónico y contraseña, generando un token de acceso con Laravel Sanctum. | Alta |
| RF-03 | El sistema debe permitir el cierre de sesión invalidando el token activo. | Alta |
| RF-04 | El sistema debe permitir la recuperación de contraseña mediante enlace enviado al correo registrado. | Alta |
| RF-05 | El sistema debe permitir al usuario actualizar su información de perfil (nombre, teléfono, ciudad, departamento). | Media |
| RF-06 | El sistema debe permitir al usuario subir y actualizar su imagen de perfil. | Media |
| RF-07 | El sistema debe exponer perfiles públicos de cada usuario con sus servicios y reseñas. | Media |
| RF-08 | El sistema debe permitir al administrador bloquear y desbloquear cuentas de usuario. | Alta |
| RF-09 | Los usuarios bloqueados no pueden iniciar sesión mientras estén en ese estado. | Alta |

### 3.2 Módulo de Servicios y Categorías

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-10 | El sistema debe permitir a usuarios autenticados crear publicaciones de tipo "Servicio" u "Oportunidad". | Alta |
| RF-11 | Cada publicación debe incluir: título, descripción, precio, tiempo de entrega, categoría y ubicación. | Alta |
| RF-12 | El sistema debe manejar los estados de un servicio: `activo`, `en_proceso`, `completado`, `cancelado`. | Alta |
| RF-13 | El sistema debe permitir al dueño editar y eliminar sus propias publicaciones activas. | Alta |
| RF-14 | El sistema debe permitir explorar servicios públicamente (sin autenticación) con capacidad de filtrado. | Media |
| RF-15 | El administrador debe poder crear, editar y eliminar categorías de servicios. | Alta |
| RF-16 | Las categorías deben estar organizadas por grupos temáticos (Tecnología, Hogar, Educación, etc.). | Media |

### 3.3 Módulo de Postulaciones

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-17 | Los usuarios autenticados deben poder postularse a servicios u oportunidades de otros usuarios. | Alta |
| RF-18 | La postulación debe incluir: mensaje de presentación, presupuesto propuesto y tiempo estimado. | Alta |
| RF-19 | El dueño del servicio debe poder aceptar o rechazar postulaciones recibidas. | Alta |
| RF-20 | El sistema debe gestionar el ciclo de vida completo de una postulación: `pendiente → aceptada → en_progreso → completada → pagada`. | Alta |
| RF-21 | El ofertante debe poder marcar el trabajo como completado cuando finalice. | Alta |
| RF-22 | El sistema debe notificar automáticamente a ambas partes en cada cambio de estado. | Alta |
| RF-23 | El usuario debe poder cancelar su propia postulación mientras esté en estado `pendiente` o `en_progreso`. | Media |

### 3.4 Módulo de Pagos

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-24 | El sistema debe permitir el pago de planes de suscripción mediante la pasarela simulada. | Alta |
| RF-25 | El sistema debe permitir el pago de servicios completados a través de la pasarela simulada. | Alta |
| RF-26 | El sistema debe soportar los métodos de pago: tarjeta crédito/débito, Nequi, QR Bancolombia y efectivo. | Alta |
| RF-27 | El sistema debe registrar cada transacción con estado: `Pendiente`, `Completado`, `Rechazado`. | Alta |
| RF-28 | El sistema debe permitir la consulta del historial de pagos por usuario. | Media |
| RF-29 | El sistema debe permitir la subida de comprobantes de pago para métodos alternativos (Nequi, Bancolombia). | Media |
| RF-30 | El sistema debe simular aprobación/rechazo de pagos con tarjeta basado en el número ingresado. | Alta |

### 3.5 Módulo de Mensajería

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-31 | El sistema debe habilitar mensajería interna entre las partes de una postulación activa. | Alta |
| RF-32 | Las conversaciones deben estar organizadas por postulación. | Alta |
| RF-33 | El sistema debe mostrar mensajes con fecha, hora y estado de lectura. | Media |
| RF-34 | Los mensajes deben eliminarse automáticamente 15 días después de que la postulación sea completada. | Media |
| RF-35 | El usuario debe poder eliminar mensajes propios dentro de una conversación. | Baja |

### 3.6 Módulo de Notificaciones

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-36 | El sistema debe generar notificaciones automáticas ante eventos: nueva postulación, cambio de estado, pago, reseña, reporte. | Alta |
| RF-37 | El usuario debe poder ver todas sus notificaciones en un centro de notificaciones. | Alta |
| RF-38 | El usuario debe poder marcar notificaciones como leídas individual o masivamente. | Media |
| RF-39 | El usuario debe poder eliminar notificaciones. | Baja |
| RF-40 | El administrador debe poder enviar notificaciones globales a todos los usuarios registrados. | Media |

### 3.7 Módulo de Reseñas

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-41 | El sistema debe permitir dejar reseñas únicamente sobre postulaciones en estado `pagada`. | Alta |
| RF-42 | Las reseñas deben incluir calificación de 1 a 5 estrellas y comentario opcional. | Alta |
| RF-43 | El sistema de reseñas debe ser bidireccional: cliente califica al ofertante y viceversa. | Alta |
| RF-44 | Un usuario no puede calificarse a sí mismo. | Alta |
| RF-45 | Las reseñas deben quedar visibles en el perfil público del usuario calificado. | Alta |
| RF-46 | El sistema debe calcular y mostrar el promedio de calificación de cada usuario. | Media |

### 3.8 Módulo de Reportes

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-47 | Cualquier usuario autenticado debe poder reportar a otro usuario. | Alta |
| RF-48 | Los reportes deben incluir tipo y descripción del problema. | Alta |
| RF-49 | El administrador debe poder ver, gestionar y cambiar el estado de reportes. | Alta |
| RF-50 | Los estados del reporte son: `pendiente`, `en_revision`, `resuelto`, `descartado`. | Alta |

### 3.9 Panel de Administración

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-51 | El sistema debe exponer un panel de administración accesible solo para usuarios con rol `admin`. | Alta |
| RF-52 | El panel debe mostrar un resumen de métricas: usuarios totales, servicios, postulaciones, ingresos. | Alta |
| RF-53 | El administrador debe poder ver gráficas de actividad mensual con Recharts. | Media |
| RF-54 | El administrador debe poder gestionar planes de suscripción (CRUD completo). | Alta |
| RF-55 | El administrador debe poder gestionar categorías (CRUD completo). | Alta |
| RF-56 | El administrador debe poder ver el ranking de top ofertantes, clientes y servicios. | Media |

---

## 4. Requisitos No Funcionales (RNF)

### 4.1 Rendimiento

| ID | Requisito | Criterio de Aceptación |
|----|-----------|------------------------|
| RNF-01 | El sistema debe responder a consultas simples en menos de 200ms bajo carga normal. | Medido con herramientas de profiling (tiempo promedio < 200ms) |
| RNF-02 | Las páginas del frontend deben cargar en menos de 3 segundos en conexiones de 10 Mbps. | Medido con Lighthouse (Time to Interactive < 3s) |
| RNF-03 | El sistema debe soportar al menos 100 usuarios concurrentes sin degradación de rendimiento. | Prueba de carga con Apache JMeter |
| RNF-04 | La disponibilidad del sistema debe ser del 99.5% mensual. | Monitoreo de uptime |

### 4.2 Seguridad

| ID | Requisito | Criterio de Aceptación |
|----|-----------|------------------------|
| RNF-05 | El sistema debe usar tokens de autenticación con expiración configurable (Laravel Sanctum). | Verificación de tokens en pruebas de integración |
| RNF-06 | Las contraseñas deben almacenarse usando el algoritmo de hash bcrypt. | Revisión de código + prueba de base de datos |
| RNF-07 | El sistema debe validar y sanitizar todas las entradas del usuario en el backend. | Pruebas de inyección SQL y XSS |
| RNF-08 | Las rutas del panel de administración deben estar protegidas con middleware de rol `admin`. | Pruebas de acceso no autorizado |
| RNF-09 | La comunicación en producción debe realizarse sobre HTTPS. | Verificación de certificado SSL |
| RNF-10 | Los tokens CSRF deben estar activos para las rutas web de Laravel. | Prueba de formularios sin token |

### 4.3 Usabilidad

| ID | Requisito | Criterio de Aceptación |
|----|-----------|------------------------|
| RNF-11 | La interfaz debe ser completamente responsiva (móvil, tablet, escritorio). | Prueba en resoluciones: 375px, 768px, 1280px |
| RNF-12 | El usuario debe poder completar cualquier acción principal en máximo 3 clics. | Prueba de recorridos de usuario (user journeys) |
| RNF-13 | El sistema debe mostrar mensajes claros de error y confirmación en todas las acciones. | Revisión de flujos con SweetAlert2 |
| RNF-14 | El sistema debe ser compatible con Chrome, Firefox, Edge y Safari (últimas 2 versiones). | Pruebas cross-browser |

### 4.4 Escalabilidad y Mantenibilidad

| ID | Requisito | Criterio de Aceptación |
|----|-----------|------------------------|
| RNF-15 | El código PHP debe seguir el estándar PSR-12 verificado con Laravel Pint. | `composer run lint` sin errores |
| RNF-16 | El código JavaScript debe pasar la verificación de ESLint. | `npm run lint` sin errores |
| RNF-17 | La base de datos debe estar normalizada hasta la Tercera Forma Normal (3FN). | Revisión del modelo relacional |
| RNF-18 | Las tablas frecuentemente consultadas deben tener índices en claves foráneas. | Revisión de migraciones |
| RNF-19 | El sistema debe contar con cobertura mínima del 70% en lógica de negocio crítica. | Reporte de PHPUnit con coverage |

---

## 5. Reglas de Negocio (RN)

| ID | Regla | Módulo afectado |
|----|-------|-----------------|
| RN-01 | Todo usuario nuevo recibe el rol `ofertante` por defecto al registrarse. | Autenticación |
| RN-02 | El rol `admin` no es asignable mediante flujo de registro; solo por intervención directa en base de datos. | Autenticación |
| RN-03 | Un usuario con plan `Free` tiene un límite de publicaciones activas según la configuración del plan. | Servicios, Planes |
| RN-04 | Un usuario no puede postularse a su propio servicio u oportunidad. | Postulaciones |
| RN-05 | Solo se permite una postulación activa por servicio por usuario. | Postulaciones |
| RN-06 | Solo el dueño del servicio puede aceptar, rechazar o cambiar el estado de una postulación. | Postulaciones |
| RN-07 | El pago de un servicio solo puede realizarse cuando la postulación está en estado `completada`. | Pagos |
| RN-08 | Tarjetas que comienzan con `4000`, `5000` o `6000` siempre son rechazadas en el simulador. | Pagos |
| RN-09 | Cualquier otra tarjeta tiene un 95% de probabilidad de aprobación simulada. | Pagos |
| RN-10 | Una reseña solo puede crearse sobre una postulación en estado `pagada`. | Reseñas |
| RN-11 | No se puede crear más de una reseña por postulación por parte del mismo usuario. | Reseñas |
| RN-12 | Un usuario no puede calificarse a sí mismo. | Reseñas |
| RN-13 | Los mensajes de una postulación se eliminan automáticamente 15 días después de que sea completada. | Mensajería |
| RN-14 | Un usuario bloqueado no puede iniciar sesión hasta que el administrador desbloquee la cuenta. | Autenticación |
| RN-15 | Las notificaciones globales del administrador se envían a todos los usuarios registrados activos. | Notificaciones |

---

## 6. Requisitos de Interfaz (RI)

### 6.1 Interfaz de Usuario (UI)

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RI-01 | La interfaz debe seguir una identidad visual consistente con la marca SkillBay (colores corporativos, tipografía, logotipo). | Uso de Tailwind CSS con configuración de marca |
| RI-02 | El sistema debe incluir una barra de navegación principal con acceso a inicio, servicios, sobre nosotros y contacto. | Componente `Navbar.jsx` |
| RI-03 | El dashboard de usuario debe incluir un menú lateral (sidebar) colapsable con todas las secciones disponibles. | Componente `DashboardLayout.jsx` |
| RI-04 | El panel de administración debe tener una estructura visual diferenciada del dashboard de usuario. | Componente `AdminDashboardLayout.jsx` |
| RI-05 | Los formularios deben mostrar mensajes de error de validación inline, próximos al campo con el error. | Validación con feedback visual |
| RI-06 | Las acciones irreversibles (eliminar, bloquear) deben mostrar un diálogo de confirmación antes de ejecutarse. | Uso de SweetAlert2 |
| RI-07 | El sistema debe usar spinners/loaders durante las operaciones asíncronas para indicar espera. | Componente `Loader.jsx` |
| RI-08 | Las imágenes deben tener un componente con fallback en caso de fallo de carga. | Componente `ImageWithFallback.jsx` |

### 6.2 Interfaz de Comunicación (API)

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RI-09 | Todas las respuestas de la API deben usar formato JSON. | Configuración de Laravel API Resources |
| RI-10 | Los endpoints de la API deben seguir convenciones RESTful estándar (GET, POST, PUT, PATCH, DELETE). | `routes/api.php` |
| RI-11 | Las respuestas de error deben incluir código HTTP apropiado y mensaje descriptivo. | Manejo de excepciones en Laravel |
| RI-12 | Los endpoints protegidos deben requerir el header `Authorization: Bearer {token}`. | Middleware `auth:sanctum` |
| RI-13 | La API debe soportar CORS para las solicitudes desde el dominio del frontend. | Configuración en `config/cors.php` |

### 6.3 Interfaz de Base de Datos

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RI-14 | La base de datos debe ser MySQL 8.0+ con codificación UTF8MB4. | Configuración en migraciones de Laravel |
| RI-15 | Todas las tablas deben tener claves primarias definidas. | Revisión de migraciones |
| RI-16 | Las relaciones entre entidades deben estar implementadas con claves foráneas con restricciones de integridad. | Definición de foreign keys en migraciones |

---

## 7. Restricciones y Supuestos

### 7.1 Restricciones

- La pasarela de pago es **simulada** y no procesa transacciones reales.
- El sistema no incluye aplicación móvil nativa en su versión actual (solo web responsiva).
- La mensajería no soporta adjuntos de archivos.
- Las notificaciones en tiempo real requieren configuración adicional de WebSockets (no implementado en V1).
- El sistema no genera facturas electrónicas automáticas.

### 7.2 Supuestos

- Los usuarios del sistema tienen acceso a internet y un dispositivo con navegador moderno.
- El servidor de producción cuenta con PHP 8.2+, MySQL 8.0+, Node.js 18+ y acceso HTTPS.
- El servicio SMTP externo (correo) es configurado por el administrador antes del despliegue.
- Los usuarios mayores de 18 años son responsables del uso que dan a la plataforma.

---

## 8. Trazabilidad de Requisitos

La siguiente tabla muestra la correspondencia entre requisitos y los módulos del sistema que los implementan:

| Requisito | Módulo Backend | Módulo Frontend |
|-----------|----------------|-----------------|
| RF-01 a RF-09 | `AuthController`, `UsuarioController` | `Login.jsx`, `Register.jsx`, `UserProfile.jsx` |
| RF-10 a RF-16 | `ServicioController`, `CategoriaController` | `UserServices.jsx`, `MyServices/` |
| RF-17 a RF-23 | `PostulacionController` | `MyApplications/`, `ReceivedRequests.jsx` |
| RF-24 a RF-30 | `PagoSimuladoController`, `PagoSimuladoService` | `UserPayments.jsx`, `PlanesUser/` |
| RF-31 a RF-35 | `MensajeController` | `UserMessages.jsx` |
| RF-36 a RF-40 | `NotificacionController` | `NotificationsPage.jsx`, `NotificationCenter.jsx` |
| RF-41 a RF-46 | `ResenaController` | `UserProfile.jsx` (sección reseñas) |
| RF-47 a RF-50 | `ReporteController` | `ReportManagement.jsx` |
| RF-51 a RF-56 | `AdminController` | `dashboard-admin/` completo |

---

*Informe de Especificación de Requisitos — SkillBay v1.0*  
*SENA — Centro Tecnológico del Mobiliario, Itagüí - Antioquia*  
*Ficha: 3145349 | Equipo: Santiago Reyes Torres, Caleb Ramirez, Norley Varela, Luisa Higuita*
