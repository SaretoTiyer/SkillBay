import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { showConfirm, showError } from "../utils/swalHelpers";
import { API_URL } from "../config/api";
import {
  Loader2,
  Send,
  User,
  FileText,
  MessageSquare,
  XCircle,
  ChevronLeft,
  Search,
  Clock,
  CheckCheck,
} from "lucide-react";

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHr < 24) return `hace ${diffHr}h`;
  if (diffDay < 7) return `hace ${diffDay}d`;
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

function formatMessageTime(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function EmptyMessagesState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-24 h-24 bg-linear-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center mb-6 border border-blue-100">
        <MessageSquare size={40} className="text-blue-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Sin conversaciones</h3>
      <p className="text-gray-500 max-w-sm">
        Cuando te postules a una oportunidad o aceptes un postulante, podrás chatear aquí.
      </p>
    </div>
  );
}

function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
        <MessageSquare size={32} className="text-gray-300" />
      </div>
      <p className="text-gray-500 font-medium">Selecciona una conversación</p>
      <p className="text-sm text-gray-400 mt-1">Elige un chat para ver los mensajes</p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function UserMessages() {
  const [conversaciones, setConversaciones] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hiddenChats, setHiddenChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hidden_chats") || "[]"); } catch { return []; }
  });
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "{}");
    } catch {
      return {};
    }
  }, []);

  // ============================================
  // API HELPERS
  // ============================================

  const headers = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  }), []);

  // ============================================
  // FETCH CONVERSATIONS
  // ============================================

  const fetchConversaciones = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/mensajes/conversaciones`, { headers: headers() });
      const data = await res.json();
      const convs = Array.isArray(data?.conversaciones) ? data.conversaciones : [];
      setConversaciones(convs);
    } catch (error) {
      console.error("Error loading conversaciones:", error);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  // ============================================
  // POLLING FOR NEW MESSAGES
  // ============================================

  useEffect(() => {
    fetchConversaciones();
  }, [fetchConversaciones]);

  useEffect(() => {
    // Poll every 10 seconds for new messages in selected conversation
    if (!selected) return;

    pollIntervalRef.current = setInterval(() => {
      openChat(selected, true);
    }, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  // ============================================
  // SCROLL TO BOTTOM
  // ============================================

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ============================================
  // OPEN CHAT
  // ============================================

  const openChat = async (postulacion, isPolling = false) => {
    if (!isPolling) {
      setLoadingMessages(true);
    }
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
      if (!isPolling) {
        setLoadingMessages(false);
      }
    }
  };

  const handleSelectConversation = useCallback((postulacion) => {
    setSelected(postulacion);
    setShowMobileChat(true);
    openChat(postulacion);
  }, []);

  // ============================================
  // SEND MESSAGE
  // ============================================

  const sendMessage = async () => {
    if (!selected || !text.trim() || sending) return;
    const messageText = text.trim();
    setText("");
    setSending(true);

    try {
      const res = await fetch(`${API_URL}/postulaciones/${selected.id}/mensajes`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ mensaje: messageText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo enviar.");

      // Optimistic update + refetch
      if (data.success && data.mensaje) {
        setMessages(prev => [...prev, data.mensaje]);
      } else {
        openChat(selected);
      }
    } catch (error) {
      showError("Error", error.message);
      setText(messageText); // Restore text on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ============================================
  // TERMINATE CHAT
  // ============================================

  const terminarChat = async (postulacion) => {
    const result = await showConfirm(
      '¿Terminar chat?',
      'Esta acción ocultará la conversación de tu lista. No se pueden recuperar los mensajes ocultos.',
      'Sí, terminar'
    );
    if (result.isConfirmed) {
      const updated = [...hiddenChats, postulacion.id];
      setHiddenChats(updated);
      localStorage.setItem("hidden_chats", JSON.stringify(updated));
      setSelected(null);
      setMessages([]);
      setShowMobileChat(false);
    }
  };

  // ============================================
  // DERIVED DATA
  // ============================================

  const filteredConversaciones = useMemo(() => {
    const visible = conversaciones.filter(
      (c) => !hiddenChats.includes(c.id)
    );
    if (!searchTerm.trim()) return visible;
    const term = searchTerm.toLowerCase();
    return visible.filter((c) => {
      const title = (c.servicio?.titulo || "").toLowerCase();
      const otherUser = getOtherUser(c);
      const name = (otherUser.name || "").toLowerCase();
      return title.includes(term) || name.includes(term);
    });
  }, [conversaciones, hiddenChats, searchTerm]);

  const getOtherUser = useCallback((postulacion) => {
    const isPostulant = postulacion.id_Usuario === currentUser.id_CorreoUsuario;
    if (isPostulant) {
      return {
        name: postulacion.servicio?.cliente_usuario?.nombre || postulacion.servicio?.id_Dueno || "Cliente",
        isClient: true
      };
    }
    return {
      name: postulacion.usuario?.nombre
        ? `${postulacion.usuario.nombre} ${postulacion.usuario.apellido || ""}`.trim()
        : postulacion.id_Usuario || "Postulante",
      isClient: false
    };
  }, [currentUser.id_CorreoUsuario]);

  const getInitials = useCallback((name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }, []);

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

  const openPublicProfile = (idCorreo) => {
    if (!idCorreo) return;
    localStorage.setItem("profile_target_user", idCorreo);
    localStorage.setItem("currentView", "public_profile");
    window.location.reload();
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
        <p className="text-gray-500 mt-1">Comunícate con clientes y postulantes</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm" style={{ minHeight: "600px" }}>
        <div className="flex h-[600px]">
          {/* ============================================ */}
          {/* SIDEBAR — Lista de conversaciones */}
          {/* ============================================ */}
          <div className={`${
            showMobileChat ? "hidden md:flex" : "flex"
          } flex-col w-full md:w-80 lg:w-96 border-r border-gray-200 bg-gray-50/50`}>
            {/* Search */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar conversación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversaciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    {searchTerm ? "Sin resultados" : "No tienes conversaciones aún"}
                  </p>
                  {!searchTerm && (
                    <p className="text-xs text-gray-400 mt-1">
                      Postula a oportunidades o acepta postulantes para chatear
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversaciones.map((app) => {
                    const otherUser = getOtherUser(app);
                    const isSelected = selected?.id === app.id;
                    const lastMessage = app.ultimo_mensaje || app.mensaje;
                    const lastTime = app.ultimo_mensaje_at || app.updated_at || app.created_at;

                    return (
                      <button
                        key={app.id}
                        onClick={() => handleSelectConversation(app)}
                        className={`w-full text-left p-4 transition-all hover:bg-white ${
                          isSelected ? "bg-white border-l-4 border-l-blue-500 shadow-sm" : "border-l-4 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {getInitials(otherUser.name)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className="font-semibold text-sm text-gray-900 truncate">
                                {otherUser.name}
                              </p>
                              {lastTime && (
                                <span className="text-xs text-gray-400 ml-2 shrink-0">
                                  {formatRelativeTime(lastTime)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {app.servicio?.titulo || `Postulación #${app.id}`}
                            </p>
                            {lastMessage && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {lastMessage}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getStatusColor(app.estado)}`}>
                                {getStatusLabel(app.estado)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* CHAT AREA */}
          {/* ============================================ */}
          <div className={`${
            showMobileChat ? "flex" : "hidden md:flex"
          } flex-col flex-1 bg-white`}>
            {!selected ? (
              <EmptyChatState />
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
                  {/* Back button (mobile) */}
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(getOtherUser(selected).name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {getOtherUser(selected).name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {selected.servicio?.titulo || `Postulación #${selected.id}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(selected.estado)}`}>
                      {getStatusLabel(selected.estado)}
                    </span>
                    <button
                      onClick={() => openPublicProfile(
                        selected.id_Usuario === currentUser.id_CorreoUsuario
                          ? selected.servicio?.id_Dueno
                          : selected.id_Usuario
                      )}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                      title="Ver perfil del usuario"
                    >
                      <User size={16} />
                    </button>
                    <button
                      onClick={() => terminarChat(selected)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      title="Terminar chat"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>

                {/* Postulante message context */}
                {selected.mensaje && selected.id_Usuario !== currentUser.id_CorreoUsuario && (
                  <div className="px-4 py-3 bg-amber-50/50 border-b border-amber-100">
                    <div className="flex items-start gap-2">
                      <FileText size={14} className="text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-700">Mensaje de postulación:</p>
                        <p className="text-sm text-amber-800 italic mt-0.5">"{selected.mensaje}"</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/30"
                >
                  {loadingMessages ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-blue-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare size={36} className="text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500 font-medium">No hay mensajes aún</p>
                      <p className="text-xs text-gray-400 mt-1">¡Inicia la conversación!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwnMessage = msg.id_Emisor === currentUser.id_CorreoUsuario;
                      return (
                        <div
                          key={msg.id_Mensaje}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                              isOwnMessage
                                ? "bg-blue-600 text-white rounded-br-md"
                                : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.mensaje}
                            </p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwnMessage ? "text-blue-200" : "text-gray-400"
                            }`}>
                              <span className="text-[10px]">
                                {formatMessageTime(msg.created_at)}
                              </span>
                              {isOwnMessage && (
                                <CheckCheck size={12} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                {selected.estado !== "rechazada" && selected.estado !== "cancelada" ? (
                  <div className="px-4 py-3 border-t border-gray-200 bg-white">
                    <div className="flex items-end gap-2">
                      <textarea
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-28"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje..."
                        rows={1}
                        disabled={sending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!text.trim() || sending}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                      >
                        {sending ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                      Enter para enviar · Shift+Enter para nueva línea
                    </p>
                  </div>
                ) : (
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
                    <p className="text-sm text-gray-500">
                      No se pueden enviar mensajes en una conversación {getStatusLabel(selected.estado).toLowerCase()}.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
