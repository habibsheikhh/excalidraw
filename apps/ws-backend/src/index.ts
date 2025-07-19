import {WebSocketServer} from 'ws';
import { URLSearchParams } from "url"
import jwt, { JwtPayload } from "jsonwebtoken"

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, request) => {
  const url = request.url
  if(!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1])
  const token = queryParams.get('token') || ""
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "")

  if (!decoded || !(decoded as JwtPayload).userId){
    ws.close()
    return;
  }

  ws.on('message', function message(data) {
    ws.send("pong");
  });
});
