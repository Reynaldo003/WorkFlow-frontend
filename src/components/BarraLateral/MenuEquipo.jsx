import { useState, useEffect } from "react";
import { ChevronDown, Users, Folder, FolderPlus, FileText, FileSpreadsheet, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";
import OpcionesArchivo from "./OpcionesArchivo";

export default function MenuEquipo({ open }) {
    const [expanded, setExpanded] = useState(true);
    const [teams, setTeams] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [newTeamName, setNewTeamName] = useState("");
    const [showInput, setShowInput] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);

    const fetchTeams = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://workflow-backend-production-991d.up.railway.app/lista_equipos/", {
                headers: { "Authorization": `Token ${token}` },
            });
            const data = await res.json();

            // Para cada equipo, traer sus tableros
            const equiposConTableros = await Promise.all(
                data.equipos.map(async (eq) => {
                    const resTabs = await fetch(`https://workflow-backend-production-991d.up.railway.app/equipos/${eq.id_equipo}/tableros/`, {
                        headers: { "Authorization": `Token ${token}` },
                    });
                    const tabsData = await resTabs.json();
                    return {
                        id: eq.id_equipo,
                        name: eq.nombre_equipo,
                        tableros: tabsData.tableros
                    };
                })
            );

            setTeams(equiposConTableros);
        } catch (err) {
            console.error(err);
        }
    };


    // 🔹 Llamar a fetchTeams al montar el componente
    useEffect(() => {
        fetchTeams();
    }, []);

    const agregarArchivo = (tipo, idEquipo) => {
        setTeams(prev =>
            prev.map(team =>
                team.id === idEquipo
                    ? {
                        ...team,
                        files: [
                            ...(team.files || []),
                            {
                                id: crypto.randomUUID(),
                                type: tipo,
                                name:
                                    tipo === "excel"
                                        ? "Nuevo Excel"
                                        : tipo === "word"
                                            ? "Nuevo Word"
                                            : "Nuevo Tablero"
                            }
                        ]
                    }
                    : team
            )
        );
    };

    const toggleArchivos = (id) => {
        setSelectedTeamId(prev => (prev === id ? null : id));
    };

    //Crear equipo y luego refrescar la lista
    const crearEquipo = async () => {
        if (!newTeamName.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://workflow-backend-production-991d.up.railway.app/cequipo/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify({
                    nombre_equipo: newTeamName.trim(),
                    descripcion: "Creado desde el frontend"
                }),
            });

            if (!res.ok) throw new Error("Error al crear equipo");

            // 🔹 Volvemos a llamar a la API para tener la lista actualizada
            await fetchTeams();
            setNewTeamName("");
            setShowInput(false);
        } catch (err) {
            console.error("Error al crear equipo:", err);
        }
    };
    const crearTablero = async (idEquipo) => {
        const titulo = prompt("Título del tablero:");
        if (!titulo) return;

        const descripcion = prompt("Descripción del tablero:") || "";

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://workflow-backend-production-991d.up.railway.app/tablero/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify({
                    titulo,
                    descripcion,
                    id_equipo: idEquipo,
                    id_plantilla: 1, // plantilla por defecto
                }),
            });

            if (!res.ok) throw new Error("Error al crear tablero");
            const data = await res.json();

            // Recargar lista para que aparezca sin recargar la página
            await fetchTeams();

            // Redirige al tablero recién creado
            window.location.href = `/tablero/${data.id_tablero}`;
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="text-white">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full px-2 py-2 hover:bg-white/10 rounded transition"
            >
                <div className="flex items-center gap-2">
                    <Users />
                    {open && <span className="text-sm font-semibold">Equipos de trabajo</span>}
                </div>
                {open && <ChevronDown className={`transform transition-transform ${expanded ? "rotate-180" : ""}`} />}
            </button>

            {expanded && open && (
                <ul className="mt-2 space-y-1">
                    {teams.map((team) => (
                        <li key={team.id}>
                            <div className="flex items-center justify-between px-4 py-2 hover:bg-white/10 rounded cursor-pointer group">
                                <div onClick={() => toggleArchivos(team.id)} className="flex items-center gap-2">
                                    <Folder className="text-blue-400" />
                                    {editingId === team.id ? (
                                        <input
                                            autoFocus
                                            value={team.name}
                                            onChange={(e) =>
                                                setTeams(prev =>
                                                    prev.map(t =>
                                                        t.id === team.id ? { ...t, name: e.target.value } : t
                                                    )
                                                )
                                            }
                                            onBlur={() => setEditingId(null)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") setEditingId(null);
                                                if (e.key === "Escape") setEditingId(null);
                                            }}
                                            className="bg-transparent border-b border-blue-300 outline-none text-white"
                                        />
                                    ) : (
                                        <span
                                            onDoubleClick={() => setEditingId(team.id)}
                                            className="text-sm"
                                        >
                                            {team.name}
                                        </span>
                                    )}
                                </div>

                                <OpcionesArchivo
                                    onAdd={(tipo) => {
                                        if (tipo === "tablero") {
                                            crearTablero(team.id); // 🔹 Llama al backend
                                        } else {
                                            agregarArchivo(tipo, team.id); // 🔹 Solo local (word/excel)
                                        }
                                    }}
                                />

                            </div>

                            {selectedTeamId === team.id && team.tableros && (
                                <ul className="ml-10 mt-1 space-y-1 text-sm text-white/80">
                                    {team.tableros.map((tab) => (
                                        <li key={tab.id_tablero} className="flex items-center gap-2">
                                            <LayoutDashboard className="text-orange-400" size={16} />
                                            <NavLink to={`/tablero/${tab.id_tablero}`}>
                                                {tab.titulo}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}

                        </li>
                    ))}
                    <li className="px-4 py-2 text-sm text-blue-300 hover:text-white cursor-pointer">
                        {showInput ? (
                            <input
                                autoFocus
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                onBlur={crearEquipo}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") crearEquipo();
                                    if (e.key === "Escape") setShowInput(false);
                                }}
                                placeholder="Nombre del grupo"
                                className="bg-transparent border-b border-blue-300 outline-none text-white"
                            />
                        ) : (
                            <span onClick={() => setShowInput(true)} className="flex items-center">
                                <FolderPlus className="mr-2" />
                                Crear nuevo grupo
                            </span>
                        )}
                    </li>
                </ul>
            )}
        </div>
    );
}
