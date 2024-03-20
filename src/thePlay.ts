import { Player } from "./cribbage";
import { Card } from "./deck";
import { countPlayedCardPoints, getNumericValue } from "./points";

type Params = {
  isPlayer1Crib: boolean;
  player1: Player;
  player1Cards: Card[];
  player2: Player;
  player2Cards: Card[];
};

export const playThePlay = ({
  isPlayer1Crib,
  player1,
  player1Cards,
  player2,
  player2Cards,
}: Params) => {
  let player1Points = 0;
  let player2Points = 0;
  let isPlayer1Turn = !isPlayer1Crib;
  let player1Stack = [...player1Cards];
  let player2Stack = [...player2Cards];
  let stack: Card[] = [];
  let player1CanPlay = true;
  let player2CanPlay = true;
  const cardPoints = new Map<string, number>();
  const cardPlays = new Map<string, number>();

  while (player1Stack.length || player2Stack.length) {
    // Player can't play
    if (!player1CanPlay && isPlayer1Turn) {
      isPlayer1Turn = !isPlayer1Turn;
      continue;
    } else if (!player2CanPlay && !isPlayer1Turn) {
      isPlayer1Turn = !isPlayer1Turn;
      continue;
    }

    // Play a card
    let stackSum = stack.map((card) => getNumericValue(card)).reduce((combined, current) => combined + current, 0);
    let pointsThisPlay = 0;
    const player = isPlayer1Turn ? player1 : player2;
    const playerStack = isPlayer1Turn ? player1Stack : player2Stack;
    const playableCards = playerStack.filter((card) => getNumericValue(card) <= 31 - stackSum);
    
    // Play a card
    if (playableCards.length > 0) {
      const playedCard = player.playCard(playableCards, [...stack]);
      stack.push(playedCard);
      pointsThisPlay += countPlayedCardPoints(stack);
      if (isPlayer1Turn) {
        player1Stack = player1Stack.filter((card) => card !== playedCard);
      } else {
        player2Stack = player2Stack.filter((card) => card !== playedCard);
      }
      cardPoints.set(playedCard.value, (cardPoints.get(playedCard.value) || 0) + pointsThisPlay);
      cardPlays.set(playedCard.value, (cardPoints.get(playedCard.value) || 0) + 1);

    // This player couldn't play a card
    } else if (isPlayer1Turn) {
      player1CanPlay = false;
    } else {
      player2CanPlay = false;
    }

    // No one could play a card, give points to the last player who played
    stackSum = stack.map((card) => getNumericValue(card)).reduce((combined, current) => combined + current, 0);
    if (!player1CanPlay && !player2CanPlay) {
      if (stackSum !== 31) {
        pointsThisPlay += 1;
        const lastPlayedCard = stack[stack.length - 1];
        cardPoints.set(lastPlayedCard.value, (cardPoints.get(lastPlayedCard.value) || 0) + pointsThisPlay);
      }
      stack = [];
      player1CanPlay = true;
      player2CanPlay = true;

    // We've reached the end of this stack, points were already awarded by countPlayedCardPoints
    } else if (stackSum === 31) {
      stack = [];
      player1CanPlay = true;
      player2CanPlay = true;
    }

    // Give points and switch who's turn it is
    if (isPlayer1Turn) {
      player1Points += pointsThisPlay;
    } else {
      player2Points += pointsThisPlay;
    }
    isPlayer1Turn = !isPlayer1Turn;
  }

  return {
    cardPlays,
    cardPoints,
    player1Points,
    player2Points,
  };
}