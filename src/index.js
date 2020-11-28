import Chippy8 from "./chippy8";

/**
 * Variables and constants
 */
let chippy8;
let romFileData = undefined;
let fps = 60;

const canvas = document.getElementById("canvas");
const fileToRead = document.getElementById("romFile");
const reloadButton = document.getElementById("reload");

if (canvas.getContext) {
    console.log("Welcome to Chip 8 Emulator");
    chippy8 = new Chippy8(canvas);
} else {
    console.log("Canvas not supported. Try different browser.");
}

fileToRead.addEventListener("change", handleFileUpload);
reloadButton.addEventListener("click", reloadRom);

/**
 * Functions
 */
function handleFileUpload() {
    let x = document.getElementById("romFile").files[0];
    
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(x);
    fileReader.onloadend = (event) => {
        romFileData = event.target.result;
        console.log(romFileData.byteLength);
        
        loadRom(romFileData);
    };
}

function loadRom(rom) {
    window.cancelAnimationFrame(animate);

    chippy8 = new Chippy8(canvas);
    chippy8.uploadRomToMemory(rom);

    animate();
}

function reloadRom() {
    if (romFileData) {
        loadRom(romFileData);
    }
    else {
        alert("No rom uploaded!");
    }
}

function animate() {
    setTimeout(() => {       
        requestAnimationFrame(animate);
        chippy8.emulatorLoop();
    }, 1000/fps);
}