import { stringToCards } from "../gameplay/deck";
import { createSmartAI } from "../ai/smartAI";

const determineBestHand = () => {
  const hand = stringToCards('KC|QC|5H|2C|7C|7S');
  createSmartAI({
    logHandDecisions: true,
    logRiskyPlays: true,
    makesMistakes: false,
  }).pickHand(hand, true);
};
determineBestHand();
