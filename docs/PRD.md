# SkillBay - Product Requirements Document (PRD)

## 1. Información General del Producto

### 1.1 Nombre del Producto
**SkillBay** - Plataforma de Servicios Freelance Colombiana

### 1.2 Versión del Documento
1.0.0

### 1.3 Fecha de Elaboración
Marzo 2026

### 1.4 Descripción del Producto
SkillBay es una plataforma digital integral que conecta de manera segura y eficiente a ofertantes y solicitantes de servicios diversos en Colombia, mejorando la experiencia y confianza en el mercado de servicios para personas mayores de 18 años.

### 1.5 Tipo de Producto
Plataforma web SaaS B2C/C2C (Mercado de servicios)

---

## 2. Antecedentes y Problema

### 2.1 Problema Identificado
En Colombia, las personas mayores de 18 años enfrentan barreras significativas para encontrar y contratar o publicar servicios de manera confiable, rápida y segura:

- **Falta de plataformas integrales**: No existen plataformas que reunan diversas categorías de servicios (tecnología, cuidado del hogar, educación, servicios generales, eventos y oficios manuales)
- **Desconfianza digital**: La falta de mecanismos de verificación y seguridad genera desconfianza entre usuarios
- **Informalidad laboral**: Un alto porcentaje de trabajadores en sectores de servicios operan en la informalidad, sin garantías ni estabilidad
- **Dispersión de oferta**: La falta de una oferta consolidada y confiable dificulta la adopción masiva de soluciones tecnológicas

### 2.2 Oportunidad de Mercado
El DANE reporta que un alto porcentaje de trabajadores en sectores como el cuidado del hogar, servicios manuales y cursos particulares operan en la informalidad. SkillBay representa una oportunidad para:
- Democratizar el acceso a servicios profesionales
- Formalizar el mercado de servicios en Colombia
- Generar inclusión laboral y digital

---

## 3. Objetivos del Producto

### 3.1 Objetivo General
Desarrollar una plataforma web que permita a los colombianos mayores de 18 años ofertar y contratar servicios en categorías diversas, garantizando seguridad, confianza y eficiencia en las conexiones entre usuarios.

### 3.2 Objetivos Específicos
1. **Analizar** las características y necesidades de los usuarios colombianos mayores de 18 años en relación con la contratación y oferta de servicios en categorías seleccionadas.
2. **Diseñar** una arquitectura y experiencia de usuario intuitiva y segura que facilite la conexión entre oferentes y solicitantes de servicios.
3. **Implementar** mecanismos de verificación, calificación y seguridad para aumentar la confianza y reducir el riesgo en la contratación de servicios.
4. **Evaluar** la funcionalidad y aceptación de la plataforma mediante pruebas piloto con usuarios reales en distintos segmentos de servicios.

---

## 4. Usuarios Objetivo

### 4.1 Segmentos de Usuarios

| Segmento | Descripción | Necesidad Principal |
|----------|-------------|---------------------|
| **Ofertantes** | Profesionales independientes que ofrecen servicios en diversas categorías | Encontrar clientes, gestionar proyectos, recibir pagos |
| **Clientes** | Personas mayores de 18 años que buscan servicios específicos | Encontrar proveedores confiables, contratar servicios |
| **Administradores** | Equipo que gestiona la plataforma | Gestionar usuarios, contenido, pagos y reportes |

### 4.2 Roles del Sistema

| Rol | Permisos | Funcionalidades |
|-----|----------|------------------|
| **Cliente** | Publicar oportunidades, contratar servicios, calificar, messenger | Panel de usuario |
| **Ofertante** | Publicar servicios, postularse, trabajar, cobrar | Panel de usuario |
| **Administrador** | Gestión completa de la plataforma | Panel de admin |

### 4.3 Público Objetivo
- Colombianos mayores de 18 años
- Usuarios con acceso a internet y dispositivo móvil/escritorio
- Personas con necesidad de contratar servicios o que ofrecen habilidades profesionales

---

## 5. Propuesta de Valor

### 5.1 Valor Añadido
SkillBay se diferencia por ofrecer una experiencia completa que incluye:

- **Pasarela de pago simulada** integrada para transacciones seguras
- **Sistema de postulaciones** que permite a los ofertantes competir por proyectos
- **Mensajería interna** para comunicación directa entre partes
- **Panel de administración** completo para gestión de la plataforma
- **Sistema de reportes** para mantener la integridad de la comunidad
- **Categorías diversas**: Tecnología, Cuidado del Hogar, Educación, Servicios Generales, Eventos, Oficios Manuales

### 5.2 Beneficios por Stakeholder

| Stakeholder | Beneficio |
|-------------|-----------|
| **Ofertantes** | Acceso a clientes, gestión de proyectos, ingresos seguros |
| **Clientes** | Confianza, variedad de opciones, pagos seguros |
| **Administradores** | Control total, métricas, gestión eficiente |
| **Comunidad** | Formalización laboral, inclusión digital |

---

## 6. Requisitos Funcionales

### 6.1 Módulo de Autenticación y Usuarios

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| RF-01 | Registro de usuarios con verificación de correo electrónico | Alta | Por implementar |
| RF-02 | Inicio de sesión seguro con tokens API (Laravel Sanctum) | Alta | Por implementar |
| RF-03 | Recuperación de contraseña mediante correo electrónico | Alta | Por implementar |
| RF-04 | Perfiles de usuario públicos y privados | Media | Por implementar |
| RF-05 | Sistema de roles: Cliente, Ofertante, Administrador | Alta | Por implementar |
| RF-06 | Bloqueo de usuarios por comportamiento inapropiado | Alta | Por implementar |

### 6.2 Módulo de Servicios

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| RF-07 | Creación de servicios por parte de clientes | Alta | Por implementar |
| RF-08 | Dos tipos de publicaciones: Servicios y Oportunidades | Alta | Por implementar |
| RF-09 | Categorización de servicios con grupos temáticos | Alta | Por implementar |
| RF-10 | Sistema de estados: activo, en proceso, completado, cancelado | Alta | Por implementar |
| RF-11 | Galería de imágenes por servicio | Media | Por implementar |
| RF-12 | Tiempo de entrega configurable | Media | Por implementar |

### 6.3 Módulo de Postulaciones

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| RF-13 | Los ofertantes pueden postularse a servicios/oportunidades | Alta | Por implementar |
| RF-14 | Propuesta de presupuesto y tiempo estimado | Alta | Por implementar |
| RF-15 | Mensaje de presentación personalizado | Alta | Por implementar |
| RF-16 | Estados de postulación: pendiente, aceptada, rechazada, cancelada | Alta | Por implementar |
| RF-17 | Seguimiento del estado del trabajo | Alta | Por implementar |
| RF-18 | Sistema de completación con verificación para pago | Alta | Por implementar |

### 6.4 Módulo de Pagos

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| RF-19 | Integración de pasarela de pago simulada | Alta | Implementado |
| RF-20 | Suscripciones a planes (mensuales) | Alta | Por implementar |
| RF-21 | Pagos por servicios individuales | Alta | Por implementar |
| RF-22 | Historial de transacciones | Media | Por implementar |
| RF-23 | Webhook para procesamiento de pagos asíncronos | Alta | Por implementar |
| RF-24 | Modo simulador para pruebas de desarrollo | Alta | Por implementar |

### 6.5 Módulo de Comunicación

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| RF-25 | Sistema de mensajería interno entre usuarios | Alta | Por implementar |
| RF-26 | Conversaciones organizadas por postulación | Alta | Por implementar |
| RF-27 | Notificaciones en tiempo real | Media | Por implementar |
| RF-28 | Notificaciones globales del administrador | Media | Por implementar |
| RF-29 | Centro de notificaciones con marcar como leído | Alta | Por implementar |

### 6.6 Módulo de Reputación

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| RF-30 | Sistema de reseñas y calificaciones | Alta | Por implementar |
| RF-31 | Calificación por estrellas (1-5) | Alta | Por implementar |
| RF-32 | Comentarios detallados | Media | Por implementar |
| RF-33 | Reseñas vinculadas a servicios completados | Alta | Por implementar |

### 6.7 Módulo de Reportes

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| RF-34 | Reporte de usuarios por comportamiento inapropiado | Alta | Por implementar |
| RF-35 | Categorización de tipos de reporte | Alta | Por implementar |
| RF-36 | Gestión de reportes por administradores | Alta | Por implementar |
| RF-37 | Acciones: advertencia, bloqueo, eliminación | Alta | Por implementar |

### 6.8 Panel de Administración

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| RF-38 | Dashboard con métricas y estadísticas | Alta | Por implementar |
| RF-39 | Gestión de usuarios (ver, bloquear) | Alta | Por implementar |
| RF-40 | Gestión de planes de suscripción | Alta | Por implementar |
| RF-41 | Gestión de categorías | Alta | Por implementar |
| RF-42 | Gestión de postulaciones | Media | Por implementar |
| RF-43 | Gestión de reportes | Alta | Por implementar |
| RF-44 | Notificaciones globales | Media | Por implementar |

---

## 7. Requisitos No Funcionales

### 7.1 Requisitos de Rendimiento

| ID | Requisito | Criterio |
|----|-----------|----------|
| RNF-01 | Tiempo de respuesta de API | < 200ms para consultas simples |
| RNF-02 | Tiempo de carga de páginas | < 3 segundos |
| RNF-03 | Concurrentes soportados | Mínimo 100 usuarios simultáneos |
| RNF-04 | Uptime del sistema | 99.5% |

### 7.2 Requisitos de Seguridad

| ID | Requisito | Criterio |
|----|-----------|----------|
| RNF-05 | Autenticación segura | Tokens JWT con Laravel Sanctum |
| RNF-06 | Protección de datos | Encriptación de datos sensibles |
| RNF-07 | Validación de entradas | Sanitización de datos del usuario |
| RNF-08 | Protección CSRF | Implementación de tokens CSRF |
| RNF-09 | HTTPS | Comunicación segura obligatoria |

### 7.3 Requisitos de Usabilidad

| ID | Requisito | Criterio |
|----|-----------|----------|
| RNF-10 | Diseño responsivo | Compatible con móvil, tablet y escritorio |
| RNF-11 | Accesibilidad | Cumplimiento de WCAG 2.1 nivel AA |
| RNF-12 | Navegación intuitiva | máximo 3 clics para cualquier acción |
| RNF-13 | Compatibilidad navegadores | Chrome, Firefox, Edge, Safari (últimas 2 versiones) |

### 7.4 Requisitos de Escalabilidad

| ID | Requisito | Criterio |
|----|-----------|----------|
| RNF-14 | Arquitectura escalable | Capacidad de expansión horizontal |
| RNF-15 | Base de datos optimizada | Índices y consultas eficientes |

### 7.5 Requisitos de Mantenibilidad

| ID | Requisito | Criterio |
|----|-----------|----------|
| RNF-16 | Código documentado | Comentarios en funciones complejas |
| RNF-17 | Testing | Cobertura mínima del 70% en lógica de negocio |
| RNF-18 | Estándares de código | PSR-12 para PHP, ESLint para JavaScript |

---

## 8. Categorías de Servicios

### 8.1 Estructura de Categorías

| Categoría Principal | Subcategorías |
|---------------------|---------------|
| **Tecnología** | Desarrollo web, Apps móviles, Diseño gráfico, SEO, Marketing digital, Soporte técnico |
| **Cuidado del Hogar** | Limpieza, Jardinería, Mascotas, Cocina, Cuidado de adultos mayores |
| **Educación** | Clases particulares, Idiomas, Música, Deportes, Tutorías académicas |
| **Servicios Generales** | Mudanzas, Plomería, Electricidad, Carpintería, Pintura |
| **Eventos** | Fotografía, Video, Catering, Decoración, Animación |
| **Oficios Manuales** | Costura, Reparación de calzado, Joyería artesanal, Customización |

---

## 9. Casos de Uso Principales

### 9.1 Caso de Uso: Registro de Usuario

**Actor**: Usuario potencial
**Flujo principal**:
1. El usuario accede a la página de registro
2. Completa el formulario con: correo, nombre, apellido, teléfono, ciudad, departamento, fecha de nacimiento, género, contraseña
3. El sistema valida los datos
4. El sistema envía correo de verificación
5. El usuario verifica su correo
6. El sistema crea la cuenta y asigna rol por defecto (ofertante)
7. El usuario puede iniciar sesión

**Flujo alternativo**: Si el correo ya existe, el sistema muestra error

### 9.2 Caso de Uso: Publicar un Servicio

**Actor**: Cliente autenticado
**Flujo principal**:
1. El cliente inicia sesión
2. Accede a "Publicar Servicio"
3. Selecciona tipo: "Oportunidad" (busca proveedor) o "Servicio" (ofrece servicio)
4. Completa: título, descripción, categoría, precio, tiempo de entrega
5. Adjunta imágenes (opcional)
6. Publica el servicio
7. El servicio queda activo y visible

### 9.3 Caso de Uso: Postularse a un Servicio

**Actor**: Ofertante autenticado
**Flujo principal**:
1. El ofertante navega los servicios disponibles
2. Selecciona un servicio/oportunidad
3. Envía postulación con: mensaje, presupuesto propuesto, tiempo estimado
4. El cliente recibe notificación
5. El cliente revisa y acepta/rechaza
6. Si se acepta, comienza la relación laboral

### 9.4 Caso de Uso: Realizar un Pago

**Actor**: Cliente autenticado
**Flujo principal**:
1. El cliente selecciona un plan de suscripción o servicio
2. Selecciona método de pago (tarjeta, efectivo, Nequi, QR Bancolombia)
3. Completa datos de pago en la pasarela simulada
4. El sistema procesa y aprueba/rechaza el pago
5. El sistema actualiza el estado del servicio/suscripción

### 9.5 Caso de Uso: Dejar una Reseña

**Actor**: Cliente con servicio completado
**Flujo principal**:
1. El cliente recibe notificación de servicio completado
2. Accede a "Mis Servicios"
3. Selecciona el servicio completado
4. Deja calificación (1-5 estrellas) y comentario
5. La reseña queda publicada en el perfil del ofertante

---

## 10. Arquitectura Técnica

### 10.1 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 19.x + Vite 7.x + Tailwind CSS 4.x |
| **Backend** | Laravel 12.x + PHP 8.2+ |
| **Base de Datos** | MySQL 8.0+ |
| **Autenticación** | Laravel Sanctum |
| **Pagos** | PagoSimulado (pasarela simulada) |
| **Testing** | PHPUnit |

### 10.2 Arquitectura del Sistema

```
┌─────────────────────────────────────────────┐
│                 FRONTEND                     │
│            (React + Vite)                   │
│  Pages | Components | Services | Store     │
└────────────────────┬────────────────────────┘
                     │ HTTP/API
┌────────────────────▼────────────────────────┐
│                 BACKEND                       │
│              (Laravel 12)                   │
│  Controllers → Services → Models → Database │
└─────────────────────────────────────────────┘
```

### 10.3 Estructura de Directorios

**Backend**:
- `app/Http/Controllers/Api/` - Controladores
- `app/Models/` - Modelos Eloquent
- `app/Services/` - Lógica de negocio
- `database/migrations/` - Estructura DB
- `routes/api.php` - Endpoints

**Frontend**:
- `src/pages/` - Vistas completas
- `src/components/` - Componentes reutilizables
- `src/dashboard-users/` - Panel de usuario
- `src/dashboard-admin/` - Panel de admin
- `src/config/` - Configuración API

---

## 11. Roadmap y Milestones

### 11.1 Fases de Desarrollo

| Fase | Descripción | Duración | Entregables |
|------|-------------|----------|-------------|
| **Fase 1: Fundamentos** | Autenticación, perfiles, estructura base | 2 semanas | Registro, login, gestión de perfiles |
| **Fase 2: Servicios** | CRUD servicios, categorías, estados | 3 semanas | Publicar, buscar, gestionar servicios |
| **Fase 3: Postulaciones** | Sistema de postulaciones y gestión | 3 semanas | Postularse, aceptar, rechazar |
| **Fase 4: Pagos** | Pasarela de pago simulada, suscripciones | 3 semanas | Pagos, planes, métodos múltiples |
| **Fase 5: Comunicación** | Mensajería, notificaciones | 2 semanas | Chat, notificaciones |
| **Fase 6: Reputación** | Reseñas, calificaciones | 1 semana | Sistema de ratings |
| **Fase 7: Reportes** | Sistema de reportes, moderation | 2 semanas | Reportar usuarios, gestión admin |
| **Fase 8: Panel Admin** | Dashboard, gestión integral | 2 semanas | Administración completa |
| **Fase 9: Testing y QA** | Pruebas, ajustes, optimización | 2 semanas | Producto estable |

### 11.2 Cronograma Estimado
**Duración total**: 20 semanas (~5 meses)

---

## 12. Métricas de Éxito

### 12.1 KPIs de Negocio

| Métrica | Descripción | Meta (6 meses) |
|---------|-------------|----------------|
| **Usuarios registrados** | Total de usuarios en la plataforma | 10,000 |
| **Servicios publicados** | Total de servicios/oportunidades | 5,000 |
| **Postulaciones realizadas** | Total de postulaciones | 15,000 |
| **Tasa de conversión** | Usuarios que contratan al menos un servicio | 15% |
| **Ingresos mensuales** | MRR de suscripciones | $5,000,000 COP |

### 12.2 KPIs Técnicos

| Métrica | Descripción | Meta |
|---------|-------------|------|
| **Uptime** | Disponibilidad del sistema | 99.5% |
| **Tiempo de respuesta** | Promedio de respuesta API | < 200ms |
| **Tasa de errores** | Porcentaje de requests con error | < 1% |
| **Cobertura de tests** | Cobertura de código | > 70% |

### 12.3 KPIs de Usuario

| Métrica | Descripción | Meta |
|---------|-------------|------|
| **NPS** | Net Promoter Score | > 50 |
| **Retención** | Usuarios activos después de 30 días | 40% |
| **Satisfacción** | Calificación promedio de usuarios | 4.0/5.0 |

---

## 13. Riesgos y Dependencias

### 13.1 Riesgos Identificados

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|--------------|---------|------------|
| R-01 | Baja adopción de usuarios | Alta | Alto | Marketing,referidos, SEO |
| R-02 | Limitaciones de pasarela simulada | Media | Alto | Preparar integración con pasarela real cuando sea necesario |
| R-03 | Seguridad de pagos | Media | Crítico | Auditorías, cumplimiento PCI |
| R-04 | Escalabilidad | Media | Medio | Arquitectura modular |
| R-05 | Competencia de otras plataformas | Media | Medio | Diferenciación, comunidad |

### 13.2 Dependencias Externas

| Dependencia | Descripción | Criticidad |
|-------------|-------------|------------|
| Pasarela de Pago | Procesamiento de pagos simulado | Media |
| Servidor SMTP | Envío de correos | Alta |
| Hosting/Infraestructura | Infraestructura del servidor | Crítica |
| Dominio skillbay.com | Dominio principal | Alta |

### 13.3 Supuestos

1. El mercado objetivo (colombianos mayores de 18 años) tiene acceso a internet
2. Los usuarios tienen dispositivos para acceder a la plataforma
3. Existe demanda real de servicios freelance en Colombia
4. La pasarela de pago simulada funciona correctamente para pruebas
5. La regulación permite este tipo de plataformas

---

## 14. Limitaciones y Exclusiones

### 14.1 Limitaciones Conocidas
- El sistema de mensajería no soporta adjuntos de archivos en la versión actual
- Las notificaciones en tiempo real requieren configuración adicional de WebSockets
- La pasarela de pago es simulada y no procesa pagos reales
- No hay sistema de facturación automática integrada
- La verificación de identidad de usuarios es manual

### 14.2 Exclusiones (No incluye en V1)
- Aplicación móvil nativa (solo web responsive)
- Sistema de videollamadas integrado
- Sistema de contratos legales automatizados
- Integración con otros procesadores de pago
- Programa de referidos automático

---

## 15. Glosario de Términos

| Término | Definición |
|---------|------------|
| **Ofertante** | Usuario que ofrece servicios en la plataforma |
| **Cliente** | Usuario que busca y contrata servicios |
| **Servicio** | Publicación de un ofertante ofreciendo sus habilidades |
| **Oportunidad** | Publicación de un cliente buscando un proveedor |
| **Postulación** | Propuesta de un ofertante a un servicio/oportunidad |
| **Suscripción** | Plan mensual de membresía |
| **Webhook** | Notificación automática de eventos externos |

---

## 16. Aprobaciones

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Product Owner | | | |
| Tech Lead | | | |
| QA Lead | | | |

---

## 17. Historial de Revisiones

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0.0 | Marzo 2026 | SkillBay Team | Versión inicial del PRD |

---

*Documento creado para SkillBay - Conectando talento con oportunidades*
