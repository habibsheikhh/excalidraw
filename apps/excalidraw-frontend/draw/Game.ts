import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shapes =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "freehand";
      points: { x: number; y: number }[];
    }
  | {
      type: "triangle";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "arrow";
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
  private selectedTool: Tool = "circle";
  private freehandPoints: { x: number; y: number }[] = [];
  private cameraOffset = { x: 0, y: 0 };
  private isPanning = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  mouseDownHandler = (event: MouseEvent) => {
    if (event.button === 1) {
      this.isPanning = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      return;
    }
    this.clicked = true;
    if (this.selectedTool === "freehand") {
      this.freehandPoints = [
        { x: event.clientX - this.cameraOffset.x, y: event.clientY - this.cameraOffset.y }
      ];
    } else {
      this.startX = event.clientX - this.cameraOffset.x;
      this.startY = event.clientY - this.cameraOffset.y;
    }
  };

  mouseUpHandler = (event: MouseEvent) => {
    if (this.isPanning) {
      this.isPanning = false;
      return;
    }

    this.clicked = false;
    const endX = event.clientX - this.cameraOffset.x;
    const endY = event.clientY - this.cameraOffset.y;
    const width = endX - this.startX;
    const height = endY - this.startY;
    const centerX = this.startX + width / 2;
    const centerY = this.startY + height / 2;
    const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
    const selectedTool = this.selectedTool;
    let shape: Shapes | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (selectedTool === "circle") {
      shape = {
        type: "circle",
        centerX,
        centerY,
        radius,
      };
    } else if (selectedTool === "pencil") {
      shape = {
        type: "pencil",
        startX: this.startX,
        startY: this.startY,
        endX,
        endY,
      };
    } else if (selectedTool === "freehand") {
      shape = {
        type: "freehand",
        points: [...this.freehandPoints],
      };
    } else if (selectedTool === "triangle") {
      shape = {
        type: "triangle",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (selectedTool === "arrow") {
      shape = {
        type: "arrow",
        startX: this.startX,
        startY: this.startY,
        endX,
        endY,
      };
    }

    if (!shape) return;

    this.existingShapes.push(shape);
    this.clearCanvas();
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );
  };

  mouseMoveHandler = (event: MouseEvent) => {
    if (this.isPanning) {
      const dx = event.clientX - this.lastMouseX;
      const dy = event.clientY - this.lastMouseY;
      this.cameraOffset.x += dx;
      this.cameraOffset.y += dy;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      this.clearCanvas();
      return;
    }

    if (this.clicked) {
      const mouseX = event.clientX - this.cameraOffset.x;
      const mouseY = event.clientY - this.cameraOffset.y;
      const width = mouseX - this.startX;
      const height = mouseY - this.startY;

      this.clearCanvas();
      this.ctx.strokeStyle = "rgba(255, 255, 255)";
      const selectedTool = this.selectedTool;

      if (selectedTool === "rect") {
        this.ctx.strokeRect(this.startX + this.cameraOffset.x, this.startY + this.cameraOffset.y, width, height);
      } else if (selectedTool === "circle") {
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX + this.cameraOffset.x, centerY + this.cameraOffset.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (selectedTool === "pencil") {
        const endX = mouseX;
        const endY = mouseY;
        this.ctx.strokeStyle = "white";
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX + this.cameraOffset.x, this.startY + this.cameraOffset.y);
        this.ctx.lineTo(endX + this.cameraOffset.x, endY + this.cameraOffset.y);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (selectedTool === "freehand") {
        this.freehandPoints.push({ x: mouseX, y: mouseY });
        this.ctx.strokeStyle = "white";
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        const first = this.freehandPoints[0];
        this.ctx.moveTo(first.x + this.cameraOffset.x, first.y + this.cameraOffset.y);
        for (let i = 1; i < this.freehandPoints.length; i++) {
          this.ctx.lineTo(this.freehandPoints[i].x + this.cameraOffset.x, this.freehandPoints[i].y + this.cameraOffset.y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (selectedTool === "triangle") {
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX + width / 2 + this.cameraOffset.x, this.startY + this.cameraOffset.y);
        this.ctx.lineTo(this.startX + this.cameraOffset.x, this.startY + height + this.cameraOffset.y);
        this.ctx.lineTo(this.startX + width + this.cameraOffset.x, this.startY + height + this.cameraOffset.y);
        this.ctx.closePath();
        this.ctx.stroke();
      } else if (selectedTool === "arrow") {
        const endX = mouseX;
        const endY = mouseY;
        this.ctx.strokeStyle = "white";
        this.ctx.fillStyle = "white";
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = "round";
        this.drawArrow(
          this.startX + this.cameraOffset.x,
          this.startY + this.cameraOffset.y,
          endX + this.cameraOffset.x,
          endY + this.cameraOffset.y
        );
      }
    }
  };

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShapes = JSON.parse(message.message);
        this.existingShapes.push(parsedShapes.shape);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeStyle = "white";
        this.ctx.strokeRect(shape.x + this.cameraOffset.x, shape.y + this.cameraOffset.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX + this.cameraOffset.x,
          shape.centerY + this.cameraOffset.y,
          shape.radius,
          0,
          Math.PI * 2
        );
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil") {
        this.ctx.strokeStyle = "white";
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX + this.cameraOffset.x, shape.startY + this.cameraOffset.y);
        this.ctx.lineTo(shape.endX + this.cameraOffset.x, shape.endY + this.cameraOffset.y);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "freehand") {
        if (shape.points.length < 2) return;
        this.ctx.strokeStyle = "white";
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(shape.points[0].x + this.cameraOffset.x, shape.points[0].y + this.cameraOffset.y);
        for (let i = 1; i < shape.points.length; i++) {
          this.ctx.lineTo(shape.points[i].x + this.cameraOffset.x, shape.points[i].y + this.cameraOffset.y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "triangle") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x + shape.width / 2 + this.cameraOffset.x, shape.y + this.cameraOffset.y);
        this.ctx.lineTo(shape.x + this.cameraOffset.x, shape.y + shape.height + this.cameraOffset.y);
        this.ctx.lineTo(shape.x + shape.width + this.cameraOffset.x, shape.y + shape.height + this.cameraOffset.y);
        this.ctx.closePath();
        this.ctx.stroke();
      } else if (shape.type === "arrow") {
        this.ctx.strokeStyle = "white";
        this.ctx.fillStyle = "white";
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = "round";
        this.drawArrow(
          shape.startX + this.cameraOffset.x,
          shape.startY + this.cameraOffset.y,
          shape.endX + this.cameraOffset.x,
          shape.endY + this.cameraOffset.y
        );
      }
    });
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  private drawArrow(startX: number, startY: number, endX: number, endY: number) {
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx);
    const headLength = 12;
    const arrowAngle = Math.PI / 7;

    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(endX, endY);
    this.ctx.lineTo(
      endX - headLength * Math.cos(angle - arrowAngle),
      endY - headLength * Math.sin(angle - arrowAngle)
    );
    this.ctx.lineTo(
      endX - headLength * Math.cos(angle + arrowAngle),
      endY - headLength * Math.sin(angle + arrowAngle)
    );
    this.ctx.lineTo(endX, endY);
    this.ctx.closePath();
    this.ctx.fill();
  }
}
