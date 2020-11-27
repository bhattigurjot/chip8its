import Chippy8 from "./chippy8";

const canvas = document.getElementById("canvas");
let chippy8;

if (canvas.getContext) {
    console.log("Welcome to Chip 8 Emulator");
    chippy8 = new Chippy8(canvas);
} else {
    console.log("Canvas not supported. Try different browser.");
}
