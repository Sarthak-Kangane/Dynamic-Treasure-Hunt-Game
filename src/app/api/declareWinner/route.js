import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import { Team } from "../../../models/Team";
import Question from "../../../models/Question";
import Game from "../../../models/Game";

export async function POST() {
  try {
    await connectDb(); // Connect to the database

    // Fetch the game state
    const game = await Game.findOne();
    if (!game) {
      return NextResponse.json({ message: 'Game not found' }, { status: 404 });
    }

    // Check if the game is already over
    if (game.isGameOver) {
      return NextResponse.json({ message: 'Game is already over', winner: game.winner }, { status: 400 });
    }

    // Start the timer based on the game duration
    const timerDuration = game.duration * 1000; // Convert to milliseconds

    // Fetch all teams and their progress
    const teams = await Team.find();

    let winner = null;

    // Check if any team has answered all questions
    const allQuestions = await Question.countDocuments();
    for (const team of teams) {
      if (team.answeredQuestions.size === allQuestions) {
        winner = team;
        break;
      }
    }

    // Set a timeout that will end the game after the duration is up
    setTimeout(async () => {
      if (!winner) {
        // Game duration is over, find the team with the most answered questions
        winner = teams.reduce((leadingTeam, currentTeam) => {
          if (
            !leadingTeam ||
            currentTeam.answeredQuestions.size > leadingTeam.answeredQuestions.size
          ) {
            return currentTeam;
          }
          return leadingTeam;
        }, null);
      }

      if (winner) {
        // Declare the winner and end the game
        game.isGameOver = true;
        game.winner = winner._id;
        await game.save();
        
        // Here you could broadcast the winner to connected clients or notify them via a different mechanism.
        console.log(`Game over. Winner is ${winner.teamName}`);
      } else {
        // No winner because no one has answered any questions
        console.log('No winner, no progress made by any team.');
      }      
    }, timerDuration);

    return NextResponse.json({ message: 'Game started, timer is running.' });
  } catch (error) {
    console.error('Error declaring winner:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
