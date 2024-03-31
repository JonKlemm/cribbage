import { Player } from "../gameplay/cribbage";
import { Card } from "../gameplay/deck";

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
      estimatedValue: 0,
    };
  },
  playCard: (playableCards) => {
    return playableCards.slice(Math.floor(Math.random() * playableCards.length))[0];
  },
};
