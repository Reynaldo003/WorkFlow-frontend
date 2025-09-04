import { Routes, Route } from "react-router-dom";
import LoginRegistro from "./pages/LoginRegistro/LoginRegistro";
import Tablero from "./pages/Tablero/Tablero";
import Logout from "./pages/Logout/Logout";
import RequireAuth from "./auth/RequireAuth";
import Perfil from "./pages/Perfil/Perfil";
import Excel from "./pages/Excel/Excel";
import Word from "./pages/Word/Word";
import Integracion from "./pages/Integraciones/Integraciones";
import Automatizaciones from "./pages/Automatizaciones/Automatizaciones";
import Home from "./pages/Home/Home";
import Powerbi from "./pages/Powerbi/Powerbi";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/loginregistro" element={<LoginRegistro />} />
      <Route path="/Perfil" element={<RequireAuth><Perfil /></RequireAuth>} />
      <Route path="/Integraciones" element={<RequireAuth><Integracion /></RequireAuth>} />
      <Route path="/automatizaciones" element={<RequireAuth><Automatizaciones /></RequireAuth>} />
      <Route path="/excel/:idArchivo" element={<RequireAuth><Excel /></RequireAuth>} />
      <Route path="/word/:idArchivo" element={<RequireAuth><Word /></RequireAuth>} />
      <Route path="/powerbi/nuevo" element={<RequireAuth><Powerbi /></RequireAuth>} />
      <Route path="/tablero/:idTablero" element={<RequireAuth><Tablero /></RequireAuth>} />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
}
