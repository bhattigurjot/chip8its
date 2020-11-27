class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.width = 100;
        this.height = 100;
        this.resize_canvas(this.width, this.height);

        this.clear_screen();
    }

    resize_canvas(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clear_screen() {
        this.context.fillStyle = 'rgb(0,0,0)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default Renderer;