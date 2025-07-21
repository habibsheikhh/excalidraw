"use client"

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}) {
    

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWRkNXpqMG8wMDAwazBsb3JiNjlyajZzIiwiaWF0IjoxNzUzMTA1OTcwLCJleHAiOjE3NTM3MTA3NzB9.5FGBI6DUespT9MESKSpiNXCHPf7KNGYEvcDSXxtTsD0`);
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({ type: "join_room", roomId }));
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            ws.close();
        };
    }, [roomId]);


    if(!socket){
        return <div>Connecting to server...</div>;
    }
    return (<Canvas roomId={roomId} socket={socket} />);
}