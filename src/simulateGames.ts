import { play } from './cribbage';
import { createSmartAI } from './smartAI';

const simulateGames = () => {
  const numGames = 10000;
  let player1Wins = 0;
  let player2Wins = 0;
  let player1Points = 0;
  let player2Points = 0;
  const start = Date.now();
  for (let i = 0; i < numGames; i++) {
    const results = play(createSmartAI(false), createSmartAI(true), i % 2 === 0);
    if (results.player1Points > results.player2Points) {
      player1Wins++;
    } else {
      player2Wins++;
    }
    player1Points += results.player1Points;
    player2Points += results.player2Points;
  }
  console.log(JSON.stringify({
    player1Wins,
    player1Points: player1Points / numGames,
    player2Wins,
    player2Points: player2Points / numGames,
  }));
  console.log(Date.now() - start);
};
simulateGames();
