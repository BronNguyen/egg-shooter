import Phaser from "phaser";
import { Egg } from "../game-objects/egg";
import { CONST } from "../const/const";
import EggContainer from "../game-objects/egg.container";
import EggProjectile from "../game-objects/egg.projective";
import Arrow from "../game-objects/arrow";
export default class GameScene extends Phaser.Scene {
  eggsGroup!: Phaser.GameObjects.Group;
  eggsPerRow!: number;
  eggs: Egg[] = [];
  eggsMagazine!: string[];
  eggsLinks!: Egg[][];
  eggContainers!: EggContainer[][];

  constructor() {
    super("GameScene");
  }

  init(): void {
    this.eggsGroup = this.add.group();
    this.eggsPerRow = 9;
    this.eggContainersInit();
    for (let i = 10; i < 15; i++) {
      this.eggLineInit(this.eggContainers[i]);
    }
    this.add.existing(new Arrow(this));
    this.eggsMagazine = [];
    this.handleFire();
  }

  private handleFire() {
    this.events.on("FIRE", (directionVector) => {
      this.loadBullets();
      const frame = this.eggsMagazine.shift();
      this.add.existing(
        new EggProjectile(
          {
            scene: this,
            x: CONST.shootingPointx,
            y: CONST.shootingPointy,
            texture: CONST.texture + frame,
          },
          directionVector
        )
      );
    });
  }

  private loadBullets() {
    if (this.eggsMagazine == []) {
      this.eggsMagazine.push(CONST.frames[Phaser.Math.RND.between(0, 2)]);
      this.eggsMagazine.push(CONST.frames[Phaser.Math.RND.between(0, 2)]);
    } else {
      this.eggsMagazine.push(CONST.frames[Phaser.Math.RND.between(0, 2)]);
    }
  }

  private eggContainersRowGenerate(i: number): EggContainer[] {
    const eggsRow: EggContainer[] = [];
    for (let j = 0; j < this.eggsPerRow; j++) {
      const t = this.eggsPerRow === 9 ? j - 0.5 : j;
      eggsRow[j] = new EggContainer({
        scene: this,
        x: 200 + t * CONST.eggWidth,
        y: 320 - i * CONST.eggHeight,
      });
      this.eggsGroup.add(eggsRow[j]);
    }
    this.eggsPerRow === 9 ? this.eggsPerRow = 8 : this.eggsPerRow = 9;
    return eggsRow;
  }

  private eggContainersInit(): void {
    this.eggContainers = [];
    for (let i = 0; i < CONST.eggMapLength; i++) {
      this.eggContainers.push(this.eggContainersRowGenerate(i));
    }
  }

  private eggLineInit(eggContainerArray: EggContainer[]): void {
    eggContainerArray.forEach((eggContainer) => {
      eggContainer.generateRandomEgg(3);
    });
  }

  update() {
    this.eggsGroup.incY(1);
    if (this.eggContainers[0][0].y > CONST.shootingPointy) {
      this.eggContainers[0].forEach((container) => {
        container.destroy();
      });
      this.eggContainers.shift();
      const newEggsLine = this.eggContainersRowGenerate(16);
      this.eggLineInit(newEggsLine);
      this.eggContainers.push(newEggsLine);
    }
  }
}
