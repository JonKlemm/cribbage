import { cardPointsInPlay } from "../precalc/cardPointsInPlay";
import { Player } from "../gameplay/cribbage";
import { Card, getRemainingCards, handToString } from "../gameplay/deck";
import { countPlayedCardPoints, countPoints } from "../gameplay/points";

const handCache = new Map<string, number>();
const handCutCribCache = new Map<string, number>();
const handCutNotCribCache = new Map<string, number>();
const cribCache = new Map<string, number>();

type Params = {
  dontConsiderThePlay?: boolean;
  logHandDecisions?: boolean;
  logRiskyPlays?: boolean;
  makesMistakes: boolean;
}
export const createSmartAI = ({ dontConsiderThePlay, logHandDecisions, logRiskyPlays, makesMistakes }: Params): Player => {
  // Normal distribution of values from 0 to 2
  function randomMistake(mean=0, stdev=1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    let value = z * stdev + mean;
    value = Math.min(2, Math.max(0, value / 3 + 1));
    return value;
  }

  const countEstimatedPlayPoints = (hand: Card[]) => {
    return hand.reduce((totalPoints, card) => totalPoints + cardPointsInPlay[card.value], 0);
  }

  // Estimate value of a hand
  const estimateValue = (hand: Card[], isCrib: boolean) => {
    const guaranteedPoints = logRiskyPlays && !isCrib ? countPoints(hand, null, isCrib) : 0;
    const strValue = handToString(hand) + `-${isCrib}`;
    let estimatedValue = 0;

    // Estimated value is already cached
    if (handCache.get(strValue)) {
      estimatedValue = handCache.get(strValue) as number;

    // Calculate estimated value
    } else {
      const remainingCards = getRemainingCards(hand);
      remainingCards.forEach((cut) => {
        const strValueCut = handToString(hand, cut);
        const cacheToUse = isCrib ? handCutCribCache : handCutNotCribCache;
        let cardValue = cacheToUse.get(strValueCut) ?? countPoints(hand, cut, isCrib);
        cacheToUse.set(strValueCut, cardValue);
        // This isn't the crib so estimate how many points the cards are worth during the play
        if (!isCrib && !dontConsiderThePlay) {
          cardValue += countEstimatedPlayPoints(hand);
        }
        estimatedValue += cardValue / remainingCards.length;
      });
      handCache.set(strValue, estimatedValue);
    }

    // Adjust for mistakes
    if (makesMistakes) {
      estimatedValue = randomMistake() * estimatedValue;
    }
    return {
      estimatedValue,
      guaranteedPoints,
    };
  };
  
  // Estimate what two crib cards are worth
  const estimatePartialCribValue = (crib: Card[]) => {
    const guaranteedPoints = logRiskyPlays ? countPoints(crib, null, true) : 0;
    const strValue = handToString(crib);
    let estimatedValue = 0;

    // We already know what the value is
    if ( cribCache.get(strValue)) {
      estimatedValue = cribCache.get(strValue) as number;

    // We need to calculate the value
    } else {
      let estimatedValues: number[] = [];
      const remainingCards = getRemainingCards(crib);
      for (let i = 0; i < remainingCards.length; i++) {
        for (let j = i + 1; j < remainingCards.length; j++) {
          const otherCribCards = [remainingCards[i], remainingCards[j]];
          const estimatedValue = estimateValue([...crib, ...otherCribCards], true);
          estimatedValues.push(estimatedValue.estimatedValue);
        }
      }
      estimatedValue = estimatedValues.reduce((combined, current) => combined + current, 0) / estimatedValues.length;
      cribCache.set(strValue, estimatedValue);
    }

    // Adjust for mistakes
    if (makesMistakes) {
      estimatedValue = randomMistake() * estimatedValue;
    }
    return {
      estimatedValue,
      guaranteedPoints,
    };
  };
  
  return {
    pickHand: (hand, isMyCrib) => {
      const bestEstimatedHand = {
        bestCrib: [] as Card[],
        bestKeep: [] as Card[],
        bestValue: Number.NEGATIVE_INFINITY,
        guaranteedPoints: 0,
      };
      const bestGuaranteedHand = {
        bestCrib: [] as Card[],
        bestKeep: [] as Card[],
        bestValue: Number.NEGATIVE_INFINITY,
        estimatedPoints: 0,
      };
      const hands = new Map<string, number>();
    
      // Loop through all possible pairs of cards to put in crib
      for (let i = 0; i < hand.length; i++) {
        for (let j = i + 1; j < hand.length; j++) {
          const keep = [...hand];
          const crib = [keep[i], keep[j]];
          keep.splice(i, 1);
          keep.splice(j - 1, 1);
          const keepPoints = estimateValue(keep, false);
          let estimatedPoints = keepPoints.estimatedValue;
          let guaranteedPoints = keepPoints.guaranteedPoints;
          const cribPoints = estimatePartialCribValue(crib);
          if (isMyCrib) {
            estimatedPoints += cribPoints.estimatedValue;
            guaranteedPoints += cribPoints.guaranteedPoints;
          } else {
            estimatedPoints -= cribPoints.estimatedValue;
            guaranteedPoints -= cribPoints.guaranteedPoints;
          }
          if (estimatedPoints > bestEstimatedHand.bestValue) {
            bestEstimatedHand.bestValue = estimatedPoints;
            bestEstimatedHand.bestKeep = keep;
            bestEstimatedHand.bestCrib = crib;
            bestEstimatedHand.guaranteedPoints = guaranteedPoints;
          }
          if (logRiskyPlays && guaranteedPoints > bestGuaranteedHand.bestValue) {
            bestGuaranteedHand.bestValue = guaranteedPoints;
            bestGuaranteedHand.bestKeep = keep;
            bestGuaranteedHand.bestCrib = crib;
            bestGuaranteedHand.estimatedPoints = estimatedPoints;
          }
          if (logHandDecisions) {
            hands.set(`${handToString(keep)} - ${handToString(crib)} (${estimatedPoints})`, estimatedPoints);
          }
        }
      }

      if (logRiskyPlays && bestEstimatedHand.guaranteedPoints < bestGuaranteedHand.bestValue) {
        console.log(`Best estimated hand: ${handToString(bestEstimatedHand.bestKeep)} - ${handToString(bestEstimatedHand.bestCrib)} (${bestEstimatedHand.guaranteedPoints}) (${bestEstimatedHand.bestValue})`);
        console.log(`Best guaranteed hand: ${handToString(bestGuaranteedHand.bestKeep)} - ${handToString(bestGuaranteedHand.bestCrib)} (${bestGuaranteedHand.bestValue}) (${bestGuaranteedHand.estimatedPoints})`);
      }

      if (logHandDecisions) {
        Array.from(hands.entries()).sort(([, aValue], [, bValue]) => bValue - aValue).forEach(([hand]) => {
          console.log(hand);
        });
      }
    
      return {
        keep: bestEstimatedHand.bestKeep,
        crib: bestEstimatedHand.bestCrib,
        estimatedValue: bestEstimatedHand.bestValue,
      };
    },
    playCard: (playableCards, stack) => {
      let bestValue = Number.NEGATIVE_INFINITY;
      let bestCard: Card | null = null;
      const remainingCards = getRemainingCards([...playableCards, ...stack]);

      // Check each playable card for which is best
      playableCards.forEach((card) => {
        // TODO - consider what I would play after their card as well
        const stackWithCard = [...stack, card];
        let estimatedPoints = 0;

      // Calculate this play
        const cardPoints = countPlayedCardPoints([...stackWithCard]);
        let totalNextPoints = 0;
        for (let i = 0; i < remainingCards.length; i++) {
          const nextPoint = countPlayedCardPoints([...stackWithCard, remainingCards[i]]);
          totalNextPoints += nextPoint;
        }
        totalNextPoints = totalNextPoints / remainingCards.length;
        estimatedPoints = cardPoints - totalNextPoints;

        // Adjust for mistakes
        if (makesMistakes) {
          estimatedPoints = randomMistake() * estimatedPoints;
        }
        if (estimatedPoints > bestValue) {
          bestValue = estimatedPoints;
          bestCard = card;
        }
      });

      if (bestCard) {
        return bestCard;
      } else {
        throw Error('Never found best card');
      }
    },
  };
};
