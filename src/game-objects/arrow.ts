import { CONST } from "../const/const";

export default class Arrow extends Phaser.GameObjects.Graphics {
  beginPoint!: Phaser.Math.Vector2;
  line: Phaser.Geom.Line;
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.beginPoint = new Phaser.Math.Vector2(CONST.shootingPointx, CONST.shootingPointy);
    this.line = new Phaser.Geom.Line();
    this.init();
    this.setDepth(1);
    this.setAlpha(0.8);
  }

  init() {
      this.line.x1 = this.beginPoint.x;
      this.line.y1 = this.beginPoint.y;
      this.scene.input.on('pointermove', (pointer) => {
        if(pointer.isDown && pointer.y < CONST.shootingPointy - 20) {
            this.line.x2 = pointer.x;
            this.line.y2 = pointer.y;
            this.clear();
            this.lineStyle(CONST.eggWidth,0xaa00aa);
            this.strokeLineShape(this.line);
        }
      });
      this.scene.input.on('pointerdown', (pointer) => {
        if(pointer.isDown && pointer.y < CONST.shootingPointy - 20) {
            this.line.x2 = pointer.x;
            this.line.y2 = pointer.y;
            this.clear();
            this.lineStyle(CONST.eggWidth,0xaa00aa);
            this.strokeLineShape(this.line);
        }
      });
      this.scene.input.on('pointerup', (pointer) => {
        if(pointer.y > CONST.shootingPointy - 20) {
          this.clear();
          return;
        }
        this.line.x2 = pointer.x;
        this.line.y2 = pointer.y;
        let directionVector = new Phaser.Math.Vector2(this.line.x2 - this.line.x1, -Math.abs(this.line.y2 - this.line.y1));
        // const simplifyNumber = (this.line.x2 - this.line.x1)/(this.line.y2 - this.line.y1);
          this.clear();
          this.scene.events.emit('FIRE', directionVector);
      })
  }
}
