import { Card, shuffle } from './deck';
import { countPoints } from './points';
import { playThePlay } from './thePlay';

export type Player = {
  pickHand: (hand: Card[], isMyCrib: boolean) => {
    crib: Card[],
    keep: Card[],
    estimatedValue: number;
  };
  playCard: (playableCards: Card[], stack: Card[]) => Card;
};

// Plays a game of cribbage
export const play = (player1: Player, player2: Player, startPlayer1: boolean) => {
  let isPlayer1Crib = startPlayer1;
  let player1Points = 0;
  let player2Points = 0;

  const isGameOver = () => player1Points >= 121 || player2Points >= 121;

  while (true) {
    // Deal cards
    let player1Cards: Card[] = [];
    let player2Cards: Card[] = [];
    const deck = shuffle();
    while (player1Cards.length < 6) {
      player1Cards.push(deck.pop() as Card);
      player2Cards.push(deck.pop() as Card);
    }

    // Pick crib cards
    const crib: Card[] = [];
    const player1Decision = player1.pickHand(player1Cards, isPlayer1Crib);
    const player2Decision = player2.pickHand(player2Cards, !isPlayer1Crib);
    player1Cards = player1Decision.keep;
    player2Cards = player2Decision.keep;
    crib.push(...player1Decision.crib);
    crib.push(...player2Decision.crib);

    // Cut
    const cut = deck.pop() as Card;
    if (cut.value === 'J') {
      if (isPlayer1Crib) {
        player1Points += 2;
      } else {
        player2Points += 2;
      }
      if (isGameOver()) {
        break;
      }
    }

    // The play
    const playResults = playThePlay({
      isPlayer1Crib,
      player1,
      player1Cards,
      player2,
      player2Cards,
    });
    player1Points += playResults.player1Points;
    player2Points += playResults.player2Points;

    // Count non dealer points
    if (isPlayer1Crib) {
      player2Points += countPoints(player2Cards, cut, false);
    } else {
      player1Points += countPoints(player1Cards, cut, false);
    }
    if (isGameOver()) {
      break;
    }

    // Count dealer points
    const cribPoints = countPoints(crib, cut, true);
    if (isPlayer1Crib) {
      player1Points += countPoints(player1Cards, cut, false);
      player1Points += cribPoints;
    } else {
      player2Points += countPoints(player2Cards, cut, false);
      player2Points += cribPoints;
    }
    if (isGameOver()) {
      break;
    }

    // Flip dealer
    isPlayer1Crib = !isPlayer1Crib;
  }

  return {
    player1Points: Math.min(player1Points, 121),
    player2Points: Math.min(player2Points, 121),
  };
};
