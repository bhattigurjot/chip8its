import Chippy8 from "./chippy8";

/**
 * Variables and constants
 */
let chippy8;
let romFileData = undefined;
let fps = 60;

const canvas = document.getElementById("canvas");
const fileToRead = document.getElementById("romFile");
const reloadButton = document.getElementById("start");
// const selectOption = document.getElementById("romsOptions");
// const image = document.getElementById("image");
// const keypad = document.getElementById("keypad");

if (canvas.getContext) {
    console.log("Welcome to Chip 8 Emulator");
    chippy8 = new Chippy8(canvas);
} else {
    console.log("Canvas not supported. Try different browser.");
}

fileToRead.addEventListener("change", handleFileUpload);
reloadButton.addEventListener("click", reloadRom);
// selectOption.addEventListener("change", getRom);

// keypad.onmousemove = (event) => {
//     image.style.left = event.clientX + 'px';
//     image.style.top = event.clientY + 'px';
// }
// keypad.onmouseover = () => {
//     image.style.visibility = "visible";
// }
// keypad.onmouseout = () => {
//     image.style.visibility = "hidden";
// }

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
        
        // loadRom(romFileData);
    };
}

// function getRom(event) {
//     console.log(typeof(ibm));
//     console.log(ibm);
//     // console.log(event.target.value);

//     let fileReader = new FileReader();
//     fileReader.readAsArrayBuffer(ibm);
//     fileReader.onloadend = (event) => {
//         // console.log(event.target.result.byteLength);
//     };
// }

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