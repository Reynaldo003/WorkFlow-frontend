import React, { useState, useMemo, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { useParams } from "react-router-dom";
import { useDarkMode } from "../../context/DarkModeContext";
import { FileX2, TableRowsSplit, TableColumnsSplit } from "lucide-react";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
    AllCommunityModule,
    ModuleRegistry,
    colorSchemeDarkBlue,
    colorSchemeLightCold,
    themeQuartz
} from "ag-grid-community";
import { ExcelExportModule } from "ag-grid-enterprise";
ModuleRegistry.registerModules([AllCommunityModule, ExcelExportModule]);

// Renderer para la celda de imagen
const ImageCellRenderer = (props) => {
    const imageUrl = props.value;

    if (!imageUrl) return null;

    // Función para abrir en nueva pestaña
    const abrirImagen = () => {
        window.open(imageUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <img
            src={imageUrl}
            alt="Imagen"
            style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                cursor: "pointer",
                borderRadius: "4px"
            }}
            onClick={abrirImagen}
        />
    );
};


export default function Tablero() {
    const { darkMode } = useDarkMode();
    const { idTablero } = useParams();
    const gridRef = useRef(null);
    const token = localStorage.getItem("token");

    const [colDefs, setColDefs] = useState([]);
    const [rowData, setRowData] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [newColName, setNewColName] = useState("");
    const [newColType, setNewColType] = useState("text");

    const pinFirstColumn = (columns) => {
        if (columns.length > 0) {
            columns[0] = { ...columns[0], pinned: "left" };
        }
        return columns;
    };

    const handleAddColumnModal = () => setShowModal(true);

    const confirmAddColumn = async () => {
        if (!newColName.trim()) return;

        let nuevaCol = { field: `col${colDefs.length}`, headerName: newColName };

        switch (newColType) {
            case "text":
                nuevaCol.cellEditor = "agTextCellEditor";
                break;
            case "number":
                nuevaCol.filter = "agNumberColumnFilter";
                break;
            case "date":
                nuevaCol.cellEditor = "agDateCellEditor";
                nuevaCol.valueSetter = p => {
                    p.data[nuevaCol.field] = p.newValue;
                    return true;
                };
                break;
            case "select":
                nuevaCol.cellEditor = "agSelectCellEditor";
                nuevaCol.cellEditorParams = { values: ["Opción 1", "Opción 2"] };
                break;
            case "checkbox":
                nuevaCol.cellRenderer = "agCheckboxCellRenderer";
                nuevaCol.editable = true;
                nuevaCol.valueGetter = params => !!params.data[nuevaCol.field];
                nuevaCol.valueSetter = params => {
                    params.data[nuevaCol.field] = !!params.newValue;
                    return true;
                };
                break;
            case "image":
                nuevaCol.cellRenderer = "imageCellRenderer"; // Usa el renderer registrado
                nuevaCol.editable = true;
                nuevaCol.cellEditor = "agTextCellEditor"; // Para pegar enlace
                break;
        }

        let nuevasCols = [...colDefs, nuevaCol];
        nuevasCols = pinFirstColumn(nuevasCols);

        const nuevasFilas = rowData.map(row => ({ ...row, [nuevaCol.field]: "" }));
        setColDefs(nuevasCols);
        setRowData(nuevasFilas);
        await guardarEstructura(nuevasCols, nuevasFilas);

        setShowModal(false);
        setNewColName("");
        setNewColType("text");
    };

    useEffect(() => {
        const fetchTablero = async () => {
            const res = await fetch(`https://workflow-backend-production-991d.up.railway.app/tablero/${idTablero}/`, {
                headers: { "Authorization": `Token ${token}` }
            });
            const data = await res.json();
            if (data.estructura) {
                setColDefs(pinFirstColumn(data.estructura.columns || []));
                setRowData(data.estructura.rows || []);
            }
        };
        fetchTablero();
    }, [idTablero, token]);

    const guardarEstructura = async (nuevasCols, nuevasFilas) => {
        await fetch(`https://workflow-backend-production-991d.up.railway.app/tablero/${idTablero}/estructura/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify({
                estructura: { columns: nuevasCols, rows: nuevasFilas }
            })
        });
    };

    const onCellValueChanged = async () => {
        const nuevasFilas = [];
        gridRef.current.api.forEachNode((node) => nuevasFilas.push(node.data));
        await guardarEstructura(colDefs, nuevasFilas);
    };

    const handleAddRow = async () => {
        const nuevaFila = {};
        colDefs.forEach(col => nuevaFila[col.field] = "");
        const nuevasFilas = [...rowData, nuevaFila];
        setRowData(nuevasFilas);
        await guardarEstructura(colDefs, nuevasFilas);
    };

    const gridTheme = useMemo(() => {
        return darkMode
            ? themeQuartz.withPart(colorSchemeDarkBlue)
            : themeQuartz.withPart(colorSchemeLightCold);
    }, [darkMode]);

    const defaultColDef = {
        flex: 1,
        minWidth: 120,
        resizable: true,
        editable: true,
    };

    const onBtExport = () => {
        if (gridRef.current) {
            gridRef.current.api.exportDataAsExcel();
        }
    };

    return (
        <div className="bg-white dark:bg-[#1e2431] dark:text-white shadow border-b border-gray-200 dark:border-white/10" style={{ width: "100%", height: 500 }}>
            <div className="p-3 flex gap-2 justify-end mb-2">
                <button className="pr-2" title="Agregar columna" onClick={handleAddColumnModal}>
                    <TableColumnsSplit />
                </button>
                <button className="pr-2" title="Agregar fila" onClick={handleAddRow}>
                    <TableRowsSplit />
                </button>
                <button title="Exportar a Excel" onClick={onBtExport}>
                    <FileX2 className="text-green-400" size={24} />
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Agregar Columna</h2>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={newColName}
                            onChange={e => setNewColName(e.target.value)}
                            className="border p-2 w-full mb-3 dark:bg-zinc-700 dark:text-white"
                        />
                        <select
                            value={newColType}
                            onChange={e => setNewColType(e.target.value)}
                            className="border p-2 w-full mb-3 dark:bg-zinc-700 dark:text-white"
                        >
                            <option value="text">Texto</option>
                            <option value="number">Numerico</option>
                            <option value="date">Fecha</option>
                            <option value="select">Opción Multiple</option>
                            <option value="checkbox">Verdadero/Falso</option>
                            <option value="image">Imagen</option>
                        </select>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowModal(false)} className="px-3 py-1">Cancelar</button>
                            <button onClick={confirmAddColumn} className="bg-blue-500 text-white px-3 py-1 rounded">Agregar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="ag-theme-alpine" style={{ width: "100%", height: 440 }}>
                <AgGridReact
                    ref={gridRef}
                    pagination={true}
                    paginationPageSize={20}
                    theme={gridTheme}
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    key={darkMode ? "dark" : "light"}
                    onCellValueChanged={onCellValueChanged}
                    components={{ imageCellRenderer: ImageCellRenderer }} // Registro del renderer
                />
            </div>
        </div>
    );
}
