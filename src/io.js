class IO {
    constructor(canvas, cols, rows, scale) {
        // Display
        this.canvas = canvas;
        this.displayContext = canvas.getContext('2d');
        this.backgroundColor = 'rgb(0,0,0)';
        this.pixelColor = 'rgb(255,255,255)';

        this.cols = cols;
        this.rows = rows;
        this.scale = scale;

        this.width = this.cols * this.scale;
        this.height = this.rows * this.scale;
        this.pixelSize = 1 * this.scale;
        this.display = Array[cols*rows];

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

    /** 
     * Display
    */
    resizeCanvas = (width, height) => {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clearScreen = () => {
        this.displayContext.fillStyle = this.backgroundColor;
        this.displayContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    togglePixelAndReturn = (x,y) => {
        let index = x + (y * this.cols);
        // Toggle pixel using XOR
        this.display[index] ^= 1;

        return this.display[index];
    }

    drawPixel = (x, y) => {
        this.displayContext.fillStyle = pixelColor;
        this.displayContext.fillRect(x, y, this.pixelSize, this.pixelSize);
    }

    draw = () => {
        this.clearScreen();

        for (let i = 0; i < this.display.length; i++) {
            // https://softwareengineering.stackexchange.com/a/212813
            let x = i % this.width;
            let y = i / this.width;
            this.drawPixel(x,y);
        }
    }

    /** 
     * Keyboard
    */
    keyDownHandler = (event) => {
        this.keysCurrentlyPressed[this.keypadMap[event.keyCode]] = true;
    }
    
    keyUpHandler = (event) => {
        this.keysCurrentlyPressed[this.keypadMap[event.keyCode]] = false;
    }

    /** 
     * Audio
    */
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