import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

export default function UserMessages() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_URL}/mensajes/conversaciones`, { headers: headers() });
      const data = await res.json();
      setApplications(Array.isArray(data?.conversaciones) ? data.conversaciones : []);
    } catch (error) {
      console.error("Error loading applications:", error);
    }
  };

  const openChat = async (application) => {
    setSelected(application);
    try {
      const res = await fetch(`${API_URL}/postulaciones/${application.id}/mensajes`, {
        headers: headers(),
      });
      const data = await res.json();
      setMessages(Array.isArray(data?.mensajes) ? data.mensajes : []);
    } catch (error) {
      console.error("Error loading messages:", error);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <aside className="bg-white rounded-xl border border-slate-200 p-3">
        <h2 className="font-semibold text-slate-800 mb-3">Chats por postulacion</h2>
        <div className="space-y-2">
          {applications.map((app) => (
            <button
              key={app.id}
              onClick={() => openChat(app)}
              className={`w-full text-left p-2 rounded ${
                selected?.id === app.id ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50"
              }`}
            >
              <p className="text-sm font-medium text-slate-700">{app.servicio?.titulo || `Postulacion #${app.id}`}</p>
              <p className="text-xs text-slate-500">Estado: {app.estado}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-3 flex flex-col min-h-[500px]">
        {!selected && <p className="text-sm text-slate-500">Selecciona una postulacion para ver los mensajes.</p>}
        {selected && (
          <>
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-3">
              Conversacion: {selected.servicio?.titulo || `Postulacion #${selected.id}`}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {messages.map((msg) => (
                <div key={msg.id_Mensaje} className="p-2 rounded bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500">
                    {msg.emisor?.nombre || msg.id_Emisor} - {new Date(msg.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-700">{msg.mensaje}</p>
                </div>
              ))}
              {messages.length === 0 && <p className="text-sm text-slate-500">Sin mensajes.</p>}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 border border-slate-200 rounded px-3 py-2"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe un mensaje..."
              />
              <button onClick={sendMessage} className="px-4 py-2 rounded bg-blue-600 text-white">
                Enviar
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
