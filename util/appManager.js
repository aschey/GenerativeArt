class AppManager {
    constructor(width = null, height = null) {
        this.width = width ?? window.innerWidth;
        this.height = height ?? window.innerHeight;
        this.app = new PIXI.Application({width: this.width, height: this.height, antialias: true});
        this.graphics = new PIXI.Graphics();
        this.drawCount = 0;
        window.app = this.app;
        app.renderer.preserveDrawingBuffer = true;
        document.body.appendChild(app.view);
    }

    exec(graphicsFunc) {
        graphicsFunc(this.graphics);
        if (this.drawCount >= 10000) {
            this.app.stage.addChild(this.graphics);
            this.graphics = new PIXI.Graphics();
            this.drawCount = 0;
        }
        this.drawCount++;
    }

    append() {
        this.app.stage.addChild(this.graphics);
        this.graphics = new PIXI.Graphics();
        this.drawCount = 0;
    }
}