# Especificación de Casos de Uso — SkillBay

| Campo         | Detalle                                      |
|---------------|----------------------------------------------|
| **Proyecto**  | SkillBay — Marketplace de Servicios           |
| **Ficha**     | 3145349                                      |
| **Versión**   | 1.0                                          |
| **Fecha**     | Abril 2026                                   |

---

## Tabla de Contenidos

1. [Módulo: Gestión de Usuarios y Perfiles](#1-módulo-gestión-de-usuarios-y-perfiles)
2. [Módulo: Publicación y Búsqueda de Servicios](#2-módulo-publicación-y-búsqueda-de-servicios)
3. [Módulo: Gestión de Ofertas y Solicitudes](#3-módulo-gestión-de-ofertas-y-solicitudes)
4. [Módulo: Proceso de Pago](#4-módulo-proceso-de-pago)
5. [Módulo: Gestión de Suscripciones a Planes](#5-módulo-gestión-de-suscripciones-a-planes)
6. [Módulo: Valoraciones y Reseñas](#6-módulo-valoraciones-y-reseñas)
7. [Módulo: Administración del Sistema](#7-módulo-administración-del-sistema)

---

## Plantilla de Caso de Uso

Cada caso de uso sigue la siguiente estructura:

| Campo | Descripción |
|-------|-------------|
| **ID** | Identificador único (UCxx) |
| **Nombre** | Nombre descriptivo |
| **Actor(es)** | Quién inicia o participa |
| **Precondición** | Estado del sistema antes de ejecutar |
| **Flujo Principal** | Pasos del escenario exitoso |
| **Flujos Alternativos** | Variantes o excepciones |
| **Postcondición** | Estado del sistema tras la ejecución |

---

## 1. Módulo: Gestión de Usuarios y Perfiles

---

### UC01 — Registrarse

| Campo | Detalle |
|-------|---------|
| **ID** | UC01 |
| **Actor** | Visitante (usuario no registrado) |
| **Precondición** | El usuario no tiene cuenta en el sistema |

**Flujo Principal:**
1. El visitante accede a la página de registro.
2. Completa el formulario: nombre, apellido, correo electrónico, contraseña, fecha de nacimiento, ciudad y departamento.
3. Envía el formulario.
4. El sistema valida que el correo no esté registrado previamente.
5. El sistema hashea la contraseña y crea el usuario con plan `FREE`.
6. El sistema genera un token de autenticación (Sanctum).
7. El sistema redirige al dashboard del usuario.

**Flujos Alternativos:**
- **FA1 — Correo ya registrado:** El sistema muestra "Este correo ya está en uso".
- **FA2 — Datos inválidos:** El sistema muestra mensajes de validación por campo.
- **FA3 — Contraseña débil:** El sistema exige mínimo 8 caracteres.

**Postcondición:** El usuario queda registrado con plan FREE y sesión activa.

---

### UC02 — Iniciar Sesión

| Campo | Detalle |
|-------|---------|
| **ID** | UC02 |
| **Actor** | Usuario registrado |
| **Precondición** | El usuario tiene cuenta activa y no está bloqueado |

**Flujo Principal:**
1. El usuario ingresa correo y contraseña.
2. El sistema verifica las credenciales contra la base de datos.
3. El sistema genera un token Bearer (Laravel Sanctum).
4. El sistema retorna el token, los datos del usuario y su rol.
5. El frontend almacena el token y redirige según el rol (`usuario` → Dashboard; `admin` → Panel Admin).

**Flujos Alternativos:**
- **FA1 — Credenciales incorrectas:** El sistema responde 401 con mensaje genérico.
- **FA2 — Usuario bloqueado:** El sistema responde 403 con mensaje "Tu cuenta ha sido bloqueada".

**Postcondición:** El usuario tiene una sesión activa con token válido.

---

### UC03 — Cerrar Sesión

| Campo | Detalle |
|-------|---------|
| **ID** | UC03 |
| **Actor** | Usuario autenticado |
| **Precondición** | El usuario tiene sesión activa |

**Flujo Principal:**
1. El usuario hace clic en "Cerrar sesión".
2. El frontend envía la petición al API con el token Bearer.
3. El sistema invalida el token en `personal_access_tokens`.
4. El frontend elimina el token del almacenamiento local.
5. El sistema redirige a la página de inicio.

**Postcondición:** El token queda invalidado; el usuario no puede acceder a rutas protegidas.

---

### UC04 — Recuperar Contraseña

| Campo | Detalle |
|-------|---------|
| **ID** | UC04 |
| **Actor** | Usuario registrado |
| **Precondición** | El usuario tiene cuenta activa |

**Flujo Principal:**
1. El usuario accede a "¿Olvidaste tu contraseña?" e ingresa su correo.
2. El sistema verifica que el correo esté registrado.
3. El sistema genera un token de restablecimiento y lo almacena en `password_reset_tokens`.
4. El sistema envía un correo con el enlace de restablecimiento.
5. El usuario accede al enlace, ingresa la nueva contraseña y confirma.
6. El sistema actualiza la contraseña y elimina el token de restablecimiento.

**Flujos Alternativos:**
- **FA1 — Correo no registrado:** El sistema responde con mensaje genérico (sin revelar si existe o no).
- **FA2 — Token expirado:** El sistema solicita al usuario repetir el proceso.

**Postcondición:** La contraseña del usuario queda actualizada.

---

### UC05 — Actualizar Perfil

| Campo | Detalle |
|-------|---------|
| **ID** | UC05 |
| **Actor** | Usuario autenticado |
| **Precondición** | El usuario tiene sesión activa |

**Flujo Principal:**
1. El usuario accede a su perfil y selecciona "Editar".
2. Modifica los campos: nombre, apellido, teléfono, ciudad, imagen de perfil, métodos de pago (Nequi, Bancolombia).
3. Envía los cambios.
4. El sistema valida los datos y actualiza el registro en `usuarios`.
5. Si se sube una imagen de perfil, el sistema la almacena en Laravel Storage.

**Postcondición:** El perfil del usuario queda actualizado con los nuevos datos.

---

### UC06 — Ver Perfil Público

| Campo | Detalle |
|-------|---------|
| **ID** | UC06 |
| **Actor** | Usuario autenticado o visitante |
| **Precondición** | Ninguna |

**Flujo Principal:**
1. El usuario accede al perfil público de otro usuario.
2. El sistema retorna: nombre, ciudad, plan, servicios publicados, calificación promedio y reseñas recibidas.

**Postcondición:** El perfil es visualizado. No se modifican datos.

---

## 2. Módulo: Publicación y Búsqueda de Servicios

---

### UC07 — Crear Servicio

| Campo | Detalle |
|-------|---------|
| **ID** | UC07 |
| **Actor** | Usuario autenticado (Ofertante o Cliente) |
| **Precondición** | El usuario tiene sesión activa y no ha alcanzado el límite de su plan |

**Flujo Principal:**
1. El usuario accede a "Crear Servicio / Oportunidad".
2. Completa el formulario: título, descripción, categoría, precio, tipo (`servicio` u `oportunidad`), modo de trabajo, urgencia, imagen.
3. Envía el formulario.
4. El sistema verifica que el usuario no haya superado `limiteServiciosMes` del plan activo.
5. El sistema crea el registro en `servicios` con `estado = 'activo'`.

**Flujos Alternativos:**
- **FA1 — Límite del plan alcanzado:** El sistema informa y sugiere actualizar el plan.

**Postcondición:** El servicio queda publicado y visible en el catálogo.

---

### UC08 — Editar Servicio

| Campo | Detalle |
|-------|---------|
| **ID** | UC08 |
| **Actor** | Usuario dueño del servicio |
| **Precondición** | El servicio existe y pertenece al usuario autenticado |

**Flujo Principal:**
1. El usuario accede a "Mis Servicios" y selecciona "Editar".
2. Modifica los campos deseados.
3. Guarda los cambios.
4. El sistema actualiza el registro en `servicios`.

**Postcondición:** El servicio queda actualizado.

---

### UC09 — Eliminar Servicio

| Campo | Detalle |
|-------|---------|
| **ID** | UC09 |
| **Actor** | Usuario dueño del servicio |
| **Precondición** | El servicio existe y pertenece al usuario autenticado |

**Flujo Principal:**
1. El usuario selecciona "Eliminar" en el servicio.
2. El sistema solicita confirmación.
3. El sistema elimina el servicio y sus postulaciones asociadas (cascade).

**Postcondición:** El servicio y sus datos relacionados quedan eliminados.

---

### UC10 — Buscar Servicios

| Campo | Detalle |
|-------|---------|
| **ID** | UC10 |
| **Actor** | Cualquier usuario o visitante |
| **Precondición** | Ninguna |

**Flujo Principal:**
1. El usuario ingresa un término de búsqueda o navega el catálogo.
2. El sistema retorna los servicios activos que coincidan con el criterio (título, descripción).
3. El resultado se muestra paginado.

**Postcondición:** Se muestran los servicios coincidentes. No se modifican datos.

---

### UC11 — Filtrar por Categoría

| Campo | Detalle |
|-------|---------|
| **ID** | UC11 |
| **Actor** | Cualquier usuario o visitante |
| **Precondición** | Existe al menos una categoría con servicios activos |

**Flujo Principal:**
1. El usuario selecciona una categoría del menú de filtros.
2. El sistema retorna los servicios activos de esa categoría.

**Postcondición:** La lista de servicios queda filtrada por categoría.

---

### UC12 — Ver Detalles de Servicio

| Campo | Detalle |
|-------|---------|
| **ID** | UC12 |
| **Actor** | Cualquier usuario o visitante |
| **Precondición** | El servicio existe y está activo |

**Flujo Principal:**
1. El usuario hace clic en un servicio del catálogo.
2. El sistema retorna el detalle completo: título, descripción, precio, dueño, categoría, métodos de pago, reseñas.

**Postcondición:** Se visualiza el detalle del servicio. No se modifican datos.

---

## 3. Módulo: Gestión de Ofertas y Solicitudes

---

### UC13 — Crear Postulación

| Campo | Detalle |
|-------|---------|
| **ID** | UC13 |
| **Actor** | Usuario autenticado |
| **Precondición** | El servicio está activo y el usuario no es el dueño del servicio |

**Flujo Principal:**
1. El usuario accede al detalle del servicio y selecciona "Postularme" o "Solicitar".
2. Completa la propuesta: mensaje, presupuesto, tiempo estimado.
3. El sistema crea la postulación con `estado = 'pendiente'`.
4. El sistema notifica al dueño del servicio.

**Flujos Alternativos:**
- **FA1 — Ya existe una postulación activa:** El sistema informa que ya se postuló previamente.

**Postcondición:** La postulación queda creada y el dueño del servicio es notificado.

---

### UC14 — Ver Mis Postulaciones

| Campo | Detalle |
|-------|---------|
| **ID** | UC14 |
| **Actor** | Usuario autenticado |
| **Precondición** | El usuario tiene sesión activa |

**Flujo Principal:**
1. El usuario accede a "Mis Postulaciones".
2. El sistema retorna todas las postulaciones realizadas por el usuario, con su estado actual.

**Postcondición:** Se visualizan las postulaciones. No se modifican datos.

---

### UC15 — Ver Solicitudes Recibidas

| Campo | Detalle |
|-------|---------|
| **ID** | UC15 |
| **Actor** | Usuario autenticado (dueño de servicios) |
| **Precondición** | El usuario tiene al menos un servicio publicado |

**Flujo Principal:**
1. El usuario accede a "Solicitudes Recibidas".
2. El sistema retorna todas las postulaciones recibidas en los servicios del usuario.

**Postcondición:** Se visualizan las solicitudes recibidas.

---

### UC16 — Aceptar Postulación

| Campo | Detalle |
|-------|---------|
| **ID** | UC16 |
| **Actor** | Dueño del servicio |
| **Precondición** | La postulación existe y está en estado `pendiente` |

**Flujo Principal:**
1. El dueño visualiza la postulación y selecciona "Aceptar".
2. El sistema actualiza el `estado = 'aceptada'`.
3. El sistema notifica al postulante.

**Postcondición:** La postulación queda aceptada. Puede avanzar a "Iniciar Trabajo".

---

### UC17 — Rechazar Postulación

| Campo | Detalle |
|-------|---------|
| **ID** | UC17 |
| **Actor** | Dueño del servicio |
| **Precondición** | La postulación existe y está en estado `pendiente` |

**Flujo Principal:**
1. El dueño selecciona "Rechazar".
2. El sistema actualiza el `estado = 'rechazada'`.
3. El sistema notifica al postulante.

**Postcondición:** La postulación queda rechazada definitivamente.

---

### UC18 — Iniciar Trabajo

| Campo | Detalle |
|-------|---------|
| **ID** | UC18 |
| **Actor** | Dueño del servicio |
| **Precondición** | La postulación está en estado `aceptada` |

**Flujo Principal:**
1. El dueño selecciona "Iniciar Trabajo".
2. El sistema actualiza el `estado = 'en_trabajo'`.
3. El sistema notifica al postulante.
4. Se habilita el chat de mensajes entre ambos usuarios.

**Postcondición:** El trabajo queda oficialmente en curso.

---

### UC19 — Completar Trabajo

| Campo | Detalle |
|-------|---------|
| **ID** | UC19 |
| **Actor** | Dueño del servicio |
| **Precondición** | La postulación está en estado `en_trabajo` |

**Flujo Principal:**
1. El dueño selecciona "Completar Trabajo".
2. El sistema actualiza el `estado = 'completada'`.
3. El sistema notifica al postulante.
4. Se habilita el flujo de pago y de reseñas.

**Postcondición:** El trabajo queda marcado como completado. Se habilitan pagos y reseñas.

---

### UC20 — Cancelar Postulación

| Campo | Detalle |
|-------|---------|
| **ID** | UC20 |
| **Actor** | Postulante o dueño del servicio |
| **Precondición** | La postulación está en estado `pendiente` o `aceptada` |

**Flujo Principal:**
1. El usuario selecciona "Cancelar Postulación".
2. El sistema solicita confirmación.
3. El sistema actualiza el `estado = 'cancelada'`.
4. El sistema notifica a la otra parte.

**Postcondición:** La postulación queda cancelada. No puede continuar el flujo.

---

## 4. Módulo: Proceso de Pago

---

### UC21 — Iniciar Pago de Servicio

| Campo | Detalle |
|-------|---------|
| **ID** | UC21 |
| **Actor** | Usuario (pagador), Pago Simulado |
| **Precondición** | La postulación está en estado `completada` |

**Flujo Principal:**
1. El usuario accede a "Pagar Servicio" desde la postulación completada.
2. Selecciona el método de pago (`nequi`, `bancolombia`, `efectivo`) y la modalidad.
3. Sube el comprobante si aplica.
4. El sistema registra el pago vía `PagoSimuladoService` con `estado = 'completado'`.
5. Se genera la factura digital y se notifica al receptor.

**Postcondición:** El pago queda registrado y el receptor recibe la notificación.

---

### UC22 — Confirmar Pago

| Campo | Detalle |
|-------|---------|
| **ID** | UC22 |
| **Actor** | Pago Simulado (componente interno) |
| **Precondición** | UC21 fue iniciado |

**Flujo Principal:**
1. `PagoSimuladoService` procesa la transacción internamente.
2. Actualiza el estado del pago a `completado` en `pago_servicios`.

**Postcondición:** El pago queda confirmado en la base de datos.

---

### UC23 — Consultar Estado de Pago

| Campo | Detalle |
|-------|---------|
| **ID** | UC23 |
| **Actor** | Usuario autenticado |
| **Precondición** | Existe al menos un pago registrado para el usuario |

**Flujo Principal:**
1. El usuario consulta el estado de un pago específico.
2. El sistema retorna el registro de `pago_servicios` con su estado actual.

**Postcondición:** Se visualiza el estado. No se modifican datos.

---

### UC24 — Ver Historial de Pagos

| Campo | Detalle |
|-------|---------|
| **ID** | UC24 |
| **Actor** | Usuario autenticado |
| **Precondición** | El usuario tiene sesión activa |

**Flujo Principal:**
1. El usuario accede a "Historial de Pagos".
2. El sistema retorna todos los pagos realizados y recibidos, ordenados por fecha.
3. El usuario puede descargar la factura de cada pago.

**Postcondición:** Se visualiza el historial. No se modifican datos.

---

## 5. Módulo: Gestión de Suscripciones a Planes

---

### UC25 — Ver Planes Disponibles

| Campo | Detalle |
|-------|---------|
| **ID** | UC25 |
| **Actor** | Usuario autenticado o visitante |
| **Precondición** | Existen planes activos en el sistema |

**Flujo Principal:**
1. El usuario accede a la sección "Planes".
2. El sistema retorna todos los planes con nombre, precio, beneficios y límites.

**Postcondición:** Se visualizan los planes. No se modifican datos.

---

### UC26 — Suscribirse a Plan

| Campo | Detalle |
|-------|---------|
| **ID** | UC26 |
| **Actor** | Usuario autenticado, Pago Simulado |
| **Precondición** | El usuario tiene sesión activa y seleccionó un plan diferente al actual |

**Flujo Principal:**
1. El usuario selecciona un plan y confirma la suscripción.
2. Elige el método de pago.
3. `PagoSimuladoService` procesa el pago del plan.
4. El sistema actualiza `id_Plan` en `usuarios`.
5. Se crea el registro en `pago_planes` con fechas de inicio y fin.

**Postcondición:** El usuario queda suscrito al nuevo plan con beneficios activos.

---

### UC27 — Cancelar Suscripción

| Campo | Detalle |
|-------|---------|
| **ID** | UC27 |
| **Actor** | Usuario autenticado |
| **Precondición** | El usuario tiene un plan activo diferente al FREE |

**Flujo Principal:**
1. El usuario solicita cancelar su suscripción.
2. El sistema revierte el plan a `FREE`.
3. No se genera reembolso (según RN-07).

**Postcondición:** El usuario queda en plan FREE.

---

### UC28 — Actualizar Plan

| Campo | Detalle |
|-------|---------|
| **ID** | UC28 |
| **Actor** | Usuario autenticado |
| **Precondición** | El usuario tiene sesión activa |

**Flujo Principal:**
1. El usuario selecciona un plan superior o inferior al actual.
2. El sistema ejecuta el flujo de UC26 con el nuevo plan.

**Postcondición:** El plan del usuario queda actualizado.

---

## 6. Módulo: Valoraciones y Reseñas

---

### UC29 — Crear Reseña

| Campo | Detalle |
|-------|---------|
| **ID** | UC29 |
| **Actor** | Usuario autenticado |
| **Precondición** | La postulación asociada tiene `estado = 'completada'`. El usuario no ha dejado reseña previamente para esta postulación. |

**Flujo Principal:**
1. El usuario accede a la postulación completada y selecciona "Dejar Reseña".
2. Asigna una calificación (1-5) al usuario y al servicio, y escribe un comentario.
3. El sistema crea la reseña en `resenas` con el `rol_calificado` correspondiente.
4. Se notifica al usuario calificado.

**Flujos Alternativos:**
- **FA1 — Ya existe una reseña:** El sistema muestra la reseña existente sin permitir duplicados.

**Postcondición:** La reseña queda registrada y visible en el perfil del calificado.

---

### UC30 — Ver Reseñas de Servicio

| Campo | Detalle |
|-------|---------|
| **ID** | UC30 |
| **Actor** | Cualquier usuario o visitante |
| **Precondición** | El servicio tiene al menos una reseña |

**Flujo Principal:**
1. El usuario accede al detalle de un servicio.
2. El sistema retorna las reseñas ordenadas por fecha, con calificaciones promedio.

**Postcondición:** Se visualizan las reseñas. No se modifican datos.

---

### UC31 — Responder Reseña

| Campo | Detalle |
|-------|---------|
| **ID** | UC31 |
| **Actor** | Usuario calificado |
| **Precondición** | Existe una reseña dirigida al usuario autenticado |

**Flujo Principal:**
1. El usuario accede a sus reseñas recibidas.
2. Selecciona "Responder" y escribe su respuesta.
3. El sistema actualiza la reseña con la respuesta del calificado.

**Postcondición:** La respuesta queda asociada a la reseña y visible públicamente.

---

## 7. Módulo: Administración del Sistema

---

### UC32 — Gestionar Usuarios

| Campo | Detalle |
|-------|---------|
| **ID** | UC32 |
| **Actor** | Administrador |
| **Precondición** | El actor tiene `rol = 'admin'` |

**Flujo Principal:**
1. El administrador accede a "Gestión de Usuarios".
2. El sistema retorna el listado paginado de usuarios con su estado, plan y fecha de registro.
3. El administrador puede buscar y filtrar usuarios.

**Postcondición:** Se visualiza el listado. No se modifican datos en el flujo principal.

---

### UC33 — Bloquear / Desbloquear Usuario

| Campo | Detalle |
|-------|---------|
| **ID** | UC33 |
| **Actor** | Administrador |
| **Precondición** | El usuario objetivo existe |

**Flujo Principal:**
1. El administrador selecciona un usuario y elige "Bloquear" o "Desbloquear".
2. El sistema actualiza `bloqueado = true/false` en `usuarios`.
3. Si el usuario queda bloqueado, sus tokens activos son invalidados.

**Postcondición:** El estado de bloqueo del usuario queda actualizado.

---

### UC34 — Gestionar Categorías

| Campo | Detalle |
|-------|---------|
| **ID** | UC34 |
| **Actor** | Administrador |
| **Precondición** | El actor tiene `rol = 'admin'` |

**Flujo Principal:**
1. El administrador accede a "Categorías".
2. Puede crear, editar o eliminar categorías con nombre, grupo, descripción e imagen.
3. El sistema actualiza la tabla `categorias`.

**Postcondición:** El catálogo de categorías queda actualizado.

---

### UC35 — Gestionar Planes

| Campo | Detalle |
|-------|---------|
| **ID** | UC35 |
| **Actor** | Administrador |
| **Precondición** | El actor tiene `rol = 'admin'` |

**Flujo Principal:**
1. El administrador accede a "Planes".
2. Puede modificar el precio mensual, beneficios o límite de servicios de cada plan.
3. El sistema actualiza la tabla `planes`.

**Postcondición:** Los planes quedan actualizados. Los usuarios con ese plan ven los nuevos beneficios.

---

### UC36 — Ver Dashboard Admin

| Campo | Detalle |
|-------|---------|
| **ID** | UC36 |
| **Actor** | Administrador |
| **Precondición** | El actor tiene `rol = 'admin'` |

**Flujo Principal:**
1. El administrador accede al panel de control.
2. El sistema retorna KPIs: total de usuarios, servicios activos, ingresos del mes, promedio de calificaciones, top servicios.
3. Los datos se presentan en tarjetas y gráficas.

**Postcondición:** Se visualizan las métricas. No se modifican datos.

---

### UC37 — Ver Métricas del Sistema

| Campo | Detalle |
|-------|---------|
| **ID** | UC37 |
| **Actor** | Administrador |
| **Precondición** | Existen datos registrados en el sistema |

**Flujo Principal:**
1. El administrador accede a la sección de métricas detalladas.
2. El sistema retorna estadísticas agregadas: usuarios por plan, pagos por período, servicios por categoría.

**Postcondición:** Se visualizan las métricas detalladas.

---

### UC38 — Gestionar Reportes

| Campo | Detalle |
|-------|---------|
| **ID** | UC38 |
| **Actor** | Administrador |
| **Precondición** | Existen reportes pendientes |

**Flujo Principal:**
1. El administrador accede a "Reportes".
2. Visualiza los reportes con estado `pendiente`.
3. Investiga el caso revisando el perfil del reportado.
4. Toma acción: bloquear usuario, desestimar reporte, o marcar como resuelto.
5. El sistema actualiza el `estado` del reporte.

**Postcondición:** El reporte queda gestionado con la acción tomada registrada.
