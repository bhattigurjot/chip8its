import Chippy8 from "./chippy8";

const canvas = document.getElementById("canvas");
let chippy8;

if (canvas.getContext) {
    console.log("Welcome to Chip 8 Emulator");
    chippy8 = new Chippy8(canvas);
} else {
    console.log("Canvas not supported. Try different browser.");
}

const fileToRead = document.getElementById("romFile");
fileToRead.addEventListener("change", handleFileUpload);

const reloadButton = document.getElementById("reload");
reloadButton.addEventListener("click", reloadRom);

let romFileData = undefined;

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
}