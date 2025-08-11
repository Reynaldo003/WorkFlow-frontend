import { useState } from "react";
import {
  Zap,
  Settings,
  LogOut,
  Menu,
  StickyNote,
  PlugZap,
  House,
  Presentation,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import MenuEquipo from "./MenuEquipo";
import { Input } from "@material-tailwind/react";

export default function BarraLateral() {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`flex flex-col bg-[#11192E] text-white min-h-screen transition-all duration-500 overflow-hidden ${open ? "w-64" : "w-16"
        } shadow-lg`}
    >
      <img
        src="/ryr.png"
        alt="Logo CRM"
        className="h-16 object-contain p-2"
      />

      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={() => setOpen(!open)}
          className="text-white p-1 hover:bg-white hover:text-[#1E2A38] rounded"
        >
          <Menu />
        </button>
        {open && <h1 className="text-xl font-bold">WorkFlow</h1>}
      </div>

      <nav className="flex flex-col flex-grow mt-4 space-y-1 text-sm">
        <NavLinkItem icon={House} text="Inicio" to="/" open={open} />
        <NavLinkItem icon={StickyNote} text="Plantillas" to="/plantillas" open={open} />
        <div className="px-4 text-sm">
          <MenuEquipo open={open} />
        </div>
        <NavLinkItem icon={PlugZap} text="Integraciones" to="/integraciones" open={open} />
        <NavLinkItem icon={Zap} text="Automatizaciones" to="/automatizaciones" open={open} />
      </nav>

      <div className="px-4 mt-auto mb-2">
        <NavLink
          to="/logout"
          className="flex items-center gap-2 py-2 px-2 text-[#fca5a5] hover:bg-[#ef4444]/80 hover:text-white rounded transition-colors"
        >
          <LogOut className="text-lg" />
          {open && <span>Cerrar sesion</span>}
        </NavLink>
      </div>
    </div>
  );
}

function NavLinkItem({ icon: Icon, text, to, open }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 px-5 py-3 font-medium transition-colors duration-200 hover:bg-white/10 ${isActive ? "bg-[#2F3E51]" : ""}`
      }
    >
      <Icon className="text-xl" />
      {open && <span>{text}</span>}
    </NavLink>
  );
}
