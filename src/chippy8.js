import IO from "./io";

class Chippy8 {
    constructor(canvas) {
        this.io = new IO(canvas, 64, 32, 10);
        
        this.memory = new Uint8Array(4096);
        this.pc = 0x200;
        this.i = 0;
        this.stack = [];
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.v = new Uint8Array(16);
        this.fonts = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];
    }

    uploadRomToMemory = (rom) => {
        // Add fonts to memory
        for (let i = 0; i < this.fonts.length; i++) {
            this.memory[i] = this.fonts[i];
        }

        // Load rom to memory
        const data = new Uint8Array(rom);
        // console.log(data);
        for (let i = 0; i < data.length; i++) {
            this.memory[0x200 + i] = data[i];            
        }

        console.log("Rom uploaded to memory");
    }

    emulatorLoop = () => {
        for (let iteration = 0; iteration < 10; iteration++) {
            // FETCH
            let oc = this.memory[this.pc] << 8 | this.memory[this.pc + 1];
            // DECODE AND EXECUTE
            this.decode(oc);
        }

        this.io.draw();
    }

    decode = (oc) => {
        // Increment PC by 2 to fetch next opcode 
        this.pc += 2;
    
        // X: The second nibble. Used to look up one of the 16 registers (VX) from V0 through VF.
        // Y: The third nibble. Also used to look up one of the 16 registers (VY) from V0 through VF.
        // N: The fourth nibble. A 4-bit number.
        // NN: The second byte (third and fourth nibbles). An 8-bit immediate number.
        // NNN: The second, third and fourth nibbles. A 12-bit immediate memory address.

        // x and y is required to look up a value in the corresponding register
        let x = (oc & 0x0F00) >> 8;
        let y = (oc & 0x00F0) >> 4;

        switch (oc & 0xF000) {
            case 0x0000:
                switch (oc) {
                    case 0x00E0: // 00E0 - CLS
                        this.io.clearDisplay();
                        break;
                    case 0x00EE: // 00EE - RET
                        this.pc = this.stack.pop();
                        // this.stackpointer -= 1
                        break;
                }
                break;
            case 0x1000: // 1NNN - JP addr
                this.pc = (oc & 0xFFF);
                break;
            case 0x2000: // 2NNN - CALL addr
                this.stack.push(this.pc);
                this.pc = (oc & 0xFFF);
                break;
            case 0x3000: // 3XNN - SE Vx, byte
                if (this.v[x] == (oc & 0xFF)) {
                    this.pc += 2;
                } 
                break;
            case 0x4000: // 4XNN - SNE Vx, byte
                if (this.v[x] != (oc & 0xFF)) {
                    this.pc += 2;
                }
                break;
            case 0x5000: // 5XNN - SE Vx, Vy
                if (this.v[x] == this.v[y]) {
                    this.pc += 2;
                }
                break;
            case 0x6000: // 6XNN - LD Vx, byte
                this.v[x] = (oc & 0xFF); 
                break;
            case 0x7000: // 7XNN - ADD Vx, byte
                this.v[x] += (oc & 0xFF); 
                break;
            // ALU
            case 0x8000: 
                switch (oc & 0x000F) {
                    case 0x0: // 8XY0 - LD Vx, Vy
                        this.v[x] = this.v[y];
                        break;
                    case 0x1: // 8XY1 - OR Vx, Vy
                        this.v[x] = this.v[x] | this.v[y];
                        break;
                    case 0x2: // 8XY2 - AND Vx, Vy
                        this.v[x] = this.v[x] & this.v[y];
                        break;
                    case 0x3: // 8XY3 - XOR Vx, Vy
                        this.v[x] = this.v[x] ^ this.v[y];
                        break;
                    case 0x4: // 8XY4 - ADD Vx, Vy
                        let res = this.v[x] + this.v[y];
                        if (res > 255)
                            this.v[0xF] = 1;
                        else
                            this.v[0xF] = 0;

                        this.v[x] = (res & 0xFF);
                        break;
                    case 0x5: // 8XY5 - SUB Vx, Vy
                        if (this.v[x] > this.v[y])
                            this.v[0xF] = 1;
                        else
                            this.v[0xF] = 0;

                        this.v[x] -= this.v[y];
                        break;
                    case 0x6: // 8XY6 - SHR Vx {, Vy}
                        if ((this.v[x] & 0x1) == 1)
                            this.v[0xF] = 1;
                        else 
                            this.v[0xF] = 0;

                        this.v[x] /= 2;
                        break;
                    case 0x7: // 8XY7 - SUBN Vx, Vy
                        if (this.v[y] > this.v[x])
                            this.v[0xF] = 1;
                        else
                            this.v[0xF] = 0;

                        this.v[x] = this.v[y] - this.v[x];
                        break;
                    case 0xE: // 8XYE - SHL Vx {, Vy}
                        if ((this.v[x] >> 0xF) == 1)
                            this.v[0xF] = 1;
                        else
                            this.v[0xF] = 0;

                        this.v[x] *= 2;
                        break;
                    default:
                        console.error("Wrong opcode for ALU: " + oc);
                        break;
                }
                break;
            case 0xA000: // ANNN - LD I, addr
                this.i = (oc & 0xFFF);
                break;
            case 0xB000: // BNNN - JP V0, addr
                this.pc = this.v[0x0] + (oc & 0xFFF);
                break;
            case 0xC000: // CXNN - RND Vx, byte
                let random = Math.floor(Math.random() * 255);
                this.v[x] = random & (oc & 0xFF);
                break;
            case 0xD000: // DXYN - DRW Vx, Vy, nibble
                let xCoord = this.v[x];
                let yCoord = this.v[y];
                let rows = oc & 0xF; // N rows
                
                // Set VF to 0
                this.v[0xF] = 0;

                for (let row = 0; row < rows; row++) {
                    let spriteData = this.memory[this.i + row];
                    
                    for (let pix = 0; pix < 8; pix++) {                        
                        xCoord = this.v[x] + pix;
                        yCoord = this.v[y] + row;

                        // 0x80      == 1000 0000
                        // 0x80 >> 0 == 1000 0000
                        // 0x80 >> 1 == 0100 0000
                        // 0x80 >> 7 == 0000 0001
                        let mask = 0x80 >> pix;
                        let currSpritePixel = (spriteData & mask); 
                        let screenPixel = this.io.getPixel(xCoord, yCoord);
                        
                        // Current pixel in Sprite is on
                        // Screen pixel is on
                        // Turn off the pixel and set VF to 1
                        
                        // Current pixel in Sprite is on
                        // Screen pixel is off
                        // Draw pixel at coords
                        if (currSpritePixel != 0) {
                            if (screenPixel == 1) {
                                this.io.setPixel(xCoord, yCoord, 0);
                                // Set VF to 1
                                this.v[0xF] = 1;
                            }
                            else {
                                this.io.setPixel(xCoord, yCoord, 1);
                            }
                        }
                    }
                }
                break;
                case 0xE000:
                    switch (oc & 0xFF) {
                        case 0x9E: // EX9E - SKP Vx
                            // key pressed
                            if (this.io.keysCurrentlyPressed[this.v[x]])
                                this.pc += 2;
                            break;
                        case 0xA1: // EXA1 - SKNP Vx
                            // key not pressed
                            if (!this.io.keysCurrentlyPressed[this.v[x]])
                                this.pc += 2;
                            break;
                    }
                    break;
                case 0xF000: 
                    switch (oc & 0xFF) {
                        case 0x07: // FX07 - LD Vx, DT
                            this.v[x] = this.delayTimer;
                            break;
                        case 0x0A: // FX0A - LD Vx, K
                            // Keyboard
                            break;
                        case 0x15: // FX15 - LD DT, Vx
                            this.delayTimer = this.v[x];
                            break;
                        case 0x18: // FX18 - LD ST, Vx
                            this.soundTimer = this.v[x];
                            break;
                        case 0x1E: // FX1E - ADD I, Vx
                            this.i = this.i + this.v[x];
                            break;
                        case 0x29: // FX29 - LD F, Vx
                            // All fonts are stored oin first 80 bytes of memory
                            this.i = this.v[x] * 5; 
                            break;
                        case 0x33: // FX33 - LD B, Vx
                            this.memory[this.i] = Math.floor(this.v[x]/100);
                            this.memory[this.i+1] = Math.floor((this.v[x]%100)/10);
                            this.memory[this.i+2] = Math.floor(this.v[x]/10);
                            break;
                        case 0x55: // FX55 - LD [I], Vx
                            for (let index = 0; index < x; index++) {
                                this.memory[this.i + index] = this.v[index];
                            }
                            this.i = this.i + x + 1;
                        case 0x65: // FX65 - LD Vx, [I]
                            for (let index = 0; index < x; index++) {
                                this.v[this.i + index] = this.memory[index]; 
                            }
                            this.i = this.i + x + 1;
                        default:
                            console.error("Wrong opcode for 0x8000: " + oc);
                            break;
                    }
                    break;
            default:
                console.error("Wrong opcode: " + oc);
                break;
        }
    }

}

export default Chippy8;