# Manual de Usuario — SkillBay

**Plataforma de Servicios Freelance Colombiana**  
**Versión:** 1.0  
**Fecha:** Abril 2026  
**Público objetivo:** Usuarios finales (Clientes y Ofertantes)

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Acceso a la Plataforma](#2-acceso-a-la-plataforma)
   - 2.1 [Registro de usuario](#21-registro-de-usuario)
   - 2.2 [Inicio de sesión](#22-inicio-de-sesión)
   - 2.3 [Recuperación de contraseña](#23-recuperación-de-contraseña)
3. [Panel de Usuario](#3-panel-de-usuario)
   - 3.1 [Vista general del dashboard](#31-vista-general-del-dashboard)
   - 3.2 [Editar perfil](#32-editar-perfil)
4. [Publicar un Servicio u Oportunidad](#4-publicar-un-servicio-u-oportunidad)
   - 4.1 [Crear un Servicio](#41-crear-un-servicio)
   - 4.2 [Crear una Oportunidad](#42-crear-una-oportunidad)
   - 4.3 [Gestionar mis publicaciones](#43-gestionar-mis-publicaciones)
5. [Explorar y Contratar Servicios](#5-explorar-y-contratar-servicios)
   - 5.1 [Explorar el catálogo](#51-explorar-el-catálogo)
   - 5.2 [Postularse a un servicio](#52-postularse-a-un-servicio)
   - 5.3 [Ver mis postulaciones](#53-ver-mis-postulaciones)
6. [Gestión de Solicitudes Recibidas](#6-gestión-de-solicitudes-recibidas)
7. [Mensajería Interna](#7-mensajería-interna)
8. [Sistema de Pagos](#8-sistema-de-pagos)
   - 8.1 [Pagar un plan de suscripción](#81-pagar-un-plan-de-suscripción)
   - 8.2 [Pagar un servicio](#82-pagar-un-servicio)
   - 8.3 [Historial de pagos](#83-historial-de-pagos)
9. [Reseñas y Calificaciones](#9-reseñas-y-calificaciones)
10. [Notificaciones](#10-notificaciones)
11. [Reportar un Usuario](#11-reportar-un-usuario)
12. [Preguntas Frecuentes](#12-preguntas-frecuentes)

---

## 1. Introducción

**SkillBay** es una plataforma web diseñada para el mercado colombiano que conecta a personas que ofrecen servicios profesionales (ofertantes) con personas que necesitan esos servicios (clientes). La plataforma permite publicar servicios, explorar oportunidades, contratar, comunicarse y pagar de forma segura dentro del mismo entorno.

### Roles disponibles

| Rol | ¿Qué puede hacer? |
|-----|-------------------|
| **Ofertante** | Publicar servicios, recibir solicitudes, cobrar por su trabajo |
| **Cliente** | Publicar oportunidades, buscar servicios, contratar y pagar |
| **Administrador** | Gestionar toda la plataforma (uso interno) |

> **Nota:** Al registrarte, obtienes el rol **Ofertante** por defecto. Puedes actuar como cliente publicando una "Oportunidad" o solicitando directamente un servicio existente.

---

## 2. Acceso a la Plataforma

### 2.1 Registro de usuario

Para crear una cuenta en SkillBay:

**Paso 1:** Ingresa a `http://localhost:5173` o a la URL de producción de la plataforma.

**Paso 2:** Haz clic en el botón **"Registrarse"** en la barra de navegación superior.

**Paso 3:** Completa el formulario con los siguientes datos:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Correo electrónico | Tu email único | usuario@email.com |
| Nombre | Tu nombre de pila | Juan |
| Apellido | Tu apellido | Pérez |
| Teléfono | Número colombiano | +573001234567 |
| Ciudad | Tu ciudad de residencia | Medellín |
| Departamento | Tu departamento | Antioquia |
| Fecha de nacimiento | DD/MM/AAAA | 15/03/1990 |
| Género | Masculino / Femenino / Otro | Masculino |
| Contraseña | Mínimo 8 caracteres | ••••••••• |

**Paso 4:** Acepta los términos y condiciones y haz clic en **"Crear cuenta"**.

**Paso 5:** El sistema creará tu cuenta y te redirigirá al dashboard. Recibirás un correo de bienvenida.

---

### 2.2 Inicio de sesión

**Paso 1:** Haz clic en **"Iniciar Sesión"** en la barra de navegación.

**Paso 2:** Ingresa tu correo electrónico y contraseña.

**Paso 3:** Haz clic en **"Entrar"**.

> Si las credenciales son correctas, serás redirigido automáticamente al panel de usuario o de administrador según tu rol.

---

### 2.3 Recuperación de contraseña

**Paso 1:** En la pantalla de inicio de sesión, haz clic en **"¿Olvidaste tu contraseña?"**.

**Paso 2:** Ingresa tu correo electrónico registrado.

**Paso 3:** Haz clic en **"Enviar enlace de recuperación"**.

**Paso 4:** Revisa tu bandeja de entrada y haz clic en el enlace recibido.

**Paso 5:** Ingresa tu nueva contraseña (mínimo 8 caracteres) y confírmala.

**Paso 6:** Haz clic en **"Restablecer contraseña"**. Serás redirigido al inicio de sesión.

---

## 3. Panel de Usuario

### 3.1 Vista general del dashboard

Al iniciar sesión, accedes a tu **Panel de Usuario** que contiene las siguientes secciones en el menú lateral:

| Sección | Descripción |
|---------|-------------|
| **Explorar Servicios** | Navegar el catálogo de servicios disponibles |
| **Explorar Oportunidades** | Ver oportunidades de trabajo publicadas por clientes |
| **Mis Servicios** | Gestionar los servicios que has publicado |
| **Mis Postulaciones** | Ver postulaciones enviadas y recibidas |
| **Mensajes** | Acceder a conversaciones con otros usuarios |
| **Notificaciones** | Centro de alertas del sistema |
| **Pagos** | Historial de transacciones |
| **Planes** | Gestionar tu plan de suscripción |
| **Mi Perfil** | Editar información personal |

---

### 3.2 Editar perfil

**Paso 1:** Haz clic en **"Mi Perfil"** en el menú lateral.

**Paso 2:** En la sección de información personal, puedes modificar:
- Nombre y apellido
- Teléfono
- Ciudad y departamento
- Imagen de perfil (haz clic en el ícono de cámara sobre tu foto)

**Paso 3:** Para subir una foto de perfil, haz clic en el ícono de imagen y selecciona un archivo JPG, PNG o WEBP (máx. 2 MB).

**Paso 4:** Haz clic en **"Guardar cambios"** para aplicar las modificaciones.

> Para cambiar tu contraseña, ve a la sección **"Configuración"** dentro de tu perfil.

---

## 4. Publicar un Servicio u Oportunidad

### 4.1 Crear un Servicio

Un **Servicio** es una publicación donde ofreces tus habilidades o trabajo para que los clientes te contraten.

**Paso 1:** En el menú lateral, ve a **"Mis Servicios"** → **"Crear Servicio"**.

**Paso 2:** Completa el formulario:

| Campo | Descripción |
|-------|-------------|
| Título | Nombre descriptivo del servicio (ej: "Diseño de logo profesional") |
| Descripción | Detalles completos de lo que ofreces |
| Categoría | Selecciona la categoría que mejor describe tu servicio |
| Precio | Precio en pesos colombianos (COP) |
| Tiempo de entrega | Días estimados para completar el trabajo |
| Ubicación | Ciudad y departamento donde prestas el servicio |
| Tipo | Seleccionar "Servicio" |

**Paso 3:** Opcionalmente, agrega imágenes de tu trabajo anterior para mostrar tu portafolio.

**Paso 4:** Haz clic en **"Publicar Servicio"**. Tu servicio quedará activo y visible para todos los usuarios.

---

### 4.2 Crear una Oportunidad

Una **Oportunidad** es una publicación donde buscas a alguien que te preste un servicio específico.

**Paso 1:** Ve a **"Mis Servicios"** → **"Crear Oportunidad"**.

**Paso 2:** Completa el formulario similar al de servicios, pero seleccionando **Tipo: Oportunidad**.

**Paso 3:** Describe claramente qué necesitas, el presupuesto que tienes y el plazo deseado.

**Paso 4:** Haz clic en **"Publicar Oportunidad"**. Los ofertantes interesados podrán postularse.

---

### 4.3 Gestionar mis publicaciones

Desde **"Mis Servicios"** puedes:
- Ver el listado de todos tus servicios y oportunidades
- Editar una publicación existente haciendo clic en el ícono de lápiz (✏️)
- Eliminar una publicación haciendo clic en el ícono de basura (🗑️)
- Ver el estado actual de cada publicación (activo, en proceso, completado, cancelado)

---

## 5. Explorar y Contratar Servicios

### 5.1 Explorar el catálogo

**Paso 1:** En el menú lateral, haz clic en **"Explorar Servicios"**.

**Paso 2:** Verás el catálogo de servicios disponibles publicados por ofertantes.

**Paso 3:** Puedes filtrar los servicios por:
- **Categoría** (Tecnología, Hogar, Educación, etc.)
- **Precio** (rango mínimo y máximo)
- **Ubicación** (ciudad o departamento)

**Paso 4:** Haz clic sobre cualquier servicio para ver su detalle completo, imágenes, descripción y perfil del ofertante.

---

### 5.2 Postularse a un servicio

**Paso 1:** Desde el detalle de un servicio, haz clic en **"Solicitar Servicio"**.

**Paso 2:** Completa el formulario de postulación:

| Campo | Descripción |
|-------|-------------|
| Mensaje | Preséntate y explica por qué te interesa este servicio |
| Presupuesto | Tu propuesta de precio (puede diferir del publicado) |
| Tiempo estimado | En cuánto tiempo podrías completar el trabajo |

**Paso 3:** Haz clic en **"Enviar postulación"**. El ofertante recibirá una notificación.

---

### 5.3 Ver mis postulaciones

**Paso 1:** Ve a **"Mis Postulaciones"** en el menú lateral.

**Paso 2:** Verás dos pestañas:
- **Enviadas:** Postulaciones que has enviado a servicios de otros
- **Recibidas:** Solicitudes que otros usuarios enviaron a tus servicios

**Paso 3:** Cada postulación muestra su estado actual:

| Estado | Significado |
|--------|-------------|
| 🟡 Pendiente | Esperando respuesta del dueño del servicio |
| ✅ Aceptada | Tu postulación fue aceptada |
| ❌ Rechazada | Tu postulación fue rechazada |
| 🔵 En progreso | El trabajo está en curso |
| ✔️ Completada | El trabajo fue marcado como terminado |
| 💰 Pagada | El pago fue procesado exitosamente |
| 🚫 Cancelada | La postulación fue cancelada |

---

## 6. Gestión de Solicitudes Recibidas

Cuando alguien solicita uno de tus servicios, recibirás una notificación y podrás ver la solicitud desde:

**Mis Servicios** → **Solicitudes Recibidas**

**Paso 1:** Revisa el mensaje, presupuesto y tiempo propuesto por el interesado.

**Paso 2:** Haz clic en:
- **"Aceptar"** → para iniciar el trabajo. El estado pasa a "en_progreso".
- **"Rechazar"** → para declinar la solicitud.

**Paso 3:** Una vez que completes el trabajo, haz clic en **"Marcar como completado"** dentro de la postulación activa.

**Paso 4:** El cliente recibirá una notificación para proceder con el pago.

---

## 7. Mensajería Interna

SkillBay incluye un sistema de mensajería privada vinculado a cada postulación activa.

**Paso 1:** Ve a **"Mensajes"** en el menú lateral.

**Paso 2:** Verás la lista de conversaciones activas, ordenadas por fecha de actividad.

**Paso 3:** Haz clic sobre una conversación para abrirla.

**Paso 4:** Escribe tu mensaje en el campo de texto inferior y presiona **Enter** o el botón de enviar para enviarlo.

> **Importante:** Los mensajes están disponibles mientras la postulación esté activa. Se eliminan automáticamente **15 días** después de que el trabajo es marcado como completado.

---

## 8. Sistema de Pagos

SkillBay utiliza una **pasarela de pago simulada** que permite realizar y recibir pagos dentro de la plataforma sin necesidad de integraciones externas reales.

### 8.1 Pagar un plan de suscripción

**Paso 1:** Ve a **"Planes"** en el menú lateral.

**Paso 2:** Compara los planes disponibles:

| Plan | Descripción |
|------|-------------|
| **Free** | Acceso básico con límite de servicios |
| **Plus** | Mayor límite de publicaciones |
| **Ultra** | Sin límites, visibilidad prioritaria |

**Paso 3:** Haz clic en **"Suscribirse"** bajo el plan de tu preferencia.

**Paso 4:** Selecciona el método de pago:
- 💳 Tarjeta de crédito / débito
- 📱 Nequi
- 📷 QR Bancolombia
- 💵 Efectivo

**Paso 5:** Ingresa los datos del método seleccionado y haz clic en **"Pagar"**.

**Paso 6:** El sistema simulará el procesamiento y mostrará el resultado (aprobado o rechazado).

---

### 8.2 Pagar un servicio

Cuando una postulación está en estado **"Completada"**, el cliente debe realizar el pago al ofertante.

**Paso 1:** Ve a **"Mis Postulaciones"** → **"Enviadas"**.

**Paso 2:** Ubica la postulación con estado "Completada" y haz clic en **"Realizar pago"**.

**Paso 3:** Selecciona el método de pago y completa el proceso.

**Paso 4:** Una vez confirmado el pago, la postulación pasa a estado **"Pagada"** y ambas partes reciben notificación.

---

### 8.3 Historial de pagos

**Paso 1:** Ve a **"Pagos"** en el menú lateral.

**Paso 2:** Verás el historial completo de tus transacciones, tanto de planes como de servicios.

**Paso 3:** Cada transacción muestra: fecha, monto, tipo de pago, método utilizado y estado.

---

## 9. Reseñas y Calificaciones

Una vez que una postulación ha sido **pagada**, ambas partes pueden dejar una reseña.

**Paso 1:** Recibirás una notificación invitándote a calificar tu experiencia.

**Paso 2:** Ve a **"Mis Postulaciones"** y selecciona la postulación completada.

**Paso 3:** Haz clic en **"Dejar reseña"**.

**Paso 4:** Selecciona la calificación (1 a 5 estrellas) y escribe un comentario opcional.

**Paso 5:** Haz clic en **"Publicar reseña"**.

> Las reseñas quedan visibles en el perfil público de cada usuario y no pueden editarse una vez publicadas.

---

## 10. Notificaciones

El sistema te notifica automáticamente sobre eventos importantes relacionados con tu actividad.

**Paso 1:** El ícono de campana 🔔 en la barra superior muestra el número de notificaciones sin leer.

**Paso 2:** Haz clic en el ícono para ver el resumen de notificaciones recientes.

**Paso 3:** Para ver todas las notificaciones, haz clic en **"Ver todas"** o ve a **"Notificaciones"** en el menú lateral.

**Paso 4:** Puedes:
- Marcar una notificación como leída haciendo clic sobre ella
- Marcar todas como leídas con el botón **"Marcar todas como leídas"**
- Eliminar notificaciones individuales o limpiar todas

### Tipos de notificaciones

| Tipo | Descripción |
|------|-------------|
| 📩 Postulación | Alguien se postuló a tu servicio o respondió a tu postulación |
| 💰 Pago | Se confirmó un pago recibido o realizado |
| ⭐ Reseña | Recibiste una calificación de un usuario |
| ⚠️ Reporte | El administrador tomó acción sobre un reporte |
| 📢 Sistema | Comunicados oficiales de la plataforma |

---

## 11. Reportar un Usuario

Si experimentas comportamiento inapropiado por parte de otro usuario:

**Paso 1:** Visita el perfil público del usuario que deseas reportar.

**Paso 2:** Haz clic en el botón **"Reportar usuario"** (ícono de bandera 🚩).

**Paso 3:** Selecciona el tipo de reporte:
- Comportamiento inapropiado
- Fraude o engaño
- Contenido falso
- Spam
- Otro

**Paso 4:** Describe detalladamente la situación en el campo de texto.

**Paso 5:** Haz clic en **"Enviar reporte"**. El equipo de moderación revisará tu reporte.

> El usuario reportado no sabrá quién realizó el reporte.

---

## 12. Preguntas Frecuentes

**¿Puedo ofrecer y solicitar servicios al mismo tiempo?**  
Sí. El sistema maneja dos tipos de publicaciones: "Servicio" (ofrecés) y "Oportunidad" (necesitás). Puedes tener ambas al mismo tiempo.

**¿Qué pasa si el ofertante no completa el trabajo?**  
Puedes cancelar la postulación desde "Mis Postulaciones" si el trabajo no avanza. También puedes reportar al usuario si detectas comportamiento fraudulento.

**¿Los pagos son reales?**  
No en la versión actual. SkillBay usa una pasarela de pago **simulada** para demostrar el flujo completo. No se realizan cargos reales a tarjetas ni cuentas Nequi.

**¿Puedo cambiar mi plan en cualquier momento?**  
Sí. Desde la sección **"Planes"** puedes cambiar tu suscripción a cualquier plan disponible.

**¿Se pueden adjuntar archivos en los mensajes?**  
No en la versión actual. La mensajería solo soporta texto plano.

**¿Qué pasa con mis mensajes cuando se completa un trabajo?**  
Los mensajes se eliminan automáticamente 15 días después de que el trabajo es marcado como completado.

**¿Cómo sé si mi postulación fue vista?**  
Recibirás una notificación cuando el dueño del servicio cambie el estado de tu postulación (aceptada, rechazada, etc.).

---

*Manual de Usuario — SkillBay v1.0*  
*SENA — Centro Tecnológico del Mobiliario, Itagüí - Antioquia*  
*Ficha: 3145349 | Abril 2026*
