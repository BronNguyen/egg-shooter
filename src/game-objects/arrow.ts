import { CONST } from "../const/const";

export default class Arrow extends Phaser.GameObjects.Graphics {
  beginPoint!: Phaser.Math.Vector2;
  line: Phaser.Geom.Line;
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.beginPoint = new Phaser.Math.Vector2(
      CONST.shootingPointx,
      CONST.shootingPointy
    );
    this.line = new Phaser.Geom.Line();
    this.init();
    this.setDepth(1);
    this.setAlpha(0.8);
  }

  init() {
    this.line.x1 = this.beginPoint.x;
    this.line.y1 = this.beginPoint.y;
    this.scene.input.on("pointermove", (pointer) => {
      if (pointer.isDown && pointer.y < CONST.shootingPointy - 20) {
        this.clear();
        this.lineStyle(CONST.eggWidth, 0xaa00aa);
        this.line.x2 = pointer.x;
        this.line.y2 = pointer.y;
        const leftBound = CONST.worldLeftBound + CONST.eggWidth/2;
        const rightBound = CONST.worldRightBound - CONST.eggWidth/2;
        // if x < 140
        if (pointer.x < leftBound) {
          const length = Phaser.Geom.Line.Length(this.line);
          const endpointX = pointer.x;
          const endpointY = pointer.y;
          const velocityVector = new Phaser.Math.Vector2(
            endpointX - this.line.x1,
            endpointY - this.line.y1
          );
          let line2 = new Phaser.Geom.Line();
          line2.x1 = leftBound;
          line2.y1 =
            this.line.y1 -
            ((this.line.x1 - leftBound) * velocityVector.y) / velocityVector.x;
          this.line.x2 = line2.x1;
          this.line.y2 = line2.y1;
          const normalAngle = Phaser.Geom.Line.NormalAngle(this.line);
          line2 = Phaser.Geom.Line.SetToAngle(
            line2,
            line2.x1,
            line2.y1,
            1.5 - normalAngle,
            1000
          );
          const velocityVector2 = new Phaser.Math.Vector2(
            line2.x2 - line2.x1,
            line2.y2 - line2.y1
          );
          // conculate yB
          const yB =
            line2.y1 -
            ((line2.x1 - rightBound) * velocityVector2.y) / velocityVector2.x;
          const xB = rightBound;
          if (yB > 0) {
            line2.x2 = xB;
            line2.y2 = yB;
          }
          this.strokeLineShape(line2);
        }
        if (pointer.x > rightBound) {
          const length = Phaser.Geom.Line.Length(this.line);
          const endpointX = pointer.x;
          const endpointY = pointer.y;
          const velocityVector = new Phaser.Math.Vector2(
            endpointX - this.line.x1,
            endpointY - this.line.y1
          );
          const line2 = new Phaser.Geom.Line(
            rightBound,
            this.line.y1 -
              ((this.line.x1 - rightBound) * velocityVector.y) /
                velocityVector.x
          );
          this.line.x2 = line2.x1;
          this.line.y2 = line2.y1;
          const normalAngle = Phaser.Geom.Line.NormalAngle(this.line);
          Phaser.Geom.Line.SetToAngle(
            line2,
            line2.x1,
            line2.y1,
            1.5 - normalAngle,
            1000
          );
          // this.lineBetween()

          this.strokeLineShape(line2);
        }
        this.strokeLineShape(this.line);
      }
    });
    this.scene.input.on("pointerdown", (pointer) => {
      if (pointer.isDown && pointer.y < CONST.shootingPointy - 20) {
        const endpointX = pointer.x;
        const endpointY = pointer.y;
        this.line.x2 = pointer.x;
        this.line.y2 = pointer.y;
        this.clear();
        const leftBound = 140;
        const rightBound = 200 + 6 * 50;
        const velocityVector = new Phaser.Math.Vector2(
          endpointX - this.line.x1,
          endpointY - this.line.y1
        );
        // if x < 400
        const line2 = new Phaser.Geom.Line(
          140,
          this.line.y1 -
            ((this.line.x1 - leftBound) * velocityVector.y) / velocityVector.x
        );

        const length = Phaser.Geom.Line.Length(this.line);
        this.lineStyle(CONST.eggWidth, 0xaa00aa);
        this.strokeLineShape(line2);
        this.strokeLineShape(this.line);
      }
    });
    this.scene.input.on("pointerup", (pointer) => {
      if (pointer.y > CONST.shootingPointy - 20) {
        // this.clear();
        return;
      }
      this.line.x2 = pointer.x;
      this.line.y2 = pointer.y;
      // const simplifyNumber =
      // (this.line.x2 - this.line.x1) / (this.line.y2 - this.line.y1);

      let directionVector = new Phaser.Math.Vector2(
        this.line.x2 - this.line.x1,
        -Math.abs(this.line.y2 - this.line.y1)
      );
      // this.clear();
      this.scene.events.emit("FIRE", directionVector);
    });
  }

  draw(x, y, x2, y2) {
    // const vector = new Phaser.Math.Vector2(pointer.x2 - this.line.x1, pointer.y2 - this.line.y1);

    this.beginPath();
    this.moveTo(x, y);
    this.lineTo(x2, y2);
    this.closePath();
    this.strokePath();
  }
}
