// src/pages/Excel/Excel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css";
import * as XLSX from "xlsx";
import { Upload, Download, Plus, Rows, Columns, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";

const DEFAULT_SHEET = { id: crypto.randomUUID(), name: "Hoja 1", data: [[""]] };

export default function ExcelEditor({ topbarHeight = 64 }) {
    const SIDEBAR_EXPANDED = 256;
    const SIDEBAR_COLLAPSED = 64;

    const { idArchivo } = useParams();
    const token = localStorage.getItem("token");

    const [sheets, setSheets] = useState([DEFAULT_SHEET]);
    const [activeIdx, setActiveIdx] = useState(0);

    const [sidebarOpen, setSidebarOpen] = useState(
        () => !document.documentElement.classList.contains("sidebar-collapsed")
    );

    const hotRef = useRef(null);
    const saveTimer = useRef(null);

    const guardarEstructura = async (nuevasSheets) => {
        //await fetch(`http://127.0.0.1:8000/archivo/${idArchivo}/estructura/`, {
        await fetch(`http://127.0.0.1:8000/archivo/${idArchivo}/estructura/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`,
            },
            body: JSON.stringify({ estructura: { sheets: nuevasSheets } }),
        });
    };

    const scheduleSave = (payload) => {
        clearTimeout(saveTimer.current);
        // Ajusta el debounce si quieres más/menos frecuencia
        saveTimer.current = setTimeout(() => guardarEstructura(payload), 400);
    };

    // Carga inicial desde backend
    useEffect(() => {
        let cancelled = false;
        (async () => {
            //const res = await fetch(`http://127.0.0.1:8000/archivo/${idArchivo}/`, {
            const res = await fetch(`https://workflow-backend-production-991d.up.railway.app/archivo/${idArchivo}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            const data = await res.json();
            if (cancelled) return;
            const loaded = Array.isArray(data?.estructura?.sheets) && data.estructura.sheets.length
                ? data.estructura.sheets
                : [DEFAULT_SHEET];
            setSheets(loaded);
            setActiveIdx(0);
            // Si el backend venía sin estructura, la inicializamos
            if (!data?.estructura?.sheets?.length) scheduleSave(loaded);
        })();
        return () => { cancelled = true; };
    }, [idArchivo, token]);

    // Sidebar responsive
    useEffect(() => {
        const onToggle = (e) => setSidebarOpen(!!e.detail?.open);
        window.addEventListener("sidebar:toggle", onToggle);
        return () => window.removeEventListener("sidebar:toggle", onToggle);
    }, []);

    // Recalcular dimensiones al redimensionar
    useEffect(() => {
        const onResize = () => hotRef.current?.hotInstance?.refreshDimensions();
        window.addEventListener("resize", onResize);
        window.addEventListener("sidebar:toggle", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("sidebar:toggle", onResize);
        };
    }, []);

    // Utilidad para aplicar cambios y guardar
    const applyAndSave = (updater) => {
        setSheets((prev) => {
            const next = typeof updater === "function" ? updater(prev) : updater;
            scheduleSave(next);
            return next;
        });
    };

    const colHeaders = useMemo(() => {
        const cols = Math.max((sheets[activeIdx]?.data?.[0]?.length) || 1, 1);
        return Array.from({ length: cols }, (_, i) =>
            i >= 26
                ? String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26))
                : String.fromCharCode(65 + i)
        );
    }, [sheets, activeIdx]);

    const handleImport = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const wb = XLSX.read(e.target.result, { type: "array" });
            const newSheets = wb.SheetNames.map((name, idx) => {
                const ws = wb.Sheets[name];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                return {
                    id: crypto.randomUUID(),
                    name: name || `Hoja ${idx + 1}`,
                    data: data.length ? data : [[""]],
                };
            });
            const finalSheets = newSheets.length ? newSheets : [DEFAULT_SHEET];
            setSheets(finalSheets);
            setActiveIdx(0);
            scheduleSave(finalSheets);
        };
        reader.readAsArrayBuffer(file);
        event.target.value = "";
    };

    const handleExport = () => {
        const wb = XLSX.utils.book_new();
        sheets.forEach((sh) => {
            const ws = XLSX.utils.aoa_to_sheet(sh.data);
            XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sh.name));
        });
        XLSX.writeFile(wb, "hojas.xlsx");
    };

    const sanitizeSheetName = (name) => String(name).slice(0, 31).replace(/[\\/?*\[\]:]/g, "_");

    const addSheet = () => {
        applyAndSave((prev) => {
            const next = [...prev, { id: crypto.randomUUID(), name: `Hoja ${prev.length + 1}`, data: [[""]] }];
            // Mueve el índice activo a la hoja nueva
            setActiveIdx(next.length - 1);
            return next;
        });
    };

    const removeSheet = (idx) => {
        applyAndSave((prev) => {
            if (prev.length === 1) return prev; // no borrar la última
            const next = prev.filter((_, i) => i !== idx);
            setActiveIdx((old) => Math.min(old, next.length - 1));
            return next;
        });
    };

    const addRow = () =>
        applyAndSave((prev) => {
            const next = structuredClone(prev);
            const cols = next[activeIdx].data[0]?.length || 1;
            next[activeIdx].data.push(Array.from({ length: cols }, () => ""));
            return next;
        });

    const addCol = () =>
        applyAndSave((prev) => {
            const next = structuredClone(prev);
            next[activeIdx].data = (next[activeIdx].data.length ? next[activeIdx].data : [[""]]).map((row) => [...row, ""]);
            return next;
        });

    const sidebarWidth = sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;
    const contentMaxWidth = `min(1400px, calc(100vw - ${sidebarWidth}px))`;
    const activeSheet = sheets[activeIdx] ?? DEFAULT_SHEET;

    return (
        <div
            className="flex flex-col mx-auto"
            style={{ height: `calc(100vh - ${topbarHeight}px)`, maxWidth: contentMaxWidth }}
        >
            <div className="w-full sticky top-0 z-10 bg-white/70 dark:bg-[#1e2431] backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110 cursor-pointer">
                        <Upload size={18} />
                        <span>Importar .xlsx</span>
                        <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                    </label>

                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#11192E] text-white hover:brightness-110"
                    >
                        <Download size={18} />
                        <span>Exportar</span>
                    </button>

                    <div className="mx-2 h-6 w-px bg-neutral-300 dark:bg-neutral-700" />

                    <button
                        onClick={addRow}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-500 hover:bg-neutral-300 dark:hover:bg-neutral-700"
                        title="Agregar fila"
                    >
                        <Rows size={18} />
                        Fila
                    </button>
                    <button
                        onClick={addCol}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-500 hover:bg-neutral-300 dark:hover:bg-neutral-700"
                        title="Agregar columna"
                    >
                        <Columns size={18} />
                        Columna
                    </button>

                    <div className="mx-2 h-6 w-px bg-neutral-300 dark:bg-neutral-700" />

                    <button
                        onClick={addSheet}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:brightness-110"
                    >
                        <Plus size={18} />
                        Nueva hoja
                    </button>

                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin ml-auto">
                        {sheets.map((s, i) => (
                            <div
                                key={s.id}
                                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer ${i === activeIdx
                                    ? "bg-yellow-400/20 border-yellow-500 text-yellow-800 dark:text-yellow-300"
                                    : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    }`}
                                onClick={() => setActiveIdx(i)}
                                title={s.name}
                            >
                                <span className="text-sm whitespace-nowrap max-w-44 truncate">{s.name}</span>
                                {sheets.length > 1 && (
                                    <button
                                        className="opacity-60 hover:opacity-100 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeSheet(i);
                                        }}
                                        title="Eliminar hoja"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-neutral-50 dark:bg-[#1e2431]">
                <div className="flex-auto h-[500px] w-full rounded-xl border border-gray-300 dark:border-neutral-700 overflow-hidden">
                    <HotTable
                        className="dark:bg-[#1e2431] dark:text-white"
                        ref={hotRef}
                        data={activeSheet.data}
                        colHeaders={colHeaders}
                        rowHeaders
                        width="100%"
                        height="600"
                        stretchH="all"
                        manualColumnResize
                        manualRowResize
                        contextMenu
                        dropdownMenu
                        filters
                        rowHeights={28}
                        colWidths={120}
                        autoWrapRow
                        licenseKey="non-commercial-and-evaluation"
                        afterChange={(changes, source) => {
                            if (!changes || source === "loadData") return;
                            applyAndSave((prev) => {
                                const next = structuredClone(prev);
                                const grid = next[activeIdx].data;
                                changes.forEach(([r, c, _old, val]) => {
                                    if (!grid[r]) grid[r] = [];
                                    grid[r][c] = val;
                                });
                                return next;
                            });
                        }}
                        undo
                        copyPaste
                        fillHandle
                        outsideClickDeselects={false}
                        enterBeginsEditing
                    />
                </div>
            </div>
        </div>
    );
}
