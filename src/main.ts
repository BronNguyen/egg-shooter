import Phaser from 'phaser'
import GameScene from './scenes/GameScene'
import { Preloader } from './scenes/Preloader'



const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
			// debug: true
		}
	},
	scene: [Preloader, GameScene]
}

export default new Phaser.Game(config)
