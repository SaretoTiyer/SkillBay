import React from 'react';
import {
  ShieldCheck,
  UserPlus,
  Zap,
  CreditCard,
  Lock,
  AlertTriangle,
  Ban,
  Scale,
  ArrowLeft,
  Home
} from 'lucide-react';

const TermsAndConditions = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-[#1E3A5F] text-white border-b border-[#2B6CB0]/40" role="navigation" aria-label="Navegación de términos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate ? onNavigate("home") : window.history.back()}
              className="flex items-center gap-2 text-[#A0AEC0] hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg px-3 py-2 -ml-2"
              aria-label="Volver al inicio"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Volver</span>
            </button>
            <button
              onClick={() => onNavigate ? onNavigate("home") : window.location.href = "/"}
              className="flex items-center gap-2 text-[#A0AEC0] hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg px-3 py-2 -mr-2"
              aria-label="Ir al inicio de SkillBay"
            >
              <Home size={18} />
              <span className="font-medium">Inicio</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center">
            Términos y Condiciones
          </h1>
          <p className="mt-2 text-center text-gray-200">
            Última actualización: Marzo 2026
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Aceptación de los Términos */}
        <section className="mb-12">
          <div className="flex items-start space-x-4 mb-6">
            <ShieldCheck className="mt-2.5 h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-2">
                1. Aceptación de los Términos
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Al acceder y utilizar la plataforma SkillBay, usted acepta quedar
                vinculado por estos Términos y Condiciones, así como por nuestra
                Política de Privacidad. Si no está de acuerdo con alguno de estos
                términos, por favor no utilice nuestra plataforma.
              </p>
            </div>
          </div>
        </section>

        {/* Registro y Cuentas de Usuario */}
        <section className="mb-12">
          <div className="flex items-start space-x-4 mb-6">
            <UserPlus className="mt-2.5 h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-2">
                2. Registro y Cuentas de Usuario
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Para utilizar ciertos servicios de SkillBay, debe registrarse
                  creando una cuenta de usuario. Al registrarse, declara que:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-5 text-gray-700">
                  <li>Tiene al menos 18 años de edad;</li>
                  <li>La información proporcionada es verdadera, precisa, actual y completa;</li>
                  <li>Mantendrá y actualizará sus datos para que sean veraces y completos;</li>
                  <li>Es responsable de mantener la confidencialidad de su contraseña;</li>
                  <li>Acepta responsabilidad por todas las actividades que ocurran bajo su cuenta.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  SkillBay se reserva el derecho de rechazar o cancelar registros que
                  viole estos términos o que considere inapropiados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Uso de la Plataforma */}
        <section className="mb-12">
          <div className="flex items-start space-x-4 mb-6">
            <Zap className="mt-2.5 h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-2">
                3. Uso de la Plataforma
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Al utilizar SkillBay, usted acepta:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-5 text-gray-700">
                  <li>Utilizar la plataforma únicamente para fines legales;</li>
                  <li>No transmitir ningún contenido ilegal, amenazante, difamatorio, obsceno o que viole derechos de propiedad intelectual;</li>
                  <li>No interferir con la seguridad de la plataforma o intentar acceder no autorizado a cuentas de otros usuarios;</li>
                  <li>No recolectar información de otros usuarios sin su consentimiento expreso;</li>
                  <li>Cumplir con todas las leyes y regulaciones aplicables en Colombia.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  SkillBay actúa como intermediario y no garantiza la calidad, seguridad o legalidad de los servicios ofrecidos por terceros.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Servicios y Pagos */}
        <section className="mb-12">
          <div className="flex items-start space-x-4 mb-6">
            <CreditCard className="mt-2.5 h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-2">
                4. Servicios y Pagos
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  SkillBay facilita la conexión entre usuarios que buscan servicios y profesionales que los ofrecidos. Los pagos se procesan a través de
                  nuestra pasarela de pago simulada integrada en la plataforma.
                </p>
                <ul className="list-disc list-inside space-y-2 pl-5 text-gray-700">
                  <li>Los precios de los servicios son establecidos directamente por los profesionales;</li>
                  <li>SkillBay cobra una comisión por plataforma que se indica claramente antes de confirmar cualquier pago;</li>
                  <li>Los pagos se procesan de forma segura a través de la pasarela de pago integrada de SkillBay;</li>
                  <li>SkillBay gestiona los fondos de manera segura hasta completar la transacción entre las partes;</li>
                  <li>Las disputas relacionadas con pagos deben resolverse directamente entre las partes, aunque SkillBay puede ofrecer mediación.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Privacidad y Datos Personales */}
        <section className="mb-12">
          <div className="flex items-start space-x-4 mb-6">
            <Lock className="mt-2.5 h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-2">
                5. Privacidad y Datos Personales
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  La protección de sus datos personales es importante para nosotros.
                  Nuestra plataforma cumple con la Ley 1581 de 2012 (Estatuto
                  de Protección de Datos Personales) y sus decretos reglamentarios
                  en Colombia.
                </p>
                <ul className="list-disc list-inside space-y-2 pl-5 text-gray-700">
                  <li>Recopilamos únicamente los datos necesarios para proporcionar nuestros servicios;</li>
                  <li>Sus datos personales no serán vendidos, alquilados ni compartidos con terceros para fines de marketing sin su consentimiento;</li>
                  <li>Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger sus datos;</li>
                  <li>Tiene derecho a acceder, rectificar, actualizar y suprimir sus datos personales;</li>
                  <li>Consulte nuestra Política de Privacidad para obtener información detallada sobre el manejo de sus datos.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Limitación de Responsabilidad */}
        <section className="mb-12">
          <div className="flex items-start space-x-4 mb-6">
            <AlertTriangle className="mt-2.5 h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-2">
                6. Limitación de Responsabilidad
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  En la máxima medida permitida por la ley aplicable:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-5 text-gray-700">
                  <li>SkillBay no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos;</li>
                  <li>No garantizamos que la plataforma estará libre de interrupciones o errores;</li>
                  <li>No somos responsables por el contenido publicado por usuarios o por las transacciones realizadas entre ellos;</li>
                  <li>Nuestra responsabilidad total por cualquier reclamación no excederá el monto pagado por usted a SkillBay en los últimos tres meses.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Los profesionales son totalmente responsables por la calidad, seguridad y legalidad de los servicios que ofrecen a través de nuestra plataforma.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Suspensión y Cancelación */}
        <section className="mb-12">
          <div className="flex items-start space-x-4 mb-6">
            <Ban className="mt-2.5 h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-2">
                7. Suspensión y Cancelación
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  SkillBay se reserva el derecho, a su entera discreción, de:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-5 text-gray-700">
                  <li>Suspender o terminar temporalmente su acceso a la plataforma;</li>
                  <li>Cancelar permanentemente su cuenta y eliminar sus datos;</li>
                  <li>Eliminar o bloquear cualquier contenido que considere inapropiado;</li>
                  <li>Tomar estas acciones sin previo aviso por violación de estos términos.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Las causas para suspensión o cancelación incluyen, pero no se limitan a: actividades fraudulentas, violación de propiedad intelectual,
                  acoso, comportamiento abusivo o cualquier actividad ilegal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ley Aplicable */}
        <section className="mb-12">
          <div className="flex items-start space-x-4 mb-6">
            <Scale className="mt-2.5 h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-2">
                8. Ley Aplicable y Jurisdicción
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Estos Términos y Condiciones se regirán e interpretarán de acuerdo
                  con las leyes de la República de Colombia, sin tener en cuenta sus
                  principios de conflicto de leyes.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Cualquier disputa, controversia o reclamo derivado de o relacionado
                  con estos términos será sometido a la jurisdicción exclusiva de los
                  tribunales competentes de Bogotá, D.C., Colombia.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Si alguna disposición de estos términos se considera inválida o
                  inaplicable, dicha disposición se eliminará y las disposiciones
                  restantes continuarán en pleno vigor y efecto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-12 bg-gray-50 p-8 rounded-xl">
          <h2 className="text-xl font-semibold text-[#1E3A5F] mb-4">
            Contáctenos
          </h2>
          <p className="text-gray-700">
            Si tiene preguntas sobre estos Términos y Condiciones, por favor
            contáctenos a través de:
          </p>
          <ul className="list-disc list-inside mt-4 pl-5 text-gray-700">
            <li>Correo electrónico: terminos@skillbay.com.co</li>
            <li>Dirección: Calle 123 #45-67, Bogotá, D.C., Colombia</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; 2026 SkillBay. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => onNavigate ? onNavigate("home") : window.history.back()}
                className="text-[#2B6CB0] hover:text-[#1E3A5F] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B6CB0] rounded px-2 py-1"
              >
                ← Volver
              </button>
              <a href="/privacidad" className="text-[#2B6CB0] hover:text-[#1E3A5F] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B6CB0] rounded px-2 py-1">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;