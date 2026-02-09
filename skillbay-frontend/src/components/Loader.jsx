// src/components/Loader.jsx
export default function Loader({ text = 'Cargando...' }) {
return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl px-6 py-5 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600">{text}</p>
    </div>
    </div>
);
}
