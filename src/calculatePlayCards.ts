import { shuffle, values } from "./deck";
import { createSmartAI } from "./smartAI";
import { playThePlay } from "./thePlay";

const calculatePlayCards = () => {
  let numGames = 100_000;
  const cardPoints = new Map<string, number>();
  const cardPlays = new Map<string, number>();
  for (let i = 0; i < numGames; i++) {
    const deck = shuffle();
    const player1Cards = deck.splice(0, 4);
    const player2Cards = deck.splice(0, 4);
    const results = playThePlay({
      isPlayer1Crib: true,
      player1: createSmartAI(false),
      player1Cards,
      player2: createSmartAI(false),
      player2Cards,
    });
    results.cardPlays.forEach((numPlays, cardValue) => {
      cardPlays.set(cardValue, (cardPlays.get(cardValue) || 0) + numPlays);
    });
    results.cardPoints.forEach((numPoints, cardValue) => {
      cardPoints.set(cardValue, (cardPoints.get(cardValue) || 0) + numPoints);
    });
  }
  const results: Record<string, number> = {};
  values.forEach((cardValue) => {
    const numPlays = cardPlays.get(cardValue) || 0;
    const numPoints = cardPoints.get(cardValue) || 0;
    results[cardValue] = numPlays && (numPoints / numPlays);
  });
  console.log(JSON.stringify(results));
};
calculatePlayCards();
