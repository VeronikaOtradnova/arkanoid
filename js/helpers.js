//удалит лишние знаки после запятой. 
//number - какое число округляем
//howMuchToLeave - сколько знаков после запятой нужно оставить
export function roundTheNumber(number, howMuchToLeave) {
  return Number(number.toFixed(howMuchToLeave));
}