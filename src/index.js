const canvas = document.getElementById("canvas");

if (canvas.getContext) {
    console.log("Welcome to Chip 8 Emulator");
} else {
    console.log("Canvas not supported. Try different browser.");
}