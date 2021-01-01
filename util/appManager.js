// https://stackoverflow.com/questions/46740171/how-to-create-a-texture-from-multiple-graphics
class AppManager {
  constructor(width = null, height = null) {
    this.width = width ?? window.innerWidth;
    this.height = height ?? window.innerHeight;
    this.app = new PIXI.Application({
      width: this.width,
      height: this.height,
      antialias: true,
      sharedLoader: true,
    });
    this.graphics = new PIXI.Graphics();
    this.drawCount = 0;
    window.app = this.app;
    //app.renderer.preserveDrawingBuffer = true;
    //app.renderer.clearBeforeRender = false;
    document.body.appendChild(app.view);
    this.exec.bind(this);
    this.append.bind(this);
  }

  exec(graphicsFunc) {
    graphicsFunc(this.graphics);
    if (this.drawCount >= 10000) {
      this.append();
    }
    this.drawCount++;
  }

  append() {
    let container = new PIXI.Container();
    let texture = this.app.renderer.generateTexture(this.graphics);
    let sprite = new PIXI.Sprite(texture);
    container.addChild(sprite);
    // for (var t = 0; t < this.graphics.geometry.length; ++t) this.graphics.geometry.graphicsData[t].destroy();
    //this.graphics.geometry.destroy();
    this.graphics = new PIXI.Graphics();
    this.drawCount = 0;
  }
}
