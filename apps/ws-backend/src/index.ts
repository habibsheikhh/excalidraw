import {WebSocket, WebSocketServer} from 'ws';
import { URLSearchParams } from "url"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { prismaClient } from "@repo/db/prisma"

const wss = new WebSocketServer({ port: 8080 });

interface Users  {
  rooms: string[],
  userId: string,
  ws: WebSocket
}
const users: Users[] = []

function checkUser (token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
      if(typeof decoded == "string") {
      return null
    }
    if(!decoded || !decoded.userId){
      return null
    }
    return decoded.userId
  } catch(e) {
    console.log(e)
  }
  return null
}

wss.on('connection', (ws, request) => {
  const url = request.url
  if(!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1])
  const token = queryParams.get('token') || ""
  const userId = checkUser(token)

  if(userId == null) {
    ws.close()
    return
  }
  users.push({
    userId,
    rooms: [],
    ws
  })
  ws.on('message', async function message(data) {
    let parsedData;
    if(typeof data !== 'string'){
      parsedData = JSON.parse(data.toString())
    }else {
      parsedData = JSON.parse(data)
    }
    console.log(parsedData);
    if(parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws)
      user?.rooms.push(parsedData.roomId)
    }
    else if(parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws)
      if(!user) return
      user?.rooms.filter(x => x != parsedData.roomId)
    }

    if(parsedData.type === "chat") {
      const roomId = parsedData.roomId
      const message = parsedData.message

      try {
        await prismaClient.chat.create({
          data: {
            roomId: Number(roomId),
            message,
            userId
          }
        })

        users.forEach(user => {
          if(user.rooms.includes(roomId)){
            user.ws.send(JSON.stringify({
              type: "chat",
              message,
              roomId
            }))
          }
        })
      }
      catch (e) {
        console.error("Error saving chat message:", e);
        console.log("Something's up!!")
      }
    }
  });
});
