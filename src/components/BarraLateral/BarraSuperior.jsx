import { useEffect, useState } from "react";
import { Search, Activity, BookCheck } from "lucide-react";
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

    useEffect(() => {
        const handler = (e) => setCompact(!e.detail.open);
        window.addEventListener("sidebar:toggle", handler);
        // estado inicial si la clase ya está en <html>
        if (document.documentElement.classList.contains("sidebar-collapsed")) {
            setCompact(true);
        }
        return () => window.removeEventListener("sidebar:toggle", handler);
    }, []);

    return (
        <header className="flex items-center justify-between px-3 md:px-4 py-2 bg-white dark:bg-[#11192E] dark:text-white shadow border-b border-gray-200 dark:border-white/10">
            {/* Buscador */}
            <div className="p-2">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                        <Search className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar…"
                        className={`pl-8 pr-3 h-8 rounded outline-none border border-gray-300 dark:border-white/10
              bg-white dark:bg-[#243447] text-slate-950 dark:text-white
              ${compact ? "w-40 md:w-64" : "w-56 md:w-96"}`}
                    />
                </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 md:gap-3">
                <Modos darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="hidden sm:flex">
                    <Calendario />
                </div>
                <div className="hidden md:flex">
                    <BookCheck className="h-5 w-5" />
                </div>
                <Invitar />
                <Notificationes />
                <Activity className="h-5 w-5 text-blue-500 dark:text-blue-400" title="Actualizaciones en tiempo real" />
                <div className="hidden lg:flex items-center gap-1.5">
                    {["Oswaldo", "Luis", "Jonathan"].map((nombre) => (
                        <Conectados key={nombre} name={nombre} />
                    ))}
                </div>
                <Avatar name="Rey" />
            </div>
        </header>
    );
}
