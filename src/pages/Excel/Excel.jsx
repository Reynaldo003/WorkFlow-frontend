// src/pages/Excel/Excel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css";
import * as XLSX from "xlsx";
import { Upload, Download, Plus, Rows, Columns, Trash2 } from "lucide-react";

export default function ExcelEditor({ topbarHeight = 64 }) {
    const SIDEBAR_EXPANDED = 256;
    const SIDEBAR_COLLAPSED = 64;

    const [sidebarOpen, setSidebarOpen] = useState(
        () => !document.documentElement.classList.contains("sidebar-collapsed")
    );
    useEffect(() => {
        const onToggle = (e) => setSidebarOpen(!!e.detail?.open);
        window.addEventListener("sidebar:toggle", onToggle);
        return () => window.removeEventListener("sidebar:toggle", onToggle);
    }, []);

    const [sheets, setSheets] = useState([
        { id: crypto.randomUUID(), name: "Hoja 1", data: [["", "", ""], ["", "", ""], ["", "", ""]] },
    ]);
    const [activeIdx, setActiveIdx] = useState(0);

    const hotRef = useRef(null);

    const colHeaders = useMemo(() => {
        const cols = Math.max(...sheets.map((s) => s.data[0]?.length || 0));
        return Array.from({ length: cols }, (_, i) =>
            i >= 26
                ? String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26))
                : String.fromCharCode(65 + i)
        );
    }, [sheets]);

    useEffect(() => {
        const onResize = () => hotRef.current?.hotInstance?.refreshDimensions();
        window.addEventListener("resize", onResize);
        window.addEventListener("sidebar:toggle", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("sidebar:toggle", onResize);
        };
    }, []);

    const handleImport = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const wb = XLSX.read(e.target.result, { type: "array" });
            const newSheets = wb.SheetNames.map((name, idx) => {
                const ws = wb.Sheets[name];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                return { id: crypto.randomUUID(), name: name || `Hoja ${idx + 1}`, data: data.length ? data : [[""]] };
            });
            setSheets(newSheets.length ? newSheets : sheets);
            setActiveIdx(0);
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
        setSheets((prev) => [...prev, { id: crypto.randomUUID(), name: `Hoja ${prev.length + 1}`, data: [[""]] }]);
        setActiveIdx(sheets.length);
    };
    const removeSheet = (idx) => {
        if (sheets.length === 1) return;
        const next = sheets.filter((_, i) => i !== idx);
        setSheets(next);
        setActiveIdx(Math.max(0, idx - 1));
    };
    const addRow = () =>
        setSheets((prev) => {
            const clone = structuredClone(prev);
            const cols = clone[activeIdx].data[0]?.length || 1;
            clone[activeIdx].data.push(Array.from({ length: cols }, () => ""));
            return clone;
        });
    const addCol = () =>
        setSheets((prev) => {
            const clone = structuredClone(prev);
            clone[activeIdx].data = (clone[activeIdx].data.length ? clone[activeIdx].data : [[""]]).map((row) => [
                ...row,
                "",
            ]);
            return clone;
        });

    const sidebarWidth = sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;
    const contentMaxWidth = `min(1400px, calc(100vw - ${sidebarWidth}px))`;

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

            <div className="bg-neutral dark:bg-[#1e2431]">
                <div className="flex-auto h-[500px] w-full rounded-xl border border-gray-400 dark:border-neutral overflow-hidden">
                    <HotTable
                        className="dark:bg-[#1e2431] dark:text-white"
                        ref={hotRef}
                        data={sheets[activeIdx].data}
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
                            setSheets((prev) => {
                                const next = structuredClone(prev);
                                const grid = next[activeIdx].data;
                                changes.forEach(([r, c, _old, val]) => {
                                    if (grid[r]) grid[r][c] = val;
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
