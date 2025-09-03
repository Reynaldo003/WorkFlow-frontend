import { useEffect, useState } from "react";
import {
  Zap,
  Settings,
  LogOut,
  Menu,
  StickyNote,
  PlugZap,
  House,
  FileSpreadsheet,
  FileText,
  FileChartColumnIncreasing,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import MenuEquipo from "./MenuEquipo";

export default function BarraLateral() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Detectar estado inicial por si el usuario recarga con la barra colapsada
    const isCollapsed = document.documentElement.classList.contains("sidebar-collapsed");
    if (isCollapsed) setOpen(false);
  }, []);

  const toggleSidebar = () => {
    const next = !open;
    setOpen(next);
    // clase en <html> para que otras vistas (Excel, etc.) puedan reaccionar
    document.documentElement.classList.toggle("sidebar-collapsed", !next);
    // evento global para que BarraSuperior u otros componentes entren a modo compacto
    window.dispatchEvent(new CustomEvent("sidebar:toggle", { detail: { open: next } }));
  };

  return (
    <aside
      className={`flex flex-col bg-[#11192E] text-white min-h-screen transition-all duration-500 overflow-hidden shadow-lg
        ${open ? "w-56" : "w-16"}`}
      style={{ willChange: "width" }}
    >
      {/* Zona de logo y botón: al colapsar, el botón va DEBAJO del logo */}
      <div className={`flex ${open ? "flex-row items-center justify-between" : "flex-col items-center"} px-3 pt-3 pb-2 border-b border-white/10`}>
        <img
          src="/ryr.png"
          alt="Logo"
          className={`${open ? "h-12" : "h-10"} object-contain`}
        />
        <button
          onClick={toggleSidebar}
          className={`mt-0 text-white/90 hover:bg-white hover:text-[#11192E] rounded transition-colors
            ${open ? "p-1" : "p-1 mt-2"}`}
          aria-label="Toggle sidebar"
          title="Contraer/Expandir"
        >
          <Menu className={`${open ? "h-5 w-5" : "h-5 w-5"}`} />
        </button>
      </div>

      {open && (
        <h1 className="px-4 pt-2 pb-3 text-base font-semibold tracking-wide text-right">WorkFlow</h1>
      )}

      <nav className="flex flex-col flex-grow mt-1 space-y-0.5 text-[13px]">
        <NavLinkItem icon={House} text="Inicio" to="/" open={open} />
        <NavLinkItem icon={FileText} text="Word" to="/word/nuevo" open={open} />
        <NavLinkItem icon={FileSpreadsheet} text="Excel" to="/excel/nuevo" open={open} />
        <NavLinkItem icon={FileChartColumnIncreasing} text="Power BI" to="/powerbi/nuevo" open={open} />
        <NavLinkItem icon={StickyNote} text="Plantillas" to="/plantillas" open={open} />
        <div className={`px-3 ${open ? "pt-1" : ""}`}>
          <MenuEquipo open={open} />
        </div>
        <NavLinkItem icon={PlugZap} text="Integraciones" to="/integraciones" open={open} />
        <NavLinkItem icon={Zap} text="Automatizaciones" to="/automatizaciones" open={open} />
      </nav>

      <div className="px-2 mt-auto mb-2">
        <NavLink
          to="/logout"
          className="group flex items-center gap-2 py-2 px-2 text-red-300 hover:bg-red-500/90 hover:text-white rounded transition-colors"
          title={open ? "" : "Cerrar sesión"}
        >
          <LogOut className="h-4 w-4" />
          {open && <span className="text-[13px]">Cerrar sesión</span>}
        </NavLink>
      </div>
    </aside>
  );
}

function NavLinkItem({ icon: Icon, text, to, open }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2 font-medium transition-colors
         hover:bg-white/10 ${isActive ? "bg-white/10" : ""}`
      }
      title={open ? "" : text}
    >
      <Icon className="h-4.5 w-4.5" />
      {open && <span className="truncate">{text}</span>}
      {/* Tooltip para cuando está colapsado */}
      {!open && (
        <span className="pointer-events-none absolute left-14 z-20 origin-left scale-95 rounded bg-zinc-900 px-2 py-1 text-xs text-white opacity-0 shadow transition group-hover:opacity-100">
          {text}
        </span>
      )}
    </NavLink>
  );
}
