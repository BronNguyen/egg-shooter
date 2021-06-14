import { Egg } from "../game-objects/egg";
import { CONST } from "../const/const";
import EggContainer from "../game-objects/egg.container";
import EggProjectile from "../game-objects/egg.projectile";
import Arrow from "../game-objects/arrow";

export default class GameScene extends Phaser.Scene {
  eggsGroup!: Phaser.GameObjects.Group;
  eggContainersGroup!: Phaser.GameObjects.Group;
  eggsProjectileGroup!: Phaser.GameObjects.Group;
  egglines!: number;
  eggsDestroyed!: number;
  eggsPerRow!: number;
  eggContainers!: EggContainer[][];
  explodedEggContainers: EggContainer[] = [];
  eggBulletsStack!: string[];
  colorsStack!: number[];
  readyBullet!: Phaser.GameObjects.Image;
  standbyBullet!: Phaser.GameObjects.Image;
  private level = 3;

  constructor() {
    super("GameScene");
  }

  init(): void {
    this.eggsGroup = this.add.group();
    this.eggContainersGroup = this.add.group();
    this.eggsProjectileGroup = this.add.group();
    this.egglines = CONST.eggMapLength;
    this.eggsPerRow = 9;
    this.eggsDestroyed = 0;
    this.drawWalls();
    this.eggContainersFirstInit();
    this.worldConfig();
    for (let i = 8; i < this.egglines; i++) {
      this.eggLineInit(this.eggContainers[i], this.level);
    }
    this.add.existing(new Arrow(this));
    this.initEggBulletImages();
    this.handleFire();
    this.initCollider();
    this.initLevelController();
  }

  private worldConfig() {
    this.physics.world.setBounds(
      CONST.worldLeftBound,
      -10000,
      CONST.worldRightBound - CONST.worldLeftBound,
      Number.MAX_SAFE_INTEGER
    );
    this.cameras.main.setBackgroundColor(0xe6f7ff);
    // this.cameras.main.setZoom(0.5);
  }

  private drawWalls() {
    const graphics = new Phaser.GameObjects.Graphics(this);
    this.add.existing(graphics);
    const wall1 = new Phaser.Geom.Rectangle(0, 0, CONST.worldLeftBound, 600);
    const wall2 = new Phaser.Geom.Rectangle(CONST.worldRightBound, 0, 800, 600);
    graphics.fillStyle(0x000000);
    graphics.fillRectShape(wall1);
    graphics.fillRectShape(wall2);
  }

  private initEggBulletImages() {
    this.eggBulletsStack = [];
    this.colorsStack = [];
    this.loadBullets();
    this.readyBullet = this.add.image(
      CONST.shootingPointx,
      CONST.shootingPointy,
      CONST.texture + this.eggBulletsStack[0]
    );
    this.standbyBullet = this.add
      .image(
        CONST.standbyPointX,
        CONST.standbyPointY,
        CONST.texture + this.eggBulletsStack[1]
      )
      .setScale(0.7);
  }

  private handleFire() {
    this.events.on("FIRE", (directionVector) => {
      const frame = this.eggBulletsStack.shift();
      // delete the to generate the new color
      this.colorsStack.shift();
      this.loadBullets();
      this.readyBullet.setTexture(CONST.texture + this.eggBulletsStack[0]);
      this.standbyBullet.setTexture(CONST.texture + this.eggBulletsStack[1]);
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

  private initLevelController() {
    this.time.delayedCall(30*1000,()=> {
      this.level += 1;
      this.initLevelController();
    })
  }

  private loadBullets(colorsNumber?: number) {
    const randomNumber1 = Phaser.Math.RND.between(0, this.level-1);
    if (this.eggBulletsStack.length == 0) {
      const randomNumber2 = Phaser.Math.RND.between(0, this.level-1);
      this.eggBulletsStack.push(CONST.frames[randomNumber1]);
      this.eggBulletsStack.push(CONST.frames[randomNumber2]);
      this.colorsStack.push(CONST.colors[randomNumber1]);
      this.colorsStack.push(CONST.colors[randomNumber2]);
    } else {
      this.eggBulletsStack.push(CONST.frames[randomNumber1]);
      this.colorsStack.push(CONST.colors[randomNumber1]);
    }
  }

  private eggContainersRowGenerate(i: number): EggContainer[] {
    const eggsRow: EggContainer[] = [];
    for (let j = 0; j < this.eggsPerRow; j++) {
      const t = this.eggsPerRow === 9 ? j - 0.5 : j;
      eggsRow[j] = new EggContainer({
        scene: this,
        x: 200 + t * CONST.eggWidth,
        y: 520 - i * CONST.eggHeight,
        line: this.eggsPerRow,
        iIndex: i,
        jIndex: j,
      });
      this.eggContainersGroup.add(eggsRow[j]);
    }
    this.eggsPerRow === 9 ? (this.eggsPerRow = 8) : (this.eggsPerRow = 9);
    return eggsRow;
  }

  private nextRowGenerate(i: number): EggContainer[] {
    const eggsRow: EggContainer[] = [];
    for (let j = 0; j < this.eggsPerRow; j++) {
      const t = this.eggsPerRow === 9 ? j - 0.5 : j;
      eggsRow[j] = new EggContainer({
        scene: this,
        x: 200 + t * CONST.eggWidth,
        y:
          this.eggContainers[this.eggContainers.length - 1][0].y -
          CONST.eggHeight,
        line: this.eggsPerRow,
        iIndex: i,
        jIndex: j,
      });
      this.eggContainersGroup.add(eggsRow[j]);
    }
    this.eggsPerRow === 9 ? (this.eggsPerRow = 8) : (this.eggsPerRow = 9);
    return eggsRow;
  }

  private eggContainersFirstInit(): void {
    this.eggContainers = [];
    for (let i = 0; i < this.egglines; i++) {
      this.eggContainers.push(this.eggContainersRowGenerate(i));
    }
  }

  private eggLineInit(eggContainerArray: EggContainer[], level: number): void {
    eggContainerArray.forEach((eggContainer) => {
      eggContainer.generateRandomEgg(level);
      this.eggsGroup.add(<Egg>eggContainer.egg);
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
        (<EggContainer>_egg.parentContainer).setAlpha(1);
        const nearbyContainers = this.nearbyContainers(
          <EggContainer>_egg.parentContainer
        );
        const nearestCont = nearbyContainers
          .filter((obj) => obj != undefined)
          .filter((obj) => !obj.hasEgg)
          .reduce((a, b) =>
            distance(a, _eggProjectile.body) < distance(b, _eggProjectile.body)
              ? a
              : b
          );
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
        if (this.colorMatch(nearestCont)) {
          this.explode(nearestCont, (<Egg>nearestCont.egg).texture.key);
        }
      }
    );
  }

  private colorMatch(f0: EggContainer): boolean {
    let colorMatch = 0;
    const f0s = this.nearbyContainers(f0);
    f0s.forEach((f1) => {
      if (
        f1 &&
        f1.hasEgg &&
        (<Egg>f1.egg).texture.key === (<Egg>f0.egg).texture.key
      ) {
        colorMatch += 1;
        this.nearbyContainers(f1).forEach((f2) => {
          if (
            f2 &&
            f2.hasEgg &&
            f2 != f0 &&
            (<Egg>f2.egg).texture.key === (<Egg>f0.egg).texture.key
          ) {
            colorMatch += 1;
          }
        });
      }
    });
    return colorMatch > 1 ? true : false;
  }

  private explode(eggContainer: EggContainer, texture: string) {
    if (
      eggContainer &&
      eggContainer.hasEgg &&
      (<Egg>eggContainer.egg).texture.key === texture
    ) {
      eggContainer.destroyEgg();
      this.explodedEggContainers.push(eggContainer);
      this.eggsDestroyed += 1;
      if (this.eggsDestroyed >= 17) {
        this.eggsDestroyed -= 17;
        this.generateRows();
      }
      this.nearbyContainers(eggContainer).forEach((element) =>
        this.explode(element, texture)
      );
    }
  }

  private generateRows() {
    let row = this.nextRowGenerate(this.egglines);
    this.eggContainers.push(row);
    this.eggLineInit(row, this.level);
    this.egglines += 1;
    const nextRow = this.nextRowGenerate(this.egglines);
    this.eggContainers.push(nextRow);
    this.eggLineInit(nextRow, this.level);
    this.egglines += 1;
  }

  private dropEggs() {
    if (this.explodedEggContainers.length == 0) return;
    const nextToTop = this.eggContainers[this.highestEgg().iIndex];
    nextToTop
      .filter((cont) => cont.hasEgg)
      .forEach((eggCont) => {
        this.setConnected(eggCont);
      });
    this.eggContainers
      .filter((eggConts, i, array) => {
        return i < this.highestEgg().iIndex ? eggConts : false;
      })
      .map((eggContainerArray, i) => {
        eggContainerArray
          .filter((eggCont) => eggCont.hasEgg && !eggCont.connected)
          .forEach((eggCont) => {
            eggCont.dropEgg();
          });
      });
    this.explodedEggContainers = [];
    this.eggContainers.forEach((eggConts) => {
      eggConts.forEach((eggCont) => {
        eggCont.connected = false;
      });
    });
  }

  private highestEgg(): EggContainer {
    return this.explodedEggContainers.reduce((eggA, eggB) => {
      return eggA.iIndex >= eggB.iIndex ? eggA : eggB;
    });
  }

  private setConnected(eggCont: EggContainer) {
    eggCont.connected = true;
    const bellowedContainers = this.bellowedContainers(eggCont);
    for (let i = 0; i < bellowedContainers.length; i++) {
      this.setConnected(bellowedContainers[i]);
    }
  }

  private bellowedContainers(eggCont: EggContainer): EggContainer[] {
    const i = eggCont.iIndex;
    const j = eggCont.jIndex;
    const line = eggCont.line;
    const bellowedEggs: EggContainer[] = [];
    if (line === 9) {
      this.eggContainers[i - 1]
        ? bellowedEggs.push(this.eggContainers[i - 1][j])
        : true;
      this.eggContainers[i - 1]
        ? bellowedEggs.push(this.eggContainers[i - 1][j - 1])
        : true;
    } else {
      //even line
      this.eggContainers[i - 1]
        ? bellowedEggs.push(this.eggContainers[i - 1][j])
        : true;
      this.eggContainers[i - 1]
        ? bellowedEggs.push(this.eggContainers[i - 1][j + 1])
        : true;
    }
    this.eggContainers[i]
      ? bellowedEggs.push(this.eggContainers[i][j - 1])
      : true;
    this.eggContainers[i]
      ? bellowedEggs.push(this.eggContainers[i][j + 1])
      : true;
    return bellowedEggs.filter(
      (eggCont) => eggCont && eggCont.hasEgg && !eggCont.connected
    );
  }

  private nearbyContainers(eggCont: EggContainer): EggContainer[] {
    const i = eggCont.iIndex;
    const j = eggCont.jIndex;
    const line = eggCont.line;
    const nearbyEggs: EggContainer[] = [];
    // condition for odd
    if (line === 9) {
      this.eggContainers[i - 1]
        ? nearbyEggs.push(this.eggContainers[i - 1][j])
        : true;
      this.eggContainers[i - 1]
        ? nearbyEggs.push(this.eggContainers[i - 1][j - 1])
        : true;
      this.eggContainers[i + 1]
        ? nearbyEggs.push(this.eggContainers[i + 1][j - 1])
        : true;
      this.eggContainers[i + 1]
        ? nearbyEggs.push(this.eggContainers[i + 1][j])
        : true;
    } else {
      //even line
      this.eggContainers[i - 1]
        ? nearbyEggs.push(this.eggContainers[i - 1][j])
        : true;
      this.eggContainers[i - 1]
        ? nearbyEggs.push(this.eggContainers[i - 1][j + 1])
        : true;
      this.eggContainers[i + 1]
        ? nearbyEggs.push(this.eggContainers[i + 1][j])
        : true;
      this.eggContainers[i + 1]
        ? nearbyEggs.push(this.eggContainers[i + 1][j + 1])
        : true;
    }
    this.eggContainers[i]
      ? nearbyEggs.push(this.eggContainers[i][j - 1])
      : true;
    this.eggContainers[i]
      ? nearbyEggs.push(this.eggContainers[i][j + 1])
      : true;
    return nearbyEggs;
  }

  private cyclingContainers(eggConts: EggContainer[]) {
    eggConts.forEach((eggCont) => eggCont.destroy());
  }

  update() {
    this.eggContainersGroup.incY(0.3);
    this.dropEggs();
    this.eggContainers.forEach((eggContainerArray, i) => {
      if (
        eggContainerArray.length > 0 &&
        eggContainerArray[0].y >= CONST.shootingPointy + 100
      ) {
        this.cyclingContainers(eggContainerArray);
        this.eggContainers[i] = [];
      }
    });
  }
}
