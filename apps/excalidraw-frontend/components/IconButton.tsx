import { LineChart } from "lucide-react";

export function IconButton({
    icon,
    onClick,
    activated
}: {
    icon: React.ReactNode;
    onClick: () => void;
    activated?: boolean;
}) {
    return (
        <div className={`pointer rounded-full ${activated ? 'text-red-400' : 'text-white'} border-2 p-2 hover:bg-gray-800`} onClick={onClick}>
            {icon}
        </div>
    );
}
