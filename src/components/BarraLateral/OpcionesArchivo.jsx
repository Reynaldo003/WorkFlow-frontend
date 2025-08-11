import { useState, useRef, useEffect } from "react";
import { Plus, FileText, FileSpreadsheet, LayoutDashboard } from "lucide-react";

export default function OpcionesArchivo({ onAdd }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button" onClick={() => setOpen(!open)}>
                <Plus className="text-xl" />
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-36 bg-zinc-900 border border-white/10 rounded shadow-md z-10">
                    <button
                        type="button"
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-zinc-700 text-sm"
                        onClick={() => {
                            onAdd("excel");
                            setOpen(false);
                        }}
                    >
                        <FileSpreadsheet className="text-green-400" size={16} /> Excel
                    </button>
                    <button
                        type="button"
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-zinc-700 text-sm"
                        onClick={() => {
                            onAdd("word");
                            setOpen(false);
                        }}
                    >
                        <FileText className="text-indigo-400" size={16} /> Word
                    </button>
                    <button
                        type="button"
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-zinc-700 text-sm"
                        onClick={() => {
                            onAdd("tablero"); // antes era "board"
                            setOpen(false);
                        }}
                    >
                        <LayoutDashboard className="text-orange-400" size={16} /> Tablero
                    </button>

                </div>
            )}
        </div>
    );
}
