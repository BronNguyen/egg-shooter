import { IEggConstructor } from "../const/eggs.interface";
import { Egg } from "./egg";

export default class EggProjectile extends Egg {
  constructor(aParams: IEggConstructor, directionVector: Phaser.Math.Vector2) {
    super(aParams);
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.fire(directionVector);
  }

  fire(directionVector: Phaser.Math.Vector2): void {
    this.initBody();
    this.setBounce(1);
    const body = <Phaser.Physics.Arcade.Body>this.body;
    body.allowGravity = false;
    const speed = -1200;
    body.setVelocity(directionVector.x* speed, directionVector.y* speed);
  }
}
