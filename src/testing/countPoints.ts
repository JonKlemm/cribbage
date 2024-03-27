import { stringToCard, stringToCards } from "../gameplay/deck";
import { countPoints } from "../gameplay/points";


const determineBestHand = () => {
  const hand = stringToCards('2S|4S|6S|8S');
  const cut = stringToCard('10D');
  const points = countPoints(hand, cut, false);
  console.log(points);
};
determineBestHand();
