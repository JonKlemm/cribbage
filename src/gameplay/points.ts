import { Card, sortCards, values } from './deck';
import { cardPointsInPlay } from '../precalc/cardPointsInPlay';

const getAllSubsets =
      (hand: Card[]): Card[][] => hand.reduce(
        (subsets, value) => subsets.concat(
         subsets.map(set => [value,...set])
        ),
        [[]] as Card[][]
      );

export const getNumericValue = (card: Card) => {
  switch (card.value) {
    case 'J':
    case 'Q':
    case 'K':
      return 10;
    case 'A':
      return 1;
    default:
      return Number(card.value);
  }
};

const countFifteens = (allCards: Card[]) => {
  const subsets = getAllSubsets(allCards);
  let points = 0;
  subsets.forEach((subset) => {
    const value = subset.reduce((combined, card) => combined + getNumericValue(card), 0);
    if (value === 15) {
      points += 2;
    }
  });
  return points;
};

const countPairs = (allCards: Card[]) => {
  const subsets = getAllSubsets(allCards);
  let points = 0;
  subsets.forEach((subset) => {
    if (subset.length === 2 && subset[0].value === subset[1].value) {
      points += 2;
    }
  });
  return points
};

const countRuns = (allCards: Card[]) => {
  const subsets = getAllSubsets(allCards);
  let runs: Card[][] = [];
  subsets.forEach((subset) => {
    if (subset.length < 3) {
      return;
    }
    const sorted = sortCards(subset);
    let isRun = true;
    sorted.forEach((card, index) => {
      const nextCard = sorted[index + 1];
      const diff = Math.abs(values.indexOf(card.value) - values.indexOf(nextCard?.value ?? Infinity));
      if (nextCard && diff !== 1) {
        isRun = false;
      }
    });
    if (isRun) {
      runs.push(subset); 
    }
  });
  const longestRun = runs.reduce((longest, current) => Math.max(longest, current.length), 0);
  const numberOfRuns = runs.filter((run) => run.length === longestRun);
  return numberOfRuns.length * longestRun;
};

const countFlush = (hand: Card[], cut: Card, isCrib: boolean) => {
  const allCards = [...hand, cut];
  const isHandFlush = hand.every((card, index, array) => card.suit === array[0].suit);
  const isAllCardsFlush = allCards.every((card, index, array) => card.suit === array[0].suit);
  if (isAllCardsFlush) {
    return 5;
  } else if (isHandFlush && !isCrib) {
    return 4;
  }
  return 0;
};

const countNobs = (hand: Card[], cut: Card) => {
  const jacks = hand.filter((card) => card.value === 'J');
  if (jacks.some((card) => card.suit === cut.suit)) {
    return 1;
  }
  return 0;
};

// This is used to count how many points a hand is worth
export const countPoints = (hand: Card[], cut: Card, isCrib: boolean) => {
  const allCards = [...hand, cut];
  let points = 0;
  points += countFifteens(allCards);
  points += countPairs(allCards);
  points += countRuns(allCards);
  points += countFlush(hand, cut, isCrib);
  points += countNobs(hand, cut);
  return points;
};

// Data used to calculate the value of cards during the play
export const cardPoints = new Map<string, number>();
export const cardAppearences = new Map<string, number>();

// This is used to count how many points the top card in the play stack earned
export const countPlayedCardPoints = (stack: Card[]): number => {
  let points = 0;
  const stackSum = stack.map((card) => getNumericValue(card)).reduce((combined, current) => combined + current, 0);

  // This is an illegal play, don't count it
  if (stackSum > 31) {
    return 0;
  }

  if (stackSum === 15 || stackSum === 31) {
    points += 2;
  }

  let runPoints = 0;
  for (let numCards = 3; numCards < stack.length - 1; numCards++) {
    const cardsToCheck = stack.slice(stack.length - numCards);
    const currentRunPoints = countRuns(cardsToCheck);
    if (currentRunPoints > 0) {
      runPoints = currentRunPoints;
    }
  }
  points += runPoints;

  let setPoints = 0;
  for (let numCards = 2; numCards < stack.length - 1; numCards++) {
    const cardsToCheck = stack.slice(stack.length - numCards);
    if (cardsToCheck.map((card) => card.value).every((value) => value === cardsToCheck[0].value)) {
      setPoints = countPairs(cardsToCheck);
    } else {
      break;
    }
  }
  points += setPoints;

  return points; 
};
