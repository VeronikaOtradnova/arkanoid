export function createBlocksWrapper() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('blocks-wrapper');

  return wrapper;
}

function createBlock(rowId, blockNumber) {
  const block = document.createElement('div');
  block.id = `${rowId}__block-${blockNumber}`;
  block.classList.add('block');

  return block;
}

export function createRowWithBlocks(numberOfRow) {
  const gameField = document.getElementById('game-field');
  const gameFieldSize = gameField.getBoundingClientRect().width;

  const numberOfBlocks = gameFieldSize / 100;

  const row = document.createElement('div');
  row.classList.add('row-of-blocks');
  const rowId = `row-${numberOfRow}`;
  row.id = rowId;
  row.style.top = `${numberOfRow * 10}px`;

  for (let i = 0; i < numberOfBlocks; i++) {
    const block = createBlock(rowId, i);
    block.style.left = `${100 * i}px`;
    row.append(block);
  }

  return row;
}

export function findAllBlocks() {
  const blockElems = [];
  document.querySelectorAll('.block').forEach(block => {
    blockElems.push(block);
  })  
  const blocks = blockElems.map(block => {
    return {
      blockElem: block,
      id: block.id,
      leftCoord: block.getBoundingClientRect().x,
      rightCoord: block.getBoundingClientRect().right,
    }
  });

  return blocks;
}