import { getGameFieldCoords } from "./gameField.js";

function movePlatformOnKeydown(platform) {
  //вычисляем координаты левого края игрового поля.
  const gameField = document.getElementById('game-field');
  const leftCoordGameField = gameField.getBoundingClientRect().x;
  const widthOfGameField = gameField.getBoundingClientRect().width;

  document.addEventListener('keydown', event => {
    //вположение платформы относительно границ поля
    const platformPositionLeft = platform.getBoundingClientRect().x - leftCoordGameField;
    const widthOfPlatform = platform.getBoundingClientRect().width;

    if (event.code === 'ArrowLeft' && gameField.classList.contains('game-started')) {
      //если платформа подошла к краю поля, мы останавливаем её
      const newPlatformPositionLeft = (platformPositionLeft - 15 > 0) ? `${platformPositionLeft - 15}px` : '0px';

      platform.animate([{
        left: newPlatformPositionLeft
      }], {
        duration: 100,
        fill: 'forwards',
      })
    }

    if (event.code === 'ArrowRight' && gameField.classList.contains('game-started')) {
      //если платформа подошла к краю поля, мы останавливаем её
      const newPlatformPositionLeft = (platformPositionLeft + widthOfPlatform + 15 < widthOfGameField) ? `${platformPositionLeft + 15}px` : `${widthOfGameField - widthOfPlatform}px`;
      
      platform.animate([{
        left: newPlatformPositionLeft
      }], {
        duration: 50,
        fill: 'forwards',
      })
    }
  });

}

export function createPlatform(width) {
  const gameFieldSize = getGameFieldCoords().size;

  const platform = document.createElement('div');
  platform.id = 'platform';
  platform.classList.add('platform');
  platform.style.width = `${width}px`;
  platform.style.left = `${gameFieldSize/2 - width/2}px`;
  movePlatformOnKeydown(platform);

  return platform;
}

export function getPlatformCoords() {
  const platform = document.getElementById('platform');

  const left = platform.getBoundingClientRect().x;
  const right = platform.getBoundingClientRect().right;

  const width = platform.getBoundingClientRect().width;
  const center = left + width/2;

  return {
    left,
    center,
    right,
  }
}