// src/pages/Perfil.jsx
import { useEffect, useMemo, useState } from "react";

export default function Perfil() {
    const [user, setUser] = useState(null);
    const [state, setState] = useState({ loading: false, error: "" });
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        correo: "",
        usuario: "",
        id_rol: "",
    });
    const [roles, setRoles] = useState([]);

    // Sidebar awareness (igual que tu versión)
    const SIDEBAR_EXPANDED = 256;
    const SIDEBAR_COLLAPSED = 64;
    const [sidebarOpen, setSidebarOpen] = useState(
        () => !document.documentElement.classList.contains("sidebar-collapsed")
    );
    useEffect(() => {
        const handler = (e) => setSidebarOpen(!!e.detail?.open);
        window.addEventListener("sidebar:toggle", handler);
        return () => window.removeEventListener("sidebar:toggle", handler);
    }, []);
    const contentMaxWidth = `min(900px, calc(100vw - ${sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED
        }px))`;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const isAdmin = useMemo(() => {
        const rolNombre =
            (user?.rol_nombre || user?.rol?.nombre || "").toString().toLowerCase();
        return !!(user?.is_superuser || rolNombre === "administrador");
    }, [user]);

    const fetchProfile = async () => {
        setState({ loading: true, error: "" });
        try {
            const res = await fetch(`http://127.0.0.1:8000/profile/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setUser(data);
            setForm({
                nombre: data.nombre || "",
                apellido: data.apellido || "",
                correo: data.correo || data.email || "",
                usuario: data.usuario || "",
                id_rol: data.id_rol || "",
            });
        } catch (e) {
            setState({
                loading: false,
                error: "No se pudo cargar el perfil. Revisa tu sesión/token.",
            });
            return;
        }
        setState({ loading: false, error: "" });
    };

    useEffect(() => {
        if (!token) {
            setState({ loading: false, error: "No autenticado." });
            return;
        }
        fetchProfile();
    }, []); // eslint-disable-line

    // Cargar roles solo si el usuario es admin y entra a modo edición
    const fetchRolesIfNeeded = async () => {
        if (!isAdmin) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/roles/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (res.ok) {
                const lista = await res.json();
                setRoles(lista);
            }
        } catch {
            /* opcional: mostrar error silencioso */
        }
    };

    const handleSave = async () => {
        const payload = {
            nombre: form.nombre,
            apellido: form.apellido,
            usuario: form.usuario,
            correo: form.correo,
        };
        if (isAdmin && form.id_rol) {
            payload.id_rol = form.id_rol;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/profile/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || `HTTP ${res.status}`);
            }
            const updated = await res.json();
            setUser(updated);
            setForm({
                nombre: updated.nombre || "",
                apellido: updated.apellido || "",
                correo: updated.correo || "",
                usuario: updated.usuario || "",
                id_rol: updated.id_rol || "",
            });
            setEditing(false);
        } catch (e) {
            alert("No se pudo guardar. " + (e.message || ""));
        }
    };

    if (state.loading) return <div className="p-6">Cargando perfil…</div>;
    if (state.error) return <div className="p-6 text-red-600">Error: {state.error}</div>;

    return (
        <div className="px-4 sm:px-6 py-4 mx-auto" style={{ maxWidth: contentMaxWidth }}>
            <h1 className="text-2xl font-semibold mb-4">Mi perfil</h1>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full dark:bg-neutral-400 dark:text-neutral-800 bg-[#11192E] text-white grid place-items-center font-semibold">
                        {(user?.nombre?.[0] || "U") + (user?.apellido?.[0] || "")}
                    </div>
                    <div className="min-w-0">
                        <div className="text-lg font-semibold truncate">
                            {user ? `${user.nombre} ${user.apellido}` : "Usuario"}
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                            {user?.correo || user?.email || "correo@dominio.com"}
                        </div>
                    </div>
                    <div className="ml-auto flex gap-2">
                        {!editing ? (
                            <button
                                onClick={() => {
                                    setEditing(true);
                                    fetchRolesIfNeeded();
                                }}
                                className="rounded-lg bg-[#11192E] text-white px-3 py-1.5 text-sm hover:brightness-110 dark:bg-white dark:text-[#11192E] dark:hover:bg-white/90 dark:ring-white/20"
                            >
                                Editar
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        // Restablecer formulario a datos actuales
                                        setForm({
                                            nombre: user?.nombre || "",
                                            apellido: user?.apellido || "",
                                            correo: user?.correo || user?.email || "",
                                            usuario: user?.usuario || "",
                                            id_rol: user?.id_rol || "",
                                        });
                                    }}
                                    className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-zinc-300 dark:ring-zinc-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="rounded-lg bg-[#11192E] text-white px-3 py-1.5 text-sm hover:brightness-110"
                                >
                                    Guardar
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Body */}
                {!editing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <p>
                            <span className="font-medium">Usuario:</span> {user?.usuario || "—"}
                        </p>
                        <p>
                            <span className="font-medium">Rol:</span>{" "}
                            {user?.rol_nombre || user?.rol?.nombre || user?.id_rol || "—"}
                        </p>
                        <p>
                            <span className="font-medium">Nombre:</span> {user?.nombre || "—"}
                        </p>
                        <p>
                            <span className="font-medium">Apellido:</span> {user?.apellido || "—"}
                        </p>
                        <p className="sm:col-span-2">
                            <span className="font-medium">Correo:</span>{" "}
                            {user?.correo || user?.email || "—"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="grid gap-1 text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Nombre</span>
                            <input
                                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            />
                        </label>
                        <label className="grid gap-1 text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Apellido</span>
                            <input
                                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2"
                                value={form.apellido}
                                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                            />
                        </label>
                        <label className="grid gap-1 text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Usuario</span>
                            <input
                                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2"
                                value={form.usuario}
                                onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                            />
                        </label>
                        <label className="grid gap-1 text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Correo</span>
                            <input
                                type="email"
                                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2"
                                value={form.correo}
                                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                            />
                        </label>

                        {/* Rol */}
                        <label className="grid gap-1 text-sm sm:col-span-2">
                            <span className="text-zinc-600 dark:text-zinc-400">Rol</span>

                            {isAdmin ? (
                                <select
                                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2"
                                    value={form.id_rol || ""}
                                    onChange={(e) => setForm({ ...form, id_rol: e.target.value })}
                                >
                                    <option value="" disabled>
                                        Selecciona un rol…
                                    </option>
                                    {roles.map((r) => (
                                        <option key={r.id_rol} value={r.id_rol}>
                                            {r.nombre} (ID {r.id_rol})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/40 dark:bg-zinc-900/40 px-3 py-2 opacity-70"
                                    value={user?.rol_nombre || user?.id_rol || ""}
                                    disabled
                                    readOnly
                                />
                            )}
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}
