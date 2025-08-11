import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function Modos({ darkMode, setDarkMode }) {
    useEffect(() => {
        const root = document.documentElement;
        root.classList.add("transition-colors", "duration-500");
        if (darkMode) {
            root.classList.add("dark");
            localStorage.setItem("tema", "oscuro");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("tema", "claro");
        }
    }, [darkMode]);

    return (
        <button
            onClick={() => setDarkMode(!darkMode)}
            className="hover:text-blue-500 transition-colors duration-300">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}
