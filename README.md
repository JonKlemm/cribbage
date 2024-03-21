# Cribbage simulator

## How to simulate games
1. Open [simulateGames.ts](src/simulateGames.ts)
1. Choose which AIs you want to use
   - `createSmartAI(false)` plays as best as ~~possible~~ I coded
   - `createSmartAI(true)` over and under estimates values using a normal distribution, this is an estimate of a beginner
   - `randomAI` makes decisions completely at random
2. Choose how many games you want to play
3. Run `npx ts-node src/simulateGames.ts`
   - 10,000 games takes about 4 minutes to run

## How to determine best choice of hand
1. Open [determineBestHand.ts](src/determineBestHand.ts)
2. Enter your cards into `stringToCards` ex. `'10S|6H|5S|3D|2S|AD'`
3. Set whether it's your crib or not
   - `createSmartAI(false).pickHand(hand, true, true);` if it's your crib
   - `createSmartAI(false).pickHand(hand, false, true);` if it's not your crib
4. Run `npx ts-node src/determineBestHand.ts`
   - It will take a couple seconds to transpile but will execute in less than a second
