import { useState, useEffect } from "react";
import { Briefcase, Send, Inbox } from "lucide-react";
import SentApplications from "./SentApplications";
import ReceivedApplications from "./ReceivedApplications";

export default function MyApplications({ defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || "sent");

  useEffect(() => {
    if (defaultTab === "received") {
      setActiveTab("received");
    } else {
      setActiveTab("sent");
    }
  }, [defaultTab]);

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-blue-200">
            <Briefcase className="text-white h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mis Solicitudes</h1>
            <p className="text-slate-500 font-medium">Gestiona tus solicitudes enviadas y recibidas</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full">
        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("sent")}
            className={`group px-6 py-3 font-medium text-sm transition-all relative flex items-center gap-2 ${
              activeTab === "sent"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Send size={18} className={`transition-transform duration-300 ${activeTab === "sent" ? "translate-x-0" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} />
            <span className={`transition-all duration-300 ${activeTab === "sent" ? "text-blue-600" : ""}`}>
              Enviadas
            </span>
            {activeTab === "sent" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-in slide-in-from-left-0" style={{ animationDuration: "200ms" }} />
            )}
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`group px-6 py-3 font-medium text-sm transition-all relative flex items-center gap-2 ${
              activeTab === "received"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Inbox size={18} className={`transition-transform duration-300 ${activeTab === "received" ? "translate-x-0" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} />
            <span className={`transition-all duration-300 ${activeTab === "received" ? "text-blue-600" : ""}`}>
              Recibidas
            </span>
            {activeTab === "received" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-in slide-in-from-left-0" style={{ animationDuration: "200ms" }} />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "sent" && <SentApplications />}
          {activeTab === "received" && <ReceivedApplications />}
        </div>
      </div>
    </div>
  );
}
