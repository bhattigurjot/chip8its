import IO from "./io";

class Chippy8 {
    constructor(canvas) {
        this.io = new IO(canvas, 64, 32, 10);
        
        this.memory = new Uint8Array(4096);
        this.pc = 0x200;
        this.i = 0;
        this.stack = [];
        this.sp = 0;
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.v = new Uint8Array(16);
        this.isExecuting = true;
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
        // Instructions
        for (let iteration = 0; iteration < 10; iteration++) {
            if (this.isExecuting) {
                // FETCH
                let oc = (this.memory[this.pc] << 8) | (this.memory[this.pc + 1]);
                // DECODE AND EXECUTE
                this.decode(oc);
            }
        }

        // Updates
        if (this.isExecuting) {
            if(this.delayTimer > 0) this.delayTimer--;
            if(this.soundTimer > 0) this.soundTimer--;
        }

        // Sound Play
        if (this.soundTimer > 0) this.io.playAudio(true);
        else this.io.playAudio(false);

        // Draw Game
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
                        this.pc = this.stack[--this.sp];
                        break;
                }
                break;
            case 0x1000: // 1NNN - JP addr
                this.pc = (oc & 0x0FFF);
                break;
            case 0x2000: // 2NNN - CALL addr
                this.stack[this.sp++] = this.pc;
                this.pc = (oc & 0x0FFF);
                break;
            case 0x3000: // 3XNN - SE Vx, byte
                if (this.v[x] === (oc & 0x00FF)) {
                    this.pc += 2;
                } 
                break;
            case 0x4000: // 4XNN - SNE Vx, byte
                if (this.v[x] != (oc & 0x00FF)) {
                    this.pc += 2;
                }
                break;
            case 0x5000: // 5XNN - SE Vx, Vy
                if (this.v[x] === this.v[y]) {
                    this.pc += 2;
                }
                break;
            case 0x6000: // 6XNN - LD Vx, byte
                this.v[x] = (oc & 0x00FF); 
                break;
            case 0x7000: // 7XNN - ADD Vx, byte
                this.v[x] += (oc & 0x00FF); 
                break;
            // ALU
            case 0x8000: 
                switch (oc & 0x000F) {
                    case 0x0000: // 8XY0 - LD Vx, Vy
                        this.v[x] = this.v[y];
                        break;
                    case 0x0001: // 8XY1 - OR Vx, Vy
                        this.v[x] = this.v[x] | this.v[y];
                        break;
                    case 0x0002: // 8XY2 - AND Vx, Vy
                        this.v[x] = this.v[x] & this.v[y];
                        break;
                    case 0x0003: // 8XY3 - XOR Vx, Vy
                        this.v[x] = this.v[x] ^ this.v[y];
                        break;
                    case 0x0004: // 8XY4 - ADD Vx, Vy
                        let res = this.v[x] + this.v[y];
                        if (res > 255)
                            this.v[0xF] = 1;
                        else
                            this.v[0xF] = 0;

                        this.v[x] = (res & 0x00FF);
                        break;
                    case 0x0005: // 8XY5 - SUB Vx, Vy
                        if (this.v[x] > this.v[y])
                            this.v[0xF] = 1;
                        else
                            this.v[0xF] = 0;

                        this.v[x] -= this.v[y];
                        break;
                    case 0x0006: // 8XY6 - SHR Vx {, Vy}
                        if ((this.v[x] & 0x1) == 1)
                            this.v[0xF] = 1;
                        else 
                            this.v[0xF] = 0;

                        // this.v[x] /= 2;
                        this.v[x] >>= 1;
                        break;
                    case 0x0007: // 8XY7 - SUBN Vx, Vy
                        if (this.v[y] > this.v[x])
                            this.v[0xF] = 1;
                        else
                            this.v[0xF] = 0;

                        this.v[x] = this.v[y] - this.v[x];
                        break;
                    case 0x000E: // 8XYE - SHL Vx {, Vy}
                        if ((this.v[x] & 0x0080) == 1)
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
            case 0x9000: // 9XY0 - SNE Vx, Vy
                if(this.v[x] != this.v[y])
                    this.pc += 2;
                break;
            case 0xA000: // ANNN - LD I, addr
                this.i = (oc & 0x0FFF);
                break;
            case 0xB000: // BNNN - JP V0, addr
                this.pc = this.v[0x0] + (oc & 0x0FFF);
                break;
            case 0xC000: // CXNN - RND Vx, byte
                let random = Math.floor(Math.random() * 255);
                this.v[x] = random & (oc & 0x00FF);
                break;
            case 0xD000: // DXYN - DRW Vx, Vy, nibble
                let xCoord = this.v[x];
                let yCoord = this.v[y];
                let rows = oc & 0x000F; // N rows
                
                // Set VF to 0
                this.v[0xF] = 0;

                for (let row = 0; row < rows; row++) {
                    let spriteData = this.memory[this.i + row];
                    
                    for (let pix = 0; pix < 8; pix++) {                        
                        xCoord = this.v[x] + pix;
                        yCoord = this.v[y] + row;

                        // 0x0080      == 0000 0000 1000 0000
                        // 0x0080 >> 0 == 0000 0000 1000 0000
                        // 0x0080 >> 1 == 0000 0000 0100 0000
                        // 0x0080 >> 7 == 0000 0000 0000 0001
                        let mask = 0x0080 >> pix;
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
                    switch (oc & 0x00FF) {
                        case 0x009E: // EX9E - SKP Vx
                            // key pressed
                            if (this.io.keysCurrentlyPressed[this.v[x]])
                                this.pc += 2;
                            break;
                        case 0x00A1: // EXA1 - SKNP Vx
                            // key not pressed
                            if (!this.io.keysCurrentlyPressed[this.v[x]])
                                this.pc += 2;
                            break;
                    }
                    break;
                case 0xF000: 
                    switch (oc & 0x00FF) {
                        case 0x0007: // FX07 - LD Vx, DT
                            this.v[x] = this.delayTimer;
                            break;
                        case 0x000A: // FX0A - LD Vx, K
                            // Keyboard
                            this.isExecuting = false;
                            // Need to create a callback to get the key pressed
                            let keyPressCallback = (pressedKey) => {
                                this.v[x] = pressedKey;
                                this.isExecuting = true;
                            }
                            // Attach callback to get the value back
                            this.io.keyPressDetector = keyPressCallback.bind(this);
                            break;
                        case 0x0015: // FX15 - LD DT, Vx
                            this.delayTimer = this.v[x];
                            break;
                        case 0x0018: // FX18 - LD ST, Vx
                            this.soundTimer = this.v[x];
                            break;
                        case 0x001E: // FX1E - ADD I, Vx
                            this.i = this.i + this.v[x];
                            break;
                        case 0x0029: // FX29 - LD F, Vx
                            // All fonts are stored oin first 80 bytes of memory
                            this.i = this.v[x] * 5; 
                            break;
                        case 0x0033: // FX33 - LD B, Vx
                            this.memory[this.i] = Math.floor(this.v[x]/100);
                            this.memory[this.i+1] = Math.floor((this.v[x]%100)/10);
                            this.memory[this.i+2] = Math.floor(this.v[x]%10);
                            break;
                        case 0x0055: // FX55 - LD [I], Vx
                            for (let index = 0; index <= x; index++) {
                                this.memory[this.i + index] = this.v[index];
                            }
                            this.i = this.i + x + 1;
                            break;
                        case 0x0065: // FX65 - LD Vx, [I]
                            for (let index = 0; index <= x; index++) {
                                this.v[index] = this.memory[this.i + index]; 
                            }
                            this.i = this.i + x + 1;
                            break;
                        default:
                            console.error("Wrong opcode for 0xF000: " + oc);
                            break;
                    }
                    break;
            default:
                console.error("Wrong opcode: " + oc);
                break;
        }
    }

    decode1(instruction) {
        this.pc += 2;
        
        let x = (instruction & 0x0F00) >> 8;
        let y = (instruction & 0x00F0) >> 4;

        switch(instruction & 0xF000) {
            case 0x0000:
                switch(instruction) {
                    case 0x00E0:
                        this.io.clearDisplay(); // CLR
                        break;
                    case 0x0EE:
                        this.pc = this.stack.pop(); // RET (May later change to this.sp--)
                        break;
                }
                break;
            case 0x1000:
                this.pc = instruction & 0xFFF; // JP addr
                break;
            case 0x2000:
                this.stack.push(this.pc);
                this.pc = instruction & 0xFFF; // CALL addr
                break;
            case 0x3000:
                if(this.v[x] === (instruction & 0xFF)) // SE Vx, byte
                    this.pc += 2;
                break;
            case 0x4000:
                if(this.v[x] != (instruction & 0xFF)) { // SNE Vx, byte
                    this.pc += 2;
                }
                break;
            case 0x5000:
                if(this.v[x] === this.v[y]) { // SE Vx, Vy
                    this.pc += 2;
                }
                break;
            case 0x6000:
                this.v[x] = (instruction & 0xFF); // LD Vx, byte
                break;
            case 0x7000:
                this.v[x] += (instruction & 0xFF); // ADD Vx, byte
                break;
            case 0x8000:
                switch (instruction & 0xF) {
                    case 0x0:
                        this.v[x] = this.v[y]; // LD Vx, Vy
                        break;
                    case 0x1:
                        this.v[x] |= this.v[y]; // OR Vx, Vy
                        break;
                    case 0x2:
                        this.v[x] &= this.v[y]; // AND Vx, Vy
                        break;
                    case 0x3:
                        this.v[x] ^= this.v[y]; // XOR Vx, Vy
                        break;
                    case 0x4:
                        let sum = (this.v[x] += this.v[y]); // ADD Vx, Vy

                        this.v[0xF] = 0;

                        if(sum > 0xFF)
                            this.v[0xF] = 1;

                        this.v[x] = sum;
                        break;
                    case 0x5:
                        this.v[0xF] = 0;            
                        if(this.v[x] > this.v[y]) // SUB Vx, Vy
                            this.v[0xF] = 1;
                        
                        this.v[x] -= this.v[y];
                        break;
                    case 0x6:
                        this.v[0xF] = this.v[x] & 0x1; // SHR Vx, vy
                        this.v[x] >>= 1;
                        break;
                    case 0x7:
                        this.v[0xF] = 0;       
                        if(this.v[y] > this.v[x]) // SUBN Vx, Vy
                            this.v[0xF] = 1;

                        this.v[x] = this.v[y] - this.v[x];
                        break;
                    case 0xE:
                        this.v[0xF] = this.v[x] & 0x80; // SHL Vx {, Vy}
                        this.v[x] <<= 1;
                        break;
                    default:
                        throw new Error('BAD OPCODE');
                }
                break;
            case 0x9000:
                if(this.v[x] != this.v[y]) // SNE Vx, Vy
                    this.pc += 2;
                break;
            case 0xA000:
                this.index = instruction & 0xFFF; // LD I, addr
                break;
            case 0xB000:
                this.pc = (instruction & 0xFFF) + this.v[0]; // JP V0, addr
                break;
            case 0xC000:
                let rand = Math.floor(Math.random() * 0xFF); // RND Vx, byte
                this.v[x] = rand & (instruction & 0xFF);
                break;
            case 0xD000:
                let xCoord = this.v[x];
                let yCoord = this.v[y];
                let rows = instruction & 0xF; // N rows
                
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
                switch (instruction & 0xFF) {
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
                    default:
                        throw new Error('BAD OPCODE');
                }
        
                break;
            case 0xF000:
                switch(instruction & 0xFF) {
                    case 0x07:
                        this.v[x] = this.delayTimer; // LD Vx, DT
                        break;
                    case 0x0A:
                        // Keyboard
                        this.isExecuting = false;
                        // Need to create a callback to get the key pressed
                        let keyPressCallback = (pressedKey) => {
                            this.v[x] = pressedKey;
                            this.isExecuting = true;
                        }
                        // Attach callback to get the value back
                        this.io.keyPressDetector = keyPressCallback.bind(this);
                        break;
                    case 0x15:
                        this.delayTimer = this.v[x]; // LD Dt, Vx
                        break;
                    case 0x18:
                        this.soundTimer = this.v[x]; // LD ST, Vx
                        break;
                    case 0x1E:
                        this.i += this.v[x]; // ADD I, Vx
                        break;
                    case 0x29:
                        this.i = this.v[x] * 5; //  LD F, Vx
                        break;
                    case 0x33:
                        this.memory[this.i] = parseInt(this.v[x] / 100); // LD B, Vx
                        this.memory[this.i + 1] = parseInt((this.v[x]%100)/10);
                        this.memory[this.i + 2] = parseInt(this.v[x]%10);
                        break;
                    case 0x55:
                        for (let ri=0; ri <= x; ri++)  // LD [I], Vx
                            this.memory[this.i + ri] = this.v[ri];
                        break;
                    case 0x65:
                        for(let ri=0; ri <= x; ri++) // LD Vx, [I]
                            this.v[ri] = this.memory[this.i + ri];
                        break;
                    default:
                        throw new Error('0xF BAD OPCODE ' + instruction);
                }
                break;
            default:
                throw new Error('BAD OPCODE');

        }

    }

}

export default Chippy8;