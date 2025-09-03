import { useEffect, useMemo, useState } from "react";
import {
    Search, Clock, Play, Pause, Settings, AlertTriangle, CheckCircle2, XCircle,
    Plus, RefreshCw, Mail, FileText, Bell, Database, Link2, Trash2
} from "lucide-react";

const CATEGORIES = ["Todas", "Reportes", "Alertas", "Sincronización", "Limpieza", "Mensajería"];

const DEFAULT_AUTOMATIONS = [
    { id: "daily-report", name: "Reporte diario en PDF", short: "Genera y envía un PDF con KPIs a las 7:00", category: "Reportes", channel: "Email", status: "enabled", schedule: "Diario 07:00", nextRun: "mañana 07:00", lastRun: "hoy 07:01", icon: "report" },
    { id: "email-reminder", name: "Recordatorio diario por correo", short: "Tareas vencen hoy + próximos 3 días", category: "Mensajería", channel: "Email", status: "enabled", schedule: "Diario 08:30", nextRun: "mañana 08:30", lastRun: "hoy 08:30", icon: "email" },
    { id: "pbi-refresh", name: "Refresco de Power BI", short: "Refresca dataset ventas_regionales", category: "Sincronización", channel: "Power BI", status: "disabled", schedule: "Cada 6 h", nextRun: "—", lastRun: "ayer 18:10", icon: "sync" },
    { id: "anomaly-alert", name: "Alerta anomalías de gasto", short: "Detecta spikes > 40% en Ads y avisa", category: "Alertas", channel: "Slack", status: "enabled", schedule: "Continuo (cada 30 min)", nextRun: "en 26 min", lastRun: "hoy 10:02", icon: "bell" },
    { id: "cleanup-temp", name: "Limpieza de temporales", short: "Elimina archivos > 30 días", category: "Limpieza", channel: "Sistema", status: "enabled", schedule: "Semanal (domingo 02:00)", nextRun: "dom 02:00", lastRun: "dom pasado 02:01", icon: "trash" },
    { id: "sheet-mysql-sync", name: "Sync Sheets → MySQL", short: "Actualiza tabla leads desde Hoja ‘Prospectos’", category: "Sincronización", channel: "Google Sheets", status: "error", schedule: "Cada hora", nextRun: "—", lastRun: "hoy 09:00", errorMsg: "Rango inválido: ‘Prospectos!A:Z’", icon: "db" },
];

function StatusPill({ status }) {
    const map = {
        enabled: { text: "Activo", icon: <CheckCircle2 className="size-4" />, cls: "bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-600/20" },
        disabled: { text: "Pausado", icon: <Pause className="size-4" />, cls: "bg-zinc-500/10 text-zinc-500 ring-1 ring-zinc-500/20" },
        error: { text: "Error", icon: <XCircle className="size-4" />, cls: "bg-rose-600/10 text-rose-600 ring-1 ring-rose-600/20" },
    };
    const m = map[status] ?? map.disabled;
    return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${m.cls}`}>{m.icon}{m.text}</span>;
}

function Icon({ kind }) {
    const common = "size-6";
    switch (kind) {
        case "report": return <FileText className={common} />;
        case "email": return <Mail className={common} />;
        case "bell": return <Bell className={common} />;
        case "db": return <Database className={common} />;
        case "sync": return <Link2 className={common} />;
        case "trash": return <Trash2 className={common} />;
        default: return <RefreshCw className={common} />;
    }
}

function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 p-4 animate-pulse">
            <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-4 h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-2 h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-6 h-9 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
    );
}

function AutomationCard({ item, onToggle, onRunNow, onEdit }) {
    return (
        <div className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-4 shadow-sm hover:shadow-lg transition-shadow">
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#11192E]/8 via-transparent to-transparent" />

            <div className="absolute right-3 top-3">
                <StatusPill status={item.status} />
            </div>

            <div className="flex items-start gap-3">
                <div className="absolute left-3 top-3 text-[11px] rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-700">
                    {item.category}
                </div>

                <div className="shrink-0 rounded-xl mt-10 ring-1 ring-zinc-200 dark:ring-zinc-800 p-2 bg-white dark:bg-zinc-900">
                    <Icon kind={item.icon} />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate mt-10 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{item.short}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
                        <span className="inline-flex items-center gap-1"><Clock className="size-3" /> Próx.: {item.nextRun || "—"}</span>
                        <span>|</span>
                        <span>Última: {item.lastRun || "—"}</span>
                        <span>|</span>
                        <span>Canal: {item.channel}</span>
                    </div>
                </div>
            </div>

            {item.status === "error" && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-600/10 p-2 text-rose-700 dark:text-rose-300 ring-1 ring-rose-600/20">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span className="text-xs">{item.errorMsg || "Error al ejecutar esta automatización."}</span>
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    onClick={() => onRunNow(item)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-2 py-1 text-xs font-medium ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                    Ejecutar <Play className="size-4" />
                </button>

                <button
                    onClick={() => onToggle(item)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-2 py-1 text-xs font-medium
            ${item.status === "enabled"
                            ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                            : "bg-[#11192E] text-white hover:brightness-110"}`}
                >
                    {item.status === "enabled" ? <>Pausar <Pause className="size-4" /></> : <>Activar <Play className="size-4" /></>}
                </button>

                <button
                    onClick={() => onEdit(item)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-2 py-1 text-xs font-medium ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                    Editar <Settings className="size-4" />
                </button>
            </div>
        </div>
    );
}

function CreateAutomationModal({ open, onClose, onCreate }) {
    const [name, setName] = useState("");
    const [type, setType] = useState("Reportes");
    const [frequency, setFrequency] = useState("Diario 07:00");
    const [channel, setChannel] = useState("Email");
    const [action, setAction] = useState("Generar reporte");

    if (!open) return null;

    const submit = (e) => {
        e.preventDefault();
        const payload = {
            id: `${Date.now()}`,
            name,
            short: `${action} • ${channel}`,
            category: type,
            channel,
            status: "enabled",
            schedule: frequency,
            nextRun: "programado",
            lastRun: "—",
            icon: type === "Reportes" ? "report" : type === "Alertas" ? "bell" : type === "Sincronización" ? "sync" : type === "Limpieza" ? "trash" : "email",
        };
        onCreate(payload);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <form onSubmit={submit} className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 p-5 ring-1 ring-zinc-200 dark:ring-zinc-800">
                <h3 className="text-lg font-semibold mb-4">Crear automatización</h3>

                <div className="grid gap-3">
                    <label className="grid gap-1">
                        <span className="text-sm">Nombre</span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#11192E]/60"
                        />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="grid gap-1">
                            <span className="text-sm">Tipo</span>
                            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 text-sm">
                                <option>Reportes</option>
                                <option>Alertas</option>
                                <option>Sincronización</option>
                                <option>Limpieza</option>
                                <option>Mensajería</option>
                            </select>
                        </label>

                        <label className="grid gap-1">
                            <span className="text-sm">Frecuencia</span>
                            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 text-sm">
                                <option>Diario 07:00</option>
                                <option>Diario 08:30</option>
                                <option>Cada 30 min</option>
                                <option>Cada hora</option>
                                <option>Semanal (domingo 02:00)</option>
                                <option>Mensual (1° 06:00)</option>
                            </select>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="grid gap-1">
                            <span className="text-sm">Canal</span>
                            <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 text-sm">
                                <option>Email</option>
                                <option>Slack</option>
                                <option>WhatsApp</option>
                                <option>Archivo (PDF/CSV)</option>
                                <option>Webhook</option>
                            </select>
                        </label>

                        <label className="grid gap-1">
                            <span className="text-sm">Acción</span>
                            <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 text-sm">
                                <option>Generar reporte</option>
                                <option>Enviar recordatorio</option>
                                <option>Sincronizar datos</option>
                                <option>Limpiar recursos</option>
                                <option>Disparar webhook</option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-3 py-2 rounded-xl text-sm ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        Cancelar
                    </button>
                    <button type="submit" className="px-3 py-2 rounded-xl text-sm font-medium bg-[#11192E] text-white hover:brightness-110">
                        Crear
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Automatizaciones() {
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Todas");
    const [items, setItems] = useState(DEFAULT_AUTOMATIONS);
    const [openCreate, setOpenCreate] = useState(false);

    const SIDEBAR_EXPANDED = 256;
    const SIDEBAR_COLLAPSED = 64;
    const [sidebarOpen, setSidebarOpen] = useState(
        () => !document.documentElement.classList.contains("sidebar-collapsed")
    );
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 600);
        const handler = (e) => setSidebarOpen(!!e.detail?.open);
        window.addEventListener("sidebar:toggle", handler);
        return () => {
            clearTimeout(t);
            window.removeEventListener("sidebar:toggle", handler);
        };
    }, []);
    const contentMaxWidth = `min(1400px, calc(100vw - ${(sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED)}px))`;

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        return items.filter((i) => {
            const matchCat = category === "Todas" || i.category === category;
            const matchQ = !q || [i.name, i.short, i.category, i.channel].join(" ").toLowerCase().includes(q);
            return matchCat && matchQ;
        });
    }, [items, query, category]);

    const toggleItem = (it) =>
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: x.status === "enabled" ? "disabled" : "enabled" } : x)));
    const runNow = (it) => alert(`Ejecutando: ${it.name}`);
    const editItem = (it) => alert(`Editar: ${it.name}`);
    const onCreate = (newItem) => setItems((prev) => [newItem, ...prev]);

    return (
        <div className="px-4 sm:px-6 py-4 mx-auto" style={{ maxWidth: contentMaxWidth }}>
            <div className="mb-6 space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
                <div className="mr-5">
                    <h1 className="text-2xl font-semibold">Automatizaciones</h1>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Programa recordatorios, reportes, sincronizaciones y alertas para mantenerte al día.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <label className="relative grow basis-full sm:basis-80 lg:basis-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#11192E]/60"
                            placeholder="Buscar automatizaciones…"
                        />
                    </label>

                    <div className="order-3 w-full lg:order-none lg:w-auto overflow-x-auto scrollbar-thin -mx-1 px-1">
                        <div className="grid-cols-6 flex items-center gap-1 w-max">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 mr-2 py-2 rounded-xl text-xs sm:text-xs ring-1 transition whitespace-nowrap
                    ${category === cat
                                            ? "bg-[#11192E] text-white ring-[#11192E]"
                                            : "ring-zinc-300 dark:ring-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setOpenCreate(true)}
                        className="shrink-0 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium bg-[#11192E] text-white hover:brightness-110"
                    >
                        <Plus className="size-4" /> Crear automatización
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(item => (
                        <AutomationCard
                            key={item.id}
                            item={item}
                            onToggle={toggleItem}
                            onRunNow={runNow}
                            onEdit={editItem}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center">
                    <p className="text-zinc-600 dark:text-zinc-400">
                        No hay resultados para <span className="font-semibold">“{query || category}”</span>.
                    </p>
                    <p className="text-sm mt-1 text-zinc-500">Prueba limpiar filtros o busca otra automatización.</p>
                </div>
            )}

            <CreateAutomationModal open={openCreate} onClose={() => setOpenCreate(false)} onCreate={onCreate} />
        </div>
    );
}
