<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a SkillBay</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
               background-color: #f1f5f9; color: #1e293b; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff;
                   border-radius: 16px; overflow: hidden;
                   box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
                  padding: 40px 32px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 28px; font-weight: 700;
                     letter-spacing: -0.5px; }
        .header p { color: #bfdbfe; font-size: 15px; margin-top: 8px; }
        .body { padding: 40px 32px; }
        .greeting { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .text { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 20px; }
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr;
                        gap: 16px; margin: 28px 0; }
        .feature { background: #f8fafc; border: 1px solid #e2e8f0;
                   border-radius: 12px; padding: 20px 16px; text-align: center; }
        .feature-icon { font-size: 28px; margin-bottom: 8px; }
        .feature-title { font-size: 14px; font-weight: 600; color: #1e293b;
                         margin-bottom: 4px; }
        .feature-desc { font-size: 12px; color: #64748b; line-height: 1.5; }
        .cta-container { text-align: center; margin: 32px 0; }
        .cta-button { display: inline-block; background: #2563eb; color: #ffffff;
                      text-decoration: none; font-weight: 600; font-size: 15px;
                      padding: 14px 36px; border-radius: 10px;
                      letter-spacing: 0.2px; }
        .divider { height: 1px; background: #e2e8f0; margin: 28px 0; }
        .info-box { background: #eff6ff; border: 1px solid #bfdbfe;
                    border-radius: 10px; padding: 16px 20px; }
        .info-box p { font-size: 13px; color: #1d4ed8; line-height: 1.6; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0;
                  padding: 24px 32px; text-align: center; }
        .footer p { font-size: 12px; color: #94a3b8; line-height: 1.6; }
        .footer strong { color: #64748b; }
        @media (max-width: 480px) {
            .feature-grid { grid-template-columns: 1fr; }
            .body { padding: 28px 20px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">

        <div class="header">
            <h1>✦ SkillBay</h1>
            <p>Tu plataforma de servicios profesionales</p>
        </div>

        <div class="body">
            <p class="greeting">¡Hola, {{ $usuario->nombre }}! 👋</p>

            <p class="text">
                Tu cuenta en <strong>SkillBay</strong> ha sido creada exitosamente.
                Estamos felices de tenerte en nuestra comunidad de profesionales y clientes.
            </p>

            <div class="feature-grid">
                <div class="feature">
                    <div class="feature-icon">🔍</div>
                    <div class="feature-title">Encuentra Servicios</div>
                    <div class="feature-desc">Explora cientos de profesionales verificados</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <div class="feature-title">Publica tus Skills</div>
                    <div class="feature-desc">Llega a clientes que necesitan tu talento</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔒</div>
                    <div class="feature-title">Pagos Seguros</div>
                    <div class="feature-desc">Transacciones protegidas con MercadoPago</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">⭐</div>
                    <div class="feature-title">Sistema de Reseñas</div>
                    <div class="feature-desc">Construye tu reputación con cada proyecto</div>
                </div>
            </div>

            <div class="cta-container">
                <a href="{{ config('app.url') }}" class="cta-button">
                    Ir a mi cuenta →
                </a>
            </div>

            <div class="divider"></div>

            <div class="info-box">
                <p>
                    <strong>📧 Tu correo registrado:</strong> {{ $usuario->id_CorreoUsuario }}<br>
                    <strong>📅 Fecha de registro:</strong> {{ now()->format('d/m/Y') }}<br>
                    <strong>🏙️ Ciudad:</strong> {{ $usuario->ciudad ?: 'No especificada' }}
                </p>
            </div>
        </div>

        <div class="footer">
            <p>
                <strong>SkillBay</strong> — Plataforma de servicios profesionales<br>
                Este correo fue enviado a {{ $usuario->id_CorreoUsuario }} porque
                te registraste en nuestra plataforma.<br>
                Si no fuiste tú, ignora este mensaje.
            </p>
        </div>

    </div>
</body>
</html>
