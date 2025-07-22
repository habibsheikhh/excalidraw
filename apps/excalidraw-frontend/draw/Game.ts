import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

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
};

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shapes[];
    private roomId: string;
    private socket: WebSocket;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle"

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false
        this.init();
        this.initHandlers();
        this.initMouseHandlers()
    }

    destroy () {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }
    mouseDownHandler = (event: MouseEvent) => {
            this.clicked = true;
            this.startX = event.clientX;
            this.startY = event.clientY;
    }
    mouseUpHandler = (event: MouseEvent) => {
            this.clicked = false;
            const width = event.clientX - this.startX;
            const height = event.clientY - this.startY;
            const centerX = this.startX + width/2
            const centerY = this.startY + height/2
            const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
            //@ts-ignore
            const selectedTool = this.selectedTool;
            let shape: Shapes | null = null;
            if(selectedTool==="rect") {
                shape = {
                    type: "rect",
                    x: this.startX,
                    y: this.startY,
                    width: width,
                    height: height,
                }
            }
            else if(selectedTool==="circle") {
                shape = {
                    //@ts-ignore
                    type: "circle",
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
        
        this.existingShapes.push(shape); 
        this.clearCanvas();
        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({shape}),
            roomId: this.roomId
        }))
    }
    mouseMoveHandler = (event: MouseEvent) => {
        if (this.clicked) {
            const width = event.clientX - this.startX;
            const height = event.clientY - this.startY;

            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(255, 255, 255)";
            //@ts-ignore
            const selectedTool = this.selectedTool
            if(selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            }
            else if (selectedTool === "circle"){
                const centerX = this.startX + width/2
                const centerY = this.startY + height/2
                const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
                this.ctx.beginPath()
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI*2)
                this.ctx.stroke()
                this.ctx.closePath()
            }
        }
    }
    setTool (tool: Tool) {
        this.selectedTool = tool
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas()
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "chat") {
                const parsedShapes = JSON.parse(message.message);
                console.log("Parsed Shape");
                console.log(parsedShapes.shape);
                this.existingShapes.push(parsedShapes.shape);
                this.clearCanvas();
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.forEach((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = "rgb(255, 255, 255)";
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.strokeStyle = "rgb(255, 255, 255)";
                this.ctx.stroke();
                this.ctx.closePath();
            }
        });
    }
    initMouseHandlers () {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);

        this.canvas.addEventListener("mouseup", this.mouseUpHandler);

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}
