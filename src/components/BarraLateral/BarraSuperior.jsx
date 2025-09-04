import { useEffect, useRef, useState } from "react";
import { Search, Activity, BookCheck, Plus } from "lucide-react";
import Avatar from "../Interfaz/Avatar";
import Notificationes from "../Interfaz/Notificaciones";
import Invitar from "../Interfaz/Invitar";
import Modos from "../Interfaz/Modos";
import Conectados from "../Interfaz/Conectados";
import Calendario from "../Interfaz/Calendario";
import { useDarkMode } from "../../context/DarkModeContext";

export default function BarraSuperior() {
    const { darkMode, setDarkMode } = useDarkMode();
    const [compact, setCompact] = useState(false);
    const [user, setUser] = useState(null);
    const [q, setQ] = useState("");
    const searchRef = useRef(null);

    // Sidebar compacta
    useEffect(() => {
        const handler = (e) => setCompact(!e.detail.open);
        window.addEventListener("sidebar:toggle", handler);
        if (document.documentElement.classList.contains("sidebar-collapsed")) setCompact(true);
        return () => window.removeEventListener("sidebar:toggle", handler);
    }, []);

    // Cargar perfil
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        //fetch(`http://127.0.0.1:8000/profile/`, { headers: { Authorization: `Token ${token}` } })
        fetch(`https://workflow-backend-production-991d.up.railway.app/profile/`, { headers: { Authorization: `Token ${token}` } })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((d) =>
                setUser({
                    nombre: d.nombre,
                    apellido: d.apellido,
                    correo: d.correo || d.email,
                })
            )
            .catch(() => { });
    }, []);

    // Atajos teclado
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "/" && document.activeElement !== searchRef.current) {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("command:open")); // integra tu paleta si la tienes
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    const widthClass = compact ? "w-40 md:w-64" : "w-56 md:w-96";

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between gap-2 px-3 md:px-4 py-2 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-[#1e2431] dark:text-white shadow-sm border-b border-gray-200/70 dark:border-white/10">
            {/* Buscador */}
            <div className="p-2 flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 dark:text-gray-300 pointer-events-none" />
                    <input
                        ref={searchRef}
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar…"
                        aria-label="Buscar en la aplicación"
                        className={`pl-8 pr-12 h-7 rounded-lg outline-none border border-gray-300 dark:border-white/10 bg-white dark:bg-[#243447] text-slate-950 dark:text-white ${widthClass} transition-[width] duration-200`}
                    />
                </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1.5 md:gap-2">
                <Modos darkMode={darkMode} setDarkMode={setDarkMode} />

                <div className="hidden sm:flex">
                    <Calendario />
                </div>

                <button
                    type="button"
                    className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/60"
                    aria-label="Tareas"
                    title="Tareas"
                >
                    <BookCheck className="h-5 w-5" />
                </button>

                <Invitar />
                <Notificationes />

                {/* Estado tiempo real */}
                <button
                    type="button"
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                    aria-label="Estado de conexión en tiempo real"
                    title="Actualizaciones en tiempo real"
                >
                    <Activity className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#11192E]" />
                </button>

                {/* Usuarios conectados */}
                <div className="hidden lg:flex items-center gap-1.5">
                    {["Oswaldo", "Luis", "Jonathan"].map((nombre) => (
                        <Conectados key={nombre} name={nombre} />
                    ))}
                </div>

                {/* Avatar con iniciales del perfil */}
                <Avatar
                    email={user?.correo || "usuario@correo.com"}
                    nombre={user?.nombre}
                    apellido={user?.apellido}
                    name={`${user?.nombre || ""} ${user?.apellido || ""}`.trim() || undefined}
                />
            </div>
        </header>
    );
}
