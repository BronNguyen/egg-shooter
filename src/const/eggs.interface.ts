export interface IEggConstructor {
    scene: Phaser.Scene;
    x: number;
    y: number;
    texture: string;
    frame?: string | number;
}