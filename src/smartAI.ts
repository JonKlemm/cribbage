import { Player } from "./cribbage";
import { Card, getRemainingCards, handToString } from "./deck";
import { countPlayedCardPoints, countPoints } from "./points";

const handCache = new Map<string, number>();
const playCache = new Map<string, number>();

export const createSmartAI = (makesMistakes: boolean): Player => {
  // Normal distribution of values from 0 to 2
  function randomMistake(mean=0, stdev=1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    let value = z * stdev + mean;
    value = Math.min(2, Math.max(0, value / 3 + 1));
    return value;
  }

  // Estimate value of a hand
  const estimateValue = (hand: Card[], isCrib: boolean) => {
    const strValue = handToString(hand) + `-${isCrib}`;
    let estimatedValue = 0;

    // Estimated value is already cached
    if (handCache.get(strValue)) {
      estimatedValue = handCache.get(strValue) as number;

    // Calculate estimated value
    } else {
      const remainingCards = getRemainingCards(hand);
      remainingCards.forEach((cut) => {
        const strValueCut = handToString([...hand, cut]) + `-${isCrib}`;
        const cardValue = handCache.get(strValueCut) ?? countPoints(hand, cut, isCrib);
        handCache.set(strValueCut, cardValue);
        estimatedValue += cardValue / remainingCards.length;
      });
      handCache.set(strValue, estimatedValue);
    }

    // Adjust for mistakes
    if (makesMistakes) {
      estimatedValue = randomMistake() * estimatedValue;
    }
    return estimatedValue;
  };
  
  // Estimate what two crib cards are worth
  const estimatePartialCribValue = (crib: Card[]) => {
    const strValue = handToString(crib);
    let estimatedValue = 0;

    // We already know what the value is
    if ( handCache.get(strValue)) {
      estimatedValue = handCache.get(strValue) as number;

    // We need to calculate the value
    } else {
      let estimatedValues: number[] = [];
      const remainingCards = getRemainingCards(crib);
      for (let i = 0; i < remainingCards.length; i++) {
        for (let j = i + 1; j < remainingCards.length; j++) {
          const otherCribCards = [remainingCards[i], remainingCards[j]];
          const estimatedValue = estimateValue([...crib, ...otherCribCards], true);
          estimatedValues.push(estimatedValue);
        }
      }
      let estimatedValue = estimatedValues.reduce((combined, current) => combined + current, 0) / estimatedValues.length;
      handCache.set(strValue, estimatedValue);
    }

    // Adjust for mistakes
    if (makesMistakes) {
      estimatedValue = randomMistake() * estimatedValue;
    }
    return estimatedValue;
  };
  
  return {
    pickHand: (hand, isMyCrib) => {
      let bestValue = Number.NEGATIVE_INFINITY;
      let bestKeep: Card[] = [];
      let bestCrib: Card[] = [];
    
      // Loop through all possible pairs of cards to put in crib
      for (let i = 0; i < hand.length; i++) {
        for (let j = i + 1; j < hand.length; j++) {
          const keep = [...hand];
          const crib = [keep[i], keep[j]];
          keep.splice(i, 1);
          keep.splice(j - 1, 1);
          let points = estimateValue(keep, false);
          const cribPoints = estimatePartialCribValue(crib);
          if (isMyCrib) {
            points += cribPoints;
          } else {
            points -= cribPoints;
          }
          if (points > bestValue) {
            bestValue = points;
            bestKeep = keep;
            bestCrib = crib;
          }
        }
      }
    
      return {
        keep: bestKeep,
        crib: bestCrib,
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
        const thisStr = handToString([...stackWithCard], false);
        let estimatedPoints = 0;

        // We already calculated this play
        if (playCache.get(thisStr)) {
          estimatedPoints = playCache.get(thisStr) as number;

        // We need to calculate this play
        } else {
          const cardPoints = countPlayedCardPoints([...stackWithCard]);
          let totalNextPoints = 0;
          for (let i = 0; i < remainingCards.length; i++) {
            const nextPoint = countPlayedCardPoints([...stackWithCard, remainingCards[i]]);
            totalNextPoints += nextPoint;
          }
          totalNextPoints = totalNextPoints / remainingCards.length;
          estimatedPoints = cardPoints - totalNextPoints;
          playCache.set(thisStr, estimatedPoints);
        }

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
