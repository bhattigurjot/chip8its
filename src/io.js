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
        this.display = null;
        this.clearDisplay();

        this.resizeCanvas(this.width, this.height);
        this.clearBackground();

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
        this.keyPressDetector = null;

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

    clearBackground = () => {
        this.displayContext.fillStyle = this.backgroundColor;
        this.displayContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    clearDisplay = () => {
        this.display = new Array(this.cols * this.rows);
        for(let i = 0; i < this.cols*this.rows; i++)
            this.display[i] = 0;
    }

    getPixel = (x,y) => {
        let index = x + (y * this.cols);
        return this.display[index];
    }

    setPixel = (x,y,val) => {
        // Wrap x and y 
        if(x > this.cols)
            x -= this.cols;
        else if(x < 0)
            x += this.cols;

        if(y > this.rows)
            y -= this.rows;
        else if(y<0)
            y += this.rows;

        let index = x + (y * this.cols);
        this.display[index] = val;
    }

    drawPixel = (x, y) => {
        this.displayContext.fillStyle = this.pixelColor;
        this.displayContext.fillRect(x, y, this.pixelSize, this.pixelSize);
    }

    draw = () => {
        this.clearBackground();

        for (let i = 0; i < this.cols*this.rows; i++) {
            // https://softwareengineering.stackexchange.com/a/212813
            let x = (i % this.cols) * this.scale;
            let y = Math.floor(i / this.cols) * this.scale;

            if (this.display[i] == 1) {
                this.drawPixel(x,y);
            }
        }
    }

    /** 
     * Keyboard
    */
    keyDownHandler = (event) => {
        this.keysCurrentlyPressed[this.keypadMap[event.keyCode]] = true;

        // Make sure the keypress is not null
        if (this.keyPressDetector) {
            this.keyPressDetector(this.keypadMap[event.keyCode]);
            // Make it null for the next time
            this.keyPressDetector = null;
        }
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