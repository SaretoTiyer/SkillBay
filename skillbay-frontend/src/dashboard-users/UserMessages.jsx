import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import { Loader2, Send, User, FileText, MessageSquare } from "lucide-react";

export default function UserMessages() {
  const [conversaciones, setConversaciones] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    fetchConversaciones();
  }, []);

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  const fetchConversaciones = async () => {
    try {
      const res = await fetch(`${API_URL}/mensajes/conversaciones`, { headers: headers() });
      const data = await res.json();
      setConversaciones(Array.isArray(data?.conversaciones) ? data.conversaciones : []);
    } catch (error) {
      console.error("Error loading conversaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (postulacion) => {
    setSelected(postulacion);
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_URL}/postulaciones/${postulacion.id}/mensajes`, {
        headers: headers(),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.mensajes || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!selected || !text.trim()) return;
    try {
      const res = await fetch(`${API_URL}/postulaciones/${selected.id}/mensajes`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ mensaje: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo enviar.");
      setText("");
      openChat(selected);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const openPublicProfile = (idCorreo) => {
    if (!idCorreo) return;
    localStorage.setItem("profile_target_user", idCorreo);
    localStorage.setItem("currentView", "public_profile");
    window.location.reload();
  };

  const getOtherUser = (postulacion) => {
    const isPostulant = postulacion.id_Usuario === currentUser.id_CorreoUsuario;
    if (isPostulant) {
      return {
        name: postulacion.servicio?.cliente_usuario?.nombre || postulacion.servicio?.id_Cliente,
        isClient: true
      };
    }
    return {
      name: postulacion.usuario?.nombre ? `${postulacion.usuario.nombre} ${postulacion.usuario.apellido}` : postulacion.id_Usuario,
      isClient: false
    };
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendiente: "Pendiente",
      aceptada: "Aceptada",
      en_progreso: "En Progreso",
      completada: "Completada",
      rechazada: "Rechazada",
      cancelada: "Cancelada"
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: "bg-amber-100 text-amber-700",
      aceptada: "bg-emerald-100 text-emerald-700",
      en_progreso: "bg-blue-100 text-blue-700",
      completada: "bg-purple-100 text-purple-700",
      rechazada: "bg-red-100 text-red-700",
      cancelada: "bg-slate-100 text-slate-700"
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mensajes</h1>
        <p className="text-slate-500">Comunícate con los clientes y postulantes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de conversaciones */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquare size={18} />
            Conversaciones
          </h2>
          
          {conversaciones.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No tienes conversaciones aún.
            </p>
          ) : (
            <div className="space-y-2">
              {conversaciones.map((app) => {
                const otherUser = getOtherUser(app);
                return (
                  <button
                    key={app.id}
                    onClick={() => openChat(app)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selected?.id === app.id 
                        ? "bg-blue-50 border border-blue-200" 
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-slate-700 truncate">
                        {app.servicio?.titulo || `Postulación #${app.id}`}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(app.estado)}`}>
                        {getStatusLabel(app.estado)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {otherUser.isClient ? "Cliente: " : "Postulante: "} {otherUser.name}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Área de mensajes */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 flex flex-col min-h-[500px]">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Selecciona una conversación</p>
              <p className="text-sm">Elige una postulación para ver los mensajes</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h3 className="font-semibold text-slate-800">
                  {selected.servicio?.titulo || `Postulación #${selected.id}`}
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => openPublicProfile(
                      selected.id_Usuario === currentUser.id_CorreoUsuario 
                        ? selected.servicio?.id_Cliente 
                        : selected.id_Usuario
                    )}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <User size={14} />
                    Ver perfil del usuario
                  </button>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selected.estado)}`}>
                    {getStatusLabel(selected.estado)}
                  </span>
                </div>
                
                {/* Mostrar mensaje de motivación del postulante si es el cliente */}
                {selected.mensaje && selected.id_Usuario !== currentUser.id_CorreoUsuario && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-1">
                      <FileText size={12} />
                      Mensaje de presentación del postulante:
                    </p>
                    <p className="text-sm text-slate-700 italic">"{selected.mensaje}"</p>
                  </div>
                )}
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {loadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-blue-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No hay mensajes aún. ¡Inicia la conversación!
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isOwnMessage = msg.id_Emisor === currentUser.id_CorreoUsuario;
                    return (
                      <div 
                        key={msg.id_Mensaje} 
                        className={`p-3 rounded-lg ${
                          isOwnMessage 
                            ? "bg-blue-50 border border-blue-100 ml-8" 
                            : "bg-slate-50 border border-slate-100 mr-8"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-slate-600">
                            {msg.emisor?.nombre ? `${msg.emisor.nombre} ${msg.emisor.apellido || ""}` : msg.id_Emisor}
                          </p>
                          <span className="text-xs text-slate-400">
                            {new Date(msg.created_at).toLocaleString("es-CO")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{msg.mensaje}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              {selected.estado !== "rechazada" && selected.estado !== "cancelada" && (
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <input
                    className="flex-1 border border-slate-200 rounded-lg px-4 py-2"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Escribe un mensaje..."
                  />
                  <button 
                    onClick={sendMessage} 
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Send size={18} />
                    Enviar
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
