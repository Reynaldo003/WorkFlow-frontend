import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, PlugZap, CheckCircle2, XCircle, RefreshCw, ExternalLink, Link2, ShieldCheck, AlertTriangle } from "lucide-react";
;

const Logos = {
    sheets: (props) => <img {...props} src="/gsheets.png" alt="Google Sheets" loading="lazy" />,
    pbi: (props) => <img {...props} src="/pbi.png" alt="Power BI" loading="lazy" />,
    drive: (props) => <img {...props} src="/drive.png" alt="Google Drive" loading="lazy" />,
    gcal: (props) => <img {...props} src="/calendar.png" alt="Google Calendar" loading="lazy" />,
    meta: (props) => <img {...props} src="/Meta.png" alt="Meta-Ads" loading="lazy" />,
};

const INTEGRATIONS = [
    {
        id: "sheets",
        name: "Sheets",
        short: "Sincroniza hojas y rangos",
        logo: "sheets",
        category: "Datos",
        status: "connected",
        lastSync: "hoy 09:12",
        connectPath: "/integrations/sheets",
    },
    {
        id: "pbi",
        name: "Power BI",
        short: "Publica dashboards",
        logo: "pbi",
        category: "BI",
        status: "disconnected",
        lastSync: null,
        connectPath: "/integrations/powerbi",
    },
    {
        id: "drive",
        name: "Drive",
        short: "Explora y vincula archivos",
        logo: "drive",
        category: "Archivos",
        status: "disconnected",
        lastSync: null,
        connectPath: "/integrations/drive",
    },
    {
        id: "gcal",
        name: "Calendar",
        short: "Agenda y sincroniza tareas",
        logo: "gcal",
        category: "Comunicación",
        status: "disconnected",
        lastSync: null,
        connectPath: "/integrations/google-calendar",
    },
    {
        id: "Meta",
        name: "Meta Ads",
        short: "Sincroniza Reportes de Anuncios",
        logo: "meta",
        category: "Datos",
        status: "error",
        lastSync: "ayer 09:12",
        connectPath: "/integrations/meta",
    },
];

const CATEGORIES = ["Todas", "Datos", "BI", "Archivos", "Comunicación"];

function StatusPill({ status }) {
    const map = {
        connected: { text: "Conectado", icon: <CheckCircle2 className="size-4" />, cls: "bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-600/20" },
        disconnected: { text: "Desconectado", icon: <PlugZap className="size-4" />, cls: "bg-zinc-500/10 text-zinc-500 ring-1 ring-zinc-500/20" },
        error: { text: "Error", icon: <XCircle className="size-4" />, cls: "bg-rose-600/10 text-rose-600 ring-1 ring-rose-600/20" },
    };
    const m = map[status] ?? map.disconnected;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${m.cls}`}>
            {m.icon}{m.text}
        </span>
    );
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

function IntegrationCard({ item, onConnect, onOpen }) {
    const Logo = Logos[item.logo];

    return (
        <div
            className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-4 shadow-sm hover:shadow-lg transition-shadow
                 overflow-hidden"
            role="region"
            aria-label={`${item.name} integración`}
        >
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-amber-500/10 via-transparent to-sky-500/10" />

            <div className="absolute right-3">
                <StatusPill status={item.status} />
            </div>
            <div className="flex items-start gap-3">

                <div className="absolute left-3 top-3 text-[11px] rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-700">
                    {item.category}
                </div>
                <div className="shrink-0 rounded-xl mt-10 ring-1 ring-zinc-200 dark:ring-zinc-800 p-2 bg-white dark:bg-zinc-900">
                    {Logo ? <Logo className="h-8 w-8 object-contain" /> : <PlugZap className="h-10 w-10" />}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm mt-10 font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{item.short}</p>
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        {item.lastSync ? <>Última sync: {item.lastSync}</> : <>Aún no sincronizado</>}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                {item.status === "connected" ? (
                    <button
                        onClick={() => onOpen(item)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-2 py-1 text-xs font-medium ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                        Abrir <ExternalLink className="size-4" />
                    </button>
                ) : (
                    <button
                        onClick={() => onConnect(item)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-2 py-1 text-xs font-medium bg-[#1e2431] text-white hover:bg-neutral-500 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                    >
                        Conectar <Link2 className="size-4" />
                    </button>
                )}
                <button
                    onClick={() => alert("Re-sync demo")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-2 py-1 text-sm font-medium ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                    Re-sync <RefreshCw className="size-4" />
                </button>
            </div>

            {item.status === "error" && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-600/10 p-2 text-rose-700 dark:text-rose-300 ring-1 ring-rose-600/20">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span className="text-xs">{item.errorMsg || "Hubo un problema con esta integración."}</span>
                </div>
            )}
        </div>
    );
}

export default function Integraciones() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Todas");
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState(INTEGRATIONS);
    const navigate = useNavigate();

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
            const matchQ = !q || [i.name, i.short, i.category].join(" ").toLowerCase().includes(q);
            return matchCat && matchQ;
        });
    }, [items, query, category]);

    const onConnect = (item) => navigate(item.connectPath);
    const onOpen = (item) => navigate(item.connectPath);

    return (
        <div className="px-4 sm:px-6 py-4 mx-auto" style={{ maxWidth: contentMaxWidth }}>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Integraciones</h1>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Conecta herramientas externas para optimizar tu trabajo.
                    </p>
                </div>

                <div className="flex gap-2">
                    {/* Búsqueda */}
                    <label className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Buscar integraciones…"
                        />
                    </label>

                    <div className="order-3 w-full lg:order-none lg:w-auto overflow-x-auto scrollbar-thin -mx-1 px-1">
                        <div className="flex items-center gap-1 w-max">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 py-2 rounded-xl text-xs sm:text-xs ring-1 transition whitespace-nowrap
                    ${category === cat
                                            ? "bg-[#11192E] text-white ring-[#11192E]"
                                            : "ring-zinc-300 dark:ring-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(item => (
                        <IntegrationCard
                            key={item.id}
                            item={item}
                            onConnect={onConnect}
                            onOpen={onOpen}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center">
                    <p className="text-zinc-600 dark:text-zinc-400">
                        No hay resultados para <span className="font-semibold">“{query || category}”</span>.
                    </p>
                    <p className="text-sm mt-1 text-zinc-500">Prueba limpiar filtros o busca otra integración.</p>
                </div>
            )}

            <div className="mt-4 flex gap-2 md:hidden">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-2 rounded-xl text-sm ring-1 transition
              ${category === cat
                                ? "bg-amber-500 text-black ring-amber-500"
                                : "ring-zinc-300 dark:ring-zinc-700"}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    ¿No ves tu herramienta? <button
                        onClick={() => alert("Abrir modal de solicitud")}
                        className="underline decoration-amber-500 decoration-2 underline-offset-4 hover:text-amber-600"
                    >
                        Solicita una integración
                    </button>
                </p>
            </div>
        </div>
    );
}
