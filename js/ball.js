import { getPlatformCoords } from "./platform.js";
import { throwTheBallOnKeydown } from "./ballMovement.js";
import { getGameFieldCoords } from "./gameField.js";

export function createBall(ballSize) {
  const gameField = document.getElementById('game-field');
  const gameFieldSize = getGameFieldCoords().size;

  const ball = document.createElement('div');
  ball.id = 'ball';
  ball.classList.add('ball');
  ball.style.left = `${gameFieldSize/2 - ballSize/2}px`;
  ball.style.width = `${ballSize}px`;
  ball.style.height = `${ballSize}px`;

  document.addEventListener('keydown', event => {
    if (!gameField.classList.contains('game-started') && event.code === 'Space') {
      const startHeading = document.getElementById('start-heading');
      if (startHeading) startHeading.remove();
      throwTheBallOnKeydown();
    }
  });

  return ball;
}

export function isBallFell(finalCenterXCoordBall) {
  const platformCoords = getPlatformCoords();

  const result = (finalCenterXCoordBall < platformCoords.left || finalCenterXCoordBall > platformCoords.right) ? true : false;

  return result;
}

export function hideTheBall(duration) {
  const ball = document.getElementById('ball');
  const ballSize = ball.getBoundingClientRect().width;

  ball.animate({
    bottom: `-${ballSize + 5}px`,
  }, {
    duration: duration,
    fill: 'forwards',
  });
}

export function getBallCoords() {
  const ball = document.getElementById('ball');

  const left = ball.getBoundingClientRect().x;
  const right = ball.getBoundingClientRect().right;
  const bottom = ball.getBoundingClientRect().bottom;
  const size = ball.getBoundingClientRect().width;

  return {
    left,
    right,
    bottom,
    size,
  }
}