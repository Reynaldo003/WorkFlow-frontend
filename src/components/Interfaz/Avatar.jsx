import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

function getInitials({ nombre, apellido, name, email }) {
    // Construye tokens a partir de nombre+apellido; si no hay, usa name
    const tokens = [];
    if (typeof nombre === "string" && nombre.trim()) {
        tokens.push(...nombre.trim().split(/\s+/));
    }
    if (typeof apellido === "string" && apellido.trim()) {
        tokens.push(...apellido.trim().split(/\s+/));
    }
    if (!tokens.length && typeof name === "string" && name.trim()) {
        tokens.push(...name.trim().split(/\s+/));
    }

    // Toma las dos primeras iniciales disponibles
    const initials = tokens
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0])
        .join("");

    if (initials) return initials.toUpperCase();
    if (email && email[0]) return email[0].toUpperCase();
    return "U";
}

export default function Avatar({ email = "usuario@correo.com", nombre, apellido, name }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const go = (path) => {
        setOpen(false);
        navigate(path);
    };

    // Iniciales calculadas en memo (evita recomputar en cada render)
    const initials = useMemo(
        () => getInitials({ nombre, apellido, name, email }),
        [nombre, apellido, name, email]
    );

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

    // Opcional: cerrar con ESC
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
                title={nombre || name || email}
            >
                {initials}

            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white border border-gray-200 overflow-hidden z-50"
                >
                    <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                        <p className="text-sm text-gray-500">Conectado como</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{email}</p>
                    </div>
                    <ul className="py-2">
                        <li>
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
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
