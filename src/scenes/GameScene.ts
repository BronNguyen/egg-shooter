import Phaser from "phaser";
import { Egg } from "../game-objects/egg";
import { CONST } from "../const/const";
import EggContainer from "../game-objects/egg.container";
import EggProjectile from "../game-objects/egg.projective";
import Arrow from "../game-objects/arrow";
export default class GameScene extends Phaser.Scene {
  eggsGroup!: Phaser.GameObjects.Group;
  eggContainersGroup!: Phaser.GameObjects.Group;
  eggsProjectileGroup!: Phaser.GameObjects.Group;
  eggsPerRow!: number;
  eggs: Egg[] = [];
  eggsMagazine!: string[];
  eggsLinks!: Egg[][];
  eggContainers!: EggContainer[][];
  hey = 0;

  constructor() {
    super("GameScene");
  }

  init(): void {
    this.eggsGroup = this.add.group();
    this.eggContainersGroup = this.add.group();
    this.eggsProjectileGroup = this.add.group();
    this.eggsPerRow = 9;
    this.eggContainersInit();
    for (let i = 4; i < 15; i++) {
      this.eggLineInit(this.eggContainers[i]);
    }
    this.add.existing(new Arrow(this));
    this.eggsMagazine = [];
    this.handleFire();
    this.initCollider();
  }

  private handleFire() {
    this.events.on("FIRE", (directionVector) => {
      this.loadBullets();
      const frame = this.eggsMagazine.shift();
      this.eggsProjectileGroup.add(
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
        line: this.eggsPerRow,
        iIndex: i,
        jIndex: j,
      });
      this.eggContainersGroup.add(eggsRow[j]);
    }
    this.eggsPerRow === 9 ? (this.eggsPerRow = 8) : (this.eggsPerRow = 9);
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
      this.eggsGroup.add(eggContainer.egg);
    });
  }

  private initCollider() {
    function distance(body1, body2) {
      return Math.sqrt(
        Math.pow(body1.x - body2.x, 2) + Math.pow(body1.y - body2.y, 2)
      );
    }
    this.physics.add.collider(
      this.eggsProjectileGroup,
      this.eggsGroup,
      (_eggProjectile, _egg) => {
        const nearbyContainers = this.nearbyContainers(<EggContainer>_egg.parentContainer);

        // this.scene.pause();
        const nearestCont = nearbyContainers
          .filter((obj) => obj != undefined)
          .filter((obj) => !obj.hasEgg)
          .reduce((a, b) => (distance(a, b) < distance(a, b) ? a : b));
        const newEgg = new Egg({
          x: 0,
          y: 0,
          scene: this,
          texture: _eggProjectile.body.gameObject.texture,
        });
        nearestCont.addEgg(newEgg);
        this.eggsGroup.add(newEgg);
        _eggProjectile.body.enable = false;
        _eggProjectile.destroy();
        // explode
        const nearbyConts = this.nearbyContainers(nearestCont);
        if (this.colorMatch(nearbyConts, nearestCont.egg.texture.key)) {
          this.explode(nearestCont, nearestCont.egg.texture.key);
        }
      }
    );
  }

  private colorMatch(eggContainers: EggContainer[], texture: string): boolean {
    let colorMatch = 0;
    eggContainers.forEach((eggContainer) => {
      if (
        eggContainer &&
        eggContainer.hasEgg &&
        eggContainer.egg.texture.key === texture
      ) {
        colorMatch += 1;
      }
    });
    return colorMatch > 0 ? true : false;
  }

  private explode(eggContainer: EggContainer, texture: string) {
    if (
      eggContainer &&
      eggContainer.hasEgg &&
      eggContainer.egg.texture.key === texture
    ) {
      eggContainer.destroyEgg();
      this.nearbyContainers(eggContainer).forEach((element) =>
        this.explode(element, texture)
      );
    }
  }

  private nearbyContainers(egg: EggContainer): EggContainer[] {
    const i = egg.iIndex;
    const j = egg.jIndex;
    const line = egg.line;
    const nearbyEggs: EggContainer[] = [];
    // temp condition for odd
    if (line === 9) {
      nearbyEggs.push(this.eggContainers[i - 1][j]);
      nearbyEggs.push(this.eggContainers[i - 1][j - 1]);
      nearbyEggs.push(this.eggContainers[i][j - 1]);
      nearbyEggs.push(this.eggContainers[i][j + 1]);
      nearbyEggs.push(this.eggContainers[i + 1][j - 1]);
      nearbyEggs.push(this.eggContainers[i + 1][j]);
    } else {
      //even line
      nearbyEggs.push(this.eggContainers[i - 1][j]);
      nearbyEggs.push(this.eggContainers[i - 1][j + 1]);
      nearbyEggs.push(this.eggContainers[i][j - 1]);
      nearbyEggs.push(this.eggContainers[i][j + 1]);
      nearbyEggs.push(this.eggContainers[i + 1][j]);
      nearbyEggs.push(this.eggContainers[i + 1][j + 1]);
    }
    return nearbyEggs;
  }

  update() {
    this.eggContainersGroup.incY(.5);
    if (this.eggContainers[0][0].y > CONST.shootingPointy) {
      this.eggContainers[0].forEach((container) => {
        container.destroy();
      });
      // this.eggContainers.shift();
      // const newEggsLine = this.eggContainersRowGenerate(16);
      // this.eggLineInit(newEggsLine);
      // this.eggContainers.push(newEggsLine);
    }
  }
}
