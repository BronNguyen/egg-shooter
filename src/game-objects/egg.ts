import { Physics } from "phaser";
import { IEggConstructor } from "../const/eggs.interface";

export class Egg extends Physics.Arcade.Image {
  constructor(aParams: IEggConstructor) {
    super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);
    this.setOrigin(0.5, 0.5);
    this.setInteractive();
  }

  initBody() : void {
    this.setCircle(25.1 * Math.sqrt(3)/2);
    //a = 32 Radius of the inner circle: R = a * sqrt(3)/2
    this.body.setOffset(25.1-25.1 * Math.sqrt(3)/2,25.1-25.1 * Math.sqrt(3)/2);
    this.setCollideWorldBounds();
  }

  explode() {
    //add egg yolk and white spawn
    this.destroy();
  }
}
