# Glosario de Términos — SkillBay

| Campo         | Detalle                                      |
|---------------|----------------------------------------------|
| **Proyecto**  | SkillBay — Marketplace de Servicios           |
| **Ficha**     | 3145349                                      |
| **Versión**   | 1.0                                          |
| **Fecha**     | Abril 2026                                   |

---

## Tabla de Contenidos

1. [Términos del Dominio de Negocio](#1-términos-del-dominio-de-negocio)
2. [Roles y Actores](#2-roles-y-actores)
3. [Estados del Sistema](#3-estados-del-sistema)
4. [Términos Técnicos](#4-términos-técnicos)

---

## 1. Términos del Dominio de Negocio

| Término | Definición |
|---------|-----------|
| **SkillBay** | Plataforma digital de marketplace de servicios freelance orientada al mercado colombiano. Permite a personas conectarse para ofrecer y contratar servicios en diversas categorías. |
| **Servicio** | Publicación realizada por un ofertante en la que describe una habilidad o trabajo que puede realizar, incluyendo precio, descripción, categoría y condiciones de entrega. |
| **Oportunidad** | Publicación realizada por un cliente en la que describe un trabajo que necesita contratar, para que los ofertantes interesados presenten sus propuestas. |
| **Postulación** | Solicitud formal que un usuario realiza sobre un servicio u oportunidad publicada. Inicia el proceso de negociación y contratación entre las partes. |
| **Propuesta** | Mensaje, presupuesto y tiempo estimado que un usuario incluye en su postulación para presentar su oferta de trabajo. |
| **Contratación** | Proceso que se activa cuando un dueño de servicio acepta una postulación. Las partes quedan comprometidas a cumplir lo acordado. |
| **Plan** | Nivel de suscripción en SkillBay que determina los beneficios y límites del usuario. Existen planes: FREE, BÁSICO, PRO. |
| **Plan FREE** | Plan predeterminado asignado a todos los usuarios al registrarse. Permite publicar un número limitado de servicios por mes sin costo. |
| **Plan PRO** | Plan de pago con mayor límite de servicios publicables y beneficios adicionales de visibilidad. |
| **Suscripción** | Compra de un plan de pago que activa los beneficios del plan durante un período de tiempo determinado (mensual). |
| **Calificación** | Puntuación numérica del 1 al 5 que un usuario asigna a otro usuario o a un servicio, tras completar un trabajo. |
| **Reseña** | Evaluación que incluye calificación y comentario textual, dejada por un usuario sobre otro usuario o sobre un servicio, una vez completada una postulación. |
| **Ofertante** | Usuario registrado en SkillBay que publica servicios para ofrecer sus habilidades y está disponible para recibir solicitudes o postularse a oportunidades. |
| **Cliente** | Usuario registrado en SkillBay que busca y contrata servicios de otros usuarios, o publica oportunidades de trabajo. |
| **Dueño del Servicio** | Usuario que publicó un servicio u oportunidad. Es quien recibe las postulaciones, las gestiona y decide aceptar o rechazar. |
| **Postulante** | Usuario que se postula a una oportunidad publicada por un cliente. En este caso, si es aceptado y completa el trabajo, recibe el pago del cliente. |
| **Solicitante** | Usuario que solicita directamente a un ofertante la ejecución de su servicio publicado. En este caso, el solicitante paga al ofertante una vez completado el trabajo. |
| **Pagador** | Usuario que realiza la transferencia de dinero en una transacción de servicio. Dependiendo del tipo de postulación, puede ser el cliente o el solicitante. |
| **Receptor** | Usuario que recibe el dinero en una transacción de servicio. Puede ser el ofertante o el postulante, según el tipo de postulación. |
| **Reporte** | Denuncia formal que un usuario realiza contra otro usuario o servicio por comportamiento inadecuado, fraude, spam u otras violaciones a las políticas de uso. |
| **Bloqueo** | Acción administrativa que impide a un usuario ingresar a la plataforma. Los usuarios bloqueados no pueden iniciar sesión ni acceder a recursos protegidos. |
| **Marketplace** | Plataforma digital que conecta a compradores y vendedores (en este caso, clientes y ofertantes) facilitando transacciones de servicios. |
| **Categoría** | Clasificación temática que agrupa servicios similares. Ejemplos: Tecnología, Diseño, Construcción, Educación. |
| **Grupo de Categoría** | Agrupación de alto nivel que contiene varias categorías relacionadas. Ejemplo: el grupo "Tecnología" puede incluir Desarrollo Web, Diseño UX, Data Science. |
| **Comisión** | Porcentaje o monto fijo que la plataforma retiene de cada transacción de servicio procesada. Gestionado internamente por `PagoSimuladoService`. |
| **Comprobante de Pago** | Imagen o archivo que el pagador sube como evidencia de haber realizado una transferencia fuera del sistema (ej. captura de pantalla de Nequi o Bancolombia). |
| **Factura** | Documento digital generado por el sistema que detalla la transacción: servicio, partes involucradas, monto, fecha y referencia de pago. |
| **Historial de Pagos** | Registro cronológico de todas las transacciones (pagos realizados y recibidos) de un usuario en la plataforma. |
| **Límite de Servicios** | Número máximo de servicios u oportunidades que un usuario puede publicar en un mes calendario, determinado por su plan activo. |
| **Métodos de Pago** | Formas disponibles para realizar pagos en la plataforma: Nequi, Bancolombia, efectivo. Cada usuario configura los métodos que acepta en su perfil. |
| **Pago Simulado** | Componente interno (`PagoSimuladoService`) que gestiona y registra los flujos de pago en la plataforma, simulando el comportamiento de una pasarela de pagos real. |

---

## 2. Roles y Actores

| Término | Definición |
|---------|-----------|
| **Usuario** | Toda persona registrada en SkillBay. Tiene acceso a su dashboard y puede actuar como cliente u ofertante (roles no excluyentes). |
| **Administrador** | Usuario con privilegios elevados en el sistema (`rol = 'admin'`). Tiene acceso al panel de administración y puede gestionar usuarios, categorías, planes y reportes. |
| **Visitante** | Persona que accede a SkillBay sin haber iniciado sesión. Puede explorar el catálogo de servicios pero no puede publicar ni postularse. |
| **Perfil Público** | Vista de un usuario visible para todos. Incluye nombre, ciudad, plan, servicios publicados y calificación promedio. No expone datos sensibles. |

---

## 3. Estados del Sistema

### Estados de Postulación

| Estado | Descripción |
|--------|-------------|
| `pendiente` | La postulación fue enviada y espera respuesta del dueño del servicio. |
| `aceptada` | El dueño del servicio aprobó la postulación. Las partes pueden comunicarse por mensajes. |
| `rechazada` | El dueño del servicio rechazó la postulación. El flujo termina aquí. |
| `en_trabajo` | El trabajo está en curso. El dueño activó el inicio del trabajo. |
| `completada` | El trabajo fue marcado como completado. Se habilita el pago y las reseñas. |
| `cancelada` | Cualquiera de las partes canceló antes de completar el trabajo. |

### Estados de Pago

| Estado | Descripción |
|--------|-------------|
| `pendiente` | El pago fue iniciado pero aún no confirmado. |
| `completado` | El pago fue procesado y confirmado exitosamente. |
| `fallido` | El pago no pudo completarse por un error en el proceso. |

### Estados de Notificación

| Estado | Descripción |
|--------|-------------|
| `No leido` | La notificación aún no fue vista por el destinatario. |
| `Leido` | La notificación fue marcada como leída. |

### Estados de Reporte

| Estado | Descripción |
|--------|-------------|
| `pendiente` | El reporte fue recibido y aún no ha sido revisado por el administrador. |
| `revisado` | El administrador revisó el reporte pero aún no tomó una acción final. |
| `resuelto` | El administrador tomó una acción (bloqueo, desestimación) y cerró el reporte. |

### Estados de Servicio

| Estado | Descripción |
|--------|-------------|
| `activo` | El servicio está publicado y visible en el catálogo. |
| `inactivo` | El servicio fue desactivado por el dueño o el sistema. No aparece en búsquedas. |
| `completado` | El servicio fue marcado como finalizado por el dueño. |

---

## 4. Términos Técnicos

| Término | Definición |
|---------|-----------|
| **API REST** | Interfaz de programación de aplicaciones (API) que sigue el estilo arquitectónico REST. En SkillBay, el backend expone todos sus endpoints bajo el prefijo `/api/`. |
| **SPA (Single Page Application)** | Aplicación web que carga una única página HTML y actualiza el contenido dinámicamente sin recargar la página completa. El frontend de SkillBay está construido como una SPA con React. |
| **Laravel** | Framework PHP de código abierto utilizado para construir el backend de SkillBay. Versión 12. |
| **Eloquent ORM** | ORM (Object-Relational Mapping) de Laravel que permite interactuar con la base de datos MySQL usando clases PHP (Modelos) en lugar de SQL directo. |
| **Laravel Sanctum** | Paquete de Laravel para autenticación de SPAs y APIs mediante tokens Bearer. Utilizado en SkillBay para proteger todas las rutas autenticadas. |
| **Bearer Token** | Token de autenticación incluido en el encabezado `Authorization` de las peticiones HTTP al API. Formato: `Authorization: Bearer {token}`. |
| **Middleware** | Capa de software que intercepta las peticiones HTTP antes de que lleguen al controlador. En SkillBay se usa para verificar autenticación (`auth:sanctum`) y roles (`IsAdmin`). |
| **React** | Biblioteca de JavaScript para construir interfaces de usuario. El frontend de SkillBay usa React 19 con hooks funcionales. |
| **Vite** | Herramienta de construcción (build tool) para proyectos frontend. SkillBay usa Vite 7 para compilar el código React. |
| **Tailwind CSS** | Framework de CSS utilitario. SkillBay usa la versión 4 para estilos de todos los componentes del frontend. |
| **MySQL** | Sistema de gestión de bases de datos relacional usado como capa de persistencia en SkillBay. Versión 8.0. |
| **Migración** | Archivo PHP de Laravel que define la creación o modificación de tablas de base de datos, permitiendo controlar el esquema con control de versiones. |
| **Seeder** | Clase PHP de Laravel que inserta datos de prueba en la base de datos. Usado en SkillBay para poblar usuarios, categorías y planes de prueba. |
| **Factory** | Clase PHP de Laravel que genera instancias aleatorias de modelos para pruebas automatizadas. |
| **Job / Cola** | Trabajo asíncrono en Laravel que se encola y ejecuta en segundo plano. SkillBay usa jobs para enviar notificaciones sin bloquear la respuesta HTTP. |
| **CORS** | Cross-Origin Resource Sharing. Política de seguridad del navegador que controla qué dominios pueden hacer peticiones a la API. Configurado en `config/cors.php`. |
| **Azure App Service** | Servicio de hosting en la nube de Microsoft donde están desplegados el frontend y backend de SkillBay en producción. |
| **Docker** | Plataforma de contenedores usada para empaquetar el backend de SkillBay y desplegarlo en Azure via imágenes Docker. |
| **ACR (Azure Container Registry)** | Registro privado de imágenes Docker en Azure. Las imágenes de SkillBay se almacenan aquí antes de ser desplegadas en App Service. |
| **GitHub Actions** | Servicio de CI/CD de GitHub. SkillBay usa GitHub Actions para automatizar el build, push a ACR y deploy en Azure en cada push a `main`. |
| **PagoSimuladoService** | Servicio PHP interno de SkillBay que simula el comportamiento de una pasarela de pagos real (como MercadoPago). Gestiona el flujo de pago de servicios y suscripciones a planes. |
| **Laravel Storage** | Sistema de gestión de archivos de Laravel. SkillBay lo usa para almacenar imágenes de perfiles, servicios, categorías y comprobantes de pago. |
| **Hash::check** | Método de Laravel para verificar que una contraseña en texto plano coincide con su versión hasheada en base de datos, usando bcrypt. |
| **Sanctum Token** | Token de acceso personal generado por Laravel Sanctum al hacer login. Se almacena en `personal_access_tokens` y se invalida al hacer logout. |
