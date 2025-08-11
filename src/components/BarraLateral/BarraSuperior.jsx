import { Search, Activity, BookCheck } from "lucide-react";
import Avatar from "../Interfaz/Avatar";
import Notificationes from "../Interfaz/Notificaciones";
import Invitar from "../Interfaz/Invitar";
import Modos from "../Interfaz/Modos";
import Conectados from "../Interfaz/Conectados";
import Calendario from "../Interfaz/Calendario";
import { Input } from "@material-tailwind/react";
import { useDarkMode } from "../../context/DarkModeContext";

export default function BarraSuperior() {
    const { darkMode, setDarkMode } = useDarkMode();

    return (
        <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-[#11192E] dark:text-white shadow border-b border-gray-200 dark:border-white/10">
            <div className="p-4">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                        <Search className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="pl-8 pr-4 h-7 w-96 bg-white dark:bg-[#243447] text-slate-950 dark:text-white rounded flex items-center outline-none border border-gray-300 dark:border-white/10"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Modos darkMode={darkMode} setDarkMode={setDarkMode} />
                <Calendario />
                <BookCheck />
                <Invitar />
                <Notificationes />
                <Activity className="h-6 w-6 text-blue-500 dark:text-blue-400" title="Actualizaciones en tiempo real" />
                <div className="flex items-center gap-2">
                    {["Oswaldo", "Luis", "Jonathan"].map((nombre) => (
                        <Conectados key={nombre} name={nombre} />
                    ))}
                </div>
                <Avatar name="Rey" />
            </div>
        </div>
    );
}
