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
  private canvasRef: HTMLCanvasElement;
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
  private scale = 1;
  private selectedShapeIndex: number | null = null;

  

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.canvasRef = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
    this.canvas.style.cursor = "default";
    this.canvas.style.cursor = "default";
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  mouseDownHandler = (event: MouseEvent) => {
    if (event.target !== this.canvasRef) return;
    //@ts-ignore
    if (this.selectedTool === "hand") {
        this.isPanning = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.canvas.style.cursor = "default";
        return; // skip drawing tools
    }
    if (event.button === 1) {
      this.isPanning = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      return;
    }
    this.clicked = true;
    if (this.selectedTool === "freehand") {
      this.freehandPoints = [
        { x: (event.clientX - this.cameraOffset.x) / this.scale, y: (event.clientY - this.cameraOffset.y) / this.scale }
      ];
    } else {
      this.startX = (event.clientX - this.cameraOffset.x) / this.scale
      this.startY = (event.clientY - this.cameraOffset.y) / this.scale
    }
  };

  mouseUpHandler = (event: MouseEvent) => {
    if (event.target !== this.canvasRef) return;
    if (this.isPanning) {
        this.isPanning = false;
        this.canvas.style.cursor = "default";
    }

    this.clicked = false;
    const endX = (event.clientX - this.cameraOffset.x) / this.scale
    const endY = (event.clientY - this.cameraOffset.y) / this.scale
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
    if (event.target !== this.canvasRef) return;
  // ⛳ Always clear the canvas before any drawing
  this.clearCanvas();

  // 🧭 Handle panning
  if (this.isPanning) {
    const dx = event.clientX - this.lastMouseX;
    const dy = event.clientY - this.lastMouseY;
    this.cameraOffset.x += dx;
    this.cameraOffset.y += dy;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    // Re-draw existing shapes with updated pan
    this.clearCanvas(); // your clearCanvas should internally apply transform and re-draw
    return;
  }

  // 🎯 Handle shape preview when mouse is clicked
  if (this.clicked) {
    // ✅ Apply zoom + pan transform
    this.ctx.setTransform(this.scale, 0, 0, this.scale, this.cameraOffset.x, this.cameraOffset.y);

    const mouseX = (event.clientX - this.cameraOffset.x) / this.scale;
    const mouseY = (event.clientY - this.cameraOffset.y) / this.scale;
    const width = mouseX - this.startX;
    const height = mouseY - this.startY;

    this.ctx.strokeStyle = "black";
    const selectedTool = this.selectedTool;

    switch (selectedTool) {
      case "rect":
        this.ctx.strokeRect(this.startX, this.startY, width, height);
        break;

      case "circle": {
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
        break;
      }

      case "pencil": {
        const endX = mouseX;
        const endY = mouseY;
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        this.ctx.closePath();
        break;
      }

      case "freehand": {
        this.freehandPoints.push({ x: mouseX, y: mouseY });
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        const first = this.freehandPoints[0];
        this.ctx.moveTo(first.x, first.y);
        for (let i = 1; i < this.freehandPoints.length; i++) {
          this.ctx.lineTo(this.freehandPoints[i].x, this.freehandPoints[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
        break;
      }

      case "triangle":
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX + width / 2, this.startY);
        this.ctx.lineTo(this.startX, this.startY + height);
        this.ctx.lineTo(this.startX + width, this.startY + height);
        this.ctx.closePath();
        this.ctx.stroke();
        break;

      case "arrow": {
        const endX = mouseX;
        const endY = mouseY;
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = "round";
        this.drawArrow(this.startX, this.startY, endX, endY);
        break;
      }
    }

    // 🧹 Reset transform to default
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
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
  // Reset transform and clear full canvas
  this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Apply camera transform for infinite pan & zoom
  this.ctx.setTransform(this.scale, 0, 0, this.scale, this.cameraOffset.x, this.cameraOffset.y);

  // Optional: Draw a subtle grid (you can comment this out if you don't want it)
  const gridSize = 50;
  this.ctx.strokeStyle = "rgba(0,0,0,0.05)"; // light grey grid lines
  for (let x = -this.cameraOffset.x / this.scale % gridSize; x < this.canvas.width / this.scale; x += gridSize) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.canvas.height / this.scale);
    this.ctx.stroke();
  }
  for (let y = -this.cameraOffset.y / this.scale % gridSize; y < this.canvas.height / this.scale; y += gridSize) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(this.canvas.width / this.scale, y);
    this.ctx.stroke();
  }

  // Fill canvas with white background
  this.ctx.fillStyle = "white";
  this.ctx.fillRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);

  // Draw all existing shapes in black
  this.ctx.strokeStyle = "black";
  this.ctx.fillStyle = "black";

  this.existingShapes.forEach((shape) => {
    this.ctx.lineWidth = 2;

    if (shape.type === "rect") {
      this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      this.ctx.beginPath();
      this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (shape.type === "pencil") {
      this.ctx.beginPath();
      this.ctx.moveTo(shape.startX, shape.startY);
      this.ctx.lineTo(shape.endX, shape.endY);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (shape.type === "freehand") {
      if (shape.points.length < 2) return;
      this.ctx.beginPath();
      this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
      for (let i = 1; i < shape.points.length; i++) {
        this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
      }
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (shape.type === "triangle") {
      this.ctx.beginPath();
      this.ctx.moveTo(shape.x + shape.width / 2, shape.y);
      this.ctx.lineTo(shape.x, shape.y + shape.height);
      this.ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
      this.ctx.closePath();
      this.ctx.stroke();
    } else if (shape.type === "arrow") {
      this.ctx.lineJoin = "round";
      this.drawArrow(shape.startX, shape.startY, shape.endX, shape.endY);
    }
  });
}


  private handleZoom = (e: WheelEvent) => {
    const zoomFactor = 1.1;
    const delta = e.deltaY < 0 ? 1 : -1;
    const oldScale = this.scale;

    // Get mouse position relative to canvas
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - this.cameraOffset.x) / this.scale;
    const mouseY = (e.clientY - rect.top - this.cameraOffset.y) / this.scale;

    // Update scale
    this.scale *= delta > 0 ? zoomFactor : 1 / zoomFactor;
    this.scale = Math.max(0.2, Math.min(5, this.scale)); // Limit zoom

    // Adjust camera offset to zoom around mouse pointer
    this.cameraOffset.x -= (mouseX * this.scale - mouseX * oldScale);
    this.cameraOffset.y -= (mouseY * this.scale - mouseY * oldScale);

    this.clearCanvas();
    };

    private isInsideShape(shape: Shapes, x: number, y: number): boolean {
        if (shape.type === "rect") {
            return (
            x >= shape.x &&
            x <= shape.x + shape.width &&
            y >= shape.y &&
            y <= shape.y + shape.height
            );
        }

        if (shape.type === "circle") {
            const dx = x - shape.centerX;
            const dy = y - shape.centerY;
            return dx * dx + dy * dy <= shape.radius * shape.radius;
        }

        if (shape.type === "triangle") {
            return (
            x >= shape.x &&
            x <= shape.x + shape.width &&
            y >= shape.y &&
            y <= shape.y + shape.height
            );
        }

        if (shape.type === "arrow" || shape.type === "pencil") {
            const minX = Math.min(shape.startX, shape.endX) - 5;
            const maxX = Math.max(shape.startX, shape.endX) + 5;
            const minY = Math.min(shape.startY, shape.endY) - 5;
            const maxY = Math.max(shape.startY, shape.endY) + 5;
            return x >= minX && x <= maxX && y >= minY && y <= maxY;
        }

        if (shape.type === "freehand") {
            // Check if (x, y) is near any point in the freehand path
            for (let i = 0; i < shape.points.length; i++) {
            const point = shape.points[i];
            const dx = x - point.x;
            const dy = y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= 5) return true;
            }
            return false;
        }

        return false;
        }


  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mousedown", (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.cameraOffset.x) / this.scale;
        const y = (e.clientY - rect.top - this.cameraOffset.y) / this.scale;

        this.selectedShapeIndex = null;

        // Loop in reverse to prioritize topmost shape
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
            const shape = this.existingShapes[i];
            if (this.isInsideShape(shape, x, y)) {
            this.selectedShapeIndex = i;
            break;
            }
        }

        // Optional: draw a highlight around selected shape
        });
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("wheel", this.handleZoom);
    this.canvas.addEventListener("mouseleave", this.mouseUpHandler);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
            if (this.selectedShapeIndex !== null) {
            this.existingShapes.splice(this.selectedShapeIndex, 1);
            this.selectedShapeIndex = null;
            this.clearCanvas(); // re-render
            }
        }
    });  
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
