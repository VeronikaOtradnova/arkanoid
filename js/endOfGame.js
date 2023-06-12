import { createRowWithBlocks } from "./blocks.js";

function setStartingPosition() {
  const gameField = document.getElementById('game-field');
  const gameFieldSize = gameField.getBoundingClientRect().width;
  gameField.classList.remove('game-started');

  const platform = document.getElementById('platform');
  const platformWidth = platform.getBoundingClientRect().width;
  platform.animate([
    {left: `${gameFieldSize/2 - platformWidth/2}px`}
  ], {
    duration: 150,
    fill: 'forwards',
  })

  const ball = document.getElementById('ball');
  const ballSize = ball.getBoundingClientRect().width;
  ball.animate([
    {
      left: `${gameFieldSize/2 - ballSize/2}px`,
      bottom: '5px',
    }
  ], {
    duration: 150,
    fill: 'forwards',
  })

  const blocksWrapper = document.querySelector('.blocks-wrapper');
  blocksWrapper.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const row = createRowWithBlocks(i);
    blocksWrapper.append(row);
  }
}

//resultOfGame - 'fail' или 'win'
export function showEndScreen(resultOfGame) {

  setStartingPosition();

  const gameField = document.getElementById('game-field');

  const endScreen = document.createElement('div');
  endScreen.classList.add('end');

  const heading = document.createElement('h1');
  heading.classList.add('heading_big');

  const newGameBtn = document.createElement('button');
  newGameBtn.classList.add('end__btn');

  newGameBtn.addEventListener('click', () => {
    endScreen.remove();
  })

  if (resultOfGame === 'fail') {
    heading.textContent = 'Game over';
    newGameBtn.textContent = 'Try again';
  } else if (resultOfGame === 'win') {
    heading.textContent = 'You win!';
    newGameBtn.textContent = 'New game';
  }

  gameField.append(endScreen);
  endScreen.append(heading);
  endScreen.append(newGameBtn);
}