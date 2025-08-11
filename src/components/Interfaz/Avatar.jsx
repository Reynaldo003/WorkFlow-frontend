export default function Avatar({ name }) {
    return (
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {name[0]}
        </div>
    );
}
