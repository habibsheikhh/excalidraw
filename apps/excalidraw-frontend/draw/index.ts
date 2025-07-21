export function initDraw(canvas: HTMLCanvasElement) {
            const ctx = canvas.getContext("2d");
            if(!ctx) return;

            ctx.fillStyle = "rgba(0, 0, 0)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            
            let clicked = false;
            let startX = 0;
            let startY = 0;
            canvas.addEventListener("mousedown", (event) => {
                clicked = true;
                startX = event.clientX;
                startY = event.clientY;
                console.log("mousedown", startX, startY);
            });
            canvas.addEventListener("mouseup", (event) => {
                clicked = false;
                console.log(event.clientX)
                console.log(event.clientY)
            });
            canvas.addEventListener("mousemove", (event) => {
                if (clicked) {
                    const width = event.clientX - startX;
                    const height = event.clientY - startY;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    ctx.fillStyle = "rgba(0, 0, 0)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.strokeStyle = "rgba(255, 255, 255)";
                    ctx.strokeRect(startX, startY, width, height);
                }
                 
            });
}