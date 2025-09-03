import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Avatar({ email = "usuario@correo.com", name }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const go = (path) => {
        setOpen(false);
        navigate(path);
    };

    // Cierra el menú si se da clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);




    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
            >
                {name[0]}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white border border-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                        <p className="text-sm text-gray-500">Conectado como</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{email}</p>
                    </div>
                    <ul className="py-2">
                        <li>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                onClick={() => go("/Perfil")}
                            >
                                Mi perfil
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">
                                Equipos
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">
                                Configuración
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">
                                Papelera
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
