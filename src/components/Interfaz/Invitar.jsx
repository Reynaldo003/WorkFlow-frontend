import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";

export default function Invitar() {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [equipos, setEquipos] = useState([]);
    const [teams, setTeams] = useState([]);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
    const token = localStorage.getItem("token");

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

    useEffect(() => {
        fetchTeams();
    }, []);


    const enviarInvitacion = async () => {
        if (!email || !equipoSeleccionado) {
            return alert("Selecciona un equipo e introduce un correo");
        }
        try {
            const res = await fetch(
                `https://workflow-backend-production-991d.up.railway.app/invitar/${equipoSeleccionado}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`
                    },
                    body: JSON.stringify({ email, nombre, apellido })
                }
            );

            const json = await res.json();
            if (!res.ok) {
                console.error(json);
                return alert("Error: " + (json.message || JSON.stringify(json)));
            }
            alert("Invitacion enviada correctamente");
            setEmail("");
            setNombre("");
            setApellido("");
            setEquipoSeleccionado();
            setShowModal(false);

        } catch (err) {
            console.error(err);
            alert("Error al enviar la invitación");
        }
    };

    return (
        <>
            <button
                className="flex items-center gap-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => setShowModal(true)}
            >
                <UserPlus className="w-4 h-4" />
                Invitar
            </button>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Invitar usuario</h2>

                        <select
                            value={equipoSeleccionado}
                            onChange={(e) => setEquipoSeleccionado(e.target.value)}
                            className="border p-2 w-full mb-3 dark:bg-zinc-700 dark:text-white"
                        >
                            <option selected="selected">
                                Seleccione Un Equipo
                            </option>
                            {teams.map((eq) => (
                                <option key={eq.id} value={eq.id}>
                                    {eq.name}
                                </option>
                            ))}
                        </select>


                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border p-2 w-full mb-3 dark:bg-zinc-700 dark:text-white"
                        />
                        <input
                            type="text"
                            placeholder="Nombre (opcional)"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="border p-2 w-full mb-3 dark:bg-zinc-700 dark:text-white"
                        />
                        <input
                            type="text"
                            placeholder="Apellido (opcional)"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            className="border p-2 w-full mb-3 dark:bg-zinc-700 dark:text-white"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-3 py-1 border rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={enviarInvitacion}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
