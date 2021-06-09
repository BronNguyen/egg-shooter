import { Egg } from "~/game-objects/egg";

export interface IEggContainerContructor {
    scene: Phaser.Scene;
    line:number;
    x: number;
    y: number;
    iIndex:number;
    jIndex:number;
}