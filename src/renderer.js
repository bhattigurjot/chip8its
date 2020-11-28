class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.scale = 10;
        this.width = 64 * this.scale;
        this.height = 32 * this.scale;
        this.pixelSize = 1 * this.scale;
        this.resizeCanvas(this.width, this.height);

        this.clearScreen();

        // Test drawing pixel
        this.drawPixel(10,10);
    }

    resizeCanvas(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clearScreen() {
        this.context.fillStyle = 'rgb(0,0,0)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPixel(x, y) {
        this.context.fillStyle = 'rgb(255,255,255)';
        this.context.fillRect(x, y, this.pixelSize, this.pixelSize);
    }
}

export default Renderer;