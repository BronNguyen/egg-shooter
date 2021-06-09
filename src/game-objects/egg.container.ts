import { CONST } from "../const/const";
import { IEggContainerContructor } from "~/const/egg.container.interface";
import { Egg } from "./egg";

export default class EggContainer extends Phaser.GameObjects.Container {
  egg!: Egg;
  hasEgg: boolean;
  iIndex!: number;
  jIndex!: number;
  line: number;
  constructor(aParams: IEggContainerContructor) {
    super(aParams.scene, aParams.x, aParams.y);
    this.line = aParams.line;
    this.iIndex = aParams.iIndex;
    this.jIndex = aParams.jIndex;
    this.hasEgg = false;
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
  }

  addEgg(egg: Egg): void {
    this.egg = egg;
    this.add(egg);
    this.hasEgg = true;
    this.addPhysics();
  }

  destroyEgg() {
    (<Phaser.Physics.Arcade.Body>this.egg.body).destroy();
    this.egg.destroy();
    this.hasEgg = false;
  }

  private addPhysics() {
    this.scene.physics.add.existing(this.egg);
    this.egg.body = (<Phaser.Physics.Arcade.Body>this.egg.body);
    this.egg.body.allowGravity = false;
    this.egg.body.immovable = true;
    this.egg.body.setCircle(25);
    this.egg.body.setOffset(0,5);
  }
}
