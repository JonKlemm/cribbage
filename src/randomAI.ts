import { Player } from "./cribbage";
import { Card } from "./deck";

export const randomAI: Player = {
  pickHand: (hand) => {
    const remainingCards = [...hand];
    const keep: Card[] = [];
    for (let i = 0; i < 4; i++) {
      const card = remainingCards.splice(Math.floor(Math.random() * remainingCards.length), 1);
      keep.push(...card);
    }
    return {
      keep,
      crib: remainingCards,
    };
  },
  playCard: (playableCards) => {
    return playableCards.slice(Math.floor(Math.random() * playableCards.length))[0];
  },
};
