import { createSmartAI } from "../ai/smartAI";
import { getAllCards } from "../gameplay/deck";

const rangeOfHands = () => {
  const start = Date.now();
  const player = createSmartAI({ dontConsiderThePlay: true, logRiskyPlays: true, makesMistakes: false });
  const deck = getAllCards();
  for (let a = 0; a < deck.length; a++) {
    for (let b = a + 1; b < deck.length; b++) {
      for (let c = b + 1; c < deck.length; c++) {
        for (let d = c + 1; d < deck.length; d++) {
          for (let e = d + 1; e < deck.length; e++) {
            for (let f = e + 1; f < deck.length; f++) {
              const hand = [deck[a], deck[b], deck[c], deck[d], deck[e], deck[f]];
              player.pickHand(hand, true);
            }
          }
        }
      }
    }
    console.log(Date.now() - start);
  }
};
rangeOfHands();
