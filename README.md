# Cribbage simulator

## How to use
1. Open [simulateGames.ts](src/simulateGames.ts)
1. Choose which AIs you want to use
   - `createSmartAI(false)` plays as best as ~~possible~~ I coded
   - `createSmartAI(true)` over and under estimates values using a normal distribution, this is an estimate of a beginner
   - `randomAI` makes decisions completely at random
2. Choose how many games you want to play
3. Run `npx ts-node src/simulateGames.ts`
   - 10,000 games takes about 4 minutes to run
