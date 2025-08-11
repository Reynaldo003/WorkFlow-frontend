import { Bell } from "lucide-react";

export default function Notificationes() {
    return (
        <button className="relative hover:text-blue-500">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1">
                3
            </span>
        </button>
    );
}
