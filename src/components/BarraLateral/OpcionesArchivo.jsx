import { useState, useRef, useEffect } from "react";
import { Plus, FileText, FileSpreadsheet, LayoutDashboard } from "lucide-react";

export default function OpcionesArchivo({ onAdd }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => setOpen((v) => !v)} className="p-1 rounded hover:bg-white/10">
                <Plus className="h-4 w-4" />
            </button>
            {open && (
                <div className="absolute right-0 mt-1 w-36 bg-zinc-900 border border-white/10 rounded shadow-md z-20">
                    <button
                        type="button"
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-zinc-800 text-xs"
                        onClick={() => {
                            onAdd("excel");
                            setOpen(false);
                        }}
                    >
                        <FileSpreadsheet className="text-green-400 h-4 w-4" /> Excel
                    </button>
                    <button
                        type="button"
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-zinc-800 text-xs"
                        onClick={() => {
                            onAdd("word");
                            setOpen(false);
                        }}
                    >
                        <FileText className="text-indigo-400 h-4 w-4" /> Word
                    </button>
                    <button
                        type="button"
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-zinc-800 text-xs"
                        onClick={() => {
                            onAdd("tablero");
                            setOpen(false);
                        }}
                    >
                        <LayoutDashboard className="text-orange-400 h-4 w-4" /> Tablero
                    </button>
                </div>
            )}
        </div>
    );
}
