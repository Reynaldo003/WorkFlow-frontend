import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bouncy } from 'ldrs/react'
import 'ldrs/react/Bouncy.css'

function LoginRegistro() {
    const [mostrarLogin, setMostrarLogin] = useState(true);
    const [formLogin, setFormLogin] = useState({ usuario: "", contrasena: "" });
    const [formRegistro, setFormRegistro] = useState({
        nombre: "",
        apellido: "",
        usuario: "",
        email: "",
        contrasena: "",
        contrasenaConfirmada: "",
        id_rol: 2
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);


    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await fetch("https://workflow-backend-production-991d.up.railway.app/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario: formLogin.usuario, contrasena: formLogin.contrasena }),
        });
        const data = await res.json();
        if (res.status === 200) {
            localStorage.setItem("token", data.token);
            navigate("/");
        } else {
            alert("Error: " + (data.detail || "credenciales inválidas"));
            setIsLoading(false);
        }
    };

    const handleRegistro = async (e) => {
        e.preventDefault();
        if (formRegistro.contrasena !== formRegistro.contrasenaConfirmada) {
            alert("Las contraseñas no coinciden");
            return;
        }
        const res = await fetch("https://workflow-backend-production-991d.up.railway.app/register/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario: formRegistro.usuario,
                correo: formRegistro.email,
                contrasena: formRegistro.contrasena,
                nombre: formRegistro.nombre,
                apellido: formRegistro.apellido,
                id_rol: formRegistro.id_rol
            }),
        });
        const data = await res.json();
        if (res.status === 201) {
            setMensaje("Registro exitoso, por favor inicia sesión.");
            setMostrarLogin(true);
        } else {
            alert("Error: " + JSON.stringify(data));
        }
    };

    return (

        <div className=" bg-gradient-to-br from-[#314b8f] to-[#0f2866] min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
            {mensaje && <p className="text-green-600">{mensaje}</p>}

            <div className="relative w-full max-w-4xl h-[550px] bg-white shadow-2xl rounded-xl overflow-hidden">
                <motion.div
                    initial={false}
                    animate={{ x: mostrarLogin ? "12.5%" : "-38%" }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-0 left-0 w-[200%] h-full grid grid-cols-2"
                >
                    <div className="flex flex-col justify-center items-center px-6 sm:px-8">
                        <h2 className="text-2xl font-bold text-[#11192E] mb-6 text-center">Iniciar sesión</h2>
                        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-5">
                            <input
                                type="text"
                                placeholder="Usuario"
                                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#005072]"
                                value={formLogin.usuario}
                                onChange={(e) => setFormLogin({ ...formLogin, usuario: e.target.value })}
                                required
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Contraseña"
                                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#005072]"
                                    value={formLogin.contrasena}
                                    onChange={(e) => setFormLogin({ ...formLogin, contrasena: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-4 text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#11192E] text-white p-3 rounded hover:bg-[#0074a8] transition"
                            >
                                Iniciar sesión
                            </button>
                            <p className="text-sm text-center text-[#11192E] cursor-pointer hover:underline" onClick={() => setMostrarLogin(false)}>
                                ¿No tienes cuenta? Registrate
                            </p>
                        </form>
                    </div>

                    <div className="flex flex-col justify-center items-center px-6 sm:px-8">
                        <h2 className="mt-0 text-2xl font-bold text-[#11192E] mb-0 text-center">Crear cuenta</h2>
                        <form onSubmit={handleRegistro} className="w-full max-w-md mx-auto space-y-6 pt-7 pl-10 pr-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Nombre(s)"
                                        className="w-full py-2 px-3 border text-base rounded focus:outline-none focus:ring-2 focus:ring-[#005072]"
                                        value={formRegistro.nombre}
                                        onChange={(e) => setFormRegistro({ ...formRegistro, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Apellidos"
                                        className="w-full py-2 px-3 border text-base rounded focus:outline-none focus:ring-2 focus:ring-[#005072]"
                                        value={formRegistro.apellido}
                                        onChange={(e) => setFormRegistro({ ...formRegistro, apellido: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Usuario"
                                    className="w-full py-2 px-3 border text-base rounded focus:outline-none focus:ring-2 focus:ring-[#005072]"
                                    value={formRegistro.usuario}
                                    onChange={(e) => setFormRegistro({ ...formRegistro, usuario: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    className="w-full py-2 px-3 border text-base rounded focus:outline-none focus:ring-2 focus:ring-[#005072]"
                                    value={formRegistro.email}
                                    onChange={(e) => setFormRegistro({ ...formRegistro, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <select
                                    value={formRegistro.id_rol}
                                    className="w-full py-2 px-3 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#005072]"
                                    onChange={(e) => setFormRegistro({ ...formRegistro, id_rol: parseInt(e.target.value) })}
                                >
                                    <option value={1}>Administrador</option>
                                    <option value={2}>Miembro</option>
                                    <option value={3}>Espectador</option>
                                    <option value={4}>Invitado</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Contraseña"
                                        className="w-full py-2 px-3 border text-base rounded focus:outline-none focus:ring-2 focus:ring-[#005072] pr-10"
                                        value={formRegistro.contrasena}
                                        onChange={(e) => setFormRegistro({ ...formRegistro, contrasena: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirmar contraseña"
                                        className="w-full py-2 px-3 border text-base rounded focus:outline-none focus:ring-2 focus:ring-[#005072] pr-10"
                                        value={formRegistro.contrasenaConfirmada}
                                        onChange={(e) => setFormRegistro({ ...formRegistro, contrasenaConfirmada: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    className="w-full bg-[#11192E] text-white py-2 rounded hover:bg-[#0074a8] transition"
                                >
                                    Registrarse
                                </button>

                                <p
                                    className="text-sm text-center text-[#11192E] cursor-pointer hover:underline"
                                    onClick={() => setMostrarLogin(true)}
                                >
                                    ¿Ya tienes cuenta? Inicia sesión
                                </p>
                            </div>
                        </form>

                    </div>
                </motion.div>
                {
                    isLoading && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
                            <Bouncy size="45" speed="1.55" color="#11192E" />
                        </div>
                    )
                }
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="z-10 absolute top-0 w-1/2 h-full bg-[#11192E] text-white flex flex-col justify-center items-center px-6 sm:px-10 transition-all duration-500"
                    style={{ left: mostrarLogin ? "0%" : "0%" }}
                >
                    <motion.img
                        src="/ryr.png"
                        className="w-28 mb-6"
                        alt="Logo RYR"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, repeatDelay: 8, duration: 2 }}
                    />
                    <p className="text-center text-base leading-relaxed max-w-xs">
                        {mostrarLogin
                            ? "Bienvenido de nuevo. Ingresa con tus credenciales para continuar."
                            : "Crea una cuenta para acceder al CRM y gestionar tus prospectos."}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default LoginRegistro;