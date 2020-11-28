import IO from "./io";

class Chippy8 {
    constructor(canvas) {
        this.io = new IO(canvas, 64, 32, 10);
        
        this.memory = new Uint8Array(4096);
        this.pc = 0;
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
        for (let i = 0; i < rom.length; i++) {
            this.memory[0x200 + i] = rom[i];            
        }
        console.log("Rom uploaded to memory");
    }

    emulatorLoop = () => {
        let oc = this.memory[this.pc] << 8 | this.memory[this.pc + 1];
        this.decode(oc);

        this.io.draw();
    }

    decode = (oc) => {
        this.pc += 2;
    
        // X: The second nibble. Used to look up one of the 16 registers (VX) from V0 through VF.
        // Y: The third nibble. Also used to look up one of the 16 registers (VY) from V0 through VF.
        // N: The fourth nibble. A 4-bit number.
        // NN: The second byte (third and fourth nibbles). An 8-bit immediate number.
        // NNN: The second, third and fourth nibbles. A 12-bit immediate memory address.

        // Implement these two display IBM logo
        // 00E0 (clear screen)
        // 1NNN (jump)
        // 6XNN (set register VX)
        // 7XNN (add value to register VX)
        // ANNN (set index register I)
        // DXYN (display/draw)

        // let x = oc;
        // let y = oc;

        switch (oc) {
            case 0x00E0: // CLS
                this.io.clearScreen();
                break;
            case 0x1000: // JP addr
                this.pc = oc & 0xFFF;
                break;
            case 0x6000: // SET
                // this.v[x] = oc & 0xFF; 
                break;
            case 0x7000: // ADD
                // this.v[x] += oc & 0xFF; 
                break;
            case 0xA000:
                // this.v[x] = oc & 0xFFF;
                break;
            case 0xD000: // DRAW
                
                break;
            default:
                console.log("Wrong opcode: " + oc);
                break;
        }
    }

}

export default Chippy8;