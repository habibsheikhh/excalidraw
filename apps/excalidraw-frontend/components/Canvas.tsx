
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Game } from "@/draw/Game";

export type Tool = "pencil" | "rect" | "circle";

export function Canvas ( {roomId, socket}: {roomId: string, socket: WebSocket}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>()
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");

    useEffect(() => {
        game?.setTool(selectedTool)
    }, [selectedTool, game])

    useEffect(() => {  
        if(canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket)
            setGame(g)

            return () => {
                g.destroy()
            }
        }
    }, [canvasRef]);
    return (
        <div style={{
            height: "100vh",
            overflow: "hidden",
        }}>
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
            <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
        </div>
    );
}

function TopBar ({ selectedTool, setSelectedTool }: { selectedTool: string, setSelectedTool: (tool: Tool) => void }) {
    return <div className="fixed top-10 left-10">
        <div className="flex gap-2">
            <IconButton icon={<Pencil />} onClick={() => setSelectedTool("pencil")} activated={selectedTool === "pencil"} />
            <IconButton icon={<RectangleHorizontalIcon />} onClick={() => setSelectedTool("rect")} activated={selectedTool === "rect"} />
            <IconButton icon={<Circle />} onClick={() => setSelectedTool("circle")} activated={selectedTool === "circle"} />
        </div>
    </div>
}