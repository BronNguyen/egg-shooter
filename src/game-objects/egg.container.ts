import { CONST } from "../const/const";
import { IEggContainerContructor } from "~/const/egg.container.interface";
import { Egg } from "./egg";

export default class EggContainer extends Phaser.GameObjects.Container {
  egg!: Egg;
  constructor(aParams: IEggContainerContructor) {
    super(aParams.scene, aParams.x, aParams.y);
    this.scene.add.existing(this);
  }

  generateRandomEgg(colorsNumber: number) {
    const frame = CONST.frames[Phaser.Math.RND.between(0, colorsNumber - 1)];
    const egg = new Egg({
        scene: this.scene,
        x: 0,
        y: 0,
        texture: CONST.texture + frame,
    }).setOrigin(0.5,0.5);
    this.addEgg(egg);
    this.addPhysics();
  }

  addEgg(egg: Egg): void {
    this.egg = egg;
    this.add(egg);
  }

  addPhysics() {
    this.scene.physics.add.existing(this, true);
    this.body = (<Phaser.Physics.Arcade.Body>this.body)
    this.body.setCircle(25);
    this.body.setOffset(5,5);
  }
}
