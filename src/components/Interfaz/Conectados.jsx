export default function Conectados({ name, conectado = true }) {
    return (
        <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold 
            ${conectado ? "border-4 border-green-500" : "border border-red-300"} 
            bg-blue-500 text-white`}
            title={name}
        >
            {name[0]}
        </div>
    );
}
