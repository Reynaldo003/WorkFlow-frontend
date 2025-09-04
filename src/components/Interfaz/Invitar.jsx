import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";

export default function Invitar() {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [teams, setTeams] = useState([]);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                //const res = await fetch("http://127.0.0.1:8000/lista_equipos", {
                const res = await fetch("https://workflow-backend-production-991d.up.railway.app/lista_equipos/", {
                    headers: { Authorization: `Token ${token}` },
                });
                const data = await res.json();
                const equiposConTableros = await Promise.all(
                    data.equipos.map(async (eq) => {
                        const resTabs = await fetch(
                            //`http://127.0.0.1:8000/equipos/${eq.id_equipo}/tableros/`,
                            `https://workflow-backend-production-991d.up.railway.app/equipos/${eq.id_equipo}/tableros/`,
                            { headers: { Authorization: `Token ${token}` } }
                        );
                        const tabsData = await resTabs.json();
                        return { id: eq.id_equipo, name: eq.nombre_equipo, tableros: tabsData.tableros };
                    })
                );
                setTeams(equiposConTableros);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTeams();
    }, [token]);

    const enviarInvitacion = async () => {
        if (!email || !equipoSeleccionado) return alert("Selecciona un equipo e introduce un correo");
        try {
            const res = await fetch(
                //`http://127.0.0.1:8000/invitar/${equipoSeleccionado}`,
                `https://workflow-backend-production-991d.up.railway.app/invitar/${equipoSeleccionado}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
                    body: JSON.stringify({ email, nombre, apellido }),
                }
            );
            const json = await res.json();
            if (!res.ok) {
                console.error(json);
                return alert("Error: " + (json.message || JSON.stringify(json)));
            }
            alert("Invitación enviada correctamente");
            setEmail("");
            setNombre("");
            setApellido("");
            setEquipoSeleccionado("");
            setShowModal(false);
        } catch (err) {
            console.error(err);
            alert("Error al enviar la invitación");
        }
    };

    return (
        <>
            <button
                className="flex items-center gap-1.5 text-xs md:text-sm px-3 py-1.5 rounded-lg shadow-sm ring-1 ring-black/10
                   bg-[#11192E] text-white hover:brightness-110
                   dark:bg-white dark:text-[#11192E] dark:hover:bg-white/90 dark:ring-white/20"
                onClick={() => setShowModal(true)}
                title="Invitar usuario"
            >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Invitar</span>
            </button>

            {showModal && (
                <div className="mt-60 fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
                    <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl dark:bg-[#0F1A34]">
                        <h2 className="text-base font-bold mb-3 text-[#11192E] dark:text-white">Invitar usuario</h2>

                        <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">Equipo</label>
                        <select
                            value={equipoSeleccionado}
                            onChange={(e) => setEquipoSeleccionado(e.target.value)}
                            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70 dark:bg-[#0B1226] dark:text-white dark:border-white/10"
                        >
                            <option value="">Seleccione un equipo</option>
                            {teams.map((eq) => (
                                <option key={eq.id} value={eq.id}>
                                    {eq.name}
                                </option>
                            ))}
                        </select>

                        <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">Correo electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70 dark:bg-[#0B1226] dark:text-white dark:border-white/10"
                            placeholder="tucorreo@dominio.com"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">Nombre (opcional)</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70 dark:bg-[#0B1226] dark:text-white dark:border-white/10"
                                />
                            </div>
                            <div>
                                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">Apellido (opcional)</label>
                                <input
                                    type="text"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70 dark:bg-[#0B1226] dark:text-white dark:border-white/10"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={enviarInvitacion}
                                className="rounded-lg bg-[#11192E] px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110"
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
