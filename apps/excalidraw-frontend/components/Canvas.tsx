import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";

export function Canvas ( {roomId, socket}: {roomId: string, socket: WebSocket}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if(canvasRef.current) {
            initDraw(canvasRef.current, roomId, socket);
        }
    }, [canvasRef]);
    return (
        <div>
            <canvas ref={canvasRef} width={"2000"} height={"1000"}></canvas>
            <div className="absolute bottom-0 right-0">
                <button className="bg-amber-50 text-black">Rectangle</button>
                <button className="bg-amber-50 text-black">Circle</button>
            </div>
        </div>
    );
}
