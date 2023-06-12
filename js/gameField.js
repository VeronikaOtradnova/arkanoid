export function createGameField(size) {
  const gameField = document.createElement('div');
  gameField.id = 'game-field';
  gameField.classList.add('game-field');
  gameField.style.width = `${size}px`;
  gameField.style.height = `${size}px`;

  return gameField;
}

export function getGameFieldCoords() {
  const gameField = document.getElementById('game-field');

  const top = gameField.getBoundingClientRect().y;
  const left = gameField.getBoundingClientRect().x;
  const right = gameField.getBoundingClientRect().right;

  const size = gameField.getBoundingClientRect().width;

  return {
    top,
    left,
    right,
    size,
  }
}