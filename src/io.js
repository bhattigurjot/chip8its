class IO {
    constructor(canvas, rows, cols, scale) {
        // Display
        this.canvas = canvas;
        this.displayContext = canvas.getContext('2d');

        this.scale = scale;
        this.width = cols * this.scale;
        this.height = rows * this.scale;
        this.pixelSize = 1 * this.scale;

        this.resizeCanvas(this.width, this.height);
        this.clearScreen();

        // Keyboard - needs binding otherwise cannot access keypad mappings
        window.addEventListener('keydown', this.keyDownHandler.bind(this), false);
        window.addEventListener('keyup', this.keyUpHandler.bind(this), false);
        this.keypadMap = {
            49: 0x1, // 1:1
            50: 0x2, // 2:2
            51: 0x3, // 3:3
            52: 0xC, // 4:C

            81: 0x4, // q:4
            87: 0x5, // w:5
            69: 0x6, // e:6
            82: 0xD, // r:D

            65: 0x7, // a:7
            83: 0x8, // s:8
            68: 0x9, // d:9
            70: 0xE, // f:E

            90: 0xA, // z:A
            88: 0x0, // x:0
            67: 0xB, // c:B
            86: 0xF  // v:F
        };
        this.keysCurrentlyPressed = [];

        // Audio
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.oscillator = null;
    }

    resizeCanvas = (width, height) => {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clearScreen = () => {
        this.displayContext.fillStyle = 'rgb(0,0,0)';
        this.displayContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPixel = (x, y) => {
        this.displayContext.fillStyle = 'rgb(255,255,255)';
        this.displayContext.fillRect(x, y, this.pixelSize, this.pixelSize);
    }

    keyDownHandler = (event) => {
        this.keysCurrentlyPressed[this.keypadMap[event.keyCode]] = true;
    }
    
    keyUpHandler = (event) => {
        this.keysCurrentlyPressed[this.keypadMap[event.keyCode]] = false;
    }

    createOscillator = () => {
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    }

    playAudio = (play) => {
        if (play) {
            if (this.oscillator == null) {
                this.createOscillator();

                this.oscillator.connect(this.audioContext.destination);
                this.oscillator.start();
            }
        } else {
            if (this.oscillator) {
                this.oscillator.stop();
                this.oscillator.disconnect();
                this.oscillator = null;
            }
        }
    }
}

export default IO;