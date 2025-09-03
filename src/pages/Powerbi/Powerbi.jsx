// Powerbi.jsx
import { useEffect, useRef, useState } from "react";
import { PowerBIEmbed } from "powerbi-client-react";
import * as pbi from "powerbi-client";
import {
    Upload, FilePlus2, Eye, Pencil, Save, RefreshCw, Maximize2, PlugZap, AlertTriangle
} from "lucide-react";

/**
 * Requisitos:
 * npm i powerbi-client powerbi-client-react
 *
 * Backend esperado (ejemplos):
 * POST /api/powerbi/import (form-data: file=.pbix, workspaceId)
 *   -> { reportId, embedUrl, accessToken, workspaceId, datasetId }
 *
 * POST /api/powerbi/embed (json: { workspaceId, reportId })
 *   -> { reportId, embedUrl, accessToken, workspaceId }
 *
 * Los tokens deben ser de tipo "embed for your customers" (app owns data) o
 * "embed for your org" según tu escenario. El accessToken debe tener permisos de edición
 * si quieres habilitar view:'edit' y guardar.
 */

export default function Powerbi() {
    const [mode, setMode] = useState("import"); // 'import' | 'existing'
    const [workspaceId, setWorkspaceId] = useState("");
    const [reportId, setReportId] = useState("");
    const [file, setFile] = useState(null);

    const [state, setState] = useState({ loading: false, error: "" });
    const [embedConfig, setEmbedConfig] = useState(null); // {embedUrl, accessToken, reportId, workspaceId}
    const [view, setView] = useState("view"); // 'view' | 'edit'
    const [message, setMessage] = useState("");

    const embedRef = useRef(null); // referencia al componente embebido para llamadas (save, fullscreen, refresh)

    const onPickFile = (e) => {
        const f = e.target.files?.[0];
        if (f && !f.name.toLowerCase().endsWith(".pbix")) {
            setState({ loading: false, error: "Selecciona un archivo .pbix válido." });
            return;
        }
        setFile(f || null);
    };

    const importPbix = async () => {
        if (!file || !workspaceId) {
            setState({ loading: false, error: "Falta archivo PBIX y/o Workspace ID." });
            return;
        }
        setState({ loading: true, error: "" });
        setMessage("");

        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("workspaceId", workspaceId);

            const res = await fetch("/api/powerbi/import", {
                method: "POST",
                body: fd,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "No se pudo importar el PBIX.");
            }
            const data = await res.json();
            // data: { reportId, embedUrl, accessToken, workspaceId }
            setEmbedConfig({
                type: "report",
                id: data.reportId,
                embedUrl: data.embedUrl,
                accessToken: data.accessToken,
                workspaceId: data.workspaceId || workspaceId,
            });
            setReportId(data.reportId);
            setMessage("PBIX importado y listo para embeber.");
        } catch (e) {
            setState({ loading: false, error: e.message });
            return;
        } finally {
            setState((s) => ({ ...s, loading: false }));
        }
    };

    const openExisting = async () => {
        if (!workspaceId || !reportId) {
            setState({ loading: false, error: "Falta Workspace ID y/o Report ID." });
            return;
        }
        setState({ loading: true, error: "" });
        setMessage("");

        try {
            const res = await fetch("/api/powerbi/embed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workspaceId, reportId }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "No se pudo obtener el embed config.");
            }
            const data = await res.json();
            setEmbedConfig({
                type: "report",
                id: data.reportId,
                embedUrl: data.embedUrl,
                accessToken: data.accessToken,
                workspaceId: data.workspaceId || workspaceId,
            });
            setMessage("Reporte listo para embeber.");
        } catch (e) {
            setState({ loading: false, error: e.message });
            return;
        } finally {
            setState((s) => ({ ...s, loading: false }));
        }
    };

    const toggleView = () => {
        setView((v) => (v === "view" ? "edit" : "view"));
        setMessage(view === "view" ? "Cambiado a modo edición." : "Cambiado a modo visualización.");
    };

    const doSave = async () => {
        try {
            const report = embedRef.current?.getReport?.();
            if (!report) return;
            // Guarda cambios del reporte (sólo si el token/tenant lo permite y view:'edit')
            await report.save();
            setMessage("Cambios guardados en el reporte.");
        } catch (e) {
            setState({ loading: false, error: "No fue posible guardar. Verifica permisos y modo edición." });
        }
    };

    const doRefresh = async () => {
        try {
            const report = embedRef.current?.getReport?.();
            if (!report) return;
            await report.refresh();
            setMessage("Reporte actualizado.");
        } catch (e) {
            setState({ loading: false, error: "No fue posible refrescar el reporte." });
        }
    };

    const doFullscreen = async () => {
        try {
            const report = embedRef.current?.getReport?.();
            if (!report) return;
            await report.fullscreen();
        } catch { }
    };

    // Config básico de Power BI (se reconstruye cuando embedConfig o view cambian)
    const powerbiProps = embedConfig
        ? {
            embedConfig: {
                type: "report",
                id: embedConfig.id,
                embedUrl: embedConfig.embedUrl,
                accessToken: embedConfig.accessToken,
                tokenType: pbi.models.TokenType.Embed,
                settings: {
                    panes: {
                        filters: { visible: view === "edit" }, // filtros visibles en edición
                        pageNavigation: { visible: true },
                    },
                    // Otras opciones útiles:
                    // navContentPaneEnabled: true,
                    // hideErrors: false,
                },
                permissions:
                    view === "edit"
                        ? pbi.models.Permissions.All
                        : pbi.models.Permissions.Read,
                viewMode: view === "edit" ? pbi.models.ViewMode.Edit : pbi.models.ViewMode.View,
            },
            eventHandlers: new Map([
                ["loaded", () => setMessage("Reporte cargado.")],
                ["rendered", () => { }],
                ["saved", (e) => setMessage("Reporte guardado.")],
                ["error", (e) => setState({ loading: false, error: e?.detail || "Error en Power BI" })],
            ]),
            getEmbeddedComponent: (embeddedReport) => {
                // guarda una referencia para usar .save(), .refresh(), .fullscreen()
                embedRef.current = embeddedReport;
            },
            cssClassName:
                "w-full h-[70vh] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden",
        }
        : null;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Power BI</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Importa un archivo <code>.pbix</code> a tu workspace y embébelo aquí para visualizar o editar.
                </p>
            </div>

            {/* Selector de flujo */}
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setMode("import")}
                    className={`px-3 py-2 rounded-xl text-sm ring-1 transition ${mode === "import" ? "bg-amber-500 text-black ring-amber-500" : "ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                >
                    Subir PBIX
                </button>
                <button
                    onClick={() => setMode("existing")}
                    className={`px-3 py-2 rounded-xl text-sm ring-1 transition ${mode === "existing" ? "bg-amber-500 text-black ring-amber-500" : "ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                >
                    Abrir reporte existente
                </button>
            </div>

            {/* Formulario según flujo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                    <label className="grid gap-2">
                        <span className="text-sm">Workspace ID</span>
                        <input
                            value={workspaceId}
                            onChange={(e) => setWorkspaceId(e.target.value)}
                            placeholder="00000000-0000-0000-0000-000000000000"
                            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </label>

                    {mode === "existing" && (
                        <label className="grid gap-2 mt-3">
                            <span className="text-sm">Report ID</span>
                            <input
                                value={reportId}
                                onChange={(e) => setReportId(e.target.value)}
                                placeholder="11111111-1111-1111-1111-111111111111"
                                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </label>
                    )}

                    {mode === "import" && (
                        <label className="grid gap-2 mt-3">
                            <span className="text-sm">Archivo PBIX</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept=".pbix"
                                    onChange={onPickFile}
                                    className="text-sm"
                                />
                            </div>
                        </label>
                    )}

                    <div className="mt-4 flex gap-2">
                        {mode === "import" ? (
                            <button
                                onClick={importPbix}
                                disabled={state.loading}
                                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-60"
                            >
                                <Upload className="size-4" /> Importar y embeber
                            </button>
                        ) : (
                            <button
                                onClick={openExisting}
                                disabled={state.loading}
                                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-60"
                            >
                                <PlugZap className="size-4" /> Obtener embed
                            </button>
                        )}
                    </div>

                    {state.error && (
                        <div className="mt-3 text-sm flex items-start gap-2 text-rose-600">
                            <AlertTriangle className="size-4 mt-0.5" />
                            <span>{state.error}</span>
                        </div>
                    )}
                    {message && (
                        <div className="mt-2 text-xs text-emerald-600">{message}</div>
                    )}
                </div>

                {/* Controles del viewer/edición */}
                <div className="md:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={toggleView}
                            disabled={!embedConfig}
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                        >
                            {view === "view" ? <><Pencil className="size-4" /> Editar</> : <><Eye className="size-4" /> Ver</>}
                        </button>
                        <button
                            onClick={doSave}
                            disabled={!embedConfig || view !== "edit"}
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                        >
                            <Save className="size-4" /> Guardar
                        </button>
                        <button
                            onClick={doRefresh}
                            disabled={!embedConfig}
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                        >
                            <RefreshCw className="size-4" /> Refrescar
                        </button>
                        <button
                            onClick={doFullscreen}
                            disabled={!embedConfig}
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                        >
                            <Maximize2 className="size-4" /> Pantalla completa
                        </button>
                    </div>

                    {/* Viewer */}
                    <div className="mt-4">
                        {embedConfig ? (
                            <PowerBIEmbed
                                {...powerbiProps}
                            />
                        ) : (
                            <div className="h-[70vh] rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-sm text-zinc-500">
                                Carga un PBIX o abre un reporte existente para empezar.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 text-sm text-zinc-600 dark:text-zinc-400">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Para editar y guardar, el <em>accessToken</em> debe permitir edición (embed for your org / customers con permisos adecuados).</li>
                    <li>El archivo <code>.pbix</code> se importa al workspace en el servidor; el navegador sólo lo embebe.</li>
                    <li>Si usas DirectQuery/refresh, el refresco de dataset es un proceso aparte del “refresh” visual del reporte.</li>
                </ul>
            </div>
        </div>
    );
}
