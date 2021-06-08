import { Egg } from "~/game-objects/egg";

export interface IEggContainerContructor {
    scene: Phaser.Scene;
    x: number;
    y: number;
}