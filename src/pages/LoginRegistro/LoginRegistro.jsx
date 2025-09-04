import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";

export default function LoginRegistro() {
    const [tab, setTab] = useState("registro"); // "login" | "registro"
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [formLogin, setFormLogin] = useState({ usuario: "", contrasena: "" });
    const [formRegistro, setFormRegistro] = useState({
        nombre: "",
        apellido: "",
        usuario: "",
        email: "",
        contrasena: "",
        contrasenaConfirmada: "",
        id_rol: 2,
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            //const res = await fetch("http://127.0.0.1:8000/login/", {
            const res = await fetch("https://workflow-backend-production-991d.up.railway.app/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formLogin),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                navigate("/");
            } else {
                alert("Error: " + (data.detail || "credenciales inválidas"));
            }
        } catch (err) {
            alert("No se pudo iniciar sesión.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegistro = async (e) => {
        e.preventDefault();
        if (formRegistro.contrasena !== formRegistro.contrasenaConfirmada) {
            alert("Las contraseñas no coinciden");
            return;
        }
        try {
            //const res = await fetch("http://127.0.0.1:8000/register/", {
            const res = await fetch("https://workflow-backend-production-991d.up.railway.app/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario: formRegistro.usuario,
                    correo: formRegistro.email,
                    contrasena: formRegistro.contrasena,
                    nombre: formRegistro.nombre,
                    apellido: formRegistro.apellido,
                    id_rol: formRegistro.id_rol,
                }),
            });
            const data = await res.json();
            if (res.status === 201) {
                alert("Registro exitoso, ahora puedes iniciar sesión");
                setTab("login");
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        } catch {
            alert("No se pudo completar el registro.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#314b8f] to-[#0f2866] flex items-center justify-center px-4 py-8">
            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Panel de marca (solo md+) */}
                    <div className="hidden md:flex flex-col items-center justify-center bg-[#11192E] text-white p-10">
                        <motion.img
                            src="/ryr.png"
                            className="w-24 mb-6"
                            alt="Logo"
                            animate={{ rotate: [0, 8, -8, 0] }}
                            transition={{ repeat: Infinity, repeatDelay: 8, duration: 2 }}
                        />
                        <p className="text-center text-sm leading-relaxed max-w-xs">
                            {tab === "login"
                                ? "Bienvenido de nuevo. Ingresa con tus credenciales para continuar."
                                : "Crea una cuenta para acceder al CRM y gestionar tus prospectos."}
                        </p>
                    </div>

                    {/* Contenido: tabs + formulario */}
                    <div className="p-6 sm:p-8">
                        {/* Tabs (visible en móvil y desktop) */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1">
                                <button
                                    className={`px-4 py-2 text-sm rounded-lg transition ${tab === "login"
                                        ? "bg-white shadow text-[#11192E] font-semibold"
                                        : "text-gray-600 hover:text-gray-900"
                                        }`}
                                    onClick={() => setTab("login")}
                                >
                                    Iniciar sesión
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm rounded-lg transition ${tab === "registro"
                                        ? "bg-white shadow text-[#11192E] font-semibold"
                                        : "text-gray-600 hover:text-gray-900"
                                        }`}
                                    onClick={() => setTab("registro")}
                                >
                                    Crear cuenta
                                </button>
                            </div>
                        </div>

                        {tab === "login" ? (
                            <form onSubmit={handleLogin} className="mx-auto w-full max-w-md space-y-4">
                                <h2 className="text-center text-2xl font-bold text-[#11192E]">Iniciar sesión</h2>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Usuario</label>
                                    <input
                                        type="text"
                                        value={formLogin.usuario}
                                        onChange={(e) => setFormLogin({ ...formLogin, usuario: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70"
                                        placeholder="Tu usuario"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formLogin.contrasena}
                                        onChange={(e) => setFormLogin({ ...formLogin, contrasena: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-3 top-[30px] text-gray-600"
                                        aria-label="Mostrar/ocultar contraseña"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-[#11192E] py-2 text-sm font-semibold text-white hover:brightness-110"
                                >
                                    Iniciar sesión
                                </button>

                                <p className="text-center text-xs">
                                    ¿No tienes cuenta?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setTab("registro")}
                                        className="text-[#11192E] underline underline-offset-2"
                                    >
                                        Regístrate
                                    </button>
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleRegistro} className="mx-auto w-full max-w-lg space-y-4">
                                <h2 className="text-center text-2xl font-bold text-[#11192E]">Crear cuenta</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre(s)</label>
                                        <input
                                            type="text"
                                            value={formRegistro.nombre}
                                            onChange={(e) => setFormRegistro({ ...formRegistro, nombre: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70"
                                            placeholder="Juan"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Apellidos</label>
                                        <input
                                            type="text"
                                            value={formRegistro.apellido}
                                            onChange={(e) => setFormRegistro({ ...formRegistro, apellido: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70"
                                            placeholder="Pérez"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Usuario</label>
                                    <input
                                        type="text"
                                        value={formRegistro.usuario}
                                        onChange={(e) => setFormRegistro({ ...formRegistro, usuario: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70"
                                        placeholder="usuario123"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Correo electrónico</label>
                                    <input
                                        type="email"
                                        value={formRegistro.email}
                                        onChange={(e) => setFormRegistro({ ...formRegistro, email: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70"
                                        placeholder="tucorreo@dominio.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                                    <select
                                        value={formRegistro.id_rol}
                                        onChange={(e) => setFormRegistro({ ...formRegistro, id_rol: parseInt(e.target.value) })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70"
                                    >
                                        <option value={1}>Administrador</option>
                                        <option value={2}>Miembro</option>
                                        <option value={3}>Espectador</option>
                                        <option value={4}>Invitado</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="relative">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formRegistro.contrasena}
                                            onChange={(e) => setFormRegistro({ ...formRegistro, contrasena: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((s) => !s)}
                                            className="absolute right-3 top-[30px] text-gray-600"
                                            aria-label="Mostrar/ocultar contraseña"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar contraseña</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formRegistro.contrasenaConfirmada}
                                            onChange={(e) =>
                                                setFormRegistro({ ...formRegistro, contrasenaConfirmada: e.target.value })
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#11192E]/70"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((s) => !s)}
                                            className="absolute right-3 top-[30px] text-gray-600"
                                            aria-label="Mostrar/ocultar contraseña"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-[#11192E] py-2 text-sm font-semibold text-white hover:brightness-110"
                                >
                                    Registrarse
                                </button>

                                <p className="text-center text-xs">
                                    ¿Ya tienes cuenta?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setTab("login")}
                                        className="text-[#11192E] underline underline-offset-2"
                                    >
                                        Inicia sesión
                                    </button>
                                </p>
                            </form>
                        )}
                    </div>
                </div>

                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
                        <Bouncy size="45" speed="1.55" color="#11192E" />
                    </div>
                )}
            </div>
        </div>
    );
}
