"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const [roomId, setRoomId] = useState("")
  const router = useRouter();
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      gap: "20px",
      width: "100vw"
    }}>
      <input style={{
        padding: "15px",
        width: "300px",
        border: "1px solid black",
        borderRadius: "5px",
        fontSize: "16px"
      }} value={roomId} placeholder="Room Id" onChange={(e) => {
        setRoomId(e.target.value)
      }} />
      <button style={{
        padding: "15px",
        backgroundColor: "black",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px"
      }} onClick={() => {
        router.push(`/room/${roomId}`);
      }}>Join Room</button>
    </div>
  );
}
