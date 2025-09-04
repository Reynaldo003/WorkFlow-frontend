import { useState, useEffect } from "react";
import { ChevronDown, Users, Folder, FolderPlus, LayoutDashboard, FileText, FileSpreadsheet } from "lucide-react";
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
            //const res = await fetch(`http://127.0.0.1:8000/lista_equipos/`, {
            const res = await fetch(`https://workflow-backend-production-991d.up.railway.app/lista_equipos/`, {
                headers: { Authorization: `Token ${token}` },
            });
            const data = await res.json();

            const equiposConArchivos = await Promise.all(
                data.equipos.map(async (eq) => {
                    //const archivosRes = await fetch(`http://127.0.0.1:8000/equipos/${eq.id_equipo}/tableros/`, {
                    const archivosRes = await fetch(`https://workflow-backend-production-991d.up.railway.app/equipos/${eq.id_equipo}/tableros/`, {
                        headers: { Authorization: `Token ${token}` },
                    });
                    const archivosData = await archivosRes.json();
                    return {
                        id: eq.id_equipo,
                        name: eq.nombre_equipo,
                        archivos: archivosData.archivos || [],
                    };
                })
            );
            setTeams(equiposConArchivos);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const crearArchivo = async (tipo, idEquipo) => {
        const titulo = prompt(`Título del ${tipo}:`) || `Nuevo ${tipo}`;
        const token = localStorage.getItem("token");
        //const res = await fetch(`http://127.0.0.1:8000/archivo/`, {
        const res = await fetch(`https://workflow-backend-production-991d.up.railway.app/archivo/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
            body: JSON.stringify({ tipo, titulo, id_equipo: idEquipo }),
        });
        if (!res.ok) return alert("Error al crear");
        const data = await res.json(); // {id_archivo, tipo, estructura}
        await fetchTeams();
        window.location.href = `/${data.tipo}/${data.id_archivo}`;
    };

    const toggleArchivos = (id) => {
        setSelectedTeamId((prev) => (prev === id ? null : id));
    };

    const crearEquipo = async () => {
        if (!newTeamName.trim()) return;
        try {
            const token = localStorage.getItem("token");
            //const res = await fetch("http://127.0.0.1:8000/cequipo/", {
            const res = await fetch("https://workflow-backend-production-991d.up.railway.app/cequipo/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify({
                    nombre_equipo: newTeamName.trim(),
                    descripcion: "Creado desde el frontend",
                }),
            });
            if (!res.ok) throw new Error("Error al crear equipo");
            await fetchTeams();
            setNewTeamName("");
            setShowInput(false);
        } catch (err) {
            console.error("Error al crear equipo:", err);
        }
    };

    return (
        <div className="text-white">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full px-2 py-1.5 hover:bg-white/10 rounded transition"
            >
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {open && <span className="text-[12px] font-semibold">Equipos de trabajo</span>}
                </div>
                {open && <ChevronDown className={`h-4 w-4 transform transition-transform ${expanded ? "rotate-180" : ""}`} />}
            </button>

            {expanded && open && (
                <ul className="mt-1.5 space-y-0.5">
                    {teams.map((team) => (
                        <li key={team.id}>
                            <div className="flex items-center justify-between px-3 py-1.5 hover:bg-white/10 rounded cursor-pointer group">
                                <div onClick={() => toggleArchivos(team.id)} className="flex items-center gap-2 min-w-0">
                                    <Folder className="text-blue-400 h-4 w-4 shrink-0" />
                                    {editingId === team.id ? (
                                        <input
                                            autoFocus
                                            value={team.name}
                                            onChange={(e) =>
                                                setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, name: e.target.value } : t)))
                                            }
                                            onBlur={() => setEditingId(null)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === "Escape") setEditingId(null);
                                            }}
                                            className="bg-transparent border-b border-blue-300 outline-none text-white text-[12px] w-full"
                                        />
                                    ) : (
                                        <span
                                            onDoubleClick={() => setEditingId(team.id)}
                                            className="text-[12px] truncate"
                                            title={team.name}
                                        >
                                            {team.name}
                                        </span>
                                    )}
                                </div>

                                <OpcionesArchivo
                                    onAdd={(tipo) => crearArchivo(tipo, team.id)}
                                />
                            </div>

                            {selectedTeamId === team.id && team.archivos && (
                                <ul className="ml-8 mt-0.5 space-y-0.5 text-white/85">
                                    {team.archivos.map((arc) => (
                                        <li key={arc.id_archivo} className="flex items-center gap-1.5">
                                            {arc.tipo === 'word'
                                                ? <FileText className="text-indigo-400 h-3.5 w-3.5" />
                                                : arc.tipo === 'excel'
                                                    ? <FileSpreadsheet className="text-green-400 h-3.5 w-3.5" />
                                                    : <LayoutDashboard className="text-orange-400 h-3.5 w-3.5" />
                                            }
                                            <NavLink to={`/${arc.tipo}/${arc.id_archivo}`} className="text-[12px] hover:underline truncate">
                                                {arc.titulo}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}

                    <li className="px-3 py-1.5 text-[12px] text-blue-300 hover:text-white cursor-pointer">
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
                                placeholder="Nombre del equipo"
                                className="bg-transparent border-b border-blue-300 outline-none text-white text-[12px] w-full"
                            />
                        ) : (
                            <span onClick={() => setShowInput(true)} className="flex items-center gap-1.5">
                                <FolderPlus className="h-4 w-4" />
                                Crear nuevo equipo
                            </span>
                        )}
                    </li>
                </ul>
            )}
        </div>
    );
}
