import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard, FileSpreadsheet, FileText, Users, Plus, ChevronRight,
    CalendarClock, Zap, ShieldCheck, Activity, ExternalLink, Search,
    FolderKanban, TrendingUp, Clock3, Heart, Info,
    Clock, Play, Pause, Settings, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Mail, Bell, Database, Link2, Trash2
} from "lucide-react";

const RECENTS = {
    boards: [
        { id: "b1", name: "Marketing Q3", updatedAt: "hoy 09:40", owner: "Equipo Marketing" },
        { id: "b2", name: "Ventas Semanal", updatedAt: "ayer 18:12", owner: "Comercial" },
    ],
    sheets: [
        { id: "s1", name: "Prospectos", updatedAt: "hoy 10:05", owner: "CRM" },
        { id: "s2", name: "Gasto Ads", updatedAt: "ayer 21:02", owner: "Mkt Ops" },
    ],
    docs: [
        { id: "d1", name: "Minuta Sprint 12", updatedAt: "hoy 08:15", owner: "PMO" },
        { id: "d2", name: "Manual Onboarding", updatedAt: "lun 12:31", owner: "Operaciones" },
    ],
};

const TEAMS = [
    { id: "t1", name: "Marketing", members: 7, projects: 4, color: "bg-amber-500" },
    { id: "t2", name: "Comercial", members: 9, projects: 6, color: "bg-sky-500" },
    { id: "t3", name: "Operaciones", members: 5, projects: 3, color: "bg-emerald-500" },
];

const AUTOMATIONS_NEXT = [
    { id: "a1", name: "Reporte diario KPIs", when: "mañana 07:00", channel: "Email" },
    { id: "a2", name: "Sync Sheets → MySQL", when: "en 45 min", channel: "Sistema" },
    { id: "a3", name: "Alerta presupuesto Ads", when: "cada 30 min", channel: "Slack" },
];

const INTEGRATIONS_CONNECTED = [
    { id: "i1", name: "Google Sheets", short: "Hojas vinculadas", icon: <FileSpreadsheet className="size-4" /> },
    { id: "i2", name: "Power BI", short: "Datasets conectados", icon: <TrendingUp className="size-4" /> },
    { id: "i3", name: "WhatsApp Business", short: "Bots activos", icon: <Zap className="size-4" /> },
];

const ACTIVITY_FEED = [
    { id: "ac1", text: "Juan actualizó tablero Marketing Q3", time: "hace 12 min" },
    { id: "ac2", text: "Automatización ‘Sync Sheets → MySQL’ ejecutada", time: "hace 38 min" },
    { id: "ac3", text: "Se vinculó archivo ‘Prospectos.xlsx’", time: "hoy 09:10" },
];

function SectionHeader({ title, to, action = "Ver todo" }) {
    const navigate = useNavigate();
    return (
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            {to && (
                <button
                    onClick={() => navigate(to)}
                    className="inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                    {action} <ChevronRight className="size-4" />
                </button>
            )}
        </div>
    );
}

function Card({ children, className = "" }) {
    return (
        <div className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-2 ${className}`}>
            {children}
        </div>
    );
}

function StatCard({ icon, label, value, hint }) {
    return (
        <Card>
            <div className="flex items-center gap-3">
                <div className="rounded-xl p-1 ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-900">{icon}</div>
                <div className="min-w-0">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">{label}</div>
                    <div className="text-xl font-semibold">{value}</div>
                    {hint && <div className="text-xs text-zinc-500 mt-1">{hint}</div>}
                </div>
            </div>
        </Card>
    );
}

function ResourceList({ icon, items, emptyText, onOpen }) {
    return (
        <Card>
            <ul className="space-y-3">
                {items.length ? items.map((it) => (
                    <li key={it.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-1 min-w-0">
                            <span className="rounded-lg p-.5 ring-1 ring-zinc-200 dark:ring-zinc-800">{icon}</span>
                            <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{it.name}</div>
                                <div className="text-xs text-zinc-500">Actualizado {it.updatedAt} · {it.owner}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => onOpen?.(it)}
                            className="inline-flex items-center font-medium gap-1 text-xs ring-1 ring-zinc-300 dark:ring-zinc-700 rounded-xl px-1.5 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                            Abrir <ExternalLink className="size-3" />
                        </button>
                    </li>
                )) : <li className="text-sm text-zinc-500">{emptyText}</li>}
            </ul>
        </Card>
    );
}

function TeamCard({ team, onOpen }) {
    return (
        <Card>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-8 rounded-xl ${team.color}`} />
                    <div>
                        <div className="text-sm font-semibold">{team.name}</div>
                        <div className="text-xs text-zinc-500">{team.members} miembros · {team.projects} proyectos</div>
                    </div>
                </div>
                <button
                    onClick={() => onOpen?.(team)}
                    className="inline-flex items-center gap-1 text-xs font-medium ring-1 ring-zinc-300 dark:ring-zinc-700 rounded-xl px-1.5 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                    Abrir <ExternalLink className="size-3" />
                </button>
            </div>
        </Card>
    );
}

function IntegrationBadge({ item }) {
    return (
        <div className="flex items-center gap-2 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 px-3 py-2 bg-white/70 dark:bg-zinc-900/60">
            {item.icon}
            <div className="text-sm">{item.name}</div>
            <span className="text-xs text-zinc-500">· {item.short}</span>
        </div>
    );
}

function AutomationRow({ item }) {
    return (
        <li className="flex items-center justify-between py-2">
            <div className="min-w-0">
                <div className="font-medium truncate">{item.name}</div>
                <div className="text-xs text-zinc-500">Próxima ejecución: {item.when} · Canal: {item.channel}</div>
            </div>
            <button className="inline-flex items-center gap-1 text-sm ring-1 ring-zinc-300 dark:ring-zinc-700 rounded-xl px-2.5 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                Ejecutar ahora
            </button>
        </li>
    );
}

function ActivityItem({ ev }) {
    return (
        <li className="flex items-center gap-2 py-2">
            <Activity className="size-4 text-zinc-500" />
            <div className="min-w-0">
                <div className="text-sm">{ev.text}</div>
                <div className="text-xs text-zinc-500">{ev.time}</div>
            </div>
        </li>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [showAbout, setShowAbout] = useState(false);

    const SIDEBAR_EXPANDED = 256;
    const SIDEBAR_COLLAPSED = 64;
    const [sidebarOpen, setSidebarOpen] = useState(
        () => !document.documentElement.classList.contains("sidebar-collapsed")
    );
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 450);
        const handler = (e) => setSidebarOpen(!!e.detail?.open);
        window.addEventListener("sidebar:toggle", handler);
        return () => {
            clearTimeout(t);
            window.removeEventListener("sidebar:toggle", handler);
        };
    }, []);

    const contentMaxWidth = `min(1400px, calc(100vw - ${(sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED)}px))`;

    const filtered = useMemo(() => {
        if (!query.trim()) return RECENTS;
        const q = query.toLowerCase();
        const f = (arr) => arr.filter(x => x.name.toLowerCase().includes(q) || (x.owner || "").toLowerCase().includes(q));
        return { boards: f(RECENTS.boards), sheets: f(RECENTS.sheets), docs: f(RECENTS.docs) };
    }, [query]);

    const openResource = (kind, it) => {
        if (kind === "board") navigate(`/`);
        if (kind === "sheet") navigate(`/`);
        if (kind === "doc") navigate(`/`);
    };
    const openTeam = (t) => navigate(`/`);

    const WATERMARK_TEXT = "Desarrollado por Rey";
    const WATERMARK_URL = "www.google.com";
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(WATERMARK_URL)}`;
    const [wmOpen, setWmOpen] = useState(false);

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

    return (
        <div className="px-4 sm:px-6 py-4 mx-auto" style={{ maxWidth: contentMaxWidth }}>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold">Bienvenido</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        DASHBOARD
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Buscar en tus recursos…"
                        />
                    </label>

                    <div className="fixed bottom-3 right-3 z-40 select-none">
                        <button
                            aria-label="Acerca de este proyecto"
                            onClick={() => setWmOpen(v => !v)}
                            className="dark:text-neutral-200 dark:hover:text-neutral-600 text-2xl leading-none text-[#11192E]/40 hover:text-[#11192E] transition"
                        >
                            •
                        </button>

                        {wmOpen && (
                            <div className="absolute bottom-7 right-0 w-96 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 grid place-items-center rounded-lg dark:bg-white dark:text-neutral-700 bg-[#11192E] text-white text-xs font-semibold">RV</div>
                                    <div className="min-w-0">
                                        <a href={WATERMARK_URL} target="_blank" rel="noreferrer" className="dark:text-neutral-200 font-bold truncate text-lg text-[#11192E]">
                                            {WATERMARK_TEXT}
                                        </a>
                                    </div>
                                </div>
                                <img src={qrSrc} alt="QR" className="ml-28 mt-3 h-28 w-28 rounded-md ring-1 ring-zinc-200 dark:ring-zinc-800" />

                                <p className="pt-2 pb-2 font-semibold text-xs text-justify">Proyecto R&R.</p>
                                <p className="pt-2 pb-2 font-bold text-xs text-justify">· Stack:</p>
                                <div className="pl-3 grid grid-cols-4 gap-5">
                                    <img src="/react.png" className="max-w-8" />
                                    <img src="/tailwind-css.png" className="max-w-8" />
                                    <img src="/django.png" className="max-w-8" />
                                    <img src="/postgresql.png" className="max-w-8" />
                                </div>
                                <p className="pt-2 pb-2 font-bold text-xs text-justify">· Integraciones:</p>
                                <div className="grid grid-cols-5 gap-5 align-middle">
                                    <img src="/gsheets.png" className="max-w-10" />
                                    <img src="/drive.png" className="max-w-10" />
                                    <img src="/pbi.png" className="max-w-10" />
                                    <img src="/Meta.png" className="max-w-10" />
                                    <img src="/calendar.png" className="max-w-10" />
                                </div>
                                <p className="pt-2 pb-2 font-bold text-xs text-justify">· Automatizaciones:</p>
                                <div className="pl-3 grid grid-cols-4 gap-5 align-middle">
                                    <Mail className="max-w-10" />
                                    <Bell className="max-w-10" />
                                    <FileText className="max-w-10" />
                                    <RefreshCw className="max-w-10" />
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <button onClick={() => setWmOpen(false)} className="text-xs px-2 py-1 rounded-md ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div className="font-medium">Acciones rápidas</div>
                        <Zap className="size-4 text-amber-500" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 grid-cols-2">
                        <button onClick={() => setShowModal(true)} className="px-2 py-1.5 rounded-xl ring-1 ring-zinc-300 dark:ring-zinc-700 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            <FolderKanban className="size-4 inline mr-.5" /> Nuevo tablero
                        </button>
                        <button onClick={() => setShowModal(true)} className="px-2 py-1.5 rounded-xl ring-1 ring-zinc-300 dark:ring-zinc-700 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            <FileSpreadsheet className="size-4 inline mr-.5" /> Importar XLSX
                        </button>
                        <button onClick={() => setShowModal(true)} className="px-2 py-1.5 rounded-xl ring-1 ring-zinc-300 dark:ring-zinc-700 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            <FileText className="size-4 inline mr-.5" /> Nuevo documento
                        </button>
                        <button onClick={() => navigate("/automatizaciones")} className="px-2 py-1.5 rounded-xl ring-1 ring-zinc-300 dark:ring-zinc-700 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            <CalendarClock className="size-4 inline mr-.5" /> Crear automatización
                        </button>
                    </div>
                </Card>

                <StatCard icon={<LayoutDashboard className="size-5" />} label="Tableros activos" value="8" hint="2 actualizados hoy" />
                <StatCard icon={<Clock3 className="size-5" />} label="Automatizaciones" value="5" hint="3 programadas hoy" />
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
                    <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl dark:bg-[#0F1A34]">
                        <h2 className="text-base font-bold mb-3 text-[#11192E] dark:text-white">Nuevo Tablero</h2>

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

                        <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">Titulo del tablero</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70 dark:bg-[#0B1226] dark:text-white dark:border-white/10"
                            placeholder="Tablero 10"
                        />
                        <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">Descripcion del Tablero</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70 dark:bg-[#0B1226] dark:text-white dark:border-white/10"
                            placeholder="Actividades Diarias"
                        />

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg bg-[#11192E] px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div>
                        <SectionHeader title="Recientes" to="/" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ResourceList
                                icon={<LayoutDashboard className="size-4" />}
                                items={filtered.boards}
                                emptyText="Sin tableros recientes"
                                onOpen={(it) => openResource("board", it)}
                            />
                            <ResourceList
                                icon={<FileSpreadsheet className="size-4" />}
                                items={filtered.sheets}
                                emptyText="Sin hojas recientes"
                                onOpen={(it) => openResource("sheet", it)}
                            />
                            <ResourceList
                                icon={<FileText className="size-4" />}
                                items={filtered.docs}
                                emptyText="Sin documentos recientes"
                                onOpen={(it) => openResource("doc", it)}
                            />
                        </div>
                    </div>

                    <div>
                        <SectionHeader title="Tus equipos" to="/teams" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {TEAMS.map(t => <TeamCard key={t.id} team={t} onOpen={openTeam} />)}
                        </div>
                    </div>

                    <div>
                        <SectionHeader title="Automatizaciones (próximas)" to="/automatizaciones" />
                        <Card>
                            <ul>
                                {AUTOMATIONS_NEXT.map(a => <AutomationRow key={a.id} item={a} />)}
                            </ul>
                        </Card>
                    </div>
                </div>

                {/* Col 2: Lateral */}
                <div className="space-y-6">
                    <div>
                        <SectionHeader title="Integraciones conectadas" to="/integraciones" />
                        <Card>
                            <div className="flex flex-wrap gap-2">
                                {INTEGRATIONS_CONNECTED.map(i => <IntegrationBadge key={i.id} item={i} />)}
                            </div>
                        </Card>
                    </div>

                    <div>
                        <SectionHeader title="Actividad reciente" to="/activity" />
                        <Card>
                            <ul>
                                {ACTIVITY_FEED.map(ev => <ActivityItem key={ev.id} ev={ev} />)}
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between text-xs text-zinc-500">
                <div>v2.1.0</div>
                <div className="flex items-center gap-3">
                    <a className="max-w-6 hover:underline" target="_blank" href="https://www.instagram.com/vw.cordoba/"><img src="/instagram.png" alt="" /></a>
                    <a className="max-w-6 hover:underline" target="_blank" href="https://www.facebook.com/profile.php?id=61566167519398"><img src="/facebook.png" alt="" /></a>
                    <a className="max-w-6 hover:underline" target="_blank" href="https://www.youtube.com/@volkswagencordoba2923"><img src="/youtube.png" alt="" /></a>
                    <a className=" dark:bg-transparent bg-neutral-600 max-w-6 hover:underline" target="_blank" href="https://vw-cordoba.com.mx/"><img src="/ryr.png" alt="" /></a>
                </div>
            </div>
        </div >
    );
}
