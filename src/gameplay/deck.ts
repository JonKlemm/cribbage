export const suits = ['H', 'D', 'C', 'S'];
export const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export type Card = {
  suit: string;
  value: string;
};

export function getAllCards() {
  const deck: Card[] = [];
  suits.forEach((suit) => {
    values.forEach((value) => {
      deck.push({
        suit,
        value,
      })
    });
  });
  return deck;
}

export function shuffle() {
  const allCards = getAllCards();
  const deck: Card[] = [];
  while (allCards.length > 0) {
    const index = Math.floor(Math.random() * allCards.length);
    deck.push(...allCards.splice(index, 1))
  }
  return deck;
}

export function getRemainingCards(knownCards: Card[]) {
  return getAllCards().filter((card) => knownCards.every((knownCard) => knownCard.suit !== card.suit || knownCard.value !== card.value));
}

export const sortCards = (hand: Card[]) => {
  return hand.sort((a, b) => (values.indexOf(a.value) - values.indexOf(b.value)) || a.suit.localeCompare(b.suit));
};

export const stringToCard = (str: string): Card => ({
  suit: str.substring(str.length - 1),
  value: str.substring(0, str.length - 1),
})
export const stringToCards = (hand: string): Card[] => hand.split('|').map(stringToCard);

export const handToString = (hand: Card[], cut?: Card): string => [...sortCards([...hand]), cut as Card].filter(Boolean).map((card) => card.value + card.suit).join('|');
