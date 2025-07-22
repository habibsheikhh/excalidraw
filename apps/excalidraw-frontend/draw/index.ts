import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shapes = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    type: "circle",
    centerX: number,
    centerY: number,
    radius: number
} | {
  type: "pencil";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
  let existingShapes: Shapes[] = await getExistingShapes(roomId);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if(message.type === "chat") {
        const parsedShapes = JSON.parse(message.message);
        console.log("Parsed Shape")
        console.log(parsedShapes.shape)
        existingShapes.push(parsedShapes.shape);
        clearCanvas(existingShapes, canvas, ctx);
    }
  }

  clearCanvas(existingShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (event) => {
    clicked = true;
    startX = event.clientX;
    startY = event.clientY;
  });

  canvas.addEventListener("mouseup", (event) => {
    clicked = false;
    const width = event.clientX - startX;
    const height = event.clientY - startY;
    const centerX = startX + width/2
    const centerY = startY + height/2
    const radius = Math.max(width, height) / 2
    //@ts-ignore
    const selectedTool = window.selectedTool;
    let shape: Shapes | null = null;
    if(selectedTool==="rect") {
      shape = {
        //@ts-ignore
        type: window.selectedTool,
        x: startX,
        y: startY,
        width: width,
        height: height,
      }
    }
    else if(selectedTool==="circle") {
      shape = {
        //@ts-ignore
        type: window.selectedTool,
        centerX,
        centerY,
        radius
        //centerX: startX + radius
        //centerY: startY + radius
      }
    } 

    if(!shape){
      return
    }
    
    existingShapes.push(shape); 

    socket.send(JSON.stringify({
        type: "chat",
        message: JSON.stringify({shape}),
        roomId
    }))
  });

  canvas.addEventListener("mousemove", (event) => {
    if (clicked) {
      const width = event.clientX - startX;
      const height = event.clientY - startY;

      clearCanvas(existingShapes, canvas, ctx);
      ctx.strokeStyle = "rgba(255, 255, 255)";
      //@ts-ignore
      const selectedTool = window.selectedTool
      if(selectedTool === "rect") {
        ctx.strokeRect(startX, startY, width, height);
      }
      else if (selectedTool === "circle"){
        const centerX = startX + width/2
        const centerY = startY + height/2
        const radius = Math.max(width, height) / 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI*2)
        ctx.stroke()
        ctx.closePath()
      }
    }
  });
}


function clearCanvas(existingShapes: Shapes[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    existingShapes.map((shape) => {
        if(shape.type==="rect"){
            ctx.strokeStyle = "rgb(255, 255, 255)";
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
        else if (shape.type === "circle"){
        ctx.beginPath()
        ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI*2)
        ctx.stroke()
        ctx.closePath()
      }
    })
}

async function getExistingShapes(roomId: string) {
    const response = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages =  response.data.messages;
    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message);
        return messageData.shape
    })
    return shapes;
}
