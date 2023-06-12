import { roundTheNumber } from './helpers.js';
import { getGameFieldCoords } from "./gameField.js";
import { getPlatformCoords } from "./platform.js"; 
import { isBallFell, hideTheBall, getBallCoords } from "./ball.js";
import { findAllBlocks } from './blocks.js'
import { showEndScreen } from './endOfGame.js';

//рассчитывает то, на сколько пикселей влево или вправо полетит мяч
//в зависимости от того, от какого края платформы он отскочил
function calcShift(platformCoords, ballCoord) {
  const platformWidth = platformCoords.right - platformCoords.left;

  if (ballCoord < platformCoords.center - platformWidth/4) {
    return -90;
  } else if (ballCoord < platformCoords.center) {
    return -40;
  } else if (ballCoord > platformCoords.center + platformWidth/4 ) {
    return 90;
  } else if (ballCoord > platformCoords.center) {
    return 40;
  } else {
    return 0;
  }
}

//функция будет возвращать y-координату удалённого блока, чтобы мы могли остановить мяч в правильном месте
function removeDownedBlock(finalLeft, delay) {
  const gameFieldCoords = getGameFieldCoords();
  const ballCoords = getBallCoords();
  let finalCenterXCoordBall = finalLeft + gameFieldCoords.left + ballCoords.size/2;

  const blocks = findAllBlocks().filter(block => block.leftCoord < finalCenterXCoordBall &&
  block.rightCoord > finalCenterXCoordBall);

  let block = blocks[0]?.blockElem;
  if (blocks.length > 0) {
    blocks.forEach(item => {
      if (item.blockElem.getBoundingClientRect().bottom > block.getBoundingClientRect().bottom) {
        block = item.blockElem;
      }
    })
  }

  if (block) {
    setTimeout(() => {
      block.remove();
    }, delay);

    return block.getBoundingClientRect().y;
  }
}

//функция используется, если анимация состоит из двух частей, и нам нужно рассчитать, сколько времени должна занять каждая её часть
function calcIntermediateDuration(gameFieldSize, intermediatePoint, ballDirection, duration) {
  // gameFieldSize - 100%, intermediatePoint - x%
  let firstPartOfRouteInPercentages;
  if (ballDirection === 'up') {
    firstPartOfRouteInPercentages = intermediatePoint / (gameFieldSize / 100);
  } else if (ballDirection === 'down') {
    firstPartOfRouteInPercentages = (gameFieldSize - intermediatePoint) / (gameFieldSize / 100);
  }

  // duration - 100%, firstAnimDuration - firstPartOfRouteInPercentages%
  const firstAnimDuration = (duration / 100) * firstPartOfRouteInPercentages;
  const secondAnimDuration = duration - firstAnimDuration;

  return { firstAnimDuration, secondAnimDuration };
}

function calcFirstPositionOfBounceOffBorderAnim(ballDirection, shift, gameFieldCoords, ballCoords) {
  //мысленно рисуем большой треугольник ABC
  //сторона АВ - расстояние, которое хотел пройти мяч, не будь там границы (гипотенуза)
  //сторона АС === shift (катет)
  //сторона CB === высоте gameField (gameFieldCoords.size) (катет)

  // для дальнейших рассчётов мне нужно знать сторону CB
  const CB = gameFieldCoords.size;

  //треугольник АВС пересекается боковой границей игрового поля, 
  //таким образом в треугольнике АВС лежит подобный треугольник аbс
  //вычислив сторону cb, мы сможем вычислить координату bottom, на которой
  //мяч должен остановиться, когда долетит до края поля

  //но чтобы вычислить сторону  cb, нужно знать сторону ac
  let ac;
  if (shift > 0) {
    ac = gameFieldCoords.right - ballCoords.right;
  } else if (shift < 0) {
    ac = ballCoords.left - gameFieldCoords.left;
  }

  //мы помним, что АВС и abc - подобные треугольники, поэтому знаем, что
  // CB/cb = AC/ac , следовательно,
  // cb = (CB * ac)/AC
  let cb;
  if (shift > 0) {
    cb = ((CB * ac) / shift);
  } else if (shift < 0) {
    cb = ((CB * ac) / -shift);
  }

  //рассчитываем координаты, в которых мяч окажется в момент столкновения с боковой границей
  let firstBottom;
  if (ballDirection === 'up') {
    firstBottom = (roundTheNumber(cb, 0) + ballCoords.size < gameFieldCoords.size) ? (roundTheNumber(cb, 0)) :
     (gameFieldCoords.size - ballCoords.size);
  } else if (ballDirection === 'down') {
    firstBottom = gameFieldCoords.size - roundTheNumber(cb, 0);
  }

  if (firstBottom < 0 || firstBottom > 600) {
    debugger;
  }

  let firstLeft;
  if (shift > 0) {
    firstLeft = gameFieldCoords.size - ballCoords.size;
  } else if (shift < 0) {
    firstLeft = 0;
  }

  return {firstBottom, firstLeft};
}

function calcSecondPositionOfBounceOffBorderAnim(ballDirection, shift, gameFieldCoords, ballCoords) {
  let secondBottom;
  if (ballDirection === 'up') {
    secondBottom = gameFieldCoords.size - ballCoords.size;
  } else if (ballDirection === 'down') {
    secondBottom = 5;
  }

  let secondLeft;
  if (shift > 0) {
    secondLeft = gameFieldCoords.size - ballCoords.size - shift;
  } else if (shift < 0) {
    secondLeft = -shift;
  }

  return {secondBottom, secondLeft};
}

// если мяч должен отскочить от правого или левого края
function bounceOffTheBorder(ballDirection, shift, ball, duration = 1300) {
  const gameFieldCoords = getGameFieldCoords();
  const ballCoords = getBallCoords();
  
  //рассчитываем, в каком месте мяч должен отскочить от границы
  const {firstBottom, firstLeft} = calcFirstPositionOfBounceOffBorderAnim(ballDirection, shift, gameFieldCoords, ballCoords);

  //рассчитываем, куда мяч отскочит от границы поля
  let {secondBottom, secondLeft} = calcSecondPositionOfBounceOffBorderAnim(ballDirection, shift, gameFieldCoords, ballCoords);

  //рассчитываем, сколько времени займёт каждая часть анимации
  const {firstAnimDuration, secondAnimDuration} = calcIntermediateDuration(gameFieldCoords.size, firstBottom, ballDirection, duration);

  //смотрим, пересёкся ли мяч с блоком. если да, то удалим его
  let yCoordOfDownedBlock;
  if (ballDirection === 'up') {
    yCoordOfDownedBlock = removeDownedBlock(secondLeft, duration)
  }
  if (yCoordOfDownedBlock) {
    secondBottom = gameFieldCoords.size - (yCoordOfDownedBlock - gameFieldCoords.top) - ballCoords.size;
  }

  //анимируем мяч
  ball.animate([
    {
      bottom: `${firstBottom}px`,
      left: `${firstLeft}px`,
    },
  ], {
    duration: firstAnimDuration,
    fill: 'forwards',
  });

  setTimeout(() => {
    ball.animate([{
      bottom: `${secondBottom}px`,
      left: `${secondLeft}px`,
    }], {
      duration: secondAnimDuration,
      fill: 'forwards',
    });
  }, firstAnimDuration)

  //определяем, что будет с мячом после завершения анимации
  setTimeout(() => {
    const finalCenterXCoordBall = secondLeft + gameFieldCoords.left + ballCoords.size / 2;

    if (ballDirection === 'up' && findAllBlocks() < 1) {
      setTimeout(() => showEndScreen('win'), 100);
    } else if (ballDirection === 'up') {
      animateRootDown(-shift);
    } else if (ballDirection === 'down' && !isBallFell(finalCenterXCoordBall)) {
      const nextShift = calcShift(getPlatformCoords(), finalCenterXCoordBall);
      animateRootUp(nextShift);
    } else if (ballDirection === 'down' && isBallFell(finalCenterXCoordBall)) {
      hideTheBall(100);
      showEndScreen('fail');
    }
  }, duration)
}

//shift - число, показывает то, на сколько пикселей влево или вправо полетит мяч
// -shift - сдвиг влево, shift - сдвиг вправо
function animateRootDown(shift, duration = 1200) {
  //вычисляем начальные координаты мяча и поля
  const gameFieldCoords = getGameFieldCoords();
  const ball = document.getElementById('ball');
  const leftPositionBall = ball.getBoundingClientRect().x - gameFieldCoords.left;
  const ballSize = ball.getBoundingClientRect().width;

  //вычисляем конечные координаты мяча
  const finalBottomPosition = 5;
  const finalLeftPosition = leftPositionBall + shift;
  const finalCenterXCoordBall = finalLeftPosition + gameFieldCoords.left + ballSize / 2;

  //если мяч летит к боковой границе, то меняем маршрут, если нет - анимируем до координат, которые уже вычислили
  if (finalLeftPosition + gameFieldCoords.left + ballSize > gameFieldCoords.right ||
  finalLeftPosition + gameFieldCoords.left < gameFieldCoords.left) {
    bounceOffTheBorder('down', shift, ball);
    return;
  } else {
    ball.animate({
      bottom: `${finalBottomPosition}px`, left: `${finalLeftPosition}px`
    }, {
      duration: duration,
      fill: 'forwards',
    }
    );
  }

  //проверяем, упал ли мяч на платформу
  setTimeout(() => {
    if (isBallFell(finalCenterXCoordBall)) {
      hideTheBall(100);
      setTimeout(() => showEndScreen('fail'), 100);
    } else {
      const nextShift = calcShift(getPlatformCoords(), finalCenterXCoordBall);
      animateRootUp(nextShift);
    }
  }, duration);
}

//shift - число, показывает то, на сколько пикселей влево или вправо полетит мяч
// -shift - сдвиг влево, shift - сдвиг вправо
function animateRootUp(shift, duration = 1200) {
  //определяем начальные координаты игрового поля и мяча
  const gameFieldCoords = getGameFieldCoords();
  const ball = document.getElementById('ball');
  const ballCoords = getBallCoords();
  const leftPositionBall = ballCoords.left - gameFieldCoords.left;
  const ballSize = ballCoords.size;

  //определяем конечные координаты мяча
  let finalBottomPosition = gameFieldCoords.size - ballSize;
  const finalLeftPosition = (leftPositionBall + ballSize + shift < gameFieldCoords.size) ? (leftPositionBall + shift) 
  : (gameFieldCoords.size - ballSize);
  const finalRightCoord = finalLeftPosition + gameFieldCoords.left + ballSize;
  const finalLeftCoord = finalLeftPosition + gameFieldCoords.left

  //смотрим, пересёкся ли мяч с блоком. если да, то удалим его
  const yCoordOfDownedBlock = removeDownedBlock(finalLeftPosition, duration)

  if (yCoordOfDownedBlock) {
    finalBottomPosition = gameFieldCoords.size - (yCoordOfDownedBlock - gameFieldCoords.top) - ballSize;
  }

  //если мяч летит к боковой границе, то меняем маршрут, если нет - анимируем до координат, которые уже вычислили
  if (finalRightCoord < gameFieldCoords.right && finalLeftCoord > gameFieldCoords.left) {
    ball.animate({
      bottom: `${finalBottomPosition}px`, left: `${finalLeftPosition}px`
    }, {
      duration: duration,
      fill: 'forwards',
    }
    );
  } else {
    bounceOffTheBorder('up', shift, ball);
    return;
  }

  //если блоки ещё остались, то продолжаем игру. если нет - завершаем
  setTimeout(() => { 
    if (findAllBlocks() < 1) {
      setTimeout(() => showEndScreen('win'), 100);
    } else {
      animateRootDown(shift)
    } 
  }, duration);
}

export function throwTheBallOnKeydown() {
  const gameField = document.getElementById('game-field');
  gameField.classList.add('game-started'); // это нужно, чтобы нельзя было двигать платформу до нажатия пробела
  animateRootUp(40);
}