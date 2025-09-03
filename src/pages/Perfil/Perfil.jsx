import { useEffect, useState } from "react";

export default function Perfil() {
    const [user, setUser] = useState(null);
    const [state, setState] = useState({ loading: false, error: "" });
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", usuario: "", id_rol: "" });

    useEffect(() => {
        // Si ya traes el perfil desde tu API, rellena aquí:
        // setUser(data); setForm(mappedData);
    }, []);

    const handleSave = async () => {
        // Conecta aquí tu endpoint de actualización
        // await fetch(... PATCH/PUT ... body: form)
        alert("Guardado (demo). Conecta tu endpoint de actualización aquí.");
        setEditing(false);
        setUser((prev) => ({ ...(prev || {}), ...form }));
    };

    if (state.loading) return <div className="p-6">Cargando perfil…</div>;
    if (state.error) return <div className="p-6 text-red-600">Error: {state.error}</div>;

    // Sidebar awareness
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
    const contentMaxWidth = `min(900px, calc(100vw - ${(sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED)}px))`;

    return (
        <div className="px-4 sm:px-6 py-4 mx-auto" style={{ maxWidth: contentMaxWidth }}>
            <h1 className="text-2xl font-semibold mb-4">Mi perfil</h1>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-[#11192E] text-white grid place-items-center font-semibold">
                        {(user?.nombre?.[0] || "U") + (user?.apellido?.[0] || "")}
                    </div>
                    <div className="min-w-0">
                        <div className="text-lg font-semibold truncate">{user ? `${user.nombre} ${user.apellido}` : "Usuario"}</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">{user?.correo || user?.email || "correo@dominio.com"}</div>
                    </div>
                    <div className="ml-auto flex gap-2">
                        {!editing ? (
                            <button onClick={() => {
                                setEditing(true); setForm({
                                    nombre: user?.nombre || "", apellido: user?.apellido || "", correo: user?.correo || user?.email || "",
                                    usuario: user?.usuario || "", id_rol: user?.rol?.nombre || user?.id_rol || 2
                                })
                            }}
                                className="rounded-lg bg-[#11192E] text-white px-3 py-1.5 text-sm hover:brightness-110
                                dark:bg-white dark:text-[#11192E] dark:hover:bg-white/90 dark:ring-white/20">
                                Editar</button>
                        ) : (
                            <>
                                <button onClick={() => setEditing(false)} className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-zinc-300 dark:ring-zinc-700">Cancelar</button>
                                <button onClick={handleSave} className="rounded-lg bg-[#11192E] text-white px-3 py-1.5 text-sm hover:brightness-110">Guardar</button>
                            </>
                        )}
                    </div>
                </div>

                {/* Body */}
                {!editing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <p><span className="font-medium">Usuario:</span> {user?.usuario || "—"}</p>
                        <p><span className="font-medium">Rol:</span> {user?.rol?.nombre || user?.id_rol || "—"}</p>
                        <p><span className="font-medium">Nombre:</span> {user?.nombre || "—"}</p>
                        <p><span className="font-medium">Apellido:</span> {user?.apellido || "—"}</p>
                        <p className="sm:col-span-2"><span className="font-medium">Correo:</span> {user?.correo || user?.email || "—"}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="grid gap-1 text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Nombre</span>
                            <input className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2"
                                value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Apellido</span>
                            <input className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2"
                                value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Usuario</span>
                            <input className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2"
                                value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Correo</span>
                            <input className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2"
                                value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm sm:col-span-2">
                            <span className="text-zinc-600 dark:text-zinc-400">Rol</span>
                            <input className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2"
                                value={form.id_rol} onChange={(e) => setForm({ ...form, id_rol: e.target.value })} />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}
