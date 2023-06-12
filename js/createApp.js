import { createGameField } from './gameField.js';
import { createPlatform } from './platform.js';
import { createBall } from './ball.js';
import { createBlocksWrapper, createRowWithBlocks } from './blocks.js';

//gameFieldSize должен быть кратен 100
export function createApp(container, gameFieldSize) {
  const gameField = createGameField(gameFieldSize);
  container.append(gameField);
  gameField.focus();

  const startHeading = document.createElement('h1');
  startHeading.classList.add('heading_small', 'position-vertical-center');
  startHeading.id = 'start-heading';
  startHeading.textContent = 'Press spacebar to start playing';

  const platform = createPlatform(100, gameFieldSize);
  const ball = createBall(30);

  const blocksWrapper = createBlocksWrapper();
  for (let i = 0; i < 3; i++) {
    const row = createRowWithBlocks(i);
    blocksWrapper.append(row);
  }
  
  gameField.append(blocksWrapper);
  gameField.append(startHeading);
  gameField.append(ball);
  gameField.append(platform);
}
