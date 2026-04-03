<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo mensaje de contacto - SkillBay</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">SkillBay</h1>
                            <p style="margin: 8px 0 0; color: #93c5fd; font-size: 14px;">Nuevo mensaje de contacto</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">Has recibido un nuevo mensaje a traves del formulario de contacto:</p>
                            
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <p style="margin: 0 0 16px;">
                                            <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Nombre</strong><br>
                                            <span style="color: #111827; font-size: 16px;">{{ $name }}</span>
                                        </p>
                                        <p style="margin: 0 0 16px;">
                                            <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Correo electronico</strong><br>
                                            <span style="color: #111827; font-size: 16px;">{{ $email }}</span>
                                        </p>
                                        <p style="margin: 0 0 16px;">
                                            <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Asunto</strong><br>
                                            <span style="color: #111827; font-size: 16px;">{{ $subject }}</span>
                                        </p>
                                        <p style="margin: 0;">
                                            <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Mensaje</strong><br>
                                            <span style="color: #111827; font-size: 16px; line-height: 1.6;">{{ $messageBody }}</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px;">
                                Puedes responder directamente a este correo para contactar a <strong>{{ $name }}</strong> en <a href="mailto:{{ $email }}" style="color: #2563eb; text-decoration: none;">{{ $email }}</a>.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">Este mensaje fue enviado desde el formulario de contacto de SkillBay.</p>
                            <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">SkillBay &copy; {{ date('Y') }} - Todos los derechos reservados.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
