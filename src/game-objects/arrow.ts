import { Geom } from "phaser";
import GameScene from "../scenes/GameScene";
import { CONST } from "../const/const";

export default class Arrow extends Phaser.GameObjects.Graphics {
  beginPoint!: Phaser.Math.Vector2;
  line: Phaser.Geom.Line;
  triangle: Phaser.Geom.Triangle;
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.beginPoint = new Phaser.Math.Vector2(
      CONST.shootingPointx,
      CONST.shootingPointy
    );
    this.line = new Phaser.Geom.Line();
    this.triangle = new Phaser.Geom.Triangle();
    this.init();
    this.setDepth(1);
    this.setAlpha(1);
  }

  init() {
    this.line.x1 = this.beginPoint.x;
    this.line.y1 = this.beginPoint.y;
    this.scene.input.on("pointermove", (pointer) => {
      if (pointer.isDown && pointer.y < CONST.shootingPointy - 20) {
        this.drawArrow(pointer,(<GameScene>this.scene).colorsStack[0]);
      }
    });
    this.scene.input.on("pointerdown", (pointer) => {
      if (pointer.isDown && pointer.y < CONST.shootingPointy - 20) {
        this.drawArrow(pointer,(<GameScene>this.scene).colorsStack[0]);
      }
    });
    this.scene.input.on("pointerup", (pointer) => {
      if (pointer.y > CONST.shootingPointy - 20) {
        this.clear();
        return;
      }
      this.line.x2 = pointer.x;
      this.line.y2 = pointer.y;
      this.clear();
      this.scene.events.emit("FIRE", this.getVelocityVector(this.line));
    });
  }

  private drawArrow(pointer, color:number) {
    this.line.x2 = pointer.x;
    this.line.y2 = pointer.y;
    const normalAngle = Phaser.Geom.Line.Angle(this.line);
    this.triangle = Phaser.Geom.Triangle.BuildEquilateral(
      this.line.x2,
      this.line.y2,
      100
    );
    Phaser.Geom.Triangle.CenterOn(this.triangle,pointer.x, pointer.y);
    Phaser.Geom.Triangle.Rotate(this.triangle,normalAngle-0.5);

    this.clear();
    this.lineStyle(CONST.eggWidth, color);
    this.strokeLineShape(this.line);
    this.fillStyle(color);
    this.fillTriangleShape(this.triangle);
  }

  private getVelocityVector(line: Phaser.Geom.Line): Phaser.Math.Vector2 {
    const points = Phaser.Geom.Line.GetPoints(line,0,1)
    return new Phaser.Math.Vector2(points[0].x - points[1].x, points[0].y - points[1].y);
  }
}
