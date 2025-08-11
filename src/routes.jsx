import { Routes, Route } from "react-router-dom";
import LoginRegistro from "./pages/LoginRegistro/LoginRegistro";
import Tablero from "./pages/Tablero/Tablero";
import Logout from "./pages/Logout/Logout";
import RequireAuth from "./auth/RequireAuth";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RequireAuth><div>Panel Principal</div></RequireAuth>} />
      <Route path="/loginregistro" element={<LoginRegistro />} />
      <Route path="/automatizaciones" element={<RequireAuth><div>Automatizaciones</div></RequireAuth>} />
      <Route path="/tablero/:idTablero" element={<RequireAuth><Tablero /></RequireAuth>} />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
}
