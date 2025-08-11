import BarraLateral from "./components/BarraLateral/BarraLateral";
import BarraSuperior from "./components/BarraLateral/BarraSuperior";
import { DarkModeProvider } from "./context/DarkModeContext";
import RequireAuth from "./auth/RequireAuth";
import AppRoutes from "./routes";
import { BrowserRouter as Router, useLocation } from "react-router-dom";

function AppContent() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  const isLoginPage = location.pathname === "/loginregistro";
  const rutasSinSidebar = ["/loginregistro"];
  const mostrarSidebar = !rutasSinSidebar.includes(location.pathname);
  const rutasFondoNegro = ["/tablero"];
  const esFondoNegro = !rutasFondoNegro.includes(location.pathname);

  return (
    <DarkModeProvider>
      <div className="flex min-h-screen">
        {mostrarSidebar && <BarraLateral />}
        <div className="flex flex-col flex-grow">
          {mostrarSidebar && <BarraSuperior />}
          <main
            className={`flex-grow p-6 
            ${!mostrarSidebar ? 'bg-gradient-to-br from-[#314b8f] to-[#0f2866]' : 'bg-gray-100'} 
            ${mostrarSidebar ? 'bg-white dark:bg-[#1e2431] dark:text-white shadow border-b border-gray-200 dark:border-white/10' : ''}
          `}
          >
            <AppRoutes />
          </main>
        </div>
      </div>
    </DarkModeProvider >
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
