
import { useEffect, useState } from "react";
import { WS_URL } from "../config";

export function useSocket (){
    const [loading, setLoading] = useState(true)
    const [socket, setSocket] = useState<WebSocket>()

    useEffect(() => {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWRhb25xcDcwMDAwazBmc2k4eHRnNzEwIiwiaWF0IjoxNzUyOTU2NzM3LCJleHAiOjE3NTM1NjE1Mzd9.iouyDFTn87MKdmku6IcS7Hj2qX3V2CRwbwmgvsnI_VQ"
        const ws = new WebSocket(`${WS_URL}/?token=${token}`)
        ws.onopen = () => {
            setLoading(false)
            setSocket(ws)
        }
    }, [])
    return {
        socket,
        loading
    }
}