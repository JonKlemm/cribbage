import { stringToCards } from "../gameplay/deck";
import { createSmartAI } from "../ai/smartAI";

const determineBestHand = () => {
  const hand = stringToCards('10S|6H|5S|3D|2S|AD');
  createSmartAI(false).pickHand(hand, false, true);
};
determineBestHand();
