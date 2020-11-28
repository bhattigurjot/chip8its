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
    fileReader.onload = (event) => {
        romFileData = event.target.result;
        console.log(romFileData);
        
        chippy8.uploadRomToMemory(romFileData);
    };
}

function reloadRom() {
    chippy8.uploadRomToMemory(romFileData);
    animate();
}

function animate() {
    setTimeout(() => {       
        requestAnimationFrame(animate);
        chippy8.emulatorLoop();
    }, 1000/fps);
}

// var framerate = 1000 / fps;
// function animate() {
//     draw();

//     let delta = Date.now();
//     let deltaTime = Date.now() - delta;
//     if (deltaTime >= framerate) {
//         requestAnimationFrame(animate);
//     }
//     else {
//         setTimeout(() => {
//             requestAnimationFrame(animate);
//         }, framerate - deltaTime);
//     }
// }