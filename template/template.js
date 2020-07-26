let width = 0;
let height = 0;

document.addEventListener("DOMContentLoaded", async function() {
    const manager = new AppManager();
    width = manager.width;
    height = manager.height;
}